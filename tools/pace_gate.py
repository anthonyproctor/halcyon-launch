"""Pace gate for the Gemini narration: catches a line read too quick or too slow for the scene around it, which the voice gate
(voice similarity, pitch) and the whisper coverage check can't hear. Read only: it never renders, never calls Gemini, and never
writes audio. It reads the page word timings the renderer already wrote and the page specs from tools/pages.mjs.

Why it exists: PMP v2 chapter 3, page open. Wendell says four slow, deliberate lines, then Sam's "All day." comes back in about
0.5 s, where the room's pace says it should take about 1 s. It was heard as rushed by ear; every gate passed it.

usage: python3 tools/pace_gate.py <course> <chapter|all|1-3> [--edition study|story|both] [--out report.json] [--book 1-4]
  course   pmp (the PMP v2 audio under audio/v2), or a course id under courses/ (pilot, cisa, ...)
  chapter  one number, a range like 1-3, or all (every chapter that has page timings)
  --book   chapters used for each character's book baseline (default: every chapter with timings). Leave out chapters that
           are rendering right now, their timings may be half written.
  --out    JSON report (default ~/.cache/halcyon-gemini-tts/reports/pace-<course>-ch<chapter>.json)
Runs on python3 or .ttsvenv/bin/python, and calls node tools/pages.mjs once per chapter and edition. numpy and ffmpeg are
used to read the page mp3s of the judged chapters (a few seconds of CPU per chapter); without them it falls back to the word
timings alone, which run short on short lines. Exit code 0 always: it reports,
it doesn't block.

How a line is measured
- Lines: every said segment of a page spec (a span with its data-who, or a narrator run between them), in page order. The
  renderer writes timings.json as the source words of each segment in order, so the page's words are cut back into lines by
  word count. A page whose timing words don't match the current text (text edited since the render) is skipped and listed.
- Pace: spoken words per second over the spoken part only, so the silence the renderer puts around a line doesn't count.
  Digits and short capitals count the way they're read (2034 = three words, AM = two). The spoken part starts at the first
  word and ends at the last, pushed out to the voiced audio of the page mp3 when it's there (refine_with_audio below), and a
  pause inside a line counts up to GAP_CAP_S. Syllables per second is in the report too (PACE_UNIT switches what's judged).
- Not judged: chapter and decision headings, lesson section headings, lines that are mostly codes (METAR, TAF, record
  numbers), and one word interjections ("Hm.", "Yeah."). They're quick or slow on purpose.
- Character baseline: the median pace of that character's lines of LONG_MIN_WORDS or more words across the book.
- Scene baseline: the median pace of the SCENE_K nearest lines of LONG_MIN_WORDS or more words on the same page, any speaker.
- Lines repeated across page variants (_alt, _v1, _fixed, option pages share audio from the cache) are judged once, on the
  first page that has them, plan pages first.

Flag rules (thresholds below)
- Lines of LONG_MIN_WORDS+ words: fast when the pace is at least FAST_X times BOTH baselines, slow when it is at most 1/SLOW_X
  of BOTH (MID_X for lines of up to MID_MAX_WORDS words). Both, so a character who is just a quick talker, or a page that is
  just brisk, doesn't flag.
- Short lines (1 to 3 words): pace over a word or two is noise, so these are judged on duration. Expected duration is the
  line's words at the pace of its SHORT_SCENE_K nearest long lines, plus SHORT_FLOOR_S. Fast when the line takes SHORT_FAST_X
  times less than that and at least SHORT_MIN_GAP_S less in absolute terms; slow when it takes SHORT_SLOW_X times more and
  SHORT_MIN_GAP_S more. Narrator short lines ("he said.", "Quinn said.") are skipped: attribution tags are meant to be quick.

Integration (a plan, not applied: render_pages_gemini.py is not touched by this file)
1. Where it plugs in. render_pages_gemini.py's check loop ("for rnd in range(ROUNDS)", around line 475) builds every page in
   play, runs whisper (check_page) and the voice gate (VG.judge) and collects `bump` (request keys to re-roll) and `why`. A pace
   pass goes right after the voice gate block, before "if not bump or rnd == ROUNDS - 1: break": turn each built page's spans
   and words into lines with lines_from_words(spec["pages"][pid], timings[pid]["w"], pid) (the spans already carry s, e and
   src, so word counts line up by construction), compute the character baseline from the book (the lines of this render plus a
   small per course cache of character medians, like voice_gate's Book) and run judge(). Each flagged line maps back to its
   span's request key (sp["voice"], sp["style"], sp["req"]), goes into `bump` with why "pace", and is written to
   report[pid]["pace_flags"] and to gate["pace_flags_first"/"pace_flags_final"]. GEMINI_REROLL_SKIP speakers are reported
   only, same as the voice gate. A PACE_GATE=0 switch turns it off.
2. Re-roll with a hint. A flagged untoned line's re-roll adds a pace hint through the tone mechanism that already exists: a
   per request override (say PACE_HINT[rk] = "Unhurried, matching the room." for fast, "Keep it moving, natural pace." for
   slow) that cast_seg() passes to tone_style() as the tone when the segment has none, or appends to the segment's own tone
   when it has one ("Slow, tired, a little rueful. Unhurried."). That changes the style, so the request key changes: the
   hinted take is a new cache entry, the original take is never overwritten, and HIST needs the hinted key mapped back to the
   original line so keep best can compare the two. Hint only on the re-roll, never on the first take, so lines that pass keep
   the exact request and cache entry they always had. A same speaker run (casting "run": true) re-rolls as a whole; the hint
   goes on the flagged line only, which splits it out like a toned line already is.
3. Keep best. HIST holds [whisper ok, coverage ok, voice sim, coverage share] per take. Add pace as one more score, the
   distance from the scene pace: abs(log(pace / scene)) for long lines, abs(log(duration / expected)) for short ones. The best
   take sorts on (whisper ok, coverage ok, pace ok, round(sim, 2), -pace distance, coverage share): a take that reads right
   and sounds like the character beats one that only paces right, and pace breaks ties among takes that sound alike. pace ok
   is True when the line isn't flagged.
4. Cost: pace needs only the word timings the render already computes, so it adds no whisper or model time."""
import argparse, json, math, os, re, statistics, subprocess, sys, tempfile

