// The unscored section (LSAT, 2026-11-08): through June 2027 the real LSAT runs four 35 minute sections and one of them doesn't count,
// and you aren't told which. A mockSitting with unscored:[form numbers] runs every section in order (break after section 2), hides the
// form names while it runs, leaves that section out of the score, then names it on the results and shows its result apart.
// Sitting 1 is LR 1 (form 1), LR 7 (form 10, unscored), RC (form 2), LR 2 (form 3). Saved at halcyon.c60990; form 10's history at c60927.
// Set SHOTS=<dir> to save the results page at 390 and 1280 px, light and dark.
import { test, expect } from "@playwright/test";

const SHOTS = process.env.SHOTS;
const KEY = "halcyon.c60990";
const accept = page => page.on("dialog", d => d.accept());

// answers: per section index, "right", "wrong", a count of leading items right, or nothing (blank)
async function answer(page, plan) {
  await page.evaluate(([k, plan]) => { const st = JSON.parse(localStorage.getItem(k)), key = {};
    window.HALCYON_DATA.lsat.mock.forEach(p => p.questions.forEach((q, i) => key[p.part.slice(0, 3) + i] = [q.a, q.opts.length]));
    st.secs.forEach((s, j) => { const how = plan[j]; if (how == null) return;
      s.order.forEach((id, n) => { if (how === "right" || (typeof how === "number" && n < how)) st.ans[id] = key[id][0]; else if (how === "wrong") st.ans[id] = (key[id][0] + 1) % key[id][1] }) });
    localStorage.setItem(k, JSON.stringify(st)) }, [KEY, plan]);
}
async function startSitting(page) {
  await page.goto("/#lsat/mock/sitting"); await page.reload();
  await page.locator("#sitstart").click();
  await expect(page.locator("#sithead")).toContainText("Section 1 of 4");
}
async function finish(page) { // end all four sections, skipping the break
  await page.reload();
  for (const n of [1, 2]) { await expect(page.locator("#sithead")).toContainText(`Section ${n} of 4`); await page.locator("#sitend").click() }
  await page.locator("#sitskip").click();
  for (const n of [3, 4]) { await expect(page.locator("#sithead")).toContainText(`Section ${n} of 4`); await page.locator("#sitend").click() }
  await expect(page.locator("#page .sitsecs")).toBeVisible();
}

test("the four section sitting runs every section in order without naming the forms, with the break after section 2", async ({ page }) => {
  accept(page);
  await startSitting(page);
  const seen = [];
  for (const n of [1, 2, 3, 4]) {
    if (n === 3) { await expect(page.locator("#page h1")).toHaveText("Break"); await expect(page.locator("#sitskip")).toHaveText("I'm ready, start section 3"); await page.locator("#sitskip").click() }
    const head = page.locator("#sithead");
    await expect(head).toContainText(`Section ${n} of 4`);
    const name = (await head.locator("b").textContent()).trim();
    expect(name).not.toMatch(/\d/); // the type only: a form number would give the unscored section away
    seen.push(name);
    await expect(page.locator("#page > .kicker")).not.toContainText(/Logical Reasoning \d|Reading Comprehension \d/);
    await page.locator("#sitend").click();
  }
  expect(seen).toEqual(["Logical Reasoning", "Logical Reasoning", "Reading Comprehension", "Logical Reasoning"]);
  await expect(page.locator("#page .sitsecs")).toBeVisible();
  const st = await page.evaluate(k => JSON.parse(localStorage.getItem(k)), KEY);
  expect(st.secs.map(s => s.f)).toEqual([1, 10, 2, 3]);
  expect(st.submitted).toBe(true);
});

test("the score leaves out the unscored section, and the results reveal it with its own result", async ({ page }) => {
  accept(page);
  await startSitting(page);
  // the unscored section all right, the first 10 of section 1 right, sections 3 and 4 blank: 10 of 77, not 35 of 102
  await answer(page, [10, "right", null, null]);
  await finish(page);
  await expect(page.locator("#page h1")).toHaveText("10 of 77 (13 percent)");
  const story = page.locator("#page .story").first();
  await expect(story).toContainText("That's your raw score across the 3 scored sections.");
  await expect(story).toContainText("Section 2, Logical Reasoning 7, was the unscored one, so it isn't in this score.");
  // the scored sections' cards: sections 1, 3 and 4
  const cards = page.locator("#page .sitsecs .card");
  await expect(cards).toHaveCount(3);
  expect(await cards.evaluateAll(cs => cs.map(c => c.dataset.sec))).toEqual(["1", "3", "4"]);
  await expect(page.locator("#page .sitsecs")).not.toContainText("Logical Reasoning 7");
  // the reveal: its own heading and card, after the scored ones
  await expect(page.locator("#situnsh")).toHaveText("The unscored section");
  const un = page.locator("#page .situnsecs .card");
  await expect(un).toHaveCount(1);
  await expect(un).toContainText("Section 2: Logical Reasoning 7");
  await expect(un).toContainText("Not in your score");
  await expect(un).toContainText("25 of 25");
  await expect(un).toContainText("100%");
  // its review is there, marked
  await expect(page.locator("#page details.sitreview")).toHaveCount(4);
  await expect(page.locator("#page details.situnsrev summary")).toHaveText("Section 2, Logical Reasoning 7 (unscored): every question with explanations");
  await expect(page.locator("#page")).not.toContainText(/[–—]/);
  const sh = await page.evaluate(() => ({ s: JSON.parse(localStorage.getItem("halcyon.c60991")).list.slice(-1)[0], f10: JSON.parse(localStorage.getItem("halcyon.c60927")).list.slice(-1)[0] }));
  expect(sh.s).toMatchObject({ right: 10, total: 77 });
  expect(sh.s.sections.map(x => !!x.unscored)).toEqual([false, true, false, false]);
  expect(sh.f10).toMatchObject({ f: 10, right: 25, total: 25, unscored: true, sit: true, sec: 2 });
  // mastery and the finish line leave it out: the best practice score is section 1's 40 percent, not the unscored 100
  await page.goto("/#lsat/progress"); await page.reload();
  await expect(page.locator("ol.finish")).toContainText("best score 40%");
  await expect(page.locator("table tr", { hasText: "Full sitting, section 2 (unscored)" })).toHaveCount(1);
  // the same form on its own is scored as usual
  await page.goto("/#lsat/mock/10"); await page.reload();
  await expect(page.locator("#page h1")).toContainText("Logical Reasoning 7");
});

