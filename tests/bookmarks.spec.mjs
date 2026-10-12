// Bookmarks and notes (approved 2026-10-12, a light feature): a bookmark toggle on chapter pages and in the Audiobook follow-along, a
// one line note in the page, My notes (jump back, edit, review, delete with undo, export), review items in the study plan, saved per
// course at base+907 through the store (synced like other progress, kept apart in the test profile). No browser dialogs anywhere.
import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const AUDIO = JSON.parse(fs.readFileSync(path.join(ROOT, "audio/v2/audiobook.json"), "utf8")).full;
const TP = "halcyon-qa-test:";
const KEY = "c907"; // PMP's base is 0
const noDialogs = page => page.on("dialog", d => { throw new Error("a browser dialog opened: " + d.message()) });
const saved = (page, prefix = "halcyon.") => page.evaluate(k => JSON.parse(localStorage.getItem(k) || "null"), prefix + KEY);
async function open(page, route) { await page.goto("about:blank"); await page.goto(route); }
// the first decision page of a chapter, through the page's own Next buttons
async function toDecision(page, n = 1) {
  await page.goto(`/#pmp/full/${n}`);
  await expect(page.locator("#page .chmap")).toBeVisible();
  for (let i = 0; i < 6 && !(await page.locator("#page .choice, #page .outcome").count()); i++) await page.locator("#fnext").click();
  await expect(page.locator("#page .choice, #page .outcome").first()).toBeVisible();
}
// a chapter with Audiobook text for the Story only edition (the narrated chapters change as audio is recorded)
const bookChapter = () => Object.keys(AUDIO).map(Number).sort((a, b) => a - b).find(n => AUDIO[n].story && fs.existsSync(path.join(ROOT, `audio/v2/episodes/ch${String(n).padStart(2, "0")}-story.json`)));

