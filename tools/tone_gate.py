"""Tone gate (post-render): catches a character line whose delivery doesn't fit its data-tone cue or its scene, which the voice gate
(identity, gender), the pace gate (speed) and whisper (words) can't hear. Read only: it never renders, never calls Gemini and never
writes audio. It reads the page mp3s and word timings the renderer already wrote (tools/narration_lines.py cuts them into lines).

usage: python3 tools/tone_gate.py <course> <chapter|all|1-3> [--edition study|story|both] [--book all|1-12] [--ser] [--narrator] [--out r.json]
  --book      chapters that make each character's baseline (default: every chapter with timings; leave out chapters rendering now)
  --ser       also label each judged line with a speech emotion model (superb/wav2vec2-base-superb-er: Apache 2.0, 378 MB, four
              labels: neutral, happy, angry, sad; downloaded once to the Hugging Face cache, runs on the CPU, cached per clip)
  --narrator  judge the narrator's lines too (HOT only; the narrator never carries a cue)
Exit code 0 always: it reports, it doesn't block.

Measures (per line, from narration_lines.features): median pitch, pitch range and spread in semitones, spectral tilt (vocal
effort), periodicity (voiced share), loudness and pace. Each is turned into a z score against the CHARACTER's own book baseline:
the median and robust spread (1.4826 x MAD) of their untoned lines with no "!" and at least half a second of voiced speech, so a
bright character isn't "hot" for being bright. A character needs BASE_MIN such lines.
  arousal A = mean(z pitch, z tilt, 0.5 x z range). Rises with a raised, excited or angry read; falls with a quiet, tired one.
Calibration (2026-11-07, approved by ear: asep, pilot and cphims, study edition): low cues (quiet, grave, tired) read A -0.9 and
range -1.2 on the median; high cues (sharp, urgent, excited) A +1.1; untoned lines A 0.0, with the 99.5th percentile at +1.7.

Flags
  FLAT  a cue asking for heat (angry, sharp, urgent, excited, frightened, shouted, ...) and no cue word asking for flat (level, even,
        controlled, flat, ...), read with A <= FLAT_A and pitch range z <= FLAT_RANGE
  HOT   an untoned line with no "!" and no emotion word in it, read with A >= HOT_A; with --ser also when the model hears it angry
        (p >= SER_ANG_P) and A >= SER_HOT_A
  LOUD  a whisper cue (whispered, hushed, under her breath) read in full voice: periodicity z >= WHISPER_VF and tilt z >= WHISPER_TILT;
        or a quiet cue (quiet, soft, low, gentle, grave, tired, ...) read with A >= QUIET_A
Lines shorter than MIN_VOICED voiced frames (about half a second) aren't judged: pitch and tilt on a word or two are noise."""
import argparse, json, math, os, re, sys
import numpy as np
sys.dont_write_bytecode = True
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import narration_lines as N

# ---- thresholds (calibrated 2026-11-07, see the numbers in the docstring and docs/NARRATION_GATES.md)
BASE_MIN = 8          # untoned baseline lines a character needs before any line of theirs is judged
MIN_VOICED = 50       # voiced 10 ms frames a line needs to be judged
FLOORS = {"f0st": float(os.environ.get("TONE_F0_FLOOR", "1.5")), "st_range": 0.8, "tilt_db": float(os.environ.get("TONE_TILT_FLOOR", "2.0")),
          "voiced_frac": 0.04, "wps": 0.2, "st_sd": 0.3}  # smallest spread used for a z (see the calibration note in the docstring)
FLAT_A, FLAT_RANGE = -0.5, -1.0
HOT_A = 2.0
SER_ANG_P, SER_HOT_A = 0.8, 1.5   # the model calls 7% of approved character lines angry (asep, 125 of 1680); at 0.6 and 1.2 it added 4 flags, at 0.8 and 1.5 one
WHISPER_VF, WHISPER_TILT = 0.0, 0.0
QUIET_A = 1.2

HIGH = re.compile(r"\b(angry|anger|furious|fury|shout\w*|yell\w*|raised|sharp\w*|snap\w*|urgent\w*|panic\w*|frantic|alarm\w*|frightened|scared|afraid|"
                  r"excited|elated|thrilled|heated|fierce\w*|exasperated|loud|tense|indignant|outraged|triumphant|jubilant|desperate|pleading)\b", re.I)
FLAT_OK = re.compile(r"\b(flat|level|even|evenly|controlled|deadpan|monotone|matter-of-fact|measured|calm|held|holding|restrained|contained|cold)\b", re.I)
WHISPER = re.compile(r"\b(whisper\w*|hushed|under (?:her|his|their) breath|barely audible|murmur\w*)\b", re.I)
QUIET = re.compile(r"\b(quiet|quietly|soft|softly|low|subdued|tired|weary|gentle|gently|tender|grave|heavy|sober|somber|sombre|sad|grieving|"
                   r"resigned|defeated|faint|small|hushed|whisper\w*)\b", re.I)
