// Unit tests for the private profile endpoint (lib/me.js, served as api/me.js), against a fake database. Run: npm run test:api
// Made-up players only.
import { test } from "node:test";
import assert from "node:assert/strict";
import { makeMeHandler, makeEnsureMe, cleanName, cleanAvatar } from "../lib/me.js";

// a fake client: two players, profiles keyed by the text id, every query logged
function fakeDB({ ensureFails = false } = {}) {
  const calls = [];
  const users = { u1: { name: "Robin Vale", created_at: new Date("2026-09-01T10:00:00Z") }, u2: { name: "Kit Moreau", created_at: new Date("2026-09-20T10:00:00Z") } };
  const profiles = { u2: { kind: "card", course: "cisa" } };
  const tag = async (strings, ...vals) => {
    const q = strings.join("?").replace(/\s+/g, " ").trim();
    calls.push({ q, vals });
    if (/^create table if not exists user_profiles/.test(q)) { if (ensureFails) throw new Error("permission denied"); return []; }
    if (/^select u\.name, u\.created_at, p\.avatar from users u left join user_profiles p on p\.user_id = u\.id::text where u\.id = \?$/.test(q)) {
      const u = users[vals[0]]; return u ? [{ ...u, avatar: profiles[vals[0]] ?? null }] : [];
    }
    if (/^select name, created_at from users where id = \?$/.test(q)) { const u = users[vals[0]]; return u ? [u] : []; }
    if (/^update users set name = \? where id = \?$/.test(q)) { users[vals[1]].name = vals[0]; return []; }
    if (/^insert into user_profiles\(user_id, avatar, updated_at\) values\(\?, \?::jsonb, now\(\)\) on conflict\(user_id\) do update set avatar = excluded\.avatar, updated_at = now\(\)$/.test(q)) {
      profiles[vals[0]] = vals[1] === null ? null : JSON.parse(vals[1]); return [];
    }
    throw new Error("unexpected query: " + q);
  };
  return { sql: () => tag, calls, users, profiles };
}
function res() {
  const r = { statusCode: 0, headers: {}, body: "", setHeader(k, v) { this.headers[k.toLowerCase()] = v; }, end(b) { this.body = b ?? ""; } };
  r.json = () => JSON.parse(r.body);
  return r;
}
const send = (res, code, obj) => { res.statusCode = code; res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify(obj)); };
const sameOrigin = req => req.method === "GET" || req.headers.origin === "https://" + req.headers.host;
const body = async req => req.body ?? {};
const handler = (db, user) => makeMeHandler({ sql: db.sql, currentUser: async () => user, sameOrigin, body, send });
const get = () => ({ method: "GET", url: "/api/me", headers: { host: "h.test" } });
const post = b => ({ method: "POST", url: "/api/me", headers: { host: "h.test", origin: "https://h.test" }, body: b });
const U1 = { id: "u1", name: "Robin Vale" }, U2 = { id: "u2", name: "Kit Moreau" };

test("signed out: 401 on GET and POST, and nothing is read or written", async () => {
  for (const req of [get(), post({ name: "Someone" })]) {
    const db = fakeDB(), r = res();
    await handler(db, null)(req, r);
    assert.equal(r.statusCode, 401, r.body);
    assert.ok(!db.calls.some(c => /^(update|insert)/.test(c.q)));
  }
});

test("a foreign origin gets 403 on POST and nothing is written; other methods get 405", async () => {
  const db = fakeDB(), r = res(), p = post({ name: "Someone Else" });
  p.headers.origin = "https://evil.test";
  await handler(db, U1)(p, r);
  assert.equal(r.statusCode, 403);
  assert.equal(db.users.u1.name, "Robin Vale");
  assert.equal(db.calls.length, 0);
  for (const method of ["PUT", "DELETE", "PATCH"]) { const r2 = res(); await handler(fakeDB(), U1)({ ...post({}), method }, r2); assert.equal(r2.statusCode, 405); }
});

