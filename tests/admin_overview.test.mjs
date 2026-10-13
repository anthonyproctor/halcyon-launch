// Unit tests for the admin overview's study and badges parts (lib/me.js summarizeLog, slimBadges, attachStudy), against a fake database.
// Run: npm run test:api. Made-up players only. The SQL itself was also run on pglite (see the Phase 3 notes); this checks the shapes.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { summarizeLog, slimBadges, attachStudy, denverToday } from "../lib/me.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const W = {};
new Function("window", fs.readFileSync(path.join(ROOT, "badges.js"), "utf8"))(W);
const HB = W.HalcyonBadges; // a fresh copy of the browser's badges.js, loaded the way the page loads it

// what the profile page (engine.js meStatsHTML) does in the browser: every book's log, every device, added up per day, then HB.streak
function browserStats(logs, today) {
  const listen = {}; let read = 0, heard = 0;
  logs.forEach(L => Object.entries(L.days || {}).forEach(([d, D]) => { let r = 0, l = 0; Object.values((D && D.t) || {}).forEach(x => { r += (x && x[0]) || 0; l += (x && x[1]) || 0; }); listen[d] = (listen[d] || 0) + l; read += r; heard += l; }));
  const st = HB.streak(listen, today);
  return { read, listen: heard, current: st.current, best: st.best };
}
const day = (y, m, d) => `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

test("summarizeLog: listening days are 600 seconds or more, summed across devices and books; the run ends today or yesterday", () => {
  const a = { days: { "2026-10-10": { t: { d1: [0, 599] } }, "2026-10-11": { t: { d1: [0, 300], d2: [0, 300] }, a: ["b1"] }, "2026-10-12": { t: { d1: [120, 600] } } } };
  const b = { days: { "2026-10-10": { t: { d9: [0, 1] } }, "2026-10-13": { t: { d9: [60, 700] } } } };
  const s = summarizeLog([a, b], "2026-10-13");
  assert.deepEqual(s, { read: 180, listen: 599 + 600 + 600 + 1 + 700, current: 4, best: 4, days: 4, week: 2500, last: "2026-10-13" });
  assert.equal(summarizeLog([a, b], "2026-10-14").current, 4); // yesterday still counts
  assert.equal(summarizeLog([a, b], "2026-10-15").current, 0); // two days gone: the run is over, best stays
  assert.equal(summarizeLog([a, b], "2026-10-15").best, 4);
  assert.equal(summarizeLog(a, "2026-10-13").best, 2); // one book alone: the 10th is a second short
  assert.equal(summarizeLog([a, b], "2026-10-20").week, 0);
});

test("summarizeLog agrees with the profile page's own count on many made-up logs", () => {
  let seed = 7; const rnd = n => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % n; };
  for (let k = 0; k < 300; k++) {
    const logs = Array.from({ length: 1 + rnd(3) }, () => {
      const days = {};
      for (let i = 0; i < rnd(25); i++) { const t = {}; for (let j = 0; j <= rnd(3); j++) t["dev" + j] = [rnd(2000), rnd(3) ? rnd(1300) : 0]; days[day(2026, 9 + rnd(2), 1 + rnd(30))] = { t, a: [] }; }
      return { v: 1, days };
    });
    const today = day(2026, 10, 1 + rnd(30)), s = summarizeLog(logs, today), want = browserStats(logs, today);
    assert.deepEqual({ read: s.read, listen: s.listen, current: s.current, best: s.best }, want, JSON.stringify({ logs, today }));
  }
});

test("summarizeLog: odd shapes count as nothing and never throw", () => {
  for (const v of [null, undefined, 5, "x", [], {}, { days: [1] }, { days: "x" }, { days: null }]) assert.deepEqual(summarizeLog(v, "2026-10-13"), { read: 0, listen: 0, current: 0, best: 0, days: 0, week: 0, last: null });
  const s = summarizeLog({ days: { "2026-10-13": { t: { a: "x", b: ["1", 700], c: [-5, Infinity], d: null, e: [1e12, 0] } }, "not a day": { t: { a: [9, 9999] } }, "2026-10-12": 4 } }, "2026-10-13");
  assert.deepEqual(s, { read: 16 * 3600, listen: 700, current: 1, best: 1, days: 1, week: 700, last: "2026-10-13" }); // a device can't log over 16 hours a day
  assert.match(denverToday(Date.UTC(2026, 9, 14, 3)), /^2026-10-13$/); // 9 PM in Denver is still the 13th
});

test("slimBadges keeps only ids with when and backfill, and the snapshot's small fields", () => {
  const out = slimBadges({ "pmp-ch01": { at: 5, seen: 1, ch: [1, 2] }, "pmp-doc": { at: 9, back: 1 }, "bad id!": { at: 1 }, x: 3 }, { ready: 61.6, ch0: 3, ch1: 15, at: 7, parts: { a: 1 } });
  assert.deepEqual(out, { got: { "pmp-ch01": { at: 5 }, "pmp-doc": { at: 9, back: 1 } }, snap: { ready: 62, ch: [3, 15], at: 7 } });
  assert.deepEqual(slimBadges([1], "x"), { got: {}, snap: null });
  assert.deepEqual(slimBadges(null, { ready: "x", ch0: null, ch1: 4, at: "y" }), { got: {}, snap: { ready: null, ch: null, at: null } });
});

// a fake client that answers attachStudy's three queries the way Postgres does (the 905 rows already cut to per device pairs)
function fakeDB({ profiles = true, failLogs = false } = {}) {
  const calls = [];
  const tag = async (strings, ...vals) => {
    const q = strings.join("?").replace(/\s+/g, " ").trim(); calls.push(q);
    if (/^create table if not exists user_profiles/.test(q)) { if (!profiles) throw new Error("permission denied"); return []; }
    if (/^select u\.id, p\.avatar from users u left join user_profiles p on p\.user_id = u\.id::text/.test(q)) return [{ id: "p1", avatar: { kind: "cast", course: "pmp", id: "ada" } }, { id: "p2", avatar: { kind: "card", course: "nowhere" } }];
    if (/from progress p where p\.chapter % 10000 = 905/.test(q)) {
      if (failLogs) throw new Error("boom");
      return [{ user_id: "p1", chapter: 905, log: { days: { "2026-10-12": { t: { a: [100, 700] } }, "2026-10-13": { t: { a: [0, 650] } } } } },
        { user_id: "p1", chapter: 40905, log: JSON.stringify({ days: { "2026-10-13": { t: { b: [50, 10] } } } }) }];
    }
    if (/from progress p where p\.chapter % 10000 = 908/.test(q)) return [{ user_id: "p1", chapter: 908, got: { "pmp-ch01": { at: 11, back: null }, "pmp-ch02": { at: 12, back: 1 } }, snap: { ready: 58, at: 13, ch0: 2, ch1: 15 } }];
    throw new Error("unexpected query: " + q);
  };
  return { sql: () => tag, calls };
}

test("attachStudy: avatar, study and books per player, and nothing like a whole log in the result", async () => {
  const db = fakeDB(), users = [{ id: "p1" }, { id: "p2" }, { id: "p3" }];
  await attachStudy(users, { sql: db.sql, today: "2026-10-13" });
  const [a, b, c] = users;
  assert.deepEqual(a.avatar, { kind: "cast", course: "pmp", id: "ada" });
  assert.equal(b.avatar, null); // a book that isn't one of ours is dropped, as a save would be
  assert.deepEqual(a.study, { read: 150, listen: 1360, current: 2, best: 2, days: 2, week: 1360, last: "2026-10-13" });
  assert.deepEqual(a.books, { 0: { read: 100, listen: 1350, got: { "pmp-ch01": { at: 11 }, "pmp-ch02": { at: 12, back: 1 } }, snap: { ready: 58, ch: [2, 15], at: 13 } }, 40000: { read: 50, listen: 10, got: {}, snap: null } });
  assert.equal(b.study, null); assert.deepEqual(c.books, {});
  assert.doesNotMatch(JSON.stringify(users), /"days":\{|"t":|"a":\[/);
});

test("attachStudy: no profiles table and a failing log query still leave every player in place", async () => {
  const db = fakeDB({ profiles: false, failLogs: true }), users = [{ id: "p1" }, { id: "p2" }];
  const err = console.error; console.error = () => {};
  try { await attachStudy(users, { sql: db.sql, today: "2026-10-13" }); } finally { console.error = err; }
  assert.ok(!db.calls.some(q => /user_profiles p/.test(q)), "no join when the table can't be made");
  assert.equal(users[0].avatar, null); assert.equal(users[0].study, null);
  assert.deepEqual(users[0].books[0].got, { "pmp-ch01": { at: 11 }, "pmp-ch02": { at: 12, back: 1 } }); // the badges part still came through
  assert.deepEqual(users[1].books, {});
});
