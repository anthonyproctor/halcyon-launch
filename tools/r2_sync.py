#!/usr/bin/env python3
"""Sync Halcyon's narration mp3s to the Cloudflare R2 bucket and keep audio-manifest.json in step. See docs/AUDIO_HOSTING.md.

Keys are content-addressed but keep the repo path: one take of audio/v2/pages/f1/open.mp3 is the key audio/v2/pages/f1/open.<h>.mp3, where <h> is
the first 12 hex of that file's MD5 (key_of() here, audKey() in engine.js). audio-manifest.json maps each repo path to the <h> the current code
should play. Only mp3s are synced; JSON (timings, audiobook.json, bookmarks.json, episodes) stays in git and on Vercel.

Cache policy (why a re-render is safe): a re-render makes a new key and never touches the old one. The deployed site keeps playing the take its
own manifest names, which matches its own timings, until the new manifest deploys with the new timings. A Vercel rollback or a git revert points
back at a take that's still there. Because no key ever changes its bytes, objects are stored "public, max-age=31536000, immutable".
A manifest entry is written only after this tool has uploaded that exact take and R2's ETag matched its MD5. Uploads are single PUTs with
Content-MD5, so the ETag is the MD5 and a damaged body is rejected. Old takes stay in the bucket until --prune, which never deletes a take that the
working tree, HEAD, or the live site's manifest still names.

Credentials come from the macOS keychain (generic passwords, account "halcyon"): r2-access-key-id, r2-secret-access-key, r2-endpoint.
They reach the AWS CLI through its environment only (endpoint too, as AWS_ENDPOINT_URL_S3), never a command line, and are never printed:
every error is scrubbed of them, of the endpoint host and of anything shaped like an account id.

usage:
  tools/r2_sync.py [--course ID ...] [--chapter N] [--dry-run] [--force] [--prune [--yes]] [--if-configured] [--quiet]
  tools/r2_sync.py --check            local only: every manifest entry still matches its local file (run before a deploy; tools/pre-commit runs it)
  tools/r2_sync.py --verify [--base URL] [--all]   public URLs answer 206 to a Range with the right type, ETag, CORS, cache and download headers
  tools/r2_sync.py --pull [--base URL] [--course ID]  download the manifest's mp3s into a clone that doesn't have them (no credentials)
Courses: pmp = audio/ (v2 pages, both Audiobook editions, ambience, stings) + cast/voice/ + cast/v2/voice/;
         any other id = courses/<id>/audio/ + courses/<id>/cast/voice/. No --course = every course.
--chapter N (with one --course): that chapter's page clips (pages/fN, pages/fNs) and both editions (full-chNN.mp3, story/full-chNN.mp3).
--if-configured: no keychain credentials = exit 0 without a word (the render scripts' hook). It still drops manifest entries whose local file
  changed, so the re-render plays from this site's copy instead of R2's old take. Once config.js says HALCYON_AUDIO_REMOTE_ONLY (no site copy),
  that drop is reported loudly and exits 5: the chapter has no playable audio until a sync with credentials.
Nothing is ever deleted from the bucket without --prune; more than 25 deletions also needs --yes.
Test-only overrides: HALCYON_R2_ROOT, HALCYON_R2_MD5_CACHE, HALCYON_R2_LIVE_MANIFEST (tests/r2_sync.spec.mjs).
"""
import time
import argparse, base64, concurrent.futures as cf, hashlib, json, os, random, re, subprocess, sys, threading, urllib.error, urllib.parse, urllib.request

ROOT = os.environ.get("HALCYON_R2_ROOT") or os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MANIFEST = os.path.join(ROOT, "audio-manifest.json")
BUCKET = os.environ.get("HALCYON_R2_BUCKET", "halcyon-audio")
CACHE_CONTROL = "public, max-age=31536000, immutable"
HASH_LEN = 12
MD5_CACHE = os.environ.get("HALCYON_R2_MD5_CACHE") or os.path.expanduser("~/.cache/halcyon-r2/md5.json")
KEYCHAIN = {"AWS_ACCESS_KEY_ID": "r2-access-key-id", "AWS_SECRET_ACCESS_KEY": "r2-secret-access-key", "endpoint": "r2-endpoint"}
SITE_ORIGIN = "https://halcyon-launch.vercel.app"
LIVE_MANIFEST = os.environ.get("HALCYON_R2_LIVE_MANIFEST") or SITE_ORIGIN + "/audio-manifest.json"
PRUNE_LIMIT = 25

