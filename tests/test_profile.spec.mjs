// Test profile for QA mode (profile.js, approved 2026-10-12). With QA mode on, "Test profile" moves every progress key to the
// "halcyon-qa-test:" namespace, pauses /api/progress and page views, and shows a banner on every screen. These tests save real progress
// first, play in the test profile (a chapter decision, mock answers on two forms, study time, page narration), and check that no real
// key changed and no progress request left the page; then that switching off brings the real progress and Continue back as they were,
// that Reset clears only test keys with an in-page confirm, and that the banner and switches work at 390px.
import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TP = "halcyon-qa-test:";
// display and device preferences that both profiles share (profile.js SHARED); every other "halcyon." key is real progress
const SHARED = ["amb", "ambvol", "rate", "auto2", "storymode", "spoilers", "pdbg", "devid", "qa", "showwho", "qa.tester", "testprofile", "qa.ok"];
const isShared = k => SHARED.includes(k) || k.startsWith("fold.") || k.startsWith("bookEd.");

async function realKeys(page) {
  const all = await page.evaluate(() => Object.fromEntries(Object.keys(localStorage).sort().map(k => [k, localStorage.getItem(k)])));
  return Object.fromEntries(Object.entries(all).filter(([k]) => k.startsWith("halcyon.") && !isShared(k.slice(8))));
}
const testKeys = page => page.evaluate(tp => Object.keys(localStorage).filter(k => k.startsWith(tp)).sort(), TP);
const pageviews = page => page.evaluate(() => (window.vaq || []).filter(([k]) => k === "pageview").length);
const noDialogs = page => page.on("dialog", d => { throw new Error("a browser dialog opened: " + d.message()) });

async function decide(page, n = 0) {
  await expect(page.locator("#page .chmap")).toBeVisible();
  for (let i = 0; i < 6 && !(await page.locator("#page .choice").count()); i++) await page.locator("#fnext").click();
  await page.locator("#page .choice").nth(n).click();
  await expect(page.locator("#page .outcome")).toBeVisible();
}
async function mockAnswer(page, route) {
  await page.clock.runFor(1000); // so each step is "last played" after the one before
  await page.goto(route);
  await page.locator("#practice").click(); // every form starts fresh here, in both profiles
  await page.locator("#page .qitem label.qopt").first().click(); // picking an answer redraws the question
  await page.locator("#nextq").click();
}
async function study(page, minutes) {
  for (let i = 0; i < minutes * 2; i++) { await page.mouse.move(100 + (i % 7) * 5, 300); await page.clock.runFor(30_000); }
}
async function noSideScroll(page, where) {
  await page.mouse.move(1, 1);
  const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(over, `horizontal scroll on ${where}`).toBeLessThanOrEqual(0);
}
// a profile switch reloads the page without its route; it has finished booting once it notes the route it opened
const booted = (page, on) => page.waitForFunction(t => window.HalcyonProfile && window.HalcyonProfile.test === t && location.hash.length > 1, on);

