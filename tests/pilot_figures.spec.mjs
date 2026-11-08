// Image figures (engine.js type="img", 2026-11-07): Danny's Logbook items can carry a real FAA-CT-8080-2H picture, fig:"<prop type="img" ...>".
// Checked here in a chapter quiz and in a practice test item: the picture loads in a themed frame with its alt text for a screen reader, a tap
// opens it full size with Zoom in and Close, Escape hands focus back, nothing scrolls sideways at 390 px, light or dark, and the narration (engine
// propSay and tools/voices.mjs) says the alt text, never the markup. The figures are injected into the real ch4 and mock files on the way in.
// FIG_SHOTS=<dir> also saves screenshots at 390 px, light and dark.
import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { segments } from "../tools/voices.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SHOTS = process.env.FIG_SHOTS || "";
const MAN = JSON.parse(fs.readFileSync(path.join(ROOT, "courses/pilot/figs/manifest.json"), "utf8")).figures;
const fig = name => MAN.find(f => f.file.endsWith("/" + name + ".webp"));
const DA = fig("fig-density-altitude"), WC = fig("fig-wind-component"), SEC = fig("fig-sectional-20");
const inject = (file, code) => async page => page.route(`**/${file}*`, async r => {
  const body = fs.readFileSync(path.join(ROOT, file), "utf8") + "\n;" + code;
  await r.fulfill({ status: 200, contentType: "application/javascript", body });
});
const quizFigs = inject("courses/pilot/full/ch04.js", `(()=>{const F=window.HALCYON_DATA.pilot.full,c=F[F.length-1];c.quiz[0].fig=${JSON.stringify(DA.prop)};c.quiz[1].fig=${JSON.stringify(SEC.prop)}})();`);
const mockFig = inject("courses/pilot/mock.js", `window.HALCYON_DATA.pilot.mock[0].questions[0].fig=${JSON.stringify(WC.prop)};`);
const noSideScroll = async page => expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
const loaded = loc => loc.evaluate(async img => { if (!img.complete) await new Promise(ok => { img.onload = img.onerror = ok }); return img.naturalWidth });

async function toQuiz(page) {
  await quizFigs(page);
  await page.goto("/#pilot/full/4"); await page.reload();
  await page.locator("#page .chmap").getByRole("button", { name: /^Quiz/ }).click();
  await expect(page.locator("#quizform")).toBeVisible();
}
async function toMock(page) {
  await mockFig(page);
  await page.goto("/#pilot/home");
  await page.waitForFunction(() => { const d = (window.HALCYON_DATA || {}).pilot; return !!(d && d.mock && d.mock.length && d.mock[0].questions[0].fig) });
  const ids = await page.evaluate(() => window.HALCYON_DATA.pilot.mock.filter(p => !/^M\d+:/.test(p.part)).flatMap(p => p.questions.map((q, i) => p.part.slice(0, 3) + i)));
  const st = { mode: "exam", order: ids, ans: {}, flagged: {}, cur: 0, elapsed: 0, breaksTaken: [], onBreak: null, submitted: false, startedAt: "2026-11-07T15:00:00.000Z" };
  await page.evaluate(st => localStorage.setItem("halcyon.c40900", JSON.stringify(st)), st);
  await page.goto("/#pilot/mock/1"); await page.reload();
  await expect(page.locator("#page .kicker").first()).toContainText("Question 1 of");
}

