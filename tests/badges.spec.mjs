// Badges and readiness (Phase 1, 2026-10-13). The Progress page's readiness card (with its footnote) replaces the old Readiness card,
// and the shelf shows earned, locked and hidden badges, never a pending one. A device's first check is a silent backfill; a badge earned
// after that toasts once, and the toast waits out a timed practice exam and Focus mode. A redo counts against the clean run and keeps the
// chapter's completion date. Online, the badges record syncs, and another device's badges merge in as a union.
// Made-up progress only. The browser is muted (playwright.config.mjs).
import { test, expect } from "@playwright/test";

const HOST = "http://halcyon.test", LOCAL = "http://localhost:4321";
const noDialogs = page => page.on("dialog", d => { throw new Error("a browser dialog opened: " + d.message()) });
const rec = (page, key = "halcyon.c908") => page.evaluate(k => JSON.parse(localStorage.getItem(k) || "null"), key);
// chapter n of the open book, every decision answered with the best option (or the option given in alt), pos and max at the end or at 1
async function chapterState(page, n, { done = true, alt = {}, doneAt, rd } = {}) {
  return page.evaluate(([n, done, alt, doneAt, rd]) => {
    const c = window.HALCYON_FULL.find(x => x.num === n), picks = {};
    c.scenes.forEach((sc, i) => { picks[i] = alt[i] ?? sc.opts.findIndex(o => o.best) });
    const st = { pos: done ? 999 : 1, max: done ? 999 : 1, picks, m: { trust: 50, conf: 50, health: 50 }, score: 0, flags: {}, dom: { People: [0, 0], Process: [0, 0], "Business Environment": [0, 0] }, drills: {}, ex: null, quiz: null };
    if (doneAt) st.doneAt = doneAt; if (rd != null) st.rd = rd;
    return st;
  }, [n, done, alt, doneAt, rd]);
}
async function seed(page, kv) { await page.evaluate(kv => { for (const [k, v] of Object.entries(kv)) localStorage.setItem("halcyon." + k, JSON.stringify(v)) }, kv) }
async function noSideScroll(page, where) {
  const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(over, `horizontal scroll on ${where}`).toBeLessThanOrEqual(0);
}

