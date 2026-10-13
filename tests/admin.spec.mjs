// The admin page's Players section (2026-10-13): one compact line per player, details on demand, decoded chapter keys, last active,
// last sign in, sort and filter, and the summary strip. /api/admin, /api/qa-report are mocked with made-up players; everything else
// (admin.html, courses.js, the chapter files it reads titles from) comes from the local test server.
// Phase 3 of badges and profiles (2026-10-14): the overview also carries avatar, study (summed from the 905 study logs on the server) and
// books (per course base: time, and the 908 record's got ids with at and back, and the readiness snapshot). Made-up values here.
import { test, expect } from "@playwright/test";

const ago = ms => new Date(Date.now() - ms).toISOString();
const H = 3600e3, D = 24 * H;
const USERS = () => [
  { id: "a1", email: "admin@example.com", name: "Admin Person", is_admin: true, is_tester: false, disabled: false, cur: 0, created_at: ago(40 * D), last_login_at: ago(5 * 60e3), progress: [], avatar: null, study: null, books: {} },
  { id: "p1", email: "test@example.com", name: "Test Player", is_admin: false, is_tester: false, disabled: false, cur: 40102, created_at: ago(20 * D), last_login_at: null, progress: [
    { chapter: 40101, updated: ago(1 * D), pos: 30, done: ago(1 * D), picks: 10, qr: 8, qn: 10 },
    { chapter: 40102, updated: ago(2 * H), pos: 5, picks: 3 },
    { chapter: 40900, updated: ago(3 * D), sub: false },
    { chapter: 40901, updated: ago(3 * D), n: 2, lr: 41, lt: 60 },
    { chapter: 20101, updated: ago(4 * D), pos: 1, picks: 0 },
    { chapter: 201, updated: ago(6 * D), pos: 40, done: ago(6 * D), picks: 10, qr: 9, qn: 10 },
    { chapter: 101, updated: ago(30 * D), pos: 4, picks: 2 },
    { chapter: 3, updated: ago(31 * D), step: 10, score: 24 },
    { chapter: 99990, updated: ago(2 * H) },
    { chapter: 60000, updated: ago(9 * D) },
    { chapter: 40905, updated: ago(2 * H) },
    { chapter: 40908, updated: ago(1 * D) },
    { chapter: 908, updated: ago(6 * D) }],
    avatar: { kind: "cast", course: "pmp", id: "ada" },
    study: { read: 9000, listen: 45000, current: 3, best: 7, days: 11, week: 5400, last: "2026-10-13" },
    books: {
      40000: { read: 6000, listen: 30000, got: { "pilot-ch01": { at: Date.now() - 1 * D }, "pilot-streak-3": { at: Date.now() - 2 * D }, "pilot-gone-badge": { at: Date.now() - 3 * D } }, snap: { ready: 64, ch: [1, 12], at: Date.now() - 1 * D } },
      0: { read: 3000, listen: 15000, got: { "pmp-ch01": { at: Date.now() - 6 * D, back: 1 } }, snap: { ready: null, ch: [1, 15], at: Date.now() - 6 * D } } } },
  { id: "t1", email: "tester@example.com", name: "Quiet Tester", is_admin: false, is_tester: true, disabled: false, cur: 50101, created_at: ago(10 * D), last_login_at: ago(3 * D), progress: [
    { chapter: 50101, updated: ago(3 * D), pos: 2, picks: 1 }],
    avatar: { kind: "card", course: "cisa" }, study: { read: 600, listen: 0, current: 0, best: 0, days: 0, week: 0, last: "2026-10-10" }, books: { 50000: { read: 600, listen: 0, got: {}, snap: null } } },
  { id: "n1", email: "new@example.com", name: "Zed Newcomer", is_admin: false, is_tester: false, disabled: true, cur: 0, created_at: ago(2 * D), last_login_at: null, progress: [], avatar: null, study: null, books: {} },
];
const INVITES = () => [
  { token: "tok-open", note: "a friend", created_at: ago(2 * D), expires_at: new Date(Date.now() + 28 * D).toISOString(), revoked: false, used_by: null },
  { token: "tok-used", note: "someone", created_at: ago(9 * D), expires_at: new Date(Date.now() + 21 * D).toISOString(), revoked: false, used_by: "test@example.com" }];

