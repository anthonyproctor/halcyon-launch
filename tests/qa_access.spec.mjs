// Who can use QA mode, the Flag button and the test profile (approved 2026-10-12): admins and the testers Anthony marks on /admin.
// Localhost skips sign in (the other specs rely on that), so these tests open the site as http://halcyon.test, which the engine treats
// as online: every request to it is served from the local test server, and /api/auth?action=me, /api/progress, /api/qa-report and
// /api/admin are mocked. A non-tester can't see or turn on QA mode or the test profile by switch, ?qa=1, ?test=1 or saved flags, and a
// former tester's device turns off without writing to either namespace. A tester and an admin keep everything.
import { test, expect } from "@playwright/test";

const HOST = "http://halcyon.test";
const LOCAL = "http://localhost:4321";
const TP = "halcyon-qa-test:";
const NON = { email: "p@x.test", name: "Pat", admin: false, tester: false, cur: 0 };
const TESTER = { ...NON, name: "Tess", tester: true };
const ADMIN = { ...NON, name: "Test Admin", admin: true };

// every request to halcyon.test: the API mocked, everything else from the local static server
async function online(page, user, { progress = {} } = {}) {
  const calls = { progress: [], qa: [], admin: [] };
  await page.route(HOST + "/**", async route => {
    const req = route.request(), u = new URL(req.url());
    if (u.pathname === "/api/auth") {
      if (u.searchParams.get("action") === "me") return route.fulfill({ json: { user, progress } });
      return route.fulfill({ json: { ok: true } });
    }
    if (u.pathname === "/api/progress") { calls.progress.push(req.postDataJSON()); return route.fulfill({ json: { ok: true } }); }
    if (u.pathname === "/api/qa-report") {
      calls.qa.push(req.postDataJSON());
      return route.fulfill(user && (user.admin || user.tester) ? { json: { ok: true, id: 1 } } : { status: 403, json: { error: "QA reports are for testers. Ask Anthony to add you." } });
    }
    if (u.pathname.startsWith("/api/") || u.pathname.startsWith("/_vercel/")) return route.fulfill({ status: 404, body: "" });
    // a reload (leaving the test profile) can drop a request in flight; its response is gone, which isn't a failure
    try { const res = await route.fetch({ url: LOCAL + u.pathname + u.search }); await route.fulfill({ response: res }); } catch (e) {}
  });
  return calls;
}
// logs every localStorage write and removal per page load (sessionStorage survives the reloads), and seeds saved flags once
async function watchStorage(page, seed = {}) {
  await page.addInitScript(seed => {
    const n = +(sessionStorage.getItem("t.loads") || 0) + 1; sessionStorage.setItem("t.loads", String(n));
    if (n === 1) for (const [k, v] of Object.entries(seed)) localStorage.setItem(k, v);
    const log = (op, k) => { const L = JSON.parse(sessionStorage.getItem("t.log") || "[]"); L.push([n, op, k]); Storage.prototype._ss.call(sessionStorage, "t.log", JSON.stringify(L)); };
    const set = Storage.prototype.setItem, rm = Storage.prototype.removeItem;
    Storage.prototype._ss = set;
    Storage.prototype.setItem = function (k, v) { if (this === localStorage) log("set", k); return set.call(this, k, v); };
    Storage.prototype.removeItem = function (k) { if (this === localStorage) log("rm", k); return rm.call(this, k); };
  }, seed);
}
const writes = page => page.evaluate(() => JSON.parse(sessionStorage.getItem("t.log") || "[]"));
const loads = page => page.evaluate(() => +sessionStorage.getItem("t.loads"));
const flags = page => page.evaluate(() => ({ qa: localStorage.getItem("halcyon.qa"), test: localStorage.getItem("halcyon.testprofile"), ok: localStorage.getItem("halcyon.qa.ok") }));
const testKeys = page => page.evaluate(tp => Object.keys(localStorage).filter(k => k.startsWith(tp)).sort(), TP);
// booted: the engine has drawn a page for a signed in user (the user card shows a name)
const booted = page => page.waitForFunction(() => document.getElementById("username") && document.getElementById("username").textContent.length > 0 && document.querySelector("#page h1"));

async function expectNoQA(page, keptTestKeys = []) {
  expect(await page.evaluate(() => window.HalcyonProfile.test)).toBe(false);
  expect(await page.evaluate(() => window.HalcyonProfile.allowed)).toBe(false);
  await expect(page.locator("body.qa-on")).toHaveCount(0);
  await expect(page.locator("#tpbadge")).toHaveCount(0);
  await expect(page.locator("#qabar")).toHaveCount(0);
  expect(await flags(page)).toEqual({ qa: null, test: null, ok: null });
  expect(await testKeys(page)).toEqual(keptTestKeys);
}

