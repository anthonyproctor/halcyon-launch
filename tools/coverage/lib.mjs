// Shared loader and matcher for the release gates (docs/RELEASE_GATES.md): check_coverage.mjs, check_taught_before_tested.mjs,
// check_audio_parity.mjs and tools/coverage/seed.mjs. Read only: nothing here writes outside tools/coverage/<course>.json (seed.mjs).
//
// A course loads the same way the app loads it: courses.js gives each course's script list (PMP: full/v2/ch*.js, mock/*.js, final/pmp.js).
// Lesson prose = lesson.sections[].body paragraphs plus the section's exam line. A paragraph marked <!--story--> or holding a <prop>
// (Ruth's console log page) is story, not teaching, and never earns coverage. terms arrays are on screen only (tools/pages.mjs never
// narrates them), so a term can make an objective "mentioned" but never "explained".
import fs from 'fs';
import path from 'path';
import {execFileSync} from 'child_process';
import {fileURLToPath} from 'url';

export const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const COURSES = ['afoqt', 'asep', 'pilot', 'pmp', 'cphims', 'gh300', 'cisa', 'lsat'];

// --ref <git ref>: read course files from git instead of the working tree (to test a gate against an older text, e.g. before a fix)
export function reader(ref) {
  return p => ref ? execFileSync('git', ['show', `${ref}:${p}`], {cwd: REPO, encoding: 'utf8', maxBuffer: 64 << 20}) : fs.readFileSync(path.join(REPO, p), 'utf8');
}
const run = (src, win) => new Function('window', 'document', src)(win, undefined);

export function courseEntries() {
  const w = {};
  run(fs.readFileSync(path.join(REPO, 'courses.js'), 'utf8'), w);
  return w.HALCYON_COURSES;
}

// {id, entry, meta, chapters[], mocks[{part, questions[]}], finals[], files{chapterNum: path}, errors[]}
export function loadCourse(cid, {ref} = {}) {
  const read = reader(ref);
  const entry = courseEntries().find(c => c.id === cid);
  const w = {}, errors = [], files = {};
  const exec = p => { try { run(read(p), w); return true } catch (e) { errors.push(`${p}: ${e.message.split('\n')[0]}`); return false } };
  let chapters, mocks, finals = [], meta;
  if (cid === 'pmp') {
    run(fs.readFileSync(path.join(REPO, 'full/v2/preview.js'), 'utf8'), w);
    const live = w.HALCYON_V2.files.filter(f => /^ch\d+\.js$/.test(f));
    for (const f of live) { if (exec('full/v2/' + f)) files[+f.match(/\d+/)[0]] = 'full/v2/' + f }
    for (const f of fs.readdirSync(path.join(REPO, 'mock')).filter(f => f.endsWith('.js')).sort()) exec('mock/' + f);
    if (fs.existsSync(path.join(REPO, 'final/pmp.js'))) exec('final/pmp.js');
    chapters = (w.HALCYON_FULL || []);
    mocks = (w.HALCYON_MOCK || []);
    finals = w.HALCYON_FINAL || [];
    const eng = fs.readFileSync(path.join(REPO, 'engine.js'), 'utf8').match(/let TASKNAMES=(\{[^;]*\});/);
    meta = {TASKNAMES: eng ? new Function('return ' + eng[1])() : {}};
  } else {
    const root = entry.root || `courses/${cid}/`;
    for (const s of entry.scripts || []) { if (exec(root + s) && /^full\/ch\d+\.js$/.test(s)) files[+s.match(/\d+/)[0]] = root + s }
    const D = w.HALCYON_DATA[cid];
    chapters = D.full || []; mocks = D.mock || []; meta = D.meta || {};
  }
  chapters = [...chapters].sort((a, b) => a.num - b.num);
  return {id: cid, entry, meta, chapters, mocks, finals, files, errors, review: (w.HALCYON_REVIEW || {})[cid]};
}

