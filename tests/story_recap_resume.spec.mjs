// Story so far, reader side (2026-10-16): the Previously card collapsed on chapter 2's opening page, the resume catch-up card on a
// mid-chapter return, the Story so far button's panel, and a course with no recaps file showing none of it. Expected text comes from
// full/v2/recaps.js through its own helpers with the seeded state, never from the engine's DOM.
import { test, expect } from "@playwright/test";

const fresh = extra => ({ pos: 0, max: 0, picks: {}, m: { trust: 50, conf: 50, health: 50 }, score: 0, flags: {}, dom: { "People": [0, 0], "Process": [0, 0], "Business Environment": [0, 0] }, drills: {}, ex: null, quiz: null, ...extra });
const ch1Done = flags => fresh({ pos: 99, max: 99, picks: { 0: 1, 1: 2, 2: 0, 3: 0, 4: 1, 5: 3, 6: 3, 7: 2, 8: 2, 9: 0, 10: 1, 11: 3 }, flags, doneAt: "2026-10-01T10:00:00.000Z" });
async function seed(page, kv) {
  await page.evaluate(kv => { for (const [k, v] of Object.entries(kv)) localStorage.setItem("halcyon." + k, JSON.stringify(v)) }, kv);
}
async function open(page, route) { await page.goto("about:blank"); await page.goto(route); }
const stepsOf = (page, n) => page.evaluate(n => {
  const c = window.HALCYON_FULL.find(x => x && x.num === n), out = [{ k: "open" }, { k: "lesson" }];
  c.scenes.forEach((sc, i) => { out.push({ k: "scene", i }); (c.drills || []).forEach((d, j) => { if (d.after === sc.id) out.push({ k: "drill", j }) }); if (c.exercise && c.exercise.after === sc.id) out.push({ k: "exercise" }) });
  out.push({ k: "quiz" }, { k: "end" }); return out;
}, n);
const posOf = (steps, k, i) => steps.findIndex(x => x.k === k && (i === undefined || x.i === i));
const recapFor = (page, n, pid) => page.evaluate(([n, pid]) => {
  const R = window.HALCYON_RECAPS, get = k => JSON.parse(localStorage.getItem("halcyon." + k) || "null");
  const all = {}, G = {}; for (let k = 1; k <= 15; k++) { const st = get("c" + (200 + k)); all[k] = st; if (k < n && st) Object.assign(G, st.flags || {}) }
  const s = all[n] || { picks: {}, flags: {} }; Object.assign(G, s.flags || {});
  return { x: R.recap(n, pid, s, all, G), prev: R.previously(n, s, all, G) };
}, [n, pid]);
const textOf = loc => loc.evaluate(e => e.innerText.replace(/\s+/g, " ").trim());
const norm = a => a.join(" ").replace(/\s+/g, " ").trim();
const DASH = /[–—]| - /;

test("Previously on: chapter 2's opening page, collapsed to one line once seen, opens on a tap", async ({ page }) => {
  await page.goto("/#pmp/home");
  await seed(page, { c201: ch1Done({}), "recap.pmp2.2": { open: false, seen: Date.now() } });
  await open(page, "/#pmp/full/2");
  const { prev } = await recapFor(page, 2, "open");
  await expect(page.locator("#recapcard .rct")).toHaveText("Previously on The Halcyon Launch");
  await expect(page.locator("#rctoggle")).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator("#recapcard .rcpre")).toHaveText(prev[0]);
  await expect(page.locator("#rcbody")).toBeHidden();
  await page.locator("#rctoggle").click();
  await expect(page.locator("#rcbody")).toBeVisible();
  expect(await textOf(page.locator("#rcbody"))).toBe(norm(prev));
  // the opening page is where the Previously card lives: no resume card here
  await expect(page.locator("#rcatch")).toHaveCount(0);
});

