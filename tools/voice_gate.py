"""Voice gate for the Gemini narration (used by render_pages_gemini.py): catches a character whose voice drifted or reads as the
wrong gender, so nobody has to catch it by ear.
- embed(audio): WavLM speaker-verification embedding (microsoft/wavlm-base-plus-sv, ~380 MB, downloaded once to the HF cache)
- f0(audio): median pitch in Hz of the voiced frames (autocorrelation), None when there is too little voiced speech
- Book centroids: every rendered chapter adds its per-character mean embedding to <cache>/voices/<course>-<audio>.json, keyed by
  chapter, so a line is compared with how that character sounds across the whole book, not just the page.
- flags(lines, key): a line is flagged when its similarity to its character's book centroid is below the character's "sim_min"
  in gemini_voices.json if set (main characters: 0.92), else SIM_MIN (0.88,
  calibrated 2026-10-11 on the run-mode renders of Halcyon ch1 and ch2: the 5th percentile of character lines' similarity to
  their centroid, 123 lines), or when its pitch
  reads opposite to the character's cast gender ("gender": "f"/"m" in gemini_voices.json; no field = no pitch check).
Only lines of at least MIN_S seconds are judged: shorter clips give unstable embeddings and pitch.
- Each take counts once (uniq): render_pages_gemini caches one embedding per take, so the same take on variant pages (s9, s9_v1,
  s9_v2, s9_fixed, s10_alt) has identical bytes. The baselines (f0 median, pitch_max_st median, mean_sim, the centroid, "lines") use
  each take once; every copy is still judged and flagged on its own page ("line_copies" is the old count). pace_gate does the same.
- A character with no untoned line in the book (every line carries a data-tone) gets a book voice of its own toned lines, stored as
  "<who>#toned" (book_voice, Book.save). It is used only when the character has no untoned line this chapter and no untoned entry in
  another chapter, so a toned chapter never moves an ordinary book voice; the summary marks it "book_voice": "toned only"."""
import hashlib, json, os
import numpy as np

SR16 = 16000
MIN_S = float(os.environ.get("VOICE_GATE_MIN_S", "1.0"))
SIM_MIN = float(os.environ.get("VOICE_GATE_SIM_MIN", "0.88"))
# a line with a delivery cue (data-tone: angry, grieving, frightened) is meant to sound different, and WavLM-SV similarity drops a
# little with strong emotion; the identity bar for those lines is TONE_SIM_MIN. Lines without a tone keep SIM_MIN.
TONE_SIM_MIN = float(os.environ.get("VOICE_GATE_TONE_SIM_MIN", "0.85"))
# a line reads male below F_LOW Hz (cast "f") or female above M_HIGH Hz (cast "m"). A character whose median over the chapter is
# below F_CHAR_LOW (f) or above M_CHAR_HIGH (m) fails the gender check as a whole; the fix is a "A woman's voice." / "A man's
# voice." style prefix. Calibrated 2026-10-11 on Halcyon ch1-2: men 94 to 178 Hz, women 140 to 232 Hz, and Imogen on Gacrux
# at 147 to 153 Hz was heard as a man.
F_LOW, M_HIGH, F_CHAR_LOW, M_CHAR_HIGH = 140.0, 200.0, 160.0, 185.0
# Per-character bars, optional, in the character's entry in gemini_voices.json (courses[course][who], then default[who]):
#   "sim_min": 0.92        identity bar for that character's untoned lines (default SIM_MIN). Main characters carry 0.92: they are
#                          heard on page after page, so drift that 0.88 lets through is audible across pages (2026-10-12: Abby's
#                          "keep my mouth shut. Mostly." on ch1 s4 vs "Most people read the bold parts." on o4_1, both above 0.88)
#   "tone_sim_min": 0.88   the same for their toned lines (default TONE_SIM_MIN)
#   "pitch_max_st": 2      an untoned line whose pitch is more than this many semitones from the character's median over the
#                          chapter's untoned lines (5+ pitched lines) is flagged too; no field = no such check
# A character without these fields is judged exactly as before.
_m, _cast = {}, {}


