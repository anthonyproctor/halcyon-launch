// Audiobook follow-along (approved 2026-10-12): the text being read shows on the Audiobook page with the current word highlighted,
// a tap on a paragraph seeks there, and the seek bar has a tick at each scene start. Expected times are worked out here from the page
// word timings (audio/v2/pages/fN[s]/timings.json), the opening sting's length (ffprobe) and the chapter plan, the way the episode mp3
// was assembled, not read back from the index file the engine uses (audio/v2/episodes/, tools/book_text.mjs).
import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const J = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), "utf8"));
const STING = +execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path.join(ROOT, "audio/sting-open.mp3")]).toString();
const MARKS = J("audio/v2/bookmarks.json").full;
const TP = "halcyon-qa-test:";
const bare = w => String(w).replace(/^[^\p{L}\p{N}$]+|[^\p{L}\p{N}%]+$/gu, "");

// [word, start on the episode clock] for every spoken word, in order: sting, then each page with its pause (4 s after a decision, 1.2 s otherwise)
function episodeWords(plan, T) {
  const out = []; let off = STING;
  for (const p of plan) { for (const [w, a] of T[p].w) out.push([w, off + a]); off += T[p].d + (p.startsWith("s") && p !== "story" ? 4 : 1.2); }
  return out;
}
// the study edition's page order: opening, lesson, then each decision and its best outcome, then the ending (tools/pages.mjs plan)
const studyPlan = page => page.evaluate(() => { const c = window.HALCYON_FULL.find(x => x && x.num === 1);
  return ["open", ...(c.lesson ? ["lesson"] : []), ...c.scenes.flatMap((sc, i) => ["s" + i, `o${i}_${sc.opts.findIndex(o => o.best)}`]), "end"]; });

function watchErrors(page) {
  const errs = [];
  page.on("pageerror", e => errs.push(`pageerror: ${e.message}`));
  page.on("console", m => { if (m.type() === "error") errs.push(`console: ${m.text()}`) });
  return errs;
}
async function noSideScroll(page, where) {
  await page.mouse.move(1, 1);
  await page.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur());
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), `horizontal scroll on ${where}`).toBeLessThanOrEqual(0);
}
// start chapter n in the chosen edition from the Audiobook page, then pause so the clock only moves when the test moves it
async function playChapter(page, ed, n = 1) {
  await expect(page.locator(".brow").first()).toBeVisible();
  if (ed === "study") await page.locator('[data-ed="study"]').click();
  await page.locator(`.brow[data-b="${n}"]`).click();
  await expect(page.locator("#bftext .bw").first()).toBeAttached({ timeout: 15_000 });
  await page.waitForFunction(() => window.__nar.audio.duration > 0);
  await page.evaluate(() => window.__nar.audio.pause());
}
async function seek(page, t) {
  await page.evaluate(t => new Promise(ok => { const a = window.__nar.audio; a.addEventListener("seeked", () => setTimeout(ok, 50), { once: true }); a.currentTime = t; }), t);
}
const hl = page => page.evaluate(() => { const all = [...document.querySelectorAll("#bftext .bw")], h = document.querySelector("#bftext .bw.hl"); return { i: all.indexOf(h), w: h ? h.textContent : null, n: all.length }; });