async function stub(page) {
  await page.route(/\/api\//, route => {
    const u = new URL(route.request().url());
    if (u.pathname === "/api/admin") {
      const a = u.searchParams.get("action");
      if (a === "overview") return route.fulfill({ json: { users: USERS(), invites: INVITES(), lastLogin: true } });
      if (a === "list") return route.fulfill({ json: { signups: [] } });
      return route.fulfill({ json: { ok: true } });
    }
    if (u.pathname === "/api/qa-report") return route.fulfill({ json: { reports: [{ id: 1 }, { id: 2 }], since: null } });
    return route.fulfill({ status: 404, body: "" });
  });
}
const ready = page => expect(page.locator("body[data-ready]")).toHaveCount(1);
const names = page => page.locator("#users .nm").allInnerTexts();
const noSideScroll = page => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);

test.beforeEach(async ({ page }) => { await stub(page); });

test("players are one compact row each, sorted by last active, with decoded courses and relative times", async ({ page }) => {
  await page.goto("/admin.html");
  await ready(page);
  await expect(page.locator("#users [role=listitem]")).toHaveCount(4);
  expect(await names(page)).toEqual(["Test Player", "Quiet Tester", "Zed Newcomer", "Admin Person"]); // never active: newest joined first
  // collapsed by default, and short
  await expect(page.locator("#users .det:visible")).toHaveCount(0);
  const heights = () => page.evaluate(() => [...document.querySelectorAll("#users .pr")].map(r => r.getBoundingClientRect().height)); // one read: the list redraws once titles load
  for (const h of await heights()) expect(h).toBeLessThan(150); // 390px: name, email, courses, joined and switches
  await page.setViewportSize({ width: 1280, height: 900 });
  for (const h of await heights()) expect(h).toBeLessThan(80); // desktop: one line (two when courses wrap)
  const row = page.locator('#users [data-id="p1"]');
  await expect(row.locator(".chip")).toHaveCount(3); // PMP, ASEP, Private Pilot
  await expect(row.locator(".prog")).toContainText("Private Pilot 1/12");
  await expect(row.locator(".c-la time")).toHaveText("2h ago");
  expect(await row.locator(".c-la time").getAttribute("title")).toMatch(/M[DS]T$/);
  await expect(page.locator('#users [data-id="n1"] .c-la')).toContainText("Never");
  await expect(page.locator('#users [data-id="n1"] .badge.off')).toHaveText("disabled");
  // summary strip
  await expect(page.locator("#stats .stat")).toHaveText(["4players", "2active, last 7 days", "1.5hlistened, last 7 days", "1tester", "1open invite", "2QA reports, last 7 days"]);
  // no raw keys anywhere
  const text = await page.locator("body").innerText();
  expect(text).not.toMatch(/Ch \d{3,}/);
  expect(text).not.toMatch(/[–—]/);
});

test("a row expands and collapses from the keyboard and shows every chapter by title", async ({ page }) => {
  await page.goto("/admin.html");
  await ready(page);
  await page.locator("#q").focus();
  await page.keyboard.press("Tab"); await page.keyboard.press("Tab"); await page.keyboard.press("Tab");
  const btn = page.locator('#users [data-id="p1"] .exp');
  await expect(btn).toBeFocused();
  await expect(btn).toHaveAttribute("aria-expanded", "false");
  await page.keyboard.press("Enter");
  await expect(btn).toHaveAttribute("aria-expanded", "true");
  const det = page.locator("#det-p1");
  await expect(det).toBeVisible();
  await expect(det).toContainText("Private Pilot: Danny's Logbook");
  await expect(det).toContainText("Discovery Flight"); // chapter 1's title, read from courses/pilot/full/ch01.js
  await expect(det).toContainText("Done, quiz 8/10");
  await expect(det).toContainText(/3 of \d+ decisions/);
  await expect(det).toContainText("INCOSE ASEP: Hearth");
  await expect(det).toContainText("PMP: The Halcyon Launch");
  await expect(det).toContainText("Full Course, first edition (retired)");
  await expect(det).toContainText("Refresher, first edition (retired)");
  await expect(det).toContainText("Done, 24/30");
  await expect(det).toContainText("Practice exam results");
  await expect(det).toContainText("2 attempts, last 41/60");
  await expect(det).toContainText("Library (pins and last played)");
  await expect(det).toContainText("other");
  await expect(det).toContainText("Last sign in");
  await expect(det).toContainText("not recorded yet");
  await expect(det).toContainText("Picks up at");
  await expect(det).toContainText("Private Pilot, chapter 2");
  expect(await det.innerText()).not.toMatch(/Ch \d{3,}/);
  await page.keyboard.press("Space");
  await expect(btn).toHaveAttribute("aria-expanded", "false");
  await expect(det).toBeHidden();
});