test("resume mid-chapter: a Story so far card with the short recap, More for the here line and the rest, Got it hides it", async ({ page }) => {
  await page.goto("/#pmp/home");
  const st = await stepsOf(page, 2), pos = posOf(st, "scene", 5);
  await seed(page, { c201: ch1Done({ nocharter: true }), c202: fresh({ pos, max: pos, picks: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 1 } }), "lastplace.pmp": { t: "full", n: 2 } });
  await open(page, "/#pmp/full/2");
  const { x } = await recapFor(page, 2, "s5");
  const card = page.locator("#rcatch");
  await expect(card).toBeVisible();
  await expect(card.locator("#rcatcht")).toHaveText("Story so far");
  // it sits at the top, above the page's own heading
  expect(await page.evaluate(() => !!(document.getElementById("rcatch").compareDocumentPosition(document.querySelector("#page .kicker")) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
  const short = x.short.length ? x.short : x.full.slice(-1);
  for (const t of short) await expect(card.locator(".rcbody > p", { hasText: t })).toHaveCount(1);
  await expect(page.locator("#rcatchfull")).toBeHidden();
  await page.locator("#rcatchmore").click();
  await expect(page.locator("#rcatchmore")).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#rcatchmore")).toHaveText("Less");
  await expect(page.locator("#rcatchfull .where")).toHaveText(x.here);
  expect(await textOf(page.locator("#rcatchfull"))).toBe(norm([x.here, ...x.full.filter(t => !short.includes(t))]));
  expect(await textOf(card)).not.toMatch(DASH);
  // a redraw on the same page keeps it; Got it hides it and puts focus on the page's heading
  await page.locator("#page .choice").first().click();
  await expect(page.locator("#rcatch")).toBeVisible();
  await page.locator("#rcatchx").click();
  await expect(page.locator("#rcatch")).toHaveCount(0);
  // coming back to the chapter shows it again
  await open(page, "/#pmp/full/2");
  await expect(page.locator("#rcatch")).toBeVisible();
  // moving to another page retires it, and going back doesn't bring it back
  await page.locator('.sdot[data-p="0"]').click();
  await expect(page.locator("#rcatch")).toHaveCount(0);
  await page.locator(`.sdot[data-p="${pos}"]`).click();
  await expect(page.locator("#rcatch")).toHaveCount(0);
});

test("resume card: not on a fresh chapter's opening page, and it follows focus mode's page order", async ({ page }) => {
  await page.goto("/#pmp/home");
  await seed(page, { c201: ch1Done({}), c202: fresh() });
  await open(page, "/#pmp/full/2");
  await expect(page.locator("#recapcard")).toBeVisible();
  await expect(page.locator("#rcatch")).toHaveCount(0);
  // focus mode: the lesson comes after the story, so a finished story resumed on the lesson reads as the ending's recap
  await seed(page, { storymode: true, c202: fresh({ pos: 14, max: 14, picks: Object.fromEntries([...Array(12)].map((_, i) => [i, 0])) }) });
  await open(page, "/#pmp/full/2");
  await expect(page.locator("#page .kicker").first()).toContainText("lesson");
  await expect(page.locator("#rcatch")).toBeVisible();
  await page.locator("#rcatchmore").click();
  const { x } = await recapFor(page, 2, "end");
  await expect(page.locator("#rcatchfull .where")).toHaveText(x.here);
});

test("Story so far button: opens the panel with this page's full recap, Escape closes it and returns focus", async ({ page }) => {
  await page.goto("/#pmp/home");
  const st = await stepsOf(page, 2), pos = posOf(st, "scene", 5);
  await seed(page, { c201: ch1Done({}), c202: fresh({ pos, max: pos, picks: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 1 } }) });
  await open(page, "/#pmp/full/2");
  const btn = page.locator("#storybtn");
  await expect(btn).toHaveText("Story so far");
  // it sits with Where am I in the chapter tools
  expect(await page.evaluate(() => document.getElementById("storybtn").parentElement === document.getElementById("wherebtn").parentElement)).toBe(true);
  await btn.click();
  const panel = page.locator("#wpanel");
  await expect(panel).toBeVisible();
  await expect(panel).toHaveAttribute("role", "dialog");
  await expect(panel).toHaveAttribute("data-mode", "story");
  await expect(panel).toHaveAttribute("data-pid", "s5");
  await expect(page.locator("#wtitle")).toHaveText("Story so far");
  await expect(page.locator("#wtitle")).toBeFocused();
  const { x } = await recapFor(page, 2, "s5");
  await expect(page.locator("#wherehere")).toHaveText(x.here);
  expect(await textOf(page.locator("#wstory"))).toBe(norm(x.full));
  expect(await textOf(panel)).not.toMatch(DASH);
  await page.keyboard.press("Escape");
  await expect(panel).toHaveCount(0);
  await expect(btn).toBeFocused();
  // on the opening page it's the chapter's previously text
  await seed(page, { c202: fresh(), "recap.pmp2.2": { open: false, seen: Date.now() } });
  await open(page, "/#pmp/full/2");
  await page.locator("#storybtn").click();
  const { prev } = await recapFor(page, 2, "open");
  expect(await textOf(page.locator("#wstory"))).toBe(norm(prev));
  await page.locator("#wclose").click();
  await expect(page.locator("#wpanel")).toHaveCount(0);
});

for (const scheme of ["light", "dark"]) {
  test(`resume card and Story so far panel at 390px ${scheme}: no sideways scroll, 24px targets, 4.5:1 text`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto("/#pmp/home");
    const st = await stepsOf(page, 2), pos = posOf(st, "scene", 5);
    await seed(page, { c201: ch1Done({}), c202: fresh({ pos, max: pos, picks: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 1 } }) });
    await open(page, "/#pmp/full/2");
    await page.locator("#rcatchmore").click();
    const check = sel => page.evaluate(sel => {
      const lum = c => { const m = c.match(/[\d.]+/g).map(Number); const [r, g, b] = m.slice(0, 3).map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4) }); return .2126 * r + .7152 * g + .0722 * b };
      const bgOf = el => { for (let e = el; e; e = e.parentElement) { const c = getComputedStyle(e).backgroundColor; const a = c.match(/[\d.]+/g); if (a && (a.length < 4 || +a[3] > .5)) return c } return "rgb(255,255,255)" };
      const out = [];
      document.querySelectorAll(sel).forEach(el => {
        const r = el.getBoundingClientRect(); if (!r.width) return;
        const txt = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
        if (txt) { const a = lum(getComputedStyle(el).color), b = lum(bgOf(el)); const k = (Math.max(a, b) + .05) / (Math.min(a, b) + .05); if (k < 4.5) out.push(`contrast ${k.toFixed(2)} ${el.className || el.tagName}`) }
        if (el.matches("button") && (r.height < 24 || r.width < 24)) out.push(`target ${Math.round(r.width)}x${Math.round(r.height)} ${el.id || el.className}`);
        if (r.right > document.documentElement.clientWidth + .5) out.push(`overflow ${el.id || el.className}`);
      });
      if (document.documentElement.scrollWidth > document.documentElement.clientWidth) out.push("sideways scroll " + document.documentElement.scrollWidth);
      return out;
    }, sel);
    expect(await check(".rcatch, .rcatch *, .chtools > button")).toEqual([]);
    await page.locator("#storybtn").click();
    expect(await check(".wpanel, .wpanel *")).toEqual([]);
  });
}

test("a course with no recaps file shows none of it", async ({ page }) => {
  // CPHIMS: open chapter 2 and move on to the lesson, so the engine saves a real mid-chapter state, then come back to it
  await open(page, "/#cphims/full/2");
  await expect(page.locator("#page .chmap")).toBeVisible();
  await expect(page.locator("#recapcard, #rcatch, #rback, #storybtn, #wherebtn, .rnote")).toHaveCount(0);
  await page.locator("#fnext").click();
  await expect(page.locator("#page .kicker").first()).toContainText("lesson");
  await open(page, "/#cphims/full/2");
  await expect(page.locator("#page .kicker").first()).toContainText("lesson");
  await expect(page.locator("#recapcard, #rcatch, #rback, #storybtn, #wherebtn, .rnote, #wpanel")).toHaveCount(0);
  await expect(page.locator("#wherecard")).toBeHidden();
});
