// Mock question ids (2026-11-08): engine.js mockQuestions builds each id as p.part.slice(0,3)+index, and saved answers, flags and
// option orders are keyed by it ("mq"+id in order.js keys). Forms 1 to 9 keep the colon ("M1:20"), forms 10 and up don't ("M120"),
// so the three character prefix still tells every form apart. This test fails if any two LSAT mock items, across every form
// courses.js loads, would get the same id, or if the engine stops building ids this way.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const load = (rel, ctx) => vm.runInContext(fs.readFileSync(path.join(ROOT, rel), "utf8"), ctx, { filename: rel });

test("the engine still builds mock ids from the part's first three characters plus the index", () => {
  const src = fs.readFileSync(path.join(ROOT, "engine.js"), "utf8");
  assert.match(src, /function mockQuestions\(f\)\{[^\n]*id:p\.part\.slice\(0,3\)\+i,form:pf/);
});

test("no two LSAT mock items share an id, and every form has its own three character prefix", () => {
  const ctx = vm.createContext({ window: {} }); ctx.window.window = ctx.window;
  load("courses.js", ctx);
  const c = ctx.window.HALCYON_COURSES.find(x => x.id === "lsat");
  const mocks = c.scripts.filter(s => s.startsWith("mock/"));
  assert.ok(mocks.length >= 11, "LSAT loads its mock forms");
  const W = vm.createContext({ window: {} }); W.window.window = W.window;
  for (const s of mocks) load(c.root + s, W);
  const D = W.window.HALCYON_DATA.lsat, parts = D.mock;
  const seen = new Map(), prefixes = new Map();
  for (const p of parts) {
    const pre = p.part.slice(0, 3), form = (/^M(\d+):/.exec(p.part) || [])[1];
    assert.ok(form, `part name starts Mn: (${p.part})`);
    if (prefixes.has(pre)) assert.equal(prefixes.get(pre), form, `prefix ${pre} is shared by forms ${prefixes.get(pre)} and ${form}`);
    prefixes.set(pre, form);
    p.questions.forEach((q, i) => { const id = pre + i;
      assert.ok(!seen.has(id), `duplicate id ${id}: ${seen.get(id)} and ${p.part} item ${i}`); seen.set(id, `${p.part} item ${i}`) });
  }
  // the ids saved progress already uses for forms 1 to 9 are unchanged
  assert.ok(seen.has("M1:0") && seen.has("M1:24") && seen.has("M9:0"));
  assert.ok(seen.has("M120") && seen.has("M1224"), "M12's ids");
});
