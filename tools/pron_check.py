"""Pronunciation check (post-render): every line that says a listed term is checked against what whisper heard there, so a misread
name or acronym shows up without a full listen. Read only: it never renders, never calls Gemini and never writes audio.

usage: python3 tools/pron_check.py <course> <chapter|all|1-3> [--edition study|story|both] [--out report.json] [--learn] [--no-fallback]
  --learn        also print, per term, every distinct thing whisper heard for it (to grow the "ok" and "wrong" lists)
  --no-fallback  only use the renderer's own transcripts; lines without one are listed as unchecked instead of transcribed

The list: tools/pron/<course>.json
  {"course": "afoqt", "terms": [{"term": "Pruett", "ok": ["pruett", "pruitt"], "wrong": ["pruit"], "case": true, "note": "..."}]}
  term   as written in the chapter text. Matched as a whole word, possessive allowed ("Pruett's"); "pattern" (a regex) overrides
  ok     spoken forms that pass, as whisper writes them. Compared on letters and digits only, lower case, spaces dropped, so
         "K C one thirty five", "KC-135" and "kc135" are different forms (list each one whisper uses)
  wrong  known misreads; heard means MISREAD even when an ok form is also there
  word   true: an all caps name that is said as a word (HEARTH); whisper writing it as letters (H.E.R.T.H.) is a MISREAD
  case   false: match the term in any case (default true, so "AIM" the manual isn't "aim" the verb)
A line passes when an ok form is heard inside the line's window. When none is, the closest thing heard is shown with its
similarity: at or above CLOSE (0.8) it counts as heard (whisper spelled a name its own way); below, it's UNHEARD.

Where the transcripts come from (no new whisper run when they exist):
1. The renderer's own: render_pages_gemini.py writes every page it checks to a temp dir, /private/tmp/gemtts-*/<pid>.r<round>.wav,
   and whisper.cpp leaves <pid>.r<round>.wav.json beside it (word level, DTW times). The dirs aren't labelled by course or chapter,
   so a page is matched by page id and length (the wav's length equals timings.json "d" within 0.02 s; the dir that matches the
   most pages of the chapter wins). They live in /tmp, so a reboot or a tmp clean removes them.
2. Otherwise (when a page transcript skipped the line: under 40% of its words heard, or flagged it) the line's clip is cut from the page mp3
   and transcribed alone with the same whisper.cpp model, cached by clip md5 in ~/.cache/halcyon-gemini-tts/transcripts/.
Exit code 0 always."""
import argparse, collections, difflib, glob, hashlib, json, os, re, subprocess, sys, tempfile, wave
sys.dont_write_bytecode = True
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import pace_gate as PG

CACHE = os.path.expanduser(os.environ.get("GEMINI_TTS_CACHE", "~/.cache/halcyon-gemini-tts"))
TDIR = os.path.join(CACHE, "transcripts")
WHISPER_MODEL = os.path.expanduser(os.environ.get("WHISPER_MODEL", "~/.cache/whisper/ggml-small.en.bin"))
TMP_GLOB = os.environ.get("GEMTTS_TMP_GLOB", "/private/tmp/gemtts-*")
CLOSE = 0.8          # closest heard form at least this similar to an ok form: heard, spelled whisper's way
PAD = 0.15           # seconds either side of a line taken from a page transcript (0.4 pulled the next line's words in)
SKIPPED = 0.4        # a page transcript that has under this share of the line's words skipped it: the line is re-heard alone

def nrm(s): return re.sub(r"[^a-z0-9]", "", s.lower())

# ---- renderer transcripts
def parse_whisper_json(p):
    """whisper.cpp -ojf (-ml 1 -sow -dtw) json -> [(word, start, end)], as render_pages_gemini.whisper() reads it"""
    d = json.load(open(p)); ws = []; prev = 0.0
    for s in d.get("transcription", []):
        toks = [t for t in s.get("tokens", []) if not t["text"].startswith("[")]
        t = "".join(x["text"] for x in toks).strip()
        ends = [x["t_dtw"] / 100 for x in toks if x.get("t_dtw", -1) >= 0]
        if toks and ends:
            if t and not re.fullmatch(r"[\W_]+", t): ws.append((t, prev, max(ends)))
            prev = max(prev, max(ends))
        elif s.get("text", "").strip() and "offsets" in s:
            ws.append((s["text"].strip(), s["offsets"]["from"] / 1000, s["offsets"]["to"] / 1000))
    return ws

