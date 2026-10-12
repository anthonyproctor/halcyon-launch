// Story so far (approved 2026-10-12): the "Previously on" card on a chapter's opening page, the "Where am I?" panel, and the orientation
// notes in chapters 1 to 3. Expected text is read from full/v2/recaps.js through its own helpers with the state the test seeded, never from
// the engine's DOM, and the spoiler checks look for later pages' recap text that must not appear.
import { test, expect } from "@playwright/test";

const DAY = 864e5;
const fresh = extra => ({ pos: 0, max: 0, picks: {}, m: { trust: 50, conf: 50, health: 50 }, score: 0, flags: {}, dom: { "People": [0, 0], "Process": [0, 0], "Business Environment": [0, 0] }, drills: {}, ex: null, quiz: null, ...extra });
const ch1Done = flags => fresh({ pos: 99, max: 99, picks: { 0: 1, 1: 2, 2: 0, 3: 0, 4: 1, 5: 3, 6: 3, 7: 2, 8: 2, 9: 0, 10: 1, 11: 3 }, flags, doneAt: "2026-10-01T10:00:00.000Z" });
async function seed(page, kv, prefix = "halcyon.") {
  await page.evaluate(([kv, prefix]) => { for (const [k, v] of Object.entries(kv)) localStorage.setItem(prefix + k, JSON.stringify(v)) }, [kv, prefix]);
}
async function open(page, route) { await page.goto("about:blank"); await page.goto(route); }
const noDialogs = page => page.on("dialog", d => { throw new Error("a browser dialog opened: " + d.message()) });
// the engine's step order for a chapter (engine.js stepsBase, reading order, no labs): open, lesson, each decision with the drills and
// exercise placed after it, quiz, end
const stepsOf = (page, n) => page.evaluate(n => {
  const c = window.HALCYON_FULL.find(x => x && x.num === n), out = [{ k: "open" }, { k: "lesson" }];
  c.scenes.forEach((sc, i) => { out.push({ k: "scene", i }); (c.drills || []).forEach((d, j) => { if (d.after === sc.id) out.push({ k: "drill", j }) }); if (c.exercise && c.exercise.after === sc.id) out.push({ k: "exercise" }) });
  out.push({ k: "quiz" }, { k: "end" }); return out;
}, n);
const posOf = (steps, k, i) => steps.findIndex(x => x.k === k && (i === undefined || x.i === i));
// the recap data for a page, from recaps.js with the reader's saved state (the same s, all, G the chapters get)
const recapFor = (page, n, pid) => page.evaluate(([n, pid]) => {
  const R = window.HALCYON_RECAPS, get = k => JSON.parse(localStorage.getItem("halcyon." + k) || "null");
  const all = {}, G = {}; for (let k = 1; k <= 15; k++) { const st = get("c" + (200 + k)); all[k] = st; if (k < n && st) Object.assign(G, st.flags || {}) }
  const s = all[n] || { picks: {}, flags: {} }; Object.assign(G, s.flags || {});
  return { x: R.recap(n, pid, s, all, G), prev: R.previously(n, s, all, G), pids: R.pids };
}, [n, pid]);
const textOf = loc => loc.evaluate(e => e.innerText.replace(/\s+/g, " ").trim());
const norm = a => a.join(" ").replace(/\s+/g, " ").trim();

test("Previously on: chapter 2's card reflects a chapter 1 flag, and chapter 1 shows Before you start", async ({ page }) => {
  noDialogs(page);
  await page.goto("/#pmp/full/1");
  await expect(page.locator("#recapcard .rct")).toHaveText("Before you start");
  const before = await page.evaluate(() => window.HALCYON_RECAPS.ch[1].before);
  expect(await textOf(page.locator("#rcbody"))).toBe(norm(before));

  // nocharter set in chapter 1: the recap says he ran his first month with no signed charter
  await seed(page, { c201: ch1Done({ nocharter: true }), "lastplace.pmp": { t: "full", n: 2 } });
  await open(page, "/#pmp/full/2");
  await expect(page.locator("#recapcard .rct")).toHaveText("Previously on The Halcyon Launch");
  let { prev } = await recapFor(page, 2, "open");
  expect(await textOf(page.locator("#rcbody"))).toBe(norm(prev));
  await expect(page.locator("#rcbody")).toContainText("with no signed charter");

  // without the flag (and Hale's charter picked, s1 option 2), it's the signed charter instead
  await seed(page, { c201: ch1Done({}), c202: fresh() });
  await page.evaluate(() => localStorage.removeItem("halcyon.recap.pmp2.2"));
  await open(page, "/#pmp/full/2");
  ({ prev } = await recapFor(page, 2, "open"));
  expect(await textOf(page.locator("#rcbody"))).toBe(norm(prev));
  await expect(page.locator("#rcbody")).not.toContainText("no signed charter");
  await expect(page.locator("#rcbody")).toContainText("signed his two page charter");
});