test("story edition, chapter 1: the spoken text shows, and the highlight sits on the word being read", async ({ page }) => {
  const errs = watchErrors(page);
  await page.goto("/#pmp/listen");
  await playChapter(page, "story");
  const W = episodeWords(["story"], J("audio/v2/pages/f1s/timings.json"));
  const H = await hl(page);
  expect(H.n, "one shown word per spoken word").toBe(W.length);
  await expect(page.locator("#bfollow .bfhead")).toContainText("Chapter 1: Twenty Six Months");
  await expect(page.locator("#bfollow .bfhead")).toContainText("Story only");
  // the shown words are the spoken words, in order
  const shown = await page.locator("#bftext .bw").evaluateAll(e => e.map(x => x.textContent));
  expect(shown.map(bare)).toEqual(W.map(([w]) => bare(w)));
  // five words spread across the chapter: seek just after each one starts, and that exact word is highlighted
  for (const k of [3, 811, 2400, 4100, W.length - 2]) {
    await seek(page, W[k][1] + 0.04);
    const h = await hl(page);
    expect(h.i, `word ${k} "${W[k][0]}" at ${W[k][1].toFixed(2)} s`).toBe(k);
    expect(bare(h.w)).toBe(bare(W[k][0]));
  }
  // before the first word (the opening sting) nothing is highlighted
  await seek(page, 1);
  expect((await hl(page)).i).toBe(-1);
  // scene headings come from the bookmarks: Opening first, the ending last
  const heads = await page.locator("#bftext .bfh").allTextContents();
  expect(heads.length).toBe(MARKS[1].story.length);
  expect(heads[0]).toBe("Opening");
  expect(heads[heads.length - 1]).toBe("Chapter ending");
  expect(errs).toEqual([]);
});

test("study edition, chapter 1: lesson, decisions and debriefs show, and the highlight matches the clock across pages and pauses", async ({ page }) => {
  const errs = watchErrors(page);
  await page.goto("/#pmp/listen");
  await playChapter(page, "study");
  const plan = await studyPlan(page);
  const T = J("audio/v2/pages/f1/timings.json");
  const W = episodeWords(plan, T);
  await expect(page.locator("#bfollow .bfhead")).toContainText("Story + lessons");
  expect((await hl(page)).n).toBe(W.length);
  const text = await page.locator("#bftext").innerText();
  expect(text).toContain("Decision one.");
  expect(text).toContain("Your options.");
  // the first word of each page lands where the episode layout puts it (decision pages are followed by a 4 s pause)
  let base = 0;
  for (const p of plan) {
    if (["s3", "o3_0", "s7", "end", "lesson"].includes(p)) {
      const k = base + Math.min(5, T[p].w.length - 1);
      await seek(page, W[k][1] + 0.04);
      const h = await hl(page);
      expect(h.i, `${p} word ${k}`).toBe(k);
      expect(bare(h.w)).toBe(bare(W[k][0]));
    }
    base += T[p].w.length;
  }
  // inside the 4 s pause after a decision page, the last word of that page stays highlighted
  const s0end = plan.slice(0, plan.indexOf("s0") + 1).reduce((a, p) => a + T[p].w.length, 0) - 1;
  await seek(page, W[s0end + 1][1] - 1.5);
  expect((await hl(page)).i).toBe(s0end);
  expect(errs).toEqual([]);
});

test("only one word is ever highlighted, across a re-render and a tap from a paused view", async ({ page }) => {
  await page.goto("/#pmp/listen");
  await playChapter(page, "story");
  await seek(page, 600);
  await page.reload();
  await expect(page.locator("#bftext .bw.hl")).toHaveCount(1);
  await page.locator("#bftext .bfp").nth(60).click({ position: { x: 20, y: 8 } });
  await page.waitForFunction(() => window.__nar.audio.duration > 0);
  await page.evaluate(() => window.__nar.audio.pause());
  await page.waitForTimeout(300);
  await expect(page.locator("#bftext .bw.hl")).toHaveCount(1);
});

test("tapping a paragraph or a scene heading seeks the audio there", async ({ page }) => {
  const errs = watchErrors(page);
  await page.goto("/#pmp/listen");
  await playChapter(page, "story");
  const W = episodeWords(["story"], J("audio/v2/pages/f1s/timings.json"));
  for (const n of [5, 40, 90]) {
    const p = page.locator("#bftext .bfp").nth(n);
    await p.scrollIntoViewIfNeeded();
    const first = await p.evaluate(el => [...document.querySelectorAll("#bftext .bw")].indexOf(el.querySelector(".bw")));
    await p.click({ position: { x: 20, y: 8 } });
    await page.waitForTimeout(150);
    const t = await page.evaluate(() => window.__nar.audio.currentTime);
    expect(Math.abs(t - W[first][1]), `paragraph ${n} starts at word ${first}`).toBeLessThan(0.1);
    expect((await hl(page)).i).toBe(first);
  }
  const head = page.locator("#bftext .bfh").nth(3);
  await head.scrollIntoViewIfNeeded();
  await head.click();
  await page.waitForTimeout(150);
  expect(Math.abs(await page.evaluate(() => window.__nar.audio.currentTime) - MARKS[1].story[3][1])).toBeLessThan(0.1);
  expect(errs).toEqual([]);
});

