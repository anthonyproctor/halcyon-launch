// Checks every book's badge definitions (badges/<course>.js) against courses.js, badges.js and the written chapters.
// Usage: node tools/check_badges.mjs. Exit 1 on any error. DUMP=path writes every player facing badge string (for scripts/ai_detect.py).
// What it checks: each course names a badges file that registers under its own id, with a known form and the fields the shelf, the
// readiness card and the Phase 2 ID card read; target and examWeights in courses.js (weights only on real domain names); unique ids with
// the course prefix; names and lines present, no em or en dashes, no spaced hyphens; marks badges.js can draw; known rule types; chapter
// badges cover chapters 1 to planned exactly once (per chapter books: names match the chapter titles); a readiness badge line that names the
// course's target; and every hidden badge on a written scene: the chapter and scene exist, the scene id matches, the option exists.
// Pending badges (scenes not written yet) must be hidden and say what they're waiting for; their scenes are not checked.
// The art renders in every state without undefined or NaN.
import fs from "fs";
globalThis.window = {};
const W = globalThis.window;
const run = f => new Function("window", fs.readFileSync(f, "utf8"))(W);
run("courses.js"); run("badges.js");
const pv = {}; new Function("window", fs.readFileSync("full/v2/preview.js", "utf8"))(pv);
for (const f of pv.HALCYON_V2.files) run("full/v2/" + f);
const HB = W.HalcyonBadges, COURSES = W.HALCYON_COURSES;
for (const c of COURSES) { if (c.id === "pmp") continue; for (const s of c.scripts || []) if (/^(meta|full\/)/.test(s)) run(c.root + s); }
const DOMS = { pmp: ["People", "Process", "Business Environment"] };
for (const [id, d] of Object.entries(W.HALCYON_DATA || {})) DOMS[id] = (d.meta && d.meta.DOMS) || [];
const chaptersOf = id => (id === "pmp" ? W.HALCYON_FULL : ((W.HALCYON_DATA || {})[id] || {}).full) || [];

