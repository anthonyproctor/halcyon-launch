// Per form clocks and case option order (2026-11-07). courses.js formMinutes ({form: minutes}) gives each practice form its own clock, and a
// full sitting runs each section on its form's minutes (SIT().lim(i)), with the plan and the picker card naming them. caseOneOrder shows a
// case's later items (cq 2 and up) in its cq 1 item's option order, so the AFOQT Situational Judgment MOST and LEAST pair read off one list.
// A fixedOrder item (AFOQT Block Counting, ascending counts) shows its options as written. A case's own label (RC passages) wins over the course caseLabel ("Scenario"). Courses without formMinutes keep mockMinutes everywhere.
// The AFOQT config is the real one in courses.js; its eleven mock files are served as small fixtures built below, so these tests don't
// depend on the real items. AFOQT base is 70000: form f is saved at halcyon.c70900 (f 1) or c(70910 + 2(f - 2)), the sitting at c70990.
import { test, expect } from "@playwright/test";

const accept = page => page.on("dialog", d => d.accept());
const secs = s => { const [h, m, x] = s.split(":").map(Number); return h * 3600 + m * 60 + x };
const SIT = "halcyon.c70990";
const formKey = f => "halcyon.c" + (70000 + (f === 1 ? 900 : 910 + 2 * (f - 2)));

// the eleven scored subtests in test day order: [file, form, label, task]
const FORMS = [["va", 1, "Verbal Analogies", "VA"], ["ar", 2, "Arithmetic Reasoning", "AR"], ["wk", 3, "Word Knowledge", "WK"], ["mk", 4, "Math Knowledge", "MK"],
  ["rc", 5, "Reading Comprehension", "RC"], ["sj", 6, "Situational Judgment", "SJ"], ["ps", 7, "Physical Science", "PS"], ["tr", 8, "Table Reading", "TR"],
  ["ic", 9, "Instrument Comprehension", "IC"], ["bc", 10, "Block Counting", "BC"], ["ai", 11, "Aviation Information", "AI"]];
