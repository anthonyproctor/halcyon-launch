// Cue check (pre-render, free): lists a chapter's emotionally loaded said lines that carry no data-tone cue, before any audio is made.
// Read only: it never renders, never calls Gemini and never writes chapter text. It warns; it never fails (exit code 0 always).
//
// usage: node tools/cue_check.mjs <course> <chapter|all|1-3> [--json out.json] [--min 2] [--quiet]
//   course   pmp (the PMP v2 draft in full/v2), or a course id under courses/ (asep, pilot, afoqt, ...)
//   --min    score a line needs to be listed (default 2, see below)
//   --quiet  per chapter summary only
//
// Lines come from tools/pages.mjs, so they are exactly the said segments the renderer will voice (speaker, text, data-tone),
// with variant pages turned off (VARIANT_RUNS=0) and repeats across pages counted once. Narrator lines can't carry a cue and
// aren't judged; neither are the mentor's teaching lines on the lesson and debrief pages.
//
// How a line scores (each signal once):
//   +2  a delivery verb in the narration right around the line: whispered, murmured, hissed, shouted, yelled, snapped, ...
//       (the last 30 words of the narration before it and the first 15 after it, on the same page)
//   +2  a grief, anger or fear word in that narration (cried, tears, glared, slammed, afraid, shaking, ...)
//   +1  a grief, anger or fear word in the line itself
//   +1  an exclamation mark in the line (+2 for two or more, or "!" with an emotion word)
//   +1  the page's peak: the line with the highest score on its page, when that score is already 2 or more
// A line scoring --min or more with no data-tone is listed, strongest first. Lines that score but already have a cue count
// toward "covered".
// Cue density = cued character lines / character lines, per chapter, against the PMP v2 and Hearth (asep) book averages
// (cached in ~/.cache/halcyon-gemini-tts/reports/cue-baseline.json, rebuilt when a chapter file changes).
import fs from 'fs'; import os from 'os'; import path from 'path'; import {execFileSync} from 'child_process';

const ROOT = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const REPORTS = path.join(os.homedir(), '.cache/halcyon-gemini-tts/reports');
const A = process.argv.slice(2);
const course = A[0], chArg = A[1];
const opt = k => A.includes(k) ? A[A.indexOf(k) + 1] : null;
const MIN = +(opt('--min') || 2), QUIET = A.includes('--quiet');
if (!course || !chArg) { console.log('usage: node tools/cue_check.mjs <course> <chapter|all|1-3> [--json out.json] [--min 2] [--quiet]'); process.exit(0); }

const isPmp = c => ['pmp', 'pmp-v2', 'v2'].includes(c);
const chFile = (c, n) => isPmp(c) ? path.join(ROOT, 'full/v2', `ch${String(n).padStart(2, '0')}.js`) : path.join(ROOT, 'courses', c, 'full', `ch${String(n).padStart(2, '0')}.js`);
const chaptersOf = c => { const d = isPmp(c) ? path.join(ROOT, 'full/v2') : path.join(ROOT, 'courses', c, 'full');
  return fs.readdirSync(d).map(f => f.match(/^ch(\d+)\.js$/)).filter(Boolean).map(m => +m[1]).sort((a, b) => a - b); };
const parse = (arg, c) => arg === 'all' ? chaptersOf(c) : arg.includes('-') ? (([a, b]) => Array.from({length: b - a + 1}, (_, i) => a + i))(arg.split('-').map(Number)) : arg.split(',').map(Number);

let MENTOR = {};
{ const w = {}; new Function('window', fs.readFileSync(path.join(ROOT, 'courses.js'), 'utf8'))(w); for (const c of w.HALCYON_COURSES) MENTOR[c.id] = c.mentor; }
const mentorOf = c => isPmp(c) ? 'ruth' : (MENTOR[c] || '');

