// Book progress (approved 2026-10-12): the rail card on a book's home and chapter pages, the thin bar on Library cards, and the finish
// line on the Progress page. Expected numbers are worked out here from the chapter data (pages = opening, lesson, decisions, drills,
// exercise, quiz, ending; Labs left out) and the real audio/v2/audiobook.json, not read back from the engine's own functions.
import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const AUDIO = JSON.parse(fs.readFileSync(path.join(ROOT, "audio/v2/audiobook.json"), "utf8")).full;
const TP = "halcyon-qa-test:";

// page counts per PMP chapter, from the loaded chapter data
const pageCounts = page => page.evaluate(() => Object.fromEntries(window.HALCYON_FULL.filter(c => c && c.scenes).map(c =>
  [c.num, 1 + (c.lesson ? 1 : 0) + c.scenes.length + (c.drills || []).length + (c.exercise ? 1 : 0) + 1 + 1])));
const fresh = extra => ({ pos: 0, max: 0, picks: {}, m: { trust: 50, conf: 50, health: 50 }, score: 0, flags: {}, dom: { "People": [0, 0], "Process": [0, 0], "Business Environment": [0, 0] }, drills: {}, ex: null, quiz: null, ...extra });
const doneCh = n => fresh({ pos: 99, max: 99, doneAt: "2026-10-12T10:00:00.000Z" }); // pos past the end: relayout/steps treat it as the last page
async function seed(page, kv, prefix = "halcyon.") {
  await page.evaluate(([kv, prefix]) => { for (const [k, v] of Object.entries(kv)) localStorage.setItem(prefix + k, JSON.stringify(v)) }, [kv, prefix]);
}
// a full load after seeding, so nothing in memory from the page before can be saved over the seed
async function open(page, route) { await page.goto("about:blank"); await page.goto(route); }
const floorPct = (d, t) => Math.floor(d / t * 100);
const fmtLeft = m => m < 0.5 ? "less than a minute left" : m < 10 ? `about ${Math.max(1, Math.round(m))} minute${Math.round(m) > 1 ? "s" : ""} left`
  : m < 57.5 ? `about ${Math.round(m / 5) * 5} minutes left` : m < 600 ? (h => `about ${h} hour${h > 1 ? "s" : ""} left`)(Math.round(m / 30) / 2) : `about ${Math.round(m / 60)} hours left`;

test("percent: 0 at the start, moves mid-chapter, and counts a finished chapter's pages", async ({ page }) => {
  await page.goto("/#pmp/home");
  await expect(page.locator("#bookbar")).toBeVisible();
  await expect(page.locator("#bookbar .bpline")).toContainText("0% complete · Chapter 1 of 15 · about");
  await expect(page.locator("#bookbar .bpbar")).toHaveAttribute("aria-valuenow", "0");
  const P = await pageCounts(page);
  const T = Object.values(P).reduce((a, b) => a + b, 0);

  // reading: moving past the opening is one page done, so the bar moves off zero
  await page.goto("/#pmp/full/1");
  await expect(page.locator("#bookbar .bpline")).toContainText("0% complete · Chapter 1 of 15");
  await page.locator("#fnext").click();
  await expect(page.locator("#bookbar .bpline")).toContainText("under 1% complete · Chapter 1 of 15");
  const w = await page.locator("#bookbar .bpbar > span").evaluate(e => parseFloat(e.style.width));
  expect(w).toBeCloseTo(1 / T * 100, 1);

  // mid-chapter: chapter 2 at its 6th page with two decisions answered = opening + lesson passed + 2 decisions = 4 pages
  await seed(page, { c202: fresh({ pos: 5, max: 5, picks: { 0: 0, 1: 0 } }), "lastplace.pmp": { t: "full", n: 2 } });
  await open(page, "/#pmp/home");
  await expect(page.locator("#bookbar .bpline")).toContainText(`${floorPct(4 + 1, T) || "under 1"}% complete · Chapter 2 of 15`);

  // finishing chapter 1 counts all its pages
  await seed(page, { c201: doneCh(1) });
  await open(page, "/#pmp/home");
  const want = floorPct(P[1] + 4, T);
  await expect(page.locator("#bookbar .bpline")).toContainText(`${want}% complete · Chapter 2 of 15`);
  await expect(page.locator("#bookbar .bpbar")).toHaveAttribute("aria-valuenow", String(want));

  // focus mode keeps the same count: the answered decisions and the finished chapter don't depend on page order
  // focus mode reorders the pages: the lesson moves after the ending, so in chapter 2 (saved at index 5) only the opening counts as passed
  await page.evaluate(() => localStorage.setItem("halcyon.storymode", "true"));
  await open(page, "/#pmp/home");
  await expect(page.locator("#bookbar .bpline")).toContainText(`${floorPct(P[1] + 3, T)}% complete · Chapter 2 of 15`);
});

