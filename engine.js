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
const store={get(k,d){try{const v=localStorage.getItem(SP+k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem(SP+k,JSON.stringify(v))}catch(e){}}};
const clamp=v=>Math.max(0,Math.min(100,v));
let DOMS=["People","Process","Business Environment"];
const PMP_METERS=[["trust","Team trust"],["conf","Stakeholder confidence"],["health","Delivery health"]];
const METERS_OF=()=>(COURSE&&COURSE.meters)||PMP_METERS; // per course labels for the three meters
const RUTH_LEADS={3:["That's the move.","Good. That's what I'd want from a flight director.","Exactly right."],1:["Close, but not quite.","Defensible. Not the best answer.","You're in the neighborhood."],0:["That one's going to cost you.","I'd have stopped you there.","Let's talk about that one."]};
let TASKNAMES={P1:"Develop a common vision",P2:"Manage conflicts",P3:"Lead the project team",P4:"Engage stakeholders",P5:"Align stakeholder expectations",P6:"Manage stakeholder expectations",P7:"Help ensure knowledge transfer",P8:"Plan and manage communication",R1:"Integrated plan and plan delivery",R2:"Develop and manage scope",R3:"Value-based delivery",R4:"Plan and manage resources",R5:"Plan and manage procurement",R6:"Plan and manage finance",R7:"Plan and optimize quality",R8:"Plan and manage schedule",R9:"Evaluate project status",R10:"Manage project closure",B1:"Project governance",B2:"Project compliance",B3:"Manage and control changes",B4:"Remove impediments, manage issues",B5:"Plan and manage risk",B6:"Continuous improvement",B7:"Support organizational change",B8:"External business environment"};
let BASE_CAST=[["Sam Okafor","You. Tallgrass integration operations manager, former Air Force F-16 crew chief."],["Ruth Calder","Retired ARA flight director on the Independent Readiness Board."],["Ada Okafor","Sam's daughter. Hydroponics engineer on Ares Station. Speaks only in recorded logs."],["Imogen Hale","Director of the Ares Relief Authority. The program's sponsor."],["Garrett Lyle","Founder and CEO of Tallgrass Aerospace."],["Hana Iwasaki","Propulsion lead. Owns the departure stage."],["Rafa Quintero","Flight software lead. Runs the agile side."]];
let FULL_CAST_EXTRA=[["Ray Mendez","Sam's old flight chief, retired, in Tucson."],["Quinn Abernathy","Scheduler, now Sam's deputy."],["Wendell Price","Test conductor. Reads stand data by feel."]];

const TRACKS={
  /* the PMP Refresher (chapters/ch1.js to ch6.js) is the v1 hospital story: retired from the UI on 2026-10-11, to be rewritten for Mars later. DATA().ref is empty for PMP. */
  ref:{id:"ref",name:"Refresher",blurb:"6 chapters, about 2.5 hours. Ten decisions per chapter with mentor debriefs. Best for a quick review.",list:()=> (DATA().ref||[]).filter(c=>c&&c.scenes).sort((a,b)=>a.num-b.num),key:n=>n},
  full:{id:"full",name:"Full Course",get blurb(){if(!COURSE||COURSE.id==="pmp")return "15 chapters, about 15 to 20 hours. Lessons, decisions, math drills, exercises, and a quiz every chapter. Learn the PMP from the ground up.";const n=COURSE.planned||(DATA().full||[]).length;return `${n} chapters, ${COURSE.fullHours||""}. Lessons, decisions, drills, exercises, and a quiz every chapter.`},list:()=> (DATA().full||[]).filter(c=>c&&c.scenes).sort((a,b)=>a.num-b.num),key:n=>FULL_BASE()+n},
  mock:{id:"mock",name:"Mock Exam",blurb:"180 questions in 240 minutes with two breaks, weighted like the real exam. Practice mode gives feedback as you go.",key:()=>900}
};
/* saved progress: Full Course chapter n is key base+100+n, except PMP v2, which uses 201 to 215 so v1 picks (101 to 115) never land on v2 scenes. v1 rows stay on the server, unread. */
function FULL_BASE(){return PMP2()?200:100}
let MOCK_KEY=900;const PMP_META={DOMS,TASKNAMES,BASE_CAST,FULL_CAST_EXTRA};
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
  DOMS=meta.DOMS||PMP_META.DOMS;TASKNAMES=meta.TASKNAMES||{};BASE_CAST=meta.BASE_CAST||[];FULL_CAST_EXTRA=meta.FULL_CAST_EXTRA||[];MOCK_KEY=c.base+900;
  if(changed){BOOK=null;MARKS=null;NAR.timings={};try{NAR.audio.pause()}catch(e){}NAR.page=null;NAR.listening=false;buildOrders()}return true}