test("Previously on: opens itself the first time and after 4 days away, stays one line otherwise, and remembers a toggle", async ({ page }) => {
  await page.goto("/#pmp/home");
  const now = await page.evaluate(() => Date.now());
  const away = async days => {
    await page.evaluate(() => localStorage.clear());
    const t = now - days * DAY;
    await seed(page, { c201: ch1Done({}), c202: fresh(), "lastplace.pmp": { t: "full", n: 2 }, "readat.pmp2.1": t, c99990: { pins: [], last: { pmp: { t: "full", n: 2, at: t } }, at: t }, "recap.pmp2.2": { open: false, seen: t } });
    await open(page, "/#pmp/full/2");
    await expect(page.locator("#recapcard")).toBeVisible();
  };
  // first time this chapter's card is shown: open
  await page.evaluate(() => localStorage.clear());
  await seed(page, { c201: ch1Done({}) });
  await open(page, "/#pmp/full/2");
  await expect(page.locator("#rctoggle")).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#rcbody")).toBeVisible();

  // a 4 day gap: open
  await away(4);
  await expect(page.locator("#rctoggle")).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#rcbody")).toBeVisible();
  // a redraw in the same visit keeps it open
  await page.locator("#wherebtn").click(); await page.keyboard.press("Escape");
  await expect(page.locator("#rctoggle")).toHaveAttribute("aria-expanded", "true");

  // a 1 day gap: collapsed to one line
  await away(1);
  await expect(page.locator("#rctoggle")).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator("#rcbody")).toBeHidden();
  const lineH = await page.locator("#rctoggle .rcpre").evaluate(e => [e.getBoundingClientRect().height, parseFloat(getComputedStyle(e).lineHeight) || 22]);
  expect(lineH[0]).toBeLessThanOrEqual(lineH[1] * 1.5);
  // so is a 2.9 day gap
  await away(2.9);
  await expect(page.locator("#rctoggle")).toHaveAttribute("aria-expanded", "false");

  // the reader opens it: remembered for this chapter on the next visit, without a gap
  await page.locator("#rctoggle").click();
  await expect(page.locator("#rcbody")).toBeVisible();
  await open(page, "/#pmp/full/2");
  await expect(page.locator("#rctoggle")).toHaveAttribute("aria-expanded", "true");
  await page.locator("#rctoggle").press("Enter");
  await expect(page.locator("#rcbody")).toBeHidden();
  await open(page, "/#pmp/full/2");
  await expect(page.locator("#rctoggle")).toHaveAttribute("aria-expanded", "false");
  // a study log day 4 days back (no other times) also counts as away
  await page.evaluate(() => localStorage.clear());
  const d = new Date(now - 5 * DAY), day = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  await seed(page, { c201: ch1Done({}), c905: { v: 1, days: { [day]: { t: { x: [600, 0] }, a: ["c1"] } } }, "recap.pmp2.2": { open: false, seen: now - 5 * DAY } });
  await open(page, "/#pmp/full/2");
  await expect(page.locator("#rctoggle")).toHaveAttribute("aria-expanded", "true");
});

