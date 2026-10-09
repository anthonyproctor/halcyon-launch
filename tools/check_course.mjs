// Validates a non-PMP course's chapter files: node tools/check_course.mjs <courseId> [chapter files...]
// Reads task codes from courses/<id>/meta.js and domain mapping from courses.js taskDomain.
import fs from 'fs';
globalThis.window={};
const id=process.argv[2];const files=process.argv.slice(3);
new Function('window',fs.readFileSync('courses.js','utf8'))(window);
const course=window.HALCYON_COURSES.find(c=>c.id===id);if(!course){console.log("unknown course "+id);process.exit(1)}
const root=course.root;
new Function('window',fs.readFileSync(root+'meta.js','utf8'))(window);
for(const f of (files.length?files:fs.readdirSync(root+'full').filter(x=>/^ch\d+\.js$/.test(x)).map(x=>root+'full/'+x))) new Function('window',fs.readFileSync(f,'utf8'))(window);
const data=window.HALCYON_DATA[id];const meta=data.meta;
const TASKS=new Set(Object.keys(meta.TASKNAMES));const DOMS=new Set(meta.DOMS);
const domOf=t=>course.taskDomain[t[0]];
const FLAGS=new Set(course.flags||[]);const WHO=new Set([...(course.speakers||[]),"man","woman"]);
const NOPT=course.options||4;
let bad=0;const err=m=>{console.log("  ERROR "+m);bad++};
const dash=t=>/[–—]/.test(t);
const TELLS=/\b(delve|tapestry|it's worth noting|in today's fast.paced)\b/i;
function lenCheck(label,texts,right){const L=texts.map(t=>t.length);const others=L.filter((_,k)=>k!==right);
  if(L[right]>1.12*Math.max(...others))err(`${label}: right answer much longer (${L.join("/")})`);
  return {longest:L[right]>Math.max(...others),shortest:L[right]<Math.min(...others)}}
