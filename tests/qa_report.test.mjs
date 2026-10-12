// Unit tests for the QA report endpoint (lib/qa.js, served as api/qa-report.js), against a fake database. Run: npm run test:api
import { test } from "node:test";
import assert from "node:assert/strict";
import { makeQaHandler, cleanReport, parseSince, toCSV } from "../lib/qa.js";

function fakeDB({ minute = 0, day = 0 } = {}) {
  const calls = [], reports = [];
  const tag = async (strings, ...vals) => {
    const q = strings.join("?").replace(/\s+/g, " ").trim();
    calls.push({ q, vals });
    if (/^create /.test(q) || /^delete from qa_hits/.test(q) || /^insert into qa_hits/.test(q)) return [];
    if (/count\(\*\) filter/.test(q)) return [{ m: minute, d: day }];
    if (/^insert into qa_reports/.test(q)) { reports.push(vals); return [{ id: reports.length }]; }
    if (/^select \* from qa_reports/.test(q)) return [{ id: 1, created_at: new Date("2026-10-11T12:00:00Z"), type: "typo", note: 'a "quoted" note', tester: "", course: "pmp", book: "The Halcyon Launch", chapter: 1, page_id: "f1 s2", line_idx: 3, speaker: "Sam", voice: "", line_text: "Okay", audio_src: "/audio/v2/pages/f1/s2.mp3", audio_t: 12.5, track: "story", mode: "page", route: "pmp/full/1", ua: "UA", app_commit: "" }];
    throw new Error("unexpected query: " + q);
  };
  return { sql: () => tag, calls, reports };
}
function res() {
  const r = { statusCode: 0, headers: {}, body: "", setHeader(k, v) { this.headers[k.toLowerCase()] = v; }, end(b) { this.body = b ?? ""; } };
  r.json = () => JSON.parse(r.body);
  return r;
}
const send = (res, code, obj) => { res.statusCode = code; res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify(obj)); };
const sameOrigin = req => req.method === "GET" || req.headers.origin === "https://" + req.headers.host;
const body = async req => req.body || {};
function handler(db, user) { return makeQaHandler({ sql: db.sql, currentUser: async () => user, sameOrigin, body, send }); }
const post = b => ({ method: "POST", url: "/api/qa-report", headers: { host: "h.test", origin: "https://h.test", "x-forwarded-for": "203.0.113.9", "user-agent": "TestUA" }, body: b });
const good = { type: "wrong_voice", note: "Sam sounds like Garrett here", tester: "K", ctx: { course: "pmp", book: "The Halcyon Launch", chapter: 1, page: "f1 s2", line: 4, speaker: "Sam", text: "x".repeat(400), src: "https://h.test/audio/v2/pages/f1/s2.mp3?x=1", t: 83.456, track: "story", mode: "page", route: "pmp/full/1", email: "nope@x.com", ip: "1.2.3.4" } };

test("POST stores a valid report, trims the line, keeps the audio path only, drops unknown fields", async () => {
  const db = fakeDB(), r = res();
  await handler(db, { id: "u1" })(post(good), r);
  assert.equal(r.statusCode, 200, r.body);
  assert.equal(r.json().ok, true);
  assert.equal(db.reports.length, 1);
  const ins = db.calls.find(c => /^insert into qa_reports/.test(c.q)).vals;
  assert.equal(ins[0], "wrong_voice");
  assert.equal(ins[10].length, 300);                      // line text capped at 300
  assert.equal(ins[11], "/audio/v2/pages/f1/s2.mp3");     // no host, no query string
  assert.equal(ins[12], 83.46);
  assert.ok(!JSON.stringify(ins).includes("nope@x.com") && !JSON.stringify(ins).includes("203.0.113.9") && !JSON.stringify(ins).includes("1.2.3.4"));
  const hit = db.calls.find(c => /^insert into qa_hits/.test(c.q)).vals[0];
  assert.ok(hit.length === 32 && !hit.includes("203"));  // a salted hash, never the raw IP
  assert.ok(db.calls.some(c => /create table if not exists qa_reports/.test(c.q)));
});

test("POST rejects a bad type, a long note, a missing sign in, a foreign origin", async () => {
  let r = res(); await handler(fakeDB(), { id: "u1" })(post({ ...good, type: "nope" }), r); assert.equal(r.statusCode, 400);
  r = res(); await handler(fakeDB(), { id: "u1" })(post({ ...good, note: "x".repeat(501) }), r); assert.equal(r.statusCode, 400);
  r = res(); await handler(fakeDB(), null)(post(good), r); assert.equal(r.statusCode, 401);
  r = res(); await handler(fakeDB(), { id: "u1" })(post({ ...good, type: "text_mismatch" }), r); assert.equal(r.statusCode, 200);
  r = res(); const p = post(good); p.headers.origin = "https://evil.test"; await handler(fakeDB(), { id: "u1" })(p, r); assert.equal(r.statusCode, 403);
});

test("POST rate limits per IP hash", async () => {
  const db = fakeDB({ minute: 10 }), r = res();
  await handler(db, { id: "u1" })(post(good), r);
  assert.equal(r.statusCode, 429);
  assert.equal(db.reports.length, 0);
});

test("GET export is admins only, filters by since, and gives CSV", async () => {
  let r = res(); await handler(fakeDB(), { id: "u1", is_admin: false })({ method: "GET", url: "/api/qa-report", headers: {} }, r); assert.equal(r.statusCode, 403);
  r = res(); await handler(fakeDB(), null)({ method: "GET", url: "/api/qa-report", headers: {} }, r); assert.equal(r.statusCode, 403);
  const db = fakeDB(); r = res();
  await handler(db, { id: "a", is_admin: true })({ method: "GET", url: "/api/qa-report?since=2026-10-01", headers: {} }, r);
  assert.equal(r.statusCode, 200);
  assert.equal(r.json().reports.length, 1);
  const sel = db.calls.find(c => /^select \* from qa_reports/.test(c.q));
  assert.match(sel.q, /created_at >= \?/);
  assert.equal(sel.vals[0], "2026-10-01T00:00:00.000Z");
  r = res(); await handler(fakeDB(), { id: "a", is_admin: true })({ method: "GET", url: "/api/qa-report?format=csv", headers: {} }, r);
  assert.match(r.headers["content-type"], /text\/csv/);
  assert.match(r.body, /^id,created_at,type,/);
  assert.match(r.body, /"a ""quoted"" note"/);
});

test("helpers: since spans and dates, CSV of nothing", () => {
  const now = Date.parse("2026-10-11T12:00:00Z");
  assert.equal(parseSince("24h", now).toISOString(), "2026-10-10T12:00:00.000Z");
  assert.equal(parseSince("7d", now).toISOString(), "2026-10-04T12:00:00.000Z");
  assert.equal(parseSince("garbage", now), null);
  assert.equal(parseSince("", now), null);
  assert.equal(toCSV([]).split("\n").length, 2);
  assert.equal(cleanReport(null).ok, false);
});