test("Where am I: a mid-chapter page shows its own here line, recap and cast, and nothing from later pages", async ({ page }) => {
  noDialogs(page);
  await page.goto("/#pmp/home");
  const st = await stepsOf(page, 2);
  const pos = posOf(st, "scene", 5);
  await seed(page, { c201: ch1Done({ nocharter: true }), c202: fresh({ pos, max: pos, picks: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 1 } }), "lastplace.pmp": { t: "full", n: 2 } });
  await open(page, "/#pmp/full/2");
  const { x, pids } = await recapFor(page, 2, "s5");

  // open from the chapter header with the keyboard
  await page.locator("#wherebtn").focus(); await page.keyboard.press("Enter");
  const panel = page.locator("#wpanel");
  await expect(panel).toBeVisible();
  await expect(panel).toHaveAttribute("role", "dialog");
  await expect(panel).toHaveAttribute("aria-modal", "true");
  await expect(panel).toHaveAttribute("data-pid", "s5");
  await expect(page.locator("#wtitle")).toBeFocused();
  await expect(page.locator("#wherehere")).toHaveText(x.here);
  expect(x.here).toContain("Chapter 2");
  expect(await textOf(page.locator("#wshort"))).toBe(norm(x.short));
  await expect(page.locator("#wfull")).toBeHidden();
  await page.locator("#wmore").click();
  await expect(page.locator("#wmore")).toHaveAttribute("aria-expanded", "true");
  expect(await textOf(page.locator("#wfull"))).toBe(norm(x.full));
  const names = await page.locator("#wwho li b").allTextContents();
  expect(names).toEqual(x.who.map(o => o.name));
  expect(await page.locator("#wwho .wwl").allTextContents()).toEqual(x.who.map(o => o.line));

  // no recap text from a later page appears unless this page's own recap has the same sentence
  const mine = new Set([...x.short, ...x.full, x.here, ...x.who.map(o => o.line)]);
  const shown = await textOf(panel);
  for (const later of pids.slice(pids.indexOf("s5") + 1)) {
    const y = (await recapFor(page, 2, later)).x;
    for (const t of [...y.short, ...y.full, y.here]) if (!mine.has(t)) expect(shown, `text from ${later}`).not.toContain(t);
  }
  // nothing about later pages is anywhere in the document either (no hidden copy)
  const body = await page.evaluate(() => document.body.innerText);
  for (const later of ["s8", "s11", "end"]) { const y = (await recapFor(page, 2, later)).x; for (const t of y.full) if (!mine.has(t)) expect(body).not.toContain(t) }

  // Escape closes it and puts focus back on the button, even after a click on the panel's text
  await page.locator("#wshort p").first().click();
  await page.keyboard.press("Escape");
  await expect(panel).toHaveCount(0);
  await expect(page.locator("#wherebtn")).toBeFocused();
  // the rail button opens the same page's panel; Close closes it
  await page.locator("#railwhere").click();
  await expect(page.locator("#wpanel")).toHaveAttribute("data-pid", "s5");
  await expect(page.locator("#wherecard .whereline")).toHaveText(x.here);
  await page.locator("#wclose").click();
  await expect(page.locator("#wpanel")).toHaveCount(0);
  await expect(page.locator("#railwhere")).toBeFocused();
});

test("Where am I: the quiz or a drill opened early from Contents, and focus mode's lesson, never borrow a page not yet reached", async ({ page }) => {
  await page.goto("/#pmp/home");
  const st = await stepsOf(page, 2);
  // two decisions answered, reader jumps to the quiz: the furthest page read is decision 2 (s1); decision 3 (s2) is open but unread
  await seed(page, { c201: ch1Done({}), c202: fresh({ pos: posOf(st, "quiz"), max: 4, picks: { 0: 0, 1: 1 } }), "lastplace.pmp": { t: "full", n: 2 } });
  await open(page, "/#pmp/full/2");
  await page.locator("#wherebtn").click();
  await expect(page.locator("#wpanel")).toHaveAttribute("data-pid", "s1");
  const { x } = await recapFor(page, 2, "s1");
  await expect(page.locator("#wherehere")).toHaveText(x.here);
  await page.keyboard.press("Escape");
  // focus mode: the lesson comes after the ending, so a finished story reads as the ending's recap
  await seed(page, { storymode: true, c202: fresh({ pos: 14, max: 14, picks: Object.fromEntries([...Array(12)].map((_, i) => [i, 0])) }) });
  await open(page, "/#pmp/full/2");
  await expect(page.locator("#page .kicker").first()).toContainText("lesson");
  await page.locator("#wherebtn").click();
  await expect(page.locator("#wpanel")).toHaveAttribute("data-pid", "end");
  await page.keyboard.press("Escape");
  // the opening page: the panel doesn't repeat the card; its button opens the card instead
  await seed(page, { storymode: false, c202: fresh(), "recap.pmp2.2": { open: false, seen: Date.now() } });
  await open(page, "/#pmp/full/2");
  await expect(page.locator("#rctoggle")).toHaveAttribute("aria-expanded", "false");
  await page.locator("#wherebtn").click();
  await expect(page.locator("#wmore")).toHaveCount(0);
  await page.locator("#wcard").click();
  await expect(page.locator("#wpanel")).toHaveCount(0);
  await expect(page.locator("#rctoggle")).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#rctoggle")).toBeFocused();
});

