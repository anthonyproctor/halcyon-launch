// The player diagnostics log (Guide > Troubleshooting) sits at the top of the screen. It must stay short and turn off with one tap,
// because on a phone it covers the site nav and there's no other way back to the Guide switch (Anthony, 2026-10-15).
import { test, expect } from "@playwright/test";
test("diagnostics log is short and one tap turns it off", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => localStorage.setItem("halcyon.pdbg", "true"));
  await page.goto("/#pmp/listen");
  await page.evaluate(() => window.__nar.audio.dispatchEvent(new Event("play")));
  const log = page.locator("#pdbg");
  await expect(log).toBeVisible();
  await expect(log).toContainText("Tap here to turn them off");
  const h = await log.evaluate(e => e.getBoundingClientRect().height);
  expect(h).toBeLessThanOrEqual(844 * 0.25 + 1);
  await log.click();
  await expect(log).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem("halcyon.pdbg"))).toBe("false");
  await page.evaluate(() => window.__nar.audio.dispatchEvent(new Event("play")));
  await expect(page.locator("#pdbg")).toHaveCount(0);
});
