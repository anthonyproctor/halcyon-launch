#!/usr/bin/env python3
"""Second API pass: rule on the exam, continuity and copy findings for each PMP file and turn the confirmed ones into exact edits.

For each chapter (and mock file) the model gets the file, every review report written for it under
~/Documents/halcyon-private/reviews/api-*-pass-<date>/, the PMBOK 8 reference notes, the PMP story bible and canon, and the task list.
It re-checks each MUST FIX (and each copy finding a listener would notice) against the file and the sources, rules CONFIRMED or
REJECTED with a reason, and gives every confirmed one as an exact find and replace edit on the file's source text.
Output: <reviews>/api-adjudicate-<date>/<name>.json  {"file", "edits":[{id, source, verdict, why, old, new, narrated}], "rejected":[...]}.
Nothing in the repo changes; tools/api_apply_edits.py applies confirmed edits whose "old" text appears exactly once.

usage: tools/api_adjudicate.py [--only ch03,process] [--date YYYY-MM-DD] [--model MODEL]
"""
import argparse, datetime, glob, json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import api_exam_pass as X

REV = os.path.expanduser("~/Documents/halcyon-private/reviews")
BIBLE = os.path.join(X.ROOT, "full/BIBLE.md")
CANON = os.path.expanduser("~/Documents/halcyon-private/canon/halcyon-pmp.json")

SYSTEM = """You are the final checker for review findings on "Halcyon", a PMP study course told as a story and narrated by text to speech. Three earlier reviewers (exam accuracy, continuity, copy) wrote reports on one file. Their findings may be wrong. Your job is to rule on them, not to find new problems.
Rule on every MUST FIX from every report, every ARGUABLE exam item whose key a strong test taker could truly defend otherwise, and every copy finding a listener would notice (rule breaks, unclear speaker, missing data-who). Skip nits.
For each, check it yourself against the file and the sources given (PMBOK 8 notes, the current PMP exam outline, the story bible and canon). CONFIRMED only if the finding is right and the fix is right. REJECTED if the file is already correct, the finding misreads it, the "fix" would teach something less accurate, or it breaks a bible decision.
For each CONFIRMED finding give an exact edit on the file's source: "old" must be copied character for character from the file (include enough text that it appears exactly once; keep HTML spans, backticks and escapes exactly), "new" is the replacement. Keep the house rules in "new": plain words, contractions, no em or en dashes, no spaced hyphens, every said line in a <span class="said" data-who="Name">. Don't change a quiz key's position. Mark "narrated": true when the text is read aloud (story text, lesson text, said lines, options and outcomes); false for quiz items, explanations, task codes and metadata.
Return ONLY a JSON object, no prose around it:
{"edits":[{"id":"exam-3","source":"exam|continuity|copy","severity":"must|arguable|copy","why":"one sentence","old":"...","new":"...","narrated":true}],
 "rejected":[{"id":"continuity-2","why":"one sentence"}]}"""

def reports_for(name, date):
    out = []
    for d in sorted(glob.glob(os.path.join(REV, f"api-*-pass-{date}"))):
        kind = os.path.basename(d).split("-")[1]
        for cand in (f"v2-{name}.md", f"{name}.md", f"mock-{name}.md"):
            p = os.path.join(d, cand)
            if os.path.exists(p): out.append((kind, open(p).read())); break
    return out

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--only"); ap.add_argument("--date", default=datetime.date.today().isoformat())
    ap.add_argument("--model", default=os.environ.get("HALCYON_API_MODEL", "claude-opus-5-5"))
    a = ap.parse_args()
    fs = X.files(a.only)
    out = os.path.join(REV, f"api-adjudicate-{a.date}"); os.makedirs(out, exist_ok=True)
    ctx = (f"PMP task codes:\n{X.tasks()}\n\nPMBOK 8 reference notes (private):\n{open(X.REF).read()}\n\n"
           f"Story bible (private):\n{open(BIBLE).read()}\n\nCanon (private):\n{open(CANON).read()}")
    X.SYSTEM = SYSTEM; k = X.key(); tot = {"input_tokens": 0, "output_tokens": 0, "cache_read_input_tokens": 0}
    print(f"{len(fs)} files, model {a.model}, out {out}")
    for f in fs:
        name = os.path.basename(f).replace(".js", "")
        dest = os.path.join(out, f"{os.path.basename(os.path.dirname(f))}-{name}.json")
        if os.path.exists(dest): print("skip (done)", f); continue
        reps = reports_for(name, a.date)
        if not reps: print("no reports", f); continue
        rel = f
        body = "\n\n".join(f"=== {k2} report ===\n{t}" for k2, t in reps)
        # the file goes last so the cached prefix (sources) is shared across files
        tmp = os.path.join(out, f".req-{name}.txt"); open(tmp, "w").write(f"Review reports for {rel}:\n\n{body}\n\nFile source follows.\n\n{open(os.path.join(X.ROOT, rel)).read()}")
        text, u = X.call(k, a.model, ctx, None, os.path.relpath(tmp, X.ROOT))
        os.remove(tmp)
        m = re.search(r"\{.*\}", text, re.S)
        try:
            data = json.loads(m.group(0)) if m else None
        except json.JSONDecodeError:
            data = None
        if data is None:
            open(dest.replace(".json", ".raw.txt"), "w").write(text); print(f"BAD JSON {f}", flush=True); continue
        data["file"] = rel
        json.dump(data, open(dest, "w"), indent=1)
        for x in tot: tot[x] += u.get(x, 0) or 0
        print(f"done {f}: {len(data.get('edits', []))} confirmed, {len(data.get('rejected', []))} rejected (in {u.get('input_tokens')}, cached {u.get('cache_read_input_tokens')}, out {u.get('output_tokens')})", flush=True)
    print("totals", tot)

if __name__ == "__main__":
    main()
