// Unit tests for player telemetry: POST/GET /api/qa-report?action=diag (lib/qa.js), against a fake database. Run: node --test tests/player_diag.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { makeQaHandler, cleanDiag, DIAG_MAX_EVENTS } from "../lib/qa.js";

function fakeDB({ hour = 0 } = {}) {
  const calls = [], rows = [];
  const tag = async (strings, ...vals) => {
    const q = strings.join("?").replace(/\s+/g, " ").trim();
    calls.push({ q, vals });
    if (/^create /.test(q)) return [];
    if (/^select count\(\*\)::int as h from player_diag/.test(q)) return [{ h: hour }];
    if (/^insert into player_diag/.test(q)) { rows.push(vals); return []; }
    if (/^select \* from player_diag/.test(q)) return [{ id: 1, user_id: "u1", events: [] }];
    throw new Error("unexpected query: " + q);
  };
  return { sql: () => tag, calls, rows };
}
function res() { const r = { statusCode: 0, headers: {}, body: "", setHeader(k, v) { this.headers[k.toLowerCase()] = v; }, end(b) { this.body = b ?? ""; } }; r.json = () => JSON.parse(r.body); return r; }
const send = (res, code, obj) => { res.statusCode = code; res.end(JSON.stringify(obj)); };
const sameOrigin = req => req.method === "GET" || req.headers.origin === "https://" + req.headers.host;
const body = async req => req.body || {};
const h = (db, user) => makeQaHandler({ sql: db.sql, currentUser: async () => user, sameOrigin, body, send });
const post = b => ({ method: "POST", url: "/api/qa-report?action=diag", headers: { host: "h.test", origin: "https://h.test", "user-agent": "iPhone UA" }, body: b });
const ev = (over = {}) => ({ t: 1792000000000, ev: "seek:set", ct: 12.5, dur: 600, rs: 4, ns: 2, p: 0, sk: 600, page: "book", vis: "visible", d: { from: 0, to: 300, note: "x".repeat(300), "bad key": 1, obj: { a: 1 } }, ...over });

test("diag POST stores a cleaned batch with the user id, for a tester", async () => {
  const db = fakeDB(), r = res();
  await h(db, { id: "u7", is_tester: true })(post({ events: [ev(), ev({ ev: "bad event!" }), ev({ ev: "ms:play:rejected", d: { name: "NotAllowedError" } })], sid: "abc123", ua: "UA", standalone: true, route: "#pmp/listen" }), r);
  assert.equal(r.statusCode, 200, r.body);
  assert.equal(r.json().n, 2); // the malformed event name is dropped
  const v = db.rows[0];
  assert.equal(v[0], "u7"); assert.equal(v[1], "abc123"); assert.equal(v[3], true);
  const evs = JSON.parse(v[6]);
  assert.equal(evs[0].d.note.length, 100);           // strings capped
  assert.ok(!("bad key" in evs[0].d) && !("obj" in evs[0].d)); // odd keys and nested objects dropped
  assert.equal(evs[1].d.name, "NotAllowedError");
  assert.ok(db.calls.some(c => /create table if not exists player_diag/.test(c.q)));
});

test("diag POST refuses non testers, signed out, foreign origin, empty and oversized batches, and rate limits per user", async () => {
  let r = res(); await h(fakeDB(), { id: "u1" })(post({ events: [ev()] }), r); assert.equal(r.statusCode, 403);
  r = res(); await h(fakeDB(), null)(post({ events: [ev()] }), r); assert.equal(r.statusCode, 401);
  r = res(); const p = post({ events: [ev()] }); p.headers.origin = "https://evil.test"; await h(fakeDB(), { id: "u1", is_admin: true })(p, r); assert.equal(r.statusCode, 403);
  r = res(); await h(fakeDB(), { id: "u1", is_admin: true })(post({ events: [] }), r); assert.equal(r.statusCode, 400);
  r = res(); await h(fakeDB(), { id: "u1", is_admin: true })(post({ events: Array.from({ length: DIAG_MAX_EVENTS + 1 }, () => ev()) }), r); assert.equal(r.statusCode, 400);
  const db = fakeDB({ hour: 240 }); r = res(); await h(db, { id: "u1", is_admin: true })(post({ events: [ev()] }), r); assert.equal(r.statusCode, 429); assert.equal(db.rows.length, 0);
});

test("diag GET is admins only and defaults to the last day", async () => {
  let r = res(); await h(fakeDB(), { id: "u1", is_tester: true })({ method: "GET", url: "/api/qa-report?action=diag", headers: {} }, r); assert.equal(r.statusCode, 403);
  const db = fakeDB(); r = res(); await h(db, { id: "u1", is_admin: true })({ method: "GET", url: "/api/qa-report?action=diag&since=2h", headers: {} }, r);
  assert.equal(r.statusCode, 200); assert.equal(r.json().batches.length, 1);
  assert.ok(Date.now() - new Date(r.json().since).getTime() < 2.1 * 3600e3);
});

test("cleanDiag drops unusable events", () => {
  assert.equal(cleanDiag({ events: [{ ev: "" }, { ev: "x y" }] }).ok, false);
  assert.equal(cleanDiag({ events: "no" }).ok, false);
});
