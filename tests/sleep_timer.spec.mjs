// Sleep timer on the player bar (engine.js sleepInit, 2026-10-22): Anthony listens at night. Off, 15, 30, 45, 60 minutes or End of chapter.
// A timed stop fades the volume over its last 10 seconds, pauses, saves the spot like any pause and puts the volume back. "End of chapter"
// stops the Audiobook from rolling into the next chapter. The tests drive window.__sleep with a timer in milliseconds, so nothing waits minutes.
import { test, expect } from "@playwright/test";

const saved = page => page.evaluate(() => JSON.parse(localStorage.getItem("halcyon.c904") || "null"));
const playing = page => page.waitForFunction(() => { const a = window.__nar.audio; return !a.paused && a.currentTime > 0.3 }, null, { timeout: 30_000 });

async function noSideScroll(page, where) {
  const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(over, `horizontal scroll on ${where}`).toBeLessThanOrEqual(0);
}

for (const width of [390, 1280]) test(`the moon button and its menu fit the player bar at ${width}px, and the menu works from the keyboard`, async ({ page }) => {
  await page.setViewportSize({ width, height: 844 });
  await page.goto("/#pmp/full/1");
  const btn = page.locator("#narsleep"), menu = page.locator("#narsleepmenu");
  await expect(btn).toBeVisible();
  await expect(btn).toHaveAttribute("aria-label", "Sleep timer, off");
  // same row as the skip buttons: it doesn't push the bar onto another line
  const [b, n] = [await btn.boundingBox(), await page.locator("#narnext").boundingBox()];
  expect(Math.abs((b.y + b.height / 2) - (n.y + n.height / 2))).toBeLessThan(4);
  expect(b.height).toBeGreaterThanOrEqual(24);
  await noSideScroll(page, "player bar");
  await btn.click();
  await expect(menu).toBeVisible();
  await expect(btn).toHaveAttribute("aria-expanded", "true");
  await expect(menu.getByRole("menuitemradio")).toHaveText(["Off", "15 minutes", "30 minutes", "45 minutes", "60 minutes", "End of chapter"]);
  await expect(menu.getByRole("menuitemradio", { name: "Off" })).toHaveAttribute("aria-checked", "true");
  await expect(menu.getByRole("menuitemradio", { name: "Off" })).toBeFocused();
  const m = await menu.boundingBox();
  expect(m.x).toBeGreaterThanOrEqual(0); expect(m.x + m.width).toBeLessThanOrEqual(width); expect(m.y).toBeGreaterThanOrEqual(0);
  await noSideScroll(page, "sleep menu");
  await page.keyboard.press("ArrowDown"); await page.keyboard.press("ArrowDown");
  await expect(menu.getByRole("menuitemradio", { name: "30 minutes" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(menu).toBeHidden();
  await expect(btn).toBeFocused();
  await expect(btn).toHaveAttribute("aria-label", "Sleep timer, 30 min left");
  await expect(page.locator("#narsleept")).toHaveText("30m");
  // Escape closes without changing it; picking Off turns it off
  await btn.click(); await page.keyboard.press("Escape");
  await expect(menu).toBeHidden(); await expect(btn).toBeFocused();
  expect(await page.evaluate(() => window.__sleep.state().mode)).toBe("30");
  await btn.click(); await menu.getByRole("menuitemradio", { name: "End of chapter" }).click();
  await expect(page.locator("#narsleept")).toHaveText("Ch end");
  await btn.click(); await menu.getByRole("menuitemradio", { name: "Off" }).click();
  await expect(page.locator("#narsleept")).toHaveText("");
  expect(await page.evaluate(() => window.__sleep.state().mode)).toBe("off");
});

test("a timed stop fades the volume, pauses, saves the spot and puts the volume back", async ({ page }) => {
  await page.goto("/#pmp/full/1");
  await page.locator("#narplay").click();
  await playing(page);
  await page.evaluate(() => { window.__nar.audio.volume = 0.8; window.__sleep.set("15", 2500, 2000) }); // 2.5 s timer, the last 2 s fade
  await expect(page.locator("#narsleept")).toHaveText(/^\ds$/);
  await expect.poll(() => page.evaluate(() => window.__sleep.state().fading), { timeout: 5_000 }).toBe(true);
  await expect.poll(() => page.evaluate(() => window.__nar.audio.volume), { timeout: 5_000 }).toBeLessThan(0.6);
  expect(await page.evaluate(() => window.__nar.audio.paused)).toBe(false);
  await expect.poll(() => page.evaluate(() => window.__nar.audio.paused), { timeout: 5_000 }).toBe(true);
  expect(await page.evaluate(() => window.__nar.audio.volume)).toBeCloseTo(0.8, 5);
  expect(await page.evaluate(() => window.__sleep.state().mode)).toBe("off");
  await expect(page.locator("#narplay")).toHaveText("▶ Listen");
  await expect(page.locator("#narsleept")).toHaveText("");
  const t = await page.evaluate(() => window.__nar.audio.currentTime);
  const L = await saved(page);
  expect(L.page.pid).toBe("open");
  expect(Math.abs(L.page.t - t)).toBeLessThan(0.6);
});

test("pausing by hand during the fade puts the volume back at once", async ({ page }) => {
  await page.goto("/#pmp/full/1");
  await page.locator("#narplay").click();
  await playing(page);
  await page.evaluate(() => window.__sleep.set("15", 4000, 3500));
  await expect.poll(() => page.evaluate(() => window.__nar.audio.volume), { timeout: 5_000 }).toBeLessThan(0.9);
  await page.locator("#narplay").click();
  await expect.poll(() => page.evaluate(() => window.__nar.audio.volume)).toBe(1);
});

test("End of chapter: the Audiobook stops when the chapter ends instead of rolling into the next one", async ({ page }) => {
  await page.goto("/#pmp/listen");
  await page.locator('.brow[data-b="1"]').click();
  await page.waitForFunction(() => { const a = window.__nar.audio; return a.duration > 60 && !a.paused && a.currentTime > 0.3 }, null, { timeout: 30_000 });
  await page.locator("#narsleep").click();
  await page.locator("#narsleepmenu").getByRole("menuitemradio", { name: "End of chapter" }).click();
  await expect(page.locator("#narsleept")).toHaveText("Ch end");
  const src = await page.evaluate(() => window.__nar.audio.src);
  await page.evaluate(() => { const a = window.__nar.audio; a.currentTime = a.duration - 1.5 });
  await expect.poll(() => page.evaluate(() => window.__nar.audio.ended || window.__nar.audio.paused), { timeout: 10_000 }).toBe(true);
  await page.waitForTimeout(1500); // the next chapter would have started by now
  expect(await page.evaluate(() => window.__nar.book.n)).toBe(1);
  expect(await page.evaluate(() => window.__nar.audio.src)).toBe(src);
  expect(await page.evaluate(() => window.__nar.audio.paused)).toBe(true);
  expect(await page.evaluate(() => window.__sleep.state().mode)).toBe("off");
  await expect(page.locator("#narsleept")).toHaveText("");
});

test("with the timer off, the Audiobook still rolls into the next chapter", async ({ page }) => {
  await page.goto("/#pmp/listen");
  await page.locator('.brow[data-b="1"]').click();
  await page.waitForFunction(() => { const a = window.__nar.audio; return a.duration > 60 && !a.paused && a.currentTime > 0.3 }, null, { timeout: 30_000 });
  await page.evaluate(() => { const a = window.__nar.audio; a.currentTime = a.duration - 1.5 });
  await expect.poll(() => page.evaluate(() => window.__nar.book.n), { timeout: 15_000 }).toBe(2);
});
