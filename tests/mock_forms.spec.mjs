// Practice exam engine (approved 2026-10-12): unscored pretest items, handbook mode, separate mock forms, and the results breakdown
// by domain and subdomain with reread pointers. Progress is seeded in localStorage the way the engine stores it offline:
// a course's mock attempt at halcyon.c{base+900} and its history at base+901 (form 1); form 2 at base+910 and base+911.
// CPHIMS base is 10000, CISA 50000, PMP 0.
import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const accept = page => page.on("dialog", d => d.accept());

// every question of a course's mock bank, with the id the engine gives it
async function bank(page, course) {
  await page.goto(`/#${course}/home`);
  await page.waitForFunction(c => { const d = c === "pmp" ? { mock: window.HALCYON_MOCK } : (window.HALCYON_DATA || {})[c]; return !!(d && d.mock && d.mock.length) }, course);
  return page.evaluate(c => { const d = c === "pmp" ? { mock: window.HALCYON_MOCK } : window.HALCYON_DATA[c]; const out = [];
    d.mock.forEach(p => p.questions.forEach((q, i) => out.push({ id: p.part.slice(0, 3) + i, part: p.part, a: q.a, n: q.opts.length, task: q.task, domain: q.domain, scored: q.scored !== false }))); return out }, course);
}
// stores an attempt; ans(q) gives the option to pick for question q, or undefined to leave it blank
async function seedAttempt(page, key, qs, ans, extra = {}) {
  const st = { mode: "exam", order: qs.map(q => q.id), ans: {}, flagged: {}, cur: 0, elapsed: 600, breaksTaken: [], onBreak: null, submitted: false, startedAt: "2026-10-12T15:00:00.000Z", ...extra };
  qs.forEach(q => { const v = ans(q); if (v !== undefined) st.ans[q.id] = v });
  await page.evaluate(([k, st]) => localStorage.setItem("halcyon.c" + k, JSON.stringify(st)), [key, st]);
}
const wrong = q => (q.a + 1) % q.n;

test("pretest items: unscored items don't count, and the results reveal which they were", async ({ page }) => {
  accept(page);
  const qs = (await bank(page, "cphims")).filter(q => q.part.startsWith("M1:"));
  expect(qs.length).toBe(115);
  expect(qs.filter(q => !q.scored).length).toBe(15);
  // every scored item right, every pretest item wrong: the score is 100 of 100, not 100 of 115
  await seedAttempt(page, 10900, qs, q => q.scored ? q.a : wrong(q));
  await page.goto("/#cphims/mock/1"); await page.reload(); // two forms ship, so /mock alone is the picker
  await expect(page.locator("#page .kicker")).toContainText("Question 1 of 115");
  await expect(page.locator("#page")).not.toContainText("Unscored");
  await page.locator("#submitnow").click();
  await expect(page.locator("#page h1")).toHaveText("100 of 100 (100 percent)");
  await expect(page.locator("#prenote")).toContainText("The other 15 were unscored pretest items");
  // domain cards count only scored items (25, 20, 30, 25)
  for (const [d, n] of [["Environments", 25], ["Clinical Informatics", 20], ["Systems Management", 30], ["Leadership", 25]])
    await expect(page.locator("#page .end-grid").first().locator(".card", { hasText: d })).toContainText(`${n} of ${n}`);
  await page.locator("#page details summary").click();
  await expect(page.locator("#page .qitem.unscored")).toHaveCount(15);
  await expect(page.locator("#page .qitem .tag.pre").first()).toHaveText("Unscored pretest item");
  const H = await page.evaluate(() => JSON.parse(localStorage.getItem("halcyon.c10901")));
  expect(H.list.slice(-1)[0]).toMatchObject({ right: 100, total: 100, pre: 15, answered: 100, f: 1 });
  // the course's pass note no longer says all 115 count
  await expect(page.locator("#page .story").first()).toContainText("15 unscored pretest items");
});

test("handbook mode runs only the 100 scored items on the timer; exam and practice modes still run all 115", async ({ page }) => {
  const qs = (await bank(page, "cphims")).filter(q => q.part.startsWith("M1:"));
  await page.goto("/#cphims/mock/1");
  await expect(page.locator("#handbook")).toBeVisible();
  await expect(page.locator("#exam")).toBeVisible();
  await expect(page.locator("#practice")).toBeVisible();
  await page.locator("#handbook").click();
  await expect(page.locator("#page .kicker")).toContainText("Handbook mode");
  await expect(page.locator("#page .kicker")).toContainText("Question 1 of 100");
  await expect(page.locator("#mocktime")).toHaveText(/^1:5\d:\d\d$|^2:00:00$/); // 120 minute timer
  const st = await page.evaluate(() => JSON.parse(localStorage.getItem("halcyon.c10900")));
  const unscored = new Set(qs.filter(q => !q.scored).map(q => q.id));
  expect(st.mode).toBe("handbook");
  expect(st.order.length).toBe(100);
  expect(st.order.filter(id => unscored.has(id))).toEqual([]);
  // exam and practice modes: all 115
  await page.evaluate(() => localStorage.removeItem("halcyon.c10900"));
  await page.goto("/#cphims/home"); await page.goto("/#cphims/mock/1"); await page.reload();
  await page.locator("#exam").click();
  await expect(page.locator("#page .kicker")).toContainText("Exam mode · Question 1 of 115");
  await page.evaluate(() => localStorage.removeItem("halcyon.c10900"));
  await page.reload();
  await page.locator("#practice").click();
  await expect(page.locator("#page .kicker")).toContainText("Practice mode · Question 1 of 115");
});

