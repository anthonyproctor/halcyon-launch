// Per course practice exam labels (2026-10-25): the LSAT forms are 35 minute sections and its shared reading texts are passages, so
// courses.js gives it mockFormsLabel and caseLabel. Every other book keeps the defaults ("full practice exams", "Case study").
// Set SHOTS=<dir> to save the 390 px screenshots of the LSAT picker and a passage item.
import { test, expect } from "@playwright/test";

const SHOTS = process.env.SHOTS;
async function seed(page, course, key, form) {
  await page.goto(`/#${course}/home`);
  await page.waitForFunction(c => { const d = c === "pmp" ? { mock: window.HALCYON_MOCK } : (window.HALCYON_DATA || {})[c]; return !!(d && d.mock && d.mock.length) }, course);
  const order = await page.evaluate(([c, f]) => { const d = c === "pmp" ? window.HALCYON_MOCK : window.HALCYON_DATA[c].mock, o = [];
    d.forEach(p => { if (!/^M\d+:/.test(p.part) || p.part.startsWith(`M${f}:`)) p.questions.forEach((q, i) => o.push({ id: p.part.slice(0, 3) + i, c: q.case || "", cq: q.cq || 0 })) });
    const first = o.find(x => x.c).c; // the first case's items first, in cq order, then the rest
    return [...o.filter(x => x.c === first).sort((a, b) => a.cq - b.cq), ...o.filter(x => x.c !== first)].map(x => x.id) }, [course, form]);
  const st = { mode: "exam", form, order, ans: {}, flagged: {}, cur: 0, elapsed: 0, breaksTaken: [], onBreak: null, submitted: false, startedAt: "2026-10-25T10:00:00.000Z" };
  await page.evaluate(([k, st]) => localStorage.setItem("halcyon.c" + k, JSON.stringify(st)), [key, st]);
}

test("LSAT: the picker says timed sections and the reading set is headed Passage", async ({ page }) => {
  page.on("dialog", d => d.accept());
  await page.goto("/#lsat/mock"); await page.reload();
  const story = page.locator("#page .story").first();
  await expect(story).toContainText("Three timed sections. Each one has its own questions");
  await expect(story).toContainText("The real test adds a fourth, unscored section, which can come at any point.");
  await expect(page.locator("#page")).not.toContainText("full practice exams");
  if (SHOTS) await page.screenshot({ path: `${SHOTS}/lsat-form-picker-390.png`, fullPage: true });
  await seed(page, "lsat", 60910, 2); // form 2 is Reading Comprehension
  await page.goto("/#lsat/mock/2"); await page.reload();
  const box = page.locator("#page details.qmcase");
  await expect(box.locator("summary .kicker")).toHaveText("Passage, question 1 of 7");
  await expect(page.locator("#page")).not.toContainText("Case study");
  if (SHOTS) await page.screenshot({ path: `${SHOTS}/lsat-passage-item-390.png`, fullPage: true });
});

test("other books keep the default labels: CPHIMS picker and PMP case header", async ({ page }) => {
  page.on("dialog", d => d.accept());
  await page.goto("/#cphims/mock"); await page.reload();
  await expect(page.locator("#page .story").first()).toContainText("Two full practice exams. Each one has its own questions");
  await seed(page, "pmp", 900, 1);
  await page.goto("/#pmp/mock"); await page.reload();
  await expect(page.locator("#page details.qmcase summary .kicker")).toHaveText("Case study, question 1 of 5");
});
