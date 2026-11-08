"""Voice report: a whole book view of every character's voice, chapter by chapter, so slow drift across a book shows up. Read only:
it never renders, never calls Gemini, never loads a model and never touches audio. It reads two caches the renderer already keeps:
  ~/.cache/halcyon-gemini-tts/voices/<course>-<audio>.json   voice_gate's book file: per character, per chapter key (f3, f3s), the
                                                              mean WavLM speaker embedding of that chapter's untoned takes and how many
  ~/.cache/halcyon-gemini-tts/reports/<course>-<audio>-<key>.json   the render report: per character mean line similarity to the
                                                              centroid at render time ("mean_sim") and median pitch ("f0_median")

usage: python3 tools/voice_report.py <course> [--edition study|story|both] [--min-lines 3] [--out report.json] [--all]
  course     pmp (audio/v2), or a course id (asep, pilot, cphims, ...)
  --edition  which chapter keys make the columns (default study: f1..f12; story: f1s..; both)
  --all      print every character, not only the ones with a drift mark

Per character and chapter:
  sim    the chapter's mean embedding against the book centroid of the OTHER chapters (leave one out), so a chapter can't pull
         the bar toward itself
  pitch  the chapter's median pitch (Hz) from the render report, and its distance in semitones from the character's book median
Drift marks (thresholds below, calibrated 2026-11-07 on asep, pilot and cphims, all approved by ear):
  VOICE  sim below the character's own median sim minus DRIFT_SIM, or below FLOOR_SIM
  PITCH  pitch more than DRIFT_ST semitones from the character's book median
Only chapters where the character has MIN_LINES or more untoned takes are marked: one or two short lines make a noisy mean.
Exit code 0 always: it reports, it doesn't block."""
import argparse, json, math, os, re, sys
import numpy as np

CACHE = os.path.expanduser(os.environ.get("GEMINI_TTS_CACHE", "~/.cache/halcyon-gemini-tts"))
DRIFT_SIM = 0.04     # chapter sim this far under the character's median chapter sim (p99 on approved books: 0.027)
FLOOR_SIM = 0.93     # or under this, whatever the character's median (approved books: 1st percentile 0.941)
DRIFT_ST = 3.0       # chapter median pitch this many semitones off the book median (approved: p99 2.5, max 2.8)
MIN_LINES = 5        # fewer takes than this in a chapter: too noisy to mark (3 takes gave 2 to 7 st swings on approved audio)

def audio_key(course): return "audio_v2" if course in ("pmp", "pmp-v2", "v2") else "audio"
def course_id(course): return "pmp" if course in ("pmp", "pmp-v2", "v2") else course
def knum(k):
    m = re.fullmatch(r"f(\d+)(s?)", k); return (int(m.group(1)), m.group(2)) if m else None

