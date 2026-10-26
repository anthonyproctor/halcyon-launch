// Validates PMP Full Course chapter files and mock exam files against the live v2 book (The Halcyon Launch v2, live 2026-10-11):
// the v2 flags, speakers, approach tags, case clusters, and vlog attributes from tools/v2meta.mjs. The v1 book is gone (git history only).
// No arguments: every live chapter listed in full/v2/preview.js plus the mock exam. --v2 is accepted and ignored (it was the preview switch).
import fs from 'fs';
globalThis.window={};
let files=process.argv.slice(2).filter(a=>a!=="--v2");
if(!files.length){const w={};new Function('window',fs.readFileSync('full/v2/preview.js','utf8'))(w);files=[...(w.HALCYON_V2.files||[]).filter(f=>/^ch\d+\.js$/.test(f)).map(f=>'full/v2/'+f),'mock/people.js','mock/process.js','mock/business.js',...['mock/form2_people.js','mock/form2_process.js','mock/form2_business.js'].filter(f=>fs.existsSync(f))]}
const V2=true;
const V2M=await import('./v2meta.mjs');
for(const f of files) new Function('window',fs.readFileSync(f,'utf8'))(globalThis.window);
const TASKS=new Set(["P1","P2","P3","P4","P5","P6","P7","P8","R1","R2","R3","R4","R5","R6","R7","R8","R9","R10","B1","B2","B3","B4","B5","B6","B7","B8"]);
const DOM={P:"People",R:"Process",B:"Business Environment"};
const FLAGS=V2M.V2_FLAGS;
let bad=0;const err=(m)=>{console.log("  ERROR "+m);bad++};
const dash=t=>/[–—]/.test(t);
// an item's fig:"<prop ...></prop>" (engine.js figHTML/figChart): a prop the engine can draw, with the attributes its kind needs
function figCheck(label,f){const m=/^<prop\s+((?:[^>"]|"[^"]*")*)>([\s\S]*)<\/prop>$/.exec(f||"");if(!m)return err(`${label} fig is not one <prop>`);const a={};m[1].replace(/(\w+)="([^"]*)"/g,(_,k,v)=>a[k]=v);
  const nums=k=>(a[k]||"").split(",").filter(x=>x.trim()!=="").map(Number),bad=k=>!a[k]||nums(k).some(isNaN);if(!a.title)err(`${label} fig needs a title`);
  if(a.type==="doc")return;if(a.type!=="chart")return err(`${label} fig type ${a.type}`);const n=(a.labels||"").split(",").length;
  if(a.kind==="cfd"){const S=Object.keys(a).filter(k=>!["type","kind","title","labels","say"].includes(k));if(!a.labels||!S.length)err(`${label} cfd needs labels and states`);S.forEach(k=>{if(bad(k)||nums(k).length!==n)err(`${label} cfd ${k} needs ${n} numbers`)})}
  else if(a.kind==="control"){for(const k of ["values","mean","ucl","lcl"])if(bad(k))err(`${label} control needs ${k}`);if(+a.lcl>=+a.mean||+a.mean>=+a.ucl)err(`${label} control wants lcl < mean < ucl`)}
  else if(a.kind==="network"){const ids=new Set((a.nodes||"").split(",").map(s=>s.split(":")[0].trim()).filter(Boolean));if(!ids.size)err(`${label} network needs nodes`);(a.edges||"").split(",").forEach(e=>{const [x,y]=e.split(">").map(s=>(s||"").trim());if(!ids.has(x)||!ids.has(y))err(`${label} network edge ${e}`)})}
  else if(a.kind==="evm"){for(const k of ["pv","ev","ac"])if(bad(k))err(`${label} evm needs ${k}`)}
  else if(a.kind)err(`${label} unknown chart kind ${a.kind}`);else if(bad("values")||nums("values").length!==n)err(`${label} bar chart needs labels and values of one length`)}
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
    sc.opts.forEach(o=>{if(o.flag&&!FLAGS.has(o.flag))err(`${sc.id} unknown flag ${o.flag}`);if(V2&&o.flag)if(/^r_/.test(o.flag)?!o.best:o.s>1)err(`${sc.id} flag ${o.flag} on the wrong kind of option`);prose.push(o.t,o.after,o.why)});
    if(V2&&!V2M.APPROACHES.has(sc.approach))err(`${sc.id} approach ${sc.approach}`);
    const r=lenCheck(sc.id,sc.opts.map(o=>o.t),b);if(r.longest)lb++;if(r.shortest)sb++;
    try{prose.push(...sc.text(st,{},G),...sc.text(st,{},{}))}catch(e){err(`${sc.id} text() threw ${e.message}`)}
  });
  if(lb>4)err(`best answer longest in ${lb}/12`); if(lb<1)err(`best answer never longest`); if(sb<2)err(`best answer shortest in only ${sb}/12`);if(sb>4)err(`best answer shortest in ${sb}/12 (reverse tell)`);
  const q=c.quiz||[];if(q.length!==15)err(`quiz=${q.length} (want 15)`);
  const pos=[0,0,0,0];let ql=0;
  q.forEach((x,i)=>{if(x.opts.length!==4||x.a<0||x.a>3)err(`quiz ${i}`);pos[x.a]++;if(!TASKS.has(x.task))err(`quiz ${i} task`);else if(DOM[x.task[0]]!==x.domain)err(`quiz ${i} domain`);
    if(lenCheck(`quiz ${i}`,x.opts,x.a).longest)ql++;prose.push(x.q,...x.opts,x.why);if(x.fig!==undefined){figCheck(`quiz ${i}`,x.fig);prose.push(x.fig)}
    if(V2&&!V2M.APPROACHES.has(x.approach))err(`quiz ${i} approach ${x.approach}`);if(x.case!==undefined&&!(c.cases||[]).some(k=>k.id===x.case))err(`quiz ${i} unknown case ${x.case}`)});
  (c.cases||[]).forEach((k,i)=>{if(!k.id||!k.title||!Array.isArray(k.text)||!k.text.length)err(`case ${i} needs id, title, text[]`);if(!q.some(x=>x.case===k.id))err(`case ${k.id} has no quiz items`);prose.push(k.title||"",...(k.text||[]))});
  if(Math.max(...pos)>6)err(`quiz answer positions ${pos}`); if(ql>5)err(`quiz right answer longest in ${ql}/15`);
  (c.drills||[]).forEach((d,i)=>{if(!d.fields||!d.fields.every(f=>typeof f.answer==="number"))err(`drill ${i} fields`);if(!(c.scenes||[]).some(s=>s.id===d.after))err(`drill ${i} after`);prose.push(...d.setup,...d.solution)});
  if(c.exercise){const e=c.exercise;if(!(c.scenes||[]).some(s=>s.id===e.after))err("exercise after");e.items.forEach((it,i)=>{if(it.answer<0||it.answer>=it.choices.length)err(`exercise ${i}`);prose.push(it.prompt,it.why)})}
  const L=c.lesson||{};(L.sections||[]).forEach(s=>prose.push(...s.body,s.exam||""));
  const lw=(L.sections||[]).reduce((a,s)=>a+s.body.join(" ").split(/\s+/).length,0);if(lw<600)err(`lesson only ${lw} words`);
  try{prose.push(...c.closing(st,{},{}),...c.closing(st,{},G))}catch(e){err("closing threw")}
  const all=prose.join("\n");if(dash(all))err("contains em/en dash");
  if(V2){(all.match(/<span class="said"[^>]*>/g)||[]).forEach(t=>{const m=t.match(/data-who="([^"]+)"/);if(!m)err("untagged quote");else if(!V2M.V2_SPEAKERS.has(m[1]))err("unknown speaker "+m[1])});
    (all.match(/<prop\s[^>]*kind="vlog"[^>]*>/g)||[]).forEach(t=>{for(const k of ["from","sol","delay","margin"])if(!new RegExp(` ${k}="[^"]+"`).test(t))err(`vlog prop missing ${k}`);const f=(t.match(/ from="([^"]+)"/)||[])[1];if(f&&!V2M.V2_SPEAKERS.has(f))err("vlog from unknown speaker "+f)})}
  const words=all.split(/\s+/).length;
  console.log(`  ok-ish: scenes ${(c.scenes||[]).length}, best longest ${lb}, shortest ${sb}, quiz pos ${pos}, drills ${(c.drills||[]).length}, exercise ${c.exercise?c.exercise.items.length:0}, lesson ${lw}w, total ${words}w`);
  if(process.env.DUMP)fs.writeFileSync(process.env.DUMP,all.replace(/<[^>]+>/g,""));
}
// mock case studies: cases:[{id,title,text[]}] on any part serve the whole exam; an item joins one with case:"id" and cq (its place, 1 to n)
const MCASES=(window.HALCYON_MOCK||[]).flatMap(m=>m.cases||[]),MQS=(window.HALCYON_MOCK||[]).flatMap(m=>m.questions);
MCASES.forEach((k,i)=>{if(!k.id||!k.title||!Array.isArray(k.text)||!k.text.length)err(`mock case ${i} needs id, title, text[]`);if(MCASES.filter(c=>c.id===k.id).length>1)err(`mock case ${k.id} defined twice`);
  const cq=MQS.filter(x=>x.case===k.id).map(x=>x.cq).sort((a,b)=>a-b);if(cq.length<2)err(`mock case ${k.id} has ${cq.length} items`);if(cq.some((v,j)=>v!==j+1))err(`mock case ${k.id} cq ${cq} (want 1 to ${cq.length})`);
  if(dash([k.title,...k.text].join(" ")))err(`mock case ${k.id} dash`);console.log(`mock case ${k.id}: ${cq.length} items`)});
// forms (2026-10-25): a part with form:n (or a part name "Mn:") belongs to form n, as engine.js partForm reads it. A case item must use a
// case of its own form, question ids (part.slice(0,3)+index) must be unique across all forms, and each form reports its weights.
const PF=p=>(p&&p.form!=null&&Number.isInteger(+p.form)&&+p.form>=1)?+p.form:((/^M(\d+):/.exec((p&&p.part)||"")||[])[1]|0||1);
{const ids=new Set(),FS={};for(const m of (window.HALCYON_MOCK||[])){const f=PF(m),F=FS[f]=FS[f]||{n:0,dom:{},ap:{},tasks:new Set(),cases:new Set()};
  (m.cases||[]).forEach(k=>F.cases.add(k.id));m.questions.forEach((x,i)=>{const id=m.part.slice(0,3)+i;if(ids.has(id))err(`mock id ${id} is used twice (part ${m.part})`);ids.add(id);
    F.n++;F.dom[x.domain]=(F.dom[x.domain]||0)+1;F.ap[x.approach]=(F.ap[x.approach]||0)+1;F.tasks.add(x.task)})}
  for(const m of (window.HALCYON_MOCK||[])){const F=FS[PF(m)];m.questions.forEach((x,i)=>{if(x.case!==undefined&&!F.cases.has(x.case))err(`${m.part} q${i} case ${x.case} isn't a case of form ${PF(m)}`)})}
  for(const [f,F] of Object.entries(FS)){const miss=[...TASKS].filter(t=>!F.tasks.has(t));if(miss.length)err(`mock form ${f} has no item for ${miss.join(" ")}`);
    console.log(`mock form ${f}: ${F.n} questions, ${JSON.stringify(F.dom)}, ${JSON.stringify(F.ap)}`)}}
for(const m of (window.HALCYON_MOCK||[])){
  console.log(`mock part ${m.part}: ${m.questions.length} questions`);
  const pos=[0,0,0,0];let ql=0;const prose=[];
  m.questions.forEach((x,i)=>{if(x.opts.length!==4||x.a<0||x.a>3)err(`q${i}`);pos[x.a]++;if(!TASKS.has(x.task))err(`q${i} task ${x.task}`);else if(DOM[x.task[0]]!==x.domain)err(`q${i} domain`);if(lenCheck(`q${i}`,x.opts,x.a).longest)ql++;prose.push(x.q,...x.opts,x.why);
    if(x.case!==undefined&&!MCASES.some(k=>k.id===x.case))err(`q${i} unknown case ${x.case}`);if((x.case===undefined)!==(x.cq===undefined))err(`q${i} case and cq go together`);if(x.fig!==undefined){figCheck(`q${i}`,x.fig);prose.push(x.fig)}});
  if(Math.max(...pos)>Math.ceil(m.questions.length*0.32))err(`answer positions ${pos}`);if(ql>m.questions.length*0.33)err(`right answer longest in ${ql}`);
  if(dash(prose.join(" ")))err("dash");
  console.log(`  positions ${pos}, right-longest ${ql}`);
  if(process.env.DUMP)fs.writeFileSync(process.env.DUMP,prose.join("\n"));
}
process.exit(bad?1:0);
