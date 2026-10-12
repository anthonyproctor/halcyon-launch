"""Forced alignment of known text onto narration audio with a wav2vec2 CTC model (word start/end times, about 20 ms resolution).
Used by render_pages_gemini.py for the page word timings the engine highlights against (Gemini returns no timings).
Why not whisper: whisper word times are a by-product of transcription and drift 0.3 to 2 s on long pages, and it rewrites what it
hears ("Seoul 3518", "Okaphor"); forced alignment only places the words we already know were read, so every word gets a time.

  from align_ctc import align_words
  words = align_words(audio, SR, ["Sam", "Okafor,", "Sol", "3518."], said=["Sam", "Oh-kuh-for,", "Soll", "3518."])
  -> [(start_s, end_s), ...] one per word, monotonic

`said` is what the voice was given to read (respellings), one entry per source word; the source words are what the page shows.
Numbers, times, money, ordinals are spelled the way a narrator reads them; anything that can't be spelled with confidence
(part numbers, acronyms that may be read as letters or as a word) becomes a wildcard that takes whatever was said between
its neighbours. Model: ALIGN_MODEL (default facebook/wav2vec2-base-960h, ~360 MB, downloaded once to the HF cache)."""
import os, re, unicodedata
import numpy as np

MODEL = os.environ.get("ALIGN_MODEL", "facebook/wav2vec2-base-960h")
HOP = 0.02  # wav2vec2 frame step at 16 kHz (320 samples)
_m = {}


def _load():
    if not _m:
        import torch, logging
        logging.getLogger("transformers").setLevel(logging.ERROR)
        from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor
        _m["torch"] = torch
        _m["model"] = Wav2Vec2ForCTC.from_pretrained(MODEL).eval()
        _m["proc"] = Wav2Vec2Processor.from_pretrained(MODEL)
        voc = _m["proc"].tokenizer.get_vocab()
        _m["voc"] = voc; _m["blank"] = voc.get("<pad>", 0)
    return _m


def emissions(audio16):
    """log-probabilities [frames, vocab] for 16 kHz mono float audio, in 20 s windows with 2 s of context each side"""
    m = _load(); torch = m["torch"]; sr = 16000; win, ctx = 20 * sr, 2 * sr; out = []
    x = (audio16 - audio16.mean()) / (audio16.std() + 1e-7)  # what Wav2Vec2Processor does (do_normalize), but once for the whole clip
    n = len(x); pos = 0
    while pos < n:
        a, b = max(0, pos - ctx), min(n, pos + win + ctx)
        with torch.no_grad():
            lg = m["model"](torch.from_numpy(x[a:b].astype(np.float32))[None]).logits[0]
        lp = torch.log_softmax(lg, -1).numpy()
        f0 = int(round((pos - a) / 320)); f1 = f0 + int(round((min(n, pos + win) - pos) / 320))
        out.append(lp[f0:f1]); pos += win
    lp = np.concatenate(out) if out else np.zeros((0, len(m["voc"])), np.float32)
    want = int(np.ceil(n / 320))
    if len(lp) < want: lp = np.concatenate([lp, np.repeat(lp[-1:], want - len(lp), 0)]) if len(lp) else lp
    return lp[:want]


# ---- how a word is read aloud
ONES = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split()
TENS = "_ _ twenty thirty forty fifty sixty seventy eighty ninety".split()
ORD = {"one": "first", "two": "second", "three": "third", "five": "fifth", "eight": "eighth", "nine": "ninth", "twelve": "twelfth"}