test("test profile: real progress, mocks, study log, place and Continue stay untouched, and come back when it's off", async ({ page }) => {
  noDialogs(page);
  // CPHIMS form 2 is the real courses/cphims/mock/mock2.js (2026-10-14)
  await page.clock.install({ time: new Date("2026-10-12T09:00:00") });

  // real progress: a chapter 1 decision, PMP mock practice, CPHIMS form 2, study time, and an audiobook spot
  await page.goto("/#pmp/full/1");
  await decide(page, 0);
  await study(page, 2);
  await mockAnswer(page, "/#pmp/mock/1"); // two PMP forms since 2026-10-26
  await mockAnswer(page, "/#cphims/mock/2");
  await page.evaluate(() => { localStorage.setItem("halcyon.bookpos.pmp.3", "312.5"); localStorage.setItem("halcyon.carpos.f1-open", "41") });
  await page.goto("/#library");
  const cont = await page.locator("#libcont").textContent();
  let before = await realKeys(page);
  for (const k of ["halcyon.c201", "halcyon.c905", "halcyon.c900", "halcyon.c10910", "halcyon.lastplace.pmp", "halcyon.cur", "halcyon.route", "halcyon.c99990", "halcyon.c908"])
    expect(before[k], k).toBeTruthy(); // c908: the badges record (badges.js), written by the first badge check

  // QA mode on, then the Test profile switch on the Guide page (it reloads into the test profile)
  await page.goto("/?qa=1#guide");
  await expect(page.locator("#testtoggle")).toBeVisible();
  await expect(page.locator("#tpbadge")).toHaveCount(0);
  before = await realKeys(page); // the Guide visit moved the real route; nothing real may change from here on
  await page.locator("#testtoggle").click();
  await expect(page.locator("#tpbadge")).toBeVisible();
  await expect(page.locator("#tpbadge")).toContainText("Test profile");
  expect(await page.evaluate(() => window.HalcyonProfile.test)).toBe(true);
  await booted(page, true);
  // a fresh profile: no Continue, no saved chapter
  await page.goto("/?qa=1#library");
  await expect(page.locator("#page h1")).toHaveText("Your courses");
  await expect(page.locator("#libcont")).toHaveCount(0);

  // play in the test profile
  await page.goto("/?qa=1#pmp/full/1");
  expect(await page.evaluate(() => document.querySelectorAll("#page .outcome").length)).toBe(0); // the real decision isn't shown
  await decide(page, 1);
  await study(page, 3);
  await mockAnswer(page, "/?qa=1#pmp/mock/1");
  await mockAnswer(page, "/?qa=1#cphims/mock/2");
  await mockAnswer(page, "/?qa=1#cphims/mock/1");
  await page.evaluate(() => { document.dispatchEvent(new Event("visibilitychange")); window.dispatchEvent(new Event("pagehide")) });
  const tk = await testKeys(page);
  for (const k of ["c201", "c905", "c900", "c10900", "c10910", "lastplace.pmp", "lastplace.cphims", "cur", "route", "c99990", "c908", "c10908"]) expect(tk, k).toContain(TP + k);
  // the test profile's badges record is its own: started fresh (a silent backfill), never the real one
  const tb = JSON.parse(await page.evaluate(tp => localStorage.getItem(tp + "c908"), TP));
  expect(tb.got && typeof tb.got).toBe("object");
  expect(tb.since).not.toBe(JSON.parse(before["halcyon.c908"]).since);
  expect(await pageviews(page), "no page views from the test profile").toBe(0);
  expect(await realKeys(page), "real keys after test play").toEqual(before);
  // the test profile's Continue points at test state
  await page.clock.runFor(1000);
  await page.goto("/?qa=1#pmp/full/1"); // the Library lists PMP; its test Continue now points at this chapter, the real one at the mock
  await expect(page.locator("#page .chmap")).toBeVisible();
  await page.goto("/?qa=1#library");
  await expect(page.locator("#libcont")).toContainText("Chapter 1");
  expect(await page.locator("#libcont").textContent()).not.toBe(cont);

  // off from the banner's Turn off button: it reloads into the real profile at its own place
  await page.locator("#tpgo").click();
  await booted(page, false);
  await expect(page.locator("#tpbadge")).toHaveCount(0);
  await expect(page.locator("#page h1")).toHaveText("How to use it"); // reopened at the real saved place (the Guide, where it was switched on)
  expect(new URL(page.url()).hash).toBe("#" + JSON.parse(before["halcyon.route"]));
  await page.goto("/?qa=1#library");
  await expect(page.locator("#libcont")).toHaveText(cont);
  await page.goto("/?qa=1#pmp/full/1");
  await expect(page.locator("#page .chmap")).toBeVisible();
  const after = await realKeys(page);
  for (const k of ["halcyon.c201", "halcyon.c905", "halcyon.c900", "halcyon.c10910", "halcyon.bookpos.pmp.3", "halcyon.carpos.f1-open", "halcyon.c908"]) expect(after[k], k).toBe(before[k]);
  // the real chapter state is the real decision
  expect(JSON.parse(after["halcyon.c201"]).picks).toEqual(JSON.parse(before["halcyon.c201"]).picks);
  expect(await testKeys(page), "test data is kept for next time").toContain(TP + "c201");
});

