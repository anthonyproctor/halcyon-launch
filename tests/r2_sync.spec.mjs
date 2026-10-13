// tools/r2_sync.py against a fake R2 (tests/fixtures/r2bin: a fake AWS CLI over a folder and a fake keychain), on a throwaway copy of the
// repo layout: keys equal repo paths, only changed files upload, the manifest carries each file's hash, --dry-run and no --prune change
// nothing remote, a re-render made without credentials drops its stale manifest entry, and no secret ever reaches a command line or the output.
import { test, expect } from "@playwright/test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { spawn, spawnSync } from "node:child_process";
import http from "node:http";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BIN = path.join(ROOT, "tests/fixtures/r2bin");
const KEY = "0123456789abcdef0123456789abcdef", SECRET = "f".repeat(30) + "9876543210" + "e".repeat(24), ACCOUNT = "a".repeat(32);
const ENDPOINT = `https://${ACCOUNT}.r2.cloudflarestorage.com`;
const FILES = ["audio/v2/pages/f1/open.mp3", "audio/v2/pages/f1s/story.mp3", "audio/v2/pages/f2/open.mp3", "audio/v2/full-ch01.mp3", "audio/v2/story/full-ch01.mp3",
  "audio/sting-open.mp3", "cast/v2/voice/sam.mp3", "courses/pilot/audio/pages/f1/open.mp3", "courses/pilot/audio/full-ch01.mp3"];
const md5 = f => crypto.createHash("md5").update(fs.readFileSync(f)).digest("hex");
const keyOf = (rel, h) => rel.replace(/\.mp3$/, `.${h}.mp3`); // tools/r2_sync.py key_of
const take = rel => keyOf(rel, md5(path.join(W.repo, rel)).slice(0, 12));

test.describe.configure({ mode: "serial" });
let W;
function setup(creds = true) {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), "halcyon-r2-"));
  W = { d, repo: path.join(d, "repo"), r2: path.join(d, "r2"), kc: path.join(d, "kc.json"), live: path.join(d, "live.json") };
  fs.writeFileSync(W.live, JSON.stringify({ files: {} })); // the live site's manifest (file:// stands in for https)
  for (const f of FILES) { const p = path.join(W.repo, f); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, crypto.randomBytes(2000 + FILES.indexOf(f))) }
  fs.mkdirSync(path.join(W.repo, "audio/v2/pages/f1"), { recursive: true }); fs.writeFileSync(path.join(W.repo, "audio/v2/pages/f1/timings.json"), "{}"); // JSON never syncs
  fs.mkdirSync(W.r2, { recursive: true });
  keychain(creds);
}
function keychain(creds) { fs.writeFileSync(W.kc, JSON.stringify(creds ? { "r2-access-key-id": KEY, "r2-secret-access-key": SECRET, "r2-endpoint": ACCOUNT } : {})) }
function sync(...args) {
  const r = spawnSync("python3", [path.join(ROOT, "tools/r2_sync.py"), ...args], { encoding: "utf8", env: { ...process.env, PATH: `${BIN}:${process.env.PATH}`,
    HALCYON_R2_ROOT: W.repo, HALCYON_R2_MD5_CACHE: path.join(W.d, "md5.json"), FAKE_KEYCHAIN: W.kc, FAKE_R2_DIR: W.r2,
    FAKE_EXPECT_KEY: KEY, FAKE_EXPECT_SECRET: SECRET, FAKE_EXPECT_ENDPOINT: ENDPOINT, HALCYON_R2_LIVE_MANIFEST: "file://" + W.live, ...(W.extraEnv || {}) } });
  const out = r.stdout + r.stderr;
  for (const s of [KEY, SECRET, ACCOUNT]) expect(out, "a secret was printed").not.toContain(s);
  return { code: r.status, out };
}
const manifest = () => { try { return JSON.parse(fs.readFileSync(path.join(W.repo, "audio-manifest.json"), "utf8")).files } catch (e) { return null } };
const remote = k => { try { return JSON.parse(fs.readFileSync(path.join(W.r2, "objects", k + ".meta.json"), "utf8")) } catch (e) { return null } };
const puts = () => fs.existsSync(path.join(W.r2, "argv.log")) ? fs.readFileSync(path.join(W.r2, "argv.log"), "utf8").trim().split("\n").filter(Boolean).map(JSON.parse).filter(a => a[1] === "put-object").map(a => a[a.indexOf("--key") + 1]) : [];