QUIET = False
def say(*a):
    if not QUIET: print(*a, flush=True)
def warn(*a): print(*a, file=sys.stderr, flush=True)

def key_of(rel, h):
    """The R2 key of one take: the repo path with the hash before .mp3 (engine.js audKey builds the same)."""
    return re.sub(r"\.mp3$", f".{h}.mp3", rel, flags=re.I)
def rel_of(key):
    m = re.fullmatch(r"(.+)\.([0-9a-f]{12})\.mp3", key, flags=re.I)
    return (m.group(1) + ".mp3", m.group(2)) if m else (None, None)

# ---------- scope ----------
def course_ids():
    ids = ["pmp"]
    cdir = os.path.join(ROOT, "courses")
    for c in sorted(os.listdir(cdir)) if os.path.isdir(cdir) else []:
        if c != "pmp" and any(os.path.isdir(os.path.join(cdir, c, d)) for d in ("audio", "cast/voice")): ids.append(c)
    return ids

def roots_of(course):
    if course == "pmp": return ["audio/", "cast/voice/", "cast/v2/voice/"]
    if not re.fullmatch(r"[a-z0-9_-]+", course): sys.exit(f"bad course id: {course}")
    return [f"courses/{course}/audio/", f"courses/{course}/cast/voice/"]

def chapter_filter(course, n):
    a = "audio/v2/" if course == "pmp" else f"courses/{course}/audio/"
    nn = f"{n:02d}"
    pre = (f"{a}pages/f{n}/", f"{a}pages/f{n}s/")
    whole = {f"{a}full-ch{nn}.mp3", f"{a}story/full-ch{nn}.mp3"}
    return lambda rel: rel.startswith(pre) or rel in whole

def local_files(roots, keep):
    out = {}
    for r in roots:
        base = os.path.join(ROOT, r)
        if not os.path.isdir(base): continue
        for dp, dns, fns in os.walk(base):
            dns[:] = [d for d in dns if not d.startswith(".")]
            for f in fns:
                if not f.lower().endswith(".mp3") or f.startswith("."): continue
                p = os.path.join(dp, f)
                if os.path.islink(p): continue
                rel = os.path.relpath(p, ROOT).replace(os.sep, "/")
                if keep(rel): out[rel] = p
    return out

# ---------- hashing (cached by absolute path + size + mtime + inode + ctime: ctime can't be set by copy tools, so a same-size re-render is seen) ----------
_md5_lock = threading.Lock()
def load_md5_cache():
    try: return json.load(open(MD5_CACHE))
    except Exception: return {}
def save_md5_cache(c):
    os.makedirs(os.path.dirname(MD5_CACHE), exist_ok=True)
    tmp = MD5_CACHE + ".tmp"; json.dump(c, open(tmp, "w")); os.replace(tmp, MD5_CACHE)
def md5_of(path, cache):
    st = os.stat(path); k = os.path.abspath(path); sig = [st.st_size, st.st_mtime_ns, st.st_ino, st.st_ctime_ns]
    with _md5_lock:
        hit = cache.get(k)
        if hit and hit[:4] == sig: return hit[4]
    h = hashlib.md5()
    with open(path, "rb") as f:
        for b in iter(lambda: f.read(1 << 20), b""): h.update(b)
    d = h.hexdigest()
    with _md5_lock: cache[k] = sig + [d]
    return d

# ---------- manifest ----------
def parse_manifest(j):
    f = (j or {}).get("files") or {}
    return {k: v for k, v in f.items() if isinstance(v, str) and re.fullmatch(r"[0-9a-f]{12}", v)}
def load_manifest():
    try: return parse_manifest(json.load(open(MANIFEST)))
    except FileNotFoundError: return {}
