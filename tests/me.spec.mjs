// The private profile page (#me, Phase 2 of badges and profiles, 2026-10-14). On localhost it renders from what's on this device: the ID
// card header for the book with the most progress, the listening streak and hours from every book's study log (905), and a card per
// started book with readiness (live for the open book, the badges record's snapshot for the others) and its earned badges. Name and
// picture stay in local storage there, split by the test profile. Online (halcyon.test, the API mocked) they round trip through /api/me;
// the test profile never writes to /api/me or /api/progress; signed out, #me shows the sign in page. Made-up players only.
import { test, expect } from "@playwright/test";
import { seedMe } from "./fixtures/me_seed.mjs";

const HOST = "http://halcyon.test", LOCAL = "http://localhost:4321", TP = "halcyon-qa-test:";
const noDialogs = page => page.on("dialog", d => { throw new Error("a browser dialog opened: " + d.message()) });
const noSideScroll = async (page, where) => expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), `side scroll on ${where}`).toBeLessThanOrEqual(0);
const ls = (page, k) => page.evaluate(k => JSON.parse(localStorage.getItem(k) || "null"), k);

async function online(page, user, me, progress = {}) {
  const calls = { me: [], progress: [] };
  await page.route(HOST + "/**", async r => {
    const req = r.request(), u = new URL(req.url());
    if (u.pathname === "/api/auth") return r.fulfill({ json: u.searchParams.get("action") === "me" ? { user, progress } : { ok: true } });
    if (u.pathname === "/api/me") {
      calls.me.push({ method: req.method(), body: req.method() === "GET" ? null : req.postDataJSON() });
      if (req.method() === "POST") { const b = req.postDataJSON(); if ("name" in b) me.name = b.name; if ("avatar" in b) me.avatar = b.avatar; return r.fulfill({ json: { ok: true, me } }); }
      return r.fulfill({ json: { me } });
    }
    if (u.pathname === "/api/progress") { calls.progress.push(req.postDataJSON()); return r.fulfill({ json: { ok: true } }); }
    if (u.pathname.startsWith("/api/") || u.pathname.startsWith("/_vercel/")) return r.fulfill({ status: 404, body: "" });
    try { await r.fulfill({ response: await r.fetch({ url: LOCAL + u.pathname + u.search }) }); } catch (e) {}
  });
  return calls;
}