test("a quiz item shows its FAA figure as a picture, with the alt text for a screen reader", async ({ page }) => {
  await toQuiz(page);
  const f = page.locator("#quizform .qfig figure.pimg");
  await expect(f).toHaveCount(4); // the 2 injected plus the 2 real FAA figure items ch4's quiz has had since 2026-11-07
  const img = f.first().locator("img");
  await expect(img).toHaveAttribute("src", DA.file);
  await expect(img).toHaveAttribute("alt", DA.alt);
  await expect(img).toHaveAttribute("aria-label", DA.alt);
  await expect(f.first().locator(".ph b")).toHaveText("Figure 8. Density Altitude Chart");
  expect(await loaded(img)).toBe(DA.width);
  // the figure sits above the first question's stem, and fills the column without spilling
  const box = await img.boundingBox();
  expect(box.width).toBeGreaterThan(280);
  expect(box.x + box.width).toBeLessThanOrEqual(390);
  await expect(f.first().getByRole("button", { name: "Figure 8. Density Altitude Chart. Open full size" })).toBeVisible();
  await noSideScroll(page);
});

test("tap to zoom: full size, Zoom in to drag around, Escape closes and focus goes back", async ({ page }) => {
  await toQuiz(page);
  const btn = page.locator("#quizform .pzoom").nth(1);
  await btn.click();
  const dlg = page.getByRole("dialog", { name: "Figure 20. Sectional Chart Excerpt" });
  await expect(dlg).toBeVisible();
  await expect(page.locator("#fzclose")).toBeFocused();
  const big = dlg.locator("img");
  await expect(big).toHaveAttribute("alt", SEC.alt);
  expect(await loaded(big)).toBe(SEC.width);
  const fit = await big.boundingBox();
  expect(fit.width).toBeLessThanOrEqual(390);
  await noSideScroll(page);
  await page.locator("#fzsize").click();
  await expect(page.locator("#fzsize")).toHaveAttribute("aria-pressed", "true");
  const zoomed = await big.boundingBox();
  expect(zoomed.width).toBe(SEC.width); // its own pixel size, several times the screen
  const sc = await page.locator("#fzbody").evaluate(b => { b.scrollLeft = 300; b.scrollTop = 300; return { x: b.scrollLeft, y: b.scrollTop, w: b.scrollWidth } });
  expect(sc.x).toBe(300); expect(sc.y).toBe(300);
  await noSideScroll(page); // the picture scrolls inside the viewer, never the page
  await page.locator("#fzsize").click();
  await expect(page.locator("#fzsize")).toHaveText("Zoom in");
  await page.locator("#fzbody img").click(); // a click on the picture used to drop focus to the page, and Escape stopped working (QA 2026-11-07)
  await page.keyboard.press("Escape");
  await expect(page.locator("#fzoom")).toHaveCount(0);
  await expect(btn).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.classList.contains("fzopen"))).toBe(false);
  // Close works too, and the quiz is untouched: no radio picked by the taps
  await btn.click(); await page.locator("#fzclose").click();
  await expect(page.locator("#fzoom")).toHaveCount(0);
  expect(await page.locator("#quizform input:checked").count()).toBe(0);
});

test("a practice test item shows its figure, zooms, and the review after checking shows it again", async ({ page }) => {
  page.on("dialog", d => d.accept());
  await toMock(page);
  const f = page.locator("#page .qfig figure.pimg");
  await expect(f).toHaveCount(1);
  await expect(f.locator("img")).toHaveAttribute("alt", WC.alt);
  expect(await loaded(f.locator("img"))).toBe(WC.width);
  await noSideScroll(page);
  await f.locator(".pzoom").click();
  await expect(page.getByRole("dialog", { name: "Figure 36. Crosswind Component Graph" })).toBeVisible();
  await noSideScroll(page);
  await page.locator("#fzclose").click();
  await expect(page.locator("#fzoom")).toHaveCount(0);
  await page.locator("#submitnow").click();
  await expect(page.locator("#page h1")).toContainText("percent");
  await page.locator("#page details summary").first().click();
  const rv = page.locator("#page details .qitem figure.pimg");
  await expect(rv).toHaveCount(1);
  await expect(rv.locator("img")).toHaveAttribute("alt", WC.alt);
  await rv.locator(".pzoom").click();
  await expect(page.getByRole("dialog", { name: "Figure 36. Crosswind Component Graph" })).toBeVisible();
  await noSideScroll(page);
});