def save_manifest(files):
    body = {"about": "Written by tools/r2_sync.py, never by hand. Each entry: an mp3's repo path and the first 12 hex of the MD5 of the take this "
                     "code plays. engine.js AU() plays it from HALCYON_AUDIO_BASE/<path with .<hash> before .mp3>; anything unlisted plays from this "
                     "site. See docs/AUDIO_HOSTING.md.",
            "files": dict(sorted(files.items()))}
    tmp = MANIFEST + ".tmp"
    with open(tmp, "w") as f: json.dump(body, f, indent=0, separators=(",", ":")); f.write("\n")
    os.replace(tmp, MANIFEST)
def head_manifest():
    try:
        r = subprocess.run(["git", "-C", ROOT, "show", "HEAD:audio-manifest.json"], capture_output=True, text=True)
        return parse_manifest(json.loads(r.stdout)) if r.returncode == 0 else {}
    except Exception: return {}
def live_manifest():
    """The manifest the live site serves, or None if it can't be read (then --prune refuses)."""
    try:
        with urllib.request.urlopen(urllib.request.Request(LIVE_MANIFEST, headers={"Cache-Control": "no-cache", "User-Agent": "halcyon-r2-sync/1.0"}), timeout=20) as r:
            return parse_manifest(json.loads(r.read()))
    except urllib.error.HTTPError as e: return {} if e.code == 404 else None  # no manifest deployed yet: the live site names no take
    except Exception: return None

def config_js():
    try: return open(os.path.join(ROOT, "config.js")).read()
    except FileNotFoundError: return ""
def config_base():
    m = re.search(r'HALCYON_AUDIO_BASE\s*=\s*"([^"]*)"', config_js())
    return m.group(1).rstrip("/") if m else ""
def remote_only():
    return bool(re.search(r"HALCYON_AUDIO_REMOTE_ONLY\s*=\s*true\b", config_js()))

# ---------- credentials ----------
def keychain(service):
    try:
        r = subprocess.run(["security", "find-generic-password", "-a", "halcyon", "-s", service, "-w"], capture_output=True, text=True)
    except FileNotFoundError: return None
    v = r.stdout.strip() if r.returncode == 0 else ""
    return v or None
def endpoint_of(v):
    """r2-endpoint may be the full S3 API URL, the host, or the bare 32-hex account id."""
    v = v.strip().rstrip("/")
    if re.fullmatch(r"[0-9a-f]{32}", v): return f"https://{v}.r2.cloudflarestorage.com"
    if not re.match(r"^https?://", v): v = "https://" + v
    return v if re.fullmatch(r"https://[A-Za-z0-9.-]+\.[A-Za-z]{2,}(:\d+)?", v) else None
def credentials(loud=False):
    """The three keychain items, or None. A value too short to be real (a placeholder) counts as missing. Values are never shown."""
    vals = {k: keychain(s) for k, s in KEYCHAIN.items()}
    problems = [KEYCHAIN[k] + " missing" for k, v in vals.items() if not v]
    if vals["AWS_ACCESS_KEY_ID"] and len(vals["AWS_ACCESS_KEY_ID"]) < 20: problems.append("r2-access-key-id looks like a placeholder (R2 key ids are 32 characters)")
    if vals["AWS_SECRET_ACCESS_KEY"] and len(vals["AWS_SECRET_ACCESS_KEY"]) < 40: problems.append("r2-secret-access-key looks like a placeholder (R2 secrets are 64 characters)")
    if vals["endpoint"]:
        ep = endpoint_of(vals["endpoint"])
        if not ep: problems.append("r2-endpoint isn't a URL, host or account id")
        else: vals["endpoint"] = ep
    if problems:
        if loud: warn("R2 credentials not usable (keychain account halcyon): " + "; ".join(problems))
        return None
    return vals

