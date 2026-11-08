// Seed or refresh the lesson refs in tools/coverage/<course>.json from today's lesson text.
// usage: node tools/coverage/seed.mjs <course>|all
// A ref is a lesson section (chapter num, section index, 0 based in lesson.sections) whose non-story prose explains the objective by the
// match rules in lib.mjs. Seeded refs carry auto:true until a reviewer reads the section and sets auto:false (and reviewer, date).
// Refs a reviewer set (auto:false) are always kept. Auto refs are rebuilt each run. status is written as of this run; check_coverage.mjs
// recomputes it live and reports any drift.
import fs from 'fs';
import {loadCourse, loadMap, analyze, covPath, COURSES, args} from './lib.mjs';

const {pos} = args();
const list = pos[0] === 'all' ? COURSES : pos;
if (!list.length) { console.error('usage: node tools/coverage/seed.mjs <course>|all'); process.exit(2) }
for (const cid of list) {
  const map = loadMap(cid);
  if (!map) { console.error(`${cid}: no tools/coverage/${cid}.json yet, skipped`); continue }
  const course = loadCourse(cid);
  const a1 = analyze(course, map);
  for (const o of map.objectives) {
    const r = a1.res.get(o.id);
    const manual = (o.refs || []).filter(x => x.auto === false);
    const seen = new Set(manual.map(x => `${x.ch}.${x.sec}`));
    const auto = r.candidates.filter(c => !seen.has(`${c.ch}.${c.sec}`)).map(c => {
      const s = r.sections[`${c.ch}.${c.sec}`];
      return {ch: c.ch, sec: c.sec, h: s.h, auto: true};
    });
    o.refs = [...manual, ...auto].sort((x, y) => x.ch - y.ch || x.sec - y.sec);
  }
  const a2 = analyze(course, map);
  const n = {};
  for (const o of map.objectives) { const r = a2.res.get(o.id); o.status = r.status; o.depth = r.depth; n[r.status] = (n[r.status] || 0) + 1 }
  map.seeded = new Date().toISOString().slice(0, 10);
  const out = JSON.stringify(map, (k, v) => k.startsWith('_') ? undefined : v, 1)
    .replace(/\{\n\s+"ch": (\d+),\n\s+"sec": (\d+),\n\s+"h": ("(?:[^"\\]|\\.)*"),\n\s+"auto": (true|false)\n\s+\}/g, '{"ch": $1, "sec": $2, "h": $3, "auto": $4}');
  fs.writeFileSync(covPath(cid), out + '\n');
  console.log(cid, map.objectives.length, 'objectives', JSON.stringify(n));
}
