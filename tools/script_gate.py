"""Script gate (post-render): what Gemini said against what it was asked to say. Catches added, repeated and dropped words, which the
renderer's coverage check can't see (it only counts missing words, and a page with every word plus extra ones passes): the ad-lib
"So that's how to hand off and manage." in the Commission ch10 lesson (q22 R1) and Vern reading a paragraph twice in the ch6 lesson
(q22 R2). Read only: it never renders, never calls Gemini and never writes audio.

usage: python3 tools/script_gate.py <course> <chapter|all|1-3> [--edition study|story|both] [--out r.json]
                                    [--changed-since takes.json] [--all-takes] [--no-confirm]
  --changed-since  a copy of ~/.cache/halcyon-gemini-tts/takes.json saved before a render: only takes made since then are checked
                   (a request whose take number differs from the copy, or whose take audio is newer than the copy file)
  --all-takes      check every cached take of each request, not just the current one (old takes are listed with their number)
  --no-confirm     keep flags the full transcript finds without re-hearing their window alone
Exit code 0 always: it reports, it doesn't block.

What is checked: every Gemini request the renderer sends for the chapter (a line, or a same-speaker run of lines), on its cached
take, exactly as Gemini returned it. The requests are rebuilt by running render_pages_gemini.py up to its synthesis step on the
pages.mjs spec, the same way the take bump scripts do, so the request text is the one sent: respellings (SAY) included. A take
that isn't cached (text changed since the render) is listed as skipped.

How:
1. Each take is transcribed with whisper.cpp large-v3-turbo with -mc 0 (no carried text context). With context, whisper loops at
   its 30 s chunk edges on long runs and writes the same sentence twice: 9 false doublings in The Appeal on 2026-11-11, all clean
   with -mc 0. Transcripts are cached by audio md5 in ~/.cache/halcyon-gemini-tts/transcripts/script-*.json.
2. Both sides become word tokens (lower case, digits spelled out, hyphens split). A respelled name is one token that matches any
   of its forms: the written word, the respelling sent and the ok forms in tools/pron/<course>.json, so "TAY-oh" heard as "Teo"
   and "K C one thirty five" heard as "KC-135" are matches. A name from the pron list that isn't respelled gets its ok forms too.
3. The two token lists are aligned (difflib on exact tokens, then a small edit-distance pass inside each mismatch that pairs
   near-spellings and lets one token match up to six: letters said one by one, numbers written as digits).
4. Flags, counted in written words (a number is one word however it's read):
     INSERT  3 or more heard words in a row that the text doesn't have
     REPEAT  an insert that is text already said nearby (the run read again)
     DROP    4 or more words of the text in a row that weren't heard
5. Every flag is re-heard: the take's audio around it (1.5 s either side, plus the length of an insert, so a re-read stretch has
   its first reading in the window too) is transcribed alone and aligned to the text around it.
   A flag stands only if the same kind of gap is there again, away from the window's edges. Whisper on a long run skips and loops
   in stretches that are there.

Calibration: see docs/NARRATION_GATES.md."""
import argparse, difflib, hashlib, json, os, re, subprocess, sys, tempfile, wave
sys.dont_write_bytecode = True
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import pace_gate as PG

ROOT = PG.ROOT
CACHE = os.path.expanduser(os.environ.get("GEMINI_TTS_CACHE", "~/.cache/halcyon-gemini-tts"))
TDIR = os.path.join(CACHE, "transcripts")
REPORTS = os.path.join(CACHE, "reports")
MODEL = os.path.expanduser(os.environ.get("SCRIPT_GATE_MODEL", "~/.cache/whisper/ggml-large-v3-turbo.bin"))
WHISPER_ARGS = ["-mc", "0", "-ml", "1", "-sow", "-np", "-t", "8", "-oj"]
INSERT_MIN = 3        # heard words in a row that the text doesn't have
DROP_MIN = 4          # text words in a row that weren't heard
REPEAT_NEAR = 80      # an insert is a REPEAT when its words are text within this many tokens of where it was heard
CONFIRM_PAD = 1.5     # seconds of audio either side of a flag when it is re-heard alone
EDGE = 2              # a gap this close to the end of a re-heard window is the window's cut, not a flag
MERGE_MAX = 6         # one token may match up to this many on the other side

