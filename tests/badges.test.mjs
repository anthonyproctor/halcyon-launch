// Unit tests for badges.js (the pure badge and readiness logic). Run: node --test tests/badges.test.mjs
// Made-up facts only. The definitions are the real badges/<course>.js files.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const W = {};
const run = f => new Function("window", fs.readFileSync(path.join(ROOT, f), "utf8"))(W);
run("courses.js"); run("badges.js");
for (const c of W.HALCYON_COURSES) run(c.badges);
const HB = W.HalcyonBadges, DEFS = W.HALCYON_BADGES;
const course = id => W.HALCYON_COURSES.find(c => c.id === id);

// a made-up book: n chapters of 3 scenes, best option 0, nothing done
function facts(n = 3, o = {}) {
  return {
    course: "t", planned: n, flags: {}, exams: [], final: false, tasks: {}, doms: ["Alpha", "Beta"], weights: {}, hasMock: true, listen: {}, today: "2026-10-13",
    chapters: Array.from({ length: n }, (_, i) => ({ n: i + 1, title: "Chapter title " + (i + 1), done: false, picks: {}, ids: [`f${i + 1}s1`, `f${i + 1}s2`, `f${i + 1}s3`], best: [0, 2, 1], rd: 0, quiz: null })),
    ...o,
  };
}
const DEF = {
  form: "patch", one: "patch", shelf: "Test patches", color: { bg: "#123", rim: "#456", ink: "#789" }, readiness: { name: "Test meter", explain: "At {target}, go." },
  chapters: { prefix: "t-ch", line: "Chapter {n} is done.", mark: "num" },
  items: [
    { id: "t-book", name: "Book", line: "All done.", mark: "crew", rule: { type: "book" } },
    { id: "t-clean", name: "Clean", line: "Clean.", mark: "toggle", rule: { type: "clean" } },
    { id: "t-exam", name: "Exam", line: "Passed.", mark: "console", rule: { type: "exam", min: 70 } },
    { id: "t-ready", name: "Ready", line: "Ready.", mark: "board", rule: { type: "readiness" } },
    { id: "t-s3", name: "Three", line: "Three.", mark: "cards", rule: { type: "streak", days: 3 } },
    { id: "t-s7", name: "Seven", line: "Seven.", mark: "clock", rule: { type: "streak", days: 7 } },
    { id: "t-pick", hidden: true, name: "Picked", line: "Picked.", mark: "rope", rule: { type: "pick", ch: 2, scene: "f2s2", opt: 2 } },
    { id: "t-flag", name: "Flag", line: "Flag.", mark: "tick", rule: { type: "flag", flag: "hid", not: true } },
    { id: "t-pending", hidden: true, pending: true, name: "Later", line: "Later.", mark: "folder", rule: { type: "pick", ch: 9 }, plan: "not written" },
    { id: "t-all", name: "All", line: "All.", mark: "star", rule: { type: "all", ids: ["t-book", "t-clean"] } },
  ],
};
const tasks = (spec) => Object.fromEntries(spec.map(([t, d, got, max, n]) => [t, { got, max, n, d }]));

test("readiness: not enough with fewer than 15 items and no timed exam", () => {
  const r = HB.readiness(facts(3, { tasks: tasks([["A1", "Alpha", 9, 12, 4], ["B1", "Beta", 6, 9, 3]]) }));
  assert.equal(r.items, 7);
  assert.equal(r.value, null);
});

test("readiness: no timed exam is S = A*K capped at 80", () => {
  // Alpha: 2 tasks, both covered, 30/30; Beta: 2 tasks, both covered, 30/30 -> K 1, A 1, S 1, capped 0.8
  const F = facts(3, { tasks: tasks([["A1", "Alpha", 15, 15, 5], ["A2", "Alpha", 15, 15, 5], ["B1", "Beta", 15, 15, 5], ["B2", "Beta", 15, 15, 5]]) });
  const r = HB.readiness(F);
  assert.equal(r.basis, "study");
  assert.equal(r.S, 1);
  assert.equal(r.value, 80);
});

