// Checks full/v2/recaps.js (the "Story so far" recaps) against the live v2 chapters, and fuzzes every recap function.
// Usage: node tools/check_recaps.mjs [runs per chapter, default 4000]. Exit 1 on any error. DUMP=path writes every distinct recap string (for ai_detect).
// What it checks: every engine page id (PIDS in engine.js) exists for every chapter, and no extras; 12 call lines of 4 options each;
// who ids and notes are valid; people lines are keyed to real pages; and, across random flag/pick/earlier-chapter combinations like the
// QA branch fuzz, previously() and recap() never throw and never return undefined, null, NaN, empty strings, or em/en dashes.
// It also reports (as warnings) pages whose full recap falls outside 4 to 6 sentences or whose short recap runs past 2 with every pick made.
import fs from 'fs';
globalThis.window={};
const load=f=>new Function('window',fs.readFileSync(f,'utf8'))(globalThis.window);
const pv={};new Function('window',fs.readFileSync('full/v2/preview.js','utf8'))(pv);
for(const f of pv.HALCYON_V2.files) load('full/v2/'+f);
load('full/v2/recaps.js');
const R=window.HALCYON_RECAPS, CH=window.HALCYON_FULL, CAST=new Set((window.HALCYON_CAST||[]).map(c=>c.id));
const FLAGS=pv.HALCYON_V2.course.flags;
const PIDS=c=>["open",...(c.lesson?["lesson"]:[]),...c.scenes.map((_,i)=>"s"+i),"end"];   // same as engine.js
const RUNS=+process.argv[2]||4000;
let bad=0, warn=0; const err=m=>{if(bad<60)console.log('  ERROR '+m);bad++}, w=m=>{console.log('  warn '+m);warn++};
const seen=new Set();
const okStr=(t,where)=>{if(typeof t!=='string'||!t.trim())return err(`${where}: empty or not a string (${JSON.stringify(t)})`);
  if(/undefined|null|NaN|\[object/.test(t))err(`${where}: contains undefined/null/NaN: ${t.slice(0,90)}`);
  if(/[–—]| - /.test(t))err(`${where}: dash: ${t.slice(0,90)}`);
  if(/<[a-z]/i.test(t))err(`${where}: html in recap: ${t.slice(0,90)}`);
  seen.add(t)};
const sentences=a=>a.join(' ').split(/(?<=[.?!]["”]?)\s+(?=[A-Z"“])/).filter(x=>x.trim()).length;
const rnd=n=>Math.floor(Math.random()*n);
// people table
for(const [id,p] of Object.entries(R.people)){if(!p.name)err(`people ${id} has no name`);
  for(const [n,pid,line] of p.lines){if(!R.ch[n]||!R.pids.includes(pid))err(`people ${id} keyed to ${n} ${pid}`);okStr(line,`people ${id}`)}
  if(!CAST.has(id))w(`people ${id} isn't a cast.js id (fine if intended)`)}
for(const c of CH){
  const n=c.num, rc=R.ch[n]; if(!rc){err(`chapter ${n} missing`);continue}
  const pids=PIDS(c), have=Object.keys(rc.pages);
  pids.forEach(p=>{if(!rc.pages[p])err(`ch${n} missing page ${p}`)}); have.forEach(p=>{if(!pids.includes(p))err(`ch${n} extra page ${p}`)});
  if(n===1){if(!Array.isArray(rc.before)||rc.before.length<3)err('ch1 before');rc.before.forEach(t=>okStr(t,'ch1 before'))}
  else if(typeof rc.previously!=='function')err(`ch${n} previously isn't a function`);
  if(!Array.isArray(rc.calls)||rc.calls.length!==c.scenes.length)err(`ch${n} calls length`);
  (rc.calls||[]).forEach((row,i)=>{if(row.length!==c.scenes[i].opts.length)err(`ch${n} calls[${i}] has ${row.length}`);row.forEach((t,j)=>okStr(t,`ch${n} call ${i}.${j}`))});
  for(const [p,nt] of Object.entries(rc.notes||{})){if(!pids.includes(p))err(`ch${n} note on ${p}`);okStr(nt.title,`ch${n} note title`);nt.text.forEach(t=>okStr(t,`ch${n} note ${p}`))}
  if(rc.notes&&n>3)err(`ch${n} has orientation notes (chapters 1 to 3 only)`);
  pids.forEach(p=>{const pg=rc.pages[p];if(!pg)return;if(!/^\d{4}-\d\d-\d\d$/.test(typeof pg.d==='function'?pg.d({flags:{},picks:{}},{},{}):pg.d))err(`ch${n} ${p} date`);
    (pg.who||[]).forEach(id=>{if(!R.people[id])err(`ch${n} ${p} who ${id} unknown`)});if(!(pg.who||[]).length)err(`ch${n} ${p} has nobody in who`)});
  // fuzz
  const sizes={};
  for(let r=0;r<RUNS;r++){
    const G0={};FLAGS.forEach(f=>{if(Math.random()<(r%4===0?0:r%4===1?1:0.4))G0[f]=true});
    const all={};const noBook=r%7===0;
    if(!noBook)for(let k=1;k<n;k++){const pk={};CH.find(x=>x.num===k).scenes.forEach((_,i)=>{if(Math.random()<0.95)pk[i]=rnd(4)});all[k]={picks:pk,flags:{}}}
    const pk={}, fl={}; const depth=r%5===0?rnd(13):12;
    c.scenes.forEach((sc,i)=>{if(i<depth&&Math.random()<(r%11===0?0.6:1)){pk[i]=r%9===0?sc.opts.findIndex(o=>o.best):rnd(sc.opts.length);const o=sc.opts[pk[i]];if(o.flag)fl[o.flag]=true}});
    const s={picks:pk,flags:fl,score:rnd(37),m:{trust:50,conf:50,health:50}}, G={...G0,...fl};
    try{const pr=R.previously(n,s,all,G);if(!pr.length)err(`ch${n} previously empty`);pr.forEach(t=>okStr(t,`ch${n} previously`));
      if(r%50===0){const k=sentences(pr);if(n>1&&(k<4||k>6))(sizes[`previously`]=sizes[`previously`]||new Set()).add(k)}}
    catch(e){err(`ch${n} previously threw ${e.message}`)}
    for(const p of pids){
      try{const x=R.recap(n,p,s,all,G);if(!x){err(`ch${n} ${p} null`);continue}
        okStr(x.here,`ch${n} ${p} here`);if(!x.short.length)err(`ch${n} ${p} short empty`);if(x.full.length<2)err(`ch${n} ${p} full has ${x.full.length}`);
        x.short.forEach(t=>okStr(t,`ch${n} ${p} short`));x.full.forEach(t=>okStr(t,`ch${n} ${p} full`));
        x.who.forEach(o=>{okStr(o.name,`ch${n} ${p} who name`);okStr(o.line,`ch${n} ${p} who ${o.id}`)});
        if(depth===12&&Object.keys(pk).length===12&&p!=='open'){const k=sentences(x.full),q=sentences(x.short);
          if(k<4||k>6)(sizes[p]=sizes[p]||new Set()).add(k);if(q>2)(sizes[p+' short']=sizes[p+' short']||new Set()).add(q)}}
      catch(e){err(`ch${n} ${p} threw ${e.message}`)}}
  }
  for(const [k,v] of Object.entries(sizes))w(`ch${n} ${k}: ${[...v].sort().join('/')} sentences`);
  console.log(`ch${n}: ${pids.length} pages, ${RUNS} runs`);
}
// ch15 endings: every ending reachable from the recaps' copy of the logic (smoke test against ch15's own closing names)
const c15=CH.find(x=>x.num===15);
const ENDS={clean:{r_reopened:1,r_testarticle:1,r_reserve:1},eyes:{r_reopened:1,r_reserve:1},cargo:{r_autonomy:1},petrel:{buriedar:1,hidnumbers:1}};
for(const [name,G] of Object.entries(ENDS))for(const p5 of [0,1]){const s={picks:{0:1,5:p5},flags:{},score:30,m:{trust:60,conf:60,health:60}},all={1:{picks:{0:1}}};
  const close=c15.closing(s,all,G).join(' '), want={clean:'Clean Burn',eyes:'Eyes Open',cargo:'Cargo Only',petrel:'Petrel'}[name];
  if(!close.includes(`Your ending: ${want}`))err(`ch15 closing for ${name} doesn't say ${want}`);
  const r7=R.recap(15,'s7',s,all,G).short.join(' ');
  const hold=name==='petrel'&&p5===0;if(hold!==/held/.test(r7))err(`ch15 s7 recap hold/flew mismatch for ${name} p5=${p5}: ${r7}`)}
if(process.env.DUMP)fs.writeFileSync(process.env.DUMP,[...seen].join('\n'));
console.log(`${bad?`FAIL: ${bad} errors`:'OK: no errors'}, ${warn} warnings, ${seen.size} distinct strings`);
process.exit(bad?1:0);