test("two CPHIMS forms appear separately, each with its own attempt and history; saved form 1 progress still loads", async ({ page }) => {
  // the real second form ships in courses/cphims/mock/mock2.js (2026-10-14)
  const all = await bank(page, "cphims");
  const f1 = all.filter(q => q.part.startsWith("M1:")), f2 = all.filter(q => q.part.startsWith("M2:"));
  expect(f2.length).toBe(115);
  // progress saved before forms existed: an attempt in progress at 10900 (no form field) and one finished attempt at 10901
  await seedAttempt(page, 10900, f1, q => q.a, { cur: 7 });
  await page.evaluate(() => localStorage.setItem("halcyon.c10901", JSON.stringify({ list: [{ at: "2026-10-10T15:00:00.000Z", mode: "exam", right: 80, answered: 100, total: 100, byTask: {}, secs: 5000 }] })));
  await page.goto("/#cphims/mock"); await page.reload();
  const cards = page.locator("#page .mockform");
  await expect(cards).toHaveCount(2);
  await expect(cards.nth(0).locator("h3")).toHaveText("Practice exam 1");
  await expect(cards.nth(1).locator("h3")).toHaveText("Practice exam 2");
  await expect(cards.nth(0)).toContainText("In progress");
  await expect(cards.nth(0)).toContainText("80 of 100");
  await expect(cards.nth(1)).toContainText("You haven't taken this one yet");
  // form 1 resumes exactly where it was
  await page.locator('[data-form="1"]').click();
  await expect(page.locator("#page .kicker")).toContainText("Practice exam 1 · Exam mode · Question 8 of 115");
  // form 2 is its own exam with its own key
  await page.goto("/#cphims/mock/2"); await page.reload();
  await expect(page.locator("#page h1")).toHaveText("Practice exam 2");
  await expect(page.locator("#page .story").first()).toContainText("115 questions, 100 of them scored");
  await page.locator("#practice").click();
  await expect(page.locator("#page .kicker")).toContainText("Practice exam 2 · Practice mode · Question 1 of 115");
  const s2 = await page.evaluate(() => JSON.parse(localStorage.getItem("halcyon.c10910")));
  expect(s2.order.every(id => id.startsWith("M2:"))).toBe(true);
  const s1 = await page.evaluate(() => JSON.parse(localStorage.getItem("halcyon.c10900")));
  expect(s1.cur).toBe(7); expect(s1.order.length).toBe(115);
  // a reload keeps the form
  await page.reload();
  await expect(page.locator("#page .kicker")).toContainText("Practice exam 2 · Practice mode");
  // finishing form 2 writes form 2's history only
  accept(page);
  await seedAttempt(page, 10910, f2, q => q.a, { mode: "practice" });
  await page.reload();
  await page.locator("#submitnow").click();
  await expect(page.locator("#page h1")).toHaveText("100 of 100 (100 percent)");
  const h2 = await page.evaluate(() => JSON.parse(localStorage.getItem("halcyon.c10911")));
  expect(h2.list.length).toBe(1); expect(h2.list[0]).toMatchObject({ f: 2, total: 100, pre: 15 });
  const h1 = await page.evaluate(() => JSON.parse(localStorage.getItem("halcyon.c10901")));
  expect(h1.list.length).toBe(1);
  // progress shows both, with the exam named
  await page.goto("/#cphims/progress"); await page.reload();
  const t = page.locator("#page table", { hasText: "Exam" }).last();
  await expect(t.locator("tr").first()).toContainText("Exam");
  await expect(t.locator("tr")).toHaveCount(3);
  await expect(t.locator("tr").nth(1).locator("td").nth(1)).toHaveText("2"); // newest first: the form 2 practice run
  await expect(t.locator("tr").nth(1).locator("td").nth(2)).toHaveText("Practice");
  await expect(t.locator("tr").nth(2).locator("td").nth(1)).toHaveText("1");
});

for (const [course, n] of [["pmp", 180], ["cisa", 150]]) {
  test(`${course}: every mock part is one exam (${n} questions, no picker)`, async ({ page }) => {
    await page.goto(`/#${course}/mock`);
    await expect(page.locator("#exam")).toBeVisible();
    await expect(page.locator("#page .mockform")).toHaveCount(0);
    await expect(page.locator("#handbook")).toHaveCount(0); // no unscored items, no handbook mode
    await expect(page.locator("#page .story").first()).toContainText(`${n} questions.`);
    await page.locator("#exam").click();
    await expect(page.locator("#page .kicker")).toContainText(`Exam mode · Question 1 of ${n}`);
    await expect(page.locator("#page .kicker")).not.toContainText("Practice exam 1");
    expect(page.url()).toMatch(new RegExp(`#${course}/mock$`));
  });
}

