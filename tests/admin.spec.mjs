// The admin page's Players section (2026-10-13): one compact line per player, details on demand, decoded chapter keys, last active,
// last sign in, sort and filter, and the summary strip. /api/admin, /api/qa-report are mocked with made-up players; everything else
// (admin.html, courses.js, the chapter files it reads titles from) comes from the local test server.
import { test, expect } from "@playwright/test";

const ago = ms => new Date(Date.now() - ms).toISOString();
const H = 3600e3, D = 24 * H;
const USERS = () => [
  { id: "a1", email: "admin@example.com", name: "Admin Person", is_admin: true, is_tester: false, disabled: false, cur: 0, created_at: ago(40 * D), last_login_at: ago(5 * 60e3), progress: [] },
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
    { chapter: 60000, updated: ago(9 * D) }] },
  { id: "t1", email: "tester@example.com", name: "Quiet Tester", is_admin: false, is_tester: true, disabled: false, cur: 50101, created_at: ago(10 * D), last_login_at: ago(3 * D), progress: [
    { chapter: 50101, updated: ago(3 * D), pos: 2, picks: 1 }] },
  { id: "n1", email: "new@example.com", name: "Zed Newcomer", is_admin: false, is_tester: false, disabled: true, cur: 0, created_at: ago(2 * D), last_login_at: null, progress: [] },
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
  await expect(page.locator("#stats .stat")).toHaveText(["4players", "2active, last 7 days", "1tester", "1open invite", "2QA reports, last 7 days"]);
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
