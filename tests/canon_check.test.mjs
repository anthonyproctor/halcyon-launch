// tools/canon_check.mjs against a small fictional world (tests/fixtures/canon). The real canon is private and never in this repo.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { loadCanon, findStory, checkChapter, openThreads, wordsToNum, chunks } from "../tools/canon_check.mjs";

const DIR = path.join(path.dirname(new URL(import.meta.url).pathname), "fixtures", "canon");
const W = loadCanon(DIR);
const ctx = course => ({ ...findStory(W, course), course });
const run = (course, n, body) => checkChapter(ctx(course), n, body);
const sev = (r, s) => r.filter(x => x.sev === s);

test("numbers in words", () => {
  assert.equal(wordsToNum("forty one"), 41); assert.equal(wordsToNum("forty-one"), 41); assert.equal(wordsToNum("17"), 17); assert.equal(wordsToNum("lots"), null);
});

test("speakers: unknown tags are errors, each reported once; man, woman, narrator are always fine", () => {
  const r = run("tbook", 1, '`<span class="said" data-who="Pell">"Hi."</span> <span class="said" data-who="Zed">"Who?"</span> <span class="said" data-who="Zed">"Me."</span> <span data-who="man">"x"</span>`');
  assert.deepEqual(sev(r, "error").map(x => x.msg), ['speaker "Zed" isn\'t a character in world testworld for tbook']);
});

test("dates: a weekday that doesn't match is an error; with no year, any year of the story's range counts", () => {
  assert.equal(sev(run("tbook", 1, "`It was Monday, March 4, 2030.`"), "error").length, 0);
  assert.equal(sev(run("tbook", 1, "`It was Tuesday, March 4, 2030.`"), "error").length, 1);
  assert.equal(sev(run("tbook", 1, "`Mon Mar 4 at nine.`"), "error").length, 0);
  assert.equal(sev(run("tbook", 1, "`Fri Mar 4 at nine.`"), "error").length, 1);
  assert.equal(sev(run("tbook", 1, "`THURSDAY, MAY 26, 0900 hours`"), "error").length, 1); // 0900 is a time, not a year: no Thursday May 26 in 2030
  assert.equal(sev(run("tbook", 1, "`// comment: Tuesday, March 4, 2030\n`ok`"), "error").length, 0); // code comments are ignored
});

test("ages: off by more than a year warns; a flashback year nearby or an allow entry clears it", () => {
  assert.equal(sev(run("tbook", 1, "`Pell, forty,` said the clerk."), "warning").length, 0);
  assert.equal(sev(run("tbook", 1, "`Pell, fifty, said the clerk.`"), "warning").length, 1);
  assert.equal(sev(run("tbook", 1, "`In 2010 Pell was twenty and broke.`"), "warning").length, 0);
  assert.equal(sev(run("tbook", 1, "`Pell was nineteen once.`"), "warning").length, 0); // allow list
  assert.equal(sev(run("tbook", 1, "`Pell, 150, fuel 40 gallons.`"), "warning").length, 0); // a weight list, not an age
});

test("born: speaking in a chapter dated before birth is an error", () => {
  assert.equal(sev(run("tpre", 1, '`<span data-who="Quill">"Hi."</span>`'), "error").length, 1);
  assert.equal(sev(run("tbook", 1, '`<span data-who="Quill">"Hi."</span>`'), "error").length, 0);
});

test("knowledge markers: too early in the same story is flagged, on time is fine", () => {
  const body = "`The vault code is 4417.`";
  assert.equal(sev(run("tbook", 2, body), "error").length, 1);
  assert.equal(sev(run("tbook", 3, body), "error").length, 0);
  assert.equal(sev(run("tbook", 2, "`The vault was shut.`"), "error").length, 0); // needs every phrase in one paragraph
});

test("a prequel or side story that knows something before the book reveals it is flagged by date", () => {
  assert.equal(sev(run("tpre", 1, "`She knew the vault code is 4417.`"), "error").length, 1);
});

test("rules apply in every chapter", () => {
  assert.equal(sev(run("tbook", 1, "`A dragon flew by.`"), "error").length, 1);
});

test("open threads: levels past the last written chapter", () => {
  const o = openThreads(ctx("tbook"), [1, 2, 3]);
  assert.deepEqual(o.map(x => x.ch), [4]);
});

test("chunks drop markup and template expressions", () => {
  assert.deepEqual(chunks('`<b>Hi</b> ${G.x?"a":"b"} there`,\n`Two`'), ["Hi there", "Two"]);
});

test("CLI: exit 1 on an error, 0 when clean", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "canon-"));
  const bad = path.join(tmp, "ch01.js"); fs.writeFileSync(bad, "`It was Tuesday, March 4, 2030.`");
  const good = path.join(tmp, "ch02.js"); fs.writeFileSync(good, "`Nothing to see.`");
  const cli = path.join(path.dirname(new URL(import.meta.url).pathname), "..", "tools", "canon_check.mjs");
  assert.throws(() => execFileSync("node", [cli, "tbook", bad], { env: { ...process.env, CANON_DIR: DIR }, stdio: "pipe" }));
  const out = execFileSync("node", [cli, "tbook", good], { env: { ...process.env, CANON_DIR: DIR } }).toString();
  assert.match(out, /0 errors/);
});