test("seek bar: a tick at each scene start seeks to the bookmark, and dragging shows the time", async ({ page }) => {
  const errs = watchErrors(page);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/#pmp/listen");
  await playChapter(page, "story");
  const ticks = page.locator("#narticks .ntick");
  await expect(ticks.first()).toBeVisible();
  const n = await ticks.count();
  expect(n).toBe(MARKS[1].story.length); // wide enough for every tick
  const want = MARKS[1].story.map(([, t]) => t);
  for (const k of [0, 4, n - 1]) {
    const tick = ticks.nth(k);
    expect(+(await tick.getAttribute("data-t"))).toBe(want[k]);
    const box = await tick.boundingBox();
    expect(box.width).toBeGreaterThanOrEqual(24);
    expect(box.height).toBeGreaterThanOrEqual(24);
    await tick.click();
    await page.waitForTimeout(150);
    expect(Math.abs(await page.evaluate(() => window.__nar.audio.currentTime) - want[k])).toBeLessThan(0.1);
  }
  // each tick is drawn where its time sits on the track (thumb travel = track width minus the 16px thumb)
  const sb = await page.locator("#narseek").boundingBox(), dur0 = await page.evaluate(() => window.__nar.audio.duration);
  for (let k = 0; k < n; k++) { const b = await ticks.nth(k).boundingBox(); expect(Math.abs(b.x + b.width / 2 - (sb.x + 8 + (sb.width - 16) * want[k] / dur0)), `tick ${k} position`).toBeLessThan(2); }
  await expect(ticks.first()).toHaveAttribute("aria-label", /^Opening, 0:\d\d$/);
  await expect(ticks.last()).toHaveAttribute("aria-label", /^Chapter ending, \d+:\d\d$/);
  // drag the thumb: the bubble and the time label show where you'd land, before you let go
  const sk = await page.locator("#narseek").boundingBox();
  await page.mouse.move(sk.x + sk.width * 0.1, sk.y + sk.height / 2);
  await page.mouse.down();
  await page.mouse.move(sk.x + sk.width * 0.5, sk.y + sk.height / 2, { steps: 5 });
  await expect(page.locator("#narbubble")).toBeVisible();
  const dur = await page.evaluate(() => window.__nar.audio.duration);
  const bub = await page.locator("#narbubble").textContent();
  const [m, s] = bub.match(/^(\d+):(\d\d)/).slice(1).map(Number);
  expect(Math.abs(m * 60 + s - dur * 0.5)).toBeLessThan(dur * 0.03);
  await expect(page.locator("#narcur")).toHaveText(bub.match(/^\d+:\d\d/)[0]);
  await page.mouse.up();
  await expect(page.locator("#narbubble")).toBeHidden();
  expect(Math.abs(await page.evaluate(() => window.__nar.audio.currentTime) - dur * 0.5)).toBeLessThan(dur * 0.03);
  expect(errs).toEqual([]);
});

