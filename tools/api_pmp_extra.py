#!/usr/bin/env python3
"""Three more PMP passes on the Claude API (prepaid API credits), each a review then a ruling, ending in exact edits:
  recaps  full/v2/recaps.js against each chapter as it stands now (one call per chapter): recap lines that quote or state
          something the chapter no longer says, wrong dates, spoilers, wrong call lines for an option
  mock    each mock/*.js file in depth: keys a strong test taker could argue, questions that give away the answer, stems that
          repeat a chapter quiz item, distractors that are obviously wrong, domain and task tags vs the current exam outline
  labs    courses/pmp/labs.js: math, keys, explanations, terms
Reviews and rulings use the same rules as tools/api_exam_pass.py and tools/api_adjudicate.py. Output:
~/Documents/halcyon-private/reviews/api-extra-<date>/<job>-<name>.md (review) and .json (ruling: {"file","edits","rejected"}).
Apply with: tools/api_apply_edits.py --dir api-extra-<date>
usage: tools/api_pmp_extra.py recaps|mock|labs [--only ch03] [--model MODEL]
"""
import argparse, datetime, json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import api_exam_pass as X
import api_adjudicate as A

REVIEW = {
"recaps": """You check the "Story so far" recap file of a PMP course told as a story. The chapters were just revised; the recaps were written before. You get the whole recap file and one chapter as it stands now.
Check that chapter's block in the recap file (ch[N]: previously, calls, notes, pages) and the people lines tagged with that chapter: every fact, quote, date, name and outcome must match the chapter now. Flag recap text that quotes a line the chapter no longer has, states a fact it contradicts, gives a page date that disagrees with the chapter, describes an option's outcome wrongly in calls, or tells the reader something before the page where they learn it.
Report only real problems: where (ch, page id or calls index), what's wrong, the chapter text that shows it, and exact replacement text (plain words, contractions, no em or en dashes, no spaced hyphens). If clean, say PASS.""",
"mock": """You review one part of a 180 question PMP practice exam (four options, one key). Check it in depth against the current PMP Examination Content Outline and PMBOK Guide 8th edition (reference notes given): keys a strong test taker could truly argue, questions whose wording gives the answer away (the longest or most hedged option, a word echoed from the stem), distractors nobody would pick, two questions testing the same point the same way, explanations that teach something wrong, and domain or task tags that don't match what the question tests.
Report MUST FIX, ARGUABLE and NITS, each with the question number and exact replacement text (plain words, contractions, no em or en dashes, no spaced hyphens). Keep the key position unless the key itself is wrong. If clean, say PASS.""",
"labs": """You review the interactive labs file of a PMP course (worked exercises with numbers). Check every number and calculation exactly (show the arithmetic), every expected answer and tolerance, every explanation, and every term against PMBOK Guide 8th edition and the current exam outline (reference notes given).
Report MUST FIX, ARGUABLE and NITS with exact replacement text (plain words, contractions, no em or en dashes, no spaced hyphens). If clean, say PASS.""",
}

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("job", choices=list(REVIEW)); ap.add_argument("--only")
    ap.add_argument("--model", default=os.environ.get("HALCYON_API_MODEL", "claude-opus-5-5"))
    a = ap.parse_args()
    out = os.path.expanduser(f"~/Documents/halcyon-private/reviews/api-extra-{datetime.date.today().isoformat()}"); os.makedirs(out, exist_ok=True)
    ref = f"PMP task codes:\n{X.tasks()}\n\nPMBOK 8 reference notes (private):\n{open(X.REF).read()}"
    if a.job == "recaps":
        target = "full/v2/recaps.js"
        units = [(f, os.path.basename(f)[:-3]) for f in X.files(a.only) if f.startswith("full/")]
        ctx = f"Recap file ({target}):\n{open(os.path.join(X.ROOT, target)).read()}\n\nStory bible (private):\n{open(A.BIBLE).read()}"
    elif a.job == "mock":
        units = [(f, os.path.basename(f)[:-3]) for f in X.files(a.only) if f.startswith("mock/")]; target = None; ctx = ref
    else:
        units = [("courses/pmp/labs.js", "labs")]; target = None; ctx = ref
    k = X.key(); tot = {"input_tokens": 0, "output_tokens": 0, "cache_read_input_tokens": 0}
    print(f"{a.job}: {len(units)} units, model {a.model}, out {out}", flush=True)
    for f, name in units:
        rpath = os.path.join(out, f"{a.job}-{name}.md"); jpath = os.path.join(out, f"{a.job}-{name}.json")
        if os.path.exists(jpath): print("skip (done)", name); continue
        if not os.path.exists(rpath):
            X.SYSTEM = REVIEW[a.job]
            text, u = X.call(k, a.model, ctx, None, f)
            open(rpath, "w").write(f"# API {a.job} review: {f}\n\n{text}\n")
            for x in tot: tot[x] += u.get(x, 0) or 0
        # ruling: the edit target is the recap file for recaps, else the file itself
        tgt = target or f
        X.SYSTEM = A.SYSTEM
        body = open(rpath).read()
        extra = f"\n\nChapter as it stands now ({f}), for reference only; edits go to {tgt}:\n{open(os.path.join(X.ROOT, f)).read()}" if target else ""
        tmp = os.path.join(out, f".req-{a.job}-{name}.txt")
        src = "" if target else f"\n\nFile source follows ({tgt}).\n\n{open(os.path.join(X.ROOT, tgt)).read()}"
        open(tmp, "w").write(f"Review report for {tgt}:\n\n{body}{extra}{src}\n\nEvery edit's \"old\" must be copied from {tgt}.")
        rctx = ctx if target else f"{ctx}\n\nStory bible (private):\n{open(A.BIBLE).read()}"
        text, u = X.call(k, a.model, rctx, None, os.path.relpath(tmp, X.ROOT)); os.remove(tmp)
        for x in tot: tot[x] += u.get(x, 0) or 0
        m = re.search(r"\{.*\}", text, re.S)
        try: data = json.loads(m.group(0)) if m else None
        except json.JSONDecodeError: data = None
        if data is None: open(jpath.replace(".json", ".raw.txt"), "w").write(text); print("BAD JSON", name, flush=True); continue
        data["file"] = tgt; json.dump(data, open(jpath, "w"), indent=1)
        print(f"done {name}: {len(data.get('edits', []))} confirmed, {len(data.get('rejected', []))} rejected", flush=True)
    print("totals", tot)

if __name__ == "__main__":
    main()
