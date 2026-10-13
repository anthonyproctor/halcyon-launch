// Narration audio hosted off-site (docs/AUDIO_HOSTING.md). With HALCYON_AUDIO_BASE set to a second local server on another origin (standing
// in for the R2 domain, serving the same files), every mp3 the engine plays (page narration, both Audiobook editions, the download link,
// cast voice samples, ambience, stings) comes from there as the manifest's take (<path>.<hash>.mp3), while JSON stays on the site; a 404 there falls back to the
// site's copy once and keeps playing; a file the manifest doesn't list never leaves the site. With the base empty (the live config) nothing
// changes. Every media element is forced muted before any page script runs, so nothing is heard on the machine running the tests.
import { test, expect } from "@playwright/test";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CH1 = "/#pmp/full/1";
const H = "0123456789ab"; // a take hash: 12 hex, as tools/r2_sync.py writes them
const K = rel => rel.replace(/\.mp3$/, `.${H}.mp3`); // the take's key, as engine.js audKey builds it

// every mp3 the site can play, as the manifest tools/r2_sync.py writes would list it (hash faked: the server below serves any take of a file from the repo copy)
function mp3s(dir) {
  const out = [], base = path.join(ROOT, dir);
  if (!fs.existsSync(base)) return out;
  for (const e of fs.readdirSync(base, { withFileTypes: true, recursive: true })) if (e.isFile() && e.name.endsWith(".mp3")) out.push(path.relative(ROOT, path.join(e.parentPath || e.path, e.name)).split(path.sep).join("/"));
  return out;
}
const SCOPES = ["audio", "cast/voice", "cast/v2/voice", ...fs.readdirSync(path.join(ROOT, "courses")).flatMap(c => [`courses/${c}/audio`, `courses/${c}/cast/voice`])];
const ALL = SCOPES.flatMap(mp3s);
const manifest = (drop = []) => ({ files: Object.fromEntries(ALL.filter(f => !drop.includes(f)).map(f => [f, H])) });

const silence = () => {
  const P = HTMLMediaElement.prototype, d = Object.getOwnPropertyDescriptor(P, "muted"), play = P.play;
  Object.defineProperty(P, "muted", { configurable: true, get() { return d.get.call(this) }, set() { d.set.call(this, true) } });
  P.play = function () { d.set.call(this, true); this.volume = 0; return play.call(this) };
  document.addEventListener("play", e => d.set.call(e.target, true), true);
};

// the stand-in audio host: serves repo mp3s only (anything else 404s), byte ranges, CORS like the bucket's policy; records every request
let srv, BASE;
const S = { hits: [], missing: new Set() };
test.beforeAll(async () => {
  srv = http.createServer((req, res) => {
    const u = new URL(req.url, "http://x"), key = decodeURIComponent(u.pathname).replace(/^\/+/, ""), m0 = /^(.+)\.([0-9a-f]{12})\.mp3$/.exec(key);
    const rel = m0 ? m0[1] + ".mp3" : key; // every take of a file is served from the repo copy
    S.hits.push({ rel, v: m0 ? m0[2] : null, query: u.search, origin: req.headers.origin || "" });
    const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Expose-Headers": "Content-Length, Content-Range, Accept-Ranges, ETag" };
    const f = path.join(ROOT, rel);
    if (!m0 || S.missing.has(rel) || !f.startsWith(ROOT + path.sep) || !fs.existsSync(f)) { res.writeHead(404, cors); res.end(); return }
    const size = fs.statSync(f).size, m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || "");
    if (m) {
      const a = m[1] ? +m[1] : 0, b = m[2] ? Math.min(+m[2], size - 1) : size - 1;
      res.writeHead(206, { ...cors, "Content-Type": "audio/mpeg", "Content-Range": `bytes ${a}-${b}/${size}`, "Accept-Ranges": "bytes", "Content-Length": b - a + 1 });
      fs.createReadStream(f, { start: a, end: b }).pipe(res); return;
    }
    res.writeHead(200, { ...cors, "Content-Type": "audio/mpeg", "Content-Length": size, "Accept-Ranges": "bytes" });
    if (req.method === "HEAD") return res.end();
    fs.createReadStream(f).pipe(res);
  });
  await new Promise(ok => srv.listen(0, "127.0.0.1", ok)); // 127.0.0.1, not localhost: a different origin from the site
  BASE = `http://127.0.0.1:${srv.address().port}`;
});
test.afterAll(() => new Promise(ok => srv.close(ok)));

