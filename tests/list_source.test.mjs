// Sign-up list sources (lib/list.js cleanSource): the app's Coming next and About forms, and the /welcome landing page.
import { test } from "node:test";
import assert from "node:assert/strict";
import { cleanSource } from "../lib/list.js";

test("cleanSource keeps known sources and folds anything else to other", () => {
  assert.equal(cleanSource("upcoming"), "upcoming");
  assert.equal(cleanSource("about:cisa"), "about:cisa");
  assert.equal(cleanSource("welcome:pilot"), "welcome:pilot");
  assert.equal(cleanSource("Welcome:ANY"), "welcome:any");
  assert.equal(cleanSource("welcome:" + "x".repeat(25)), "other");
  assert.equal(cleanSource("welcome:<script>"), "other");
  assert.equal(cleanSource(""), "other");
});