test.afterEach(() => { if (W) fs.rmSync(W.d, { recursive: true, force: true }) });

test("first sync uploads every mp3 under its repo path, with the headers, and writes the manifest", () => {
  setup();
  const r = sync("--quiet");
  expect(r.code, r.out).toBe(0);
  expect(puts().sort()).toEqual(FILES.map(take).sort()); // each take under its repo path with its hash before .mp3
  for (const f of FILES) {
    const m = remote(take(f));
    expect(m.etag, f).toBe(md5(path.join(W.repo, f)));
    expect(m.ContentType).toBe("audio/mpeg");
    expect(m.CacheControl).toBe("public, max-age=31536000, immutable");
    expect(m.Metadata.md5).toBe(m.etag);
    expect(!!m.ContentDisposition, f).toBe(/full-ch\d+\.mp3$/.test(f));
  }
  expect(remote(take("audio/v2/story/full-ch01.mp3")).ContentDisposition).toBe('attachment; filename="halcyon-pmp-ch01-story.mp3"');
  expect(remote(take("courses/pilot/audio/full-ch01.mp3")).ContentDisposition).toBe('attachment; filename="halcyon-pilot-ch01-study.mp3"');
  expect(remote("audio/v2/pages/f1/timings.json")).toBeNull();
  const M = manifest();
  expect(Object.keys(M).sort()).toEqual([...FILES].sort());
  for (const f of FILES) expect(M[f]).toBe(md5(path.join(W.repo, f)).slice(0, 12));
  const log = fs.readFileSync(path.join(W.r2, "argv.log"), "utf8");
  expect(log).not.toContain(KEY); expect(log).not.toContain(SECRET); expect(log).not.toContain(ACCOUNT); // keys and endpoint go by environment only
});

test("a re-run uploads nothing; a re-render uploads only that file and changes only its hash", () => {
  setup();
  expect(sync("--quiet").code).toBe(0);
  const M1 = manifest(), n1 = puts().length;
  let r = sync(); expect(r.code, r.out).toBe(0);
  expect(puts().length).toBe(n1);
  expect(r.out).toContain("0 to upload");
  const f = "audio/v2/pages/f1/open.mp3", old = take(f); fs.writeFileSync(path.join(W.repo, f), crypto.randomBytes(3000));
  r = sync("--quiet"); expect(r.code, r.out).toBe(0);
  expect(puts().slice(n1)).toEqual([take(f)]);
  expect(remote(old), "the old take stays for the deployed site").not.toBeNull();
  const M2 = manifest();
  expect(M2[f]).not.toBe(M1[f]);
  expect(M2[f]).toBe(md5(path.join(W.repo, f)).slice(0, 12));
  for (const k of FILES) if (k !== f) expect(M2[k]).toBe(M1[k]);
  expect(spawnSync("python3", [path.join(ROOT, "tools/r2_sync.py"), "--check"], { encoding: "utf8", env: { ...process.env, HALCYON_R2_ROOT: W.repo, HALCYON_R2_MD5_CACHE: path.join(W.d, "md5.json") } }).status).toBe(0);
});

