#!/usr/bin/env python3
"""Exam-accuracy pass over the PMP book on the Claude API (prepaid API credits, not Claude Code usage).

One request per file: each Full Course chapter (full/v2/chNN.js) and each mock exam file (mock/*.js). The model gets the
app's PMP task list (from engine.js), the private PMBOK 8 reference notes, and the file, and writes a findings report:
wrong keys, arguable keys, outdated terms, explanation errors, task-code mismatches, and copied source text, each with exact
replacement text. Reports land in ~/Documents/halcyon-private/reviews/api-exam-pass-<date>/ (private: they quote the course).
Nothing in the repo is edited; halcyon-copilot reads the reports, verifies each finding, and applies what holds up.

By default the files go out as one Message Batches job (half price; results usually within an hour, at most 24). The batch
id is saved in the output folder, so if you stop the script while it waits, run the same command again to collect.
--now sends one request per file and waits for each (full price, results right away).

The API key comes from the macOS keychain (generic password, account "halcyon", service "anthropic-api-key"), is passed
only to the SDK client, and is never printed. Runs on the repo's .apivenv (python3 -m venv .apivenv; .apivenv/bin/pip install anthropic).

usage: .apivenv/bin/python tools/api_exam_pass.py [--only ch03,process] [--model MODEL] [--now] [--dry-run] [--out DIR]
"""
import argparse, datetime, json, os, re, subprocess, sys, time

try:
    import anthropic
except ImportError:
    sys.exit("needs the anthropic SDK: python3 -m venv .apivenv && .apivenv/bin/pip install anthropic, then run with .apivenv/bin/python")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REF = os.path.expanduser("~/Documents/halcyon-private/sources/PMBOK8_reference.md")
WS = os.environ.get("HALCYON_API_WORKSPACE", "")  # needed when the key isn't scoped to a workspace (Console > Settings > Workspaces, wrkspc_...)
OUT = os.path.expanduser(f"~/Documents/halcyon-private/reviews/api-exam-pass-{datetime.date.today().isoformat()}")
MAX_TOKENS = 32000

SYSTEM = """You are an exam-accuracy reviewer for a PMP study course told as a story. The learner studies by listening, so a wrong key teaches him something false.
Check every quiz item, its key and explanation, every decision scene's options and which one is scored best (s:3), every drill's math (exact), every exercise item, and the lesson text, against the current PMP exam and PMBOK Guide 8th edition (use the reference notes given) and PMI's current Examination Content Outline.
Report only real problems. For each: where (scene id or quiz index), what is wrong, why (cite the standard by name, no long quotes), and exact replacement text that fits the file's style (plain words, contractions, no em or en dashes, no spaced hyphens).
Sort findings into MUST FIX (wrong), ARGUABLE (a strong test taker could defend another answer), and NITS. Also flag any item whose task code doesn't match what it tests, and any text that looks copied from the PMBOK Guide.
If the file is clean, say PASS and list what you checked. Be concise. Don't rewrite story."""

def client():
    try:
        k = subprocess.check_output(["security", "find-generic-password", "-a", "halcyon", "-s", "anthropic-api-key", "-w"], stderr=subprocess.DEVNULL).decode().strip()
    except subprocess.CalledProcessError:
        sys.exit("no API key: add one with  security add-generic-password -a halcyon -s anthropic-api-key -w  (it prompts; paste the key)")
    return anthropic.Anthropic(api_key=k, default_headers={"anthropic-workspace-id": WS} if WS else None, max_retries=4)

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

def cid(rel):  # custom_id: letters, digits, _ and - only; also the report's file name
    return os.path.basename(os.path.dirname(rel)) + "-" + os.path.basename(rel).replace(".js", "")

def params(model, ref, tl, rel, ttl):
    cc = {"type": "ephemeral", **({"ttl": "1h"} if ttl else {})}
    return {"model": model, "max_tokens": MAX_TOKENS, "system": SYSTEM,
            "messages": [{"role": "user", "content": [
                {"type": "text", "text": ref if tl is None else f"PMP task codes used by the course:\n{tl}\n\nPMBOK 8 reference notes (private, for checking only):\n{ref}", "cache_control": cc},
                {"type": "text", "text": f"File to review: {rel}\n\n{open(os.path.join(ROOT, rel)).read()}"}]}]}