// ---- signals
// tuned 2026-11-07 on asep and pilot: "yellow", "glare shield", "engine roaring", "a gust shook it", "dead air" were all false hits
const GRIEF = /\b(cr(?:y|ies|ied|ying)|tears?|tearful|wept|weep\w*|sob(?:s|bed|bing)?|grie(?:f|ve[sd]?|ving)|mourn\w*|funeral|buried|died|death|dying|choked|heartbr\w*)\b/i;
const ANGER = /\b(angry|anger|angrily|furious\w*|fury|rage[sd]?|raging|slam(?:med|s)?|glared|glaring|seeth\w*|livid|jaw (?:set|tight\w*)|fists?|clench\w*|bitter\w*)\b/i;
const FEAR = /\b(afraid|scared|terrif\w*|fear\w*|frighten\w*|panic\w*|trembl\w*|(?:hands?|voice) (?:shook|shaking)|froze|white[- ]knuckl\w*|dread\w*)\b/i;
const VERB = /\b(whisper\w*|murmur\w*|breathed|hiss(?:ed|es)|mutter\w*|shout(?:s|ed|ing)?|yell(?:s|ed|ing)?|scream\w*|shriek\w*|bellow\w*|cried out|called out|snapped|bit out|spat|gasp\w*|stammer\w*|stutter\w*|pleaded|begged|sobbed|choked out|under (?:her|his|their) breath|voice (?:broke|cracked|shook|caught|rose|dropped))\b/i;
const EMO = s => [GRIEF, ANGER, FEAR].filter(r => r.test(s)).map(r => r === GRIEF ? 'grief' : r === ANGER ? 'anger' : 'fear');
const words = s => s.split(/\s+/).filter(Boolean);
const tail = (s, n) => words(s).slice(-n).join(' '), head = (s, n) => words(s).slice(0, n).join(' ');

function specFor(c, n) {
  const tmp = path.join(os.tmpdir(), `cue_check_${process.pid}_${c}_${n}.json`);
  const args = ['tools/pages.mjs', 'full', String(n), tmp, ...(isPmp(c) ? ['--v2'] : ['--course', c])];
  try { execFileSync('node', args, {cwd: ROOT, stdio: 'pipe', env: {...process.env, VARIANT_RUNS: '0'}}); return JSON.parse(fs.readFileSync(tmp, 'utf8')); }
  catch (e) { return null; } finally { try { fs.unlinkSync(tmp); } catch {} }
}