test("expand all, collapse all, and the open rows are remembered", async ({ page }) => {
  await page.goto("/admin.html");
  await ready(page);
  await expect(page.locator("#users [role=listitem]")).toHaveCount(4);
  await page.locator("#expall").click();
  await expect(page.locator("#users .det:visible")).toHaveCount(4);
  await expect(page.locator("#expall")).toHaveText("Collapse all");
  await expect(page.locator("#det-a1")).toContainText("5 min ago");
  await page.reload();
  await ready(page);
  await expect(page.locator("#users .det:visible")).toHaveCount(4);
  await page.locator("#expall").click();
  await expect(page.locator("#users .det:visible")).toHaveCount(0);
  await expect(page.locator("#expall")).toHaveText("Expand all");
});

test("sort by name or joined, and filter by name or email", async ({ page }) => {
  await page.goto("/admin.html");
  await ready(page);
  await expect(page.locator("#users [role=listitem]")).toHaveCount(4);
  await page.locator("#sort").selectOption("name");
  expect(await names(page)).toEqual(["Admin Person", "Quiet Tester", "Test Player", "Zed Newcomer"]);
  await page.locator("#sort").selectOption("joined");
  expect(await names(page)).toEqual(["Zed Newcomer", "Quiet Tester", "Test Player", "Admin Person"]);
  await page.locator("#q").fill("tester@");
  expect(await names(page)).toEqual(["Quiet Tester"]);
  await page.locator("#q").fill("zed");
  expect(await names(page)).toEqual(["Zed Newcomer"]);
  await page.locator("#q").fill("nobody here");
  await expect(page.locator("#users")).toContainText("No players match that.");
  await page.locator("#q").fill("");
  await expect(page.locator("#users [role=listitem]")).toHaveCount(4);
});

test("a collapsed row shows the running streak and badges earned without getting taller", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/admin.html");
  await ready(page);
  const p1 = page.locator('#users [data-id="p1"]');
  await expect(p1.locator(".xs")).toHaveText(/3\s*day listening streak\s*4\s*badges earned/);
  await expect(page.locator('#users [data-id="t1"] .xs')).toHaveCount(0); // no streak running, nothing earned: no marks
  // the marks sit under the last active time, beside the name and email, so the row is no taller than the player cell makes it
  const h = await page.evaluate(() => Object.fromEntries([...document.querySelectorAll("#users [data-id]")].map(r => [r.dataset.id, ["pr", "who", "c-la"].map(c => r.querySelector("." + c).getBoundingClientRect().height)])));
  expect(h.p1[2]).toBeLessThanOrEqual(h.p1[1] + 0.5);
  expect(h.a1[0]).toBe(h.t1[0]); // same layout with and without marks
  for (const id of ["a1", "p1", "t1", "n1"]) expect(h[id][0]).toBeLessThan(80);
});

