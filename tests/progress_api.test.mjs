// Unit tests for the progress endpoint (lib/progress.js, served as api/progress.js), against a fake database. Run: npm run test:api
// Made-up players only. The account check (lib/acct.js): a write made for one account that arrives with another's session gets 409 and lands nowhere.
import { test } from "node:test";
import assert from "node:assert/strict";
import { makeProgressHandler } from "../lib/progress.js";

function fakeDB() {
  const calls = [], rows = {};
  const tag = async (strings, ...vals) => {
    const q = strings.join("?").replace(/\s+/g, " ").trim();
    calls.push({ q, vals });
    if (/^insert into progress\(user_id,chapter,state,updated_at\) values\(\?,\?,\?::jsonb,now\(\)\) on conflict\(user_id,chapter\) do update set state=excluded\.state,updated_at=now\(\)$/.test(q)) { rows[vals[0] + ":" + vals[1]] = JSON.parse(vals[2]); return []; }
    if (/^update users set cur=\? where id=\?$/.test(q)) return [];
    throw new Error("unexpected query: " + q);
  };
  return { sql: () => tag, calls, rows };
}
function res() {
  const r = { statusCode: 0, headers: {}, body: "", setHeader(k, v) { this.headers[k.toLowerCase()] = v; }, end(b) { this.body = b ?? ""; } };
  r.json = () => JSON.parse(r.body);
  return r;
}
const send = (res, code, obj) => { res.statusCode = code; res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify(obj)); };
const sameOrigin = req => req.method === "GET" || req.headers.origin === "https://" + req.headers.host;
const body = async req => req.body ?? {};
const acctOf = id => "tag-" + id;
const handler = (db, user, logs = []) => makeProgressHandler({ sql: db.sql, currentUser: async () => user, sameOrigin, body, send, acctOf, log: m => logs.push(m) });
const put = (b, acct) => ({ method: "PUT", url: "/api/progress", headers: { host: "h.test", origin: "https://h.test", ...(acct === undefined ? {} : { "x-halcyon-account": acct }) }, body: b });
const U1 = { id: "u1" }, U2 = { id: "u2" };
const REC = { chapter: 3, state: { book: { n: 2 }, at: 1 } };

test("a write made for another account than the session's: 409 account changed, and nothing is written", async () => {
  const db = fakeDB(), r = res();
  await handler(db, U2)(put(REC, "tag-u1"), r);
  assert.equal(r.statusCode, 409, r.body);
  assert.deepEqual(r.json(), { error: "account changed" });
  assert.equal(db.calls.length, 0, "no query at all");
  assert.deepEqual(db.rows, {});
});

test("the session's own account: written to that account", async () => {
  const db = fakeDB(), r = res();
  await handler(db, U1)(put(REC, "tag-u1"), r);
  assert.equal(r.statusCode, 200, r.body);
  assert.deepEqual(db.rows, { "u1:3": REC.state });
});

test("no account header (an app from before the check): still written, and counted in the log", async () => {
  const db = fakeDB(), r = res(), logs = [];
  await handler(db, U1, logs)(put(REC), r);
  assert.equal(r.statusCode, 200, r.body);
  assert.deepEqual(db.rows, { "u1:3": REC.state });
  assert.equal(logs.length, 1);
  assert.match(logs[0], /^\[acct\] write with no account header: PUT \/api\/progress \(\d+ on this instance\)$/);
  const r2 = res(); await handler(fakeDB(), U1, logs)(put(REC, ""), r2);
  assert.equal(r2.statusCode, 200, "an empty header counts as none");
});

test("the account check comes after sign in and origin: signed out is 401, a foreign origin 403, neither writes", async () => {
  let db = fakeDB(), r = res();
  await handler(db, null)(put(REC, "tag-u1"), r);
  assert.equal(r.statusCode, 401);
  const p = put(REC, "tag-u2"); p.headers.origin = "https://evil.test";
  db = fakeDB(); r = res(); await handler(db, U1)(p, r);
  assert.equal(r.statusCode, 403);
  assert.equal(db.calls.length, 0);
});
