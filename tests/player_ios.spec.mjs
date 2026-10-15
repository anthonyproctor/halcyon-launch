// The player on an iPhone home-screen app (Anthony, 2026-10-14): "the phone PWA still doesn't pick up where I left off", "the slider to
// fast forward to the spot I was at doesn't work", and "on the lock screen I can pause the audio but it won't play". Runs in WebKit with
// the iPhone 15 profile. Real iOS lock screen controls and app suspension can't be emulated: the lock screen tests call the Media Session
// handlers the way iOS does, and the resume test plays out an app closed before its last save reached the server.
import { test, expect } from "@playwright/test";

const silence = () => {
  const P = HTMLMediaElement.prototype, d = Object.getOwnPropertyDescriptor(P, "muted"), play = P.play;
  Object.defineProperty(P, "muted", { configurable: true, get() { return d.get.call(this) }, set() { d.set.call(this, true) } });
  P.play = function () { d.set.call(this, true); return play.call(this) };
  document.addEventListener("play", e => d.set.call(e.target, true), true);
};
// capture every Media Session handler the page registers (iOS calls these from the lock screen and the car)
const mediaSpy = () => {
  const H = window.__ms = {};
  if (!("mediaSession" in navigator)) Object.defineProperty(navigator, "mediaSession", { configurable: true, value: { metadata: null, playbackState: "none", setActionHandler() {}, setPositionState() {} } });
  const ms = navigator.mediaSession, set = ms.setActionHandler.bind(ms);
  ms.setActionHandler = (k, f) => { H[k] = f; try { set(k, f) } catch (e) {} };
};
test.beforeEach(async ({ page }) => { await page.addInitScript(silence); await page.addInitScript(mediaSpy) });

async function playBook(page) {
  await page.goto("/#pmp/listen");
  await page.locator('.brow[data-b="1"]').tap();
  await page.waitForFunction(() => window.__nar.audio.duration > 60 && !window.__nar.audio.paused, null, { timeout: 15_000 });
}
const saved = page => page.evaluate(() => JSON.parse(localStorage.getItem("halcyon.c904") || "null"));

test("lock screen: pause, then play resumes; the scrubber (seekto) moves the audio and saves the spot", async ({ page }) => {
  await playBook(page);
  for (const k of ["play", "pause", "seekto", "seekforward", "seekbackward"]) expect(await page.evaluate(k => typeof window.__ms[k], k), k).toBe("function");
  await page.evaluate(() => window.__ms.pause());
  await expect.poll(() => page.evaluate(() => window.__nar.audio.paused)).toBe(true);
  await page.evaluate(() => window.__ms.play());
  await expect.poll(() => page.evaluate(() => window.__nar.audio.paused)).toBe(false);
  await page.evaluate(() => window.__ms.seekto({ seekTime: 40 }));
  await expect.poll(() => page.evaluate(() => Math.round(window.__nar.audio.currentTime))).toBeGreaterThanOrEqual(39);
  await expect.poll(async () => { const L = await saved(page); return L && L.book && Math.round(L.book.t) }).toBeGreaterThanOrEqual(39);
});

test("seek bar: a tap on the track jumps there (iOS range inputs only drag the thumb)", async ({ page }) => {
  await playBook(page);
  await page.evaluate(() => window.__nar.audio.pause());
  const box = await page.locator("#narseek").boundingBox();
  await page.touchscreen.tap(box.x + 8 + (box.width - 16) * 0.5, box.y + box.height / 2);
  const r = await page.evaluate(() => window.__nar.audio.currentTime / window.__nar.audio.duration);
  expect(r).toBeGreaterThan(0.45); expect(r).toBeLessThan(0.55);
});

test("seek bar: dragging before the audio has loaded seeks once its metadata arrives", async ({ page }) => {
  await playBook(page);
  const dur = await page.evaluate(() => window.__nar.audio.duration);
  // the element iOS unloads while the app sits paused: same file, no metadata yet
  await page.evaluate(() => { const a = window.__nar.audio, src = a.src; a.pause(); a.removeAttribute("src"); a.load(); a.src = src; a.preload = "none" });
  await expect.poll(() => page.evaluate(() => window.__nar.audio.readyState)).toBe(0);
  const box = await page.locator("#narseek").boundingBox();
  await page.touchscreen.tap(box.x + 8 + (box.width - 16) * 0.25, box.y + box.height / 2);
  await expect.poll(() => page.evaluate(() => window.__nar.audio.currentTime), { timeout: 10_000 }).toBeGreaterThan(dur * 0.2);
});

