"""Flow gate (post-render): catches seams between lines on a page that a listener hears as a stumble: a hole or a run-on between
two lines, a loudness step from one line to the next, and a character whose energy jumps from one of their lines to the next in
the same scene with no cue change to explain it. Read only: it never renders, never calls Gemini and never writes audio. It reads
the page mp3s and word timings the renderer already wrote (tools/narration_lines.py cuts them into lines).

usage: python3 tools/flow_gate.py <course> <chapter|all|1-3> [--edition study|story|both] [--out report.json]
Exit code 0 always: it reports, it doesn't block.

What a gap should be. render_pages_gemini.assemble() lays silence between lines on purpose: the page's pause segments (0.25 to
0.8 s around paragraphs and options), 0.18 s on a change of voice, 0.04 s before and 0.08 s after a line of two words or fewer.
Each clip also keeps about 0.04 s of its own edge (gemini_tts.clean). The gate takes the gap it measures (the voiced end of one
line to the voiced start of the next, pace_gate.refine_with_array) and subtracts that planned silence. What's left is the take's
own silence at its edges (a breath, a slow start) or a run's cut point.

Flags (thresholds calibrated 2026-11-07 on asep, pilot and cphims, study edition, all approved by ear)
  GAP_LONG    leftover silence over GAP_LONG_S (GAP_LONG_LESSON_S on the lesson page, where Gemini starts a section slowly).
              Approved books: 99.5th percentile 0.76 s after a pause, 0.73 s at a turn; max 1.97 s (a lesson section)
  GAP_SHORT   a change of voice (no pause between) with under GAP_TURN_MIN_S of silence: two speakers run together.
              Approved books: never under 0.16 s, because the renderer always lays 0.18 s
  LOUD_JUMP   a step of more than LUFS_JUMP_DB in K-weighted loudness between consecutive lines (both LUFS_MIN_S or longer).
              The renderer levels every clip to about -21 dBFS voiced RMS, so this only fires when leveling hit its gain limits
              (a whisper raised 3x and still quiet, or a shout cut by the peak limiter). Approved: p99.5 2.5 dB, max 3.9 dB
  ENERGY_JUMP one character's consecutive lines on a page (at most ENERGY_SPAN lines apart, same cue or both uncued, each with
              half a second of voiced speech) where the median pitch moves ENERGY_ST semitones or more AND the vocal effort
              (spectral tilt) moves ENERGY_TILT_DB or more the same way. A jump near 12 semitones is the pitch tracker skipping an
              octave and is ignored. Not the narrator (ENERGY_SKIP). Approved: 5 of 1,103 character pairs at 4 st and 4 dB, 2 at 4.5"""
import argparse, json, math, os, sys
sys.dont_write_bytecode = True
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import narration_lines as N

GAP_LONG_S = 1.0
GAP_LONG_LESSON_S = 1.6
GAP_TURN_MIN_S = 0.12
LUFS_JUMP_DB = 4.0
LUFS_MIN_S = 1.0
ENERGY_ST = 4.5
ENERGY_TILT_DB = 4.5
ENERGY_SKIP = {"narrator"}  # the narrator moves between story, options and asides on purpose: 9 of 13 asep marks at 4 st were the narrator
ENERGY_SPAN = 4
ENERGY_MIN_VOICED = 50