/* ===== state ===== */
let TRACK=null,CH=null,S=null,SYNC=null,syncTimer=null;
function freshRef(){return{step:-1,picks:{},m:{trust:50,conf:50,health:50},score:0,flags:{},dom:Object.fromEntries(DOMS.map(d=>[d,[0,0]]))}}
function freshFull(){return{pos:0,max:0,picks:{},m:{trust:50,conf:50,health:50},score:0,flags:{},dom:Object.fromEntries(DOMS.map(d=>[d,[0,0]])),drills:{},ex:null,quiz:null}}
function keyOf(tr,n){return COURSE.base+TRACKS[tr].key(n)}
function load(tr,n){const st=store.get("c"+keyOf(tr,n),null);if(st&&tr==="full")relayout(n,st);return st}
function persist(tr,n,st){store.set("c"+keyOf(tr,n),st);if(SYNC){const k=keyOf(tr,n),copy=JSON.parse(JSON.stringify(st));clearTimeout(syncTimer);syncTimer=setTimeout(()=>SYNC(k,copy),400)}}
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
function propHTML(p){const m=p.match(/^<prop\s+([^>]*)>([\s\S]*)<\/prop>$/);if(!m)return `<p>${p}</p>`;const a={};m[1].replace(/(\w+)="([^"]*)"/g,(_,k,v)=>a[k]=v);const body=m[2];
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
function fullGo(p){const L=steps(CH);store.set(`readat.${BID()}.${CH.num}`,Date.now());if(p>=L.length)p=L.findIndex(x=>x.k==="end");S.pos=p;S.max=Math.max(S.max||0,p);save();render();top()}
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
     ${episodeCard(CH)}<div class="bar">${STORY()&&S.pos<steps(CH).length-1?`<button class="btn ghost" id="fnext" type="button">${MENTOR()}'s notes (optional)</button>`:""}${nxt?`<button class="btn" id="nextch" type="button">Chapter ${nxt.num}: ${nxt.title}</button>`:`<button class="btn" id="tomock" type="button">Take the mock exam</button>`}<button class="btn ghost" id="replay" type="button">Replay chapter ${CH.num}</button></div>`;
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
  const tm=$("tomock");if(tm)tm.onclick=()=>openMock();
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

/* ===== mock exam ===== */
let MS=null,mockTimer=null;
function MOCK_LIMIT(){return (COURSE.mockMinutes||240)*60}
function mockQuestions(){const all=[];(DATA().mock||[]).forEach(p=>p.questions.forEach((q,i)=>all.push({...q,id:p.part.slice(0,3)+i})));return all}
function freshMock(mode){const qs=mockQuestions();const seed=Date.now()%100000;const ord=order("mock"+seed,qs.length).map(i=>qs[i].id);return{mode,order:ord,ans:{},flagged:{},cur:0,elapsed:0,breaksTaken:[],onBreak:null,submitted:false,startedAt:new Date().toISOString()}}
function persistMock(){if(MS&&MS.order&&!MS.submitted)store.set("lastplace."+COURSE.id,{t:"mock"});store.set("c"+MOCK_KEY,MS);store.set("cur",MOCK_KEY);if(SYNC){const copy=JSON.parse(JSON.stringify(MS));clearTimeout(syncTimer);syncTimer=setTimeout(()=>SYNC(MOCK_KEY,copy),600)}}
function openMock(){libTouch({t:"mock"});TRACK="mock";store.set("track","mock");MS=store.get("c"+MOCK_KEY,null);render();top()}
function fmtTime(s){s=Math.max(0,Math.round(s));const h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;return `${h}:${String(m).padStart(2,"0")}:${String(x).padStart(2,"0")}`}
function mockTick(){clearInterval(mockTimer);if(!MS||MS.submitted||MS.mode!=="exam")return;mockTimer=setInterval(()=>{if(document.hidden||MS.onBreak!==null)return;MS.elapsed++;const t=$("mocktime");if(t)t.textContent=fmtTime(MOCK_LIMIT()-MS.elapsed);if(MS.elapsed%15===0)persistMock();if(MS.elapsed>=MOCK_LIMIT()){mockSubmit()}},1000)}
function mockRender(){
  const qs=mockQuestions();const byId={};qs.forEach(q=>byId[q.id]=q);
  if(!qs.length){$("page").innerHTML=`<h1>Mock exam</h1><p>The question bank is still being written. Check back soon.</p>`;return}
  if(!MS){
    $("page").innerHTML=`<div class="kicker">Mock Exam</div><h1>${esc(COURSE.mockTitle||"Practice exam")}</h1><div class="story"><p>${qs.length} questions. ${COURSE.mockBlurb||""}</p></div>
    <div class="grid2"><div class="card"><h3>Exam mode</h3><p>${Math.round(MOCK_LIMIT()/60)} minutes, the timer runs${(COURSE.mockBreaks||[]).length?`, optional breaks after questions ${COURSE.mockBreaks.join(" and ")}`:""}, results and explanations at the end.</p><button class="btn" id="exam" type="button">Start exam mode</button></div><div class="card"><h3>Practice mode</h3><p>No timer. See the answer and ${MENTOR()}'s explanation after each question.</p><button class="btn ghost" id="practice" type="button">Start practice mode</button></div></div>`;
    $("exam").onclick=()=>{MS=freshMock("exam");persistMock();render()};$("practice").onclick=()=>{MS=freshMock("practice");persistMock();render()};return}
  if(MS.submitted)return mockResults(byId);
  if(MS.onBreak!==null){$("page").innerHTML=`<h1>Break</h1><div class="story"><p>You've finished question ${MS.onBreak}. Take up to 10 minutes. The exam timer is paused. On the real exam you can't go back to earlier questions after a break.</p></div><div class="bar"><button class="btn" id="resume" type="button">Resume the exam</button></div>`;$("resume").onclick=()=>{MS.breaksTaken.push(MS.onBreak);MS.onBreak=null;persistMock();render()};return}
  const i=MS.cur,q=byId[MS.order[i]],chosen=MS.ans[q.id],showAns=MS.mode==="practice"&&chosen!==undefined;
  const ord=order("mq"+q.id,q.opts.length);
  $("page").innerHTML=`<div class="kicker">Mock exam · ${MS.mode==="exam"?"Exam mode":"Practice mode"} · Question ${i+1} of ${MS.order.length}</div>
   <fieldset class="qitem"><legend>${q.q}</legend>${ord.map((oi,pos)=>`<label class="qopt ${showAns?(oi===q.a?"qright":oi===chosen?"qwrong":""):""}"><input type="radio" name="mq" value="${oi}" ${chosen===oi?"checked":""} ${showAns?"disabled":""}><span class="k">${"ABCD"[pos]}</span> ${q.opts[oi]}</label>`).join("")}
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
  const byId={};mockQuestions().forEach(q=>byId[q.id]=q);const byTask={};let right=0,ans=0;MS.order.forEach(id=>{const q=byId[id];if(!q)return;if(MS.ans[id]===undefined)return;ans++;byTask[q.task]=byTask[q.task]||[0,0];byTask[q.task][1]++;if(MS.ans[id]===q.a){right++;byTask[q.task][0]++}});
  const H=store.get("c"+(COURSE.base+901),null)||{list:[]};H.list.push({at:MS.finishedAt,mode:MS.mode,right,answered:ans,total:MS.order.length,byTask,secs:MS.elapsed});store.set("c"+(COURSE.base+901),H);if(SYNC)SYNC(COURSE.base+901,H);
  render();top()}
function mockResults(byId){
  const qs=MS.order.map(id=>byId[id]).filter(Boolean);const right=qs.filter(q=>MS.ans[q.id]===q.a).length;
  const dom={},task={};qs.forEach(q=>{dom[q.domain]=dom[q.domain]||[0,0];task[q.task]=task[q.task]||[0,0];dom[q.domain][1]++;task[q.task][1]++;if(MS.ans[q.id]===q.a){dom[q.domain][0]++;task[q.task][0]++}});
  const pct=x=>x[1]?Math.round(x[0]/x[1]*100):0;
  const weakTasks=Object.entries(task).sort((a,b)=>pct(a[1])-pct(b[1])).slice(0,5);
  $("page").innerHTML=`<div class="kicker">Mock exam · Results</div><h1>${right} of ${qs.length} (${Math.round(right/qs.length*100)} percent)</h1>
   <div class="story"><p>${esc(COURSE.mockPassNote||(COURSE.id==="pmp"?"PMI doesn't publish a passing score. Many instructors treat 75 percent or better on full-length practice exams as a sign you're ready.":"Aim for a comfortable margin on full-length practice exams before you book the real one."))} ${MS.mode==="exam"?`Time used: ${fmtTime(MS.elapsed)}.`:""}</p></div>
   <div class="end-grid">${DOMS.map(d=>`<div class="card"><h3>${d}</h3><div class="big">${dom[d]?pct(dom[d]):0}%</div><p class="prog">${dom[d]?dom[d][0]+" of "+dom[d][1]:""}</p></div>`).join("")}</div>
   <h2>Weakest tasks</h2><ul class="story" style="padding-left:22px">${weakTasks.map(([t,x])=>`<li>${t} ${TASKNAMES[t]||""}: ${x[0]} of ${x[1]}</li>`).join("")}</ul>
   <h2>Review</h2><details><summary>Show every question with explanations</summary>${qs.map((q,k)=>`<div class="qitem"><p><b>${k+1}.</b> ${q.q}</p><p class="${MS.ans[q.id]===q.a?"qright":"qwrong"}">Your answer: ${MS.ans[q.id]!==undefined?q.opts[MS.ans[q.id]]:"none"}</p>${MS.ans[q.id]===q.a?"":`<p class="qright">Correct: ${q.opts[q.a]}</p>`}<p class="qwhy">${q.why} <span class="tag">${q.task}</span></p></div>`).join("")}</details>
   <div class="bar"><button class="btn" id="again" type="button">Take a new mock exam</button></div>`;
  $("again").onclick=()=>{if(confirm("Start a new mock exam? Your results above will be replaced.")){MS=null;store.set("c"+MOCK_KEY,null);if(SYNC)SYNC(MOCK_KEY,{});render()}};
}


/* ===== progress dashboard, practice sets, study plan ===== */
function ALLT(){return Object.keys(TASKNAMES)}
function mastery(){
  const m={};ALLT().forEach(t=>m[t]={got:0,max:0,n:0});
  const add=(t,g,mx)=>{if(!m[t])return;m[t].got+=g;m[t].max+=mx;m[t].n++};
  TRACKS.full.list().forEach(c=>{const st=c.num===(CH&&TRACK==="full"?CH.num:-1)?S:load("full",c.num);if(!st)return;
    c.scenes.forEach((sc,i)=>{const p=(st.picks||{})[i];if(p!==undefined)add(sc.task,sc.opts[p].s,3)});
    if(st.quiz)c.quiz.forEach((q,qi)=>{if(st.quiz.v[qi]>=0)add(q.task,st.quiz.v[qi]===q.a?3:0,3)})});
  const H=store.get("c"+(COURSE.base+901),null);(H&&H.list||[]).forEach(a=>Object.entries(a.byTask||{}).forEach(([t,[g,n]])=>{if(m[t]){m[t].got+=g*3;m[t].max+=n*3;m[t].n+=n}}));
  const P=store.get("c"+(COURSE.base+902),null);Object.entries((P&&P.tasks)||{}).forEach(([t,[g,n]])=>{if(m[t]){m[t].got+=g*3;m[t].max+=n*3;m[t].n+=n}});
  return m;
}
const pctOf=x=>x.max?Math.round(x.got/x.max*100):null;
function taughtIn(t){const out=[];TRACKS.full.list().forEach(c=>{const sc=c.scenes.map((x,i)=>[x,i]).filter(([x])=>x.task===t);if((c.tasks||[]).includes(t)||sc.length)out.push({c,scenes:sc.map(([,i])=>i)})});return out}
function videosFor(t){const v=[];taughtIn(t).forEach(({c})=>{if(c.lesson&&c.lesson.video&&c.lesson.video[0])v.push([c.lesson.video,c])});return v}
function weakTasks(m,k){return ALLT().filter(t=>m[t].n>=2).map(t=>[t,pctOf(m[t])]).sort((a,b)=>a[1]-b[1]).slice(0,k)}
function studyPlan(m){
  const weak=weakTasks(m,3).filter(([,p])=>p<80),plan=[];
  const nextCh=TRACKS.full.list().find(c=>{const st=load("full",c.num);return !st||(st.pos||0)<steps(c).length-1});
  if(nextCh)plan.push(["Keep the story moving",`Full Course chapter ${nextCh.num}, ${nextCh.title}. Read ${LESSON()} and play the decisions.`,{open:nextCh.num}]);
  weak.forEach(([t,p])=>{const where=taughtIn(t)[0];plan.push([`Shore up ${t} ${TASKNAMES[t]} (${p}%)`,where?`Re-read the chapter ${where.c.num} lesson, then do 10 practice questions on this task.`:`Do 10 practice questions on this task.`,{task:t}])});
  const H=store.get("c"+(COURSE.base+901),null);if(!H||!H.list.length){if(TRACKS.full.list().filter(c=>{const st=load("full",c.num);return st&&(st.pos||0)>=steps(c).length-1}).length>=5)plan.push(["Take a mock exam","You've finished five chapters. A full timed mock now shows where you really stand.",{mock:1}])}
  else plan.push(["Mixed practice","Do 10 mixed practice questions to keep everything warm.",{task:"mixed"}]);
  if(!plan.length)plan.push(["Start here","Open the Full Course and play chapter 1.",{open:1}]);
  return plan.slice(0,5);
}
function renderDash(){setTimeout(ambSync,0);setTimeout(navSync,0);
  TRACK="dash";$("railgame").hidden=true;$("mockcard").hidden=true;
  const m=mastery(),H=(store.get("c"+(COURSE.base+901),null)||{list:[]}).list;
  const fullL=TRACKS.full.list(),refL=TRACKS.ref.list();
  const rows=(tr,L)=>L.map(c=>{const st=load(tr,c.num);if(!st)return `<tr><td>${c.num}</td><td>${c.title}</td><td class="prog" colspan="3">not started</td></tr>`;const n=c.scenes.length,dec=`${st.score}/${n*3}`;
    const quiz=tr==="full"&&st.quiz?`${st.quiz.right}/${c.quiz.length}`:"·";const drills=tr==="full"&&(c.drills||[]).length?`${Object.values(st.drills||{}).filter(x=>x.ok.every(Boolean)).length}/${c.drills.length}`:"·";
    return `<tr><td>${c.num}</td><td><button class="linkbtn" data-open="${tr}:${c.num}">${c.title}</button></td><td class="num">${dec}</td><td class="num">${quiz}</td><td class="num">${drills}</td></tr>`}).join("");
  const last=H.filter(a=>a.mode==="exam").slice(-1)[0];
  const ready=last?Math.round(last.right/last.total*100):null;
  const domPct=d=>{const ts=ALLT().filter(t=>taskDomain(t)===d);const g=ts.reduce((a,t)=>a+m[t].got,0),x=ts.reduce((a,t)=>a+m[t].max,0);return x?Math.round(g/x*100):null};
  const plan=studyPlan(m),weak=weakTasks(m,5);
  $("page").innerHTML=`<div class="kicker">My progress</div><h1>Scoreboard</h1>
   <div class="end-grid"><div class="card"><h3>Readiness</h3><div class="big">${ready!==null?ready+"%":"·"}</div><p class="prog">${last?`Last timed mock, ${new Date(last.at).toLocaleDateString("en-US",{month:"short",day:"numeric"})}`:"Take a timed mock to see this"}</p></div>${DOMS.map(d=>`<div class="card"><h3>${d}</h3><div class="big">${domPct(d)!==null?domPct(d)+"%":"·"}</div></div>`).join("")}</div>
   <h2>${MENTOR()}'s study plan</h2><div class="story"><p>Built from your weakest tasks and where you are in the course. It updates as you play.</p></div>
   <ol class="plan">${plan.map(([h,b,a],i)=>`<li><b>${esc(h)}.</b> ${esc(b)} <button class="btn small" data-plan="${i}" type="button">${a.mock?"Open mock exam":a.task?"Practice":"Open"}</button></li>`).join("")}</ol>
   <h2>Where you need help</h2>${weak.length?weak.map(([t,p])=>{const ti=taughtIn(t),vids=videosFor(t);return `<div class="card helpcard"><div class="row"><b>${t} ${TASKNAMES[t]}</b><span class="pill ${p>=75?"p-ok":p>=50?"p-warn":"p-bad"}">${p}%</span></div>
     <p class="prog">Taught in: ${ti.map(({c,scenes})=>`<button class="linkbtn" data-lesson="${c.num}">Ch ${c.num} lesson</button>${scenes.map(i=>` · <button class="linkbtn" data-scene="${c.num}:${i}">decision ${i+1}</button>`).join("")}`).join(" | ")||"the mock exam only"}</p>
     ${vids.slice(0,2).map(([v,c])=>`<p class="prog">Video: <a href="https://www.youtube.com/watch?v=${esc(v[0])}" target="_blank" rel="noopener">${esc(v[1])}</a> (${esc(v[2])}, ${esc(v[3])})</p>`).join("")}
     <button class="btn small" data-task="${t}" type="button">10 practice questions</button></div>`}).join(""):`<div class="story"><p>Play a few chapters and quizzes first. This fills in once there's enough to judge.</p></div>`}
   <h2>All ${ALLT().length} exam tasks</h2><div class="taskgrid">${ALLT().map(t=>{const p=pctOf(m[t]);return `<button class="taskcell" data-task="${t}" type="button" title="${TASKNAMES[t]}"><span class="tc">${t}</span><span class="tn">${TASKNAMES[t]}</span><span class="mbar"><span style="width:${p||0}%;background:${p===null?"var(--soft)":p>=75?"var(--good)":p>=50?"var(--mid)":"var(--bad)"}"></span></span><span class="prog">${p===null?"no data":p+"% · "+m[t].n+" items"}</span></button>`}).join("")}</div>
   <h2>Full Course</h2><div class="tablewrap"><table><tr><th>Ch</th><th>Title</th><th>Decisions</th><th>Quiz</th><th>Drills</th></tr>${rows("full",fullL)}</table></div>
   ${refL.length?`<h2>Refresher</h2><div class="tablewrap"><table><tr><th>Ch</th><th>Title</th><th>Decisions</th><th>Quiz</th><th>Drills</th></tr>${rows("ref",refL)}</table></div>`:""}
   <h2>Mock exams</h2>${H.length?`<div class="tablewrap"><table><tr><th>Date</th><th>Mode</th><th>Score</th><th>Time</th></tr>${H.slice().reverse().map(a=>`<tr><td>${new Date(a.at).toLocaleDateString("en-US",{month:"short",day:"numeric"})}</td><td>${a.mode}</td><td class="num">${a.right}/${a.total} (${Math.round(a.right/a.total*100)}%)</td><td class="num">${a.mode==="exam"?fmtTime(a.secs):"·"}</td></tr>`).join("")}</table></div>`:`<p class="prog">No mock exams yet.</p>`}`;
  const pg=$("page");
  pg.querySelectorAll("[data-open]").forEach(b=>b.onclick=()=>{const [tr,n]=b.dataset.open.split(":");openChapter(tr,+n)});
  pg.querySelectorAll("[data-lesson]").forEach(b=>b.onclick=()=>{openChapter("full",+b.dataset.lesson);S.max=Math.max(S.max||0,1);fullGo(1)});
  pg.querySelectorAll("[data-scene]").forEach(b=>b.onclick=()=>{const [n,i]=b.dataset.scene.split(":").map(Number);openChapter("full",n);const p=steps(CH).findIndex(x=>x.k==="scene"&&x.i===i);S.max=Math.max(S.max||0,p);fullGo(p)});
  pg.querySelectorAll("[data-task]").forEach(b=>b.onclick=()=>startPractice(b.dataset.task));
  pg.querySelectorAll("[data-plan]").forEach(b=>b.onclick=()=>{const a=plan[+b.dataset.plan][2];if(a.mock)return openMock();if(a.task)return startPractice(a.task);openChapter("full",a.open)});
}
let PR=null;
function practicePool(t){const pool=[];TRACKS.full.list().forEach(c=>c.quiz.forEach((q,i)=>pool.push({...q,src:`Chapter ${c.num} quiz`,pid:`f${c.num}q${i}`,cases:c.cases})));mockQuestions().forEach(q=>pool.push({...q,src:"Mock bank",pid:"m"+q.id}));return t==="mixed"?pool:pool.filter(q=>q.task===t)}
function startPractice(t){const pool=practicePool(t);if(!pool.length)return;const seed=Date.now()%9973;const pick=order("pr"+t+seed,pool.length).slice(0,10).map(i=>pool[i]);PR={task:t,qs:pick,v:null};TRACK="practice";renderPractice();top()}
function renderPractice(){setTimeout(navSync,0);
  $("railgame").hidden=true;$("mockcard").hidden=true;const {task,qs,v}=PR;
  $("page").innerHTML=`<div class="kicker">Practice set</div><h1>${task==="mixed"?"Mixed practice":`${task} ${TASKNAMES[task]}`}</h1><p class="prog">${qs.length} questions from the chapter quizzes and the mock bank. Results feed your progress map.</p>
   <form id="prform" novalidate>${(()=>{const pseen=new Set();return qs.map((x,qi)=>{const ord=order(x.pid.startsWith("m")?"mq"+x.pid.slice(1):x.pid.replace(/^f(\d+)q(\d+)$/,"q$1_$2"),x.opts.length);return `${caseBefore(x.cases,x,pseen,x.src)}<fieldset class="qitem"><legend><span class="qn">${qi+1}.</span> ${x.q}</legend>${ord.map((oi,pos)=>`<label class="qopt ${v?(oi===x.a?"qright":v[qi]===oi?"qwrong":""):""}"><input type="radio" name="p${qi}" value="${oi}" ${v?"disabled":""} ${v&&v[qi]===oi?"checked":""}><span class="k">${"ABCD"[pos]}</span> ${x.opts[oi]}</label>`).join("")}${v?`<p class="qwhy"><b>${v[qi]===x.a?"Correct.":"Not quite."}</b> ${x.why} <span class="tag">${x.task} · ${x.src}</span></p>`:""}</fieldset>`}).join("")})()}${v?"":`<button class="btn" type="submit">Check my answers</button>`}</form>
   ${v?`<div class="callout"><b>${v.filter((x,i)=>x===qs[i].a).length} of ${qs.length} correct.</b></div><div class="bar"><button class="btn" id="again" type="button">Another set</button><button class="btn ghost" id="todash" type="button">Back to progress</button></div>`:""}`;
  const f=$("prform");if(f)f.onsubmit=e=>{e.preventDefault();PR.v=qs.map((_,qi)=>{const c=document.querySelector(`input[name=p${qi}]:checked`);return c?+c.value:-1});
    const P=store.get("c"+(COURSE.base+902),null)||{tasks:{}};qs.forEach((x,qi)=>{if(PR.v[qi]<0)return;P.tasks[x.task]=P.tasks[x.task]||[0,0];P.tasks[x.task][1]++;if(PR.v[qi]===x.a)P.tasks[x.task][0]++});store.set("c"+(COURSE.base+902),P);if(SYNC)SYNC(COURSE.base+902,P);renderPractice();top()};
  const a=$("again");if(a)a.onclick=()=>startPractice(task);const d=$("todash");if(d)d.onclick=()=>renderDash();
}


/* ===== page narration: sticky player, per-page clips, word highlight ===== */
const NAR={car:false,audio:new Audio(),timings:{},key:null,page:null,listening:false,auto:store.get("auto2",false),rate:store.get("rate",1),map:[],words:[],raf:0,cur:-1};
NAR.audio.preload="auto";
/* listening position: per course, saved to the account so any device picks up where you stopped */
/* PMP v2 keeps its Audiobook and page positions and Labs waiting under 904 (v1's were 903); its prefs carry over once */
function LKEY(){return COURSE.base+(PMP2()?904:903)}
function BID(){return PMP2()?"pmp2":COURSE.id} // local Audiobook keys (bookpos, bookdone, readat) for this edition
function lget(){const L=store.get("c"+LKEY(),null);if(!L&&PMP2()){const o=store.get("c"+(COURSE.base+903),null);if(o&&o.prefs)return {prefs:o.prefs}}return L||{}}
let lsyncT=0,lsaveAt=0;
function lput(patch,now){const L=Object.assign(lget(),patch,{at:Date.now()});store.set("c"+LKEY(),L);if(SYNC){clearTimeout(lsyncT);const k=LKEY(),c=JSON.parse(JSON.stringify(L));lsyncT=setTimeout(()=>SYNC(k,c),now?0:1500)}}
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
function narPageId(){
  if(TRACK==="ref"){if(S.step<0)return["open",".story p"];if(S.step>=CH.scenes.length)return["end",".story p"];const i=S.step,p=S.picks[i];return p===undefined?["s"+i,".story p, .choice span:not(.k)"]:[`o${i}_${p}`,".outcome .story p"]}
  const st=steps(CH)[Math.min(S.pos,steps(CH).length-1)];
  if(st.k==="open")return["open",".story p"];if(st.k==="lesson")return["lesson","h1, .lesson h2, .lesson .story p, .lesson .examtip"];if(st.k==="end")return["end",".story p"];
  if(st.k==="scene"){const p=S.picks[st.i];return p===undefined?["s"+st.i,".story p, .choice span:not(.k)"]:[`o${st.i}_${p}`,".outcome .story p"]}
  return[null,null];
}
const norm=w=>w.toLowerCase().normalize("NFD").replace(/[^a-z0-9]/g,"");
function wrapWords(sel){const els=[...$("page").querySelectorAll(sel)];const words=[];
  els.forEach(el=>{const tw=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);const nodes=[];while(tw.nextNode())nodes.push(tw.currentNode);
    nodes.forEach(nd=>{if(!nd.nodeValue.trim())return;const frag=document.createDocumentFragment();nd.nodeValue.split(/(\s+)/).forEach(part=>{if(!part)return;if(/^\s+$/.test(part)){frag.appendChild(document.createTextNode(part));return}const sp=document.createElement("span");sp.className="w";sp.textContent=part;frag.appendChild(sp);words.push(sp)});nd.parentNode.replaceChild(frag,nd)})});
  return words}
function alignWords(tw,dom){const map=[];let j=0;const dn=dom.map(d=>norm(d.textContent));
  tw.forEach(([t])=>{const n=norm(t);if(!n||/^[A-D]$/.test(t)){map.push(null);return}const win=n.length<=2?3:12;let hit=null;for(let k=j;k<Math.min(dom.length,j+win);k++){if(dn[k]&&(dn[k]===n||dn[k].startsWith(n)||n.startsWith(dn[k]))){hit=k;break}}if(hit!==null){map.push(hit);j=hit+1}else map.push(null)});return map}
function bookSec(){if(NAR.page!=="book"||!NAR.book)return;const pid=pidAt(NAR.book.n,NAR.book.ed,NAR.audio.currentTime||0);if(pid&&pid!==NAR.bsec){NAR.bsec=pid;const l=$("narlabel");if(l)l.textContent=`Ch ${NAR.book.n} · ${pidLabel(pid,NAR.book.n)}`;narMedia()}}
["seeked","timeupdate"].forEach(ev=>NAR.audio.addEventListener(ev,()=>bookSec()));
function narHighlight(){if(NAR.page==="book"){bookSec();const pr=$("narprog");if(pr&&NAR.audio.duration)pr.style.width=(NAR.audio.currentTime/NAR.audio.duration*100)+"%";narTick();if(!NAR.audio.paused)NAR.raf=requestAnimationFrame(narHighlight);return}if(NAR.page==="car"){const pr=$("narprog");if(pr&&NAR.audio.duration)pr.style.width=(NAR.audio.currentTime/NAR.audio.duration*100)+"%";if(Math.round(NAR.audio.currentTime)%5===0)store.set("carpos."+NAR.key,NAR.audio.currentTime);narTick();if(!NAR.audio.paused)NAR.raf=requestAnimationFrame(narHighlight);return}const T=NAR.timings[NAR.key];const t=NAR.audio.currentTime;const W=T&&T[NAR.page]?T[NAR.page].w:[];
  let lo=0,hi=W.length-1,idx=-1;while(lo<=hi){const mid=(lo+hi)>>1;if(W[mid][1]<=t){idx=mid;lo=mid+1}else hi=mid-1}
  const di=idx>=0?NAR.map[idx]:null;if(di!==NAR.cur){if(NAR.cur!=null&&NAR.words[NAR.cur])NAR.words[NAR.cur].classList.remove("hl");if(di!=null&&NAR.words[di]){const w=NAR.words[di];NAR.lastw=w;w.classList.add("hl");const r=w.getBoundingClientRect(),off=r.top<70||r.bottom>innerHeight-110;if(off&&!NAR.free)w.scrollIntoView({block:"center",behavior:"smooth"});narFollowUI(off,r.top<70)}NAR.cur=di}
  const pr=$("narprog");if(pr&&NAR.audio.duration)pr.style.width=(NAR.audio.currentTime/NAR.audio.duration*100)+"%";narTick();
  if(!NAR.audio.paused)NAR.raf=requestAnimationFrame(narHighlight)}
// Scrolling by hand while a page reads stops the auto follow; "Follow the reading" brings it back.
function narFollowUI(off,up){const p=$("narfollow");if(!p)return;p.hidden=!(NAR.free&&off);if(!p.hidden)p.textContent=(up?"↑":"↓")+" Follow the reading"}
addEventListener("scroll",()=>{const w=NAR.lastw;if(!NAR.free||!w||!w.isConnected)return;const r=w.getBoundingClientRect();narFollowUI(r.top<70||r.bottom>innerHeight-110,r.top<70)},{passive:true});
function narFree(){if(NAR.page&&NAR.page!=="book"&&NAR.page!=="car"&&!NAR.audio.paused)NAR.free=true}
addEventListener("wheel",narFree,{passive:true});addEventListener("touchmove",narFree,{passive:true});
addEventListener("keydown",e=>{if(["PageUp","PageDown","ArrowUp","ArrowDown","Home","End"].includes(e.key))narFree()});
addEventListener("mousedown",e=>{if(e.clientX>=document.documentElement.clientWidth)narFree()});
function narUI(){const b=$("narbar");if(!b)return;const has=NAR.page==="car"||NAR.page==="book"||!!(NAR.key&&NAR.timings[NAR.key]&&NAR.page&&NAR.timings[NAR.key][NAR.page]);b.hidden=!has;document.body.classList.toggle("withbar",has);if(!has)return;
  $("narplay").textContent=NAR.audio.paused?"▶ Listen":"❚❚ Pause";b.classList.toggle("book",NAR.page==="book");$("narlabel").textContent=NAR.page==="book"?`Ch ${NAR.book.n} · ${NAR.bsec?pidLabel(NAR.bsec,NAR.book.n):(NAR.book.ed==="story"?"Story only":"Story + lessons")}`:NAR.page==="car"?"Car mode · whole chapter":({open:"Opening",lesson:LESSON(),end:"Chapter ending",end_alt:"Chapter ending"}[NAR.page]||(NAR.page[0]==="s"?"Decision":"Outcome"));}
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
  if(T[pid+"_alt"]){const m2=alignWords(T[pid+"_alt"].w,NAR.words),hits=m=>m.filter(x=>x!=null).length;if(hits(m2)>hits(NAR.map)){NAR.page=pid+"_alt";NAR.map=m2}} // two narrations (best path, middling run): play the one that matches this page
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
  const bar=document.createElement("div");bar.id="narbar";bar.hidden=true;bar.innerHTML=`<button class="btn small" id="narfollow" type="button" hidden>↓ Follow the reading</button><div class="narseekrow"><span class="prog nartime" id="narcur">0:00</span><input type="range" id="narseek" min="0" max="1000" value="0" step="1" aria-label="Seek"><span class="prog nartime" id="nardur">0:00</span><span id="narprog" hidden></span></div><div class="narrow"><button class="btn small ghost" id="narprev" type="button" aria-label="Previous section" data-tip="Previous scene in the Audiobook, or previous page while reading.">⏮</button><button class="btn small ghost" id="narback" type="button" aria-label="Back 10 seconds" data-tip="Jump back 10 seconds for a quick refresher.">⟲ 10</button><button class="btn" id="narplay" type="button">▶ Listen</button><button class="btn small ghost" id="narfwd" type="button" aria-label="Forward 30 seconds" data-tip="Skip ahead 30 seconds.">30 ⟳</button><button class="btn small ghost" id="narnext" type="button" aria-label="Next section" data-tip="Next scene in the Audiobook, or next page while reading.">⏭</button><span class="prog" id="narlabel"></span><label class="prog" for="narrate" data-tip="Reading speed. Your choice is remembered.">Speed <select id="narrate">${[0.8,0.9,1,1.1,1.25,1.5].map(r=>`<option value="${r}" ${r==NAR.rate?"selected":""}>${r}x</option>`).join("")}</select></label><label class="chk prog" for="narauto" data-tip="When a page finishes reading, turn to the next page by itself. Decisions still wait for you to choose."><input type="checkbox" id="narauto" ${NAR.auto?"checked":""}> Keep going</label><button class="btn small ghost" id="gohf" type="button" data-tip="Switch to the audiobook. It starts at the part you're reading and plays straight through, chapter after chapter.">🎧 Audiobook</button></div>`;
  document.body.appendChild(bar);
  $("narfollow").onclick=()=>{NAR.free=false;$("narfollow").hidden=true;const w=NAR.lastw;if(w&&w.isConnected)w.scrollIntoView({block:"center",behavior:"smooth"})};
  $("narplay").onclick=()=>{plog("tap Listen");if(NAR.audio.paused){NAR.listening=true;NAR.free=false;if(NAR.audio.ended)NAR.audio.currentTime=0;NAR.audio.play().then(()=>{plog("play() ok");narUI();narHighlight()}).catch(e=>plog("play() REJECTED "+e.name+": "+e.message))}else{NAR.listening=false;NAR.audio.pause();narUI()}};
  {const sk=$("narseek");let drag=false;
   const show=()=>{const a=NAR.audio,d=a.duration||0;$("narcur").textContent=fmtT(drag?(+sk.value/1000*d):a.currentTime);$("nardur").textContent=d?fmtT(d):"0:00";if(!drag&&d)sk.value=Math.round(a.currentTime/d*1000)};
   ["timeupdate","loadedmetadata","durationchange","seeked","emptied"].forEach(ev=>NAR.audio.addEventListener(ev,show));
   sk.addEventListener("input",()=>{drag=true;show()});
   sk.addEventListener("change",()=>{const d=NAR.audio.duration||0;if(d)NAR.audio.currentTime=+sk.value/1000*d;drag=false;narSavePos(true);show();if(NAR.audio.paused)narHighlight()})}
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
narInit();window.__nar=NAR;
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
function avatar(c,size){const ini=c.name.split(" ").map(w=>w[0]).slice(0,2).join("");let h=0;for(const ch of c.id)h=(h*31+ch.charCodeAt(0))>>>0;const hue=h%360;
  return `<span class="av" style="width:${size}px;height:${size}px;--avh:${hue}"><img src="${R(V2("cast/"+c.id+".jpg"))}" alt="" loading="lazy" onerror="if(!this.dataset.f){this.dataset.f=1;this.src='${R(V2("cast/"+c.id+".svg"))}'}else this.remove()"><span>${esc(ini)}</span></span>`}
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
  <h2>Put it on your iPhone</h2><dl>
   <dt>Install</dt><dd>Open the site in <b>Safari</b>, tap the <b>Share</b> button, then <b>Add to Home Screen</b>. It opens full screen like an app.</dd>
   <dt>Sign in once</dt><dd>The home screen app keeps its own sign-in, so sign in again the first time you open it. After that your progress and listening spot follow you.</dd>
   <dt>Lock screen</dt><dd>Start the Audiobook, lock the phone, and use the lock screen or CarPlay controls to pause and skip.</dd>
  </dl>
  <h2>Privacy</h2><p>The site counts anonymous page views, without cookies, to learn which chapters people read. No personal data.</p><p>If you join the list, we store your email to tell you about new books. Ask to be removed anytime. Each email has a leave link at the bottom too.</p>
  <h2>Troubleshooting</h2><label class="chk prog"><input type="checkbox" id="pdbgt" ${PDBG.on?"checked":""}> Show player diagnostics (a log at the top of the screen; screenshot it and send it to Anthony)</label></div>`;
  if($("guideup"))$("guideup").onclick=()=>{renderUpcoming();top()};$("pdbgt").onchange=e=>{PDBG.on=e.target.checked;store.set("pdbg",PDBG.on);if(!PDBG.on){const el=$("pdbg");if(el)el.remove()}else plog("diagnostics on")}}
