// PMP practice exam case studies and figures (2026-10-25): a case's five items stay together, in order, under their shared scenario
// wherever the shuffle puts the block; a break never falls inside a case; an attempt saved before cases existed still loads; the review
// shows each case once above its run; and every figure draws at 390 px with no sideways scroll, light and dark, with its values for a
// screen reader. Attempts are seeded at halcyon.c900 (PMP base 0, form 1), the way the engine stores them offline.
import { test, expect } from "@playwright/test";

const accept = page => page.on("dialog", d => d.accept());
// one PMP form's items (form 1 by default; form 2 ships in mock/form2_*.js since 2026-10-26)
async function bank(page, form = 1) {
  await page.goto("/#pmp/home");
  await page.waitForFunction(() => window.HALCYON_MOCK && window.HALCYON_MOCK.length === 6);
  return page.evaluate(f => { const o = []; window.HALCYON_MOCK.forEach(p => { if ((p.form != null ? +p.form : 1) !== f) return;
    p.questions.forEach((q, i) => o.push({ id: p.part.slice(0, 3) + i, a: q.a, c: q.case || null, cq: q.cq || 0, fig: q.fig || null })) }); return o }, form);
}
async function seed(page, order, extra = {}) {
  const st = { mode: "exam", form: 1, order, ans: {}, flagged: {}, cur: 0, elapsed: 0, breaksTaken: [], onBreak: null, submitted: false, startedAt: "2026-10-25T10:00:00.000Z", ...extra };
  await page.evaluate(st => localStorage.setItem("halcyon.c900", JSON.stringify(st)), st);
  await page.goto("/#pmp/mock/1"); await page.reload(); // two forms, so /mock alone is the picker
}
const noSideScroll = async page => expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
// starts a fresh attempt in a mode with the clock pinned, so the engine's shuffle seed (Date.now() % 100000) is the given number
async function start(page, course, seedN, mode = "exam") {
  await page.evaluate(k => localStorage.removeItem("halcyon.c" + k), course === "pmp" ? 900 : 10900);
  await page.goto(course === "pmp" ? "/#pmp/mock/1" : "/#cphims/mock/1"); await page.reload();
  await page.evaluate(n => { window.__realNow = Date.now; Date.now = () => n }, seedN);
  await page.locator("#" + mode).click();
  await page.evaluate(() => { Date.now = window.__realNow });
  return page.evaluate(k => JSON.parse(localStorage.getItem("halcyon.c" + k)).order, course === "pmp" ? 900 : 10900);
}
const caseIds = (qs, c) => qs.filter(q => q.c === c).sort((a, b) => a.cq - b.cq).map(q => q.id);

test("the bank has two five item cases and six figures, and 180 items still", async ({ page }) => {
  const qs = await bank(page);
  expect(qs.length).toBe(180);
  expect(caseIds(qs, "m1c1").length).toBe(5);
  expect(caseIds(qs, "m1c2").length).toBe(5);
  expect(qs.filter(q => q.fig).length).toBe(6);
});

test("every shuffle keeps each case's items together and in order", async ({ page }) => {
  const qs = await bank(page);
  const orders = [];
  for (let k = 1; k <= 12; k++) orders.push(await start(page, "pmp", k * 7919 + 13, k % 3 ? "exam" : "practice"));
  const starts = new Set();
  for (const ord of orders) {
    expect(ord.length).toBe(180);
    expect(new Set(ord).size).toBe(180);
    for (const c of ["m1c1", "m1c2"]) { const ids = caseIds(qs, c), at = ord.indexOf(ids[0]); expect(ord.slice(at, at + 5)).toEqual(ids); starts.add(c + at) }
  }
  expect(starts.size).toBeGreaterThan(8); // the blocks land in different places, not pinned to one spot
});

test("in the exam each case item shows its scenario, numbered, and the next item is the same case", async ({ page }) => {
  const qs = await bank(page);
  const order = await start(page, "pmp", 31337);
  const first = order.findIndex(id => (qs.find(q => q.id === id) || {}).c === "m1c1");
  await page.locator("#page details.navgrid summary").click();
  await page.locator(`#page [data-q="${first}"]`).click();
  for (let k = 1; k <= 5; k++) {
    const box = page.locator("#page details.qmcase");
    await expect(box).toHaveCount(1);
    await expect(box.locator("summary")).toContainText(`Case study, question ${k} of 5`);
    await expect(box).toContainText("Case: the clinic scheduling rollout");
    await expect(box).toContainText("A regional health network is replacing the scheduling system");
    await expect(page.locator("#page legend")).toContainText("In the clinic case");
    if (k < 5) await page.locator("#nextq").click();
  }
  // folding the scenario on a phone stays folded on the next item
  await page.locator("#prev").click();
  await page.locator("#page details.qmcase summary").click();
  await expect(page.locator("#page details.qmcase")).not.toHaveAttribute("open", "");
  await page.locator("#nextq").click();
  await expect(page.locator("#page details.qmcase")).not.toHaveAttribute("open", "");
  await noSideScroll(page);
});

