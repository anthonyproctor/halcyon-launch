// Final assessment and certificate of completion (PMP). Progress is mocked in localStorage, the way the engine stores it offline:
// chapter n of the v2 Full Course at halcyon.c{200+n}, the study log at halcyon.c905, final attempts at halcyon.c906.
// Covers: locked until every chapter is done (with Preview it anyway), a passing run to the certificate with the logged hours,
// a failing run with chapters to revisit, a fresh question and option order on a retake, and the #verify check.
import { test, expect } from "@playwright/test";
import crypto from "node:crypto";

const DOMS = { People: [0, 0], Process: [0, 0], "Business Environment": [0, 0] };
const chapterDone = n => ({ pos: 999, max: 999, picks: {}, m: { trust: 50, conf: 50, health: 50 }, score: 0, flags: {}, dom: DOMS, drills: {}, ex: null, quiz: null,
  ...(n <= 3 ? { doneAt: `2026-10-0${n}T15:00:00.000Z` } : {}) });
// 36.5 hours in all: 131,400 seconds over three days on one device, reading plus listening
const LOG = { v: 1, days: { "2026-10-01": { t: { dev1: [36000, 18000] }, a: ["c1", "l1"] }, "2026-10-05": { t: { dev1: [27000, 9000] }, a: ["q5"] }, "2026-10-10": { t: { dev1: [30000, 11400] }, a: ["b12"] } } };

async function seed(page, { done = 15, log = true } = {}) {
  const chapters = Array.from({ length: done }, (_, i) => chapterDone(i + 1));
  await page.addInitScript(([chapters, log]) => {
    if (sessionStorage.getItem("seeded")) return; // once per test: later page loads keep what the test did
    sessionStorage.setItem("seeded", "1");
    localStorage.clear();
    chapters.forEach((st, i) => localStorage.setItem("halcyon.c" + (201 + i), JSON.stringify(st)));
    if (log) localStorage.setItem("halcyon.c905", JSON.stringify(log));
  }, [chapters, log ? LOG : null]);
}

const accept = page => page.on("dialog", d => d.accept());
const correctFor = page => page.evaluate(() => { const m = {}; (window.HALCYON_FINAL || []).forEach(p => p.questions.forEach((q, i) => m[p.part.slice(0, 3) + i] = q.a)); return m });

// answers every question on screen; right = how many to get right (in screen order)
async function answerAll(page, right) {
  await expect(page.locator("#page fieldset.qitem")).toBeVisible();
  const key = await correctFor(page);
  for (let i = 0; i < 100; i++) {
    const fs = page.locator("#page fieldset.qitem");
    const qid = await fs.getAttribute("data-qid");
    const a = key[qid], pick = i < right ? a : (a + 1) % 4;
    await fs.locator(`input[value="${pick}"]`).check();
    await page.locator("#fnextq").click();
    if (i < 99) await expect(page.locator("#page .kicker")).toContainText(`Question ${i + 2} of 100`);
  }
}

const sha = s => crypto.createHash("sha256").update(s).digest("hex").slice(0, 16).toUpperCase().match(/.{4}/g).join("-");

test("locked until all 15 chapters are done, with a preview link that never earns a certificate", async ({ page }) => {
  await seed(page, { done: 14 });
  await page.goto("/#pmp/home");
  await expect(page.locator("#finalbtn")).toBeVisible();
  await expect(page.locator("#page")).toContainText("It opens when you've finished all 15 chapters (14 done)");
  await page.locator("#finalbtn").click();
  await expect(page.locator("#page h1")).toHaveText("Final assessment");
  await expect(page.locator("#page .finallock")).toContainText("You've finished 14 so far");
  await expect(page.locator("#fstart")).toHaveCount(0);
  await page.locator("#fpreview").click();
  await expect(page.locator("#page .kicker")).toContainText("Final assessment · Preview · Question 1 of 100");
  accept(page);
  await answerAll(page, 100);
  await expect(page.locator("#page h1")).toContainText("You passed: 100 of 100");
  await expect(page.locator("#page")).toContainText("This was a preview attempt");
  await expect(page.locator("#fcert")).toHaveCount(0);
  await page.goto("/#pmp/certificate");
  await expect(page.locator("#page h1")).toHaveText("No certificate yet");
});

