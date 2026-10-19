// Spoken chapter intro for the PMP v2 audiobooks (Anthony, 2026-10-19: names blur by ear, so each chapter opens with a
// "previously" and a who's who). Built from full/v2/recaps.js on the best-answer path, the path both Audiobook editions play,
// so it only says what a listener on that path already knows. Chapter 1 reads "Before you start" instead of "Previously".
// introSegs(n, story, mk) -> segments, or null when recaps aren't there. tools/pages.mjs puts them first: page "intro" in the
// study plan, and at the head of the one Story only page.
import fs from 'fs';
const load=f=>{const w={};new Function('window',fs.readFileSync(f,'utf8'))(w);return w};
const chap=k=>load(`full/v2/ch${String(k).padStart(2,'0')}.js`).HALCYON_FULL[0];
const bestOf=C=>{const picks={},flags={};C.scenes.forEach((sc,i)=>{const j=sc.opts.findIndex(o=>o.best);picks[i]=j;if(sc.opts[j].flag)flags[sc.opts[j].flag]=true});return {picks,flags}};
const first=t=>t.split(/(?<=[.!?])\s/)[0];
const list=a=>a.length<2?a.join(''):`${a.slice(0,-1).join(', ')} and ${a[a.length-1]}`;
export function introSegs(n,story,mk){
  if(!fs.existsSync('full/v2/recaps.js'))return null;const R=load('full/v2/recaps.js').HALCYON_RECAPS;if(!R||typeof R.recap!=='function')return null;
  const all={},G={};for(let k=1;k<n;k++){all[k]=bestOf(chap(k));Object.assign(G,all[k].flags)}
  const s={picks:{},flags:{}},C=chap(n),B=bestOf(C);
  // "Every scene ends with a decision" and the like belong to the study edition only
  const prev=(R.previously(n,s,all,G)||[]).filter(Boolean).filter(p=>!(story&&/\bdecision\b/i.test(p)));
  // what a listener knows about each person at the top of the chapter: their newest recap line from before it
  const known=id=>{const L=((R.people[id]||{}).lines||[]).filter(l=>l[0]<n||(l[0]===n&&l[1]==='open'));let t=L.length?L[L.length-1][2]:null;
    if(typeof t==='function')t=t(s,all,G);return t||null};
  const seen=new Map(),ps={picks:{},flags:{}};
  R.pids.forEach(pid=>{const x=R.recap(n,pid,ps,all,G);if(x)x.who.forEach(o=>{if(!seen.has(o.id))seen.set(o.id,o)});
    if(/^s\d+$/.test(pid)){const i=+pid.slice(1);if(i in B.picks)ps.picks[i]=B.picks[i]}});
  const back=[],fresh=[];
  // spoke in an earlier chapter but has no recap line yet (Leo, ch10 then ch13): not new, so not in the new list
  const spokeBefore=id=>{for(let k=1;k<n;k++){if(new RegExp(`data-who=\\\\?"${id}"`,'i').test(fs.readFileSync(`full/v2/ch${String(k).padStart(2,'0')}.js`,'utf8')))return true}return false};
  for(const [id,o] of seen){if(id==='sam')continue;const k=known(id);if(k)back.push([o.name,first(k)]);else if(!spokeBefore(id))fresh.push(o.name)}
  const {segs,say,pause}=mk();
  if(prev.length){say('narrator',n===1?'Before you start.':'Previously.');pause(0.6);prev.forEach(p=>{say('narrator',p);pause(0.4)});pause(0.8)}
  if(back.length||fresh.length){say('narrator',n===1?'The people you\'ll hear from first.':'Who\'s who in this chapter.');pause(0.5);
    back.forEach(([nm,l])=>{say('narrator',`${nm}. ${l}`);pause(0.35)});
    if(fresh.length&&fresh.length<=5){say('narrator',`New in this chapter: ${list(fresh)}.`);pause(0.35)}pause(0.8)}
  return segs.length?segs:null}
// A course book's intro, hand written in courses/<id>/intros.js (window.HALCYON_INTROS[id][n] = {prev:[], who:[[name,tag]], fresh:[]}).
export function courseIntroSegs(cid,n,story,mk){
  const f=`courses/${cid}/intros.js`;if(!fs.existsSync(f))return null;const I=((load(f).HALCYON_INTROS||{})[cid]||{})[n];if(!I)return null;
  const {segs,say,pause}=mk();const prev=(I.prev||[]).filter(Boolean),who=I.who||[],fresh=I.fresh||[];
  if(prev.length){say('narrator',n===1?'Before you start.':'Previously.');pause(0.6);prev.forEach(p=>{say('narrator',p);pause(0.4)});pause(0.8)}
  if(who.length||fresh.length){say('narrator',n===1?'The people you\'ll hear from first.':'Who\'s who in this chapter.');pause(0.5);
    who.forEach(([nm,l])=>{say('narrator',`${nm}. ${l}`);pause(0.35)});
    if(fresh.length&&fresh.length<=5){say('narrator',`New in this chapter: ${list(fresh)}.`);pause(0.35)}pause(0.8)}
  return segs.length?segs:null}