class R2:
    """The AWS CLI pointed at R2. Keys and endpoint go in its environment only; every error is scrubbed before it's shown."""
    def __init__(self, creds, bucket):
        self.bucket = bucket
        ep = creds["endpoint"].rstrip("/")
        env = {k: v for k, v in os.environ.items() if not k.startswith("AWS_")}  # no profile, endpoint or CA override from the shell
        env.update(AWS_ACCESS_KEY_ID=creds["AWS_ACCESS_KEY_ID"], AWS_SECRET_ACCESS_KEY=creds["AWS_SECRET_ACCESS_KEY"], AWS_DEFAULT_REGION="auto",
                   AWS_ENDPOINT_URL_S3=ep, AWS_CONFIG_FILE=os.devnull, AWS_SHARED_CREDENTIALS_FILE=os.devnull, AWS_PAGER="",
                   AWS_REQUEST_CHECKSUM_CALCULATION="when_required", AWS_RESPONSE_CHECKSUM_VALIDATION="when_required")  # R2 and the CLI's newer default checksums
        self.env = env
        host = urllib.parse.urlparse(ep).hostname or ""
        self.secrets = [s for s in (creds["AWS_SECRET_ACCESS_KEY"], creds["AWS_ACCESS_KEY_ID"], ep, host) if s]
    def scrub(self, s):
        for x in self.secrets: s = s.replace(x, "<redacted>")
        return re.sub(r"\b[0-9a-f]{32}\b", "<redacted>", s).strip()  # an account id (or anything shaped like one) in a host-only error
    def api(self, *args):
        try:
            r = subprocess.run(["aws", "s3api", *args, "--bucket", self.bucket, "--output", "json", "--no-cli-pager"], capture_output=True, text=True, env=self.env)
        except FileNotFoundError: raise RuntimeError("the AWS CLI (aws) isn't installed or isn't on PATH")
        if r.returncode != 0: raise RuntimeError(self.scrub(r.stderr or r.stdout or f"aws exited {r.returncode}"))
        try: return json.loads(r.stdout) if r.stdout.strip() else {}
        except ValueError: raise RuntimeError("the AWS CLI answered with something that isn't JSON")
    def list(self, prefix):
        j = self.api("list-objects-v2", "--prefix", prefix)
        return {o["Key"]: {"etag": o.get("ETag", "").strip('"'), "size": o.get("Size", 0)} for o in (j.get("Contents") or [])}
    def head_md5(self, key):
        try: j = self.api("head-object", "--key", key)
        except RuntimeError: return None
        return (j.get("Metadata") or {}).get("md5")
    def put(self, key, path, md5hex, disposition=None):
        args = ["put-object", "--key", key, "--body", path, "--content-type", "audio/mpeg", "--cache-control", CACHE_CONTROL,
                "--content-md5", base64.b64encode(bytes.fromhex(md5hex)).decode(), "--metadata", f"md5={md5hex}"]
        if disposition: args += ["--content-disposition", disposition]
        j = self.api(*args)  # one PUT, never multipart, so the ETag is the MD5 and R2 rejects a body that arrived damaged
        return j.get("ETag", "").strip('"')
    def delete(self, key): self.api("delete-object", "--key", key)

def disposition_of(rel):
    """Whole-chapter files get a download name: a cross-origin <a download> is ignored by browsers, so the header does that job."""
    m = re.search(r"(?:^|/)audio/(?:v2/)?(story/)?full-ch(\d+)\.mp3$", rel)
    if not m: return None
    course = re.match(r"courses/([a-z0-9_-]+)/", rel); course = course.group(1) if course else "pmp"
    return f'attachment; filename="halcyon-{course}-ch{m.group(2)}-{"story" if m.group(1) else "study"}.mp3"'

# ---------- commands ----------
def cmd_check(args):
    files = load_manifest()
    if not files: say("audio-manifest.json is empty or missing: nothing plays from R2"); return 0
    cache = load_md5_cache(); bad = []; absent = 0
    for rel, h in sorted(files.items()):
        p = os.path.join(ROOT, rel)
        if not os.path.isfile(p): absent += 1
        elif md5_of(p, cache)[:HASH_LEN] != h: bad.append(rel)
    save_md5_cache(cache)
    if bad:
        warn(f"{len(bad)} manifest entr{'y' if len(bad)==1 else 'ies'} no longer match the local file (re-rendered, not synced):")
        for b in bad[:30]: warn("  " + b)
        warn("run tools/r2_sync.py (with credentials) before committing or deploying"); return 1
    say(f"audio-manifest.json: {len(files) - absent} entries match the local files" + (f"; {absent} have no local file here, not checked" if absent else ""))
    return 0

