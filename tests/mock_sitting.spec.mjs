// Full sitting (2026-10-25): a course with mockSitting in courses.js offers its section forms back to back, each on its own clock,
// with an optional break, one combined raw score and a score for each section. The LSAT runs LR (form 1), RC (form 2), LR (form 3),
// 35 minutes each, break after section 2. LSAT base is 60000: the sitting is saved at halcyon.c60990, finished sittings at c60991,
// and each section's result also lands in its form's history (c60901, c60911, c60913). Every other book's mock is unchanged.
// Set SHOTS=<dir> to save the 390 px screenshots, light and dark, of the start, a section header, the break and the results.
import { test, expect } from "@playwright/test";

const SHOTS = process.env.SHOTS;
const KEY = "halcyon.c60990";
const accept = page => page.on("dialog", d => d.accept());
const getSit = page => page.evaluate(k => JSON.parse(localStorage.getItem(k)), KEY);
// patch helpers run in the page, so they're passed as source
async function patch(page, fn) { await page.evaluate(([k, src]) => { const st = JSON.parse(localStorage.getItem(k)); (0, eval)("(" + src + ")")(st); localStorage.setItem(k, JSON.stringify(st)) }, [KEY, fn.toString()]) }
const secs = s => { const [h, m, x] = s.split(":").map(Number); return h * 3600 + m * 60 + x };

async function start(page) {
  await page.goto("/#lsat/mock"); await page.reload();
  await page.locator("#sitopen").click();
  await expect(page.locator("#page h1")).toHaveText("Full sitting");
  await page.locator("#sitstart").click();
  await expect(page.locator("#sithead")).toContainText("Section 1 of 3");
}