def main():
    ap = argparse.ArgumentParser(description="Per character voice drift across a book.")
    ap.add_argument("course"); ap.add_argument("--edition", default="study", choices=["study", "story", "both"])
    ap.add_argument("--min-lines", type=int, default=MIN_LINES); ap.add_argument("--out"); ap.add_argument("--all", action="store_true")
    a = ap.parse_args()
    cid, ak = course_id(a.course), audio_key(a.course)
    vp = os.path.join(CACHE, "voices", f"{cid}-{ak}.json")
    if not os.path.exists(vp): print(f"no voice cache at {vp}"); return
    V = json.load(open(vp))
    want = (lambda s: s == "") if a.edition == "study" else (lambda s: s == "s") if a.edition == "story" else (lambda s: True)
    reps = {}
    for f in os.listdir(os.path.join(CACHE, "reports")):
        m = re.fullmatch(rf"{re.escape(cid)}-{re.escape(ak)}-(f\d+s?)\.json", f)
        if m:
            try: reps[m.group(1)] = json.load(open(os.path.join(CACHE, "reports", f)))["gate"].get("characters", {})
            except Exception: pass
    out = {"course": a.course, "edition": a.edition, "thresholds": {"DRIFT_SIM": DRIFT_SIM, "FLOOR_SIM": FLOOR_SIM, "DRIFT_ST": DRIFT_ST, "MIN_LINES": a.min_lines},
           "characters": {}}
    marks_total = 0
    for who in sorted(V, key=lambda w: -sum(n for _, n in V[w].values())):
        base = who.split("#")[0]
        keys = sorted((k for k in V[who] if knum(k) and want(knum(k)[1])), key=knum)
        if len(keys) < 2: continue
        E = {k: np.array(V[who][k][0]) for k in keys}; N = {k: V[who][k][1] for k in keys}
        rows = {}
        for k in keys:
            others = [k2 for k2 in keys if k2 != k]
            c = np.average(np.array([E[k2] for k2 in others]), axis=0, weights=[N[k2] for k2 in others]); c /= np.linalg.norm(c)
            ch = reps.get(k, {}).get(base, {})
            rows[k] = {"takes": N[k], "sim": round(float(E[k] @ c), 3), "line_sim": ch.get("mean_sim"), "f0": ch.get("f0_median")}
        judged = [k for k in keys if N[k] >= a.min_lines]
        sims = [rows[k]["sim"] for k in judged]
        f0w = [(rows[k]["f0"], N[k]) for k in keys if rows[k]["f0"]]
        f0_med = None
        if f0w:  # weighted median by takes
            f0w.sort(); tot = sum(n for _, n in f0w); acc = 0
            for f, n in f0w:
                acc += n
                if acc >= tot / 2: f0_med = f; break
        sim_med = float(np.median(sims)) if sims else None
        nmarks = 0
        for k in keys:
            r = rows[k]; r["mark"] = []
            if f0_med and r["f0"]: r["st"] = round(12 * math.log2(r["f0"] / f0_med), 1)
            if k not in judged: continue
            if sim_med is not None and (r["sim"] < sim_med - DRIFT_SIM or r["sim"] < FLOOR_SIM): r["mark"].append("VOICE")
            if r.get("st") is not None and abs(r["st"]) > DRIFT_ST: r["mark"].append("PITCH")
            nmarks += len(r["mark"])
        marks_total += nmarks
        out["characters"][who] = {"takes": sum(N.values()), "chapters": len(keys), "median_sim": round(sim_med, 3) if sim_med else None,
                                  "f0_median": f0_med, "marks": nmarks, "by_chapter": rows}
        if nmarks or a.all:
            print(f"\n{who}: {sum(N.values())} takes over {len(keys)} chapters, median chapter sim {sim_med if sim_med is None else round(sim_med, 3)}, book pitch {f0_med} Hz")
            print("  " + "  ".join(f"{k:>5}" for k in keys))
            print("  " + "  ".join(f"{rows[k]['sim']:5.2f}" for k in keys) + "   sim to the other chapters")
            print("  " + "  ".join(f"{rows[k]['f0'] or 0:5.0f}" for k in keys) + "   median pitch, Hz")
            print("  " + "  ".join(f"{N[k]:5d}" for k in keys) + "   takes")
            for k in keys:
                if rows[k]["mark"]: print(f"    {k}: {' and '.join(rows[k]['mark'])} (sim {rows[k]['sim']}, pitch {rows[k]['f0']} Hz, {rows[k].get('st')} st, {N[k]} takes)")
    nchar = len(out["characters"]); ncell = sum(1 for c in out["characters"].values() for k, r in c["by_chapter"].items() if r["takes"] >= a.min_lines)
    out["summary"] = {"characters": nchar, "judged_cells": ncell, "marks": marks_total, "mark_rate": round(marks_total / ncell, 3) if ncell else None}
    print(f"\n{a.course} {a.edition}: {nchar} characters, {ncell} character-chapters judged, {marks_total} drift marks")
    p = a.out or os.path.join(CACHE, "reports", f"voice-report-{a.course}-{a.edition}.json")
    json.dump(out, open(p, "w"), indent=1); print(f"report: {p}")

if __name__ == "__main__":
    main()
