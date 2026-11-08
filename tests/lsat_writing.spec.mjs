// Timed Argumentative Writing (LSAT, 2026-11-08): courses/lsat/writing.js (window.HALCYON_WRITING.lsat) on its own screen, #lsat/writing.
// Pick a prompt, 15 minutes of prewriting with a notes box (Move on opens after 5, and at zero it moves on by itself), 35 minutes of
// writing with a word count (the box locks at zero), then the rubric as a self check and the worked sample. Clocks run on time stamps,
// so these tests drive them with Playwright's fake clock. Drafts save on this device only, at halcyon.lsat.writing.<prompt id>, and the
// screen still works with storage blocked. Set SHOTS=<dir> to save the screens at 390 and 1280 px, light and dark.
import { test, expect } from "@playwright/test";

const SHOTS = process.env.SHOTS;
const KEY = "halcyon.lsat.writing.parks";
const MIN = 60 * 1000;
const saved = page => page.evaluate(k => JSON.parse(localStorage.getItem(k)), KEY);

test("entry points: the course home, the practice exam picker and the exam week review all open the writing screen", async ({ page }) => {
  await page.goto("/#lsat/home"); await page.reload();
  await page.locator("#wrbtn").click();
  await expect(page).toHaveURL(/#lsat\/writing$/);
  await expect(page.locator("#page h1")).toHaveText("Argumentative Writing");
  await expect(page.locator("#page [data-wrcard]")).toHaveCount(4); // three prompts and the worked sample
  await expect(page.locator("#page .story").first()).toContainText("LSAC doesn't score the essay");
  await page.goto("/#lsat/mock"); await page.reload();
  await page.locator("#wropen").click();
  await expect(page.locator("#page h1")).toHaveText("Argumentative Writing");
  await expect(page).toHaveURL(/#lsat\/writing$/); // the address catches up a tick later
  await page.goto("/#lsat/review"); await page.reload();
  await page.locator("#rvwrite").click();
  await expect(page.locator("#page h1")).toHaveText("Argumentative Writing");
  // the worked sample: the prompt, the plan, the essay and the notes
  await page.locator('[data-wr="sample"]').click();
  await expect(page).toHaveURL(/#lsat\/writing\/sample$/);
  await expect(page.locator("#page h1")).toHaveText("Worked sample");
  const S = await page.evaluate(() => window.HALCYON_WRITING.lsat.sample);
  await expect(page.locator("#page .wrplan li")).toHaveCount(S.plan.length);
  await expect(page.locator("#page .wrsample p")).toHaveCount(S.essay.length);
  await expect(page.locator("#page")).not.toContainText(/[–—]/);
  // books without a writing file have no screen: the address falls back to the course home
  await page.goto("/#pmp/writing"); await page.reload();
  await expect(page.locator("#wrhead, [data-wrcard]")).toHaveCount(0);
});

test("the clocks: 15 minutes to plan (move on after 5, or it moves on at zero), 35 to write, then the box locks", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-11-08T18:00:00Z") });
  await page.goto("/#lsat/writing/parks"); await page.reload();
  await expect(page.locator("#page h1")).toHaveText("Timed entry at the busiest parks");
  await page.locator("#wrstart").click();
  await expect(page.locator("#wrhead")).toContainText("Prewriting");
  await expect(page.locator("#wrtime")).toHaveText("15:00");
  await expect(page.locator("#page .wrpersp")).toHaveCount(3);
  await expect(page.locator("#page .wrq2 li")).toHaveCount(4);
  await expect(page.locator("#wrnext")).toBeDisabled();
  await page.locator("#wrnotes").fill("Yes, peak months only. Hold back same day entries.");
  await page.clock.fastForward(4 * MIN);
  await expect(page.locator("#wrtime")).toHaveText("11:00");
  await expect(page.locator("#wrnext")).toBeDisabled();
  await page.clock.fastForward(MIN + 1000);
  await expect(page.locator("#wrnext")).toBeEnabled();
  await expect(page.locator("#wrnexthint")).toHaveText("You can move on whenever you're ready.");
  // nobody presses it: at zero the prewrite ends by itself
  await page.clock.fastForward(10 * MIN);
  await expect(page.locator("#wrhead")).toContainText("Writing");
  await expect(page.locator("#wrnote")).toHaveText("Fifteen minutes are up. Time to write.");
  await expect(page.locator("#wrtime")).toHaveText(/^3[45]:\d\d$/);
  await expect(page.locator("#wrnotes")).toHaveAttribute("readonly", "");
  await expect(page.locator("#wrnotes")).toHaveValue("Yes, peak months only. Hold back same day entries.");
  await expect(page.locator("#page .wrpersp")).toHaveCount(3); // the prompt stays up
  await page.locator("#wressay").fill("Timed entry is the fair choice.");
  await expect(page.locator("#wrwords")).toHaveText("6");
  await expect(page.locator("#page .wrcount")).toHaveText("6 words");
  await page.clock.fastForward(10 * MIN);
  await expect(page.locator("#wrtime")).toHaveText(/^2[45]:\d\d$/);
  await page.clock.fastForward(25 * MIN);
  await expect(page.locator("#wrhead")).toContainText("time's up");
  await expect(page.locator("#wressay")).toHaveAttribute("readonly", "");
  await expect(page.locator("#wrnote")).toHaveText("Time's up. Your essay is saved and locked.");
  expect((await saved(page)).cur).toMatchObject({ phase: "write", locked: true, essay: "Timed entry is the fair choice." });
  // the self check: the essay, each trait with a three way pick, the checklist; saved with the essay, no score
  await page.locator("#wrcheck").click();
  await expect(page.locator("#page h1")).toHaveText("Check your essay");
  const R = await page.evaluate(() => window.HALCYON_WRITING.lsat.rubric);
  await expect(page.locator("#page .wrtrait")).toHaveCount(R.traits.length);
  await expect(page.locator("#page .wrtrait").first().locator("input[type=radio]")).toHaveCount(3);
  await expect(page.locator("#page [data-chk]")).toHaveCount(R.check.length);
  await expect(page.locator("#page .wressayout")).toContainText("Timed entry is the fair choice.");
  await page.locator('input[name="wrt0"][value="strong"]').check();
  await page.locator('input[name="wrt1"][value="weak"]').check();
  await page.locator('[data-chk="0"]').check();
  await page.locator("#wrsave").click();
  await expect(page.locator("#wrsaved")).toHaveText("Saved. Your attempt is below.");
  const past = page.locator("#page details.wrpast");
  await expect(past).toHaveCount(1);
  await expect(past.locator("> summary")).toHaveText("Nov 8, 2026, 6 words");
  await expect(past).toContainText(`${R.traits[0].name}: Strong`);
  await expect(past).toContainText(`${R.traits[1].name}: Weak`);
  await expect(past).toContainText(`Self check: 1 of ${R.check.length} ticked.`);
  const v = await saved(page);
  expect(v.cur).toBeNull();
  expect(v.list[0]).toMatchObject({ words: 6, essay: "Timed entry is the fair choice.", picks: { 0: "strong", 1: "weak" }, checks: { 0: true } });
  // the picker shows the last attempt
  await page.locator("#wrall").click();
  await expect(page.locator('[data-wrcard="parks"]')).toContainText("Last attempt: Nov 8, 2026, 6 words.");
});

test("Move on opens after five minutes; the draft survives a reload, and so does the clock", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-11-08T18:00:00Z") });
  await page.goto("/#lsat/writing/parks"); await page.reload();
  await page.locator("#wrstart").click();
  await page.locator("#wrnotes").fill("plan line one");
  await page.clock.fastForward(5 * MIN + 1000);
  await page.locator("#wrnext").click();
  await expect(page.locator("#wrhead")).toContainText("Writing");
  await expect(page.locator("#wrtime")).toHaveText("35:00");
  await page.locator("#wressay").fill("First paragraph.\n\nSecond paragraph here.");
  await page.clock.fastForward(3000); // the save lands about 2 seconds after the last key
  expect((await saved(page)).cur).toMatchObject({ phase: "write", notes: "plan line one", essay: "First paragraph.\n\nSecond paragraph here." });
  await page.reload();
  await expect(page).toHaveURL(/#lsat\/writing\/parks$/);
  await expect(page.locator("#wrhead")).toContainText("Writing");
  await expect(page.locator("#wressay")).toHaveValue("First paragraph.\n\nSecond paragraph here.");
  await expect(page.locator("#wrnotes")).toHaveValue("plan line one");
  await expect(page.locator("#wrwords")).toHaveText("5");
  const left = await page.locator("#wrtime").textContent();
  expect(left).toMatch(/^3[45]:\d\d$/);
  // typed just before a reload, with no time for the save: pagehide keeps it
  await page.locator("#wressay").fill("Typed and gone.");
  await page.reload();
  await expect(page.locator("#wressay")).toHaveValue("Typed and gone.");
  // the picker says it's in progress
  await page.goto("/#lsat/writing"); await page.reload();
  await expect(page.locator('[data-wrcard="parks"]')).toContainText("In progress.");
  await expect(page.locator('[data-wr="parks"]')).toHaveText("Continue");
});

test("with storage blocked the screen still works: the clocks run and the draft holds for the visit", async ({ page }) => {
  await page.addInitScript(() => { // every localStorage call throws, as in a locked down or private browser
    const no = () => { throw new DOMException("blocked", "SecurityError") };
    Object.defineProperty(window, "localStorage", { configurable: true, get: no });
  });
  const errors = []; page.on("pageerror", e => errors.push(String(e)));
  await page.clock.install({ time: new Date("2026-11-08T18:00:00Z") });
  await page.goto("/#lsat/writing/parks");
  await expect(page.locator("#page h1")).toHaveText("Timed entry at the busiest parks");
  await page.locator("#wrstart").click();
  await page.locator("#wrnotes").fill("notes with no storage");
  await page.clock.fastForward(5 * MIN + 1000);
  await page.locator("#wrnext").click();
  await page.locator("#wressay").fill("An essay that lives in memory.");
  await page.clock.fastForward(3000);
  await expect(page.locator("#wrwords")).toHaveText("6");
  // away to the picker and back: it's still there
  await page.locator("#wrall").click();
  await expect(page.locator('[data-wrcard="parks"]')).toContainText("In progress.");
  await page.locator('[data-wr="parks"]').click();
  await expect(page.locator("#wressay")).toHaveValue("An essay that lives in memory.");
  page.on("dialog", d => d.accept());
  await page.locator("#wrdone").click();
  await expect(page.locator("#page h1")).toHaveText("Check your essay");
  await page.locator("#wrsave").click();
  await expect(page.locator("#page details.wrpast")).toHaveCount(1);
  expect(errors.filter(e => /writing|wr[A-Z]|localStorage/.test(e))).toEqual([]);
});

test("screenshots of the writing screen at 390 and 1280 px, light and dark", async ({ page }) => {
  test.skip(!SHOTS, "set SHOTS=<dir> to save them");
  page.on("dialog", d => d.accept());
  await page.clock.install({ time: new Date("2026-11-08T18:00:00Z") });
  const S = await (async () => { await page.goto("/#lsat/writing"); await page.reload(); return page.evaluate(() => window.HALCYON_WRITING.lsat.sample) })();
  for (const scheme of ["light", "dark"]) for (const w of [390, 1280]) {
    await page.setViewportSize({ width: w, height: w > 400 ? 900 : 844 });
    await page.emulateMedia({ colorScheme: scheme });
    await page.evaluate(k => localStorage.removeItem(k), KEY);
    await page.goto("/#lsat/writing"); await page.reload();
    await expect(page.locator("[data-wrcard]").first()).toBeVisible();
    await page.screenshot({ path: `${SHOTS}/writing-picker-${scheme}-${w}.png` });
    await page.locator('[data-wr="parks"]').click();
    await page.locator("#wrstart").click();
    await page.locator("#wrnotes").fill(S.plan.slice(0, 2).join("\n"));
    await page.clock.fastForward(6 * MIN + 12000);
    await page.screenshot({ path: `${SHOTS}/writing-prewrite-${scheme}-${w}.png` });
    await page.locator("#wrnext").click();
    await page.locator("#wressay").fill(S.essay.slice(0, 3).join("\n\n"));
    await page.clock.fastForward(18 * MIN + 31000);
    await page.screenshot({ path: `${SHOTS}/writing-write-${scheme}-${w}.png` });
    await page.locator("#wrdone").click();
    await page.locator('input[name="wrt0"][value="strong"]').check();
    await page.locator('input[name="wrt1"][value="mid"]').check();
    await page.locator(".wrtrait").first().scrollIntoViewIfNeeded();
    await page.screenshot({ path: `${SHOTS}/writing-check-${scheme}-${w}.png` });
    await page.locator("#wrsave").click();
  }
});