test("Progress page: the readiness card and its footnote, the shelf with earned, locked and hidden patches, and a silent backfill", async ({ page }) => {
  noDialogs(page);
  await page.goto("/#guide");
  await expect(page.locator("#page h1")).toBeVisible();
  // chapters 1 to 3 finished with the best call every time, before badges existed on this device (no badges record)
  await seed(page, { c201: await chapterState(page, 1), c202: await chapterState(page, 2), c203: await chapterState(page, 3) });
  await page.goto("/#pmp/progress");
  await page.reload();
  const card = page.locator("#readycard");
  await expect(card).toBeVisible();
  await expect(card.locator("h2")).toHaveText("Launch poll");
  await expect(card).toContainText("Target 75. At 75, you're go.");
  await expect(card.locator(".rdfoot")).toHaveText("A study meter built from your own answers in this course. It doesn't predict your exam score.");
  await expect(card).not.toContainText(/endorse|approved|accredited|official/i);
  await expect(page.locator("#page .end-grid .card h3", { hasText: /^Readiness$/ })).toHaveCount(0); // the old card is gone
  // 36 decisions answered, no timed exam: a number, capped at 80 until a timed practice exam
  const v = +(await page.locator("#rdval").textContent());
  expect(v).toBeGreaterThan(0); expect(v).toBeLessThanOrEqual(80);
  await expect(card.locator(".rdhow")).toContainText("tops out at 80");

  const shelf = page.locator("#shelf");
  await expect(shelf.locator("h2")).toHaveText("Mission patches 5 of 25");
  await expect(shelf.locator(".bdg.got")).toHaveCount(5); // chapters 1 to 3, That's a Go, and the hidden manifest patch from chapter 1
  for (const id of ["pmp-ch01", "pmp-ch02", "pmp-ch03", "pmp-clean-run", "pmp-manifest"]) await expect(shelf.locator(`.bdg.got[data-badge="${id}"]`), id).toHaveCount(1);
  await expect(shelf.locator('.bdg.got[data-badge="pmp-clean-run"] .bdate')).toContainText("3 chapters");
  await expect(shelf.locator('.bdg.got[data-badge="pmp-manifest"] .bname')).toHaveText("OKAFOR, ADA N.");
  await expect(shelf.locator(".bdg.locked")).toHaveCount(17);
  await expect(shelf.locator('.bdg.locked[data-badge="pmp-ch04"] .bname')).toHaveText("Chapter 4"); // a locked chapter patch: frame and number only
  await expect(shelf.locator('.bdg.locked[data-badge="pmp-ch04"] .bdgart')).toContainText("4");
  await expect(shelf.locator('.bdg.locked[data-badge="pmp-ready"] .bline')).toHaveText("Get your launch poll to 75.");
  await expect(shelf.locator(".bdg.hidden")).toHaveCount(3);
  await expect(shelf.locator(".bdg.hidden").first()).toContainText("Hidden");
  await expect(shelf).not.toContainText("Handline"); // an unearned hidden patch never shows its name

  // backfill: everything earned so far is in the record as back:1, and none of it toasts
  const R = await rec(page);
  expect(Object.keys(R.got).sort()).toEqual(["pmp-ch01", "pmp-ch02", "pmp-ch03", "pmp-clean-run", "pmp-manifest"]);
  for (const g of Object.values(R.got)) expect(g.back).toBe(1);
  expect(R.got["pmp-clean-run"].ch).toEqual([1, 2, 3]);
  expect(R.snap.ch).toEqual([3, 15]);
  expect(R.snap.ready).toBe(v);
  await page.waitForTimeout(800);
  await expect(page.locator("#toast .tcard")).toHaveCount(0);

  const text = await page.locator("#readycard, #shelf").allTextContents();
  expect(text.join(" ")).not.toMatch(/[–—]|\s-\s/);
  await noSideScroll(page, "Progress at 390px");
  for (const sel of ["#readycard", "#shelf"]) { const bb = await page.locator(sel).boundingBox(); expect(bb.width, sel).toBeLessThanOrEqual(390) }

  // a book with pending hidden badges never shows them: CISA's two written hidden stamps show as blanks, the two pending ones don't exist
  await page.goto("/#cisa/progress");
  await expect(page.locator("#shelf h2")).toContainText("Case file stamps");
  await expect(page.locator("#shelf h2")).toContainText("of 20");
  await expect(page.locator("#shelf .bdg.hidden")).toHaveCount(2);
  await expect(page.locator('[data-badge="cisa-on-her-knee"], [data-badge="cisa-passed"]')).toHaveCount(0);
  await expect(page.locator("#shelf")).not.toContainText(/On Her Knee|Passed/);
  await expect(page.locator("#readycard h2")).toHaveText("Ready to sign");
  await noSideScroll(page, "CISA Progress at 390px");
});

