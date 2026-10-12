"""Render per-page narration clips + word timings + the whole-chapter episode with Google Gemini TTS.
Drop-in replacement for render_pages.py (Kokoro): same CLI, same outputs, same "done" line.
usage: render_pages_gemini.py pages.json [episode.mp3]      (pages.json from tools/pages.mjs)
  writes <spec.audio or audio>/pages/<key>/<pid>.mp3 and timings.json {pid: {d, w: [[word, start, end], ...]}}
  MERGE=1 keeps the other pages' timings. Casting: tools/gemini_voices.json, course from GEMINI_COURSE or the cwd (courses/<id>, else pmp).
Word timings: Gemini returns none. Default (ALIGN=ctc): each segment's known text is force-aligned onto its own audio with a wav2vec2
CTC model (tools/align_ctc.py), so every source word gets a time within about 0.1 s and nothing drifts. ALIGN=whisper is the older
path: whisper.cpp word times aligned onto the source words (drifted up to ~1.5 s around cards and short lines). Either way the
timings keep the SOURCE words (the engine aligns them to the page's words). whisper.cpp still checks every segment (below).
RETIME=1: rebuild timings.json for pages already rendered, with no Gemini calls and no audio written: the segment layout comes
from the cache (it must reproduce the page mp3's length exactly) and the words are aligned on the page mp3 itself.
Every segment is checked against the transcript: a segment whose words don't come back (a skip, a garble, or spoken stage direction)
is re-rolled once (GEMINI_REROLL=0 to turn off; GEMINI_REROLL_SKIP=narrator,... spares some speakers).
Same-speaker runs: a character cast with "run": true has all of their lines on a page synthesized as ONE request and cut apart
by forced alignment, so a prebuilt voice cannot drift from line to line (details at RUN_OF below).
Gates (details at "checks, up to ROUNDS rounds"): a coverage gate fails a page that is missing more than 3% of its words or any
sentence, and a voice gate (tools/voice_gate.py) flags a line far from its character's book voice or pitched as the other gender;
both re-roll, up to two times, keep the best take, and list what is left in the report under "gate" and per page. Report per run: ~/.cache/halcyon-gemini-tts/reports/<course>-<key>.json"""
import difflib, json, os, re, subprocess, sys, tempfile, wave
import numpy as np
sys.dont_write_bytecode = True; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import gemini_tts as G

HERE = os.path.dirname(os.path.abspath(__file__))
SR = G.SR
WHISPER_MODEL = os.path.expanduser(os.environ.get("WHISPER_MODEL", "~/.cache/whisper/ggml-small.en.bin"))
# Respellings sent to Gemini in place of the Kokoro IPA (render_pages.py PRON); timings keep the original words.
# Checked with whisper 2026-10-11: plain "Okafor" came back "Okaphor", plain "Ares Station" came back "Air Station", "En-KAY-chee" came
# back "and Keiichi" / "Nketchy" while "In-KAY-chee" came back "Nkechi", "Tomasz" came back "Tomas". "Sol 3518" came back "Seoul 3518"
# twice in the v2 pilot; "Soll" came back "Sol". "AIR-eez" comes back "Aries" (right) and now and then "Airy" (caught by HEARD_WRONG).
SAY = {"Okafor": "Oh-kuh-for", "Okafors": "Oh-kuh-fors", "Okafor's": "Oh-kuh-for's", "Halcyon": "HAL-see-un", "Halcyon's": "HAL-see-un's",
       "Nkechi": "In-KAY-chee", "Nkechi's": "In-KAY-chee's", "Lutine": "LOO-teen", "Ares": "AIR-eez", "Sol": "Soll",
       "LoDo": "LOH-doh", "Lindqvist": "LIND-kvist", "Ochoa": "oh-CHO-uh", "Ochoa's": "oh-CHO-uh's", "Tomasz": "TOH-mahsh",
       "Kraków": "KRAH-koof", "Krakow": "KRAH-koof", "Nowak": "NOH-vahk", "Adeyemi": "ah-day-YEH-mee", "ADKAR": "ADD-kar",
       "PESTLE": "PESS-ul", "Kessler": "KESS-ler", "Kessler's": "KESS-ler's",
       "OKAFOR": "Oh-kuh-for", "ARES": "AIR-eez",
       "Bea": "Bee", "Bea's": "Bee's", "BEA": "Bee",  # 2026-10-11: plain "Bea" (Bea Kowal) was heard as "Bia"
       "Hana": "Hannah", "Hana's": "Hannah's", "HANA": "Hannah"}  # 2026-10-11: plain "Hana" came out "Hahna"; Anthony wants "Hannah"  # all caps forms in PMP v2 rosters and signs ("OKAFOR, ADA N." came back "Okaphor")
SAY_RE = re.compile(r"(?<![\w-])(" + "|".join(map(re.escape, sorted(SAY, key=len, reverse=True))) + r")(?![\w-])")
def say(t): return SAY_RE.sub(lambda m: SAY[m.group(1)], t)
# a source word heard as one of these in its segment means a mispronunciation: the segment is re-rolled
HEARD_WRONG = {"bea": {"bia"}, "sol": {"seoul", "soul"}, "ares": {"airy", "air", "area", "areas"}, "okafor": {"okaphor", "okafo", "okufo"}, "halcyon": {"halcion"}}

