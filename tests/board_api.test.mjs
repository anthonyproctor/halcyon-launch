// Unit tests for the production board (lib/board.js, served by api/admin.js), against an in-memory fake database that runs the
// exact statements the module sends. Made-up books and lines only. Run: node --test tests/board_api.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { makeBoard, cleanBook, cleanEar } from "../lib/board.js";

function fakeDB() {
  const books = new Map(), ears = new Map(), meta = new Map(), calls = [];
  const tag = async (strings, ...v) => {
    const q = strings.join("?").replace(/\s+/g, " ").trim();
    calls.push(q);
    if (/^create table if not exists production_/.test(q)) return [];
    if (q.startsWith("select id, ord, data from production_books")) return [...books.values()].sort((a, b) => a.ord - b.ord || a.id.localeCompare(b.id));
    if (q.startsWith("select id, ord, data, verdict, note, verdict_at from production_ears")) return [...ears.values()].sort((a, b) => a.ord - b.ord || a.id.localeCompare(b.id));
    if (q.startsWith("select v from production_meta")) return meta.has("updated") ? [{ v: meta.get("updated") }] : [];
    if (q.startsWith("insert into production_books")) { books.set(v[0], { id: v[0], ord: v[1], data: JSON.parse(v[2]) }); return []; }
    if (q.startsWith("insert into production_ears")) {
      const old = ears.get(v[0]), reset = /verdict = ''/.test(q);
      ears.set(v[0], { id: v[0], ord: v[1], data: JSON.parse(v[2]), verdict: old && !reset ? old.verdict : "", note: old && !reset ? old.note : "", verdict_at: old && !reset ? old.verdict_at : null });
      return [];
    }
    if (q.startsWith("delete from production_ears")) { ears.delete(v[0]); return []; }
    if (q.startsWith("insert into production_meta")) { meta.set("updated", v[0]); return []; }
    if (q.startsWith("update production_ears set verdict = ?, note = ?")) { const e = ears.get(v[3]); if (!e) return []; Object.assign(e, { verdict: v[0], note: v[1], verdict_at: v[2] }); return [{ id: e.id, verdict: e.verdict, note: e.note }]; }
    if (q.startsWith("update production_ears set verdict = ?, verdict_at")) { const e = ears.get(v[2]); if (!e) return []; Object.assign(e, { verdict: v[0], verdict_at: v[1] }); return [{ id: e.id, verdict: e.verdict, note: e.note }]; }
    if (q.startsWith("update production_ears set note = ?")) { const e = ears.get(v[1]); if (!e) return []; e.note = v[0]; return [{ id: e.id, verdict: e.verdict, note: e.note }]; }
    throw new Error("unexpected query: " + q);
  };
  return { sql: () => tag, books, ears, meta, calls };
}
const BOOK = { id: "bk1", order: 2, title: "A Made Up Book", cert: "TEST", planned: 3, note: "two written",
  chapters: [{ n: 1, title: "One", text: "done", exam: "done", audio: "done", heard: "partial", live: "done", note: "" },
             { n: 2, title: "Two", text: "done", exam: "todo", audio: "running", heard: "bogus", live: "todo", note: "x".repeat(900) }] };
const EAR = { id: "bk1-ch1-s1", ord: 1, book: "A Made Up Book", where: "Ch1, page s1", at: "0:04", line: "\"Hello.\"", listen_for: "Clear?", url: "https://audio.example.com/a.mp3" };

test("cleanBook keeps the known fields, maps order to ord, clamps notes, and turns unknown stage values into todo", () => {
  const b = cleanBook(BOOK);
  assert.equal(b.ord, 2); assert.equal(b.planned, 3); assert.equal(b.chapters[1].heard, "todo"); assert.equal(b.chapters[1].note.length, 400);
  assert.equal(cleanBook({ id: "bad id!" }), null); assert.equal(cleanBook(null), null);
  assert.equal(cleanBook({ id: "x", chapters: [{}] }).planned, 1);
});

