// Regression tests for the 2026-10-12 QA findings: a course with no mock question bank offers no mock exam anywhere,
// the page narration picks the full clip when the only words it says that aren't on the screen are prop headers
// ("A text from Maisie"), tap targets are at least 24 by 24 (WCAG 2.2 2.5.8), and portraits and chapter art are
// requested only when the file exists (assets.js), so a normal page makes no image request that 404s.
import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { assetsJs } from "../tools/asset_manifest.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const open = async (page, hash) => { await page.goto("/" + hash); await page.reload() }; // a hash-only goto doesn't reload the app; seeded progress is read at boot

// CISA chapter n is saved at halcyon.c{50100+n}; the best path through a chapter, built the way the engine's applyPick builds it
async function seedBest(page, course, n, base, upTo) {
  await page.goto(`/#${course}/home`);
  await page.waitForFunction(([course, n]) => { const d = (window.HALCYON_DATA || {})[course]; return !!(d && d.full && d.full.find(c => c && c.num === n)) }, [course, n]);
  await page.evaluate(([course, n, base, upTo]) => {
    const c = window.HALCYON_DATA[course].full.find(c => c.num === n);
    const doms = ((window.HALCYON_DATA[course].meta || {}).DOMS) || [...new Set(c.scenes.map(sc => sc.domain))];
    const st = { pos: 0, max: 999, picks: {}, m: { trust: 50, conf: 50, health: 50 }, score: 0, flags: {}, dom: Object.fromEntries(doms.map(d => [d, [0, 0]])), drills: {}, ex: null, quiz: null };
    c.scenes.forEach((sc, i) => { if (upTo != null && i >= upTo) return; const j = sc.opts.findIndex(o => o.best), o = sc.opts[j]; st.picks[i] = j; st.score += o.s;
      for (const k in (o.d || {})) st.m[k] = Math.max(0, Math.min(100, st.m[k] + o.d[k])); st.dom[sc.domain] = st.dom[sc.domain] || [0, 0]; st.dom[sc.domain][0] += o.s; st.dom[sc.domain][1] += 3; if (o.flag) st.flags[o.flag] = true });
    localStorage.setItem("halcyon.c" + (base + n), JSON.stringify(st));
  }, [course, n, base, upTo]);
}

test.describe("a course with no mock question bank (CISA)", () => {
  test("offers no mock exam: home says coming soon with no open button, and no chapter end, plan, progress or About line offers one", async ({ page }) => {
    // force an empty bank, so this keeps testing the no-bank case after CISA gets questions
    await page.route("**/courses/cisa/meta.js", async r => { const res = await r.fetch(); r.fulfill({ response: res, body: (await res.text()) + "\n;window.HALCYON_DATA.cisa.mock=[];" }) });
    await page.goto("/#cisa/home");
    await expect(page.locator("#page h1")).toBeVisible();
    expect(await page.evaluate(() => window.HALCYON_DATA.cisa.mock.length)).toBe(0);
    // home: a clear coming soon, no button, and not the advertised "150 questions in 4 hours"
    await expect(page.locator("#mocksoon")).toContainText("Coming soon");
    await expect(page.locator("#mockbtn")).toHaveCount(0);
    await expect(page.locator("#page")).not.toContainText("150 questions in 4 hours");
    // the mock route itself: coming soon, no exam or practice start
    await page.goto("/#cisa/mock");
    await expect(page.locator("#page")).toContainText("Coming soon");
    await expect(page.locator("#exam, #practice")).toHaveCount(0);
    await expect(page.locator("#mockcard")).toBeHidden();
    // About: the practice exam line says coming soon
    await page.goto("/#cisa/about");
    await expect(page.locator("#page .facts")).toContainText("Coming soon");
    await expect(page.locator("#page .facts")).not.toContainText("150 questions");
    // the last chapter's ending: no "Take the mock exam"
    const last = await page.evaluate(() => Math.max(...window.HALCYON_DATA.cisa.full.filter(c => c && c.scenes).map(c => c.num)));
    await seedBest(page, "cisa", last, 50100);
    await open(page, `#cisa/full/${last}`);
    await page.locator("#page .sdot[title='Chapter ending']").click();
    await expect(page.locator("#replay")).toBeVisible();
    await expect(page.locator("#tomock")).toHaveCount(0);
    // progress: no readiness card (it reads a timed mock), no mock exams table, no plan line that opens a mock
    await open(page, "#cisa/progress");
    await expect(page.locator("#page h1")).toHaveText("Scoreboard");
    await expect(page.locator("#page .end-grid")).not.toContainText("Readiness");
    await expect(page.locator("#page h2", { hasText: "Mock exams" })).toHaveCount(0);
    await expect(page.locator("#page .plan")).not.toContainText("mock");
    await expect(page.locator("#page")).not.toContainText("Take a timed mock");
  });

  test("a course with a bank (PMP) still offers it", async ({ page }) => {
    await page.goto("/#pmp/home");
    await expect(page.locator("#mockbtn")).toBeVisible();
    await expect(page.locator("#mocksoon")).toHaveCount(0);
    await page.goto("/#pmp/mock");
    await expect(page.locator("#exam")).toBeVisible();
  });
});