test("--course and --chapter limit the scope; --dry-run uploads and writes nothing", () => {
  setup();
  let r = sync("--dry-run"); expect(r.code, r.out).toBe(0);
  expect(puts()).toEqual([]); expect(manifest()).toBeNull();
  expect(r.out).toContain(`${FILES.length} to upload`);
  r = sync("--quiet", "--course", "pmp", "--chapter", "1"); expect(r.code, r.out).toBe(0);
  expect(puts().sort()).toEqual(["audio/v2/full-ch01.mp3", "audio/v2/pages/f1/open.mp3", "audio/v2/pages/f1s/story.mp3", "audio/v2/story/full-ch01.mp3"].map(take));
  r = sync("--quiet", "--course", "pilot"); expect(r.code, r.out).toBe(0);
  expect(puts().filter(k => k.startsWith("courses/pilot/")).sort()).toEqual(["courses/pilot/audio/full-ch01.mp3", "courses/pilot/audio/pages/f1/open.mp3"].map(take));
  expect(Object.keys(manifest()).length).toBe(6);
  expect(sync("--chapter", "1").code).not.toBe(0); // a chapter needs exactly one course
});

test("nothing is deleted without --prune; --prune deletes only old takes nothing names (tree, HEAD, live site)", () => {
  setup();
  expect(sync("--quiet").code).toBe(0);
  const f = "audio/v2/pages/f2/open.mp3", g = "audio/v2/pages/f1/open.mp3", gOld = take(g), fKey = take(f);
  fs.rmSync(path.join(W.repo, f));                                      // a clip dropped from the chapter
  fs.writeFileSync(path.join(W.repo, g), crypto.randomBytes(2222));      // a re-render
  let r = sync("--quiet"); expect(r.code, r.out).toBe(0);
  expect(remote(fKey)).not.toBeNull(); expect(remote(gOld)).not.toBeNull();
  expect(manifest()[f]).toBeTruthy(); // still on R2, still playable
  fs.writeFileSync(W.live, JSON.stringify({ files: { [g]: gOld.match(/\.([0-9a-f]{12})\.mp3$/)[1] } })); // the live site still plays the old take
  r = sync("--prune", "--dry-run"); expect(r.code, r.out).toBe(0);
  expect(r.out).not.toContain("delete " + gOld);
  r = sync("--prune", "--quiet"); expect(r.code, r.out).toBe(0);
  expect(remote(gOld), "the live site's take survives").not.toBeNull();
  expect(remote(fKey), "still named by the local manifest").not.toBeNull();
  fs.writeFileSync(W.live, JSON.stringify({ files: {} }));
  const M = JSON.parse(fs.readFileSync(path.join(W.repo, "audio-manifest.json"), "utf8")); delete M.files[f]; fs.writeFileSync(path.join(W.repo, "audio-manifest.json"), JSON.stringify(M));
  r = sync("--prune", "--quiet"); expect(r.code, r.out).toBe(0);
  expect(remote(gOld)).toBeNull(); expect(remote(fKey)).toBeNull();
  expect(remote(take(g))).not.toBeNull();
  for (const k of FILES) if (k !== f) expect(remote(take(k)), k).not.toBeNull();
  W.live = path.join(W.d, "missing.json");                               // the live manifest can't be read: refuse
  r = sync("--prune"); expect(r.out).toContain("refusing --prune");
});

test("without credentials: the render hook is silent, and a re-render drops its stale manifest entry", () => {
  setup();
  expect(sync("--quiet").code).toBe(0);
  keychain(false);
  const f = "audio/v2/pages/f1/open.mp3", n = puts().length;
  let r = sync("--if-configured", "--quiet", "--course", "pmp", "--chapter", "1");
  expect(r.code).toBe(0); expect(r.out).toBe("");
  expect(manifest()[f]).toBeTruthy(); // unchanged file, entry kept
  fs.writeFileSync(path.join(W.repo, f), crypto.randomBytes(2500));
  r = sync("--if-configured", "--quiet", "--course", "pmp", "--chapter", "1");
  expect(r.code).toBe(0); expect(r.out).toBe("");
  expect(puts().length).toBe(n);
  expect(manifest()[f]).toBeUndefined(); // the app now plays this site's new take, not R2's old one
  r = sync(); expect(r.code).toBe(3); expect(r.out).toContain("r2-access-key-id missing");
  fs.writeFileSync(W.kc, JSON.stringify({ "r2-access-key-id": "pending1", "r2-secret-access-key": "pending1", "r2-endpoint": "pending1" }));
  r = sync(); expect(r.code).toBe(3); expect(r.out).toContain("placeholder");
});