test("GET returns only the caller's own name, joined date and avatar", async () => {
  const db = fakeDB();
  let r = res(); await handler(db, U1)(get(), r);
  assert.equal(r.statusCode, 200, r.body);
  assert.deepEqual(r.json(), { me: { name: "Robin Vale", joined: "2026-09-01T10:00:00.000Z", avatar: null } });
  r = res(); await handler(db, U2)(get(), r);
  assert.deepEqual(r.json(), { me: { name: "Kit Moreau", joined: "2026-09-20T10:00:00.000Z", avatar: { kind: "card", course: "cisa" } } });
  assert.ok(!r.body.includes("Robin") && !r.body.includes("u1"), "nothing about another player");
  // every read is keyed on the session's user id, never on anything the request sends
  const reads = db.calls.filter(c => /^select/.test(c.q));
  assert.deepEqual(reads.map(c => c.vals), [["u1"], ["u2"]]);
  const q = { ...get(), url: "/api/me?user=u2" };
  r = res(); await handler(db, U1)(q, r);
  assert.equal(r.json().me.name, "Robin Vale");
});

test("names: trimmed, control characters out, spaces folded, 1 to 60 characters", async () => {
  assert.deepEqual(cleanName("  Robin   Vale \n"), { ok: true, name: "Robin Vale" });
  assert.deepEqual(cleanName("Ro\u0000bin\u0007​ Vale"), { ok: true, name: "Ro bin Vale" });
  assert.equal(cleanName("x".repeat(60)).ok, true);
  assert.equal(cleanName("x".repeat(61)).ok, false);
  assert.equal(cleanName("😀".repeat(60)).ok, true, "counts characters, not UTF-16 units");
  for (const v of ["", "   ", "\u0000\u0001", null, undefined, 42, ["Robin"], { n: 1 }]) assert.equal(cleanName(v).ok, false, JSON.stringify(v));

  const db = fakeDB();
  let r = res(); await handler(db, U1)(post({ name: "  Robin\tA.  Vale " }), r);
  assert.equal(r.statusCode, 200, r.body);
  assert.equal(db.users.u1.name, "Robin A. Vale");
  assert.equal(r.json().me.name, "Robin A. Vale");
  assert.equal(db.users.u2.name, "Kit Moreau", "only the caller's row changes");
  const upd = db.calls.find(c => /^update users/.test(c.q));
  assert.deepEqual(upd.vals, ["Robin A. Vale", "u1"]);
  for (const name of ["", "   ", "x".repeat(61), 7]) {
    const d2 = fakeDB(), r2 = res();
    await handler(d2, U1)(post({ name }), r2);
    assert.equal(r2.statusCode, 400, JSON.stringify(name));
    assert.ok(!d2.calls.some(c => /^(update|insert)/.test(c.q)));
  }
});

test("avatars: an ID card or a cast portrait from a known book, or null; anything else is refused", async () => {
  assert.deepEqual(cleanAvatar({ kind: "card", course: "pmp", extra: "dropped" }), { ok: true, avatar: { kind: "card", course: "pmp" } });
  assert.deepEqual(cleanAvatar({ kind: "cast", course: "cisa", id: "henry", url: "https://evil.test/x.png" }), { ok: true, avatar: { kind: "cast", course: "cisa", id: "henry" } });
  assert.deepEqual(cleanAvatar(null), { ok: true, avatar: null });
  for (const v of [undefined, "pmp", [], { kind: "photo", course: "pmp" }, { kind: "card", course: "nope" }, { kind: "card" },
    { kind: "cast", course: "pmp" }, { kind: "cast", course: "pmp", id: "../etc/passwd" }, { kind: "cast", course: "pmp", id: "Sam" },
    { kind: "cast", course: "pmp", id: "x".repeat(41) }, { kind: "cast", course: "pmp", id: "<img>" }]) assert.equal(cleanAvatar(v).ok, false, JSON.stringify(v));

  const d2 = fakeDB(), r2 = res();
  await handler(d2, U1)(post({ avatar: { kind: "photo", course: "pmp", src: "data:image/png;base64,AAAA" } }), r2);
  assert.equal(r2.statusCode, 400);
  assert.ok(!d2.calls.some(c => /^(update|insert)/.test(c.q)));
});