spec = json.load(open(sys.argv[1]))
course = os.environ.get("GEMINI_COURSE")
if not course:
    cwd = os.getcwd().split(os.sep)
    course = cwd[-1] if len(cwd) > 1 and cwd[-2] == "courses" else "pmp"
VOICES = json.load(open(os.path.join(HERE, "gemini_voices.json")))
CMAP, DMAP = VOICES["courses"].get(course, {}), VOICES["default"]
def cast(who):
    c = CMAP.get(who) or DMAP.get(who) or DMAP["woman"]
    return c["voice"], c.get("style", "")
def runs_on(who):  # casting "run": true -> this character's lines on a page go to Gemini as one request (see RUNS below)
    c = CMAP.get(who) or DMAP.get(who) or DMAP["woman"]
    return bool(c.get("run")) and os.environ.get("GEMINI_RUNS") != "0"

key = spec.get("outkey") or (("r" if spec["track"] == "ref" else "f") + str(spec["num"]))
outdir = f"{spec.get('audio', 'audio')}/pages/{key}"; os.makedirs(outdir, exist_ok=True)
MENTORS = ("narrator", "ruth")  # same exemptions as render_pages.py: these read long prose, no sentence-ending fixups

def gem_text(seg):
    text = seg["t"].strip()
    if seg["v"] not in MENTORS:
        text = re.sub(r"[,;:]+$", ".", text)
        if not re.search(r"[.!?]$", text): text += "."
    return text

def enc(audio, path, title=None):
    pcm = (np.clip(audio, -1, 1) * 32767).astype("<i2").tobytes()
    cmd = ["ffmpeg", "-loglevel", "error", "-y", "-f", "s16le", "-ar", str(SR), "-ac", "1", "-i", "-", "-c:a", "libmp3lame", "-b:a", "80k"]
    if title: cmd += ["-metadata", "title=" + title]
    subprocess.run(cmd + [path], input=pcm, check=True)

# ---- same-speaker runs. One request per line lets a prebuilt voice drift between lines: on 2026-10-11 Imogen Hale's
# lines in PMP ch1 scored a mean pairwise speaker-embedding similarity (WavLM-SV) of 0.76 to 0.85 synthesized one line per
# call, against 0.94 (three takes, every take 0.94) with all of her lines on the page sent as ONE request and cut apart
# again by forced alignment. A character cast with "run": true gets that: every line of theirs on a page, in page order,
# joined with spaces into one request of at most GEMINI_RUN_MAX_CHARS (a longer page starts a new run). A character with
# one line on the page sends exactly the request it always did, so its cache entry is unchanged. GEMINI_RUNS=0 turns runs off.
# A flagged line re-rolls its whole run. Cuts: midway between the last word of a line and the first word of the next.
RUN_MAX = int(os.environ.get("GEMINI_RUN_MAX_CHARS", "1500"))
RUN_OF = {}  # (pid, seg index) -> (run request text, piece index, [piece texts])
for pid, segs in spec["pages"].items():
    by_who = {}
    for i, seg in enumerate(segs):
        if "t" in seg and runs_on(seg["v"]): by_who.setdefault(seg["v"], []).append(i)
    for idx in by_who.values():
        chunks = [[]]
        for i in idx:
            if chunks[-1] and len(" ".join(say(gem_text(segs[j])) for j in chunks[-1] + [i])) > RUN_MAX: chunks.append([])
            chunks[-1].append(i)
        for chunk in chunks:
            texts = [say(gem_text(segs[j])) for j in chunk]
            for n, j in enumerate(chunk): RUN_OF[(pid, j)] = (" ".join(texts), n, texts)
def request_text(pid, i, seg):
    """what is sent to Gemini for this segment: its own text, or its whole run"""
    r = RUN_OF.get((pid, i)); return r[0] if r else say(gem_text(seg))

# ---- synthesis: every distinct (voice, style, request text) once, in parallel; cached on disk
jobs = {}
for pid, segs in spec["pages"].items():
    for i, seg in enumerate(segs):
        if "t" in seg:
            v, st = cast(seg["v"]); jobs[(v, st, request_text(pid, i, seg))] = None
def run_jobs(keys):
    got = G.synth_many([(t, v, st) for (v, st, t) in keys], workers=int(os.environ.get("GEMINI_WORKERS", "4")), log=lambda m: print(m, file=sys.stderr, flush=True))
    for (t, v, st), a in got.items(): jobs[(v, st, t)] = G.clean(a)
RETIME = bool(os.environ.get("RETIME"))
ALIGN = os.environ.get("ALIGN", "ctc")
if RETIME:  # cache only, never a Gemini call
    for (v, st, t) in list(jobs):
        p = G._cache_path(t, v, st, G.current_take(t, v, st))
        jobs[(v, st, t)] = G.clean(G._wav_to_float(open(p + ".wav", "rb").read())) if os.path.exists(p + ".wav") else None
else:
    run_jobs(list(jobs))
