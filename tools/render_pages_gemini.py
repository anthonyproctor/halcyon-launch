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
is re-rolled once (GEMINI_REROLL=0 to turn off). Report per run: ~/.cache/halcyon-gemini-tts/reports/<course>-<key>.json"""
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

# ---- synthesis: every distinct (voice, style, text) once, in parallel; cached on disk
jobs = {}
for pid, segs in spec["pages"].items():
    for seg in segs:
        if "t" in seg:
            v, st = cast(seg["v"]); jobs[(v, st, say(gem_text(seg)))] = None
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

def assemble(segs, page=None):
    parts, spans, t0, prev = [], [], 0.0, None
    def sil(s):
        nonlocal t0; a = np.zeros(int(SR * s), np.float32); parts.append(a); t0 += len(a) / SR
    for i, seg in enumerate(segs):
        if "pause" in seg: sil(seg["pause"]); prev = None; continue
        v, st = cast(seg["v"])
        if prev is not None and prev != v: sil(0.18)
        text = gem_text(seg); short = seg["v"] not in MENTORS and len(text.split()) <= 2
        if short: sil(0.12)
        a = jobs[(v, st, say(text))] if page is None else take_like(say(text), v, st, page, t0)
        if a is None: return None, None  # RETIME: this segment isn't in the cache (text changed since the render)
        spans.append({"i": i, "v": seg["v"], "voice": v, "style": st, "src": text, "sent": say(text), "s": t0, "e": t0 + len(a) / SR})
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

tmp = tempfile.mkdtemp(prefix="gemtts-")
pids = list(spec["pages"])
clips, timings, report = {}, {}, {}
todo = pids
for rnd in range(1 + (0 if os.environ.get("GEMINI_REROLL") == "0" else 1)):
    built = {pid: assemble(spec["pages"][pid]) for pid in todo}
    paths = {}
    for pid in todo: paths[pid] = f"{tmp}/{pid}.r{rnd}.wav"; to16(built[pid][0], paths[pid])
    heard = whisper(list(paths.values()))
    redo, bump = [], set()
    for pid in todo:
        audio, spans = built[pid]; groups, checks = align(audio, spans, heard[paths[pid]])
        # a flagged segment is first re-heard on its own (whisper on a long page can drop or misplace a short line);
        # if it checks out alone, its words are re-timed from that transcript and it is not re-rolled
        sus = [k for k, c in enumerate(checks) if c["bad"]]
        if sus:
            iso = {}
            for k in sus:
                sp = spans[k]; f = f"{tmp}/{pid}.r{rnd}.seg{k}.wav"; to16(audio[int(sp["s"] * SR):int(sp["e"] * SR)], f); iso[k] = f
            hi = whisper(list(iso.values()))
            for k, f in iso.items():
                sp = spans[k]; sh = [(w, a + sp["s"], b + sp["s"]) for (w, a, b) in hi[f]]
                g2, c2 = align(audio, [sp], sh); c2[0]["alone"] = True
                if not c2[0]["bad"] or c2[0]["cov"] > checks[k]["cov"]: groups[k], checks[k] = g2[0], c2[0]
        words = ctc_words(audio, spans) if ALIGN == "ctc" else sorted((w for g in groups for w in g), key=lambda x: x[1])
        clips[pid] = audio; timings[pid] = {"d": round(len(audio) / SR, 2), "w": words}
        report[pid] = {"round": rnd, "bad": [c for c in checks if c["bad"]], "low": [c for c in checks if not c["bad"] and c["cov"] < 0.85 and len(c["src"].split()) >= 4]}
        for c in report[pid]["bad"]:
            sp = next(s for s in spans if s["i"] == c["i"]); bump.add((sp["voice"], sp["style"], sp["sent"])); redo.append(pid)
    if not bump or rnd == 1 or os.environ.get("GEMINI_REROLL") == "0": break
    for (v, st, t) in bump: G.bump_take(t, v, st); jobs[(v, st, t)] = None
    run_jobs(list(bump)); todo = sorted(set(redo))

for pid in pids: enc(clips[pid], f"{outdir}/{pid}.mp3")
if os.environ.get("MERGE") and os.path.exists(f"{outdir}/timings.json"):  # MERGE=1: re-render some pages, keep the rest
    old = json.load(open(f"{outdir}/timings.json")); old.update(timings); timings = old
json.dump(timings, open(f"{outdir}/timings.json", "w"), separators=(",", ":"))
os.makedirs(os.path.join(G.CACHE, "reports"), exist_ok=True)
rp = os.path.join(G.CACHE, "reports", f"{course}-{spec.get('audio', 'audio').replace('/', '_')}-{key}.json")
json.dump({"course": course, "key": key, "model": G.MODEL, "pages": report}, open(rp, "w"), indent=1, ensure_ascii=False)
nbad = sum(len(r["bad"]) for r in report.values())
# whole-chapter episode: page clips in plan order; after each decision, a pause to pick
ep = []
for pid in spec["plan"]:
    ep.append(clips[pid]); ep.append(np.zeros(int(SR * (4 if (pid.startswith("s") and pid != "story") else 1.2)), np.float32))
whole = np.concatenate(ep)
dest = sys.argv[2] if len(sys.argv) > 2 else None
if dest: enc(whole, dest, title=f"The Halcyon Launch: {spec['title']}")
print(G.log_usage(f"{course} {key}") + f" flagged_segments={nbad} report={rp}", file=sys.stderr)
print("done", key, len(clips), "clips", round(len(whole) / SR / 60, 1), "min")
