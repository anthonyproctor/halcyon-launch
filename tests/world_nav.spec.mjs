// Nav (2026-10-17): one World button holds the cast (People tab) and, for books with a field guide, the field guide (Places and things tab).
// Help replaces the Guide label. Old routes (#<book>/cast, #<book>/guide, #<book>/guide/<id>) still land on the right tab.
import { test, expect } from "@playwright/test";

async function open(page, route) { await page.goto("about:blank"); await page.goto(route); await page.waitForSelector("#page h1") }
const noSideScroll = page => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
const tab = (page, name) => page.getByRole("tab", { name });

test("the nav has World and Help, and no Cast or Field guide buttons", async ({ page }) => {
  await open(page, "/#pmp/home");
  await expect(page.locator("#worldlink")).toHaveText("World");
  await expect(page.locator("#guidelink")).toHaveText("Help");
  await expect(page.locator("#castlink, #fguidelink")).toHaveCount(0);
  const labels = await page.locator(".topnav .navl .navbtn:visible").allTextContents();
  expect(labels).not.toContain("Cast");
  expect(labels).not.toContain("Field guide");
  expect(labels).not.toContain("Guide");
});

test("World opens People, and on PMP the Places and things tab shows the guide", async ({ page }) => {
  await open(page, "/#pmp/home");
  await page.locator("#worldlink").click();
  await expect(page).toHaveURL(/#pmp\/cast$/);
  await expect(page.locator("#page h1")).toHaveText("World");
  await expect(page.locator("#worldlink")).toHaveClass(/\bon\b/);
  await expect(tab(page, "People")).toHaveAttribute("aria-selected", "true");
  await expect(tab(page, "Places and things")).toHaveAttribute("aria-selected", "false");
  await expect(page.locator("#wpanel .castcard").first()).toBeVisible();
  await tab(page, "Places and things").click();
  await expect(page).toHaveURL(/#pmp\/guide$/);
  await expect(tab(page, "Places and things")).toHaveAttribute("aria-selected", "true");
  await expect(tab(page, "Places and things")).toBeFocused();
  await expect(page.locator("#wpanel #fggrid .fgcard").first()).toBeVisible();
  await expect(page.locator("#worldlink")).toHaveClass(/\bon\b/);
  // keyboard: arrow keys move between the tabs
  await page.keyboard.press("ArrowLeft");
  await expect(page).toHaveURL(/#pmp\/cast$/);
  await expect(tab(page, "People")).toBeFocused();
  await expect(tab(page, "People")).toHaveAttribute("aria-selected", "true");
  // each tab is at least 24px tall
  for (const n of ["People", "Places and things"]) expect((await tab(page, n).boundingBox()).height).toBeGreaterThanOrEqual(24);
});

test("on CISA World is just People, with no Places and things tab", async ({ page }) => {
  await open(page, "/#cisa/home");
  await page.locator("#worldlink").click();
  await expect(page).toHaveURL(/#cisa\/cast$/);
  await expect(page.locator("#page h1")).toHaveText("World");
  await expect(page.locator("#page .castcard").first()).toBeVisible();
  await expect(page.getByRole("tab")).toHaveCount(0);
  await expect(page.locator("#page")).not.toContainText("Places and things");
  // an old guide link on a book without one falls back to People
  await open(page, "/#cisa/guide");
  await expect(page.locator("#page .castcard").first()).toBeVisible();
  await expect(page.locator("#worldlink")).toHaveClass(/\bon\b/);
});

test("#pmp/guide/breather deep-links to the Places and things entry", async ({ page }) => {
  await open(page, "/#pmp/guide/breather");
  const title = await page.evaluate(() => window.HALCYON_GUIDE.pmp.find(e => e.id === "breather").title);
  await expect(page.locator("#page h1")).toHaveText(title);
  await expect(page.locator("#fgback")).toHaveText("Places and things");
  await expect(page.locator("#worldlink")).toHaveClass(/\bon\b/);
  await page.locator("#fgback").click();
  await expect(page).toHaveURL(/#pmp\/guide$/);
  await expect(tab(page, "Places and things")).toHaveAttribute("aria-selected", "true");
});

test("the Help button opens the help page", async ({ page }) => {
  await open(page, "/#pmp/home");
  await page.locator("#guidelink").click();
  await expect(page).toHaveURL(/#guide$/);
  await expect(page.locator("#page h1")).toHaveText("How to use it");
  await expect(page.locator("#page .kicker")).toHaveText("Help");
  await expect(page.locator("#guidelink")).toHaveClass(/\bon\b/);
});

for (const scheme of ["light", "dark"]) {
  test(`no sideways scroll at 390px on World and Help, ${scheme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await page.setViewportSize({ width: 390, height: 844 });
    for (const r of ["/#pmp/home", "/#pmp/cast", "/#pmp/guide", "/#pmp/guide/breather", "/#cisa/cast", "/#guide"]) {
      await open(page, r);
      expect(await noSideScroll(page), r).toBe(true);
    }
  });
}
