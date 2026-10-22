// Build per-page narration scripts for a chapter. Page ids match what the engine shows.
// usage: node tools/pages.mjs ref|full N out.json [--story] [--course <id>] [--v2]   (no --course = the PMP course)
// --v2: the PMP v2 draft in full/v2/chNN.js, with the v2 mentor leads from full/v2/preview.js; render_pages.py then writes audio/v2/pages/fN so v1 audio is never overwritten
import fs from 'fs';
import {segments} from './voices.mjs';
import {introSegs,courseIntroSegs} from './intro_v2.mjs';
const A=process.argv.slice(2);const [track,nArg,outPath]=A;const n=+nArg;const STORY=A.includes('--story');const CID=A.includes('--course')?A[A.indexOf('--course')+1]:null;const V2=A.includes('--v2')&&!CID;
globalThis.window={};
let C,CO={},SRC='';
if(CID){new Function('window',fs.readFileSync('courses.js','utf8'))(globalThis.window);CO=window.HALCYON_COURSES.find(c=>c.id===CID);
  SRC=fs.readFileSync(`courses/${CID}/full/ch${String(n).padStart(2,'0')}.js`,'utf8');new Function('window',SRC)(globalThis.window);C=window.HALCYON_DATA[CID][track].find(c=>c.num===n)}
else{const file=track==='ref'?`chapters/ch${n}.js`:`full/${V2?'v2/':''}ch${String(n).padStart(2,'0')}.js`;
if(V2){new Function('window',fs.readFileSync('full/v2/preview.js','utf8'))(globalThis.window);CO={leads:window.HALCYON_V2.course.leads}}
SRC=fs.readFileSync(file,'utf8');new Function('window',SRC)(globalThis.window);
C=(track==='ref'?window.HALCYON:window.HALCYON_FULL)[0];}
const MV=CID?CO.mentor:'ruth'; // mentor's voice
// must match engine.js order(): balanced placement from order.js
new Function('window',fs.readFileSync('order.js','utf8'))(globalThis.window);
globalThis.window.HalcyonOrder.build([{key:(track==='ref'?'ref':'full')+C.num+'dec',items:C.scenes.map(sc=>({id:sc.id,n:sc.opts.length,correct:sc.opts.findIndex(o=>o.best)}))}]);
const order=(id,len)=>globalThis.window.HalcyonOrder.get(id,len);
const RUTH_LEADS0={3:["That's the move.","Good. That's what I'd want from a flight director.","Exactly right."],1:["Close, but not quite.","Defensible. Not the best answer.","You're in the neighborhood."],0:["That one's going to cost you.","I'd have stopped you there.","Let's talk about that one."]};
// same fallback as engine.js LEADS(): only Ruth gets the flight director line; another mentor without leads says "That's the call."
const RUTH_LEADS=CO.leads||(MV==='ruth'||MV==='Ruth'?RUTH_LEADS0:{...RUTH_LEADS0,3:["That's the move.","Good. That's the call.","Exactly right."]});
// earlier chapters on the best-answer path (picks by chapter, and their flags), the path both Audiobook editions play.
// Pages used to get {} {} here, so a page that recalls an earlier chapter played the wording of a reader who chose nothing (2026-10-22).
const AB={},GB={};if(track==='full'&&(CID||V2)){const ld=k=>{const w={},nn=String(k).padStart(2,'0');
  if(CID){const f=`courses/${CID}/full/ch${nn}.js`;if(!fs.existsSync(f))return null;new Function('window',fs.readFileSync(f,'utf8'))(w);return (w.HALCYON_DATA[CID].full||[]).find(c=>c.num===k)}
  const f=`full/v2/ch${nn}.js`;if(!fs.existsSync(f))return null;new Function('window',fs.readFileSync(f,'utf8'))(w);return w.HALCYON_FULL[0]};
 for(let k=1;k<n;k++){const P=ld(k);if(!P)continue;const picks={},flags={};P.scenes.forEach((sc,i)=>{const j=sc.opts.findIndex(o=>o.best);picks[i]=j;if(sc.opts[j].flag)flags[sc.opts[j].flag]=true});AB[k]={picks,flags};Object.assign(GB,flags)}}