test("readiness: weighted coverage and accuracy", () => {
  // Alpha weight 3: 1 of 2 tasks covered, accuracy 12/24 = .5; Beta weight 1: 1 of 1 covered, accuracy 9/9 = 1
  const F = facts(3, { weights: { Alpha: 3, Beta: 1 }, tasks: tasks([["A1", "Alpha", 12, 24, 8], ["A2", "Alpha", 0, 0, 0], ["B1", "Beta", 9, 9, 9]]) });
  const r = HB.readiness(F);
  assert.ok(Math.abs(r.K - (3 * 0.5 + 1 * 1) / 4) < 1e-9);
  assert.ok(Math.abs(r.A - (3 * 0.5 + 1 * 1) / 4) < 1e-9);
  assert.ok(Math.abs(r.S - r.A * r.K) < 1e-9);
  assert.equal(r.value, Math.round(Math.min(r.S, 0.8) * 100));
});

test("readiness: R = 0.6X + 0.4S over the last 3 timed attempts weighted 3, 2, 1; practice mode doesn't count", () => {
  const ex = [
    { at: "2026-10-01T10:00:00Z", mode: "exam", right: 10, total: 100 }, // 4th newest: left out
    { at: "2026-10-02T10:00:00Z", mode: "exam", right: 60, total: 100 },
    { at: "2026-10-03T10:00:00Z", mode: "handbook", right: 70, total: 100 },
    { at: "2026-10-04T10:00:00Z", mode: "practice", right: 100, total: 100 }, // practice: not timed
    { at: "2026-10-05T10:00:00Z", mode: "exam", right: 80, total: 100 },
  ];
  const F = facts(3, { exams: ex, tasks: tasks([["A1", "Alpha", 6, 12, 4], ["B1", "Beta", 9, 9, 3]]) });
  const r = HB.readiness(F);
  const X = (3 * 0.8 + 2 * 0.7 + 1 * 0.6) / 6;
  assert.ok(Math.abs(r.X - X) < 1e-9);
  assert.equal(r.timed, 3);
  assert.equal(r.value, Math.round((0.6 * X + 0.4 * r.S) * 100));
});

test("readiness: a book with no practice exam uses S, uncapped", () => {
  const F = facts(3, { hasMock: false, tasks: tasks([["A1", "Alpha", 15, 15, 5], ["B1", "Beta", 15, 15, 12]]) });
  const r = HB.readiness(F);
  assert.equal(r.basis, "nomock");
  assert.equal(r.value, 100);
});

test("streaks: days with 10 minutes of listening, in a row", () => {
  const L = { "2026-10-01": 600, "2026-10-02": 900, "2026-10-03": 650, "2026-10-04": 599, "2026-10-05": 700, "2026-10-06": 800 };
  const s = HB.streak(L, "2026-10-07");
  assert.equal(s.best, 3);
  assert.equal(s.current, 2); // the 5th and 6th, ending yesterday
  assert.equal(HB.streak(L, "2026-10-09").current, 0);
  // a month boundary
  assert.equal(HB.streak({ "2026-09-30": 600, "2026-10-01": 600, "2026-10-02": 600 }, "2026-10-02").best, 3);
});

test("evaluate: chapter, book (all planned chapters), clean run (needs rd 0), pick, flag, all; pending never earned", () => {
  const F = facts(3);
  let ev = HB.evaluate(DEF, F, 75);
  assert.deepEqual(Object.keys(ev.got).sort(), ["t-flag"]); // the flag isn't set, and the rule says not
  assert.ok(!ev.items.some(x => x.id === "t-pending"));
  assert.equal(ev.items.filter(x => x.rule.type === "chapter").length, 3);
  F.chapters[0].done = true; F.chapters[0].picks = { 0: 0, 1: 2, 2: 1 }; // every first pick the best
  F.chapters[1].done = true; F.chapters[1].picks = { 0: 0, 1: 2, 2: 0 }; F.chapters[1].rd = 0;
  ev = HB.evaluate(DEF, F, 75);
  assert.ok(ev.got["t-ch01"] && ev.got["t-ch02"] && !ev.got["t-ch03"]);
  assert.deepEqual(ev.got["t-clean"], { ch: [1] });
  assert.ok(ev.got["t-pick"]); // chapter 2, scene f2s2, option 2
  assert.ok(!ev.got["t-book"] && !ev.got["t-all"]);
  F.chapters[0].rd = 1; // a redo in that run: not clean
  assert.ok(!HB.evaluate(DEF, F, 75).got["t-clean"]);
  F.chapters[1].rd = 2; // a redo or replay in chapter 2: its hidden pick badge isn't awarded, even on the right option
  assert.ok(!HB.evaluate(DEF, F, 75).got["t-pick"]);
  F.chapters[1].rd = 0;
  F.chapters[0].rd = 0; F.chapters[2].done = true; F.flags = { hid: true };
  ev = HB.evaluate(DEF, F, 75);
  assert.ok(ev.got["t-book"] && ev.got["t-all"] && !ev.got["t-flag"]);
  // a book with more chapters planned than written: no book badge yet
  const P = facts(2, { planned: 4 }); P.chapters.forEach(c => c.done = true);
  ev = HB.evaluate(DEF, P, 75);
  assert.ok(!ev.got["t-book"]);
  assert.equal(ev.items.filter(x => x.rule.type === "chapter").length, 4);
  assert.equal(ev.items.find(x => x.id === "t-ch04").name, "Chapter 4"); // not written: number only
  assert.equal(ev.items.find(x => x.id === "t-ch01").name, "Chapter title 1");
  assert.equal(ev.items.find(x => x.id === "t-ch03").line, "Chapter 3 is done.");
});