def _base(args):
    base = (args.base or config_base()).rstrip("/")
    if not base: warn("no base URL: pass --base https://<audio domain> (config.js HALCYON_AUDIO_BASE is empty)")
    return base
def _url(base, rel, h): return f"{base}/{urllib.parse.quote(key_of(rel, h))}"

def cmd_verify(args):
    base = _base(args)
    if not base: return 2
    files = load_manifest()
    if not files: warn("audio-manifest.json is empty: sync first"); return 2
    keys = sorted(files)
    if not args.all:
        whole = [k for k in keys if "full-ch" in k]
        rest = [k for k in keys if k not in whole]
        keys = whole + random.sample(rest, min(20, len(rest)))
    fails = []
    def one(rel):
        req = urllib.request.Request(_url(base, rel, files[rel]), method="GET", headers={"Range": "bytes=0-1", "Origin": SITE_ORIGIN, "User-Agent": "halcyon-r2-verify"})
        try:
            with urllib.request.urlopen(req, timeout=20) as r:
                h = r.headers; r.read(); prob = []
                if r.status != 206: prob.append(f"Range answered {r.status}, not 206")
                if (h.get("Content-Type") or "").split(";")[0] != "audio/mpeg": prob.append(f"Content-Type {h.get('Content-Type')}")
                if h.get("Access-Control-Allow-Origin") not in (SITE_ORIGIN, "*"): prob.append("no CORS header for " + SITE_ORIGIN)
                et = (h.get("ETag") or "").replace("W/", "").strip('"')
                if et and not et.startswith(files[rel]): prob.append("ETag isn't the manifest's take")
                if "immutable" not in (h.get("Cache-Control") or ""): prob.append(f"Cache-Control {h.get('Cache-Control')}")
                if "full-ch" in rel and "attachment" not in (h.get("Content-Disposition") or ""): prob.append("no download Content-Disposition")
                return rel, prob
        except urllib.error.HTTPError as e: return rel, [f"HTTP {e.code}"]
        except Exception as e: return rel, [type(e).__name__ + ": " + str(e)[:120]]
    with cf.ThreadPoolExecutor(8) as ex:
        for rel, prob in ex.map(one, keys):
            if prob: fails.append((rel, prob))
    for rel, prob in fails: warn(f"FAIL {rel}: {'; '.join(prob)}")
    say(f"verify {base}: {len(keys) - len(fails)}/{len(keys)} ok" + ("" if args.all else " (all whole chapters + 20 random clips; --all for every file)"))
    return 1 if fails else 0

def cmd_pull(args):
    """Fill a clone (or CI) with the takes the manifest names, from the public base. No credentials needed; local files that match are skipped."""
    base = _base(args)
    if not base: return 2
    files = load_manifest()
    if args.course: files = {k: v for k, v in files.items() if any(k.startswith(r) for c in args.course for r in roots_of(c))}
    if args.match: files = {k: v for k, v in files.items() if any(re.search(m, k) for m in args.match)}
    cache = load_md5_cache(); need = []
    for rel, h in sorted(files.items()):
        p = os.path.join(ROOT, rel)
        if not (os.path.isfile(p) and md5_of(p, cache)[:HASH_LEN] == h): need.append(rel)
    say(f"{len(files)} manifest mp3s, {len(need)} to download")
    def one(rel):  # retries: a file's first read from R2 can be slow before Cloudflare caches it
        for attempt in range(4):
            rel_, err = one_try(rel)
            if not err: return rel_, None
            time.sleep(2 * (attempt + 1))
        return rel_, err
    def one_try(rel):
        p = os.path.join(ROOT, rel); tmp = p + ".part"
        try:
            os.makedirs(os.path.dirname(p), exist_ok=True); h = hashlib.md5()
            with urllib.request.urlopen(urllib.request.Request(_url(base, rel, files[rel]), headers={"User-Agent": "halcyon-r2-sync/1.0"}), timeout=180) as r, open(tmp, "wb") as f:
                for b in iter(lambda: r.read(1 << 20), b""): h.update(b); f.write(b)
            if h.hexdigest()[:HASH_LEN] != files[rel]: os.remove(tmp); return rel, "content doesn't match the manifest hash"
            os.replace(tmp, p); return rel, None
        except Exception as e:
            if os.path.exists(tmp): os.remove(tmp)
            return rel, type(e).__name__ + ": " + str(e)[:120]
    bad = 0
    if not args.dry_run:
        with cf.ThreadPoolExecutor(16) as ex:
            for rel, err in ex.map(one, need):
                if err: bad += 1; warn(f"FAIL {rel}: {err}")
    save_md5_cache(cache)
    return 1 if bad else 0