// the mentor's own tagged lines (a said span with her data-who) are story even on the lesson page; her untagged lesson body and
// debrief takes are teaching and aren't judged
const nk = t => String(t).replace(/<[^>]+>/g, ' ').replace(/&[#\w]+;/g, ' ').replace(/[^\p{L}\p{N}]+/gu, ' ').trim().toLowerCase();
function taggedOf(c, n) {
  const src = fs.readFileSync(chFile(c, n), 'utf8'), set = new Set();
  for (const m of src.matchAll(/<span class=\\?"said\\?" data-who=\\?"([^"\\]+)\\?"[^>]*>([\s\S]*?)<\/span>/g)) set.add(m[1].toLowerCase() + '|' + nk(m[2]));
  return set;
}
function scoreChapter(c, n) {
  const spec = specFor(c, n); if (!spec) return null;
  const M = mentorOf(c).toLowerCase(), seen = new Set(), lines = [], TAG = taggedOf(c, n);
  for (const [pid, segs] of Object.entries(spec.pages)) {
    const said = segs.map((s, i) => ({s, i})).filter(x => 't' in x.s);
    const pageLines = [];
    said.forEach(({s, i}, k) => {
      if (s.v === 'narrator') return;
      if (s.v.toLowerCase() === M && (pid === 'lesson' || /^o\d/.test(pid)) && !TAG.has(M + '|' + nk(s.t))) return;  // the mentor teaching, not a scene
      const id = s.v + '|' + s.t; if (seen.has(id)) return; seen.add(id);
      const prev = said[k - 1] && said[k - 1].s.v === 'narrator' ? tail(said[k - 1].s.t, 30) : '';
      const next = said[k + 1] && said[k + 1].s.v === 'narrator' ? head(said[k + 1].s.t, 15) : '';
      const ctx = prev + ' ' + next, why = []; let sc = 0;
      const vm = ctx.match(VERB); if (vm) { sc += 2; why.push(`"${vm[0]}" around it`); }
      const ce = EMO(ctx); if (ce.length) { sc += 2; why.push(`${ce.join('/')} word around it`); }
      const le = EMO(s.t); if (le.length) { sc += 1; why.push(`${le.join('/')} word in the line`); }
      const ex = (s.t.match(/!/g) || []).length;
      if (ex) { const b = ex >= 2 || le.length ? 2 : 1; sc += b; why.push(ex >= 2 ? 'exclamations' : 'exclamation'); }
      const L = {pid, who: s.v, text: s.t, tone: s.tone || null, score: sc, why, ctx: (prev ? '…' + tail(prev, 14) : '') + ' [line] ' + (next ? head(next, 10) + '…' : '')};
      pageLines.push(L); lines.push(L);
    });
    const top = pageLines.reduce((a, b) => (b.score > (a ? a.score : -1) ? b : a), null);
    if (top && top.score >= 2 && pid !== 'lesson') { top.score += 1; top.why.push('peak of its page'); }
  }
  const chars = lines.length, cued = lines.filter(L => L.tone).length;
  const loaded = lines.filter(L => L.score >= MIN);
  return {chapter: n, character_lines: chars, cued, density: chars ? +(cued / chars).toFixed(3) : 0,
          loaded: loaded.length, loaded_cued: loaded.filter(L => L.tone).length,
          missing: loaded.filter(L => !L.tone).sort((a, b) => b.score - a.score)};
}

// ---- book averages (PMP v2 and Hearth), cached by chapter file mtimes
function baseline() {
  const p = path.join(REPORTS, 'cue-baseline.json'); let cur = {};
  try { cur = JSON.parse(fs.readFileSync(p, 'utf8')); } catch {}
  const out = {}; let dirty = false;
  for (const [name, c] of [['PMP', 'pmp'], ['Hearth', 'asep']]) {
    const chs = chaptersOf(c), stamp = chs.map(n => fs.statSync(chFile(c, n)).mtimeMs).join(',') + `|min${MIN}`;
    if (cur[name] && cur[name].stamp === stamp) { out[name] = cur[name]; continue; }
    let L = 0, C = 0, Ld = 0, Lc = 0; const per = [];
    for (const n of chs) { const r = scoreChapter(c, n); if (!r) continue; L += r.character_lines; C += r.cued; Ld += r.loaded; Lc += r.loaded_cued; per.push(r.density); }
    out[name] = {stamp, chapters: per.length, density: L ? +(C / L).toFixed(3) : 0, mean_chapter_density: per.length ? +(per.reduce((a, b) => a + b, 0) / per.length).toFixed(3) : 0,
                 loaded_cued_share: Ld ? +(Lc / Ld).toFixed(3) : 0};
    dirty = true;
  }
  if (dirty) { fs.mkdirSync(REPORTS, {recursive: true}); fs.writeFileSync(p, JSON.stringify(out, null, 1)); }
  return out;
}

const B = baseline();
const report = {course, min_score: MIN, averages: Object.fromEntries(Object.entries(B).map(([k, v]) => [k, {density: v.density, loaded_cued_share: v.loaded_cued_share, chapters: v.chapters}])), chapters: []};
console.log(`cue density averages: PMP ${(B.PMP.density * 100).toFixed(1)}% of character lines cued (${(B.PMP.loaded_cued_share * 100).toFixed(0)}% of loaded lines), Hearth ${(B.Hearth.density * 100).toFixed(1)}% (${(B.Hearth.loaded_cued_share * 100).toFixed(0)}% of loaded lines)`);
for (const n of parse(chArg, course)) {
  const r = scoreChapter(course, n);
  if (!r) { console.log(`\nch${n}: no chapter or pages.mjs failed, skipped`); continue; }
  report.chapters.push(r);
  const vs = d => (d >= B.Hearth.density * 0.75 ? '' : ' LOW');
  console.log(`\nch${n}: ${r.cued} of ${r.character_lines} character lines cued (${(r.density * 100).toFixed(1)}%${vs(r.density)}); ${r.loaded} loaded lines, ${r.loaded_cued} cued, ${r.missing.length} with no cue`);
  if (QUIET) continue;
  for (const L of r.missing) console.log(`  WARN ${L.score} ${L.pid} ${L.who}: "${L.text.slice(0, 80)}"  (${L.why.join('; ')})\n       ${L.ctx.slice(0, 150)}`);
}
const out = opt('--json') || path.join(REPORTS, `cue-${course}-ch${chArg}.json`);
fs.mkdirSync(path.dirname(out), {recursive: true}); fs.writeFileSync(out, JSON.stringify(report, null, 1));
console.log(`\nreport: ${out}`);
