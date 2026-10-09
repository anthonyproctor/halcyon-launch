// Spoken script for a Full Course chapter: opening, Ruth's whiteboard, decisions (pause, best answer, debrief), closing.
// usage: node tools/episode_full.mjs full/chNN.js out.json
import fs from 'fs';
globalThis.window={};
new Function('window',fs.readFileSync(process.argv[2],'utf8'))(globalThis.window);
const C=globalThis.window.HALCYON_FULL[0];
const strip=s=>String(s).replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
const st={flags:{},score:24,m:{trust:60,conf:60,health:60}},N='narrator',R='ruth',out=[];
const say=(v,t)=>{t=strip(t);if(t)out.push({v,t})},pause=s=>out.push({pause:s});
const W=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen'];
say(N,`The Halcyon Launch, the full course. ${C.part}. Chapter ${W[C.num]}. ${C.title}.`);pause(1.2);
C.opening.forEach(p=>{say(N,p);pause(0.6)});pause(1);
say(N,`Ruth's whiteboard. ${C.lesson.title}.`);pause(0.6);
C.lesson.sections.forEach(s=>{say(R,s.h+'.');pause(0.3);s.body.forEach(p=>{say(R,p);pause(0.4)});if(s.exam){say(R,'How the exam asks it. '+s.exam);pause(0.6)}});
pause(1.2);
C.scenes.forEach((sc,i)=>{
  say(N,`Decision ${W[i+1]}. ${sc.title||''}.`);pause(0.6);
  sc.text(st,{},{}).forEach(p=>{say(N,p);pause(0.4)});
  say(N,'Your options.');pause(0.3);
  sc.opts.forEach((o,j)=>{say(N,`${'ABCD'[j]}. ${o.t}`);pause(0.4)});
  say(N,'Pause here and pick one.');pause(4);
  const b=sc.opts.findIndex(o=>o.best),o=sc.opts[b];
  say(N,`The best answer is ${'ABCD'[b]}.`);pause(0.4);say(N,o.after);pause(0.6);say(R,o.why);pause(1.4);
});
C.closing(st,{},{}).forEach(p=>{say(N,p);pause(0.6)});pause(1);
say(N,`That's the end of chapter ${W[C.num]}. The drills and the quiz are waiting in the app.`);
fs.writeFileSync(process.argv[3],JSON.stringify(out));
console.log(out.filter(x=>x.t).reduce((a,x)=>a+x.t.split(' ').length,0),'words');