const W=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen'];
const st={flags:{},score:24,m:{trust:60,conf:60,health:60}}; // a middling run: kept as the _alt version of any page whose text depends on how you've played
// the Audiobook plays the best-answer path, so pages are narrated with that path's state (state before each decision, and at the end)
const clamp=v=>Math.max(0,Math.min(100,v));const BEST=[{flags:{},score:0,m:{trust:50,conf:50,health:50},picks:{}}];
C.scenes.forEach((sc,i)=>{const p=BEST[BEST.length-1],o=sc.opts.find(x=>x.best),n={flags:{...p.flags},score:p.score+o.s,m:{...p.m},picks:{...p.picks,[i]:sc.opts.indexOf(o)}};for(const k in (o.d||{}))n.m[k]=clamp(n.m[k]+o.d[k]);if(o.flag)n.flags[o.flag]=true;BEST.push(n)});
const FINAL=BEST[BEST.length-1];const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const pages={};
const mk=()=>{const segs=[];const say=(v,t)=>segments(String(t),v).forEach(x=>segs.push(x));const pause=s=>segs.push({pause:s});return {segs,say,pause}};
// opening
{const {segs,say,pause}=mk();say('narrator',`Chapter ${W[C.num]}. ${C.title}.`);pause(0.8);C.opening.forEach(p=>{say('narrator',p);pause(0.5)});pages.open=segs}
// lesson (full only)
// course.lessonVoice (GH-300, 2026-10-22): a lesson written as narration about the mentor reads in that voice; the mentor's own tagged lines keep hers
if(C.lesson){const LV=CO.lessonVoice||MV;const {segs,say,pause}=mk();say(LV,CID||V2?`${C.lesson.title}.`:`Ruth's whiteboard. ${C.lesson.title}.`);pause(0.6);C.lesson.sections.forEach(s=>{say(LV,s.h+'.');pause(0.3);s.body.forEach(p=>{say(LV,String(p).replace('<!--story-->',''));pause(0.35)});if(s.exam){say(LV,'How the exam asks it. '+s.exam);pause(0.5)}});pages.lesson=segs}
// scenes and outcomes
C.scenes.forEach((sc,i)=>{
  {const {segs,say,pause}=mk();say('narrator',`Decision ${W[i+1]}. ${sc.title||sc.task}.`);pause(0.5);sc.text(BEST[i],AB,GB).forEach(p=>{say('narrator',p);pause(0.35)});
   if(sc.q){say('narrator',sc.q);pause(0.45)}say('narrator','Your options.');pause(0.25);order(sc.id,sc.opts.length).forEach((j,pos)=>{say('narrator',`${'ABCD'[pos]}. ${sc.opts[j].t}`);pause(0.3)});pages['s'+i]=segs}
  sc.opts.forEach((o,j)=>{const {segs,say,pause}=mk();say('narrator',o.after);pause(0.5);say(MV,RUTH_LEADS[o.s][i%3]+' '+o.why);
    if(!o.best){const b=sc.opts.find(x=>x.best);pause(0.3);say(MV,'The best answer: '+b.t+' '+b.why)}pages[`o${i}_${j}`]=segs});
});
// closing
{const {segs,say,pause}=mk();C.closing(FINAL,AB,GB).forEach(p=>{say('narrator',p);pause(0.5)});pages.end=segs}
// alternates: same page as a middling run would see it, when the wording differs
C.scenes.forEach((sc,i)=>{if(!same(sc.text(BEST[i],AB,GB),sc.text(st,{},{}))){const {segs,say,pause}=mk();say('narrator',`Decision ${W[i+1]}. ${sc.title||sc.task}.`);pause(0.5);sc.text(st,{},{}).forEach(p=>{say('narrator',p);pause(0.35)});
  if(sc.q){say('narrator',sc.q);pause(0.45)}say('narrator','Your options.');pause(0.25);order(sc.id,sc.opts.length).forEach((j,pos)=>{say('narrator',`${'ABCD'[pos]}. ${sc.opts[j].t}`);pause(0.3)});pages['s'+i+'_alt']=segs}});