test("a break never splits a case: it waits for the case's last item", async ({ page }) => {
  const qs = await bank(page);
  const c1 = caseIds(qs, "m1c1"), rest = qs.filter(q => !q.c).map(q => q.id), c2 = caseIds(qs, "m1c2");
  const order = [...rest.slice(0, 57), ...c1, ...rest.slice(57), ...c2]; // case 1 is questions 58 to 62, across the break after 60
  await seed(page, order, { cur: 59 });
  await expect(page.locator("#page .kicker").first()).toContainText("Question 60 of 180");
  await page.locator("#nextq").click();
  await expect(page.locator("#page .kicker").first()).toContainText("Question 61 of 180"); // no break inside the case
  await page.locator("#nextq").click();
  await expect(page.locator("#page .kicker").first()).toContainText("Question 62 of 180");
  await page.locator("#nextq").click();
  await expect(page.locator("#page h1")).toHaveText("Break");
  await expect(page.locator("#page .story")).toContainText("You've finished question 62");
  await page.locator("#resume").click();
  await expect(page.locator("#page .kicker").first()).toContainText("Question 63 of 180");
});

test("an attempt saved before cases existed still loads, with its answers, and case items show their scenario", async ({ page }) => {
  accept(page);
  const qs = await bank(page);
  const order = qs.map(q => q.id); // file order, the cases scattered, as an old attempt was stored
  const ans = Object.fromEntries(qs.slice(0, 30).map(q => [q.id, q.a]));
  await seed(page, order, { cur: 26, ans, elapsed: 1200 });
  await expect(page.locator("#page .kicker").first()).toContainText("Question 27 of 180"); // Peo26, a clinic case item
  await expect(page.locator("#page details.qmcase")).toContainText("Case: the clinic scheduling rollout");
  await expect(page.locator("#mockcard")).toContainText("30 of 180 answered");
  await page.locator("#submitnow").click();
  await expect(page.locator("#page h1")).toHaveText("30 of 180 (17 percent)");
});

test("the results review shows each case once above its run, and every figure", async ({ page }) => {
  const qs = await bank(page);
  const order = [...caseIds(qs, "m1c1"), ...qs.filter(q => !q.c).map(q => q.id), ...caseIds(qs, "m1c2")];
  await seed(page, order, { submitted: true, finishedAt: "2026-10-25T12:00:00.000Z", ans: Object.fromEntries(qs.map(q => [q.id, q.a])) });
  await expect(page.locator("#page h1")).toHaveText("180 of 180 (100 percent)");
  await page.locator("#page details:not(.navgrid) > summary", { hasText: "Show every question" }).click();
  await expect(page.locator("#page .qcase")).toHaveCount(2);
  await expect(page.locator("#page .qfig")).toHaveCount(6);
  await expect(page.locator("#page .qfig svg")).toHaveCount(4); // cfd, control, network, evm; the burndown is bars and the grid a table
  await noSideScroll(page);
});

