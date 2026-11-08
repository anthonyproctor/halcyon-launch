// Coverage gate (2026-11-07): a book whose outline map passes must keep passing. Add a course here once a reviewer has
// confirmed its map and it reaches zero absent or mentioned-only objectives (docs/RELEASE_GATES.md).
import { test } from "node:test"; import assert from "node:assert"; import { spawnSync } from "node:child_process";
const HARD = ["cisa", "lsat", "cphims", "pmp", "gh300"]; // asep and pilot join when their lesson passes ship with their re-records
for (const c of HARD) test(`${c}: every official objective is explained in a lesson`, () => {
  const r = spawnSync(process.execPath, [new URL("../tools/check_coverage.mjs", import.meta.url).pathname, c], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stdout.slice(-3000) + r.stderr);
});
