// Build per-page narration scripts for a chapter. Page ids match what the engine shows.
// usage: node tools/pages.mjs ref|full N out.json
import fs from 'fs';
import {segments} from './voices.mjs';
const [track,nArg,outPath,mode]=process.argv.slice(2);const n=+nArg;const STORY=mode==='--story';
globalThis.window={};
const file=track==='ref'?`chapters/ch${n}.js`:`full/ch${String(n).padStart(2,'0')}.js`;
new Function('window',fs.readFileSync(file,'utf8'))(globalThis.window);
const C=(track==='ref'?window.HALCYON:window.HALCYON_FULL)[0];
// must match engine.js order(): balanced placement from order.js
new Function('window',fs.readFileSync('order.js','utf8'))(globalThis.window);
globalThis.window.HalcyonOrder.build([{key:(track==='ref'?'ref':'full')+C.num+'dec',items:C.scenes.map(sc=>({id:sc.id,n:sc.opts.length,correct:sc.opts.findIndex(o=>o.best)}))}]);
const order=(id,len)=>globalThis.window.HalcyonOrder.get(id,len);
const RUTH_LEADS={3:["That's the move.","Good. That's what I'd want from a flight director.","Exactly right."],1:["Close, but not quite.","Defensible. Not the best answer.","You're in the neighborhood."],0:["That one's going to cost you.","I'd have stopped you there.","Let's talk about that one."]};
const W=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen'];
const st={flags:{},score:24,m:{trust:60,conf:60,health:60}};
const pages={};
const mk=()=>{const segs=[];const say=(v,t)=>segments(String(t),v).forEach(x=>segs.push(x));const pause=s=>segs.push({pause:s});return {segs,say,pause}};
// opening
{const {segs,say,pause}=mk();say('narrator',`Chapter ${W[C.num]}. ${C.title}.`);pause(0.8);C.opening.forEach(p=>{say('narrator',p);pause(0.5)});pages.open=segs}
// lesson (full only)
if(C.lesson){const {segs,say,pause}=mk();say('ruth',`Ruth's whiteboard. ${C.lesson.title}.`);pause(0.6);C.lesson.sections.forEach(s=>{say('ruth',s.h+'.');pause(0.3);s.body.forEach(p=>{say('ruth',p);pause(0.35)});if(s.exam){say('ruth','How the exam asks it. '+s.exam);pause(0.5)}});pages.lesson=segs}
// scenes and outcomes
C.scenes.forEach((sc,i)=>{
  {const {segs,say,pause}=mk();say('narrator',`Decision ${W[i+1]}. ${sc.title||sc.task}.`);pause(0.5);sc.text(st,{},{}).forEach(p=>{say('narrator',p);pause(0.35)});
   say('narrator','Your options.');pause(0.25);order(sc.id,sc.opts.length).forEach((j,pos)=>{say('narrator',`${'ABCD'[pos]}. ${sc.opts[j].t}`);pause(0.3)});pages['s'+i]=segs}
  sc.opts.forEach((o,j)=>{const {segs,say,pause}=mk();say('narrator',o.after);pause(0.5);say('ruth',RUTH_LEADS[o.s][i%3]+' '+o.why);
    if(!o.best){const b=sc.opts.find(x=>x.best);pause(0.3);say('ruth','The best answer: '+b.t+' '+b.why)}pages[`o${i}_${j}`]=segs});
});
// closing
{const {segs,say,pause}=mk();C.closing(st,{},{}).forEach(p=>{say('narrator',p);pause(0.5)});pages.end=segs}
// whole-episode plan: page ids in order, with the best outcome after each decision
const plan=['open',...(C.lesson?['lesson']:[]),...C.scenes.flatMap((sc,i)=>['s'+i,`o${i}_${sc.opts.findIndex(o=>o.best)}`]),'end'];
if(STORY){ // novel edition: story only, best path, no options, no lesson, no debriefs
  const {segs,say,pause}=mk();say('narrator',`Chapter ${W[C.num]}. ${C.title}.`);pause(1);C.opening.forEach(p=>{say('narrator',p);pause(0.5)});pause(1.2);
  C.scenes.forEach(sc=>{const paras=sc.text(st,{},{}).filter(p=>!(/\?\s*$/.test(p.replace(/<[^>]+>/g,'').trim())&&p.replace(/<[^>]+>/g,'').split(/\s+/).length<14));paras.forEach(p=>{say('narrator',p);pause(0.45)});pause(0.6);
    const b=sc.opts.find(o=>o.best);say('narrator',b.after);pause(1.4)});
  C.closing(st,{},{}).forEach(p=>{say('narrator',p);pause(0.5)});
  fs.writeFileSync(outPath,JSON.stringify({track,num:n,title:C.title,pages:{story:segs},plan:['story'],outkey:(track==='ref'?'r':'f')+n+'s'}));console.log('story edition');process.exit(0)}
fs.writeFileSync(outPath,JSON.stringify({track,num:n,title:C.title,pages,plan}));
console.log(Object.keys(pages).length,'pages');
