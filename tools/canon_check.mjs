#!/usr/bin/env node
// Story canon check: compares chapter files against the private, world-first story canon.
// usage: node tools/canon_check.mjs <course> [chapter files...]     (no files: every written chapter of that course)
// The canon lives outside this public repo, in CANON_DIR (default ~/Documents/halcyon-private/canon): one <world>.json per world.
// A world holds characters, one long timeline and its stories (books, prequels, side stories), each with dated chapters.
// Checks, per chapter file:
//   speakers  every data-who is a character tag in that world for this course, or man/woman/narrator (error)
//   dates     an explicit weekday + date ("Saturday, May 15" or "Sat May 15", with or without a year) falls on that weekday,
//             in some year of the chapter's date range when no year is given (error)
//   ages      "Name, 44," or "Name was 44" against the character's age_at anchor, at the chapter's dates, give or take a year (warning)
//   born      a character speaking in a chapter dated before they were born (error)
//   markers   knowledge and rule markers: a phrase set appearing before it's allowed. Inside the same story that's an earlier
//             chapter; in another story of the same world (a prequel or side story) it's a chapter dated before the gate (error or warning)
//   open      threads whose next level or payoff is in a chapter not written yet (info)
// Exit 1 on any error. Files only: nothing is written.
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const NUM = { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90 };
const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

export function wordsToNum(s) {
  s = String(s).toLowerCase().trim();
  if (/^\d+$/.test(s)) return +s;
  const parts = s.split(/[\s-]+/); let n = 0;
  for (const p of parts) { if (!(p in NUM)) return null; n += NUM[p]; }
  return parts.length ? n : null;
}
const NUMWORD = "(?:\\d{1,3}|(?:twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)(?:[\\s-](?:one|two|three|four|five|six|seven|eight|nine))?|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen)";

