// Player bar on an iPhone (bug 2026-10-12: "the player bar gets stuck in the middle of my phone screen" while scrolling a chapter that
// reads aloud). Runs in WebKit with the iPhone 15 profile (the webkit-iphone project in playwright.config.mjs), at the Safari tab size and
// the home-screen app size. After every step the bar's bottom must sit on the bottom of the window and of the visual viewport.
// Emulated WebKit does not scroll the way an iPhone does (no finger momentum, no collapsing toolbar, no UI-side layers), so the bar
// position checks pass on the old code too: they guard the CSS (fixed, child of body, no transformed ancestor). What tells the old code
// from the fix is the scroll order: the app never starts a window scroll of its own while a finger or momentum scroll is going, a Keep
// going page turn waits for the hand, a tapped Next is never delayed, and a page turn from far down jumps instead of one long smooth scroll.
// No virtual keyboard here: "note field focused" only checks the layout, not the iOS keyboard.
import { test, expect, devices } from "@playwright/test";

// WebKit has no --mute-audio switch: every media element is forced silent through the browser's own muted setter, before any page script runs
const silence = () => {
  const P = HTMLMediaElement.prototype, d = Object.getOwnPropertyDescriptor(P, "muted"), play = P.play;
  window.__reallyMuted = el => d.get.call(el);
  Object.defineProperty(P, "muted", { configurable: true, get() { return d.get.call(this) }, set() { d.set.call(this, true) } });
  P.play = function () { d.set.call(this, true); return play.call(this) };
  document.addEventListener("play", e => d.set.call(e.target, true), true); // autoplay too
};
test.beforeEach(async ({ page }) => { await page.addInitScript(silence) });

const SIZES = { "Safari tab": devices["iPhone 15"].viewport, "home-screen app": { width: 393, height: 852 } };

// record every window scroll the page starts itself, with whether a finger was down or a hand scroll was moving at that moment
// (a scroll a tap asked for, inside its click handler, is the reader's own and doesn't count)
async function spy(page) {
  await page.addInitScript(() => {
    const S = window.__spy = { log: [], hand: false, last: -1e9 };
    const L = (k, a) => S.log.push({ k, a, at: performance.now(), hand: !(window.event && window.event.type === "click") && (S.hand || performance.now() - S.last < 300), scr: (window.__scr ? JSON.stringify({ touch: __scr.touch, since: Math.round(performance.now() - __scr.user), auto: __scr.auto }) : ""), why: (new Error().stack || "").split("\n").slice(2, 7).join(" < ") });
    const si = Element.prototype.scrollIntoView; Element.prototype.scrollIntoView = function (o) { if (!this.closest("#bftext")) L("scrollIntoView"); return si.call(this, o) };
    const st = S.raw = window.scrollTo; window.scrollTo = function (...a) { L("scrollTo", a[0] && a[0].behavior); return st.apply(this, a) };
  });
}
// the bar is where it belongs: bottom edge on the window bottom and the visual viewport bottom, a direct child of body, nothing above it
// that would make position:fixed follow an element instead of the viewport
async function barAtBottom(page, where) {
  const m = await page.evaluate(() => {
    const b = document.getElementById("narbar"); if (!b || b.hidden) return null;
    const r = b.getBoundingClientRect(), vv = window.visualViewport, bad = [];
    for (let e = b.parentElement; e; e = e.parentElement) { const s = getComputedStyle(e);
      if (s.transform !== "none" || s.filter !== "none" || s.perspective !== "none" || (s.contain && s.contain !== "none") || !/^(auto)?$/.test(s.willChange) || (s.backdropFilter && s.backdropFilter !== "none")) bad.push(e.tagName) }
    const loud = [...document.querySelectorAll("audio, video"), window.__nar && window.__nar.audio].filter(x => x && !x.paused && !window.__reallyMuted(x)).length; // playing and audible
    return { bottom: r.bottom, ih: innerHeight, vvb: vv.offsetTop + vv.height, parent: b.parentElement.tagName, bad, pos: getComputedStyle(b).position, loud };
  });
  expect(m, `${where}: the bar shows`).not.toBeNull();
  expect(m.loud, `${where}: nothing plays out loud`).toBe(0);
  expect(m.pos, where).toBe("fixed");
  expect(m.parent, `${where}: the bar is a child of body`).toBe("BODY");
  expect(m.bad, `${where}: no transformed ancestor`).toEqual([]);
  expect(Math.abs(m.bottom - m.ih), `${where}: bar bottom ${m.bottom} vs window ${m.ih}`).toBeLessThanOrEqual(2);
  expect(Math.abs(m.bottom - m.vvb), `${where}: bar bottom ${m.bottom} vs visual viewport ${m.vvb}`).toBeLessThanOrEqual(2);
}
// a finger scroll: touchstart, moves that scroll the page, touchend, then momentum (the page keeps scrolling with no finger down)
async function fingerScroll(page, dy, { hold = false } = {}) {
  await page.evaluate(async ([dy, hold]) => {
    const S = window.__spy, el = document.elementFromPoint(innerWidth / 2, innerHeight / 3) || document.body;
    const fire = t => el.dispatchEvent(new Event(t, { bubbles: true }));
    const frame = () => new Promise(r => requestAnimationFrame(r));
    S.hand = true; fire("touchstart");
    for (let i = 0; i < 10; i++) { fire("touchmove"); S.last = performance.now(); scrollBy(0, dy / 10); await frame(); }
    if (hold) return;
    fire("touchend"); S.hand = false;
    for (let i = 0; i < 10; i++) { S.last = performance.now(); scrollBy(0, dy / 20); await frame(); await frame(); }
  }, [dy, hold]);
}
// the held finger moves again and flicks off the glass: moves, touchend, momentum
const lift = page => page.evaluate(async () => { const S = window.__spy, el = document.elementFromPoint(10, 10) || document.body, frame = () => new Promise(r => requestAnimationFrame(r));
  for (let i = 0; i < 4; i++) { el.dispatchEvent(new Event("touchmove", { bubbles: true })); S.last = performance.now(); scrollBy(0, -20); await frame(); }
  el.dispatchEvent(new Event("touchend", { bubbles: true })); S.hand = false;
  for (let i = 0; i < 6; i++) { S.last = performance.now(); scrollBy(0, -20); await frame(); } });
