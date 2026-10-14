// The admin page's Production section (2026-10-14): book summaries, the ear list with OK and Redo, and a chapter grid per book.
// /api/admin is mocked with a small in-memory board (made-up books and lines); a verdict saved through it must survive a reload.
import { test, expect } from "@playwright/test";

const BOARD = () => ({
  updated: "Wed Oct 14",
  books: [
    { id: "bk1", ord: 1, title: "A Made Up Book", cert: "TEST", planned: 4, note: "Two chapters written.", chapters: [
      { n: 1, title: "First Light", text: "done", exam: "done", audio: "done", heard: "done", live: "done", note: "" },
      { n: 2, title: "Second Wind", text: "done", exam: "done", audio: "running", heard: "todo", live: "partial", note: "Recording now." }] },
    { id: "bk2", ord: 2, title: "Another Book", cert: "OTHER", planned: 2, chapters: [
      { n: 1, title: "Only One", text: "done", exam: "queued", audio: "todo", heard: "todo", live: "todo", note: "" }] }],
  ears: [
    { id: "bk1-ch2-s1", ord: 1, book: "A Made Up Book", where: "Ch2, page s1 at 0:04", at: "0:04", line: "\"Hello there.\"", listen_for: "Clear?", url: "https://audio.example.com/a.mp3", verdict: "", note: "" },
    { id: "bk1-ch2-s2", ord: 2, book: "A Made Up Book", where: "Ch2, page s2 at 1:10", at: "1:10", line: "\"Again.\"", listen_for: "Too quick?", url: "", verdict: "ok", note: "fine" }],
});
let STATE;
async function stub(page, { admin = true } = {}) {
  await page.route(/\/api\//, async route => {
    const req = route.request(), u = new URL(req.url());
    if (u.pathname === "/api/admin") {
      if (!admin) return route.fulfill({ status: 403, json: { error: "Admins only." } });
      const a = u.searchParams.get("action");
      if (a === "overview") return route.fulfill({ json: { users: [], invites: [], lastLogin: true } });
      if (a === "list") return route.fulfill({ json: { signups: [] } });
      if (a === "board") return route.fulfill({ json: STATE });
      if (a === "ear_verdict" || a === "ear_note") {
        const b = JSON.parse(req.postData() || "{}"), e = STATE.ears.find(x => x.id === b.id);
        if (!e) return route.fulfill({ status: 404, json: { error: "That line isn't on the list anymore." } });
        if (a === "ear_verdict") e.verdict = b.verdict; else e.note = b.note;
        return route.fulfill({ json: { ok: true, id: e.id, verdict: e.verdict, note: e.note } });
      }
      return route.fulfill({ json: { ok: true } });
    }
    if (u.pathname === "/api/qa-report") return route.fulfill({ json: { reports: [], since: null } });
    return route.fulfill({ status: 404, body: "" });
  });
  // the audio host isn't reachable in tests; an <audio preload="none"> never asks for it anyway
}
const noSideScroll = page => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
test.beforeEach(() => { STATE = BOARD(); });

test("Production: summaries count done chapters against what's planned, and each book has a stage grid", async ({ page }) => {
  await stub(page);
  await page.goto("/admin.html#prod-sec");
  await expect(page.locator("#produpd")).toHaveText("Updated Wed Oct 14.");
  const b1 = page.locator('#prodsum [data-book="bk1"]');
  await expect(b1.locator('[data-count="text"]')).toHaveText("2/4");
  await expect(b1.locator('[data-count="audio"]')).toHaveText("1/4");
  await expect(b1.locator('[data-count="heard"]')).toHaveText("1/4");
  await expect(page.locator('#prodsum [data-book="bk2"] [data-count="live"]')).toHaveText("0/2");
  await expect(page.locator("#prodbooks .pbook")).toHaveCount(2);
  const row2 = page.locator("#prodbooks .pbook").first().locator("tr").nth(2);
  await expect(row2).toContainText("Second Wind");
  await expect(row2).toContainText("Recording now.");
  await expect(row2.locator(".st.running")).toHaveCount(1);
  await expect(page.locator("nav.jump a", { hasText: "Production" })).toHaveAttribute("href", "#prod-sec");
});