test("localhost: #me renders the ID card, streak, hours and a card per started book from the badges records and study logs", async ({ page }) => {
  noDialogs(page);
  await page.goto("/#guide");
  await expect(page.locator("#page h1")).toBeVisible();
  const want = await page.evaluate(seedMe, { lead: "pmp" });
  await page.goto("/#me");
  await page.reload();
  await expect(page.locator("#username")).toHaveText("Profile"); // no name yet on localhost: the nav says Profile
  const head = page.locator("#mepage .mecard .idcard");
  await expect(head).toHaveClass(/id-pmp/); // 3 of 15 beats 1 of 12
  await expect(head).toContainText("Logs from Ares: 3");
  await expect(head.locator(".idslots i.on")).toHaveCount(3);
  await expect(head.locator(".idblank")).toHaveText("Your name");
  await expect(page.locator("#mepage .mepriv")).toHaveText("Only you and the site admin can see this page.");
  await expect(page.locator("#username")).toHaveClass(/\bon\b/);
  await expect(page).toHaveURL(/#me$/);

  const stats = page.locator(".mestats");
  await expect(stats).toContainText("Studying since");
  await expect(stats).toContainText(await page.evaluate(d => { const [y, m, x] = d.split("-").map(Number); return new Date(y, m - 1, x).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) }, want.first));
  await expect(stats.locator("div", { hasText: "Listening streak" }).locator("dd")).toHaveText("3 days");
  await expect(stats).toContainText("Best 5 days");
  await expect(stats.locator("div", { hasText: "Hours listened" }).locator("dd")).toHaveText((want.listen / 3600).toFixed(1));
  await expect(stats.locator("div", { hasText: "Hours read" }).locator("dd")).toHaveText((want.read / 3600).toFixed(1));

  const books = page.locator(".mbook");
  await expect(books).toHaveCount(2);
  await expect(books.nth(0)).toHaveAttribute("data-book", "pmp");
  const cisa = page.locator('.mbook[data-book="cisa"]'), pmp = page.locator('.mbook[data-book="pmp"]');
  await expect(cisa.locator(".mbrow").first()).toContainText("1 of 12");
  await expect(cisa).toContainText("Ready to sign");
  await expect(cisa).toContainText("64");
  await expect(cisa.locator(".mbasof")).toContainText("Last updated"); // the record's snapshot, not this visit
  await expect(pmp.locator(".mbrow").first()).toContainText("3 of 15");
  await expect(pmp).toContainText("Launch poll");
  await expect(pmp.locator(".mbasof")).toHaveCount(0); // the open book's readiness is live
  await expect(pmp.locator(".mbmini li")).toHaveCount(5); // the five PMP badges in the seed, newest first
  await expect(pmp.locator(".mbshelf .mbrow")).toContainText("of 25");
  await expect(page.locator(".mbook").filter({ hasText: "Hearth" })).toHaveCount(0); // not started: no card
  await noSideScroll(page, "#me at 390");

  // See all opens that book's shelf
  await cisa.locator("[data-seeall]").click();
  await expect(page.locator("#shelf")).toBeVisible();
  await expect(page.locator("#shelf h2")).toContainText("Case file stamps");
  await expect(page).toHaveURL(/#cisa\/progress$/); // the address follows a moment later (navSync)
});

test("localhost: the name form edits inline and updates the nav; the picture picker swaps the card or the portrait; the test profile keeps its own", async ({ page }) => {
  noDialogs(page);
  await page.goto("/#guide");
  await expect(page.locator("#page h1")).toBeVisible();
  await page.evaluate(seedMe, { lead: "cisa" });
  await page.goto("/#me");
  await page.reload();
  await expect(page.locator("#mepage .mecard .idcard")).toHaveClass(/id-cisa/);

  // a blank name is refused in the page, no dialog
  await page.locator("#meedit").click();
  await expect(page.locator("#mename")).toBeFocused();
  await page.locator("#mename").fill("   ");
  await page.locator("#meform button[type=submit]").click();
  await expect(page.locator("#meerr")).toHaveText("Type a name.");
  await page.locator("#mename").fill("  Robin \u0007  Vale ");
  await page.locator("#meform button[type=submit]").click();
  await expect(page.locator("#meform")).toHaveCount(0);
  await expect(page.locator("#mepage h1.mename")).toHaveText("Robin Vale");
  await expect(page.locator("#username")).toHaveText("Robin Vale");
  await expect(page.locator(".mecard .idname")).toHaveText("Robin Vale");
  expect((await ls(page, "halcyon.me")).name).toBe("Robin Vale");
  // Escape cancels
  await page.locator("#meedit").click();
  await page.locator("#mename").fill("Someone Else");
  await page.locator("#mename").press("Escape");
  await expect(page.locator("#username")).toHaveText("Robin Vale");

  // the picker: ID cards from started books, main cast from chapter 1 only, never a later chapter's person
  await page.locator("#mepickbtn").click();
  const pick = page.locator("#mepick");
  await expect(pick).toBeVisible();
  await expect(pick.locator('[data-av="auto"]')).toHaveAttribute("aria-pressed", "true");
  await expect(pick.locator('[data-av^="card:"]')).toHaveCount(2);
  await expect(pick.locator('[data-av="card:asep"]')).toHaveCount(0);
  await expect(pick.locator('[data-av="cast:cisa:henry"]')).toHaveCount(1);
  await expect(pick.locator('[data-av="cast:cisa:laura"]')).toHaveCount(0); // she isn't met in chapter 1
  await noSideScroll(page, "the picker at 390");
  await pick.locator('[data-av="card:pmp"]').click();
  await expect(page.locator("#mepage .mecard .idcard")).toHaveClass(/id-pmp/);
  await expect(pick.locator('[data-av="card:pmp"]')).toHaveAttribute("aria-pressed", "true");
  expect((await ls(page, "halcyon.me")).avatar).toEqual({ kind: "card", course: "pmp" });
  await pick.locator('[data-av="cast:cisa:henry"]').click();
  await expect(page.locator("#mepage .mecard .idcard")).toHaveClass(/id-cisa/); // a portrait goes on the furthest book's card
  await expect(page.locator(".mecard .idphoto img")).toHaveAttribute("src", /courses\/cisa\/cast\/henry\.(jpg|svg)$/);
  expect((await ls(page, "halcyon.me")).avatar).toEqual({ kind: "cast", course: "cisa", id: "henry" });
  await pick.locator('[data-av="auto"]').click();
  expect((await ls(page, "halcyon.me")).avatar).toBeUndefined();
  await page.locator("#mepickdone").click();
  await expect(page.locator("#mepick")).toHaveCount(0);

  // the test profile: its own name and picture, the real ones untouched
  await page.goto("/?test=1#me");
  await expect(page.locator("#tpbadge")).toBeVisible();
  await page.goto("/#me");
  await expect(page.locator("#username")).toHaveText("Profile");
  await page.locator("#meedit").click();
  await page.locator("#mename").fill("Tess Tester");
  await page.locator("#meform button[type=submit]").click();
  await expect(page.locator("#username")).toHaveText("Tess Tester");
  expect((await ls(page, TP + "me")).name).toBe("Tess Tester");
  expect((await ls(page, "halcyon.me")).name).toBe("Robin Vale");
});

test("online: name and picture round trip through /api/me, and the nav updates", async ({ page }) => {
  noDialogs(page);
  const me = { name: "Robin Vale", joined: "2026-09-01T10:00:00.000Z", avatar: { kind: "card", course: "cisa" } };
  // the seeded progress comes from the server, as it would after a sign in (signing in clears this device's copy)
  await page.goto(LOCAL + "/#guide");
  await page.evaluate(seedMe, { lead: "pmp" });
  const progress = await page.evaluate(() => Object.fromEntries(Object.keys(localStorage).filter(k => /^halcyon\.c\d+$/.test(k)).map(k => [k.slice(9), JSON.parse(localStorage.getItem(k))])));
  const calls = await online(page, { name: "Robin Vale", admin: false, tester: false, cur: 0 }, me, progress);
  await page.goto(HOST + "/#me");
  await expect(page.locator("#username")).toHaveText("Robin Vale");
  await expect(page.locator("#mepage .mecard .idcard")).toHaveClass(/id-cisa/); // the server's picture: the CISA card
  await expect(page.locator(".mestats")).toContainText("Joined");
  await expect(page.locator(".mestats")).toContainText("Sep 1, 2026");
  expect(calls.me.filter(c => c.method === "GET").length).toBe(1);

  await page.locator("#meedit").click();
  await page.locator("#mename").fill("Robin A. Vale");
  await page.locator("#meform button[type=submit]").click();
  await expect(page.locator("#username")).toHaveText("Robin A. Vale");
  await expect(page.locator("#mepage h1.mename")).toHaveText("Robin A. Vale");
  expect(calls.me.filter(c => c.method === "POST").map(c => c.body)).toEqual([{ name: "Robin A. Vale" }]);

  await page.locator("#mepickbtn").click();
  await page.locator('#mepick [data-av="cast:pmp:ruth"]').click();
  await expect(page.locator(".mecard .idphoto img")).toHaveAttribute("src", /cast\/v2\/ruth\.(jpg|svg)$/);
  expect(calls.me.filter(c => c.method === "POST").pop().body).toEqual({ avatar: { kind: "cast", course: "pmp", id: "ruth" } });
  expect(await ls(page, "halcyon.me"), "online, the name and picture live on the server, not this device").toBe(null);
  await noSideScroll(page, "#me online");
});

test("online: a failed save shows the error in the page and keeps the old name", async ({ page }) => {
  noDialogs(page);
  await page.route(HOST + "/**", async r => {
    const req = r.request(), u = new URL(req.url());
    if (u.pathname === "/api/auth") return r.fulfill({ json: { user: { name: "Robin Vale", admin: false, tester: false, cur: 0 }, progress: {} } });
    if (u.pathname === "/api/me") return req.method() === "POST" ? r.fulfill({ status: 500, json: { error: "That didn't save. Give it a minute and try again." } }) : r.fulfill({ status: 500, json: {} });
    if (u.pathname.startsWith("/api/") || u.pathname.startsWith("/_vercel/")) return r.fulfill({ status: 404, body: "" });
    try { await r.fulfill({ response: await r.fetch({ url: LOCAL + u.pathname + u.search }) }); } catch (e) {}
  });
  await page.goto(HOST + "/#me");
  await expect(page.locator("#mepage h1.mename")).toHaveText("Robin Vale"); // GET failed: the session's name still shows
  await page.locator("#meedit").click();
  await page.locator("#mename").fill("New Name");
  await page.locator("#meform button[type=submit]").click();
  await expect(page.locator("#meerr")).toHaveText("That didn't save. Give it a minute and try again.");
  await expect(page.locator("#username")).toHaveText("Robin Vale");
});

test("online test profile: no POST to /api/me and nothing to /api/progress; edits stay in the test namespace", async ({ page }) => {
  noDialogs(page);
  const me = { name: "Test Admin", joined: "2026-09-01T10:00:00.000Z", avatar: null };
  const calls = await online(page, { name: "Test Admin", admin: true, tester: false, cur: 0 }, me);
  await page.goto(HOST + "/?test=1#guide");
  await expect(page.locator("#tpbadge")).toBeVisible();
  await page.evaluate(seedMe, { prefix: TP, lead: "pmp" });
  await page.goto(HOST + "/#me");
  await page.reload();
  await expect(page.locator("#tpbadge")).toBeVisible();
  await expect(page.locator("#username")).toHaveText("Test Admin");
  await page.locator("#meedit").click();
  await page.locator("#mename").fill("QA Runner");
  await page.locator("#meform button[type=submit]").click();
  await expect(page.locator("#username")).toHaveText("QA Runner");
  await page.locator("#mepickbtn").click();
  await page.locator('#mepick [data-av="card:cisa"]').click();
  await expect(page.locator("#mepage .mecard .idcard")).toHaveClass(/id-cisa/);
  expect(await ls(page, TP + "me")).toEqual({ name: "QA Runner", avatar: { kind: "card", course: "cisa" } });
  await page.waitForTimeout(1500);
  expect(calls.me.filter(c => c.method !== "GET"), "no write to /api/me from the test profile").toEqual([]);
  expect(calls.progress, "no /api/progress from the test profile").toEqual([]);
  expect(me.name).toBe("Test Admin");
});

test("signed out: #me shows the sign in page and never asks /api/me", async ({ page }) => {
  noDialogs(page);
  const calls = await online(page, null, { name: "", joined: null, avatar: null });
  await page.goto(HOST + "/#me");
  await expect(page.locator("#page h1")).toHaveText("Sign in");
  await expect(page.locator("#mepage")).toHaveCount(0);
  expect(calls.me).toEqual([]);
});