function lastPlaceLabel(){const lp=store.get("lastplace."+COURSE.id,null);if(!lp)return null;if(lp.t==="mock")return["Mock exam",()=>openMock()];const c=TRACKS[lp.t]&&TRACKS[lp.t].list().find(x=>x.num===lp.n);if(!c)return null;return[`${lp.t==="ref"?"Refresher":"Ch"} ${c.num} · ${c.title}`,()=>openChapter(lp.t,c.num)]}
/* where you are lives in the address (#pmp/full/3, #guide), so a reload reopens the same screen */
function noteRoute(){if(!COURSE)return;const c=COURSE.id;const r=TRACK==="library"?"library":TRACK==="guide"?"guide":TRACK==="upcoming"?"upcoming":TRACK==="about"?c+"/about":TRACK==="book"?c+"/listen":TRACK==="cast"?c+"/cast":(TRACK==="dash"||TRACK==="practice")?c+"/progress":TRACK==="mock"?c+"/mock":(TRACK==="full"||TRACK==="ref")&&CH?`${c}/${TRACK}/${CH.num}`:c+"/home";
  store.set("route",r);if(location.hash!=="#"+r)try{history.replaceState(null,"","#"+r)}catch(e){}pageview(r)}
/* anonymous page views (Vercel Web Analytics, loaded in index.html): the route only, as a path. Never a name, email, id, or progress. */
let LASTPV="";function pageview(r){if(!r||r===LASTPV)return;LASTPV=r;try{if(window.va)window.va("pageview",{path:"/"+r})}catch(e){}}
async function routeTo(h){const p=String(h||"").replace(/^#/,"").split("/").filter(Boolean);if(!p.length)return false;
  if(p[0]==="library"){renderLibrary();return true}if(p[0]==="guide"){renderGuide();return true}if(p[0]==="upcoming"){renderUpcoming();return true}if(p[0]==="labtest"){await loadScripts(["tools/lab_fixture.js"]);renderLabTest();return true}
  const c=courseById(p[0]);if(!c||c.status!=="live")return false;if(c.id!==COURSE.id&&!(await useCourse(c.id)))return false;if(!c._loaded&&(c.scripts||c.labs))await useCourse(c.id);
  const v=p[1]||"home",n=+p[2];
  if((v==="full"||v==="ref")&&TRACKS[v].list().find(x=>x.num===n)){openChapter(v,n);return true}
  if(v==="listen"){renderBook();return true}if(v==="about"){renderAbout();return true}if(v==="cast"){renderCast();return true}if(v==="progress"){renderDash();return true}if(v==="mock"){openMock();return true}
  renderHome();renderRail();return true}
window.addEventListener("hashchange",()=>{const r=String(location.hash).replace(/^#/,"");if(r&&r!==store.get("route",""))routeTo(location.hash)});
function navSync(){noteRoute();const map={home:"homelink",library:"liblink",upcoming:"liblink",dash:"proglink",practice:"proglink",cast:"castlink",book:"listenlink",guide:"guidelink"};["liblink","homelink","proglink","castlink","listenlink","guidelink"].forEach(id=>{const b=$(id);if(b)b.classList.remove("on")});
  const onId=!TRACK?"homelink":map[TRACK];if(onId&&$(onId))$(onId).classList.add("on");
  const cb=$("contlink");if(!cb)return;const lp=lastPlaceLabel();const inPlace=(TRACK==="full"||TRACK==="ref"||TRACK==="mock");
  if(lp&&!inPlace&&TRACK!==null){cb.hidden=false;cb.textContent="Continue: "+lp[0];cb.onclick=()=>{lp[1]();}}else cb.hidden=true;
  if(!inPlace&&lp&&(TRACK==="cast"||TRACK==="dash"||TRACK==="practice"||TRACK==="book"||TRACK==="guide")){const pg=$("page");if(pg&&!pg.querySelector(".backlink")){const d=document.createElement("p");d.className="backlink";d.innerHTML=`<button class="linkbtn" type="button">← Back to ${esc(lp[0])}</button>`;d.firstChild.onclick=()=>lp[1]();pg.prepend(d)}}}


/* ===== audiobook ===== */
let BOOK=null;
let MARKS=null;
async function bookMarks(){if(MARKS)return MARKS;if(NOAUD())return MARKS={full:{}};try{const r=await fetch(R(V2("audio/bookmarks.json")),{cache:"no-store"});MARKS=r.ok?await r.json():{full:{}}}catch(e){MARKS={full:{}}}return MARKS}
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
async function bookManifest(){bookMarks();if(BOOK&&Object.keys(BOOK.full||{}).length)return BOOK;if(NOAUD())return BOOK={full:{}};try{const r=await fetch(R(V2("audio/audiobook.json")),{cache:"no-store"});BOOK=r.ok?await r.json():{full:{}}}catch(e){BOOK={full:{}}}return BOOK}
function bookPlay(ed,n,at){const M=BOOK.full[n]&&BOOK.full[n][ed];if(!M)return;libTouch({t:"book",n});labQueue(n);NAR.bsec=null;bookMarks();NAR.page="book";NAR.book={ed,n};NAR.key="book";NAR.audio.pause();NAR.audio.src=R(M.src);NAR.audio.playbackRate=NAR.rate;
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
  $("page").innerHTML=`<div class="kicker">Audiobook</div><h1>Audiobook</h1><p class="lead">No tapping needed. It plays the story on the right-answer path, chapter after chapter, and keeps going with your phone locked. Pause or skip with your car or lock-screen controls.</p>
   <div class="edtoggle" role="radiogroup" aria-label="Edition"><button type="button" class="${ed==="story"?"on":""}" data-ed="story"><b>Story only</b><span class="prog">Just the novel. ${esc(COURSE.hero||"The lead")} makes the right calls and you hear what happens.</span></button><button type="button" class="${ed==="study"?"on":""}" data-ed="study"><b>Story + lessons</b><span class="prog">The story plus ${MENTOR()}'s lesson, and each decision read aloud with a pause, then the answer and why. About twice as long.</span></button></div>
   ${(()=>{const LB=lget().book;if(!LB||!(B.full[LB.n]))return "";const same=LB.ed===ed;const c=full.find(x=>x.num===LB.n);return `<button class="handsfree" type="button" id="bresume"><span>▶</span><span><b>Resume chapter ${LB.n}${c?": "+esc(c.title):""}</b><span class="prog">${same?`at ${fmtT(LB.t)}`:`near where you stopped in ${LB.ed==="story"?"Story only":"Story + lessons"}`} · picks up on any device</span></span></button><button class="btn small ghost" type="button" id="bread">📖 Read from here${pidAt(LB.n,LB.ed,LB.t)?": "+esc(pidLabel(pidAt(LB.n,LB.ed,LB.t),LB.n)):""}</button>`})()}
   <p class="prog">Plays chapter to chapter on its own and remembers where you stopped, on any device. Use ⟲ 10 for a quick refresher. The ⬇ next to a chapter downloads it for the car or the gym. Works with the lock screen and car controls. Chapters are recorded as you reach them.</p>
   ${labWaitHTML()}<h2>Full Course</h2>${(()=>{const L=COURSE.bookRecordedOnly?full.filter(c=>B.full[c.num]&&B.full[c.num][ed]):full;return L.length?`<div class="brows">${L.map(row).join("")}</div>`:`<p class="prog">The narration for this edition is being recorded. Chapters show up here as they're ready.</p>`})()}`;wireLabWait();
  $("page").querySelectorAll("[data-ed]").forEach(b=>b.onclick=()=>{store.set("bookEd."+COURSE.id,b.dataset.ed);renderBook()});
  {const r=$("bresume");if(r)r.onclick=()=>{const LB=lget().book;if(LB)bookPlay(ed,LB.n)}}
  {const r=$("bread");if(r)r.onclick=()=>{readFromBook();top()}}
  $("page").querySelectorAll("[data-bn]").forEach(b=>b.onclick=()=>bookPlay(ed,+b.dataset.bn,+b.dataset.bt));
  $("page").querySelectorAll("[data-b]").forEach(b=>b.onclick=()=>{const n=+b.dataset.b;if(NAR.page==="book"&&NAR.book&&NAR.book.n===n&&NAR.book.ed===ed){if(NAR.audio.paused){NAR.audio.play();narHighlight()}else NAR.audio.pause();setTimeout(renderBook,50);return}bookPlay(ed,n)});
}


/* ===== chapter art + "In this scene" cast strip ===== */
function REF_ART(){return COURSE.refArt||{}}
function chapterArt(){if(!CH)return "";const n=TRACK==="full"?CH.num:REF_ART()[CH.num];if(!n)return "";const nn=String(n).padStart(2,"0");
  return `<div class="chart"><img src="${R(V2("art/full-ch"+nn+".jpg"))}" alt="" onerror="if(!this.dataset.f){this.dataset.f=1;this.src='${R(V2("art/full-ch"+nn+".svg"))}'}else this.parentNode.remove()"></div>`}
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
  const want=ambFor(text,kind);if(want!==AMB.cur){const old=AMB.els[AMB.i];AMB.i=1-AMB.i;const nw=AMB.els[AMB.i];nw.src=`audio/amb/${want}.mp3`;nw.volume=0;nw.play().then(()=>fade(nw,AMB.vol,1500)).catch(()=>{});fade(old,0,1500);AMB.cur=want}
  // chapter stings
  const isOpen=!!pg.querySelector(".chart")&&(TRACK==="full"?S.pos===0:S.step<0);const isEnd=pg.querySelector(".end-grid");const tag=`${TRACK}${CH.num}${isOpen?"o":isEnd?"e":""}`;
  if((isOpen||isEnd)&&AMB.lastSting!==tag){AMB.lastSting=tag;AMB.sting.src=isOpen?"audio/sting-open.mp3":"audio/sting-close.mp3";AMB.sting.volume=Math.min(1,AMB.vol*2.4);AMB.sting.play().catch(()=>{})}
}
function ambUI(){const t=$("ambtoggle");if(t)t.checked=AMB.on;const v=$("ambvol");if(v)v.value=AMB.vol}

/* ===== home and rail ===== */
function chapterProgress(tr,c){const st=load(tr,c.num);if(!st)return "";if(tr==="ref")return st.step>=c.scenes.length?`${st.score}/${c.scenes.length*3}`:(st.step>=0?"in progress":"");const total=steps(c).length;return (st.pos||0)>=total-1?"done":((st.max||0)>0?"in progress":"")}
function renderHome(){setTimeout(ambSync,0);setTimeout(navSync,0);
  TRACK=null;CH=null;$("railgame").hidden=true;$("mockcard").hidden=true;
  const lp=lastPlaceLabel();const m=mastery();const plan=studyPlan(m);const H=(store.get("c"+(COURSE.base+901),null)||{list:[]}).list;const last=H.slice(-1)[0];
  const tile=(tr,c)=>{const st=load(tr,c.num);const lab=chapterProgress(tr,c);const state=lab==="done"||/\d+\/\d+/.test(lab)?"done":lab==="in progress"?"prog":"new";
    const sc=st&&st.score!==undefined&&Object.keys(st.picks||{}).length?`${st.score}/${c.scenes.length*3}`:"";
    return `<button class="ctile ${state}" type="button" data-open="${tr}:${c.num}"><span class="cn">${c.num}</span><span class="ct">${esc(c.title)}</span><span class="cs">${state==="done"?"Done"+(sc?" · "+sc:""):state==="prog"?"In progress":"Start"}</span></button>`};
  const full=TRACKS.full.list(),ref=TRACKS.ref.list();
  const fullDone=full.filter(c=>chapterProgress("full",c)==="done").length;
  $("page").innerHTML=`<div class="kicker"><button class="linkbtn" type="button" id="tolib">Library</button> › ${esc(COURSE.title)} · <button class="linkbtn" type="button" id="toabout">About this book</button></div><h1>${esc(COURSE.full_title||COURSE.title)}</h1>
   ${lp?`<button class="hero" type="button" id="resume"><span class="prog">Pick up where you left off</span><b>${esc(lp[0])}</b><span class="go">Continue ›</span></button>`:`<button class="hero" type="button" id="resume"><span class="prog">New here?</span><b>Start the ${esc(COURSE.fullName||"Full Course")}: Chapter 1${TRACKS.full.list()[0]?", "+esc(TRACKS.full.list()[0].title):""}</b><span class="go">Begin ›</span></button>`}
   <button class="handsfree" type="button" id="hfree"><span>🎧</span><span><b>Play the audiobook</b><span class="prog">Starts at your current chapter. No tapping while you drive.</span></span></button>
   ${plan[0]?`<div class="nextstep"><span class="prog">${MENTOR()}'s next step for you</span><p><b>${esc(plan[0][0])}.</b> ${esc(plan[0][1])}</p><button class="btn small" type="button" id="planbtn">${plan[0][2].task?"Practice now":plan[0][2].mock?"Open mock exam":"Go"}</button> <button class="linkbtn" type="button" id="seeplan">See the full study plan</button></div>`:""}
   ${labWaitHTML()}<h2>${esc(COURSE.fullName||"Full Course")} <span class="prog">${fullDone} of ${full.length} chapters done${COURSE.planned&&COURSE.planned>full.length?` (${COURSE.planned} planned, more on the way)`:""}${COURSE.fullHours?" · "+COURSE.fullHours:""}</span></h2>
   <div class="ctiles">${full.map(c=>tile("full",c)).join("")}</div>
   ${ref.length?`<h2>Refresher <span class="prog">${ref.length} chapters · a fast review</span></h2><div class="ctiles">${ref.map(c=>tile("ref",c)).join("")}</div>`:""}
   <h2>Mock exam</h2><div class="card mockhome"><p>${COURSE.mockShort||"A full practice exam."} ${last?`Last attempt: <b>${last.right} of ${last.total}</b> (${Math.round(last.right/last.total*100)}%) on ${new Date(last.at).toLocaleDateString("en-US",{month:"short",day:"numeric"})}.`:"You haven't taken one yet."}</p><button class="btn" type="button" id="mockbtn">Open the mock exam</button></div>
   <div class="quick"><button class="card qlink" type="button" id="qprog"><b>Progress</b><span class="prog">Scores, the ${ALLT().length}-task map, practice sets</span></button><button class="card qlink" type="button" id="qcast"><b>Cast</b><span class="prog">Meet everyone, hear them talk</span></button></div>`;
  const pg=$("page");wireLabWait();
  $("resume").onclick=()=>lp?lp[1]():openChapter("full",1);
  $("hfree").onclick=async()=>{const B=await bookManifest();const lpv=store.get("lastplace."+COURSE.id,null);const ed=store.get("bookEd."+COURSE.id,"story");let n=lpv&&lpv.t==="full"?lpv.n:1;const have=Object.keys(B.full).map(Number).filter(k=>B.full[k][ed]).sort((a,b)=>a-b);if(!have.length)return renderBook();if(!have.includes(n))n=have.find(k=>k>=n)||have[have.length-1];renderBook();bookPlay(ed,n)};
  pg.querySelectorAll("[data-open]").forEach(b=>b.onclick=()=>{const [tr,n]=b.dataset.open.split(":");openChapter(tr,+n)});
  $("tolib").onclick=()=>renderLibrary();$("toabout").onclick=()=>{renderAbout();top()};$("mockbtn").onclick=()=>openMock();$("qprog").onclick=()=>{renderDash();top()};$("qcast").onclick=()=>{renderCast();top()};
  if($("planbtn")){const a=plan[0][2];$("planbtn").onclick=()=>{if(a.mock)return openMock();if(a.task)return startPractice(a.task);openChapter("full",a.open)};$("seeplan").onclick=()=>{renderDash();top()}}
}
function openChapter(tr,n){libTouch({t:tr,n});store.set("lastplace."+COURSE.id,{t:tr,n});TRACK=tr;store.set("track",tr);store.set("lastch."+COURSE.id+"."+tr,n);CH=chapters().find(c=>c.num===n);S=load(tr,n)||(tr==="ref"?freshRef():freshFull());store.set("cur",keyOf(tr,n));render();top()}
function resetChapter(n){if(!confirm(`Reset chapter ${n}? Your progress in this chapter will be cleared.`))return;const st=TRACK==="ref"?freshRef():freshFull();if(n===CH.num){S=st;save();render();top()}else{persist(TRACK,n,st);renderRail()}}
function renderRail(){
  const rg=$("railgame");if(!TRACK||["mock","dash","practice","cast","book","library","about","guide","upcoming"].includes(TRACK)){rg.hidden=true}else rg.hidden=false;
  $("trackname").textContent=TRACK?TRACKS[TRACK].name:"";
  if(TRACK==="mock"){$("mockcard").hidden=false;$("mockcard").innerHTML=MS&&!MS.submitted&&MS.order?`<h3>Mock exam</h3><p class="big" id="mocktime">${MS.mode==="exam"?fmtTime(MOCK_LIMIT()-MS.elapsed):"Practice"}</p><p class="prog">${Object.keys(MS.ans).length} of ${MS.order.length} answered</p>`:`<h3>Mock exam</h3><p class="prog">Pick a mode to start.</p>`;return}
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
function _render(){if(TRACK==="library")return renderLibrary();if(TRACK==="upcoming")return renderUpcoming();if(TRACK==="book")return renderBook();if(TRACK==="guide")return renderGuide();if(TRACK==="about")return renderAbout();if(TRACK==="cast")return renderCast();if(TRACK==="dash")return renderDash();if(TRACK==="practice")return renderPractice();renderRail();if(!TRACK)return renderHome();if(TRACK==="mock")return mockRender();if(TRACK==="ref")return refRender();return fullRender()}

/* ===== accounts ===== */
const ONLINE=location.protocol.startsWith("http")&&location.hostname!=="localhost";
async function api(path,opts={}){const r=await fetch(path,{credentials:"same-origin",headers:{"Content-Type":"application/json"},...opts});let j={};try{j=await r.json()}catch(e){}return {ok:r.ok,status:r.status,...j}}
async function listenPull(){if(!ONLINE||!SYNC||!COURSE)return;try{const me=await api("/api/auth?action=me");const r=me.progress&&me.progress[LKEY()];if(r&&(r.at||0)>(lget().at||0)&&NAR.audio.paused){store.set("c"+LKEY(),r);applyPrefs(r.prefs);if(TRACK==="book")renderBook();else handoffOffer()}else if(r&&r.prefs&&(r.prefs.at||0)>((lget().prefs||{}).at||0)){lput({prefs:r.prefs});applyPrefs(r.prefs)}}catch(e){}}
const DEVICE_KEYS=["halcyon.route","halcyon.rate","halcyon.auto2","halcyon.pdbg","halcyon.handoff.seen","halcyon.spoilers"];
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
function libWhere(w){return !w?"":w.t==="mock"?"Mock exam":w.t==="book"?`Audiobook, chapter ${w.n}`:`${w.t==="ref"?"Refresher":"Chapter"} ${w.n}`}
async function libGo(id){const w=libget().last[id];if(!(await useCourse(id)))return;if(!w){renderHome();renderRail();return}if(w.t==="mock")return openMock();if(w.t==="book"){renderBook();return top()}
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
   <dl class="facts"><dt>The exam</dt><dd>${esc(c.exam||"")}</dd><dt>Your mentor</dt><dd>${esc(c.mentorRole||MENTOR())}</dd><dt>Length</dt><dd>${esc((c.fullHours||"").replace(/^./,x=>x.toUpperCase()))}, ${c.planned||ready} chapters${c.planned&&ready<c.planned?` (${ready} ready now, more as they're written)`:""}</dd><dt>Each chapter</dt><dd>The story, ${esc(LESSON())}, the decisions, drills, and a quiz</dd>${c.mockShort?`<dt>Practice exam</dt><dd>${esc(c.mockShort)}</dd>`:""}</dl>
   <div class="bar"><button class="btn" id="aboutgo" type="button">${w?"Continue":"Start chapter 1"}</button><button class="btn ghost" id="aboutbook" type="button">🎧 Audiobook</button></div>
   ${signupBox("about:"+c.id)}
   <p class="prog marks">${esc(marksLine(c))}</p>`;wireSignup();
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
function renderLibrary(){setTimeout(ambSync,0);TRACK="library";CH=null;$("railgame").hidden=true;$("mockcard").hidden=true;setTimeout(navSync,0);
  const L=libget(),day=t=>new Date(t).toLocaleDateString("en-US",{month:"short",day:"numeric"});
  const card=c=>{const live=c.status==="live",w=L.last[c.id],pinned=L.pins.includes(c.id);let pr="";const lq=live?((store.get("c"+(c.base+903),null)||{}).labq||[]).length:0;if(live)pr=w?`${pinned?"Pinned · ":""}Last played ${day(w.at)} · ${libWhere(w)}`:(pinned?"Pinned · Not started":"Not started");
    return `<div class="libwrap">${live?`<button class="pin${pinned?" on":""}" type="button" data-pin="${c.id}" aria-pressed="${pinned}" aria-label="${pinned?"Unpin":"Pin"} ${esc(c.full_title||c.title)}" data-tip="${pinned?"Unpin":"Pin to the top of your library"}">${pinned?"★":"☆"}</button>`:""}${live?`<button class="linkbtn libabout" type="button" data-about="${c.id}">About this book</button>`:""}<button class="libcard ${live?"live":"soon"}" type="button" data-course="${c.id}" ${live?"":"disabled"}><span class="libart" aria-hidden="true">${({pmp:"🚀",cphims:"🏥",asep:"🛰️",gh300:"🤖",pilot:"✈️",cisa:"🔍"})[c.id]||"📘"}</span><span class="libtxt"><span class="prog">${esc(c.exam||"")}</span><b>${esc(c.full_title||c.title)}</b><span class="libstory">${esc(c.story||"")}</span><span class="libstate">${live?esc(pr):"In production"}${lq?`<span class="lw"> · 🧪 Labs waiting in ${lq} chapter${lq>1?"s":""}</span>`:""}</span></span></button></div>`};
  const shown=c=>c.listed!==false; // listed:false (courses.js) keeps a book off the Library; its routes and Coming next card still work
  const order=COURSES.filter(shown).sort((a,b)=>{const pa=L.pins.indexOf(a.id),pb=L.pins.indexOf(b.id);if(pa>=0||pb>=0)return (pa<0?1e9:pa)-(pb<0?1e9:pb);return ((L.last[b.id]||{}).at||0)-((L.last[a.id]||{}).at||0)});
  const recent=Object.entries(L.last).filter(([id])=>{const c=courseById(id);return c&&c.status==="live"&&shown(c)}).sort((a,b)=>b[1].at-a[1].at)[0];
  const cont=recent?`<button class="handsfree" type="button" id="libcont"><span>▶</span><span><b>Continue ${esc(courseById(recent[0]).full_title||courseById(recent[0]).title)}</b><span class="prog">${libWhere(recent[1])} · last played ${day(recent[1].at)}</span></span></button>`:"";
  $("page").innerHTML=`<div class="kicker">Library</div><h1>Your courses</h1><div class="story"><p>Each course is a choose-your-path story. You make the calls and the story changes with them, and there's an exam's worth of lessons and quizzes along the way. Tap a book to open it, or "About this book" to see what it's about.</p></div>${cont}<div class="libgrid">${order.map(card).join("")}</div>${window.HALCYON_UPCOMING?`<button class="upnext" type="button" id="libup"><span class="prog">Coming next</span><b>A seven book cyber thriller series, and more</b><span>New stories, rewrites, and the chapters on their way. No spoilers.</span><span class="go">See what's coming ›</span></button>`:""}`;
  if($("libup"))$("libup").onclick=()=>{renderUpcoming();top()};
  if($("libcont"))$("libcont").onclick=()=>libGo(recent[0]);
  $("page").querySelectorAll("[data-about]").forEach(b=>b.onclick=e=>{e.stopPropagation();renderAbout(b.dataset.about);top()});
  $("page").querySelectorAll("[data-pin]").forEach(b=>b.onclick=e=>{e.stopPropagation();const L2=libget(),id=b.dataset.pin;L2.pins=L2.pins.includes(id)?L2.pins.filter(x=>x!==id):[...L2.pins,id];libput(L2);renderLibrary()});
  $("page").querySelectorAll("[data-course]").forEach(b=>b.onclick=async()=>{if(await useCourse(b.dataset.course)){renderHome();renderRail();top()}})}
function resumeFrom(cur){const c=courseOfKey(cur||0);if(c.status==="live"&&c.id!==COURSE.id){useCourse(c.id).then(()=>resumeFrom(cur));return}cur=(cur||0)-COURSE.base;const FB=FULL_BASE();if(cur>=900)return openMock();if(cur>FB&&cur<FB+100){const L=TRACKS.full.list();if(L.find(c=>c.num===cur-FB))return openChapter("full",cur-FB)}else if(cur>=1&&cur<100){const L=TRACKS.ref.list();if(L.find(c=>c.num===cur))return openChapter("ref",cur)}renderHome()}
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
  document.addEventListener("click",e=>{const el=e.target.closest&&e.target.closest("[data-tip]");document.querySelectorAll(".tipopen").forEach(x=>{if(x!==el)x.classList.remove("tipopen")});if(el&&matchMedia("(hover: none)").matches){if(!el.classList.contains("tipopen")){el.classList.add("tipopen");setTimeout(()=>el.classList.remove("tipopen"),3500)}}},true);
  if($("castlink"))$("castlink").onclick=()=>{if(TRACK==="full"||TRACK==="ref")save();clearInterval(mockTimer);renderCast();top()};
  $("proglink").onclick=()=>{if(TRACK==="full"||TRACK==="ref")save();clearInterval(mockTimer);renderDash();top()};
  if($("liblink"))$("liblink").onclick=()=>{if(TRACK==="full"||TRACK==="ref")save();clearInterval(mockTimer);renderLibrary();top()};
  $("homelink").onclick=()=>{if(TRACK==="full"||TRACK==="ref")save();clearInterval(mockTimer);renderHome();renderRail()};
  if((COURSE.scripts||COURSE.labs)&&!COURSE._loaded)await useCourse(COURSE.id);
  if(!ONLINE){$("usercard").hidden=false;$("signout").hidden=true;$("username").textContent="";if(!(await routeTo(location.hash||store.get("route",""))))resumeFrom(store.get("cur",0));return}
  let me;try{me=await api("/api/auth?action=me")}catch(e){me={user:null}}
  if(!me.user){const inv=new URLSearchParams(location.search).get("invite");
    if(inv){const v=await api("/api/auth?action=invite&token="+encodeURIComponent(inv));if(v.valid)return renderAuth("signup",inv);
      document.querySelector(".rail").hidden=true;$("page").innerHTML=`<h1>This invite has expired</h1><div class="story"><p>Invite links work once. Ask Anthony for a new one, or <a href="/">sign in</a> if you already have an account.</p></div>`;return}
    return renderAuth("login")}
  clearLocal(true);Object.entries(me.progress||{}).forEach(([n,st])=>store.set("c"+n,st&&Object.keys(st).length?st:null));
  SYNC=(n,st)=>api("/api/progress",{method:"PUT",body:JSON.stringify({chapter:n,state:st})}).catch(()=>{});
  applyPrefs(lget().prefs);
  document.querySelector(".rail").hidden=false;$("usercard").hidden=false;$("username").textContent=me.user.name;$("adminlink").hidden=!me.user.admin;
  $("signout").onclick=async()=>{await api("/api/auth?action=logout",{method:"POST"});clearLocal();location.href="/"};
  if(!(await routeTo(location.hash||store.get("route",""))))resumeFrom(me.user.cur||0);
}
boot();
})();