test("test profile: signed in online, nothing goes to /api/progress and the server copy never lands in the test profile", async ({ page }) => {
  noDialogs(page);
  const progressCalls = [], reports = [];
  const SERVER = { 201: { pos: 2, max: 2, picks: { srv: 1 }, m: { trust: 50, conf: 50, health: 50 }, score: 0, flags: { servermarker: true }, dom: { People: [0, 0], Process: [0, 0], "Business Environment": [0, 0] }, drills: {}, ex: null, quiz: null } };
  await page.route("http://halcyon.test/**", async r => {
    const u = new URL(r.request().url());
    if (u.pathname === "/api/auth") return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ user: { name: "Test Admin", admin: true, cur: 201 }, progress: SERVER }) });
    if (u.pathname === "/api/progress") { const b = r.request().postDataJSON(); progressCalls.push(r.request().method() + " " + b.chapter); SERVER[b.chapter] = b.state; return r.fulfill({ status: 200, contentType: "application/json", body: "{}" }) }
    if (u.pathname === "/api/qa-report") { reports.push(r.request().postDataJSON()); return r.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' }) }
    if (u.pathname.startsWith("/api/")) return r.fulfill({ status: 404, body: "" });
    // a reload (a profile switch) can drop a request in flight: its response is gone, which isn't a failure
    try { const res = await r.fetch({ url: "http://localhost:4321" + u.pathname + u.search }); await r.fulfill({ response: res }) } catch (e) {}
  });
  await page.clock.install({ time: new Date("2026-10-12T09:00:00") });

  // real profile online: the server copy lands in halcyon.c201 and a decision syncs (the interception sees real syncs)
  await page.goto("http://halcyon.test/#pmp/full/1");
  await expect(page.locator("#username")).toHaveText("Test Admin");
  expect(JSON.parse(await page.evaluate(() => localStorage.getItem("halcyon.c201"))).flags.servermarker).toBe(true);
  await page.goto("http://halcyon.test/#pmp/full/2");
  await decide(page, 0);
  await page.clock.runFor(2000);
  expect(progressCalls.length, "the real profile does sync").toBeGreaterThan(0);

  // test profile via ?test=1 after the route (an address edit that changes only the hash); QA mode comes on with it
  await page.goto("http://halcyon.test/#pmp/full/1?test=1");
  await expect(page.locator("#tpbadge")).toBeVisible();
  progressCalls.length = 0; // the real page's own exit writes are real; count from here
  const before = await realKeys(page);
  expect(new URL(page.url()).hash).toBe("#pmp/full/1"); // the flag is stripped from the address
  await expect(page.locator("body.qa-on")).toHaveCount(1);
  await expect(page.locator("#username")).toHaveText("Test Admin"); // still signed in, so Flag works
  expect(await page.evaluate(tp => localStorage.getItem(tp + "c201"), TP)).toBe(null);
  await decide(page, 1);
  expect(await page.evaluate(tp => localStorage.getItem(tp + "c201"), TP)).not.toContain("servermarker");
  await study(page, 2);
  await mockAnswer(page, "http://halcyon.test/#pmp/mock/1");
  // a hidden tab flushes the study log and the listening spot with keepalive writes in the real profile; in the test profile nothing
  await page.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, get: () => true }); document.dispatchEvent(new Event("visibilitychange")); window.dispatchEvent(new Event("pagehide")) });
  await page.evaluate(() => { delete document.hidden; document.dispatchEvent(new Event("visibilitychange")) }); // a visible tab pulls from the server in the real profile
  await page.clock.runFor(30_000);
  expect(progressCalls, "no /api/progress from the test profile").toEqual([]);
  expect(await pageviews(page)).toBe(0);
  expect(await page.evaluate(tp => localStorage.getItem(tp + "c201"), TP)).not.toContain("servermarker");

  // Flag still posts, tagged as the test profile
  await page.goto("http://halcyon.test/#pmp/full/1");
  await page.locator("#page .story p:has(.said[data-who])").first().click({ button: "right" });
  await page.locator("#qatype").selectOption("typo");
  await page.locator("#qasend").click();
  await expect(page.locator("#qaform h2")).toHaveText("Sent");
  expect(reports.length).toBe(1);
  expect(reports[0].test_profile).toBe(true);
  expect(reports[0].ctx.test_profile).toBe(true);

  expect(await realKeys(page), "real keys untouched").toEqual(before);
  expect(progressCalls).toEqual([]);

  // ?test=0 goes back to the real profile, which syncs again
  await page.goto("http://halcyon.test/?test=0#pmp/full/2");
  await expect(page.locator("#tpbadge")).toHaveCount(0);
  await expect(page.locator("#page .outcome")).toBeVisible(); // the real decision is there
});