test("decision page: bookmark with a note, My notes, jump back, edit, review in the study plan, delete and undo, export", async ({ page }) => {
  noDialogs(page);
  await toDecision(page, 1);
  const title = await page.evaluate(() => { const c = window.HALCYON_FULL.find(x => x && x.num === 1); return `Decision 1: ${c.scenes[0].title || c.scenes[0].task}` });
  // nothing shows before there's a bookmark
  await expect(page.locator("#notescard")).toBeHidden();
  await expect(page.locator("#bmbtn")).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator("#bmrow")).toBeHidden();

  await page.locator("#bmbtn").click();
  await expect(page.locator("#bmbtn")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#bmrow")).toContainText("Bookmarked.");
  await page.locator('#bmrow [data-bm="note"]').click();
  await expect(page.locator("#bmrowin")).toBeFocused();
  await expect(page.locator("#bmrowin")).toHaveAttribute("maxlength", "200");
  await page.locator("#bmrowin").fill("Ask Bea about the ledger");
  await page.keyboard.press("Enter");
  await expect(page.locator("#bmrow")).toContainText("Saved.");
  let B = await saved(page);
  expect(B.list).toHaveLength(1);
  expect(B.list[0]).toMatchObject({ id: "full:1:s0", co: "pmp", tr: "full", n: 1, p: "s0", x: title, note: "Ask Bea about the ledger" });
  expect(B.list[0].r).toBeUndefined();
  expect(typeof B.list[0].c).toBe("number");
  await expect(page.locator("#notescard")).toBeVisible();
  await expect(page.locator("#notescard")).toContainText("1 bookmark");

  // a redraw of the same page shows the note in one line
  await open(page, "/#pmp/full/1");
  await expect(page.locator("#bmbtn")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#bmrow")).toContainText("Your note: Ask Bea about the ledger");

  // My notes from the rail; jump back opens the decision
  await page.goto("/#pmp/full/2");
  await expect(page.locator("#bmbtn")).toHaveAttribute("aria-pressed", "false");
  await page.locator("#railnotes").click();
  await expect(page).toHaveURL(/#pmp\/notes$/);
  await expect(page.locator(".bmbook h2")).toContainText("The Halcyon Launch");
  await expect(page.locator(".bmch")).toHaveText(/^Chapter 1: /);
  const item = page.locator(".bmitem").first();
  await expect(item.locator('[data-bm="jump"]')).toHaveText(title);
  await expect(item.locator('[data-bm="note"]')).toHaveValue("Ask Bea about the ledger");
  await item.locator('[data-bm="jump"]').click();
  await expect(page).toHaveURL(/#pmp\/full\/1$/);
  await expect(page.locator("#page .kicker").first()).toContainText("Decision 1 of");
  await expect(page.locator("#bmbtn")).toHaveAttribute("aria-pressed", "true");

  // edit the note in place, and mark it for review
  await page.goto("/#pmp/notes");
  await page.locator('.bmitem [data-bm="note"]').fill("Ask Bea about the ledger and the stand");
  await page.locator('.bmitem [data-bm="note"]').press("Enter");
  await expect(page.locator("#bmstatus")).toHaveText("Note saved.");
  expect((await saved(page)).list[0].note).toBe("Ask Bea about the ledger and the stand");
  await page.locator('.bmitem [data-bm="rev"]').check();
  await expect(page.locator("#bmstatus")).toHaveText("Added to your study plan.");
  expect((await saved(page)).list[0].r).toBe(1);

  // the study plan shows it as a review item, after the plan's own first step, and Open goes back to the page
  await page.goto("/#pmp/progress");
  const plan = page.locator("ol.plan > li");
  await expect(plan.first()).not.toContainText("Review");
  const rev = plan.filter({ hasText: `Review ${title}.` });
  await expect(rev).toHaveCount(1);
  await expect(rev).toContainText("Your note: Ask Bea about the ledger and the stand");
  await expect(page.locator("#dashnotes")).toBeVisible();
  await expect(page.locator(".bmlink")).toContainText("1 bookmark, 1 to review");
  await rev.locator("button").click();
  await expect(page).toHaveURL(/#pmp\/full\/1$/);
  await expect(page.locator("#page .kicker").first()).toContainText("Decision 1 of");
  // the home page's next step is unchanged
  await page.goto("/#pmp/home");
  await expect(page.locator(".nextstep")).not.toContainText("Review");

  // clearing the flag drops it from the plan
  await page.goto("/#pmp/notes");
  await page.locator('.bmitem [data-bm="rev"]').uncheck();
  await expect(page.locator("#bmstatus")).toHaveText("Taken off your study plan.");
  await page.goto("/#pmp/progress");
  await expect(page.locator("ol.plan > li").filter({ hasText: "Review" })).toHaveCount(0);

  // export: Markdown and plain text both carry the note
  await page.goto("/#pmp/notes");
  for (const [btn, ext] of [["#bmexmd", "md"], ["#bmextxt", "txt"]]) {
    const [dl] = await Promise.all([page.waitForEvent("download"), page.locator(btn).click()]);
    expect(dl.suggestedFilename()).toMatch(new RegExp(`^halcyon-notes-\\d{4}-\\d{2}-\\d{2}\\.${ext}$`));
    const text = fs.readFileSync(await dl.path(), "utf8");
    expect(text).toContain("Ask Bea about the ledger and the stand");
    expect(text).toContain(title);
    expect(text).toContain("Chapter 1: ");
    if (ext === "md") { expect(text).toMatch(/^# My notes/); expect(text).toContain("## The Halcyon Launch"); expect(text).toContain("    - Note: Ask Bea about the ledger and the stand"); }
    expect(text).not.toMatch(/[–—]/);
  }

  // delete with an in-page undo, then delete for good
  await page.locator('.bmitem [data-bm="del"]').click();
  await expect(page.locator(".bmitem")).toHaveCount(0);
  await expect(page.locator("#bmundo")).toBeFocused();
  expect((await saved(page)).list).toHaveLength(0);
  await page.locator("#bmundo").click();
  await expect(page.locator(".bmitem")).toHaveCount(1);
  await expect(page.locator('.bmitem [data-bm="jump"]')).toBeFocused();
  B = await saved(page);
  expect(B.list[0]).toMatchObject({ id: "full:1:s0", note: "Ask Bea about the ledger and the stand" });
  await page.locator('.bmitem [data-bm="del"]').click();
  await expect(page.locator(".bmitem")).toHaveCount(0);
  await expect(page.locator("#bmexmd")).toBeDisabled();
  await page.goto("/#pmp/full/2");
  await expect(page.locator("#notescard")).toBeHidden();
});

test("chapter page toggle: off again removes it with an undo; Focus mode keeps the same page; Guide entry point", async ({ page }) => {
  noDialogs(page);
  await page.goto("/#guide");
  await expect(page.locator("#page")).toContainText("Bookmarks and notes");
  await expect(page.locator("#guidenotes")).toHaveCount(0);
  await toDecision(page, 1);
  await page.locator("#bmbtn").click();
  await page.locator("#bmbtn").click();
  await expect(page.locator("#bmbtn")).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator("#bmrow")).toContainText("Bookmark removed.");
  expect((await saved(page)).list).toHaveLength(0);
  await page.locator('#bmrow [data-bm="undo"]').click();
  await expect(page.locator("#bmbtn")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#bmbtn")).toBeFocused();
  expect((await saved(page)).list).toHaveLength(1);
  // undone, a bookmark with no note shows no line
  await expect(page.locator("#bmrow")).toBeHidden();
  // the lesson page, then Focus mode: the bookmark is tied to the page, not its place in the step order
  await page.locator('.sdot[data-p="1"]').click(); // the lesson
  await expect(page.locator("#page .kicker").first()).toContainText("The lesson");
  await page.locator("#bmbtn").click();
  await page.locator('#bmrow [data-bm="note"]').click();
  await page.locator("#bmrowin").fill("not saved");
  await page.keyboard.press("Escape");
  await expect(page.locator("#bmbtn")).toBeFocused();
  expect((await saved(page)).list.find(b => b.p === "lesson").note).toBeUndefined();
  await page.evaluate(() => localStorage.setItem("halcyon.storymode", "true"));
  await open(page, "/#pmp/notes");
  const order = await page.locator('.bmitem [data-bm="jump"]').allTextContents();
  expect(order[0]).toMatch(/: /); expect(order[1]).toMatch(/^Decision 1: /); // reading order: the lesson before decision 1
  await page.locator('.bmitem [data-bm="jump"]').first().click();
  await expect(page.locator("#page .kicker").first()).toContainText("The lesson");
  await page.goto("/#guide");
  await page.locator("#guidenotes").click();
  await expect(page).toHaveURL(/#pmp\/notes$/);
});

test("audiobook: bookmark the paragraph being read, then My notes plays it from that time", async ({ page }) => {
  const n = bookChapter();
  test.skip(!n, "no chapter has Audiobook text yet");
  noDialogs(page);
  await page.goto("/#pmp/listen");
  await page.locator(`.brow[data-b="${n}"]`).click();
  await expect(page.locator("#bftext .bw").first()).toBeAttached({ timeout: 15_000 });
  await page.waitForFunction(() => window.__nar.audio.duration > 0);
  await page.evaluate(() => window.__nar.audio.pause());
  // move to a paragraph a third of the way in
  const want = await page.evaluate(() => { const P = [...document.querySelectorAll("#bftext .bfp")]; const p = P[Math.floor(P.length / 3)]; return +p.dataset.t + 0.5 });
  await page.evaluate(t => new Promise(ok => { const a = window.__nar.audio; a.addEventListener("seeked", () => setTimeout(ok, 100), { once: true }); a.currentTime = t; }), want);
  await expect(page.locator("#bfbm")).toHaveAttribute("aria-pressed", "false");
  await page.locator("#bfbm").click();
  await expect(page.locator("#bfbm")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#bfbmrow")).toContainText("Bookmarked.");
  const B = await saved(page);
  expect(B.list).toHaveLength(1);
  const b = B.list[0];
  expect(b).toMatchObject({ tr: "book", n, ed: "story", co: "pmp" });
  expect(b.t).toBeCloseTo(want - 0.5, 0);
  const para = await page.locator("#bftext .bw.hl").evaluate(w => w.closest(".bfp").textContent.replace(/\s+/g, " ").trim());
  expect(para.startsWith(b.x.replace(/…$/, ""))).toBe(true);
  // the reading moving on to the next paragraph doesn't wipe the confirmation or flip the toggle while it shows
  await page.evaluate(t => new Promise(ok => { const a = window.__nar.audio; a.addEventListener("seeked", () => setTimeout(ok, 150), { once: true }); a.currentTime = t; }), await page.evaluate(() => { const P = [...document.querySelectorAll("#bftext .bfp")]; return +P[Math.floor(P.length / 3) + 2].dataset.t + 0.5 }));
  await expect(page.locator("#bfbmrow")).toContainText("Bookmarked.");
  await expect(page.locator("#bfbm")).toHaveAttribute("aria-pressed", "true");
  // a note from the audiobook row
  await page.locator('#bfbmrow [data-bm="note"]').click();
  await page.locator("#bfbmrowin").fill("Good line for the exam");
  await page.locator('#bfbmrow button[type="submit"]').click();
  expect((await saved(page)).list[0].note).toBe("Good line for the exam");

  // somewhere else, then jump back from My notes: the Audiobook plays that chapter from the saved time
  await page.evaluate(() => { const a = window.__nar.audio; a.pause(); a.currentTime = 1; });
  await page.goto("/#pmp/notes");
  await expect(page.locator(".bmitem .prog").first()).toContainText(/Audiobook, Story only, at \d+:\d\d/);
  await page.locator('.bmitem [data-bm="jump"]').click();
  await expect(page).toHaveURL(/#pmp\/listen$/);
  await page.waitForFunction(t => { const a = window.__nar.audio; return window.__nar.page === "book" && Math.abs(a.currentTime - t) < 2 && /full-ch0?\d+\.mp3|ch\d+/.test(a.src) }, b.t, { timeout: 15_000 });
  expect(await page.evaluate(() => window.__nar.book)).toEqual({ ed: "story", n });
  await page.evaluate(() => window.__nar.audio.pause());
});

test("test profile keeps its own bookmarks; the real ones are untouched and come back", async ({ page }) => {
  noDialogs(page);
  await toDecision(page, 1);
  await page.locator("#bmbtn").click();
  const real = await page.evaluate(k => localStorage.getItem(k), "halcyon." + KEY);
  expect(real).toContain("full:1:s0");

  await page.goto("/?test=1#pmp/full/1");
  await page.waitForFunction(() => window.HalcyonProfile && window.HalcyonProfile.test === true && location.hash.length > 1);
  await toDecision(page, 2);
  await expect(page.locator("#notescard")).toBeHidden(); // the test profile has none yet
  await page.locator("#bmbtn").click();
  await page.locator('#bmrow [data-bm="note"]').click();
  await page.locator("#bmrowin").fill("test profile note");
  await page.keyboard.press("Enter");
  const T = await saved(page, TP);
  expect(T.list.map(b => b.id)).toEqual(["full:2:s0"]);
  expect(await page.evaluate(k => localStorage.getItem(k), "halcyon." + KEY)).toBe(real);
  await page.goto("/#pmp/notes");
  await expect(page.locator(".bmitem")).toHaveCount(1);
  await expect(page.locator('.bmitem [data-bm="note"]')).toHaveValue("test profile note");

  await page.goto("/?test=0#pmp/notes");
  await page.waitForFunction(() => window.HalcyonProfile && window.HalcyonProfile.test === false && location.hash.length > 1);
  await page.goto("/#pmp/notes");
  await expect(page.locator(".bmitem")).toHaveCount(1);
  await expect(page.locator('.bmitem [data-bm="jump"]')).toHaveText(/^Decision 1: /);
  expect(await page.evaluate(k => localStorage.getItem(k), "halcyon." + KEY)).toBe(real);
});

test("persistence: survives a reload, syncs to /api/progress as 907, and the server copy comes back on a new device", async ({ page }) => {
  noDialogs(page);
  const calls = [], SERVER = {};
  await page.route("http://halcyon.test/**", async r => {
    const u = new URL(r.request().url());
    if (u.pathname === "/api/auth") return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ user: { name: "Reader", admin: false, cur: 201 }, progress: SERVER }) });
    if (u.pathname === "/api/progress") { const b = r.request().postDataJSON(); calls.push(b.chapter); SERVER[b.chapter] = b.state; return r.fulfill({ status: 200, contentType: "application/json", body: "{}" }) }
    if (u.pathname.startsWith("/api/")) return r.fulfill({ status: 404, body: "" });
    try { const res = await r.fetch({ url: "http://localhost:4321" + u.pathname + u.search }); await r.fulfill({ response: res }) } catch (e) {}
  });
  await page.goto("http://halcyon.test/#pmp/full/1");
  await expect(page.locator("#username")).toHaveText("Reader");
  await page.locator("#fnext").click(); await page.locator("#fnext").click();
  await page.locator("#bmbtn").click();
  await page.locator('#bmrow [data-bm="note"]').click();
  await page.locator("#bmrowin").fill("synced note");
  await page.locator('#bmrow [data-bm="rev"]').check();
  await page.keyboard.press("Enter");
  await expect.poll(() => SERVER[907] && SERVER[907].list && SERVER[907].list[0] && SERVER[907].list[0].note).toBe("synced note");
  expect(SERVER[907].list[0]).toMatchObject({ id: "full:1:s0", r: 1 });
  expect(JSON.stringify(SERVER[907]).length).toBeLessThan(1000);

  // reload: local copy and server copy agree
  await page.reload();
  await page.goto("http://halcyon.test/#pmp/notes");
  await expect(page.locator('.bmitem [data-bm="note"]')).toHaveValue("synced note");
  // a fresh device (empty storage): the server copy lands and shows
  await page.evaluate(() => localStorage.clear());
  await page.goto("about:blank");
  await page.goto("http://halcyon.test/#pmp/notes");
  await expect(page.locator(".bmitem")).toHaveCount(1);
  await expect(page.locator('.bmitem [data-bm="note"]')).toHaveValue("synced note");
  await expect(page.locator('.bmitem [data-bm="rev"]')).toBeChecked();
  // delete syncs too
  const before = calls.length;
  await page.locator('.bmitem [data-bm="del"]').click();
  await expect.poll(() => calls.length).toBeGreaterThan(before);
  expect(SERVER[907].list).toEqual([]);
});

for (const [w, h] of [[390, 844], [1280, 900]]) for (const scheme of ["light", "dark"]) {
  test(`bookmarks layout at ${w}px ${scheme}: no sideways scroll, 24px targets, 4.5:1 text, no dashes`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.emulateMedia({ colorScheme: scheme });
    const check = sel => page.evaluate(sel => {
      const lum = c => { const m = c.match(/[\d.]+/g).map(Number); const [r, g, b] = m.slice(0, 3).map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4) }); return .2126 * r + .7152 * g + .0722 * b };
      const bgOf = el => { for (let e = el; e; e = e.parentElement) { const c = getComputedStyle(e).backgroundColor; const a = c.match(/[\d.]+/g); if (a && (a.length < 4 || +a[3] > .5)) return c } return "rgb(255,255,255)" };
      const out = [];
      document.querySelectorAll(sel).forEach(el => {
        const r = el.getBoundingClientRect(); if (!r.width) return;
        const txt = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
        if (txt) { const a = lum(getComputedStyle(el).color), b = lum(bgOf(el)); const k = (Math.max(a, b) + .05) / (Math.min(a, b) + .05); if (k < 4.5) out.push(`contrast ${k.toFixed(2)} ${el.className || el.tagName}: ${el.textContent.slice(0, 40)}`) }
        const inLabel = el.matches("input[type=checkbox]") && el.closest("label.chk") && el.closest("label.chk").getBoundingClientRect().height >= 24; // the whole label is the target
        if (!inLabel && (el.matches("button, input") || el.matches("label.chk")) && (r.height < 24 || r.width < 24)) out.push(`target ${Math.round(r.width)}x${Math.round(r.height)} ${el.id || el.className || el.tagName}`);
        if (/[–—]/.test(el.textContent) || /[–—]/.test(el.getAttribute("aria-label") || "") || /[–—]/.test(el.getAttribute("placeholder") || "")) out.push(`dash in ${el.className || el.tagName}`);
      });
      if (document.documentElement.scrollWidth > document.documentElement.clientWidth) out.push("sideways scroll " + document.documentElement.scrollWidth);
      return out;
    }, sel);
    await toDecision(page, 1);
    await page.locator("#bmbtn").click();
    expect(await check(".chtools, .chtools *, #bmrow, #bmrow *")).toEqual([]);
    // the toggle sits on the Contents row, beside Where am I?, and doesn't push the chapter header down a row on desktop
    const [bm, wh] = [await page.locator("#bmbtn").boundingBox(), await page.locator("#wherebtn").boundingBox()];
    expect(Math.abs(bm.y - wh.y)).toBeLessThan(4);
    await page.locator('#bmrow [data-bm="note"]').click();
    await page.locator("#bmrowin").fill("x".repeat(200));
    expect(await check("#bmrow, #bmrow *")).toEqual([]);
    await page.keyboard.press("Enter");
    expect(await check("#bmrow, #bmrow *, #notescard, #notescard *")).toEqual([]);
    await page.goto("/#pmp/notes");
    await page.locator('.bmitem [data-bm="rev"]').check();
    expect(await check("#page *")).toEqual([]);
    await page.locator('.bmitem [data-bm="del"]').click();
    expect(await check("#bmstatus, #bmstatus *")).toEqual([]);
    await page.locator("#bmundo").click();
    await page.goto("/#pmp/progress");
    expect(await check("ol.plan, ol.plan *, .bmlink, .bmlink *")).toEqual([]);
    const n = bookChapter();
    if (n) {
      await page.goto("/#pmp/listen");
      await page.locator(`.brow[data-b="${n}"]`).click();
      await expect(page.locator("#bftext .bw").first()).toBeAttached({ timeout: 15_000 });
      await page.evaluate(() => window.__nar.audio.pause());
      await page.locator("#bfbm").click();
      expect(await check(".bfhead, .bfhead *, #bfbmrow, #bfbmrow *")).toEqual([]);
    }
  });
}

test("size cap: a record that would pass the server's limit is refused in the page, never saved half way", async ({ page }) => {
  noDialogs(page);
  await page.goto("/#pmp/home");
  // 119 bookmarks with long notes, close to the cap; the 120th note can't be saved and the page says so
  const big = { v: 1, at: 1, list: Array.from({ length: 119 }, (_, i) => ({ id: `full:1:x${i}`, co: "pmp", tr: "full", n: 1, p: "s0", x: "Decision", ct: "T", c: 1, note: '"'.repeat(200) })) };
  await page.evaluate(([k, v]) => localStorage.setItem(k, JSON.stringify(v)), ["halcyon." + KEY, big]);
  await toDecision(page, 1);
  await page.locator("#bmbtn").click();
  await expect(page.locator("#bmrow")).toContainText("as many bookmarks and notes as it can keep");
  await expect(page.locator("#bmbtn")).toHaveAttribute("aria-pressed", "false");
  const B = await saved(page);
  expect(B.list).toHaveLength(119);
  expect(JSON.stringify(B).length).toBeLessThan(60000);
});