const scrollsDuringHand = page => page.evaluate(() => window.__spy.log.filter(x => x.hand).map(x => `${x.k} at ${Math.round(x.at)} ${x.scr} from ${x.why}`));
const startListening = async page => {
  await page.locator("#narplay").tap();
  await page.waitForFunction(() => window.__nar && !window.__nar.audio.paused, null, { timeout: 15_000 });
};

for (const [size, viewport] of Object.entries(SIZES)) {
  test.describe(`iPhone, ${size}`, () => {
    test.use({ viewport });

    test("chapter page reading aloud: the bar stays on the bottom through finger scrolls, follow scrolls and a page turn mid-scroll", async ({ page }) => {
      await spy(page);
      await page.goto("/#pilot/full/1");
      await expect(page.locator("#page .chmap")).toBeVisible();
      await barAtBottom(page, "chapter loaded");
      await startListening(page);
      await barAtBottom(page, "listening");
      // the reading moves past the window: the follow scroll runs (nobody is touching)
      await page.waitForFunction(() => window.__nar.audio.duration > 0, null, { timeout: 15_000 });
      await page.evaluate(() => new Promise(ok => { const a = window.__nar.audio; a.addEventListener("seeked", () => ok(), { once: true }); setTimeout(ok, 3000); a.currentTime = a.duration * 0.9 }));
      await expect.poll(() => page.evaluate(() => window.__spy.log.filter(x => x.k === "scrollIntoView").length), { timeout: 15_000 }).toBeGreaterThan(0);
      await page.waitForTimeout(900);
      await barAtBottom(page, "after a follow scroll");
      // finger scrolls down and back up while it reads
      await fingerScroll(page, 700); await barAtBottom(page, "finger scroll down");
      await fingerScroll(page, -500); await barAtBottom(page, "finger scroll up");
      await fingerScroll(page, 2500); await barAtBottom(page, "long finger scroll away from the reading");
      expect(await page.evaluate(() => window.__nar.free), "scrolling by hand stops the follow").toBe(true);
      // "Follow the reading" brings it back
      await expect(page.locator("#narfollow")).toBeVisible();
      await page.waitForTimeout(400); // the reader looks, then taps: their own tap may scroll
      await page.locator("#narfollow").tap(); await page.waitForTimeout(800);
      await barAtBottom(page, "follow the reading");
      // the page ends with Keep going on and turns by itself while a finger is still on the glass: the jump to the top waits for the
      // finger and the momentum (the real path: the audio "ended" handler clicks Next 700 ms later)
      await page.evaluate(() => { const c = document.getElementById("narauto"); if (!c.checked) c.click() });
      await page.evaluate(() => window.__spy.raw.call(window, 0, document.documentElement.scrollHeight));
      await page.waitForTimeout(200);
      const before = await page.evaluate(() => window.__spy.log.length);
      const hash = await page.evaluate(() => location.hash + "|" + document.querySelector("#page h1, #page h2").textContent);
      await fingerScroll(page, -300, { hold: true });
      await page.evaluate(() => { const a = window.__nar.audio; a.currentTime = Math.max(0, a.duration - 0.2) });
      await expect.poll(() => page.evaluate(() => location.hash + "|" + document.querySelector("#page h1, #page h2").textContent), { timeout: 10_000 }).not.toBe(hash);
      await page.waitForTimeout(300);
      expect(await page.evaluate(n => window.__spy.log.slice(n).map(x => x.k), before), "no app scroll under a finger").toEqual([]);
      await barAtBottom(page, "page turned under a finger");
      await lift(page);
      await expect.poll(() => page.evaluate(() => scrollY), { timeout: 5_000 }).toBeLessThan(5);
      await barAtBottom(page, "page turn after the finger lifts");
      // from far down, the page turn jumps; it never runs a long smooth scroll the follow scroll could cut into
      const turn = await page.evaluate(n => window.__spy.log.slice(n), before);
      expect(turn[0].k).toBe("scrollTo");
      expect(turn[0].a, "a page turn from far down jumps").toBe("auto");
      expect(await scrollsDuringHand(page), "app scrolls while a hand scroll was moving").toEqual([]);
    });

    test("a tapped Next turns the page and scrolls to the top at once, even when the tap wobbles", async ({ page }) => {
      await spy(page);
      await page.goto("/#pilot/full/1");
      await expect(page.locator("#page .chmap")).toBeVisible();
      await page.evaluate(() => window.__spy.raw.call(window, 0, document.documentElement.scrollHeight));
      await page.waitForTimeout(300);
      // iOS sends a touchmove or two inside an ordinary tap; the page itself does not move
      const lag = await page.evaluate(() => { const b = document.getElementById("fnext"), S = window.__spy, n = S.log.length;
        for (const t of ["touchstart", "touchmove", "touchmove", "touchend"]) b.dispatchEvent(new Event(t, { bubbles: true }));
        const t0 = performance.now(); b.click(); const x = S.log.slice(n).find(e => e.k === "scrollTo"); return x ? x.at - t0 : null });
      expect(lag, "the scroll to the top starts with the tap").not.toBeNull();
      expect(lag).toBeLessThan(50);
      await barAtBottom(page, "tapped Next");
    });

    test("Where am I, a bookmark note and the test profile banner: the bar stays on the bottom", async ({ page }) => {
      await spy(page);
      await page.goto("/?qa=1&test=1#pmp/full/1");
      await expect(page.locator("#tpbadge")).toBeVisible();
      await expect(page.locator("#page .chmap")).toBeVisible();
      await startListening(page);
      await barAtBottom(page, "test profile banner on");
      await fingerScroll(page, 600); await barAtBottom(page, "banner on, finger scroll");
      await page.evaluate(() => window.__spy.raw.call(window, 0, 0));
      await page.locator("#wherebtn").tap();
      await expect(page.locator("#wpanel")).toBeVisible();
      await barAtBottom(page, "Where am I open");
      await page.keyboard.press("Escape");
      await expect(page.locator("#wpanel")).toHaveCount(0);
      await barAtBottom(page, "Where am I closed");
      for (let i = 0; i < 6 && !(await page.locator("#page .choice, #page .outcome").count()); i++) await page.locator("#fnext").tap();
      await page.locator("#bmbtn").tap();
      await page.locator('#bmrow [data-bm="note"]').tap();
      await expect(page.locator("#bmrowin")).toBeFocused();
      await barAtBottom(page, "note field focused");
      await page.locator("#bmrowin").fill("check the bar");
      await page.keyboard.press("Enter");
      await barAtBottom(page, "note saved");
      await fingerScroll(page, 400); await barAtBottom(page, "after the note, finger scroll");
      expect(await scrollsDuringHand(page)).toEqual([]);
    });

    test("Audiobook: page and follow-along scrolls, a tapped paragraph and a chapter switch keep the bar on the bottom", async ({ page }) => {
      await spy(page);
      await page.goto("/#pmp/listen");
      await page.locator('.brow[data-b="1"]').tap();
      await expect(page.locator("#bftext .bw").first()).toBeAttached({ timeout: 15_000 });
      await page.waitForFunction(() => window.__nar.audio.duration > 0 && !window.__nar.audio.paused, null, { timeout: 15_000 });
      await barAtBottom(page, "audiobook playing");
      await fingerScroll(page, 500); await barAtBottom(page, "audiobook page scroll");
      await page.evaluate(() => { const b = document.getElementById("bftext"); b.dispatchEvent(new Event("touchmove", { bubbles: true })); b.scrollTop += 1500 });
      await page.waitForTimeout(400); await barAtBottom(page, "follow-along box scrolled");
      await page.locator("#bftext .bfp").nth(4).tap(); await page.waitForTimeout(900);
      await barAtBottom(page, "paragraph tapped");
      await page.evaluate(() => window.__spy.raw.call(window, 0, 0));
      const next = page.locator('.brow[data-b="2"]');
      if (await next.count()) {
        await next.tap();
        await page.waitForFunction(() => window.__nar.book && window.__nar.book.n === 2, null, { timeout: 15_000 });
        await page.waitForTimeout(900);
        await barAtBottom(page, "switched to chapter 2");
      }
      await fingerScroll(page, 400); await barAtBottom(page, "after the switch, finger scroll");
      expect(await scrollsDuringHand(page)).toEqual([]);
    });
  });
}