test("Reset test profile clears only the test namespace, after an in-page confirm", async ({ page }) => {
  noDialogs(page);
  await page.goto("/#guide");
  await page.evaluate(tp => {
    localStorage.setItem("halcyon.c201", JSON.stringify({ pos: 3, max: 3, picks: { a: 1 } }));
    localStorage.setItem("halcyon.c905", JSON.stringify({ v: 1, days: { "2026-10-11": { t: { abc: [600, 0] }, a: ["c1"] } } }));
    localStorage.setItem("halcyon.lastplace.pmp", JSON.stringify({ t: "full", n: 1 }));
    localStorage.setItem("halcyon.ambvol", "0.5");
    localStorage.setItem(tp + "c201", JSON.stringify({ pos: 1, max: 1, picks: { b: 2 } }));
    localStorage.setItem(tp + "c905", JSON.stringify({ v: 1, days: {} }));
    localStorage.setItem(tp + "lastplace.pmp", JSON.stringify({ t: "mock", f: 1 }));
    localStorage.setItem(tp + "c900", JSON.stringify({ mode: "practice" }));
  }, TP);
  const before = await realKeys(page);
  await page.goto("/?qa=1&test=1#guide");
  await expect(page.locator("#tpbadge")).toBeVisible();
  await page.goto("/#guide");
  // Keep it: nothing cleared
  await page.locator("#tpreset").click();
  await expect(page.locator("#tpconfirm")).toBeVisible();
  await page.locator("#tpno").click();
  await expect(page.locator("#tpconfirm")).toBeHidden();
  expect(await testKeys(page)).toContain(TP + "c201");
  // Clear test data
  await page.locator("#tpreset").click();
  await page.locator("#tpyes").click();
  await expect(page.locator("#page h1")).toHaveText("How to use it"); // reloads on the Guide, still in the test profile
  await expect(page.locator("#tpbadge")).toBeVisible();
  const left = await testKeys(page);
  for (const k of ["c201", "c905", "c900", "lastplace.pmp"]) expect(left, k).not.toContain(TP + k);
  expect(await realKeys(page)).toEqual(before);
  expect(await page.evaluate(() => localStorage.getItem("halcyon.ambvol"))).toBe("0.5");
  // with the test profile off, Reset still clears only test keys and says so
  await page.locator("#testtoggle").click();
  await booted(page, false);
  await expect(page.locator("#tpbadge")).toHaveCount(0);
  await page.evaluate(tp => localStorage.setItem(tp + "c201", "{}"), TP);
  await page.goto("/#guide");
  await page.locator("#tpreset").click();
  await page.locator("#tpyes").click();
  await expect(page.locator("#tpmsg")).toHaveText("Test profile cleared.");
  expect(await testKeys(page)).toEqual([]);
  expect(await realKeys(page)).toEqual(before);
});

