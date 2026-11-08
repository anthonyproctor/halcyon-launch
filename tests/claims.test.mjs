// Runs tools/check_claims.mjs on every course: a claim an exam check ruled false (tools/claims_rules.json) must never ship again (2026-11-07).
import { test } from "node:test"; import assert from "node:assert"; import { spawnSync } from "node:child_process";
test("no ruled-false exam claims in any course", () => {
  const r = spawnSync(process.execPath, [new URL("../tools/check_claims.mjs", import.meta.url).pathname, "all"], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stdout + r.stderr);
});