test("a three section sitting saved before the change keeps running as three, all scored", async ({ page }) => {
  accept(page);
  await page.goto("/#lsat/home"); await page.reload();
  // an in progress save in the old shape: forms 1, 2, 3 and no uns
  await page.evaluate(k => { const now = Date.now(), qs = f => window.HALCYON_DATA.lsat.mock.filter(p => new RegExp("^M" + f + ":").test(p.part)).flatMap(p => p.questions.map((q, i) => p.part.slice(0, 3) + i));
    localStorage.setItem(k, JSON.stringify({ sitting: true, mode: "exam", form: 0, secs: [1, 2, 3].map((f, j) => ({ f, order: qs(f), t0: j ? null : now, elapsed: 0, ended: false })), sec: 0, cur: 0, ans: {}, flagged: {}, onBreak: false, breakAt: null, breakUsed: 0, breakDone: false, submitted: false, startedAt: new Date(now).toISOString(), upd: now })) }, KEY);
  await page.goto("/#lsat/mock/sitting"); await page.reload();
  await expect(page.locator("#sithead")).toContainText("Section 1 of 3");
  await expect(page.locator("#sithead b")).toHaveText("Logical Reasoning 1"); // no unscored section in this run, so nothing to hide
  await page.locator("#sitend").click(); await page.locator("#sitend").click();
  await page.locator("#sitskip").click();
  await expect(page.locator("#sithead")).toContainText("Section 3 of 3");
  await page.locator("#sitend").click();
  await expect(page.locator("#page .sitsecs .card")).toHaveCount(3);
  await expect(page.locator("#situnsh")).toHaveCount(0);
  await expect(page.locator("#page .story").first()).toContainText("That's your raw score across all 3 sections.");
  // a new sitting after it has four
  await page.locator("#sitagain").click();
  await page.locator("#sitstart").click();
  await expect(page.locator("#sithead")).toContainText("Section 1 of 4");
});

test("sittings 2 and 3 put the unscored section somewhere else", async ({ page }) => {
  await page.goto("/#lsat/mock"); await page.reload();
  for (const [n, f, at] of [[2, 11, 3], [3, 12, 2]]) {
    await page.goto(`/#lsat/mock/sitting${n}`); await page.reload();
    await page.locator("#sitstart").click();
    const st = await page.evaluate(k => JSON.parse(localStorage.getItem(k)), `halcyon.c${60990 + 2 * (n - 1)}`);
    expect(st.uns).toEqual([f]);
    expect(st.secs.findIndex(s => s.f === f)).toBe(at);
  }
});

test("screenshots of the four section results at 390 and 1280 px, light and dark", async ({ page }) => {
  test.skip(!SHOTS, "set SHOTS=<dir> to save them");
  accept(page);
  for (const scheme of ["light", "dark"]) for (const w of [390, 1280]) {
    await page.setViewportSize({ width: w, height: w > 400 ? 900 : 844 });
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto("/#lsat/home"); await page.evaluate(k => localStorage.removeItem(k), KEY);
    await startSitting(page);
    await page.evaluate(k => { const st = JSON.parse(localStorage.getItem(k)), key = {};
      window.HALCYON_DATA.lsat.mock.forEach(p => p.questions.forEach((q, i) => key[p.part.slice(0, 3) + i] = [q.a, q.opts.length]));
      st.secs.forEach((s, j) => { s.elapsed = [1994, 2031, 2088, 1871][j]; s.ended = true; s.order.forEach((id, n) => st.ans[id] = n % [5, 2, 3, 4][j] ? key[id][0] : (key[id][0] + 1) % key[id][1]) });
      Object.assign(st, { sec: 3, onBreak: false, breakDone: true, submitted: true, upd: Date.now() });
      localStorage.setItem(k, JSON.stringify(st)) }, KEY);
    await page.reload();
    await expect(page.locator("#situnsh")).toBeVisible();
    await page.screenshot({ path: `${SHOTS}/sitting-results-${scheme}-${w}.png`, fullPage: false });
    await page.locator("#situnsh").scrollIntoViewIfNeeded();
    await page.screenshot({ path: `${SHOTS}/sitting-reveal-${scheme}-${w}.png` });
  }
});