if(!same(C.closing(FINAL,AB,GB),C.closing(st,{},{}))){const {segs,say,pause}=mk();C.closing(st,{},{}).forEach(p=>{say('narrator',p);pause(0.5)});pages.end_alt=segs}
// variants: a decision or closing page can read differently for every reader (picks, flags, score, meters, and flags carried over
// from earlier chapters as G). The best path and the middling run above cover two readers. Playing the chapter through VARIANT_RUNS
// times (from random picks to nearly all best, earlier-chapter flags set at random) finds the other wordings, and:
//  - a page with at most VARIANT_MAX wordings gets one narrated page per wording, <pid>_v<k>
//  - every page that varies also gets <pid>_fixed: only the paragraphs every reader sees, so whatever the picks, there is a
//    narration that says nothing that isn't on the screen (the branching paragraphs then just aren't voiced or highlighted)
// The engine plays the narration with no words missing from the screen that covers the most of it (engine.js narAttach).
// Shared paragraphs are the same segments, so they come from the cache; only the differing wording is new audio. A Halcyon
// closing page can have 60 to 80 wordings, too many to narrate one by one, so those readers get the full page or _fixed.
{const GN=[...new Set((SRC.match(/\bG\.([A-Za-z_]\w*)/g)||[]).map(x=>x.slice(2)))],RUNS=+(process.env.VARIANT_RUNS||4000),MAXV=+(process.env.VARIANT_MAX||8);
 let seed=20261011;const rnd=()=>(seed=(seed*1103515245+12345)%2147483648)/2147483648;
 const seen={};const key=t=>JSON.stringify(t);
 const add=(pid,txt)=>{(seen[pid]=seen[pid]||new Map()).set(key(txt),txt)};
 for(let r=0;r<RUNS;r++){const pb=[0,0.3,0.6,0.85,0.95][r%5];const prev={};GN.forEach(g=>{if(rnd()<0.5)prev[g]=true});
   let s={flags:{},score:0,m:{trust:50,conf:50,health:50},picks:{}};
   C.scenes.forEach((sc,i)=>{add('s'+i,sc.text(s,{},{...prev,...s.flags}));
     const bi=sc.opts.findIndex(o=>o.best),j=rnd()<pb?bi:Math.floor(rnd()*sc.opts.length),o=sc.opts[j];
     const nx={flags:{...s.flags},score:s.score+o.s,m:{...s.m},picks:{...s.picks,[i]:j}};for(const k in (o.d||{}))nx.m[k]=clamp(nx.m[k]+o.d[k]);if(o.flag)nx.flags[o.flag]=true;s=nx});
   add('end',C.closing(s,{},{...prev,...s.flags}))}
 const textOf=(pid,state,a={},g={})=>pid==='end'?C.closing(state,a,g):C.scenes[+pid.slice(1)].text(state,a,g);
 const build=(pid,paras)=>{const {segs,say,pause}=mk();
   if(pid==='end'){paras.forEach(p=>{say('narrator',p);pause(0.5)})}
   else{const i=+pid.slice(1),sc=C.scenes[i];say('narrator',`Decision ${W[i+1]}. ${sc.title||sc.task}.`);pause(0.5);paras.forEach(p=>{say('narrator',p);pause(0.35)});
     if(sc.q){say('narrator',sc.q);pause(0.45)}say('narrator','Your options.');pause(0.25);order(sc.id,sc.opts.length).forEach((j,pos)=>{say('narrator',`${'ABCD'[pos]}. ${sc.opts[j].t}`);pause(0.3)})}
   return segs};
 let nv=0,nf=0;
 for(const pid in seen){
   const best=textOf(pid,pid==='end'?FINAL:BEST[+pid.slice(1)],AB,GB);(seen[pid]).set(key(best),best);(seen[pid]).set(key(textOf(pid,st)),textOf(pid,st));
   const all=[...seen[pid].values()];if(all.length<2)continue;
   const known=new Set([key(best),...(pages[pid+'_alt']?[key(textOf(pid,st))]:[])]),extra=all.filter(t=>!known.has(key(t)));
   if(all.length<=MAXV)extra.forEach((t,v)=>{pages[`${pid}_v${v+1}`]=build(pid,t);nv++});
   const fixed=best.filter(p=>all.every(t=>t.includes(p)));pages[`${pid}_fixed`]=build(pid,fixed);nf++;
   if(all.length>MAXV)console.error(`${pid}: ${all.length} wordings, narrated as best path, middling run and fixed paragraphs only (${fixed.length} of ${best.length})`)}
 if(nv||nf)console.error(`${nv} variant pages, ${nf} fixed pages`)}
