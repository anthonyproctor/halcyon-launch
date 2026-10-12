(function(){
"use strict";
const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
/* PMP Full Course = The Halcyon Launch v2 (2026-10-11), read in place: chapters from full/v2/ (full/v2/preview.js lists them), art, portraits, and audio from art/v2/, cast/v2/, audio/v2/.
   At the later file move (full/v2/README.md) these paths go back to full/, art/, cast/, audio/ and V2 becomes the identity. */
const SP="halcyon.";
const PMP2=()=>!!(COURSE&&COURSE.id==="pmp");
const V2=p=>PMP2()&&!/^(art|cast|audio)\/v2\//.test(p)?p.replace(/^(art|cast|audio)\//,"$1/v2/"):p;
const NOAUD=()=>PMP2()&&!(window.HALCYON_V2||{}).audio; // v2 narration not switched on yet in preview.js: don't fetch audio that isn't there
/* the test profile (profile.js, QA only) moves every progress key to its own namespace; display preferences stay shared. Without profile.js it's "halcyon."+k */
const PROF=window.HalcyonProfile||{test:false,key:k=>SP+k};
const TESTP=!!PROF.test;
const store={get(k,d){try{const v=localStorage.getItem(PROF.key(k));return v?JSON.parse(v):d}catch(e){return d}},set(k,v){if(PROF.frozen)return;try{localStorage.setItem(PROF.key(k),JSON.stringify(v))}catch(e){}}};
const clamp=v=>Math.max(0,Math.min(100,v));
let DOMS=["People","Process","Business Environment"];
const PMP_METERS=[["trust","Team trust"],["conf","Stakeholder confidence"],["health","Delivery health"]];
const METERS_OF=()=>(COURSE&&COURSE.meters)||PMP_METERS; // per course labels for the three meters
const RUTH_LEADS={3:["That's the move.","Good. That's what I'd want from a flight director.","Exactly right."],1:["Close, but not quite.","Defensible. Not the best answer.","You're in the neighborhood."],0:["That one's going to cost you.","I'd have stopped you there.","Let's talk about that one."]};
let TASKNAMES={P1:"Develop a common vision",P2:"Manage conflicts",P3:"Lead the project team",P4:"Engage stakeholders",P5:"Align stakeholder expectations",P6:"Manage stakeholder expectations",P7:"Help ensure knowledge transfer",P8:"Plan and manage communication",R1:"Integrated plan and plan delivery",R2:"Develop and manage scope",R3:"Value-based delivery",R4:"Plan and manage resources",R5:"Plan and manage procurement",R6:"Plan and manage finance",R7:"Plan and optimize quality",R8:"Plan and manage schedule",R9:"Evaluate project status",R10:"Manage project closure",B1:"Project governance",B2:"Project compliance",B3:"Manage and control changes",B4:"Remove impediments, manage issues",B5:"Plan and manage risk",B6:"Continuous improvement",B7:"Support organizational change",B8:"External business environment"};
let BASE_CAST=[["Sam Okafor","You. Tallgrass integration operations manager, former Air Force F-16 crew chief."],["Ruth Calder","Retired ARA flight director on the Independent Readiness Board."],["Ada Okafor","Sam's daughter. Hydroponics engineer on Ares Station. Speaks only in recorded logs."],["Imogen Hale","Director of the Ares Relief Authority. The program's sponsor."],["Garrett Lyle","Founder and CEO of Tallgrass Aerospace."],["Hana Iwasaki","Propulsion lead. Owns the departure stage."],["Rafa Quintero","Flight software lead. Runs the agile side."]];
let FULL_CAST_EXTRA=[["Ray Mendez","Sam's old flight chief, retired, in Tucson."],["Quinn Abernathy","Scheduler, now Sam's deputy."],["Wendell Price","Test conductor. Reads stand data by feel."]];

const TRACKS={
  /* the PMP Refresher (v1 hospital story) was deleted on 2026-10-12; the ref track stays generic and is empty for PMP. */
  ref:{id:"ref",name:"Refresher",blurb:"6 chapters, about 2.5 hours. Ten decisions per chapter with mentor debriefs. Best for a quick review.",list:()=> (DATA().ref||[]).filter(c=>c&&c.scenes).sort((a,b)=>a.num-b.num),key:n=>n},
  full:{id:"full",name:"Full Course",get blurb(){if(!COURSE||COURSE.id==="pmp")return "15 chapters, about 15 to 20 hours. Lessons, decisions, math drills, exercises, and a quiz every chapter. Learn the PMP from the ground up.";const n=COURSE.planned||(DATA().full||[]).length;return `${n} chapters, ${COURSE.fullHours||""}. Lessons, decisions, drills, exercises, and a quiz every chapter.`},list:()=> (DATA().full||[]).filter(c=>c&&c.scenes).sort((a,b)=>a.num-b.num),key:n=>FULL_BASE()+n},
  mock:{id:"mock",name:"Practice Exam",blurb:"180 questions in 240 minutes with two breaks, weighted like the real exam. Practice mode gives feedback as you go.",key:()=>900}
};
/* saved progress: Full Course chapter n is key base+100+n, except PMP v2, which uses 201 to 215 so v1 picks (101 to 115) never land on v2 scenes. v1 rows stay on the server, unread. */
function FULL_BASE(){return PMP2()?200:100}
const PMP_META={DOMS,TASKNAMES,BASE_CAST,FULL_CAST_EXTRA};
/* ===== courses ===== */
const COURSES=window.HALCYON_COURSES||[{id:"pmp",title:"PMP",base:0,root:"",status:"live",taskDomain:{P:"People",R:"Process",B:"Business Environment"}}];
let COURSE=COURSES[0];
function courseById(id){return COURSES.find(c=>c.id===id)}
/* not affiliated: each course names its certifying body (certBody) and the marks it uses (marks) in courses.js */
function bodiesOf(c){return [].concat(c.certBody||[]).filter(Boolean)}
function orList(a){return a.length>1?a.slice(0,-1).join(", ")+(a.length>2?",":"")+" or "+a[a.length-1]:a[0]||""}
function marksLine(c){const b=bodiesOf(c);return `${c.full_title||c.title} is an independent study story, not affiliated with or endorsed by ${b.length?orList(b):"the certifying body"}.${c.marks?" "+c.marks:""}`}
function siteFooter(){const f=$("sitefoot");if(!f)return;const b=[...new Set(COURSES.flatMap(bodiesOf))],m=[...new Set(COURSES.map(c=>c.marks).filter(Boolean))];
  f.innerHTML=`<p>These courses are independent study stories. They aren't affiliated with or endorsed by ${esc(b.length?orList(b):"the certifying bodies whose exams they cover")}. ${esc(m.join(" "))}</p>`}
siteFooter();
function courseOfKey(k){return COURSES.filter(c=>k>=c.base).sort((a,b)=>b.base-a.base)[0]||COURSES[0]}
function DATA(){if(COURSE.id==="pmp")return{ref:[],full:window.HALCYON_FULL,mock:window.HALCYON_MOCK,cast:window.HALCYON_CAST};return (window.HALCYON_DATA||{})[COURSE.id]||{}}
function labsOf(c){return (c&&c.scenes&&((window.HALCYON_LABS||{})[COURSE.id]||{})[c.num])||[]} // optional hands-on labs, registered per course by chapter number
function MENTOR(){return COURSE.mentor||"Ruth"}
function MENTOR_FULL(){return COURSE.mentorFull||(MENTOR()==="Ruth"?"Ruth Calder":MENTOR())}
function LEADS(){return COURSE.leads||(MENTOR()==="Ruth"?RUTH_LEADS:{...RUTH_LEADS,3:["That's the move.","Good. That's the call.","Exactly right."]})}
function LESSON(){return COURSE.lessonName||"Ruth's whiteboard"}
function R(p){return /^(https?:|\/)/.test(p)?p:COURSE.root+p}
function taskDomain(t){const TD=COURSE.taskDomain||{};return TD[t]||TD[t.split(".")[0]]||TD[t[0]]||DOMS[0]}
function loadScripts(list){return Promise.all(list.map(src=>new Promise(ok=>{if(document.querySelector(`script[data-c="${src}"]`))return ok();const el=document.createElement("script");el.src=src;el.dataset.c=src;el.onload=ok;el.onerror=ok;document.head.appendChild(el)})))}
async function useCourse(id){const c=courseById(id);if(!c||c.status!=="live")return false;if((c.scripts||c.labs)&&!c._loaded){await loadScripts([...(c.scripts||[]),...(c.labs?[c.labs]:[])].map(x=>c.root+x));c._loaded=true}
  const changed=COURSE.id!==c.id;COURSE=c;store.set("course",id);
  const meta=c.id==="pmp"?PMP_META:(((window.HALCYON_DATA||{})[id]||{}).meta||{});
  DOMS=meta.DOMS||PMP_META.DOMS;TASKNAMES=meta.TASKNAMES||{};BASE_CAST=meta.BASE_CAST||[];FULL_CAST_EXTRA=meta.FULL_CAST_EXTRA||[];
  if(changed){MS=null;MOCK_FORM=1;clearInterval(mockTimer);BOOK=null;MARKS=null;BP_BOOK=null;BP_WAIT=false;NAR.timings={};try{NAR.audio.pause()}catch(e){}NAR.page=null;NAR.listening=false;buildOrders()}return true}

/* ===== state ===== */
let TRACK=null,CH=null,S=null,SYNC=null,syncTimer=null;
/* debounced progress writes still waiting to go (chapter, mock, final, listen state): a reload or a closed tab sends them right away with
   keepalive, so leaving the page (or switching to the test profile, which reloads) never drops a real change */
let SPEND={};function syncPending(){if(SYNC)Object.values(SPEND).forEach(([k,c])=>SYNC(k,c,true));SPEND={}}addEventListener("pagehide",syncPending);if(PROF.onLeave)PROF.onLeave.push(syncPending);
function freshRef(){return{step:-1,picks:{},m:{trust:50,conf:50,health:50},score:0,flags:{},dom:Object.fromEntries(DOMS.map(d=>[d,[0,0]]))}}
function freshFull(){return{pos:0,max:0,picks:{},m:{trust:50,conf:50,health:50},score:0,flags:{},dom:Object.fromEntries(DOMS.map(d=>[d,[0,0]])),drills:{},ex:null,quiz:null}}
function keyOf(tr,n){return COURSE.base+TRACKS[tr].key(n)}
function load(tr,n){const st=store.get("c"+keyOf(tr,n),null);if(st&&tr==="full")relayout(n,st);return st}
function persist(tr,n,st){store.set("c"+keyOf(tr,n),st);if(SYNC){const k=keyOf(tr,n),copy=JSON.parse(JSON.stringify(st));clearTimeout(syncTimer);syncTimer=setTimeout(()=>{delete SPEND[k];SYNC(k,copy)},400);SPEND[k]=[k,copy]}}
function save(){if(TRACK==="mock"){persistMock();return}if(TRACK==="full"&&CH&&S)S.lx=labsOf(CH).length?1:0;persist(TRACK,CH.num,S);store.set("cur",keyOf(TRACK,CH.num));store.set("lastplace."+COURSE.id,{t:TRACK,n:CH.num})}
function chapters(){return TRACKS[TRACK].list()}
function globalFlags(){const G={};if(TRACK!=="full")return G;chapters().forEach(c=>{if(c.num<CH.num){const st=load("full",c.num);if(st)Object.assign(G,st.flags||{})}});if(S&&S.flags)Object.assign(G,S.flags);return G}
function allStates(){const o={};chapters().forEach(c=>{o[c.num]=c.num===CH.num?S:load(TRACK,c.num)});return o}

/* ===== shared render helpers ===== */
function order(id,n){return window.HalcyonOrder.get(id,n)}
function buildOrders(){const groups=[];
  (DATA().ref||[]).forEach(c=>groups.push({key:"ref"+c.num+"dec",items:c.scenes.map(sc=>({id:sc.id,n:sc.opts.length,correct:sc.opts.findIndex(o=>o.best)}))}));
  (DATA().full||[]).forEach(c=>{groups.push({key:"full"+c.num+"dec",items:c.scenes.map(sc=>({id:sc.id,n:sc.opts.length,correct:sc.opts.findIndex(o=>o.best)}))});groups.push({key:"full"+c.num+"quiz",items:c.quiz.map((q,qi)=>({id:"q"+c.num+"_"+qi,n:q.opts.length,correct:q.a}))})});
  const mq=[];(DATA().mock||[]).forEach(p=>p.questions.forEach((q,i)=>mq.push({id:"mq"+p.part.slice(0,3)+i,n:q.opts.length,correct:q.a})));groups.push({key:"mockbank",items:mq});
  window.HalcyonOrder.build(groups)}
buildOrders();
/* The header the narration speaks before a prop's body, built exactly as tools/voices.mjs propSpeech builds it ("A text from Maisie.", "An email from X. Subject: Y.", a doc's title).
   Some of those words aren't on the screen ("A text from"), so narAttach must not count them as words another reader would see. */
const PSAY_MON={JAN:"January",FEB:"February",MAR:"March",APR:"April",MAY:"May",JUN:"June",JUL:"July",AUG:"August",SEP:"September",SEPT:"September",OCT:"October",NOV:"November",DEC:"December"};
function propSay(a){const tc=x=>String(x||"").toLowerCase().replace(/\b\w/g,c=>c.toUpperCase()),units=x=>String(x||"").replace(/(\d+)\s*min\b/gi,"$1 minutes").replace(/(\d+)\s*s\b/gi,"$1 seconds");
  if(a.type==="doc"&&a.kind==="vlog"){const tp=(a.title||"").split(/\s*·\s*/),who=a.name||(tp[0]?tc(tp[0]):a.from||"someone"),where=a.station||(tp[1]?tc(tp[1]):"");
    return [`A log from ${who}${where?`, ${where}`:""}.`,a.sol?`Sol ${a.sol}.`:"",a.delay?`One way, ${units(a.delay)}.`:"",a.margin?`Margin, ${a.margin}.`:""].filter(Boolean).join(" ")}
  if(a.type==="doc"&&a.kind==="consolelog")return `Ruth's console log. ${(a.title||"").split(/\s*·\s*/).map(x=>tc(x).replace(/\b[A-Z][a-z]{2,3}\b/g,w=>PSAY_MON[w.toUpperCase()]||w)).join(". ")}.`;
  if(a.type==="email")return `An email from ${a.from||"someone"}${a.subject?`. Subject: ${a.subject}`:""}.`;
  if(a.type==="chat")return `A message from ${a.from||"someone"}.`;
  if(a.type==="text")return `A text from ${a.from||"someone"}.`;
  if(a.type==="doc"||a.type==="chart")return a.title?a.title+".":"";
  return ""}
function propHTML(p){const h=propHTML0(p),m=p.match(/^<prop\s+([^>]*)>/);if(!m)return h;const a={};m[1].replace(/(\w+)="([^"]*)"/g,(_,k,v)=>a[k]=v);const say=propSay(a);return say?h.replace(/^<div class="prop/,`<div data-say="${esc(say)}" class="prop`):h}
function propHTML0(p){const m=p.match(/^<prop\s+([^>]*)>([\s\S]*)<\/prop>$/);if(!m)return `<p>${p}</p>`;const a={};m[1].replace(/(\w+)="([^"]*)"/g,(_,k,v)=>a[k]=v);const body=m[2];
  if(a.type==="email")return `<div class="prop pemail"><div class="ph"><b>${esc(a.subject||"(no subject)")}</b><span>${esc(a.time||"")}</span></div><div class="pm"><span>From: ${esc(a.from||"")}</span>${a.to?`<span>To: ${esc(a.to)}</span>`:""}</div><div class="pb">${body}</div></div>`;
  if(a.type==="chat")return `<div class="prop pchat"><div class="pav">${esc((a.from||"?")[0])}</div><div><div class="pm"><b>${esc(a.from||"")}</b> <span>${esc(a.time||"")}</span></div><div class="pb">${body}</div></div></div>`;
  if(a.type==="text")return `<div class="prop ptext"><div class="pm">${esc(a.from||"")} · ${esc(a.time||"")}</div><div class="bubble">${body}</div></div>`;
  if(a.type==="doc"&&a.kind==="vlog"){const tp=(a.title||"").split(/\s*·\s*/),tc=x=>String(x||"").toLowerCase().replace(/\b\w/g,c=>c.toUpperCase());const who=a.name||(tp[0]?tc(tp[0]):a.from||"Log"),where=a.station||(tp[1]?tc(tp[1]):"");
    const meta=[a.sol?`Sol ${esc(a.sol)}`:"",a.delay?`One way ${esc(a.delay)}`:""].filter(Boolean);
    return `<div class="prop pvlog" role="group" aria-label="${esc(who)}, recorded log"><div class="vh"><span class="vrec" aria-hidden="true"></span><span class="vwho"><b>${esc(who)}</b>${where?`<span>${esc(where)}</span>`:""}</span><span class="vtag">Recorded</span></div>${meta.length||a.margin?`<div class="vm">${meta.map(x=>`<span>${x}</span>`).join("")}${a.margin?`<span class="vmargin">Margin <b>${esc(a.margin)}</b></span>`:""}</div>`:""}<div class="pb">${body.split(/(?:<br\s*\/?>\s*){2,}/).map(x=>`<p>${x}</p>`).join("")}</div></div>`}
  if(a.type==="doc"&&a.kind==="consolelog")return `<div class="prop pconsole"><div class="ph"><b>${esc(a.title||"Console log")}</b></div><div class="pb">${body}</div></div>`;
  if(a.type==="doc")return `<div class="prop pdoc"><div class="ph"><b>${esc(a.title||"Document")}</b></div><div class="pb">${body}</div></div>`;
  if(a.type==="chart"){const num=x=>(x||"").split(",").map(Number).filter(v=>!isNaN(v));
    if(a.kind==="evm"){const pv=num(a.pv),ev=num(a.ev),ac=num(a.ac);const all=[...pv,...ev,...ac];const mx=Math.max(...all,1),n=Math.max(pv.length,ev.length,ac.length,2);
      const path=(arr)=>arr.map((v,i)=>`${i?"L":"M"}${40+i*(520/(n-1))} ${210-v/mx*180}`).join(" ");
      return `<div class="prop pchart"><div class="ph"><b>${esc(a.title||"Earned value")}</b></div><svg viewBox="0 0 600 240" role="img" aria-label="${esc(a.title||"chart")}"><path d="M40 210H580M40 20V210" stroke="currentColor" opacity=".3"/><path d="${path(pv)}" class="lpv"/><path d="${path(ev)}" class="lev"/><path d="${path(ac)}" class="lac"/></svg><div class="legend"><span class="kpv">Planned value</span><span class="kev">Earned value</span><span class="kac">Actual cost</span></div>${body?`<div class="pb">${body}</div>`:""}</div>`}
    const labels=(a.labels||"").split(","),vals=num(a.values),mx=Math.max(...vals,1);
    return `<div class="prop pchart"><div class="ph"><b>${esc(a.title||"Chart")}</b></div><div class="bars">${vals.map((v,i)=>`<div class="barrow"><span>${esc(labels[i]||"")}</span><span class="bt"><span style="width:${v/mx*100}%"></span></span><span class="num">${v}</span></div>`).join("")}</div>${body?`<div class="pb">${body}</div>`:""}</div>`}
  return `<p>${body}</p>`}
