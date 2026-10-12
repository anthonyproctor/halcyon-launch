// Halcyon smoke tests. Every live course: About page, chapter 1, the first decision, Contents, a lab where the course has one,
// the Audiobook, the Guide and Coming next, with no console errors and no sideways scroll at phone width (390px).
// Plus: the Library hides listed:false books, Coming next still shows them, analytics sends routes only, and the PMP v2 book is live.
import { test, expect } from "@playwright/test";
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const win = {};
vm.runInNewContext(fs.readFileSync(path.join(ROOT, "courses.js"), "utf8"), { window: win });
const COURSES = win.HALCYON_COURSES.filter(c => c.status === "live");

/* Console errors we expect and ignore. The engine probes optional media and falls back on purpose:
   - cast portraits: cast/<id>.jpg first, then cast/<id>.svg, then initials (avatar() onerror); PMP v2 has few portraits yet (cast/v2)
   - chapter art: art/full-chNN.jpg first, then the .svg, then no art (chapterArt() onerror)
   - narration: audio/pages/<page>/timings.json and audio/*.json are fetched to see whether a page has been narrated yet;
     courses or chapters that aren't recorded answer 404 and the Listen bar stays hidden
   - cast voice clips (cast/voice/<id>.mp3), removed from the page when missing
   Each is only ignored as a "Failed to load resource" 404 for that URL shape. Anything else fails the test. */
const IGNORE_404 = [
  /\/cast\/(v2\/)?[\w-]+\.(jpg|svg)$/,
  /\/cast\/(v2\/)?voice\/[\w-]+\.mp3$/,
  /\/art\/(v2\/)?full-ch\d+\.(jpg|svg)$/,
  /\/audio\/(v2\/)?pages\/[\w-]+\/timings\.json$/,
  /\/audio\/(v2\/)?(audiobook|bookmarks)\.json$/,
];

function watchErrors(page) {
  const errs = [];
  page.on("pageerror", e => errs.push(`pageerror: ${e.message}`));
  page.on("console", m => {
    if (m.type() !== "error") return;
    const url = (m.location() || {}).url || "";
    if (/Failed to load resource/.test(m.text()) && IGNORE_404.some(re => re.test(new URL(url, "http://x").pathname))) return;
    errs.push(`console: ${m.text()} ${url}`);
  });
  return errs;
}

// Measures layout only: the mouse is moved off and focus dropped first, so a hover tooltip ([data-tip]::after) isn't counted.
async function noSideScroll(page, where) {
  await page.mouse.move(1, 1);
  await page.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur());
  const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(over, `horizontal scroll on ${where}`).toBeLessThanOrEqual(0);
}