// whole-episode plan: page ids in order, with the best outcome after each decision
if(track==='full'){const I=V2?introSegs(n,false,mk):CID?courseIntroSegs(CID,n,false,mk):null;if(I)pages.intro=I}
const plan=[...(pages.intro?['intro']:[]),'open',...(C.lesson?['lesson']:[]),...C.scenes.flatMap((sc,i)=>['s'+i,`o${i}_${sc.opts.findIndex(o=>o.best)}`]),'end'];
if(STORY){ // novel edition: story only, best path, no options, no lesson, no debriefs
  const {segs,say,pause}=mk();if(track==='full'){const I=V2?introSegs(n,true,mk):CID?courseIntroSegs(CID,n,true,mk):null;if(I){segs.push(...I)}}say('narrator',`Chapter ${W[C.num]}. ${C.title}.`);pause(1);C.opening.forEach(p=>{say('narrator',p);pause(0.5)});pause(1.2);
  // Ruth's console page (PMP v2): the story leans on its lines, so the novel edition plays the page alone where the lesson sits, no teaching (2026-10-20)
  if(V2&&C.lesson){const L=C.lesson.sections.flatMap(s=>s.body).filter(p=>/kind="consolelog"/.test(p));L.forEach(p=>{say(MV,p);pause(0.6)});if(L.length)pause(0.8)}
  // course books: the lesson's story paragraphs (marked <!--story--> at the start) play where the lesson sits, no teaching (Hearth, 2026-10-20)
  // the narrator reads them and Colleen voices her own tagged lines; lesson.storyAt (a scene index) plays them before that scene, on her Saturday
  const mentorBeat=()=>{const L=C.lesson.sections.flatMap(s=>s.body).filter(p=>typeof p==='string'&&p.startsWith('<!--story-->'));L.forEach(p=>{say('narrator',p.replace('<!--story-->',''));pause(0.5)});if(L.length)pause(0.8)};
  const AT=CID&&C.lesson?(Number.isInteger(C.lesson.storyAt)?C.lesson.storyAt:0):-1;
  C.scenes.forEach((sc,i)=>{if(i===AT)mentorBeat();
    // short game prompts go; in course books a short question someone actually says (a data-who line) stays
    let paras=sc.text(BEST[i],AB,GB).filter(p=>!(/\?\s*$/.test(p.replace(/<[^>]+>/g,'').trim())&&p.replace(/<[^>]+>/g,'').split(/\s+/).length<14&&!(CID&&/data-who=/.test(p))&&!/<prop\b/.test(p))); // a text or note that ends in a question is story, not a prompt (2026-10-22)
    // course books: a short narrator question ending the scene's last paragraph ("What does Nadia do?") is the game's prompt, not the novel's (2026-10-20)
    if(CID&&paras.length){const k=paras.length-1,q=paras[k].match(/^([\s\S]*[.!"”])\s+([^.!?"“”<>]{3,80}\?)\s*$/);if(q&&q[2].split(/\s+/).length<14)paras=[...paras.slice(0,k),q[1]]}paras.forEach(p=>{say('narrator',p);pause(0.45)});pause(0.6);
    const b=sc.opts.find(o=>o.best);
    // course.voiceBest (The Appeal, 2026-10-22): when the best choice is a line the hero says, Story only says it in their voice first,
    // so the after answers something the listener heard
    if(CO.voiceBest&&!b.typed){const t=String(b.t).trim();if(/^["“]/.test(t)){say(CO.voiceBest,t.replace(/^["“]/,'').replace(/["”]$/,''));pause(0.6)}}
    say('narrator',b.after);pause(1.4)});
  // the novel ends on the story, not the game's ending card or readiness meter (2026-10-20)
  C.closing(FINAL,AB,GB).filter(p=>!/^(<b>)?Your ending:|readiness in this chapter ended at/.test(p.trim())).forEach(p=>{say('narrator',p);pause(0.5)});
  fs.writeFileSync(outPath,JSON.stringify({track,num:n,title:C.title,pages:{story:segs},plan:['story'],outkey:(track==='ref'?'r':'f')+n+'s',...(V2?{audio:'audio/v2'}:{}),narrator:CO&&CO.narratorVoice||undefined}));console.log('story edition');process.exit(0)}
fs.writeFileSync(outPath,JSON.stringify({track,num:n,title:C.title,pages,plan,narrator:CO&&CO.narratorVoice||undefined,...(V2?{audio:'audio/v2'}:{})}));
console.log(Object.keys(pages).length,'pages');