async function setup(page, { base = true, drop = [], noManifest = false, init } = {}) {
  S.hits = []; S.missing = new Set();
  const site = [];
  page.on("request", r => site.push(r.url()));
  await page.addInitScript(silence);
  if (init) await page.addInitScript(init);
  if (base) {
    await page.route("**/config.js", r => r.fulfill({ contentType: "text/javascript", body: `window.HALCYON_AUDIO_BASE=${JSON.stringify(BASE + "/")};` })); // trailing slash on purpose: the engine trims it
    await page.route("**/audio-manifest.json", r => noManifest ? r.fulfill({ status: 404, body: "" }) : r.fulfill({ json: manifest(drop) }));
  }
  return site;
}
const playing = (page, expr = "window.__nar.audio") => page.waitForFunction(e => { const a = eval(e); return a && a.currentTime > 0.2 }, expr, { timeout: 15_000 });
const origin = page => new URL(page.url()).origin;

test("the live config points at the R2 audio domain", () => {
  expect(fs.readFileSync(path.join(ROOT, "config.js"), "utf8")).toMatch(/^window\.HALCYON_AUDIO_BASE = "https:\/\/audio\.strakesystems\.com";$/m);
  expect(ALL.length).toBeGreaterThan(100);
});

test("base empty: narration, the Audiobook and its download play from the site, exactly as before", async ({ page }) => {
  const site = await setup(page, { base: false });
  await page.goto(CH1);
  await page.locator("#narplay").click();
  await playing(page);
  expect(await page.evaluate(() => window.__nar.audio.src)).toBe(origin(page) + "/audio/v2/pages/f1/open.mp3");
  await page.goto("/#pmp/listen");
  await expect(page.locator(".dl").first()).toHaveAttribute("href", "audio/v2/story/full-ch01.mp3");
  await page.locator('.brow[data-b="1"]').click();
  await playing(page);
  expect(await page.evaluate(() => window.__nar.audio.src)).toBe(origin(page) + "/audio/v2/story/full-ch01.mp3");
  expect(S.hits).toEqual([]);
  expect(site.filter(u => u.includes("audio-manifest.json"))).toEqual([]); // the manifest isn't even fetched
});

test("base set: page narration plays from the audio host with the manifest hash; timings and QA paths stay on the site", async ({ page }) => {
  const site = await setup(page, { init: () => localStorage.setItem("halcyon.rate", "1.5") });
  await page.goto("/?qa=1" + CH1.slice(1));
  await page.locator("#narplay").click();
  await playing(page);
  const st = await page.evaluate(() => ({ src: window.__nar.audio.src, rate: window.__nar.audio.playbackRate, qa: window.HalcyonState().src }));
  expect(st.src).toBe(`${BASE}/${K(`audio/v2/pages/f1/open.mp3`)}`);
  expect(st.rate).toBe(1.5);
  expect(st.qa).toBe(origin(page) + "/audio/v2/pages/f1/open.mp3"); // QA reports name the file, not the host
  expect(S.hits.some(h => h.rel === "audio/v2/pages/f1/open.mp3" && h.v === H)).toBe(true);
  expect(S.hits.every(h => h.rel.endsWith(".mp3"))).toBe(true);
  expect(site.some(u => u.startsWith(origin(page)) && u.includes("/audio/v2/pages/f1/timings.json"))).toBe(true);
  expect(site.filter(u => u.startsWith(origin(page)) && /\.mp3(\?|$)/.test(u))).toEqual([]); // no mp3 from the site at all
});

test("base set: the Audiobook, its follow-along and the download link use the audio host", async ({ page }) => {
  const site = await setup(page);
  await page.goto("/#pmp/listen");
  await expect(page.locator(".dl").first()).toHaveAttribute("href", `${BASE}/${K(`audio/v2/story/full-ch01.mp3`)}`);
  await page.locator('.brow[data-b="1"]').click();
  await expect(page.locator("#bftext .bw").first()).toBeAttached({ timeout: 15_000 });
  await playing(page);
  expect(await page.evaluate(() => window.__nar.audio.src)).toBe(`${BASE}/${K(`audio/v2/story/full-ch01.mp3`)}`);
  await page.evaluate(() => new Promise(ok => { const a = window.__nar.audio; a.pause(); a.addEventListener("seeked", () => setTimeout(ok, 100), { once: true }); a.currentTime = 120 }));
  await expect(page.locator("#bftext .bw.hl")).toHaveCount(1); // the follow-along highlight tracks the remote file's clock
  expect(await page.evaluate(() => [...document.querySelectorAll("#bftext .bw")].indexOf(document.querySelector("#bftext .bw.hl")))).toBeGreaterThan(10);
  expect(site.some(u => u.startsWith(origin(page)) && /\/audio\/v2\/episodes\/ch01-story\.json$/.test(u))).toBe(true); // JSON from the site
  // the download link actually answers from the host, the way a browser fetches it
  const r = await page.request.get(`${BASE}/${K(`audio/v2/story/full-ch01.mp3`)}`, { headers: { Range: "bytes=0-1" } });
  expect(r.status()).toBe(206);
});