test("time left: real narration minutes for the reader's edition, word counts where there's no audio", async ({ page }) => {
  await page.goto("/#pmp/home");
  const P = await pageCounts(page);
  // every chapter done except chapter 1, where the lesson, exercise and quiz are done: what's left is decisions 1 to 12 and the ending,
  // all narrated by both editions. Story edition: 13 narrated pages (opening, 12 decisions, ending); study edition adds the lesson (14).
  const all = {};
  for (const n of Object.keys(P)) if (+n !== 1) all["c" + (200 + +n)] = doneCh(+n);
  all.c201 = fresh({ pos: 2, max: 2, ex: { done: true }, quiz: { v: [], right: 0 } });
  await seed(page, all);
  const ch1 = await page.evaluate(() => { const c = window.HALCYON_FULL.find(x => x && x.num === 1); return { scenes: c.scenes.length } });
  const story = ch1.scenes + 1, studyLeft = ch1.scenes + 1;
  await open(page, "/#pmp/full/1");
  await expect(page.locator("#bookbar .bpline")).toContainText(fmtLeft(AUDIO[1].story.min / (ch1.scenes + 2) * story));
  await page.evaluate(() => localStorage.setItem("halcyon.bookEd.pmp", JSON.stringify("study")));
  await open(page, "/#pmp/home");
  await expect(page.locator("#bookbar .bpline")).toContainText(fmtLeft(AUDIO[1].study.min / (ch1.scenes + 3) * studyLeft));

  // a chapter without narration (the last one not yet narrated): only its quiz left, timed at 200 words a minute
  const NA = Object.keys(P).map(Number).filter(n => !AUDIO[n]).pop();
  test.skip(!NA, "every chapter is narrated now");
  all.c201 = doneCh(1);
  all["c" + (200 + NA)] = fresh({ pos: 3, max: 30, picks: Object.fromEntries([...Array(30).keys()].map(i => [i, 0])), drills: Object.fromEntries([...Array(10).keys()].map(j => [j, { ok: [true] }])), ex: { done: true } });
  await seed(page, all);
  const quizWords = await page.evaluate((NA) => {
    const c = window.HALCYON_FULL.find(x => x && x.num === NA), out = [];
    const skip = new Set(["id", "after", "task", "domain", "approach", "video", "src"]); // tags and ids, not words on the page
    const walk = v => { if (v == null || typeof v === "number" || typeof v === "boolean") return; if (typeof v === "string") return out.push(v); if (Array.isArray(v)) return v.forEach(walk); Object.entries(v).forEach(([k, x]) => skip.has(k) || walk(x)) };
    walk([c.quiz, c.cases]);
    return out.join(" ").replace(/<[^>]*>/g, " ").split(/\s+/).filter(w => /[A-Za-z0-9]/.test(w)).length;
  }, NA);
  await open(page, "/#pmp/home");
  await expect(page.locator("#bookbar .bpline")).toContainText(`Chapter ${NA} of 15 · ${fmtLeft(quizWords / 200)}`);

  // a fresh book is many hours
  await page.evaluate(() => Object.keys(localStorage).filter(k => /^halcyon\.c2\d\d$/.test(k)).forEach(k => localStorage.removeItem(k)));
  await open(page, "/#pmp/home");
  await expect(page.locator("#bookbar .bpline")).toHaveText(/^0% complete · Chapter 1 of 15 · about \d+ hours left$/);
});