test("evaluate: practice exam pass at 70 in any mode, readiness at the course target, streaks 3 and 7", () => {
  const F = facts(3, { exams: [{ at: "2026-10-01", mode: "practice", right: 69, total: 100 }] });
  assert.ok(!HB.evaluate(DEF, F, 75).got["t-exam"]);
  F.exams.push({ at: "2026-10-02", mode: "practice", right: 7, total: 10 });
  assert.ok(HB.evaluate(DEF, F, 75).got["t-exam"]);
  F.tasks = tasks([["A1", "Alpha", 30, 30, 10], ["B1", "Beta", 30, 30, 10]]);
  F.exams = [{ at: "2026-10-03", mode: "exam", right: 74, total: 100 }];
  const r = HB.readiness(F); // .6*.74 + .4*1 = .844
  assert.equal(r.value, 84);
  assert.ok(HB.evaluate(DEF, F, 75).got["t-ready"]);
  assert.ok(!HB.evaluate(DEF, F, 85).got["t-ready"]);
  F.listen = Object.fromEntries(Array.from({ length: 7 }, (_, i) => [`2026-10-0${i + 1}`, 601]));
  const ev = HB.evaluate(DEF, F, 75);
  assert.ok(ev.got["t-s3"] && ev.got["t-s7"]);
});

test("apply: the first record is a silent backfill; later badges are fresh; earned badges never go away", () => {
  const a = HB.apply(null, { "t-ch01": true, "t-clean": { ch: [1] } }, 1000);
  assert.equal(a.changed, true);
  assert.deepEqual(a.fresh, []);
  assert.deepEqual(a.rec.got["t-ch01"], { at: 1000, back: 1 });
  assert.equal(a.rec.since, 1000);
  assert.deepEqual(HB.unseen(a.rec, [{ id: "t-ch01" }, { id: "t-clean" }]), []);
  const b = HB.apply(a.rec, { "t-ch01": true, "t-ch02": true, "t-clean": { ch: [2] } }, 2000);
  assert.deepEqual(b.fresh, ["t-ch02"]);
  assert.deepEqual(b.rec.got["t-clean"].ch, [1, 2]);
  assert.deepEqual(HB.unseen(b.rec, [{ id: "t-ch01" }, { id: "t-ch02" }]), ["t-ch02"]);
  const c = HB.apply(b.rec, {}, 3000); // nothing earned now (a replay cleared the picks): nothing taken away
  assert.equal(c.changed, false);
  assert.ok(c.rec.got["t-ch02"]);
  assert.ok(!a.rec.got["t-ch02"], "apply doesn't change the record it was given");
});

test("merge: a union of two devices' records", () => {
  const A = { v: 1, since: 100, at: 500, got: { x: { at: 200, seen: 1 }, y: { at: 300 }, c: { at: 150, back: 1, ch: [1] } }, snap: { ready: 40, at: 400 } };
  const B = { v: 1, since: 50, at: 600, got: { y: { at: 250 }, z: { at: 450 }, c: { at: 175, ch: [3] } }, snap: { ready: 55, at: 450 } };
  const M = HB.merge(A, B);
  assert.equal(M.since, 50);
  assert.equal(M.at, 600);
  assert.deepEqual(Object.keys(M.got).sort(), ["c", "x", "y", "z"]);
  assert.deepEqual(M.got.y, { at: 250 });
  assert.deepEqual(M.got.x, { at: 200, seen: 1 });
  assert.deepEqual(M.got.c, { at: 150, back: 1, ch: [1, 3] });
  assert.equal(M.snap.ready, 55);
  assert.deepEqual(HB.merge(A, B), HB.merge(B, A));
  assert.deepEqual(HB.merge(null, B), B);
  assert.equal(HB.merge(null, { nothing: 1 }), null);
});