def cmd_sync(args):
    if args.chapter is not None and (not args.course or len(args.course) != 1): sys.exit("--chapter needs exactly one --course")
    courses = args.course or course_ids()
    keep = chapter_filter(courses[0], args.chapter) if args.chapter is not None else (lambda rel: True)
    roots = [r for c in courses for r in roots_of(c)]
    local = local_files(roots, keep)
    in_scope = lambda rel: keep(rel) and any(rel.startswith(r) for r in roots)
    cache = load_md5_cache()
    with cf.ThreadPoolExecutor(4) as ex: md5 = dict(zip(local, ex.map(lambda r: md5_of(local[r], cache), local)))
    save_md5_cache(cache)
    manifest = load_manifest(); before = dict(manifest)
    # an entry whose local file changed names a take that no longer matches this tree's timings: drop it, re-add below once the new take uploads
    for rel, d in md5.items():
        if rel in manifest and manifest[rel] != d[:HASH_LEN]: del manifest[rel]
    stale = sorted(set(before) - set(manifest))
    creds = credentials(loud=not args.if_configured)
    if not creds:
        if stale and not args.dry_run: save_manifest(manifest)
        if stale and remote_only():
            warn(f"R2 audio: {len(stale)} re-rendered file(s) can't upload (no keychain credentials), and this site has no copy to fall back to "
                 f"(HALCYON_AUDIO_REMOTE_ONLY). They have NO playable audio until you run tools/r2_sync.py with credentials:")
            for rel in stale[:20]: warn("  " + rel)
            return 5
        if args.if_configured: return 0
        if args.dry_run:
            say(f"dry run, local only: {len(local)} mp3s in scope, {sum(os.path.getsize(p) for p in local.values())/1e6:.0f} MB")
            for rel in stale: say(f"  manifest would drop (local file changed): {rel}")
            return 0
        return 3
    r2 = R2(creds, args.bucket)
    remote = {}
    try:
        for r in roots: remote.update(r2.list(r))
    except RuntimeError as e: warn("R2 list failed: " + str(e)); return 4
    todo, same = [], []
    for rel in sorted(local):
        d = md5[rel]; k = key_of(rel, d[:HASH_LEN]); o = remote.get(k)
        if not args.force and o and (o["etag"] == d or ("-" in o["etag"] and r2.head_md5(k) == d)): same.append(rel)
        else: todo.append(rel)
    gone = []
    if args.prune:
        live = live_manifest()
        if live is None: warn(f"refusing --prune: couldn't read the live manifest ({LIVE_MANIFEST}), so a take it still plays might be deleted")
        else:
            named = set()
            for m in (manifest, before, head_manifest(), live): named |= {key_of(rel, h) for rel, h in m.items()}
            named |= {key_of(rel, md5[rel][:HASH_LEN]) for rel in local}
            gone = sorted(k for k in remote if k.lower().endswith(".mp3") and k not in named and in_scope(rel_of(k)[0] or k))
    size = sum(os.path.getsize(local[r]) for r in todo)
    (print if (todo or gone) else say)(f"{len(local)} local mp3s in scope: {len(same)} already on R2, {len(todo)} to upload ({size/1e6:.0f} MB)"
        + (f", {len(gone)} old takes to delete (--prune)" if args.prune else ""))
    if args.dry_run:
        for rel in todo[:40]: say("  upload " + rel)
        if len(todo) > 40: say(f"  ... and {len(todo) - 40} more")
        for k in gone: say("  delete " + k)
        return 0
    for rel in same: manifest[rel] = md5[rel][:HASH_LEN]
    failed = []
    def up(rel):
        try:
            et = r2.put(key_of(rel, md5[rel][:HASH_LEN]), local[rel], md5[rel], disposition_of(rel))
            return rel, None if et == md5[rel] else "ETag after upload didn't match the file's MD5"
        except RuntimeError as e: return rel, str(e)[:300]
    done = 0
    with cf.ThreadPoolExecutor(4) as ex:
        for rel, err in ex.map(up, todo):
            done += 1
            if err: failed.append(rel); manifest.pop(rel, None); warn(f"upload failed {rel}: {err}")
            else:
                manifest[rel] = md5[rel][:HASH_LEN]; remote[key_of(rel, manifest[rel])] = {"etag": md5[rel]}
                if not QUIET and (done % 25 == 0 or done == len(todo)): say(f"  uploaded {done}/{len(todo)}")
    # an entry whose take isn't in the bucket would send readers to a 404 (they'd fall back, but slower): drop it
    for rel in list(manifest):
        if in_scope(rel) and key_of(rel, manifest[rel]) not in remote: del manifest[rel]
    if gone:
        if not local: warn("refusing --prune: no local files in scope (a clone without audio shouldn't decide what to delete)"); gone = []
        elif len(gone) > PRUNE_LIMIT and not args.yes: warn(f"refusing --prune of {len(gone)} objects without --yes"); gone = []
        for k in gone:
            try: r2.delete(k); say("  deleted " + k)
            except RuntimeError as e: warn(f"delete failed {k}: {e}")
    if manifest != before: save_manifest(manifest); print(f"audio-manifest.json updated ({len(manifest)} entries); commit it with the chapter")
    if failed: warn(f"{len(failed)} upload(s) failed; those files play from this site until a re-run succeeds"); return 1
    return 0