test("LSAT picker offers a full sitting beside the three sections; starting it opens section 1 on a 35 minute clock", async ({ page }) => {
  await page.goto("/#lsat/mock"); await page.reload();
  await expect(page.locator("#page .mockform")).toHaveCount(4);
  await expect(page.locator("#page .sitcard")).toContainText("All 3 back to back, 35 minutes a pop. You can take 10 minutes off after section 2.");
  for (const f of [1, 2, 3]) await expect(page.locator(`#page [data-form="${f}"]`)).toBeVisible();
  await page.locator("#sitopen").click();
  await expect(page).toHaveURL(/#lsat\/mock\/sitting$/);
  const plan = page.locator("#page .sitplan li");
  await expect(plan).toHaveCount(3);
  await expect(plan.nth(0)).toHaveText("Logical Reasoning 1: 25 questions, 35 minutes.");
  await expect(plan.nth(1)).toHaveText("Reading Comprehension: 27 questions, 35 minutes. Then 10 minutes off, if you want it.");
  await expect(plan.nth(2)).toHaveText("Logical Reasoning 2: 25 questions, 35 minutes.");
  await expect(page.locator("#page")).not.toContainText(/[–—]/);
  await page.locator("#sitstart").click();
  await expect(page.locator("#page > .kicker")).toHaveText("Practice exam · Full sitting · Section 1 of 3 · Question 1 of 25");
  await expect(page.locator("#sithead")).toContainText("Logical Reasoning 1");
  await expect(page.locator("#sittime")).toHaveText(/^0:3[45]:\d\d$/);
  await expect.poll(async () => secs(await page.locator("#sittime").textContent())).toBeLessThan(35 * 60);
  const st = await getSit(page);
  expect(st.sitting).toBe(true);
  expect(st.secs.map(s => [s.f, s.order.length])).toEqual([[1, 25], [2, 27], [3, 25]]);
  expect(st.secs[1].order.every(id => id.startsWith("M2:"))).toBe(true);
  // the single sections still open on their own, in exam mode at 35 minutes
  await page.goto("/#lsat/mock/2"); await page.reload();
  await expect(page.locator("#page")).toContainText("35 minutes, the timer runs");
  await expect(page.locator("#exam")).toBeVisible();
});

test("the section clock ends section 1 and moves on, and there's no way back to it", async ({ page }) => {
  await start(page);
  await page.locator("input[name=mq]").first().check();
  await patch(page, st => { st.secs[0].t0 = Date.now() - (35 * 60 - 2) * 1000 });
  await page.reload();
  await expect(page.locator("#sithead")).toContainText("Section 2 of 3", { timeout: 8000 });
  await expect(page.locator("#sithead")).toContainText("Reading Comprehension");
  await expect(page.locator("#sitnote")).toHaveText("Time's up for section 1. You're in section 2 now.");
  await expect(page.locator("#page > .kicker")).toContainText("Question 1 of 27");
  await expect(page.locator("#prev")).toBeDisabled();
  await expect(page.locator("#sittime")).toHaveText(/^0:3[45]:\d\d$/);
  // the grid reaches only section 2
  await expect(page.locator("#page .navgrid [data-q]")).toHaveCount(27);
  const st = await getSit(page);
  expect(st.sec).toBe(1);
  expect(st.secs[0].ended).toBe(true);
  expect(Object.keys(st.ans).length).toBe(1); // the section 1 answer is kept for scoring
  const sec2 = new Set(st.secs[1].order);
  const grid = await page.locator("#page .navgrid [data-q]").evaluateAll(bs => bs.map(b => +b.dataset.q));
  expect(grid.every(k => k >= 0 && k < sec2.size)).toBe(true);
  // a reload doesn't reopen section 1
  await page.reload();
  await expect(page.locator("#sithead")).toContainText("Section 2 of 3");
  await expect(page.locator("#sitnote")).toHaveCount(0);
});

test("the break comes after section 2, can be skipped, and ends itself when its 10 minutes run out", async ({ page }) => {
  accept(page);
  await start(page);
  await page.locator("#sitend").click();
  await expect(page.locator("#sithead")).toContainText("Section 2 of 3");
  await page.locator("#sitend").click();
  await expect(page.locator("#page h1")).toHaveText("Break");
  await expect(page.locator("#page .story")).toContainText("Section 2 is done. Stretch, grab some water, you've got 10 minutes.");
  await expect(page.locator("#breaktime")).toHaveText(/^0:(10:00|09:\d\d)$/);
  await expect(page.locator("#sitskip")).toHaveText("I'm ready, start section 3");
  // the break survives a reload
  await page.reload();
  await expect(page.locator("#page h1")).toHaveText("Break");
  await page.locator("#sitskip").click();
  await expect(page.locator("#sithead")).toContainText("Section 3 of 3");
  await expect(page.locator("#sithead")).toContainText("Logical Reasoning 2");
  expect((await getSit(page)).breakDone).toBe(true);
  // a break whose time runs out starts section 3 on its own
  await patch(page, st => { st.sec = 2; st.onBreak = true; st.breakDone = false; st.breakAt = Date.now() - (10 * 60 - 2) * 1000 });
  await page.reload();
  await expect(page.locator("#page h1")).toHaveText("Break");
  await expect(page.locator("#sithead")).toContainText("Section 3 of 3", { timeout: 8000 });
});

test("a reload mid section keeps the section, the question and the time left", async ({ page }) => {
  accept(page);
  await start(page);
  await page.locator("#sitend").click();
  await expect(page.locator("#sithead")).toContainText("Section 2 of 3");
  await page.locator("input[name=mq]").first().check();
  await page.locator("#nextq").click();
  await page.locator("#nextq").click();
  await expect(page.locator("#page > .kicker")).toContainText("Section 2 of 3 · Question 3 of 27");
  await patch(page, st => { st.secs[1].t0 = Date.now() - 600 * 1000 });
  await page.reload();
  await expect(page).toHaveURL(/#lsat\/mock\/sitting$/);
  await expect(page.locator("#page > .kicker")).toHaveText("Practice exam · Full sitting · Section 2 of 3 · Question 3 of 27");
  const left = secs(await page.locator("#sittime").textContent());
  expect(left).toBeLessThanOrEqual(25 * 60);
  expect(left).toBeGreaterThan(25 * 60 - 10);
  await expect.poll(async () => secs(await page.locator("#sittime").textContent())).toBeLessThan(left);
  await expect(page.locator("#mocktime")).toBeAttached(); // the rail card runs the same clock
  // the first answer is still chosen
  await page.locator("#page .navgrid summary").click();
  await expect(page.locator('#page .navgrid [data-q="0"]')).toHaveClass(/done/);
  // the Continue link from another screen goes back to the same place
  await page.goto("/#lsat/progress"); await page.reload();
  await expect(page.locator("#contlink")).toHaveText("Continue: Practice exam · Full sitting");
  await page.locator("#contlink").click();
  await expect(page.locator("#page > .kicker")).toHaveText("Practice exam · Full sitting · Section 2 of 3 · Question 3 of 27");
});

test("results: one combined raw score, a score for each section, and each section in its form's history", async ({ page }) => {
  accept(page);
  await start(page);
  // every section 1 item right, every section 3 item wrong, section 2 left blank
  await page.evaluate(k => { const st = JSON.parse(localStorage.getItem(k)), d = window.HALCYON_DATA.lsat.mock, key = {};
    d.forEach(p => p.questions.forEach((q, i) => key[p.part.slice(0, 3) + i] = [q.a, q.opts.length]));
    st.secs[0].order.forEach(id => st.ans[id] = key[id][0]); st.secs[2].order.forEach(id => st.ans[id] = (key[id][0] + 1) % key[id][1]);
    localStorage.setItem(k, JSON.stringify(st)) }, KEY);
  await page.reload();
  await page.locator("#sitend").click();
  await page.locator("#sitend").click();
  await page.locator("#sitskip").click();
  await page.locator("#sitend").click();
  await expect(page.locator("#page h1")).toHaveText("25 of 77 (32 percent)");
  await expect(page.locator("#page .story").first()).toContainText("That's your raw score across all 3 sections.");
  const cards = page.locator("#page .sitsecs .card");
  await expect(cards).toHaveCount(3);
  await expect(cards.nth(0)).toContainText("Section 1: Logical Reasoning 1");
  await expect(cards.nth(0)).toContainText("25 of 25");
  await expect(cards.nth(1)).toContainText("Section 2: Reading Comprehension");
  await expect(cards.nth(1)).toContainText("0 of 27");
  await expect(cards.nth(2)).toContainText("0 of 25");
  await expect(page.locator("#page details.sitreview")).toHaveCount(3);
  await expect(page.locator("#page")).not.toContainText(/[–—]/);
  const H = await page.evaluate(() => Object.fromEntries([60901, 60911, 60913, 60991].map(k => [k, JSON.parse(localStorage.getItem("halcyon.c" + k))])));
  expect(H[60901].list.slice(-1)[0]).toMatchObject({ f: 1, right: 25, total: 25, sit: true });
  expect(H[60911].list.slice(-1)[0]).toMatchObject({ f: 2, right: 0, answered: 0, total: 27, sit: true });
  expect(H[60913].list.slice(-1)[0]).toMatchObject({ f: 3, right: 0, answered: 25, total: 25, sit: true });
  expect(H[60991].list.slice(-1)[0]).toMatchObject({ right: 25, total: 77 });
  // the Progress table marks the three rows as one sitting, not three exams
  await page.goto("/#lsat/progress"); await page.reload();
  for (const n of [1, 2, 3]) await expect(page.locator("table tr", { hasText: `Full sitting, section ${n}` })).toHaveCount(1);
  await page.goto("/#lsat/mock/sitting"); await page.reload();
  // the picker card shows the last sitting, and a reload keeps the results
  await page.reload();
  await expect(page.locator("#page h1")).toHaveText("25 of 77 (32 percent)");
  await page.locator("#allforms2").click();
  await expect(page.locator("#page .sitcard")).toContainText("Last sitting: 25 of 77 (32%)");
  await page.locator("#sitopen").click();
  await page.locator("#sitagain").click();
  await expect(page.locator("#sitstart")).toBeVisible();
});

test("other books' mocks are unchanged: no sitting card, and a sitting address falls back to the picker or the one form", async ({ page }) => {
  await page.goto("/#cphims/mock"); await page.reload();
  await expect(page.locator("#page .mockform")).toHaveCount(2);
  await expect(page.locator("#page .sitcard, #sitopen")).toHaveCount(0);
  await expect(page.locator("#page")).not.toContainText("Full sitting");
  await page.goto("/#cphims/mock/sitting"); await page.reload();
  await expect(page.locator("#page .story").first()).toContainText("Two full practice exams.");
  await page.goto("/#pmp/mock/sitting"); await page.reload(); // PMP has two forms since 2026-10-26, so this is the picker too
  await expect(page.locator("#page h1")).toHaveText("PMP practice exam");
  await expect(page.locator("#page .mockform")).toHaveCount(2);
  await expect(page.locator("#page .story").first()).toContainText("Two full practice exams.");
  await expect(page.locator("#page")).not.toContainText("Full sitting");
  const sitKeys = await page.evaluate(() => Object.keys(localStorage).filter(k => { const n = +(/^halcyon\.c(\d+)$/.exec(k) || [])[1]; return n < 99000 && [990, 991].includes(n % 10000) }));
  expect(sitKeys).toEqual([]);
});

test("screenshots of the sitting at 390 px, light and dark", async ({ page }) => {
  test.skip(!SHOTS, "set SHOTS=<dir> to save them");
  accept(page);
  for (const scheme of ["light", "dark"]) {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto("/#lsat/home"); await page.evaluate(() => localStorage.removeItem("halcyon.c60990"));
    await page.goto("/#lsat/mock/sitting"); await page.reload();
    await expect(page.locator("#sitstart")).toBeVisible();
    await page.screenshot({ path: `${SHOTS}/sitting-start-${scheme}-390.png`, fullPage: true });
    await page.locator("#sitstart").click();
    await expect(page.locator("#sithead")).toBeVisible();
    await page.screenshot({ path: `${SHOTS}/sitting-section-${scheme}-390.png` });
    await page.locator("#sitend").click(); await page.locator("#sitend").click();
    await expect(page.locator("#breaktime")).toBeVisible();
    await page.screenshot({ path: `${SHOTS}/sitting-break-${scheme}-390.png`, fullPage: true });
    // a believable finished sitting for the results shot: most of section 1 right, some of the others, real time on each clock
    await page.evaluate(k => { const st = JSON.parse(localStorage.getItem(k)), key = {};
      window.HALCYON_DATA.lsat.mock.forEach(p => p.questions.forEach((q, i) => key[p.part.slice(0, 3) + i] = [q.a, q.opts.length]));
      st.secs.forEach((s, j) => { s.elapsed = [1994, 2088, 1871][j]; s.ended = true; s.order.forEach((id, n) => st.ans[id] = n % [5, 3, 4][j] ? key[id][0] : (key[id][0] + 1) % key[id][1]) });
      Object.assign(st, { sec: 2, onBreak: false, breakDone: true, submitted: true, upd: Date.now() });
      localStorage.setItem(k, JSON.stringify(st)) }, "halcyon.c60990");
    await page.reload();
    await expect(page.locator("#page .sitsecs")).toBeVisible();
    await page.screenshot({ path: `${SHOTS}/sitting-results-${scheme}-390.png`, fullPage: true });
  }
});

test("two tabs: a stale tab never overwrites a newer saved sitting, and a storage event reloads it", async ({ browser }) => {
  const ctx = await browser.newContext(); const a = await ctx.newPage(), b = await ctx.newPage();
  await start(a);
  await b.goto("/#lsat/mock/sitting"); await b.reload();
  await expect(b.locator("#sithead")).toContainText("Section 1 of 3");
  // tab A answers question 1: tab B hears it and shows it
  await a.locator("input[name=mq]").first().check();
  await expect(b.locator("input[name=mq]:checked")).toHaveCount(1);
  // tab B (now current) answers question 2: both answers are saved
  await b.locator("#nextq").click();
  await b.locator("input[name=mq]").first().check();
  await a.waitForTimeout(1500); // a few ticks in both tabs
  let st = await getSit(a);
  expect(Object.keys(st.ans).length).toBe(2);
  expect(st.cur).toBe(1);
  // a copy written elsewhere that this tab never heard about: its next move takes that copy instead of writing over it
  // a newer copy lands in storage that tab A never hears about (no storage event fires in the tab that wrote it)
  const extra = await a.evaluate(k => { const st = JSON.parse(localStorage.getItem(k)), id = st.secs[2].order[0]; st.ans[id] = 0; st.upd = Date.now() + 60000; localStorage.setItem(k, JSON.stringify(st)); return id }, KEY);
  // tab A's next write would have dropped that answer: it takes the newer copy instead
  await a.locator("#flagq").check();
  await a.waitForTimeout(1500);
  st = await getSit(a);
  expect(st.ans[extra]).toBe(0);
  expect(Object.keys(st.ans).length).toBe(3);
  await ctx.close();
});

test("the sitting clock runs on time stamps: hidden or away, a section still ends, and a long absence plays out like the real test", async ({ page }) => {
  // every page in this test reports itself hidden
  await page.addInitScript(() => Object.defineProperty(document, "hidden", { configurable: true, get: () => true }));
  await start(page);
  // a hidden tab: the clock keeps going and ends section 1
  await patch(page, st => { st.secs[0].t0 = Date.now() - (35 * 60 - 2) * 1000 });
  await page.reload();
  await expect(page.locator("#sithead")).toContainText("Section 1 of 3");
  await expect(page.locator("#sithead")).toContainText("Section 2 of 3", { timeout: 8000 });
  // closed for a while: section 2 ran out 30 seconds ago, so the break is 30 seconds in
  await patch(page, st => { st.secs[1].t0 = Date.now() - (35 * 60 + 30) * 1000 });
  await page.reload();
  await expect(page.locator("#page h1")).toHaveText("Break");
  await expect(page.locator("#page .story")).toContainText("Time's up for section 2.");
  expect(secs(await page.locator("#breaktime").textContent())).toBeLessThanOrEqual(10 * 60 - 30);
  // away for longer than the break: section 3 started when the break ran out
  await patch(page, st => { st.breakAt = Date.now() - (10 * 60 + 60) * 1000 });
  await page.reload();
  await expect(page.locator("#sithead")).toContainText("Section 3 of 3");
  const left = secs(await page.locator("#sittime").textContent());
  expect(left).toBeLessThanOrEqual(34 * 60); expect(left).toBeGreaterThan(34 * 60 - 10);
  let st = await getSit(page);
  expect(st.breakUsed).toBe(600); expect(st.secs[1].elapsed).toBe(35 * 60);
  // and past the end of section 3: the results
  await patch(page, st => { st.secs[2].t0 = Date.now() - 40 * 60 * 1000 });
  await page.reload();
  await expect(page.locator("#page .sitsecs")).toBeVisible();
  st = await getSit(page);
  expect(st.submitted).toBe(true);
  // the single-form mock still pauses while hidden, as before
  await page.goto("/#lsat/mock/1"); await page.reload();
  await page.locator("#exam").click();
  await expect(page.locator("#mocktime")).toBeVisible();
  const t0 = await page.locator("#mocktime").textContent();
  await page.waitForTimeout(2500);
  await expect(page.locator("#mocktime")).toHaveText(t0);
});