test("need: the locked badge lines, no dashes", () => {
  const ctx = { planned: 15, hasMock: true, meter: "Launch poll", target: 75 };
  assert.equal(HB.need({ rule: { type: "chapter", ch: 4 } }, ctx), "Finish chapter 4.");
  assert.equal(HB.need({ rule: { type: "book" } }, ctx), "Finish all 15 chapters.");
  assert.equal(HB.need({ rule: { type: "readiness" } }, ctx), "Get your launch poll to 75.");
  assert.equal(HB.need({ rule: { type: "exam", min: 70 } }, { hasMock: false }), "The practice exam for this book is still being written.");
  assert.equal(HB.need({ rule: { type: "exam", min: 70 } }, ctx), "Score 70 percent or better on a full practice exam.");
  assert.equal(HB.need({ rule: { type: "exam", min: 70 } }, { ...ctx, mockOne: "one practice test section" }), "Score 70 percent or better on one practice test section.");
  assert.equal(HB.need({ hidden: true, rule: { type: "pick" } }, ctx), "Hidden. It shows up when you earn it.");
  for (const t of ["chapter", "book", "clean", "quiz", "exam", "final", "readiness", "streak", "all"]) assert.doesNotMatch(HB.need({ rule: { type: t, ch: 1, days: 3, min: 70 } }, ctx), /[–—]|\s-\s/);
});

test("art: every form and mark draws in every state", () => {
  for (const form of HB.FORMS) for (const mark of [...HB.MARKS, "num"]) for (const st of ["got", "locked", "hidden"]) {
    const svg = HB.art({ mark, rule: { type: mark === "num" ? "chapter" : "book", ch: 7 } }, { form, color: { bg: "#111", rim: "#222", ink: "#333", paper: "#444" } }, st, 48);
    assert.match(svg, /^<svg class="bdgart [a-z]+" viewBox="0 0 64 64" width="48" height="48" aria-hidden="true"/);
    assert.doesNotMatch(svg, /undefined|NaN/);
  }
  // a locked chapter badge shows its number, a hidden one a question mark
  assert.match(HB.art({ mark: "orbit", rule: { type: "chapter", ch: 12 } }, DEF, "locked"), />12</);
  assert.match(HB.art({ mark: "orbit", rule: { type: "pick" } }, DEF, "hidden"), />\?</);
});

test("the real definitions: counts, pending badges dropped, targets from courses.js", () => {
  const want = { pmp: [25, 0], cisa: [22, 2], pilot: [22, 0], cphims: [21, 0], asep: [21, 2], gh300: [15, 1], lsat: [18, 0] };
  for (const [id, [total, pending]] of Object.entries(want)) {
    const c = course(id), def = DEFS[id], planned = c.planned;
    const items = HB.expand(def, { planned, chapters: [] });
    assert.equal(items.length + pending, total, id);
    assert.equal((def.items || []).filter(x => x.pending).length, pending, id);
    assert.ok(!items.some(x => x.pending), id);
    assert.equal(def.target, undefined, id);
  }
  assert.equal(course("pmp").target, 75); assert.equal(course("pilot").target, 80); assert.equal(course("gh300").target, 80);
  for (const id of ["cisa", "cphims", "asep", "lsat"]) assert.equal(course(id).target, 75);
  assert.equal(DEFS.pmp.readiness.name, "Launch poll");
  assert.ok(DEFS.pmp.items.some(x => x.id === "pmp-doc" && x.hidden && !x.pending));
  assert.match(DEFS.cisa.idCard.note, /Henry's business card/);
});

test("pick with no opt: reaching the scene (any answer) earns it, a replay doesn't", () => {
  const D = { ...DEF, items: [{ id: "t-reach", hidden: true, name: "Reached", line: "Reached.", mark: "cups", rule: { type: "pick", ch: 1, scene: "f1s2" } }] };
  const F = facts(3);
  assert.ok(!HB.evaluate(D, F, 75).got["t-reach"]); // not there yet
  F.chapters[0].picks = { 0: 0, 1: 3 }; // any option at f1s2
  assert.ok(HB.evaluate(D, F, 75).got["t-reach"]);
  F.chapters[0].rd = 1;
  assert.ok(!HB.evaluate(D, F, 75).got["t-reach"]);
});