for (const c of COURSES) {
  test(`${c.id}: about, chapter 1, decision, contents, labs, audiobook, guide, coming next`, async ({ page }) => {
    const errs = watchErrors(page);

    // About this book, with the not affiliated line
    await page.goto(`/#${c.id}/about`);
    await expect(page.locator("#page h1")).toHaveText(c.full_title || c.title);
    const marks = page.locator("#page .marks");
    await expect(marks).toContainText("not affiliated with or endorsed by");
    if (c.marks) await expect(marks).toContainText(c.marks);
    await expect(page.locator("#sitefoot")).toContainText("independent study stories");
    await noSideScroll(page, "about");

    // Chapter 1, then forward to the first decision and pick an option
    await page.locator("#aboutgo").click();
    await expect(page.locator("#page .chmap")).toBeVisible();
    await noSideScroll(page, "chapter 1 opening");
    for (let i = 0; i < 6 && !(await page.locator("#page .choice").count()); i++) await page.locator("#fnext").click();
    await page.locator("#page .choice").first().click();
    await expect(page.locator("#page .outcome")).toBeVisible();
    await noSideScroll(page, "first decision");

    // Contents
    await page.locator("#page details.contents > summary").click();
    await expect(page.locator("#page details.contents .secs")).toBeVisible();

    // Labs: the first chapter with a lab question that can be checked offline, answered right
    const found = await page.evaluate(id => {
      const all = (window.HALCYON_LABS || {})[id] || {};
      for (const n of Object.keys(all).map(Number).filter(n => n > 0).sort((a, b) => a - b)) {
        for (const lab of all[n]) {
          if (lab.kind === "live") continue; // live labs fetch a real feed; skip them here
          for (const q of lab.questions || []) {
            if (!q.check && typeof q.a !== "function" && ["choice", "number", "text"].includes(q.type)) return { n, lab: lab.id, q: q.id, type: q.type, a: q.a };
          }
        }
      }
      return Object.keys(all).length ? { none: true } : null;
    }, c.id);
    if (found) {
      expect(found.none, `a lab question in ${c.id} that can be checked offline`).toBeUndefined();
      const labCh = found.n, pick = found;
      if (labCh !== 1) {
        await page.goto(`/#${c.id}/full/${labCh}`);
        await page.locator("#page details.contents > summary").click();
      }
      await page.locator("#page details.contents .secs button", { hasText: /^Labs \(/ }).click();
      await expect(page.locator("#page h1")).toHaveText("Hands-on labs");
      const card = page.locator(`#lq-${pick.lab}-${pick.q}`);
      await expect(card).toBeVisible();
      if (pick.type === "choice") await card.locator(`input[type=radio][value="${pick.a}"]`).check();
      else await card.locator(`[data-qin="${pick.q}"]`).fill(String(pick.a));
      await card.locator(`[data-chk="${pick.q}"]`).click();
      await expect(page.locator(`#lq-${pick.lab}-${pick.q}`)).toHaveClass(/\bok\b/);
      await noSideScroll(page, `labs, chapter ${labCh}`);
    }

    // Audiobook, Guide, Coming next
    await page.locator("#listenlink").click();
    await expect(page.locator("#page h1")).toHaveText("Audiobook");
    await noSideScroll(page, "audiobook");
    await page.locator("#guidelink").click();
    await expect(page.locator("#page h1")).toHaveText("How to use it");
    await expect(page.locator("#page")).toContainText("anonymous page views");
    await noSideScroll(page, "guide");
    await page.locator("#guideup").click();
    await expect(page.locator("#page h1")).toHaveText("Coming next");
    await noSideScroll(page, "coming next");

    expect(errs).toEqual([]);
  });
}

test("library hides listed:false books; Coming next and direct links keep them", async ({ page }) => {
  const errs = watchErrors(page);
  await page.goto("/#library");
  await expect(page.locator("#page h1")).toHaveText("Your courses");
  const onShelf = await page.locator("#page .libgrid [data-course]").evaluateAll(els => els.map(e => e.dataset.course));
  const listed = COURSES.filter(c => c.listed !== false).map(c => c.id), hidden = COURSES.filter(c => c.listed === false).map(c => c.id);
  expect(hidden.sort()).toEqual(["asep", "cphims", "gh300"]);
  expect(onShelf.sort()).toEqual(listed.sort());
  expect(onShelf).toContain("cisa"); // the new flagship stays even with one chapter
  await expect(page.locator("#sitefoot")).toContainText("independent study stories");
  await noSideScroll(page, "library");

  await page.locator("#libup").click();
  await expect(page.locator("#page h1")).toHaveText("Coming next");
  for (const id of hidden) {
    const c = COURSES.find(x => x.id === id);
    const card = page.locator("#page .upshelf", { hasText: c.full_title });
    await expect(card).toContainText("In production");
    await card.locator(`[data-upabout="${id}"]`).click();
    await expect(page.locator("#page h1")).toHaveText(c.full_title);
    await expect(page.locator("#page .marks")).toContainText(c.marks);
    await page.goto("/#upcoming");
    await expect(page.locator("#page h1")).toHaveText("Coming next");
  }
  // a direct link to a hidden book still opens it
  await page.goto("/#cphims/full/1");
  await expect(page.locator("#page .chmap")).toBeVisible();
  expect(errs).toEqual([]);
});

test("analytics: one page view per screen, routes only, nothing personal", async ({ page }) => {
  const errs = watchErrors(page);
  await page.goto("/#library");
  await expect(page.locator("#page h1")).toHaveText("Your courses");
  await page.goto("/#pmp/about"); // hash change on the same page
  await expect(page.locator("#page h1")).toHaveText("The Halcyon Launch");
  await page.goto("/#pmp/full/1");
  await expect(page.locator("#page .chmap")).toBeVisible();
  const q = await page.evaluate(() => (window.vaq || []).map(([k, v]) => [k, typeof v === "function" ? "fn" : v]));
  const views = q.filter(([k]) => k === "pageview").map(([, v]) => v);
  expect(views.map(v => v.path)).toEqual(["/library", "/pmp/about", "/pmp/full/1"]);
  for (const v of views) expect(Object.keys(v)).toEqual(["path"]);
  expect(q.filter(([k]) => !["pageview", "beforeSend"].includes(k))).toEqual([]);
  // beforeSend drops the query string and hash
  const cleaned = await page.evaluate(() => { const f = window.vaq.find(([k]) => k === "beforeSend")[1]; return f({ url: "https://halcyon-launch.vercel.app/pmp/full/1?invite=abc123#pmp/full/1" }).url });
  expect(cleaned).toBe("https://halcyon-launch.vercel.app/pmp/full/1");
  // the tracking script only loads on the live https site
  expect(await page.locator('script[src*="/_vercel/insights/"]').count()).toBe(0);
  expect(errs).toEqual([]);
});

test("PMP: The Halcyon Launch v2 is the live book (video log card, no preview banner, v2 cast, v1 gone)", async ({ page, request }) => {
  const errs = watchErrors(page);
  await page.goto("/#pmp/about");
  await expect(page.locator("#page")).toContainText("Ares Station");
  await page.goto("/#pmp/full/1");
  await expect(page.locator("#page .chmap")).toBeVisible();
  await expect(page.locator(".v2badge")).toHaveCount(0);
  await expect(page.locator("#page .prop.pvlog").first()).toBeVisible();
  await expect(page.locator("#page .prop.pvlog .vtag").first()).toHaveText("Recorded");
  await noSideScroll(page, "v2 chapter 1");
  const st = await page.evaluate(() => ({ keys: Object.keys(localStorage).filter(k => /^halcyon\.c1\d\d$/.test(k)) }));
  expect(st.keys, "v1 Full Course keys (c101 to c115) are never written").toEqual([]);
  expect((await request.get("/full/ch01.js")).status()).toBe(404);
  expect((await request.get("/full/v2/ch01.js")).status()).toBe(200);
  expect(errs).toEqual([]);
});

// The email signup posts to /api/subscribe. Tests never reach production: the endpoint is mocked here.
test("signup: Coming next and About pages post to a mocked /api/subscribe; Guide privacy mentions the list", async ({ page }) => {
  const errs = watchErrors(page);
  const posts = [];
  await page.route("**/api/subscribe", async route => {
    const req = route.request();
    posts.push({ method: req.method(), body: req.postDataJSON() });
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
  });

  await page.goto("/#upcoming");
  await expect(page.locator("#page h1")).toHaveText("Coming next");
  const form = page.locator("#page form.signup");
  await expect(form).toContainText("Tell me when new books land");
  await expect(form).toContainText("We'll email you when new books or chapters land. Nothing else, and you can leave anytime.");
  // a bad address is caught in the page and never sent
  await form.locator("input[type=email]").fill("not-an-email");
  await form.locator("button[type=submit]").click();
  await expect(form.locator(".sgmsg")).toContainText("doesn't look right");
  expect(posts).toEqual([]);
  await form.locator("input[type=email]").fill("test+halcyon-smoke@example.com");
  await form.locator("button[type=submit]").click();
  await expect(form.locator(".sgmsg")).toContainText("you're on the list");
  expect(posts).toEqual([{ method: "POST", body: { email: "test+halcyon-smoke@example.com", source: "upcoming" } }]);
  await noSideScroll(page, "coming next signup");

  await page.goto("/#pmp/about");
  await expect(page.locator("#page h1")).toHaveText("The Halcyon Launch");
  const about = page.locator("#page form.signup");
  await about.locator("input[type=email]").fill("test+halcyon-smoke@example.com");
  await about.locator("button[type=submit]").click();
  await expect(about.locator(".sgmsg")).toContainText("you're on the list");
  expect(posts[1].body.source).toBe("about:pmp");
  await noSideScroll(page, "about signup");

  // a server error shows its message and keeps the field
  await page.unroute("**/api/subscribe");
  await page.route("**/api/subscribe", route => route.fulfill({ status: 429, contentType: "application/json", body: JSON.stringify({ error: "Too many tries from here. Try again in an hour." }) }));
  await page.goto("/#cisa/about");
  await expect(page.locator("#page h1")).toHaveText(COURSES.find(c => c.id === "cisa").full_title || COURSES.find(c => c.id === "cisa").title);
  const f3 = page.locator("#page form.signup");
  await f3.locator("input[type=email]").fill("test+halcyon-smoke@example.com");
  await f3.locator("button[type=submit]").click();
  await expect(f3.locator(".sgmsg")).toContainText("Too many tries");
  await expect(f3.locator("input[type=email]")).toBeVisible();

  await page.goto("/#guide");
  await expect(page.locator("#page")).toContainText("If you join the list, we store your email to tell you about new books. Ask to be removed anytime.");
  expect(errs.filter(e => !/429/.test(e))).toEqual([]);
});