test("orientation notes show once, after the page they name, and Got it dismisses them for good", async ({ page }) => {
  noDialogs(page);
  await page.goto("/#pmp/full/1");
  const note = await page.evaluate(() => window.HALCYON_RECAPS.ch[1].notes.open);
  // not on the page it names
  await expect(page.locator("#page .rnote")).toHaveCount(0);
  await page.locator("#fnext").click();
  const card = page.locator("#page .rnote");
  await expect(card).toHaveCount(1);
  await expect(card.locator(".rnh")).toHaveText(note.title);
  expect(await textOf(card)).toContain(norm(note.text));
  // a redraw on the same page keeps it; Got it removes it
  await card.getByRole("button", { name: /Got it/ }).click();
  await expect(page.locator("#page .rnote")).toHaveCount(0);
  // back to the opening and forward again: not shown again; nor after a reload
  await page.locator('.sdot[data-p="0"]').click();
  await page.locator("#fnext").click();
  await expect(page.locator("#page .rnote")).toHaveCount(0);
  await open(page, "/#pmp/full/1");
  await expect(page.locator("#page .rnote")).toHaveCount(0);
  const seen = await page.evaluate(() => JSON.parse(localStorage.getItem("halcyon.recapnote.pmp2")));
  expect(Object.keys(seen)).toEqual(["1.open"]);
  // a note shown and not dismissed still shows only once: moving on retires it
  const st = await stepsOf(page, 1);
  await seed(page, { c201: fresh({ pos: posOf(st, "scene", 3), max: posOf(st, "scene", 3), picks: { 0: 0, 1: 0, 2: 0 } }) });
  await open(page, "/#pmp/full/1");
  await expect(page.locator("#page .rnote")).toHaveCount(0); // s3 itself
  await page.locator("#page .choice").first().click();
  await page.locator("#next").click();
  await expect(page.locator("#page .rnote .rnh")).toHaveText(await page.evaluate(() => window.HALCYON_RECAPS.ch[1].notes.s3.title));
  const here = await page.locator(".sdot.now").getAttribute("data-p");
  await page.locator(`.sdot[data-p="${posOf(st, "scene", 3)}"]`).click();
  await expect(page.locator("#page .rnote")).toHaveCount(0);
  await page.locator(`.sdot[data-p="${here}"]`).click();
  await expect(page.locator("#page .rnote")).toHaveCount(0);
  // a decision's note waits until it's answered: s0 to s8 answered, the reader jumps to the quiz, and s9's note doesn't show
  const st9 = Object.fromEntries([...Array(9)].map((_, i) => [i, 0]));
  await seed(page, { c201: fresh({ pos: posOf(st, "quiz"), max: posOf(st, "scene", 9), picks: st9 }), "recapnote.pmp2": { "1.open": 1, "1.s3": 1 } });
  await open(page, "/#pmp/full/1");
  await expect(page.locator("#page .kicker").first()).toContainText("quiz");
  await expect(page.locator("#page .rnote")).toHaveCount(0);
  await page.locator("#wherebtn").click();
  await expect(page.locator("#wpanel")).toHaveAttribute("data-pid", "s8");
  await page.keyboard.press("Escape");
  // a chapter with no notes (chapter 4) never shows one
  await seed(page, { c204: fresh({ pos: 5, max: 5, picks: { 0: 0, 1: 0, 2: 0 } }) });
  await open(page, "/#pmp/full/4");
  await expect(page.locator("#page .rnote")).toHaveCount(0);
});

test("test profile: card and note state live in the test namespace only; the real namespace is untouched", async ({ page }) => {
  await page.goto("/#pmp/home");
  await seed(page, { "recap.pmp2.1": { open: false, seen: 1 }, "recapnote.pmp2": { "9.x": 1 } });
  const real = await page.evaluate(() => Object.fromEntries(Object.keys(localStorage).filter(k => k.startsWith("halcyon.recap")).map(k => [k, localStorage.getItem(k)])));
  await page.goto("about:blank");
  await page.goto("/?test=1#pmp/full/1");
  // the real chapter 1 card is remembered closed, but the test profile has never seen it: open
  await expect(page.locator("#rctoggle")).toHaveAttribute("aria-expanded", "true");
  await page.locator("#fnext").click();
  await expect(page.locator("#page .rnote")).toHaveCount(1);
  await page.locator("#page .rnote button").click();
  const keys = await page.evaluate(() => Object.keys(localStorage).filter(k => /recap/.test(k)).sort());
  expect(keys).toEqual(["halcyon-qa-test:recap.pmp2.1", "halcyon-qa-test:recapnote.pmp2", "halcyon.recap.pmp2.1", "halcyon.recapnote.pmp2"]);
  const after = await page.evaluate(() => Object.fromEntries(Object.keys(localStorage).filter(k => k.startsWith("halcyon.recap")).map(k => [k, localStorage.getItem(k)])));
  expect(after).toEqual(real);
});