test("POST upserts the avatar for the caller's text id, as JSON, and null clears it", async () => {
  const db = fakeDB();
  let r = res(); await handler(db, U1)(post({ avatar: { kind: "cast", course: "pmp", id: "ruth" } }), r);
  assert.equal(r.statusCode, 200, r.body);
  assert.deepEqual(r.json().me.avatar, { kind: "cast", course: "pmp", id: "ruth" });
  const ins = db.calls.filter(c => /^insert into user_profiles/.test(c.q));
  assert.equal(ins.length, 1);
  assert.equal(ins[0].vals[0], "u1");
  assert.equal(typeof ins[0].vals[1], "string");
  assert.deepEqual(JSON.parse(ins[0].vals[1]), { kind: "cast", course: "pmp", id: "ruth" });
  assert.match(ins[0].q, /on conflict\(user_id\) do update set avatar = excluded\.avatar, updated_at = now\(\)/);
  assert.ok(db.calls.some(c => /^create table if not exists user_profiles/.test(c.q)));
  // a numeric users.id is still keyed as text
  const d3 = fakeDB(); d3.users[42] = { name: "N", created_at: null };
  r = res(); await handler(d3, { id: 42 })(post({ avatar: { kind: "card", course: "pilot" } }), r);
  assert.equal(r.statusCode, 200, r.body);
  assert.equal(d3.calls.find(c => /^insert into user_profiles/.test(c.q)).vals[0], "42");
  // null clears it
  r = res(); await handler(db, U1)(post({ avatar: null }), r);
  assert.equal(r.statusCode, 200);
  assert.equal(db.calls.filter(c => /^insert into user_profiles/.test(c.q)).pop().vals[1], null);
  assert.equal(r.json().me.avatar, null);
  // name and avatar together, and an empty body
  r = res(); await handler(db, U1)(post({ name: "Robin", avatar: { kind: "card", course: "asep" } }), r);
  assert.equal(r.statusCode, 200);
  assert.deepEqual(r.json().me, { name: "Robin", joined: "2026-09-01T10:00:00.000Z", avatar: { kind: "card", course: "asep" } });
  r = res(); await handler(db, U1)(post({}), r);
  assert.equal(r.statusCode, 400);
});

test("the table can't be made: GET still answers 200 with avatar null, a name still saves, an avatar change gets 503", async () => {
  const db = fakeDB({ ensureFails: true });
  const h = handler(db, U2);
  let r = res(); await h(get(), r);
  assert.equal(r.statusCode, 200, r.body);
  assert.deepEqual(r.json(), { me: { name: "Kit Moreau", joined: "2026-09-20T10:00:00.000Z", avatar: null } });
  r = res(); await h(post({ name: "Kit M." }), r);
  assert.equal(r.statusCode, 200, r.body);
  assert.equal(db.users.u2.name, "Kit M.");
  r = res(); await h(post({ avatar: { kind: "card", course: "pmp" } }), r);
  assert.equal(r.statusCode, 503);
  assert.ok(!db.calls.some(c => /^insert into user_profiles/.test(c.q)));
  // after a failure it doesn't retry the create on every request
  const creates = db.calls.filter(c => /^create table/.test(c.q)).length;
  assert.equal(creates, 1);
});

test("makeEnsureMe creates the table once and reuses it", async () => {
  const db = fakeDB(), ensure = makeEnsureMe(db.sql);
  assert.equal(await ensure(), true);
  assert.equal(await ensure(), true);
  assert.equal(db.calls.filter(c => /^create table/.test(c.q)).length, 1);
});
