/* Halcyon badges and readiness (Phase 1, 2026-10-13; plan in the halcyon-copilot memory, plan-badges-profiles-2026-10-13.md).
   Pure logic: no DOM, no storage, no network. engine.js gathers one course's facts (courseFacts) and calls these; tests/badges.test.mjs
   and tools/check_badges.mjs load this file in node with a window shim.

   Badge definitions live in badges/<course>.js (courses.js names the file as badges:"badges/<id>.js"), registered on window.HALCYON_BADGES[id]:
     {form, one, shelf, color, readiness:{name, explain}, idCard, chapters?, items:[{id, name, line, mark, rule, hidden?, pending?, plan?}]}
   form: the art template (patch, stamp, endorsement, signoff, qastamp, card). one: what one badge is called ("patch"). shelf: the heading.
   chapters: the shared chapter badge pattern for a book that isn't finished yet ({prefix, line, mark}; {n} in the line is the chapter number,
   the name is the chapter's title once it's written). The readiness target comes from courses.js (target), never from the defs.
   pending:true marks a hidden badge whose scene isn't written yet: it is never shown, never evaluated and never earned (expand drops it).

   Facts (engine.js courseFacts): {course, planned, chapters:[{n, title, done, picks:{sceneIndex:opt}, ids:[scene ids], best:[best opt per scene],
   rd, quiz:[right,total]|null}], flags, exams:[{at, mode, right, total}], final:bool, tasks:{task:{got,max,n,d}}, doms, weights, hasMock,
   listen:{"YYYY-MM-DD":secs}, today:"YYYY-MM-DD"}

   Rule types: chapter {ch}, chapters {list}, book, clean, quiz {min, ch?}, exam {min}, final, readiness, streak {days}, flag {flag, not?},
   pick {ch, scene, opt} (not in a run with a redo or replay, rd > 0), all {ids}.

   The badges record (base+908, synced like other progress): {v:1, since, at, got:{id:{at, seen?, back?, ch?}}, snap:{ready, parts, ch:[done,planned], at}}
   back:1 = earned before this device's first check (silent backfill, never toasted). seen:1 = its toast has shown. ch = chapters with a clean run. */