let bad = 0, warn = 0; const strings = new Set();
const err = m => { console.log("  ERROR " + m); bad++ }, w = m => { console.log("  warn " + m); warn++ };
const TYPES = new Set(["chapter", "chapters", "book", "clean", "quiz", "exam", "final", "readiness", "streak", "flag", "pick", "all"]);
const copy = (t, where) => {
  if (typeof t !== "string" || !t.trim()) return err(`${where}: empty`);
  if (/[–—]/.test(t)) err(`${where}: em or en dash: ${t}`);
  if (/\s-\s|\s-$|^-\s/.test(t)) err(`${where}: spaced hyphen: ${t}`);
  if (/undefined|null|NaN/.test(t)) err(`${where}: ${t}`);
  strings.add(t);
};
const ids = new Set();
for (const c of COURSES) {
  console.log(`== ${c.id}`);
  if (!c.badges) { err(`${c.id}: no badges file in courses.js`); continue }
  if (!fs.existsSync(c.badges)) { err(`${c.id}: ${c.badges} is missing`); continue }
  run(c.badges);
  const def = (W.HALCYON_BADGES || {})[c.id];
  if (!def) { err(`${c.badges} doesn't register HALCYON_BADGES.${c.id}`); continue }
  if (!(typeof c.target === "number" && c.target > 0 && c.target <= 100)) err(`${c.id}: target in courses.js`);
  if (def.target !== undefined) err(`${c.id}: target belongs in courses.js, not the defs`);
  if (c.examWeights) for (const [d, v] of Object.entries(c.examWeights)) { if (!DOMS[c.id].includes(d)) err(`${c.id}: examWeights names "${d}", not a domain`); if (!(v > 0)) err(`${c.id}: examWeights ${d}`) }
  if (c.examWeights) DOMS[c.id].forEach(d => { if (!(d in c.examWeights)) err(`${c.id}: examWeights leaves out ${d}`) });
  if (!HB.FORMS.includes(def.form)) err(`${c.id}: form ${def.form}`);
  for (const k of ["one", "shelf"]) copy(def[k], `${c.id} ${k}`);
  if (!def.color || !(def.color.ink)) err(`${c.id}: color.ink`);
  if (!def.readiness || !def.readiness.name) err(`${c.id}: readiness.name`); else { copy(def.readiness.name, `${c.id} readiness name`); copy(def.readiness.explain.replace(/\{target\}/g, c.target), `${c.id} readiness explain`) }
  if (!def.idCard || !def.idCard.title) err(`${c.id}: idCard`);
  const L = chaptersOf(c.id), planned = Math.max(c.planned || 0, L.length);
  const F = { planned, chapters: L.map(x => ({ n: x.num, title: x.title })) };
  if (def.chapters) { if (!/\{n\}/.test(def.chapters.line) && def.chapters.line.includes("Chapter")) w(`${c.id}: chapter line has no {n}`); if (!def.chapters.prefix || !def.chapters.prefix.startsWith(c.id + "-")) err(`${c.id}: chapters.prefix`); copy(def.chapters.line.replace(/\{n\}/g, 1), `${c.id} chapter line`) }
  const all = [...HB.expand(def, F), ...(def.items || []).filter(x => x.pending)];
  const chs = {}; const per = { book: 0, clean: 0, exam: 0, readiness: 0, streak: 0, hidden: 0, pending: 0 };
  for (const it of all) {
    const where = `${c.id} ${it.id}`;
    if (!it.id || !it.id.startsWith(c.id + "-")) err(`${where}: id needs the ${c.id}- prefix`);
    if (ids.has(it.id)) err(`${where}: duplicate id`); ids.add(it.id);
    copy(it.name, where + " name"); copy(it.line, where + " line");
    if (it.mark !== "num" && !HB.MARKS.includes(it.mark)) err(`${where}: mark ${it.mark}`);
    const r = it.rule || {};
    if (!TYPES.has(r.type)) { err(`${where}: rule type ${r.type}`); continue }
    if (it.pending) { per.pending++; if (!it.hidden) err(`${where}: pending but not hidden`); if (!it.plan) err(`${where}: pending with no plan`); continue }
    if (it.hidden) per.hidden++;
    if (r.type === "chapter") { if (!(r.ch >= 1 && r.ch <= planned)) err(`${where}: chapter ${r.ch} outside 1 to ${planned}`); chs[r.ch] = (chs[r.ch] || 0) + 1;
      const ch = L.find(x => x.num === r.ch); if (ch && !it.shared && ch.title !== it.name) err(`${where}: name "${it.name}" isn't the chapter title "${ch.title}"`) }
    if (r.type === "streak") { if (!(r.days >= 2)) err(`${where}: days`) }
    if (r.type in per) per[r.type]++;
    if (r.type === "readiness") { const m = /(\d+) or better/.exec(it.line); if (!m || +m[1] !== c.target) err(`${where}: line says ${m ? m[1] : "no number"}, the course target is ${c.target}`) }
    if (r.type === "pick") {
      const ch = L.find(x => x.num === r.ch); if (!ch) { err(`${where}: chapter ${r.ch} isn't written (mark it pending)`); continue }
      const i = ch.scenes.findIndex(s => s.id === r.scene); if (i < 0) { err(`${where}: scene ${r.scene} not in chapter ${r.ch}`); continue }
      const sc = ch.scenes[i]; if (!(Number.isInteger(r.opt) && r.opt >= 0 && r.opt < sc.opts.length)) err(`${where}: option ${r.opt} of ${sc.opts.length}`);
      else console.log(`  ${it.id}: ch${r.ch} ${r.scene} "${sc.title}" page s${i}, option ${r.opt}${sc.opts[r.opt].best ? " (the best option)" : " (not the best option)"}`);
    }
    if (r.type === "all") (r.ids || []).forEach(x => { if (!all.some(y => y.id === x)) err(`${where}: all names ${x}`) });
    for (const st of ["got", "locked", "hidden"]) { const svg = HB.art(it, def, st, 56); if (/undefined|NaN/.test(svg) || !svg.startsWith("<svg")) err(`${where}: art ${st}`) }
  }
  for (let n = 1; n <= planned; n++) if (chs[n] !== 1) err(`${c.id}: chapter ${n} has ${chs[n] || 0} chapter badges`);
  for (const k of ["book", "clean", "exam", "readiness"]) if (per[k] !== 1) w(`${c.id}: ${per[k]} ${k} badges`);
  if (per.streak !== 2) w(`${c.id}: ${per.streak} streak badges`);
  console.log(`  ${all.length} badges: ${planned} chapter, ${per.hidden} hidden live, ${per.pending} pending; target ${c.target}; ${def.chapters ? "shared chapter pattern" : "a badge per chapter"}`);
  // the requirement lines the shelf shows for locked badges
  HB.expand(def, F).forEach(it => copy(HB.need(it, { planned, hasMock: true, meter: def.readiness.name, target: c.target }), `${c.id} ${it.id} need`));
  copy(HB.need({ rule: { type: "exam" } }, { hasMock: false }), "need without a mock");
}
if (process.env.DUMP) fs.writeFileSync(process.env.DUMP, [...strings].join("\n\n") + "\n");
console.log(`\n${bad} error${bad === 1 ? "" : "s"}, ${warn} warning${warn === 1 ? "" : "s"}`);
process.exit(bad ? 1 : 0);
