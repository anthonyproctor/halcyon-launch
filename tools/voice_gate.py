"""Voice gate for the Gemini narration (used by render_pages_gemini.py): catches a character whose voice drifted or reads as the
wrong gender, so nobody has to catch it by ear.
- embed(audio): WavLM speaker-verification embedding (microsoft/wavlm-base-plus-sv, ~380 MB, downloaded once to the HF cache)
- f0(audio): median pitch in Hz of the voiced frames (autocorrelation), None when there is too little voiced speech
- Book centroids: every rendered chapter adds its per-character mean embedding to <cache>/voices/<course>-<audio>.json, keyed by
  chapter, so a line is compared with how that character sounds across the whole book, not just the page.
- flags(lines, key): a line is flagged when its similarity to its character's book centroid is below SIM_MIN (0.88,
  calibrated 2026-10-11 on the run-mode renders of Halcyon ch1 and ch2: the 5th percentile of character lines' similarity to
  their centroid, 123 lines), or when its pitch
  reads opposite to the character's cast gender ("gender": "f"/"m" in gemini_voices.json; no field = no pitch check).
Only lines of at least MIN_S seconds are judged: shorter clips give unstable embeddings and pitch."""
import json, os
import numpy as np

SR16 = 16000
MIN_S = float(os.environ.get("VOICE_GATE_MIN_S", "1.0"))
SIM_MIN = float(os.environ.get("VOICE_GATE_SIM_MIN", "0.88"))
# a line reads male below F_LOW Hz (cast "f") or female above M_HIGH Hz (cast "m"). A character whose median over the chapter is
# below F_CHAR_LOW (f) or above M_CHAR_HIGH (m) fails the gender check as a whole; the fix is a "A woman's voice." / "A man's
# voice." style prefix. Calibrated 2026-10-11 on Halcyon ch1-2: men 94 to 178 Hz, women 140 to 232 Hz, and Imogen on Gacrux
# at 147 to 153 Hz was heard as a man.
F_LOW, M_HIGH, F_CHAR_LOW, M_CHAR_HIGH = 140.0, 200.0, 160.0, 185.0
_m = {}


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
        self.p = os.path.join(cache, "voices", f"{course}-{audio.replace('/', '_')}.json")
        try: self.d = json.load(open(self.p))
        except Exception: self.d = {}

    def centroid(self, who, key, mine):
        """book centroid for `who`: the other chapters' stored means plus this chapter's own lines (`mine`)"""
        vs, ws = [], []
        for k, (v, n) in self.d.get(who, {}).items():
            if k != key: vs.append(np.array(v)); ws.append(n)
        if len(mine): vs.append(np.mean(mine, 0)); ws.append(len(mine))
        if not vs: return None
        c = np.average(np.array(vs), axis=0, weights=ws); return c / np.linalg.norm(c)

    def save(self, key, by_who):
        for who, E in by_who.items():
            if len(E): m = np.mean(E, 0); self.d.setdefault(who, {})[key] = [(m / np.linalg.norm(m)).tolist(), len(E)]
        tmp = self.p + f".{os.getpid()}.tmp"; json.dump(self.d, open(tmp, "w")); os.replace(tmp, self.p)


def judge(lines, book, key):
    """lines: [{"who", "gender" ("f"/"m"/None), "audio", "sr", ...}] (every judged line of the chapter, any extra fields are kept).
    Adds "sim" and "f0" to each line; returns (flagged lines, per-character summary)."""
    for L in lines:
        if "emb" not in L: L["emb"] = embed(L["audio"], L["sr"]); L["f0"] = f0(L["audio"], L["sr"])
    by = {}
    for L in lines: by.setdefault(L["who"], []).append(L)
    flagged, summary = [], {}
    for who, Ls in by.items():
        c = book.centroid(who, key, [L["emb"] for L in Ls])
        g = Ls[0].get("gender"); f0s = [L["f0"] for L in Ls if L["f0"]]
        med = float(np.median(f0s)) if f0s else None
        for L in Ls:
            L["sim"] = float(L["emb"] @ c) if c is not None and len(Ls) + len(book.d.get(who, {})) > 1 else None
            why = []
            if L["sim"] is not None and L["sim"] < SIM_MIN: why.append(f"voice {L['sim']:.2f} < {SIM_MIN}")
            if g == "f" and L["f0"] and L["f0"] < F_LOW: why.append(f"pitch {L['f0']:.0f} Hz reads male")
            if g == "m" and L["f0"] and L["f0"] > M_HIGH: why.append(f"pitch {L['f0']:.0f} Hz reads female")
            if why: L["why"] = why; flagged.append(L)
        sims = [L["sim"] for L in Ls if L["sim"] is not None]
        summary[who] = {"lines": len(Ls), "mean_sim": round(float(np.mean(sims)), 3) if sims else None,
                        "f0_median": round(med) if med else None, "gender": g,
                        "gender_fail": bool(med and ((g == "f" and med < F_CHAR_LOW) or (g == "m" and med > M_CHAR_HIGH)))}
    return flagged, summary