(function(W){
"use strict";
const H={};
const LISTEN_DAY=600; // a listening day: at least 10 minutes of audio that day, every device added up
const TIMED=a=>a&&a.mode!=="practice"&&a.total>0;
const pct=a=>a&&a.total>0?a.right/a.total*100:0;
const num=v=>typeof v==="number"&&isFinite(v);

/* ===== readiness =====
   Per task mastery from decisions, chapter quizzes, practice exams and practice sets. K = coverage: in each exam domain, the share of tasks
   with 3 or more answered items, weighted by the course's exam weights. A = accuracy: each domain's got/max, weighted, over the domains
   with any data. S = A*K. X = the last 3 timed practice exams (newest first, weighted 3, 2, 1). R = 0.6X + 0.4S; with no timed exam yet it is
   S capped at 0.80; a book with no practice exam uses S. Fewer than 15 answered items and no timed exam: not enough to say. */
H.readiness=function(F){
  const T=(F&&F.tasks)||{},doms=(F&&F.doms&&F.doms.length?F.doms:[...new Set(Object.values(T).map(x=>x.d))]),Wt=(F&&F.weights)||{};
  const w=d=>num(Wt[d])&&Wt[d]>0?Wt[d]:(Object.keys(Wt).length?0:1);
  let items=0;const per={};doms.forEach(d=>per[d]={tasks:0,cov:0,got:0,max:0});
  Object.values(T).forEach(x=>{const p=per[x.d];if(!p)return;p.tasks++;if((x.n||0)>=3)p.cov++;p.got+=x.got||0;p.max+=x.max||0;items+=x.n||0});
  let kw=0,ks=0,aw=0,as=0;doms.forEach(d=>{const p=per[d];if(!p.tasks||!w(d))return;kw+=w(d);ks+=w(d)*p.cov/p.tasks;if(p.max>0){aw+=w(d);as+=w(d)*p.got/p.max}});
  const K=kw?ks/kw:0,A=aw?as/aw:0,S=A*K;
  const timed=((F&&F.exams)||[]).filter(TIMED).slice().sort((a,b)=>String(b.at).localeCompare(String(a.at))).slice(0,3);
  const X=timed.length?timed.reduce((s,a,i)=>s+(3-i)*pct(a)/100,0)/timed.reduce((s,a,i)=>s+(3-i),0):null;
  const hasMock=!!(F&&F.hasMock);
  const out={K,A,S,X,items,timed:timed.length,value:null,basis:hasMock?(timed.length?"exam":"study"):"nomock"};
  if(!timed.length&&items<15)return out; // "Not enough yet"
  const R=!hasMock?S:timed.length?0.6*X+0.4*S:Math.min(S,0.8);
  out.value=Math.round(Math.max(0,Math.min(1,R))*100);return out};
/* the parts for the badges record snapshot and the admin view later: whole percents */
H.parts=function(r){const p=v=>v==null?null:Math.round(v*100);return {x:p(r.X),s:p(r.S),a:p(r.A),k:p(r.K),n:r.items,t:r.timed}};

/* ===== listening streaks (from the study log, base+905) ===== */
function dayNum(k){const m=/^(\d{4})-(\d\d)-(\d\d)$/.exec(k);return m?Math.round(Date.UTC(+m[1],+m[2]-1,+m[3])/864e5):null}
H.streak=function(listen,today){const days=Object.keys(listen||{}).filter(k=>(listen[k]||0)>=LISTEN_DAY).map(dayNum).filter(x=>x!=null).sort((a,b)=>a-b);
  let best=0,run=0,prev=null;days.forEach(d=>{run=prev!=null&&d===prev+1?run+1:d===prev?run:1;prev=d;if(run>best)best=run});
  const t=dayNum(today||""),last=days[days.length-1];const current=t!=null&&last!=null&&(last===t||last===t-1)?run:0;
  return {best,current,days:days.length}};

/* ===== definitions: the shared chapter pattern expanded, pending badges dropped ===== */
H.pad=n=>String(n).padStart(2,"0");
H.expand=function(def,F){if(!def)return [];const out=[];const P=def.chapters;
  if(P){const planned=Math.max((F&&F.planned)||0,((F&&F.chapters)||[]).length);for(let n=1;n<=planned;n++){const c=((F&&F.chapters)||[]).find(x=>x.n===n);
    out.push({id:P.prefix+H.pad(n),name:c&&c.title?c.title:"Chapter "+n,line:String(P.line).replace(/\{n\}/g,n),mark:P.mark||"num",rule:{type:"chapter",ch:n},shared:true})}}
  (def.items||[]).forEach(it=>{if(!it.pending)out.push(it)});return out};
H.kind=it=>it.rule&&it.rule.type==="chapter"?"chapter":it.hidden?"hidden":"milestone";

/* ===== evaluation: which badges the facts earn right now ===== */
function chDone(F,n){const c=(F.chapters||[]).find(x=>x.n===n);return !!(c&&c.done)}
function cleanChapters(F){return (F.chapters||[]).filter(c=>c.done&&!(c.rd>0)&&c.best&&c.best.length&&c.best.every((b,i)=>c.picks&&c.picks[i]===b)).map(c=>c.n)}
H.test=function(it,F,ready,target,got){const r=it.rule||{};
  switch(r.type){
    case "chapter":return chDone(F,r.ch);
    case "chapters":return Array.isArray(r.list)&&r.list.length>0&&r.list.every(n=>chDone(F,n));
    case "book":{const n=Math.max(F.planned||0,(F.chapters||[]).length);if(!n)return false;for(let k=1;k<=n;k++)if(!chDone(F,k))return false;return true}
    case "clean":{const ch=cleanChapters(F);return ch.length?{ch}:false}
    case "quiz":return (F.chapters||[]).some(c=>(r.ch==null||c.n===r.ch)&&c.quiz&&c.quiz[1]>0&&c.quiz[0]/c.quiz[1]*100>=(r.min??70));
    case "exam":return (F.exams||[]).some(a=>a&&a.total>0&&pct(a)>=(r.min??70));
    case "final":return !!F.final;
    case "readiness":return !!(ready&&ready.value!=null&&num(target)&&ready.value>=target);
    case "streak":return H.streak(F.listen,F.today).best>=(r.days||3);
    case "flag":{const on=!!(F.flags&&F.flags[r.flag]);return r.not?!on:on}
    case "pick":{const c=(F.chapters||[]).find(x=>x.n===r.ch);if(!c||!c.ids||c.rd>0)return false; // a redo or replay in this run: no fishing for a hidden badge
      const i=c.ids.indexOf(r.scene);return i>=0&&c.picks&&(r.opt==null?c.picks[i]!=null:c.picks[i]===r.opt)} // no opt: any answer at that scene, i.e. the reader reached it
    case "all":return Array.isArray(r.ids)&&r.ids.length>0&&r.ids.every(id=>got&&got[id]);
  }return false};
/* {id: true or {ch}} for every badge earned now. target: the course's readiness target (courses.js target) */
H.evaluate=function(def,F,target){const items=H.expand(def,F),ready=H.readiness(F),got={};
  items.filter(it=>(it.rule||{}).type!=="all").forEach(it=>{const v=H.test(it,F,ready,target,got);if(v)got[it.id]=v});
  items.filter(it=>(it.rule||{}).type==="all").forEach(it=>{if(H.test(it,F,ready,target,got))got[it.id]=true});
  return {got,ready,items}};

/* ===== the badges record ===== */
const uniq=a=>[...new Set(a)].sort((x,y)=>x-y);
/* adds what was earned now. A badge once earned stays earned. With no record yet, everything earned is a silent backfill (back:1). */
H.apply=function(rec,earned,now){const fresh=[];let changed=false;const back=!rec||!rec.got;
  if(back){rec={v:1,since:now,at:now,got:{}};changed=true}else rec=JSON.parse(JSON.stringify(rec));
  Object.entries(earned||{}).forEach(([id,v])=>{let g=rec.got[id];
    if(!g){g=rec.got[id]=back?{at:now,back:1}:{at:now};changed=true;if(!back)fresh.push(id)}
    if(v&&Array.isArray(v.ch)){const ch=uniq([...(g.ch||[]),...v.ch]);if(JSON.stringify(ch)!==JSON.stringify(g.ch||[])){g.ch=ch;changed=true}}});
  if(changed)rec.at=now;return {rec,fresh,changed}};
/* two copies of the record (this device and the server): every badge either has, the earliest date, seen if either saw its toast,
   back only if the earliest copy was a backfill, clean run chapters added up, the newer snapshot */
H.merge=function(a,b){const ok=x=>x&&typeof x==="object"&&x.got&&typeof x.got==="object";if(!ok(a)&&!ok(b))return null;if(!ok(a))return JSON.parse(JSON.stringify(b));if(!ok(b))return JSON.parse(JSON.stringify(a));
  const out={v:1,since:Math.min(a.since||Infinity,b.since||Infinity),at:Math.max(a.at||0,b.at||0),got:{}};if(!isFinite(out.since))out.since=out.at;
  new Set([...Object.keys(a.got),...Object.keys(b.got)]).forEach(id=>{const x=a.got[id],y=b.got[id];if(!x||!y){out.got[id]=JSON.parse(JSON.stringify(x||y));return}
    const first=(x.at||0)<=(y.at||0)?x:y,g={at:Math.min(x.at||0,y.at||0)};if(x.seen||y.seen)g.seen=1;if(first.back)g.back=1;
    const ch=uniq([...(x.ch||[]),...(y.ch||[])]);if(ch.length)g.ch=ch;out.got[id]=g});
  const sa=a.snap,sb=b.snap;if(sa||sb)out.snap=JSON.parse(JSON.stringify(!sb||(sa&&(sa.at||0)>=(sb.at||0))?sa:sb));return out};
H.same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
/* toasts waiting: earned live on some device and not shown anywhere yet, oldest first, only badges the defs still show */
H.unseen=function(rec,items){if(!rec||!rec.got)return [];const ids=new Set((items||[]).map(x=>x.id));
  return Object.entries(rec.got).filter(([id,g])=>!g.seen&&!g.back&&ids.has(id)).sort((x,y)=>(x[1].at||0)-(y[1].at||0)).map(([id])=>id)};

/* ===== player facing words ===== */
H.need=function(it,ctx){const r=it.rule||{},c=ctx||{};
  if(it.hidden)return "Hidden. It shows up when you earn it.";
  switch(r.type){
    case "chapter":return `Finish chapter ${r.ch}.`;
    case "chapters":return `Finish chapters ${r.list.join(", ")}.`;
    case "book":return `Finish all ${c.planned||"the"} chapters.`;
    case "clean":return "Make the best call on every decision in one chapter, on your first try.";
    case "quiz":return `Score ${r.min??70} percent or better on a chapter quiz.`;
    case "exam":return c.hasMock?`Score ${r.min??70} percent or better on ${c.mockOne||"a full practice exam"}.`:"The practice exam for this book is still being written.";
    case "final":return "Pass the final assessment.";
    case "readiness":return `Get your ${String(c.meter||"readiness").replace(/^\w/,x=>x.toLowerCase())} to ${c.target}.`;
    case "streak":return `Listen at least 10 minutes a day, ${r.days} days in a row.`;
    case "all":return "Earn the others in this set.";
  }return "Keep going."};

/* ===== art: one template per form, filled with the badge's mark and the book's colors =====
   64 by 64. got: the badge in its own colors (they're objects, so they keep their colors in dark mode too). locked: the frame in
   currentColor, dashed, with the number (chapter badges) or a faint mark. hidden: the frame and a question mark. */
const G={ // marks, drawn in a 24 by 24 box, stroked in the ink color
  orbit:'<ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(28 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-28 12 12)"/><path d="M12 9.5v5M9.5 12h5"/>',
  folder:'<path d="M3 7h6l2 2h10v10H3z"/><path d="M3 11h18"/>',
  path:'<path d="M4 17l6-8 5 5 5-8" stroke-width="2.6"/><circle cx="4" cy="17" r="1.6"/><circle cx="10" cy="9" r="1.6"/><circle cx="15" cy="14" r="1.6"/><circle cx="20" cy="6" r="1.6"/><path d="M4 7l5 2M15 14l5 5" opacity=".55"/>',
  valve:'<path d="M4 12l7-4v8zM20 12l-7-4v8z"/><path d="M12 8V4M9 4h6M18 3.5l1 1m0-1l-1 1"/>',
  dial:'<circle cx="8" cy="13" r="5"/><circle cx="17" cy="13" r="5"/><path d="M8 13l2.5-3M17 13l2.6-2.4M3 20h18"/>',
  planets:'<circle cx="5" cy="12" r="3"/><circle cx="19.5" cy="12" r="2"/><path d="M9 12h8" stroke-dasharray="1.2 1.8"/>',
  burndown:'<path d="M3 5h4v4h4v4h4v4h6"/><path d="M3 3v18h18" opacity=".55"/>',
  pen:'<path d="M5 19l1-4L16 5l3 3L9 18z"/><path d="M14 7l3 3"/><path d="M4 9V4h3v5" opacity=".7"/>',
  eclipse:'<circle cx="12" cy="12" r="8"/><circle cx="17.5" cy="15" r="1.8"/>',
  rockets:'<path d="M6 20V9l1.5-4L9 9v11M11 20V8l1.5-4L14 8v12"/><path d="M17 20v-5" opacity=".6"/><path d="M19 7a3 3 0 1 1-2 5" />',
  dish:'<path d="M5 14a7 7 0 0 0 10-10z"/><path d="M10 9l5-5M8 16l-2 5h8l-2-5"/>',
  relay:'<path d="M3 9h13l-3-3M21 15H8l3 3"/>',
  sign:'<path d="M3 18h18"/><path d="M5 11l4 4m0-4l-4 4"/><path d="M12 15c2-4 3-4 3-1s2 0 3-2" opacity=".8"/>',
  tminus:'<path d="M3 6h8M7 6v12M13 12h7"/>',
  arc:'<path d="M3 19Q12 1 21 19"/><circle cx="12" cy="10" r="1.8"/><path d="M5 22h14" opacity=".6"/>',
  crew:'<circle cx="5" cy="18" r="3"/><circle cx="19" cy="6" r="2.4"/><path d="M7.5 16Q9 7 16.5 6.5"/><path d="M14 9l2.5-2.5" />',
  toggle:'<rect x="6" y="11" width="12" height="9" rx="2"/><path d="M12 15L9 5"/><circle cx="9" cy="5" r="1.6"/>',
  console:'<rect x="3" y="4" width="18" height="13" rx="1.5"/><path d="M5 13l3-3 3 2 3-5 3 4 2-1M9 21h6M12 17v4"/>',
  board:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 8h2M11 8h6M7 12h2M11 12h6M7 16h2M11 16h6"/>',
  cards:'<rect x="2.5" y="7" width="5.5" height="10" rx="1"/><rect x="9.25" y="7" width="5.5" height="10" rx="1"/><rect x="16" y="7" width="5.5" height="10" rx="1"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 12l2.2 4.2M12 12l-5.5 3.2"/>',
  tape:'<rect x="2" y="8" width="20" height="8" rx="1"/><path d="M5 12h9M16 12h3"/>',
  rope:'<path d="M12 12m-2 0a2 2 0 1 0 4 0a4 4 0 1 0 -8 0a6 6 0 1 0 12 0a8 8 0 1 0 -16 0"/>',
  bag:'<path d="M4 10h16v10H4zM9 10V7h6v3"/><path d="M12 13v4M10 15h4"/>',
  telescope:'<path d="M4 13l13-6 1.5 3L6 16z"/><path d="M11 13.5L8 21M11 13.5l3 7.5"/><path d="M19 3l.6 1.4L21 5l-1.4.6L19 7l-.6-1.4L17 5l1.4-.6z"/>',
  tick:'<path d="M4 13l5 5L20 6"/>',
  tickbar:'<path d="M4 13l5 5L20 6"/><path d="M11 9l5 3"/>',
  stamp:'<rect x="2.5" y="7" width="19" height="10" rx="1"/><path d="M5 10.5h14M5 13.5h9"/>',
  phone:'<path d="M5 4c-1 3 0 7 4 11s8 5 11 4l-1-4-4 0-2-2 0-4-4-1z"/>',
  cups:'<path d="M3 9h7v6a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3zM10 11h1.5a1.5 1.5 0 0 1 0 3H10"/><path d="M14 17l7-3-1-3-7 3z"/>',
  ribbon:'<circle cx="12" cy="9" r="5"/><path d="M9 13l-2 8 5-3 5 3-2-8"/>',
  runways:'<path d="M4 20L7 4M10.5 20L11.5 4M17 20L15 4"/>',
  sheet:'<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4"/>',
  cert:'<path d="M4 5h16v11H4z"/><path d="M7 9h10M7 12h6"/><circle cx="16" cy="17" r="2.5"/><path d="M15 19l-1 3M17 19l1 3"/>',
  logline:'<path d="M3 8h18M3 16h18" opacity=".55"/><path d="M5 13c2-4 3-4 3 0s2-4 4-1 2 1 3 0 2-1 4 0"/>',
  headset:'<path d="M5 15v-3a7 7 0 0 1 14 0v3"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/>',
  keys:'<circle cx="8" cy="12" r="4"/><path d="M12 12h9M18 12v3M21 12v3"/>',
  seat:'<path d="M7 4v10h10l1 6M7 14l-1 6"/><path d="M14 4l5 0" opacity=".7"/>',
  stack:'<rect x="4" y="8" width="16" height="11" rx="1"/><path d="M6 5h12M8 2h8M4 13.5h16" />',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="1.5"/><path d="M3 10h18M8 3v4M16 3v4"/><circle cx="14" cy="15.5" r="3"/>',
  moons:'<path d="M6 8a3 3 0 1 0 0 6 3.5 3.5 0 0 1 0-6zM13 8a3 3 0 1 0 0 6 3.5 3.5 0 0 1 0-6zM20 8a3 3 0 1 0 0 6 3.5 3.5 0 0 1 0-6z"/>',
  bowl:'<path d="M3 11h18a9 7 0 0 1-18 0zM15 9l5-6"/>',
  laptop:'<rect x="5" y="5" width="14" height="10" rx="1"/><path d="M2 19h20l-2-4H4z"/>',
  chart:'<path d="M3 3v18h18"/><path d="M7 17v-5M11 17V8M15 17v-7M19 17V6"/>',
  door:'<path d="M5 21V3h11v18M5 21h14"/><path d="M16 3l3 2v16" opacity=".7"/><circle cx="13" cy="12" r=".9"/>',
  clipboard:'<rect x="5" y="4" width="14" height="17" rx="1.5"/><path d="M9 4V2.5h6V4M8 10h8M8 14h8M8 18h5"/>',
  waves:'<path d="M3 7c2-3 4 3 6 0s4 3 6 0 4 3 6 0M3 12c2-3 4 3 6 0s4 3 6 0 4 3 6 0M3 17c2-3 4 3 6 0s4 3 6 0 4 3 6 0"/>',
  gauge:'<path d="M3 17a9 9 0 0 1 18 0z"/><path d="M12 17l4-6"/>',
  quote:'<path d="M5 6h14v13H5z"/><path d="M8 10c0-1 1-1.5 1.5-1.5M8 10v2h2v-2zM13 10c0-1 1-1.5 1.5-1.5M13 10v2h2v-2z"/>',
  bolt:'<path d="M13 3L5 13h6l-1 8 8-10h-6z"/>',
  doors:'<path d="M2 20V6h4v14M7 20V6h4v14M13 20V6h4v14M18 20V6h4v14"/><path d="M14.5 11h1v2h-1z"/>',
  grid:'<rect x="3" y="4" width="18" height="16" rx="1"/><path d="M3 9h18M3 14h18M9 4v16M15 4v16"/>',
  tag:'<path d="M3 4h11l7 8-7 8H3z"/><circle cx="7" cy="12" r="1.5"/>',
  checklist:'<path d="M4 6l1.5 1.5L8 5M4 12l1.5 1.5L8 11M4 18l1.5 1.5L8 17M11 6h9M11 12h9M11 18h9"/>',
  pie:'<path d="M3 15h18M5 15l7-8 7 8"/><path d="M8 12h8" opacity=".6"/>',
  cushion:'<rect x="4" y="12" width="16" height="6" rx="3"/><path d="M7 12V6M17 12V6"/>',
  ring:'<ellipse cx="12" cy="12" rx="10" ry="7"/><path d="M6 10.5h12M7 13.5h9"/>',
  mobile:'<rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M9.5 9l5 5m0-5l-5 5"/>',
  bubble:'<path d="M3 5h18v11H9l-5 4v-4H3z"/><path d="M7 10.5h8" stroke-width="2.4"/>',
  star:'<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6L3.4 9.3l6-.7z"/>',
};
H.MARKS=Object.keys(G);
const FORMS={
  // a round twill patch with a rim
  patch:{frame:'<circle cx="32" cy="32" r="29"/>',got:C=>`<circle cx="32" cy="32" r="29" fill="${C.bg}" stroke="${C.rim}" stroke-width="3"/><circle cx="32" cy="32" r="24.5" fill="none" stroke="${C.rim}" stroke-width=".8" opacity=".55"/>`,box:[18,15,28],num:[32,54.5],ink:C=>C.ink},
  // a workpaper line with a green tick at the right
  stamp:{frame:'<rect x="4" y="12" width="56" height="40" rx="3"/>',got:C=>`<rect x="4" y="12" width="56" height="40" rx="3" fill="${C.paper}" stroke="${C.rim}" stroke-width="1.2"/><path d="M8 22h48M8 42h48" stroke="${C.rim}" stroke-width=".7" opacity=".7"/><path d="M45 34l4 4 8-10" fill="none" stroke="${C.ink}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`,box:[10,20,24],num:[22,39],ink:C=>C.ink},
  // a logbook line in the instructor's hand
  endorsement:{frame:'<rect x="4" y="10" width="56" height="44" rx="2"/>',got:C=>`<rect x="4" y="10" width="56" height="44" rx="2" fill="${C.paper}" stroke="${C.rim}" stroke-width="1.2"/><path d="M4 19h56M18 10v44M46 10v44" stroke="${C.rim}" stroke-width=".7" opacity=".7"/><path d="M47 47c2-3 3-3 3 0s2-3 3-1 2 1 3 0" fill="none" stroke="${C.ink}" stroke-width="1.3" stroke-linecap="round"/>`,box:[21,20,22],num:[11,40],ink:C=>C.ink},
  // a competency checklist line: the box checked, initials beside it
  signoff:{frame:'<rect x="4" y="12" width="56" height="40" rx="4"/>',got:C=>`<rect x="4" y="12" width="56" height="40" rx="4" fill="${C.paper}" stroke="${C.rim}" stroke-width="1.4"/><rect x="9" y="25" width="13" height="13" rx="2" fill="none" stroke="${C.ink}" stroke-width="1.6"/><path d="M11.5 31.5l3 3 5-6" fill="none" stroke="${C.ink}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><text x="15.5" y="48" text-anchor="middle" font-size="6" font-weight="600" fill="${C.ink}" font-family="Inter Tight,system-ui,sans-serif">R.O.</text>`,box:[28,20,24],num:[44,39],ink:C=>C.ink},
  // a round inspection stamp in purple ink, a little crooked
  qastamp:{frame:'<circle cx="32" cy="32" r="28"/>',got:C=>`<g transform="rotate(-8 32 32)"><circle cx="32" cy="32" r="28" fill="${C.paper}" stroke="${C.ink}" stroke-width="2.6"/><circle cx="32" cy="32" r="22.5" fill="none" stroke="${C.ink}" stroke-width="1"/><path d="M14 32h4M46 32h4" stroke="${C.ink}" stroke-width="1.6"/></g>`,box:[20,18,24],num:[32,51],ink:C=>C.ink},
  // an index card in purple felt tip
  card:{frame:'<rect x="4" y="12" width="56" height="40" rx="2"/>',got:C=>`<rect x="4" y="12" width="56" height="40" rx="2" fill="${C.paper}" stroke="${C.rim}" stroke-width="1.2"/><path d="M4 20h56" stroke="#c2504a" stroke-width=".9" opacity=".8"/><path d="M4 28h56M4 36h56M4 44h56" stroke="${C.rim}" stroke-width=".6" opacity=".7"/>`,box:[20,19,24],num:[50,48],ink:C=>C.ink},
};
H.FORMS=Object.keys(FORMS);
const SANS='font-family="Inter Tight,system-ui,sans-serif"';
function markSVG(key,color,box,sw){const g=G[key]||G.star,[x,y,s]=box,k=s/24;return `<g transform="translate(${x} ${y}) scale(${k})" fill="none" stroke="${color}" stroke-width="${(sw||1.7)}" stroke-linecap="round" stroke-linejoin="round">${g}</g>`}
/* state: got, locked or hidden. n: the chapter number for chapter badges */
H.art=function(it,def,state,size){const F=FORMS[def&&def.form]||FORMS.patch,C=(def&&def.color)||{bg:"#28536b",rim:"#c9a33a",ink:"#f3e2a8",paper:"#fbfaf7"};
  const n=it&&it.rule&&it.rule.type==="chapter"?it.rule.ch:null,px=size||56;let body;
  if(state==="got"){const ink=F.ink(C);body=F.got(C)+(it.mark==="num"&&n!=null?`<text x="${F.box[0]+F.box[2]/2}" y="${F.box[1]+F.box[2]*0.78}" text-anchor="middle" font-size="${F.box[2]*0.8}" font-weight="600" fill="${ink}" ${SANS}>${n}</text>`:markSVG(it.mark,ink,F.box))
      +(n!=null&&it.mark!=="num"?`<text x="${F.num[0]}" y="${F.num[1]}" text-anchor="middle" font-size="7.5" font-weight="600" fill="${ink}" ${SANS}>${n}</text>`:"")}
  else{const fr=F.frame.replace(/\/>$/,` fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="3.2 2.6"/>`);
    if(state==="hidden")body=fr+`<text x="32" y="40" text-anchor="middle" font-size="22" font-weight="600" fill="currentColor" ${SANS}>?</text>`;
    else if(n!=null)body=fr+`<text x="32" y="${F===FORMS.patch||F===FORMS.qastamp?40:40}" text-anchor="middle" font-size="20" font-weight="600" fill="currentColor" ${SANS}>${n}</text>`;
    else body=fr+`<g opacity=".5">${markSVG(it&&it.mark,"currentColor",F.box,1.5)}</g>`}
  return `<svg class="bdgart ${state}" viewBox="0 0 64 64" width="${px}" height="${px}" aria-hidden="true" focusable="false">${body}</svg>`};

W.HalcyonBadges=H;
})(typeof window!=="undefined"?window:globalThis);