_IDX = {}
def tmp_index():
    """{pid: [(dir, round, seconds, json path)]} over every renderer temp dir"""
    if "i" in _IDX: return _IDX["i"]
    idx = {}
    for d in glob.glob(TMP_GLOB):
        try: names = os.listdir(d)
        except OSError: continue
        for f in names:
            m = re.fullmatch(r"(.+)\.r(\d+)\.wav", f)
            if not m or f + ".json" not in names: continue
            try:
                w = wave.open(os.path.join(d, f)); dur = w.getnframes() / w.getframerate(); w.close()
            except Exception: continue
            idx.setdefault(m.group(1), []).append((d, int(m.group(2)), dur, os.path.join(d, f + ".json")))
    _IDX["i"] = idx; return idx

def page_transcripts(T):
    """timings.json of one chapter key -> {pid: json path} for the pages a renderer temp dir has at the same length"""
    idx = tmp_index(); votes = collections.Counter(); cand = {}
    for pid, v in T.items():
        for d, r, dur, jp in idx.get(pid, []):
            if abs(dur - v["d"]) <= 0.02: cand.setdefault(pid, []).append((d, r, jp)); votes[d] += 1
    out = {}
    for pid, cs in cand.items():
        cs.sort(key=lambda x: (votes[x[0]], x[1]), reverse=True); out[pid] = cs[0][2]
    return out

# ---- own transcription of a line clip
def decode(mp3, s, e):
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-ss", f"{max(0, s):.3f}", "-to", f"{e:.3f}", "-i", mp3, "-f", "s16le", "-ac", "1", "-ar", "16000", "-"],
                         capture_output=True, check=True).stdout
    return raw

