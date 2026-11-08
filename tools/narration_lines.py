"""Shared reader for the post-render narration gates (tone_gate.py, flow_gate.py, pron_check.py). Read only: it never renders,
never calls Gemini and never writes audio. It reads what the renderer already left on disk:
  <audio>/pages/<key>/timings.json   source words of every segment, in order, with CTC times (render_pages_gemini.py ctc_words)
  <audio>/pages/<key>/<pid>.mp3      the page audio
  node tools/pages.mjs               the page spec (speakers, text, data-tone), the same one the renderer was handed
and cuts each page back into its lines with pace_gate.load_chapter (word counts line up by construction; a page whose text was
edited since the render is skipped and listed).

Per line it measures, on the line's own stretch of the page mp3 (16 kHz mono):
  f0_med       median pitch of the voiced 10 ms frames, Hz (FFT autocorrelation, 70 to 400 Hz)
  st_range     pitch range in semitones, 90th minus 10th percentile of the voiced frames
  st_sd        pitch standard deviation in semitones
  rms_db       voiced loudness, dBFS of the frames above the line's own speech threshold
  lufs         K-weighted, gated loudness of the line (BS.1770 style, 400 ms blocks; short lines fall back to one block)
  tilt_db      vocal effort: energy 1 to 4 kHz minus energy 80 Hz to 1 kHz, dB, over the speech frames. A raised or shouted voice
               pushes energy up the spectrum; a soft or whispered one pulls it down
  voiced_frac  share of the speech frames that are periodic. Whisper is aperiodic, so a real whisper reads low here
  wps          spoken words per second over the spoken part (pace_gate)
Features are cached per page in ~/.cache/halcyon-gemini-tts/narration/<course>-<key>.json, keyed by the mp3's size and mtime,
so a second run over a book costs seconds."""
import hashlib, json, os, re, subprocess, sys
import numpy as np

sys.dont_write_bytecode = True
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import pace_gate as PG

ROOT = PG.ROOT
CACHE = os.path.expanduser(os.environ.get("GEMINI_TTS_CACHE", "~/.cache/halcyon-gemini-tts"))
REPORTS = os.path.join(CACHE, "reports")
FEAT_DIR = os.path.join(CACHE, "narration")
SR = 16000
FEAT_VERSION = 3

def decode16(path):
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", path, "-f", "s16le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, "<i2").astype(np.float32) / 32768

# ---- features
FR, HOP = 640, 160          # 40 ms window, 10 ms hop
LAG_LO, LAG_HI = SR // 400, SR // 70
AC_MIN = 0.45               # the same voicing bar as voice_gate.f0

def frames(a):
    if len(a) < FR: a = np.pad(a, (0, FR - len(a)))
    n = 1 + (len(a) - FR) // HOP
    idx = np.arange(FR)[None, :] + HOP * np.arange(n)[:, None]
    return a[idx]

def pitch_track(F):
    """frames -> (f0 per frame or 0, periodicity per frame)"""
    x = F - F.mean(1, keepdims=True)
    X = np.fft.rfft(x, 2 * FR); ac = np.fft.irfft(np.abs(X) ** 2)[:, :FR]
    ac = ac / (ac[:, :1] + 1e-9)
    seg = ac[:, LAG_LO:LAG_HI]; l = np.argmax(seg, 1); pk = seg[np.arange(len(seg)), l]
    f0 = np.where(pk > AC_MIN, SR / (l + LAG_LO), 0.0)
    return f0, pk

_KW = {}
def k_weight(n):
    """BS.1770 K-weighting magnitude (high pass near 38 Hz, +4 dB shelf above ~1.5 kHz) on an rfft grid of n samples"""
    if n not in _KW:
        f = np.fft.rfftfreq(n, 1 / SR)
        hp = (f / 38.0) ** 2 / np.sqrt(1 + (f / 38.0) ** 4)
        shelf = 10 ** (4.0 / 20 * (1 / (1 + (1500.0 / np.maximum(f, 1)) ** 2)))
        _KW[n] = hp * shelf
    return _KW[n]

