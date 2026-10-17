// Field guide media (2026-10-17, redone the same day for daylight, everyday looks): the "In real life" photo on every entry, the painted
// Stand 2 scene with its code-drawn labels (shown from chapter 1, it's the stand's normal look), the photo thumbnail in the sheet, and no
// sideways scroll at 390px.
// Expected text (alt, caption, credit, scene chapter) is read from window.HALCYON_GUIDE, never typed here.
import { test, expect } from "@playwright/test";

const fresh = extra => ({ pos: 0, max: 0, picks: {}, m: { trust: 50, conf: 50, health: 50 }, score: 0, flags: {}, dom: { "People": [0, 0], "Process": [0, 0], "Business Environment": [0, 0] }, drills: {}, ex: null, quiz: null, ...extra });
async function seed(page, kv) { await page.evaluate(kv => { localStorage.clear(); for (const [k, v] of Object.entries(kv)) localStorage.setItem("halcyon." + k, JSON.stringify(v)) }, kv) }
async function open(page, route) { await page.goto("about:blank"); await page.goto(route) }
const guide = page => page.evaluate(() => window.HALCYON_GUIDE.pmp.map(e => ({ id: e.id, title: e.title, photo: e.photo || null, scene: e.scene ? { ...e.scene, overlay: undefined } : null })));
const noSideScroll = page => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
const loaded = img => img.evaluate(async i => { i.scrollIntoView(); if (!i.complete) await new Promise(r => { i.onload = i.onerror = r }); return i.naturalWidth > 0 });

test("every entry page shows its In real life photo, with alt text, caption and credit, sized before it loads", async ({ page }) => {
  await page.goto("/#pmp/home");
  await seed(page, { c202: fresh() });
  await open(page, "/#pmp/guide");
  const G = await guide(page);
  expect(G.map(e => e.id)).toEqual(["breather", "campus", "stand"]);
  for (const e of G) {
    expect(e.photo, e.id).not.toBeNull();
    await open(page, "/#pmp/guide/" + e.id);
    await expect(page.locator("#page h1")).toHaveText(e.title);
    const fig = page.locator(`#page figure.fgphoto[data-fgphoto="${e.id}"]`);
    await expect(fig).toHaveCount(1);
    await expect(page.locator("#page h2", { hasText: "In real life" })).toHaveCount(1);
    const img = fig.locator("img");
    await expect(img).toHaveAttribute("alt", e.photo.alt);
    expect(e.photo.alt.length, e.id).toBeGreaterThan(20);
    await expect(img).toHaveAttribute("loading", "lazy");
    await expect(img).toHaveAttribute("width", String(e.photo.w));
    await expect(img).toHaveAttribute("height", String(e.photo.h));
    await expect(fig.locator("figcaption")).toContainText(e.photo.caption);
    await expect(fig.locator(".fgcredit")).toHaveText("Photo: " + e.photo.credit);
    expect(await loaded(img), e.id).toBe(true);
    // the box keeps the photo's shape: no layout shift once it loads
    const box = await img.boundingBox();
    expect(Math.abs(box.width / box.height - e.photo.w / e.photo.h), e.id).toBeLessThan(0.02);
    // the diagram is still there, above it
    await expect(page.locator("#page .fgfig svg")).toHaveCount(1);
  }
});

test("the Stand 2 scene shows, labelled, from chapter 1", async ({ page }) => {
  await page.goto("/#pmp/home");
  const G = await guide(page);
  const st = G.find(e => e.id === "stand");
  expect(st.scene.from).toBe(1);
  // a brand new reader, chapter 1
  await seed(page, { c201: fresh() });
  await open(page, "/#pmp/guide/stand");
  await expect(page.locator("#page h1")).toHaveText(st.title);
  await expect(page.locator("#page .fgfig svg")).toHaveCount(1);
  await expect(page.locator("#page figure.fgphoto")).toHaveCount(1);
  const fig = page.locator('#page figure.fgscene[data-fgscene="stand"]');
  await expect(fig).toHaveCount(1);
  const img = fig.locator("img");
  await expect(img).toHaveAttribute("alt", st.scene.alt);
  await expect(img).toHaveAttribute("width", String(st.scene.w));
  await expect(img).toHaveAttribute("height", String(st.scene.h));
  await expect(fig.locator(".fgcredit")).toHaveText("Illustration generated with AI");
  await expect(fig.locator("figcaption")).toContainText(st.scene.caption);
  expect(await loaded(img)).toBe(true);
  // the labels lie over the picture and are drawn in code
  const labels = await fig.locator(".fgover svg text").allTextContents();
  for (const t of ["Test stand", "Departure", "stage", "Blockhouse", "400 m", "Front Range"]) expect(labels).toContain(t);
  expect(await fig.locator(".fgover svg path[stroke-dasharray]").count()).toBeGreaterThan(0);
  const [ib, ob] = [await img.boundingBox(), await fig.locator(".fgover svg").boundingBox()];
  for (const k of ["x", "y", "width", "height"]) expect(Math.abs(ib[k] - ob[k]), k).toBeLessThan(1.5);
  // the other entries have no scene
  for (const id of ["breather", "campus"]) { await open(page, "/#pmp/guide/" + id); await expect(page.locator("#page .fgscene")).toHaveCount(0) }
});

test("the sheet shows the photo as a small thumbnail with its credit", async ({ page }) => {
  await page.goto("/#pmp/full/1");
  await expect(page.locator(".story p").first()).toBeVisible();
  const G = await guide(page);
  await page.locator('a.fglink[data-fg="breather"]').click();
  const sheet = page.locator("#fgsheet");
  await expect(sheet).toBeVisible();
  const th = sheet.locator('figure.fgpthumb[data-fgphoto="breather"]');
  await expect(th).toHaveCount(1);
  await expect(th.locator("img")).toHaveAttribute("alt", G[0].photo.alt);
  await expect(th.locator(".fgcredit")).toHaveText("Photo: " + G[0].photo.credit);
  const b = await th.locator("img").boundingBox();
  expect(Math.round(b.width)).toBe(96);
  expect(await sheet.evaluate(s => s.scrollWidth <= s.clientWidth)).toBe(true);
  await expect(sheet.locator(".fgscene")).toHaveCount(0);
});

test("no sideways scroll at 390px on any entry page with every picture showing, and labels stay inside the scene", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#pmp/home");
  await seed(page, { spoilers: true });
  for (const id of ["breather", "campus", "stand"]) {
    await open(page, "/#pmp/guide/" + id);
    await expect(page.locator("#page figure.fgphoto")).toHaveCount(1);
    for (const i of await page.locator("#page figure img").all()) await loaded(i);
    expect(await noSideScroll(page), id).toBe(true);
    const off = await page.evaluate(() => [...document.querySelectorAll("#page .fgover svg text")].filter(t => { const b = t.getBoundingClientRect(), f = t.closest("svg").getBoundingClientRect(); return b.left < f.left - 1 || b.right > f.right + 1 }).map(t => t.textContent));
    expect(off, id).toEqual([]);
  }
  await expect(page.locator("#page .fgscene")).toHaveCount(1); // stand, last opened, with spoilers on
});