EMO_TEXT = re.compile(r"\b(angry|furious|hate|damn|hell|god|dead|died|kill\w*|scared|afraid|terrified|love|sorry|please|no no|help)\b", re.I)

_ser = {}
def ser_label(a):
    """16 kHz clip -> {label: p} from superb/wav2vec2-base-superb-er"""
    if not _ser:
        import logging, torch
        logging.getLogger("transformers").setLevel(logging.ERROR)
        from transformers import AutoFeatureExtractor, AutoModelForAudioClassification
        _ser["t"] = torch; _ser["fe"] = AutoFeatureExtractor.from_pretrained("superb/wav2vec2-base-superb-er")
        _ser["m"] = AutoModelForAudioClassification.from_pretrained("superb/wav2vec2-base-superb-er").eval()
    t = _ser["t"]; a = a[:N.SR * 12]
    with t.no_grad():
        lo = _ser["m"](**_ser["fe"](a, sampling_rate=N.SR, return_tensors="pt")).logits[0]
    p = t.softmax(lo, -1).numpy(); lab = _ser["m"].config.id2label
    return {lab[i]: round(float(p[i]), 3) for i in range(len(p))}

def f0st(L): return 12 * math.log2(L["f0_med"] / 100) if L.get("f0_med") else None
def val(L, f): return f0st(L) if f == "f0st" else L.get(f)

def baselines(lines):
    by = {}
    for L in lines:
        if L["dup"] or L.get("tone") or "!" in L["text"] or not L.get("f0_med") or (L.get("n_voiced") or 0) < MIN_VOICED: continue
        by.setdefault(L["who"], []).append(L)
    B = {}
    for who, ls in by.items():
        if len(ls) < BASE_MIN: continue
        B[who] = {"lines": len(ls)}
        for f, fl in FLOORS.items():
            med, sd = N.robust([val(x, f) for x in ls]); B[who][f] = (round(med, 3), round(max(sd, fl), 3))
    return B

def zscores(L, b):
    z = {f: (None if val(L, f) is None else (val(L, f) - b[f][0]) / b[f][1]) for f in FLOORS}
    if None in (z["f0st"], z["tilt_db"], z["st_range"]): return z, None
    return z, (z["f0st"] + z["tilt_db"] + 0.5 * z["st_range"]) / 3

def judge(L, B, ser=None, narrator=False):
    """-> (flag, why) or (None, None); sets L["z"], L["A"]"""
    if L["who"] == "narrator" and not narrator: return None, None
    if N.PG.skip_reason(L): return None, None  # headings, codes, one word interjections (pace_gate's list)
    b = B.get(L["who"])
    if not b or (L.get("n_voiced") or 0) < MIN_VOICED: return None, None
    z, A = zscores(L, b); L["z"] = {k: (round(v, 2) if v is not None else None) for k, v in z.items()}; L["A"] = round(A, 2) if A is not None else None
    if A is None: return None, None
    tone = L.get("tone") or ""
    if tone:
        if WHISPER.search(tone) and z["voiced_frac"] is not None and z["voiced_frac"] >= WHISPER_VF and z["tilt_db"] >= WHISPER_TILT:
            return "LOUD", f"whisper cue read in full voice (periodicity z {z['voiced_frac']:+.1f}, effort z {z['tilt_db']:+.1f})"
        if QUIET.search(tone) and not HIGH.search(tone) and A >= QUIET_A:
            return "LOUD", f"quiet cue read raised (arousal {A:+.1f}: pitch z {z['f0st']:+.1f}, effort z {z['tilt_db']:+.1f})"
        if HIGH.search(tone) and not FLAT_OK.search(tone) and A <= FLAT_A and z["st_range"] <= FLAT_RANGE:
            return "FLAT", f"cue asks for heat, read flat (arousal {A:+.1f}, pitch range z {z['st_range']:+.1f})"
        return None, None
    if "!" in L["text"] or EMO_TEXT.search(L["text"]): return None, None
    if A >= HOT_A: return "HOT", f"untoned line read with heat (arousal {A:+.1f}: pitch z {z['f0st']:+.1f}, effort z {z['tilt_db']:+.1f}, range z {z['st_range']:+.1f})"
    if ser and ser.get("ang", 0) >= SER_ANG_P and A >= SER_HOT_A:
        return "HOT", f"untoned line heard as angry (p {ser['ang']:.2f}) with arousal {A:+.1f}"
    return None, None