def char_cfg(course, who):
    if "v" not in _cast:
        try: _cast["v"] = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "gemini_voices.json")))
        except Exception: _cast["v"] = {}
    V = _cast["v"]
    return (V.get("courses", {}).get(course or "", {}).get(who) or V.get("default", {}).get(who) or {}) if who else {}


def _load():
    if not _m:
        import logging, torch
        logging.getLogger("transformers").setLevel(logging.ERROR)
        from transformers import AutoFeatureExtractor, WavLMForXVector
        _m["torch"] = torch
        _m["fe"] = AutoFeatureExtractor.from_pretrained("microsoft/wavlm-base-plus-sv")
        _m["sv"] = WavLMForXVector.from_pretrained("microsoft/wavlm-base-plus-sv").eval()
    return _m


def to16(a, sr):
    return np.interp(np.arange(0, len(a), sr / SR16), np.arange(len(a)), a).astype(np.float32) if sr != SR16 else a


def embed(a, sr):
    m = _load(); a = to16(a, sr)[:SR16 * 20]
    with m["torch"].no_grad():
        e = m["sv"](**m["fe"](a, sampling_rate=SR16, return_tensors="pt")).embeddings[0].numpy()
    return e / np.linalg.norm(e)


def f0(a, sr):
    a = to16(a, sr); n, h = int(0.04 * SR16), int(0.01 * SR16); lo, hi = SR16 // 400, SR16 // 70
    if len(a) < n * 2: return None
    F = np.stack([a[i:i + n] for i in range(0, len(a) - n, h)]); e = np.sqrt((F ** 2).mean(1)); thr = max(0.01, np.percentile(e, 90) * 0.2)
    out = []
    for fr, en in zip(F, e):
        if en < thr: continue
        x = fr - fr.mean(); ac = np.correlate(x, x, "full")[n - 1:]; ac = ac / (ac[0] + 1e-9)
        l = lo + int(np.argmax(ac[lo:hi]))
        if ac[l] > 0.45: out.append(SR16 / l)
    return float(np.median(out)) if len(out) >= 8 else None


class Book:
    """per-character centroids across the chapters of one book (one file per course + audio root)"""
    def __init__(self, cache, course, audio):
        os.makedirs(os.path.join(cache, "voices"), exist_ok=True)
        self.course = course
        self.p = os.path.join(cache, "voices", f"{course}-{audio.replace('/', '_')}.json")
        try: self.d = json.load(open(self.p))
        except Exception: self.d = {}

    def centroid(self, who, key, mine, toned=False):
        """book centroid for `who`: the other chapters' stored means plus this chapter's own lines (`mine`). toned=True (`mine` are
        toned lines: the character has no untoned line this chapter): when no other chapter has an untoned entry either, the other
        chapters' "<who>#toned" entries count, so an all-toned character still has a book voice"""
        vs, ws = [], []
        for k, (v, n) in self.d.get(who, {}).items():
            if k != key: vs.append(np.array(v)); ws.append(n)
        if toned and not vs:
            for k, (v, n) in self.d.get(who + "#toned", {}).items():
                if k != key: vs.append(np.array(v)); ws.append(n)
        if len(mine): vs.append(np.mean(mine, 0)); ws.append(len(mine))
        if not vs: return None
        c = np.average(np.array(vs), axis=0, weights=ws); return c / np.linalg.norm(c)

    def save(self, key, by_who):
        """writes only this chapter's entries, merged into the file as it is now (two renders running at once each keep
        the other's chapters instead of overwriting them with the copy they loaded at start)"""
        import fcntl
        mine = {}
        for who, E in by_who.items():
            if len(E): m = np.mean(E, 0); mine[who] = [(m / np.linalg.norm(m)).tolist(), len(E)]
        with open(self.p + ".lock", "w") as lk:
            fcntl.flock(lk, fcntl.LOCK_EX)
            try: cur = json.load(open(self.p))
            except Exception: cur = {}
            for who, v in mine.items(): cur.setdefault(who, {})[key] = v
            self.d = cur
            tmp = self.p + f".{os.getpid()}.tmp"; json.dump(cur, open(tmp, "w")); os.replace(tmp, self.p)