# ---- numbers and tokens
ONES = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split()
TENS = "_ _ twenty thirty forty fifty sixty seventy eighty ninety".split()
def n2w(n):
    if n < 20: return [ONES[n]]
    if n < 100: return [TENS[n // 10]] + ([ONES[n % 10]] if n % 10 else [])
    if n < 1000: return [ONES[n // 100], "hundred"] + (n2w(n % 100) if n % 100 else [])
    for unit, name in ((10 ** 9, "billion"), (10 ** 6, "million"), (1000, "thousand")):
        if n >= unit: return n2w(n // unit) + [name] + (n2w(n % unit) if n % unit else [])
    return [str(n)]
def nrm(s): return re.sub(r"[^a-z0-9]", "", s.lower())

def tokens(text, forms=None):
    """text -> [(token, word index, forms)]: forms is a set of accepted spellings (letters and digits only) for a respelled or listed
    name, else None. Words are split on spaces; a marker word \\x00k\\x00 stands for forms[k]."""
    out = []
    for wi, w in enumerate(text.split()):
        m = re.fullmatch(r"\W*\x00(\d+)\x00(\W*)", w)
        if m and forms is not None:
            out.append(("\x00" + m.group(1), wi, forms[int(m.group(1))])); continue
        w = w.replace("&", " and ").replace("%", " percent")
        num = re.fullmatch(r"\W*[$£€]?(\d{1,3}(?:,\d{3})+|\d+)(?:st|nd|rd|th|s)?\W*", w)
        if num and len(num.group(1).replace(",", "")) < 10:
            for t in n2w(int(num.group(1).replace(",", ""))): out.append((t, wi, None))
            continue
        for p in re.split(r"[-‐-―/.:]+|(?<=[a-z])(?=\d)|(?<=\d)(?=[a-z])", w.lower()):
            p = re.sub(r"[^\w']", "", p).strip("'").replace("'s", "s").replace("'", "")
            if not p: continue
            if p.isdigit() and len(p) < 10: out += [(t, wi, None) for t in n2w(int(p))]
            else: out.append((p, wi, None))
    return out

# ---- respellings and the pron list
def pron_forms(course):
    p = os.path.join(HERE, "pron", f"{course}.json")
    if not os.path.exists(p): return {}
    with open(p) as f: terms = json.load(f)["terms"]
    out = {}
    for t in terms:
        out.setdefault(nrm(t["term"]), set()).update(nrm(x) for x in t.get("ok", []) + [t["term"]])
    return out

class Forms:
    """the respellings of one course: marks them in a request text, and gives every listed name its accepted forms"""
    def __init__(self, say, course):
        self.pron = pron_forms(course); self.sets = []; idx = {}
        for k, v in say.items():
            if nrm(v) == nrm(k) or not nrm(v): continue
            f = {nrm(k), nrm(v), nrm(re.sub(r"'s$", "", k))} | self.pron.get(nrm(re.sub(r"['’]s$", "", k)), set())
            idx.setdefault(v, set()).update(f)
        self.vals = sorted(idx, key=len, reverse=True); self.idx = idx
        self.re = re.compile(r"(?<![\w-])(" + "|".join(map(re.escape, self.vals)) + r")(?![\w-])") if self.vals else None
    def source(self, text):
        """request text -> tokens, a respelling or listed name as one token with its forms"""
        sets = []
        def mark(m):
            sets.append(self.idx[m.group(1)] | {nrm(m.group(1))}); return f" \x00{len(sets) - 1}\x00 "
        t = self.re.sub(mark, text) if self.re else text
        toks = tokens(t, sets)
        return [(a, wi, f if f is not None else self.pron.get(a)) for a, wi, f in toks]

# ---- alignment
def _sim(src, heard):
    """src token (text, forms) against a list of heard tokens -> similarity 0..1"""
    h = "".join(heard)
    if not h: return 0.0
    cands = src[1] if src[1] else {src[0]}
    if h in cands: return 1.0
    return max(difflib.SequenceMatcher(None, c, h, autojunk=False).ratio() for c in cands if c)

def _local(S, H):
    """edit distance inside one mismatch: S [(token, forms)], H [token] -> ops [(kind, s0, s1, h0, h1)], kind in match, sub, ins, del.
    Costs: a near-spelling pairs for 0 (similarity >= 0.8) or 0.5 (>= 0.55); a 1 to 1 pair that doesn't look alike costs 1.4;
    an inserted or dropped token costs 1."""
    n, m = len(S), len(H); INF = 1e9
    if n * m > 40000: return [x for x in (("del", 0, n, 0, 0), ("ins", n, n, 0, m)) if x[2] > x[1] or x[4] > x[3]]  # too big to pair: all of it is a gap
    D = [[INF] * (m + 1) for _ in range(n + 1)]; P = [[None] * (m + 1) for _ in range(n + 1)]; D[0][0] = 0
    for i in range(n + 1):
        for j in range(m + 1):
            d = D[i][j]
            if d >= INF: continue
            if i < n and d + 1 < D[i + 1][j]: D[i + 1][j] = d + 1; P[i + 1][j] = ("del", i, j)
            if j < m and d + 1 < D[i][j + 1]: D[i][j + 1] = d + 1; P[i][j + 1] = ("ins", i, j)
            for a in range(1, MERGE_MAX + 1):
                if i + a > n: break
                for b in range(1, MERGE_MAX + 1):
                    if j + b > m: break
                    if a > 1 and b > 1: break
                    if a == 1: s = _sim(S[i], H[j:j + b])
                    else: s = _sim(("".join(x[0] for x in S[i:i + a]), set().union(*[{x[0]} for x in S[i:i + a]]) | {"".join(x[0] for x in S[i:i + a])}), H[j:j + b])
                    c = 0 if s >= 0.8 else 0.5 if s >= 0.55 else (1.4 if a == 1 and b == 1 else INF)
                    if c >= INF: continue
                    if d + c < D[i + a][j + b]: D[i + a][j + b] = d + c; P[i + a][j + b] = ("match" if c < 1 else "sub", i, j)
    ops, i, j = [], n, m
    while (i, j) != (0, 0):
        k, pi, pj = P[i][j]; ops.append((k, pi, i, pj, j)); i, j = pi, pj
    return ops[::-1]

def align(S, H):
    """S: source tokens [(token, word, forms)], H: heard tokens [(token, word, ...)] -> ops over the whole lists"""
    sm = difflib.SequenceMatcher(None, [x[0] for x in S], [x[0] for x in H], autojunk=False); ops = []
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == "equal": ops.append(("match", i1, i2, j1, j2)); continue
        for k, a, b, c, d in _local([(x[0], x[2]) for x in S[i1:i2]], [x[0] for x in H[j1:j2]]):
            ops.append((k, i1 + a, i1 + b, j1 + c, j1 + d))
    return ops

def gaps(S, H, ops):
    """-> [{kind, s0, s1, h0, h1, words}] runs of inserted heard tokens (INSERT/REPEAT) and dropped source tokens (DROP)"""
    out, cur = [], None
    def close():
        nonlocal cur
        if not cur: return
        if cur["kind"] == "INSERT":
            words = len({H[k][1] for k in range(cur["h0"], cur["h1"])})
            if words >= INSERT_MIN:
                cur["words"] = words
                ins = [H[k][0] for k in range(cur["h0"], cur["h1"])]
                lo = max(0, cur["s0"] - REPEAT_NEAR); near = [x[0] for x in S[lo:cur["s0"] + REPEAT_NEAR]]
                blk = difflib.SequenceMatcher(None, ins, near, autojunk=False).find_longest_match(0, len(ins), 0, len(near))
                if blk.size >= max(3, int(0.6 * len(ins))): cur["kind"] = "REPEAT"
                out.append(cur)
        else:
            words = len({S[k][1] for k in range(cur["s0"], cur["s1"])})
            if words >= DROP_MIN: cur["words"] = words; out.append(cur)
        cur = None
    for k, i1, i2, j1, j2 in ops:
        kind = "INSERT" if k == "ins" else "DROP" if k == "del" else None
        if kind and cur and cur["kind"] == kind:
            cur["s1"], cur["h1"] = i2, j2; continue
        close()
        if kind: cur = {"kind": kind, "s0": i1, "s1": i2, "h0": j1, "h1": j2}
    close()
    return out

# ---- whisper
def _md5(path): return hashlib.md5(open(path, "rb").read()).hexdigest()
def _to16(a, sr, path, pad=0.3):
    import numpy as np
    a16 = np.interp(np.arange(0, len(a), sr / 16000), np.arange(len(a)), a) if sr != 16000 else a
    z = np.zeros(int(16000 * pad), np.float32); a16 = np.concatenate([z, a16, z])
    w = wave.open(path, "wb"); w.setnchannels(1); w.setsampwidth(2); w.setframerate(16000)
    w.writeframes((np.clip(a16, -1, 1) * 32767).astype("<i2").tobytes()); w.close()

def read_wav(path):
    import numpy as np
    w = wave.open(path); sr, n = w.getframerate(), w.getnframes(); raw = w.readframes(n); ch = w.getnchannels(); w.close()
    a = np.frombuffer(raw, "<i2").astype(np.float32) / 32768
    return (a.reshape(-1, ch).mean(1) if ch > 1 else a), sr

PACK_CLIP, PACK_MAX, PACK_GAP = 12.0, 27.0, 1.2  # short takes share one whisper window: each file costs a full 30 s encoder pass

def transcribe(clips, log=None):
    """[(key, audio float array, sample rate)] -> {key: [(word, start, end)]} in seconds of the clip, cached by audio md5.
    Takes of PACK_CLIP seconds or less are packed, PACK_GAP of silence apart, into files of at most PACK_MAX seconds, so one 30 s
    whisper window holds several (no chunk edge inside a pack); a heard word belongs to the take its middle falls in."""
    import numpy as np
    os.makedirs(TDIR, exist_ok=True); tmp = tempfile.mkdtemp(prefix="scriptgate-"); out, todo = {}, []
    tag = hashlib.md5((os.path.basename(MODEL) + " ".join(WHISPER_ARGS)).encode()).hexdigest()[:6]
    for key, a, sr in clips:
        h = hashlib.md5(np.ascontiguousarray(a).tobytes()).hexdigest() + "-" + str(sr)
        packed = len(a) / sr <= PACK_CLIP; p = os.path.join(TDIR, f"script-{tag}{'p' if packed else ''}-{h}.json")
        if os.path.exists(p):
            with open(p) as f: out[key] = [tuple(x) for x in json.load(f)]
            continue
        a16 = np.interp(np.arange(0, len(a), sr / 16000), np.arange(len(a)), a).astype(np.float32) if sr != 16000 else a
        todo.append((key, p, a16))
    files, cur, cur_len = [], [], 0.0  # files: [[(key, cache path, audio, offset s)]]
    for key, p, a16 in sorted(todo, key=lambda x: len(x[2])):
        d = len(a16) / 16000
        if d > PACK_CLIP: files.append([(key, p, a16, 0.0)]); continue
        if cur and cur_len + PACK_GAP + d > PACK_MAX: files.append(cur); cur, cur_len = [], 0.0
        cur.append((key, p, a16, cur_len + (PACK_GAP if cur else 0.0))); cur_len = cur[-1][3] + d
    if cur: files.append(cur)
    paths = []
    for n, grp in enumerate(files):
        end = grp[-1][3] + len(grp[-1][2]) / 16000; buf = np.zeros(int(end * 16000) + 1, np.float32)
        for _, _, a16, off in grp: i = int(off * 16000); buf[i:i + len(a16)] = a16[:len(buf) - i]
        f = os.path.join(tmp, f"{n}.wav"); _to16(buf, 16000, f); paths.append(f)
    args = ["whisper-cli", "-m", MODEL] + WHISPER_ARGS; done_n = 0
    for n in range(0, len(files), 16):
        chunk = list(range(n, min(n + 16, len(files))))
        try: subprocess.run(args + [x for k in chunk for x in ("-f", paths[k])], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        except subprocess.CalledProcessError:
            for k in chunk:
                try: subprocess.run(args + ["-f", paths[k]], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
                except subprocess.CalledProcessError: pass
        for k in chunk:
            f = paths[k]; heard = []
            if os.path.exists(f + ".json"):
                with open(f + ".json") as fh:
                    for sg in json.load(fh).get("transcription", []):
                        t = sg["text"].strip()
                        if t and not re.fullmatch(r"[\W_]+", t) and not t.startswith("["):
                            heard.append((t, sg["offsets"]["from"] / 1000 - 0.3, sg["offsets"]["to"] / 1000 - 0.3))
            grp = files[k]
            for gi, (key, p, a16, off) in enumerate(grp):
                lo = off - (PACK_GAP / 2 if gi else 1e9); hi = off + len(a16) / 16000 + (PACK_GAP / 2 if gi + 1 < len(grp) else 1e9)
                # nothing heard after the take ends counts: whisper writes "We'll see you next time." into trailing silence
                ws = [(t, round(s0 - off, 2), round(s1 - off, 2)) for t, s0, s1 in heard if lo <= (s0 + s1) / 2 < hi and s0 - off < len(a16) / 16000 - 0.05]
                if os.path.exists(f + ".json"):
                    with open(p, "w") as fh: json.dump(ws, fh)
                out[key] = ws; done_n += 1
            for x in (f, f + ".json"):
                if os.path.exists(x): os.remove(x)
        if log: log(f"  transcribed {done_n} of {len(todo)} takes")
    try: os.rmdir(tmp)
    except OSError: pass
    return out

def heard_tokens(words):
    """[(word, start, end)] -> tokens [(token, word index, (start, end))]"""
    out = []
    for wi, (w, s, e) in enumerate(words):
        for t, _, _ in tokens(w): out.append((t, wi, (s, e)))
    return out

# ---- the requests a chapter sends
def requests_for(course, ch, story):
    """-> (renderer globals, {request key: [(pid, seg index, who, piece n, [piece texts])]})"""
    spec = PG.spec_for(course, ch, story)
    fd, sp = tempfile.mkstemp(suffix=".json"); os.close(fd); json.dump(spec, open(sp, "w"))
    rpg = os.path.join(HERE, "render_pages_gemini.py"); src = open(rpg).read(); src = src[:src.index("def run_jobs")]
    env = {k: os.environ.get(k) for k in ("GEMINI_COURSE",)}; argv = list(sys.argv); cwd = os.getcwd()
    os.environ["GEMINI_COURSE"] = "pmp" if course in ("pmp", "pmp-v2", "v2") else course; sys.argv[:] = ["render_pages_gemini.py", sp]
    os.chdir(ROOT if course in ("pmp", "pmp-v2", "v2") else os.path.join(ROOT, "courses", course))
    try:
        g = {"__file__": rpg, "__name__": "script_gate_requests"}; exec(compile(src, rpg, "exec"), g)
    finally:
        os.chdir(cwd); sys.argv[:] = argv; os.unlink(sp)
        for k, v in env.items():
            if v is None: os.environ.pop(k, None)
            else: os.environ[k] = v
    reqs = {}
    for pid, segs in g["spec"]["pages"].items():
        for i, s in enumerate(segs):
            if "t" not in s: continue
            v, st = g["cast_seg"](s); run = g["RUN_OF"].get((pid, i))
            t = run[0] if run else g["say"](g["gem_text"](s))
            reqs.setdefault((v, st, t), []).append((pid, i, s["v"], run[1] if run else 0, run[2] if run else [t]))
    return g, reqs

# ---- checking one take
def span_words(S, raw, a, b):
    """the written words behind source tokens a..b"""
    return " ".join(raw[w] for w in sorted({S[k][1] for k in range(a, b)}) if w < len(raw))

def check(S, raw, words, piece_of):
    """S source tokens, raw the request's written words, words heard [(w, s, e)] -> flags with their text, heard words and take times"""
    H = heard_tokens(words); ops = align(S, H); out = []
    for gp in gaps(S, H, ops):
        if gp["kind"] == "DROP":
            prev = [H[j][2][1] for k, i1, i2, j1, j2 in ops if k in ("match", "sub") and i2 <= gp["s0"] for j in range(j1, j2)]
            nxt = [H[j][2][0] for k, i1, i2, j1, j2 in ops if k in ("match", "sub") and i1 >= gp["s1"] for j in range(j1, j2)]
            t0 = prev[-1] if prev else 0.0; t1 = nxt[0] if nxt else (H[-1][2][1] if H else 0.0)
        else:
            t0, t1 = H[gp["h0"]][2][0], H[gp["h1"] - 1][2][1]
        out.append({**gp, "t0": round(t0, 2), "t1": round(t1, 2), "piece": piece_of(min(gp["s0"], len(S) - 1)) if S else 0,
                    "text": span_words(S, raw, gp["s0"], gp["s1"]) if gp["kind"] == "DROP" else "",
                    "heard": " ".join(words[w][0] for w in sorted({H[k][1] for k in range(gp["h0"], gp["h1"])})) if gp["kind"] != "DROP" else "",
                    "context": span_words(S, raw, max(0, gp["s0"] - 6), min(len(S), gp["s1"] + 6))})
    return out

def confirm(flag, S, a, sr):
    """re-hear the audio around a flag alone: True when the same kind of gap is there again. Where the window cuts into speech, its
    first and last EDGE heard words don't count (they are partial words), and a drop must lie between matched words."""
    # an insert's window also holds as much audio again on each side, so a re-read stretch has its first reading in the window
    pad = CONFIRM_PAD if flag["kind"] == "DROP" else CONFIRM_PAD + (flag["t1"] - flag["t0"])
    dur = len(a) / sr; lo, hi = max(0.0, flag["t0"] - pad), min(dur, flag["t1"] + pad)
    if hi - lo < 0.3: return True
    words = transcribe([("w", a[int(lo * sr):int(hi * sr)], sr)])["w"]
    s0 = max(0, flag["s0"] - 40); S2 = S[s0:min(len(S), flag["s1"] + 40)]
    H = heard_tokens(words); ops = align(S2, H)
    m = [(i1, i2) for k, i1, i2, j1, j2 in ops if k == "match" and i2 > i1]
    if not m: return True  # nothing recognisable in the window: keep the flag for the ear
    first, last = m[0][0], m[-1][1]
    cut_lo, cut_hi = lo > 0.05, hi < dur - 0.05
    hw = sorted({h[1] for h in H}); edge = set(hw[:EDGE] if cut_lo else []) | set(hw[-EDGE:] if cut_hi else [])
    for gp in gaps(S2, H, ops):
        if flag["kind"] == "DROP":
            if gp["kind"] == "DROP" and gp["s0"] >= first and gp["s1"] <= last: return True
        elif gp["kind"] in ("INSERT", "REPEAT"):
            if len({H[k][1] for k in range(gp["h0"], gp["h1"])} - edge) >= INSERT_MIN: return True
    return False

# ---- main
def parse_takes(path):
    try: return json.load(open(path))
    except Exception: return None

def main():
    ap = argparse.ArgumentParser(description="Script gate: what Gemini said against the text it was sent.")
    ap.add_argument("course"); ap.add_argument("chapter"); ap.add_argument("--edition", default="study", choices=["study", "story", "both"])
    ap.add_argument("--out"); ap.add_argument("--changed-since"); ap.add_argument("--all-takes", action="store_true"); ap.add_argument("--no-confirm", action="store_true")
    a = ap.parse_args()
    import gemini_tts as G
    chs = PG.parse_chapters(a.chapter, a.course); eds = ["study", "story"] if a.edition == "both" else [a.edition]
    since = parse_takes(a.changed_since) if a.changed_since else None
    if a.changed_since and since is None: sys.exit(f"can't read {a.changed_since}")
    since_t = os.path.getmtime(a.changed_since) if a.changed_since else None
    log = lambda m: print(m, file=sys.stderr, flush=True)
    report = {"course": a.course, "chapters": chs, "editions": eds, "model": os.path.basename(MODEL), "whisper": WHISPER_ARGS,
              "thresholds": {"INSERT_MIN": INSERT_MIN, "DROP_MIN": DROP_MIN, "CONFIRM_PAD": CONFIRM_PAD}, "changed_since": a.changed_since,
              "chapters_out": {}, "summary": {}}
    done = {}  # (request key, take) -> flags, so a take shared by both editions is heard once
    tot_takes = tot_flags = tot_words = 0; counts = {}; skipped_total = 0
    for ed in eds:
        story = ed == "story"
        for ch in chs:
            g, reqs = requests_for(a.course, ch, story)
            forms = Forms(g["SAY"], a.course)
            key = f"f{ch}{'s' if story else ''}"
            c = PG.load_chapter(a.course, ch, story, use_audio=False)
            line_at = {}
            if c:
                for pid, ls in c["pages"].items():
                    for L in ls: line_at[(pid, L["i"])] = (L["start"], (c["offset"].get(pid) or 0) + L["start"] if c["offset"].get(pid) is not None else None)
            todo, skipped = [], []
            for (v, st, t), users in reqs.items():
                cur = G.current_take(t, v, st)
                takes = [k for k in range(cur + 1) if os.path.exists(G._cache_path(t, v, st, k) + ".wav")] if a.all_takes else [cur]
                p = G._cache_path(t, v, st, cur) + ".wav"
                if not os.path.exists(p): skipped.append({"text": t[:80], "who": users[0][2], "why": "current take not cached"}); continue
                if since is not None:
                    bh = G.base_hash(t, v, st)
                    if since.get(bh, 0) == cur and os.path.getmtime(p) <= since_t: continue
                for k in takes: todo.append(((v, st, t), k, users))
            clips = []
            for rk, k, users in todo:
                if (rk, k) in done: continue
                aud, sr = read_wav(G._cache_path(rk[2], rk[0], rk[1], k) + ".wav"); clips.append(((rk, k), aud, sr))
            log(f"ch{ch} {ed}: {len(todo)} takes to check, {len(clips)} not heard yet in this run")
            heard = transcribe(clips, log) if clips else {}
            audio = {ck: (aud, sr) for ck, aud, sr in clips}
            out = []; words_here = 0
            for rk, k, users in todo:
                v, st, t = rk
                if (rk, k) not in done:
                    S = forms.source(t); raw = t.split()
                    bounds = []; acc = 0
                    for pt in users[0][4]: acc += len(pt.split()); bounds.append(acc)
                    piece_of = lambda si, S=S, bounds=bounds: next((n for n, b in enumerate(bounds) if S[si][1] < b), len(bounds) - 1)
                    flags = check(S, raw, heard.get((rk, k), []), piece_of)
                    if flags and not a.no_confirm:
                        aud, sr = audio[(rk, k)]
                        flags = [f for f in flags if confirm(f, S, aud, sr)]
                    done[(rk, k)] = (flags, len(t.split()))
                flags, nw = done[(rk, k)]
                words_here += nw; tot_takes += 1
                for f in flags:
                    lines = [(pid, i, who) for pid, i, who, n, _ in users if n == f["piece"]] or [(pid, i, who) for pid, i, who, n, _ in users]
                    pid, i, who = lines[0]; at = line_at.get((pid, i), (None, None))
                    rec = {"kind": f["kind"], "words": f["words"], "who": who, "voice": v, "style": st, "take": k,
                           "current": k == G.current_take(t, v, st), "take_time": [f["t0"], f["t1"]], "heard": f["heard"], "dropped": f["text"],
                           "context": f["context"], "pages": sorted({p for p, _, _ in lines}), "line_page_time": at[0], "line_chapter_time": at[1],
                           "base_hash": G.base_hash(t, v, st), "cache": os.path.basename(G._cache_path(t, v, st, k))}
                    out.append(rec); counts[f["kind"]] = counts.get(f["kind"], 0) + 1
            tot_words += words_here; tot_flags += len(out); skipped_total += len(skipped)
            report["chapters_out"][f"{ch}-{ed}"] = {"takes": len(todo), "words": words_here, "flagged": out, "skipped": skipped}
            print(f"\nch{ch} {ed}: {len(out)} flagged of {len(todo)} takes" + (f", {len(skipped)} not cached (skipped)" if skipped else ""))
            for f in out:
                where = f"page {f['pages'][0]}" + (f" line at {PG.mmss(f['line_page_time'])}" if f["line_page_time"] is not None else "") + \
                        (f", chapter {PG.mmss(f['line_chapter_time'])}" if f["line_chapter_time"] is not None else "")
                what = f"heard \"{f['heard']}\"" if f["kind"] != "DROP" else f"not heard: \"{f['dropped']}\""
                print(f"  {f['kind']} {f['words']} words, {f['who']} ({where}; take {f['take']}{'' if f['current'] else ', not current'} at {f['take_time'][0]:.1f} s)")
                print(f"     {what[:160]}")
                print(f"     text around it: \"{f['context'][:160]}\"")
    report["summary"] = {"takes": tot_takes, "words": tot_words, "flagged": tot_flags, "by_flag": counts, "skipped": skipped_total}
    print(f"\n{a.course}: {tot_flags} flagged of {tot_takes} takes ({tot_words} words) {counts}" + (f"; {skipped_total} not cached" if skipped_total else ""))
    os.makedirs(REPORTS, exist_ok=True)
    out = a.out or os.path.join(REPORTS, f"script-{a.course}-ch{a.chapter}.json")
    json.dump(report, open(out, "w"), indent=1, ensure_ascii=False); print(f"report: {out}")

if __name__ == "__main__":
    main()
