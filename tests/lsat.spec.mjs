// The Appeal (LSAT, 2026-10-15): the course loads by direct link (listed in the Library with chapter 1), quizzes have five choices A to E,
// and Reading Comprehension items share one passage that shows once above its run of questions, in the quiz and after checking.
// Chapter 1 is served from tests/fixtures/lsat_ch01.js so these tests don't depend on the real chapter's content.
import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FIXTURE = fs.readFileSync(path.join(ROOT, "tests/fixtures/lsat_ch01.js"), "utf8");
const withFixture = page => page.route("**/courses/lsat/full/ch01.js*", r => r.fulfill({ status: 200, contentType: "application/javascript", body: FIXTURE }));
const open = async (page, hash) => { await withFixture(page); await page.goto("/" + hash); await page.reload() };
const toQuiz = async page => {
  await open(page, "#lsat/full/1");
  await page.locator("#page .chmap").getByRole("button", { name: /^Quiz/ }).click();
  await expect(page.locator("#quizform")).toBeVisible();
};
const noSideScroll = async page => expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);

test("the LSAT book opens by direct link, sits on the Library shelf, and names LSAC in the footer", async ({ page }) => {
  await open(page, "#lsat/home");
  await expect(page.locator("#page")).toContainText("The Appeal");
  await expect(page.locator("#sitefoot")).toContainText("LSAC");
  await page.goto("/#library");
  await expect(page.locator('#page .libgrid [data-course="lsat"]')).toHaveCount(1);
});

test("chapter 1 loads and the quiz has five choices, A to E", async ({ page }) => {
  await toQuiz(page);
  const items = page.locator("#quizform .qitem");
  await expect(items).toHaveCount(18);
  await expect(items.first().locator(".qopt")).toHaveCount(5);
  await expect(items.first().locator(".qopt .k").last()).toHaveText("E");
});

test("a shared passage shows once above its three questions, folds on a phone, and stays for the review", async ({ page }) => {
  await toQuiz(page);
  const pass = page.locator("#quizform details.qpass");
  await expect(pass).toHaveCount(1);
  await expect(pass).toHaveAttribute("open", "");
  await expect(pass.locator("summary")).toContainText("The 2010 opinion, excerpt");
  await expect(pass).toContainText("First fixture passage paragraph");
  // it sits right before question 13, the first of its run
  const nextIsQ13 = await page.evaluate(() => { const d = document.querySelector("#quizform details.qpass"); const f = d.nextElementSibling; return f && f.querySelector(".qn").textContent.trim() });
  expect(nextIsQ13).toBe("13.");
  await pass.locator("summary").click();
  await expect(pass).not.toHaveAttribute("open", "");
  // answer every item with its key and check: all right, passage still shown
  const keys = await page.evaluate(() => { const F = window.HALCYON_DATA.lsat.full; const ch = F.find(c => JSON.stringify(c).includes("First fixture passage paragraph")) || F[0]; return ch.quiz.map(q => q.a) }); // the fixture chapter, not whichever chapter loaded first (real chapters have 20 items since 2026-10-25)
  for (let qi = 0; qi < keys.length; qi++) await page.locator(`#quizform input[name=q${qi}][value="${keys[qi]}"]`).check({ force: true });
  await page.locator("#quizform button[type=submit], #quizform input[type=submit]").first().click();
  await expect(page.locator("#quizform .qopt.qright")).toHaveCount(18);
  await expect(page.locator("#quizform details.qpass")).toHaveCount(1);
});

for (const width of [390, 1280]) for (const scheme of ["light", "dark"]) {
  test(`no sideways scroll on the LSAT quiz with a passage at ${width}px, ${scheme}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ colorScheme: scheme });
    await toQuiz(page);
    await noSideScroll(page);
    await expect(page.locator("#quizform details.qpass summary")).toBeVisible();
    const h = await page.locator("#quizform details.qpass summary").evaluate(e => e.getBoundingClientRect().height);
    expect(h).toBeGreaterThanOrEqual(24);
  });
}