test("the Test profile banner shows on every screen; the switches show only in QA mode and work at 390px", async ({ page }) => {
  noDialogs(page);
  await page.goto("/#guide");
  await expect(page.locator("#qatoggle")).toBeVisible();
  await expect(page.locator("#testtoggle")).toBeHidden(); // QA mode off: no test profile switch
  await page.locator("#qatoggle").check();
  await expect(page.locator("#testtoggle")).toBeVisible();
  await page.locator("#testtoggle").click();
  await expect(page.locator("#tpbadge")).toBeVisible();
  await booted(page, true);
  for (const r of ["library", "upcoming", "guide", "pmp/home", "pmp/about", "pmp/full/1", "pmp/mock", "pmp/progress", "pmp/listen", "pmp/cast", "cphims/home", "pmp/final"]) {
    await page.goto("/#" + r);
    await expect(page.locator("#tpbadge"), r).toBeVisible();
    await expect(page.locator("#tpbadge"), r).toContainText("Test profile");
    const top = await page.evaluate(() => { scrollTo(0, 0); const b = document.getElementById("tpbadge").getBoundingClientRect(), h = document.querySelector(".tophead").getBoundingClientRect(); return [b.bottom, h.top] });
    expect(top[0], `banner clears the header on ${r}`).toBeLessThanOrEqual(top[1] + 1);
    await noSideScroll(page, r + " in the test profile");
  }
  // tap targets and contrast
  await page.goto("/#guide");
  for (const sel of ["#tpgo", "#testtoggle", "#tpreset"]) {
    const bb = await page.locator(sel).boundingBox();
    expect(bb.height, sel).toBeGreaterThanOrEqual(24);
    expect(bb.width, sel).toBeGreaterThanOrEqual(24);
  }
  const ratio = await page.evaluate(() => {
    const rgb = s => s.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number);
    const lum = c => { const [r, g, b] = c.map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }); return 0.2126 * r + 0.7152 * g + 0.0722 * b };
    const cr = (a, b) => { const [x, y] = [lum(rgb(a)), lum(rgb(b))].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05) };
    const b = getComputedStyle(document.getElementById("tpbadge")), g = getComputedStyle(document.getElementById("tpgo"));
    return [cr(b.color, b.backgroundColor), cr(g.color, g.backgroundColor)];
  });
  for (const r of ratio) expect(r).toBeGreaterThanOrEqual(4.5);
  const text = await page.evaluate(() => document.getElementById("tpbadge").textContent + document.getElementById("qatpset").textContent);
  expect(text).not.toMatch(/[–—]/);
  await noSideScroll(page, "guide with the test profile switch");
  // QA mode off with the test profile on: back to the real profile, banner gone
  await page.locator("#qatoggle").click();
  await booted(page, false);
  await expect(page.locator("#tpbadge")).toHaveCount(0);
});

// the QA bar is a pill (2026-10-22): open its details unless this device left them open
async function openQA(page) { if (await page.locator("#qapill").getAttribute("aria-expanded") !== "true") await page.locator("#qapill").click(); await expect(page.locator("#qapanel")).toBeVisible(); }
test("the QA bar's Test profile button switches profiles while a page plays", async ({ page }) => {
  noDialogs(page);
  await page.goto("/?qa=1#pmp/full/1");
  await page.locator("#narplay").click();
  await expect(page.locator("#qabar")).toBeVisible({ timeout: 15_000 });
  await openQA(page);
  const btn = page.locator("#qatpbtn");
  await expect(btn).toHaveAttribute("aria-pressed", "false");
  expect((await btn.boundingBox()).height).toBeGreaterThanOrEqual(24);
  await noSideScroll(page, "QA bar with the Test profile button");
  await btn.click();
  await expect(page.locator("#tpbadge")).toBeVisible();
  await booted(page, true);
  const before = await realKeys(page);
  // narration in the test profile: its listening spot and study time land in the test namespace
  await page.goto("/?qa=1#pmp/full/1");
  await page.locator("#narplay").click();
  await expect(page.locator("#qabar")).toBeVisible({ timeout: 15_000 });
  await openQA(page);
  await expect(page.locator("#qatpbtn")).toHaveAttribute("aria-pressed", "true");
  await page.waitForTimeout(1500);
  await page.locator("#narplay").click();
  await page.evaluate(() => window.dispatchEvent(new Event("pagehide")));
  expect(await testKeys(page)).toContain(TP + "route");
  expect(await realKeys(page)).toEqual(before);
  await page.locator("#qatpbtn").click();
  await booted(page, false);
  await expect(page.locator("#tpbadge")).toHaveCount(0);
});

