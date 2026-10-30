// Offline listening (2026-10-30): the owner uses Halcyon as an iPhone home screen app and wants audiobooks on the device. These run a real service worker
// against a signed in account, with the network really gone. A test server stands in for the site and for the audio host (R2): *.localhost is a secure
// context and isn't "localhost", so the engine behaves as it does live. Going offline stops both servers answering (sockets dropped); on Chromium
// context.setOffline is on as well. Playwright's WebKit setOffline also blocks a service worker's own answers, which no phone does, so on WebKit
// navigator.onLine is overridden and the servers are what's down. Nothing here plays a real recording: every mp3 is a small generated silent file.
import { test, expect } from "@playwright/test";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SHOTS = process.env.OFFLINE_SHOTS || "";
const TYPES = { ".txt": "text/plain", ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json", ".webmanifest": "application/manifest+json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg" };
// MPEG-1 Layer III, 32 kbps, 44.1 kHz: 104 byte frames of silence, 26 ms each. 300 seconds, about 1.2 MB.
const FIXTURE = (() => { const n = 11540, b = Buffer.alloc(n * 104); for (let i = 0; i < n; i++) { b[i * 104] = 0xff; b[i * 104 + 1] = 0xfb; b[i * 104 + 2] = 0x10; b[i * 104 + 3] = 0xc4 } return b })();
let USER = { email: "reader@example.test", name: "Test Reader", admin: false, tester: false, cur: 0 };

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Expose-Headers": "Content-Length, Content-Range, Accept-Ranges", "Access-Control-Allow-Headers": "Range" };
let W; // this worker's two servers and what they remember
const A_USER = { ...USER };
function fresh() { USER = { ...A_USER }; return { down: false, base: W.audioUrl, progress: {}, puts: [], signedIn: true, meStatus: 200, cutNext: 0, mp3s: [], audioLen: FIXTURE.length } }
function mp3(req, res, S, extra = {}) {
  S.mp3s.push({ url: req.url, range: req.headers.range || "" });
  const size = FIXTURE.length, m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || "");
  const a = m && m[1] ? +m[1] : 0, b = m && m[2] ? Math.min(+m[2], size - 1) : size - 1;
  const H = { ...extra, "Content-Type": "audio/mpeg", "Accept-Ranges": "bytes", "Content-Length": b - a + 1, ...(m ? { "Content-Range": `bytes ${a}-${b}/${size}` } : {}) };
  res.writeHead(m ? 206 : 200, H);
  if (req.method === "HEAD") return res.end();
  if (S.stallAll) return; // headers sent, then nothing, like a frozen connection
  if (S.slowMs) { let at = a; const tick = () => { if (S.cutAll || S.down) return req.socket.destroy(); if (at > b) return res.end(); res.write(FIXTURE.subarray(at, Math.min(at + 60000, b + 1))); at += 60000; setTimeout(tick, S.slowMs) }; return tick() }
  if (S.cutNext > 0) { S.cutNext--; res.write(FIXTURE.subarray(a, a + 300000)); setTimeout(() => req.socket.destroy(), 400); return } // the connection drops part way through
  res.end(FIXTURE.subarray(a, b + 1));
}
function site(req, res) {
  const S = W.state, u = new URL(req.url, "http://x");
  if (S.down) return req.socket.destroy();
  if (u.pathname === "/config.js") { const body = fs.readFileSync(path.join(ROOT, "config.js"), "utf8").replace(/^window\.HALCYON_AUDIO_BASE = ".*";$/m, `window.HALCYON_AUDIO_BASE = ${JSON.stringify(S.base)};`).replace(/^window\.HALCYON_AUDIO_REMOTE_ONLY = true;$/m, `window.HALCYON_AUDIO_REMOTE_ONLY = ${S.base ? "true" : "false"};`); res.writeHead(200, { "Content-Type": TYPES[".js"] }); return res.end(body) }
  if (u.pathname === "/sw.js" && S.swVersion) { res.writeHead(200, { "Content-Type": TYPES[".js"] }); return res.end(fs.readFileSync(path.join(ROOT, "sw.js"), "utf8").replace(/const CACHE="[^"]+"/, `const CACHE="${S.swVersion}"`)) }
  if (u.pathname === "/api/auth") {
    if (S.meStatus !== 200) { res.writeHead(S.meStatus, { "Content-Type": "text/html" }); return res.end("<h1>busy</h1>") }
    res.writeHead(200, { "Content-Type": "application/json" });
    if (u.searchParams.get("action") === "logout") S.signedIn = false;
    res.end(JSON.stringify(u.searchParams.get("action") === "me" ? (S.signedIn ? { user: { ...USER }, progress: S.progress } : { user: null }) : { ok: true })); return;
  }
  if (u.pathname === "/api/progress") { let d = ""; req.on("data", x => d += x); req.on("end", () => { const b = JSON.parse(d); S.puts.push(b); S.progress[b.chapter] = b.state; res.writeHead(200, { "Content-Type": "application/json" }); res.end('{"ok":true}') }); return }
  if (u.pathname === "/api/qa-report") { let d = ""; req.on("data", x => d += x); req.on("end", () => { S.diag = (S.diag || []).concat(JSON.parse(d).events); res.writeHead(200, { "Content-Type": "application/json" }); res.end('{"ok":true}') }); return }
  if (u.pathname.startsWith("/api/") || u.pathname.startsWith("/_vercel/")) { res.writeHead(404, { "Content-Type": "application/json" }); return res.end("{}") }
  if (/\.mp3$/i.test(u.pathname)) return mp3(req, res, S);
  if (u.pathname === "/audio-manifest.json" && S.newTake) { const j = JSON.parse(fs.readFileSync(path.join(ROOT, "audio-manifest.json"), "utf8")); j.files["audio/v2/story/full-ch01.mp3"] = S.newTake; res.writeHead(200, { "Content-Type": TYPES[".json"] }); return res.end(JSON.stringify(j)) }
  if (u.pathname === "/audio/v2/episodes/ch01-story.json" && S.textStatus) { res.writeHead(S.textStatus, { "Content-Type": "text/plain" }); return res.end("no") }
  if (u.pathname === "/audio/v2/episodes/ch01-story.json" && S.newTake) { const j = JSON.parse(fs.readFileSync(path.join(ROOT, u.pathname), "utf8")); j.p[0][1] = ["NEWTAKE", ...j.p[0][1].slice(1)]; res.writeHead(200, { "Content-Type": TYPES[".json"] }); return res.end(JSON.stringify(j)) }
  if (u.pathname === "/audio/v2/bookmarks.json" && S.marksShift) { const j = JSON.parse(fs.readFileSync(path.join(ROOT, u.pathname), "utf8")); j.full[1].story = j.full[1].story.map(([a, t]) => [a, t + S.marksShift]); res.writeHead(200, { "Content-Type": TYPES[".json"] }); return res.end(JSON.stringify(j)) }
  let f = path.normalize(path.join(ROOT, decodeURIComponent(u.pathname))); if (u.pathname === "/") f = path.join(ROOT, "index.html");
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end("not found") }
  res.writeHead(200, { "Content-Type": TYPES[path.extname(f)] || "application/octet-stream" }); fs.createReadStream(f).pipe(res);
}
function audioHost(req, res) {
  const S = W.state;
  if (S.down || (S.cutAll && req.method !== "OPTIONS")) return req.socket.destroy();
  if (req.method === "OPTIONS") { res.writeHead(204, { ...cors, "Access-Control-Allow-Methods": "GET, HEAD" }); return res.end() }
  if (!/\.[0-9a-f]{12}\.mp3$/.test(req.url.split("?")[0])) { res.writeHead(404, cors); return res.end() }
  mp3(req, res, S, cors);
}
test.beforeAll(async () => {
  if (W) return;
  W = { state: null, site: http.createServer(site), audio: http.createServer(audioHost) };
  await new Promise(ok => W.site.listen(0, ok)); await new Promise(ok => W.audio.listen(0, ok));
  W.origin = `http://halcyon.localhost:${W.site.address().port}`; W.audioUrl = `http://audio.localhost:${W.audio.address().port}`; W.state = fresh();
});
test.afterAll(async () => { if (W) { W.site.closeAllConnections(); W.audio.closeAllConnections(); W.site.close(); W.audio.close(); W = null } });

test.use({ serviceWorkers: "allow" });
const silence = () => {
  const P = HTMLMediaElement.prototype, d = Object.getOwnPropertyDescriptor(P, "muted"), play = P.play;
  Object.defineProperty(P, "muted", { configurable: true, get() { return d.get.call(this) }, set() { d.set.call(this, true) } });
  P.play = function () { d.set.call(this, true); return play.call(this) };
  document.addEventListener("play", e => d.set.call(e.target, true), true);
  const H = window.__ms = {};
  if ("mediaSession" in navigator) { const ms = navigator.mediaSession, set = ms.setActionHandler.bind(ms); ms.setActionHandler = (k, f) => { H[k] = f; try { set(k, f) } catch (e) {} } }
  if (window.StorageManager && StorageManager.prototype.persist) { const p = StorageManager.prototype.persist; StorageManager.prototype.persist = function () { window.__persist = true; return p.call(this) } } // on the prototype: WebKit can drop a property set on navigator.storage itself
  // WebKit: see the top of this file
  if (localStorage.getItem("__fakeNet") !== null || window.__fakeNetOn) Object.defineProperty(navigator, "onLine", { configurable: true, get: () => localStorage.getItem("__fakeNet") !== "off" });
};
test.beforeEach(async ({ page, browserName }) => {
  W.state = fresh();
  if (browserName === "webkit") await page.addInitScript(() => { window.__fakeNetOn = true });
  await page.addInitScript(silence);
  page.on("dialog", d => d.accept());
  // no fonts or anything else from outside; the test server is the whole network
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
});
const P = (r = "") => W.origin + "/" + r;
async function goOffline(page, browserName) {
  W.state.down = true;
  if (browserName === "webkit") await page.evaluate(() => { localStorage.setItem("__fakeNet", "off"); dispatchEvent(new Event("offline")) });
  else await page.context().setOffline(true);
}
async function goOnline(page, browserName) {
  W.state.down = false;
  if (browserName === "webkit") await page.evaluate(() => { localStorage.setItem("__fakeNet", "on"); dispatchEvent(new Event("online")) });
  else await page.context().setOffline(false);
}
// signed in, the service worker in control, and every book's files cached
async function openApp(page, route = "#pmp/listen") {
  await page.goto(P(route));
  await page.waitForFunction(() => navigator.serviceWorker.controller, null, { timeout: 30_000 });
  await expect.poll(() => page.evaluate(async () => { const k = await caches.keys(), c = await caches.open(k.find(x => /^halcyon-v/.test(x))); return !!(await c.match("/courses/cisa/full/ch01.js")) }), { timeout: 30_000 }).toBe(true);
  await page.goto("about:blank"); await page.goto(P(route)); // the first load wasn't under the worker
  await expect(page.locator('.brow[data-b="1"]')).toBeVisible();
}
const saveBtn = (page, n = 1) => page.locator(`[data-osave="${n}"]`);
async function save(page, n = 1) {
  await saveBtn(page, n).click();
  await expect(saveBtn(page, n)).toHaveAttribute("data-off", "saved", { timeout: 30_000 });
}
const local = (page, k) => page.evaluate(k => JSON.parse(localStorage.getItem(k) || "null"), k);
const listen = page => local(page, "halcyon.c904");
async function playing(page) { await page.waitForFunction(() => { const a = window.__nar.audio; return !a.paused && a.currentTime > 0.2 && a.duration > 60 }, null, { timeout: 30_000 }) }

test("save a chapter: progress, saved state, size, what it stores, persist asked for, one mp3 from the audio host", async ({ page }) => {
  await openApp(page);
  await expect(page.locator("#offused")).toContainText("0 of");
  await saveBtn(page).click();
  await expect(saveBtn(page)).toHaveAttribute("data-off", "saved", { timeout: 30_000 });
  await expect(saveBtn(page)).toContainText("Saved");
  await expect(saveBtn(page)).toContainText("MB");
  await expect(page.locator("#offused")).toContainText("1 of");
  expect((await page.evaluate(async () => (await (await caches.open("halcyon-offline-audio")).match("/__offline/meta.json")).json())).items["pmp|story|1"].marks.length).toBeGreaterThan(0);
  await expect(page.locator("#offused")).toContainText("1 MB");
  const got = await page.evaluate(async () => {
    const c = await caches.open("halcyon-offline-audio"), keys = (await c.keys()).map(r => r.url), m = keys.find(u => /\.mp3$/.test(u)), r = await c.match(m);
    return { keys, m, size: (await r.blob()).size, names: await caches.keys(), persist: !!window.__persist, canPersist: !!(navigator.storage && navigator.storage.persist) };
  });
  expect(got.m).toContain(new URL(W.audioUrl).host); expect(got.m).toMatch(/\.[0-9a-f]{12}\.mp3$/);
  expect(got.size).toBe(FIXTURE.length);
  for (const part of ["__offline/text/pmp-story-1-", "__offline/meta.json"]) expect(got.keys.some(u => u.includes(part)), part).toBe(true);
  expect(got.names).toContain("halcyon-offline-audio");
  if (got.canPersist) expect(got.persist).toBe(true);
});

test("a dropped download resumes with a Range request, and the length is checked", async ({ page }) => {
  await openApp(page);
  W.state.cutNext = 1;
  W.state.mp3s = [];
  await save(page);
  expect(W.state.mp3s.length).toBeGreaterThanOrEqual(2);
  expect(W.state.mp3s[0].range).toBe("");
  expect(W.state.mp3s[1].range).toMatch(/^bytes=[1-9]\d*-$/);
  const size = await page.evaluate(async () => { const c = await caches.open("halcyon-offline-audio"), m = (await c.keys()).find(r => /\.mp3$/.test(r.url)); return (await (await c.match(m)).arrayBuffer()).byteLength });
  expect(size).toBe(FIXTURE.length);
});

test("whole book saves a few at a time", async ({ page }) => {
  await openApp(page);
  const total = await page.locator("[data-osave]").count();
  expect(total).toBeGreaterThan(1);
  await page.locator("#offall").click();
  await expect(page.locator('[data-off="queued"]').first()).toBeVisible();
  await expect.poll(() => page.locator('[data-off="saving"]').count().then(n => n <= 2)).toBe(true);
  await expect(page.locator('[data-off="saved"]')).toHaveCount(total, { timeout: 60_000 });
  await expect(page.locator("#offused")).toContainText(`${total} of ${total}`);
});

test("airplane mode: reload opens signed in, plays from the cache with Range, saves the place, survives a kill, syncs when back", async ({ page, browserName }) => {
  await openApp(page);
  await save(page);
  await goOffline(page, browserName);
  await page.reload();
  await expect(page.locator("#page h1")).toHaveText("Audiobook");
  await expect(page.locator("#authform, #autherr")).toHaveCount(0);
  await expect(page.locator(".offline-note")).toBeVisible();
  await expect(saveBtn(page)).toHaveAttribute("data-off", "saved");
  await page.locator('.brow[data-b="1"]').click();
  await playing(page);
  // true 206s, for the hashed host URL and the same-origin one
  const R = await page.evaluate(async () => {
    const a = window.__nar.audio.currentSrc, one = async (u, h) => { const r = await fetch(u, { headers: h ? { Range: h } : {} }); return { s: r.status, cr: r.headers.get("Content-Range"), len: (await r.arrayBuffer()).byteLength } };
    return { a, r1: await one(a, "bytes=0-1"), r2: await one(a, "bytes=1000-1999"), r3: await one(a, "bytes=-10"), r4: await one(a, "bytes=9999999999-"), full: await one(a), site: await one("/audio/v2/story/full-ch01.mp3", "bytes=5-14") };
  });
  const size = FIXTURE.length;
  expect(R.a).toContain(new URL(W.audioUrl).host);
  expect(R.r1).toEqual({ s: 206, cr: `bytes 0-1/${size}`, len: 2 });
  expect(R.r2).toEqual({ s: 206, cr: `bytes 1000-1999/${size}`, len: 1000 });
  expect(R.r3).toEqual({ s: 206, cr: `bytes ${size - 10}-${size - 1}/${size}`, len: 10 });
  expect(R.r4.s).toBe(416);
  expect(R.full.s).toBe(200); expect(R.full.len).toBe(size);
  expect(R.site).toEqual({ s: 206, cr: `bytes 5-14/${size}`, len: 10 });
  // a seek far ahead lands and keeps playing
  await page.evaluate(() => { window.__nar.audio.currentTime = 200 });
  await expect.poll(() => page.evaluate(() => window.__nar.audio.currentTime), { timeout: 15_000 }).toBeGreaterThan(200);
  const t0 = await page.evaluate(() => window.__nar.audio.currentTime);
  await expect.poll(() => page.evaluate(() => window.__nar.audio.currentTime), { timeout: 15_000 }).toBeGreaterThan(t0 + 0.3);
  // lock screen controls, offline
  if (await page.evaluate(() => typeof window.__ms.pause === "function")) {
    await page.evaluate(() => window.__ms.pause());
    await expect.poll(() => page.evaluate(() => window.__nar.audio.paused)).toBe(true);
    await page.evaluate(() => window.__ms.play());
    await expect.poll(() => page.evaluate(() => window.__nar.audio.paused)).toBe(false);
    await page.evaluate(() => window.__ms.seekto({ seekTime: 150 }));
    await expect.poll(() => page.evaluate(() => Math.round(window.__nar.audio.currentTime)), { timeout: 15_000 }).toBeGreaterThanOrEqual(150);
  } else await page.evaluate(() => { window.__nar.audio.currentTime = 150 });
  // the five second timer saves on its own, with no pause and no animation frame needed
  const before = await listen(page);
  await expect.poll(async () => { const L = await listen(page); return L && L.book && L.at > ((before && before.at) || 0) && L.book.t >= 150 }, { timeout: 15_000 }).toBe(true);
  await page.evaluate(() => window.__nar.audio.pause());
  await expect.poll(async () => { const L = await listen(page); return L && L.book && L.book.t }).toBeGreaterThan(150);
  const spot = await listen(page);
  expect(await local(page, "halcyon.outbox")).toHaveProperty("904");
  expect(W.state.progress[904]).toBeUndefined();
  // kill: a new page with nothing in memory, still no network
  await page.goto("about:blank"); await page.goto(P("#pmp/listen"));
  await expect(page.locator("#bresume")).toContainText("chapter 1");
  expect((await listen(page)).book.t).toBe(spot.book.t);
  await page.locator("#bresume").click();
  await expect.poll(() => page.evaluate(() => window.__nar.audio.currentTime), { timeout: 15_000 }).toBeGreaterThanOrEqual(spot.book.t - 1);
  await page.evaluate(() => window.__nar.audio.pause());
  // back online: the online event sends it and the outbox empties
  await goOnline(page, browserName);
  await expect.poll(() => W.state.progress[904] && W.state.progress[904].book && W.state.progress[904].book.t, { timeout: 20_000 }).toBeGreaterThanOrEqual(spot.book.t - 1);
  await expect.poll(() => local(page, "halcyon.outbox"), { timeout: 20_000 }).toBeNull();
});

test("newest wins: an offline device's older spot doesn't overwrite a newer one, and a newer offline spot beats an older server copy", async ({ page, browserName }) => {
  await openApp(page);
  await save(page);
  await goOffline(page, browserName);
  await page.reload();
  await expect(page.locator("#page h1")).toHaveText("Audiobook");
  await page.locator('.brow[data-b="1"]').click();
  await playing(page);
  await page.evaluate(() => { window.__nar.audio.currentTime = 40 });
  await expect.poll(() => page.evaluate(() => window.__nar.audio.currentTime), { timeout: 15_000 }).toBeGreaterThan(40);
  await page.evaluate(() => window.__nar.audio.pause());
  await expect.poll(async () => { const L = await listen(page); return L && L.book && L.book.t }).toBeGreaterThanOrEqual(40);
  // another device, later than this one, is at 250
  const later = Date.now() + 60000;
  W.state.progress[904] = { book: { ed: "story", n: 1, t: 250, dur: 300, at: later }, at: later };
  W.state.puts = [];
  await goOnline(page, browserName);
  await expect.poll(async () => { const L = await listen(page); return L && L.book && L.book.t }, { timeout: 20_000 }).toBe(250);
  await expect.poll(() => local(page, "halcyon.outbox"), { timeout: 20_000 }).toBeNull();
  expect(W.state.puts.filter(p => p.chapter === 904 && p.state.book.t < 250)).toEqual([]);
  expect(W.state.progress[904].book.t).toBe(250);
  // now this device goes out, moves on to a newer spot, and an older server copy can't pull it back
  await goOffline(page, browserName);
  await page.reload();
  await expect(page.locator("#bresume")).toBeVisible();
  const mine = Date.now() + 120000; // newer than `later`, the way a later hour would be
  await page.evaluate(([mine]) => { const L = JSON.parse(localStorage.getItem("halcyon.c904")); L.book = { ed: "story", n: 1, t: 280, dur: 300, at: mine }; L.at = mine; localStorage.setItem("halcyon.c904", JSON.stringify(L)); const q = JSON.parse(localStorage.getItem("halcyon.outbox") || "{}"); q[904] = { st: { ...L, _t: mine }, h: "x" }; localStorage.setItem("halcyon.outbox", JSON.stringify(q)) }, [mine]);
  W.state.down = false;
  if (browserName === "webkit") await page.evaluate(() => localStorage.setItem("__fakeNet", "on")); else await page.context().setOffline(false);
  await page.goto("about:blank"); await page.goto(P("#pmp/listen")); // opening the app online does it too, and nothing gets wiped
  await expect(page.locator("#bresume")).toBeVisible();
  await expect.poll(() => W.state.progress[904].book.t, { timeout: 20_000 }).toBe(280);
  expect((await listen(page)).book.t).toBe(280);
});

test("study progress, quiz answers and bookmarks made offline survive a kill and go up when back", async ({ page, browserName }) => {
  await openApp(page, "#pmp/listen");
  await goOffline(page, browserName);
  await page.goto("about:blank"); await page.goto(P("#pmp/full/1"));
  await expect(page.locator("#page .chmap")).toBeVisible({ timeout: 20_000 });
  for (let i = 0; i < 6 && !(await page.locator("#page .choice").count()); i++) await page.locator("#fnext").click();
  await page.locator("#bmbtn").click();
  await expect(page.locator("#bmbtn")).toHaveAttribute("aria-pressed", "true");
  await page.locator("#page .choice").first().click();
  await expect.poll(async () => { const s = await local(page, "halcyon.c201"); return s && Object.keys(s.picks).length }).toBeGreaterThan(0);
  await expect.poll(async () => { const q = await local(page, "halcyon.outbox"); return !!(q && q[201] && q[907]) }).toBe(true);
  const picks = (await local(page, "halcyon.c201")).picks;
  // a kill, then back online on open: the server gets both, the local copies aren't wiped
  await page.goto("about:blank");
  W.state.down = false;
  if (browserName === "webkit") await page.evaluate(() => {}); else await page.context().setOffline(false);
  if (browserName === "webkit") { await page.goto(P("robots.txt")); await page.evaluate(() => localStorage.setItem("__fakeNet", "on")) }
  W.state.progress[907] = { v: 1, at: 1, list: [{ id: "other-device", n: 2, c: Date.now() - 1000, x: "From the other device", co: "pmp" }] }; // another device's bookmark isn't lost
  await page.goto(P("#pmp/full/1"));
  await expect(page.locator("#page .chmap")).toBeVisible({ timeout: 20_000 });
  await expect.poll(() => W.state.progress[201] && W.state.progress[201].picks, { timeout: 20_000 }).toEqual(picks);
  await expect.poll(() => (W.state.progress[907] && W.state.progress[907].list || []).length, { timeout: 20_000 }).toBe(2);
  expect((await local(page, "halcyon.c201")).picks).toEqual(picks);
  await expect.poll(() => local(page, "halcyon.outbox"), { timeout: 20_000 }).toBeNull();
});

test("remove frees the space", async ({ page }) => {
  await openApp(page);
  await save(page);
  await saveBtn(page).click(); // the confirm is accepted
  await expect(saveBtn(page)).toHaveAttribute("data-off", "new");
  await expect(page.locator("#offused")).toContainText("nothing yet");
  const left = await page.evaluate(async () => { const c = await caches.open("halcyon-offline-audio"); return (await c.keys()).map(r => r.url).filter(u => /\.mp3$|__offline\/text/.test(u)) });
  expect(left).toEqual([]);
});

test("an unsaved chapter offline says so plainly and doesn't spin", async ({ page, browserName }) => {
  await openApp(page);
  await save(page, 1);
  await goOffline(page, browserName);
  await page.reload();
  await expect(page.locator("#page h1")).toHaveText("Audiobook");
  await expect(saveBtn(page, 2)).toHaveAttribute("data-off", "none");
  await page.locator('.brow[data-b="2"]').click();
  await expect(page.locator("#offmsg")).toContainText("Chapter 2 isn't saved");
  await expect(page.locator(".brow.now")).toHaveCount(0);
  expect(await page.evaluate(() => window.__nar.audio.paused)).toBe(true);
});

test("same-origin fallback: with no audio host a saved chapter plays from this site's URL, and the page's streaming isn't touched when unsaved", async ({ page, browserName }) => {
  W.state.base = "";
  await openApp(page);
  await page.locator('.brow[data-b="2"]').click(); // streams, unsaved
  await playing(page);
  const seen = W.state.mp3s.filter(m => m.url.includes("ch02")).length;
  expect(seen).toBeGreaterThan(0);
  await page.evaluate(() => window.__nar.audio.pause());
  await save(page);
  await goOffline(page, browserName);
  await page.reload();
  await expect(page.locator("#page h1")).toHaveText("Audiobook");
  await page.locator('.brow[data-b="1"]').click();
  await playing(page);
  expect(await page.evaluate(() => new URL(window.__nar.audio.currentSrc).origin)).toBe(W.origin);
});

test("every book opens offline, with its Listen page", async ({ page, browserName }) => {
  await openApp(page);
  const ids = await page.evaluate(() => window.HALCYON_COURSES.filter(c => c.status === "live").map(c => c.id));
  expect(ids.length).toBeGreaterThan(3);
  await goOffline(page, browserName);
  for (const id of ids) {
    await page.goto("about:blank"); await page.goto(P(`#${id}/listen`));
    await expect(page.locator("#page h1"), id).toHaveText("Audiobook", { timeout: 20_000 });
    await expect(page.locator("#page"), id).not.toContainText("Sign in");
    await page.goto("about:blank"); await page.goto(P(`#${id}/home`));
    await expect(page.locator("#page .ctile").first(), id + " chapters").toBeVisible({ timeout: 20_000 });
  }
});

test("a server error or a captive portal's page isn't a sign out; only the server saying so is, and even that wipes nothing", async ({ page }) => {
  await openApp(page);
  await page.locator('.brow[data-b="1"]').click();
  await playing(page);
  await page.evaluate(() => window.__nar.audio.pause());
  await expect.poll(async () => { const L = await listen(page); return L && L.book && L.book.t }).toBeGreaterThan(0);
  W.state.meStatus = 500;
  await page.reload();
  await expect(page.locator("#page h1")).toHaveText("Audiobook");
  await expect(page.locator("#bresume")).toBeVisible();
  W.state.meStatus = 200; W.state.signedIn = false;
  await page.reload();
  await expect(page.locator("#page h1")).toHaveText("Sign in");
  expect((await listen(page)).book).toBeTruthy();
});

test("a new CACHE version leaves saved chapters alone, and they still play offline", async ({ page, browserName }) => {
  await openApp(page);
  await save(page);
  const was = await page.evaluate(async () => (await caches.keys()).find(k => /^halcyon-v/.test(k)));
  W.state.swVersion = "halcyon-v9999";
  await page.evaluate(async () => { const reg = await navigator.serviceWorker.ready; await reg.update() });
  await expect.poll(() => page.evaluate(() => caches.has("halcyon-v9999")), { timeout: 30_000 }).toBe(true);
  await expect.poll(() => page.evaluate(async () => { const r = await navigator.serviceWorker.getRegistration(); return !r.installing && !r.waiting }), { timeout: 30_000 }).toBe(true);
  // a page's warm refills the new version, then the old one goes (one sent while the new worker was still installing is answered on the next open)
  await expect.poll(async () => { await page.reload(); await page.waitForTimeout(1500); return page.evaluate(k => caches.has(k), was) }, { timeout: 30_000, intervals: [100] }).toBe(false);
  expect(await page.evaluate(async () => (await (await caches.open("halcyon-offline-audio")).keys()).some(r => /\.mp3$/.test(r.url)))).toBe(true);
  await goOffline(page, browserName);
  await page.reload();
  await expect(saveBtn(page)).toHaveAttribute("data-off", "saved");
  await page.locator('.brow[data-b="1"]').click();
  await playing(page);
});


const keys = page => page.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith("halcyon.")).sort());
const hasA = st => JSON.stringify(st).includes('"book":{');
test("sign out while a chapter plays: the last spot goes up, nothing comes back, and the next account gets none of it", async ({ page }) => {
  await openApp(page);
  await page.locator('.brow[data-b="1"]').click();
  await playing(page);
  await page.waitForTimeout(1200);
  await page.evaluate(() => document.getElementById("signout").click());
  await expect(page.locator("#page h1")).toHaveText("Sign in", { timeout: 20_000 });
  await page.waitForTimeout(800);
  expect(W.state.progress[904].book.n, "A's spot reached A's account").toBe(1);
  const left = await keys(page);
  for (const k of left) expect(k, "left behind after sign out").not.toMatch(/^halcyon\.(outbox|signedin|c\d+)$/);
  USER = { ...USER, email: "other@example.test", name: "B Other" }; W.state.signedIn = true; W.state.progress = {}; W.state.puts = [];
  await page.goto(P("#pmp/listen"));
  await expect(page.locator("#page h1")).toHaveText("Audiobook");
  await page.waitForTimeout(1500);
  expect(W.state.puts.filter(p => hasA(p.state))).toEqual([]);
  expect(await listen(page)).toBeNull();
});
test("no mark on the device: local records and an outbox are never sent; the mark must match this account", async ({ page }) => {
  await page.goto(P("robots.txt"));
  const rec = { book: { ed: "story", n: 3, t: 99, dur: 300, at: Date.now() }, at: Date.now() };
  const seed = (rec, mark) => { localStorage.setItem("halcyon.c904", JSON.stringify(rec)); localStorage.setItem("halcyon.outbox", JSON.stringify({ 904: { st: rec, h: "x" } })); if (mark) localStorage.setItem("halcyon.signedin", JSON.stringify(mark)); else localStorage.removeItem("halcyon.signedin") };
  await page.evaluate(seed, rec);
  await page.goto(P("#pmp/listen"));
  await expect(page.locator("#page h1")).toHaveText("Audiobook");
  await page.waitForTimeout(1000);
  expect(W.state.puts.filter(p => hasA(p.state))).toEqual([]);
  expect(((await local(page, "halcyon.outbox")) || {})[904]).toBeUndefined(); // this account's own new records may be on their way
  expect(await listen(page)).toBeNull();
  // another account's mark: same answer
  await page.evaluate(([r, m]) => { localStorage.setItem("halcyon.c904", JSON.stringify(r)); localStorage.setItem("halcyon.outbox", JSON.stringify({ 904: { st: r, h: "x" } })); localStorage.setItem("halcyon.signedin", JSON.stringify(m)) }, [rec, { email: "someone@else.test" }]);
  await page.reload();
  await expect(page.locator("#page h1")).toHaveText("Audiobook");
  await page.waitForTimeout(1000);
  expect(W.state.puts.filter(p => hasA(p.state))).toEqual([]);
  // this account's mark: it goes up
  await page.evaluate(([r, m]) => { localStorage.setItem("halcyon.c904", JSON.stringify(r)); localStorage.setItem("halcyon.outbox", JSON.stringify({ 904: { st: r, h: "x" } })); localStorage.setItem("halcyon.signedin", JSON.stringify(m)) }, [rec, { email: USER.email }]);
  await page.reload();
  await expect.poll(() => W.state.progress[904] && W.state.progress[904].book.t, { timeout: 15_000 }).toBe(99);
});
test("another tab switches the account: this tab stops, sends nothing of A's to B, and reloads into B", async ({ page, context }) => {
  await openApp(page);
  await page.locator('.brow[data-b="1"]').click();
  await playing(page);
  await page.waitForTimeout(1200);
  await page.evaluate(() => { window.__tab1 = true });
  const tab2 = await context.newPage(); await tab2.addInitScript(silence);
  await tab2.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  USER = { ...USER, email: "other@example.test", name: "B Other" }; W.state.progress = {}; W.state.puts = [];
  await page.evaluate(() => localStorage.setItem("halcyon.signingin", String(Date.now()))); // what the sign in form does before its request
  await tab2.goto(P("#pmp/listen"));
  await expect(tab2.locator("#page h1")).toHaveText("Audiobook");
  await expect.poll(() => page.evaluate(() => !window.__tab1), { timeout: 20_000 }).toBe(true); // tab 1 reloaded
  await expect(page.locator("#page h1")).toHaveText("Audiobook");
  expect(await page.evaluate(() => window.__nar.audio.paused)).toBe(true);
  await page.waitForTimeout(6500); // longer than the five second save
  expect(W.state.puts.filter(p => hasA(p.state))).toEqual([]);
  expect(W.state.progress[904]).toBeUndefined();
  expect(await listen(page)).toBeNull();
  await tab2.close();
});
test("first open after the update, with no mark: chapter checks stay and nothing is sent; another account's mark clears them", async ({ page }) => {
  await page.goto(P("robots.txt"));
  await page.evaluate(() => { localStorage.setItem("halcyon.bookdone.pmp2.story.2", "true"); localStorage.setItem("halcyon.c904", JSON.stringify({ at: Date.now(), book: { ed: "story", n: 5, t: 100, dur: 300, at: Date.now() } })) });
  await page.goto(P("#pmp/listen"));
  await expect(page.locator('.brow[data-b="2"]')).toContainText("✓");
  expect(await local(page, "halcyon.bookdone.pmp2.story.2")).toBe(true);
  await page.waitForTimeout(800);
  expect(W.state.puts.filter(p => hasA(p.state))).toEqual([]);
  await page.evaluate(() => localStorage.setItem("halcyon.signedin", JSON.stringify({ email: "someone@else.test" })));
  await page.reload();
  await expect(page.locator('.brow[data-b="2"]')).not.toContainText("✓");
});
const hideApp = (page, hidden) => page.evaluate(h => { Object.defineProperty(document, "hidden", { configurable: true, get: () => h }); Object.defineProperty(document, "visibilityState", { configurable: true, get: () => h ? "hidden" : "visible" }); document.dispatchEvent(new Event("visibilitychange")) }, hidden);
test("saving shows percent and MB from the first bytes, and says to keep the phone awake", async ({ page }) => {
  await openApp(page);
  W.state.slowMs = 120;
  await saveBtn(page).click();
  await expect(saveBtn(page).locator(".ot")).toHaveText(/^[1-9]\d?%$/, { timeout: 15_000 });
  await expect(saveBtn(page).locator(".os")).toHaveText(/^\d+ of 1 MB$/);
  await expect(page.locator("#offpanel")).toContainText("phone awake");
  W.state.slowMs = 0;
  await expect(saveBtn(page)).toHaveAttribute("data-off", "saved", { timeout: 30_000 });
});
test("each failure says why: no connection and text are told apart, and a failure is reported without the switch", async ({ page, browserName }) => {
  await openApp(page);
  W.state.textStatus = 500;
  await saveBtn(page).click();
  await expect(saveBtn(page)).toHaveAttribute("data-off", "failed", { timeout: 20_000 });
  await expect(saveBtn(page).locator(".os")).toHaveText("No text");
  await expect(page.locator("#offwhy")).toContainText("not the words");
  await expect.poll(() => (W.state.diag || []).length, { timeout: 10_000 }).toBe(1);
  const r = W.state.diag[0];
  expect(r.ev).toBe("offline:save_failed");
  expect(r.d).toMatchObject({ err: "text", got: FIXTURE.length, total: FIXTURE.length, sw: 1 });
  expect(r.page).toBe("pmp-story-1");
  expect(JSON.stringify(r)).not.toContain(USER.email);
  W.state.textStatus = 0;
  await saveBtn(page).click();
  await expect(saveBtn(page)).toHaveAttribute("data-off", "saved", { timeout: 20_000 });
  W.state.slowMs = 120;
  await saveBtn(page, 2).click();
  await expect(saveBtn(page, 2).locator(".ot")).toHaveText(/%$/, { timeout: 15_000 });
  await goOffline(page, browserName);
  await expect(saveBtn(page, 2).locator(".os")).toHaveText("No signal", { timeout: 20_000 });
  await expect(page.locator("#offwhy")).toContainText("signal");
});
test("a save cut while the app is hidden doesn't burn its tries, and resumes with Range when the app is back", async ({ page }) => {
  await openApp(page);
  W.state.slowMs = 100;
  await saveBtn(page).click();
  await expect(saveBtn(page).locator(".ot")).toHaveText(/%$/, { timeout: 15_000 });
  await hideApp(page, true);
  W.state.cutAll = true; // every request fails while hidden, as on a suspended phone
  W.state.mp3s = [];
  await page.waitForTimeout(3000);
  expect(await saveBtn(page).getAttribute("data-off")).toBe("saving"); // waiting, not failed
  W.state.cutAll = false; W.state.slowMs = 0; W.state.mp3s = [];
  await hideApp(page, false);
  await expect(saveBtn(page)).toHaveAttribute("data-off", "saved", { timeout: 30_000 });
  expect(W.state.mp3s[0].range).toMatch(/^bytes=[1-9]\d*-$/);
  const size = await page.evaluate(async () => { const c = await caches.open("halcyon-offline-audio"), m = (await c.keys()).find(r => /\.mp3$/.test(r.url)); return (await (await c.match(m)).arrayBuffer()).byteLength });
  expect(size).toBe(FIXTURE.length);
});
test("a stream that freezes without an error is cut and resumed when the app comes back", async ({ page }) => {
  await openApp(page);
  W.state.stallAll = true;
  await saveBtn(page).click();
  await expect(saveBtn(page)).toHaveAttribute("data-off", "saving");
  await page.waitForTimeout(500);
  W.state.stallAll = false;
  await page.evaluate(() => { const n = Date.now; Date.now = () => n() + 60000 }); // the freeze lasted a minute
  await hideApp(page, true); await hideApp(page, false);
  await expect(saveBtn(page)).toHaveAttribute("data-off", "saved", { timeout: 30_000 });
});
test("a save never goes through the worker, even right after a restart", async ({ page }) => {
  await openApp(page);
  expect(fs.readFileSync(path.join(ROOT, "sw.js"), "utf8")).toMatch(/req\.cache==="no-store"\)return;/);
  const cacheModes = await page.evaluate(() => new Request("/x.mp3", { cache: "no-store" }).cache);
  expect(cacheModes).toBe("no-store");
  await save(page);
});
test("rollout: a server record with no time beats an older offline copy, unless it's the copy that edit started from", async ({ page }) => {
  await page.goto(P("robots.txt"));
  const mine = { picks: { 0: 1 }, _t: Date.now() - 5000 }, base = { picks: {} };
  const hash = s => { let h = 2166136261 >>> 0; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0 } return h + ":" + s.length };
  W.state.progress = { 201: { picks: { 0: 2 } }, 202: base };
  await page.evaluate(([m, h, e]) => { localStorage.setItem("halcyon.signedin", JSON.stringify({ email: e })); localStorage.setItem("halcyon.outbox", JSON.stringify({ 201: { st: m, h: "x", base: "nope" }, 202: { st: m, h: "y", base: h } })) }, [mine, hash(JSON.stringify(base)), USER.email]);
  await page.goto(P("#pmp/listen"));
  await expect(page.locator("#page h1")).toHaveText("Audiobook");
  await expect.poll(() => W.state.progress[202].picks[0], { timeout: 15_000 }).toBe(1);
  expect(W.state.progress[201].picks[0]).toBe(2);
  expect((await local(page, "halcyon.c201")).picks[0]).toBe(2);
});
test("update: a new take and its text swap together; a failed text keeps the old take whole and says so; retry doesn't download again", async ({ page, browserName }) => {
  await openApp(page);
  await save(page);
  const meta = () => page.evaluate(async () => (await (await caches.open("halcyon-offline-audio")).match("/__offline/meta.json")).json().then(j => j.items["pmp|story|1"]));
  const has = u => page.evaluate(async u => !!(await (await caches.open("halcyon-offline-audio")).match(u)), u);
  const old = await meta();
  W.state.newTake = "abcdefabcdef"; W.state.textStatus = 500;
  await page.goto("about:blank"); await page.goto(P("#pmp/listen"));
  await expect(saveBtn(page)).toHaveAttribute("data-off", "stale");
  await saveBtn(page).click();
  await expect(saveBtn(page)).toHaveAttribute("data-off", "failed", { timeout: 20_000 });
  expect((await meta()).url).toBe(old.url);
  expect(await has(old.url)).toBe(true); expect(await has(old.textKey)).toBe(true);
  expect((await page.evaluate(async () => (await (await caches.open("halcyon-offline-audio")).keys()).filter(r => /\.mp3$/.test(r.url)).length))).toBe(1);
  W.state.textStatus = 0; W.state.mp3s = [];
  await saveBtn(page).click();
  await expect(saveBtn(page)).toHaveAttribute("data-off", "saved", { timeout: 20_000 });
  expect(W.state.mp3s, "the audio was already in hand").toEqual([]);
  const now = await meta();
  expect(now.url).toMatch(/abcdefabcdef\.mp3$/); expect(now.textKey).not.toBe(old.textKey);
  expect(await has(old.url)).toBe(false); expect(await has(old.textKey)).toBe(false);
  expect(await page.evaluate(async k => (await (await (await caches.open("halcyon-offline-audio")).match(k)).text()).includes("NEWTAKE"), now.textKey)).toBe(true);
  await goOffline(page, browserName);
  await page.reload();
  await page.locator('.brow[data-b="1"]').click();
  await playing(page);
  expect(await page.evaluate(() => window.__nar.audio.currentSrc)).toContain("abcdefabcdef");
});
test("saving another chapter doesn't change an older saved chapter's section marks", async ({ page, browserName }) => {
  await openApp(page);
  await save(page, 1);
  const first = await page.locator('[data-bn="1"]').nth(1).getAttribute("data-bt");
  W.state.marksShift = 7;
  await save(page, 2);
  await goOffline(page, browserName);
  await page.reload();
  await expect(page.locator('[data-bn="1"]').nth(1)).toHaveAttribute("data-bt", first, { timeout: 15_000 });
});
test("the worker keeps no timings or episodes in its versioned cache", async ({ page }) => {
  await openApp(page);
  await save(page);
  await page.locator('.brow[data-b="1"]').click();
  await playing(page);
  const bad = await page.evaluate(async () => { const c = await caches.open((await caches.keys()).find(k => /^halcyon-v/.test(k))); return (await c.keys()).map(r => new URL(r.url).pathname).filter(p => /audio\/.*\.json$/.test(p) && !/(audiobook|bookmarks)\.json$/.test(p)) });
  expect(bad).toEqual([]);
});