test("cleanEar keeps only https audio links", () => {
  assert.equal(cleanEar({ ...EAR, url: "javascript:alert(1)" }).data.url, "");
  assert.equal(cleanEar({ ...EAR, url: "http://audio.example.com/a.mp3" }).data.url, "");
  assert.equal(cleanEar(EAR).data.url, EAR.url);
  assert.equal(cleanEar({ id: "" }), null);
});

test("put then get returns the board in order, with the updated label", async () => {
  const db = fakeDB(), B = makeBoard(db.sql);
  const r = await B.put({ books: [BOOK, { id: "bk0", ord: 1, title: "First", chapters: [] }], ears: [EAR], updated: "Wed Oct 14" });
  assert.deepEqual(r, { ok: true, books: 2, ears: 1, removed: 0 });
  const g = await B.get();
  assert.deepEqual(g.books.map(b => b.id), ["bk0", "bk1"]);
  assert.equal(g.books[1].chapters.length, 2);
  assert.equal(g.ears[0].verdict, ""); assert.equal(g.ears[0].line, "\"Hello.\"");
  assert.equal(g.updated, "Wed Oct 14");
});

test("a verdict and note survive a later push of the same line; reset:true clears them", async () => {
  const db = fakeDB(), B = makeBoard(db.sql);
  await B.put({ ears: [EAR] });
  assert.equal((await B.verdict({ id: EAR.id, verdict: "redo", note: "too fast" })).status, 200);
  await B.put({ ears: [{ ...EAR, listen_for: "Clear now?" }] });
  let e = (await B.get()).ears[0];
  assert.equal(e.verdict, "redo"); assert.equal(e.note, "too fast"); assert.equal(e.listen_for, "Clear now?");
  await B.put({ ears: [{ ...EAR, reset: true }] });
  e = (await B.get()).ears[0];
  assert.equal(e.verdict, ""); assert.equal(e.note, "");
});

test("ear_verdict and ear_note: OK, Redo, clear, a note alone, bad input and a missing line", async () => {
  const db = fakeDB(), B = makeBoard(db.sql);
  await B.put({ ears: [EAR] });
  assert.equal((await B.verdict({ id: EAR.id, verdict: "ok" })).body.verdict, "ok");
  assert.ok(db.ears.get(EAR.id).verdict_at);
  assert.equal((await B.verdict({ id: EAR.id, verdict: "" })).body.verdict, "");
  assert.equal(db.ears.get(EAR.id).verdict_at, null);
  assert.equal((await B.note({ id: EAR.id, note: "fine on the second listen" })).body.note, "fine on the second listen");
  assert.equal((await B.verdict({ id: EAR.id, verdict: "maybe" })).status, 400);
  assert.equal((await B.verdict({ id: "../x", verdict: "ok" })).status, 400);
  assert.equal((await B.verdict({ id: "nope", verdict: "ok" })).status, 404);
  assert.equal((await B.note({ id: EAR.id })).status, 400);
});

test("remove_ears drops lines; bad ids are ignored", async () => {
  const db = fakeDB(), B = makeBoard(db.sql);
  await B.put({ ears: [EAR, { ...EAR, id: "bk1-ch1-s2" }] });
  const r = await B.put({ remove_ears: [EAR.id, "bad id!"] });
  assert.equal(r.removed, 1);
  assert.deepEqual((await B.get()).ears.map(e => e.id), ["bk1-ch1-s2"]);
});

test("api/admin.js: board actions are behind the same admins-only check", async () => {
  const src = (await import("node:fs")).readFileSync(new URL("../api/admin.js", import.meta.url), "utf8");
  const gate = src.indexOf('if (!u || !u.is_admin) return send(res, 403');
  assert.ok(gate > 0);
  for (const a of ['action === "board"', 'action === "board_put"', 'action === "ear_verdict"', 'action === "ear_note"']) assert.ok(src.indexOf(a) > gate, a);
});
