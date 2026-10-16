#!/usr/bin/env python3
"""Exam, continuity and copy review, then a ruling with exact edits, for any non-PMP course, on the Claude API (prepaid credits).

Per file (each courses/<id>/full/chNN.js and its mock files): three reviews (exam accuracy against the course's exam and sources,
continuity against the private bible and canon, copy for the ear), then one ruling call that confirms or rejects every MUST FIX
and turns the confirmed ones into exact find and replace edits. Same rules as the PMP tools (api_exam_pass.py, api_adjudicate.py).
Output: ~/Documents/halcyon-private/reviews/api-<id>-<date>/<file>.<kind>.md and <file>.json. Apply with
  tools/api_apply_edits.py --dir api-<id>-<date>
Nothing in the repo changes here.

usage: tools/api_course_pass.py <course id> [--only ch03,mock1] [--model MODEL]
"""
import argparse, datetime, glob, json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import api_exam_pass as X
import api_adjudicate as A
import api_review_pass as R

CANON = {"cphims": "front-range", "cisa": "front-range", "asep": "front-range", "lsat": "front-range", "pilot": "hangar-six", "gh300": "front-range"}
PRIV = os.path.expanduser("~/Documents/halcyon-private")

EXAM = """You are an exam-accuracy reviewer for a study course told as a story, for the {exam}. The learner studies by listening, so a wrong key teaches him something false.
Check every quiz item, key and explanation, every decision scene's options and which is scored best (s:3), every drill's math (exact), every exercise item, and the lesson, against the current official exam outline and the standard sources for this exam (the course bible names them; use what you know of the current versions). The bible's exam notes describe what the course must teach.
Report only real problems: where, what's wrong, why (cite the source by name, no long quotes), and exact replacement text (plain words, contractions, no em or en dashes, no spaced hyphens). Sort into MUST FIX, ARGUABLE and NITS. Flag task codes that don't match what an item tests, and text that looks copied from a copyrighted source. If clean, say PASS. Don't rewrite story."""

def course_files(cid, only):
    root = os.path.join(X.ROOT, "courses", cid)
    fs = sorted(os.path.relpath(p, X.ROOT) for p in glob.glob(os.path.join(root, "full", "ch[0-9][0-9].js")))
    fs += sorted(os.path.relpath(p, X.ROOT) for p in glob.glob(os.path.join(root, "mock", "*.js")) + glob.glob(os.path.join(root, "mock.js")))
    if only: fs = [f for f in fs if any(w in f for w in only.split(","))]
    return fs

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("course"); ap.add_argument("--only"); ap.add_argument("--model", default=os.environ.get("HALCYON_API_MODEL", "claude-opus-5-5"))
    a = ap.parse_args(); cid = a.course
    bible = open(os.path.join(X.ROOT, "courses", cid, "BIBLE.md")).read()
    canon = open(os.path.join(PRIV, "canon", CANON.get(cid, "front-range") + ".json")).read()
    meta = open(os.path.join(X.ROOT, "courses", cid, "meta.js")).read()
    cj = open(os.path.join(X.ROOT, "courses.js")).read(); m = re.search(r'id:"%s".*?exam:"([^"]+)"' % cid, cj, re.S)
    exam = m.group(1) if m else cid.upper()
    out = os.path.join(PRIV, "reviews", f"api-{cid}-{datetime.date.today().isoformat()}"); os.makedirs(out, exist_ok=True)
    ctx = f"Course: {exam}\n\nCourse meta (task codes and domains):\n{meta}\n\nStory bible (private):\n{bible}\n\nCanon (private):\n{canon}"
    prompts = {"exam": EXAM.format(exam=exam),
               "continuity": R.PROMPTS["continuity"].replace('"Halcyon", a PMP study course told as a fifteen chapter story (Sam Okafor, a Mars mission program)', f"a {exam} study course told as a story"),
               "copy": R.PROMPTS["copy"].replace('"Halcyon", a PMP study course', f"a {exam} study course")}
    k = X.key(); fs = course_files(cid, a.only); tot = {"input_tokens": 0, "output_tokens": 0, "cache_read_input_tokens": 0}
    print(f"{cid}: {len(fs)} files, model {a.model}, out {out}", flush=True)
    for f in fs:
        name = os.path.basename(f)[:-3]; jpath = os.path.join(out, f"{name}.json")
        if os.path.exists(jpath): print("skip (done)", f); continue
        reps = []
        for kind in (["exam"] if "mock" in f else ["exam", "continuity", "copy"]):
            rp = os.path.join(out, f"{name}.{kind}.md")
            if not os.path.exists(rp):
                X.SYSTEM = prompts[kind]; text, u = X.call(k, a.model, ctx, None, f)
                open(rp, "w").write(f"# API {kind} review: {f}\n\n{text}\n")
                for x in tot: tot[x] += u.get(x, 0) or 0
            reps.append((kind, open(rp).read()))
        X.SYSTEM = A.SYSTEM.replace('"Halcyon", a PMP study course', f"a {exam} study course").replace("(PMBOK 8 notes, the current PMP exam outline, the story bible and canon)", "(the current exam outline and sources, the story bible and canon)")
        tmp = os.path.join(out, f".req-{name}.txt")
        open(tmp, "w").write("Review reports for " + f + ":\n\n" + "\n\n".join(f"=== {kk} report ===\n{t}" for kk, t in reps) + f"\n\nFile source follows.\n\n{open(os.path.join(X.ROOT, f)).read()}")
        text, u = X.call(k, a.model, ctx, None, os.path.relpath(tmp, X.ROOT)); os.remove(tmp)
        for x in tot: tot[x] += u.get(x, 0) or 0
        mm = re.search(r"\{.*\}", text, re.S)
        try: data = json.loads(mm.group(0)) if mm else None
        except json.JSONDecodeError: data = None
        if data is None: open(jpath[:-5] + ".raw.txt", "w").write(text); print("BAD JSON", f, flush=True); continue
        data["file"] = f; json.dump(data, open(jpath, "w"), indent=1)
        print(f"done {f}: {len(data.get('edits', []))} confirmed, {len(data.get('rejected', []))} rejected", flush=True)
    print("totals", tot)

if __name__ == "__main__":
    main()
