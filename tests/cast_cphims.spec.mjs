// CPHIMS cast page (2026-10-14): every named character has a card and a portrait, cards unlock by chapter so nothing is spoiled,
// locked sections say when they open, Henry's card says only what CPHIMS shows, and the page fits a phone.
import { test, expect } from "@playwright/test";

const open = async (page, hash) => { await page.goto("/" + hash); await page.reload() };

test("cast grid: 17 cards, later characters wait for their chapter", async ({ page }) => {
  await open(page, "#cphims/cast");
  await expect(page.locator("#page h1")).toHaveText("World"); // the cast page is World's People tab; CPHIMS has no field guide, so no tab bar
  await expect(page.locator("#page [role=tab]")).toHaveCount(0);
  const cards = page.locator("#page .castcard");
  await expect(cards).toHaveCount(17);
  await expect(page.locator('#page .castcard[data-c="maria"]')).toBeEnabled();
  await expect(page.locator('#page .castcard[data-c="maria"]')).toContainText("Maria Santos");
  const henry = page.locator('#page .castcard[data-c="henry"]');
  await expect(henry).toBeDisabled();
  await expect(henry).toContainText("Appears in chapter 10");
  await expect(henry).not.toContainText("Henry");
  await expect(page.locator('#page .castcard[data-c="maria"] .av img')).toHaveAttribute("src", /courses\/cphims\/cast\/maria\.svg$/);
});

test("a character page: open sections, later ones locked, no spoilers by default", async ({ page }) => {
  await open(page, "#cphims/cast");
  await page.locator('#page .castcard[data-c="ochoa"]').click();
  await expect(page.locator("#page h1")).toHaveText("Dr. Raymond Ochoa");
  await expect(page.locator("#page section.lesson h2").first()).toHaveText("Who he is");
  await expect(page.locator("#page section.locked")).toContainText("Unlocks after chapter 12");
  await expect(page.locator("#page")).not.toContainText("retire");
});

test("spoilers on: Henry's card shows only what CPHIMS shows", async ({ page }) => {
  await open(page, "#cphims/cast");
  await page.locator("#spoil").check();
  await page.locator('#page .castcard[data-c="henry"]').click();
  await expect(page.locator("#page h1")).toHaveText("Henry Ashby");
  const t = await page.locator("#page").innerText();
  for (const w of ["Dot", "Meridian", "Nkechi", "Annex", "Lloyd", "Vellacott", "Laura", "Maisie"]) expect(t).not.toContain(w);
});

for (const scheme of ["light", "dark"]) for (const w of [390, 1280]) {
  test(`cast page fits at ${w}px, ${scheme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme }); await page.setViewportSize({ width: w, height: 900 });
    await open(page, "#cphims/cast");
    await expect(page.locator("#page .castcard")).toHaveCount(17);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.locator('#page .castcard[data-c="maria"]').click();
    await expect(page.locator("#page h1")).toHaveText("Maria Santos");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}