test("a badge earned after the backfill toasts once; the toast waits out Focus mode and a timed practice exam", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-10-13T09:00:00") });
  await page.goto("/#guide");
  await expect(page.locator("#page h1")).toBeVisible();
  // a badges record already here (an empty one), chapter 1's decisions all answered with the best call, the chapter not finished, Focus mode on
  await seed(page, { c908: { v: 1, since: 1, at: 1, got: {} }, c201: await chapterState(page, 1, { done: false }), storymode: true });
  await page.goto("/#pmp/full/1");
  await page.reload();
  await expect(page.locator("#page .chmap")).toBeVisible();
  await page.clock.runFor(1000);
  // the hidden manifest patch is earned now (chapter 1, 212 names, option 1), but Focus mode holds its toast
  await expect.poll(async () => Object.keys((await rec(page)).got)).toContain("pmp-manifest");
  await expect(page.locator("#toast .tcard")).toHaveCount(0);
  // finish the chapter: the chapter patch and the clean run, still held
  await page.locator("#page .sdot").last().click();
  await page.clock.runFor(1000);
  await expect.poll(async () => Object.keys((await rec(page)).got).sort()).toEqual(["pmp-ch01", "pmp-clean-run", "pmp-manifest"]);
  await expect(page.locator("#toast .tcard")).toHaveCount(0);
  for (const g of Object.values((await rec(page)).got)) expect(g.seen).toBeUndefined();

  // the practice exam's intro screen holds them (anywhere in the mock flow until it's submitted or left)
  page.on("dialog", d => d.accept());
  await page.goto("/#pmp/mock");
  await expect(page.locator("#exam")).toBeVisible();
  await page.clock.runFor(2000);
  await expect(page.locator("#toast .tcard")).toHaveCount(0);
  // and a running timed exam: one already in progress, so the page opens straight into it
  await seed(page, { c900: await page.evaluate(() => { const ids = []; window.HALCYON_MOCK.forEach(p => p.questions.forEach((q, i) => ids.push(p.part.slice(0, 3) + i)));
    return { mode: "exam", form: 1, order: ids.slice(0, 20), ans: {}, flagged: {}, cur: 0, elapsed: 0, breaksTaken: [], onBreak: null, submitted: false, startedAt: "2026-10-13T08:00:00.000Z" } }) });
  await page.reload();
  await expect(page.locator("#mocktime")).toBeVisible();
  await page.clock.runFor(2000);
  await expect(page.locator("#toast .tcard")).toHaveCount(0);
  await page.locator("#submitnow").click();
  // the results page: the toasts come out, one at a time, oldest first
  await page.clock.runFor(500);
  const t = page.locator("#toast .tcard");
  await expect(t).toHaveCount(1);
  await expect(t).toContainText("Hidden patch found");
  await expect(t).toContainText("OKAFOR, ADA N.");
  await expect(page.locator("#toast")).toHaveAttribute("role", "status");
  expect(await page.locator("#toast").evaluate(e => getComputedStyle(e).pointerEvents)).toBe("none"); // never in the way of a tap
  expect((await rec(page)).got["pmp-manifest"].seen).toBe(1);
  expect(await t.textContent()).not.toMatch(/[–—]/);
  const box = await t.boundingBox();
  expect(box.x).toBeGreaterThanOrEqual(0); expect(box.x + box.width).toBeLessThanOrEqual(390);
  await page.clock.runFor(6500);
  await expect(t).toHaveCount(1);
  await expect(t).toContainText("New patch");
  await page.clock.runFor(6500);
  await page.clock.runFor(6500);
  await expect(t).toHaveCount(0);
  const got = (await rec(page)).got;
  for (const id of ["pmp-ch01", "pmp-clean-run", "pmp-manifest"]) expect(got[id].seen, id).toBe(1);
  // a reload shows nothing again
  await page.reload();
  await page.clock.runFor(2000);
  await expect(page.locator("#toast .tcard")).toHaveCount(0);
});