test("scrolling the text by hand stops the follow, and Follow the reading brings it back", async ({ page }) => {
  await page.goto("/#pmp/listen");
  await playChapter(page, "story");
  const W = episodeWords(["story"], J("audio/v2/pages/f1s/timings.json"));
  await seek(page, W[100][1] + 0.04);
  await page.evaluate(() => window.__nar.audio.play());
  await page.waitForFunction(() => document.querySelector("#bftext .bw.hl") && !window.__nar.audio.paused);
  const box = page.locator("#bftext");
  await page.waitForFunction(() => new Promise(ok => { const y = scrollY; setTimeout(() => ok(scrollY === y), 250) })); // the page has finished bringing the text into view
  await box.hover();
  await page.mouse.wheel(0, 4000);
  await page.waitForTimeout(400);
  await page.evaluate(t => { window.__nar.audio.currentTime = t }, W[3000][1] + 0.05);
  await expect(page.locator("#narfollow")).toBeVisible();
  const off = await page.evaluate(() => { const w = document.querySelector("#bftext .bw.hl"), b = document.querySelector("#bftext").getBoundingClientRect(), r = w.getBoundingClientRect(); return r.top < b.top || r.bottom > b.bottom; });
  expect(off, "the box stays where the reader scrolled it").toBe(true);
  await page.locator("#narfollow").click();
  await page.waitForFunction(() => { const w = document.querySelector("#bftext .bw.hl"), b = document.querySelector("#bftext").getBoundingClientRect(), r = w.getBoundingClientRect(); return r.top >= b.top && r.bottom <= b.bottom; });
  await expect(page.locator("#narfollow")).toBeHidden();
  await page.evaluate(() => window.__nar.audio.pause());
});

test("keep going: the next chapter's text takes over when a chapter ends", async ({ page }) => {
  await page.goto("/#pmp/listen");
  await playChapter(page, "story");
  await page.evaluate(() => { const a = window.__nar.audio; a.currentTime = a.duration - 0.5; a.play(); });
  await expect(page.locator("#bfollow .bfhead")).toContainText("Chapter 2:", { timeout: 15_000 });
  await page.waitForFunction(() => window.__nar.audio.duration > 0 && /full-ch02/.test(window.__nar.audio.src));
  await page.evaluate(() => window.__nar.audio.pause());
  const W = episodeWords(["story"], J("audio/v2/pages/f2s/timings.json"));
  expect((await hl(page)).n).toBe(W.length);
  await seek(page, W[1200][1] + 0.04);
  expect((await hl(page)).i).toBe(1200);
});

test("test profile: the follow-along works and nothing lands in the real progress", async ({ page }) => {
  const errs = watchErrors(page);
  await page.goto("/?test=1#pmp/listen");
  await expect(page.locator("#tpbadge")).toBeVisible();
  const real = () => page.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith("halcyon.") && !/^halcyon\.(amb|ambvol|rate|auto2|spoilers|pdbg|devid|qa|showwho|qa\.tester|testprofile|fold\..*|bookEd\..*)$/.test(k)).sort().map(k => [k, localStorage.getItem(k)]));
  const before = await real();
  await playChapter(page, "story");
  const W = episodeWords(["story"], J("audio/v2/pages/f1s/timings.json"));
  await seek(page, W[500][1] + 0.04);
  expect((await hl(page)).i).toBe(500);
  await page.locator("#bftext .bfp").nth(10).click({ position: { x: 20, y: 8 } });
  await page.evaluate(() => window.dispatchEvent(new Event("pagehide")));
  expect(await real()).toEqual(before);
  const LB = await page.evaluate(tp => JSON.parse(Object.entries(localStorage).find(([k, v]) => k.startsWith(tp) && /"book":\{/.test(v))?.[1] || "null"), TP);
  expect(LB && LB.book && LB.book.n).toBe(1); // the listening spot lands in the test namespace
  expect(errs).toEqual([]);
});

