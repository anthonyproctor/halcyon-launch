#!/usr/bin/env python3
"""Apply the confirmed edits from tools/api_adjudicate.py to the PMP files, safely.

An edit is applied only when its "old" text appears exactly once in the file at apply time; anything else is skipped and listed.
New text is checked for house rule breaks (em or en dashes, spaced hyphens) and skipped if it has one. Prints, per file, how many
edits applied, how many touch narrated text (those pages need a re-record), and the skips. --dry-run changes nothing.

usage: tools/api_apply_edits.py [--date YYYY-MM-DD] [--only ch03,process] [--dry-run]
"""
import argparse, datetime, glob, json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REV = os.path.expanduser("~/Documents/halcyon-private/reviews")
BAD = re.compile(r"[–—]| - ")

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--date", default=datetime.date.today().isoformat()); ap.add_argument("--only"); ap.add_argument("--dry-run", action="store_true"); ap.add_argument("--dir", help="reviews subfolder, default api-adjudicate-<date>")
    a = ap.parse_args()
    tot = {"applied": 0, "narrated": 0, "skipped": 0}
    for j in sorted(glob.glob(os.path.join(REV, a.dir or f"api-adjudicate-{a.date}", "*.json"))):
        d = json.load(open(j)); rel = d["file"]
        if a.only and not any(w in rel or w in os.path.basename(j) for w in a.only.split(",")): continue
        p = os.path.join(ROOT, rel); s = open(p).read(); applied = []; skipped = []
        for e in d.get("edits", []):
            old, new = e.get("old", ""), e.get("new", "")
            if not old or old == new: skipped.append((e.get("id"), "empty or no change")); continue
            if BAD.search(new) and not BAD.search(old): skipped.append((e.get("id"), "new text breaks a dash rule")); continue
            if len(re.findall(r"\b[as]:\s*\d", old)) != len(re.findall(r"\b[as]:\s*\d", new)):
                skipped.append((e.get("id"), "adds or removes an option or key (would shift pick indices)")); continue
            n = s.count(old)
            if n != 1: skipped.append((e.get("id"), f"old text found {n} times")); continue
            s = s.replace(old, new); applied.append(e)
        nar = sum(1 for e in applied if e.get("narrated"))
        print(f"{rel}: {len(applied)} applied ({nar} narrated), {len(skipped)} skipped")
        for i, why in skipped: print(f"   skip {i}: {why}")
        if not a.dry_run and applied: open(p, "w").write(s)
        tot["applied"] += len(applied); tot["narrated"] += nar; tot["skipped"] += len(skipped)
    print("totals", tot, "(dry run)" if a.dry_run else "")

if __name__ == "__main__":
    main()