sys.dont_write_bytecode = True
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPORTS = os.path.expanduser("~/.cache/halcyon-gemini-tts/reports")

# ---- thresholds. Tuned 2026-10-13 on PMP v2 ch1 to ch3 and the pilot ch1 to ch4 (study edition): they catch Sam's "All day."
# on ch3 open and keep the rest to a short list per chapter.
LONG_MIN_WORDS = 4          # a line this long or longer is judged on pace; shorter lines are judged on duration
SCENE_K = 6                 # nearest long lines on the page that make the scene baseline for a long line
SHORT_SCENE_K = 3           # for a short line the room right around it counts: its 3 nearest long lines
PACE_UNIT = "words"         # "words" or "syllables". Words won on the tuning set: by syllables, a slow scene full of long words
                            # predicts a quick "All day.", and the rushed line ranked 37th of 101 short lines instead of 17th
SCENE_MIN = 3               # fewer long lines than this on the page: no scene baseline, the line isn't judged
CHAR_MIN = 5                # a character needs this many long lines in the book for a character baseline
FAST_X = 1.5                # long line: flagged fast at FAST_X times both baselines or more
SLOW_X = 1.5                # long line: flagged slow at 1/SLOW_X of both baselines or less
MID_MAX_WORDS = 7           # lines of LONG_MIN_WORDS to MID_MAX_WORDS words last a second or two, and quick questions ("Did she
MID_X = 1.75                # ask you?") are said quicker than running speech: they need MID_X (both ways) instead of FAST_X/SLOW_X
SHORT_FLOOR_S = 0.3         # expected duration of a short line = its words at the scene pace plus this: a reply of a word or two
                            # is said slower than running speech (the last word of a sentence is drawn out), so the scene pace
                            # alone would expect it too short