if os.environ.get("GEMINI_PREFETCH"):  # only fill the cache (e.g. submit several chapters' batches at once), write nothing
    print(G.log_usage(f"{course} {key} prefetch"), file=sys.stderr); print("prefetched", key, len(jobs), "segments"); sys.exit(0)

# ---- assembly: same silence structure as render_pages.py
def take_like(text, v, st, page, at):
    """RETIME: the cached take of this segment that is what the page mp3 has at `at` seconds (a segment re-rolled after
    this page was rendered has a newer take than the one in the mp3)"""
    best, bc = None, 0.6
    for k in range(G.current_take(text, v, st) + 1):
        p = G._cache_path(text, v, st, k)
        if not os.path.exists(p + ".wav"): continue
        a = G.clean(G._wav_to_float(open(p + ".wav", "rb").read())); i0 = int(at * SR); seg = page[i0:i0 + len(a)]
        if len(seg) < len(a) * 0.9: continue
        c = float(np.dot(seg, a[:len(seg)]) / (np.linalg.norm(seg) * np.linalg.norm(a[:len(seg)]) + 1e-9))
        if c > bc: best, bc = a, c
    return best

_SPLITS = {}
def split_run(a, texts):
    """one run's audio (cleaned) -> one clip per line: the run's words are forced-aligned (align_ctc.py) and each cut falls
    midway between a line's last word and the next line's first; each clip is then trimmed and leveled like any segment"""
    words, owner = [], []
    for n, t in enumerate(texts):
        ws = [w for w in t.split() if re.search(r"\w", w)]; words += ws; owner += [n] * len(ws)
    r = None
    if len(set(owner)) == len(texts):
        import align_ctc
        r = align_ctc.align_words(a, SR, words, words)
    if r is None:  # a line with no words, or more letters than audio frames: cut by character share
        L = np.cumsum([0] + [len(t) + 1 for t in texts]); cuts = [int(len(a) * x / L[-1]) for x in L]
    else:
        cuts = [0] + [int((r[owner.index(n) - 1][1] + r[owner.index(n)][0]) / 2 * SR) for n in range(1, len(texts))] + [len(a)]
    return [G.clean(a[cuts[n]:cuts[n + 1]]) for n in range(len(texts))]
def run_piece(run, v, st, page=None, at=0.0):
    """this line's clip out of its run; RETIME with a page: out of whichever cached take of the run the page mp3 has at `at`"""
    text, n, texts = run
    if page is None:
        a = jobs.get((v, st, text))
        if a is None: return None
        k = (text, v, st, id(a))
        if k not in _SPLITS: _SPLITS[k] = split_run(a, texts)
        return _SPLITS[k][n]
    best, bc = None, 0.6
    for tk in range(G.current_take(text, v, st) + 1):
        p = G._cache_path(text, v, st, tk)
        if not os.path.exists(p + ".wav"): continue
        a = split_run(G.clean(G._wav_to_float(open(p + ".wav", "rb").read())), texts)[n]; i0 = int(at * SR); seg = page[i0:i0 + len(a)]
        if len(seg) < len(a) * 0.9: continue
        c = float(np.dot(seg, a[:len(seg)]) / (np.linalg.norm(seg) * np.linalg.norm(a[:len(seg)]) + 1e-9))
        if c > bc: best, bc = a, c
    return best