def uniq(lines):
    """each take once, in order: the key is speaker, source text and an md5 of the embedding bytes. The same cached take on several
    variant pages has identical bytes; a re-roll is a different take and stays separate."""
    seen, out = set(), []
    for L in lines:
        k = (L.get("who"), L.get("src"), hashlib.md5(np.ascontiguousarray(L["emb"]).tobytes()).hexdigest())
        if k not in seen: seen.add(k); out.append(L)
    return out


def book_voice(lines):
    """{who: [emb]} for Book.save from a chapter's judged lines: each character's untoned takes, each once (toned lines don't move the
    book voice). A character with no untoned line this chapter gives its toned takes instead, under "<who>#toned"."""
    plain, toned = {}, {}
    for L in uniq(lines): (toned if L.get("tone") else plain).setdefault(L["who"], []).append(L["emb"])
    out = dict(plain)
    for who, E in toned.items():
        if who not in plain: out[who + "#toned"] = E
    return out


def judge(lines, book, key):
    """lines: [{"who", "gender" ("f"/"m"/None), "audio", "sr", ...}] (every judged line of the chapter, any extra fields are kept).
    Adds "sim" and "f0" to each line; returns (flagged lines, per-character summary)."""
    for L in lines:
        if "emb" not in L: L["emb"] = embed(L["audio"], L["sr"]); L["f0"] = f0(L["audio"], L["sr"])
    by = {}
    for L in lines: by.setdefault(L["who"], []).append(L)
    flagged, summary = [], {}
    for who, Ls in by.items():
        U = uniq(Ls)  # each take once for the baselines; every copy in Ls is still judged below
        plain = [L["emb"] for L in U if not L.get("tone")]  # the centroid is the character's ordinary voice when there is one
        c = book.centroid(who, key, plain); toned_only = False
        if c is None: c = book.centroid(who, key, [L["emb"] for L in U], toned=True); toned_only = c is not None
        others = len(book.d.get(who, {})) + (len(book.d.get(who + "#toned", {})) if toned_only else 0)
        g = Ls[0].get("gender"); f0s = [L["f0"] for L in U if L["f0"]]
        med = float(np.median(f0s)) if f0s else None
        cfg = char_cfg(getattr(book, "course", None), who)
        smin, tmin, pst = float(cfg.get("sim_min", SIM_MIN)), float(cfg.get("tone_sim_min", TONE_SIM_MIN)), cfg.get("pitch_max_st")
        flo, fclo = float(cfg.get("f0_low", F_LOW)), float(cfg.get("f0_char_low", F_CHAR_LOW))  # per character floors: an older or lower woman Anthony approved by ear (Kendra, 2026-10-14)
        pf = [L["f0"] for L in U if L["f0"] and not L.get("tone")]
        pmed = float(np.median(pf)) if pst is not None and len(pf) >= 5 else None
        for L in Ls:
            L["sim"] = float(L["emb"] @ c) if c is not None and len(U) + others > 1 else None
            why = []
            lo = tmin if L.get("tone") else smin
            if L["sim"] is not None and L["sim"] < lo: why.append(f"voice {L['sim']:.2f} < {lo}")
            if g == "f" and L["f0"] and L["f0"] < flo: why.append(f"pitch {L['f0']:.0f} Hz reads male")
            if g == "m" and L["f0"] and L["f0"] > M_HIGH: why.append(f"pitch {L['f0']:.0f} Hz reads female")
            if pmed and L["f0"] and not L.get("tone") and abs(12 * np.log2(L["f0"] / pmed)) > float(pst):
                why.append(f"pitch {L['f0']:.0f} Hz is {12 * np.log2(L['f0'] / pmed):+.1f} st from {who}'s {pmed:.0f}")
            if why: L["why"] = why; flagged.append(L)
        sims = [L["sim"] for L in U if L["sim"] is not None]
        summary[who] = {"lines": len(U), "line_copies": len(Ls), "mean_sim": round(float(np.mean(sims)), 3) if sims else None,
                        "f0_median": round(med) if med else None, "gender": g,
                        "gender_fail": bool(med and ((g == "f" and med < fclo) or (g == "m" and med > M_CHAR_HIGH)))}
        if toned_only: summary[who]["book_voice"] = "toned only"
    return flagged, summary