test("the details show the picture, streaks, time, and per book readiness, chapters and badges", async ({ page }) => {
  await page.goto("/admin.html");
  await ready(page);
  await page.locator('#users [data-id="p1"] .exp').click();
  const det = page.locator("#det-p1");
  await expect(det.locator(".av img")).toHaveAttribute("src", "cast/v2/ada.svg");
  await expect(det).toContainText("Cast portrait, Ada, PMP");
  await expect(det).toContainText("3 days now, best 7 days");
  await expect(det).toContainText("12.5 hours listened, 2.5 hours read");
  const pilot = det.locator("dl.bk").filter({ hasText: "Discovery Flight" });
  await expect(pilot).toContainText(/64, target 80, as of \w{3} \d+/);
  await expect(pilot).toContainText("1 of 12");
  await expect(pilot).toContainText("8.3 hours listened, 1.7 hours read");
  await expect(pilot.locator(".bdl li")).toHaveCount(3);
  await expect(pilot.locator(".bdl li").nth(0)).toContainText("pilot-gone-badge"); // oldest first; a badge the defs no longer have shows its id
  await expect(pilot.locator(".bdl li").nth(1)).toContainText("Current");
  await expect(pilot.locator(".bdl li").nth(2)).toContainText("Discovery Flight");
  await expect(pilot.locator(".bdl li.back")).toHaveCount(0);
  const pmp = det.locator("dl.bk").filter({ hasText: "Twenty Six Months" });
  await expect(pmp).toContainText("Not enough yet, as of");
  await expect(pmp.locator(".bdl li.back")).toHaveCount(1);
  await expect(pmp.locator(".bdl li.back")).toContainText("backfilled");
  await expect(pmp).toContainText("Dashed ones were backfilled");
  await expect(pmp).toContainText("Mission patches");
  await expect(pmp).toContainText("Launch poll");
  await expect(det).toContainText("Study log");
  await expect(det.locator(".chs")).toContainText(["8.3 hours listened, 1.7 hours read"]);
  await expect(det).toContainText("Badges and readiness");
  await expect(det).toContainText("3 earned");
  expect(await det.innerText()).not.toMatch(/[–—]|undefined|NaN|null|\[object/);
  // a book card avatar, no listening, and an empty record
  await page.locator('#users [data-id="t1"] .exp').click();
  const t1 = page.locator("#det-t1");
  await expect(t1).toContainText("ID card, CISA");
  await expect(t1.locator(".av .sw")).toHaveCount(1);
  await expect(t1).toContainText("0 days now, best 0 days");
  await expect(t1).toContainText("none listened, 10 min read");
  await expect(t1.locator("dl.bk")).toContainText("Not checked yet");
  await expect(t1.locator("dl.bk")).toContainText("None yet");
});

test("a player with no study log, no badges record and no picture shows nothing broken", async ({ page }) => {
  await page.goto("/admin.html");
  await ready(page);
  for (const id of ["n1", "a1"]) {
    await page.locator(`#users [data-id="${id}"] .exp`).click();
    const det = page.locator(`#det-${id}`);
    await expect(det).toContainText("None picked");
    await expect(det).toContainText("None logged yet");
    await expect(det.locator("dl.bk")).toHaveCount(0);
    expect(await det.innerText()).not.toMatch(/undefined|NaN|null|\[object/);
  }
  // an older server without these fields: the details just leave them out
  await page.unroute(/\/api\//);
  await page.route(/\/api\//, route => {
    const u = new URL(route.request().url());
    if (u.pathname === "/api/admin" && u.searchParams.get("action") === "overview") return route.fulfill({ json: { users: USERS().map(({ avatar, study, books, ...x }) => x), invites: [], lastLogin: true } });
    if (u.pathname === "/api/admin") return route.fulfill({ json: { signups: [] } });
    return route.fulfill({ json: { reports: [] } });
  });
  await page.reload();
  await ready(page);
  await expect(page.locator("#stats")).not.toContainText("listened, last 7 days");
  await page.locator('#users [data-id="p1"] .exp').click();
  await expect(page.locator("#det-p1")).toContainText("Discovery Flight");
  await expect(page.locator("#det-p1")).not.toContainText("Picture");
  await expect(page.locator("#det-p1")).not.toContainText("Listening streak");
  expect(await page.locator("#det-p1").innerText()).not.toMatch(/undefined|NaN|\[object/);
});

for (const scheme of ["light", "dark"]) for (const width of [390, 1280]) {
  test(`no sideways scroll at ${width}px, ${scheme}, collapsed and expanded`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/admin.html");
    await ready(page);
    await expect(page.locator("#users [role=listitem]")).toHaveCount(4);
    expect(await noSideScroll(page)).toBe(true);
    await page.locator("#expall").click();
    await expect(page.locator("#det-p1")).toContainText("Discovery Flight");
    expect(await noSideScroll(page)).toBe(true);
    // tap targets
    for (const sel of ["#users .exp", "#users [data-tester]", "#users [data-u]", "#expall"]) {
      for (const el of await page.locator(sel).all()) { const b = await el.boundingBox(); expect(b.height).toBeGreaterThanOrEqual(24); }
    }
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bg).toBe(scheme === "dark" ? "rgb(18, 20, 23)" : "rgb(243, 241, 236)");
  });
}