test("--check fails when a manifest entry no longer matches its local file", () => {
  setup();
  expect(sync("--quiet").code).toBe(0);
  fs.writeFileSync(path.join(W.repo, "cast/v2/voice/sam.mp3"), crypto.randomBytes(999));
  const r = spawnSync("python3", [path.join(ROOT, "tools/r2_sync.py"), "--check"], { encoding: "utf8", env: { ...process.env, HALCYON_R2_ROOT: W.repo, HALCYON_R2_MD5_CACHE: path.join(W.d, "md5.json") } });
  expect(r.status).toBe(1);
  expect(r.stderr).toContain("cast/v2/voice/sam.mp3");
});

test("--pull fills a clone from the public base, and refuses a copy whose bytes don't match the manifest", async () => {
  setup();
  expect(sync("--quiet").code).toBe(0);
  const srv = http.createServer((req, res) => { const k = decodeURIComponent(new URL(req.url, "http://x").pathname.slice(1)), f = path.join(W.r2, "objects", k);
    if (!fs.existsSync(f)) { res.writeHead(404); return res.end() } res.writeHead(200, { "Content-Type": "audio/mpeg" }); fs.createReadStream(f).pipe(res) });
  await new Promise(ok => srv.listen(0, "127.0.0.1", ok));
  const base = `http://127.0.0.1:${srv.address().port}`;
  const run = (...a) => new Promise(ok => { const c = spawn("python3", [path.join(ROOT, "tools/r2_sync.py"), "--pull", "--base", base, ...a], { env: { ...process.env, HALCYON_R2_ROOT: W.repo, HALCYON_R2_MD5_CACHE: path.join(W.d, "md5.json") } });
    let out = ""; c.stdout.on("data", d => out += d); c.stderr.on("data", d => out += d); c.on("close", code => ok({ code, out })) });
  try {
    const want = md5(path.join(W.repo, FILES[0]));
    fs.rmSync(path.join(W.repo, FILES[0])); fs.rmSync(path.join(W.repo, FILES[3]));
    let r = await run(); expect(r.code, r.out).toBe(0); expect(r.out).toContain("2 to download");
    expect(md5(path.join(W.repo, FILES[0]))).toBe(want);
    fs.writeFileSync(path.join(W.r2, "objects", take(FILES[1])), "tampered"); fs.rmSync(path.join(W.repo, FILES[1]));
    r = await run(); expect(r.code).toBe(1); expect(r.out).toContain("doesn't match");
    expect(fs.existsSync(path.join(W.repo, FILES[1]))).toBe(false);
  } finally { await new Promise(ok => srv.close(ok)) }
});

test("remote-only mode: a re-render that can't upload is reported loudly, not skipped", () => {
  setup();
  expect(sync("--quiet").code).toBe(0);
  fs.writeFileSync(path.join(W.repo, "config.js"), 'window.HALCYON_AUDIO_BASE = "https://audio.example.com";\nwindow.HALCYON_AUDIO_REMOTE_ONLY = true;\n');
  keychain(false);
  fs.writeFileSync(path.join(W.repo, "audio/v2/pages/f1/open.mp3"), crypto.randomBytes(1234));
  const r = sync("--if-configured", "--quiet", "--course", "pmp", "--chapter", "1");
  expect(r.code).toBe(5);
  expect(r.out).toContain("NO playable audio");
  expect(r.out).toContain("audio/v2/pages/f1/open.mp3");
});

test("an error that names only the endpoint host never shows the account id", () => {
  setup();
  W.extraEnv = { FAKE_FAIL_WITH_HOST: "1" };
  const r = sync(); // sync() itself fails the test if KEY, SECRET or ACCOUNT appear
  expect(r.code).toBe(4);
  expect(r.out).toContain("<redacted>");
});
