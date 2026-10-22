// Where the QA bar sits (qa.js, 2026-10-22): it used to float on top of the player bar and cover the reading and the scene ticks.
// Now it's a "QA" pill docked top right that opens to the spot, Test profile and Flag. It must never overlap the player bar, open or closed.
import { test, expect } from "@playwright/test";

const overlap = (a, b) => !(a.x + a.width <= b.x || b.x + b.width <= a.x || a.y + a.height <= b.y || b.y + b.height <= a.y);

for (const width of [390, 1280]) test(`QA pill at ${width}px: clear of the player bar closed and open, and works from the keyboard`, async ({ page }) => {
  await page.setViewportSize({ width, height: width < 500 ? 844 : 800 });
  await page.goto("/?qa=1#pmp/full/1");
  await page.locator("#narplay").click();
  const bar = page.locator("#qabar"), pill = page.locator("#qapill"), panel = page.locator("#qapanel");
  await expect(bar).toBeVisible({ timeout: 15_000 });
  await expect(pill).toHaveAttribute("aria-expanded", "false");
  await expect(panel).toBeHidden();
  await expect(pill).toContainText(/QA\s+\d+:\d\d/);
  const nb = await page.locator("#narbar").boundingBox();
  const closed = await bar.boundingBox();
  expect(overlap(closed, nb), "closed pill vs player bar").toBe(false);
  expect(closed.y + closed.height).toBeLessThan(nb.y);
  // at the top of the page the pill sits in the band QA mode keeps clear: nothing on the page is under it
  await page.evaluate(() => scrollTo(0, 0));
  const head = await page.locator(".tophead").boundingBox();
  expect((await bar.boundingBox()).y + (await bar.boundingBox()).height).toBeLessThanOrEqual(head.y + 1);
  // open from the keyboard
  await pill.focus();
  await page.keyboard.press("Enter");
  await expect(pill).toHaveAttribute("aria-expanded", "true");
  await expect(panel).toBeVisible();
  await expect(page.locator("#qainfo")).toContainText("Ch 1");
  await expect(page.locator("#qaflagbtn")).toBeVisible();
  await expect(page.locator("#qatpbtn")).toBeVisible();
  const open = await panel.boundingBox();
  expect(overlap(open, nb), "open panel vs player bar").toBe(false);
  expect(open.x).toBeGreaterThanOrEqual(0); expect(open.x + open.width).toBeLessThanOrEqual(width);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
  // the scene ticks and the seek bar stay uncovered
  const seek = await page.locator("#narseek").boundingBox();
  expect(overlap(open, seek)).toBe(false); expect(overlap(closed, seek)).toBe(false);
  // Escape closes it and gives focus back to the pill; the choice is remembered on this device
  await page.locator("#qaflagbtn").focus();
  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
  await expect(pill).toBeFocused();
  await pill.click();
  await page.reload();
  await page.locator("#narplay").click();
  await expect(bar).toBeVisible({ timeout: 15_000 });
  await expect(pill).toHaveAttribute("aria-expanded", "true");
  await expect(panel).toBeVisible();
});