test("switch edge cases: an address edit with ?test=1 leaves the real place alone, a real change made just before switching still syncs, and ?qa=1 in the address doesn't pin QA on", async ({ page }) => {
  noDialogs(page);
  const puts = [];
  const SERVER = {};
  await page.route("http://halcyon.test/**", async r => {
    const u = new URL(r.request().url());
    if (u.pathname === "/api/auth") return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ user: { name: "Test Admin", admin: true, cur: 0 }, progress: SERVER }) });
    if (u.pathname === "/api/progress") { const b = r.request().postDataJSON(); puts.push(b.chapter); SERVER[b.chapter] = b.state; return r.fulfill({ status: 200, contentType: "application/json", body: "{}" }) }
    if (u.pathname.startsWith("/api/")) return r.fulfill({ status: 404, body: "" });
    try { await r.fulfill({ response: await r.fetch({ url: "http://localhost:4321" + u.pathname + u.search }) }) } catch (e) {} // a reload can drop a request in flight
  });
  // a real decision, then the test profile at once (inside the 400 ms sync delay): the decision still reaches the server
  await page.goto("http://halcyon.test/?qa=1#pmp/full/1");
  await expect(page.locator("#username")).toHaveText("Test Admin");
  await decide(page, 0);
  const picks = JSON.parse(await page.evaluate(() => localStorage.getItem("halcyon.c201"))).picks;
  expect(Object.keys(picks).length).toBeGreaterThan(0);
  await page.evaluate(() => window.HalcyonProfile.setTest(true));
  await booted(page, true);
  expect(new URL(page.url()).search, "the flags leave the address once stored").toBe("");
  await expect.poll(() => SERVER[201] && SERVER[201].picks).toEqual(picks);
  // QA mode off from the Guide takes the test profile with it and stays off (the address no longer carries ?qa=1)
  await page.goto("http://halcyon.test/#guide");
  await page.locator("#qatoggle").click();
  await booted(page, false);
  await page.goto("http://halcyon.test/#guide");
  await expect(page.locator("#qatoggle")).not.toBeChecked();
  // back in the real profile online, the real decision came back from the server, and QA mode's flag survived the sign in reload
  await page.goto("http://halcyon.test/?qa=1#pmp/full/1");
  await expect(page.locator("#qatoggle, #page .chmap").first()).toBeVisible();
  expect(JSON.parse(await page.evaluate(() => localStorage.getItem("halcyon.c201"))).picks).toEqual(picks);
  await page.reload();
  await expect(page.locator("body.qa-on")).toHaveCount(1);

  // an address edit that adds ?test=1 after the route: the real place must not move to that route on the way out
  await page.goto("http://halcyon.test/#library");
  await expect(page.locator("#page h1")).toHaveText("Your courses");
  const real = { route: await page.evaluate(() => localStorage.getItem("halcyon.route")), lp: await page.evaluate(() => localStorage.getItem("halcyon.lastplace.pmp")), lib: await page.evaluate(() => localStorage.getItem("halcyon.c99990")) };
  const n = puts.length;
  await page.goto("http://halcyon.test/#pmp/full/4?test=1");
  await booted(page, true);
  expect(await page.evaluate(() => localStorage.getItem("halcyon.route"))).toBe(real.route);
  expect(await page.evaluate(() => localStorage.getItem("halcyon.lastplace.pmp"))).toBe(real.lp);
  expect(await page.evaluate(() => localStorage.getItem("halcyon.c99990"))).toBe(real.lib);
  expect(puts.slice(n), "nothing synced on the way into the test profile").toEqual([]);
});
