// Release gate: audio instructional parity (docs/RELEASE_GATES.md, gate 3). Report only for now: always exits 0 unless it can't run.
// usage: node tools/check_audio_parity.mjs <course>|all [--no-stale] [--out <dir>] [--json]
// Per chapter it reports:
//   terms      lesson terms (on screen cards). tools/pages.mjs never narrates terms, so every definition is screen only.
//              "def unspoken" = the definition's content words aren't carried by any narrated lesson paragraph of that chapter
//              (under half of them in the best paragraph); "word unspoken" = the term itself is never said in the chapter's narration.
//   manifest   whether the course's audiobook.json lists the chapter, for the study (full) and story (novel) editions.
//   stale      for each recorded page in pages/fN/timings.json (study) and pages/fNs/timings.json (story), the narration script
//              tools/pages.mjs builds from today's text is compared with the words the recording was aligned to. A page whose
//              words differ by more than 2 percent (and at least 3 words) is stale: the text changed after it was recorded.
//              The manifests carry no text hash, so the aligned words are the only record of what was recorded.
// pages.mjs runs read only, writing its scripts to --out (default: a temp folder).
import fs from 'fs';
import os from 'os';
import path from 'path';
import {execFileSync} from 'child_process';
import {REPO, COURSES, loadCourse, lessonParas, lessonTerms, strip, pad, args} from './coverage/lib.mjs';

