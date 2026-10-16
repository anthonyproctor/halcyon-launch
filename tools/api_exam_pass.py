#!/usr/bin/env python3
"""Exam-accuracy pass over the PMP book on the Claude API (prepaid API credits, not Claude Code usage).

One request per file: each Full Course chapter (full/v2/chNN.js) and each mock exam file (mock/*.js). The model gets the
app's PMP task list (from engine.js), the private PMBOK 8 reference notes, and the file, and writes a findings report:
wrong keys, arguable keys, outdated terms, explanation errors, task-code mismatches, and copied source text, each with exact
replacement text. Reports land in ~/Documents/halcyon-private/reviews/api-exam-pass-<date>/ (private: they quote the course).
Nothing in the repo is edited; halcyon-copilot reads the reports, verifies each finding, and applies what holds up.

The API key comes from the macOS keychain (generic password, account "halcyon", service "anthropic-api-key"), is passed
only in the request header, and is never printed.

usage: tools/api_exam_pass.py [--only ch03,process] [--model MODEL] [--dry-run]
"""
import argparse, datetime, json, os, re, subprocess, sys, time, urllib.request, urllib.error

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REF = os.path.expanduser("~/Documents/halcyon-private/sources/PMBOK8_reference.md")
WS = os.environ.get("HALCYON_API_WORKSPACE", "")  # needed when the key isn't scoped to a workspace (Console > Settings > Workspaces, wrkspc_...)
OUT = os.path.expanduser(f"~/Documents/halcyon-private/reviews/api-exam-pass-{datetime.date.today().isoformat()}")

SYSTEM = """You are an exam-accuracy reviewer for a PMP study course told as a story. The learner studies by listening, so a wrong key teaches him something false.
Check every quiz item, its key and explanation, every decision scene's options and which one is scored best (s:3), every drill's math (exact), every exercise item, and the lesson text, against the current PMP exam and PMBOK Guide 8th edition (use the reference notes given) and PMI's current Examination Content Outline.
Report only real problems. For each: where (scene id or quiz index), what is wrong, why (cite the standard by name, no long quotes), and exact replacement text that fits the file's style (plain words, contractions, no em or en dashes, no spaced hyphens).
Sort findings into MUST FIX (wrong), ARGUABLE (a strong test taker could defend another answer), and NITS. Also flag any item whose task code doesn't match what it tests, and any text that looks copied from the PMBOK Guide.
If the file is clean, say PASS and list what you checked. Be concise. Don't rewrite story."""

def key():
    try:
        return subprocess.check_output(["security", "find-generic-password", "-a", "halcyon", "-s", "anthropic-api-key", "-w"], stderr=subprocess.DEVNULL).decode().strip()
    except subprocess.CalledProcessError:
        sys.exit("no API key: add one with  security add-generic-password -a halcyon -s anthropic-api-key -w  (it prompts; paste the key)")

def tasks():
    s = open(os.path.join(ROOT, "engine.js")).read()
    m = re.search(r"let TASKNAMES=(\{.*?\});", s, re.S)
    return m.group(1) if m else ""

def files(only):
    fs = [os.path.join("full/v2", f) for f in sorted(os.listdir(os.path.join(ROOT, "full/v2"))) if re.fullmatch(r"ch\d\d\.js", f)]
    fs += [os.path.join("mock", f) for f in sorted(os.listdir(os.path.join(ROOT, "mock"))) if f.endswith(".js")]
    if only:
        want = only.split(",")
        fs = [f for f in fs if any(w in f for w in want)]
    return fs

def call(k, model, ref, tl, rel):
    body = {"model": model, "max_tokens": 32000, "system": SYSTEM,
            "messages": [{"role": "user", "content": [
                {"type": "text", "text": ref if tl is None else f"PMP task codes used by the course:\n{tl}\n\nPMBOK 8 reference notes (private, for checking only):\n{ref}", "cache_control": {"type": "ephemeral"}},
                {"type": "text", "text": f"File to review: {rel}\n\n{open(os.path.join(ROOT, rel)).read()}"}]}]}
    req = urllib.request.Request("https://api.anthropic.com/v1/messages", data=json.dumps(body).encode(),
                                 headers={"x-api-key": k, "anthropic-version": "2023-06-01", "content-type": "application/json", **({"anthropic-workspace-id": WS} if WS else {})})
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=600) as r:
                d = json.load(r)
            text = "".join(b.get("text", "") for b in d.get("content", []))
            if d.get("stop_reason") == "max_tokens": text += "\n\n[TRUNCATED: hit max_tokens; rerun this file]"
            return text, d.get("usage", {})
        except urllib.error.HTTPError as e:
            msg = e.read().decode(errors="replace")[:300]
            if e.code in (429, 500, 529) and attempt < 3:
                time.sleep(20 * (attempt + 1)); continue
            raise SystemExit(f"{rel}: HTTP {e.code} {msg}")

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--only"); ap.add_argument("--model", default=os.environ.get("HALCYON_API_MODEL", "claude-opus-5-5")); ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()
    fs = files(a.only); ref = open(REF).read(); tl = tasks()
    print(f"{len(fs)} files, model {a.model}, out {OUT}")
    if a.dry_run:
        for f in fs: print(" ", f)
        return
    k = key(); os.makedirs(OUT, exist_ok=True); tot = {"input_tokens": 0, "output_tokens": 0, "cache_read_input_tokens": 0}
    for f in fs:
        dest = os.path.join(OUT, os.path.basename(os.path.dirname(f)) + "-" + os.path.basename(f).replace(".js", ".md"))
        if os.path.exists(dest): print("skip (done)", f); continue
        text, u = call(k, a.model, ref, tl, f)
        open(dest, "w").write(f"# API exam pass: {f} ({a.model}, {datetime.datetime.now():%Y-%m-%d %H:%M})\n\n{text}\n")
        for x in tot: tot[x] += u.get(x, 0) or 0
        verdict = "PASS" if re.search(r"\bPASS\b", text[:400]) and "MUST FIX" not in text else "findings"
        print(f"done {f}: {verdict} (in {u.get('input_tokens')}, cached {u.get('cache_read_input_tokens')}, out {u.get('output_tokens')})", flush=True)
    print("totals", tot)

if __name__ == "__main__":
    main()