test("a chapter with no index shows a short note (404), a failed load (offline) says so, and the audio still plays", async ({ page }) => {
  let mode = "404";
  await page.route("**/courses/pilot/audio/episodes/ch01-story.json", r => mode === "404" ? r.fulfill({ status: 404, body: "" }) : mode === "fail" ? r.abort() : r.fallback());
  await page.goto("/#pilot/listen");
  await expect(page.locator(".brow").first()).toBeVisible();
  await page.locator('.brow[data-b="1"]').click();
  await expect(page.locator("#bfollow .bfnote")).toContainText("isn't ready yet");
  expect(await page.evaluate(() => /full-ch01/.test(window.__nar.audio.src))).toBe(true);
  await page.evaluate(() => window.__nar.audio.pause());
  // a failed request (offline) isn't remembered as "no text": the note says it couldn't load
  await page.goto("about:blank"); mode = "fail";
  await page.goto("/#pilot/listen");
  await page.locator('.brow[data-b="1"]').click();
  await expect(page.locator("#bfollow .bfnote")).toContainText("couldn't load");
  await page.evaluate(() => window.__nar.audio.pause());
});

for (const [w, h] of [[390, 844], [1280, 900]]) for (const theme of ["light", "dark"]) {
  test(`layout at ${w}px, ${theme}: no sideways scroll, 24px targets, readable contrast, no long dashes`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.emulateMedia({ colorScheme: theme });
    await page.goto("/#pmp/listen");
    await playChapter(page, "study");
    const W = episodeWords(await studyPlan(page), J("audio/v2/pages/f1/timings.json"));
    await seek(page, W[2500][1] + 0.04);
    await page.waitForTimeout(400);
    await noSideScroll(page, `audiobook follow-along ${w}px`);
    // the highlighted word is in view: inside the text box and above the player bar
    const vis = await page.evaluate(() => { const r = document.querySelector("#bftext .bw.hl").getBoundingClientRect(), b = document.querySelector("#bftext").getBoundingClientRect(), bar = document.querySelector("#narbar").getBoundingClientRect(); return r.top >= Math.max(0, b.top) && r.bottom <= Math.min(b.bottom, bar.top); });
    expect(vis).toBe(true);
    for (const sel of ["#narticks .ntick", "#bftext .bfh"]) {
      const boxes = await page.locator(sel).evaluateAll(e => e.map(x => x.getBoundingClientRect()).filter(r => r.width).map(r => [r.width, r.height]));
      expect(boxes.length).toBeGreaterThan(0);
      for (const [bw, bh] of boxes) { expect(bw).toBeGreaterThanOrEqual(24); expect(bh).toBeGreaterThanOrEqual(24); }
    }
    // ticks never crowd each other: 24px apart or more
    const xs = await page.locator("#narticks .ntick").evaluateAll(e => e.map(x => x.getBoundingClientRect().left));
    for (let i = 1; i < xs.length; i++) expect(xs[i] - xs[i - 1]).toBeGreaterThanOrEqual(24);
    // contrast: text in the panel and the highlighted word against their own backgrounds
    const ratios = await page.evaluate(() => {
      const rgb = s => s.match(/[\d.]+/g).slice(0, 3).map(Number), lum = c => { const [r, g, b] = c.map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }); return 0.2126 * r + 0.7152 * g + 0.0722 * b };
      const bg = el => { for (let e = el; e; e = e.parentElement) { const c = getComputedStyle(e).backgroundColor; if (!/rgba\(.*, 0\)$/.test(c) && c !== "transparent") return c } return "rgb(255,255,255)" };
      const ratio = el => { const a = lum(rgb(getComputedStyle(el).color)), b = lum(rgb(bg(el))); return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) };
      return ["#bftext .bw.hl", "#bftext .bfp", "#bftext .bfh", "#bfollow .bfhead b", "#bfollow .bfhead .prog", "#narcur"].map(s => [s, ratio(document.querySelector(s))]);
    });
    for (const [s, r] of ratios) expect(r, `${s} contrast`).toBeGreaterThanOrEqual(4.5);
    const ui = await page.evaluate(() => [document.querySelector("#bfollow .bfhead").textContent, ...[...document.querySelectorAll("#narticks .ntick, #bftext .bfh")].map(e => (e.getAttribute("aria-label") || "") + (e.getAttribute("data-tip") || "") + e.textContent)].join(" "));
    expect(ui).not.toMatch(/[–—]/);
    await page.screenshot({ path: `test-results/book-follow-${w}-${theme}.png` });
  });
}