SHORT_FAST_X = 1.8          # short line: flagged fast when expected duration / actual duration is at least this. 1.8 leaves the
                            # known rushed "All day." (2.1) a clear margin; 2.0 to 1.8 added 3 flags over 7 chapters
SHORT_SLOW_X = 2.0          # short line: flagged slow when actual / expected is at least this
SHORT_MIN_GAP_S = 0.25      # and the difference is at least this many seconds either way (a clip shorter by 0.1 s is not heard)
CODE_SHARE = 0.2            # a line where more than this share of the words are codes (METAR groups, part numbers) isn't judged
GAP_CAP_S = 0.8            # a pause inside a line counts up to this long (a sentence break); longer silence inside a line is
                            # left out of its duration, so "Right. Nobody. Turn." is judged on how the words are said
# a data-tone cue that asks for the pace: a fast flag on "Cold anger, quick and hard." is the cue working, so it's dropped; a
# fast flag on "Slow, tired, a little rueful." is the cue failing, and the why says so
TONE_FAST = re.compile(r"\b(?:quick|quickly|fast|clipped|rushed|hurried|brisk|rapid|urgent|blurt|snap)", re.I)
TONE_SLOW = re.compile(r"\b(?:slow|slowly|unhurried|deliberate|halting|measured|drawn|tired|weary|heavy|hesitant)", re.I)
SHORT_SKIP = {"narrator"}   # speakers whose short lines are not judged (attribution tags)