const {flags, pos} = args();
const list = pos[0] === 'all' ? COURSES : pos;
if (!list.length) { console.error('usage: node tools/check_audio_parity.mjs <course>|all [--no-stale] [--out <dir>] [--json]'); process.exit(2) }
const OUT = flags.out || fs.mkdtempSync(path.join(os.tmpdir(), 'halcyon-parity-'));
fs.mkdirSync(OUT, {recursive: true});
const STOP = new Set('that this with from into than then they them their there these those what when where which while about after before because being have also only just more most must such some very your will would should could does each other over under same both between through without within used uses using make made like into onto upon'.split(' '));
const content = s => (strip(s).toLowerCase().match(/[a-z0-9]+/g) || []).filter(w => w.length > 3 && !STOP.has(w));
const toks = s => (String(s).toLowerCase().replace(/[’']/g, '').match(/[a-z0-9]+/g) || []);
const bag = a => { const m = new Map(); a.forEach(w => m.set(w, (m.get(w) || 0) + 1)); return m };
function diff(a, b) { // multiset difference in words, both ways
  const A = bag(a), B = bag(b); let d = 0;
  for (const [w, n] of A) d += Math.max(0, n - (B.get(w) || 0));
  for (const [w, n] of B) d += Math.max(0, n - (A.get(w) || 0));
  return d;
}
const json = {};
for (const cid of list) {
  const course = loadCourse(cid);
  const pmp = cid === 'pmp';
  const audioRoot = pmp ? 'audio/v2' : `${course.entry.root || `courses/${cid}/`}audio`;
  const mf = path.join(REPO, audioRoot, 'audiobook.json');
  const manifest = fs.existsSync(mf) ? JSON.parse(fs.readFileSync(mf, 'utf8')).full || {} : null;
  const listed = Object.keys(course.files).map(Number).sort((a, b) => a - b); // chapters courses.js (PMP: full/v2/preview.js) loads
  const paras = lessonParas(course), terms = lessonTerms(course);
  const rows = [];
  for (const n of listed) {
    const C = course.chapters.find(c => c.num === n);
    const narrated = paras.filter(p => p.ch === n).map(p => p.text);
    const chapterSpoken = [...narrated, ...(C?.opening || []).map(strip), ...(C?.scenes || []).flatMap(sc => (sc.opts || []).flatMap(o => [strip(o.t), strip(o.after), strip(o.why)]))].join(' ').toLowerCase();
    const T = terms.filter(t => t.ch === n);
    let defUnspoken = 0, wordUnspoken = 0;
    for (const t of T) {
      const cw = [...new Set(content(t.def))];
      const best = Math.max(0, ...narrated.map(p => { const pw = new Set(content(p)); return cw.length ? cw.filter(w => pw.has(w)).length / cw.length : 1 }));
      if (best < 0.5) defUnspoken++;
      const head = t.term.toLowerCase().replace(/\s*\(.*?\)\s*/g, ' ').trim();
      if (head && !chapterSpoken.includes(head)) wordUnspoken++;
    }
    const e = manifest && manifest[String(n)];
    const row = {ch: n, terms: T.length, defUnspoken, wordUnspoken, study: !!e?.study, story: !!e?.story, stale: [], recorded: 0};
    if (!flags['no-stale']) for (const [ed, dir, extra] of [['study', `f${n}`, []], ['story', `f${n}s`, ['--story']]]) {
      const tf = path.join(REPO, audioRoot, 'pages', dir, 'timings.json');
      if (!fs.existsSync(tf)) continue;
      const timings = JSON.parse(fs.readFileSync(tf, 'utf8'));
      const out = path.join(OUT, `${cid}-${dir}.json`);
      try {
        execFileSync('node', ['tools/pages.mjs', 'full', String(n), out, ...(pmp ? ['--v2'] : ['--course', cid]), ...extra],
          {cwd: REPO, env: {...process.env, VARIANT_RUNS: '0'}, stdio: ['ignore', 'ignore', 'ignore']});
      } catch (err) { row.stale.push(`${ed}: pages.mjs failed`); continue }
      const pages = JSON.parse(fs.readFileSync(out, 'utf8')).pages;
      for (const [pid, t] of Object.entries(timings)) {
        if (!t || !Array.isArray(t.w)) continue;
        row.recorded++;
        const segs = pages[pid];
        if (!segs) { if (!/_v\d+$|_fixed$|_alt$/.test(pid)) row.stale.push(`${ed}:${pid} (page gone)`); continue }
        const now = toks(segs.filter(s => s.t).map(s => s.t).join(' ')), rec = toks(t.w.map(w => w[0]).join(' '));
        const d = diff(now, rec);
        if (d >= 3 && d > 0.02 * Math.max(now.length, rec.length)) row.stale.push(`${ed}:${pid} (${d} of ${now.length} words differ)`);
      }
      for (const pid of Object.keys(pages)) if (!timings[pid] && ed === 'study' && !/_v\d+$|_fixed$|_alt$|^intro$/.test(pid)) row.stale.push(`${ed}:${pid} (not recorded)`);
    }
    rows.push(row);
  }
  const planned = course.entry?.planned;
  const sum = k => rows.reduce((a, r) => a + r[k], 0);
  json[cid] = {audioRoot, manifest: !!manifest, planned, listed, rows};
  if (flags.json) continue;
  console.log(`\n${cid}: ${listed.length} chapters listed${planned ? ` of ${planned} planned` : ''}; audio manifest ${manifest ? path.relative(REPO, mf) : 'MISSING'}`);
  console.log(`  ${pad('ch', 4)} ${pad('terms', 6)} ${pad('def unspoken', 13)} ${pad('word unspoken', 14)} ${pad('study', 6)} ${pad('story', 6)} stale pages`);
  for (const r of rows) console.log(`  ${pad(r.ch, 4)} ${pad(r.terms, 6)} ${pad(r.defUnspoken, 13)} ${pad(r.wordUnspoken, 14)} ${pad(r.study ? 'yes' : 'NO', 6)} ${pad(r.story ? 'yes' : 'NO', 6)} ${flags['no-stale'] ? '-' : r.recorded ? (r.stale.length ? r.stale.length + ': ' + r.stale.slice(0, 4).join(', ') + (r.stale.length > 4 ? ' ...' : '') : '0') : 'no recording'}`);
  console.log(`  totals: ${sum('terms')} terms, all screen only; ${sum('defUnspoken')} definitions the narration never carries; ${sum('wordUnspoken')} terms never said; ` +
    `${rows.filter(r => !r.study).length} chapters without study audio, ${rows.filter(r => !r.story).length} without story audio; ${rows.reduce((a, r) => a + r.stale.length, 0)} stale or missing pages`);
}
if (flags.json) console.log(JSON.stringify(json, null, 1));