export function loadCanon(dir) {
  const worlds = [];
  if (!fs.existsSync(dir)) return worlds;
  for (const f of fs.readdirSync(dir).filter(f => f.endsWith(".json")).sort()) worlds.push(JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
  return worlds;
}
export function findStory(worlds, course) {
  for (const w of worlds) for (const [id, s] of Object.entries(w.stories || {})) if (s.course === course && (s.chapters || []).length) return { world: w, id, story: s };
  return null;
}
const ymd = s => { const m = String(s).match(/^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?/); return m ? new Date(Date.UTC(+m[1], m[2] ? +m[2] - 1 : 0, m[3] ? +m[3] : 1)) : null; };
const ymdEnd = s => { const m = String(s).match(/^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?/); if (!m) return null; if (m[3]) return ymd(s); if (m[2]) return new Date(Date.UTC(+m[1], +m[2], 0)); return new Date(Date.UTC(+m[1], 11, 31)); };
const chapterOf = (story, n) => (story.chapters || []).find(c => c.n === n);
function yearsDiff(a, b) { let y = b.getUTCFullYear() - a.getUTCFullYear(); if (b.getUTCMonth() < a.getUTCMonth() || (b.getUTCMonth() === a.getUTCMonth() && b.getUTCDate() < a.getUTCDate())) y--; return y; }

// the chapter text as paragraph-sized chunks (each template string in the chapter file is one paragraph or option)
export function chunks(src) {
  return src.split(/`\s*[,\]]|\n/).filter(t => !/^[\s`]*\/\//.test(t)).map(t => t.replace(/`/g, " ").replace(/<[^>]+>/g, " ").replace(/\$\{[^}]*\}/g, " ").replace(/\s+/g, " ").trim()).filter(Boolean);
}
const has = (t, p) => t.toLowerCase().includes(String(p).toLowerCase());
export function markerHit(m, chs) {
  for (const t of chs) {
    if (m.all && m.all.every(p => has(t, p))) return t;
    if (m.any && m.any.some(p => has(t, p))) return t;
  }
  return null;
}

export function checkChapter({ world, id, story, course }, n, src) {
  const out = []; const add = (sev, msg) => out.push({ sev, ch: n, msg });
  const C = chapterOf(story, n);
  if (!C) { add("warning", `chapter ${n} has no dates in the canon story "${id}"`); return out; }
  const cStart = ymd(C.start), cEnd = ymdEnd(C.end);
  const chars = Object.values(world.characters || {});
  // speakers
  const tags = new Set(["man", "woman", "narrator"]); for (const c of chars) if (c.tag && c.tag[course]) tags.add(c.tag[course]);
  const spoke = new Set();
  for (const m of src.matchAll(/data-who="([^"$]+)"/g)) { if (!tags.has(m[1]) && !spoke.has(m[1])) add("error", `speaker "${m[1]}" isn't a character in world ${world.world} for ${course}`); spoke.add(m[1]); }
  // born
  for (const c of chars) {
    const tag = c.tag && c.tag[course]; if (!tag || !spoke.has(tag) || !c.born) continue;
    const by = +String(c.born).slice(0, 4); if (cEnd && cEnd.getUTCFullYear() < by) add("error", `${c.name} speaks in a chapter dated before they were born (${c.born})`);
  }
  const chs = chunks(src);
  const text = chs.join("\n");
  // dates with weekdays
  // no year given: any year of the story's range counts (chapters date schedules and forecasts ahead of their own months)
  const sr = story.range || [C.start, C.end]; const years = []; for (let y = ymd(sr[0]).getUTCFullYear(); y <= ymdEnd(sr[1]).getUTCFullYear(); y++) years.push(y);
  const reFull = new RegExp(`\\b(${DAYS.join("|")}),?\\s+(${MONTHS.join("|")})\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:,?\\s+((?:19|20|21)\\d{2})\\b)?`, "gi");
  const reShort = /\b(Sun|Mon|Tue|Tues|Wed|Thu|Thur|Thurs|Fri|Sat)\.?\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\.?\s+(\d{1,2})\b(?:,?\s+((?:19|20|21)\d{2})\b)?/g;
  const seen = new Set();
  const dayCheck = (dw, mon, d, y, raw) => {
    const key = raw.toLowerCase(); if (seen.has(key)) return; seen.add(key);
    const want = DAYS.findIndex(x => x.startsWith(dw.toLowerCase().slice(0, 3)));
    const mi = MONTHS.findIndex(x => x.startsWith(mon.toLowerCase().slice(0, 3)));
    const ys = y ? [+y] : years;
    const ok = ys.some(yy => new Date(Date.UTC(yy, mi, +d)).getUTCDay() === want);
    if (!ok) add("error", `"${raw.trim()}" isn't a ${DAYS[want]} in ${ys.join(" or ")}`);
  };
  for (const m of text.matchAll(reFull)) dayCheck(m[1], m[2], m[3], m[4], m[0]);
  for (const m of text.matchAll(reShort)) dayCheck(m[1], m[2], m[3], m[4], m[0]);
  // ages
  for (const c of chars) {
    if (!c.age_at) continue;
    const names = [...new Set([c.tag && c.tag[course], c.name.replace(/^Dr\.\s+/, "").split(/[\s']/)[0]].filter(x => x && x.length >= 3 && !["man", "woman"].includes(x)))];
    if (!names.length) continue; const first = `(?:${names.join("|")})`;
    const [anchor, age] = Object.entries(c.age_at)[0]; const a = ymd(anchor);
    const lo = yearsDiff(a, cStart) + age - 1, hi = yearsDiff(a, cEnd) + age + 1;
    const re = new RegExp(`\\b${first}\\b(?:,\\s+(${NUMWORD}),|\\s+(?:was|is)\\s+(${NUMWORD})(?:\\s+years old)?\\b)`, "gi");
    for (const m of text.matchAll(re)) {
      const v = wordsToNum(m[1] || m[2]); if (v == null || v < 3 || v > 110) continue;
      const ci = chs.findIndex(t => t.includes(m[0])); const ctx = ci >= 0 ? chs[ci] : ""; if (/\b(pounds|lbs?|gallons|knots|feet|percent)\b/i.test(ctx)) continue; // a weight and balance list, not an age
      // a flashback: a year named in the same paragraph moves the anchor ("in 2010, Pell was twenty")
      const near = chs.slice(Math.max(0, ci - 4), ci + 1).join(" "); // a console log or memory names its year a few paragraphs up
      const yrs = [...near.matchAll(/\b((?:19|20|21)\d{2})\b/g)].map(x => +x[1]);
      if (yrs.some(y => { const e = age + (y - a.getUTCFullYear()); return v >= e - 1 && v <= e + 1; })) continue;
      if ((story.allow || []).some(x => m[0].includes(x) || ctx.includes(x))) continue; // checked by hand, listed in the canon story's allow list
      if (v < lo || v > hi) add("warning", `${c.name} is given as ${v}; canon puts them at ${lo + 1} to ${hi - 1} in this chapter ("${m[0]}")`);
    }
  }
  // markers (knowledge and rules)
  const gates = [];
  for (const k of world.knowledge || []) for (const m of k.markers || []) gates.push({ what: `knowledge "${k.id}"`, m });
  for (const r of story.rules || []) if (r && r.markers) for (const m of r.markers) gates.push({ what: `rule "${r.text}"`, m });
  for (const g of gates) {
    const m = g.m;
    if (m.only_ch && m.only_ch !== n) continue;
    let applies = !m.not_before;
    if (m.not_before) {
      const nb = m.not_before;
      if (nb.story === id) applies = n < nb.ch;
      else { const os = world.stories[nb.story]; const gc = os && chapterOf(os, nb.ch); applies = !!(gc && cEnd < ymd(gc.start)); }
    }
    if (!applies) continue;
    const hit = markerHit(m, chs);
    if (hit) add(m.severity || "warning", `${g.what}${m.not_before ? ` appears before ${m.not_before.story} ch${m.not_before.ch}` : ""}: "${hit.slice(0, 140)}"`);
  }
  return out;
}

export function openThreads({ world, id }, written) {
  const max = Math.max(0, ...written), out = [];
  for (const k of world.knowledge || []) {
    const levels = (k.levels || []).filter(l => (k.story || id) === id);
    const next = levels.find(l => l.ch > max);
    if (next) out.push({ sev: "open", ch: next.ch, msg: `"${k.id}" next: ch${next.ch} ${next.level}` });
    const L = k.learned || k.learned_by_others || k.learned_by_sam;
    if (L && L.story === id && L.ch > max) out.push({ sev: "open", ch: L.ch, msg: `"${k.id}" lands in ch${L.ch}: ${k.fact}` });
  }
  return out;
}

function main() {
  const [course, ...files] = process.argv.slice(2);
  if (!course) { console.error("usage: node tools/canon_check.mjs <course> [chapter files]"); process.exit(2); }
  const dir = process.env.CANON_DIR || path.join(os.homedir(), "Documents", "halcyon-private", "canon");
  const worlds = loadCanon(dir);
  const found = findStory(worlds, course);
  if (!found) { console.error(`no canon story for course "${course}" in ${dir}`); process.exit(2); }
  const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
  let list = files;
  if (!list.length) { const d = course === "pmp" ? path.join(root, "full", "v2") : path.join(root, "courses", course, "full"); list = fs.readdirSync(d).filter(f => /^ch\d+\.js$/.test(f)).sort().map(f => path.join(d, f)); }
  const ctx = { ...found, course }; const all = []; const written = [];
  for (const f of list) {
    const n = +(path.basename(f).match(/ch(\d+)/) || [])[1]; written.push(n);
    all.push(...checkChapter(ctx, n, fs.readFileSync(f, "utf8")));
  }
  all.push(...openThreads(ctx, written));
  const by = s => all.filter(x => x.sev === s);
  console.log(`== ${course}: world ${found.world.world}, story "${found.id}", ${list.length} chapter file(s)`);
  for (const sev of ["error", "warning", "open"]) for (const x of by(sev)) console.log(`  ${sev.toUpperCase()} ch${x.ch}: ${x.msg}`);
  console.log(`${by("error").length} errors, ${by("warning").length} warnings, ${by("open").length} open threads`);
  process.exit(by("error").length ? 1 : 0);
}
if (import.meta.url === `file://${process.argv[1]}`) main();