test("non-tester: ?qa=1&test=1 does nothing, no QA bar or Flag, and the Guide has no QA or test profile switch", async ({ page }) => {
  const calls = await online(page, NON);
  await watchStorage(page);
  await page.goto(HOST + "/?qa=1&test=1#pmp/full/1");
  await booted(page);
  await expect(page.locator("#page .chmap")).toBeVisible();
  await expectNoQA(page);
  expect(await loads(page)).toBe(1); // never opened the test profile, so it never had to reload out of it
  // nothing ever landed in the test namespace
  expect((await writes(page)).filter(([, , k]) => k.startsWith(TP))).toEqual([]);
  // right click on a line: no Flag form; the page API refuses too
  await page.locator("#page .story p").first().click({ button: "right" });
  await expect(page.locator("#qaform")).toHaveCount(0);
  await page.evaluate(() => { window.HalcyonQA.setQA(true); window.HalcyonQA.openForm(null); window.HalcyonProfile.setTest(true); });
  await expect(page.locator("body.qa-on")).toHaveCount(0);
  await expect(page.locator("#qaform")).toHaveCount(0);
  expect(await loads(page)).toBe(1);
  // the Guide: Show who's speaking is for everyone, QA mode and Test profile are not drawn, even with ?qa=1 typed after the route
  await page.goto(HOST + "/#guide?qa=1&test=1");
  await booted(page);
  await expect(page.locator("#whotoggle")).toBeVisible();
  await expect(page.locator("#qatoggle")).toHaveCount(0);
  await expect(page.locator("#testtoggle")).toHaveCount(0);
  await expect(page.locator("#tpreset")).toHaveCount(0);
  await expectNoQA(page);
  expect(calls.qa).toEqual([]);
});

test("former tester's device: saved QA and test profile flags turn off at sign in, nothing is written to either namespace, real profile opens", async ({ page }) => {
  const calls = await online(page, NON, { progress: { 99990: { pins: ["pmp"], last: {}, at: 1 } } });
  const seed = { "halcyon.qa": "true", "halcyon.testprofile": "true", "halcyon.qa.ok": "true", [TP + "c1001"]: '{"step":2}', [TP + "route"]: '"pmp/full/1"' };
  await watchStorage(page, seed);
  await page.goto(HOST + "/#pmp/full/1");
  await expect.poll(() => loads(page)).toBe(2); // it opened in the test profile, frozen, and reloaded into the real one
  await booted(page);
  await expectNoQA(page, [TP + "c1001", TP + "route"]);
  const W = await writes(page);
  // load 1 (the test profile, before the sign in check): only the QA flags were removed; no progress write in either namespace
  const first = W.filter(([n]) => n === 1);
  expect(first.filter(([, op]) => op === "set"), JSON.stringify(first)).toEqual([]);
  expect(first.map(([, , k]) => k).sort()).toEqual(["halcyon.qa", "halcyon.qa.ok", "halcyon.testprofile"]);
  // the test namespace kept exactly what was in it (sign out clears it, as before), and the real profile booted normally
  expect(await page.evaluate(tp => Object.keys(localStorage).filter(k => k.startsWith(tp)).sort(), TP)).toEqual([TP + "c1001", TP + "route"]);
  expect(W.filter(([, op, k]) => op === "set" && k.startsWith(TP))).toEqual([]);
  expect(await page.evaluate(() => localStorage.getItem("halcyon.c99990"))).toContain("pmp");
  // a progress write from the frozen page never left it
  expect(calls.progress.length).toBe(0);
});

test("tester: ?qa=1 turns QA on, the Guide has both switches, ?test=1 opens the test profile, and Flag sends", async ({ page }) => {
  const calls = await online(page, TESTER);
  await watchStorage(page);
  await page.goto(HOST + "/?qa=1#guide");
  await booted(page);
  expect(await page.evaluate(() => window.HalcyonProfile.allowed)).toBe(true);
  await expect(page.locator("body.qa-on")).toHaveCount(1);
  await expect(page.locator("#qatoggle")).toBeChecked();
  await expect(page.locator("#testtoggle")).toBeVisible();
  expect((await flags(page)).ok).toBe("true");
  // first ?test=1 on this device: the test profile opens (one reload after the sign in check)
  await page.goto(HOST + "/?test=1#pmp/full/1");
  await page.waitForFunction(() => window.HalcyonProfile && window.HalcyonProfile.test === true);
  await booted(page);
  await expect(page.locator("#tpbadge")).toBeVisible();
  expect(await page.evaluate(() => window.HalcyonProfile.frozen)).toBe(false); // confirmed: the test profile saves
  // Flag a line
  await page.evaluate(() => window.HalcyonQA.openForm(null));
  await page.locator("#qatype").selectOption("typo");
  await page.locator("#qasend").click();
  await expect(page.locator("#qahead")).toHaveText("Sent");
  expect(calls.qa.length).toBe(1);
  expect(calls.qa[0].test_profile).toBe(true);
  expect(calls.progress.length).toBe(0); // the test profile never syncs
});

test("tester whose saved test profile is confirmed: no reload, and it can save", async ({ page }) => {
  await online(page, TESTER);
  await watchStorage(page, { "halcyon.qa": "true", "halcyon.testprofile": "true", "halcyon.qa.ok": "true" });
  await page.goto(HOST + "/#guide");
  await booted(page);
  expect(await loads(page)).toBe(1);
  expect(await page.evaluate(() => window.HalcyonProfile.test)).toBe(true);
  expect(await page.evaluate(() => window.HalcyonProfile.frozen)).toBe(false);
  await expect(page.locator("#testtoggle")).toBeChecked();
});