test.describe("page narration picks the full clip", () => {
  // CISA ch1: the full "end" and "s11" clips speak prop headers ("A text from Maisie") that the page shows only in part;
  // before the fix the picker counted those as another reader's words and played end_fixed / s11_fixed.
  for (const [label, pid, upTo] of [["Chapter ending", "end", null], ["Decision 12", "s11", 11]]) {
    test(`CISA ch1 ${pid}`, async ({ page }) => {
      await seedBest(page, "cisa", 1, 50100, upTo);
      await open(page, "#cisa/full/1");
      await page.waitForSelector("#page .chmap");
      await page.locator(`#page .sdot[title^='${label}']`).click();
      await page.waitForFunction(pid => { const N = window.__nar; return N && N.page && N.page.replace(/_(alt|fixed|v\d+)$/, "") === pid && N.cands_for === N.page }, pid);
      const r = await page.evaluate(() => ({ page: window.__nar.page, cands: window.__nar.cands }));
      expect(r.page, JSON.stringify(r.cands)).toBe(pid);
    });
  }
});

// every button, link and field that's visible must be at least 24 by 24 (checkboxes and radios inside their label count as the label)
async function smallTargets(page) {
  await page.mouse.move(1, 1).catch(() => {});
  return page.evaluate(() => {
    const vis = e => { const s = getComputedStyle(e); if (s.display === "none" || s.visibility === "hidden" || +s.opacity === 0) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 };
    return [...document.querySelectorAll("button, a[href], input, select, summary, [role=button]")].filter(vis)
      .filter(e => !(e.type === "radio" || e.type === "checkbox") || !e.closest("label"))
      .filter(e => !e.closest(".story, .qwhy, .mentor p, p") || e.tagName === "BUTTON")
      .map(e => { const r = e.getBoundingClientRect(); return { e: e.tagName.toLowerCase() + (e.id ? "#" + e.id : "") + "." + String(e.className || "").trim().replace(/\s+/g, "."), w: Math.round(r.width), h: Math.round(r.height) } })
      .filter(x => x.w < 24 || x.h < 24);
  });
}

for (const width of [390, 1280]) {
  test(`tap targets are at least 24 by 24 at ${width}px: library, course home, chapter steps, audiobook, mock practice`, async ({ page }) => {
    await page.setViewportSize({ width, height: width < 500 ? 844 : 900 });
    const where = [];
    const check = async (name) => { await page.waitForTimeout(300); const s = await smallTargets(page); if (s.length) where.push(`${name}: ${JSON.stringify(s.slice(0, 6))}`) };
    await page.goto("/#library"); await page.waitForSelector("#page h1"); await check("library");
    await page.goto("/#upcoming"); await page.waitForSelector("#page h1"); await check("upcoming");
    await page.goto("/#pmp/home"); await page.waitForSelector("#page h1"); await check("pmp home");
    await page.goto("/#pmp/full/1"); await page.waitForSelector("#page .chmap"); await check("pmp ch1 open");
    await page.locator("#fnext").click(); await check("pmp ch1 lesson");
    await page.goto("/#pmp/listen"); await page.waitForSelector("#page h1"); await check("pmp audiobook");
    await page.goto("/#pmp/mock"); await page.locator("#practice").click(); await check("pmp mock practice");
    await page.goto("/#cisa/cast"); await page.waitForSelector("#page h1"); await check("cisa cast");
    expect(where, where.join("\n")).toEqual([]);
  });
}

test("assets.js lists exactly the portrait and art files on disk (run node tools/asset_manifest.mjs)", () => {
  expect(fs.readFileSync(path.join(ROOT, "assets.js"), "utf8")).toBe(assetsJs());
});

test("no portrait or chapter art request 404s on normal pages", async ({ page }) => {
  const bad = [];
  page.on("response", r => { const u = new URL(r.url()); if (/\/(cast|art)\//.test(u.pathname) && /\.(jpg|svg|png|webp)$/.test(u.pathname) && r.status() >= 400) bad.push(`${r.status()} ${u.pathname}`) });
  for (const c of ["pmp", "pilot", "cisa"]) {
    await page.goto(`/#${c}/full/1`); await page.waitForSelector("#page .chmap"); await page.waitForTimeout(400);
    await page.goto(`/#${c}/cast`); await page.waitForSelector("#page h1"); await page.waitForTimeout(600);
    await page.goto(`/#${c}/home`); await page.waitForSelector("#page h1"); await page.waitForTimeout(300);
  }
  expect(bad).toEqual([]);
});