test("passing run: domain scores, then the certificate with the logged hours, chapter dates and a code that checks out", async ({ page }) => {
  await seed(page);
  await page.goto("/#pmp/final");
  await expect(page.locator("#page .finallock")).toHaveCount(0);
  await page.locator("#fstart").click();
  accept(page);
  await answerAll(page, 80);
  await expect(page.locator("#page h1")).toContainText("You passed: 80 of 100 (80 percent)");
  await expect(page.locator("#page .end-grid .card")).toHaveCount(3);
  await expect(page.locator("#page .end-grid")).toContainText("People");
  await expect(page.locator("#page .finalrv li").first()).toBeVisible(); // 20 misses map to chapters
  await page.locator("#fcert").click();
  await expect(page.locator("#page .certh")).toHaveText("Certificate of Completion");
  await page.locator("#certname").fill("Jordan Avery Test");
  await expect(page.locator("#certnameout")).toHaveText("Jordan Avery Test");
  const doc = page.locator("#page .certdoc");
  await expect(doc).toContainText("36.5 hours, as recorded in the course's study log (Oct 1, 2026 to "); // the log ends today: time spent in the assessment counts too
  await expect(doc).toContainText("Passed, 80 of 100 (80 percent)");
  await expect(doc).toContainText("The Halcyon Launch");
  await expect(doc).toContainText("documents completion of a self-paced course of project management education");
  await expect(doc).toContainText("isn't affiliated with, endorsed by, or approved by Project Management Institute");
  await expect(doc).toContainText("PMI and PMP are marks of Project Management Institute, Inc.");
  await expect(doc).not.toContainText(/accredit|PMI approved|PMI-approved|approved by PMI|contact hours|PDU|pre-approved|accepted by PMI/i); // claims the certificate must never make
  await expect(page.locator("#page .certch li")).toHaveCount(15);
  await expect(page.locator("#page .certch li").first()).toContainText("Oct 1, 2026");
  await expect(page.locator("#page .certch li").nth(5)).toContainText("date not recorded");
  // the code is SHA-256 of "attempt id|date|hours", recomputed here independently
  const rec = await page.evaluate(() => JSON.parse(localStorage.getItem("halcyon.c906")).list.slice(-1)[0]);
  expect(rec.hours).toBe("36.5");
  expect(rec.code).toBe(sha(`${rec.id}|${rec.date}|${rec.hours}`));
  await expect(page.locator("#page .certcode")).toHaveText(rec.code);
  expect(await page.evaluate(() => localStorage.getItem("halcyon.certname.pmp"))).toBe('"Jordan Avery Test"');
  // the #verify page agrees, and a changed hours figure doesn't
  await page.goto("/#verify");
  await expect(page.locator("#page h1")).toHaveText("Check a certificate");
  await page.locator("#v-id").fill(rec.id); await page.locator("#v-date").fill(rec.date); await page.locator("#v-hours").fill("36.5"); await page.locator("#v-code").fill(rec.code);
  await page.locator("#verform button").click();
  await expect(page.locator("#verout")).toContainText("It matches");
  await page.locator("#v-hours").fill("40.0"); await page.locator("#verform button").click();
  await expect(page.locator("#verout")).toContainText("It doesn't match");
});