const DOMAIN = { VA: "Verbal", WK: "Verbal", RC: "Verbal", AR: "Quantitative", MK: "Quantitative", SJ: "Judgment", PS: "Science and Aviation", AI: "Science and Aviation", TR: "Speed and Spatial", IC: "Speed and Spatial", BC: "Speed and Spatial" };
const ACTS = ["Talk to them in private today.", "Ask your supervisor what to do.", "Wait a week and see.", "Raise it at the staff meeting.", "Fix it yourself and say nothing."];
function fixturePart([, f, label, task]) {
  const item = (k, extra = {}) => ({ q: `Fixture ${label} item ${k + 1}?`, opts: ["one", "two", "three", "four", "five"], a: k % 5, why: "Fixture.", task, domain: DOMAIN[task], ...extra });
  const part = { part: `M${f}: ${label}`, questions: [item(0), item(1)] };
  if (task === "RC") { // one labeled passage with two items, then a plain item
    part.cases = [{ id: "fp1", label: "Passage", title: "The fixture passage", text: ["A short passage for the test."] }];
    part.questions = [item(0, { case: "fp1", cq: 1 }), item(1, { case: "fp1", cq: 2 }), item(2)];
  }
  if (task === "SJ") { // three scenarios, no label, each a MOST (cq 1) and LEAST (cq 2) pair on the same five actions
    part.cases = [1, 2, 3].map(n => ({ id: "fs" + n, title: `Fixture scenario ${n}`, text: [`Scenario ${n} text.`] }));
    part.questions = [1, 2, 3].flatMap(n => [
      { q: "Which action is MOST effective?", case: "fs" + n, cq: 1, opts: ACTS, a: (n - 1) % 5, why: "Fixture.", task, domain: DOMAIN[task] },
      { q: "Which action is LEAST effective?", case: "fs" + n, cq: 2, opts: ACTS, a: (n + 2) % 5, why: "Fixture.", task, domain: DOMAIN[task] }]);
  }
  if (task === "BC") // a fixedOrder item with ascending choices, then a normal shuffled item
    part.questions = [item(0, { opts: ["1", "2", "3", "4", "5"], fixedOrder: true }), item(1)];
  return part;
}
const fixtureJS = row => `(function(){const D=window.HALCYON_DATA=window.HALCYON_DATA||{};const C=D.afoqt=D.afoqt||{};C.mock=C.mock||[];C.mock.push(${JSON.stringify(fixturePart(row))})})();`;
// serves the fixtures; off: ["formMinutes"] and/or ["caseOneOrder"] strips that key from the AFOQT entry in courses.js
async function fixtures(page, off = []) {
  for (const row of FORMS) await page.route(`**/courses/afoqt/mock/t1_${row[0]}.js*`, r => r.fulfill({ status: 200, contentType: "application/javascript", body: fixtureJS(row) }));
  if (off.length) await page.route("**/courses.js*", async r => {
    const res = await r.fetch(); let body = await res.text();
    for (const k of off) { const before = body; body = k === "formMinutes" ? body.replace(/formMinutes:\{[^}]*\},/, "") : body.replace("caseOneOrder:true,", ""); if (body === before) throw new Error(`courses.js: ${k} not found`) }
    await r.fulfill({ response: res, body });
  });
}
const config = page => page.evaluate(() => { const c = window.HALCYON_COURSES.find(x => x.id === "afoqt"); return { fm: c.formMinutes || null, mm: c.mockMinutes, sit: [].concat(c.mockSitting)[0] } }); // sit: the first sitting (afoqt has two since 2026-11-07)
// a single form attempt, seeded so its questions run in file order
async function seedForm(page, f, extra = {}) {
  await page.goto(`/#afoqt/home`);
  const n = fixturePart(FORMS[f - 1]).questions.length, pre = `M${f}:`.slice(0, 3);
  const st = { mode: "exam", form: f, order: [...Array(n).keys()].map(i => pre + i), ans: {}, flagged: {}, cur: 0, elapsed: 0, breaksTaken: [], onBreak: null, submitted: false, startedAt: "2026-11-07T10:00:00.000Z", ...extra };
  await page.evaluate(([k, st]) => localStorage.setItem(k, JSON.stringify(st)), [formKey(f), st]);
  await page.goto(`/#afoqt/mock/${f}`); await page.reload();
}
async function patchSit(page, fn) { await page.evaluate(([k, src]) => { const st = JSON.parse(localStorage.getItem(k)); (0, eval)("(" + src + ")")(st); localStorage.setItem(k, JSON.stringify(st)) }, [SIT, fn.toString()]) }
const shown = page => page.locator("#page input[name=mq]").evaluateAll(xs => xs.map(x => +x.value));
const shownText = page => page.locator("#page .qopt").evaluateAll(xs => xs.map(x => x.textContent.replace(/^\s*[A-E]\s*/, "").trim()));
const ownOrder = (page, id, n = 5) => page.evaluate(([id, n]) => window.HalcyonOrder.get("mq" + id, n), [id, n]);

test("a single form runs on its own formMinutes clock, and forms with different minutes show different limits", async ({ page }) => {
  await fixtures(page);
  await page.goto("/#afoqt/home");
  const { fm, mm } = await config(page);
  expect(fm).not.toBeNull();
  expect(new Set(Object.values(fm)).size).toBeGreaterThan(1); // the forms don't all share one time
  const [short, long] = [3, 6]; // Word Knowledge and Situational Judgment
  expect(fm[short]).not.toBe(fm[long]);
  expect(fm[long]).not.toBe(mm); // so the long form can't be passing on the course default
  for (const f of [short, long]) {
    await page.goto(`/#afoqt/mock/${f}`); await page.reload();
    await expect(page.locator("#page .card", { hasText: "Exam mode" })).toContainText(`${fm[f]} minutes, the timer runs`);
  }
  // the running clock starts at each form's own limit
  for (const f of [short, long]) {
    await page.evaluate(k => localStorage.removeItem(k), formKey(f));
    await page.goto(`/#afoqt/mock/${f}`); await page.reload();
    await page.locator("#exam").click();
    const left = secs(await page.locator("#mocktime").textContent());
    expect(left).toBeLessThanOrEqual(fm[f] * 60); expect(left).toBeGreaterThan(fm[f] * 60 - 10);
  }
  // time up comes at the short form's limit, while the long form keeps running past that same elapsed time
  await seedForm(page, short, { elapsed: fm[short] * 60 - 2 });
  await expect(page.locator("#page h1")).toHaveText(/^\d+ of \d+ \(\d+ percent\)$/, { timeout: 8000 });
  expect((await page.evaluate(k => JSON.parse(localStorage.getItem(k)), formKey(short))).submitted).toBe(true);
  await seedForm(page, long, { elapsed: fm[short] * 60 - 2 });
  await page.waitForTimeout(4000);
  await expect(page.locator("#mocktime")).toBeVisible();
  const left = secs(await page.locator("#mocktime").textContent());
  expect(left).toBeLessThanOrEqual((fm[long] - fm[short]) * 60 + 2); expect(left).toBeGreaterThan((fm[long] - fm[short]) * 60 - 10);
  expect((await page.evaluate(k => JSON.parse(localStorage.getItem(k)), formKey(long))).submitted).toBe(false);
});