def ser_cached(course, key, pid, L, audio):
    p = os.path.join(N.FEAT_DIR, f"ser-{course}-{key}.json")
    c = _sercache.setdefault(p, (json.load(open(p)) if os.path.exists(p) else {}))
    a = audio[int(L["start"] * N.SR):int(L["end"] * N.SR)]; h = N.clip_md5(a)
    if h not in c: c[h] = ser_label(a); _serdirty.add(p)
    return c[h]
_sercache, _serdirty = {}, set()
def ser_flush():
    for p in _serdirty:
        tmp = p + f".{os.getpid()}.tmp"; json.dump(_sercache[p], open(tmp, "w")); os.replace(tmp, p)
    _serdirty.clear()

def main():
    ap = argparse.ArgumentParser(description="Tone gate: delivery that doesn't fit its cue or scene.")
    ap.add_argument("course"); ap.add_argument("chapter"); ap.add_argument("--edition", default="study", choices=["study", "story", "both"])
    ap.add_argument("--book"); ap.add_argument("--ser", action="store_true"); ap.add_argument("--narrator", action="store_true"); ap.add_argument("--out")
    a = ap.parse_args()
    chs = N.parse_chapters(a.chapter, a.course); book = N.parse_chapters(a.book, a.course) if a.book else N.PG.chapters_with_timings(a.course)
    eds = ["study", "story"] if a.edition == "both" else [a.edition]
    report = {"course": a.course, "chapters": chs, "book": book, "editions": eds, "ser": a.ser,
              "thresholds": {k: v for k, v in globals().items() if k.isupper() and isinstance(v, (int, float))}, "chapters_out": {}, "summary": {}}
    tot_judged = tot_flags = 0; counts = {}
    for ed in eds:
        story = ed == "story"; loaded = {}
        for ch in sorted(set(chs) | set(book)):
            c = N.load(a.course, ch, story, want_audio=(a.ser and ch in chs))
            if c: loaded[ch] = c
        B = baselines([L for ch in book if ch in loaded for ls in loaded[ch]["pages"].values() for L in ls])
        report["baselines_" + ed] = B
        for ch in chs:
            if ch not in loaded: print(f"ch{ch} {ed}: no timings, skipped"); continue
            c = loaded[ch]; out, judged = [], 0
            for pid, ls in c["pages"].items():
                for L in ls:
                    if L["dup"]: continue
                    ser = None
                    if a.ser and L["who"] != "narrator" and L["who"] in B and (L.get("n_voiced") or 0) >= MIN_VOICED and pid in c["audio"]:
                        ser = ser_cached(a.course, c["key"], pid, L, c["audio"][pid]); L["ser"] = ser
                    flag, why = judge(L, B, ser, a.narrator)
                    if L.get("A") is not None: judged += 1
                    if flag:
                        counts[flag] = counts.get(flag, 0) + 1
                        at = c["offset"].get(pid)
                        out.append({"page": pid, "who": L["who"], "line": L["text"], "tone": L.get("tone"), "flag": flag, "why": why, "A": L["A"], "z": L["z"],
                                    "ser": ser, "f0": L.get("f0_med"), "dur": L["dur"], "page_time": round(L["start"], 2),
                                    "chapter_mp3_time": round(at + L["start"], 2) if at is not None else None})
            if a.ser: ser_flush()
            tot_judged += judged; tot_flags += len(out)
            report["chapters_out"][f"{ch}-{ed}"] = {"judged": judged, "flagged": out, "skipped_pages": c["skipped"]}
            print(f"\nch{ch} {ed}: {len(out)} flagged of {judged} judged lines")
            for f in out:
                print(f"  {f['flag']} {f['who']}: \"{f['line'][:72]}\"  (page {f['page']} at {N.mmss(f['page_time'])})" + (f"  cue: {f['tone']}" if f["tone"] else ""))
                print(f"     {f['why']}" + (f"; model: {max(f['ser'], key=f['ser'].get)} {max(f['ser'].values()):.2f}" if f["ser"] else ""))
    report["summary"] = {"judged": tot_judged, "flagged": tot_flags, "by_flag": counts, "flag_rate": round(tot_flags / tot_judged, 4) if tot_judged else None}
    print(f"\n{a.course}: {tot_flags} flagged of {tot_judged} judged lines ({(tot_flags / tot_judged * 100) if tot_judged else 0:.2f}%) {counts}")
    out = a.out or os.path.join(N.REPORTS, f"tone-{a.course}-ch{a.chapter}.json")
    json.dump(report, open(out, "w"), indent=1, ensure_ascii=False); print(f"report: {out}")

if __name__ == "__main__":
    main()
