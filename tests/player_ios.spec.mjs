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