def lufs(a):
    if len(a) < SR // 10: return None
    n = len(a); y = np.fft.irfft(np.fft.rfft(a) * k_weight(n), n)
    B, H = int(0.4 * SR), int(0.1 * SR)
    if n < B: blocks = np.array([np.mean(y ** 2)])
    else: blocks = np.array([np.mean(y[i:i + B] ** 2) for i in range(0, n - B + 1, H)])
    L = -0.691 + 10 * np.log10(blocks + 1e-12)
    keep = blocks[L > -70]
    if not len(keep): return None
    rel = -0.691 + 10 * np.log10(keep.mean()) - 10
    keep2 = keep[(-0.691 + 10 * np.log10(keep + 1e-12)) > rel]
    return float(-0.691 + 10 * np.log10((keep2 if len(keep2) else keep).mean()))

def features(a):
    """one line's audio (16 kHz) -> feature dict (None values when the line is too short or unvoiced)"""
    out = {"f0_med": None, "st_range": None, "st_sd": None, "rms_db": None, "lufs": None, "tilt_db": None, "voiced_frac": None, "n_voiced": 0}
    if len(a) < FR * 2: return out
    F = frames(a); e = np.sqrt((F ** 2).mean(1) + 1e-12)
    thr = max(0.006, float(np.percentile(e, 90)) * 0.2)
    sp = e >= thr
    if sp.sum() < 5: return out
    f0, pk = pitch_track(F)
    v = sp & (f0 > 0)
    out["voiced_frac"] = round(float(v.sum() / sp.sum()), 3); out["n_voiced"] = int(v.sum())
    out["rms_db"] = round(float(20 * np.log10(np.sqrt(np.mean(e[sp] ** 2)))), 2)
    L = lufs(a); out["lufs"] = round(L, 2) if L is not None else None
    S = np.abs(np.fft.rfft(F[sp] * np.hanning(FR), axis=1)) ** 2; fq = np.fft.rfftfreq(FR, 1 / SR)
    lo = S[:, (fq >= 80) & (fq < 1000)].sum(1); hi = S[:, (fq >= 1000) & (fq < 4000)].sum(1)
    out["tilt_db"] = round(float(10 * np.log10(hi.sum() / (lo.sum() + 1e-12) + 1e-12)), 2)
    if v.sum() >= 8:
        fv = f0[v]
        med = np.median(fv)
        fv = fv[(fv > med / 1.7) & (fv < med * 1.7)]  # drop octave jumps of the tracker
        st = 12 * np.log2(fv / 100.0)
        out["f0_med"] = round(float(np.median(fv)), 1)
        out["st_range"] = round(float(np.percentile(st, 90) - np.percentile(st, 10)), 2)
        out["st_sd"] = round(float(np.std(st)), 2)
    return out

# ---- chapters -> lines with features
_SPEC = {}
_spec_for = PG.spec_for
def _spec_memo(course, ch, story):
    k = (course, ch, story)
    if k not in _SPEC: _SPEC[k] = _spec_for(course, ch, story)
    return _SPEC[k]
PG.spec_for = _spec_memo  # load_chapter's spec is kept, so the pauses between lines can be read without a second pages.mjs run

_VOICES = {}
def voice_of(course, who):
    """the Gemini voice a speaker is cast in (render_pages_gemini.cast): two speakers on one voice get no turn silence"""
    if "v" not in _VOICES: _VOICES["v"] = json.load(open(os.path.join(HERE, "gemini_voices.json")))
    V = _VOICES["v"]; cid = "pmp" if course in ("pmp", "pmp-v2", "v2") else course
    c = V["courses"].get(cid, {}).get(who) or V["default"].get(who) or V["default"]["woman"]
    return c["voice"]