def main():
    global QUIET
    ap = argparse.ArgumentParser(description="Sync narration mp3s to Cloudflare R2 (docs/AUDIO_HOSTING.md)")
    ap.add_argument("--course", action="append", help="course id (repeatable); default every course")
    ap.add_argument("--chapter", type=int, help="only this chapter's files (needs one --course)")
    ap.add_argument("--dry-run", action="store_true", help="show what would change; upload, delete and write nothing")
    ap.add_argument("--force", action="store_true", help="re-upload every file in scope (after a header policy change)")
    ap.add_argument("--prune", action="store_true", help="also delete old takes in scope that nothing (tree, HEAD, live site) names")
    ap.add_argument("--yes", action="store_true", help=f"allow --prune to delete more than {PRUNE_LIMIT} objects")
    ap.add_argument("--if-configured", action="store_true", help="exit 0 silently when the keychain has no R2 credentials")
    ap.add_argument("--quiet", action="store_true", help="print only problems and the summary of a real change")
    ap.add_argument("--bucket", default=BUCKET)
    ap.add_argument("--check", action="store_true", help="local only: manifest entries still match local files")
    ap.add_argument("--verify", action="store_true", help="check the public URLs")
    ap.add_argument("--base", help="public base URL for --verify/--pull (default: config.js HALCYON_AUDIO_BASE)")
    ap.add_argument("--all", action="store_true", help="--verify every manifest entry")
    ap.add_argument("--match", action="append", help="--pull only files whose repo path matches this regex (repeatable); CI uses it to fetch just what the tests play")
    ap.add_argument("--pull", action="store_true", help="download the manifest's mp3s from the public base into this tree (fresh clones, CI)")
    a = ap.parse_args()
    QUIET = a.quiet
    if a.check: return cmd_check(a)
    if a.verify: return cmd_verify(a)
    if a.pull: return cmd_pull(a)
    return cmd_sync(a)

if __name__ == "__main__":
    sys.exit(main())