test("app closed before its last save reached the server: on open, this device's newer spot wins and is sent up", async ({ page }) => {
  const HOST = "http://halcyon.test", LOCAL = "http://localhost:4321", now = Date.now(), puts = [];
  const server = { 904: { book: { ed: "story", n: 1, t: 10, dur: 2000, at: now - 600000 }, at: now - 600000 } };
  await page.route(HOST + "/**", async r => {
    const req = r.request(), u = new URL(req.url());
    if (u.pathname === "/api/auth") return r.fulfill({ json: u.searchParams.get("action") === "me" ? { user: { name: "Test Player", admin: false, tester: false, cur: 0 }, progress: server } : { ok: true } });
    if (u.pathname === "/api/progress") { if (req.method() === "PUT") puts.push(req.postDataJSON()); return r.fulfill({ json: { ok: true } }); }
    if (u.pathname.startsWith("/api/") || u.pathname.startsWith("/_vercel/")) return r.fulfill({ status: 404, body: "" });
    try { await r.fulfill({ response: await r.fetch({ url: LOCAL + u.pathname + u.search }) }); } catch (e) {}
  });
  await page.goto(HOST + "/#guide");
  await expect(page.locator("#page h1")).toBeVisible();
  const mine = { book: { ed: "story", n: 3, t: 612.4, dur: 2000, at: now }, at: now };
  await page.evaluate(L => localStorage.setItem("halcyon.c904", JSON.stringify(L)), mine);
  await page.reload();
  await expect(page.locator("#page h1")).toBeVisible();
  await expect.poll(async () => { const L = await saved(page); return L && L.book && L.book.n }).toBe(3);
  await expect.poll(() => puts.some(p => p.chapter === 904 && p.state && p.state.book && p.state.book.n === 3)).toBe(true);
});

// ---- 2026-10-14, second report from his iPhone: "the scrubber still doesn't work. It brings the screen and the blue text to the right spot
// but not the audio: it plays from the top and keeps going." The audio here comes from a second origin (standing in for the R2 host: byte
// ranges and CORS), like production. iOS can drop a seek it accepted and keep playing from where it was; that is simulated by snapping the
// element back once right after the bar's seek lands.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const HX = "0123456789ab";
let srv, ABASE;
test.describe("remote audio, like the R2 host", () => {
  test.beforeAll(async () => {
    srv = http.createServer((req, res) => {
      const key = decodeURIComponent(new URL(req.url, "http://x").pathname).replace(/^\/+/, ""), m0 = /^(.+)\.([0-9a-f]{12})\.mp3$/.exec(key);
      const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Expose-Headers": "Content-Length, Content-Range, Accept-Ranges" };
      const f = m0 ? path.join(ROOT, m0[1] + ".mp3") : "";
      if (!m0 || !f.startsWith(ROOT + path.sep) || !fs.existsSync(f)) { res.writeHead(404, cors); res.end(); return }
      const size = fs.statSync(f).size, m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || "");
      if (m) { const a = m[1] ? +m[1] : 0, b = m[2] ? Math.min(+m[2], size - 1) : size - 1;
        res.writeHead(206, { ...cors, "Content-Type": "audio/mpeg", "Content-Range": `bytes ${a}-${b}/${size}`, "Content-Length": b - a + 1 }); fs.createReadStream(f, { start: a, end: b }).pipe(res); return }
      res.writeHead(200, { ...cors, "Content-Type": "audio/mpeg", "Content-Length": size, "Accept-Ranges": "bytes" }); fs.createReadStream(f).pipe(res);
    });
    await new Promise(ok => srv.listen(0, "127.0.0.1", ok));
    ABASE = `http://127.0.0.1:${srv.address().port}`;
  });
  test.afterAll(() => new Promise(ok => srv.close(ok)));
  test.beforeEach(async ({ page }) => {
    await page.route("**/config.js", r => r.fulfill({ contentType: "text/javascript", body: `window.HALCYON_AUDIO_BASE=${JSON.stringify(ABASE)};` }));
    await page.route("**/audio-manifest.json", r => r.fulfill({ json: { files: { "audio/v2/full-ch01.mp3": HX, "audio/v2/story/full-ch01.mp3": HX } } }));
  });
  const seeks = page => page.evaluate(() => { const a = window.__nar.audio; window.__seeks = []; a.addEventListener("seeking", () => window.__seeks.push(+a.currentTime.toFixed(1))) });

  test("the bar's seek sticks even if the player snaps back once after it lands", async ({ page }) => {
    await playBook(page);
    expect(await page.evaluate(() => window.__nar.audio.src)).toContain("127.0.0.1"); // playing the remote copy
    const dur = await page.evaluate(() => window.__nar.audio.duration);
    // iOS: the seek is accepted, then the player carries on from where it was
    await page.evaluate(() => { const a = window.__nar.audio, d = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, "currentTime"); let once = true;
      a.addEventListener("seeked", () => { if (once) { once = false; const back = window.__before; setTimeout(() => d.set.call(a, back), 0) } }); window.__before = a.currentTime });
    const box = await page.locator("#narseek").boundingBox();
    await page.touchscreen.tap(box.x + 8 + (box.width - 16) * 0.6, box.y + box.height / 2);
    await page.waitForTimeout(2500);
    const r = await page.evaluate(() => window.__nar.audio.currentTime) / dur;
    expect(r).toBeGreaterThan(0.55); expect(r).toBeLessThan(0.65);
  });

  test("a newer seek cancels an older pending one: a resume seek never drags the audio back after the reader scrubs", async ({ page }) => {
    await playBook(page);
    const dur = await page.evaluate(() => window.__nar.audio.duration);
    await page.evaluate(() => { const a = window.__nar.audio, src = a.src; a.pause(); a.removeAttribute("src"); a.load(); a.src = src; a.preload = "none" });
    await expect.poll(() => page.evaluate(() => window.__nar.audio.readyState)).toBe(0);
    await seeks(page);
    await page.evaluate(() => window.__player.seekTo(30, "resume")); // the saved spot, pending until the file loads
    const box = await page.locator("#narseek").boundingBox();
    await page.touchscreen.tap(box.x + 8 + (box.width - 16) * 0.6, box.y + box.height / 2); // then the reader drags to 60%
    await page.evaluate(() => window.__nar.audio.play());
    await page.waitForTimeout(2500);
    const t = await page.evaluate(() => window.__nar.audio.currentTime);
    expect(t / dur).toBeGreaterThan(0.55);
    const back = await page.evaluate(() => window.__seeks.filter(x => Math.abs(x - 30) < 2).length);
    expect(back).toBe(0); // never pulled back to the old spot
  });

  test("a paragraph tap (follow along text) moves the audio, and it stays", async ({ page }) => {
    await playBook(page);
    const p = page.locator("#bftext [data-t]").nth(8);
    test.skip(!(await p.count()), "no follow along text for this chapter");
    const want = +(await p.getAttribute("data-t"));
    await p.tap();
    await page.waitForTimeout(1500);
    const t = await page.evaluate(() => window.__nar.audio.currentTime);
    expect(Math.abs(t - want)).toBeLessThan(4);
  });
});

