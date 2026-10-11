// Build per-page narration scripts for a chapter. Page ids match what the engine shows.
// usage: node tools/pages.mjs ref|full N out.json [--story] [--course <id>]   (no --course = the PMP course)
import fs from 'fs';
import {segments} from './voices.mjs';
const A=process.argv.slice(2);const [track,nArg,outPath]=A;const n=+nArg;const STORY=A.includes('--story');const CID=A.includes('--course')?A[A.indexOf('--course')+1]:null;
globalThis.window={};
let C,CO={};
if(CID){new Function('window',fs.readFileSync('courses.js','utf8'))(globalThis.window);CO=window.HALCYON_COURSES.find(c=>c.id===CID);
  new Function('window',fs.readFileSync(`courses/${CID}/full/ch${String(n).padStart(2,'0')}.js`,'utf8'))(globalThis.window);C=window.HALCYON_DATA[CID][track].find(c=>c.num===n)}
else{const file=track==='ref'?`chapters/ch${n}.js`:`full/ch${String(n).padStart(2,'0')}.js`;
new Function('window',fs.readFileSync(file,'utf8'))(globalThis.window);
C=(track==='ref'?window.HALCYON:window.HALCYON_FULL)[0];}
const MV=CID?CO.mentor:'ruth'; // mentor's voice
// must match engine.js order(): balanced placement from order.js
new Function('window',fs.readFileSync('order.js','utf8'))(globalThis.window);
globalThis.window.HalcyonOrder.build([{key:(track==='ref'?'ref':'full')+C.num+'dec',items:C.scenes.map(sc=>({id:sc.id,n:sc.opts.length,correct:sc.opts.findIndex(o=>o.best)}))}]);
const order=(id,len)=>globalThis.window.HalcyonOrder.get(id,len);
const RUTH_LEADS=CO.leads||{3:["That's the move.","Good. That's what I'd want from a flight director.","Exactly right."],1:["Close, but not quite.","Defensible. Not the best answer.","You're in the neighborhood."],0:["That one's going to cost you.","I'd have stopped you there.","Let's talk about that one."]};
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
if(C.lesson){const {segs,say,pause}=mk();say(MV,CID?`${C.lesson.title}.`:`Ruth's whiteboard. ${C.lesson.title}.`);pause(0.6);C.lesson.sections.forEach(s=>{say(MV,s.h+'.');pause(0.3);s.body.forEach(p=>{say(MV,p);pause(0.35)});if(s.exam){say(MV,'How the exam asks it. '+s.exam);pause(0.5)}});pages.lesson=segs}
// scenes and outcomes
C.scenes.forEach((sc,i)=>{
  {const {segs,say,pause}=mk();say('narrator',`Decision ${W[i+1]}. ${sc.title||sc.task}.`);pause(0.5);sc.text(BEST[i],{},{}).forEach(p=>{say('narrator',p);pause(0.35)});
   say('narrator','Your options.');pause(0.25);order(sc.id,sc.opts.length).forEach((j,pos)=>{say('narrator',`${'ABCD'[pos]}. ${sc.opts[j].t}`);pause(0.3)});pages['s'+i]=segs}
  sc.opts.forEach((o,j)=>{const {segs,say,pause}=mk();say('narrator',o.after);pause(0.5);say(MV,RUTH_LEADS[o.s][i%3]+' '+o.why);
    if(!o.best){const b=sc.opts.find(x=>x.best);pause(0.3);say(MV,'The best answer: '+b.t+' '+b.why)}pages[`o${i}_${j}`]=segs});
});
// closing
{const {segs,say,pause}=mk();C.closing(FINAL,{},{}).forEach(p=>{say('narrator',p);pause(0.5)});pages.end=segs}
// alternates: same page as a middling run would see it, when the wording differs
C.scenes.forEach((sc,i)=>{if(!same(sc.text(BEST[i],{},{}),sc.text(st,{},{}))){const {segs,say,pause}=mk();say('narrator',`Decision ${W[i+1]}. ${sc.title||sc.task}.`);pause(0.5);sc.text(st,{},{}).forEach(p=>{say('narrator',p);pause(0.35)});
  say('narrator','Your options.');pause(0.25);order(sc.id,sc.opts.length).forEach((j,pos)=>{say('narrator',`${'ABCD'[pos]}. ${sc.opts[j].t}`);pause(0.3)});pages['s'+i+'_alt']=segs}});
if(!same(C.closing(FINAL,{},{}),C.closing(st,{},{}))){const {segs,say,pause}=mk();C.closing(st,{},{}).forEach(p=>{say('narrator',p);pause(0.5)});pages.end_alt=segs}
// whole-episode plan: page ids in order, with the best outcome after each decision
const plan=['open',...(C.lesson?['lesson']:[]),...C.scenes.flatMap((sc,i)=>['s'+i,`o${i}_${sc.opts.findIndex(o=>o.best)}`]),'end'];
if(STORY){ // novel edition: story only, best path, no options, no lesson, no debriefs
  const {segs,say,pause}=mk();say('narrator',`Chapter ${W[C.num]}. ${C.title}.`);pause(1);C.opening.forEach(p=>{say('narrator',p);pause(0.5)});pause(1.2);
  C.scenes.forEach((sc,i)=>{const paras=sc.text(BEST[i],{},{}).filter(p=>!(/\?\s*$/.test(p.replace(/<[^>]+>/g,'').trim())&&p.replace(/<[^>]+>/g,'').split(/\s+/).length<14));paras.forEach(p=>{say('narrator',p);pause(0.45)});pause(0.6);
    const b=sc.opts.find(o=>o.best);say('narrator',b.after);pause(1.4)});
  C.closing(FINAL,{},{}).forEach(p=>{say('narrator',p);pause(0.5)});
  fs.writeFileSync(outPath,JSON.stringify({track,num:n,title:C.title,pages:{story:segs},plan:['story'],outkey:(track==='ref'?'r':'f')+n+'s'}));console.log('story edition');process.exit(0)}
fs.writeFileSync(outPath,JSON.stringify({track,num:n,title:C.title,pages,plan}));
console.log(Object.keys(pages).length,'pages');