// ---------- text ----------
const ENT = {'&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ', '&rsquo;': "'", '&lsquo;': "'", '&ldquo;': '"', '&rdquo;': '"', '&middot;': ' '};
export const strip = s => String(s ?? '').replace(/<!--story-->/g, '').replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, ' ')
  .replace(/&[a-z#0-9]+;/gi, m => ENT[m] ?? ' ').replace(/\s+/g, ' ').trim();
export const wc = s => (strip(s).match(/[A-Za-z0-9][A-Za-z0-9'’.-]*/g) || []).length;
export const isStory = raw => typeof raw === 'string' && (raw.startsWith('<!--story-->') || /<prop\b/.test(raw));

// Every lesson paragraph with its place: {ch, sec, h, kind: 'body'|'exam', story, text, words}
export function lessonParas(course) {
  const out = [];
  for (const c of course.chapters) (c.lesson?.sections || []).forEach((s, sec) => {
    (s.body || []).forEach((raw, i) => out.push({ch: c.num, sec, i, h: s.h, kind: 'body', story: isStory(raw), text: strip(raw), words: wc(raw)}));
    if (s.exam) out.push({ch: c.num, sec, i: -1, h: s.h, kind: 'exam', story: false, text: strip(s.exam), words: wc(s.exam)});
  });
  return out;
}
export function lessonTerms(course) {
  const out = [];
  for (const c of course.chapters) (c.lesson?.sections || []).forEach((s, sec) => (s.terms || []).forEach(t => {
    const [term, def] = Array.isArray(t) ? t : [t.t ?? t.term, t.d ?? t.def];
    out.push({ch: c.num, sec, term: strip(term), def: strip(def)});
  }));
  return out;
}

// ---------- items (everything that assesses) ----------
const NEUTRAL = () => ({flags: {}, score: 0, m: {trust: 50, conf: 50, health: 50}, picks: {}});
const sceneText = sc => { try { return (sc.text(NEUTRAL(), {}, {}) || []).map(strip).join(' ') } catch { return '' } };
const afterTask = (c, after) => (c.scenes || []).find(sc => sc.id === after)?.task; // exercise.after and drill.after hold the id of the scene they follow (engine.js steps())
// {kind: quiz|decision|exercise|drill|case|mock|final, ch (Infinity for mock/final), id, task, stem, key, why}
export function items(course) {
  const out = [];
  for (const c of course.chapters) {
    (c.scenes || []).forEach((sc, i) => { const b = (sc.opts || []).find(o => o.best) || {};
      out.push({kind: 'decision', ch: c.num, id: `ch${c.num} decision ${i + 1}${sc.id ? ' (' + sc.id + ')' : ''}`, task: sc.task, stem: sceneText(sc) + ' ' + strip(sc.q), key: strip(b.t), why: strip(b.why)}) });
    (c.quiz || []).forEach((q, i) => out.push({kind: 'quiz', ch: c.num, id: `ch${c.num} quiz ${i + 1}`, task: q.task, stem: strip(q.q), key: strip(q.opts?.[q.a]), why: strip(q.why)}));
    const exs = Array.isArray(c.exercise) ? c.exercise : c.exercise ? [c.exercise] : [];
    exs.forEach((ex, k) => (ex.items || []).forEach((it, i) => out.push({kind: 'exercise', ch: c.num, id: `ch${c.num} exercise${exs.length > 1 ? k + 1 : ''} item ${i + 1}`, task: it.task || afterTask(c, ex.after),
      stem: strip(ex.intro) + ' ' + strip(it.prompt), key: strip(it.choices?.[it.answer]), why: strip(it.why)})));
    (c.drills || []).forEach((d, i) => out.push({kind: 'drill', ch: c.num, id: `ch${c.num} drill ${i + 1} (${strip(d.title)})`, task: d.task || afterTask(c, d.after),
      stem: (d.setup || []).map(strip).join(' '), key: (d.fields || []).map(f => strip(f.label)).join(' '), why: [].concat(d.solution || []).map(strip).join(' ')}));
    (c.cases || []).forEach((cs, k) => (cs.questions || cs.items || []).forEach((q, i) => out.push({kind: 'case', ch: c.num, id: `ch${c.num} case ${k + 1} q${i + 1}`, task: q.task,
      stem: [].concat(cs.setup || cs.text || []).map(strip).join(' ') + ' ' + strip(q.q), key: strip(q.opts?.[q.a]), why: strip(q.why)})));
  }
  course.mocks.forEach(p => (p.questions || []).forEach((q, i) => out.push({kind: 'mock', ch: Infinity, id: `mock ${p.formName ? p.formName + ' ' : ''}${p.part} q${i + 1}`, task: q.task,
    stem: strip(q.case || '') + ' ' + strip(q.q), key: strip(q.opts?.[q.a]), why: strip(q.why)})));
  (course.finals || []).forEach(p => (p.questions || [p]).forEach((q, i) => out.push({kind: 'final', ch: Infinity, id: `final ${p.part || ''} q${i + 1}`, task: q.task, stem: strip(q.q), key: strip(q.opts?.[q.a]), why: strip(q.why)})));
  return out;
}

// ---------- coverage map ----------
export const covPath = cid => path.join(REPO, 'tools/coverage', `${cid}.json`);
export function loadMap(cid) {
  const p = covPath(cid); if (!fs.existsSync(p)) return null;
  const m = JSON.parse(fs.readFileSync(p, 'utf8'));
  for (const o of m.objectives) o._re = (o.match || []).map(s => new RegExp('\\b(?:' + s + ')', 'i'));
  return m;
}
export const hits = (o, text) => o._re.filter(r => r.test(text));
export const STATUSES = ['absent', 'mentioned', 'explained', 'practiced', 'independently assessed'];

// Depth thresholds. A section explains an objective when its non-story prose that matches the objective runs at least EXPLAIN_WORDS words
// and it isn't a passing mention: two matching paragraphs, two different match phrases, or the section heading itself matches.
export const EXPLAIN_WORDS = 60;
export const MANUAL_MIN_WORDS = 60; // a reviewer's ref (auto:false) needs at least this much non-story prose in the section

// The whole analysis the gates share. Returns per objective: sections (candidate teaching spans), verified refs, depth, items, status.
export function analyze(course, map) {
  const paras = lessonParas(course), terms = lessonTerms(course), its = items(course);
  const objs = map.objectives;
  // which objectives each instructional paragraph matches: shared prose splits its depth credit (audit: no full credit for every tag)
  const teach = paras.filter(p => !p.story);
  const pm = teach.map(p => objs.filter(o => hits(o, p.text).length));
  const res = new Map(objs.map(o => [o.id, {o, sections: {}, depth: 0, mentions: [], items: {learn: [], held: []}}]));
  teach.forEach((p, k) => pm[k].forEach(o => {
    const r = res.get(o.id), key = `${p.ch}.${p.sec}`;
    const s = r.sections[key] ||= {ch: p.ch, sec: p.sec, h: p.h, paras: 0, words: 0, credit: 0, phrases: new Set(), head: hits(o, p.h).length > 0};
    s.paras++; s.words += p.words; s.credit += p.words / pm[k].length; hits(o, p.text).forEach(x => s.phrases.add(x.source));
  }));
  // story paragraphs and on screen terms only ever count as a mention
  paras.filter(p => p.story).forEach(p => objs.forEach(o => { if (hits(o, p.text).length) res.get(o.id).mentions.push(`ch${p.ch} story`) }));
  terms.forEach(t => objs.forEach(o => { if (hits(o, t.term + ' ' + t.def).length) res.get(o.id).mentions.push(`ch${t.ch} term "${t.term}"`) }));
  const secWords = {}; teach.forEach(p => { secWords[`${p.ch}.${p.sec}`] = (secWords[`${p.ch}.${p.sec}`] || 0) + p.words });
  const explains = s => s.words >= EXPLAIN_WORDS && (s.paras >= 2 || s.phrases.size >= 2 || s.head);
  for (const r of res.values()) {
    for (const s of Object.values(r.sections)) s.explains = explains(s);
    // verified refs: the map's refs, each re-checked against today's text
    r.refs = (r.o.refs || []).map(ref => {
      const key = `${ref.ch}.${ref.sec}`, s = r.sections[key];
      const ok = ref.auto === false ? (secWords[key] || 0) >= MANUAL_MIN_WORDS : !!(s && s.explains);
      return {...ref, ok, words: s ? s.words : 0, credit: s ? Math.round(s.credit) : 0};
    });
    r.depth = Math.round(r.refs.filter(x => x.ok).reduce((a, x) => a + (x.credit || 0), 0));
    r.candidates = Object.values(r.sections).filter(s => s.explains).map(s => ({ch: s.ch, sec: s.sec}));
  }
  // items: which objectives each item assesses. Candidates = the objectives under the item's task tag; the item's own text picks among
  // them. A tag alone counts only when its task maps to a single objective.
  const byTask = {}; objs.forEach(o => (o.tasks || []).forEach(t => (byTask[t] ||= []).push(o)));
  const itemLinks = its.map(it => {
    const cand = it.task && byTask[it.task] ? byTask[it.task] : [];
    const text = `${it.stem} ${it.key} ${it.why}`;
    const pool = cand.length ? cand : objs;
    const tm = pool.filter(o => hits(o, text).length);
    const strong = tm.length ? tm : cand.length === 1 ? cand : [];
    const weak = strong.length ? strong : cand; // task only fan out, used for taught-before-tested, never for "practiced"
    return {it, cand, strong, weak};
  });
  itemLinks.forEach(L => L.strong.forEach(o => { const r = res.get(o.id); (/(mock|final)/.test(L.it.kind) ? r.items.held : r.items.learn).push(L.it) }));
  for (const r of res.values()) {
    const explained = r.refs.some(x => x.ok);
    const anyHit = Object.keys(r.sections).length || r.mentions.length || r.items.learn.length || r.items.held.length;
    r.status = !explained ? (anyHit ? 'mentioned' : 'absent') : !r.items.learn.length ? 'explained' : !r.items.held.length ? 'practiced' : 'independently assessed';
    r.firstCh = Math.min(...r.refs.filter(x => x.ok).map(x => x.ch), Infinity);
  }
  return {res, paras, teach, terms, items: its, itemLinks, byTask};
}

export const pad = (s, n) => String(s).length >= n ? String(s) : String(s) + ' '.repeat(n - String(s).length);
export function args(argv = process.argv.slice(2)) {
  const flags = {}, pos = [];
  for (let i = 0; i < argv.length; i++) { const a = argv[i]; if (a.startsWith('--')) { const k = a.slice(2); if (['ref', 'lessons-ref', 'out', 'limit'].includes(k)) flags[k] = argv[++i]; else flags[k] = true } else pos.push(a) }
  return {flags, pos};
}
