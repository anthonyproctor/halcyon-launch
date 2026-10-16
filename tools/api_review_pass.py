#!/usr/bin/env python3
"""Story continuity and copy passes over the PMP book on the Claude API (prepaid API credits, not Claude Code usage).

Same plumbing as tools/api_exam_pass.py, with two other reviewers:
  continuity  each chapter against the private story bible (full/BIBLE.md) and canon (halcyon-pmp.json): names, ages, dates and
              weekdays, who knows what when, reveals before their chapter, facts that contradict an earlier chapter, repeated lines
  copy        each chapter for the listener: dashes and spaced hyphens, lines a narrator will trip on, unclear speaker turns,
              tics and repeated phrasing, tells that read as machine written, and said lines missing their data-who tag
Reports land in ~/Documents/halcyon-private/reviews/api-<pass>-pass-<date>/. Nothing in the repo is edited; halcyon-copilot
verifies each finding before anything changes. Key from the keychain (account "halcyon", service "anthropic-api-key");
HALCYON_API_WORKSPACE names the workspace when the key isn't scoped to one.

usage: tools/api_review_pass.py continuity|copy [--only ch03,ch04] [--model MODEL] [--dry-run]
"""
import argparse, datetime, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import api_exam_pass as X  # key(), call plumbing, ROOT, WS

BIBLE = os.path.join(X.ROOT, "full/BIBLE.md")
CANON = os.path.expanduser("~/Documents/halcyon-private/canon/halcyon-pmp.json")

PROMPTS = {
"continuity": """You are the continuity editor for "Halcyon", a PMP study course told as a fifteen chapter story (Sam Okafor, a Mars mission program). The reader studies by listening.
You get the private story bible and the canon file (characters, ages, timeline, who knows what and when, reveal levels, rules), then one chapter's source.
Check the chapter against them: names and spellings, ages, dates and weekdays (check the weekday really falls on that date in the story's year), titles and roles, places, who knows what at this point, any reveal or detail that comes before the chapter the bible or canon allows, facts that contradict the bible's account of earlier chapters, a character speaking who shouldn't be present, and the same line or beat repeated within the chapter.
Report only real problems, ranked by how much a listener would notice. For each: where (scene id or page), what's wrong, the source that says otherwise, and exact replacement text in the book's voice (plain words, contractions, no em or en dashes, no spaced hyphens). If clean, say PASS and list what you checked. Be concise.""",
"copy": """You are the copy editor for "Halcyon", a PMP study course told as a story and narrated by text to speech (each said line is a <span class="said" data-who="Name"> with an optional data-tone delivery cue).
House rules: plain words, contractions, no em dashes or en dashes, no spaced hyphens, they/them unless stated, and nothing that reads as machine written (tidy triads, "not X but Y" constructions, stacked rhetorical questions, inflated words).
Check the chapter for: rule breaks; sentences a narrator will trip on or that are ambiguous when heard (long nested clauses, numbers or abbreviations that read badly aloud, a pronoun whose speaker is unclear by ear); said lines with a missing or wrong data-who, or quoted speech outside a said span; a data-tone cue that fights the line; repeated words or tics within the chapter; and machine-written tells.
Report only real problems, ranked by how much a listener would notice. For each: where (scene id or page), the exact current text, and exact replacement text. Don't touch quiz keys or the teaching. If clean, say PASS. Be concise.""",
}

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("kind", choices=list(PROMPTS)); ap.add_argument("--only"); ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--model", default=os.environ.get("HALCYON_API_MODEL", "claude-opus-5-5"))
    a = ap.parse_args()
    fs = [os.path.join("full/v2", f) for f in sorted(os.listdir(os.path.join(X.ROOT, "full/v2"))) if re.fullmatch(r"ch\d\d\.js", f)]
    if a.only: fs = [f for f in fs if any(w in f for w in a.only.split(","))]
    out = os.path.expanduser(f"~/Documents/halcyon-private/reviews/api-{a.kind}-pass-{datetime.date.today().isoformat()}")
    ctx = (f"Story bible (private):\n{open(BIBLE).read()}\n\nCanon (private):\n{open(CANON).read()}" if a.kind == "continuity"
           else "House copy rules are in the instructions.")
    print(f"{a.kind}: {len(fs)} files, model {a.model}, out {out}")
    if a.dry_run: return
    X.SYSTEM = PROMPTS[a.kind]
    k = X.key(); os.makedirs(out, exist_ok=True); tot = {"input_tokens": 0, "output_tokens": 0, "cache_read_input_tokens": 0}
    for f in fs:
        dest = os.path.join(out, os.path.basename(f).replace(".js", ".md"))
        if os.path.exists(dest): print("skip (done)", f); continue
        text, u = X.call(k, a.model, ctx, None, f)
        open(dest, "w").write(f"# API {a.kind} pass: {f} ({a.model}, {datetime.datetime.now():%Y-%m-%d %H:%M})\n\n{text}\n")
        for x in tot: tot[x] += u.get(x, 0) or 0
        print(f"done {f} (in {u.get('input_tokens')}, cached {u.get('cache_read_input_tokens')}, out {u.get('output_tokens')})", flush=True)
    print("totals", tot)

if __name__ == "__main__":
    main()