test("empty study log: the certificate says hours weren't recorded, never 0.0 hours, and makes no approval claims", async ({ page }) => {
  await seed(page, { log: false });
  await page.goto("/#pmp/final");
  await page.locator("#fstart").click();
  accept(page);
  await answerAll(page, 80);
  await expect(page.locator("#page h1")).toContainText("You passed: 80 of 100");
  await page.locator("#fcert").click();
  const doc = page.locator("#page .certdoc");
  await expect(page.locator("#page .certh")).toHaveText("Certificate of Completion");
  const rec = await page.evaluate(() => JSON.parse(localStorage.getItem("halcyon.c906")).list.slice(-1)[0]);
  expect(rec.hours).toBe("0.0"); // the hours still come only from the log; the code is still over "0.0"
  await expect(doc.locator(".certfacts")).toContainText(rec.secs > 0 ? "Less than a tenth of an hour was recorded in this course's study log" : "Hours weren't recorded in this course's study log");
  await expect(doc).not.toContainText(/0\.0 hours|log showed 0/);
  await expect(page.locator("#page")).not.toContainText("Your study log showed 0.0 hours");
  await expect(page.locator("#page .certform")).toContainText("so the certificate shows no study hours");
  await expect(doc).not.toContainText(/accredit|PMI approved|PMI-approved|approved by PMI|contact hours|PDU|pre-approved|accepted by PMI/i);
  // "approved" appears only in the independence line, as a denial
  const approved = (await doc.innerText()).match(/.{0,60}\bapproved\b.{0,30}/gi) || [];
  for (const a of approved) expect(a).toMatch(/isn't affiliated with, endorsed by, or approved by/);
  await expect(page.locator("#page .certcode")).toHaveText(sha(`${rec.id}|${rec.date}|0.0`));
});

test("failing run: below 70 percent, chapters to revisit, no certificate", async ({ page }) => {
  await seed(page);
  await page.goto("/#pmp/final");
  await page.locator("#fstart").click();
  accept(page);
  await answerAll(page, 69);
  await expect(page.locator("#page h1")).toContainText("Not this time: 69 of 100");
  await expect(page.locator("#fcert")).toHaveCount(0);
  const rv = page.locator("#page .finalrv li");
  expect(await rv.count()).toBeGreaterThan(0);
  await expect(rv.first()).toContainText(/Chapter \d+, .+: \d+ missed on/);
  await rv.first().locator("button").click();
  await expect(page.locator("#page .kicker")).toContainText("The lesson");
  await page.goto("/#pmp/certificate");
  await expect(page.locator("#page h1")).toHaveText("No certificate yet");
});

test("retake: every attempt gets a new question order and option order, with answer positions balanced", async ({ page }) => {
  await seed(page);
  await page.goto("/#pmp/final");
  await page.locator("#fstart").click();
  await expect(page.locator("#page fieldset.qitem")).toBeVisible();
  const first = await page.evaluate(() => JSON.parse(localStorage.getItem("halcyon.c906")).cur);
  accept(page);
  await page.locator("#fsubmit").click(); // submit with nothing answered
  await expect(page.locator("#page h1")).toContainText("Not this time: 0 of 100");
  await page.locator("#fagain").click();
  await expect(page.locator("#page .kicker")).toContainText("Question 1 of 100");
  const second = await page.evaluate(() => JSON.parse(localStorage.getItem("halcyon.c906")).cur);
  expect(second.id).not.toBe(first.id);
  expect(second.order).not.toEqual(first.order);
  expect([...second.order].sort()).toEqual([...first.order].sort());
  const sameOpts = first.order.filter(id => JSON.stringify(first.opt[id]) === JSON.stringify(second.opt[id])).length;
  expect(sameOpts).toBeLessThan(50);
  const key = await correctFor(page);
  for (const att of [first, second]) {
    const slots = [0, 0, 0, 0]; att.order.forEach(id => slots[att.opt[id].indexOf(key[id])]++);
    slots.forEach(n => expect(n).toBeGreaterThanOrEqual(24)); // order.js targets: each display slot n/4 times
  }
  // the first question on screen is the new order's first question
  await expect(page.locator("#page fieldset.qitem")).toHaveAttribute("data-qid", second.order[0]);
});
