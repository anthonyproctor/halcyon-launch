// Release gate: teaching before testing (docs/RELEASE_GATES.md, gate 2).
// usage: node tools/check_taught_before_tested.mjs <course>|all [--warn] [--ref <git ref>] [--limit N] [--json]
// For every decision, chapter quiz item, exercise item, drill, mock and final item: find the objectives it assesses (its task tag, narrowed
// by its own text through the outline map in tools/coverage/<course>.json) and check a lesson explains them in that chapter or earlier.
// Mock and final items may lean on any chapter. Two checks:
//   UNTAUGHT  none of the objectives the item assesses is explained by a lesson section at or before the item's chapter
//   CONCEPT   the stem or keyed answer uses a concept from the outline's vocabulary (a match phrase of an objective under the item's task)
//             that no teaching paragraph (40+ words of non-story lesson prose, or an exam line) uses at or before the item's chapter. "(on screen only)" = it's only in a
//             terms list, which the audio never reads.
// --ref HEAD runs the same check on the committed text. --lessons-ref HEAD keeps today's items but uses the committed lessons, to
// show what a lesson fix in the working tree closed.
// Exits 1 on any flag unless --warn.
import {loadCourse, loadMap, analyze, hits, COURSES, args} from './coverage/lib.mjs';

const {flags, pos} = args();
const list = pos[0] === 'all' ? COURSES : pos;
if (!list.length) { console.error('usage: node tools/check_taught_before_tested.mjs <course>|all [--warn] [--ref <git ref>] [--limit N] [--json]'); process.exit(2) }
const LIMIT = +(flags.limit || 25);
const CONCEPT_WORDS = 40;
let bad = 0; const json = {};
for (const cid of list) {
  const map = loadMap(cid);
  if (!map) { console.log(`\n${cid}: no outline map (tools/coverage/${cid}.json), can't check`); json[cid] = {missing: true}; if (!flags.warn) bad++; continue }
  const course = loadCourse(cid, {ref: flags.ref});
  // --lessons-ref <ref>: today's items against the lessons as they stood at <ref> (would this gate have caught a gap a lesson fix closed?)
  if (flags['lessons-ref']) { const old = loadCourse(cid, {ref: flags['lessons-ref']}); course.chapters.forEach(c => { const o = old.chapters.find(x => x.num === c.num); c.lesson = o ? o.lesson : undefined }) }
  const A = analyze(course, map);
  // where each objective is explained: verified map refs plus today's candidates (so the gate works before a reviewer confirms refs)
  const taughtAt = new Map();
  for (const [id, r] of A.res) taughtAt.set(id, [...r.refs.filter(x => x.ok).map(x => x.ch), ...r.candidates.map(c => c.ch)]);
  // where each vocabulary phrase is used in a lesson section that explains an objective carrying that phrase
  const phraseAt = new Map(), phraseTerm = new Map();
  for (const r of A.res.values()) {
    // a concept counts as taught where a real teaching paragraph uses it: non-story prose of at least CONCEPT_WORDS words, or the
    // section's exam line. A term card, a story line or a quiz explanation doesn't count.
    r.o._re.forEach(re => {
      const chs = phraseAt.get(re.source) || [];
      A.teach.forEach(p => { if ((p.kind === 'exam' || p.words >= CONCEPT_WORDS) && re.test(p.text)) chs.push(p.ch) });
      phraseAt.set(re.source, chs);
      const tchs = phraseTerm.get(re.source) || []; A.terms.forEach(t => { if (re.test(t.term + ' ' + t.def)) tchs.push(t.ch) }); phraseTerm.set(re.source, tchs);
    });
  }
  const flagged = [], unmapped = [];
  for (const L of A.itemLinks) {
    const it = L.it, before = ch => ch <= it.ch;
    const objs = L.strong.length ? L.strong : L.weak;
    if (!L.cand.length && !L.strong.length) { unmapped.push(it); continue }
    const reasons = [];
    if (objs.length && !objs.some(o => (taughtAt.get(o.id) || []).some(before)))
      reasons.push(`UNTAUGHT ${objs.length > 4 ? objs.slice(0, 3).map(o => o.id).join('/') + ` and ${objs.length - 3} more under ${it.task}` : objs.map(o => o.id).join('/')}${it.ch === Infinity ? ' (no chapter explains it)' : ` (first explained ${Math.min(...objs.flatMap(o => taughtAt.get(o.id) || []), Infinity) === Infinity ? 'nowhere' : 'in ch' + Math.min(...objs.flatMap(o => taughtAt.get(o.id)))})`}`);
    const pool = L.cand.length ? L.cand : objs;
    const text = `${it.stem} ${it.key}`;
    const seen = new Set();
    // test-format objectives (AFOQT.<code>.format) carry item-stem language ("closest in meaning"), not concepts: skipped here
    for (const o of pool.filter(o => !/\.format$/.test(o.id))) for (const re of hits(o, text)) {
      if (seen.has(re.source)) continue; seen.add(re.source);
      if (!(phraseAt.get(re.source) || []).some(before)) {
        const word = (text.match(new RegExp(re.source.replace(/^\\b/, ''), 'i')) || [re.source])[0];
        const onScreen = (phraseTerm.get(re.source) || []).some(before);
        const later = Math.min(...(phraseAt.get(re.source) || []), Infinity);
        reasons.push(`CONCEPT "${word}"${onScreen ? ' (on screen only)' : ''}${later < Infinity && it.ch !== Infinity ? ` (taught later, ch${later})` : later === Infinity ? ' (no lesson teaches it)' : ''}`);
      }
    }
    if (reasons.length) flagged.push({it, reasons});
  }
  const byKind = {}; A.items.forEach(i => { byKind[i.kind] ||= [0, 0]; byKind[i.kind][0]++ }); flagged.forEach(f => byKind[f.it.kind][1]++);
  json[cid] = {items: A.items.length, flagged: flagged.length, unmapped: unmapped.length, byKind,
    flags: flagged.map(f => ({id: f.it.id, task: f.it.task, reasons: f.reasons, stem: f.it.stem.slice(0, 160)}))};
  if (flags.json) { if (flagged.length && !flags.warn) bad++; continue }
  console.log(`\n${cid}${flags.ref ? ` (text at ${flags.ref})` : ''}${flags['lessons-ref'] ? ` (lessons at ${flags['lessons-ref']})` : ''}: ${A.items.length} items, ${flagged.length} flagged. ` + Object.entries(byKind).map(([k, [n, f]]) => `${k} ${f}/${n}`).join(', '));
  if (unmapped.length) console.log(`  ${unmapped.length} items carry a task code the outline map doesn't use (${[...new Set(unmapped.map(i => i.task))].join(', ')}): not checked`);
  for (const f of flagged.slice(0, LIMIT)) console.log(`  ${f.it.id} [${f.it.task}] ${f.reasons.join('; ')}\n      ${f.it.stem.slice(0, 150)}`);
  if (flagged.length > LIMIT) console.log(`  ... ${flagged.length - LIMIT} more (--limit N)`);
  if (flagged.length && !flags.warn) bad++;
}
if (flags.json) console.log(JSON.stringify(json, null, 1));
process.exit(bad ? 1 : 0);
