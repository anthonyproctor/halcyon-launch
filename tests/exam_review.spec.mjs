// Exam week review (2026-10-25): #pmp/review, opened from the button in the home page's Practice exam card. Content comes from
// courses/pmp/review.js; expected counts and text are read from window.HALCYON_REVIEW, never typed here.
// Screenshots: set REVIEW_SHOTS to a folder to save 390px light and dark captures there (nothing is written without it).
import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const review = page => page.evaluate(() => {
  const D = window.HALCYON_REVIEW.pmp;
  return { intro: D.intro, formulas: D.formulas.flatMap(g => g.items), fgroups: D.formulas.length, terms: D.terms.flatMap(g => g.items), rules: D.rules, contrasts: D.contrasts };
});
const noSideScroll = page => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);

test("the review opens from the home page's Practice exam card and renders all four sections", async ({ page }) => {
  await page.goto("/#pmp/home");
  const btn = page.locator(".mockhome #rvbtn");
  await expect(btn).toBeVisible();
  await expect(btn).toHaveText("Exam week review");
  await btn.click();
  await expect(page).toHaveURL(/#pmp\/review$/);
  await expect(page.locator("#page h1")).toHaveText("Exam week review");
  const D = await review(page);
  for (const p of D.intro) await expect(page.locator("#page .story")).toContainText(p);
  for (const id of ["formulas", "terms", "rules", "contrasts"]) await expect(page.locator(`#rv-${id} h2`)).toBeVisible();
  await expect(page.locator('#rv-formulas [data-rvitem="formula"]')).toHaveCount(D.formulas.length);
  await expect(page.locator("#rv-formulas .rvgroup")).toHaveCount(D.fgroups);
  await expect(page.locator('#rv-terms [data-rvitem="term"]')).toHaveCount(D.terms.length);
  await expect(page.locator('#rv-rules [data-rvitem="rule"]')).toHaveCount(D.rules.length);
  await expect(page.locator('#rv-contrasts [data-rvitem="contrast"]')).toHaveCount(D.contrasts.length);
  await expect(page.locator("#rv-formulas")).toContainText(D.formulas[0].f);
  await expect(page.locator("#rv-formulas")).toContainText(D.formulas[0].ex);
  // every item links back to the book: a chapter lesson section, or the practice exam for the few taught only there
  const items = [...D.formulas, ...D.terms, ...D.rules, ...D.contrasts];
  await expect(page.locator("#page .rvgo")).toHaveCount(items.length);
  await expect(page.locator('#page .rvgo[data-rvsec="-1"]')).toHaveCount(0); // every sec index points at a real lesson section
  // a reload stays on the page
  await page.reload();
  await expect(page.locator("#page h1")).toHaveText("Exam week review");
});

test("every linked chapter and lesson section exists, and the label is that section's heading", async ({ page }) => {
  await page.goto("/#pmp/review");
  const bad = await page.evaluate(() => {
    const D = window.HALCYON_REVIEW.pmp, out = [];
    const items = [...D.formulas.flatMap(g => g.items), ...D.terms.flatMap(g => g.items), ...D.rules, ...D.contrasts];
    for (const it of items) {
      if (it.mock) continue;
      const c = window.HALCYON_FULL.find(x => x.num === it.ch), s = c && c.lesson && c.lesson.sections[it.sec];
      if (!s) out.push(`${it.name || it.t || it.r || it.topic}: ch ${it.ch} sec ${it.sec}`);
    }
    return out;
  });
  expect(bad).toEqual([]);
  const first = page.locator("#rv-formulas .rvgo[data-rvch]").first();
  const h = await page.evaluate(([n, s]) => window.HALCYON_FULL.find(x => x.num === n).lesson.sections[s].h, [+(await first.getAttribute("data-rvch")), +(await first.getAttribute("data-rvsec"))]);
  await expect(first).toContainText(h);
});

test("a link opens the lesson at its section, and the back link returns to the review", async ({ page }) => {
  await page.goto("/#pmp/review");
  const link = page.locator('#rv-formulas .rvgo[data-rvch="5"][data-rvsec="3"]').first(); // CV: chapter 5, variances and indexes
  await expect(link).toBeVisible();
  const h = await page.evaluate(() => window.HALCYON_FULL.find(x => x.num === 5).lesson.sections[3].h);
  await link.click();
  await expect(page).toHaveURL(/#pmp\/full\/5$/);
  const sec = page.locator("#page section.lesson").nth(3);
  await expect(sec.locator("h2")).toHaveText(h);
  await expect(sec).toBeInViewport();
  await page.locator("#rvback").click();
  await expect(page).toHaveURL(/#pmp\/review$/);
  await expect(page.locator("#page h1")).toHaveText("Exam week review");
});

for (const scheme of ["light", "dark"]) {
  test(`no sideways scroll at 390px, ${scheme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/#pmp/review");
    await expect(page.locator("#rv-contrasts")).toBeVisible();
    expect(await noSideScroll(page)).toBe(true);
    // the page follows the theme: dark gives a dark page background, light a light one
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor.match(/\d+/g).slice(0, 3).map(Number).reduce((a, b) => a + b, 0));
    expect(scheme === "dark" ? bg < 200 : bg > 600).toBe(true);
    const dir = process.env.REVIEW_SHOTS;
    if (dir) {
      mkdirSync(dir, { recursive: true });
      await page.screenshot({ path: join(dir, `review-390-${scheme}.png`) });
      await page.screenshot({ path: join(dir, `review-390-${scheme}-full.png`), fullPage: true });
      await page.goto("/#pmp/home");
      await page.locator("#rvbtn").scrollIntoViewIfNeeded();
      await page.screenshot({ path: join(dir, `home-card-390-${scheme}.png`) });
    }
  });
}

test("other books show no review button, and their review address falls back to the book's home", async ({ page }) => {
  for (const id of ["cphims", "cisa"]) {
    await page.goto(`/#${id}/home`);
    await expect(page.locator("#page h1")).toBeVisible();
    await expect(page.locator("#page .mockhome, #page #mocksoon").first()).toBeAttached();
    await expect(page.locator("#rvbtn")).toHaveCount(0);
    await page.goto("about:blank");
    await page.goto(`/#${id}/review`);
    await expect(page.locator("#page h1")).toBeVisible();
    await expect(page.locator("#page h1")).not.toHaveText("Exam week review");
    await expect(page.locator("#rv-formulas")).toHaveCount(0);
  }
});