test("the sitting plan and picker card list each section's own minutes and the 15 minute break", async ({ page }) => {
  await fixtures(page);
  await page.goto("/#afoqt/mock"); await page.reload();
  const { fm, sit } = await config(page);
  const total = sit.sections.reduce((t, f) => t + fm[f], 0);
  await expect(page.locator('#page .sitcard[data-formcard="sitting"] h3')).toHaveText(sit.label);
  await expect(page.locator('#page .sitcard[data-formcard="sitting"]')).toContainText(`All ${sit.sections.length} back to back, ${total} minutes of testing in all. You can take ${sit.breakMinutes} minutes off after section ${sit.breakAfter}.`);
  await page.locator("#sitopen").click();
  await expect(page).toHaveURL(/#afoqt\/mock\/sitting$/);
  await expect(page.locator("#page .story").first()).toContainText("Each section has its own clock, the same as test day.");
  await expect(page.locator("#page .story").first()).not.toContainText("minutes a section");
  const plan = page.locator("#page .sitplan li");
  await expect(plan).toHaveCount(sit.sections.length);
  for (const [k, f] of sit.sections.entries()) {
    const row = FORMS[f - 1], n = fixturePart(row).questions.length;
    await expect(plan.nth(k)).toHaveText(`${row[2]}: ${n} questions, ${fm[f]} minutes.${k + 1 === sit.breakAfter ? ` Then ${sit.breakMinutes} minutes off, if you want it.` : ""}`);
  }
  await expect(page.locator("#page")).not.toContainText(/[–—]/);
});

test("a sitting section times out on its own limit, not the default, and the next section starts on its own clock", async ({ page }) => {
  accept(page);
  await fixtures(page);
  await page.goto("/#afoqt/mock/sitting"); await page.reload();
  const { fm, mm, sit } = await config(page);
  const L = sit.sections.map(f => fm[f] * 60);
  await page.locator("#sitstart").click();
  await expect(page.locator("#sithead")).toContainText(`Section 1 of ${L.length}`);
  let left = secs(await page.locator("#sittime").textContent());
  expect(left).toBeLessThanOrEqual(L[0]); expect(left).toBeGreaterThan(L[0] - 10);
  await page.locator("#sitend").click();
  await expect(page.locator("#sithead")).toContainText(`Section 2 of ${L.length}`);
  await expect(page.locator("#sithead")).toContainText(FORMS[sit.sections[1] - 1][2]);
  left = secs(await page.locator("#sittime").textContent());
  expect(left).toBeLessThanOrEqual(L[1]); expect(left).toBeGreaterThan(L[1] - 10);
  // past the course default (mockMinutes) but inside section 2's own minutes: still section 2
  expect(L[1]).toBeGreaterThan(mm * 60 + 60);
  await patchSit(page, `st => { st.secs[1].t0 = Date.now() - (${mm * 60} + 30) * 1000 }`);
  await page.reload();
  await page.waitForTimeout(2500);
  await expect(page.locator("#sithead")).toContainText(`Section 2 of ${L.length}`);
  left = secs(await page.locator("#sittime").textContent());
  expect(left).toBeLessThanOrEqual(L[1] - mm * 60 - 30); expect(left).toBeGreaterThan(L[1] - mm * 60 - 40);
  // two seconds from section 2's own end: it times out and section 3 opens on its own (shorter) clock
  await patchSit(page, `st => { st.secs[1].t0 = Date.now() - (${L[1]} - 2) * 1000 }`);
  await page.reload();
  await expect(page.locator("#sithead")).toContainText(`Section 3 of ${L.length}`, { timeout: 8000 });
  await expect(page.locator("#sitnote")).toHaveText("Time's up for section 2. You're in section 3 now.");
  left = secs(await page.locator("#sittime").textContent());
  expect(left).toBeLessThanOrEqual(L[2]); expect(left).toBeGreaterThan(L[2] - 10);
  let st = await page.evaluate(k => JSON.parse(localStorage.getItem(k)), SIT);
  expect(st.secs[1].elapsed).toBe(L[1]);
  // away for a long while: sections 3, 4 and 5 each run out on their own minutes, and section 6 is 10 minutes in
  const away = L[2] + L[3] + L[4] + 600;
  await patchSit(page, `st => { st.secs[2].t0 = Date.now() - ${away} * 1000 }`);
  await page.reload();
  await expect(page.locator("#sithead")).toContainText(`Section 6 of ${L.length}`);
  left = secs(await page.locator("#sittime").textContent());
  expect(left).toBeLessThanOrEqual(L[5] - 600); expect(left).toBeGreaterThan(L[5] - 610);
  st = await page.evaluate(k => JSON.parse(localStorage.getItem(k)), SIT);
  expect(st.secs.slice(2, 5).map(s => s.elapsed)).toEqual(L.slice(2, 5));
  // section 6 runs out on its own minutes, then the break is the sitting's 15 minutes
  await patchSit(page, `st => { st.secs[5].t0 = Date.now() - (${L[5]} - 2) * 1000 }`);
  await page.reload();
  await expect(page.locator("#page h1")).toHaveText("Break", { timeout: 8000 });
  left = secs(await page.locator("#breaktime").textContent());
  expect(left).toBeLessThanOrEqual(sit.breakMinutes * 60); expect(left).toBeGreaterThan(sit.breakMinutes * 60 - 10);
  await page.locator("#sitskip").click();
  await expect(page.locator("#sithead")).toContainText(`Section 7 of ${L.length}`);
  left = secs(await page.locator("#sittime").textContent());
  expect(left).toBeLessThanOrEqual(L[6]); expect(left).toBeGreaterThan(L[6] - 10);
});

test("caseOneOrder: each scenario's MOST and LEAST items show one option order, in a single form and in the sitting", async ({ page }) => {
  accept(page);
  await fixtures(page);
  await seedForm(page, 6);
  let differ = 0;
  for (let n = 0; n < 3; n++) {
    const one = `M6:${2 * n}`, two = `M6:${2 * n + 1}`;
    await expect(page.locator("#page fieldset.qitem")).toHaveAttribute("data-qid", one);
    await expect(page.locator("#page details.qmcase summary .kicker")).toHaveText("Scenario, question 1 of 2");
    const o1 = await shown(page), t1 = await shownText(page);
    expect(o1).toEqual(await ownOrder(page, one));
    await page.locator("#nextq").click();
    await expect(page.locator("#page fieldset.qitem")).toHaveAttribute("data-qid", two);
    await expect(page.locator("#page details.qmcase summary .kicker")).toHaveText("Scenario, question 2 of 2");
    expect(await shown(page)).toEqual(o1);
    expect(await shownText(page)).toEqual(t1);
    if (JSON.stringify(await ownOrder(page, two)) !== JSON.stringify(o1)) differ++;
    if (n < 2) await page.locator("#nextq").click();
  }
  expect(differ).toBeGreaterThan(0); // without the rule at least one LEAST item would have shown a different order
  // the sitting: section 6, the same pairs
  await page.goto("/#afoqt/mock/sitting"); await page.reload();
  await page.locator("#sitstart").click();
  await patchSit(page, st => { const now = Date.now(); st.secs.forEach((s, k) => { if (k < 5) { s.ended = true; s.elapsed = 1 } }); st.sec = 5; st.secs[5].t0 = now; st.secs[5].order = ["M6:0", "M6:1", "M6:2", "M6:3", "M6:4", "M6:5"]; st.cur = 0 });
  await page.reload();
  await expect(page.locator("#sithead")).toContainText("Situational Judgment");
  for (let n = 0; n < 3; n++) {
    await expect(page.locator("#page fieldset.qitem")).toHaveAttribute("data-qid", `M6:${2 * n}`);
    const o1 = await shown(page);
    expect(o1).toEqual(await ownOrder(page, `M6:${2 * n}`));
    await page.locator("#nextq").click();
    await expect(page.locator("#page fieldset.qitem")).toHaveAttribute("data-qid", `M6:${2 * n + 1}`);
    expect(await shown(page)).toEqual(o1);
    if (n < 2) await page.locator("#nextq").click();
  }
});

test("without caseOneOrder each case item keeps its own option order: AFOQT with the key removed, and PMP", async ({ page }) => {
  await fixtures(page, ["caseOneOrder"]);
  await seedForm(page, 6);
  let differ = 0;
  for (let n = 0; n < 3; n++) {
    const one = `M6:${2 * n}`, two = `M6:${2 * n + 1}`;
    await expect(page.locator("#page fieldset.qitem")).toHaveAttribute("data-qid", one);
    const o1 = await shown(page);
    expect(o1).toEqual(await ownOrder(page, one));
    await page.locator("#nextq").click();
    await expect(page.locator("#page fieldset.qitem")).toHaveAttribute("data-qid", two);
    const o2 = await shown(page);
    expect(o2).toEqual(await ownOrder(page, two));
    if (JSON.stringify(o2) !== JSON.stringify(o1)) differ++;
    if (n < 2) await page.locator("#nextq").click();
  }
  expect(differ).toBeGreaterThan(0);
  // PMP form 1, case m1c1: every item in the case shows its own order
  await page.goto("/#pmp/home");
  await page.waitForFunction(() => window.HALCYON_MOCK && window.HALCYON_MOCK.length);
  const ids = await page.evaluate(() => { const o = []; window.HALCYON_MOCK.forEach(p => { if ((p.form != null ? +p.form : 1) !== 1) return; p.questions.forEach((q, i) => { if (q.case === "m1c1") o.push([q.cq || 0, p.part.slice(0, 3) + i, q.opts.length]) }) }); return o.sort((a, b) => a[0] - b[0]) });
  expect(ids.length).toBeGreaterThan(1);
  const st = { mode: "exam", form: 1, order: ids.map(x => x[1]), ans: {}, flagged: {}, cur: 0, elapsed: 0, breaksTaken: [], onBreak: null, submitted: false, startedAt: "2026-11-07T10:00:00.000Z" };
  await page.evaluate(st => localStorage.setItem("halcyon.c900", JSON.stringify(st)), st);
  await page.goto("/#pmp/mock/1"); await page.reload();
  for (const [k, [, id, n]] of ids.entries()) {
    await expect(page.locator("#page fieldset.qitem")).toHaveAttribute("data-qid", id);
    await expect(page.locator("#page details.qmcase summary .kicker")).toHaveText(`Case study, question ${k + 1} of ${ids.length}`);
    expect(await shown(page)).toEqual(await ownOrder(page, id, n));
    if (k < ids.length - 1) await page.locator("#nextq").click();
  }
});

test("a case with its own label shows it, and one without shows the course caseLabel, in the exam and the review", async ({ page }) => {
  await fixtures(page);
  await seedForm(page, 5);
  await expect(page.locator("#page details.qmcase summary .kicker")).toHaveText("Passage, question 1 of 2");
  await expect(page.locator("#page")).not.toContainText("Scenario");
  await seedForm(page, 6);
  await expect(page.locator("#page details.qmcase summary .kicker")).toHaveText("Scenario, question 1 of 2");
  await expect(page.locator("#page")).not.toContainText("Passage");
  // the results review heads each case the same way
  await seedForm(page, 5, { submitted: true, elapsed: 60 });
  await expect(page.locator("#page .qcase .kicker")).toHaveText(["Passage"]);
  await seedForm(page, 6, { submitted: true, elapsed: 60 });
  await expect(page.locator("#page .qcase .kicker")).toHaveText(["Scenario", "Scenario", "Scenario"]);
});

test("courses without formMinutes keep one clock: AFOQT with the key removed, and CPHIMS and PMP as before", async ({ page }) => {
  accept(page);
  await fixtures(page, ["formMinutes"]);
  await page.goto("/#afoqt/mock"); await page.reload();
  const { fm, mm, sit } = await config(page);
  expect(fm).toBeNull();
  await expect(page.locator('#page .sitcard[data-formcard="sitting"]')).toContainText(`All ${sit.sections.length} back to back, ${mm} minutes a pop. You can take ${sit.breakMinutes} minutes off after section ${sit.breakAfter}.`);
  for (const f of [3, 6]) {
    await page.goto(`/#afoqt/mock/${f}`); await page.reload();
    await expect(page.locator("#page .card", { hasText: "Exam mode" })).toContainText(`${mm} minutes, the timer runs`);
  }
  await page.goto("/#afoqt/mock/sitting"); await page.reload();
  await expect(page.locator("#page .story").first()).toContainText(`You get ${mm} minutes a section.`);
  const plan = await page.locator("#page .sitplan li").allTextContents();
  expect(plan.length).toBe(sit.sections.length);
  expect(plan.every(t => t.includes(`, ${mm} minutes.`))).toBe(true);
  await page.locator("#sitstart").click();
  await page.locator("#sitend").click();
  await expect(page.locator("#sithead")).toContainText(`Section 2 of ${sit.sections.length}`);
  const left = secs(await page.locator("#sittime").textContent());
  expect(left).toBeLessThanOrEqual(mm * 60); expect(left).toBeGreaterThan(mm * 60 - 10);
  // books that never had formMinutes: the exam card shows mockMinutes on every form
  for (const [c, forms] of [["cphims", [1, 2]], ["pmp", [1, 2]]]) {
    await page.goto(`/#${c}/home`);
    const m = await page.evaluate(id => { const x = window.HALCYON_COURSES.find(y => y.id === id); return x.formMinutes ? -1 : x.mockMinutes || 240 }, c);
    expect(m).toBeGreaterThan(0);
    for (const f of forms) {
      await page.goto(`/#${c}/mock`); await page.reload();
      await page.locator(`#page [data-form="${f}"]`).click(); // from the picker, so the forms are loaded first
      await expect(page.locator("#page .card", { hasText: "Exam mode" })).toContainText(`${m} minutes, the timer runs`);
    }
  }
});

test("a fixedOrder item shows its options as written, and the normal item beside it is still shuffled", async ({ page }) => {
  await fixtures(page);
  await seedForm(page, 10); // Block Counting: M100 is fixedOrder, M101 is not
  await expect(page.locator("#page fieldset.qitem")).toHaveAttribute("data-qid", "M100");
  expect(await shown(page)).toEqual([0, 1, 2, 3, 4]);
  expect(await shownText(page)).toEqual(["1", "2", "3", "4", "5"]);
  expect(await ownOrder(page, "M100")).not.toEqual([0, 1, 2, 3, 4]); // the shuffle it would have had without the flag
  await page.locator("#nextq").click();
  await expect(page.locator("#page fieldset.qitem")).toHaveAttribute("data-qid", "M101");
  const o = await ownOrder(page, "M101");
  expect(o).not.toEqual([0, 1, 2, 3, 4]);
  expect(await shown(page)).toEqual(o);
  // the same in the sitting's Block Counting section
  await page.goto("/#afoqt/mock/sitting"); await page.reload();
  await page.locator("#sitstart").click();
  await patchSit(page, st => { st.secs.forEach((s, k) => { if (k < 9) { s.ended = true; s.elapsed = 1 } }); st.breakDone = true; st.sec = 9; st.secs[9].t0 = Date.now(); st.secs[9].order = ["M100", "M101"]; st.cur = 0 });
  await page.reload();
  await expect(page.locator("#sithead")).toContainText("Block Counting");
  expect(await shown(page)).toEqual([0, 1, 2, 3, 4]);
  await page.locator("#nextq").click();
  await expect(page.locator("#page fieldset.qitem")).toHaveAttribute("data-qid", "M101");
  expect(await shown(page)).toEqual(o);
});

// Scripts run in courses.js order (loadScripts sets async=false, 2026-11-07). Before that the mock files ran in whatever order they arrived,
// and the option shuffle, which hangs on each item's place in the bank, changed from one page load to the next.
test("mock files run in list order however the network delivers them, so option orders hold across loads", async ({ page }) => {
  const parts = new Set(), ords = new Set();
  const nForms = (await import("node:fs")).readFileSync(new URL("../courses.js", import.meta.url), "utf8").match(/\{id:"afoqt"[\s\S]*?scripts:\[([^\]]*)\]/)[1].split(",").filter(x => x.includes("mock/")).length; // every afoqt mock script is one form
  for (let k = 0; k < 5; k++) {
    await page.route("**/courses/afoqt/mock/t*_*.js*", async r => { await new Promise(x => setTimeout(x, Math.random() * 200)); await r.continue() });
    await page.goto("/#afoqt/home"); await page.reload();
    await page.waitForFunction(n => window.HALCYON_DATA && HALCYON_DATA.afoqt && (HALCYON_DATA.afoqt.mock || []).length === n, nForms);
    parts.add(await page.evaluate(() => HALCYON_DATA.afoqt.mock.map(p => /^M(\d+):/.exec(p.part)[1]).join(",")));
    ords.add(await page.evaluate(() => JSON.stringify(["mqM1:0", "mqM6:1", "mqM101"].map(id => HalcyonOrder.get(id, 5)))));
    await page.unroute("**/courses/afoqt/mock/t*_*.js*");
  }
  expect([...parts]).toEqual([Array.from({ length: nForms }, (_, i) => i + 1).join(",")]);
  expect(ords.size).toBe(1);
});
