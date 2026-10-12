// QA mode smoke tests (qa.js): off by default with no chips, ?qa=1 turns on speaker chips and stays on,
// Show who's speaking alone gives chips without QA tools, the QA bar follows playback, and the Flag form posts (network mocked).
import { test, expect } from "@playwright/test";

const CH1 = "/#pmp/full/1";
const chip = (page, sel = "#page .story .said.who1") => page.locator(sel).first().evaluate(e => getComputedStyle(e, "::before").content);

async function noSideScroll(page, where) {
  await page.mouse.move(1, 1);
  const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(over, `horizontal scroll on ${where}`).toBeLessThanOrEqual(0);
}

test("QA off by default: the normal reader shows no speaker chips and no QA tools", async ({ page }) => {
  await page.goto(CH1);
  await expect(page.locator("#page .story .said[data-who]").first()).toBeAttached();
  expect(await page.evaluate(() => document.body.classList.contains("qa-on") || document.body.classList.contains("qa-who"))).toBe(false);
  const contents = await page.locator("#page .story .said[data-who]").evaluateAll(els => els.map(e => getComputedStyle(e, "::before").content));
  expect(contents.every(c => c === "none" || c === "normal")).toBe(true);
  await page.locator("#page .story p").first().click({ button: "right" });
  await expect(page.locator("#qaform")).toHaveCount(0);
  await expect(page.locator("#qabar")).toHaveCount(0);
});

test("?qa=1 shows a chip per speaker turn, is remembered, and the Guide has both switches", async ({ page }) => {
  await page.goto("/?qa=1" + CH1.slice(1));
  await expect(page.locator("#page .story .said.who1").first()).toBeAttached();
  expect(await chip(page)).toBe('"Sam"');
  // one chip per turn: a second line from the same speaker in the same paragraph gets none
  const perPara = await page.evaluate(() => [...document.querySelectorAll("#page .story p")].every(p => {
    const s = [...p.querySelectorAll(".said[data-who]")]; return s.every((x, i) => x.classList.contains("who1") === (i === 0 || s[i - 1].dataset.who !== x.dataset.who));
  }));
  expect(perPara).toBe(true);
  await noSideScroll(page, "chapter 1 with QA chips");
  await page.goto("/" + CH1.slice(1)); // no ?qa this time: still on
  await expect(page.locator("body.qa-on")).toHaveCount(1);
  await page.goto("/#guide");
  await expect(page.locator("#qatoggle")).toBeChecked();
  await expect(page.locator("#whotoggle")).not.toBeChecked();
  await page.locator("#qatoggle").uncheck();
  await expect(page.locator("body.qa-on")).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem("halcyon.qa"))).toBe("false");
});

test("Show who's speaking alone: name chips, no Flag on right click", async ({ page }) => {
  await page.goto("/#guide");
  await page.locator("#whotoggle").check();
  await page.goto("/" + CH1.slice(1));
  await expect(page.locator("#page .story .said.who1").first()).toBeAttached();
  expect(await chip(page)).toBe('"Sam"');
  await page.locator("#page .story p").first().click({ button: "right" });
  await expect(page.locator("#qaform")).toHaveCount(0);
});

test("Flag form opens on a line and posts the report with its context", async ({ page }) => {
  let sent = null;
  await page.route("**/api/qa-report", async route => { sent = route.request().postDataJSON(); await route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true,"id":7}' }); });
  await page.goto("/?qa=1" + CH1.slice(1));
  const line = page.locator("#page .story p:has(.said[data-who])").first();
  await line.click({ button: "right" });
  await expect(page.locator("#qaform .qapanel")).toBeVisible();
  await noSideScroll(page, "flag form");
  await page.locator("#qasend").click();
  await expect(page.locator("#qamsg")).toHaveText("Pick what kind of problem it is.");
  expect(sent).toBe(null);
  await page.locator("#qatype").selectOption("mispronounced");
  await page.locator("#qanote").fill("Okafor said wrong");
  await page.locator("#qatester").fill("Tester K");
  await page.locator("#qasend").click();
  await expect(page.locator("#qaform h2")).toHaveText("Sent");
  expect(sent.type).toBe("mispronounced");
  expect(sent.note).toBe("Okafor said wrong");
  expect(sent.tester).toBe("Tester K");
  expect(sent.ctx).toMatchObject({ course: "pmp", chapter: 1, speaker: "Sam", track: "study" });
  expect(sent.ctx.line).toBeGreaterThanOrEqual(0);
  expect(sent.ctx.text.length).toBeGreaterThan(0);
  expect(sent.ctx.text.length).toBeLessThanOrEqual(300);
  expect(sent).not.toHaveProperty("email");
  expect(await page.evaluate(() => localStorage.getItem("halcyon.qa.tester"))).toBe('"Tester K"');
  await page.locator("#qadone").click();
  await expect(page.locator("#qaform")).toHaveCount(0);
  // no name typed: no tester field sent
  await page.evaluate(() => localStorage.removeItem("halcyon.qa.tester"));
  await line.click({ button: "right" });
  await page.locator("#qatype").selectOption("typo");
  await page.locator("#qasend").click();
  await expect(page.locator("#qaform h2")).toHaveText("Sent");
  expect(sent).not.toHaveProperty("tester");
});

test("QA bar follows Listen playback and its Flag button captures the audio spot", async ({ page }) => {
  let sent = null;
  await page.route("**/api/qa-report", async route => { sent = route.request().postDataJSON(); await route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' }); });
  await page.goto("/?qa=1" + CH1.slice(1));
  await expect(page.locator("#narbar")).toBeVisible();
  await page.locator("#narplay").click();
  await expect(page.locator("#qabar")).toBeVisible({ timeout: 15_000 });
  await expect(page.locator("#qainfo")).toContainText("f1 open");
  await expect(page.locator("#qainfo")).toContainText("Ch 1");
  await noSideScroll(page, "QA bar");
  await page.locator("#qaflagbtn").click();
  await expect(page.locator("#qatype option").nth(2)).toHaveText("Text doesn't match audio");
  await page.locator("#qatype").selectOption("highlight_off");
  await page.locator("#qasend").click();
  await expect(page.locator("#qaform h2")).toHaveText("Sent");
  expect(sent.ctx.page).toBe("f1 open");
  expect(sent.ctx.src).toMatch(/^\/audio\/v2\/pages\/f1\/open\.mp3$/);
  expect(typeof sent.ctx.t).toBe("number");
});