def n2w(n):
    if n < 20: return [ONES[n]]
    if n < 100: return [TENS[n // 10]] + ([ONES[n % 10]] if n % 10 else [])
    if n < 1000: return [ONES[n // 100], "hundred"] + (n2w(n % 100) if n % 100 else [])
    for unit, name in ((10**9, "billion"), (10**6, "million"), (1000, "thousand")):
        if n >= unit: return n2w(n // unit) + [name] + (n2w(n % unit) if n % unit else [])
    return []


def year(n):
    if 2000 <= n <= 2009: return ["two", "thousand"] + ([ONES[n % 10]] if n % 10 else [])
    hi, lo = divmod(n, 100)
    return n2w(hi) + (["hundred"] if lo == 0 else n2w(lo) if lo >= 10 else ["oh"] + n2w(lo))


def pairs(d):
    hi, lo = int(d[:2]), int(d[2:])
    a = ["oh"] + n2w(hi) if d[0] == "0" else n2w(hi)
    if lo == 0: return a + ["hundred"]
    return a + (["oh"] + n2w(lo) if lo < 10 else n2w(lo))


def ordinal(n):
    w = n2w(n); last = w[-1]
    w[-1] = ORD.get(last) or (last[:-1] + "ieth" if last.endswith("y") else last + "th")
    return w


WILD = None  # a word that can't be spelled with confidence


def spoken(word, nxt=""):
    """-> list of letter strings (upper case) the narrator says for this page word, or [WILD]"""
    w = unicodedata.normalize("NFD", word); w = "".join(c for c in w if unicodedata.category(c) != "Mn")
    w = w.replace("’", "'").replace("‘", "'")
    core = re.sub(r"^[^\w$]+|[^\w%']+$", "", w).strip("'")
    if not core: return []
    out = []
    dollars = core.startswith("$") or core.startswith("US$")
    core = re.sub(r"^(US)?\$", "", core)
    pct = core.endswith("%"); core = core.rstrip("%")
    scale_next = re.sub(r"\W", "", nxt.lower()) in SCALE
    if re.fullmatch(r"\d{1,3}(,\d{3})+|\d+", core):
        n = int(core.replace(",", ""))
        if "," not in core and len(core) == 4 and 1100 <= n <= 2099 and not dollars and not pct: out = year(n)
        elif "," in core or (len(core) <= 3 and not (len(core) > 1 and core[0] == "0")): out = n2w(n)
        elif len(core) == 4: out = pairs(core)  # Sol 3518 -> thirty five eighteen, 1400 -> fourteen hundred, 0905 -> oh nine oh five
        else: return [WILD]
    elif re.fullmatch(r"\d{1,3}\.\d{1,2}", core) and not re.fullmatch(r"\d+\.\d\d", core) or re.fullmatch(r"0\.\d+", core):
        a, b = core.split("."); out = n2w(int(a)) + ["point"] + [ONES[int(c)] for c in b]  # 2.4, 36.9, 0.9 (not 61.109, 2.36)
    elif re.fullmatch(r"\d{1,2}:\d{2}", core):
        h, mm = map(int, core.split(":"))
        if mm == 0: out = n2w(h)  # "nine o'clock" / "nine hundred": the rest goes to the blanks
        else:
            out = n2w(h) + (["oh"] + n2w(mm) if mm < 10 else n2w(mm))
    elif re.fullmatch(r"\d+(st|nd|rd|th)", core):
        out = ordinal(int(re.match(r"\d+", core).group()))
    elif re.search(r"\d", core) or not re.search(r"[A-Za-z]", core):
        return [WILD]
    else:
        parts = [p for p in re.split(r"[-‐-―/&+]+", core) if p]
        for p in parts:
            p = re.sub(r"[^A-Za-z']", "", p)
            if not p: continue
            if p in ("AM", "PM"): out += [p[0], p[1]]
            elif p.isupper() and 2 <= len(p) <= 5 and p not in ("OK", "NO", "GO", "UP", "IT", "IS", "AT", "OF", "TO", "IN", "ON", "AN", "BE", "WE", "ME", "MY", "SO", "OR", "IF", "DO", "US", "HE"):
                return [WILD]  # acronyms: "P M P" or "pimp"? let the neighbours place it
            else: out.append(p)
    if pct: out = out + ["percent"]
    if dollars and not scale_next: out = out + ["dollars"]
    return [o.upper() for o in out if o]


SCALE = ("thousand", "million", "billion", "trillion")


def tokens_for(said):
    """-> per word: list of vocab ids (or -1 = wildcard), and the spoken form for debugging"""
    m = _load(); voc = m["voc"]; ids, forms = [], []
    for k, w in enumerate(said):
        nxt = said[k + 1] if k + 1 < len(said) else ""
        sp = spoken(w, nxt)
        prev = said[k - 1] if k else ""
        if sp and WILD not in sp and re.match(r"\W*(US)?\$", prev) and re.sub(r"\W", "", w.lower()) in SCALE: sp = sp + ["DOLLARS"]  # "$2.4 billion"
        if WILD in sp or not sp:
            ids.append([-1] if sp else []); forms.append("*" if sp else ""); continue
        t = [voc[c] for c in "".join(sp) if c in voc]
        ids.append(t or [-1]); forms.append(" ".join(sp))
    return ids, forms


def viterbi(lp, toks):
    """CTC forced alignment. lp [T, V] log-probs, toks flat list of ids (-1 = wildcard: any non-blank, may repeat).
    -> for each token, (first frame, last frame) it was emitted on."""
    T = len(lp); N = len(toks); blank = _m["blank"]
    if N == 0 or T == 0: return []
    S = 2 * N + 1; NEG = -1e9
    nb = lp.copy(); nb[:, blank] = NEG; star = nb.max(1)
    lab = np.array([blank if s % 2 == 0 else toks[s // 2] for s in range(S)])
    isblank = np.arange(S) % 2 == 0
    em_idx = np.where(lab < 0, 0, lab)
    can_skip = np.zeros(S, bool)  # s-2 -> s allowed when s is a label different from s-2's label (or a wildcard)
    for s in range(3, S, 2): can_skip[s] = lab[s] != lab[s - 2] or lab[s] < 0
    alpha = np.full(S, NEG); bp = np.zeros((T, S), np.int8)
    def emit(t):
        e = lp[t, em_idx]; e = np.where(lab < 0, star[t], e); return e
    e0 = emit(0); alpha[0] = e0[0]; alpha[1] = e0[1]
    for t in range(1, T):
        stay = alpha
        step = np.concatenate([[NEG], alpha[:-1]])
        skip = np.concatenate([[NEG, NEG], alpha[:-2]]); skip = np.where(can_skip, skip, NEG)
        cand = np.stack([stay, step, skip]); ch = cand.argmax(0)
        alpha = cand[ch, np.arange(S)] + emit(t); bp[t] = ch
    s = S - 1 if alpha[S - 1] >= alpha[S - 2] else S - 2
    path = np.zeros(T, np.int64)
    for t in range(T - 1, -1, -1):
        path[t] = s; s -= int(bp[t, s])
    spans = [[None, None] for _ in range(N)]
    for t, s in enumerate(path):
        if s % 2 == 1:
            k = s // 2
            if spans[k][0] is None: spans[k][0] = t
            spans[k][1] = t
    return spans


def align_words(audio, sr, words, said=None, lp=None):
    """-> [(start_s, end_s)] for each word (times relative to the start of `audio`). Words that can't be placed (no tokens,
    or wildcards) are interpolated between their neighbours by length."""
    said = said or words
    if lp is None:
        a16 = np.interp(np.arange(0, len(audio), sr / 16000), np.arange(len(audio)), audio).astype(np.float32) if sr != 16000 else audio
        lp = emissions(a16)
    ids, forms = tokens_for(said)
    flat, owner = [], []
    for j, t in enumerate(ids):
        for x in t: flat.append(x); owner.append(j)
    if len(flat) > len(lp):  # more letters than frames: can't be this text
        return None
    sp = viterbi(lp, flat)
    st, en = [None] * len(words), [None] * len(words)
    for (a, b), j in zip(sp, owner):
        if a is None: continue
        if ids[j] == [-1]: continue  # wildcard: placed by neighbours below
        if st[j] is None: st[j] = a
        en[j] = b + 1
    # voice activity at 10 ms: CTC letters are spikes, so a word's first letter can land in the tail of the previous word or in a pause
    fr = sr // 100; nE = len(audio) // fr
    env = np.sqrt((audio[:nE * fr].reshape(nE, fr) ** 2).mean(1) + 1e-12) if nE else np.zeros(1)
    thr = max(0.006, float(np.percentile(env, 90)) * 0.06); quiet = env <= thr
    def onset(t, limit):  # seconds -> first voiced time at or after t, before limit (else t)
        k = int(t * 100)
        while k < nE and k < limit * 100 and quiet[k]: k += 1
        return k / 100 if k < limit * 100 else t
    def gap_inside(a, b):  # a pause of 100 ms or more inside [a, b) with little voice before it -> where the voice resumes
        k, run, voiced = int(a * 100), 0, 0
        while k < min(nE, int(b * 100)):
            if quiet[k]: run += 1
            else:
                if run >= 10 and voiced <= 15: return k / 100
                if run: voiced += run
                run = 0; voiced += 1
            k += 1
        return None
    # wildcards and empty words: between the neighbours' known edges, split by character length, the first one starting at the voice
    n = len(words); j = 0
    while j < n:
        if st[j] is not None: j += 1; continue
        k = j
        while k < n and st[k] is None: k += 1
        lo = en[j - 1] if j > 0 else 0
        hi = st[k] if k < n else len(lp)
        lo_s = onset(lo * HOP, hi * HOP) / HOP
        if lo_s < hi: lo = lo_s
        L = [len(re.sub(r"\W", "", words[i])) + 1 for i in range(j, k)]; tot = sum(L); acc = 0
        for i in range(j, k):
            st[i] = lo + (hi - lo) * acc / tot; acc += L[i - j]; en[i] = lo + (hi - lo) * acc / tot
        j = k
    out = []
    for j in range(n):
        a, b = st[j] * HOP, max(en[j], st[j] + 1) * HOP
        nxt = st[j + 1] * HOP if j + 1 < n else len(audio) / sr
        g = gap_inside(a, min(b, nxt))
        if g is not None: a = g
        a = onset(a, min(nxt, b + 0.3) - 0.02)
        if out and a < out[-1][0] + 0.03: a = out[-1][0] + 0.03
        out.append((round(a, 3), round(max(b, a + 0.02), 3)))
    return out