# ---- syllables (an estimate is enough: the same counter runs on every line, so the ratios are fair)
ONES = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split()
TENS = "_ _ twenty thirty forty fifty sixty seventy eighty ninety".split()
def n2w(n):
    if n < 20: return [ONES[n]]
    if n < 100: return [TENS[n // 10]] + ([ONES[n % 10]] if n % 10 else [])
    if n < 1000: return [ONES[n // 100], "hundred"] + (n2w(n % 100) if n % 100 else [])
    if 1100 <= n < 2100 and n % 100 and n // 100 != 20: return n2w(n // 100) + (n2w(n % 100) if n % 100 >= 10 else ["oh"] + n2w(n % 100))
    if n < 1000000: return n2w(n // 1000) + ["thousand"] + (n2w(n % 1000) if n % 1000 else [])
    return list(str(n))
LETTER_SYL = {"w": 3}
def syl_word(w):
    w = w.lower()
    if not w: return 0
    v = re.findall(r"[aeiouy]+", w)
    n = len(v)
    if w.endswith("e") and not w.endswith(("le", "ee", "ye")) and n > 1: n -= 1
    if w.endswith("ed") and not w.endswith(("ted", "ded")) and n > 1: n -= 1
    return max(1, n)
def syllables(token):
    n = 0
    for part in re.split(r"[-/]+", token):
        for run in re.findall(r"[A-Za-z']+|\d+", part):
            if run.isdigit():
                n += sum(syl_word(x) for x in n2w(int(run))) if len(run) < 7 else len(run)
            elif run.isupper() and 1 < len(run) <= 4 and run not in ("I",):
                n += sum(LETTER_SYL.get(c.lower(), 1) for c in run)  # AM, AI, TAF: read as letters
            else:
                n += syl_word(run.replace("'", ""))
    return n

def spoken(token):
    """how many words a token is when read: 2034 -> twenty thirty four (3), AM -> A M (2), 5:30 -> five thirty (2)"""
    n = len(re.findall(r"\d\.\d", token))  # 5.0 -> five point zero
    for part in re.split(r"[-/:]+", token):
        for run in re.findall(r"[A-Za-z']+|\d+", part):
            if run.isdigit(): n += len(n2w(int(run))) if len(run) < 7 else len(run)
            elif run.isupper() and 1 < len(run) <= 4: n += len(run)
            else: n += 1
    return max(n, 1)
CODE = re.compile(r"^(?=.*\d)(?=.*[A-Za-z])|[/\\+]|^[A-Z0-9]{5,}$")  # 31016G27KT, 1412/1512, 18000DEN, R-0388: weather and record codes
STRUCT = re.compile(r"^(?:Chapter|Decision) [a-z]+\.|^Your options\.$|^How the exam asks it\.", re.I)
INTERJ = {"hm", "hmm", "huh", "yeah", "yes", "no", "okay", "ok", "uh", "um", "ah", "oh", "right", "mm", "yep", "nope", "sure"}
def skip_reason(L):
    """lines the gate doesn't judge, and why: read as headings or codes, where words per second means nothing"""
    toks = src_words(L["text"])
    if STRUCT.search(L["text"].strip()): return "chapter or decision heading"
    if L.get("heading"): return "lesson heading"
    if sum(1 for t in toks if CODE.search(t.strip(".,;:()"))) > CODE_SHARE * len(toks): return "codes (weather, records)"
    if len(toks) == 1 and norm(toks[0]) in INTERJ: return "one word interjection"
    return None

def norm(w): return re.sub(r"[^a-z0-9]", "", w.lower())
def src_words(text): return [w for w in text.split() if re.search(r"\w", w)]  # = render_pages_gemini.py ctc_words()

# ---- page spec + timings -> lines
def lines_from_words(segs, words, pid):
    """segs: a page's segments from tools/pages.mjs; words: timings[pid]["w"] -> (lines, None) or (None, why it didn't match)"""
    out, k, bad, tot = [], 0, 0, 0
    for i, seg in enumerate(segs):
        if "t" not in seg: continue
        src = src_words(seg["t"])
        if not src: continue
        ws = words[k:k + len(src)]; k += len(src)
        if len(ws) < len(src): return None, "fewer timing words than text words"
        for a, b in zip(src, ws):
            tot += 1; bad += norm(re.sub(r"^[^\w$]+|[^\w%]+$", "", a) or a) != norm(b[0])
        sym = sum(1 for t in seg["t"].split() if re.fullmatch(r"[+=×÷/<>≈−]", t))  # said aloud (plus, equals, over) but not in the timings
        gaps = sum(max(0.0, ws[j + 1][1] - ws[j][2] - GAP_CAP_S) for j in range(len(ws) - 1))
        flanked = (i == 0 or "pause" in segs[i - 1]) and (i + 1 == len(segs) or "pause" in segs[i + 1])
        out.append({"pid": pid, "i": i, "who": seg["v"], "text": seg["t"], "tone": seg.get("tone"), "words": len(src),
                    "spoken": sum(spoken(w) for w in src) + sym, "syl": sum(syllables(w) for w in src), "start": ws[0][1], "end": ws[-1][2],
                    "pauses": round(gaps, 3), "heading": pid == "lesson" and flanked and len(src) <= 8})
    if k != len(words): return None, f"{len(words)} timing words, {k} text words"
    if tot and bad / tot > 0.03: return None, f"{bad} of {tot} words differ from the text"
    return finish(out), None

# ---- the spoken part from the audio. CTC word ends come early on short words (a one word "No." can read 0.12 s), which made
# short lines look quicker than they are. When the page mp3 is there (and numpy and ffmpeg), each line's start and end are pushed
# out to the voiced audio around its first and last word: an energy envelope in 10 ms frames, voiced above the renderer's own
# threshold (render_pages_gemini.py align()), followed until TRIM_GAP_S of silence or the neighbouring line. Read only.
TRIM_GAP_S = 0.15
def refine_with_audio(lines, mp3):
    try:
        import numpy as np
        raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", mp3, "-f", "s16le", "-ac", "1", "-ar", "16000", "-"], capture_output=True, check=True).stdout
    except Exception:
        return False
    a = np.frombuffer(raw, "<i2").astype(np.float32) / 32768; hop = 160; H = hop / 16000; n = len(a) // hop
    if n < 2: return False
    env = np.sqrt((a[:n * hop].reshape(n, hop) ** 2).mean(1) + 1e-12); V = env > max(0.006, float(np.percentile(env, 90)) * 0.06)
    gap = int(TRIM_GAP_S / H); ctc = [(L["start"], L["end"]) for L in lines]
    for i, L in enumerate(lines):
        lo = int(ctc[i - 1][1] / H) if i else 0; hi = min(n, int(ctc[i + 1][0] / H)) if i + 1 < len(lines) else n
        k = last = min(int(ctc[i][1] / H), n - 1); sil = 0
        while k < hi - 1 and sil < gap:
            k += 1
            if V[k]: last, sil = k, 0
            else: sil += 1
        k = first = min(int(ctc[i][0] / H), n - 1); sil = 0
        while k > lo and sil < gap:
            k -= 1
            if V[k]: first, sil = k, 0
            else: sil += 1
        L["start"], L["end"] = round(min(first * H, ctc[i][0]), 3), round(max((last + 1) * H, ctc[i][1]), 3)
    finish(lines)
    return True

def units(L): return L["syl"] if PACE_UNIT == "syllables" else L["spoken"]
def finish(lines):
    for n, L in enumerate(lines):
        L["dur"] = round(max(L["end"] - L["start"] - L.get("pauses", 0), 0.02), 3)
        L["pace"] = round(units(L) / L["dur"], 3); L["wps"] = round(L["spoken"] / L["dur"], 3); L["sps"] = round(L["syl"] / L["dur"], 3)
        L["gap_before"] = round(L["start"] - lines[n - 1]["end"], 2) if n else None
    return lines

def char_baselines(lines):
    by = {}
    for L in lines:
        if L["words"] >= LONG_MIN_WORDS and not skip_reason(L): by.setdefault(L["who"], []).append(L["pace"])
    return {w: round(statistics.median(p), 3) for w, p in by.items() if len(p) >= CHAR_MIN}

def scene_baseline(page_lines, n, k=SCENE_K):
    longs = [(abs(m - n), L["pace"]) for m, L in enumerate(page_lines) if m != n and L["words"] >= LONG_MIN_WORDS and not skip_reason(L)]
    if len(longs) < SCENE_MIN: return None
    longs.sort(key=lambda x: x[0])
    return round(statistics.median(p for _, p in longs[:k]), 3)

def judge(pages, char_base):
    """pages: {pid: [line, ...]} in page order; char_base: {who: median pace}. Adds L["scene"], L["char"] and returns the
    flagged lines, each with "flag" (fast/slow) and "why"."""
    flagged = []
    for pid, lines in pages.items():
        for n, L in enumerate(lines):
            short = L["words"] < LONG_MIN_WORDS
            if skip_reason(L): continue
            sc = scene_baseline(lines, n, SHORT_SCENE_K if short else SCENE_K); ch = char_base.get(L["who"])
            L["scene"], L["char"] = sc, ch
            if sc is None: continue
            if not short:
                if ch is None: continue
                rs, rc = L["pace"] / sc, L["pace"] / ch
                L["vs_scene"], L["vs_char"] = round(rs, 2), round(rc, 2)
                fx, sx = (MID_X, MID_X) if L["words"] <= MID_MAX_WORDS else (FAST_X, SLOW_X)
                if rs >= fx and rc >= fx:
                    L["flag"] = "fast"; L["why"] = f"{rs:.2f}x the scene and {rc:.2f}x {L['who']}'s usual pace"
                elif rs <= 1 / sx and rc <= 1 / sx:
                    L["flag"] = "slow"; L["why"] = f"{rs:.2f}x the scene and {rc:.2f}x {L['who']}'s usual pace"
            else:
                if L["who"] in SHORT_SKIP: continue
                exp = units(L) / sc + SHORT_FLOOR_S; d = L["dur"]
                L["expected"] = round(exp, 2)
                if exp / d >= SHORT_FAST_X and exp - d >= SHORT_MIN_GAP_S:
                    L["flag"] = "fast"; L["why"] = f"short line took {d:.2f} s, the scene pace says about {exp:.2f} s ({exp / d:.1f}x too quick)"
                elif d / exp >= SHORT_SLOW_X and d - exp >= SHORT_MIN_GAP_S:
                    L["flag"] = "slow"; L["why"] = f"short line took {d:.2f} s, the scene pace says about {exp:.2f} s ({d / exp:.1f}x too slow)"
            if L.get("flag"):
                tone = L.get("tone") or ""
                want = "fast" if TONE_FAST.search(tone) else "slow" if TONE_SLOW.search(tone) else None
                if want == L["flag"]: L["why"] = f"{L['flag']} but its tone cue asks for it: {tone}"; L["flag"] = None; continue
                if want: L["why"] += f", against its tone cue \"{tone}\""
                flagged.append(L)
    return flagged

def severity(L):
    if L["words"] >= LONG_MIN_WORDS: return abs(math.log(min(L["vs_scene"], L["vs_char"]) if L["flag"] == "fast" else max(L["vs_scene"], L["vs_char"])))
    return abs(math.log(L["dur"] / L["expected"]))

# ---- loading a course
def audio_dir(course): return os.path.join(ROOT, "audio/v2") if course in ("pmp", "pmp-v2", "v2") else os.path.join(ROOT, "courses", course, "audio")
def spec_for(course, ch, story):
    fd, path = tempfile.mkstemp(suffix=".json"); os.close(fd)
    cmd = ["node", "tools/pages.mjs", "full", str(ch), path] + (["--v2"] if course in ("pmp", "pmp-v2", "v2") else ["--course", course]) + (["--story"] if story else [])
    try:
        subprocess.run(cmd, cwd=ROOT, check=True, capture_output=True)
        return json.load(open(path))
    finally:
        os.unlink(path)
def chapters_with_timings(course):
    d = os.path.join(audio_dir(course), "pages")
    return sorted(int(m.group(1)) for x in os.listdir(d) if (m := re.fullmatch(r"f(\d+)", x)) and os.path.exists(os.path.join(d, x, "timings.json")))
def parse_chapters(arg, course):
    if arg == "all": return chapters_with_timings(course)
    if "-" in arg: a, b = map(int, arg.split("-")); return list(range(a, b + 1))
    return [int(x) for x in arg.split(",")]

_sting = {}
def sting_open():
    if "s" not in _sting:
        try: _sting["s"] = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0",
                                                          os.path.join(ROOT, "audio/sting-open.mp3")]))
        except Exception: _sting["s"] = None
    return _sting["s"]

def load_chapter(course, ch, story, use_audio=True):
    """-> {"pages": {pid: lines}, "skipped": [...], "offset": {pid: seconds into the chapter mp3}} or None (no timings)"""
    key = f"f{ch}{'s' if story else ''}"
    tf = os.path.join(audio_dir(course), "pages", key, "timings.json")
    if not os.path.exists(tf): return None
    try: T = json.load(open(tf))
    except ValueError: return None  # being written right now
    spec = spec_for(course, ch, story)
    order = [p for p in spec["plan"] if p in T] + [p for p in spec["pages"] if p in T and p not in spec["plan"]]
    pages, skipped, seen = {}, [], set()
    for pid in order:
        if pid not in spec["pages"]: skipped.append({"pid": pid, "why": "page not in the current spec"}); continue
        lines, why = lines_from_words(spec["pages"][pid], T[pid]["w"], pid)
        if lines is None: skipped.append({"pid": pid, "why": why}); continue
        mp3 = os.path.join(audio_dir(course), "pages", key, pid + ".mp3")
        if use_audio and os.path.exists(mp3): refine_with_audio(lines, mp3)
        for L in lines:  # a line repeated on a variant page is the same take; judge it once, but keep it in the page for the scene
            k = (L["who"], L["text"], round(L["dur"], 2)); L["dup"] = k in seen; seen.add(k)
        pages[pid] = lines
    offset, s0 = {}, sting_open()
    if s0 is not None and all(p in T for p in spec["plan"]):
        off = s0
        for p in spec["plan"]:
            offset[p] = round(off, 2); off += T[p]["d"] + (4 if p.startswith("s") and p != "story" else 1.2)
    return {"pages": pages, "skipped": skipped, "offset": offset}

def mmss(t): return f"{int(t // 60)}:{t % 60:04.1f}"

def main():
    ap = argparse.ArgumentParser(description="Pace gate: lines read too quick or too slow for their scene.")
    ap.add_argument("course"); ap.add_argument("chapter")
    ap.add_argument("--edition", default="study", choices=["study", "story", "both"])
    ap.add_argument("--out"); ap.add_argument("--book", help="chapters for the character baseline, like 1-4 (default: all with timings)")
    a = ap.parse_args()
    chs = parse_chapters(a.chapter, a.course)
    book = parse_chapters(a.book, a.course) if a.book else chapters_with_timings(a.course)
    eds = ["study", "story"] if a.edition == "both" else [a.edition]
    report = {"course": a.course, "chapters": chs, "book": book, "editions": eds,
              "thresholds": {k: v for k, v in globals().items() if k.isupper() and isinstance(v, (int, float))}, "chapters_out": {}}
    for ed in eds:
        story = ed == "story"; loaded = {}
        for ch in sorted(set(chs) | set(book)):
            c = load_chapter(a.course, ch, story, use_audio=ch in chs)  # baseline only chapters: word timings are enough for long lines
            if c: loaded[ch] = c
        base = char_baselines([L for ch in book if ch in loaded for ls in loaded[ch]["pages"].values() for L in ls if not L["dup"]])
        for ch in chs:
            if ch not in loaded: print(f"ch{ch} {ed}: no timings, skipped"); continue
            c = loaded[ch]; flagged = [L for L in judge(c["pages"], base) if not L["dup"]]
            flagged.sort(key=severity, reverse=True)
            out, firsts = [], {}
            for L in flagged:  # the same line on a variant page (end and end_alt) is listed once, with the other pages under "also_on"
                k = (L["who"], L["text"])
                if k in firsts: firsts[k]["also_on"].append(L["pid"]); continue
                at = c["offset"].get(L["pid"])
                out.append({"page": L["pid"], "who": L["who"], "line": L["text"], "tone": L["tone"], "flag": L["flag"], "why": L["why"],
                            "words": L["words"], "syllables": L["syl"], "dur": L["dur"], "pace": L["pace"], "pace_unit": PACE_UNIT + "/s",
                            "pace_words_s": L["wps"], "pace_syl_s": L["sps"],
                            "scene": L["scene"], "char": L["char"], "expected_s": L.get("expected"), "gap_before": L["gap_before"],
                            "page_time": round(L["start"], 2), "chapter_mp3_time": round(at + L["start"], 2) if at is not None else None, "also_on": []})
                firsts[k] = out[-1]
            nlines = sum(1 for ls in c["pages"].values() for L in ls if not L["dup"])
            report["chapters_out"][f"{ch}-{ed}"] = {"lines": nlines, "flagged": out, "skipped_pages": c["skipped"]}
            print(f"\nch{ch} {ed}: {len(out)} flagged of {nlines} lines" + (f", {len(c['skipped'])} pages skipped (timings don't match the text)" if c["skipped"] else ""))
            for f in out:
                where = f"page {f['page']} at {mmss(f['page_time'])}" + (f", chapter audio {mmss(f['chapter_mp3_time'])}" if f["chapter_mp3_time"] is not None else "")
                print(f"  {f['flag'].upper()} {f['who']}: \"{f['line'][:70]}\"  ({where})" + (f" also on {', '.join(f['also_on'])}" if f["also_on"] else ""))
                u = "words/s" if PACE_UNIT == "words" else "syl/s"
                print(f"     {f['pace']:.2f} {u} over {f['dur']:.2f} s, scene {f['scene']}, {f['who']} usual {f['char']}: {f['why']}")
        report["character_baselines_" + ed] = base
    out = a.out or os.path.join(REPORTS, f"pace-{a.course}-ch{a.chapter}.json")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    json.dump(report, open(out, "w"), indent=1, ensure_ascii=False)
    print(f"\nreport: {out}")

if __name__ == "__main__":
    main()