def check_page(pid, lines):
    out = []
    for n, L in enumerate(lines):
        if n == 0 or L["dup"]: continue
        P = lines[n - 1]
        if L.get("planned_gap") is not None and L.get("gap_before") is not None:
            left = L["gap_before"] - L["planned_gap"]; lim = GAP_LONG_LESSON_S if pid == "lesson" else GAP_LONG_S
            if left > lim:
                out.append(("GAP_LONG", L, P, f"{L['gap_before']:.2f} s of silence before it, {left:.2f} s more than the {L['planned_gap']:.2f} s the page lays"))
            if L.get("turn") and not L.get("after_pause") and L["gap_before"] < GAP_TURN_MIN_S:
                out.append(("GAP_SHORT", L, P, f"{P['who']} to {L['who']} with {L['gap_before']:.2f} s between (the page lays {L['planned_gap']:.2f} s)"))
        if L.get("lufs") is not None and P.get("lufs") is not None and L["dur"] >= LUFS_MIN_S and P["dur"] >= LUFS_MIN_S:
            d = L["lufs"] - P["lufs"]
            if abs(d) > LUFS_JUMP_DB:
                out.append(("LOUD_JUMP", L, P, f"{d:+.1f} dB from the line before ({P['lufs']:.1f} to {L['lufs']:.1f} LUFS)"))
    last = {}
    for n, L in enumerate(lines):
        w = L["who"]
        ok = (w not in ENERGY_SKIP and L.get("f0_med") and (L.get("n_voiced") or 0) >= ENERGY_MIN_VOICED and not N.PG.skip_reason(L))
        if ok and w in last and n - last[w][0] <= ENERGY_SPAN and not L["dup"]:
            P = last[w][1]
            if (P.get("tone") or "") == (L.get("tone") or ""):
                ds = 12 * math.log2(L["f0_med"] / P["f0_med"]); dt = L["tilt_db"] - P["tilt_db"]
                if abs(ds) >= ENERGY_ST and abs(abs(ds) - 12) > 2 and abs(dt) >= ENERGY_TILT_DB and (ds > 0) == (dt > 0):
                    out.append(("ENERGY_JUMP", L, P, f"{w}'s pitch {ds:+.1f} st ({P['f0_med']:.0f} to {L['f0_med']:.0f} Hz) and effort {dt:+.1f} dB from their line before, same cue"))
        if ok: last[w] = (n, L)
    return out

def main():
    ap = argparse.ArgumentParser(description="Flow gate: seams between lines.")
    ap.add_argument("course"); ap.add_argument("chapter"); ap.add_argument("--edition", default="study", choices=["study", "story", "both"]); ap.add_argument("--out")
    a = ap.parse_args()
    chs = N.parse_chapters(a.chapter, a.course); eds = ["study", "story"] if a.edition == "both" else [a.edition]
    report = {"course": a.course, "chapters": chs, "editions": eds,
              "thresholds": {k: v for k, v in globals().items() if k.isupper() and isinstance(v, (int, float))}, "chapters_out": {}}
    seams = flags = 0; counts = {}
    for ed in eds:
        for ch in chs:
            c = N.load(a.course, ch, ed == "story")
            if c is None: print(f"ch{ch} {ed}: no timings, skipped"); continue
            out = []
            for pid, lines in c["pages"].items():
                seams += sum(1 for L in lines[1:] if not L["dup"])
                for flag, L, P, why in check_page(pid, lines):
                    at = c["offset"].get(pid); counts[flag] = counts.get(flag, 0) + 1
                    out.append({"page": pid, "flag": flag, "why": why, "who": L["who"], "line": L["text"], "tone": L.get("tone"),
                                "prev_who": P["who"], "prev_line": P["text"], "page_time": round(L["start"], 2),
                                "chapter_mp3_time": round(at + L["start"], 2) if at is not None else None})
            flags += len(out)
            report["chapters_out"][f"{ch}-{ed}"] = {"flagged": out, "skipped_pages": c["skipped"]}
            print(f"\nch{ch} {ed}: {len(out)} flagged")
            for f in out:
                print(f"  {f['flag']} page {f['page']} at {N.mmss(f['page_time'])}: {f['prev_who']} \"{f['prev_line'][-40:]}\" -> {f['who']} \"{f['line'][:50]}\"")
                print(f"     {f['why']}")
    report["summary"] = {"seams": seams, "flagged": flags, "by_flag": counts, "flag_rate": round(flags / seams, 4) if seams else None}
    print(f"\n{a.course}: {flags} flagged of {seams} seams ({(flags / seams * 100) if seams else 0:.2f}%) {counts}")
    out = a.out or os.path.join(N.REPORTS, f"flow-{a.course}-ch{a.chapter}.json")
    json.dump(report, open(out, "w"), indent=1, ensure_ascii=False); print(f"report: {out}")

if __name__ == "__main__":
    main()