test("a redo counts against the clean run and keeps the chapter's completion date", async ({ page }) => {
  noDialogs(page);
  await page.goto("/#guide");
  await expect(page.locator("#page h1")).toBeVisible();
  const doneAt = "2026-10-01T15:00:00.000Z";
  // chapter 1 finished, with a partial call on decision 1, so it isn't a clean run yet
  const other = await page.evaluate(() => window.HALCYON_FULL.find(c => c.num === 1).scenes[0].opts.findIndex(o => !o.best));
  await seed(page, { c908: { v: 1, since: 1, at: 1, got: {} }, c201: await chapterState(page, 1, { doneAt, alt: { 0: other } }) });
  await page.goto("/#pmp/full/1");
  await page.reload();
  await expect(page.locator("#page .chmap")).toBeVisible();
  // decision 1 (step 2: opening, lesson, decision 1), redo it, and make the same best call again
  await page.locator('#page .sdot[data-p="2"]').click();
  await page.locator("#redo").click();
  await page.locator("#page .choice:not([disabled])").first().waitFor();
  const best = await page.evaluate(() => window.HALCYON_FULL.find(c => c.num === 1).scenes[0].opts.findIndex(o => o.best));
  await page.locator(`#page .choice[data-j="${best}"]`).click();
  await expect(page.locator("#page .outcome")).toBeVisible();
  const st = await rec(page, "halcyon.c201");
  expect(st.rd).toBe(1);
  expect(st.doneAt).toBe(doneAt);
  await expect.poll(async () => Object.keys((await rec(page)).got).sort()).toEqual(["pmp-ch01", "pmp-manifest"]); // no clean run: a redo was used
  // the certificate's chapter list still has the date (it reads doneAt)
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("halcyon.c201")).doneAt)).toBe(doneAt);
});

test("online: the badges record syncs, and another device's badges merge in as a union", async ({ page }) => {
  noDialogs(page);
  const puts = [];
  const SERVER = {
    // another device already earned chapter 5's patch and saw its toast
    908: { v: 1, since: 1000, at: 2000, got: { "pmp-ch05": { at: 2000, seen: 1 } } },
  };
  await page.route(HOST + "/**", async r => {
    const u = new URL(r.request().url());
    if (u.pathname === "/api/auth") return r.fulfill({ json: { user: { name: "Test Reader", admin: false, tester: false, cur: 201 }, progress: SERVER } });
    if (u.pathname === "/api/progress") { const b = r.request().postDataJSON(); puts.push(b); SERVER[b.chapter] = b.state; return r.fulfill({ json: { ok: true } }) }
    if (u.pathname.startsWith("/api/") || u.pathname.startsWith("/_vercel/")) return r.fulfill({ status: 404, body: "" });
    try { await r.fulfill({ response: await r.fetch({ url: LOCAL + u.pathname + u.search }) }) } catch (e) {}
  });
  // this device: chapter 1 finished (from the server too, so it survives the sign in)
  await page.goto(LOCAL + "/#guide");
  SERVER[201] = await chapterState(page, 1);
  await page.goto(HOST + "/#pmp/progress");
  await expect(page.locator("#username")).toHaveText("Test Reader");
  // the server's record came down; chapter 1's patches are new on top of it, written back up as one record
  await expect.poll(() => puts.filter(p => p.chapter === 908).length).toBeGreaterThan(0);
  const up = puts.filter(p => p.chapter === 908).pop().state;
  expect(Object.keys(up.got).sort()).toEqual(["pmp-ch01", "pmp-ch05", "pmp-clean-run", "pmp-manifest"]);
  expect(up.got["pmp-ch05"]).toEqual({ at: 2000, seen: 1 });
  expect(up.got["pmp-ch01"].back).toBeUndefined(); // a record existed: these are live, not a backfill
  await expect(page.locator('#shelf .bdg.got[data-badge="pmp-ch05"]')).toHaveCount(1);
  // the other device writes its own copy (it never saw chapter 1's patches) with chapter 9's patch on it
  SERVER[908] = { v: 1, since: 1000, at: Date.now() + 1000, got: { "pmp-ch05": { at: 2000, seen: 1 }, "pmp-ch09": { at: 3000, seen: 1 } } };
  const n = puts.length;
  await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange"))); // the tab comes back: listenPull
  await expect.poll(async () => Object.keys((await rec(page)).got).sort()).toEqual(["pmp-ch01", "pmp-ch05", "pmp-ch09", "pmp-clean-run", "pmp-manifest"]);
  await expect(page.locator('#shelf .bdg.got[data-badge="pmp-ch09"]')).toHaveCount(1); // the shelf redraws
  // and the union goes back up, so neither device's badges are lost
  await expect.poll(() => puts.slice(n).filter(p => p.chapter === 908).length).toBeGreaterThan(0);
  expect(Object.keys(puts.slice(n).filter(p => p.chapter === 908).pop().state.got).sort()).toEqual(["pmp-ch01", "pmp-ch05", "pmp-ch09", "pmp-clean-run", "pmp-manifest"]);
  // a visit that earns nothing new writes nothing
  const m = puts.filter(p => p.chapter === 908).length;
  await page.goto(HOST + "/#pmp/home");
  await page.waitForTimeout(1500);
  expect(puts.filter(p => p.chapter === 908).length).toBe(m);
});