test("library cards show a thin bar with the percent; an unfinished book says it's of what's written", async ({ page }) => {
  await page.goto("/#pmp/home");
  const P = await pageCounts(page);
  const T = Object.values(P).reduce((a, b) => a + b, 0);
  // PMP chapter 1 finished; CISA chapter 1 started (CISA's chapters load in the background, then the Library redraws)
  await seed(page, { c201: doneCh(1), c50101: fresh({ pos: 2, max: 2 }) });
  await open(page, "/#library");
  const pmp = page.locator(".libcard[data-course=pmp] .libbp");
  await expect(pmp).toContainText(`${floorPct(P[1], T)}% complete`);
  const w = await pmp.locator(".bpbar > span").evaluate(e => parseFloat(e.style.width));
  expect(w).toBeCloseTo(P[1] / T * 100, 1);
  await expect(page.locator(".libcard[data-course=pilot] .libbp")).toContainText("0% complete");
  await expect(page.locator(".libcard[data-course=cisa] .libbp")).toContainText(/\d+% of what's written/);
  await expect(page.locator(".libcard[data-course=cisa] .libbp")).not.toContainText("0% of");
  const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(over).toBeLessThanOrEqual(0);
  // and on CISA's own pages the rail says how much is written
  await page.goto("/#cisa/home");
  await expect(page.locator("#bookbar .bpline")).toContainText(/% of what's written · Chapter 1 of 12 · 11 written so far/);
});

test("Progress page: the finish line as steps", async ({ page }) => {
  await page.goto("/#pmp/progress");
  const fin = page.locator("ol.finish li");
  await expect(fin).toHaveCount(3);
  await expect(fin.nth(0)).toContainText("Chapters 0%");
  await expect(fin.nth(1)).toContainText("Practice exam not started");
  await expect(fin.nth(2)).toContainText("Final assessment locked");

  const P = await pageCounts(page);
  const all = {};
  for (const n of Object.keys(P)) all["c" + (200 + +n)] = doneCh(+n);
  all.c901 = { list: [{ at: "2026-10-01T10:00:00Z", mode: "exam", right: 120, total: 180, secs: 100 }, { at: "2026-10-05T10:00:00Z", mode: "exam", right: 135, total: 180, secs: 100 }] };
  await seed(page, all);
  await open(page, "/#pmp/home");
  await page.goto("/#pmp/progress");
  await expect(fin.nth(0)).toContainText("Chapters 100%");
  await expect(fin.nth(0)).toHaveClass(/done/);
  await expect(fin.nth(1)).toContainText("Practice exam best score 75%");
  await expect(fin.nth(2)).toContainText("Final assessment unlocked");
  await seed(page, { c906: { list: [{ id: "HL-T", at: "2026-10-12T10:00:00Z", date: "2026-10-12", right: 80, total: 100, pass: true, preview: false, hours: "1.0" }] } });
  await open(page, "/#pmp/home");
  await page.goto("/#pmp/progress");
  await expect(fin.nth(2)).toContainText("Final assessment passed");
  const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(over).toBeLessThanOrEqual(0);
});

test("test profile shows its own progress and leaves the real bar alone", async ({ page }) => {
  await page.goto("/#pmp/home");
  const P = await pageCounts(page);
  const T = Object.values(P).reduce((a, b) => a + b, 0);
  await seed(page, { c201: doneCh(1) });
  await seed(page, { c201: doneCh(1), c202: doneCh(2), c203: doneCh(3) }, TP);
  await open(page, "/#pmp/home");
  await expect(page.locator("#bookbar .bpline")).toContainText(`${floorPct(P[1], T)}% complete`);
  await page.goto("/?test=1#pmp/home");
  await page.waitForFunction(() => window.HalcyonProfile && window.HalcyonProfile.test === true);
  await page.goto("/#pmp/home");
  await expect(page.locator("#bookbar .bpline")).toContainText(`${floorPct(P[1] + P[2] + P[3], T)}% complete · Chapter 4 of 15`);
  await page.goto("/#library");
  await expect(page.locator(".libcard[data-course=pmp] .libbp")).toContainText(`${floorPct(P[1] + P[2] + P[3], T)}% complete`);
  await page.goto("/?test=0#pmp/home");
  await page.waitForFunction(() => window.HalcyonProfile && window.HalcyonProfile.test === false);
  await page.goto("/#pmp/home");
  await expect(page.locator("#bookbar .bpline")).toContainText(`${floorPct(P[1], T)}% complete · Chapter 2 of 15`);
});

test("rail card: compact, no sideways scroll, readable contrast at 390px and 1280px in both themes", async ({ page }) => {
  for (const [w, h] of [[390, 844], [1280, 900]]) for (const scheme of ["light", "dark"]) {
    await page.setViewportSize({ width: w, height: h });
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto("/#pmp/full/1");
    await expect(page.locator("#bookbar")).toBeVisible();
    const box = await page.locator("#bookbar").boundingBox();
    expect(box.height, `${w} ${scheme} card height`).toBeLessThan(130);
    const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(over).toBeLessThanOrEqual(0);
    const ratio = await page.locator("#bookbar .bpline").evaluate(el => {
      const rgb = s => s.match(/[\d.]+/g).slice(0, 3).map(Number);
      const lum = c => { const [r, g, b] = c.map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }); return 0.2126 * r + 0.7152 * g + 0.0722 * b };
      let bg = el, b; while (bg && (b = getComputedStyle(bg).backgroundColor) && /rgba\(.*, 0\)|transparent/.test(b)) bg = bg.parentElement;
      const L1 = lum(rgb(getComputedStyle(el).color)), L2 = lum(rgb(b));
      return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    });
    expect(ratio, `${w} ${scheme} contrast`).toBeGreaterThanOrEqual(4.5);
    // no em or en dashes, no spaced hyphens
    expect(await page.locator("#bookbar").textContent()).not.toMatch(/[–—]| - /);
  }
  // not on pages outside the book
  await page.goto("/#library");
  await expect(page.locator("#bookbar")).toBeHidden();
  await page.goto("/#pmp/progress");
  await expect(page.locator("#bookbar")).toBeHidden();
});

test("a slow audiobook manifest from the last book never times the next one", async ({ page }) => {
  await page.goto("/#cisa/home");
  await expect(page.locator("#bookbar .bpline")).toContainText("left");
  const right = await page.locator("#bookbar .bpline").textContent(); // CISA timed from its own manifest
  await page.route("**/audio/v2/audiobook.json", async r => { await new Promise(f => setTimeout(f, 1500)); r.continue() });
  await page.goto("about:blank");
  await page.goto("/#pmp/home");
  await expect(page.locator("#bookbar .bpline")).not.toContainText("left"); // no time until the minutes are in
  await page.goto("/#cisa/home"); // same page, PMP's manifest still on its way
  await page.waitForTimeout(2000);
  await expect(page.locator("#bookbar .bpline")).toHaveText(right);
  await page.goto("/#pmp/home");
  await expect(page.locator("#bookbar .bpline")).toContainText(/about \d+ hours left/);
});