def write(out, rel, model, msg, tot):
    text = "".join(b.text for b in msg.content if b.type == "text")
    if msg.stop_reason == "max_tokens": text += "\n\n[TRUNCATED: hit max_tokens; rerun this file]"
    if msg.stop_reason == "refusal": text += "\n\n[REFUSED: the model declined this file; rerun it with --now]"
    open(os.path.join(out, cid(rel) + ".md"), "w").write(f"# API exam pass: {rel} ({model}, {datetime.datetime.now():%Y-%m-%d %H:%M})\n\n{text}\n")
    u = msg.usage
    for x in tot: tot[x] += getattr(u, x, 0) or 0
    verdict = "PASS" if re.search(r"\bPASS\b", text[:400]) and "MUST FIX" not in text else "findings"
    print(f"done {rel}: {verdict} (in {u.input_tokens}, cached {u.cache_read_input_tokens}, out {u.output_tokens})", flush=True)

def run_now(c, model, todo, ref, tl, out, tot):
    for f in todo:
        with c.messages.stream(**params(model, ref, tl, f, ttl=False)) as s:
            write(out, f, model, s.get_final_message(), tot)

def run_batch(c, model, todo, ref, tl, out, tot):
    state = os.path.join(out, "batch.json")
    if os.path.exists(state):
        st = json.load(open(state)); print(f"resuming batch {st['id']}")
    else:
        if not todo: print("nothing to send"); return
        b = c.messages.batches.create(requests=[{"custom_id": cid(f), "params": params(model, ref, tl, f, ttl=True)} for f in todo])
        st = {"id": b.id, "model": model, "files": {cid(f): f for f in todo}, "created": datetime.datetime.now().isoformat(timespec="seconds")}
        json.dump(st, open(state, "w"), indent=1)
        print(f"batch {b.id} sent: {len(todo)} requests. Safe to stop now; run the same command again to collect.", flush=True)
    while True:
        b = c.messages.batches.retrieve(st["id"])
        if b.processing_status == "ended": break
        n = b.request_counts
        print(f"{datetime.datetime.now():%H:%M} {b.processing_status}: {n.processing} waiting, {n.succeeded} done, {n.errored} errored", flush=True)
        time.sleep(60)
    retry = []
    for r in c.messages.batches.results(st["id"]):  # any order: key by custom_id
        rel = st["files"].get(r.custom_id)
        if rel is None: continue
        if r.result.type == "succeeded":
            write(out, rel, st["model"], r.result.message, tot)
        else:
            detail = getattr(getattr(r.result, "error", None), "error", None)
            print(f"{r.result.type} {rel}: {getattr(detail, 'message', '') or r.result.type}", flush=True); retry.append(rel)
    os.rename(state, state.replace(".json", f"-{st['id'][-8:]}-done.json"))
    if retry: print("not done, rerun these:", ",".join(cid(f) for f in retry))

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--only"); ap.add_argument("--model", default=os.environ.get("HALCYON_API_MODEL", "claude-opus-5-5"))
    ap.add_argument("--now", action="store_true", help="one request at a time, full price, results right away")
    ap.add_argument("--dry-run", action="store_true"); ap.add_argument("--out", default=OUT)
    a = ap.parse_args()
    fs = files(a.only); ref = open(REF).read(); tl = tasks()
    todo = [f for f in fs if not os.path.exists(os.path.join(a.out, cid(f) + ".md"))]
    print(f"{len(fs)} files ({len(fs) - len(todo)} already done), model {a.model}, {'now' if a.now else 'batch'}, out {a.out}")
    if a.dry_run:
        for f in todo: print(" ", f, "->", cid(f))
        return
    os.makedirs(a.out, exist_ok=True); tot = {"input_tokens": 0, "output_tokens": 0, "cache_read_input_tokens": 0, "cache_creation_input_tokens": 0}
    c = client()
    (run_now if a.now else run_batch)(c, a.model, todo, ref, tl, a.out, tot)
    print("totals", tot, "" if a.now else "(batch: billed at half price)")

if __name__ == "__main__":
    main()