PID_OF = {id(segs): pid for pid, segs in spec["pages"].items()}  # assemble() is handed a page's segment list; runs are keyed by page id
def assemble(segs, page=None):
    parts, spans, t0, prev = [], [], 0.0, None
    pid = PID_OF.get(id(segs))
    def sil(s):
        nonlocal t0; a = np.zeros(int(SR * s), np.float32); parts.append(a); t0 += len(a) / SR
    for i, seg in enumerate(segs):
        if "pause" in seg: sil(seg["pause"]); prev = None; continue
        v, st = cast(seg["v"])
        if prev is not None and prev != v: sil(0.18)
        text = gem_text(seg); short = seg["v"] not in MENTORS and len(text.split()) <= 2
        if short: sil(0.12)
        run = RUN_OF.get((pid, i))
        if run: a = run_piece(run, v, st, page, t0)
        else: a = jobs[(v, st, say(text))] if page is None else take_like(say(text), v, st, page, t0)
        if a is None: return None, None  # RETIME: this segment isn't in the cache (text changed since the render)
        spans.append({"i": i, "v": seg["v"], "voice": v, "style": st, "src": text, "sent": say(text), "req": run[0] if run else say(text), "s": t0, "e": t0 + len(a) / SR})
        parts.append(a); t0 += len(a) / SR
        if short: sil(0.2)
        prev = v
    audio = np.concatenate(parts) if parts else np.zeros(SR // 10, np.float32)
    return audio, spans

# ---- whisper + alignment
ONES = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split()
TENS = "_ _ twenty thirty forty fifty sixty seventy eighty ninety".split()
def n2w(n):
    if n < 20: return [ONES[n]]
    if n < 100: return [TENS[n // 10]] + ([ONES[n % 10]] if n % 10 else [])
    if n < 1000: return [ONES[n // 100], "hundred"] + (n2w(n % 100) if n % 100 else [])
    if 1100 <= n < 2100 and n % 100 and n // 100 != 20: return n2w(n // 100) + (n2w(n % 100) if n % 100 >= 10 else ["oh"] + n2w(n % 100))
    if n < 1000000: return n2w(n // 1000) + ["thousand"] + (n2w(n % 1000) if n % 1000 else [])
    return [str(n)]
def ntoks(w):
    """normalized tokens for matching: lowercase letters/digits, digits spelled out, hyphens split"""
    out = []
    m = re.fullmatch(r"\W*\$?(\d{1,3}(?:,\d{3})+|\d+)\W*", w)
    if m:  # 182,000,000 -> one hundred eighty two million (how it's read, and how whisper writes it: "$182 million")
        n = int(m.group(1).replace(",", ""))
        for unit, name in ((10**9, "billion"), (10**6, "million")):
            if n >= unit and n % unit == 0: return n2w(n // unit) + [name]
        if "," in m.group(1) and n < 10**6: return n2w(n)
    for p in re.split(r"[-‐-―/]+", w.lower()):
        p = re.sub(r"[^\w']", "", p).strip("'").replace("'s", "s").replace("'", "")
        if not p: continue
        if p.isdigit() and len(p) < 7: out += n2w(int(p))
        elif re.fullmatch(r"\d+(st|nd|rd|th)", p): out += n2w(int(re.match(r"\d+", p).group()))
        else: out.append(p)
    return out
SAYN = {}
for k, v in SAY.items(): SAYN[tuple(ntoks(v))] = ntoks(k)

def whisper(paths):
    """word-level transcripts: path -> [(word, start, end)]. Default uses whisper.cpp DTW token times (-dtw), where a token's t_dtw
    marks about where it ends: a word starts where the previous token ended, and align() then snaps the start forward to the voice onset.
    WHISPER_TS=offsets uses the plain segment offsets instead (looser)."""
    out = {}; dtw = os.environ.get("WHISPER_TS", "dtw") == "dtw"
    for i in range(0, len(paths), 24):
        chunk = paths[i:i + 24]; args = ["whisper-cli", "-m", WHISPER_MODEL, "-ml", "1", "-sow", "-np", "-t", "8"]
        args += ["-ojf", "-dtw", os.path.basename(WHISPER_MODEL)[5:-4], "-nfa"] if dtw else ["-oj"]
        for p in chunk: args += ["-f", p]
        subprocess.run(args, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        for p in chunk:
            d = json.load(open(p + ".json")); ws = []
            if dtw:
                prev_end = 0.0
                for s in d["transcription"]:
                    toks = [t for t in s.get("tokens", []) if not t["text"].startswith("[")]
                    t = "".join(x["text"] for x in toks).strip()
                    ends = [x["t_dtw"] / 100 for x in toks if x.get("t_dtw", -1) >= 0]
                    if not toks or not ends: continue
                    if t and not re.fullmatch(r"[\W_]+", t): ws.append((t, prev_end, max(ends)))
                    prev_end = max(prev_end, max(ends))
            else:
                for s in d["transcription"]:
                    t = s["text"].strip()
                    if t and not re.fullmatch(r"[\W_]+", t) and not t.startswith("["): ws.append((t, s["offsets"]["from"] / 1000, s["offsets"]["to"] / 1000))
            out[p] = ws
    return out

def envelope(audio):
    fr = 240; n = len(audio) // fr
    return np.sqrt((audio[:n * fr].reshape(n, fr) ** 2).mean(1) + 1e-12) if n else np.zeros(1), fr / SR

def align(audio, spans, heard):
    """-> (words [[word, start, end]], per-span check results)"""
    env, hop = envelope(audio); thr = max(0.006, float(np.percentile(env, 90)) * 0.06)
    voiced = lambda t: env[min(len(env) - 1, max(0, int(t / hop)))] > thr
    def onset(t, limit):  # first voiced frame at or after t (before limit)
        k = int(t / hop)
        while k < len(env) and k * hop < limit and env[k] <= thr: k += 1
        return k * hop if k * hop < limit else t
    groups, checks = [], []
    for sp in spans:
        words = []
        src = [w for w in sp["src"].split() if re.search(r"\w", w)]
        hw = [h for h in heard if sp["s"] - 0.25 <= (h[1] + h[2]) / 2 < sp["e"] + 0.25]
        S, sidx = [], []  # flattened normalized source tokens, with source word index
        for j, w in enumerate(src):
            for t in ntoks(w): S.append(t); sidx.append(j)
        H, hidx = [], []
        for j, (w, a, b) in enumerate(hw):
            ts = ntoks(w)
            for k, t in enumerate(ts): H.append(t); hidx.append((j, k, len(ts)))
        sm = difflib.SequenceMatcher(None, S, H, autojunk=False)
        start = [None] * len(src); matched_tok = 0
        for blk in sm.get_matching_blocks():
            for k in range(blk.size):
                si, hi = blk.a + k, blk.b + k; matched_tok += 1
                j = sidx[si]
                if start[j] is None and (si == 0 or sidx[si - 1] != j):
                    hj, kk, nk = hidx[hi]; w, a, b = hw[hj]; start[j] = a + (b - a) * kk / nk
        # fuzzy pass for unmatched names / respellings: same-length gap with similar spelling
        for tag, i1, i2, j1, j2 in sm.get_opcodes():
            if tag == "replace":
                for si, hi in zip(range(i1, i2), range(j1, j2)):
                    j = sidx[si]
                    if start[j] is None and difflib.SequenceMatcher(None, S[si], H[hi]).ratio() >= 0.5:
                        hj, kk, nk = hidx[hi]; w, a, b = hw[hj]; start[j] = a + (b - a) * kk / nk
        # interpolate the rest by character length between anchors; the span's own start/end are hard anchors
        first_voiced = onset(sp["s"], sp["e"])
        if start and (start[0] is None or abs(start[0] - first_voiced) > 0.6): start[0] = first_voiced
        known = [j for j, t in enumerate(start) if t is not None]
        for j in range(len(src)):
            if start[j] is not None: continue
            a = max([k for k in known if k < j], default=None); b = min([k for k in known if k > j], default=None)
            ta = start[a] if a is not None else first_voiced; tb = start[b] if b is not None else sp["e"]
            ia = a if a is not None else 0; ib = b if b is not None else len(src)
            L = [len(src[k]) + 1 for k in range(ia, ib)]; tot = sum(L) or 1
            start[j] = ta + (tb - ta) * sum(L[:j - ia]) / tot
        # clamp into the span, monotonic, then snap each start to the voice onset
        out = []
        for j, w in enumerate(src):
            t = min(max(start[j], sp["s"]), sp["e"] - 0.05)
            if out and t < out[-1][1] + 0.04: t = out[-1][1] + 0.04
            out.append([w, t])
        for j in range(len(out)):
            nxt = out[j + 1][1] if j + 1 < len(out) else sp["e"]
            if not voiced(out[j][1]): out[j][1] = onset(out[j][1], nxt - 0.03)
        for j, (w, t) in enumerate(out):
            end = out[j + 1][1] if j + 1 < len(out) else sp["e"]
            word = re.sub(r"^[^\w$]+|[^\w%]+$", "", w) or w
            words.append([word, round(t, 2), round(max(t, end - 0.02), 2)])
        groups.append(words)
        # check: share of source tokens heard, and heard tokens that match nothing (spoken direction, ad-lib)
        ins = len(H) - matched_tok; cov = matched_tok / max(1, len(S))
        wrong = sorted({h for w in src for t in ntoks(w) for h in HEARD_WRONG.get(t, ()) if h in H and h not in S})
        checks.append({"i": sp["i"], "v": sp["v"], "voice": sp["voice"], "cov": round(cov, 2), "extra": ins, "src": sp["src"],
                       "heard": " ".join(h[0] for h in hw), "wrong": wrong, "bad": bool(wrong) or (len(S) >= 3 and cov < 0.6) or (len(S) >= 2 and ins >= max(4, 0.35 * len(S))) or (len(S) <= 2 and len(S) > 0 and cov == 0 and len(H) > 3)})
    return groups, checks

def to16(audio, path):
    a16 = np.interp(np.arange(0, len(audio), SR / 16000), np.arange(len(audio)), audio)
    w = wave.open(path, "wb"); w.setnchannels(1); w.setsampwidth(2); w.setframerate(16000)
    w.writeframes((np.clip(a16, -1, 1) * 32767).astype("<i2").tobytes()); w.close()

def ctc_words(audio, spans):
    """forced-align each segment's source words on its own audio (align_ctc.py) -> [[word, start, end]] for the page"""
    import align_ctc
    words = []
    for sp in spans:
        src = [w for w in sp["src"].split() if re.search(r"\w", w)]
        said = [w for w in sp["sent"].split() if re.search(r"\w", w)]
        if len(said) != len(src): said = src
        a0 = max(0, int((sp["s"] - 0.05) * SR)); a1 = min(len(audio), int((sp["e"] + 0.05) * SR)); off = a0 / SR
        r = align_ctc.align_words(audio[a0:a1], SR, src, said) if src else []
        if r is None:  # more letters than audio frames: spread the words over the segment
            L = [len(w) + 1 for w in src]; tot = sum(L); acc = 0; r = []
            for x in L: r.append(((sp["s"] - off) + (sp["e"] - sp["s"]) * acc / tot, 0)); acc += x
            r = [(a, (r[k + 1][0] if k + 1 < len(r) else sp["e"] - off)) for k, (a, _) in enumerate(r)]
        for w, (a, b) in zip(src, r):
            word = re.sub(r"^[^\w$]+|[^\w%]+$", "", w) or w
            words.append([word, round(off + a, 2), round(off + max(b, a + 0.02), 2)])
    return words

def decode(path):
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", path, "-f", "s16le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, "<i2").astype(np.float32) / 32768

if RETIME:  # timings only, from the rendered page mp3s; nothing else is written
    timings, miss = {}, []
    for pid in spec["pages"]:
        mp3 = f"{outdir}/{pid}.mp3"
        if not os.path.exists(mp3): miss.append(pid + " (no mp3)"); continue
        page = decode(mp3)
        audio, spans = assemble(spec["pages"][pid])
        if spans is None or abs(len(page) - len(audio)) > SR * 0.05: audio, spans = assemble(spec["pages"][pid], page)  # match takes to the mp3
        if spans is None: miss.append(pid + " (segment not in cache: text changed since the render?)"); continue
        if abs(len(page) - len(audio)) > SR * 0.05: miss.append(f"{pid} (cache {len(audio) / SR:.2f}s vs mp3 {len(page) / SR:.2f}s)"); continue
        timings[pid] = {"d": round(len(audio) / SR, 2), "w": ctc_words(page, spans)}
        print("retimed", pid, len(timings[pid]["w"]), "words", file=sys.stderr, flush=True)
    if os.path.exists(f"{outdir}/timings.json"):
        old = json.load(open(f"{outdir}/timings.json")); old.update(timings); timings = old
    json.dump(timings, open(f"{outdir}/timings.json", "w"), separators=(",", ":"))
    if miss: print("skipped (kept old timings):", "; ".join(miss), file=sys.stderr)
    print("done", key, "retimed", len(spec["pages"]) - len(miss), "of", len(spec["pages"]), "pages")
    sys.exit(0)

# GEMINI_REROLL_SKIP=narrator,ruth: never re-roll these speakers (a targeted re-voice leaves their audio exactly as it was)
REROLL_SKIP = {x for x in os.environ.get("GEMINI_REROLL_SKIP", "").split(",") if x}
tmp = tempfile.mkdtemp(prefix="gemtts-")
pids = list(spec["pages"])
clips, timings, report = {}, {}, {}
todo = pids
# ---- checks, up to ROUNDS rounds (the first take plus two re-rolls). Each round, every page still in play is checked three ways:
# 1. whisper: a segment whose words don't come back is re-heard alone, then re-rolled if it still fails (as before)
# 2. coverage gate: the page fails when more than COV_MAX_MISS of its text, or any sentence, is missing from what
#    whisper hears (suspect segments are always re-heard alone first: whisper on a long page skips stretches that are there).
#    Missing text is re-rolled for every speaker, the narrator included; GEMINI_REROLL_SKIP does not spare it.
# 3. voice gate (tools/voice_gate.py, VOICE_GATE=0 to turn off): a line whose voice is far from its character's book centroid, or
#    whose pitch reads opposite to the cast "gender", has its run re-rolled (not for GEMINI_REROLL_SKIP speakers: those are
#    reported only).
# Every request that was re-rolled keeps its best take (passes whisper, then coverage, then voice similarity), not just its last.
# Whatever still fails after the last round is listed in the report: pages[pid]["coverage_fail"], ["voice_flags"], and "gate".
import voice_gate as VG
ROUNDS = 1 if os.environ.get("GEMINI_REROLL") == "0" else int(os.environ.get("GEMINI_ROUNDS", "3"))
GATE = os.environ.get("VOICE_GATE", "1") != "0"
COV_MAX_MISS = float(os.environ.get("COVERAGE_MAX_MISS", "0.03"))
BOOK = VG.Book(G.CACHE, course, spec.get("audio", "audio")) if GATE else None
def gender_of(who): return (CMAP.get(who) or DMAP.get(who) or DMAP["woman"]).get("gender")
def cnorm(t):
    """text as a string of letters and spelled-out numbers, no spaces: coverage is compared on characters, so whisper's spelling
    ("AR2207" for "AR 2207", "hook for" for "Oh-kuh-for", "B's" for "Bee's") does not count as a missing word"""
    out = []
    for w in t.split():
        for x in ntoks(w):
            for run in re.findall(r"[a-z']+|\d+", x): out += n2w(int(run)) if run.isdigit() and len(run) < 7 else [run]
    return "".join(out).replace("'", "")
def char_cov(src, heard):
    # codes in the source that mix letters and digits (METAR/TAF groups, part numbers) are not required: whisper writes them back
    # another way ("33008KT" as "330 at 08") even when they were read right
    S = cnorm(" ".join(w for w in src.split() if not (re.search(r"\d", w) and re.search(r"[A-Za-z]", re.sub(r"'s$", "", w))))); H = cnorm(heard)
    if not S: return 1.0
    return sum(m.size for m in difflib.SequenceMatcher(None, S, H, autojunk=False).get_matching_blocks()) / len(S)
def sentences(t): return [x for x in re.split(r"(?<=[.!?])\s+", t) if len(cnorm(x)) >= 12]
def sentence_missing(src, heard):
    """sentences of src of which fewer than half the characters were heard"""
    return [x for x in sentences(src) if char_cov(x, heard) < 0.5]
EMB, HIST = {}, {}  # line key -> (embedding, f0); request key -> {take: score tuple}
def take_of(sp): return G.current_take(sp["req"], sp["voice"], sp["style"])
def check_page(pid, rnd, audio, spans, heard):
    groups, checks = align(audio, spans, heard)
    for k, c in enumerate(checks): c["miss"] = sentence_missing(c["src"], c["heard"])
    sus = [k for k, c in enumerate(checks) if c["bad"] or c["miss"] or (c["cov"] < 0.97 and len(c["src"].split()) >= 4)]
    if sus:
        iso = {}
        for k in sus:
            sp = spans[k]; f = f"{tmp}/{pid}.r{rnd}.seg{k}.wav"; to16(audio[int(sp["s"] * SR):int(sp["e"] * SR)], f); iso[k] = f
        hi = whisper(list(iso.values()))
        for k, f in iso.items():
            sp = spans[k]; sh = [(w, a + sp["s"], b + sp["s"]) for (w, a, b) in hi[f]]
            g2, c2 = align(audio, [sp], sh); c2[0]["alone"] = True; c2[0]["miss"] = sentence_missing(c2[0]["src"], c2[0]["heard"])
            if not c2[0]["bad"] or c2[0]["cov"] > checks[k]["cov"]: groups[k], checks[k] = g2[0], c2[0]
    L = [len(cnorm(c["src"])) for c in checks]; tot = sum(L) or 1
    heard_tok = sum(char_cov(c["src"], c["heard"]) * n for c, n in zip(checks, L))
    for c in checks: c["ccov"] = round(char_cov(c["src"], c["heard"]), 2)
    miss = round(1 - heard_tok / tot, 3)
    cov_fail = [c for c in checks if c["miss"] or (c["ccov"] < 0.85 and len(c["src"].split()) >= 4)] if (miss > COV_MAX_MISS or any(c["miss"] for c in checks)) else []
    return groups, checks, miss, cov_fail
def voice_lines(built_pages):
    """every judged line of the chapter (>= VG.MIN_S long), embedded once per take"""
    lines = []
    for pid, (audio, spans) in built_pages.items():
        for sp in spans:
            if sp["e"] - sp["s"] < VG.MIN_S: continue
            k = (sp["voice"], sp["style"], sp["req"], take_of(sp), sp["src"], round(sp["e"] - sp["s"], 2))
            if k not in EMB:
                a = audio[int(sp["s"] * SR):int(sp["e"] * SR)]; EMB[k] = (VG.embed(a, SR), VG.f0(a, SR))
            lines.append({"who": sp["v"], "gender": gender_of(sp["v"]), "emb": EMB[k][0], "f0": EMB[k][1], "pid": pid, "i": sp["i"], "src": sp["src"],
                          "req": (sp["voice"], sp["style"], sp["req"]), "take": take_of(sp)})
    return lines
built_all = {}; gate_first = None; gate_summary = {}
todo = pids
for rnd in range(ROUNDS):
    built = {pid: assemble(spec["pages"][pid]) for pid in todo}; built_all.update(built)
    paths = {}
    for pid in todo: paths[pid] = f"{tmp}/{pid}.r{rnd}.wav"; to16(built[pid][0], paths[pid])
    heard = whisper(list(paths.values()))
    bump, why = set(), {}
    for pid in todo:
        audio, spans = built[pid]; groups, checks, miss, cov_fail = check_page(pid, rnd, audio, spans, heard[paths[pid]])
        words = ctc_words(audio, spans) if ALIGN == "ctc" else sorted((w for g in groups for w in g), key=lambda x: x[1])
        clips[pid] = audio; timings[pid] = {"d": round(len(audio) / SR, 2), "w": words}
        report[pid] = {"round": rnd, "bad": [c for c in checks if c["bad"]], "low": [c for c in checks if not c["bad"] and c["cov"] < 0.85 and len(c["src"].split()) >= 4],
                       "missing_words": miss, "coverage_fail": [{"i": c["i"], "v": c["v"], "cov": c["ccov"], "missing": c["miss"], "src": c["src"], "heard": c["heard"]} for c in cov_fail]}
        for c in checks:
            sp = next(s for s in spans if s["i"] == c["i"]); rk = (sp["voice"], sp["style"], sp["req"])
            h = HIST.setdefault(rk, {}).setdefault(take_of(sp), [True, True, 1.0, 1.0])
            h[0] &= not c["bad"]; h[1] &= c not in cov_fail; h[3] = min(h[3], c["cov"])
            if c in cov_fail or (c["bad"] and c["v"] not in REROLL_SKIP): bump.add(rk); why.setdefault(rk, set()).add("coverage" if c in cov_fail else "whisper")
    if GATE:
        VL = voice_lines(built_all); flagged, gate_summary = VG.judge(VL, BOOK, key)
        for pid in report: report[pid]["voice_flags"] = []
        for L in flagged:
            report[L["pid"]]["voice_flags"].append({"i": L["i"], "v": L["who"], "why": L["why"], "sim": round(L["sim"], 3) if L["sim"] is not None else None,
                                                    "f0": round(L["f0"]) if L["f0"] else None, "src": L["src"][:80]})
            if L["who"] not in REROLL_SKIP: bump.add(L["req"]); why.setdefault(L["req"], set()).add("voice")
        for L in VL:
            h = HIST.setdefault(L["req"], {}).setdefault(L["take"], [True, True, 1.0, 1.0])
            if L.get("sim") is not None: h[2] = min(h[2], L["sim"])
        if gate_first is None: gate_first = sum(len(r.get("voice_flags", [])) for r in report.values())
    if not bump or rnd == ROUNDS - 1: break
    print(f"round {rnd}: re-rolling {len(bump)} requests ({', '.join(sorted({w for x in why.values() for w in x}))})", file=sys.stderr, flush=True)
    for (v, st, t) in bump: G.bump_take(t, v, st); jobs[(v, st, t)] = None
    run_jobs(list(bump))
    todo = sorted({pid for pid in pids for i, seg in enumerate(spec["pages"][pid]) if "t" in seg
                   and (cast(seg["v"]) + (request_text(pid, i, seg),)) in bump})
# keep each re-rolled request's best take: passes whisper, then coverage, then the best voice similarity, then coverage share
pin = {}
for rk, takes in HIST.items():
    if len(takes) < 2: continue
    best = max(takes, key=lambda t: (takes[t][0], takes[t][1], round(takes[t][2], 2), takes[t][3]))
    if best != G.current_take(rk[2], rk[0], rk[1]): pin[rk] = best
if pin:
    with G._lock:
        tk = G._load_takes()
        for (v, st, t), k in pin.items(): tk[G.base_hash(t, v, st)] = k
        tmpf = f"{G._TAKES_P}.{os.getpid()}.tmp"; json.dump(tk, open(tmpf, "w")); os.replace(tmpf, G._TAKES_P)
    for (v, st, t), k in pin.items():
        p = G._cache_path(t, v, st, k); jobs[(v, st, t)] = G.clean(G._wav_to_float(open(p + ".wav", "rb").read()))
    redo = sorted({pid for pid in pids for i, seg in enumerate(spec["pages"][pid]) if "t" in seg and (cast(seg["v"]) + (request_text(pid, i, seg),)) in pin})
    print(f"kept an earlier, better take for {len(pin)} requests on {len(redo)} pages", file=sys.stderr, flush=True)
    for pid in redo:
        audio, spans = assemble(spec["pages"][pid]); built_all[pid] = (audio, spans)
        clips[pid] = audio; timings[pid] = {"d": round(len(audio) / SR, 2), "w": ctc_words(audio, spans)}
    if GATE:
        VL = voice_lines(built_all); flagged, gate_summary = VG.judge(VL, BOOK, key)
        for pid in report: report[pid]["voice_flags"] = []
        for L in flagged:
            report[L["pid"]]["voice_flags"].append({"i": L["i"], "v": L["who"], "why": L["why"], "sim": round(L["sim"], 3) if L["sim"] is not None else None,
                                                    "f0": round(L["f0"]) if L["f0"] else None, "src": L["src"][:80]})
if GATE:
    by = {}
    for L in voice_lines(built_all): by.setdefault(L["who"], []).append(L["emb"])
    BOOK.save(key, by)
gate = {"voice_flags_first": gate_first, "voice_flags_final": sum(len(r.get("voice_flags", [])) for r in report.values()),
        "coverage_fail_pages": sorted(pid for pid, r in report.items() if r.get("coverage_fail")), "characters": gate_summary,
        "gender_fail": sorted(w for w, x in gate_summary.items() if x.get("gender_fail"))}
for pid in gate["coverage_fail_pages"]: print(f"COVERAGE FAIL {key} {pid}: " + "; ".join(f"{c['v']} missing {c['missing'] or c['cov']}" for c in report[pid]["coverage_fail"])[:400], file=sys.stderr, flush=True)
if gate["gender_fail"]: print(f"GENDER FAIL {key}: {gate['gender_fail']} (add \"A woman's voice.\" / \"A man's voice.\" to their style)", file=sys.stderr, flush=True)

for pid in pids: enc(clips[pid], f"{outdir}/{pid}.mp3")
if os.environ.get("MERGE") and os.path.exists(f"{outdir}/timings.json"):  # MERGE=1: re-render some pages, keep the rest
    old = json.load(open(f"{outdir}/timings.json")); old.update(timings); timings = old
json.dump(timings, open(f"{outdir}/timings.json", "w"), separators=(",", ":"))
os.makedirs(os.path.join(G.CACHE, "reports"), exist_ok=True)
rp = os.path.join(G.CACHE, "reports", f"{course}-{spec.get('audio', 'audio').replace('/', '_')}-{key}.json")
json.dump({"course": course, "key": key, "model": G.MODEL, "gate": gate, "pages": report}, open(rp, "w"), indent=1, ensure_ascii=False)
nbad = sum(len(r["bad"]) for r in report.values())
# whole-chapter episode: page clips in plan order; after each decision, a pause to pick
ep = []
for pid in spec["plan"]:
    ep.append(clips[pid]); ep.append(np.zeros(int(SR * (4 if (pid.startswith("s") and pid != "story") else 1.2)), np.float32))
whole = np.concatenate(ep)
dest = sys.argv[2] if len(sys.argv) > 2 else None
if dest: enc(whole, dest, title=f"The Halcyon Launch: {spec['title']}")
print(G.log_usage(f"{course} {key}") + f" flagged_segments={nbad} voice_flags={gate['voice_flags_first']}->{gate['voice_flags_final']} coverage_fail_pages={len(gate['coverage_fail_pages'])} report={rp}", file=sys.stderr)
print("done", key, len(clips), "clips", round(len(whole) / SR / 60, 1), "min")