test("lock screen play refused by iOS (NotAllowedError) keeps the element and the spot: no reload", async ({ page }) => {
  await playBook(page);
  await page.evaluate(() => window.__ms.seekto({ seekTime: 40 }));
  await expect.poll(() => page.evaluate(() => Math.round(window.__nar.audio.currentTime))).toBeGreaterThanOrEqual(39);
  await page.evaluate(() => window.__ms.pause());
  await page.evaluate(() => { const a = window.__nar.audio; window.__loads = 0; a.addEventListener("loadstart", () => window.__loads++);
    const orig = a.play; a.play = function () { a.play = orig; const e = new Error("not allowed"); e.name = "NotAllowedError"; return Promise.reject(e) } });
  await page.evaluate(() => window.__ms.play());
  await page.waitForTimeout(800);
  expect(await page.evaluate(() => window.__loads)).toBe(0);
  expect(Math.round(await page.evaluate(() => window.__nar.audio.currentTime))).toBeGreaterThanOrEqual(39);
  await page.evaluate(() => window.__ms.play()); // the next press plays
  await expect.poll(() => page.evaluate(() => window.__nar.audio.paused)).toBe(false);
});

test("player diagnostics: with the switch on, seeks, lock screen actions and element events are batched to /api/qa-report?action=diag", async ({ page }) => {
  const sent = [];
  await page.route("**/api/qa-report?action=diag", r => { sent.push(JSON.parse(r.request().postData() || "{}")); r.fulfill({ json: { ok: true } }) });
  await page.addInitScript(() => localStorage.setItem("halcyon.pdbg", "true"));
  await playBook(page);
  await page.evaluate(() => { window.__ms.pause(); window.__ms.seekto({ seekTime: 20 }) });
  await page.waitForTimeout(500);
  await page.evaluate(() => window.__player.dflush());
  await expect.poll(() => sent.length).toBeGreaterThan(0);
  const evs = sent.flatMap(b => b.events).map(e => e.ev);
  for (const k of ["seek", "playing", "ms:pause", "ms:seekto", "seeked"]) expect(evs, k).toContain(k);
  expect(sent[0].sid).toMatch(/^[a-z0-9]+$/);
  const off = await page.evaluate(() => { window.__player.pdbg.on = false; window.__diag.buf.length = 0; window.__player.dlog("x"); return window.__diag.buf.length });
  expect(off).toBe(0); // nothing is buffered while the switch is off
});