for (const [w, h] of [[390, 844], [1280, 900]]) for (const scheme of ["light", "dark"]) {
  test(`layout at ${w}px ${scheme}: no sideways scroll, 24px targets, 4.5:1 text, no dashes, rail still scrolls on its own`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto("/#pmp/home");
    const st = await stepsOf(page, 1);
    await seed(page, { c201: fresh({ pos: 1, max: 1 }) });
    await open(page, "/#pmp/full/1");
    await expect(page.locator("#page .rnote")).toHaveCount(1); // the opening's note, on the lesson
    const check = async sel => page.evaluate(sel => {
      const lum = c => { const m = c.match(/[\d.]+/g).map(Number); const [r, g, b] = m.slice(0, 3).map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4) }); return .2126 * r + .7152 * g + .0722 * b };
      const bgOf = el => { for (let e = el; e; e = e.parentElement) { const c = getComputedStyle(e).backgroundColor; const a = c.match(/[\d.]+/g); if (a && (a.length < 4 || +a[3] > .5)) return c } return "rgb(255,255,255)" };
      const out = [];
      document.querySelectorAll(sel).forEach(el => {
        const r = el.getBoundingClientRect(); if (!r.width) return;
        const txt = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
        if (txt) { const a = lum(getComputedStyle(el).color), b = lum(bgOf(el)); const k = (Math.max(a, b) + .05) / (Math.min(a, b) + .05); if (k < 4.5) out.push(`contrast ${k.toFixed(2)} ${el.className || el.tagName}: ${el.textContent.slice(0, 40)}`) }
        if (el.matches("button") && (r.height < 24 || r.width < 24)) out.push(`target ${Math.round(r.width)}x${Math.round(r.height)} ${el.id || el.className}`);
        if (/[–—]/.test(el.textContent)) out.push(`dash in ${el.className}`);
      });
      out.push(...(document.documentElement.scrollWidth > document.documentElement.clientWidth ? ["sideways scroll " + document.documentElement.scrollWidth] : []));
      return out;
    }, sel);
    const SEL = ".rnote, .rnote *, .chtools > button, .wherecard, .wherecard *";
    expect(await check(SEL)).toEqual([]);
    await page.locator('.sdot[data-p="0"]').click();
    await expect(page.locator("#recapcard")).toBeVisible();
    expect(await check(".recap, .recap *")).toEqual([]);
    await page.locator("#rctoggle").click(); // collapse: the one line view
    expect(await check(".recap, .recap *")).toEqual([]);
    await page.locator("#wherebtn").click();
    await page.locator("#wmore").click();
    expect(await check(".wpanel, .wpanel *")).toEqual([]);
    // the panel fits the screen and scrolls inside itself
    const box = await page.locator("#wpanel").boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0); expect(box.x + box.width).toBeLessThanOrEqual(w + 0.5);
    await page.keyboard.press("Escape");
    if (w >= 1000) {
      const rail = await page.locator(".rail").evaluate(e => [getComputedStyle(e).overflowY, getComputedStyle(e).position]);
      expect(rail).toEqual(["auto", "sticky"]);
      await expect(page.locator("#railwhere")).toBeVisible();
    }
    void st;
  });
}

test("back after days away, mid-chapter: a one line prompt opens Where am I, once per visit", async ({ page }) => {
  await page.goto("/#pmp/home");
  const now = await page.evaluate(() => Date.now()), t = now - 5 * DAY;
  const st = await stepsOf(page, 2), pos = posOf(st, "scene", 3);
  await seed(page, { c201: ch1Done({}), c202: fresh({ pos, max: pos, picks: { 0: 0, 1: 0, 2: 0 } }), "lastplace.pmp": { t: "full", n: 2 }, "readat.pmp2.2": t, c99990: { pins: [], last: { pmp: { t: "full", n: 2, at: t } }, at: t } });
  await open(page, "/#pmp/full/2");
  await expect(page.locator("#rback")).toBeVisible();
  await page.locator("#rbackgo").click();
  await expect(page.locator("#wpanel")).toHaveAttribute("data-pid", "s3");
  await page.keyboard.press("Escape");
  await expect(page.locator("#rbackgo")).toBeFocused();
  await page.locator("#page .choice").first().click(); // a redraw on the same page keeps it
  await expect(page.locator("#rback")).toBeVisible();
  await page.locator("#next").click();
  await expect(page.locator("#rback")).toHaveCount(0);
  // a recent reader doesn't get it
  await seed(page, { "readat.pmp2.2": now - DAY, c99990: { pins: [], last: { pmp: { t: "full", n: 2, at: now - DAY } }, at: now - DAY } });
  await open(page, "/#pmp/full/2");
  await expect(page.locator("#page .chmap")).toBeVisible();
  await expect(page.locator("#rback")).toHaveCount(0);
});