MENTORS = ("narrator", "ruth")
def planned_gaps(course, segs, lines):
    """the silence render_pages_gemini.assemble() puts between each line and the one before it: the page's pause segments, 0.18 s
    on a change of voice (not after a pause), 0.04 s before and 0.08 s after a line of two words or fewer. Sets L["planned_gap"],
    L["turn"] (voice changed) and L["after_pause"]."""
    by_i = {L["i"]: L for L in lines}; prev_v, sil, prev_short = None, 0.0, False
    for i, seg in enumerate(segs):
        if "pause" in seg: sil += seg["pause"]; prev_v = None; continue
        if "t" not in seg: continue
        v = voice_of(course, seg["v"]); g = sil + (0.08 if prev_short else 0.0); turn = prev_v is not None and prev_v != v
        if turn: g += 0.18
        short = seg["v"] not in MENTORS and len(seg["t"].split()) <= 2
        if short: g += 0.04
        L = by_i.get(i)
        if L is not None: L["planned_gap"] = round(g, 3); L["after_pause"] = sil > 0; L["turn"] = turn
        sil, prev_v, prev_short = 0.0, v, short

def chapter_keys(course):
    return [(ch, False) for ch in PG.chapters_with_timings(course)]

def _page_cache(course, key):
    p = os.path.join(FEAT_DIR, f"{course}-{key}.json")
    try: d = json.load(open(p))
    except Exception: d = {}
    return p, (d if d.get("_v") == FEAT_VERSION else {"_v": FEAT_VERSION})

def load(course, ch, story=False, want_audio=False):
    """-> {"key", "pages": {pid: [line]}, "skipped": [...], "audio": {pid: array} (want_audio)} or None. Every line carries the
    pace_gate fields (who, text, tone, start, end, dur, wps, gap_before, dup) plus the features above (None on headings, codes)."""
    c = PG.load_chapter(course, ch, story, use_audio=False)
    if c is None: return None
    key = f"f{ch}{'s' if story else ''}"
    cpath, cache = _page_cache(course, key); dirty = False
    audio = {}
    for pid, lines in c["pages"].items():
        mp3 = os.path.join(PG.audio_dir(course), "pages", key, pid + ".mp3")
        if not os.path.exists(mp3): continue
        st = os.stat(mp3); stamp = f"{st.st_size}-{int(st.st_mtime)}"
        ent = cache.get(pid)
        a = None
        need = not ent or ent.get("stamp") != stamp or len(ent.get("f", [])) != len(lines)
        if want_audio or need:
            a = decode16(mp3); PG.refine_with_array(lines, a, SR)
            if want_audio: audio[pid] = a
        else:
            for L, (s, e) in zip(lines, ent["se"]): L["start"], L["end"] = s, e
            PG.finish(lines)
        if need:
            fs = [features(a[int(L["start"] * SR):int(L["end"] * SR)]) for L in lines]
            cache[pid] = {"stamp": stamp, "se": [(L["start"], L["end"]) for L in lines], "f": fs}; dirty = True
        for L, f in zip(lines, cache[pid]["f"]): L.update(f)
        for n, L in enumerate(lines): L["n"] = n
        spec = _SPEC.get((course, ch, story))
        if spec and pid in spec["pages"]: planned_gaps(course, spec["pages"][pid], lines)
    if dirty:
        os.makedirs(FEAT_DIR, exist_ok=True); tmp = cpath + f".{os.getpid()}.tmp"; json.dump(cache, open(tmp, "w")); os.replace(tmp, cpath)
    return {"key": key, "ch": ch, "story": story, "pages": c["pages"], "skipped": c["skipped"], "audio": audio, "offset": c["offset"]}

def parse_chapters(arg, course): return PG.parse_chapters(arg, course)

def clip_md5(a): return hashlib.md5(np.ascontiguousarray(a).tobytes()).hexdigest()

# ---- small stats helpers
def robust(vals):
    """median and a robust spread (1.4826 * MAD, floored) of a list of numbers"""
    v = np.array([x for x in vals if x is not None], float)
    if len(v) == 0: return None, None
    med = float(np.median(v)); mad = float(np.median(np.abs(v - med))) * 1.4826
    return med, mad

def z(x, base, floor):
    med, sd = base
    if x is None or med is None: return None
    return (x - med) / max(sd or 0, floor)

def mmss(t): return f"{int(t // 60)}:{t % 60:04.1f}"
