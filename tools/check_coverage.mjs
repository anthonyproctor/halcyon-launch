// Release gate: leaf-objective coverage (docs/RELEASE_GATES.md, gate 1).
// usage: node tools/check_coverage.mjs <course>|all [--warn] [--json] [--quiet]
// Reads tools/coverage/<course>.json (the official outline map) and re-checks every ref against today's lesson text.
// Status per objective:
//   absent      nothing in the book touches it
//   mentioned   it shows up (a term, a story line, a passing sentence, a question) but no lesson section explains it
//   explained   a lesson section's non-story prose explains it (a tag is never enough)
//   practiced   explained, and a chapter quiz, decision, exercise or drill assesses it by its own text (or a task tag that maps to it alone)
//   independently assessed   practiced, and a mock or final item assesses it the same way
// Fails (exit 1) on any objective that is absent or only mentioned, unless --warn. Depth = words of non-story lesson prose in the
// verified refs that match the objective, shared prose split between every objective it matches. Depth flags thin coverage; it
// never certifies sufficiency.
import {loadCourse, loadMap, analyze, COURSES, STATUSES, pad, args} from './coverage/lib.mjs';

const {flags, pos} = args();
const list = pos[0] === 'all' ? COURSES : pos;
if (!list.length) { console.error('usage: node tools/check_coverage.mjs <course>|all [--warn] [--json] [--quiet]'); process.exit(2) }
let bad = 0; const json = {};
for (const cid of list) {
  const map = loadMap(cid);
  if (!map) { console.log(`\n${cid}: NO OUTLINE MAP (tools/coverage/${cid}.json missing): every objective counts as absent`); if (!flags.warn) bad++; json[cid] = {missing: true}; continue }
  const course = loadCourse(cid, {ref: flags.ref});
  const A = analyze(course, map);
  const rows = map.objectives.map(o => A.res.get(o.id));
  const n = Object.fromEntries(STATUSES.map(s => [s, rows.filter(r => r.status === s).length]));
  const autoRefs = rows.reduce((a, r) => a + r.refs.filter(x => x.auto !== false).length, 0), allRefs = rows.reduce((a, r) => a + r.refs.length, 0);
  const brokenRefs = rows.flatMap(r => r.refs.filter(x => !x.ok).map(x => `${r.o.id} ch${x.ch}.${x.sec}`));
  const drift = rows.filter(r => r.o.status && r.o.status !== r.status).map(r => `${r.o.id} ${r.o.status} -> ${r.status}`);
  const fresh = rows.flatMap(r => r.candidates.filter(c => !r.refs.some(x => x.ch === c.ch && x.sec === c.sec)).map(c => `${r.o.id} ch${c.ch}.${c.sec}`));
  const fails = rows.filter(r => r.status === 'absent' || r.status === 'mentioned');
  const depths = rows.filter(r => r.depth > 0).map(r => r.depth).sort((a, b) => a - b);
  const med = depths.length ? depths[Math.floor(depths.length / 2)] : 0;
  json[cid] = {outline: map.outline, taxonomy: map.taxonomy, objectives: rows.length, status: n, medianDepth: med, autoRefs, allRefs, brokenRefs, drift, newCandidates: fresh.length,
    rows: rows.map(r => ({id: r.o.id, status: r.status, depth: r.depth, kind: r.o.kind, refs: r.refs.filter(x => x.ok).map(x => `${x.ch}.${x.sec}`), learn: r.items.learn.length, held: r.items.held.length}))};
  if (flags.json) continue;
  console.log(`\n${cid}: ${map.outline?.name || ''}${map.taxonomy === 'halcyon' ? ' (Halcyon taxonomy, not an official list)' : ''}`);
  console.log(`  ${map.outline?.version || ''}`);
  if (!flags.quiet) {
    console.log(`  ${pad('objective', 22)} ${pad('status', 23)} ${pad('depth', 6)} ${pad('refs', 18)} learn held`);
    for (const r of rows) {
      const refs = r.refs.filter(x => x.ok).map(x => `${x.ch}.${x.sec}`).join(' ') || '-';
      console.log(`  ${pad(r.o.id, 22)} ${pad(r.status, 23)} ${pad(r.depth, 6)} ${pad(refs.length > 18 ? refs.slice(0, 15) + '...' : refs, 18)} ${pad(r.items.learn.length, 5)} ${r.items.held.length}`);
    }
  }
  console.log(`  ${rows.length} objectives: ` + STATUSES.map(s => `${n[s]} ${s}`).join(', ') + `. Median depth ${med} words.`);
  const thin = rows.filter(r => r.depth > 0 && r.depth < 80);
  if (thin.length) console.log(`  thin (explained by under 80 words of matching prose): ${thin.length}: ${thin.slice(0, 12).map(r => r.o.id).join(', ')}${thin.length > 12 ? ' ...' : ''}`);
  console.log(`  refs: ${allRefs} (${autoRefs} auto, not yet confirmed by a reviewer)${brokenRefs.length ? `; ${brokenRefs.length} no longer hold: ${brokenRefs.slice(0, 8).join(', ')}` : ''}`);
  if (drift.length) console.log(`  status changed since the map was seeded (${drift.length}): ${drift.slice(0, 8).join('; ')}${drift.length > 8 ? ' ...' : ''}`);
  if (fresh.length) console.log(`  ${fresh.length} sections now explain an objective but aren't refs yet (run tools/coverage/seed.mjs ${cid})`);
  if (fails.length) { console.log(`  ${flags.warn ? 'WARN' : 'FAIL'}: ${fails.length} objectives absent or only mentioned: ${fails.map(r => r.o.id).join(', ')}`); if (!flags.warn) bad++ }
  else console.log('  PASS: every objective is explained in a lesson');
}
if (flags.json) console.log(JSON.stringify(json, null, 1));
process.exit(bad ? 1 : 0);