test("admin (not marked tester) has QA mode and the test profile", async ({ page }) => {
  await online(page, ADMIN);
  await page.goto(HOST + "/?qa=1#guide");
  await booted(page);
  await expect(page.locator("#qatoggle")).toBeChecked();
  await expect(page.locator("#testtoggle")).toBeVisible();
  await page.locator("#qatoggle").uncheck();
  await expect(page.locator("body.qa-on")).toHaveCount(0);
  await expect(page.locator("#testtoggle")).toBeHidden(); // shown only while QA mode is on, as before
});

test("admin page: a Tester switch per player (admins always), saved through /api/admin", async ({ page }) => {
  const posts = [];
  await page.route(HOST + "/**", async route => {
    const req = route.request(), u = new URL(req.url());
    if (u.pathname === "/api/admin") {
      const a = u.searchParams.get("action");
      if (a === "overview") return route.fulfill({ json: { users: [
        { id: "a1", email: "a@x.test", name: "Test Admin", is_admin: true, is_tester: false, disabled: false, progress: [], created_at: "2026-10-01" },
        { id: "p1", email: "p@x.test", name: "Pat", is_admin: false, is_tester: false, disabled: false, progress: [], created_at: "2026-10-02" },
        { id: "t1", email: "t@x.test", name: "Tess", is_admin: false, is_tester: true, disabled: false, progress: [], created_at: "2026-10-03" }], invites: [] } });
      if (a === "list") return route.fulfill({ json: { signups: [] } });
      if (a === "tester") { posts.push({ method: req.method(), body: req.postDataJSON() }); return route.fulfill({ json: { ok: true } }); }
      return route.fulfill({ status: 404, json: {} });
    }
    // a reload (leaving the test profile) can drop a request in flight; its response is gone, which isn't a failure
    try { const res = await route.fetch({ url: LOCAL + u.pathname + u.search }); await route.fulfill({ response: res }); } catch (e) {}
  });
  await page.goto(HOST + "/admin.html");
  await expect(page.locator("#users")).toContainText("Always (admin)");
  const pat = page.locator('input[data-tester="p1"]'), tess = page.locator('input[data-tester="t1"]');
  await expect(page.locator('input[data-tester="a1"]')).toHaveCount(0);
  await expect(pat).not.toBeChecked();
  await expect(tess).toBeChecked();
  const box = await pat.boundingBox();
  expect(box.width).toBeGreaterThanOrEqual(24);
  expect(box.height).toBeGreaterThanOrEqual(24);
  await pat.check();
  await expect(page.locator("#msg")).toContainText("Saved");
  await tess.uncheck();
  await expect.poll(() => posts.length).toBe(2);
  expect(posts).toEqual([{ method: "POST", body: { id: "p1", tester: true } }, { method: "POST", body: { id: "t1", tester: false } }]);
  const text = await page.locator("body").innerText();
  expect(text).not.toMatch(/[–—]/);
});

test("tester whose storage won't save the QA hint: the page loads once, no reload loop", async ({ page }) => {
  await online(page, TESTER);
  await watchStorage(page, { "halcyon.qa": "true", "halcyon.testprofile": "true" });
  await page.addInitScript(() => { const set = Storage.prototype.setItem; Storage.prototype.setItem = function (k, v) { if (this === localStorage && k === "halcyon.qa.ok") throw new Error("QuotaExceededError"); return set.call(this, k, v); }; });
  await page.goto(HOST + "/#guide");
  await booted(page);
  await page.waitForTimeout(1500);
  expect(await loads(page)).toBe(1);
  expect(await page.evaluate(() => window.HalcyonProfile.test)).toBe(false);
});

test("signed out with a stale QA hint: QA doesn't count on the sign in page, and the same tester signing back in gets it back", async ({ page }) => {
  let user = null;
  await online(page, TESTER);
  // registered after online(), so Playwright checks it first: signed out until the form is sent
  await page.route(HOST + "/api/auth**", r => r.fulfill({ json: new URL(r.request().url()).searchParams.get("action") === "me" ? { user, progress: {} } : { ok: true } }));
  await watchStorage(page, { "halcyon.qa": "true", "halcyon.qa.ok": "true" });
  await page.goto(HOST + "/#guide");
  await expect(page.locator("#authform")).toBeVisible();
  expect(await page.evaluate(() => window.HalcyonProfile.allowed)).toBe(false);
  await expect(page.locator("body.qa-on")).toHaveCount(0);
  expect((await flags(page)).qa).toBe("true"); // kept for the same tester
  user = TESTER;
  await page.locator("#a-email").fill("t@x.test"); await page.locator("#a-pw").fill("x".repeat(12));
  await page.locator("#authform button[type=submit]").click();
  await booted(page);
  await expect(page.locator("body.qa-on")).toHaveCount(1);
});