for (const scheme of ["light", "dark"]) {
  test(`every figure draws at 390 px with no sideways scroll and a screen reader label, ${scheme}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ colorScheme: scheme });
    const qs = await bank(page);
    const figs = qs.filter(q => q.fig);
    await seed(page, [...figs.map(q => q.id), ...qs.filter(q => !q.fig).map(q => q.id)]);
    for (let k = 0; k < figs.length; k++) {
      const fig = page.locator("#page .qfig");
      await expect(fig).toHaveCount(1);
      await expect(fig).toBeVisible();
      const box = await fig.boundingBox();
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(390);
      await noSideScroll(page);
      const svg = fig.locator("svg");
      if (await svg.count()) {
        const label = await svg.getAttribute("aria-label");
        expect(await svg.getAttribute("role")).toBe("img");
        expect(label.length).toBeGreaterThan(40);
        const h = await svg.evaluate(e => e.getBoundingClientRect().height);
        expect(h).toBeGreaterThan(100);
      } else expect((await fig.innerText()).length).toBeGreaterThan(20); // bars and tables are text a screen reader reads as is
      if (k < figs.length - 1) await page.locator("#nextq").click();
    }
  });
}

test("figure labels carry the values: cfd bands, control limits and samples, network links", async ({ page }) => {
  const qs = await bank(page);
  const byId = Object.fromEntries(qs.map(q => [q.id, q]));
  const label = async id => { await seed(page, [id, ...qs.filter(q => q.id !== id).map(q => q.id)]); return page.locator("#page .qfig svg").getAttribute("aria-label") };
  const cfd = await label("Pro64");
  expect(cfd).toContain("bottom to top: Done, Testing, Doing, Backlog");
  expect(cfd).toContain("W8: Done 13, Testing 18, Doing 3, Backlog 8, total 42");
  await expect(page.locator("#page .qfig .legend")).toContainText("Backlog");
  const ctl = await label("Pro47");
  expect(ctl).toContain("upper control limit 56");
  expect(ctl).toContain("49, 51, 50, 48, 52, 50, 49, 51, 53, 50, 48, 51, 58,");
  const net = await label("Pro53");
  expect(net).toContain("A 3, B 5, C 4, D 2, E 6, F 3");
  expect(net).toContain("A to B, A to C, B to D, C to E, D to F, E to F");
  await expect(page.locator("#page .qfig svg rect")).toHaveCount(6);
  expect(byId.Pro53.fig).toContain('edges="A>B');
});

test("another book's mock is unchanged: CPHIMS has no cases or figures and keeps its plain shuffle", async ({ page }) => {
  await page.goto("/#cphims/home");
  await page.waitForFunction(() => window.HALCYON_DATA && window.HALCYON_DATA.cphims && window.HALCYON_DATA.cphims.mock.length);
  const order = await start(page, "cphims", 4242);
  await expect(page.locator("#page details.qmcase")).toHaveCount(0);
  await expect(page.locator("#page .qfig")).toHaveCount(0);
  // the same order the engine gave before cases: one seeded shuffle over form 1's items in bank order
  const want = await page.evaluate(() => { const ids = []; window.HALCYON_DATA.cphims.mock.forEach(p => { const f = p.form != null ? +p.form : +((/^M(\d+):/.exec(p.part || "") || [])[1] || 1);
    if (f === 1) p.questions.forEach((q, i) => ids.push(p.part.slice(0, 3) + i)) }); return window.HalcyonOrder.perm("mock4242", ids.length).map(i => ids[i]) });
  expect(order).toEqual(want);
});

test("PMP has two forms: the picker shows both, and form 2 starts with 180 questions, its case block and its figures", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const SHOTS = process.env.SHOTS;
  const qs = await bank(page, 2);
  expect(qs.length).toBe(180);
  expect(caseIds(qs, "m2c1").length).toBe(5);
  expect(caseIds(qs, "m2c2").length).toBe(5);
  expect(qs.filter(q => q.fig).length).toBe(6);
  expect(new Set(qs.map(q => q.id)).size).toBe(180);
  const one = new Set((await bank(page, 1)).map(q => q.id));
  expect(qs.some(q => one.has(q.id))).toBe(false); // form 2 ids (Pe2, Pr2, Bu2) never collide with form 1's
  await page.evaluate(() => { localStorage.removeItem("halcyon.c900"); localStorage.removeItem("halcyon.c910") });
  await page.goto("/#pmp/mock"); await page.reload();
  await expect(page.locator("#page .mockform")).toHaveCount(2);
  await expect(page.locator("#page .story").first()).toContainText("Two full practice exams");
  await expect(page.locator("#page")).toContainText("Practice exam 2");
  await noSideScroll(page);
  if (SHOTS) await page.screenshot({ path: `${SHOTS}/pmp-form-picker-390.png`, fullPage: true });
  await page.goto("/#pmp/mock/2"); await page.reload();
  await expect(page.locator("#page .story").first()).toContainText("180 questions.");
  await page.evaluate(() => { window.__realNow = Date.now; Date.now = () => 2026 });
  await page.locator("#exam").click();
  await page.evaluate(() => { Date.now = window.__realNow });
  await expect(page.locator("#page .kicker").first()).toContainText("Question 1 of 180");
  const order = await page.evaluate(() => JSON.parse(localStorage.getItem("halcyon.c910")).order);
  expect(order.length).toBe(180);
  expect(new Set(order)).toEqual(new Set(qs.map(q => q.id)));
  const ids = caseIds(qs, "m2c1"), at = order.indexOf(ids[0]);
  expect(order.slice(at, at + 5)).toEqual(ids);
  // the water utility case item shows its scenario, and each figure draws at phone width
  const figs = qs.filter(q => q.fig).map(q => q.id);
  const st = { mode: "exam", form: 2, order: [...ids, ...figs, ...order.filter(id => !ids.includes(id) && !figs.includes(id))], ans: {}, flagged: {}, cur: 0, elapsed: 0, breaksTaken: [], onBreak: null, submitted: false, startedAt: "2026-10-26T10:00:00.000Z" };
  await page.evaluate(st => localStorage.setItem("halcyon.c910", JSON.stringify(st)), st);
  await page.goto("/#pmp/mock/2"); await page.reload();
  await expect(page.locator("#page details.qmcase summary")).toContainText("Case study, question 1 of 5");
  await expect(page.locator("#page details.qmcase")).toContainText("Case: the water utility's billing app");
  for (let k = 0; k < 5; k++) await page.locator("#nextq").click();
  for (let k = 0; k < figs.length; k++) {
    const fig = page.locator("#page .qfig");
    await expect(fig).toHaveCount(1);
    await expect(fig).toBeVisible();
    const box = await fig.boundingBox();
    expect(box.x + box.width).toBeLessThanOrEqual(390);
    await noSideScroll(page);
    if (SHOTS && await fig.locator("svg").count() && !(await page.evaluate(() => window.__shot))) {
      await page.screenshot({ path: `${SHOTS}/pmp-form2-figure-item-390.png`, fullPage: true }); await page.evaluate(() => { window.__shot = 1 });
    }
    if (k < figs.length - 1) await page.locator("#nextq").click();
  }
});