for(const c of data.full){
  console.log(`${id} ch${c.num} ${c.title}`);
  for(const k of ["num","part","title","weeks","tasks","opening","lesson","scenes","quiz","closing","episode"]) if(c[k]===undefined)err("missing "+k);
  (c.tasks||[]).forEach(t=>{if(!TASKS.has(t))err("bad task "+t)});
  if((c.scenes||[]).length!==12)err(`scenes=${(c.scenes||[]).length} (want 12)`);
  let lb=0,sb=0;const G={};FLAGS.forEach(x=>G[x]=true);
  const st={flags:{},score:20,m:{trust:50,conf:50,health:50}},stHi={flags:{},score:36,m:{trust:50,conf:50,health:50}};
  let prose=[...c.opening];const domCount={};
  (c.scenes||[]).forEach((sc,i)=>{
    if(sc.id!==`f${c.num}s${i+1}`)err(`scene id ${sc.id}`);
    if(!TASKS.has(sc.task))err(`${sc.id} task ${sc.task}`); else if(domOf(sc.task)!==sc.domain)err(`${sc.id} domain ${sc.domain} vs task ${sc.task}`);
    domCount[sc.domain]=(domCount[sc.domain]||0)+1;
    if(sc.opts.length!==4)err(`${sc.id} opts`);
    const b=sc.opts.findIndex(o=>o.best);if(sc.opts.filter(o=>o.best).length!==1||sc.opts[b].s!==3)err(`${sc.id} best`);
    if(!sc.opts.some(o=>o.s===1))err(`${sc.id} needs a partial`);
    sc.opts.forEach(o=>{if(o.flag&&!FLAGS.has(o.flag))err(`${sc.id} unknown flag ${o.flag}`);if(o.flag&&o.s>1)err(`${sc.id} flag on a good option`);for(const k in o.d||{})if(Math.abs(o.d[k])>8)err(`${sc.id} delta ${k}`);prose.push(o.t,o.after,o.why)});
    const r=lenCheck(sc.id,sc.opts.map(o=>o.t),b);if(r.longest)lb++;if(r.shortest)sb++;
    try{prose.push(...sc.text(st,{},G),...sc.text(st,{},{}))}catch(e){err(`${sc.id} text() threw ${e.message}`)}
  });
  if(lb>4)err(`best answer longest in ${lb}/12`); if(lb<1)err(`best answer never longest`); if(sb<2)err(`best answer shortest in only ${sb}/12`);if(sb>4)err(`best answer shortest in ${sb}/12 (reverse tell)`);
  const q=c.quiz||[];if(q.length!==15)err(`quiz=${q.length} (want 15)`);
  const pos=[0,0,0,0];let ql=0,qs=0;const lv={RE:0,AP:0,AN:0};const qd={};
  q.forEach((x,i)=>{if(x.opts.length!==NOPT||x.a<0||x.a>=NOPT)err(`quiz ${i}`);pos[x.a]++;if(!TASKS.has(x.task))err(`quiz ${i} task ${x.task}`);else if(domOf(x.task)!==x.domain)err(`quiz ${i} domain`);
    if(course.levels&&!lv.hasOwnProperty(x.level))err(`quiz ${i} level`);else lv[x.level]++;qd[x.domain]=(qd[x.domain]||0)+1;
    const r=lenCheck(`quiz ${i}`,x.opts,x.a);if(r.longest)ql++;if(r.shortest)qs++;prose.push(x.q,...x.opts,x.why)});
  if(Math.max(...pos)>6)err(`quiz answer positions ${pos}`); if(ql>5)err(`quiz right answer longest in ${ql}/15`);if(qs>6)err(`quiz right answer shortest in ${qs}/15`);
  const offDom=Object.keys(qd).filter(d=>!domCount[d]).reduce((a,d)=>a+qd[d],0);if(meta.DOMS.some(d=>!domCount[d])&&offDom<2)err(`spaced review: only ${offDom} quiz items from domains not in this chapter`);
  (c.drills||[]).forEach((d,i)=>{if(!d.fields||!d.fields.every(f=>typeof f.answer==="number"))err(`drill ${i} fields`);if(!(c.scenes||[]).some(s=>s.id===d.after))err(`drill ${i} after`);prose.push(...d.setup,...d.solution)});
  if(c.exercise){const e=c.exercise;if(!(c.scenes||[]).some(s=>s.id===e.after))err("exercise after");e.items.forEach((it,i)=>{if(it.answer<0||it.answer>=it.choices.length)err(`exercise ${i}`);prose.push(it.prompt,it.why)})}
  const L=c.lesson||{};(L.sections||[]).forEach(s=>prose.push(...s.body,s.exam||""));
  const lw=(L.sections||[]).reduce((a,s)=>a+s.body.join(" ").replace(/<[^>]+>/g,"").split(/\s+/).length,0);if(lw<600)err(`lesson only ${lw} words`);
  try{prose.push(...c.closing(st,{},{}),...c.closing(stHi,{},G))}catch(e){err("closing threw "+e.message)}
  const all=prose.join("\n");if(dash(all))err("contains em/en dash");const tm=all.match(TELLS);if(tm)err("AI tell: "+tm[0]);
  if(WHO.size>2){const spans=all.match(/<span class="said"[^>]*>/g)||[];spans.forEach(t=>{const m=t.match(/data-who="([^"]+)"/);if(!m)err("untagged quote");else if(!WHO.has(m[1]))err("unknown speaker "+m[1])})}
  const words=all.replace(/<[^>]+>/g,"").split(/\s+/).length;
  console.log(`  scenes ${JSON.stringify(domCount)}, best longest ${lb}, shortest ${sb}, quiz pos ${pos}, quiz right longest ${ql} shortest ${qs}, levels ${JSON.stringify(lv)}, quiz domains ${JSON.stringify(qd)}, drills ${(c.drills||[]).length}, exercise ${c.exercise?c.exercise.items.length:0}, lesson ${lw}w, total ${words}w`);
  if(process.env.DUMP)fs.writeFileSync(process.env.DUMP,all.replace(/<[^>]+>/g,""));
}
process.exit(bad?1:0);