test("CPHIMS results: Systems Management by subdomain, and reread pointers for weak areas (every chapter is written, so every pointer links)", async ({ page }) => {
  const errs = []; page.on("pageerror", e => errs.push(e.message));
  const qs = (await bank(page, "cphims")).filter(q => q.part.startsWith("M1:"));
  // miss every Analysis (SA) item and every Environments item; the rest right
  await seedAttempt(page, 10900, qs, q => /^SA\d/.test(q.task) || q.domain === "Environments" ? wrong(q) : q.a, { submitted: true, finishedAt: "2026-10-12T16:00:00.000Z" });
  await page.goto("/#cphims/mock/1"); await page.reload();
  await expect(page.locator("#page h2", { hasText: "Systems Management by subdomain" })).toBeVisible();
  const sub = page.locator("#page .subgrid .card");
  await expect(sub).toHaveCount(5);
  await expect(sub.locator("h3")).toHaveText(["Analysis", "Design", "Selection and implementation", "Testing", "Privacy and security"]);
  await expect(sub.nth(0)).toContainText("0%");
  await expect(sub.nth(0)).toContainText("0 of 9");
  await expect(sub.nth(1)).toContainText("100%");
  const items = page.locator("#page ul.reread li");
  await expect(items).toHaveCount(2);
  const an = items.filter({ hasText: "Analysis" });
  await expect(an).toContainText("(Systems Management), 0 percent");
  await expect(an.locator("button", { hasText: "Reread chapter 6," })).toBeVisible(); // ch6 teaches most SA tasks
  const env = items.filter({ hasText: "Environments" });
  await expect(env).toContainText("0 percent");
  await expect(env.locator("button", { hasText: "Reread chapter 1," })).toBeVisible();
  await expect(env.locator("button", { hasText: "Reread chapter 2," })).toBeVisible();
  // the link opens that chapter's lesson
  await env.locator("button", { hasText: "Reread chapter 2," }).click();
  await expect(page).toHaveURL(/#cphims\/full\/2$/);
  await expect(page.locator("#page .lesson").first()).toBeVisible();
  // story mode orders a chapter's steps differently; the link still lands on the lesson, and a finished chapter stays done
  await page.evaluate(() => { localStorage.setItem("halcyon.storymode", "true");
    const st = JSON.parse(localStorage.getItem("halcyon.c10101") || "null") || { pos: 0, max: 0, picks: {}, m: { trust: 50, conf: 50, health: 50 }, score: 0, flags: {}, dom: Object.fromEntries(window.HALCYON_DATA.cphims.meta.DOMS.map(d => [d, [0, 0]])), drills: {}, ex: null, quiz: null };
    st.pos = 999; st.max = 999; st.doneAt = "2026-10-11T15:00:00.000Z"; localStorage.setItem("halcyon.c10101", JSON.stringify(st)) });
  await page.goto("/#cphims/mock/1"); await page.reload();
  await page.locator("#page ul.reread li", { hasText: "Environments" }).locator("button", { hasText: "Reread chapter 1," }).click();
  await expect(page).toHaveURL(/#cphims\/full\/1$/);
  await expect(page.locator("#page .lesson").first()).toBeVisible();
  await page.goto("/#cphims/home"); await page.reload();
  await expect(page.locator('#page [data-open="full:1"]')).toContainText("Done");
  expect(errs).toEqual([]);
});

test("PMP and CISA results also point to chapters: PMP from its chapters' task tags, CISA from meta.js", async ({ page }) => {
  const pmp = await bank(page, "pmp");
  await seedAttempt(page, 900, pmp, q => q.domain === "People" ? wrong(q) : q.a, { submitted: true });
  await page.goto("/#pmp/mock"); await page.reload();
  await expect(page.locator("#page .subgrid")).toHaveCount(0); // no subdomains
  const li = page.locator("#page ul.reread li");
  await expect(li).toHaveCount(1);
  await expect(li).toContainText("People, 0 percent");
  await expect(li.locator("button", { hasText: /^Reread chapter \d+, / })).toHaveCount(3);
  const cisa = await bank(page, "cisa");
  await seedAttempt(page, 50900, cisa, q => q.domain === "Acquisition and Implementation" ? wrong(q) : q.a, { submitted: true });
  await page.goto("/#cisa/mock"); await page.reload();
  const c = page.locator("#page ul.reread li");
  await expect(c).toHaveCount(1);
  await expect(c).toContainText("Acquisition and Implementation, 0 percent");
  await expect(c).toContainText("Reread chapter 5, The Build");
  await expect(c).toContainText("Reread chapter 6, Change Window");
});