test("Ear list: open lines first, OK and Redo save and survive a reload, a note saves, clearing works", async ({ page }) => {
  await stub(page);
  await page.goto("/admin.html#prod-sec");
  await expect(page.locator("#ears .ear")).toHaveCount(1);
  const open = page.locator('#ears [data-ear="bk1-ch2-s1"]');
  await expect(open.locator("audio")).toHaveAttribute("preload", "none");
  await expect(open.locator("a", { hasText: "Open audio" })).toHaveAttribute("target", "_blank");
  await expect(page.locator("#earsdone-s")).toHaveText("Already marked (1)");
  await open.locator("button", { hasText: "Redo" }).click();
  await expect(page.locator("#ears .ear")).toHaveCount(0);
  await expect(page.locator("#ears")).toContainText("Nothing to hear right now");
  expect(STATE.ears[0].verdict).toBe("redo");
  await page.reload();
  await page.locator("#earsdone-w summary").click();
  const marked = page.locator('#earsdone [data-ear="bk1-ch2-s1"]');
  await expect(marked).toHaveClass(/redo/);
  await expect(marked.locator("button", { hasText: "Redo" })).toHaveAttribute("aria-pressed", "true");
  await marked.locator("textarea").fill("A beat too fast.");
  await expect.poll(() => STATE.ears[0].note, { timeout: 4000 }).toBe("A beat too fast.");
  await marked.locator("button", { hasText: "Redo" }).click(); // pressing it again clears the verdict
  await expect(page.locator('#ears [data-ear="bk1-ch2-s1"]')).toHaveCount(1);
  expect(STATE.ears[0].verdict).toBe("");
  await expect(page.locator('#ears [data-ear="bk1-ch2-s1"] textarea')).toHaveValue("A beat too fast.");
  await page.locator('#ears [data-ear="bk1-ch2-s1"] button', { hasText: "OK" }).click();
  expect(STATE.ears[0].verdict).toBe("ok");
});

test("Production for a non-admin: the server says no, the page shows Admins only and no board, with no script errors", async ({ page }) => {
  const errs = []; page.on("pageerror", e => errs.push(String(e)));
  await stub(page, { admin: false });
  await page.goto("/admin.html#prod-sec");
  await expect(page.locator("h1")).toHaveText("Admins only");
  await expect(page.locator("#prod-sec")).toHaveCount(0);
  await page.waitForTimeout(300);
  expect(errs).toEqual([]);
});

test("Production when only the board fails to load: the rest of admin works and the section says so", async ({ page }) => {
  await stub(page);
  await page.route(/\/api\/admin\?action=board$/, route => route.fulfill({ status: 500, json: { error: "Something went wrong." } }));
  await page.goto("/admin.html#prod-sec");
  await expect(page.locator("#produpd")).toHaveText("Couldn't load the production board.");
  await expect(page.locator("#ears .ear")).toHaveCount(0);
});

for (const width of [390, 1280]) for (const scheme of ["light", "dark"]) {
  test(`Production: no sideways scroll at ${width}px, ${scheme}, grids scroll in their own box, buttons big enough`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ colorScheme: scheme });
    await stub(page);
    await page.goto("/admin.html#prod-sec");
    await expect(page.locator("#prodbooks .pbook")).toHaveCount(2);
    expect(await noSideScroll(page)).toBe(true);
    const small = await page.locator("#prod-sec .ear button, #prod-sec .ear a").evaluateAll(els => els.filter(e => { const r = e.getBoundingClientRect(); return r.width < 24 || r.height < 24; }).length);
    expect(small).toBe(0);
    if (width === 390) {
      const wrap = await page.locator("#prodbooks .tw").first().evaluate(e => ({ sw: e.scrollWidth, cw: e.clientWidth }));
      expect(wrap.sw).toBeGreaterThan(wrap.cw); // the grid scrolls inside its box, not the page
    }
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(scheme === "dark" ? bg !== "rgb(243, 241, 236)" : bg === "rgb(243, 241, 236)").toBe(true);
  });
}
