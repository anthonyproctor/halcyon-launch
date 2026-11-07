// AFOQT picture items (figs.js, 2026-11-07): Instrument Comprehension dials with four aircraft picture options, a Block Counting pile and a
// Table Reading grid draw in the chapter quiz with their readings for a screen reader; a picture option can be picked and is marked after
// checking; text options are untouched; nothing scrolls sideways at 390 px, light or dark. Chapter 1 is served from tests/fixtures/afoqt_ch01.js.
// FIG_SHOTS=<dir> also saves a screenshot of each kind at 390 px, light and dark.
import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FIXTURE = fs.readFileSync(path.join(ROOT, "tests/fixtures/afoqt_ch01.js"), "utf8");
const SHOTS = process.env.FIG_SHOTS || "";
const toQuiz = async page => {
  await page.route("**/courses/afoqt/full/ch01.js*", r => r.fulfill({ status: 200, contentType: "application/javascript", body: FIXTURE }));
  await page.goto("/#afoqt/full/1"); await page.reload();
  await page.locator("#page .chmap").getByRole("button", { name: /^Quiz/ }).click();
  await expect(page.locator("#quizform")).toBeVisible();
};
const noSideScroll = async page => expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
const items = page => page.locator("#quizform .qitem");

test("each picture kind draws with its readings in words", async ({ page }) => {
  await toQuiz(page);
  const dials = page.locator("#quizform svg.fk-dials");
  await expect(dials).toHaveCount(1);
  await expect(dials).toHaveAttribute("aria-label", "Attitude indicator: climbing 10 degrees, banked 30 degrees left. Compass: heading east, 090.");
  const planes = items(page).nth(0).locator(".qopt .qpic svg.fk-plane");
  await expect(planes).toHaveCount(4);
  const labels = await planes.evaluateAll(s => s.map(x => x.getAttribute("aria-label")));
  expect(labels.sort()).toEqual(["Aircraft climbing 10 degrees, banked 30 degrees left, heading east, 090.", "Aircraft climbing 10 degrees, banked 30 degrees left, heading west, 270.",
    "Aircraft climbing 10 degrees, banked 30 degrees right, heading east, 090.", "Aircraft diving 10 degrees, banked 30 degrees left, heading east, 090."]);
  expect(await planes.first().locator("polygon").count()).toBeGreaterThan(15); // fuselage, wings, tail and canopy faces, not an empty box
  const pile = page.locator("#quizform svg.fk-blocks");
  await expect(pile).toHaveAttribute("aria-label", "Pile A. A pile of 8 blocks, 4 on the bottom, 3 in layer 2, 1 in layer 3. Numbered blocks: 1, 2, 3, 4, 5.");
  expect((await pile.locator("text.fbnt").allTextContents()).sort()).toEqual(["1", "2", "3", "4", "5"]);
  const grid = page.locator("#quizform .xyt");
  await expect(grid).toHaveAttribute("aria-label", /X across from -10 to 10 and Y down from 10 to -10/);
  await expect(grid.locator("tbody tr")).toHaveCount(21);
  await expect(grid.locator("thead th")).toHaveCount(22);
  // the cell at X = 1 (column 12 of 21), Y = -2 (row 13 of 21) is the value figs.js gives, and the keyed answer
  const cell = await grid.locator("tbody tr").nth(12).locator("td").nth(11).textContent();
  expect(cell).toBe(String(await page.evaluate(() => window.HalcyonFigs.xyVal(7, 1, -2))));
  expect(cell).toBe("58");
  await noSideScroll(page);
});

test("a picture option can be picked, and checking marks the right picture", async ({ page }) => {
  page.on("dialog", d => d.accept());
  await toQuiz(page);
  const ic = items(page).nth(0), want = "Aircraft climbing 10 degrees, banked 30 degrees left, heading east, 090.";
  const right = ic.locator(".qopt").filter({ has: page.locator(`svg[aria-label="${want}"]`) });
  await right.click();
  await expect(right.locator("input")).toBeChecked();
  // the radio's accessible name is the picture's reading
  await expect(ic.getByRole("radio", { name: want })).toBeChecked();
  await page.locator("#quizform button[type=submit]").click();
  await expect(page.locator("#quizform .qitem").nth(0).locator(".qopt.qright svg.fk-plane")).toHaveAttribute("aria-label", want);
  await noSideScroll(page);
});

test("text options are untouched by the picture path", async ({ page }) => {
  await toQuiz(page);
  const txt = items(page).nth(3);
  await expect(txt.locator(".qpic")).toHaveCount(0);
  const html = await txt.locator(".qopt").first().innerHTML();
  expect(html).toMatch(/^<input type="radio" name="q3" value="\d"\s*><span class="k">A<\/span> Text choice (one|two|three|four|five)$/);
});

for (const scheme of ["light", "dark"]) test(`every kind fits 390 px in ${scheme} mode, in theme colors`, async ({ page }) => {
  await page.emulateMedia({ colorScheme: scheme });
  await toQuiz(page);
  await noSideScroll(page);
  const c = await page.evaluate(() => {
    const st = s => getComputedStyle(document.querySelector(s));
    return { bg: getComputedStyle(document.body).backgroundColor, sky: st(".fk-dials .fsky").fill, block: st(".fk-blocks .fbt").fill, cell: st(".xyt td").backgroundColor,
      plane: st(".fk-plane polygon:not(.fcan)").fill, w: Math.max(...[...document.querySelectorAll(".qopt .qpic")].map(x => x.getBoundingClientRect().width)) };
  });
  expect(c.bg).toBe(scheme === "dark" ? "rgb(18, 20, 23)" : "rgb(243, 241, 236)");
  expect(c.sky).toBe(scheme === "dark" ? "rgb(31, 51, 64)" : "rgb(225, 235, 240)"); // --accent-soft
  expect(c.block).toBe(scheme === "dark" ? "rgb(89, 96, 105)" : "rgb(251, 250, 247)"); // --fb1
  expect(c.plane).toMatch(/^(rgb|color)/);
  expect(c.w).toBeGreaterThan(110); expect(c.w).toBeLessThan(200); // option size
  // the grid scrolls inside its own box, the page doesn't
  const g = await page.locator(".xyt").evaluate(x => ({ sw: x.scrollWidth, cw: x.clientWidth, r: x.getBoundingClientRect().right }));
  expect(g.r).toBeLessThanOrEqual(390);
  if (SHOTS) {
    fs.mkdirSync(SHOTS, { recursive: true });
    for (const [k, sel] of [["dials", ".qfig:has(.fk-dials)"], ["plane", ".qitem:nth-of-type(1)"], ["blocks", ".qfig:has(.fk-blocks)"], ["xytable", ".qfig:has(.xyt)"]]) {
      const el = page.locator("#quizform " + sel).first(); await el.scrollIntoViewIfNeeded();
      await el.screenshot({ path: path.join(SHOTS, `${k}_390_${scheme}.png`) });
    }
    await page.locator("#quizform").screenshot({ path: path.join(SHOTS, `quiz_390_${scheme}.png`) });
  }
});
