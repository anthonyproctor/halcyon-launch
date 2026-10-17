// Field guide (prototype 2026-10-17): #pmp/guide, its entry pages, the sheet a linked word in a chapter opens, and the spoiler gate.
// Entries come from courses/pmp/guide.js; expected text is read from window.HALCYON_GUIDE, never typed here.
import { test, expect } from "@playwright/test";

const fresh = extra => ({ pos: 0, max: 0, picks: {}, m: { trust: 50, conf: 50, health: 50 }, score: 0, flags: {}, dom: { "People": [0, 0], "Process": [0, 0], "Business Environment": [0, 0] }, drills: {}, ex: null, quiz: null, ...extra });
async function seed(page, kv) { await page.evaluate(kv => { for (const [k, v] of Object.entries(kv)) localStorage.setItem("halcyon." + k, JSON.stringify(v)) }, kv) }
async function open(page, route) { await page.goto("about:blank"); await page.goto(route) }
const guide = page => page.evaluate(() => window.HALCYON_GUIDE.pmp.map(e => ({ id: e.id, title: e.title, what: e.what, levels: e.levels })));
const noSideScroll = page => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);

test("the guide page lists all three entries, linked from the nav next to Cast", async ({ page }) => {
  await page.goto("/#pmp/home");
  await seed(page, { c202: fresh() }); // chapter 2 started: every entry has a level open
  await open(page, "/#pmp/home");
  const nav = page.locator("#fguidelink");
  await expect(nav).toBeVisible();
  expect(await page.locator("#castlink + #fguidelink").count()).toBe(1);
  await nav.click();
  await expect(page).toHaveURL(/#pmp\/guide$/);
  await expect(page.locator("#page h1")).toHaveText("Field guide");
  const G = await guide(page);
  expect(G.map(e => e.id)).toEqual(["breather", "campus", "stand"]);
  const cards = page.locator("#fggrid .fgcard");
  await expect(cards).toHaveCount(3);
  for (const [i, e] of G.entries()) {
    await expect(cards.nth(i).locator(".fgtext b")).toHaveText(e.title);
    await expect(cards.nth(i).locator("svg")).toHaveCount(1);
  }
  // each entry page: picture with a title and a description, the what, and the chapter 1 and 2 levels only
  for (const e of G) {
    await page.locator(`#fggrid [data-fg="${e.id}"]`).click();
    await expect(page).toHaveURL(new RegExp(`#pmp/guide/${e.id}$`));
    await expect(page.locator("#page h1")).toHaveText(e.title);
    const svg = page.locator("#page .fgfig svg");
    await expect(svg).toHaveCount(1);
    expect(await svg.evaluate(s => !!s.querySelector(":scope > title")?.textContent && !!s.querySelector(":scope > desc")?.textContent)).toBe(true);
    await expect(page.locator("#page")).toContainText(e.what);
    for (const l of e.levels) {
      if (l.from <= 2) await expect(page.locator("#page")).toContainText(l.text);
      else await expect(page.locator("#page")).not.toContainText(l.text);
    }
    await page.locator("#fgback").click();
  }
});

test("a locked entry shows only Unlocks in chapter N, and nothing from later chapters shows", async ({ page }) => {
  await page.goto("/#pmp/guide"); // a new reader: chapter 1, where every real entry has opened
  const G = await guide(page);
  expect(G.every(e => Math.min(...e.levels.map(l => l.from)) === 1)).toBe(true);
  await expect(page.locator("#fggrid [data-fglocked]")).toHaveCount(0);
  // a locked entry: a fixture that opens in chapter 5, appended to the guide file for this test only
  const FIX = 'window.HALCYON_GUIDE.pmp.push({id:"fixture",title:"Fixture entry",kicker:"Test",aliases:["zzfixturezz"],svg:\'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><title>Fixture</title><desc>Fixture</desc></svg>\',what:"Fixture what text.",levels:[{from:5,text:"Fixture level text."}]});';
  await page.route("**/courses/pmp/guide.js", async route => { const r = await route.fetch(); await route.fulfill({ response: r, body: (await r.text()) + "\n" + FIX }) });
  await open(page, "/#pmp/guide");
  const locked = page.locator('#fggrid [data-fglocked="fixture"]');
  await expect(locked).toBeDisabled();
  await expect(locked).toContainText("Unlocks in chapter 5");
  await expect(locked).not.toContainText("Fixture entry");
  await expect(locked.locator("svg")).toHaveCount(0);
  await open(page, "/#pmp/guide/fixture");
  await expect(page.locator("#page")).toContainText("Unlocks in chapter 5.");
  await expect(page.locator("#page svg")).toHaveCount(0);
  await expect(page.locator("#page")).not.toContainText("Fixture what text.");
  await page.unroute("**/courses/pmp/guide.js");
  // open entries show chapter 1 only, and their pictures drop the parts marked for later chapters
  for (const [id, later, shown] of [["campus", ["Blockhouse", "Building 6", "stand road", "to Colorado Air and Space Port"], "High bay"], ["stand", ["Blockhouse", "Frost", "Ch 31 pressure", "400 m", "R-0419:", "STAND 2"], "MOIV-1"]]) {
    await open(page, "/#pmp/guide/" + id);
    const e = G.find(x => x.id === id);
    for (const l of e.levels) l.from <= 1 ? await expect(page.locator("#page")).toContainText(l.text) : await expect(page.locator("#page")).not.toContainText(l.text);
    const labels = await page.locator("#page .fgfig svg text").allTextContents();
    expect(labels).toContain(shown);
    for (const t of later) expect(labels, id).not.toContain(t);
    await expect(page.locator("#page")).toContainText("More unlocks in chapter 2.");
  }
});

test("an alias in a chapter opens the entry's sheet, without changing the page's words", async ({ page }) => {
  await page.goto("/#pmp/full/1");
  await expect(page.locator(".story p").first()).toBeVisible();
  const link = page.locator('a.fglink[data-fg="breather"]');
  await expect(link).toHaveCount(1); // first mention only
  await expect(link).toContainText("Breather");
  // the link wraps whole words: splitting the page into words (as the narration highlighter does) gives the same words with or without it
  const same = await page.evaluate(() => [...document.querySelectorAll("a.fglink")].every(a => {
    const p = a.closest("p"), words = el => { const out = [], tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); while (tw.nextNode()) out.push(...tw.currentNode.nodeValue.split(/\s+/).filter(Boolean)); return out };
    const c = p.cloneNode(true); c.querySelectorAll("a.fglink").forEach(x => x.replaceWith(...x.childNodes)); c.normalize();
    return JSON.stringify(words(p)) === JSON.stringify(words(c)) && p.textContent === c.textContent;
  }));
  expect(same).toBe(true);
  await link.click();
  const sheet = page.locator("#fgsheet");
  await expect(sheet).toBeVisible();
  await expect(sheet.locator("#fgtitle")).toHaveText("The Breather");
  await expect(sheet.locator("svg")).toHaveCount(1);
  const G = await guide(page);
  await expect(sheet).toContainText(G[0].levels.find(l => l.from === 1).text);
  await expect(sheet).not.toContainText(G[0].levels.find(l => l.from === 3).text);
  expect(await noSideScroll(page)).toBe(true);
  await page.keyboard.press("Escape");
  await expect(sheet).toHaveCount(0);
  await expect(link).toBeFocused();
  await expect(page).toHaveURL(/#pmp\/full\/1$/);
  // the sheet's button opens the full page
  await link.click();
  await page.locator("#fgfull").click();
  await expect(page).toHaveURL(/#pmp\/guide\/breather$/);
  await expect(page.locator("#page h1")).toHaveText("The Breather");
});

test("no sideways scroll at 390px on the guide, every entry and a chapter", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#pmp/home");
  await seed(page, { spoilers: true });
  for (const r of ["/#pmp/guide", "/#pmp/guide/breather", "/#pmp/guide/campus", "/#pmp/guide/stand", "/#pmp/full/2"]) {
    await open(page, r);
    await expect(page.locator("#page h1, #page h2").first()).toBeVisible();
    expect(await noSideScroll(page), r).toBe(true);
    const off = await page.evaluate(() => [...document.querySelectorAll("#page .fgfig svg text")].filter(t => { const b = t.getBoundingClientRect(), f = t.closest("svg").getBoundingClientRect(); return b.left < f.left - 1 || b.right > f.right + 1 }).map(t => t.textContent));
    expect(off, r).toEqual([]);
  }
});

test("dark mode: the guide uses the dark page colors", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/#pmp/guide");
  await expect(page.locator("#fggrid")).toBeVisible();
  const c = await page.evaluate(() => { const g = el => getComputedStyle(el); const card = document.querySelector(".fgcard"); return { page: g(document.querySelector("#page")).backgroundColor, ink: g(document.querySelector("#page h1")).color, card: g(card).backgroundColor, title: g(card.querySelector(".fgtext b")).color } });
  expect(c.page).toBe("rgb(26, 29, 33)");
  expect(c.card).toBe("rgb(26, 29, 33)");
  expect(c.ink).toBe("rgb(231, 229, 224)");
  expect(c.title).toBe("rgb(231, 229, 224)");
  await page.emulateMedia({ colorScheme: "light" });
  expect(await page.evaluate(() => getComputedStyle(document.querySelector("#page")).backgroundColor)).toBe("rgb(251, 250, 247)");
});
