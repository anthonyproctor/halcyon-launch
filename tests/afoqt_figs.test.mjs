// figs.js helpers for AFOQT picture items (2026-11-07): the Block Counting touch counter, the Table Reading value function, the attribute
// checks the course checker runs, and the words a figure speaks. Run: node --test tests/afoqt_figs.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const w = {}; new Function("window", fs.readFileSync(path.join(ROOT, "figs.js"), "utf8"))(w);
const F = w.HalcyonFigs;
const PILE = "0,0,0,2,1,1;0,1,0,2,1,1;0,2,0,2,1,1;2,0,0,1,3,1;0,0,1,1,2,1;1,0,1,1,2,1;0,2,1,3,1,1;0,0,2,2,1,1"; // the fixture's Pile A

test("touches counts face contact only, partial faces included", () => {
  assert.deepEqual(F.touches(PILE, 4), [0, 1, 5, 6, 7]); // two below, one beside, one behind, one on top (block 2 in the fixture, keyed 5)
  assert.deepEqual(F.touches(PILE, 7), [4, 5]);
  assert.deepEqual(F.touches(PILE, 2), [1, 3, 6]);
  // edge contact and corner contact don't count
  assert.deepEqual(F.touches("0,0,0,1,1,1;1,1,0,1,1,1", 0), []); // share a vertical edge
  assert.deepEqual(F.touches("0,0,0,1,1,1;1,1,1,1,1,1", 0), []); // share a corner
  assert.deepEqual(F.touches("0,0,0,1,1,1;1,0,1,1,1,1", 0), []); // share a horizontal edge
  // a block half across another is still a face contact; a gap is not
  assert.deepEqual(F.touches("0,0,0,2,1,1;1,0,1,2,1,1", 0), [1]);
  assert.deepEqual(F.touches("0,0,0,1,1,1;1.5,0,0,1,1,1", 0), []);
  // the same answer from parsed boxes, and symmetric
  const B = F.parseBoxes(PILE);
  B.forEach((_, i) => F.touches(B, i).forEach(j => assert.ok(F.touches(B, j).includes(i), `${i} touches ${j} but not back`)));
});

test("a pile is checked: no overlaps, nothing floats, every label shows", () => {
  const a = { type: "chart", kind: "blocks", title: "Pile", boxes: PILE, labels: "1:7,2:4,3:2,4:3,5:6" };
  assert.deepEqual(F.check(a), []);
  assert.deepEqual(F.floating("0,0,0,1,1,1;0,0,2,1,1,1"), [1]);
  assert.deepEqual(F.overlapping("0,0,0,2,1,1;1,0,0,2,1,1"), [[0, 1]]);
  assert.match(F.check({ ...a, boxes: PILE + ";5,5,3,1,1,1" }).join("; "), /box 8 floats/);
  assert.match(F.check({ ...a, labels: "1:7,2:9" }).join("; "), /label 2 names box 9/);
  assert.match(F.check({ ...a, labels: "1:0" }).join("; "), /label 1 has no face in view/); // box 0 is under and behind the others
});

test("xyVal is deterministic, two digits, and changes gently between neighbors", () => {
  for (const seed of [1, 7, 42, 2027]) {
    for (let x = -10; x <= 10; x++) for (let y = -10; y <= 10; y++) {
      const v = F.xyVal(seed, x, y);
      assert.ok(Number.isInteger(v) && v >= 10 && v <= 99, `seed ${seed} (${x},${y}) = ${v}`);
      assert.equal(v, F.xyVal(seed, x, y));
      if (x < 10) assert.ok(Math.abs(F.xyVal(seed, x + 1, y) - v) <= 4);
      if (y < 10) assert.ok(Math.abs(F.xyVal(seed, x, y + 1) - v) <= 4);
    }
  }
  assert.equal(F.xyVal(7, 1, -2), 58); // the fixture's keyed cell
  assert.notDeepEqual([-3, 0, 3].map(x => F.xyVal(1, x, 0)), [-3, 0, 3].map(x => F.xyVal(2, x, 0))); // seeds give different tables
  const near = F.xyNear(7, 1, -2);
  assert.ok(near.length >= 4 && !near.includes(58) && new Set(near).size === near.length);
  assert.deepEqual(F.check({ type: "chart", kind: "xytable", title: "T", seed: "7" }), []);
  assert.match(F.check({ type: "chart", kind: "xytable", title: "T", seed: "x" }).join(), /integer seed/);
});

test("dials and aircraft read in words, and draw without gaps", () => {
  assert.equal(F.say({ type: "chart", kind: "dials", bank: "-30", pitch: "10", heading: "90" }), "Attitude indicator: climbing 10 degrees, banked 30 degrees left. Compass: heading east, 090.");
  assert.equal(F.say({ type: "chart", kind: "plane", bank: "0", pitch: "0", heading: "225" }), "Aircraft straight and level, heading southwest, 225.");
  assert.equal(F.say({ type: "chart", kind: "plane", bank: "45", pitch: "-15", heading: "120" }), "Aircraft diving 15 degrees, banked 45 degrees right, heading 120.");
  for (let h = 0; h < 360; h += 45) for (const b of [-60, 0, 30]) for (const p of [-20, 0, 15]) {
    const d = F.draw({ type: "chart", kind: "plane", heading: String(h), bank: String(b), pitch: String(p) });
    assert.ok(!/NaN|undefined/.test(d.svg), `plane ${h} ${b} ${p}`);
    assert.ok((d.svg.match(/<polygon/g) || []).length > 15);
  }
  assert.ok(!/NaN|undefined/.test(F.draw({ type: "chart", kind: "dials", heading: "300", bank: "20", pitch: "-5" }).svg));
  assert.deepEqual(F.check({ type: "chart", kind: "plane", heading: "90", bank: "-30", pitch: "10" }, { option: true }), []);
  assert.match(F.check({ type: "chart", kind: "plane", heading: "90", bank: "-30" }, { option: true }).join(), /needs pitch/);
  assert.match(F.check({ type: "chart", kind: "dials", heading: "400", bank: "0", pitch: "0" }).join(), /heading 400 outside|needs a title/);
  assert.equal(F.draw({ type: "chart", kind: "cfd" }), null); // other kinds stay with engine.js figChart
});

test("narration speaks a picture's readings, never its markup", async () => {
  const { segments } = await import(path.join(ROOT, "tools/voices.mjs"));
  const said = segments(`A. <prop type="chart" kind="plane" heading="270" bank="-30" pitch="10"></prop>`, "narrator").map(s => s.t).join(" ");
  assert.equal(said, "A. Aircraft climbing 10 degrees, banked 30 degrees left, heading west, 270.");
  const fig = segments(`<prop type="chart" kind="blocks" title="Pile A" boxes="${PILE}" labels="1:7,2:4"></prop>`, "narrator").map(s => s.t).join(" ");
  assert.ok(!/[<>]|boxes|kind=/.test(fig), fig);
  assert.match(fig, /^Pile A\. .*A pile of 8 blocks/);
  // other charts read as before: title, then body
  assert.equal(segments(`<prop type="chart" kind="cfd" title="Flow" done="1,2"></prop>`, "narrator").map(s => s.t).join(" "), "Flow.");
});