test("base set: cast voice samples, ambience and stings come from the audio host", async ({ page }) => {
  await setup(page, { init: () => { localStorage.setItem("halcyon.amb", "true"); localStorage.setItem("halcyon.spoilers", "true") } });
  await page.goto(CH1);
  await expect.poll(() => S.hits.filter(h => /^audio\/amb\/\w+\.mp3$/.test(h.rel) && h.v === H).length, { timeout: 10_000 }).toBeGreaterThan(0);
  await expect.poll(() => S.hits.some(h => h.rel === "audio/sting-open.mp3" && h.v === H), { timeout: 10_000 }).toBe(true);
  await page.goto("/#pmp/cast"); await page.waitForSelector("#page h1");
  if (!(await page.locator("#spoil").isChecked())) await page.locator("#spoil").check();
  const id = Object.keys(JSON.parse(fs.readFileSync(path.join(ROOT, "cast/v2/voice/samples.json"), "utf8")).samples)[0];
  await page.locator(`.castcard[data-c="${id}"]`).click();
  await page.locator("#hear").click();
  await playing(page, "window.__castAudio");
  expect(await page.evaluate(() => window.__castAudio.src)).toBe(`${BASE}/${K(`cast/v2/voice/${id}.mp3`)}`);
});

test("a 404 on the audio host falls back to the site's copy once, keeps playing, and keeps the Hear button", async ({ page }) => {
  await setup(page, { init: () => localStorage.setItem("halcyon.rate", "1.25") });
  S.missing.add("audio/v2/pages/f1/open.mp3");
  await page.goto(CH1);
  await page.locator("#narplay").click();
  await playing(page);
  const st = await page.evaluate(() => ({ src: window.__nar.audio.src, rate: window.__nar.audio.playbackRate, listening: window.__nar.listening, paused: window.__nar.audio.paused }));
  expect(st.src).toBe(origin(page) + "/audio/v2/pages/f1/open.mp3");
  expect(st.rate).toBe(1.25);
  expect(st.listening).toBe(true);
  expect(st.paused).toBe(false);
  expect(await page.locator("#narplay").textContent()).toContain("Pause");
  expect(S.hits.filter(h => h.rel === "audio/v2/pages/f1/open.mp3").length).toBeGreaterThan(0);
  // the same file again in this visit goes straight to the site; other files still come from the host
  const n = S.hits.length;
  await page.locator("#narplay").click(); // pause the way a reader does
  await expect(page.locator("#narplay")).toContainText("Listen");
  await page.goto("/#pmp/cast"); await page.waitForSelector("#page h1");
  if (!(await page.locator("#spoil").isChecked())) await page.locator("#spoil").check();
  const id = Object.keys(JSON.parse(fs.readFileSync(path.join(ROOT, "cast/v2/voice/samples.json"), "utf8")).samples)[0];
  S.missing.add(`cast/v2/voice/${id}.mp3`);
  await page.locator(`.castcard[data-c="${id}"]`).click();
  await page.locator("#hear").click();
  await playing(page, "window.__castAudio");
  expect(await page.evaluate(() => window.__castAudio.src)).toBe(`${origin(page)}/cast/v2/voice/${id}.mp3`);
  await expect(page.locator("#hear")).toBeVisible(); // the engine's onerror (which removes the button) never saw the remote 404
  await page.goto(CH1);
  await page.locator("#narplay").click();
  await playing(page);
  expect(await page.evaluate(() => window.__nar.audio.src)).toBe(origin(page) + "/audio/v2/pages/f1/open.mp3");
  expect(S.hits.slice(n).filter(h => h.rel === "audio/v2/pages/f1/open.mp3")).toEqual([]);
});

test("a file the manifest doesn't list plays from the site", async ({ page }) => {
  await setup(page, { drop: ["audio/v2/pages/f1/open.mp3"] });
  await page.goto(CH1);
  await page.locator("#narplay").click();
  await playing(page);
  expect(await page.evaluate(() => window.__nar.audio.src)).toBe(origin(page) + "/audio/v2/pages/f1/open.mp3");
  expect(S.hits.filter(h => h.rel === "audio/v2/pages/f1/open.mp3")).toEqual([]);
});

test("no manifest: everything plays from the site", async ({ page }) => {
  await setup(page, { noManifest: true });
  await page.goto("/#pmp/listen");
  await expect(page.locator(".dl").first()).toHaveAttribute("href", "audio/v2/story/full-ch01.mp3");
  await page.locator('.brow[data-b="1"]').click();
  await playing(page);
  expect(await page.evaluate(() => window.__nar.audio.src)).toBe(origin(page) + "/audio/v2/story/full-ch01.mp3");
  expect(S.hits).toEqual([]);
});

test("other courses: Danny's Logbook narration resolves under courses/pilot/ on the audio host", async ({ page }) => {
  await setup(page);
  await page.goto("/#pilot/full/1");
  await page.locator("#narplay").click();
  await playing(page);
  expect(await page.evaluate(() => window.__nar.audio.src)).toMatch(new RegExp(`^${BASE.replace(/[.]/g, "\\.")}/courses/pilot/audio/pages/f1/[\\w-]+\\.${H}\\.mp3$`));
});