def transcribe_clips(clips):
    """[(key, pcm16 bytes)] -> {key: heard text}, cached by md5"""
    os.makedirs(TDIR, exist_ok=True); out, todo = {}, []
    for k, pcm in clips:
        h = hashlib.md5(pcm).hexdigest(); p = os.path.join(TDIR, h + ".txt")
        if os.path.exists(p): out[k] = open(p).read()
        else: todo.append((k, h, pcm))
    tmp = tempfile.mkdtemp(prefix="pron-")
    for i in range(0, len(todo), 24):
        chunk = todo[i:i + 24]; files = []
        for k, h, pcm in chunk:
            f = os.path.join(tmp, h + ".wav"); w = wave.open(f, "wb"); w.setnchannels(1); w.setsampwidth(2); w.setframerate(16000)
            w.writeframes(pcm + b"\0" * 3200); w.close(); files.append(f)
        args = ["whisper-cli", "-m", WHISPER_MODEL, "-np", "-t", "8", "-otxt"]
        try: subprocess.run(args + [x for f in files for x in ("-f", f)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        except subprocess.CalledProcessError:
            for f in files:
                try: subprocess.run(args + ["-f", f], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
                except subprocess.CalledProcessError: open(f + ".txt", "w").write("")
        for (k, h, _), f in zip(chunk, files):
            t = open(f + ".txt").read().strip() if os.path.exists(f + ".txt") else ""
            open(os.path.join(TDIR, h + ".txt"), "w").write(t); out[k] = t
    return out

# ---- terms
def load_terms(course):
    p = os.path.join(HERE, "pron", f"{course}.json")
    if not os.path.exists(p): return None
    J = json.load(open(p)); terms = []
    for t in J["terms"]:
        pat = t.get("pattern") or (r"(?<![\w-])" + re.escape(t["term"]) + r"(?:['’]s)?(?![\w-])")
        terms.append({**t, "re": re.compile(pat, 0 if t.get("case", True) else re.I), "okn": [nrm(x) for x in t.get("ok", [])] or [nrm(t["term"])],
                      "wrongn": [nrm(x) for x in t.get("wrong", [])]})
    return terms

def closest(heard_words, forms):
    """best similarity of any run of 1 to 4 heard words (joined) to any ok form -> (ratio, heard text)"""
    best = (0.0, "")
    for i in range(len(heard_words)):
        for n in range(1, 5):
            if i + n > len(heard_words): break
            s = " ".join(heard_words[i:i + n]); sn = nrm(s)
            if not sn: continue
            for f in forms:
                r = difflib.SequenceMatcher(None, sn, f).ratio()
                if r > best[0]: best = (r, s)
    return best

def judge(term, heard, line):
    """-> (verdict, why, similarity, heard form). A wrong form counts only when whisper heard it more often than the line itself says
    it ("from" in "a man from Halo" is not a misread of FRO) and the term isn't all there in its ok forms."""
    hw = heard.split(); hn = nrm(heard); hws = [nrm(x) for x in hw]; lws = [nrm(x) for x in line.split()]
    need = len(term["re"].findall(line)) or 1
    alt = "|".join(re.escape(f) for f in sorted({f for f in term["okn"] if f}, key=len, reverse=True))
    nok = len(re.findall(alt, hn)) if alt else 0  # longest form first, no overlaps: "biscuits" counts once, not as biscuit + biscuits
    wrong = [w for w in term["wrongn"] if w and hws.count(w) > lws.count(w)] if " " not in "".join(term["wrongn"]) else []
    wrong += [w for w in term["wrongn"] if w and len(w) > 5 and w in hn and w not in nrm(line) and w not in wrong and not any(w in f for f in term["okn"])]
    if term.get("word"):  # an all caps name said as a word: whisper writing it as letters ("H.E.R.T.H.'s", "S-E-M-P") means it was spelled out
        sp = re.search(r"\b(?:[A-Za-z][.-]){2,}[A-Za-z]?", heard)
        if sp and len(nrm(sp.group(0))) >= 3 and difflib.SequenceMatcher(None, nrm(sp.group(0)).rstrip("s"), nrm(term["term"])).ratio() >= 0.7: return "MISREAD", f"spelled out: \"{sp.group(0)}\"", 0.0, sp.group(0)
    if wrong and nok < need: return "MISREAD", f"heard \"{wrong[0]}\"", 0.0, wrong[0]
    if nok >= 1: return "ok", "", 1.0, None
    r, s = closest(hw, term["okn"])
    if r >= CLOSE: return "ok", f"close: \"{s}\" ({r:.2f})", r, s
    return "UNHEARD", f"closest heard \"{s}\" ({r:.2f})", r, s

def main():
    ap = argparse.ArgumentParser(description="Pronunciation check against the renderer's whisper transcripts.")
    ap.add_argument("course"); ap.add_argument("chapter"); ap.add_argument("--edition", default="study", choices=["study", "story", "both"])
    ap.add_argument("--out"); ap.add_argument("--learn", action="store_true"); ap.add_argument("--no-fallback", action="store_true")
    a = ap.parse_args()
    terms = load_terms(a.course)
    if terms is None: print(f"no list at tools/pron/{a.course}.json"); return
    chs = PG.parse_chapters(a.chapter, a.course); eds = ["study", "story"] if a.edition == "both" else [a.edition]
    report = {"course": a.course, "chapters": chs, "editions": eds, "close": CLOSE, "terms": [t["term"] for t in terms], "flags": [], "counts": {}}
    learn = collections.defaultdict(collections.Counter); counts = collections.Counter()
    for ed in eds:
        story = ed == "story"
        for ch in chs:
            key = f"f{ch}{'s' if story else ''}"
            tf = os.path.join(PG.audio_dir(a.course), "pages", key, "timings.json")
            if not os.path.exists(tf): print(f"{key}: no timings, skipped"); continue
            T = json.load(open(tf)); c = PG.load_chapter(a.course, ch, story, use_audio=False)
            if c is None: continue
            pt = page_transcripts(T); hits, seen = [], set()
            for pid, lines in c["pages"].items():
                for L in lines:
                    for t in terms:
                        if not t["re"].search(L["text"]): continue
                        k = (t["term"], L["who"], L["text"])
                        if k in seen: continue  # the same line on a variant page is the same take
                        seen.add(k); hits.append((pid, L, t))
            heard, need = {}, []
            page_words = {pid: parse_whisper_json(jp) for pid, jp in pt.items() if pid in {h[0] for h in hits}}
            for pid, L, t in hits:
                ws = page_words.get(pid)
                if ws is not None:
                    win = [w for w, s, e in ws if e >= L["start"] - PAD and s <= L["end"] + PAD]
                    if len(win) >= SKIPPED * L["words"]: heard[(pid, L["i"])] = (" ".join(win), "renderer"); continue
                if not a.no_fallback: need.append((pid, L))
            if need:
                clips = []
                for pid, L in need:
                    clips.append(((pid, L["i"]), decode(os.path.join(PG.audio_dir(a.course), "pages", key, pid + ".mp3"), L["start"] - 0.15, L["end"] + 0.15)))
                for k, txt in transcribe_clips(clips).items(): heard[k] = (txt, "own")
            # a line flagged on a page transcript is re-heard alone first (whisper on a whole page drifts and skips stretches that
            # are there; render_pages_gemini.check_page does the same), and the alone verdict stands
            if not a.no_fallback:
                again = [(pid, L) for pid, L, t in hits if heard.get((pid, L["i"]), ("", ""))[1] == "renderer" and judge(t, heard[(pid, L["i"])][0], L["text"])[0] != "ok"]
                if again:
                    clips = [((pid, L["i"]), decode(os.path.join(PG.audio_dir(a.course), "pages", key, pid + ".mp3"), L["start"] - 0.15, L["end"] + 0.15)) for pid, L in again]
                    for k, txt in transcribe_clips(clips).items(): heard[k] = (txt, "own, re-heard alone")
            nflag = 0
            for pid, L, t in hits:
                h = heard.get((pid, L["i"]))
                if h is None: counts["unchecked"] += 1; continue
                verdict, why, r, s = judge(t, h[0], L["text"]); counts[verdict] += 1; counts["checked"] += 1
                if a.learn: learn[t["term"]][(s or "(ok form)") if verdict != "ok" or s else "(ok form)"] += 1
                if verdict != "ok":
                    nflag += 1
                    report["flags"].append({"chapter": ch, "key": key, "page": pid, "who": L["who"], "term": t["term"], "verdict": verdict, "why": why,
                                            "similarity": round(r, 2), "line": L["text"], "heard": h[0], "source": h[1], "page_time": round(L["start"], 2)})
            print(f"{key}: {len(hits)} term lines, {sum(1 for p, L, t in hits if (p, L['i']) in heard)} checked "
                  f"({sum(1 for v in heard.values() if v[1] == 'renderer')} from renderer transcripts), {nflag} flagged")
    report["counts"] = dict(counts)
    for f in report["flags"]:
        print(f"  {f['verdict']} {f['key']} {f['page']} {f['who']} \"{f['term']}\": {f['why']}\n     line:  {f['line'][:110]}\n     heard: {f['heard'][:110]}")
    if a.learn:
        print("\nheard forms per term (for the ok and wrong lists):")
        for term, cnt in learn.items(): print(f"  {term}: " + ", ".join(f"{k} x{v}" for k, v in cnt.most_common(12)))
    rate = counts["UNHEARD"] + counts["MISREAD"]
    print(f"\n{a.course}: {counts['checked']} term lines checked, {counts['unchecked']} unchecked, {counts['MISREAD']} MISREAD, {counts['UNHEARD']} UNHEARD"
          + (f" ({rate / counts['checked'] * 100:.1f}%)" if counts["checked"] else ""))
    out = a.out or os.path.join(CACHE, "reports", f"pron-{a.course}-ch{a.chapter}.json")
    json.dump(report, open(out, "w"), indent=1, ensure_ascii=False); print(f"report: {out}")

if __name__ == "__main__":
    main()
