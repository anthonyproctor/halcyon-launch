// Validates Full Course chapter files and mock exam files.
import fs from 'fs';
globalThis.window={};
const files=process.argv.slice(2);
for(const f of files) new Function('window',fs.readFileSync(f,'utf8'))(globalThis.window);
const TASKS=new Set(["P1","P2","P3","P4","P5","P6","P7","P8","R1","R2","R3","R4","R5","R6","R7","R8","R9","R10","B1","B2","B3","B4","B5","B6","B7","B8"]);
const DOM={P:"People",R:"Process",B:"Business Environment"};
const FLAGS=new Set(["allhands","nocharter","blamedtheo","hidnumbers","publicfight","hiddefect","skippedtest","cutcorners"]);
let bad=0;const err=(m)=>{console.log("  ERROR "+m);bad++};
const dash=t=>/[–—]/.test(t);
function lenCheck(label,texts,right){const L=texts.map(t=>t.length);const others=L.filter((_,k)=>k!==right);
  if(L[right]>1.12*Math.max(...others))err(`${label}: right answer much longer (${L.join("/")})`);
  return {longest:L[right]>Math.max(...others),shortest:L[right]<Math.min(...others)}}
for(const c of (window.HALCYON_FULL||[])){
  console.log(`full ch${c.num} ${c.title}`);
  for(const k of ["num","part","title","weeks","tasks","opening","lesson","scenes","quiz","closing","episode"]) if(c[k]===undefined)err("missing "+k);
  (c.tasks||[]).forEach(t=>{if(!TASKS.has(t))err("bad task "+t)});
  if((c.scenes||[]).length!==12)err(`scenes=${(c.scenes||[]).length} (want 12)`);
  let lb=0,sb=0;const G={};FLAGS.forEach(x=>G[x]=true);
  const st={flags:{},score:20,m:{trust:50,conf:50,health:50}};
  let prose=[...c.opening];
  (c.scenes||[]).forEach((sc,i)=>{
    if(sc.id!==`f${c.num}s${i+1}`)err(`scene id ${sc.id}`);
    if(!TASKS.has(sc.task))err(`${sc.id} task ${sc.task}`); else if(DOM[sc.task[0]]!==sc.domain)err(`${sc.id} domain ${sc.domain} vs task ${sc.task}`);
    if(sc.opts.length!==4)err(`${sc.id} opts`);
    const b=sc.opts.findIndex(o=>o.best);if(sc.opts.filter(o=>o.best).length!==1||sc.opts[b].s!==3)err(`${sc.id} best`);
    if(!sc.opts.some(o=>o.s===1))err(`${sc.id} needs a partial`);
    sc.opts.forEach(o=>{if(o.flag&&!FLAGS.has(o.flag))err(`${sc.id} unknown flag ${o.flag}`);prose.push(o.t,o.after,o.why)});
    const r=lenCheck(sc.id,sc.opts.map(o=>o.t),b);if(r.longest)lb++;if(r.shortest)sb++;
    try{prose.push(...sc.text(st,{},G),...sc.text(st,{},{}))}catch(e){err(`${sc.id} text() threw ${e.message}`)}
  });
  if(lb>4)err(`best answer longest in ${lb}/12`); if(lb<1)err(`best answer never longest`); if(sb<2)err(`best answer shortest in only ${sb}/12`);if(sb>4)err(`best answer shortest in ${sb}/12 (reverse tell)`);
  const q=c.quiz||[];if(q.length!==15)err(`quiz=${q.length} (want 15)`);
  const pos=[0,0,0,0];let ql=0;
  q.forEach((x,i)=>{if(x.opts.length!==4||x.a<0||x.a>3)err(`quiz ${i}`);pos[x.a]++;if(!TASKS.has(x.task))err(`quiz ${i} task`);else if(DOM[x.task[0]]!==x.domain)err(`quiz ${i} domain`);
    if(lenCheck(`quiz ${i}`,x.opts,x.a).longest)ql++;prose.push(x.q,...x.opts,x.why)});
  if(Math.max(...pos)>6)err(`quiz answer positions ${pos}`); if(ql>5)err(`quiz right answer longest in ${ql}/15`);
  (c.drills||[]).forEach((d,i)=>{if(!d.fields||!d.fields.every(f=>typeof f.answer==="number"))err(`drill ${i} fields`);if(!(c.scenes||[]).some(s=>s.id===d.after))err(`drill ${i} after`);prose.push(...d.setup,...d.solution)});
  if(c.exercise){const e=c.exercise;if(!(c.scenes||[]).some(s=>s.id===e.after))err("exercise after");e.items.forEach((it,i)=>{if(it.answer<0||it.answer>=it.choices.length)err(`exercise ${i}`);prose.push(it.prompt,it.why)})}
  const L=c.lesson||{};(L.sections||[]).forEach(s=>prose.push(...s.body,s.exam||""));
  const lw=(L.sections||[]).reduce((a,s)=>a+s.body.join(" ").split(/\s+/).length,0);if(lw<600)err(`lesson only ${lw} words`);
  try{prose.push(...c.closing(st,{},{}),...c.closing(st,{},G))}catch(e){err("closing threw")}
  const all=prose.join("\n");if(dash(all))err("contains em/en dash");
  const words=all.split(/\s+/).length;
  console.log(`  ok-ish: scenes ${(c.scenes||[]).length}, best longest ${lb}, shortest ${sb}, quiz pos ${pos}, drills ${(c.drills||[]).length}, exercise ${c.exercise?c.exercise.items.length:0}, lesson ${lw}w, total ${words}w`);
  if(process.env.DUMP)fs.writeFileSync(process.env.DUMP,all.replace(/<[^>]+>/g,""));
}
for(const m of (window.HALCYON_MOCK||[])){
  console.log(`mock part ${m.part}: ${m.questions.length} questions`);
  const pos=[0,0,0,0];let ql=0;const prose=[];
  m.questions.forEach((x,i)=>{if(x.opts.length!==4||x.a<0||x.a>3)err(`q${i}`);pos[x.a]++;if(!TASKS.has(x.task))err(`q${i} task ${x.task}`);else if(DOM[x.task[0]]!==x.domain)err(`q${i} domain`);if(lenCheck(`q${i}`,x.opts,x.a).longest)ql++;prose.push(x.q,...x.opts,x.why)});
  if(Math.max(...pos)>Math.ceil(m.questions.length*0.32))err(`answer positions ${pos}`);if(ql>m.questions.length*0.33)err(`right answer longest in ${ql}`);
  if(dash(prose.join(" ")))err("dash");
  console.log(`  positions ${pos}, right-longest ${ql}`);
  if(process.env.DUMP)fs.writeFileSync(process.env.DUMP,prose.join("\n"));
}
process.exit(bad?1:0);
