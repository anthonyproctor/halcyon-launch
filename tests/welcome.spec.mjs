// The invite-only landing page (/welcome, 2026-10-14): headline, how it works, one card per live book with a first-page clip,
// and the invite request posting to the existing /api/subscribe with source welcome:<book>. Tests never reach production:
// the audio host and the endpoint are stubbed.
import { test, expect } from "@playwright/test";

const BOOKS = ["pmp", "cphims", "cisa", "pilot"];

async function stubAudio(page) {
  await page.route("https://audio.strakesystems.com/**", r => r.fulfill({ status: 204, body: "" }));
}

test("renders the headline, the five books (four with clips, The Appeal with chapter one only), the not affiliated line, and no endorsement words", async ({ page }) => {
  const errs = []; page.on("pageerror", e => errs.push(String(e)));
  await stubAudio(page);
  await page.goto("/welcome");
  await expect(page.locator("h1")).toContainText("listening to a story");
  await expect(page.locator(".book")).toHaveCount(5);
  await expect(page.locator(".book[data-book=lsat] .play")).toHaveCount(0); // new book: text first, audiobook next
  await expect(page.locator(".book[data-book=lsat] .meta")).toContainText("1 of 12 chapters out");
  for (const id of BOOKS) {
    const card = page.locator(`.book[data-book="${id}"]`);
    await expect(card.locator("h3")).not.toHaveText("");
    await expect(card.locator(".play")).toBeVisible();
    await expect(card.locator(".meta")).toContainText("chapters out");
  }
  await expect(page.locator(".book[data-book=pmp] h3")).toHaveText("The Halcyon Launch");
  await expect(page.locator(".book[data-book=pmp] .meta")).toHaveText("All 15 chapters out");
  await expect(page.locator("footer")).toContainText("aren't affiliated with or endorsed by PMI, HIMSS, ISACA, LSAC, or the FAA");
  const text = await page.locator("body").innerText();
  expect(text).not.toMatch(/\bapproved\b|guarantee|PDU|official/i);
  expect(await page.locator('meta[name="robots"]').getAttribute("content")).toContain("noindex");
  expect(errs).toEqual([]);
});

test("a clip plays from the book's first page and only one plays at a time", async ({ page }) => {
  await stubAudio(page);
  await page.goto("/welcome");
  await page.evaluate(() => { HTMLMediaElement.prototype.play = function () { this.dispatchEvent(new Event("play")); return Promise.resolve(); }; });
  await page.locator(".book[data-book=cisa] .play").click();
  const src = await page.locator("#clipaudio").getAttribute("src");
  expect(src).toContain("courses/cisa/audio/pages/f1/open.");
  await expect(page.locator(".book[data-book=cisa] .play")).toHaveAttribute("aria-pressed", "true");
  await page.locator(".book[data-book=pilot] .play").click();
  await expect(page.locator(".book[data-book=cisa] .play")).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator(".book[data-book=pilot] .play")).toHaveAttribute("aria-pressed", "true");
  expect(await page.locator("#clipaudio").getAttribute("src")).toContain("courses/pilot/audio/pages/f1/open.");
});

test("the invite form checks the email, posts welcome:<book> to /api/subscribe, and confirms", async ({ page }) => {
  await stubAudio(page);
  let posted = null;
  await page.route("**/api/subscribe", async r => { posted = JSON.parse(r.request().postData()); await r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) }); });
  await page.goto("/welcome");
  await page.locator("#email").fill("nope");
  await page.locator("#send").click();
  await expect(page.locator("#msg")).toContainText("doesn't look right");
  expect(posted).toBeNull();
  await page.locator("#email").fill("reader@example.com");
  await page.locator("#book").selectOption("cisa");
  await page.locator("#send").click();
  await expect(page.locator("#msg")).toContainText("You're on the list");
  expect(posted).toEqual({ email: "reader@example.com", source: "welcome:cisa" });
  await page.unroute("**/api/subscribe");
  await page.route("**/api/subscribe", r => r.fulfill({ status: 429, contentType: "application/json", body: JSON.stringify({ error: "Too many tries from here. Try again in an hour." }) }));
  await page.locator("#email").fill("reader@example.com");
  await page.locator("#send").click();
  await expect(page.locator("#msg")).toContainText("Too many tries");
});

for (const width of [390, 1280]) for (const scheme of ["light", "dark"]) {
  test(`no sideways scroll and 24px tap targets at ${width}px, ${scheme}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ colorScheme: scheme });
    await stubAudio(page);
    await page.goto("/welcome");
    const sw = await page.evaluate(() => document.documentElement.scrollWidth), cw = await page.evaluate(() => document.documentElement.clientWidth);
    expect(sw).toBeLessThanOrEqual(cw);
    const small = await page.evaluate(() => [...document.querySelectorAll("a,button,input,select")].filter(e => { const r = e.getBoundingClientRect(); return r.width && r.height && r.height < 24; }).map(e => e.outerHTML.slice(0, 60)));
    expect(small).toEqual([]);
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bg).toBe(scheme === "dark" ? "rgb(18, 20, 23)" : "rgb(243, 241, 236)");
  });
}