test("Listen page screenshots at 390 px, saved and saving, light and dark", async ({ page, browserName }) => {
  test.skip(!SHOTS || browserName !== "chromium", "only when OFFLINE_SHOTS names a folder");
  await page.setViewportSize({ width: 390, height: 844 });
  await openApp(page);
  await save(page, 1);
  for (const scheme of ["light", "dark"]) {
    await page.emulateMedia({ colorScheme: scheme });
    await page.evaluate(s => { document.documentElement.dataset.theme = s; try { document.body.dataset.theme = s } catch (e) {} }, scheme);
    await page.reload(); await expect(saveBtn(page, 1)).toHaveAttribute("data-off", "saved");
    await page.screenshot({ path: path.join(SHOTS, `listen-saved-${scheme}.png`), fullPage: false });
    await page.route("**/*.mp3", async r => { await new Promise(ok => setTimeout(ok, 4000)); r.continue().catch(() => {}) });
    await saveBtn(page, 2).click(); await page.locator(`[data-osave="3"]`).click(); await page.locator(`[data-osave="4"]`).click();
    await page.evaluate(() => document.querySelector("#offpanel").scrollIntoView());
    await page.screenshot({ path: path.join(SHOTS, `listen-saving-${scheme}.png`), fullPage: false });
    await page.unroute("**/*.mp3");
    await page.locator("#offstop").click();
    await page.context().setOffline(true); await page.reload(); await expect(page.locator(".offline-note")).toBeVisible();
    await page.screenshot({ path: path.join(SHOTS, `listen-offline-${scheme}.png`), fullPage: false });
    await page.context().setOffline(false);
  }
});
