// Exam week review (2026-10-25): #pmp/review, opened from the button in the home page's Practice exam card. Content comes from
// courses/pmp/review.js; expected counts and text are read from window.HALCYON_REVIEW, never typed here.
// Hearth (#asep/review) and The Copilot Rollout (#gh300/review) load courses/<id>/review.js from their scripts list and name their own
// sections (D.sections); the tests at the end walk those sections from the data the same way.
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
  for (const id of ["cphims", "cisa", "lsat"]) {
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

// ---- Hearth (asep) and The Copilot Rollout (gh300): sections come from D.sections, so the expected layout is read from the data ----
const KIND_ITEM = { list: "list", formulas: "formula", terms: "term", rules: "rule", contrasts: "contrast" };
const bookReview = (page, id) => page.evaluate(id => {
  const D = window.HALCYON_REVIEW[id];
  const grouped = k => k === "list" || k === "terms" || k === "formulas";
  const sections = D.sections.map(([sid, title, kind]) => {
    const L = D[sid], items = grouped(kind) ? L.flatMap(g => g.items) : L;
    return { sid, title, kind, n: items.length, groups: grouped(kind) ? L.length : 0, items };
  });
  return { intro: D.intro, sections };
}, id);
const BOOKS = [
  { id: "asep", body: "INCOSE" },
  { id: "gh300", body: "GitHub or Microsoft" }
];

for (const { id, body } of BOOKS) {
  test(`${id}: the review opens from the Practice exam card and renders every section`, async ({ page }) => {
    await page.goto(`/#${id}/home`);
    const btn = page.locator(".mockhome #rvbtn");
    await expect(btn).toBeVisible();
    await expect(btn).toHaveText("Exam week review");
    await btn.click();
    await expect(page).toHaveURL(new RegExp(`#${id}/review$`));
    await expect(page.locator("#page h1")).toHaveText("Exam week review");
    const D = await bookReview(page, id);
    for (const p of D.intro) await expect(page.locator("#page .story")).toContainText(p);
    await expect(page.locator("#page .story")).toContainText(`affiliated with or endorsed by ${body}`);
    await expect(page.locator("#page .rvjump [data-rvjump]")).toHaveCount(D.sections.length);
    let total = 0;
    for (const s of D.sections) {
      await expect(page.locator(`#rv-${s.sid} h2`)).toHaveText(s.title);
      await expect(page.locator(`#rv-${s.sid} [data-rvitem="${KIND_ITEM[s.kind]}"]`)).toHaveCount(s.n);
      if (s.groups) await expect(page.locator(`#rv-${s.sid} .rvgroup`)).toHaveCount(s.groups);
      total += s.n;
    }
    // every item links back to the book: a lesson section, or the practice exam for the few taught only there
    await expect(page.locator("#page .rvgo")).toHaveCount(total);
    await expect(page.locator('#page .rvgo[data-rvsec="-1"]')).toHaveCount(0);
    await page.reload();
    await expect(page.locator("#page h1")).toHaveText("Exam week review");
  });

  test(`${id}: every link lands on an existing lesson section, labeled with its heading`, async ({ page }) => {
    await page.goto(`/#${id}/review`);
    await expect(page.locator("#page h1")).toHaveText("Exam week review");
    const bad = await page.evaluate(id => {
      const D = window.HALCYON_REVIEW[id], F = window.HALCYON_DATA[id].full, out = [];
      for (const [sid, , kind] of D.sections) {
        const L = D[sid], items = (kind === "list" || kind === "terms" || kind === "formulas") ? L.flatMap(g => g.items) : L;
        for (const it of items) {
          if (it.mock) continue;
          const c = F.find(x => x.num === it.ch), s = c && c.lesson && c.lesson.sections[it.sec];
          if (!s) out.push(`${sid}: ${it.name || it.t || it.r || it.topic}: ch ${it.ch} sec ${it.sec}`);
        }
      }
      return out;
    }, id);
    expect(bad).toEqual([]);
    // each chapter link's label is that lesson section's own heading
    const labels = await page.evaluate(id => [...document.querySelectorAll("#page .rvgo[data-rvch]")].map(b => {
      const s = window.HALCYON_DATA[id].full.find(x => x.num === +b.dataset.rvch).lesson.sections[+b.dataset.rvsec];
      return b.textContent.includes(s.h) ? "" : `${b.textContent} vs ${s.h}`;
    }).filter(Boolean), id);
    expect(labels).toEqual([]);
    // walk one link per distinct chapter and section: it opens that lesson scrolled to that section, and Back returns to the review
    const targets = await page.evaluate(() => [...new Set([...document.querySelectorAll("#page .rvgo[data-rvch]")].map(b => `${b.dataset.rvch}:${b.dataset.rvsec}`))]);
    for (const t of targets) {
      const [n, sec] = t.split(":").map(Number);
      const h = await page.evaluate(([id, n, sec]) => window.HALCYON_DATA[id].full.find(x => x.num === n).lesson.sections[sec].h, [id, n, sec]);
      await page.locator(`#page .rvgo[data-rvch="${n}"][data-rvsec="${sec}"]`).first().click();
      await expect(page).toHaveURL(new RegExp(`#${id}/full/${n}$`));
      const el = page.locator("#page section.lesson").nth(sec);
      await expect(el.locator("h2")).toHaveText(h);
      await expect(el).toBeInViewport();
      await page.locator("#rvback").click();
      await expect(page).toHaveURL(new RegExp(`#${id}/review$`));
    }
    // an item taught only in the practice exam opens the practice exam
    const mock = page.locator("#page .rvgo[data-rvmock]").first();
    await expect(mock).toBeVisible();
    await mock.click();
    await expect(page).toHaveURL(new RegExp(`#${id}/mock`));
  });

  for (const scheme of ["light", "dark"]) {
    test(`${id}: no sideways scroll at 390px, ${scheme}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`/#${id}/review`);
      const D = await bookReview(page, id);
      await expect(page.locator(`#rv-${D.sections[D.sections.length - 1].sid}`)).toBeVisible();
      expect(await noSideScroll(page)).toBe(true);
      const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor.match(/\d+/g).slice(0, 3).map(Number).reduce((a, b) => a + b, 0));
      expect(scheme === "dark" ? bg < 200 : bg > 600).toBe(true);
      const dir = process.env.REVIEW_SHOTS;
      if (dir) {
        mkdirSync(dir, { recursive: true });
        await page.screenshot({ path: join(dir, `${id}-review-390-${scheme}.png`) });
        await page.screenshot({ path: join(dir, `${id}-review-390-${scheme}-full.png`), fullPage: true });
        await page.goto(`/#${id}/home`);
        await page.locator("#rvbtn").scrollIntoViewIfNeeded();
        await page.screenshot({ path: join(dir, `${id}-home-card-390-${scheme}.png`) });
      }
    });
  }
}
