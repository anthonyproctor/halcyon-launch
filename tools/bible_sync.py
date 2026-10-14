#!/usr/bin/env python3
"""Sync the private story bibles between this repo (gitignored copies) and the private backup folder, safely.

usage: python3 tools/bible_sync.py [--check] [--repo DIR] [--private DIR]
  --check     dry run: print what would happen, change nothing (exit 2 if anything conflicts)
  --repo      repo root (default: this repo)
  --private   private bibles folder (default ~/Documents/halcyon-private/bibles)

Pairs: every BIBLE*.md under full/ and courses/*/ in the repo, matched by path to the same file under --private.
Archive copies that exist only in the private folder (BIBLE.pre-something.md) are left alone.
A state file (<private>/.sync-state.json) keeps each pair's hash at the last sync, so the tool knows which side changed:
  same on both sides            nothing to do
  only one side changed         copy it over the other
  only one side exists          copy it across
  both changed since last sync  CONFLICT: nothing copied for that pair, exit 2 (merge by hand, then re-run)
  no state yet and they differ  the newer file (mtime) wins
Whatever gets overwritten is first saved to <private>/.history/<path>.<timestamp>.<repo|private>.bak, so nothing is lost.
Each real run also snapshots the private canon (../canon/*.json and build_canon.py, if present) into .history/canon-<timestamp>/.
Never prints file contents."""
import argparse, glob, hashlib, json, os, re, shutil, sys, time

def sha(p): return hashlib.sha256(open(p, "rb").read()).hexdigest() if os.path.exists(p) else None

def pairs(repo, private):
    rels = set()
    for pat in ("full/BIBLE*.md", "courses/*/BIBLE*.md"):
        for base in (repo, private):
            for p in glob.glob(os.path.join(base, pat)): rels.add(os.path.relpath(p, base))
    # archive copies kept only in the private folder (BIBLE.pre-something.md) stay there; they're history, not live bibles
    return sorted(x for x in rels if not (re.match(r"BIBLE[^/]*\.pre-[^/]*\.md$", os.path.basename(x)) and not os.path.exists(os.path.join(repo, x))))

def plan(repo, private, state):
    out = []
    for rel in pairs(repo, private):
        r, p = os.path.join(repo, rel), os.path.join(private, rel)
        hr, hp, last = sha(r), sha(p), state.get(rel)
        if hr == hp: act = "same"
        elif hp is None: act = "to_private"
        elif hr is None: act = "to_repo"
        elif last is None: act = "to_private" if os.path.getmtime(r) >= os.path.getmtime(p) else "to_repo"
        elif hr != last and hp == last: act = "to_private"
        elif hp != last and hr == last: act = "to_repo"
        else: act = "conflict"
        out.append((rel, act))
    return out

def backup(src, rel, side, hist, stamp):
    if not os.path.exists(src): return None
    dst = os.path.join(hist, rel.replace(os.sep, "__") + f".{stamp}.{side}.bak")
    os.makedirs(hist, exist_ok=True); shutil.copy2(src, dst); return dst

def main(argv=None):
    ap = argparse.ArgumentParser(); ap.add_argument("--check", action="store_true")
    ap.add_argument("--repo", default=os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")))
    ap.add_argument("--private", default=os.path.expanduser("~/Documents/halcyon-private/bibles"))
    a = ap.parse_args(argv)
    sp = os.path.join(a.private, ".sync-state.json"); hist = os.path.join(a.private, ".history")
    state = json.load(open(sp)) if os.path.exists(sp) else {}
    stamp = time.strftime("%Y%m%d-%H%M%S")
    steps = plan(a.repo, a.private, state); conflicts = [r for r, x in steps if x == "conflict"]
    for rel, act in steps:
        if act != "same": print(f"{act:10} {rel}")
    if a.check:
        print(f"check: {sum(1 for _, x in steps if x == 'same')} same, {len(steps) - len(conflicts) - sum(1 for _, x in steps if x == 'same')} to copy, {len(conflicts)} conflicts")
        return 2 if conflicts else 0
    for rel, act in steps:
        r, p = os.path.join(a.repo, rel), os.path.join(a.private, rel)
        if act == "to_private":
            backup(p, rel, "private", hist, stamp); os.makedirs(os.path.dirname(p), exist_ok=True); shutil.copy2(r, p)
        elif act == "to_repo":
            backup(r, rel, "repo", hist, stamp); os.makedirs(os.path.dirname(r), exist_ok=True); shutil.copy2(p, r)
        if act != "conflict": state[rel] = sha(r)
    canon = os.path.join(os.path.dirname(os.path.normpath(a.private)), "canon")
    if os.path.isdir(canon):
        snap = os.path.join(hist, f"canon-{stamp}"); files = glob.glob(os.path.join(canon, "*.json")) + glob.glob(os.path.join(canon, "build_canon.py"))
        if files:
            os.makedirs(snap, exist_ok=True)
            for f in files: shutil.copy2(f, snap)
    json.dump(state, open(sp, "w"), indent=1, sort_keys=True)
    for rel in conflicts: print(f"CONFLICT {rel}: both copies changed since the last sync. Nothing copied; merge by hand, then re-run.", file=sys.stderr)
    print(f"synced: {sum(1 for _, x in steps if x in ('to_private', 'to_repo'))} copied, {len(conflicts)} conflicts")
    return 2 if conflicts else 0

if __name__ == "__main__": sys.exit(main())