for (const scheme of ["light", "dark"]) test(`the figure frame and the viewer follow the ${scheme} theme at 390 px`, async ({ page }) => {
  await page.emulateMedia({ colorScheme: scheme });
  await toQuiz(page);
  const c = await page.evaluate(() => ({ body: getComputedStyle(document.body).backgroundColor, frame: getComputedStyle(document.querySelector(".pzoom")).backgroundColor, dim: getComputedStyle(document.querySelector(".pzoom img")).filter }));
  expect(c.body).toBe(scheme === "dark" ? "rgb(18, 20, 23)" : "rgb(243, 241, 236)");
  expect(c.frame).toBe(scheme === "dark" ? "rgb(42, 46, 51)" : "rgb(255, 255, 255)");
  expect(c.dim).toBe(scheme === "dark" ? "brightness(0.9)" : "none");
  await noSideScroll(page);
  if (SHOTS) { fs.mkdirSync(SHOTS, { recursive: true });
    for (const k of [0, 1]) { await page.locator("#quizform .qfig").nth(k).scrollIntoViewIfNeeded(); await loaded(page.locator("#quizform .qfig img").nth(k)) }
    await page.locator("#quizform .qfig").first().scrollIntoViewIfNeeded();
    await page.locator("#quizform .qfig").first().screenshot({ path: path.join(SHOTS, `quiz-density-altitude-${scheme}.png`) });
    await page.locator("#quizform .qfig").nth(1).screenshot({ path: path.join(SHOTS, `quiz-sectional-20-${scheme}.png`) }) }
  await page.locator("#quizform .pzoom").first().click();
  const v = await page.evaluate(() => ({ bg: getComputedStyle(document.getElementById("fzoom")).backgroundColor, bar: getComputedStyle(document.querySelector(".fzbar")).backgroundColor }));
  expect(v.bg).toBe(c.body);
  expect(v.bar).toBe(scheme === "dark" ? "rgb(26, 29, 33)" : "rgb(251, 250, 247)");
  await noSideScroll(page);
  if (SHOTS) { await page.screenshot({ path: path.join(SHOTS, `zoom-density-altitude-${scheme}.png`) });
    await page.locator("#fzclose").click(); await page.locator("#quizform .pzoom").nth(1).click(); await loaded(page.locator("#fzoom img")); await page.locator("#fzsize").click();
    await page.locator("#fzbody").evaluate(b => { b.scrollLeft = 520; b.scrollTop = 700 });
    expect(await page.locator(".fzbar").evaluate(b => getComputedStyle(b).fontFamily)).toContain("Inter Tight");
    await page.screenshot({ path: path.join(SHOTS, `zoom-in-sectional-20-${scheme}.png`) }) }
});

test("narration says the alt text or the title, never markup", async ({ page }) => {
  const said = segments(`<p>Look at the chart.</p>${DA.prop}`, "narrator").map(s => s.t).join(" ");
  expect(said).toContain(DA.alt + ".");
  expect(said).not.toMatch(/<|>|webp|src=|prop/);
  expect(segments(`<prop type="img" src="courses/pilot/figs/fig-vasi.webp" title="Figure 47. VASI Illustrations"></prop>`, "narrator")[0].t).toBe("Figure 47. VASI Illustrations.");
  // in a story page (paras, propHTML) the picture carries the same words as data-say, the way every prop marks what the narration says for it
  await inject("courses/pilot/full/ch04.js", `(()=>{const F=window.HALCYON_DATA.pilot.full,c=F[F.length-1];c.opening.splice(1,0,${JSON.stringify(DA.prop)})})();`)(page);
  await page.goto("/#pilot/full/4"); await page.reload();
  const st = page.locator("#page figure.pimg[data-say]");
  await expect(st).toHaveCount(1);
  await expect(st).toHaveAttribute("data-say", DA.alt + ".");
  await expect(st.locator("img")).toHaveAttribute("alt", DA.alt);
});
