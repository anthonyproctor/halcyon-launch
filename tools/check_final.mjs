// Checks the PMP final assessment bank (final/pmp.js): domain counts weighted to the July 2026 ECO (People 33, Process 41,
// Business Environment 26 of 100), every task covered, about 40 percent predictive and 60 percent agile or hybrid, four options each,
// stored answer positions spread, no answer-length tells, no em or en dashes or spaced hyphens, an explanation on every item,
// and no question that repeats a mock exam or chapter quiz stem. Run: node tools/check_final.mjs (exit 0 when clean).
import fs from "fs";
globalThis.window = {};
const load = f => new Function("window", fs.readFileSync(f, "utf8"))(globalThis.window);
load("final/pmp.js");
["mock/people.js", "mock/process.js", "mock/business.js", "mock/form2_people.js", "mock/form2_process.js", "mock/form2_business.js"].forEach(load);
const w = {}; new Function("window", fs.readFileSync("full/v2/preview.js", "utf8"))(w);
(w.HALCYON_V2.files || []).filter(f => /^ch\d+\.js$/.test(f)).forEach(f => load("full/v2/" + f));

const TASKS = ["P1","P2","P3","P4","P5","P6","P7","P8","R1","R2","R3","R4","R5","R6","R7","R8","R9","R10","B1","B2","B3","B4","B5","B6","B7","B8"];
const DOM = { P: "People", R: "Process", B: "Business Environment" };
const WANT = { People: 33, Process: 41, "Business Environment": 26 };
let bad = 0; const err = m => { console.log("  ERROR " + m); bad++ };
const Q = (window.HALCYON_FINAL || []).flatMap(p => p.questions.map((q, i) => ({ ...q, id: p.part.slice(0, 3) + i })));
console.log(`final assessment: ${Q.length} questions`);
if (Q.length !== 100) err(`want 100 questions, have ${Q.length}`);

const byDom = {}, byTask = {}, byAp = {}, pos = [0, 0, 0, 0]; let longest = 0, shortest = 0;
Q.forEach(x => {
  if (!Array.isArray(x.opts) || x.opts.length !== 4 || !(x.a >= 0 && x.a <= 3)) err(`${x.id} needs 4 options and a in 0..3`);
  if (!TASKS.includes(x.task)) err(`${x.id} bad task ${x.task}`); else if (DOM[x.task[0]] !== x.domain) err(`${x.id} domain ${x.domain} doesn't match ${x.task}`);
  if (!["agile", "hybrid", "predictive"].includes(x.approach)) err(`${x.id} approach`);
  if (!x.why || x.why.length < 80) err(`${x.id} explanation too short`);
  byDom[x.domain] = (byDom[x.domain] || 0) + 1; byTask[x.task] = (byTask[x.task] || 0) + 1; byAp[x.approach] = (byAp[x.approach] || 0) + 1; pos[x.a]++;
  const L = x.opts.map(o => o.length), right = L[x.a], others = L.filter((_, k) => k !== x.a);
  if (right > 1.12 * Math.max(...others)) err(`${x.id} right answer much longer (${L.join("/")})`);
  if (right > Math.max(...others)) longest++; if (right < Math.min(...others)) shortest++;
  const text = [x.q, ...x.opts, x.why].join(" ");
  if (/[\u2013\u2014]/.test(text)) err(`${x.id} em or en dash`);
  if (/\s-\s/.test(text)) err(`${x.id} spaced hyphen`);
});
Object.entries(WANT).forEach(([d, n]) => { if (byDom[d] !== n) err(`${d}: ${byDom[d] || 0} questions, want ${n}`) });
TASKS.forEach(t => { if (!byTask[t]) err(`task ${t} not covered`) });
const pred = (byAp.predictive || 0) / Q.length;
if (pred < 0.35 || pred > 0.45) err(`predictive share ${Math.round(pred * 100)}%, want about 40%`);
if (Math.max(...pos) > 32) err(`stored answer positions ${pos}`);
if (longest > Q.length * 0.33) err(`right answer longest in ${longest}`);
if (shortest > Q.length * 0.33) err(`right answer shortest in ${shortest} (reverse tell)`);

// originality inside the course: no stem shares a long run of words with a mock or chapter quiz stem
const norm = s => String(s).toLowerCase().replace(/<[^>]+>/g, " ").replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter(Boolean);
const grams = s => { const t = norm(s), g = new Set(); for (let i = 0; i + 10 <= t.length; i++) g.add(t.slice(i, i + 10).join(" ")); return g };
const other = [];
(window.HALCYON_MOCK || []).forEach(p => p.questions.forEach(q => other.push(q.q)));
(window.HALCYON_FULL || []).forEach(c => (c.quiz || []).forEach(q => other.push(q.q)));
const og = new Set(); other.forEach(s => grams(s).forEach(g => og.add(g)));
Q.forEach(x => { const hit = [...grams(x.q)].find(g => og.has(g)); if (hit) err(`${x.id} repeats another bank: "${hit}"`) });
const seen = new Map(); Q.forEach(x => { const k = norm(x.q).join(" "); if (seen.has(k)) err(`${x.id} duplicates ${seen.get(k)}`); seen.set(k, x.id) });

console.log(`  domains ${JSON.stringify(byDom)}`);
console.log(`  approach ${JSON.stringify(byAp)}`);
console.log(`  tasks ${TASKS.map(t => t + ":" + (byTask[t] || 0)).join(" ")}`);
console.log(`  stored positions ${pos}, right longest ${longest}, right shortest ${shortest}`);
if (process.env.DUMP) fs.writeFileSync(process.env.DUMP, Q.map(x => x.why).join("\n\n"));
process.exit(bad ? 1 : 0);
