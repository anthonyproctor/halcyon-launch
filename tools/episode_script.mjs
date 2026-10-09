// Builds the spoken script for a chapter episode from the game content in index.html.
import fs from 'fs';
import {segments} from './voices.mjs';

// usage: node episode_script.mjs chapters/chN.js out.json
globalThis.window={};
new Function('window',fs.readFileSync(process.argv[2],'utf8'))(globalThis.window);
const CH=globalThis.window.HALCYON[0];
const strip=s=>s.replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
const state={flags:{},score:24,m:{trust:60,conf:60,health:60}};
const N='narrator',R='ruth',out=[];
const say=(v,t)=>{segments(String(t),v).forEach(x=>out.push(x))}, pause=s=>out.push({pause:s});
const words=['one','two','three','four','five','six','seven','eight','nine','ten'];
say(N,`The Halcyon Launch. Chapter ${words[CH.num-1]}. ${CH.title}.`);pause(1.2);
CH.opening.forEach(p=>{say(N,p);pause(0.6)});pause(1.2);
CH.scenes.forEach((sc,i)=>{
  say(N,`Decision ${words[i]}. ${sc.task}.`);pause(0.7);
  sc.text(state,{}).forEach(p=>{say(N,p);pause(0.4)});
  say(N,'Your options.');pause(0.3);
  sc.opts.forEach((o,j)=>{say(N,`${'ABCD'[j]}. ${o.t}`);pause(0.4)});
  say(N,'Pause here and pick one.');pause(4);
  const b=sc.opts.findIndex(o=>o.best),o=sc.opts[b];
  say(N,`The best answer is ${'ABCD'[b]}.`);pause(0.4);say(N,o.after);pause(0.6);
  say(R,o.why);pause(0.5);
  const tempting=sc.opts.filter(x=>x.s===1)[0];
  if(tempting){say(R,`And if you picked "${strip(tempting.t)}": ${tempting.why}`);}
  pause(1.5);
});
CH.closing(state,{}).forEach(p=>{say(N,p);pause(0.6)});pause(1);
say(N,`That's the end of chapter ${words[CH.num-1]}. Play it yourself at halcyon launch dot vercel dot app.`);
fs.writeFileSync(process.argv[3],JSON.stringify(out,null,1));
console.log(out.filter(x=>x.t).length,'lines,',out.filter(x=>x.t).reduce((a,x)=>a+x.t.split(' ').length,0),'words');