function caseHTML(cs){return `<div class="qcase"><div class="kicker">Case study</div><h3>${esc(cs.title||"Case")}</h3>${paras([].concat(cs.text||[]))}</div>`}
function caseBefore(cases,x,seen,tag){if(!x.case||!cases)return "";const k=(tag||"")+x.case;if(seen.has(k))return "";const cs=cases.find(c=>c.id===x.case);if(!cs)return "";seen.add(k);return caseHTML(cs)} // a case cluster's scenario, once, before its first question
function paras(arr){return `<div class="story">${arr.map(p=>/^<prop\s/.test(p)?propHTML(p):`<p>${p}</p>`).join("")}</div>`}
function videoCard(v,label){if(!v||!v[0])return "";return `<div class="video"><div class="vhead"><span class="tag dom">${label}</span><b>${esc(v[1])}</b><span class="prog">${esc(v[2])} · ${esc(v[3])}</span></div><div class="vframe"><button type="button" data-vid="${esc(v[0])}" aria-label="Play video: ${esc(v[1])}" style="background-image:url('https://i.ytimg.com/vi/${esc(v[0])}/hqdefault.jpg')"><span class="play">▶ Play here</span></button></div></div>`}
function wireVideos(){$("page").querySelectorAll("[data-vid]").forEach(b=>b.onclick=()=>{const f=document.createElement("iframe");f.src="https://www.youtube-nocookie.com/embed/"+b.dataset.vid+"?autoplay=1&rel=0";f.title=b.getAttribute("aria-label");f.allow="autoplay; encrypted-media; picture-in-picture; fullscreen";f.allowFullscreen=true;b.replaceWith(f)})}
function episodeCard(c){return ""}  // whole-chapter file now lives on the Listen page as a download link (10/10)
function episodeCardOld(c){if(!c.episode)return "";return `<div class="episode"><div class="prog">Whole chapter as one audio file · ${esc(c.episode.len)}</div><p class="prog" style="margin:4px 0 0">For the car or the gym. In the app, use the Listen button at the bottom of the screen instead.</p><audio controls preload="metadata" src="${esc(R(c.episode.src))}" onerror="this.closest('.episode').hidden=true"></audio></div>`}
function top(){window.scrollTo({top:0,behavior:"smooth"})}
function applyPick(st,sc,i,j){const o=sc.opts[j];st.picks[i]=j;st.score+=o.s;for(const k in (o.d||{}))st.m[k]=clamp(st.m[k]+o.d[k]);st.dom[sc.domain][0]+=o.s;st.dom[sc.domain][1]+=3;if(o.flag)st.flags[o.flag]=true;if(TRACK==="ref"&&CH.num===1&&i===0&&j===1)st.flags.allhands=true}
function sceneHTML(sc,i,n,picked,stateForText){
  const SM=TRACK==="full"&&STORY();let h=`<div class="kicker">Chapter ${CH.num} · ${SM?"What do you do?":`Decision ${i+1} of ${n}${sc.task&&TASKNAMES[sc.task]?` · ${sc.task} ${TASKNAMES[sc.task]}`:""}`}</div><h2>${esc(sc.title||sc.task)}</h2>${paras(sc.text(stateForText,allStates(),globalFlags()))}<div class="choices" role="group" aria-label="Choices">`;
  order(sc.id,sc.opts.length).forEach((j,pos)=>{const o=sc.opts[j];const cls=picked===undefined?"":(j===picked?"picked":"")+(o.best&&picked!==undefined?" best":"");h+=`<button class="choice ${cls}" data-j="${j}" type="button"${picked!==undefined?" disabled":""}><span class="k">${"ABCD"[pos]}</span><span>${o.t}</span></button>`});
  h+=`</div>`;
  if(picked!==undefined){const o=sc.opts[picked],best=sc.opts.find(x=>x.best),lead=LEADS()[o.s][i%3];
    const ruth=`<div class="mentor"><div class="who">${MENTOR_FULL()}</div>${paras([lead+" "+o.why])}${o.best?"":paras(["<b>The best answer:</b> "+best.t+" "+best.why])}<div class="tags"><span class="tag dom">${sc.domain}</span><span class="tag">${esc(sc.task&&TASKNAMES[sc.task]?sc.task+" "+TASKNAMES[sc.task]:sc.task)}</span></div></div>`;
    h+=`<div class="outcome">${SM?"":`<span class="verdict v${o.s}">${o.s===3?"Best answer · +3":o.s===1?"Partial · +1":"Missed · +0"}</span>`}${paras([o.after])}${SM?`<details class="ruthtake"><summary>${MENTOR()}'s take</summary>${ruth}</details>`:ruth}${SM?"":videoCard((CH.videos||{})[sc.id],"Watch")}<div class="bar"><button class="btn" id="next" type="button">Next</button><button class="btn ghost" id="redo" type="button">Redo this decision</button></div></div>`}
  return h;
}

/* ===== refresher track ===== */
function refRender(){
  const n=CH.scenes.length;
  if(S.step<0){
    $("page").innerHTML=chapterArt()+`<div class="kicker">Refresher · Chapter ${CH.num}</div><h1>${CH.title}</h1>${paras(CH.opening)}${episodeCard(CH)}<div class="bar"><button class="btn" id="go" type="button">Begin</button></div>`;
    $("go").onclick=()=>{S.step=0;save();render()};return}
  if(S.step>=n)return refEnd();
  const i=S.step,sc=CH.scenes[i];$("page").innerHTML=sceneHTML(sc,i,n,S.picks[i],S);wireVideos();
  if(S.picks[i]===undefined)$("page").querySelectorAll(".choice").forEach(b=>b.onclick=()=>{applyPick(S,sc,i,+b.dataset.j);save();render();const o=document.querySelector(".outcome");if(o)o.scrollIntoView({behavior:"smooth",block:"start"})});
  else{$("next").textContent=i+1<n?"Next":"Finish the chapter";$("next").onclick=()=>{S.step=i+1;save();render();top()};$("redo").onclick=()=>{const p={...S.picks};delete p[i];const st=freshRef();Object.keys(p).map(Number).sort((a,b)=>a-b).forEach(k=>applyPick(st,CH.scenes[k],k,p[k]));st.step=i;S=st;save();render();top()}}
}
function refEnd(){
  const n=CH.scenes.length,weak=DOMS.map(d=>[d,S.dom[d][1]?S.dom[d][0]/S.dom[d][1]:1]).sort((a,b)=>a[1]-b[1])[0];
  const missed=CH.scenes.map((sc,i)=>[sc,S.picks[i]]).filter(([sc,p])=>p!==undefined&&sc.opts[p].s<3);const nxt=chapters().find(c=>c.num===CH.num+1);
  $("page").innerHTML=`<div class="kicker">Refresher · Chapter ${CH.num} · Debrief</div><h1>${CH.title}</h1>${paras(CH.closing(S,allStates()))}
   <div class="end-grid"><div class="card"><h3>Score</h3><div class="big">${S.score}/${n*3}</div></div>${METERS_OF().map(([k,l])=>`<div class="card"><h3>${l}</h3><div class="big">${S.m[k]}</div></div>`).join("")}</div>
   <h2>What to study next</h2><div class="story"><p>Your weakest area this chapter was <b>${weak[0]}</b> at ${Math.round(weak[1]*100)} percent.${missed.length?" The decisions to revisit:":" You found the best answer every time."}</p></div>
   ${missed.length?`<ul class="story" style="padding-left:22px">${missed.map(([sc])=>`<li>${sc.task} (${sc.domain})</li>`).join("")}</ul>`:""}
   ${videoCard(CH.deeper,"Go deeper")}${episodeCard(CH)}
   <div class="bar">${nxt?`<button class="btn" id="nextch" type="button">Chapter ${nxt.num}: ${nxt.title}</button>`:""}<button class="btn ghost" id="replay" type="button">Replay chapter ${CH.num}</button></div>`;
  wireVideos();$("replay").onclick=()=>{S=freshRef();save();render();top()};if(nxt)$("nextch").onclick=()=>openChapter("ref",nxt.num);
}

/* ===== full course track ===== */
const STORY=()=>store.get("storymode",false);
function steps(c,lx){const out=stepsBase(c);if(lx===undefined?labsOf(c).length:lx){const e=out.findIndex(x=>x.k==="exercise");out.splice(e>=0?e+1:out.findIndex(x=>x.k==="quiz"),0,{k:"labs"})}return out}
function stepsBase(c){if(STORY()){const out=[{k:"open"}];c.scenes.forEach((sc,i)=>out.push({k:"scene",i}));out.push({k:"end"},{k:"lesson"});(c.drills||[]).forEach((d,j)=>out.push({k:"drill",j}));if(c.exercise)out.push({k:"exercise"});out.push({k:"quiz"});return out}
  const out=[{k:"open"},{k:"lesson"}];c.scenes.forEach((sc,i)=>{out.push({k:"scene",i});(c.drills||[]).forEach((d,j)=>{if(d.after===sc.id)out.push({k:"drill",j})});if(c.exercise&&c.exercise.after===sc.id)out.push({k:"exercise"})});out.push({k:"quiz"},{k:"end"});return out}
/* saved places are step indexes; when a chapter gains (or loses) its Labs step, map the old index to the same step in the new list (st.lx records which list it was saved with) */
function relayout(n,st){const c=TRACKS.full.list().find(x=>x.num===n);if(!c)return;const want=labsOf(c).length?1:0;if((st.lx||0)===want)return;
  const kf=x=>x?x.k+(x.i??x.j??""):"",a=steps(c,!!st.lx),b=steps(c,!!want),mp=p=>Math.max(0,b.findIndex(x=>kf(x)===kf(a[Math.min(p||0,a.length-1)])));st.pos=mp(st.pos);st.max=mp(st.max);st.lx=want}
function prefsNow(){return {story:!!STORY(),amb:!!AMB.on,ambvol:AMB.vol,at:Date.now()}}
function savePrefs(){lput({prefs:prefsNow()})}
function applyPrefs(p){if(!p)return;if(p.amb!==undefined){AMB.on=!!p.amb;store.set("amb",AMB.on)}if(p.ambvol){AMB.vol=p.ambvol;store.set("ambvol",AMB.vol)}ambUI();if(p.story!==undefined&&!!p.story!==!!STORY())setStoryMode(!!p.story,true);const t=$("storytoggle");if(t)t.checked=STORY()}
function setStoryMode(on,fromSync){const keyOf=st=>st?st.k+(st.i??st.j??""):"";let cur=null;if(TRACK==="full"&&CH&&S)cur=keyOf(steps(CH)[S.pos]);store.set("storymode",on);
  if(cur!==null){const ns=steps(CH);const idx=ns.findIndex(x=>keyOf(x)===cur);S.pos=Math.max(0,idx);S.max=Math.max(S.max||0,S.pos);save()}if(!fromSync)savePrefs();if(TRACK==="full"||TRACK==="ref")render()}
function fullGo(p){const L=steps(CH);store.set(`readat.${BID()}.${CH.num}`,Date.now());if(p>=L.length)p=L.findIndex(x=>x.k==="end");S.pos=p;S.max=Math.max(S.max||0,p);if(p>=L.length-1&&!S.doneAt)S.doneAt=new Date().toISOString();save();render();top()} // doneAt: the chapter's completion date, shown on the certificate
/* chapter sections: names, the lock rule (study items always open, story in order), and the list used by Contents, the side menu and ⏭ */
function secName(c,pid){if(pid==="open")return "Opening";if(pid==="labs")return "Labs";if(pid==="lesson")return LESSON();if(pid==="end")return "Chapter ending";const i=+String(pid).slice(1),sc=c&&c.scenes[i];return `Decision ${i+1}${sc?": "+(sc.title||sc.task):""}`}
function secLabel(c,x){return x.k==="scene"?secName(c,"s"+x.i):x.k==="drill"?`Drill: ${c.drills[x.j].title}`:x.k==="exercise"?`Exercise: ${c.exercise.title}`:x.k==="quiz"?"Quiz":x.k==="labs"?`Labs (${labsOf(c).length}, optional)`:secName(c,x.k)}
function secOpen(p){const x=steps(CH)[p];if(!x)return false;if(["open","lesson","drill","exercise","quiz","labs"].includes(x.k))return true;
  let f=CH.scenes.findIndex((_,i)=>S.picks[i]===undefined);if(f<0)f=CH.scenes.length; // first decision not yet answered
  return x.k==="scene"?x.i<=f:(f>=CH.scenes.length||p===S.pos)}
function secDone(x){return x.k==="scene"?S.picks[x.i]!==undefined:x.k==="drill"?!!(S.drills&&S.drills[x.j]):x.k==="exercise"?!!S.ex:x.k==="quiz"?!!S.quiz:x.k==="labs"?labsDone(CH,S):false}
function secListHTML(){return `<ol class="secs">${steps(CH).map((x,p)=>{const open=secOpen(p);return `<li><button type="button" class="sec${p===S.pos?" now":""}" data-sec="${p}" ${open?"":"disabled"}><span>${esc(secLabel(CH,x))}</span><span class="prog">${p===S.pos?"here":secDone(x)?"✓":open?"":"🔒"}</span></button></li>`}).join("")}</ol>`}
function fullRender(){
  const st=steps(CH),cur=st[Math.min(S.pos,st.length-1)];
  const phase=k=>({open:"Story",lesson:"Lesson",scene:"Decisions",drill:"Decisions",exercise:"Decisions",labs:"Decisions",quiz:"Quiz",end:"Debrief"})[k];
  const curPhase=STORY()?({open:"Story",scene:"Story",end:"Story",lesson:MENTOR()+"'s notes",drill:MENTOR()+"'s notes",exercise:MENTOR()+"'s notes",labs:MENTOR()+"'s notes",quiz:MENTOR()+"'s notes"})[cur.k]:phase(cur.k);const PH=STORY()?["Story",MENTOR()+"'s notes"]:["Story","Lesson","Decisions","Quiz","Debrief"];
  const phOf=k=>STORY()?({open:"Story",scene:"Story",end:"Story"}[k]||MENTOR()+"'s notes"):phase(k);const phStart=ph=>{const a=st.map((x,p)=>p).filter(p=>phOf(st[p].k)===ph&&secOpen(p));return a.length?(a.includes(S.pos)?S.pos:a.filter(p=>p<=S.max).pop()??a[0]):-1};
  const chmap=`<ol class="chmap" aria-label="Chapter steps">${PH.map((p,i)=>{const idx=PH.indexOf(curPhase),to=phStart(p);return `<li class="${p===curPhase?"now":i<idx?"done":""}"><button type="button" class="phbtn" data-ph="${to}" ${to<0?"disabled":""}>${p}</button></li>`}).join("")}</ol>`;
  const nav=chmap+`<div class="stepnav">${st.map((x,i)=>`<button type="button" class="sdot ${i===S.pos?"now":""} ${i<=S.max?"seen":""}" data-p="${i}" title="${esc(secLabel(CH,x))}" aria-label="${esc(secLabel(CH,x))}" ${secOpen(i)?"":"disabled"}></button>`).join("")}</div><details class="contents"><summary>Contents · ${esc(secLabel(CH,cur))}</summary>${secListHTML()}</details>`;
  let h=nav;
  if(cur.k==="open"){
    h+=chapterArt()+`<div class="kicker">${esc(CH.part)} · Chapter ${CH.num} · ${esc(CH.weeks)}</div><h1>${CH.title}</h1>${STORY()?"":`<div class="tags" style="margin-bottom:12px">${(CH.tasks||[]).map(t=>`<span class="tag dom">${t} ${TASKNAMES[t]||""}</span>`).join("")}</div>`}${paras(CH.opening.map(p=>p))}${episodeCard(CH)}<div class="bar"><button class="btn" id="fnext" type="button">${STORY()?"Continue the story":"Next: the lesson"}</button></div>`;
  }else if(cur.k==="lesson"){
    const L=CH.lesson;h+=`<div class="kicker">Chapter ${CH.num} · The lesson · ${LESSON()}</div><h1>${esc(L.title)}</h1><p class="lessonintro">${COURSE.lessonIntro||`${esc(LESSON())} is the lesson: the ideas behind this chapter, before you make the decisions.`}</p>`+L.sections.map(s=>`<section class="lesson"><h2>${esc(s.h)}</h2>${paras(s.body)}${s.terms&&s.terms.length?`<dl class="terms">${s.terms.map(([t,d])=>`<dt>${t}</dt><dd>${d}</dd>`).join("")}</dl>`:""}${s.exam?`<div class="examtip"><b>How the exam asks it.</b> ${s.exam}</div>`:""}</section>`).join("")+videoCard(L.video,"Lesson video")+`<div class="bar"><button class="btn" id="fnext" type="button">Next: the decisions</button></div>`;
  }else if(cur.k==="scene"){
    const i=cur.i,sc=CH.scenes[i];h+=sceneHTML(sc,i,CH.scenes.length,S.picks[i],S);
  }else if(cur.k==="drill"){
    const d=CH.drills[cur.j],ans=S.drills[cur.j];
    h+=`<div class="kicker">Chapter ${CH.num} · Math drill</div><h2>${esc(d.title)}</h2>${paras(d.setup)}${d.table?`<div class="tablewrap"><table>${d.table.map((r,ri)=>`<tr>${r.map(c=>ri?`<td>${c}</td>`:`<th>${c}</th>`).join("")}</tr>`).join("")}</table></div>`:""}
     <form class="drill" id="drillform" novalidate>${d.fields.map((f,fi)=>{const got=ans&&ans.vals[fi];const ok=ans?ans.ok[fi]:null;return `<label for="df${fi}">${f.label}<input id="df${fi}" inputmode="decimal" ${ans?"disabled":""} value="${got!==undefined&&got!==null?esc(got):""}">${ans?`<span class="pill ${ok?"p-ok":"p-bad"}">${ok?"Correct":"Answer: "+f.answer}</span>`:""}</label>`}).join("")}
     ${ans?"":`<button class="btn" type="submit">Check</button>`}</form>
     ${ans?`<div class="mentor"><div class="who">Worked solution</div>${paras(d.solution)}</div><div class="bar"><button class="btn" id="fnext" type="button">Continue</button><button class="btn ghost" id="dretry" type="button">Try again</button></div>`:""}`;
  }else if(cur.k==="exercise"){
    const e=CH.exercise,ans=S.ex;
    h+=`<div class="kicker">Chapter ${CH.num} · Exercise</div><h2>${esc(e.title)}</h2>${paras([e.intro])}<form id="exform" novalidate>${e.items.map((it,ii)=>`<div class="exitem"><p>${it.prompt}</p><select id="ex${ii}" ${ans?"disabled":""}><option value="">Choose</option>${it.choices.map((c,ci)=>`<option value="${ci}" ${ans&&ans.v[ii]===ci?"selected":""}>${esc(c)}</option>`).join("")}</select>${ans?`<span class="pill ${ans.v[ii]===it.answer?"p-ok":"p-bad"}">${ans.v[ii]===it.answer?"Correct":"Answer: "+esc(it.choices[it.answer])}</span><p class="prog">${it.why}</p>`:""}</div>`).join("")}${ans?"":`<button class="btn" type="submit">Check my answers</button>`}</form>${ans?`<div class="bar"><button class="btn" id="fnext" type="button">Continue</button><button class="btn ghost" id="exretry" type="button">Try again</button></div>`:""}`;
  }else if(cur.k==="labs"){
    h+=`<div class="kicker">Chapter ${CH.num} · Labs · optional</div><h1>Hands-on labs</h1><p class="labsintro">Practice with real tools and real data. It's optional: nothing here locks the story or counts toward your score. Get it right, or miss three times, and you'll see the worked answer.</p>${labsOf(CH).map(l=>`<section class="lab" id="lab-${esc(l.id)}"></section>`).join("")}<div class="bar"><button class="btn" id="fnext" type="button">Continue</button></div>`;
  }else if(cur.k==="quiz"){
    const q=CH.quiz,ans=S.quiz,cseen=new Set();
    h+=`<div class="kicker">Chapter ${CH.num} · Exam-style quiz</div><h2>${q.length} questions</h2><p class="prog">Answer them all, then check. Written like the real exam.</p><form id="quizform" novalidate>${q.map((x,qi)=>{const ord=order("q"+CH.num+"_"+qi,x.opts.length);return `${caseBefore(CH.cases,x,cseen)}<fieldset class="qitem"><legend><span class="qn">${qi+1}.</span> ${x.q}</legend>${ord.map((oi,pos)=>{const chosen=ans&&ans.v[qi]===oi;const right=ans&&oi===x.a;return `<label class="qopt ${ans?(right?"qright":chosen?"qwrong":""):""}"><input type="radio" name="q${qi}" value="${oi}" ${ans?"disabled":""} ${chosen?"checked":""}><span class="k">${"ABCD"[pos]}</span> ${x.opts[oi]}</label>`}).join("")}${ans?`<p class="qwhy"><b>${ans.v[qi]===x.a?"Correct.":"Not quite."}</b> ${x.why} <span class="tag">${x.task} ${TASKNAMES[x.task]||""}</span></p>`:""}</fieldset>`}).join("")}${ans?"":`<div id="qerr"></div><button class="btn" type="submit">Check my answers</button>`}</form>${ans?`<div class="callout"><b>Quiz score: ${ans.right} of ${q.length}</b> (${Math.round(ans.right/q.length*100)} percent).</div><div class="bar"><button class="btn" id="fnext" type="button">Finish the chapter</button><button class="btn ghost" id="qretry" type="button">Retake the quiz</button></div>`:""}`;
  }else{
    const n=CH.scenes.length,nxt=chapters().find(c=>c.num===CH.num+1);
    const dr=(CH.drills||[]).length,drOk=Object.values(S.drills||{}).reduce((a,x)=>a+(x.ok.every(Boolean)?1:0),0);
    const weak=DOMS.map(d=>[d,S.dom[d][1]?S.dom[d][0]/S.dom[d][1]:1]).sort((a,b)=>a[1]-b[1])[0];
    h+=`<div class="kicker">${esc(CH.part)} · Chapter ${CH.num} · Debrief</div><h1>${CH.title}</h1>${paras(CH.closing(S,allStates(),globalFlags()))}
     <div class="end-grid"><div class="card"><h3>Decisions</h3><div class="big">${S.score}/${n*3}</div></div><div class="card"><h3>Quiz</h3><div class="big">${S.quiz?S.quiz.right+"/"+CH.quiz.length:"·"}</div></div>${dr?`<div class="card"><h3>Drills</h3><div class="big">${drOk}/${dr}</div></div>`:""}${METERS_OF().map(([k,l])=>`<div class="card"><h3>${l}</h3><div class="big">${S.m[k]}</div></div>`).join("")}</div>
     <div class="story"><p>Weakest area this chapter: <b>${weak[0]}</b> at ${Math.round(weak[1]*100)} percent, counting decisions and quiz together.</p></div>
     ${episodeCard(CH)}<div class="bar">${STORY()&&S.pos<steps(CH).length-1?`<button class="btn ghost" id="fnext" type="button">${MENTOR()}'s notes (optional)</button>`:""}${nxt?`<button class="btn" id="nextch" type="button">Chapter ${nxt.num}: ${nxt.title}</button>`:`${COURSE.final?`<button class="btn" id="tofinal" type="button">Take the final assessment</button>`:""}${hasMock()?`<button class="btn${COURSE.final?" ghost":""}" id="tomock" type="button">Take the practice exam</button>`:""}`}<button class="btn ghost" id="replay" type="button">Replay chapter ${CH.num}</button></div>`;
  }
  $("page").innerHTML=h;wireVideos();if(cur.k==="labs")labsMount();
  $("page").querySelectorAll(".sdot[data-p]").forEach(b=>b.onclick=()=>fullGo(+b.dataset.p));
  $("page").querySelectorAll("[data-ph]").forEach(b=>b.onclick=()=>{const p=+b.dataset.ph;if(p>=0&&p!==S.pos)fullGo(p)});
  const nx=$("fnext");if(nx)nx.onclick=()=>fullGo(S.pos+1);
  if(cur.k==="scene"){const i=cur.i,sc=CH.scenes[i];
    if(S.picks[i]===undefined)$("page").querySelectorAll(".choice").forEach(b=>b.onclick=()=>{applyPick(S,sc,i,+b.dataset.j);save();render();const o=document.querySelector(".outcome");if(o)o.scrollIntoView({behavior:"smooth",block:"start"})});
    else{$("next").onclick=()=>fullGo(S.pos+1);$("redo").onclick=()=>{const p={...S.picks};delete p[i];const keep={pos:S.pos,max:S.max,drills:S.drills,ex:S.ex,quiz:S.quiz,labs:S.labs,lx:S.lx};const st=freshFull();Object.keys(p).map(Number).sort((a,b)=>a-b).forEach(k=>applyPick(st,CH.scenes[k],k,p[k]));Object.assign(st,keep);if(st.quiz)st.quiz.v.forEach((v,qi)=>{const x=CH.quiz[qi];st.dom[x.domain][1]+=3;if(v===x.a)st.dom[x.domain][0]+=3});S=st;save();render();top()}}}
  if(cur.k==="drill"){const d=CH.drills[cur.j];const f=$("drillform");if(f)f.onsubmit=e=>{e.preventDefault();const vals=d.fields.map((_,fi)=>$("df"+fi).value.replace(/[$,%\s]/g,""));const ok=d.fields.map((fl,fi)=>{const v=parseFloat(vals[fi]);return !isNaN(v)&&Math.abs(v-fl.answer)<=(fl.tol??0.01)});S.drills[cur.j]={vals,ok};save();render()};const r=$("dretry");if(r)r.onclick=()=>{delete S.drills[cur.j];save();render()}}
  if(cur.k==="exercise"){const e=CH.exercise;const f=$("exform");if(f)f.onsubmit=ev=>{ev.preventDefault();const v=e.items.map((_,ii)=>{const x=$("ex"+ii).value;return x===""?-1:+x});S.ex={v,right:v.filter((x,ii)=>x===e.items[ii].answer).length};save();render()};const r=$("exretry");if(r)r.onclick=()=>{S.ex=null;save();render()}}
  if(cur.k==="quiz"){const q=CH.quiz;const f=$("quizform");if(f)f.onsubmit=ev=>{ev.preventDefault();const v=q.map((_,qi)=>{const c=document.querySelector(`input[name=q${qi}]:checked`);return c?+c.value:-1});const miss=v.filter(x=>x<0).length;if(miss&&!confirm(`${miss} unanswered. Check anyway?`))return;S.quiz={v,right:v.filter((x,qi)=>x===q[qi].a).length};v.forEach((x,qi)=>{const d=q[qi].domain;S.dom[d][1]+=3;if(x===q[qi].a)S.dom[d][0]+=3});save();render();top()};const r=$("qretry");if(r)r.onclick=()=>{S.quiz.v.forEach((x,qi)=>{const d=q[qi].domain;S.dom[d][1]-=3;if(x===q[qi].a)S.dom[d][0]-=3});S.quiz=null;save();render();top()}}
  const nc=$("nextch");if(nc){const nxt=chapters().find(c=>c.num===CH.num+1);nc.onclick=()=>openChapter("full",nxt.num)}
  const tm=$("tomock");if(tm)tm.onclick=()=>openMock();const tf=$("tofinal");if(tf)tf.onclick=()=>openFinal();
  const rp=$("replay");if(rp)rp.onclick=()=>{if(confirm(`Replay chapter ${CH.num} from the start? This clears its decisions, drills, and quiz. Labs you finished stay finished.`)){const lb=S.labs;S=freshFull();if(lb)S.labs=lb;save();render();top()}};
}

/* ===== labs: the Labs step's lab cards (lab.js draws them), completion, and the Labs waiting list ===== */
function labsDone(c,st){const L=labsOf(c);return !L.length||(!!window.HalcyonLab&&L.every(l=>HalcyonLab.done(l,((st||{}).labs||{})[l.id])))}
function labsMount(){const L=labsOf(CH);S.labs=S.labs||{};if(!window.HalcyonLab)return;L.forEach((l,k)=>{const el=document.getElementById("lab-"+l.id);if(el)HalcyonLab.mount(el,l,S.labs[l.id]||(S.labs[l.id]={q:{}}),{R,paras,mentor:MENTOR_FULL(),k,n:L.length,
  save:(lab,st,justDone)=>{save();if(labsDone(CH,S))labUnqueue(CH.num);if(justDone){renderRail();const ct=$("page").querySelector(".contents .secs");if(ct)ct.outerHTML=secListHTML()}}})})}
/* the Audiobook can't do a lab, so listening to a chapter that has one saves it here (in the synced listening record) until it's done */
function labsWaiting(){const q=lget().labq||[];return TRACKS.full.list().filter(c=>q.includes(c.num)&&labsOf(c).length&&!labsDone(c,c.num===(TRACK==="full"&&CH?CH.num:-1)?S:load("full",c.num)))}
function labQueue(n){const c=TRACKS.full.list().find(x=>x.num===n);if(!c||!labsOf(c).length||labsDone(c,load("full",n)))return;const q=lget().labq||[];if(!q.includes(n))lput({labq:[...q,n].sort((a,b)=>a-b)},true)}
function labUnqueue(n){const q=lget().labq||[];if(q.includes(n))lput({labq:q.filter(x=>x!==n)},true)}
function openLabs(n){openChapter("full",n);const p=steps(CH).findIndex(x=>x.k==="labs");if(p>=0)fullGo(p)}
function labWaitHTML(){const W=labsWaiting();if(!W.length)return "";return `<div class="nextstep labwait"><span class="prog">🧪 Labs waiting</span><p>Hands-on labs from chapters you listened to. They need a screen and a few taps, so they wait here until you're ready.</p>${W.map(c=>{const n=labsOf(c).length;return `<button class="btn small" type="button" data-labs="${c.num}">Ch ${c.num} · ${esc(c.title)} · ${n} lab${n>1?"s":""}</button>`}).join("")}</div>`}
function wireLabWait(){$("page").querySelectorAll("[data-labs]").forEach(b=>b.onclick=()=>openLabs(+b.dataset.labs))}
function labMention(c){const n=labsOf(c).length;if(!n)return "";const L=`${n} hands-on lab${n>1?"s":""}`;return `<p class="prog blab">🧪 ${labsDone(c,load("full",c.num))?L+", done":(lget().labq||[]).includes(c.num)?L+" in Labs waiting. Not read aloud.":L+". Not read aloud; it waits in Labs waiting."}</p>`}

/* ===== mock exam =====
   Forms: a course can carry more than one full practice exam. A mock part belongs to form n when it has form:n, or when its part name
   starts "Mn:" (CPHIMS "M1: Practice exam 1", "M2: Practice exam 2"). A part with neither is form 1, so a bank split into parts by
   domain (PMP's People, Process and Business Environment, CISA's five domains) stays one exam. A form's name is the part's formName,
   or the text after "Mn:", and the picker appears only when there are two or more forms.
   Saved state: form 1 keeps the keys every course has always used (base+900 the attempt in progress, base+901 finished attempts), so
   progress saved before forms existed needs no migration. Form n from 2 up uses base+910+2(n-2) and the key after it (form 2: 910 and 911).
   The server records 901 and up as side records, never as a place to resume, so resume reads lastplace.<course> {t:"mock",f}.
   Pretest items: an item with scored:false is mixed in unmarked. It doesn't count toward the score, the domain and subdomain breakdown,
   the task history or readiness, and the results page tags it. Handbook mode, offered only when a form has unscored items, runs just the
   scored items in the course's mockMinutes, with no breaks. Old history rows have no f (form 1) and no pre. For most courses their total is
   already the scored count, but CPHIMS rows saved before 2026-10-12 counted all 115 items, pretest included; they stay as saved, and
   mastery() leaves out the byTask of any row with no pre whose total is above its form's scored count. */
let MS=null,mockTimer=null,MOCK_FORM=1;
const MOCK_WEAK=70; // results: an area below this percent gets a reread pointer
function MOCK_LIMIT(){return (COURSE.mockMinutes||240)*60}
function partForm(p){if(p&&p.form!=null&&Number.isInteger(+p.form)&&+p.form>=1)return +p.form;const m=/^M(\d+):/.exec((p&&p.part)||"");return m&&+m[1]>=1?+m[1]:1}
function mockQuestions(f){const all=[];(DATA().mock||[]).forEach(p=>{if(!p||!p.questions)return;const pf=partForm(p);if(f!=null&&pf!==f)return;p.questions.forEach((q,i)=>all.push({...q,id:p.part.slice(0,3)+i,form:pf}))});return all}
function mockForms(){const m=new Map();(DATA().mock||[]).forEach(p=>{if(!p||!p.questions||!p.questions.length)return;const f=partForm(p);if(!m.has(f))m.set(f,{f,label:p.formName||(/^M\d+:\s*(.+)$/.exec(p.part||"")||[])[1]||`Practice exam ${f}`})});return [...m.values()].sort((a,b)=>a.f-b.f)}
function formLabel(f){const x=mockForms().find(x=>x.f===f);return x?x.label:`Practice exam ${f}`}
function multiForm(){return mockForms().length>1}
function mockKey(f){f=f||MOCK_FORM||1;return COURSE.base+(f===1?900:910+2*(f-2))}
function mockHistKey(f){return mockKey(f)+1}
function mockHist(f){const H=store.get("c"+mockHistKey(f),null);return H&&Array.isArray(H.list)?H.list:[]}
function mockHistAll(){const fs=[1,...mockForms().map(x=>x.f).filter(f=>f!==1)];const out=[];fs.forEach(f=>mockHist(f).forEach(a=>out.push({...a,f:a.f||f})));return out.sort((a,b)=>String(a.at).localeCompare(String(b.at)))}
const scoredQ=q=>q.scored!==false;
const MODE_NAME={exam:"Exam mode",practice:"Practice mode",handbook:"Handbook mode"};
function hasMock(){return mockQuestions().length>0} // a course whose bank is still being written offers no mock anywhere: no card button, no chapter end button, no plan line, no readiness card
const MOCK_SOON="Coming soon. The practice exam for this course is still being written.";
function freshMock(mode){const qs=mockQuestions(MOCK_FORM).filter(q=>mode!=="handbook"||scoredQ(q));const seed=Date.now()%100000;const ord=window.HalcyonOrder.perm("mock"+seed,qs.length).map(i=>qs[i].id);return{mode,form:MOCK_FORM,order:ord,ans:{},flagged:{},cur:0,elapsed:0,breaksTaken:[],onBreak:null,submitted:false,startedAt:new Date().toISOString()}}
// a saved attempt, with any question the bank no longer has dropped (an attempt with none left is no attempt)
function loadMock(f){const st=store.get("c"+mockKey(f),null);if(!st||!Array.isArray(st.order))return null;const ids=new Set(mockQuestions(f).map(q=>q.id));const order=st.order.filter(id=>ids.has(id));if(!order.length)return null;if(order.length!==st.order.length){const keep=new Set(order),prune=o=>Object.fromEntries(Object.entries(o||{}).filter(([k])=>keep.has(k)));st.order=order;st.ans=prune(st.ans);st.flagged=prune(st.flagged);st.cur=Math.min(st.cur||0,order.length-1)}return st}
function persistMock(){const f=MOCK_FORM||1,k=mockKey(f);if(MS&&MS.order&&!MS.submitted)store.set("lastplace."+COURSE.id,{t:"mock",f});store.set("c"+k,MS);store.set("cur",COURSE.base+900);if(SYNC){const copy=JSON.parse(JSON.stringify(MS));clearTimeout(syncTimer);syncTimer=setTimeout(()=>{delete SPEND[k];SYNC(k,copy)},600);SPEND[k]=[k,copy]}}
// f: the form to open. Left out with two or more forms, it opens the picker; with one form, that form.
function openMock(f){clearInterval(mockTimer);TRACK="mock";const forms=mockForms();
  if(!forms.some(x=>x.f===f))f=forms.length>1?null:(forms[0]?forms[0].f:1);if(hasMock()){libTouch(f==null?{t:"mock"}:{t:"mock",f});store.set("track","mock")}MOCK_FORM=f;MS=f==null?null:loadMock(f);render();top()}
function fmtTime(s){s=Math.max(0,Math.round(s));const h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;return `${h}:${String(m).padStart(2,"0")}:${String(x).padStart(2,"0")}`}
function mockTick(){clearInterval(mockTimer);if(!MS||MS.submitted||MS.mode==="practice")return;mockTimer=setInterval(()=>{if(document.hidden||MS.onBreak!==null)return;MS.elapsed++;const t=$("mocktime");if(t)t.textContent=fmtTime(MOCK_LIMIT()-MS.elapsed);if(MS.elapsed%15===0)persistMock();if(MS.elapsed>=MOCK_LIMIT()){mockSubmit()}},1000)}
function lastLine(last){return last?`Last attempt: <b>${last.right} of ${last.total}</b> (${last.total?Math.round(last.right/last.total*100):0}%) on ${new Date(last.at).toLocaleDateString("en-US",{month:"short",day:"numeric"})}.`:""}
function mockPicker(forms){
  $("page").innerHTML=`<div class="kicker">Practice Exam</div><h1>${esc(COURSE.mockTitle||"Practice exam")}</h1><div class="story"><p>${["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine"][forms.length]||forms.length} full practice exams. Each one has its own questions and keeps its own history. ${esc(COURSE.mockBlurb||"")}</p></div>
   <div class="grid2">${forms.map(x=>{const st=loadMock(x.f),inprog=!!(st&&!st.submitted),last=mockHist(x.f).slice(-1)[0];
     return `<div class="card mockform" data-formcard="${x.f}"><h3>${esc(x.label)}</h3><p>${inprog?"In progress. ":""}${last?lastLine(last):"You haven't taken this one yet."}</p><button class="btn" type="button" data-form="${x.f}">${inprog?"Continue":"Open"} ${esc(x.label)}</button></div>`}).join("")}</div>`;
  $("page").querySelectorAll("[data-form]").forEach(b=>b.onclick=()=>openMock(+b.dataset.form))}
function mockRender(){
  const forms=mockForms(),multi=forms.length>1;
  if(!forms.length){$("page").innerHTML=`<div class="kicker">Practice Exam</div><h1>${esc(COURSE.mockTitle||"Practice exam")}</h1><div class="story"><p>${MOCK_SOON}</p></div><div class="bar"><button class="btn ghost" id="mockhome" type="button">Back to the course</button></div>`;$("mockhome").onclick=()=>{TRACK=null;renderHome();renderRail();top()};return}
  if(!forms.some(x=>x.f===MOCK_FORM)){if(multi){MOCK_FORM=null;MS=null;return mockPicker(forms)}MOCK_FORM=forms[0].f;MS=loadMock(MOCK_FORM)}
  const qs=mockQuestions(MOCK_FORM);const byId={};qs.forEach(q=>byId[q.id]=q);
  const label=formLabel(MOCK_FORM),back=multi?`<button class="linkbtn" type="button" id="allforms">All practice exams</button> › `:"";
  if(!MS){const sc=qs.filter(scoredQ).length,pre=qs.length-sc,mins=Math.round(MOCK_LIMIT()/60),brk=(COURSE.mockBreaks||[]).length?`, optional breaks after questions ${COURSE.mockBreaks.join(" and ")}`:"";
    $("page").innerHTML=`<div class="kicker">${back}Practice Exam</div><h1>${esc(multi?label:(COURSE.mockTitle||"Practice exam"))}</h1><div class="story"><p>${qs.length} questions${pre?`, ${sc} of them scored`:""}. ${esc(COURSE.mockBlurb||"")}</p></div>
    <div class="grid2"><div class="card"><h3>Exam mode</h3><p>${mins} minutes, the timer runs${brk}, results and explanations at the end.${pre?` All ${qs.length} questions. ${pre} of them are unscored pretest items mixed in like the ones on the real exam, and the results show which.`:""}</p><button class="btn" id="exam" type="button">Start exam mode</button></div>${pre&&sc?`<div class="card"><h3>Handbook mode</h3><p>Only the ${sc} scored questions in ${mins} minutes, the timer runs. The ${pre} pretest items are left out.</p><button class="btn ghost" id="handbook" type="button">Start handbook mode</button></div>`:""}<div class="card"><h3>Practice mode</h3><p>No timer. See the answer and ${MENTOR()}'s explanation after each question.</p><button class="btn ghost" id="practice" type="button">Start practice mode</button></div></div>`;
    const go=mode=>()=>{MS=freshMock(mode);persistMock();render()};
    $("exam").onclick=go("exam");$("practice").onclick=go("practice");if($("handbook"))$("handbook").onclick=go("handbook");if($("allforms"))$("allforms").onclick=()=>openMock();return}
  if(MS.submitted)return mockResults(byId);
  if(MS.onBreak!==null){$("page").innerHTML=`<h1>Break</h1><div class="story"><p>You've finished question ${MS.onBreak}. Take up to 10 minutes. The exam timer is paused. On the real exam you can't go back to earlier questions after a break.</p></div><div class="bar"><button class="btn" id="resume" type="button">Resume the exam</button></div>`;$("resume").onclick=()=>{MS.breaksTaken.push(MS.onBreak);MS.onBreak=null;persistMock();render()};return}
  const i=Math.min(MS.cur||0,MS.order.length-1),q=byId[MS.order[i]],chosen=MS.ans[q.id],showAns=MS.mode==="practice"&&chosen!==undefined;
  const ord=order("mq"+q.id,q.opts.length);
  $("page").innerHTML=`<div class="kicker">Practice exam · ${multi?esc(label)+" · ":""}${MODE_NAME[MS.mode]||"Exam mode"} · Question ${i+1} of ${MS.order.length}</div>
   <fieldset class="qitem" data-qid="${esc(q.id)}"><legend>${q.q}</legend>${ord.map((oi,pos)=>`<label class="qopt ${showAns?(oi===q.a?"qright":oi===chosen?"qwrong":""):""}"><input type="radio" name="mq" value="${oi}" ${chosen===oi?"checked":""} ${showAns?"disabled":""}><span class="k">${"ABCD"[pos]}</span> ${q.opts[oi]}</label>`).join("")}
   ${showAns?`<p class="qwhy"><b>${chosen===q.a?"Correct.":"Not quite."}</b> ${q.why} <span class="tag">${q.task} ${TASKNAMES[q.task]||""}</span></p>`:""}</fieldset>
   <div class="bar"><button class="btn ghost" id="prev" type="button" ${i===0?"disabled":""}>Back</button><button class="btn" id="nextq" type="button">${i+1<MS.order.length?"Next":"Review and submit"}</button><label class="chk"><input type="checkbox" id="flagq" ${MS.flagged[q.id]?"checked":""}> Flag for review</label></div>
   <details class="navgrid"><summary>All questions (${Object.keys(MS.ans).length} answered, ${Object.values(MS.flagged).filter(Boolean).length} flagged)</summary><div>${MS.order.map((id,k)=>`<button type="button" data-q="${k}" class="nq ${MS.ans[id]!==undefined?"done":""} ${MS.flagged[id]?"flag":""} ${k===i?"now":""}">${k+1}</button>`).join("")}</div></details>
   <div class="bar"><button class="btn ghost" id="submitnow" type="button">Submit exam</button></div>`;
  $("page").querySelectorAll("input[name=mq]").forEach(r=>r.onchange=()=>{MS.ans[q.id]=+r.value;persistMock();if(MS.mode==="practice")render()});
  $("flagq").onchange=e=>{MS.flagged[q.id]=e.target.checked;persistMock()};
  $("prev").onclick=()=>{MS.cur=Math.max(0,i-1);persistMock();render()};
  $("nextq").onclick=()=>{if(i+1>=MS.order.length){if(confirm(`Submit the exam? ${MS.order.length-Object.keys(MS.ans).length} unanswered.`))mockSubmit();return}MS.cur=i+1;if(MS.mode==="exam"&&(COURSE.mockBreaks||[]).includes(i+1)&&!MS.breaksTaken.includes(i+1))MS.onBreak=i+1;persistMock();render();top()};
  $("page").querySelectorAll("[data-q]").forEach(b=>b.onclick=()=>{MS.cur=+b.dataset.q;persistMock();render()});
  $("submitnow").onclick=()=>{if(confirm(`Submit now? ${MS.order.length-Object.keys(MS.ans).length} unanswered.`))mockSubmit()};
  mockTick();
}
function mockSubmit(){clearInterval(mockTimer);MS.submitted=true;MS.finishedAt=new Date().toISOString();persistMock();
  const byId={};mockQuestions(MOCK_FORM).forEach(q=>byId[q.id]=q);const byTask={};let right=0,ans=0,total=0,pre=0;
  MS.order.forEach(id=>{const q=byId[id];if(!q)return;if(!scoredQ(q)){pre++;return}total++;if(MS.ans[id]===undefined)return;ans++;byTask[q.task]=byTask[q.task]||[0,0];byTask[q.task][1]++;if(MS.ans[id]===q.a){right++;byTask[q.task][0]++}});
  const k=mockHistKey(),H=store.get("c"+k,null)||{list:[]};if(!Array.isArray(H.list))H.list=[];H.list.push({at:MS.finishedAt,mode:MS.mode,f:MOCK_FORM||1,right,answered:ans,total,pre,byTask,secs:MS.elapsed});store.set("c"+k,H);if(SYNC)SYNC(k,H);
  render();top()}
/* subdomains and reread pointers. An item's subdomain is its sub field, or meta.SUBDOMS keyed by its task code without the trailing number
   (CPHIMS "SA4" is "SA", Analysis). The chapters for a task are meta.TASK_CHAPTERS[task] when the course lists them (a list can name
   chapters not written yet), or else the written chapters that teach it (taughtIn: a chapter's tasks list or a decision's task, the way PMP
   is tagged). */
function subOf(q){return q.sub||((COURSE_META().SUBDOMS||{})[String(q.task||"").replace(/\d+$/,"")])||null}
function COURSE_META(){return COURSE.id==="pmp"?PMP_META:(((window.HALCYON_DATA||{})[COURSE.id]||{}).meta||{})}
function chaptersFor(t){const M=COURSE_META().TASK_CHAPTERS;if(M&&Array.isArray(M[t]))return M[t].slice();return taughtIn(t).map(x=>x.c.num)}
function rereadFor(missed){const n={};missed.forEach(q=>chaptersFor(q.task).forEach(c=>n[c]=(n[c]||0)+1));return Object.entries(n).map(([c,k])=>[+c,k]).sort((a,b)=>b[1]-a[1]||a[0]-b[0]).slice(0,3).map(([c])=>c)}
function mockResults(byId){
  const all=MS.order.map(id=>byId[id]).filter(Boolean),qs=all.filter(scoredQ),pre=all.length-qs.length,ok=q=>MS.ans[q.id]===q.a;const right=qs.filter(ok).length;
  const dom={},task={},sub={};qs.forEach(q=>{const s=subOf(q),sk=q.domain+"\u0000"+s;dom[q.domain]=dom[q.domain]||[0,0];task[q.task]=task[q.task]||[0,0];dom[q.domain][1]++;task[q.task][1]++;if(s){sub[sk]=sub[sk]||[0,0];sub[sk][1]++}if(ok(q)){dom[q.domain][0]++;task[q.task][0]++;if(s)sub[sk][0]++}});
  const pct=x=>x[1]?Math.round(x[0]/x[1]*100):0;
  const weakTasks=Object.entries(task).sort((a,b)=>pct(a[1])-pct(b[1])).slice(0,5);
  // subdomains in the order meta.SUBDOMS lists them, then any others in the order they appear
  const subOrder=Object.values(COURSE_META().SUBDOMS||{});const subsOf=d=>Object.keys(sub).filter(k=>k.split("\u0000")[0]===d).map(k=>k.split("\u0000")[1]).sort((a,b)=>{const ia=subOrder.indexOf(a),ib=subOrder.indexOf(b);return (ia<0?99:ia)-(ib<0?99:ib)});
  const subDoms=DOMS.filter(d=>subsOf(d).length);
  const areas=[];DOMS.forEach(d=>{if(!dom[d])return;if(subsOf(d).length)subsOf(d).forEach(s=>areas.push({name:s,dom:d,x:sub[d+"\u0000"+s],has:q=>q.domain===d&&subOf(q)===s}));else areas.push({name:d,x:dom[d],has:q=>q.domain===d})});
  const weak=areas.filter(a=>a.x[1]&&pct(a.x)<MOCK_WEAK).sort((a,b)=>pct(a.x)-pct(b.x));
  const written=n=>TRACKS.full.list().find(c=>c.num===n);
  const reread=a=>{const chs=rereadFor(qs.filter(q=>a.has(q)&&!ok(q)));return chs.length?chs.map(n=>{const c=written(n);return c?`<button class="linkbtn" type="button" data-lesson="${n}">Reread chapter ${n}, ${esc(c.title)}</button>`:`<span class="soon">coming in chapter ${n}</span>`}).join("; "):"no chapter covers these tasks yet"};
  const multi=multiForm(),label=formLabel(MOCK_FORM);
  $("page").innerHTML=`<div class="kicker">${multi?`<button class="linkbtn" type="button" id="allforms">All practice exams</button> › `:""}Practice exam · ${multi?esc(label)+" · ":""}Results</div><h1>${right} of ${qs.length} (${qs.length?Math.round(right/qs.length*100):0} percent)</h1>
   <div class="story"><p>${esc(COURSE.mockPassNote||(COURSE.id==="pmp"?"PMI doesn't publish a passing score. Many instructors treat 75 percent or better on full-length practice exams as a sign you're ready.":"Aim for a comfortable margin on full-length practice exams before you book the real one."))} ${MS.mode!=="practice"?`Time used: ${fmtTime(MS.elapsed)}.`:""}</p>
   ${pre?`<p id="prenote">Your score and the breakdown below count the ${qs.length} scored questions. The other ${pre} were unscored pretest items, tagged in the review below.</p>`:MS.mode==="handbook"?`<p id="prenote">Handbook mode: the ${qs.length} scored questions only.</p>`:""}</div>
   <div class="end-grid">${DOMS.map(d=>`<div class="card"><h3>${d}</h3><div class="big">${dom[d]?pct(dom[d]):0}%</div><p class="prog">${dom[d]?dom[d][0]+" of "+dom[d][1]:""}</p></div>`).join("")}</div>
   ${subDoms.map(d=>`<h2>${esc(d)} by subdomain</h2><div class="end-grid subgrid">${subsOf(d).map(s=>{const x=sub[d+"\u0000"+s];return `<div class="card"><h3>${esc(s)}</h3><div class="big">${pct(x)}%</div><p class="prog">${x[0]} of ${x[1]}</p></div>`}).join("")}</div>`).join("")}
   <h2>What to reread</h2>${weak.length?`<ul class="story reread" style="padding-left:22px">${weak.map(a=>`<li><b>${esc(a.name)}</b>${a.dom?` (${esc(a.dom)})`:""}, ${pct(a.x)} percent: ${reread(a)}.</li>`).join("")}</ul>`:`<div class="story reread"><p>Every area is at ${MOCK_WEAK} percent or better. Keep taking full practice exams to hold it there.</p></div>`}
   <h2>Weakest tasks</h2><ul class="story" style="padding-left:22px">${weakTasks.map(([t,x])=>`<li>${t} ${TASKNAMES[t]||""}: ${x[0]} of ${x[1]}</li>`).join("")}</ul>
   <h2>Review</h2><details><summary>Show every question with explanations</summary>${all.map((q,k)=>`<div class="qitem${scoredQ(q)?"":" unscored"}"><p><b>${k+1}.</b> ${scoredQ(q)?"":`<span class="tag pre">Unscored pretest item</span> `}${q.q}</p><p class="${ok(q)?"qright":"qwrong"}">Your answer: ${MS.ans[q.id]!==undefined?q.opts[MS.ans[q.id]]:"none"}</p>${ok(q)?"":`<p class="qright">Correct: ${q.opts[q.a]}</p>`}<p class="qwhy">${q.why} <span class="tag">${q.task}</span></p></div>`).join("")}</details>
   <div class="bar"><button class="btn" id="again" type="button">Take ${multi?esc(label)+" again":"a new practice exam"}</button>${multi?`<button class="btn ghost" id="allforms2" type="button">All practice exams</button>`:""}</div>`;
  const pg=$("page");
  pg.querySelectorAll("[data-lesson]").forEach(b=>b.onclick=()=>openLesson(+b.dataset.lesson));
  [$("allforms"),$("allforms2")].forEach(b=>{if(b)b.onclick=()=>openMock()});
  $("again").onclick=()=>{if(confirm("Start a new practice exam? Your results above will be replaced.")){const k=mockKey();MS=null;store.set("c"+k,null);if(SYNC)SYNC(k,{});render()}};
}


/* ===== final assessment and certificate of completion (PMP, 2026-10-11) =====
   The end-of-course assessment rides the mock exam's code path: the same question shape (final/pmp.js, like mock/*.js), one question per
   screen with Back, Next, flags and the question grid, and results by domain with a full review. What's different: no timer, a pass mark
   (COURSE.finalPass, 70 percent), and a fresh question order and option order for every attempt (order.js perm and build, keyed by the
   attempt id, so answer positions stay balanced). It opens once every Full Course chapter is done. "Preview it anyway" lets a tester in
   early, and a preview attempt never earns a certificate.
   Stored like other progress, at base+906 and synced: {cur: the attempt in progress or null, list: finished attempts (newest last), name}.
   Each finished attempt keeps the study log total at the moment it was submitted (hours are read from the log at base+905, rounded down to
   a tenth, never estimated), and a verification code: the first 16 hex digits of SHA-256 over "attempt id|date|hours". */
let FS=null,FINAL_SHOW=null;
function FINAL_KEY(){return COURSE.base+906}
function finalGet(){const F=store.get("c"+FINAL_KEY(),null);return F&&typeof F==="object"?{cur:F.cur||null,list:Array.isArray(F.list)?F.list:[],name:F.name||""}:{cur:null,list:[],name:""}}
function finalPut(F,now){F.at=Date.now();if(F.list.length>30)F.list=F.list.slice(-30);F.list.forEach((a,i)=>{if(i<F.list.length-3){delete a.order;delete a.ans}}); // the server takes 60000 characters: only the last 3 attempts keep their answers for review
  store.set("c"+FINAL_KEY(),F);if(SYNC){const k=FINAL_KEY(),c=JSON.parse(JSON.stringify(F));clearTimeout(finalPut.t);finalPut.t=setTimeout(()=>{delete SPEND[k];SYNC(k,c,!!now)},now?0:600);SPEND[k]=[k,c]}}
function finalQuestions(){const all=[];(window.HALCYON_FINAL||[]).forEach(p=>p.questions.forEach((q,i)=>all.push({...q,id:p.part.slice(0,3)+i})));return all}
function finalById(){const m={};finalQuestions().forEach(q=>m[q.id]=q);return m}
function courseDone(){const L=TRACKS.full.list(),n=Math.max(L.length,COURSE.planned||0),done=L.filter(c=>chapterProgress("full",c)==="done").length;return {done,n,all:n>0&&done===n}}
async function finalLoad(){if(!COURSE.final)return false;if(!window.HALCYON_FINAL)await loadScripts([R(COURSE.final)]);return !!window.HALCYON_FINAL}
async function openFinal(){clearInterval(mockTimer);TRACK="final";store.set("track","final");await finalLoad();FS=finalGet().cur;FINAL_SHOW=null;render();top()}
async function openCert(){clearInterval(mockTimer);TRACK="cert";await finalLoad();render();top()}
function finalId(){return "HL-"+Date.now().toString(36).toUpperCase()+"-"+Math.random().toString(36).slice(2,5).toUpperCase().padEnd(3,"0")}
function freshFinal(preview){const qs=finalQuestions(),id=finalId(),O=window.HalcyonOrder;
  O.build([{key:"final"+id,items:qs.map(q=>({id:"fo"+id+q.id,n:q.opts.length,correct:q.a}))}]);const opt={};qs.forEach(q=>opt[q.id]=O.get("fo"+id+q.id,q.opts.length));
  return {id,order:O.perm("final"+id,qs.length).map(i=>qs[i].id),opt,ans:{},flagged:{},cur:0,preview:!!preview,startedAt:new Date().toISOString()}}
function finalSaveCur(){const F=finalGet();F.cur=FS;finalPut(F)}
/* SHA-256 (FIPS 180-4), small and synchronous so the certificate and the #verify page compute the same code anywhere */
function sha256(str){const rr=(x,n)=>(x>>>n)|(x<<(32-n)),P=[];for(let c=2;P.length<64;c++)if(P.every(p=>c%p))P.push(c);
  const frac=x=>((x-Math.floor(x))*4294967296)>>>0,K=P.map(p=>frac(Math.cbrt(p)));let H=P.slice(0,8).map(p=>frac(Math.sqrt(p)));
  const b=new TextEncoder().encode(str),l=b.length,n=((l+9+63)>>6)<<6,m=new Uint8Array(n);m.set(b);m[l]=0x80;const dv=new DataView(m.buffer);dv.setUint32(n-4,(l*8)>>>0);dv.setUint32(n-8,Math.floor(l*8/4294967296));
  const w=new Uint32Array(64);for(let o=0;o<n;o+=64){for(let i=0;i<16;i++)w[i]=dv.getUint32(o+i*4);for(let i=16;i<64;i++){const a=w[i-15],c=w[i-2];w[i]=(w[i-16]+(rr(a,7)^rr(a,18)^(a>>>3))+w[i-7]+(rr(c,17)^rr(c,19)^(c>>>10)))>>>0}
    let [A,B,C,D,E,F,G,J]=H;for(let i=0;i<64;i++){const t1=(J+(rr(E,6)^rr(E,11)^rr(E,25))+((E&F)^(~E&G))+K[i]+w[i])>>>0,t2=((rr(A,2)^rr(A,13)^rr(A,22))+((A&B)^(A&C)^(B&C)))>>>0;J=G;G=F;F=E;E=(D+t1)>>>0;D=C;C=B;B=A;A=(t1+t2)>>>0}
    H=[A,B,C,D,E,F,G,J].map((x,i)=>(x+H[i])>>>0)}return H.map(x=>x.toString(16).padStart(8,"0")).join("")}
function finalCode(id,date,hours){return sha256(`${String(id).trim().toUpperCase()}|${date}|${hours}`).slice(0,16).toUpperCase().match(/.{4}/g).join("-")}
function logHoursNow(){const R=logRows(COURSE),secs=R.length?R[R.length-1].run:0;return {secs,hours:(Math.floor(secs/360)/10).toFixed(1),from:R.length?R[0].d:"",to:R.length?R[R.length-1].d:""}} // rounded down to a tenth of an hour
function longDay(d){const [y,m,x]=String(d).split("-").map(Number);return new Date(y,m-1,x).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}
function finalSubmit(){const byId=finalById(),F=finalGet(),pass=COURSE.finalPass||70;let right=0;const dom={},task={};
  FS.order.forEach(id=>{const q=byId[id];if(!q)return;dom[q.domain]=dom[q.domain]||[0,0];task[q.task]=task[q.task]||[0,0];dom[q.domain][1]++;task[q.task][1]++;if(FS.ans[id]===q.a){right++;dom[q.domain][0]++;task[q.task][0]++}});
  const total=FS.order.length,date=dayKey(Date.now()),L=logHoursNow();
  const a={id:FS.id,at:new Date().toISOString(),date,right,total,pass:right*100>=pass*total,preview:!!FS.preview,dom,task,secs:L.secs,hours:L.hours,logFrom:L.from,logTo:L.to,code:finalCode(FS.id,date,L.hours),order:FS.order,ans:FS.ans};
  F.list.push(a);F.cur=null;finalPut(F,true);FS=null;FINAL_SHOW=a.id;render();top()}
function finalPct(x){return x&&x[1]?Math.round(x[0]/x[1]*100):0}
/* chapters to revisit: each missed question's task, mapped to the chapters that teach it (taughtIn), most misses first */
function finalRevisit(a){const miss={};Object.entries(a.task||{}).forEach(([t,[g,n]])=>{if(n>g)miss[t]=n-g});const ch={};
  Object.entries(miss).forEach(([t,k])=>taughtIn(t).forEach(({c})=>{const e=ch[c.num]||(ch[c.num]={c,n:0,tasks:[]});e.n+=k;e.tasks.push(t)}));
  return Object.values(ch).sort((x,y)=>y.n-x.n||x.c.num-y.c.num).slice(0,5)}
function openLesson(n){openChapter("full",n);const p=steps(CH).findIndex(x=>x.k==="lesson");if(p>=0){S.max=Math.max(S.max||0,p);fullGo(p)}}
function finalRender(){setTimeout(ambSync,0); // render() runs navSync; a deferred one here could undo a hash change made right after a confirm dialog
  $("railgame").hidden=true;$("mockcard").hidden=true;
  const qs=finalQuestions(),byId=finalById(),F=finalGet(),cd=courseDone(),pass=COURSE.finalPass||70;
  if(!COURSE.final||!qs.length){$("page").innerHTML=`<div class="kicker">Final assessment</div><h1>Final assessment</h1><div class="story"><p>This course doesn't have a final assessment yet.</p></div>`;return}
  if(FINAL_SHOW){const a=F.list.find(x=>x.id===FINAL_SHOW);if(a)return finalResults(a,byId);FINAL_SHOW=null}
  if(!FS){const last=F.list[F.list.length-1],cert=certAttempt();
    $("page").innerHTML=`<div class="kicker">${esc(COURSE.full_title||COURSE.title)} · Final assessment</div><h1>Final assessment</h1>
     <div class="story"><p>${qs.length} questions, weighted like the PMP exam outline: People, Process, and Business Environment, with predictive, agile, and hybrid situations mixed in. You need ${pass} percent to pass.</p><p>No timer. Retake it as many times as you want, and every attempt mixes up the question order and the answer order. At the end you get a score for each exam area, a list of chapters to go back to, and the reasoning behind every answer.</p></div>
     ${cd.all?"":`<div class="callout finallock"><b>It opens when you've finished all ${cd.n} chapters.</b> You've finished ${cd.done} so far. <button class="linkbtn" type="button" id="fpreview">Preview it anyway</button> <span class="prog">(a preview attempt doesn't count toward the certificate)</span></div>`}
     ${cd.all?`<div class="bar"><button class="btn" type="button" id="fstart">${F.list.length?"Take it again":"Start the final assessment"}</button>${last?`<button class="btn ghost" type="button" id="flast">See your last results</button>`:""}${cert?`<button class="btn ghost" type="button" id="fcert">Your certificate</button>`:""}</div>`:last?`<div class="bar"><button class="btn ghost" type="button" id="flast">See your last results</button></div>`:""}
     ${finalHistHTML(F.list)}`;
    const st=$("fstart");if(st)st.onclick=()=>{FS=freshFinal(false);finalSaveCur();render();top()};
    const pv=$("fpreview");if(pv)pv.onclick=()=>{FS=freshFinal(true);finalSaveCur();render();top()};
    const fl=$("flast");if(fl)fl.onclick=()=>{FINAL_SHOW=last.id;render();top()};const fc=$("fcert");if(fc)fc.onclick=()=>openCert();return}
  const i=Math.min(FS.cur||0,FS.order.length-1),q=byId[FS.order[i]];if(!q){FS=null;finalSaveCur();return finalRender()}
  const chosen=FS.ans[q.id],ord=FS.opt[q.id]||[...Array(q.opts.length).keys()];
  $("page").innerHTML=`<div class="kicker">Final assessment${FS.preview?" · Preview":""} · Question ${i+1} of ${FS.order.length}</div>
   <fieldset class="qitem" data-qid="${esc(q.id)}"><legend>${q.q}</legend>${ord.map((oi,pos)=>`<label class="qopt"><input type="radio" name="fq" value="${oi}" ${chosen===oi?"checked":""}><span class="k">${"ABCD"[pos]}</span> ${q.opts[oi]}</label>`).join("")}</fieldset>
   <div class="bar"><button class="btn ghost" id="fprev" type="button" ${i===0?"disabled":""}>Back</button><button class="btn" id="fnextq" type="button">${i+1<FS.order.length?"Next":"Review and submit"}</button><label class="chk"><input type="checkbox" id="fflag" ${FS.flagged[q.id]?"checked":""}> Flag for review</label></div>
   <details class="navgrid"><summary>All questions (${Object.keys(FS.ans).length} answered, ${Object.values(FS.flagged).filter(Boolean).length} flagged)</summary><div>${FS.order.map((id,k)=>`<button type="button" data-fq="${k}" class="nq ${FS.ans[id]!==undefined?"done":""} ${FS.flagged[id]?"flag":""} ${k===i?"now":""}">${k+1}</button>`).join("")}</div></details>
   <div class="bar"><button class="btn ghost" id="fsubmit" type="button">Submit the assessment</button><button class="linkbtn" id="fquit" type="button">Save and leave</button></div>`;
  const left=()=>FS.order.length-Object.keys(FS.ans).length;
  $("page").querySelectorAll("input[name=fq]").forEach(r=>r.onchange=()=>{FS.ans[q.id]=+r.value;finalSaveCur()});
  $("fflag").onchange=e=>{FS.flagged[q.id]=e.target.checked;finalSaveCur()};
  $("fprev").onclick=()=>{FS.cur=Math.max(0,i-1);finalSaveCur();render()};
  $("fnextq").onclick=()=>{if(i+1>=FS.order.length){if(confirm(left()?`Submit now? ${left()} unanswered.`:"Submit the assessment?"))finalSubmit();return}FS.cur=i+1;finalSaveCur();render();top()};
  $("page").querySelectorAll("[data-fq]").forEach(b=>b.onclick=()=>{FS.cur=+b.dataset.fq;finalSaveCur();render()});
  $("fsubmit").onclick=()=>{if(confirm(left()?`Submit now? ${left()} unanswered.`:"Submit the assessment?"))finalSubmit()};
  $("fquit").onclick=()=>{finalSaveCur();FS=null;render();top()}}
function finalHistHTML(list){if(!list.length)return "";return `<h2>Your attempts</h2><div class="tablewrap"><table><tr><th>Date</th><th>Score</th><th>Result</th></tr>${list.slice().reverse().map(a=>`<tr><td>${esc(logDay(a.date))}</td><td class="num">${a.right}/${a.total} (${Math.round(a.right/a.total*100)}%)</td><td>${a.pass?"Passed":"Not yet"}${a.preview?" · preview":""}</td></tr>`).join("")}</table></div>`}
function finalResults(a,byId){const pct=Math.round(a.right/a.total*100),pass=COURSE.finalPass||70,rv=finalRevisit(a),qs=(a.order||[]).map(id=>byId[id]).filter(Boolean),cert=a.pass&&!a.preview;
  $("page").innerHTML=`<div class="kicker">Final assessment · Results${a.preview?" · Preview":""}</div><h1>${a.pass?"You passed":"Not this time"}: ${a.right} of ${a.total} (${pct} percent)</h1>
   <div class="story"><p>${a.pass?(cert?`That's at or above the ${pass} percent pass mark. Your certificate of completion is ready.`:`That's at or above the ${pass} percent pass mark. This was a preview attempt, so it doesn't earn the certificate. Finish all the chapters, then take it for real.`):`You need ${pass} percent. Reread the chapters listed below and try again. Next time the questions come in a different order, and so do the answers.`}</p></div>
   <div class="end-grid">${DOMS.map(d=>`<div class="card"><h3>${esc(d)}</h3><div class="big">${finalPct(a.dom[d])}%</div><p class="prog">${a.dom[d]?a.dom[d][0]+" of "+a.dom[d][1]:""}</p></div>`).join("")}</div>
   <h2>Chapters to revisit</h2>${rv.length?`<ul class="story finalrv">${rv.map(e=>`<li><button class="linkbtn" type="button" data-flesson="${e.c.num}">Chapter ${e.c.num}, ${esc(e.c.title)}</button>: ${e.n} missed on ${esc([...new Set(e.tasks)].map(t=>t+" "+(TASKNAMES[t]||"")).join(", "))}</li>`).join("")}</ul>`:`<div class="story"><p>You didn't miss anything. Nothing to revisit.</p></div>`}
   <div class="bar">${cert?`<button class="btn" type="button" id="fcert">See your certificate</button>`:""}<button class="btn${cert?" ghost":""}" type="button" id="fagain">Take it again</button><button class="btn ghost" type="button" id="fback">Back</button></div>
   ${qs.length?`<h2>Review</h2><details class="finalreview"><summary>Show every question with explanations</summary>${qs.map((q,k)=>`<div class="qitem"><p><b>${k+1}.</b> ${q.q}</p><p class="${a.ans[q.id]===q.a?"qright":"qwrong"}">Your answer: ${a.ans[q.id]!==undefined?q.opts[a.ans[q.id]]:"none"}</p>${a.ans[q.id]===q.a?"":`<p class="qright">Correct: ${q.opts[q.a]}</p>`}<p class="qwhy">${q.why} <span class="tag">${q.task} ${esc(TASKNAMES[q.task]||"")}</span></p></div>`).join("")}</details>`:""}`;
  $("page").querySelectorAll("[data-flesson]").forEach(b=>b.onclick=()=>openLesson(+b.dataset.flesson));
  const fc=$("fcert");if(fc)fc.onclick=()=>openCert();
  $("fagain").onclick=()=>{FINAL_SHOW=null;FS=freshFinal(a.preview&&!courseDone().all);finalSaveCur();render();top()};
  $("fback").onclick=()=>{FINAL_SHOW=null;render();top()}}
function certAttempt(){const L=finalGet().list.filter(a=>a.pass&&!a.preview);return L[L.length-1]||null}
function certNameGet(F){return store.get("certname."+COURSE.id,"")||F.name||USERNAME||""}
function renderCert(){setTimeout(ambSync,0);$("railgame").hidden=true;$("mockcard").hidden=true;
  const c=COURSE,a=certAttempt(),F=finalGet();
  if(!a){$("page").innerHTML=`<div class="kicker">Certificate of completion</div><h1>No certificate yet</h1><div class="story"><p>The certificate comes from passing the final assessment after you've finished every chapter. ${courseDone().all?"You've finished them all, so you're ready.":`You've finished ${courseDone().done} of ${courseDone().n} chapters.`}</p></div><div class="bar"><button class="btn" type="button" id="tofinal">Open the final assessment</button></div>`;$("tofinal").onclick=()=>openFinal();return}
  const name=certNameGet(F),ver=location.origin+"/#verify",H=+a.hours,noH=!(H>0),noHText=(a.secs>0?"Less than a tenth of an hour was recorded in this course's study log":"Hours weren't recorded in this course's study log"); // an empty study log certifies no hours: say so, never "0.0 hours"
  const chs=TRACKS.full.list().map(ch=>{const st=load("full",ch.num);return `<li><span>${ch.num}. ${esc(ch.title)}</span><span class="certdate">${st&&st.doneAt?esc(logDay(dayKey(st.doneAt))):"date not recorded"}</span></li>`}).join("");
  $("page").innerHTML=`<div class="bar noprint" style="margin-top:0"><button class="btn ghost small" type="button" id="certback">Back to progress</button><button class="btn" type="button" id="certprint">Print or save as PDF</button></div>
   <div class="certform noprint"><label for="certname">Your name, as it should appear on the certificate<input id="certname" autocomplete="name" maxlength="80" value="${esc(name)}"></label>
    ${SYNC?`<label class="chk"><input type="checkbox" id="certsave" ${F.name?"checked":""}> Save this name with my account</label>`:""}
    <p class="prog">We save it on this device${SYNC?" (and to your account, if you check the box)":""}. Put the same name you'll use on your PMI application.</p>
    <p class="prog">PMI's PMP application asks for 35 hours of project management training. ${noH?`${noHText}, so the certificate shows no study hours.`:`Your study log showed <b>${esc(a.hours)} hours</b> when you passed.`} The hours here come only from that log and are never rounded up. Whether this course counts is PMI's call.</p></div>
   <article class="certdoc" aria-label="Certificate of completion">
    <p class="certkick">Halcyon</p><h1 class="certh">Certificate of Completion</h1>
    <p class="certlead">This documents that</p><p class="certname" id="certnameout">${name?esc(name):`<span class="logblank"></span>`}</p>
    <p class="certlead">completed the self-paced course</p><p class="certcourse">${esc(c.certCourse||c.full_title||c.title)}</p>
    <dl class="facts certfacts"><dt>Completed</dt><dd>${esc(longDay(a.date))}, the date of the passing final assessment</dd>
     <dt>Study hours</dt><dd>${noH?noHText:`${esc(a.hours)} ${H===1?"hour":"hours"}, as recorded in the course's study log${a.logFrom?` (${esc(logDay(a.logFrom))} to ${esc(logDay(a.logTo))})`:""}`}</dd>
     <dt>Final assessment</dt><dd>Passed, ${a.right} of ${a.total} (${Math.round(a.right/a.total*100)} percent). The pass mark is ${COURSE.finalPass||70} percent.</dd>
     ${c.certFormat?`<dt>Format</dt><dd>${esc(c.certFormat)}</dd>`:""}${c.certPrepares?`<dt>Prepares for</dt><dd>${esc(c.certPrepares)}</dd>`:""}<dt>Provider</dt><dd>Halcyon, ${esc(location.host||"halcyon-launch.vercel.app")}</dd></dl>
    <p class="certstate">${esc(c.certStatement||"This certificate documents completion of a self-paced course, with hours as recorded in the course's study log.")}</p>
    <h2 class="certh2">Chapters completed</h2><ol class="certch">${chs}</ol>
    <div class="certver"><p><b>Verification code</b> <span class="certcode">${esc(a.code)}</span></p><p>Attempt ${esc(a.id)} · ${esc(a.date)} · ${noH?`Hours (for the check): ${esc(a.hours)}`:`${esc(a.hours)} hours`}</p><p>To check it, enter those three values and the code at ${esc(ver)}. A changed date, hours figure or attempt ID won't match.</p></div>
    <p class="certfine">${esc(c.certIndependence||"")} ${esc(c.certMarks||c.marks||"")}</p>
   </article>`;
  const inp=$("certname"),out=$("certnameout");inp.oninput=()=>{const v=inp.value.trim();store.set("certname."+c.id,v);out.innerHTML=v?esc(v):`<span class="logblank"></span>`;const sv=$("certsave");if(sv&&sv.checked){const G=finalGet();G.name=v;finalPut(G)}};
  const sv=$("certsave");if(sv)sv.onchange=()=>{const G=finalGet();G.name=sv.checked?inp.value.trim():"";finalPut(G,true)};
  $("certback").onclick=()=>{renderDash();top()};$("certprint").onclick=()=>window.print()}
/* #verify: anyone with the link can check a certificate's code, signed in or not. It recomputes the hash in the browser, so it catches an
   edited date, hours figure or attempt ID. It isn't a signature: it can't prove who took the course. */
function renderVerify(){setTimeout(ambSync,0);TRACK="verify";$("railgame").hidden=true;$("mockcard").hidden=true;
  $("page").innerHTML=`<div class="kicker">Halcyon</div><h1>Check a certificate</h1><div class="story"><p>Type the attempt ID, the date, the hours, and the verification code exactly as the certificate shows them.</p></div>
   <form class="certform" id="verform" novalidate><label for="v-id">Attempt ID<input id="v-id" autocomplete="off" placeholder="HL-..."></label><label for="v-date">Date (year-month-day)<input id="v-date" autocomplete="off" placeholder="2026-10-11"></label><label for="v-hours">Hours<input id="v-hours" inputmode="decimal" autocomplete="off"></label><label for="v-code">Verification code<input id="v-code" autocomplete="off"></label><button class="btn" type="submit">Check</button></form>
   <div id="verout" aria-live="polite"></div><p class="prog">This check catches a changed date, hours figure, or attempt ID. It can't prove who took the course, so it isn't a signature.</p>`;
  $("verform").onsubmit=e=>{e.preventDefault();const id=$("v-id").value.trim(),d=$("v-date").value.trim(),h=$("v-hours").value.trim(),code=$("v-code").value.trim().toUpperCase().replace(/[^0-9A-F]/g,"");
    const ok=!!(id&&d&&h&&code)&&finalCode(id,d,(+h).toFixed(1)).replace(/-/g,"")===code;
    $("verout").innerHTML=ok?`<div class="callout verok"><b>It matches.</b> The code fits that attempt, date, and hours.</div>`:`<div class="callout verbad"><b>It doesn't match.</b> At least one of the four values isn't what was issued. Check for typos first.</div>`};navSync()}
function finalHomeHTML(){if(!COURSE.final)return "";const cd=courseDone(),F=finalGet(),last=F.list[F.list.length-1],cert=certAttempt();
  return `<h2>Final assessment</h2><div class="card mockhome"><p>100 questions, ${COURSE.finalPass||70} percent to pass. Pass it to get your certificate of completion. ${cd.all?"":`It opens when you've finished all ${cd.n} chapters (${cd.done} done).`} ${last?`Last attempt: <b>${last.right} of ${last.total}</b>, ${last.pass?"passed":"not yet"}.`:""}</p><button class="btn" type="button" id="finalbtn">Open the final assessment</button>${cert?` <button class="btn ghost" type="button" id="certbtn">Your certificate</button>`:""}</div>`}
function wireFinalHome(){const b=$("finalbtn");if(b)b.onclick=()=>openFinal();const c=$("certbtn");if(c)c.onclick=()=>openCert()}
function finalDashHTML(){if(!COURSE.final)return "";const F=finalGet(),cd=courseDone(),cert=certAttempt();
  const rows=F.list.slice().reverse().map(a=>`<tr><td>${esc(logDay(a.date))}</td><td class="num">${a.right}/${a.total} (${Math.round(a.right/a.total*100)}%)</td><td>${a.pass?"Passed":"Not yet"}${a.preview?" · preview":""}</td><td class="num">${esc(a.hours)}</td></tr>`).join("");
  return `<h2>Final assessment</h2><p class="prog">${cd.all?`All ${cd.n} chapters done, so it's unlocked. Pass it and you'll get the certificate of completion.`:`It opens when you've finished all ${cd.n} chapters. You've finished ${cd.done}. Pass it and you'll get the certificate of completion.`}</p>${rows?`<div class="tablewrap"><table><tr><th>Date</th><th>Score</th><th>Result</th><th>Logged hours</th></tr>${rows}</table></div>`:""}<div class="bar"><button class="btn small" type="button" id="finalbtn">Open the final assessment</button>${cert?`<button class="btn small ghost" type="button" id="certbtn">Your certificate</button>`:""}</div>`}

/* ===== progress dashboard, practice sets, study plan ===== */
function ALLT(){return Object.keys(TASKNAMES)}
function mastery(){
  const m={};ALLT().forEach(t=>m[t]={got:0,max:0,n:0});
  const add=(t,g,mx)=>{if(!m[t])return;m[t].got+=g;m[t].max+=mx;m[t].n++};
  TRACKS.full.list().forEach(c=>{const st=c.num===(CH&&TRACK==="full"?CH.num:-1)?S:load("full",c.num);if(!st)return;
    c.scenes.forEach((sc,i)=>{const p=(st.picks||{})[i];if(p!==undefined)add(sc.task,sc.opts[p].s,3)});
    if(st.quiz)c.quiz.forEach((q,qi)=>{if(st.quiz.v[qi]>=0)add(q.task,st.quiz.v[qi]===q.a?3:0,3)})});
  mockHistAll().filter(a=>a.pre!==undefined||!(a.total>mockQuestions(a.f).filter(scoredQ).length&&mockQuestions(a.f).some(q=>!scoredQ(q)))).forEach(a=>Object.entries(a.byTask||{}).forEach(([t,[g,n]])=>{if(m[t]){m[t].got+=g*3;m[t].max+=n*3;m[t].n+=n}}));
  const P=store.get("c"+(COURSE.base+902),null);Object.entries((P&&P.tasks)||{}).forEach(([t,[g,n]])=>{if(m[t]){m[t].got+=g*3;m[t].max+=n*3;m[t].n+=n}});
  return m;
}
const pctOf=x=>x.max?Math.round(x.got/x.max*100):null;
function taughtIn(t){const out=[];TRACKS.full.list().forEach(c=>{const sc=c.scenes.map((x,i)=>[x,i]).filter(([x])=>x.task===t);if((c.tasks||[]).includes(t)||sc.length)out.push({c,scenes:sc.map(([,i])=>i)})});return out}
function videosFor(t){const v=[];taughtIn(t).forEach(({c})=>{if(c.lesson&&c.lesson.video&&c.lesson.video[0])v.push([c.lesson.video,c])});return v}
function weakTasks(m,k){return ALLT().filter(t=>m[t].n>=2).map(t=>[t,pctOf(m[t])]).sort((a,b)=>a[1]-b[1]).slice(0,k)}
function studyPlan(m){
  const weak=weakTasks(m,3).filter(([,p])=>p<80),plan=[];
  const nextCh=TRACKS.full.list().find(c=>{const st=load("full",c.num);return !st||(!st.doneAt&&(st.pos||0)<steps(c).length-1)});
  if(nextCh)plan.push(["Keep the story moving",`Full Course chapter ${nextCh.num}, ${nextCh.title}. Read ${LESSON()} and play the decisions.`,{open:nextCh.num}]);
  weak.forEach(([t,p])=>{const where=taughtIn(t)[0];plan.push([`Shore up ${t} ${TASKNAMES[t]} (${p}%)`,where?`Re-read the chapter ${where.c.num} lesson, then do 10 practice questions on this task.`:`Do 10 practice questions on this task.`,{task:t}])});
  const H={list:mockHistAll()},done5=()=>TRACKS.full.list().filter(c=>{const st=load("full",c.num);return st&&(st.doneAt||(st.pos||0)>=steps(c).length-1)}).length>=5;
  if(hasMock()&&(!H||!H.list.length)){if(done5())plan.push(["Take a practice exam","You've finished five chapters. A full timed practice exam now shows where you really stand.",{mock:1}])}
  else if(hasMock()||done5())plan.push(["Mixed practice","Do 10 mixed practice questions to keep everything warm.",{task:"mixed"}]);
  if(!plan.length)plan.push(["Start here","Open the Full Course and play chapter 1.",{open:1}]);
  return plan.slice(0,5);
}
/* Progress page: the finish line as steps, from existing state only (no scoring changes). Chapters = bookProgress's percent. Practice exam =
   the best score over every mock attempt, right over total as the history table shows it. Final assessment (courses with one) =
   locked until every planned chapter is done (courseDone), then unlocked, then passed once a non-preview attempt passes (certAttempt). */
function finishHTML(){const P=bookProgress(false),H=mockHistAll().filter(a=>a.total>0),rows=[];
  const partial=P.planned>P.pub;
  rows.push([P.all&&!partial?"done":P.done?"now":"todo","Chapters",`${bpPctText(P)}${partial?` of what's written (${P.pub} of ${P.planned} chapters written)`:""}`,bpBarHTML(P)]);
  if(hasMock()||H.length){const best=H.reduce((m,a)=>{const v=a.right/a.total*100;return !m||v>m.v?{v,a}:m},null);
    rows.push([best?"now":"todo","Practice exam",best?`best score ${Math.round(best.v)}%${best.a.mode==="practice"?" (practice mode)":""}`:"not started",""])}
  if(COURSE.final){const cd=courseDone(),cert=certAttempt();rows.push([cert?"done":cd.all?"now":"todo","Final assessment",cert?"passed":cd.all?"unlocked":"locked",""])}
  return `<h2 class="finishh">Finish line</h2><ol class="finish" aria-label="Finish line">${rows.map(([st,h,v,bar])=>`<li class="${st}"><span class="ft"><span class="fh">${h}</span> <span class="fv">${esc(v)}</span></span>${bar}</li>`).join("")}</ol>`}
function renderDash(){setTimeout(ambSync,0);setTimeout(navSync,0);
  TRACK="dash";$("railgame").hidden=true;$("mockcard").hidden=true;
  const m=mastery(),H=mockHistAll(),multi=multiForm();
  const fullL=TRACKS.full.list(),refL=TRACKS.ref.list();
  const rows=(tr,L)=>L.map(c=>{const st=load(tr,c.num);if(!st)return `<tr><td>${c.num}</td><td>${c.title}</td><td class="prog" colspan="3">not started</td></tr>`;const n=c.scenes.length,dec=`${st.score}/${n*3}`;
    const quiz=tr==="full"&&st.quiz?`${st.quiz.right}/${c.quiz.length}`:"·";const drills=tr==="full"&&(c.drills||[]).length?`${Object.values(st.drills||{}).filter(x=>x.ok.every(Boolean)).length}/${c.drills.length}`:"·";
    return `<tr><td>${c.num}</td><td><button class="linkbtn" data-open="${tr}:${c.num}">${c.title}</button></td><td class="num">${dec}</td><td class="num">${quiz}</td><td class="num">${drills}</td></tr>`}).join("");
  const last=H.filter(a=>a.mode!=="practice").slice(-1)[0];
  const ready=last&&last.total?Math.round(last.right/last.total*100):null;
  const domPct=d=>{const ts=ALLT().filter(t=>taskDomain(t)===d);const g=ts.reduce((a,t)=>a+m[t].got,0),x=ts.reduce((a,t)=>a+m[t].max,0);return x?Math.round(g/x*100):null};
  const plan=studyPlan(m),weak=weakTasks(m,5);
  $("page").innerHTML=`<div class="kicker">My progress</div><h1>Scoreboard</h1>${finishHTML()}
   <div class="end-grid">${hasMock()?`<div class="card"><h3>Readiness</h3><div class="big">${ready!==null?ready+"%":"·"}</div><p class="prog">${last?`Last timed practice exam, ${new Date(last.at).toLocaleDateString("en-US",{month:"short",day:"numeric"})}`:"Take a timed practice exam to see this"}</p></div>`:""}${DOMS.map(d=>`<div class="card"><h3>${d}</h3><div class="big">${domPct(d)!==null?domPct(d)+"%":"·"}</div></div>`).join("")}</div>
   <h2>${MENTOR()}'s study plan</h2><div class="story"><p>Built from your weakest tasks and where you are in the course. It updates as you play.</p></div>
   <ol class="plan">${plan.map(([h,b,a],i)=>`<li><b>${esc(h)}.</b> ${esc(b)} <button class="btn small" data-plan="${i}" type="button">${a.mock?"Open practice exam":a.task?"Practice":"Open"}</button></li>`).join("")}</ol>
   <h2>Where you need help</h2>${weak.length?weak.map(([t,p])=>{const ti=taughtIn(t),vids=videosFor(t);return `<div class="card helpcard"><div class="row"><b>${t} ${TASKNAMES[t]}</b><span class="pill ${p>=75?"p-ok":p>=50?"p-warn":"p-bad"}">${p}%</span></div>
     <p class="prog">Taught in: ${ti.map(({c,scenes})=>`<button class="linkbtn" data-lesson="${c.num}">Ch ${c.num} lesson</button>${scenes.map(i=>` · <button class="linkbtn" data-scene="${c.num}:${i}">decision ${i+1}</button>`).join("")}`).join(" | ")||(hasMock()?"the practice exam only":"no chapter yet")}</p>
     ${vids.slice(0,2).map(([v,c])=>`<p class="prog">Video: <a href="https://www.youtube.com/watch?v=${esc(v[0])}" target="_blank" rel="noopener">${esc(v[1])}</a> (${esc(v[2])}, ${esc(v[3])})</p>`).join("")}
     <button class="btn small" data-task="${t}" type="button">10 practice questions</button></div>`}).join(""):`<div class="story"><p>Play a few chapters and quizzes first. This fills in once there's enough to judge.</p></div>`}
   <h2>All ${ALLT().length} exam tasks</h2><div class="taskgrid">${ALLT().map(t=>{const p=pctOf(m[t]);return `<button class="taskcell" data-task="${t}" type="button" title="${TASKNAMES[t]}"><span class="tc">${t}</span><span class="tn">${TASKNAMES[t]}</span><span class="mbar"><span style="width:${p||0}%;background:${p===null?"var(--soft)":p>=75?"var(--good)":p>=50?"var(--mid)":"var(--bad)"}"></span></span><span class="prog">${p===null?"no data":p+"% · "+m[t].n+" items"}</span></button>`}).join("")}</div>
   <h2>Full Course</h2><div class="tablewrap"><table><tr><th>Ch</th><th>Title</th><th>Decisions</th><th>Quiz</th><th>Drills</th></tr>${rows("full",fullL)}</table></div>
   ${refL.length?`<h2>Refresher</h2><div class="tablewrap"><table><tr><th>Ch</th><th>Title</th><th>Decisions</th><th>Quiz</th><th>Drills</th></tr>${rows("ref",refL)}</table></div>`:""}
   ${hasMock()||H.length?`<h2>Practice exams</h2>`:""}${!hasMock()&&!H.length?"":H.length?`<div class="tablewrap"><table><tr><th>Date</th>${multi?"<th>Exam</th>":""}<th>Mode</th><th>Score</th><th>Time</th></tr>${H.slice().reverse().map(a=>`<tr><td>${new Date(a.at).toLocaleDateString("en-US",{month:"short",day:"numeric"})}</td>${multi?`<td>${a.f}</td>`:""}<td>${esc((MODE_NAME[a.mode]||a.mode).replace(" mode",""))}</td><td class="num">${a.right}/${a.total} (${a.total?Math.round(a.right/a.total*100):0}%)</td><td class="num">${a.mode!=="practice"?fmtTime(a.secs):"·"}</td></tr>`).join("")}</table></div>`:`<p class="prog">No practice exams yet.</p>`}
   ${finalDashHTML()}${logSection()}`;
  const pg=$("page");wireLog();wireFinalHome();
  pg.querySelectorAll("[data-open]").forEach(b=>b.onclick=()=>{const [tr,n]=b.dataset.open.split(":");openChapter(tr,+n)});
  pg.querySelectorAll("[data-lesson]").forEach(b=>b.onclick=()=>openLesson(+b.dataset.lesson));
  pg.querySelectorAll("[data-scene]").forEach(b=>b.onclick=()=>{const [n,i]=b.dataset.scene.split(":").map(Number);openChapter("full",n);const p=steps(CH).findIndex(x=>x.k==="scene"&&x.i===i);S.max=Math.max(S.max||0,p);fullGo(p)});
  pg.querySelectorAll("[data-task]").forEach(b=>b.onclick=()=>startPractice(b.dataset.task));
  pg.querySelectorAll("[data-plan]").forEach(b=>b.onclick=()=>{const a=plan[+b.dataset.plan][2];if(a.mock)return openMock();if(a.task)return startPractice(a.task);openChapter("full",a.open)});
}
let PR=null;
function practicePool(t){const pool=[];TRACKS.full.list().forEach(c=>c.quiz.forEach((q,i)=>pool.push({...q,src:`Chapter ${c.num} quiz`,pid:`f${c.num}q${i}`,cases:c.cases})));mockQuestions().forEach(q=>pool.push({...q,src:"Practice exam bank",pid:"m"+q.id}));return t==="mixed"?pool:pool.filter(q=>q.task===t)}
function startPractice(t){const pool=practicePool(t);if(!pool.length)return;const seed=Date.now()%9973;const pick=window.HalcyonOrder.perm("pr"+t+seed,pool.length).slice(0,10).map(i=>pool[i]);PR={task:t,qs:pick,v:null};TRACK="practice";renderPractice();top()}
function renderPractice(){setTimeout(navSync,0);
  $("railgame").hidden=true;$("mockcard").hidden=true;const {task,qs,v}=PR;
  $("page").innerHTML=`<div class="kicker">Practice set</div><h1>${task==="mixed"?"Mixed practice":`${task} ${TASKNAMES[task]}`}</h1><p class="prog">${qs.length} questions from the chapter quizzes and the practice exam bank. Results feed your progress map.</p>
   <form id="prform" novalidate>${(()=>{const pseen=new Set();return qs.map((x,qi)=>{const ord=order(x.pid.startsWith("m")?"mq"+x.pid.slice(1):x.pid.replace(/^f(\d+)q(\d+)$/,"q$1_$2"),x.opts.length);return `${caseBefore(x.cases,x,pseen,x.src)}<fieldset class="qitem"><legend><span class="qn">${qi+1}.</span> ${x.q}</legend>${ord.map((oi,pos)=>`<label class="qopt ${v?(oi===x.a?"qright":v[qi]===oi?"qwrong":""):""}"><input type="radio" name="p${qi}" value="${oi}" ${v?"disabled":""} ${v&&v[qi]===oi?"checked":""}><span class="k">${"ABCD"[pos]}</span> ${x.opts[oi]}</label>`).join("")}${v?`<p class="qwhy"><b>${v[qi]===x.a?"Correct.":"Not quite."}</b> ${x.why} <span class="tag">${x.task} · ${x.src}</span></p>`:""}</fieldset>`}).join("")})()}${v?"":`<button class="btn" type="submit">Check my answers</button>`}</form>
   ${v?`<div class="callout"><b>${v.filter((x,i)=>x===qs[i].a).length} of ${qs.length} correct.</b></div><div class="bar"><button class="btn" id="again" type="button">Another set</button><button class="btn ghost" id="todash" type="button">Back to progress</button></div>`:""}`;
  const f=$("prform");if(f)f.onsubmit=e=>{e.preventDefault();PR.v=qs.map((_,qi)=>{const c=document.querySelector(`input[name=p${qi}]:checked`);return c?+c.value:-1});
    const P=store.get("c"+(COURSE.base+902),null)||{tasks:{}};qs.forEach((x,qi)=>{if(PR.v[qi]<0)return;P.tasks[x.task]=P.tasks[x.task]||[0,0];P.tasks[x.task][1]++;if(PR.v[qi]===x.a)P.tasks[x.task][0]++});store.set("c"+(COURSE.base+902),P);if(SYNC)SYNC(COURSE.base+902,P);renderPractice();top()};
  const a=$("again");if(a)a.onclick=()=>startPractice(task);const d=$("todash");if(d)d.onclick=()=>renderDash();
}

/* ===== study log: real study time per day, per course ===== */
/* Stored as one small record per course at base+905, synced like every other progress record. Daily totals only, never raw events:
   {v:1,days:{"2026-10-11":{t:{<device id>:[reading secs, listening secs]},a:["l3","q3","b4","m"]}},at}
   Each device writes only its own seconds, so merging two copies is a per device max (a day studied on two devices adds up).
   Reading counts on a study screen (chapter, mock exam, practice set) while the tab is visible and the reader has touched, typed,
   scrolled or moved the mouse in the last 2 minutes. Listening counts while audio really plays, by the wall clock, checked against how far
   the audio moved (so 1.5x speed or a seek ahead can't add time). A tick never credits more than 15 seconds of reading, a listening span
   that can't be checked is capped at 20 minutes, and a device can't log more than 16 hours in a day. When audio plays, that time is
   listening, never reading too. Activity codes: c story, l lesson, s decisions, d drills, e exercise, q quiz, x labs (each + chapter),
   b + chapter Audiobook, m mock exam, p practice set. */
const LOG={idle:120000,tick:5000,last:Date.now(),act:Date.now(),lm:null,lp:0,heard:false,range:{from:"",to:""},timers:{},pend:{}};
let USERNAME="";
function ALOGKEY(c){return (c||COURSE).base+905}
function devId(){let d=store.get("devid",null);if(!d){d=Math.random().toString(36).slice(2,8);store.set("devid",d)}return d}
function dayKey(t){const d=new Date(t);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`}
function logGet(c){const L=store.get("c"+ALOGKEY(c),null);return L&&L.days?L:{v:1,days:{}}}
function logSave(L,now){L.at=Date.now();const k=ALOGKEY();let j=JSON.stringify(L);
  if(j.length>50000){Object.keys(L.days).sort().some(d=>{L.days[d].a=[];j=JSON.stringify(L);return j.length<=50000})} // the server takes 60000; drop the oldest activity notes first, never the time
  store.set("c"+k,L);if(!SYNC)return;LOG.pend[k]=JSON.parse(j); // at most one write every 20 seconds while studying, and right away when the tab hides
  if(now){clearTimeout(LOG.timers[k]);LOG.timers[k]=0;SYNC(k,LOG.pend[k],true)}else if(!LOG.timers[k])LOG.timers[k]=setTimeout(()=>{LOG.timers[k]=0;SYNC(k,LOG.pend[k])},20000)}
function logMerge(a,b){const out={v:1,days:{}},A=(a&&a.days)||{},B=(b&&b.days)||{};
  new Set([...Object.keys(A),...Object.keys(B)]).forEach(k=>{const x=A[k]||{},y=B[k]||{},t={};
    new Set([...Object.keys(x.t||{}),...Object.keys(y.t||{})]).forEach(d=>{const p=(x.t||{})[d]||[0,0],q=(y.t||{})[d]||[0,0];t[d]=[Math.max(p[0],q[0]),Math.max(p[1],q[1])]});
    out.days[k]={t,a:[...new Set([...(x.a||[]),...(y.a||[])])]}});return out}
function logWhat(){if(NAR.page==="book"&&NAR.book&&!NAR.audio.paused)return "b"+NAR.book.n;
  if(TRACK==="ref"&&CH)return "c"+CH.num;
  if(TRACK==="full"&&CH&&S){const L=steps(CH),x=L[Math.min(S.pos||0,L.length-1)];return (({open:"c",end:"c",lesson:"l",scene:"s",drill:"d",exercise:"e",quiz:"q",labs:"x"})[x.k]||"c")+CH.num}
  if(TRACK==="mock")return hasMock()?"m":null;if(TRACK==="practice")return "p";if(TRACK==="final")return "f";return null}
function logAdd(sec,kind,what){sec=Math.round(sec);if(!(sec>0)||!COURSE)return;const L=logGet(),k=dayKey(Date.now()),D=L.days[k]||(L.days[k]={t:{},a:[]}),id=devId(),T=D.t[id]||(D.t[id]=[0,0]);
  sec=Math.min(sec,16*3600-T[0]-T[1]);if(sec<=0)return;T[kind==="l"?1:0]+=sec;if(what&&!D.a.includes(what)&&D.a.length<40)D.a.push(what);logSave(L)}
/* listening: settle the span since the last mark, then mark again if the audio is still playing */
function logHear(pos){const a=NAR.audio,now=Date.now(),m=LOG.lm;
  if(m){const wall=(now-m.t)/1000,p=pos!=null?pos:a.currentTime;let s;
    if(a.src===m.src){const dp=p-m.p;s=dp>=0?Math.min(wall,dp/(a.playbackRate||1)+2):Math.min(wall,10)}else s=Math.min(wall,1200);
    if(s>0){logAdd(s,"l",m.what);LOG.heard=true}}
  LOG.lm=!a.paused&&!a.ended&&a.src?{t:now,p:a.currentTime,src:a.src,what:logWhat()}:null}
function logInit(){ // called once NAR exists (page narration section below)
  NAR.audio.addEventListener("playing",()=>{if(!LOG.lm)logHear()});
  ["pause","ended"].forEach(ev=>NAR.audio.addEventListener(ev,()=>logHear()));
  NAR.audio.addEventListener("seeking",()=>logHear(LOG.lp));
  NAR.audio.addEventListener("timeupdate",()=>{if(!NAR.audio.seeking)LOG.lp=NAR.audio.currentTime})}
function logTick(){const now=Date.now(),dt=Math.min(15,(now-LOG.last)/1000);LOG.last=now;LOG.heard=false;
  if(LOG.lm)logHear();
  if(LOG.heard||LOG.lm||document.hidden||now-LOG.act>LOG.idle)return;const w=logWhat();if(w&&dt>0)logAdd(dt,"r",w)}
setInterval(logTick,LOG.tick);
["pointerdown","pointermove","keydown","wheel","touchstart","scroll"].forEach(ev=>addEventListener(ev,()=>{LOG.act=Date.now()},{passive:true,capture:true}));
function logFlush(){if(LOG.lm)logHear();const L=store.get("c"+ALOGKEY(),null);if(L&&L.days&&SYNC)logSave(L,true)}
document.addEventListener("visibilitychange",()=>{if(document.hidden)logFlush();else{LOG.last=Date.now();LOG.act=Date.now()}});
addEventListener("pagehide",logFlush);
/* reading the log */
function logRows(c,from,to){const L=logGet(c);let run=0;return Object.keys(L.days).sort().filter(d=>(!from||d>=from)&&(!to||d<=to)).map(d=>{const D=L.days[d];let r=0,l=0;Object.values(D.t||{}).forEach(([x,y])=>{r+=x||0;l+=y||0});run+=r+l;return {d,r,l,a:D.a||[],run}}).filter(x=>x.r+x.l>0)}
function logActText(a){const kinds=[["c","story"],["l","lesson"],["s","decisions"],["d","drills"],["e","exercise"],["q","quiz"],["x","labs"]],ch={},book=[],out=[];
  a.forEach(code=>{const m=/^([clsdeqxb])(\d+)$/.exec(code);if(!m)return;if(m[1]==="b"){if(!book.includes(+m[2]))book.push(+m[2])}else(ch[m[2]]=ch[m[2]]||new Set()).add(m[1])});
  Object.keys(ch).map(Number).sort((x,y)=>x-y).forEach(n=>out.push(`Chapter ${n}: ${kinds.filter(([k])=>ch[n].has(k)).map(([,w])=>w).join(", ")}`));
  if(book.length)out.push(`Audiobook, chapter${book.length>1?"s":""} ${book.sort((x,y)=>x-y).join(", ")}`);
  if(a.includes("m"))out.push("Practice exam");if(a.includes("p"))out.push("Practice set");if(a.includes("f"))out.push("Final assessment");return out.join("; ")}
const hrs=s=>(s/3600).toFixed(1),mins=s=>Math.round(s/60);
function logDay(d){const [y,m,x]=d.split("-").map(Number);return new Date(y,m-1,x).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}
function logRangeText(R){if(!R.length)return "No study time logged yet";return R[0].d===R[R.length-1].d?logDay(R[0].d):`${logDay(R[0].d)} to ${logDay(R[R.length-1].d)}`}
function logTableHTML(R){if(!R.length)return `<p class="prog">Nothing logged for these dates yet. Time you spend reading a chapter, taking a quiz or the practice exam, or listening shows up here.</p>`;
  const tot=R[R.length-1].run-(R[0].run-R[0].r-R[0].l);
  return `<div class="tablewrap"><table class="logtable"><tr><th>Date</th><th>Minutes</th><th>What you did</th><th>Total hours</th></tr>${R.map(x=>`<tr><td>${esc(logDay(x.d))}</td><td class="num">${mins(x.r+x.l)}${x.l>=60?` <span class="logl">(${mins(x.l)} listening)</span>`:""}</td><td>${esc(logActText(x.a))}</td><td class="num">${hrs(x.run-(R[0].run-R[0].r-R[0].l))}</td></tr>`).join("")}</table></div><p class="logtotal"><b>Total for these dates: ${hrs(tot)} hours</b> (${mins(tot)} minutes)</p>`}
function logSection(){const {from,to}=LOG.range;const R=logRows(COURSE,from,to);
  return `<h2 id="studylog">Study log</h2><p class="prog">The time you've actually spent on this course, day by day. Reading counts while you're active on a chapter, quiz, practice set or practice exam. Listening counts while the audio plays.</p>
   <div class="logrange"><label for="logfrom">From <input type="date" id="logfrom" value="${esc(from)}"></label><label for="logto">To <input type="date" id="logto" value="${esc(to)}"></label><button class="linkbtn" type="button" id="logall">All time</button></div>
   <div id="logbody">${logTableHTML(R)}</div>
   <div class="bar"><button class="btn small" type="button" id="logcsv" ${R.length?"":"disabled"}>Download study log</button><button class="btn small ghost" type="button" id="logprint" ${R.length?"":"disabled"}>Printable page</button></div>`}
function wireLog(){const f=$("logfrom"),t=$("logto");if(!f)return;const upd=()=>{LOG.range={from:f.value,to:t.value};const R=logRows(COURSE,f.value,t.value);$("logbody").innerHTML=logTableHTML(R);$("logcsv").disabled=$("logprint").disabled=!R.length};
  f.onchange=upd;t.onchange=upd;$("logall").onclick=()=>{f.value="";t.value="";upd()};$("logcsv").onclick=logCSV;$("logprint").onclick=()=>{renderLogPrint();top()}}
function logCSV(){const R=logRows(COURSE,LOG.range.from,LOG.range.to);if(!R.length)return;const base=R[0].run-R[0].r-R[0].l,q=v=>{v=String(v);return /[",\n]/.test(v)?`"${v.replace(/"/g,'""')}"`:v};
  const lines=[["Date","Course","Minutes reading","Minutes listening","Total minutes","What you did","Running total hours"].join(",")];
  R.forEach(x=>lines.push([x.d,COURSE.full_title||COURSE.title,mins(x.r),mins(x.l),mins(x.r+x.l),logActText(x.a),hrs(x.run-base)].map(q).join(",")));
  const blob=new Blob([lines.join("\r\n")+"\r\n"],{type:"text/csv"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`halcyon-study-log-${COURSE.id}-${R[0].d}-to-${R[R.length-1].d}.csv`;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000)}
function renderLogPrint(){setTimeout(ambSync,0);TRACK="logprint";setTimeout(navSync,0);$("railgame").hidden=true;$("mockcard").hidden=true;const c=COURSE,R=logRows(c,LOG.range.from,LOG.range.to),tot=R.length?R[R.length-1].run-(R[0].run-R[0].r-R[0].l):0;
  $("page").innerHTML=`<div class="bar noprint" style="margin-top:0"><button class="btn ghost small" type="button" id="logback">Back to progress</button><button class="btn" type="button" id="logdoprint">Print or save as PDF</button></div>
   <div class="logdoc"><h1>Study log</h1><dl class="facts"><dt>Course</dt><dd>${esc(c.full_title||c.title)}</dd><dt>Exam it prepares for</dt><dd>${esc(c.exam||"")}</dd><dt>Provider</dt><dd>Halcyon</dd><dt>Format</dt><dd>Self-paced online course, read and listened to</dd><dt>Name</dt><dd>${USERNAME?esc(USERNAME):`<span class="logblank"></span>`}</dd><dt>Dates</dt><dd>${esc(logRangeText(R))}</dd><dt>Total time</dt><dd>${hrs(tot)} hours (${mins(tot)} minutes)</dd></dl>
   ${logTableHTML(R)}<p class="logfoot">${esc(c.logFoot||"Self-reported study record generated by Halcyon, an independent study course.")}</p></div>`;
  $("logback").onclick=()=>{renderDash();setTimeout(()=>{const e=$("studylog");if(e)e.scrollIntoView()},0)};$("logdoprint").onclick=()=>window.print()}
function openLog(){renderDash();setTimeout(()=>{const e=$("studylog");if(e)e.scrollIntoView({block:"start"})},30)}


/* ===== page narration: sticky player, per-page clips, word highlight ===== */
const NAR={car:false,audio:new Audio(),timings:{},key:null,page:null,listening:false,auto:store.get("auto2",false),rate:store.get("rate",1),map:[],words:[],raf:0,cur:-1};
NAR.audio.preload="auto";
/* listening position: per course, saved to the account so any device picks up where you stopped */
/* PMP v2 keeps its Audiobook and page positions and Labs waiting under 904 (v1's were 903); its prefs carry over once */
function LKEY(){return COURSE.base+(PMP2()?904:903)}
function BID(){return PMP2()?"pmp2":COURSE.id} // local Audiobook keys (bookpos, bookdone, readat) for this edition
function lget(){const L=store.get("c"+LKEY(),null);if(!L&&PMP2()){const o=store.get("c"+(COURSE.base+903),null);if(o&&o.prefs)return {prefs:o.prefs}}return L||{}}
let lsyncT=0,lsaveAt=0;
function lput(patch,now){const L=Object.assign(lget(),patch,{at:Date.now()});store.set("c"+LKEY(),L);if(SYNC){clearTimeout(lsyncT);const k=LKEY(),c=JSON.parse(JSON.stringify(L));lsyncT=setTimeout(()=>{delete SPEND[k];SYNC(k,c)},now?0:1500);SPEND[k]=[k,c]}}
/* ⏮ ⏭: scene to scene in the Audiobook (then chapter to chapter), page to page while reading */
async function narSkip(dir){const a=NAR.audio;
  if(NAR.page==="book"&&NAR.book){await bookMarks();const {ed,n}=NAR.book;const L=(MARKS.full[n]&&MARKS.full[n][ed]||[]).map(x=>x[1]);const t=a.currentTime||0;
    if(dir>0){const s=L.find(x=>x>t+1);if(s!=null&&s<(a.duration||1e9)-2){a.currentTime=s;narSavePos(true);return}const nx=Object.keys(BOOK.full).map(Number).filter(k=>k>n&&BOOK.full[k][ed]).sort((x,y)=>x-y)[0];if(nx)bookPlay(ed,nx,0);return}
    const s=L.filter(x=>x<t-3).pop();if(s!=null||t>3){a.currentTime=s!=null?s:0;narSavePos(true);return}
    const pv=Object.keys(BOOK.full).map(Number).filter(k=>k<n&&BOOK.full[k][ed]).sort((x,y)=>y-x)[0];if(pv)bookPlay(ed,pv,0);else a.currentTime=0;return}
  if(TRACK==="full"&&CH&&S){const L=steps(CH),cur=L[S.pos];if(dir>0&&cur&&cur.k==="scene"&&S.picks[cur.i]===undefined)return;const p=S.pos+dir;if(p>=0&&p<L.length&&secOpen(p))fullGo(p);return}
  if(TRACK==="ref"&&CH&&S){if(dir>0){const b=$("next")||$("go");if(b)b.click()}else if(S.step>=0){S.step--;save();render();top()}}}
function narSavePos(now){const a=NAR.audio;if(!a.src||!(a.currentTime>0))return;const t=+a.currentTime.toFixed(1),dur=a.duration||0;
  if(NAR.page==="book"&&NAR.book)lput({book:{ed:NAR.book.ed,n:NAR.book.n,t,dur,at:Date.now()}},now);
  else if(NAR.page&&NAR.key&&NAR.page!=="car")lput({page:{key:NAR.key,pid:NAR.page,t,at:Date.now()}},now);}
function narTick(){if(Date.now()-lsaveAt>5000){lsaveAt=Date.now();narSavePos(false)}}
/* player diagnostics (Guide page toggle): logs what the audio element does, for debugging on phones */
const PDBG={on:store.get("pdbg",false),lines:[]};
function plog(m){if(!PDBG.on)return;const a=NAR.audio;const s=`${new Date().toISOString().slice(14,23)} ${m} | t=${(a.currentTime||0).toFixed(1)} rs=${a.readyState} ns=${a.networkState} p=${a.paused?1:0} sk=${a.seekable&&a.seekable.length?a.seekable.end(0).toFixed(0):"-"}`;PDBG.lines.push(s);PDBG.lines=PDBG.lines.slice(-40);let el=$("pdbg");if(!el){el=document.createElement("pre");el.id="pdbg";el.style.cssText="position:fixed;top:0;left:0;right:0;max-height:45vh;overflow:auto;z-index:99;margin:0;padding:6px;font:10px/1.3 monospace;background:rgba(0,0,0,.85);color:#9f9;white-space:pre-wrap";document.body.appendChild(el)}el.textContent=PDBG.lines.join("\n");el.scrollTop=1e9}
["loadstart","loadedmetadata","loadeddata","canplay","canplaythrough","play","playing","pause","waiting","stalled","suspend","seeking","seeked","ended","error","abort","emptied"].forEach(ev=>NAR.audio.addEventListener(ev,()=>plog(ev+(ev==="error"&&NAR.audio.error?" code="+NAR.audio.error.code:""))));
function seekTo(pos){const a=NAR.audio;plog("seekTo "+(+pos).toFixed(1)+" src="+String(a.src).split("/").slice(-2).join("/"));if(!(pos>0))return;let tries=0;
  const apply=()=>{if(!a.duration||pos>=a.duration-1)return;if(Math.abs(a.currentTime-pos)>1.5){try{a.currentTime=pos}catch(e){}}};
  a.addEventListener("loadedmetadata",apply,{once:true});
  const again=()=>{apply();if(++tries<3&&Math.abs(a.currentTime-pos)>1.5)setTimeout(again,250)};
  a.addEventListener("playing",again,{once:true});a.addEventListener("canplay",apply,{once:true})}
function fmtT(s){s=Math.max(0,Math.round(s||0));return `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`}
function bookResumePos(ed,n,dur){const L=lget(),B=L.book;if(B&&B.n===n){if(B.ed===ed)return B.t;if(B.dur&&dur)return Math.max(0,B.t/B.dur*dur-15)}const old=store.get(`bookpos.${BID()}.${ed}.${n}`,0);return old||0}
function narKey(){if(!CH||(TRACK!=="full"&&TRACK!=="ref"))return null;return (TRACK==="ref"?"r":"f")+CH.num}
async function narTimings(key){if(NAR.timings[key])return NAR.timings[key];if(NOAUD())return null;try{const r=await fetch(R(V2(`audio/pages/${key}/timings.json`)),{cache:"no-cache"});if(r.ok)NAR.timings[key]=await r.json()}catch(e){}return NAR.timings[key]||null}
// the narration also reads props (vlog cards, emails, console logs): their headers and bodies are highlight targets too
const PROPSEL=pre=>[".vh",".vm",".ph",".pm",".pb",".bubble"].map(x=>`${pre}.story .prop ${x}`).join(", ");
function narPageId(){
  if(TRACK==="ref"){if(S.step<0)return["open",".story p, "+PROPSEL("")];if(S.step>=CH.scenes.length)return["end",".story p, "+PROPSEL("")];const i=S.step,p=S.picks[i];return p===undefined?["s"+i,".story p, .choice span:not(.k), "+PROPSEL("")]:[`o${i}_${p}`,".outcome .story p, "+PROPSEL(".outcome ")]}
  const st=steps(CH)[Math.min(S.pos,steps(CH).length-1)];
  if(st.k==="open")return["open","h1, .story p, "+PROPSEL("")];if(st.k==="lesson")return["lesson","h1, .lesson h2, .lesson .story p, .lesson .examtip, "+PROPSEL(".lesson ")];if(st.k==="end")return["end",".story p, "+PROPSEL("")];
  if(st.k==="scene"){const p=S.picks[st.i];return p===undefined?["s"+st.i,"h2, .story p, .choice span:not(.k), "+PROPSEL("")]:[`o${st.i}_${p}`,".outcome .story p, "+PROPSEL(".outcome ")]}
  return[null,null];
}
const norm=w=>w.toLowerCase().normalize("NFD").replace(/[^a-z0-9]/g,"");
function wrapWords(sel){const all=[...$("page").querySelectorAll(sel)],els=all.filter(e=>!all.some(o=>o!==e&&o.contains(e)));const words=[]; // outermost only: a prop body's <p>s are wrapped once
  els.forEach(el=>{const tw=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);const nodes=[];while(tw.nextNode())nodes.push(tw.currentNode);
    nodes.forEach(nd=>{if(!nd.nodeValue.trim())return;const frag=document.createDocumentFragment();nd.nodeValue.split(/(\s+)/).forEach(part=>{if(!part)return;if(/^\s+$/.test(part)){frag.appendChild(document.createTextNode(part));return}const sp=document.createElement("span");sp.className="w";sp.textContent=part;frag.appendChild(sp);words.push(sp)});nd.parentNode.replaceChild(frag,nd)})});
  return words}
// Map each narrated word (timings) to a word on the page. A global, order-keeping alignment (weighted LCS): words read aloud
// but not shown (the "Chapter one" heading, "A log from", spelled-out times) stay unmapped instead of pulling every later word off
// by one, which the old greedy look-ahead did. Then a run of unmapped narrated words that sits across from a run of unmapped page
// words (a number read as words, a respelled name) is spread over those page words in order.
// Prop headers on this page, as word lists: what the narration says before each prop it shows (propSay)
function propHeaders(){return [...$("page").querySelectorAll(".prop[data-say]")].map(e=>e.dataset.say.split(/\s+/).map(norm).filter(Boolean)).filter(h=>h.length)}
// A narration's unmatched words, not counting a run of unmatched words that reads a header of a prop on this page: the header is
// spoken but only partly shown ("A text from" over Maisie's bubble), so it says nothing that isn't on the screen.
function narMiss(tw,map,hdr){const un=new Set(map.un||[]);let miss=un.size;if(!miss||!hdr.length)return miss;const a=tw.map(([t])=>norm(t));
  const left=hdr.slice(); // each prop's header is spoken once, so it forgives one run at most
  for(let i=0;i<a.length&&left.length;i++){if(!a[i])continue;for(let q=0;q<left.length;q++){const h=left[q];if(a[i]!==h[0])continue;let k=0,j=i,hit=0;while(k<h.length&&j<a.length){if(!a[j]){j++;continue}if(a[j]!==h[k])break;if(un.has(j))hit++;k++;j++}
    if(k===h.length&&hit){miss-=hit;for(let x=i;x<j;x++)un.delete(x);left.splice(q,1);i=j-1;break}}}
  return miss}
function alignWords(tw,dom){const n=tw.length,m=dom.length,map=new Array(n).fill(null);if(!n||!m)return map;
  const a=tw.map(([t])=>norm(t)),b=dom.map(d=>norm(d.textContent)); // choice letters ("B. Call Hale") aren't page words: they stay unmapped
  const sc=(x,y)=>!x||!y?0:x===y?3:(x.length>=3&&y.length>=3&&(x.startsWith(y)||y.startsWith(x)))?2:0;
  const W=m+1;let prev=new Int32Array(W),cur=new Int32Array(W);const tb=new Uint8Array((n+1)*W);
  for(let i=1;i<=n;i++){cur[0]=0;const ai=a[i-1];for(let j=1;j<=m;j++){let best=prev[j],d=1;if(cur[j-1]>best){best=cur[j-1];d=2}if(ai){const s=sc(ai,b[j-1]);if(s&&prev[j-1]+s>best){best=prev[j-1]+s;d=3}}cur[j]=best;tb[i*W+j]=d}const t=prev;prev=cur;cur=t}
  for(let i=n,j=m;i>0&&j>0;){const d=tb[i*W+j];if(d===3){map[i-1]=j-1;i--;j--}else if(d===1)i--;else j--}
  map.exact=map.filter(x=>x!=null).length;map.un=map.reduce((u,x,i)=>{if(x==null)u.push(i);return u},[]); // words that really matched, before the gap fill below (choosing between two narrations must not count filled words)
  const anc=[[-1,-1]];map.forEach((d,i)=>{if(d!=null)anc.push([i,d])});anc.push([n,m]);
  for(let k=1;k<anc.length;k++){const [i0,d0]=anc[k-1],[i1,d1]=anc[k],ti=i1-i0-1,dj=d1-d0-1;if(ti<=0||dj<=0||(k===1||k===anc.length-1)&&dj>ti*2+2)continue;
    if(dj>ti*4+4||ti>dj*4+4)continue; // not the same stretch of text read two ways
    for(let i=i0+1;i<i1;i++)if(a[i])map[i]=d0+1+Math.min(dj-1,Math.floor((i-i0-1)*dj/ti))}
  return map}
function bookSec(){if(NAR.page!=="book"||!NAR.book)return;const pid=pidAt(NAR.book.n,NAR.book.ed,NAR.audio.currentTime||0);if(pid&&pid!==NAR.bsec){NAR.bsec=pid;const l=$("narlabel");if(l)l.textContent=`Ch ${NAR.book.n} · ${pidLabel(pid,NAR.book.n)}`;narMedia()}}
["seeked","timeupdate"].forEach(ev=>NAR.audio.addEventListener(ev,()=>{bookSec();if(NAR.audio.paused||document.hidden)bfTick()})); // the follow-along text keeps up with lock screen and car seeks too
function narHighlight(){if(NAR.page==="book"){bookSec();bfTick();const pr=$("narprog");if(pr&&NAR.audio.duration)pr.style.width=(NAR.audio.currentTime/NAR.audio.duration*100)+"%";narTick();if(!NAR.audio.paused)NAR.raf=requestAnimationFrame(narHighlight);return}if(NAR.page==="car"){const pr=$("narprog");if(pr&&NAR.audio.duration)pr.style.width=(NAR.audio.currentTime/NAR.audio.duration*100)+"%";if(Math.round(NAR.audio.currentTime)%5===0)store.set("carpos."+NAR.key,NAR.audio.currentTime);narTick();if(!NAR.audio.paused)NAR.raf=requestAnimationFrame(narHighlight);return}const T=NAR.timings[NAR.key];const t=NAR.audio.currentTime;const W=T&&T[NAR.page]?T[NAR.page].w:[];
  let lo=0,hi=W.length-1,idx=-1;while(lo<=hi){const mid=(lo+hi)>>1;if(W[mid][1]<=t){idx=mid;lo=mid+1}else hi=mid-1}
  const di=idx>=0?NAR.map[idx]:null;if(di!==NAR.cur){if(NAR.cur!=null&&NAR.words[NAR.cur])NAR.words[NAR.cur].classList.remove("hl");if(di!=null&&NAR.words[di]){const w=NAR.words[di];NAR.lastw=w;w.classList.add("hl");const r=w.getBoundingClientRect(),off=r.top<70||r.bottom>innerHeight-110;if(off&&!NAR.free)w.scrollIntoView({block:"center",behavior:"smooth"});narFollowUI(off,r.top<70)}NAR.cur=di}
  const pr=$("narprog");if(pr&&NAR.audio.duration)pr.style.width=(NAR.audio.currentTime/NAR.audio.duration*100)+"%";narTick();
  if(!NAR.audio.paused)NAR.raf=requestAnimationFrame(narHighlight)}
// Scrolling by hand while a page reads stops the auto follow; "Follow the reading" brings it back.
function narFollowUI(off,up){const p=$("narfollow");if(!p)return;p.hidden=!(NAR.free&&off);if(!p.hidden)p.textContent=(up?"↑":"↓")+" Follow the reading"}
addEventListener("scroll",()=>{const w=NAR.lastw;if(NAR.page==="book"||!NAR.free||!w||!w.isConnected)return;const r=w.getBoundingClientRect();narFollowUI(r.top<70||r.bottom>innerHeight-110,r.top<70)},{passive:true});
function narFree(){if(NAR.page&&NAR.page!=="book"&&NAR.page!=="car"&&!NAR.audio.paused)NAR.free=true}
addEventListener("wheel",narFree,{passive:true});addEventListener("touchmove",narFree,{passive:true});
addEventListener("keydown",e=>{if(["PageUp","PageDown","ArrowUp","ArrowDown","Home","End"].includes(e.key))narFree()});
addEventListener("mousedown",e=>{if(e.clientX>=document.documentElement.clientWidth)narFree()});
function narUI(){const b=$("narbar");if(!b)return;const has=NAR.page==="car"||NAR.page==="book"||!!(NAR.key&&NAR.timings[NAR.key]&&NAR.page&&NAR.timings[NAR.key][NAR.page]);b.hidden=!has;document.body.classList.toggle("withbar",has);if(!has)return;
  $("narplay").textContent=NAR.audio.paused?"▶ Listen":"❚❚ Pause";b.classList.toggle("book",NAR.page==="book");$("narlabel").textContent=NAR.page==="book"?`Ch ${NAR.book.n} · ${NAR.bsec?pidLabel(NAR.bsec,NAR.book.n):(NAR.book.ed==="story"?"Story only":"Story + lessons")}`:NAR.page==="car"?"Car mode · whole chapter":({open:"Opening",lesson:LESSON(),end:"Chapter ending"}[NAR.page.replace(/_(alt|fixed|v\d+)$/,"")]||(NAR.page[0]==="s"?"Decision":"Outcome"));}
async function narAttach(){
  if(NAR.page==="book"&&!NAR.audio.paused){narUI();return}
  const key0=narKey();
  if(NAR.car&&key0&&CH.episode){ // car mode: one continuous track per chapter, page changes don't interrupt it
    NAR.key=key0;NAR.page="car";const src=new URL(R(CH.episode.src),location.href).href;
    if(NAR.audio.src!==src){NAR.audio.pause();NAR.audio.src=src;NAR.audio.playbackRate=NAR.rate;const pos=store.get("carpos."+key0,0);NAR.audio.addEventListener("loadedmetadata",()=>{if(pos>5)NAR.audio.currentTime=pos},{once:true});if(NAR.listening)NAR.audio.play().then(narUI).catch(()=>{})}
    $("page").querySelectorAll(".episode").forEach(e=>e.hidden=true);narUI();return}
  NAR.audio.pause();cancelAnimationFrame(NAR.raf);NAR.cur=-1;
  const key=narKey();NAR.key=key;if(!key){NAR.page=null;narUI();return}
  const [pid,sel]=narPageId();NAR.page=pid;
  const T=await narTimings(key);if(!T||!pid||!T[pid]){NAR.page=null;narUI();return}
  if(NAR.key!==key||NAR.page!==pid)return;
  $("page").querySelectorAll(".episode").forEach(e=>e.hidden=true);NAR.free=false;NAR.lastw=null;narFollowUI(false);NAR.words=wrapWords(sel);NAR.map=alignWords(T[pid].w,NAR.words);
  {const alts=Object.keys(T).filter(k=>k===pid+"_alt"||k===pid+"_fixed"||k.startsWith(pid+"_v"));if(alts.length){ // several narrations of a page whose wording depends on the reader (tools/pages.mjs): play one that says nothing that isn't on the screen, and of those the one that covers the most of the page. Every narration of a page shares the spoken header and option letters (never page words), so the fewest unmatched words among them is that baseline; a narration with more than one word over it is reading another reader's text
    const hdr=propHeaders(),c=[[pid,NAR.map],...alts.map(k=>[k,alignWords(T[k].w,NAR.words)])],miss=([k,m])=>narMiss(T[k].w,m,hdr),base=Math.min(...c.map(miss));
    const [k,m]=c.filter(x=>miss(x)<=base+1).reduce((a,b)=>b[1].exact>a[1].exact?b:a);NAR.cands=c.map(x=>[x[0],miss(x),x[1].exact]);NAR.cands_for=k;NAR.page=k;NAR.map=m}}
  NAR.audio.src=R(V2(`audio/pages/${key}/${NAR.page}.mp3`));NAR.audio.playbackRate=NAR.rate;
  {const P=lget().page;if(P&&P.key===key&&P.pid===NAR.page&&P.t>2)seekTo(Math.max(0,P.t-2))}
  narUI();
  if(NAR.listening){NAR.audio.play().then(()=>{narUI();narHighlight()}).catch(()=>{NAR.listening=false;narUI()})}
}
NAR.audio.addEventListener("ended",()=>{if(NAR.page==="book"){const {ed,n}=NAR.book;store.set(`bookdone.${BID()}.${ed}.${n}`,true);store.set(`bookpos.${BID()}.${ed}.${n}`,0);{const L=lget();if(L.book&&L.book.n===n)lput({book:null},true)}const nx=Object.keys(BOOK.full).map(Number).filter(k=>k>n&&BOOK.full[k][ed]).sort((a,b)=>a-b)[0];if(nx)bookPlay(ed,nx);else{NAR.listening=false;narUI()}if(TRACK==="book")renderBook();return}if(NAR.page==="car"){NAR.listening=false;narUI();return}cancelAnimationFrame(NAR.raf);if(NAR.cur!=null&&NAR.words[NAR.cur])NAR.words[NAR.cur].classList.remove("hl");narUI();
  if(!NAR.auto)return;const pid=NAR.page||"";
  if(pid==="open"||pid==="lesson"){const b=$("fnext")||$("go");if(b)setTimeout(()=>b.click(),700)}
  else if(pid[0]==="o"){const b=$("next");if(b)setTimeout(()=>b.click(),900)}
  else NAR.listening=pid[0]==="s"?NAR.listening:false;});
function foldInit(){document.querySelectorAll("details.fold").forEach(d=>{const k="fold."+d.id;const v=store.get(k,null);if(v!==null)d.open=v;d.addEventListener("toggle",()=>store.set(k,d.open))})}
foldInit();
function narInit(){
  const bar=document.createElement("div");bar.id="narbar";bar.hidden=true;bar.innerHTML=`<button class="btn small" id="narfollow" type="button" hidden>↓ Follow the reading</button><div class="narseekrow"><span class="prog nartime" id="narcur">0:00</span><div class="narseekwrap"><div class="narticks" id="narticks" aria-label="Scenes"></div><span class="narbubble" id="narbubble" hidden></span><input type="range" id="narseek" min="0" max="1000" value="0" step="1" aria-label="Seek"></div><span class="prog nartime" id="nardur">0:00</span><span id="narprog" hidden></span></div><div class="narrow"><button class="btn small ghost" id="narprev" type="button" aria-label="Previous section" data-tip="Previous scene in the Audiobook, or previous page while reading.">⏮</button><button class="btn small ghost" id="narback" type="button" aria-label="Back 10 seconds" data-tip="Jump back 10 seconds for a quick refresher.">⟲ 10</button><button class="btn" id="narplay" type="button">▶ Listen</button><button class="btn small ghost" id="narfwd" type="button" aria-label="Forward 30 seconds" data-tip="Skip ahead 30 seconds.">30 ⟳</button><button class="btn small ghost" id="narnext" type="button" aria-label="Next section" data-tip="Next scene in the Audiobook, or next page while reading.">⏭</button><span class="prog" id="narlabel"></span><label class="prog" for="narrate" data-tip="Reading speed. Your choice is remembered.">Speed <select id="narrate">${[0.8,0.9,1,1.1,1.25,1.5].map(r=>`<option value="${r}" ${r==NAR.rate?"selected":""}>${r}x</option>`).join("")}</select></label><label class="chk prog" for="narauto" data-tip="When a page finishes reading, turn to the next page by itself. Decisions still wait for you to choose."><input type="checkbox" id="narauto" ${NAR.auto?"checked":""}> Keep going</label><button class="btn small ghost" id="gohf" type="button" data-tip="Switch to the audiobook. It starts at the part you're reading and plays straight through, chapter after chapter.">🎧 Audiobook</button></div>`;
  document.body.appendChild(bar);
  $("narfollow").onclick=()=>{NAR.free=false;$("narfollow").hidden=true;const w=NAR.lastw;if(!w||!w.isConnected)return;if(NAR.page==="book"&&BF.box&&BF.box.contains(w)){const r=BF.box.getBoundingClientRect();if(r.top<0||r.bottom>innerHeight)BF.box.scrollIntoView({block:"nearest",behavior:"smooth"});bfScrollTo(w)}else w.scrollIntoView({block:"center",behavior:"smooth"})};
  $("narplay").onclick=()=>{plog("tap Listen");if(NAR.audio.paused){NAR.listening=true;NAR.free=false;if(NAR.audio.ended)NAR.audio.currentTime=0;NAR.audio.play().then(()=>{plog("play() ok");narUI();narHighlight()}).catch(e=>plog("play() REJECTED "+e.name+": "+e.message))}else{NAR.listening=false;NAR.audio.pause();narUI()}};
  {const sk=$("narseek");let drag=false;
   const show=()=>{const a=NAR.audio,d=a.duration||0;$("narcur").textContent=fmtT(drag?(+sk.value/1000*d):a.currentTime);$("nardur").textContent=d?fmtT(d):"0:00";if(!drag&&d)sk.value=Math.round(a.currentTime/d*1000)};
   ["timeupdate","loadedmetadata","durationchange","seeked","emptied"].forEach(ev=>NAR.audio.addEventListener(ev,show));
   const bub=$("narbubble");
   const bubble=()=>{const d=NAR.audio.duration||0;if(!drag||!d){bub.hidden=true;return}const t=+sk.value/1000*d,W=sk.clientWidth,x=8+(W-16)*(+sk.value/1000);
     const pid=NAR.page==="book"&&NAR.book?pidAt(NAR.book.n,NAR.book.ed,t):null;bub.textContent=fmtT(t)+(pid?" · "+pidLabel(pid,NAR.book.n).replace(/^(Decision \d+):.*/,"$1"):"");bub.hidden=false;
     bub.style.left=Math.max(bub.offsetWidth/2,Math.min(W-bub.offsetWidth/2,x)).toFixed(1)+"px"}; // the time (and scene) under the thumb while dragging
   sk.addEventListener("input",()=>{drag=true;show();bubble()});
   sk.addEventListener("change",()=>{const d=NAR.audio.duration||0;if(d)NAR.audio.currentTime=+sk.value/1000*d;drag=false;bubble();if(NAR.page==="book")NAR.free=false;narSavePos(true);show();if(NAR.audio.paused)narHighlight()});
   ["pointerup","pointercancel"].forEach(ev=>sk.addEventListener(ev,()=>setTimeout(()=>{if(drag){drag=false;show()}bubble()},60)))} // a drag that ends where it began fires no change
  $("narprev").onclick=()=>narSkip(-1);$("narnext").onclick=()=>narSkip(1);
  $("narback").onclick=()=>{NAR.audio.currentTime=Math.max(0,NAR.audio.currentTime-10);narSavePos(true);if(NAR.audio.paused)narHighlight()};
  $("narfwd").onclick=()=>{NAR.audio.currentTime=Math.min((NAR.audio.duration||0)-0.5,NAR.audio.currentTime+30);narSavePos(true);if(NAR.audio.paused)narHighlight()};
  $("narrate").onchange=e=>{NAR.rate=+e.target.value;NAR.audio.playbackRate=NAR.rate;store.set("rate",NAR.rate)};
  $("narauto").onchange=e=>{NAR.auto=e.target.checked;store.set("auto2",NAR.auto)};
  $("gohf").onclick=async()=>{if(TRACK==="full"||TRACK==="ref")save();const LB=lget().book;const n=LB&&!(TRACK==="full"&&CH)?LB.n:(TRACK==="full"&&CH?CH.num:1);const B=await bookManifest();await bookMarks();const ed=store.get("bookEd."+COURSE.id,"story");const have=Object.keys(B.full).map(Number).filter(k=>B.full[k][ed]).sort((a,b)=>a-b);let at=null;if(TRACK==="full"&&CH&&have.includes(CH.num)&&!(LB&&LB.n===CH.num&&LB.ed===ed&&(LB.at||0)>readAt(CH.num)))at=markTime(CH.num,ed,readPid());renderBook();top();if(have.length)bookPlay(ed,have.includes(n)?n:(have.find(k=>k>=n)||have[have.length-1]),at)};
  NAR.audio.addEventListener("pause",()=>{narUI();narSavePos(true)});
  document.addEventListener("visibilitychange",()=>{if(document.hidden)narSavePos(true);else listenPull()});
  addEventListener("pagehide",()=>narSavePos(true));
}
narInit();logInit();window.__nar=NAR;
/* lock screen and car controls */
function narMedia(){if(!("mediaSession" in navigator))return;if(NAR.page==="book"){const c=TRACKS.full.list().find(x=>x.num===NAR.book.n);try{navigator.mediaSession.metadata=new MediaMetadata({title:NAR.bsec?`Ch ${NAR.book.n} · ${pidLabel(NAR.bsec,NAR.book.n)}`:`Chapter ${NAR.book.n}: ${c?c.title:""}`,artist:COURSE.full_title||"The Halcyon Launch",album:NAR.book.ed==="story"?"Audiobook, story only":"Audiobook, story + lessons",artwork:[{src:"/icons/icon-512.png",sizes:"512x512",type:"image/png"}]})}catch(e){}return}if(!CH)return;try{navigator.mediaSession.metadata=new MediaMetadata({title:`${CH.title}: ${$("narlabel")?$("narlabel").textContent:""}`,artist:COURSE.full_title||"The Halcyon Launch",album:TRACK==="full"?"Full Course":"Refresher",artwork:[{src:"/icons/icon-512.png",sizes:"512x512",type:"image/png"}]})}catch(e){}}
if("mediaSession" in navigator){try{
  navigator.mediaSession.setActionHandler("play",()=>{NAR.listening=true;NAR.audio.play().then(()=>{narUI();narHighlight()})});
  navigator.mediaSession.setActionHandler("pause",()=>{NAR.listening=false;NAR.audio.pause();narUI()});
  navigator.mediaSession.setActionHandler("nexttrack",()=>narSkip(1));try{navigator.mediaSession.setActionHandler("previoustrack",()=>narSkip(-1))}catch(e){}
  navigator.mediaSession.setActionHandler("seekbackward",()=>{NAR.audio.currentTime=Math.max(0,NAR.audio.currentTime-10)});
  navigator.mediaSession.setActionHandler("seekforward",()=>{NAR.audio.currentTime=Math.min(NAR.audio.duration||0,NAR.audio.currentTime+10)});
}catch(e){}}
NAR.audio.addEventListener("play",narMedia);
if("serviceWorker" in navigator&&location.protocol==="https:")navigator.serviceWorker.register("/sw.js").catch(()=>{});



/* ===== cast wiki ===== */
function castList(){return DATA().cast||[]}
function storyReach(){let done=0;TRACKS.full.list().forEach(c=>{const st=c.num===(TRACK==="full"&&CH?CH.num:-1)?S:load("full",c.num);if(st&&(st.pos||0)>=steps(c).length-1)done=Math.max(done,c.num)});return done}
/* image files: assets.js (tools/asset_manifest.mjs) lists the portraits and chapter art that exist, so a page asks only for a file
   that's there, .jpg before .svg. Without the list, fall back to trying the .jpg, then the .svg. */
const ASSETS=Array.isArray(window.HALCYON_ASSETS)?new Set(window.HALCYON_ASSETS):null;
function imgOf(stem){const c=[".jpg",".svg"].map(x=>R(V2(stem+x)));if(!ASSETS)return {src:c[0],alt:c[1]};const p=c.find(x=>ASSETS.has(x.replace(/^\//,"")));return p?{src:p}:null}
function imgTag(stem,attrs,gone){const f=imgOf(stem);if(!f)return "";return `<img src="${f.src}" ${attrs} onerror="${f.alt?`if(!this.dataset.f){this.dataset.f=1;this.src='${f.alt}'}else `:""}${gone}">`}
function avatar(c,size){const ini=c.name.split(" ").map(w=>w[0]).slice(0,2).join("");let h=0;for(const ch of c.id)h=(h*31+ch.charCodeAt(0))>>>0;const hue=h%360;
  return `<span class="av" style="width:${size}px;height:${size}px;--avh:${hue}">${imgTag("cast/"+c.id,'alt="" loading="lazy"',"this.remove()")}<span>${esc(ini)}</span></span>`}
function renderCast(id){setTimeout(ambSync,0);setTimeout(navSync,0);
  TRACK="cast";$("railgame").hidden=true;$("mockcard").hidden=true;const L=castList();const reach=store.get("spoilers",false)?99:storyReach();
  if(!L.length){$("page").innerHTML=`<h1>Cast</h1><p class="prog">The cast guide is on its way.</p>`;return}
  if(!id){$("page").innerHTML=`<div class="kicker">${esc(COURSE.full_title||COURSE.title)}</div><h1>Cast</h1><div class="story"><p>Profiles fill in as you play the Full Course, so nothing gets spoiled. You've finished ${reach>=99?"everything (spoilers on)":reach?`chapter ${reach}`:"no chapters yet"}.</p></div>
    <div class="castgrid">${L.map(c=>{const seen=c.firstChapter<=Math.max(1,reach+1);return `<button class="castcard" type="button" data-c="${c.id}" ${seen?"":"disabled"}>${avatar(c,64)}<span><b>${seen?esc(c.name):"Not met yet"}</b><span class="prog">${seen?esc(c.role):`Appears in chapter ${c.firstChapter}`}</span></span></button>`}).join("")}</div>
    <label class="chk prog" style="margin-top:16px"><input type="checkbox" id="spoil" ${store.get("spoilers",false)?"checked":""}> Show everything, including spoilers</label>`;
    $("page").querySelectorAll("[data-c]").forEach(b=>b.onclick=()=>{renderCast(b.dataset.c);top()});$("spoil").onchange=e=>{store.set("spoilers",e.target.checked);renderCast()};return}
  const c=L.find(x=>x.id===id);const byId={};L.forEach(x=>byId[x.id]=x);
  $("page").innerHTML=`<div class="kicker"><button class="linkbtn" id="castback" type="button">Cast</button> · ${esc(c.role)}</div><div class="casthead">${avatar(c,112)}<div><h1>${esc(c.name)}</h1><p class="prog">First appears in chapter ${c.firstChapter}</p>${c.intro?`<button class="btn small" id="hear" type="button">▶ Hear ${esc(c.name.split(" ")[0])}</button>`:""}</div></div>
    ${c.quote&&c.quote.unlock<=reach+1?`<blockquote class="castquote">${c.quote.text}</blockquote>`:""}
    ${c.sections.map(sec=>sec.unlock<=Math.max(1,reach)||(sec.unlock===1)?`<section class="lesson"><h2>${esc(sec.title)}</h2>${paras(sec.body)}</section>`:`<section class="locked"><h2>${esc(sec.title)}</h2><p class="prog">Unlocks after chapter ${sec.unlock}.</p></section>`).join("")}
    ${(c.ties||[]).filter(t=>t.unlock<=Math.max(1,reach)).length?`<h2>Connections</h2><ul class="ties">${c.ties.filter(t=>t.unlock<=Math.max(1,reach)).map(t=>`<li><button class="linkbtn" data-c="${t.id}" type="button">${esc((byId[t.id]||{}).name||t.id)}</button>: ${esc(t.text)}</li>`).join("")}</ul>`:""}`;
  if(window.__castAudio)window.__castAudio.pause();const h=$("hear");if(h){const a=new Audio(R(V2(`cast/voice/${c.id}.mp3`)));window.__castAudio=a;a.onended=()=>h.textContent=`▶ Hear ${c.name.split(" ")[0]}`;a.onerror=()=>h.remove();h.onclick=()=>{if(a.paused){a.play().catch(()=>{});h.textContent="❚❚ Pause"}else{a.pause();h.textContent=`▶ Hear ${c.name.split(" ")[0]}`}}}
  $("castback").onclick=()=>{if(window.__castAudio)window.__castAudio.pause();renderCast();top()};$("page").querySelectorAll("[data-c]").forEach(b=>b.onclick=()=>{renderCast(b.dataset.c);top()});
}


/* #labtest: every fixture lab in tools/lab_fixture.js on one page, for checking lab kinds no course uses yet. Saved on this device only. */
function renderLabTest(){TRACK="labtest";$("railgame").hidden=true;$("mockcard").hidden=true;const L=(window.HALCYON_LABS||{}).__fixture||[];const st=store.get("labtest",{});
  $("page").innerHTML=`<div class="kicker">Lab test page</div><h1>Lab fixtures</h1><p class="lead">Test data for lab kinds. Answers save on this device only.</p>${L.map(l=>`<section class="lab" id="lab-${esc(l.id)}"></section>`).join("")}`;
  L.forEach((l,k)=>HalcyonLab.mount($("lab-"+l.id),l,st[l.id]||(st[l.id]={q:{}}),{R:x=>x,paras,mentor:"Fixture",k,n:L.length,save:()=>store.set("labtest",st)}))}
function renderGuide(){setTimeout(ambSync,0);TRACK="guide";setTimeout(navSync,0);$("railgame").hidden=true;$("mockcard").hidden=true;
  $("page").innerHTML=`<div class="kicker">Guide</div><h1>How to use it</h1><div class="story guide"><p>Two ways to take in each chapter: read it and play it yourself, or let it play like an audiobook. Your place is saved to your account, so you can stop on your desktop and pick up on your phone.</p>
  <h2>How the stories work</h2><dl>
   <dt>Choose your path</dt><dd>Every course is a novel with an exam hidden inside it. You play the lead. When a decision comes up, you pick what they do, and the story goes where you sent it. People react to your call, later scenes can change, and so can the way the chapter ends. Then your mentor tells you what the best answer was and why, the way the exam would see it.</dd>
   <dt>Your path and the best path</dt><dd>Reading, you get your own path, good calls and bad ones. The Audiobook plays the best path, the version where the lead gets every call right, and it always has the good ending.</dd>
   <dt>Ways to take it in</dt><dd>Most people <b>read and decide</b>. Tap ▶ Listen on any page if you'd rather hear it. Turn on <b>Focus mode</b> if the scores pull you out of the story; it hides them and saves the lesson for the end. In the car, use the <b>Audiobook</b>. <b>Story only</b> is just the novel. <b>Story + lessons</b> adds the teaching and pauses at each decision so you can guess before you hear the answer.</dd>
   <dt>A good way to use it</dt><dd>Read and decide the first time through, so your own calls get tested. Use the Audiobook in the car to hear the story again with the right answers. Before the exam, work the quizzes, the practice exam, and the study plan on the Progress page.</dd>
   <dt>About this book</dt><dd>Not sure which book to start? Each one has an About page that reads like the back cover. Tap "About this book" on its Library card or at the top of its home page.</dd>
   <dt>Coming next</dt><dd>New chapters and new books. We won't spoil any of it. <button class="linkbtn" type="button" id="guideup">See what's coming</button></dd>
  </dl>
  <h2>Reading a chapter</h2><dl>
   <dt>▶ Listen (bar at the bottom)</dt><dd>Reads the page you're on aloud and highlights each word as it goes. Pausing, switching pages or switching devices keeps your spot.</dd>
   <dt><span class="key">⟲ 10</span> and <span class="key">30 ⟳</span></dt><dd>Back 10 seconds for a quick refresher, or ahead 30. Your lock screen and car controls skip too.</dd>
   <dt>Speed</dt><dd>0.8x to 1.5x. Remembered for next time.</dd>
   <dt>Contents</dt><dd>Tap Contents under the chapter steps, or use the list under the chapter in the side menu, to jump to any part. The lesson, drills, labs and quiz are always open. Decisions open in order as you answer them, so the story doesn't spoil.</dd>
   <dt>⏮ and ⏭</dt><dd>Previous and next page. In the Audiobook they jump scene to scene.</dd>
   <dt>Keep going</dt><dd>When a page finishes, it turns to the next one on its own. Decisions still wait for you to pick.</dd>
  </dl>
  <h2>Labs</h2><dl>
   <dt>What they are</dt><dd>Some chapters have hands-on labs after the exercise: a real chart, a live weather report, a calculator, or cards to sort. They're optional. They never lock the story and they don't change your score.</dd>
   <dt>Checking your answer</dt><dd>Type or tap your answer and press Check. Numbers get a little room for rounding. You get three tries. After a right answer or the third miss, you see the worked solution.</dd>
   <dt>Hints</dt><dd>Tap Hint for a nudge, one at a time. They don't cost you anything.</dd>
   <dt>Labs waiting</dt><dd>The Audiobook doesn't read labs aloud. It just mentions them. When you listen to a chapter that has one, it's saved to Labs waiting on the Audiobook page and your course home, so you can do it later with a screen in front of you.</dd>
   <dt>Live data</dt><dd>Some labs pull a real report as it is right now. If the feed doesn't answer, you get a sample report instead, and the lab works the same way.</dd>
  </dl>
  <h2>Audiobook</h2><dl>
   <dt>What it is</dt><dd>The audiobook version. No tapping. It plays the whole chapter, then the next, with your phone locked. Made for the car or the gym.</dd>
   <dt>Story only</dt><dd>Just the novel, about 10 to 13 minutes a chapter. The lead makes the right calls and you hear what happens.</dd>
   <dt>Story + lessons</dt><dd>The story plus ${MENTOR()}'s lesson, with each decision read aloud, a pause to think, then the answer and why. About 25 minutes.</dd>
   <dt>Resume</dt><dd>The Audiobook page shows a Resume button with where you stopped. Switch editions and it picks up near the same point in the chapter.</dd>
   <dt>Switching between reading and listening</dt><dd>Tap 🎧 Audiobook on a chapter and it starts at the part you're reading. Open a chapter after listening and it offers to jump to the scene you were hearing. The Audiobook page has a 📖 Read from here button too. Works across devices.</dd>
   <dt>Sections</dt><dd>Tap Sections under a chapter on the Audiobook page to start from any scene. The player shows which scene you're hearing.</dd>
   <dt>⬇ Download</dt><dd>Each chapter has a download button if you want the file for a drive with no signal.</dd>
  </dl>
  <h2>Settings at the top</h2><dl>
   <dt>Focus mode</dt><dd>Hides scores and meters and moves the lesson to the end of the chapter, so it reads like a novel. You still make every decision. Turn it off to see your scores as you go. Only changes reading; the Audiobook is the same either way.</dd>
   <dt>Ambience</dt><dd>Quiet background sound that fits each scene, like an office or a data center. The slider sets the volume. It plays under the reading narration, not the Audiobook (that has its own opening and closing music).</dd>
   <dt>Your settings</dt><dd>Focus mode and Ambience follow your account, so they match on every device.</dd>
  </dl>
  <h2>Your study log</h2><dl>
   <dt>What counts</dt><dd>Each course keeps a log of the time you spend studying it, day by day. Reading counts while a chapter, quiz, practice set or practice exam is on screen and you've tapped, typed, scrolled or moved the mouse in the last 2 minutes, so a tab left open doesn't add up. Listening counts while the audio is really playing, by the clock, so a faster speed doesn't stretch it. Time on pages like Progress, Cast and this Guide doesn't count.</dd>
   <dt>Where it is</dt><dd>Open Progress in a course and scroll to Study log. Each day shows minutes and what you worked on, with a running total in hours. Pick From and To dates to total a stretch.</dd>
   <dt>Export</dt><dd><b>Download study log</b> saves a CSV file for a spreadsheet. <b>Printable page</b> opens a clean copy with the course, your name, the dates and the total. Print it, or save it as a PDF from the print screen.</dd>
  </dl>
  <h2>Put it on your iPhone</h2><dl>
   <dt>Install</dt><dd>Open the site in <b>Safari</b>, tap the <b>Share</b> button, then <b>Add to Home Screen</b>. It opens full screen like an app.</dd>
   <dt>Sign in once</dt><dd>The home screen app keeps its own sign-in, so sign in again the first time you open it. After that your progress and listening spot follow you.</dd>
   <dt>Lock screen</dt><dd>Start the Audiobook, lock the phone, and use the lock screen or CarPlay controls to pause and skip.</dd>
  </dl>
  <h2>Privacy</h2><p>The site counts anonymous page views, without cookies, to learn which chapters people read. No personal data.</p><p>Your study log is stored with your progress in your account, like your saved place. It holds dates, minutes and the parts you studied, nothing more.</p><p>If you join the list, we store your email to tell you about new books. Ask to be removed anytime. Each email has a leave link at the bottom too.</p>
  <h2>Troubleshooting</h2><label class="chk prog"><input type="checkbox" id="pdbgt" ${PDBG.on?"checked":""}> Show player diagnostics (a log at the top of the screen; screenshot it and send it to Anthony)</label></div>`;
  if($("guideup"))$("guideup").onclick=()=>{renderUpcoming();top()};$("pdbgt").onchange=e=>{PDBG.on=e.target.checked;store.set("pdbg",PDBG.on);if(!PDBG.on){const el=$("pdbg");if(el)el.remove()}else plog("diagnostics on")}}
function lastPlaceLabel(){const lp=store.get("lastplace."+COURSE.id,null);if(!lp)return null;if(lp.t==="mock")return hasMock()?[multiForm()&&mockForms().some(x=>x.f===lp.f)?`Practice exam · ${formLabel(lp.f)}`:"Practice exam",()=>openMock(lp.f)]:null;const c=TRACKS[lp.t]&&TRACKS[lp.t].list().find(x=>x.num===lp.n);if(!c)return null;return[`${lp.t==="ref"?"Refresher":"Ch"} ${c.num} · ${c.title}`,()=>openChapter(lp.t,c.num)]}
/* where you are lives in the address (#pmp/full/3, #guide), so a reload reopens the same screen */
function noteRoute(){if(!COURSE)return;const c=COURSE.id;const r=TRACK==="library"?"library":TRACK==="guide"?"guide":TRACK==="upcoming"?"upcoming":TRACK==="about"?c+"/about":TRACK==="book"?c+"/listen":TRACK==="cast"?c+"/cast":(TRACK==="dash"||TRACK==="practice"||TRACK==="logprint")?c+"/progress":TRACK==="final"?c+"/final":TRACK==="cert"?c+"/certificate":TRACK==="verify"?"verify":TRACK==="mock"?c+"/mock"+(multiForm()&&MOCK_FORM?"/"+MOCK_FORM:""):(TRACK==="full"||TRACK==="ref")&&CH?`${c}/${TRACK}/${CH.num}`:c+"/home";
  store.set("route",r);if(location.hash!=="#"+r)try{history.replaceState(null,"","#"+r)}catch(e){}pageview(r)}
/* anonymous page views (Vercel Web Analytics, loaded in index.html): the route only, as a path. Never a name, email, id, or progress. */
let LASTPV="";function pageview(r){if(TESTP||!r||r===LASTPV)return;LASTPV=r;try{if(window.va)window.va("pageview",{path:"/"+r})}catch(e){}}
async function routeTo(h){const p=String(h||"").replace(/^#/,"").split("/").filter(Boolean);if(!p.length)return false;if(p[1]!=="mock")clearInterval(mockTimer); // the back button or an edited address leaves a timed mock: stop its clock
  if(p[0]==="verify"){renderVerify();return true}
  if(p[0]==="library"){renderLibrary();return true}if(p[0]==="guide"){renderGuide();return true}if(p[0]==="upcoming"){renderUpcoming();return true}if(p[0]==="labtest"){await loadScripts(["tools/lab_fixture.js"]);renderLabTest();return true}
  const c=courseById(p[0]);if(!c||c.status!=="live")return false;if(c.id!==COURSE.id&&!(await useCourse(c.id)))return false;if(!c._loaded&&(c.scripts||c.labs))await useCourse(c.id);
  const v=p[1]||"home",n=+p[2];
  if((v==="full"||v==="ref")&&TRACKS[v].list().find(x=>x.num===n)){openChapter(v,n);return true}
  if(v==="listen"){renderBook();return true}if(v==="about"){renderAbout();return true}if(v==="cast"){renderCast();return true}if(v==="progress"){if(p[2]==="log")openLog();else renderDash();return true}if(v==="mock"){openMock(p[2]?n:undefined);return true}if(v==="final"&&c.final){await openFinal();return true}if(v==="certificate"&&c.final){await openCert();return true}
  renderHome();renderRail();return true}
window.addEventListener("hashchange",()=>{const r=String(location.hash).replace(/^#/,"");if(r&&r!==store.get("route",""))routeTo(location.hash)});
function navSync(){noteRoute();try{bookBarSync()}catch(e){console.error(e)}const map={home:"homelink",library:"liblink",upcoming:"liblink",dash:"proglink",practice:"proglink",logprint:"proglink",final:"proglink",cert:"proglink",cast:"castlink",book:"listenlink",guide:"guidelink"};["liblink","homelink","proglink","castlink","listenlink","guidelink"].forEach(id=>{const b=$(id);if(b)b.classList.remove("on")});
  const onId=!TRACK?"homelink":map[TRACK];if(onId&&$(onId))$(onId).classList.add("on");
  const cb=$("contlink");if(!cb)return;const lp=lastPlaceLabel();const inPlace=(TRACK==="full"||TRACK==="ref"||TRACK==="mock");
  if(lp&&!inPlace&&TRACK!==null){cb.hidden=false;cb.textContent="Continue: "+lp[0];cb.onclick=()=>{lp[1]();}}else cb.hidden=true;
  if(!inPlace&&lp&&(TRACK==="cast"||TRACK==="dash"||TRACK==="practice"||TRACK==="book"||TRACK==="guide")){const pg=$("page");if(pg&&!pg.querySelector(".backlink")){const d=document.createElement("p");d.className="backlink";d.innerHTML=`<button class="linkbtn" type="button">← Back to ${esc(lp[0])}</button>`;d.firstChild.onclick=()=>lp[1]();pg.prepend(d)}}}


/* ===== audiobook ===== */
let BOOK=null;
let MARKS=null;
async function bookMarks(){if(MARKS)return MARKS;if(NOAUD())return MARKS={full:{}};const cid=COURSE.id;let M;try{const r=await fetch(R(V2("audio/bookmarks.json")),{cache:"no-store"});M=r.ok?await r.json():{full:{}}}catch(e){M={full:{}}}if(COURSE.id!==cid)return {full:{}};return MARKS=M} // a reply that lands after a course switch belongs to the old course
const PIDS=c=>["open",...(c.lesson?["lesson"]:[]),...c.scenes.map((_,i)=>"s"+i),"end"];
function pidAt(n,ed,t){const L=MARKS&&MARKS.full[n]&&MARKS.full[n][ed];if(!L||!L.length)return null;let p=L[0][0];for(const [id,s] of L)if(s<=t+1)p=id;return p}
function pidLabel(pid,n){const c=TRACKS.full.list().find(x=>x.num===n);return secName(c,pid)}
function stepOfPid(c,pid){const L=steps(c);const k=pid==="open"||pid==="lesson"||pid==="end"?L.findIndex(x=>x.k===pid):L.findIndex(x=>x.k==="scene"&&x.i===+pid.slice(1));return Math.max(0,k)}
function readPid(){const L=steps(CH);for(let p=Math.min(S.pos,L.length-1);p>=0;p--){const x=L[p];if(x.k==="open"||x.k==="lesson"||x.k==="end")return x.k;if(x.k==="scene")return "s"+x.i}return "open"}
function markTime(n,ed,pid){const L=MARKS&&MARKS.full[n]&&MARKS.full[n][ed];if(!L)return null;const order=PIDS(TRACKS.full.list().find(x=>x.num===n)||CH);for(let k=order.indexOf(pid);k>=0&&k<order.length;k++){const m=L.find(x=>x[0]===order[k]);if(m)return m[1]}return null}
const readAt=n=>store.get(`readat.${BID()}.${n}`,0);
function readFromBook(){const LB=lget().book;if(!LB)return;const pid=pidAt(LB.n,LB.ed,LB.t)||"open";if(NAR.page==="book")NAR.audio.pause();store.set("handoff.seen",LB.at||0);openChapter("full",LB.n);if(TRACK==="full"&&CH&&CH.num===LB.n)fullGo(stepOfPid(CH,pid))}
async function handoffOffer(){if(TRACK!=="full"||!CH||!S)return;const LB=lget().book;if(!LB||LB.n!==CH.num||!LB.at||LB.at<=readAt(CH.num)||LB.at<=store.get("handoff.seen",0))return;await bookMarks();if(TRACK!=="full"||!CH||CH.num!==LB.n)return;
  const pid=pidAt(LB.n,LB.ed,LB.t);if(!pid)return;const k=stepOfPid(CH,pid);if(k===S.pos||$("handoff"))return;
  const d=document.createElement("div");d.id="handoff";d.className="handoff";d.innerHTML=`<span>🎧 You were listening at <b>${esc(pidLabel(pid,LB.n))}</b> in the Audiobook (${fmtT(LB.t)}).</span><button class="btn small" type="button" id="hojump">Pick up there</button><button class="btn small ghost" type="button" id="hox" aria-label="Dismiss">✕</button>`;
  $("page").prepend(d);$("hojump").onclick=()=>{store.set("handoff.seen",LB.at);if(NAR.page==="book")NAR.audio.pause();fullGo(k)};$("hox").onclick=()=>{store.set("handoff.seen",LB.at);d.remove()}}
async function bookManifest(){bookMarks();if(BOOK&&Object.keys(BOOK.full||{}).length)return BOOK;if(NOAUD())return BOOK={full:{}};const cid=COURSE.id;let M;try{const r=await fetch(R(V2("audio/audiobook.json")),{cache:"no-store"});M=r.ok?await r.json():{full:{}}}catch(e){M={full:{}}}if(COURSE.id!==cid)return BOOK||{full:{}};return BOOK=M}
function bookPlay(ed,n,at){const M=BOOK.full[n]&&BOOK.full[n][ed];if(!M)return;libTouch({t:"book",n});labQueue(n);NAR.bsec=null;NAR.free=false;bookMarks().then(()=>narTicks());NAR.page="book";NAR.book={ed,n};NAR.key="book";NAR.audio.pause();NAR.audio.src=R(M.src);NAR.audio.playbackRate=NAR.rate;
  if(at!=null){if(at>1)seekTo(at)}else{const LB=lget().book;const sameEd=LB&&LB.n===n&&LB.ed===ed;const pos0=sameEd?LB.t:0;
   if(pos0>5)seekTo(pos0);else NAR.audio.addEventListener("loadedmetadata",()=>{const pos=bookResumePos(ed,n,NAR.audio.duration);if(pos>5&&pos<(NAR.audio.duration-5))seekTo(pos)},{once:true})}
  NAR.listening=true;NAR.audio.play().then(()=>{narUI();narHighlight();narMedia()}).catch(()=>{});narUI();if(TRACK==="book")renderBook()}
async function renderBook(){setTimeout(ambSync,0);
  TRACK="book";setTimeout(navSync,0);$("railgame").hidden=true;$("mockcard").hidden=true;const B=await bookManifest();await bookMarks();if(TRACK!=="book")return;
  const ed=store.get("bookEd."+COURSE.id,"story");const full=TRACKS.full.list();
  const row=c=>{const M=B.full[c.num]&&B.full[c.num][ed];const done=store.get(`bookdone.${BID()}.${ed}.${c.num}`,false);const now=NAR.page==="book"&&NAR.book&&NAR.book.n===c.num&&NAR.book.ed===ed;
    const dl=M?`<a class="dl prog" href="${esc(R(M.src))}" download title="Download chapter ${c.num} for the car or gym">⬇</a>`:"";
    const mk=(MARKS&&MARKS.full[c.num]&&MARKS.full[c.num][ed])||[];
    const secs=M&&mk.length?`<details class="bsecs"><summary class="prog">Sections</summary><div class="bsecl">${mk.map(([pid,t])=>`<button type="button" class="bsec" data-bn="${c.num}" data-bt="${t}"><span>${esc(secName(c,pid))}</span><span class="prog">${fmtT(t)}</span></button>`).join("")}</div></details>`:"";
    return `<div class="browwrap"><button class="brow ${now?"now":""}" type="button" data-b="${c.num}" ${M?"":"disabled"}><span class="cn">${c.num}</span><span class="ct">${esc(c.title)}</span><span class="cs">${M?`${Math.round(M.min)} min`:"not recorded yet"}${done?" · ✓":""}${now?(NAR.audio.paused?" · paused":" · playing"):""}</span></button>${dl}</div>${labMention(c)}${secs}`};
  $("page").innerHTML=`<div class="kicker">Audiobook</div><h1>Audiobook</h1>${bfChapter()?`<div id="bfslot"></div>`:""}<p class="lead">No tapping needed. It plays the story on the right-answer path, chapter after chapter, and keeps going with your phone locked. Pause or skip with your car or lock-screen controls.</p>
   <div class="edtoggle" role="radiogroup" aria-label="Edition"><button type="button" class="${ed==="story"?"on":""}" data-ed="story"><b>Story only</b><span class="prog">Just the novel. ${esc(COURSE.hero||"The lead")} makes the right calls and you hear what happens.</span></button><button type="button" class="${ed==="study"?"on":""}" data-ed="study"><b>Story + lessons</b><span class="prog">The story plus ${MENTOR()}'s lesson, and each decision read aloud with a pause, then the answer and why. About twice as long.</span></button></div>
   ${(()=>{const LB=lget().book;if(!LB||!(B.full[LB.n]))return "";const same=LB.ed===ed;const c=full.find(x=>x.num===LB.n);return `<button class="handsfree" type="button" id="bresume"><span>▶</span><span><b>Resume chapter ${LB.n}${c?": "+esc(c.title):""}</b><span class="prog">${same?`at ${fmtT(LB.t)}`:`near where you stopped in ${LB.ed==="story"?"Story only":"Story + lessons"}`} · picks up on any device</span></span></button><button class="btn small ghost" type="button" id="bread">📖 Read from here${pidAt(LB.n,LB.ed,LB.t)?": "+esc(pidLabel(pidAt(LB.n,LB.ed,LB.t),LB.n)):""}</button>`})()}
   <p class="prog">Plays chapter to chapter on its own and remembers where you stopped, on any device. Use ⟲ 10 for a quick refresher. The ⬇ next to a chapter downloads it for the car or the gym. Works with the lock screen and car controls. Chapters are recorded as you reach them.</p>
   ${labWaitHTML()}<h2>Full Course</h2>${(()=>{const L=COURSE.bookRecordedOnly?full.filter(c=>B.full[c.num]&&B.full[c.num][ed]):full;return L.length?`<div class="brows">${L.map(row).join("")}</div>`:`<p class="prog">The narration for this edition is being recorded. Chapters show up here as they're ready.</p>`})()}`;wireLabWait();
  bfMount();
  $("page").querySelectorAll("[data-ed]").forEach(b=>b.onclick=()=>{store.set("bookEd."+COURSE.id,b.dataset.ed);renderBook()});
  {const r=$("bresume");if(r)r.onclick=()=>{const LB=lget().book;if(LB)bookPlay(ed,LB.n)}}
  {const r=$("bread");if(r)r.onclick=()=>{readFromBook();top()}}
  $("page").querySelectorAll("[data-bn]").forEach(b=>b.onclick=()=>bookPlay(ed,+b.dataset.bn,+b.dataset.bt));
  $("page").querySelectorAll("[data-b]").forEach(b=>b.onclick=()=>{const n=+b.dataset.b;if(NAR.page==="book"&&NAR.book&&NAR.book.n===n&&NAR.book.ed===ed){if(NAR.audio.paused){NAR.audio.play();narHighlight()}else NAR.audio.pause();setTimeout(renderBook,50);return}bookPlay(ed,n)});
}


/* ===== audiobook follow-along (approved 2026-10-12) =====
   While a chapter plays on the Audiobook page, its text shows with the word being read highlighted. The words and their times come from
   <audio>/episodes/chNN-<ed>.json (tools/book_text.mjs builds them from the page word timings, laid out the way the mp3 was assembled),
   so what shows is what is read: the right-answer path, and in Story + lessons the lesson, the decisions read aloud and the debriefs.
   Scene headings come from bookmarks.json. Tap a paragraph or a heading to jump the audio there. Scrolling the text by hand stops the
   auto follow and "Follow the reading" brings it back, as on chapter pages. The seek bar gets a tick at each scene start. Nothing here
   writes anywhere but the listening position the player already saves. */
const BTX={}; // index url -> index, or null when there is none
function btextUrl(n,ed){const M=BOOK&&BOOK.full[n]&&BOOK.full[n][ed];return M?R(M.src.replace(/(?:story\/)?full-ch(\d+)\.mp3$/,`episodes/ch$1-${ed}.json`)):null}
function bookText(n,ed){const u=btextUrl(n,ed);if(!u||NOAUD())return Promise.resolve(null);if(u in BTX)return BTX[u]; // null: no index for this chapter; undefined: couldn't load it (offline), asked again next time
  return BTX[u]=(async()=>{let J,keep=false;try{const r=await fetch(u);if(r.ok){J=await r.json();keep=true}else if(r.status===404){J=null;keep=true}}catch(e){}
    if(J&&!(J.v===1&&J.n===n&&J.ed===ed&&Array.isArray(J.p)))J=null;if(!keep)delete BTX[u];return J})()}
const BF={id:null,el:null,box:null,words:[],times:null,cur:-1,scroll:0}; // the panel built for one chapter and edition, kept across renderBook
function bfChapter(){if(NAR.page==="book"&&NAR.book)return {n:NAR.book.n,ed:NAR.book.ed,live:true};const LB=lget().book;return LB&&BOOK&&BOOK.full[LB.n]&&BOOK.full[LB.n][LB.ed]?{n:LB.n,ed:LB.ed,t:LB.t,live:false}:null}
function bfBuild(J,c,ed){const L=(MARKS&&MARKS.full[J.n]&&MARKS.full[J.n][ed])||[];const at={};let k=0;
  for(const [pid,t] of L){while(k<J.p.length&&J.p[k][2][0]<t-0.05)k++;if(k<J.p.length)(at[k]=at[k]||[]).push([pid,t])}
  if(L.length&&J.p.length&&!at[0]){const f=Object.keys(at).map(Number).sort((a,b)=>a-b)[0];if(f!=null&&f<=2){at[0]=at[f];delete at[f]}} // the chapter title line comes just before the opening mark
  const html=J.p.map(([pid,words,ts],i)=>{const h=(at[i]||[]).map(([p,t])=>`<button type="button" class="bfh" data-t="${t}">${esc(secName(c,p))}</button>`).join("");
    const ws=words.split(" ");const cls=pid==="lesson"?" les":pid[0]==="o"?" deb":"";
    return `${h}<p class="bfp${cls}" data-t="${ts[0]}">${ws.map(w=>`<span class="bw">${esc(w)}</span>`).join(" ")}</p>`}).join("");
  const sec=document.createElement("section");sec.className="bfollow";sec.id="bfollow";sec.setAttribute("aria-label","Follow along");
  sec.innerHTML=`<div class="bfhead"><div><b>Chapter ${J.n}${c?": "+esc(c.title):""}</b><span class="prog">Playing ${ed==="story"?"Story only":"Story + lessons"} · Tap a paragraph to jump there</span></div></div><div class="bftext story" id="bftext" tabindex="0" aria-label="Chapter text">${html}</div>`;
  return sec}
function bfNote(msg){const s=document.createElement("section");s.className="bfollow";s.id="bfollow";s.innerHTML=`<p class="prog bfnote">${esc(msg)}</p>`;return s}
async function bfMount(){const slot=$("bfslot");if(!slot)return;const ch=bfChapter();if(!ch){slot.remove();return}
  const id=`${COURSE.id}|${ch.ed}|${ch.n}`;
  if(BF.id!==id||!BF.el){const J=await bookText(ch.n,ch.ed);if(!$("bfslot")||TRACK!=="book")return;const now=bfChapter();if(!now||`${COURSE.id}|${now.ed}|${now.n}`!==id)return;
    const c=TRACKS.full.list().find(x=>x.num===ch.n);
    if(!J){BF.id=J===null?id:null;BF.el=bfNote(J===null?`The follow-along text for chapter ${ch.n} isn't ready yet. The audio plays as usual.`:`The follow-along text couldn't load. Check your connection; the audio plays as usual.`);BF.box=null;BF.words=[];BF.times=null}
    else{BF.id=id;BF.el=bfBuild(J,c,ch.ed);BF.dur=J.dur;BF.box=BF.el.querySelector("#bftext");BF.words=[...BF.el.querySelectorAll(".bw")];BF.times=Float64Array.from(J.p.flatMap(p=>p[2]));BF.cur=-1;BF.scroll=0;bfWire()}}
  const s=$("bfslot");if(!s)return;const fresh=!BF.el.isConnected&&BF.shown!==id;BF.shown=id;s.replaceWith(BF.el);
  if(fresh&&ch.live){const r=BF.el.getBoundingClientRect();const nb=$("narbar"),bar=nb&&!nb.hidden?nb.getBoundingClientRect().top:innerHeight;if(r.top<0||r.bottom>bar)BF.el.scrollIntoView({block:"start",behavior:"smooth"})} // a chapter just started: bring its text into view
  if(BF.box){BF.box.scrollTop=BF.scroll;BF.box.querySelectorAll(".bw.hl").forEach(e=>e.classList.remove("hl"));BF.cur=-1;
    if(!ch.live&&ch.t!=null){bfShow(ch.t,true)}else bfTick(true)}}
function bfWire(){const box=BF.box,a=NAR.audio;
  box.addEventListener("scroll",()=>{BF.scroll=box.scrollTop;const w=NAR.lastw;if(NAR.page==="book"&&NAR.free&&w&&w.isConnected&&box.contains(w)){const o=bfOff(w);narFollowUI(o.off,o.up)}},{passive:true});
  const free=()=>{if(NAR.page==="book"&&!a.paused)NAR.free=true};
  box.addEventListener("wheel",free,{passive:true});box.addEventListener("touchmove",free,{passive:true});
  box.addEventListener("keydown",e=>{if(["PageUp","PageDown","ArrowUp","ArrowDown","Home","End"," "].includes(e.key))free()});
  box.addEventListener("mousedown",e=>{if(e.offsetX>=box.clientWidth)free()}); // dragging the scrollbar
  BF.el.addEventListener("click",e=>{const p=e.target.closest("[data-t]");if(!p||!BF.el.contains(p))return;const sel=getSelection&&getSelection();if(sel&&!sel.isCollapsed&&String(sel).trim())return; // selecting text, not jumping
    bfJump(+p.dataset.t)})}
function bfJump(t){const ch=bfChapter();if(!ch)return;NAR.free=false;narFollowUI(false);
  if(ch.live){NAR.audio.currentTime=Math.max(0,t);narSavePos(true);bookSec();bfTick(true)}
  else bookPlay(ch.ed,ch.n,Math.max(0.01,t))}
// the part of the text box you can see: inside the box, on screen, and above the player bar
function bfView(){const b=BF.box.getBoundingClientRect(),nb=$("narbar"),bar=nb&&!nb.hidden?nb.getBoundingClientRect().top:innerHeight;const top=Math.max(b.top,0),bot=Math.min(b.bottom,bar);return bot-top<80?{top:b.top,bot:b.bottom,b}:{top,bot,b}}
function bfOff(w){const r=w.getBoundingClientRect(),v=bfView();return {off:r.top<v.top+4||r.bottom>v.bot-4,up:r.top<v.top+4}}
function bfScrollTo(w,instant){const box=BF.box;if(!box||!w)return;const r=w.getBoundingClientRect(),v=bfView();const want=box.scrollTop+(r.top-v.top)-(v.bot-v.top)*0.3;
  box.scrollTo({top:Math.max(0,want),behavior:instant||Math.abs(want-box.scrollTop)>box.clientHeight*2?"auto":"smooth"})}
// highlight the word at time t (binary search on the word start times), and follow it unless the reader scrolled away
function bfShow(t,instant){if(!BF.times||!BF.box||!BF.box.isConnected)return;const T=BF.times;let lo=0,hi=T.length-1,i=-1;while(lo<=hi){const m=(lo+hi)>>1;if(T[m]<=t+0.02){i=m;lo=m+1}else hi=m-1}
  if(i===BF.cur&&!instant)return;if(BF.cur>=0&&BF.words[BF.cur])BF.words[BF.cur].classList.remove("hl");BF.cur=i;const w=BF.words[Math.max(0,i)];if(!w)return;if(i>=0)w.classList.add("hl");NAR.lastw=w;
  const o=bfOff(w);if(o.off&&(!NAR.free||instant))bfScrollTo(w,instant);if(NAR.page==="book")narFollowUI(o.off&&NAR.free&&!instant,o.up)}
function bfTick(instant){if(NAR.page!=="book"||!NAR.book||TRACK!=="book"||BF.id!==`${COURSE.id}|${NAR.book.ed}|${NAR.book.n}`)return;
  const d=NAR.audio.duration;if(BF.box&&d&&BF.dur&&Math.abs(d-BF.dur)>0.5){BF.el.replaceWith(BF.el=bfNote(`The follow-along text for chapter ${NAR.book.n} is being updated to match new audio. The audio plays as usual.`));BF.box=null;BF.times=null;return} // the mp3 was re-rendered after the index was built
  bfShow(NAR.audio.currentTime||0,instant)}
/* scene ticks on the seek bar (Audiobook only): one tappable mark per bookmark, dropped where it would crowd the one before it */
function narTicks(){const box=$("narticks");if(!box)return;const a=NAR.audio,d=a.duration;
  if(NAR.page!=="book"||!NAR.book||!d||!MARKS){box.innerHTML="";return}
  const {n,ed}=NAR.book,L=(MARKS.full[n]&&MARKS.full[n][ed])||[],c=TRACKS.full.list().find(x=>x.num===n),W=box.clientWidth||300,TH=8; // TH: half the range thumb, where the track starts and ends
  let last=-1e9;box.innerHTML=L.filter(([,t])=>t<d).map(([pid,t])=>{const x=TH+(W-2*TH)*t/d;if(x-last<26)return "";last=x;const lab=secName(c,pid);
    return `<button type="button" class="ntick" style="left:calc(${TH}px + (100% - ${2*TH}px) * ${(t/d).toFixed(5)})" data-t="${t}" aria-label="${esc(lab)}, ${fmtT(t)}" data-tip="${esc(lab)} · ${fmtT(t)}"><i></i></button>`}).join("");
  box.querySelectorAll(".ntick").forEach(b=>b.onclick=()=>{if(NAR.page!=="book")return;NAR.audio.currentTime=+b.dataset.t;NAR.free=false;narSavePos(true);bookSec();if(NAR.audio.paused)narHighlight()})}
["loadedmetadata","durationchange"].forEach(ev=>NAR.audio.addEventListener(ev,()=>{narTicks();bfTick(true)}));
addEventListener("resize",()=>narTicks());


/* ===== chapter art + "In this scene" cast strip ===== */
function REF_ART(){return COURSE.refArt||{}}
function chapterArt(){if(!CH)return "";const n=TRACK==="full"?CH.num:REF_ART()[CH.num];if(!n)return "";const nn=String(n).padStart(2,"0");
  const img=imgTag("art/full-ch"+nn,'alt=""',"this.parentNode.remove()");return img?`<div class="chart">${img}</div>`:""}
function castStrip(){
  const pg=$("page");if(!pg||!(TRACK==="full"||TRACK==="ref")||!castList().length)return;const old=pg.querySelector(".xray");if(old)old.remove();
  const scope=[...pg.querySelectorAll(".outcome").length?pg.querySelectorAll(".story p, .outcome .story p"):pg.querySelectorAll(".story p, .lesson .story p, .choice span")];
  const text=scope.map(e=>e.textContent).join(" ");const speakers=new Set([...pg.querySelectorAll("[data-who]")].map(e=>e.dataset.who));
  const reach=store.get("spoilers",false)?99:Math.max(storyReach(),TRACK==="full"?CH.num:0);
  const who=castList().filter(c=>{if(c.firstChapter>Math.max(1,reach))return false;const first=c.name.split(" ")[0],last=c.name.split(" ").slice(-1)[0];
    return speakers.has(c.speaker||"")||new RegExp(`\\b(${first}|${last})\\b`).test(text)});
  if(pg.querySelector(".lesson")&&!who.find(c=>c.id==="ruth")){const r=castList().find(c=>c.id==="ruth");if(r)who.unshift(r)}
  if(!who.length)return;const el=document.createElement("div");el.className="xray";
  el.innerHTML=`<span class="prog">In this scene</span>${who.slice(0,8).map(c=>`<button type="button" class="xp" data-x="${c.id}" title="${esc(c.name)}">${avatar(c,34)}<span>${esc(c.name.split(" ")[0])}</span></button>`).join("")}`;
  const h=pg.querySelector("h1,h2");if(h)h.after(el);else pg.prepend(el);
  el.querySelectorAll("[data-x]").forEach(b=>b.onclick=()=>{save();renderCast(b.dataset.x);top()});
}


/* ===== soundscapes and stings ===== */
const AMB={on:store.get("amb",false),vol:store.get("ambvol",0.25),cur:null,els:[new Audio(),new Audio()],i:0,sting:new Audio(),lastSting:""};
AMB.els.forEach(a=>{a.loop=true;a.volume=0});
const AMB_RULES=[["jet",/flight line|F-16|crew chief|jet engine|afterburner|\bjets?\b/i],["servers",/data center|server|rack|GPU|IronPeak|cluster|burn-in/i],["hospital",/hospital|\bICU\b|nurse|clinician|ward|Cheyenne|Greeley|Fort Collins|bedside/i],["rain",/\brain\b|storm|thunder|downpour/i],["night",/midnight|\bnight\b|\bdark\b|stars|11:\d\d PM/i],["morning",/kitchen|6:12|morning|breakfast|sunrise|dawn/i],["coffee",/coffee shop|café|cafe|barista/i],["car",/\bdrove\b|\bdrive\b|\bcar\b|truck|traffic|highway|I-25/i],["boardroom",/board meeting|boardroom|the board|conference room/i]];
/* PMP v2 settings: mission control and the readiness board, the test stand and the pad, wind on the plains, rain and surf at the Cape. No servers or hospital. */
const AMB_PMP=[["launch",/hot fire|test stand|\bthe pad\b|launch pad|liftoff|ignition|countdown|\bT minus\b/i],["surf",/\bthe Cape\b|\bsurf\b|\bocean\b|\bbeach\b|Atlantic|Cocoa/i],["mission",/mission control|flight control|blockhouse|\bconsoles?\b|\bon the loop\b|readiness board/i],["jet",/flight line|F-16|crew chief|jet engine|afterburner|\bjets?\b/i],["rain",/\brain\b|storm|thunder|downpour|hurricane/i],["wind",/\bwind\b|\bgusts?\b|plains|prairie|Limon/i],["night",/midnight|\bnight\b|\bdark\b|stars/i],["morning",/kitchen|morning|breakfast|sunrise|dawn/i],["coffee",/coffee shop|café|cafe|barista/i],["car",/\bdrove\b|\bdrive\b|\bcar\b|truck|traffic|highway|I-70|I-25/i],["boardroom",/boardroom|conference room/i]];
function ambFor(text,kind){if(kind==="lesson")return PMP2()?"mission":"boardroom";for(const [k,re] of (PMP2()?AMB_PMP:AMB_RULES))if(re.test(text))return k;return "office"}
function fade(a,to,ms){const from=a.volume,t0=performance.now();const step=()=>{const k=Math.min(1,(performance.now()-t0)/ms);a.volume=Math.max(0,Math.min(1,from+(to-from)*k));if(k<1)requestAnimationFrame(step);else if(to===0)a.pause()};requestAnimationFrame(step)}
function ambSync(){
  const inChapter=(TRACK==="full"||TRACK==="ref")&&CH;if(!AMB.on||!inChapter){AMB.els.forEach(a=>fade(a,0,800));AMB.cur=null;return}
  const pg=$("page");const text=[...pg.querySelectorAll(".story p, .prop")].map(e=>e.textContent).join(" ");const kind=pg.querySelector(".lesson")?"lesson":"";
  const want=ambFor(text,kind);if(want!==AMB.cur){const old=AMB.els[AMB.i];AMB.i=1-AMB.i;const nw=AMB.els[AMB.i];nw.src=`audio/amb/${want}.mp3?v=2`;nw.volume=0;nw.play().then(()=>fade(nw,AMB.vol,1500)).catch(()=>{});fade(old,0,1500);AMB.cur=want}
  // chapter stings
  const isOpen=!!pg.querySelector(".chart")&&(TRACK==="full"?S.pos===0:S.step<0);const isEnd=pg.querySelector(".end-grid");const tag=`${TRACK}${CH.num}${isOpen?"o":isEnd?"e":""}`;
  if((isOpen||isEnd)&&AMB.lastSting!==tag){AMB.lastSting=tag;AMB.sting.src=isOpen?"audio/sting-open.mp3":"audio/sting-close.mp3";AMB.sting.volume=Math.min(1,AMB.vol*2.4);AMB.sting.play().catch(()=>{})}
}
function ambUI(){const t=$("ambtoggle");if(t)t.checked=AMB.on;const v=$("ambvol");if(v)v.value=AMB.vol}

/* ===== home and rail ===== */
function chapterProgress(tr,c){const st=load(tr,c.num);if(!st)return "";if(tr==="ref")return st.step>=c.scenes.length?`${st.score}/${c.scenes.length*3}`:(st.step>=0?"in progress":"");const total=steps(c).length;return st.doneAt||(st.pos||0)>=total-1?"done":((st.max||0)>0?"in progress":"")}
/* ===== book progress (approved 2026-10-12): how far through the Full Course, and about how long is left =====
   Pages are the chapter's steps (steps(c)) minus the optional Labs step, counted over every published chapter. A finished chapter counts
   all its pages. Otherwise a decision, drill, exercise or quiz page counts once it's answered (the same test as the ✓ in Contents), and
   the opening, the lesson and the ending count once the reader has moved past them (index below st.max). Read only: every state comes
   from load() (the store, so the test profile shows its own), nothing is written.
   Time left, per page not yet done: a page the reader's audiobook edition narrates (bookEd, "story" by default: opening, decisions, ending;
   "study" adds the lesson, as in PIDS) gets an equal share of that chapter's real narration minutes from audiobook.json. Every other page
   (drills, exercise, quiz, a lesson the story edition skips, any chapter without narration) is its on-screen word count at READ_WPM. */
const READ_WPM=200;
const BP_WORDS=new WeakMap();
function bpWords(v){if(v==null||typeof v==="number"||typeof v==="boolean")return 0;if(typeof v==="string")return v.replace(/<[^>]*>/g," ").split(/\s+/).filter(w=>/[A-Za-z0-9]/.test(w)).length;
  if(typeof v==="function"){try{return bpWords(v(freshFull(),{},{}))}catch(e){return 0}} // scene text and chapter endings are functions of the reader's state: count a fresh run
  if(Array.isArray(v))return v.reduce((a,x)=>a+bpWords(x),0);return Object.entries(v).reduce((a,[k,x])=>a+(BP_SKIP.has(k)?0:bpWords(x)),0)}
const BP_SKIP=new Set(["id","after","task","domain","approach","video","src","a","s","d","best","flag"]); // ids, tags and links, not words on the page
function bpPageWords(c,x){let m=BP_WORDS.get(c);if(!m){m={};BP_WORDS.set(c,m)}const k=x.k+(x.i??x.j??"");if(m[k]!==undefined)return m[k];let w=0;
  if(x.k==="open")w=bpWords(c.opening);else if(x.k==="lesson")w=c.lesson?bpWords([c.lesson.title,c.lesson.sections]):0;else if(x.k==="end")w=bpWords(c.closing);
  else if(x.k==="scene"){const sc=c.scenes[x.i],o=sc.opts||[];w=bpWords(sc.text)+bpWords(o.map(y=>y.t))+(o.length?Math.round(o.reduce((a,y)=>a+bpWords([y.after,y.why]),0)/o.length):0)} // the scene, its choices, and one outcome with the mentor's reasoning
  else if(x.k==="drill")w=bpWords(c.drills[x.j]);else if(x.k==="exercise")w=bpWords(c.exercise);else if(x.k==="quiz")w=bpWords([c.quiz,c.cases]);
  return m[k]=w}
function bpPageDone(c,st,x,p){if(!st)return false;if(x.k==="scene")return (st.picks||{})[x.i]!==undefined;if(x.k==="drill")return !!(st.drills&&st.drills[x.j]);if(x.k==="exercise")return !!st.ex;if(x.k==="quiz")return !!st.quiz;return p<(st.max||0)}
function bookEdition(){return store.get("bookEd."+COURSE.id,"story")}
/* {pct (0 to 100, unrounded), done, total pages, pub (published chapters), planned, cur (chapter to show), all (every published chapter done), mins left (null without timing)} */
function bookProgress(withTime){const L=TRACKS.full.list(),ed=bookEdition(),B=withTime&&BOOK&&BOOK.full||{};let done=0,total=0,mins=0;const doneCh=[];
  L.forEach(c=>{const st=TRACK==="full"&&CH&&S&&CH.num===c.num?S:load("full",c.num);const pg=steps(c).map((x,p)=>[x,p]).filter(([x])=>x.k!=="labs");
    const fin=!!st&&(!!st.doneAt||(st.pos||0)>=steps(c).length-1);if(fin)doneCh.push(c.num);
    const A=B[c.num]&&B[c.num][ed],narr=x=>!!A&&(x.k==="open"||x.k==="scene"||x.k==="end"||(x.k==="lesson"&&ed!=="story"&&!!c.lesson));const nn=pg.filter(([x])=>narr(x)).length;
    pg.forEach(([x,p])=>{total++;if(fin||bpPageDone(c,st,x,p)){done++;return}if(withTime)mins+=narr(x)?A.min/nn:bpPageWords(c,x)/READ_WPM})});
  // the chapter named: the open one on a chapter page; elsewhere the last chapter played, or when that one's finished the next unfinished one after it
  const lp=store.get("lastplace."+COURSE.id,null),lpn=lp&&lp.t==="full"&&L.some(c=>c.num===lp.n)?lp.n:0,here=TRACK==="full"&&CH?CH.num:lpn&&!doneCh.includes(lpn)?lpn:null;
  const left=L.filter(c=>!doneCh.includes(c.num)),next=((left.find(c=>c.num>lpn)||left[0])||{}).num??null;
  return {pct:total?done/total*100:0,done,total,pub:L.length,planned:Math.max(COURSE.planned||0,L.length),cur:here??next,all:L.length>0&&doneCh.length===L.length,mins:withTime?mins:null}}
function fmtLeft(m){if(m==null)return "";if(m<0.5)return "less than a minute left";if(m<10){const r=Math.max(1,Math.round(m));return `about ${r} minute${r>1?"s":""} left`}
  if(m<57.5)return `about ${Math.round(m/5)*5} minutes left`;if(m<600){const h=Math.round(m/30)/2;return `about ${h} hour${h>1?"s":""} left`}return `about ${Math.round(m/60)} hours left`}
function bpPctText(P){const p=Math.floor(P.pct);return P.done&&!p?"under 1%":p+"%"}
function bpLabel(P){const partial=P.planned>P.pub;return `${bpPctText(P)} ${partial?"of what's written":"complete"}`}
function bpLine(P){const partial=P.planned>P.pub,parts=[bpLabel(P)];
  if(P.all)parts.push(partial?`Every written chapter done (${P.pub} of ${P.planned}), ${P.planned-P.pub} more coming`:`All ${P.pub} chapters done`);
  else{if(P.cur)parts.push(`Chapter ${P.cur} of ${P.planned}`);if(partial)parts.push(`${P.pub} written so far`);if(P.mins!=null&&P.mins>0)parts.push(fmtLeft(P.mins))}
  return parts.join(" · ")}
function bpBarHTML(P,cls,deco){const w=Math.max(0,Math.min(100,P.pct));return `<span class="bpbar${cls?" "+cls:""}" ${deco?`aria-hidden="true"`:`role="progressbar" aria-label="${esc(bpLabel(P))}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.floor(w)}"`}><span style="width:${w.toFixed(2)}%"></span></span>`} // deco: inside a button, where the text beside it says the same thing
/* the rail card: on the book's home page and its chapter pages, hidden everywhere else */
let BP_BOOK=null,BP_WAIT=false; // the course whose audiobook manifest this page has asked for (once per course), and whether that request is still out
function bookBarSync(){const el=$("bookbar");if(!el)return;const on=!!COURSE&&(TRACK===null||TRACK==="full"||TRACK==="ref")&&!!$("page")&&!document.querySelector(".rail").hidden&&TRACKS.full.list().length>0;
  el.hidden=!on;if(!on)return;
  if(BP_BOOK!==COURSE.id&&!(BOOK&&Object.keys(BOOK.full||{}).length)){const cid=BP_BOOK=COURSE.id;BP_WAIT=true;bookManifest().then(()=>{if(COURSE.id!==cid)return;BP_WAIT=false;if(!$("bookbar").hidden)bookBarSync()})}
  const P=bookProgress(true);if(BP_WAIT)P.mins=null;/* no time until the narration minutes are in, so the number doesn't jump on first paint */const parts=bpLine(P).split(" · ");el.innerHTML=`<h3>Your progress</h3>${bpBarHTML(P)}<p class="bpline">${parts.map((x,i)=>`<span class="bpp">${i?"":"<b>"}${esc(x)}${i?"":"</b>"}</span>`).join(" · ")}</p>`} // each part stays whole; lines break only at the separators
function renderHome(){setTimeout(ambSync,0);setTimeout(navSync,0);
  TRACK=null;CH=null;$("railgame").hidden=true;$("mockcard").hidden=true;
  const lp=lastPlaceLabel();const m=mastery();const plan=studyPlan(m);const H=mockHistAll();const last=H.slice(-1)[0];
  const tile=(tr,c)=>{const st=load(tr,c.num);const lab=chapterProgress(tr,c);const state=lab==="done"||/\d+\/\d+/.test(lab)?"done":lab==="in progress"?"prog":"new";
    const sc=st&&st.score!==undefined&&Object.keys(st.picks||{}).length?`${st.score}/${c.scenes.length*3}`:"";
    return `<button class="ctile ${state}" type="button" data-open="${tr}:${c.num}"><span class="cn">${c.num}</span><span class="ct">${esc(c.title)}</span><span class="cs">${state==="done"?"Done"+(sc?" · "+sc:""):state==="prog"?"In progress":"Start"}</span></button>`};
  const full=TRACKS.full.list(),ref=TRACKS.ref.list();
  const fullDone=full.filter(c=>chapterProgress("full",c)==="done").length;
  $("page").innerHTML=`<div class="kicker"><button class="linkbtn" type="button" id="tolib">Library</button> › ${esc(COURSE.title)} · <button class="linkbtn" type="button" id="toabout">About this book</button></div><h1>${esc(COURSE.full_title||COURSE.title)}</h1>
   ${lp?`<button class="hero" type="button" id="resume"><span class="prog">Pick up where you left off</span><b>${esc(lp[0])}</b><span class="go">Continue ›</span></button>`:`<button class="hero" type="button" id="resume"><span class="prog">New here?</span><b>Start the ${esc(COURSE.fullName||"Full Course")}: Chapter 1${TRACKS.full.list()[0]?", "+esc(TRACKS.full.list()[0].title):""}</b><span class="go">Begin ›</span></button>`}
   <button class="handsfree" type="button" id="hfree"><span>🎧</span><span><b>Play the audiobook</b><span class="prog">Starts at your current chapter. No tapping while you drive.</span></span></button>
   ${plan[0]?`<div class="nextstep"><span class="prog">${MENTOR()}'s next step for you</span><p><b>${esc(plan[0][0])}.</b> ${esc(plan[0][1])}</p><button class="btn small" type="button" id="planbtn">${plan[0][2].task?"Practice now":plan[0][2].mock?"Open practice exam":"Go"}</button> <button class="linkbtn" type="button" id="seeplan">See the full study plan</button></div>`:""}
   ${labWaitHTML()}<h2>${esc(COURSE.fullName||"Full Course")} <span class="prog">${fullDone} of ${full.length} chapters done${COURSE.planned&&COURSE.planned>full.length?` (${COURSE.planned} planned, more on the way)`:""}${COURSE.fullHours?" · "+COURSE.fullHours:""}</span></h2>
   <div class="ctiles">${full.map(c=>tile("full",c)).join("")}</div>
   ${ref.length?`<h2>Refresher <span class="prog">${ref.length} chapters · a fast review</span></h2><div class="ctiles">${ref.map(c=>tile("ref",c)).join("")}</div>`:""}
   <h2>Practice exam</h2><div class="card mockhome">${!hasMock()?`<p id="mocksoon">${MOCK_SOON}</p>`:`<p>${COURSE.mockShort||"A full practice exam."} ${last?(multiForm()?`${esc(formLabel(last.f))}. `:"")+lastLine(last):"You haven't taken one yet."}</p><button class="btn" type="button" id="mockbtn">Open the practice exam</button>`}</div>
   ${finalHomeHTML()}
   <div class="quick"><button class="card qlink" type="button" id="qprog"><b>Progress</b><span class="prog">Scores, the ${ALLT().length}-task map, practice sets</span></button><button class="card qlink" type="button" id="qcast"><b>Cast</b><span class="prog">Meet everyone, hear them talk</span></button></div>`;
  const pg=$("page");wireLabWait();wireFinalHome();
  $("resume").onclick=()=>lp?lp[1]():openChapter("full",1);
  $("hfree").onclick=async()=>{const B=await bookManifest();const lpv=store.get("lastplace."+COURSE.id,null);const ed=store.get("bookEd."+COURSE.id,"story");let n=lpv&&lpv.t==="full"?lpv.n:1;const have=Object.keys(B.full).map(Number).filter(k=>B.full[k][ed]).sort((a,b)=>a-b);if(!have.length)return renderBook();if(!have.includes(n))n=have.find(k=>k>=n)||have[have.length-1];renderBook();bookPlay(ed,n)};
  pg.querySelectorAll("[data-open]").forEach(b=>b.onclick=()=>{const [tr,n]=b.dataset.open.split(":");openChapter(tr,+n)});
  $("tolib").onclick=()=>renderLibrary();$("toabout").onclick=()=>{renderAbout();top()};if($("mockbtn"))$("mockbtn").onclick=()=>openMock();$("qprog").onclick=()=>{renderDash();top()};$("qcast").onclick=()=>{renderCast();top()};
  if($("planbtn")){const a=plan[0][2];$("planbtn").onclick=()=>{if(a.mock)return openMock();if(a.task)return startPractice(a.task);openChapter("full",a.open)};$("seeplan").onclick=()=>{renderDash();top()}}
}
function openChapter(tr,n){libTouch({t:tr,n});store.set("lastplace."+COURSE.id,{t:tr,n});TRACK=tr;store.set("track",tr);store.set("lastch."+COURSE.id+"."+tr,n);CH=chapters().find(c=>c.num===n);S=load(tr,n)||(tr==="ref"?freshRef():freshFull());store.set("cur",keyOf(tr,n));render();top()}
function resetChapter(n){if(!confirm(`Reset chapter ${n}? Your progress in this chapter will be cleared.`))return;const st=TRACK==="ref"?freshRef():freshFull();if(n===CH.num){S=st;save();render();top()}else{persist(TRACK,n,st);renderRail()}}
function renderRail(){
  const rg=$("railgame");if(!TRACK||["mock","dash","practice","cast","book","library","about","guide","upcoming","logprint"].includes(TRACK)){rg.hidden=true}else rg.hidden=false;
  $("trackname").textContent=TRACK?TRACKS[TRACK].name:"";
  if(TRACK==="mock"){if(!hasMock()){$("mockcard").hidden=true;return}$("mockcard").hidden=false;$("mockcard").innerHTML=MS&&!MS.submitted&&MS.order?`<h3>Practice exam</h3><p class="big" id="mocktime">${MS.mode!=="practice"?fmtTime(MOCK_LIMIT()-MS.elapsed):"Practice"}</p><p class="prog">${Object.keys(MS.ans).length} of ${MS.order.length} answered</p>`:`<h3>Practice exam</h3><p class="prog">${MOCK_FORM==null?"Pick a practice exam.":"Pick a mode to start."}</p>`;return}
  $("mockcard").hidden=true;if(!TRACK)return;
  if($("statetitle"))$("statetitle").textContent=COURSE.stateTitle||"Project state";$("meters").innerHTML=METERS_OF().map(([k,l])=>{const v=S.m[k];const col=v>=60?"var(--good)":v>=40?"var(--mid)":"var(--bad)";return `<div class="meter"><div class="row"><span>${l}</span><span class="num">${v}</span></div><div class="track" role="img" aria-label="${l} ${v} of 100"><span style="width:${v}%;background:${col}"></span></div></div>`}).join("");
  const n=CH.scenes.length,dn=Object.keys(S.picks).length;
  $("prog").textContent=`Chapter ${CH.num} · ${dn} of ${n} decisions · Score ${S.score}/${n*3}`;
  $("dots").innerHTML=CH.scenes.map((sc,i)=>{const p=S.picks[i];return `<span class="dot ${p!==undefined?"s"+sc.opts[p].s:""}" title="Decision ${i+1}"></span>`}).join("");
  const tot=Object.fromEntries(DOMS.map(d=>[d,[0,0]]));chapters().forEach(c=>{const st=c.num===CH.num?S:load(TRACK,c.num);if(st)DOMS.forEach(d=>{tot[d][0]+=st.dom[d][0];tot[d][1]+=st.dom[d][1]})});
  const fmtd=([g,t])=>t?`${Math.round(g/t*100)}%`:"·";
  $("domains").innerHTML=DOMS.map(d=>`<div class="dom-row"><span>${d}</span><span class="prog">${fmtd(S.dom[d])} · ${fmtd(tot[d])}</span></div>`).join("");
  $("chapters").innerHTML=chapters().map(c=>{const lab=chapterProgress(TRACK,c);const started=!!load(TRACK,c.num)||c.num===CH.num&&(Object.keys(S.picks).length||(S.pos||0)>0||S.step>=0);return `<div class="chaprow"><button class="chap${c.num===CH.num?" cur":""}" data-n="${c.num}" type="button"><span class="n">${c.num}</span><span>${c.title}</span><span class="prog">${lab}</span></button>${started?`<button class="linkbtn reset" data-r="${c.num}" type="button" aria-label="Reset chapter ${c.num}">Reset</button>`:""}</div>`}).join("");
  if(TRACK==="full"){const cur=$("chapters").querySelector(".chap.cur");if(cur){const d=document.createElement("div");d.className="railsecs";d.innerHTML=secListHTML();cur.closest(".chaprow").after(d)}}
  $("chapters").querySelectorAll(".chap").forEach(b=>b.onclick=()=>{save();openChapter(TRACK,+b.dataset.n)});if($("chnote"))$("chnote").textContent=`Ch ${CH.num}: ${CH.title}`;
  $("chapters").querySelectorAll("[data-r]").forEach(b=>b.onclick=()=>resetChapter(+b.dataset.r));
  const cast=[...BASE_CAST,...(TRACK==="full"?FULL_CAST_EXTRA:[])];chapters().filter(c=>c.num<=CH.num&&c.cast).forEach(c=>c.cast.forEach(x=>cast.push(x)));const seen=new Map();cast.forEach(([n,d])=>seen.set(n,d));
  $("cast").innerHTML=[...seen].map(([n,d])=>{const w=castList().find(c=>c.name===n||c.name.split(" ")[0]===n.split(" ")[0]);return `<dt>${w?`<button class="linkbtn" data-castid="${w.id}" type="button">${n}</button>`:n}</dt><dd>${d}</dd>`}).join("");$("cast").querySelectorAll("[data-castid]").forEach(b=>b.onclick=()=>{if(TRACK==="full"||TRACK==="ref")save();renderCast(b.dataset.castid);top()});
}
function render(){_render();castStrip();narAttach();navSync();ambSync();handoffOffer()}
function _render(){if(TRACK==="library")return renderLibrary();if(TRACK==="upcoming")return renderUpcoming();if(TRACK==="book")return renderBook();if(TRACK==="guide")return renderGuide();if(TRACK==="about")return renderAbout();if(TRACK==="cast")return renderCast();if(TRACK==="dash")return renderDash();if(TRACK==="practice")return renderPractice();if(TRACK==="logprint")return renderLogPrint();if(TRACK==="final")return finalRender();if(TRACK==="cert")return renderCert();if(TRACK==="verify")return renderVerify();renderRail();if(!TRACK)return renderHome();if(TRACK==="mock")return mockRender();if(TRACK==="ref")return refRender();return fullRender()}

/* ===== accounts ===== */
const ONLINE=location.protocol.startsWith("http")&&location.hostname!=="localhost";
async function api(path,opts={}){if(TESTP&&/^\/api\/progress\b/.test(path))return {ok:false,status:0,error:"test profile"}; // belt and braces: SYNC is never set in the test profile
  const r=await fetch(path,{credentials:"same-origin",headers:{"Content-Type":"application/json"},...opts});let j={};try{j=await r.json()}catch(e){}return {ok:r.ok,status:r.status,...j}}
async function listenPull(){if(TESTP||!ONLINE||!SYNC||!COURSE)return;try{const me=await api("/api/auth?action=me");{const g=me.progress&&me.progress[ALOGKEY()];if(g&&g.days){const loc=store.get("c"+ALOGKEY(),null),M=logMerge(loc,g);if(JSON.stringify(M.days)!==JSON.stringify((loc||{}).days)){M.at=Date.now();store.set("c"+ALOGKEY(),M);if(TRACK==="dash"&&$("logbody"))$("logbody").innerHTML=logTableHTML(logRows(COURSE,LOG.range.from,LOG.range.to))}}}const r=me.progress&&me.progress[LKEY()];if(r&&(r.at||0)>(lget().at||0)&&NAR.audio.paused){store.set("c"+LKEY(),r);applyPrefs(r.prefs);if(TRACK==="book")renderBook();else handoffOffer()}else if(r&&r.prefs&&(r.prefs.at||0)>((lget().prefs||{}).at||0)){lput({prefs:r.prefs});applyPrefs(r.prefs)}}catch(e){}}
const DEVICE_KEYS=["halcyon.qa","halcyon.showwho","halcyon.qa.tester","halcyon.testprofile","halcyon.qa.ok","halcyon.devid","halcyon.route","halcyon.rate","halcyon.auto2","halcyon.pdbg","halcyon.handoff.seen","halcyon.spoilers"];
function clearLocal(keep){try{Object.keys(localStorage).filter(k=>k.startsWith("halcyon.")&&!(keep&&(DEVICE_KEYS.includes(k)||k.startsWith("halcyon.readat.")||k.startsWith("halcyon.bookEd.")))).forEach(k=>localStorage.removeItem(k))}catch(e){}}
function renderAuth(mode,invite){pageview(mode==="signup"?"signup":"signin");
  document.querySelector(".rail").hidden=true;const signup=mode==="signup";
  $("page").innerHTML=`<div class="kicker">The Halcyon Launch</div><h1>${signup?"Create your account":"Sign in"}</h1><div class="story"><p>${signup?"You've been invited to The Halcyon Launch, a library of choose-your-path certification courses. Your progress saves to your account so you can pick up anywhere.":"Invite only. Sign in to pick up where you left off."}</p></div>
   <form class="auth" id="authform" novalidate><div id="autherr"></div>${signup?'<label for="a-name">Name<input id="a-name" autocomplete="name" required></label>':""}<label for="a-email">Email<input id="a-email" type="email" autocomplete="email" required></label><label for="a-pw">Password${signup?" (10 characters or more)":""}<input id="a-pw" type="password" autocomplete="${signup?"new-password":"current-password"}" required></label><button class="btn" type="submit">${signup?"Create account":"Sign in"}</button></form>
   ${signup?'<p class="prog">Already have an account? <a href="/">Sign in</a></p>':'<p class="prog">No account? You need an invite link from Anthony.</p>'}`;
  $("authform").onsubmit=async e=>{e.preventDefault();$("autherr").innerHTML="";const b={email:$("a-email").value,password:$("a-pw").value};if(signup){b.name=$("a-name").value;b.token=invite}
    const r=await api("/api/auth?action="+(signup?"signup":"login"),{method:"POST",body:JSON.stringify(b)});if(!r.ok){$("autherr").innerHTML=`<div class="err">${esc(r.error||"That didn't work. Try again.")}</div>`;return}if(signup)history.replaceState(null,"","/");boot()};
}
const LIBKEY=99990;
function libget(){const L=store.get("c"+LIBKEY,null)||{};return {pins:L.pins||[],last:L.last||{}}}
function libput(L){L.at=Date.now();store.set("c"+LIBKEY,L);if(SYNC)SYNC(LIBKEY,JSON.parse(JSON.stringify(L)))}
function libTouch(where){if(!COURSE)return;const L=libget();L.last[COURSE.id]={...where,at:Date.now()};libput(L)}
// a course whose script is loaded and whose mock bank is empty: an old "last played: Mock exam" entry reads as the course home
function noMockKnown(id){const d=id==="pmp"?{mock:window.HALCYON_MOCK}:(window.HALCYON_DATA||{})[id];return !!(d&&Array.isArray(d.mock)&&!d.mock.some(p=>p&&p.questions&&p.questions.length))}
function libWhere(w,id){return !w?"":w.t==="mock"?(id&&noMockKnown(id)?"Course home":"Practice exam"):w.t==="book"?`Audiobook, chapter ${w.n}`:`${w.t==="ref"?"Refresher":"Chapter"} ${w.n}`}
async function libGo(id){const w=libget().last[id];if(!(await useCourse(id)))return;if(!w){renderHome();renderRail();return}if(w.t==="mock"){if(hasMock())return openMock(w.f);renderHome();renderRail();return}if(w.t==="book"){renderBook();return top()}
  if(TRACKS[w.t]&&TRACKS[w.t].list().find(c=>c.num===w.n)){openChapter(w.t,w.n);return top()}renderHome();renderRail()}
/* "Tell me when new books land": one email field. The server answers the same whether or not the email is already on the list. */
function signupBox(src){return `<form class="signup" data-src="${esc(src)}" novalidate><h2>Tell me when new books land</h2><div class="sgrow"><label class="sr" for="sg-${esc(src)}">Email</label><input id="sg-${esc(src)}" type="email" autocomplete="email" placeholder="you@example.com" required maxlength="254"><button class="btn" type="submit">Tell me</button></div><p class="sgnote">We'll email you when new books or chapters land. Nothing else, and you can leave anytime.</p><p class="sgmsg" role="status" aria-live="polite"></p></form>`}
function wireSignup(){document.querySelectorAll("#page form.signup").forEach(f=>{const inp=f.querySelector("input"),btn=f.querySelector("button"),msg=f.querySelector(".sgmsg");
  f.onsubmit=async e=>{e.preventDefault();const v=inp.value.trim();msg.className="sgmsg";
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)){msg.classList.add("bad");msg.textContent="Hmm, that email doesn't look right. Mind checking it?";inp.focus();return}
    btn.disabled=true;let r;try{r=await api("/api/subscribe",{method:"POST",body:JSON.stringify({email:v,source:f.dataset.src})})}catch(err){r={ok:false}}btn.disabled=false;
    if(r.ok){f.querySelector(".sgrow").hidden=true;msg.classList.add("ok");msg.textContent="Got it, you're on the list."}
    else{msg.classList.add("bad");msg.textContent=r.error||"That didn't go through. Give it a minute and retry."}}})}
async function renderAbout(id){setTimeout(ambSync,0);if(id&&id!==COURSE.id&&!(await useCourse(id)))return;const c=COURSE;TRACK="about";setTimeout(navSync,0);$("railgame").hidden=true;$("mockcard").hidden=true;
  const ready=TRACKS.full.list().length,hero=c.hero||"the lead",w=libget().last[c.id];
  $("page").innerHTML=`<div class="kicker"><button class="linkbtn" type="button" id="tolib2">Library</button> › About this book</div><h1>${esc(c.full_title||c.title)}</h1>
   <div class="story">${(c.about||[c.story||""]).map(p=>`<p>${esc(p)}</p>`).join("")}</div>
   <div class="howbox"><h2>Your choices change the story</h2><p>This is a choose-your-path story. You play ${esc(hero)}, and at each decision you make the call. What happens next, how people react, some later scenes, and how each chapter ends all follow from what you choose. After every decision, ${esc(c.mentorFull||MENTOR())} tells you the best answer and why, the way the exam sees it.</p><p>Want just the story? The Audiobook plays the best path from start to finish.</p></div>
   <dl class="facts"><dt>The exam</dt><dd>${esc(c.exam||"")}</dd><dt>Your mentor</dt><dd>${esc(c.mentorRole||MENTOR())}</dd><dt>Length</dt><dd>${esc((c.fullHours||"").replace(/^./,x=>x.toUpperCase()))}, ${c.planned||ready} chapters${c.planned&&ready<c.planned?` (${ready} ready now, more as they're written)`:""}</dd><dt>Each chapter</dt><dd>The story, ${esc(LESSON())}, the decisions, drills, and a quiz</dd>${c.mockShort?`<dt>Practice exam</dt><dd>${esc(hasMock()?c.mockShort:MOCK_SOON)}</dd>`:""}</dl>
   <div class="bar"><button class="btn" id="aboutgo" type="button">${w?"Continue":"Start chapter 1"}</button><button class="btn ghost" id="aboutbook" type="button">🎧 Audiobook</button></div>
   ${signupBox("about:"+c.id)}
   <p class="prog marks">${c.independence?esc(c.independence+(c.marks?" "+c.marks:"")).replace("study log",`<button class="linkbtn" type="button" id="aboutlog">study log</button>`):esc(marksLine(c))}</p>`;wireSignup();if($("aboutlog"))$("aboutlog").onclick=()=>openLog();
  $("tolib2").onclick=()=>{renderLibrary();top()};$("aboutgo").onclick=()=>{if(w)libGo(c.id);else{openChapter("full",(TRACKS.full.list()[0]||{num:1}).num);top()}};$("aboutbook").onclick=()=>{renderBook();top()}}
/* #upcoming: what's coming next. Copy lives in upcoming.js; chapter counts come from the course registry. */
function readyCount(c){if(c&&c.id==="pmp")return ((window.HALCYON_V2||{}).files||[]).filter(x=>/^ch\d+\.js$/.test(x)).length;return c?(c.scripts||[]).filter(x=>/full\/ch\d+\.js$/.test(x)).length:0}
function upCover(cv,title,cls){return `<div class="upcover ${cls||""}" aria-hidden="true"><span class="upline">${esc(cv.line)}</span><b>${esc(title)}</b><span class="upplace">${esc(cv.place)}</span><span class="upexam">${esc(cv.exam)}</span></div>`}
function upBook(b,cls){const c=courseById(b.course),live=c&&c.status==="live",n=readyCount(c);const soon=b.soon&&live&&n?(n===1?"Chapter 1 is out now":b.ofPlanned&&c.planned?`${n} of ${c.planned} chapters out now`:`${n} chapters out now`):b.soon;
  return `<article class="upbook ${cls||""}">${upCover(b.cover,b.title,cls)}<div class="uptxt"><div class="kicker">${esc(b.kicker)}</div><h2>${esc(b.title)}</h2><p class="upstat"><span class="pill">${esc(b.status)}</span>${soon?`<span class="prog">${esc(soon)}</span>`:""}</p>
   <div class="story">${b.paras.map(p=>`<p>${esc(p)}</p>`).join("")}</div><dl class="facts">${b.facts.map(([k,v])=>`<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}</dl>${b.note?`<p class="prog">${esc(b.note)}</p>`:""}
   ${live&&n&&b.soon?`<div class="bar"><button class="btn" type="button" data-upabout="${c.id}">About this book</button></div>`:""}</div></article>`}
function renderUpcoming(){setTimeout(ambSync,0);TRACK="upcoming";CH=null;$("railgame").hidden=true;$("mockcard").hidden=true;setTimeout(navSync,0);
  const U=window.HALCYON_UPCOMING;if(!U){$("page").innerHTML=`<h1>Coming next</h1><p class="prog">Nothing to show yet.</p>`;return}
  const S2=U.series,F=U.finale,fc=courseById(F.course),fn=readyCount(fc);
  const shelf=U.shelf.ids.map(courseById).filter(c=>c&&c.status==="live").map(c=>{const n=readyCount(c),left=Math.max(0,(c.planned||n)-n);
    return `<div class="upshelf"><span class="prog">${esc(c.exam||"")}</span><b>${esc(c.full_title||c.title)}</b><p>${esc((c.about||[c.story||""])[0])}</p><p class="upstat"><span class="pill">In production</span><span class="prog">${n===1?"Chapter 1 is out":`${n} chapters out`}${left?`, ${left} more coming`:""}</span></p><button class="linkbtn" type="button" data-upabout="${c.id}">About this book</button></div>`}).join("");
  $("page").innerHTML=`<div class="kicker"><button class="linkbtn" type="button" id="uplib">Library</button> › Coming next</div><h1>Coming next</h1><div class="story"><p>${esc(U.intro)}</p></div>
   ${upBook(U.featured,"feat")}
   <section class="upseries"><h2>${esc(S2.title)}</h2><p class="lead">${esc(S2.intro)}</p><ol class="route">${S2.books.map(b=>`<li class="${b.n===1?"now":""}"><span class="rn">${b.n}</span><span class="rt"><span class="rk"><b>${esc(b.place)}</b><span class="tag${b.n===1?" dom":""}">${esc(b.exam)}</span><span class="prog">${esc(b.status)}</span></span><span class="rl">${esc(b.line)}</span></span></li>`).join("")}</ol></section>
   ${upBook(U.rewrite,"redo")}
   ${shelf?`<section class="upsec"><h2>${esc(U.shelf.title)}</h2><p class="lead">${esc(U.shelf.intro)}</p><div class="upgrid">${shelf}</div></section>`:""}
   <section class="upsec upfinale">${F.art?`<img src="${esc(F.art)}" alt="" loading="lazy">`:""}<div class="uptxt"><div class="kicker">${esc((fc&&fc.exam)||"")}</div><h2>${esc(F.title)}</h2><p class="upstat"><span class="pill">${esc(F.status)}</span>${fc&&fc.planned?`<span class="prog">${fn} of ${fc.planned} chapters out</span>`:""}</p><div class="story">${F.paras.map(p=>`<p>${esc(p)}</p>`).join("")}</div>${fc&&fc.status==="live"?`<button class="btn ghost" type="button" data-upgo="${fc.id}">Open ${esc(F.title)}</button>`:""}</div></section>
   ${signupBox("upcoming")}`;wireSignup();
  $("uplib").onclick=()=>{renderLibrary();top()};
  $("page").querySelectorAll("[data-upabout]").forEach(b=>b.onclick=()=>{renderAbout(b.dataset.upabout);top()});
  $("page").querySelectorAll("[data-upgo]").forEach(b=>b.onclick=()=>{libGo(b.dataset.upgo);top()})}
/* Library cards: each live book's percent. PMP's chapters are always loaded. Another book's chapters load only when it's opened, so a book
   with saved Full Course progress loads its scripts (as useCourse does, without switching to it) and the Library redraws; a book with no
   saved chapter is 0% without loading anything. COURSE is swapped only for the length of one synchronous call. */
function libBpHTML(bp){return `<span class="libbp">${bpBarHTML(bp,"thin",true)}<span class="prog">${esc(bpLabel(bp))}</span></span>`}
function withCourse(c,f){const was=COURSE;COURSE=c;try{return f()}finally{COURSE=was}}
function libStarted(c){return withCourse(c,()=>{for(let n=1;n<=Math.max(c.planned||0,30);n++)if(store.get("c"+keyOf("full",n),null))return true;return false})}
function libProgress(c){if(c.status!=="live")return null;const ready=c.id==="pmp"||!(c.scripts||c.labs)||c._loaded;
  if(!ready){if(libStarted(c)){if(!c._bpload){c._bpload=loadScripts([...(c.scripts||[]),...(c.labs?[c.labs]:[])].map(x=>c.root+x)).then(()=>{c._loaded=true;const t=TRACK==="library"&&document.querySelector(`.libcard[data-course="${c.id}"] .libtxt`),bp=t&&libProgress(c);if(bp&&!t.querySelector(".libbp"))t.insertAdjacentHTML("beforeend",libBpHTML(bp))})}return null}
    return {pct:0,done:0,total:0,pub:readyCount(c),planned:Math.max(c.planned||0,readyCount(c))}}
  return withCourse(c,()=>TRACKS.full.list().length?bookProgress(false):null)}
function renderLibrary(){setTimeout(ambSync,0);TRACK="library";CH=null;$("railgame").hidden=true;$("mockcard").hidden=true;setTimeout(navSync,0);
  const L=libget(),day=t=>new Date(t).toLocaleDateString("en-US",{month:"short",day:"numeric"});
  const card=c=>{const live=c.status==="live",w=L.last[c.id],pinned=L.pins.includes(c.id);let pr="";const lq=live?((store.get("c"+(c.base+903),null)||{}).labq||[]).length:0;const bp=live?libProgress(c):null;if(live)pr=w?`${pinned?"Pinned · ":""}Last played ${day(w.at)} · ${libWhere(w,c.id)}`:(pinned?"Pinned · Not started":"Not started");
    return `<div class="libwrap">${live?`<button class="pin${pinned?" on":""}" type="button" data-pin="${c.id}" aria-pressed="${pinned}" aria-label="${pinned?"Unpin":"Pin"} ${esc(c.full_title||c.title)}" data-tip="${pinned?"Unpin":"Pin to the top of your library"}">${pinned?"★":"☆"}</button>`:""}${live?`<button class="linkbtn libabout" type="button" data-about="${c.id}">About this book</button>`:""}<button class="libcard ${live?"live":"soon"}" type="button" data-course="${c.id}" ${live?"":"disabled"}><span class="libart" aria-hidden="true">${({pmp:"🚀",cphims:"🏥",asep:"🛰️",gh300:"🤖",pilot:"✈️",cisa:"🔍"})[c.id]||"📘"}</span><span class="libtxt"><span class="prog">${esc(c.exam||"")}</span><b>${esc(c.full_title||c.title)}</b><span class="libstory">${esc(c.story||"")}</span><span class="libstate">${live?esc(pr):"In production"}${lq?`<span class="lw"> · 🧪 Labs waiting in ${lq} chapter${lq>1?"s":""}</span>`:""}</span>${bp?libBpHTML(bp):""}</span></button></div>`};
  const shown=c=>c.listed!==false; // listed:false (courses.js) keeps a book off the Library; its routes and Coming next card still work
  const order=COURSES.filter(shown).sort((a,b)=>{const pa=L.pins.indexOf(a.id),pb=L.pins.indexOf(b.id);if(pa>=0||pb>=0)return (pa<0?1e9:pa)-(pb<0?1e9:pb);return ((L.last[b.id]||{}).at||0)-((L.last[a.id]||{}).at||0)});
  const recent=Object.entries(L.last).filter(([id])=>{const c=courseById(id);return c&&c.status==="live"&&shown(c)}).sort((a,b)=>b[1].at-a[1].at)[0];
  const cont=recent?`<button class="handsfree" type="button" id="libcont"><span>▶</span><span><b>Continue ${esc(courseById(recent[0]).full_title||courseById(recent[0]).title)}</b><span class="prog">${libWhere(recent[1],recent[0])} · last played ${day(recent[1].at)}</span></span></button>`:"";
  $("page").innerHTML=`<div class="kicker">Library</div><h1>Your courses</h1><div class="story"><p>Each course is a choose-your-path story. You make the calls and the story changes with them, and there's an exam's worth of lessons and quizzes along the way. Tap a book to open it, or "About this book" to see what it's about.</p></div>${cont}<div class="libgrid">${order.map(card).join("")}</div>${window.HALCYON_UPCOMING?`<button class="upnext" type="button" id="libup"><span class="prog">Coming next</span><b>A seven book cyber thriller series, and more</b><span>New stories, rewrites, and the chapters on their way. No spoilers.</span><span class="go">See what's coming ›</span></button>`:""}`;
  if($("libup"))$("libup").onclick=()=>{renderUpcoming();top()};
  if($("libcont"))$("libcont").onclick=()=>libGo(recent[0]);
  $("page").querySelectorAll("[data-about]").forEach(b=>b.onclick=e=>{e.stopPropagation();renderAbout(b.dataset.about);top()});
  $("page").querySelectorAll("[data-pin]").forEach(b=>b.onclick=e=>{e.stopPropagation();const L2=libget(),id=b.dataset.pin;L2.pins=L2.pins.includes(id)?L2.pins.filter(x=>x!==id):[...L2.pins,id];libput(L2);renderLibrary()});
  $("page").querySelectorAll("[data-course]").forEach(b=>b.onclick=async()=>{if(await useCourse(b.dataset.course)){renderHome();renderRail();top()}})}
function resumeFrom(cur){const c=courseOfKey(cur||0);if(c.status==="live"&&c.id!==COURSE.id){useCourse(c.id).then(()=>resumeFrom(cur));return}cur=(cur||0)-COURSE.base;const FB=FULL_BASE();if(cur>=900&&hasMock()){const lp=store.get("lastplace."+COURSE.id,null);return openMock(lp&&lp.t==="mock"?lp.f:undefined)}if(cur>FB&&cur<FB+100){const L=TRACKS.full.list();if(L.find(c=>c.num===cur-FB))return openChapter("full",cur-FB)}else if(cur>=1&&cur<100){const L=TRACKS.ref.list();if(L.find(c=>c.num===cur))return openChapter("ref",cur)}renderHome()}
/* PMP Full Course: full/v2/preview.js lists the live v2 files (cast.js and each chapter as it's written); they load in place from full/v2/ */
async function pmpLoad(){window.HALCYON_FULL=[];await loadScripts(["full/v2/preview.js"]);const P=window.HALCYON_V2||{};await loadScripts((P.files||[]).map(f=>"full/v2/"+f));buildOrders()}
async function boot(){
  await pmpLoad();
  if($("ambtoggle")){ambUI();$("ambtoggle").onchange=e=>{AMB.on=e.target.checked;store.set("amb",AMB.on);AMB.cur=null;AMB.lastSting="";ambSync();savePrefs()};$("ambvol").oninput=e=>{AMB.vol=+e.target.value;store.set("ambvol",AMB.vol);AMB.els[AMB.i].volume=AMB.vol;savePrefs()}}
  if($("storytoggle")){$("storytoggle").checked=STORY();$("storytoggle").onchange=e=>setStoryMode(e.target.checked)}
  document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-sec]");if(b&&!b.disabled&&TRACK==="full"&&CH){const p=+b.dataset.sec;if(p!==S.pos)fullGo(p)}});
  if($("listenlink"))$("listenlink").onclick=()=>{if(TRACK==="full"||TRACK==="ref")save();clearInterval(mockTimer);renderBook();top()};
  if($("guidelink"))$("guidelink").onclick=()=>{if(TRACK==="full"||TRACK==="ref")save();clearInterval(mockTimer);renderGuide();top()};
  /* info bubbles: hover on desktop, tap-and-hold-free toggle on touch */
  // keep the bubble inside the viewport (16px gutter): centred under its element when it fits, slid sideways when it doesn't, so a
  // tip near the edge of a 390px phone neither runs off screen nor widens the page into a sideways scroll
  const placeTip=el=>{if(!el||!el.dataset||el.dataset.tip===undefined)return;const r=el.getBoundingClientRect(),vw=document.documentElement.clientWidth,g=16;
    const w=Math.min(parseFloat(getComputedStyle(el,"::after").width)||260,260,vw-2*g),x=Math.max(g,Math.min(vw-g-w,r.left+r.width/2-w/2));
    el.style.setProperty("--tipl",Math.round(x-r.left-el.clientLeft)+"px");el.style.setProperty("--tipr","auto");el.style.setProperty("--tipt","none")};
  for(const ev of ["mouseover","focusin"])document.addEventListener(ev,e=>placeTip(e.target.closest&&e.target.closest("[data-tip]")),true);
  document.addEventListener("click",e=>{const el=e.target.closest&&e.target.closest("[data-tip]");document.querySelectorAll(".tipopen").forEach(x=>{if(x!==el)x.classList.remove("tipopen")});if(el&&matchMedia("(hover: none)").matches){if(!el.classList.contains("tipopen")){el.classList.add("tipopen");placeTip(el);setTimeout(()=>el.classList.remove("tipopen"),3500)}}},true);
  if($("castlink"))$("castlink").onclick=()=>{if(TRACK==="full"||TRACK==="ref")save();clearInterval(mockTimer);renderCast();top()};
  $("proglink").onclick=()=>{if(TRACK==="full"||TRACK==="ref")save();clearInterval(mockTimer);renderDash();top()};
  if($("liblink"))$("liblink").onclick=()=>{if(TRACK==="full"||TRACK==="ref")save();clearInterval(mockTimer);renderLibrary();top()};
  $("homelink").onclick=()=>{if(TRACK==="full"||TRACK==="ref")save();clearInterval(mockTimer);renderHome();renderRail()};
  if((COURSE.scripts||COURSE.labs)&&!COURSE._loaded)await useCourse(COURSE.id);
  if(!ONLINE){$("usercard").hidden=false;$("signout").hidden=true;$("username").textContent="";if(!(await routeTo(location.hash||store.get("route",""))))resumeFrom(store.get("cur",0));return}
  let me;try{me=await api("/api/auth?action=me")}catch(e){me={user:null}}
  if(!me.user){if(PROF.signedOut)PROF.signedOut();if(/^#verify\b/.test(location.hash)){document.querySelector(".rail").hidden=true;return renderVerify()}const inv=new URLSearchParams(location.search).get("invite");
    if(inv){const v=await api("/api/auth?action=invite&token="+encodeURIComponent(inv));if(v.valid)return renderAuth("signup",inv);
      document.querySelector(".rail").hidden=true;$("page").innerHTML=`<h1>This invite has expired</h1><div class="story"><p>Invite links work once. Ask Anthony for a new one, or <a href="/">sign in</a> if you already have an account.</p></div>`;return}
    return renderAuth("login")}
  /* QA mode and the test profile are for admins and testers (profile.js authorize, approved 2026-10-12). Checked before anything is written:
     a user who may not use QA has the QA flags cleared, and a page that opened in the test profile reloads into the real one untouched. */
  if(PROF.authorize&&PROF.authorize(!!(me.user.admin||me.user.tester)))return;
  /* test profile (QA): signed in so Flag still works, but the server's progress never lands in local storage and SYNC stays off, so
     nothing reaches /api/progress; the real namespace is left exactly as it was. */
  if(!TESTP){clearLocal(true);Object.entries(me.progress||{}).forEach(([n,st])=>store.set("c"+n,st&&Object.keys(st).length?st:null));
    SYNC=(n,st,ka)=>api("/api/progress",{method:"PUT",body:JSON.stringify({chapter:n,state:st}),keepalive:!!ka}).catch(()=>{});applyPrefs(lget().prefs)}
  USERNAME=me.user.name||"";
  document.querySelector(".rail").hidden=false;$("usercard").hidden=false;$("username").textContent=me.user.name;$("adminlink").hidden=!me.user.admin;
  $("signout").onclick=async()=>{await api("/api/auth?action=logout",{method:"POST"});clearLocal();if(PROF.testKeys)PROF.testKeys().forEach(k=>{try{localStorage.removeItem(k)}catch(e){}});location.href="/"}; // test profile data goes with the account that made it
  if(!(await routeTo(location.hash||store.get("route",""))))resumeFrom(TESTP?store.get("cur",0):(me.user.cur||0));
}
/* ===== QA mode hook: qa.js (speaker chips, the QA bar, Flag a problem) reads where the reader and the player are. Read only. ===== */
window.HalcyonState=function(){const a=NAR.audio,bk=NAR.page==="book"&&NAR.book,ch=(TRACK==="full"||TRACK==="ref")&&CH?CH:null;
  return {course:COURSE?COURSE.id:"",book:COURSE?(COURSE.full_title||COURSE.title||""):"",track:TRACK,story:!!STORY(),
    chapter:bk?NAR.book.n:ch?ch.num:null,chTitle:ch?ch.title||"":"",key:NAR.key||"",page:bk?(NAR.bsec||""):(NAR.page||""),
    mode:bk?"audiobook":NAR.page==="car"?"car":NAR.page?"page":"read",ed:bk?NAR.book.ed:"",src:a.currentSrc||a.src||"",t:a.currentTime||0,
    paused:a.paused,listening:!!NAR.listening,timings:NAR.key&&NAR.timings[NAR.key]||null}};
boot();
})();