test("Replay chapter keeps the completion date and counts as a redo", async ({ page }) => {
  await page.goto("/#guide");
  await expect(page.locator("#page h1")).toBeVisible();
  const doneAt = "2026-10-02T15:00:00.000Z";
  await seed(page, { c908: { v: 1, since: 1, at: 1, got: {} }, c201: await chapterState(page, 1, { doneAt, rd: 0 }) });
  await page.goto("/#pmp/full/1");
  await page.reload();
  await expect.poll(async () => Object.keys((await rec(page)).got).sort()).toEqual(["pmp-ch01", "pmp-clean-run", "pmp-manifest"]);
  await page.locator("#page .sdot").last().click(); // the ending, where Replay lives
  page.once("dialog", d => d.accept());
  await page.locator("#replay").click();
  await expect.poll(async () => (await rec(page, "halcyon.c201")).rd).toBe(1);
  const st = await rec(page, "halcyon.c201");
  expect(st.doneAt).toBe(doneAt);
  expect(st.picks).toEqual({});
  expect(await page.evaluate(() => { const s = JSON.parse(localStorage.getItem("halcyon.c201")); return !!s.doneAt })).toBe(true); // still done for the chapter list and certificate
});

test("a hidden badge isn't awarded on a redo: fishing for the right option in chapter 1 doesn't earn the manifest patch", async ({ page }) => {
  noDialogs(page);
  await page.goto("/#guide");
  await expect(page.locator("#page h1")).toBeVisible();
  // decision 5 (212 names, f1s5) answered with a different option first; the manifest patch is option 1
  const other = await page.evaluate(() => window.HALCYON_FULL.find(c => c.num === 1).scenes[4].opts.findIndex((o, j) => j !== 1));
  await seed(page, { c908: { v: 1, since: 1, at: 1, got: {} }, c201: await chapterState(page, 1, { done: false, alt: { 4: other } }) });
  await page.goto("/#pmp/full/1");
  await page.reload();
  await expect(page.locator("#page .chmap")).toBeVisible();
  await page.locator('#page .sdot[aria-label^="Decision 5:"]').click();
  await page.locator("#redo").click();
  await page.locator('#page .choice[data-j="1"]').click();
  await expect(page.locator("#page .outcome")).toBeVisible();
  const st = await rec(page, "halcyon.c201");
  expect(st.picks[4]).toBe(1);
  expect(st.rd).toBe(1);
  await page.waitForTimeout(800);
  expect(Object.keys((await rec(page)).got)).not.toContain("pmp-manifest");
});

test("on a phone the badge toast sits above the player bar, even when the bar wraps to two rows", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.clock.install({ time: new Date("2026-10-13T09:00:00") });
  await page.goto("/#guide");
  await expect(page.locator("#page h1")).toBeVisible();
  await seed(page, { c908: { v: 1, since: 1, at: 1, got: {} }, c201: await chapterState(page, 1, { done: false }) });
  await page.goto("/#pmp/full/1");
  await page.reload();
  await expect(page.locator("#narbar")).toBeVisible();
  await page.clock.runFor(1500);
  const t = page.locator("#toast .tcard");
  await expect(t).toHaveCount(1);
  const [tb, nb] = await Promise.all([t.boundingBox(), page.locator("#narbar").boundingBox()]);
  expect(tb.y + tb.height, "toast bottom above the player bar top").toBeLessThanOrEqual(nb.y);
});
