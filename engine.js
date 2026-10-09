(function(){
"use strict";
const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const store={get(k,d){try{const v=localStorage.getItem("halcyon."+k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem("halcyon."+k,JSON.stringify(v))}catch(e){}}};
const clamp=v=>Math.max(0,Math.min(100,v));
let DOMS=["People","Process","Business Environment"];
const METERS=[["trust","Team trust"],["conf","Stakeholder confidence"],["health","Delivery health"]];
const RUTH_LEADS={3:["That's the move.","Good. That's what I'd want from a flight director.","Exactly right."],1:["Close, but not quite.","Defensible. Not the best answer.","You're in the neighborhood."],0:["That one's going to cost you.","I'd have stopped you there.","Let's talk about that one."]};
let TASKNAMES={P1:"Develop a common vision",P2:"Manage conflicts",P3:"Lead the project team",P4:"Engage stakeholders",P5:"Align stakeholder expectations",P6:"Manage stakeholder expectations",P7:"Help ensure knowledge transfer",P8:"Plan and manage communication",R1:"Integrated plan and plan delivery",R2:"Develop and manage scope",R3:"Value-based delivery",R4:"Plan and manage resources",R5:"Plan and manage procurement",R6:"Plan and manage finance",R7:"Plan and optimize quality",R8:"Plan and manage schedule",R9:"Evaluate project status",R10:"Manage project closure",B1:"Project governance",B2:"Project compliance",B3:"Manage and control changes",B4:"Remove impediments, manage issues",B5:"Plan and manage risk",B6:"Continuous improvement",B7:"Support organizational change",B8:"External business environment"};
let BASE_CAST=[["Sam Okafor","You. Infrastructure ops manager, former Air Force maintenance NCO."],["Ruth Calder","Board member, retired NASA flight director. Your mentor."],["Elena Vasquez","CEO and founder."],["Grant Mercer","Chief Revenue Officer. Closed the Cascade deal."],["Lena Cho","CTO. Brilliant, hates conflict."],["Theo Lindqvist","ML platform lead. Everything runs through him."],["Dr. Raymond Ochoa","CIO, Cascade Valley Health."]];
let FULL_CAST_EXTRA=[["Dana Okafor","Sam's wife. High school chemistry teacher. Notices when he isn't sleeping."],["Priya Shah","Junior engineer. Shadows Theo."]];

const TRACKS={
  ref:{id:"ref",name:"Refresher",blurb:"6 chapters, about 2.5 hours. Ten decisions per chapter with mentor debriefs. Best for a quick review.",list:()=> (DATA().ref||[]).filter(c=>c&&c.scenes).sort((a,b)=>a.num-b.num),key:n=>n},
  full:{id:"full",name:"Full Course",blurb:"15 chapters, about 15 to 20 hours. Lessons, decisions, math drills, exercises, and a quiz every chapter. Learn the PMP from the ground up.",list:()=> (DATA().full||[]).filter(c=>c&&c.scenes).sort((a,b)=>a.num-b.num),key:n=>100+n},
  mock:{id:"mock",name:"Mock Exam",blurb:"180 questions in 240 minutes with two breaks, weighted like the real exam. Practice mode gives feedback as you go.",key:()=>900}
};
let MOCK_KEY=900;const PMP_META={DOMS,TASKNAMES,BASE_CAST,FULL_CAST_EXTRA};
/* ===== courses ===== */
const COURSES=window.HALCYON_COURSES||[{id:"pmp",title:"PMP",base:0,root:"",status:"live",taskDomain:{P:"People",R:"Process",B:"Business Environment"}}];
let COURSE=COURSES[0];
function courseById(id){return COURSES.find(c=>c.id===id)}
function courseOfKey(k){return COURSES.filter(c=>k>=c.base).sort((a,b)=>b.base-a.base)[0]||COURSES[0]}
function DATA(){if(COURSE.id==="pmp")return{ref:window.HALCYON,full:window.HALCYON_FULL,mock:window.HALCYON_MOCK,cast:window.HALCYON_CAST};return (window.HALCYON_DATA||{})[COURSE.id]||{}}
function MENTOR(){return COURSE.mentor||"Ruth"}
function LESSON(){return COURSE.lessonName||"Ruth's whiteboard"}
function R(p){return /^(https?:|\/)/.test(p)?p:COURSE.root+p}
function taskDomain(t){const TD=COURSE.taskDomain||{};return TD[t]||TD[t.split(".")[0]]||TD[t[0]]||DOMS[0]}
function loadScripts(list){return Promise.all(list.map(src=>new Promise(ok=>{if(document.querySelector(`script[data-c="${src}"]`))return ok();const el=document.createElement("script");el.src=src;el.dataset.c=src;el.onload=ok;el.onerror=ok;document.head.appendChild(el)})))}
async function useCourse(id){const c=courseById(id);if(!c||c.status!=="live")return false;if(c.scripts&&!c._loaded){await loadScripts(c.scripts.map(x=>c.root+x));c._loaded=true}
  const changed=COURSE.id!==c.id;COURSE=c;store.set("course",id);
  const meta=c.id==="pmp"?PMP_META:(((window.HALCYON_DATA||{})[id]||{}).meta||{});
  DOMS=meta.DOMS||PMP_META.DOMS;TASKNAMES=meta.TASKNAMES||{};BASE_CAST=meta.BASE_CAST||[];FULL_CAST_EXTRA=meta.FULL_CAST_EXTRA||[];MOCK_KEY=c.base+900;
  if(changed){BOOK=null;NAR.timings={};try{NAR.audio.pause()}catch(e){}NAR.page=null;NAR.listening=false;buildOrders()}return true}

/* ===== state ===== */
let TRACK=null,CH=null,S=null,SYNC=null,syncTimer=null;
function freshRef(){return{step:-1,picks:{},m:{trust:50,conf:50,health:50},score:0,flags:{},dom:Object.fromEntries(DOMS.map(d=>[d,[0,0]]))}}
function freshFull(){return{pos:0,max:0,picks:{},m:{trust:50,conf:50,health:50},score:0,flags:{},dom:Object.fromEntries(DOMS.map(d=>[d,[0,0]])),drills:{},ex:null,quiz:null}}
function keyOf(tr,n){return COURSE.base+TRACKS[tr].key(n)}
function load(tr,n){return store.get("c"+keyOf(tr,n),null)}
function persist(tr,n,st){store.set("c"+keyOf(tr,n),st);if(SYNC){const k=keyOf(tr,n),copy=JSON.parse(JSON.stringify(st));clearTimeout(syncTimer);syncTimer=setTimeout(()=>SYNC(k,copy),400)}}
function save(){if(TRACK==="mock"){persistMock();return}persist(TRACK,CH.num,S);store.set("cur",keyOf(TRACK,CH.num));store.set("lastplace."+COURSE.id,{t:TRACK,n:CH.num})}
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
  if(a.type==="doc")return `<div class="prop pdoc"><div class="ph"><b>${esc(a.title||"Document")}</b></div><div class="pb">${body}</div></div>`;
  if(a.type==="chart"){const num=x=>(x||"").split(",").map(Number).filter(v=>!isNaN(v));
    if(a.kind==="evm"){const pv=num(a.pv),ev=num(a.ev),ac=num(a.ac);const all=[...pv,...ev,...ac];const mx=Math.max(...all,1),n=Math.max(pv.length,ev.length,ac.length,2);
      const path=(arr)=>arr.map((v,i)=>`${i?"L":"M"}${40+i*(520/(n-1))} ${210-v/mx*180}`).join(" ");
      return `<div class="prop pchart"><div class="ph"><b>${esc(a.title||"Earned value")}</b></div><svg viewBox="0 0 600 240" role="img" aria-label="${esc(a.title||"chart")}"><path d="M40 210H580M40 20V210" stroke="currentColor" opacity=".3"/><path d="${path(pv)}" class="lpv"/><path d="${path(ev)}" class="lev"/><path d="${path(ac)}" class="lac"/></svg><div class="legend"><span class="kpv">Planned value</span><span class="kev">Earned value</span><span class="kac">Actual cost</span></div>${body?`<div class="pb">${body}</div>`:""}</div>`}
    const labels=(a.labels||"").split(","),vals=num(a.values),mx=Math.max(...vals,1);
    return `<div class="prop pchart"><div class="ph"><b>${esc(a.title||"Chart")}</b></div><div class="bars">${vals.map((v,i)=>`<div class="barrow"><span>${esc(labels[i]||"")}</span><span class="bt"><span style="width:${v/mx*100}%"></span></span><span class="num">${v}</span></div>`).join("")}</div>${body?`<div class="pb">${body}</div>`:""}</div>`}
  return `<p>${body}</p>`}
function paras(arr){return `<div class="story">${arr.map(p=>/^<prop\s/.test(p)?propHTML(p):`<p>${p}</p>`).join("")}</div>`}
function videoCard(v,label){if(!v||!v[0])return "";return `<div class="video"><div class="vhead"><span class="tag dom">${label}</span><b>${esc(v[1])}</b><span class="prog">${esc(v[2])} · ${esc(v[3])}</span></div><div class="vframe"><button type="button" data-vid="${esc(v[0])}" aria-label="Play video: ${esc(v[1])}" style="background-image:url('https://i.ytimg.com/vi/${esc(v[0])}/hqdefault.jpg')"><span class="play">▶ Play here</span></button></div></div>`}
function wireVideos(){$("page").querySelectorAll("[data-vid]").forEach(b=>b.onclick=()=>{const f=document.createElement("iframe");f.src="https://www.youtube-nocookie.com/embed/"+b.dataset.vid+"?autoplay=1&rel=0";f.title=b.getAttribute("aria-label");f.allow="autoplay; encrypted-media; picture-in-picture; fullscreen";f.allowFullscreen=true;b.replaceWith(f)})}
function episodeCard(c){if(!c.episode)return "";return `<div class="episode"><div class="prog">Whole chapter as one audio file · ${esc(c.episode.len)}</div><p class="prog" style="margin:4px 0 0">For the car or the gym. In the app, use the Listen button at the bottom of the screen instead.</p><audio controls preload="metadata" src="${esc(R(c.episode.src))}" onerror="this.closest('.episode').hidden=true"></audio></div>`}
function top(){window.scrollTo({top:0,behavior:"smooth"})}
function applyPick(st,sc,i,j){const o=sc.opts[j];st.picks[i]=j;st.score+=o.s;for(const k in (o.d||{}))st.m[k]=clamp(st.m[k]+o.d[k]);st.dom[sc.domain][0]+=o.s;st.dom[sc.domain][1]+=3;if(o.flag)st.flags[o.flag]=true;if(TRACK==="ref"&&CH.num===1&&i===0&&j===1)st.flags.allhands=true}
function sceneHTML(sc,i,n,picked,stateForText){
  const SM=TRACK==="full"&&STORY();let h=`<div class="kicker">Chapter ${CH.num} · ${SM?"What do you do?":`Decision ${i+1} of ${n}${sc.task&&TASKNAMES[sc.task]?` · ${sc.task} ${TASKNAMES[sc.task]}`:""}`}</div><h2>${esc(sc.title||sc.task)}</h2>${paras(sc.text(stateForText,allStates(),globalFlags()))}<div class="choices" role="group" aria-label="Choices">`;
  order(sc.id,sc.opts.length).forEach((j,pos)=>{const o=sc.opts[j];const cls=picked===undefined?"":(j===picked?"picked":"")+(o.best&&picked!==undefined?" best":"");h+=`<button class="choice ${cls}" data-j="${j}" type="button"${picked!==undefined?" disabled":""}><span class="k">${"ABCD"[pos]}</span><span>${o.t}</span></button>`});
  h+=`</div>`;
  if(picked!==undefined){const o=sc.opts[picked],best=sc.opts.find(x=>x.best),lead=RUTH_LEADS[o.s][i%3];
    const ruth=`<div class="mentor"><div class="who">Ruth Calder</div>${paras([lead+" "+o.why])}${o.best?"":paras(["<b>The best answer:</b> "+best.t+" "+best.why])}<div class="tags"><span class="tag dom">${sc.domain}</span><span class="tag">${esc(sc.task&&TASKNAMES[sc.task]?sc.task+" "+TASKNAMES[sc.task]:sc.task)}</span></div></div>`;
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
   <div class="end-grid"><div class="card"><h3>Score</h3><div class="big">${S.score}/${n*3}</div></div>${METERS.map(([k,l])=>`<div class="card"><h3>${l}</h3><div class="big">${S.m[k]}</div></div>`).join("")}</div>
   <h2>What to study next</h2><div class="story"><p>Your weakest area this chapter was <b>${weak[0]}</b> at ${Math.round(weak[1]*100)} percent.${missed.length?" The decisions to revisit:":" You found the best answer every time."}</p></div>
   ${missed.length?`<ul class="story" style="padding-left:22px">${missed.map(([sc])=>`<li>${sc.task} (${sc.domain})</li>`).join("")}</ul>`:""}
   ${videoCard(CH.deeper,"Go deeper")}${episodeCard(CH)}
   <div class="bar">${nxt?`<button class="btn" id="nextch" type="button">Chapter ${nxt.num}: ${nxt.title}</button>`:""}<button class="btn ghost" id="replay" type="button">Replay chapter ${CH.num}</button></div>`;
  wireVideos();$("replay").onclick=()=>{S=freshRef();save();render();top()};if(nxt)$("nextch").onclick=()=>openChapter("ref",nxt.num);
}

/* ===== full course track ===== */
const STORY=()=>store.get("storymode",false);
function steps(c){if(STORY()){const out=[{k:"open"}];c.scenes.forEach((sc,i)=>out.push({k:"scene",i}));out.push({k:"end"},{k:"lesson"});(c.drills||[]).forEach((d,j)=>out.push({k:"drill",j}));if(c.exercise)out.push({k:"exercise"});out.push({k:"quiz"});return out}
  const out=[{k:"open"},{k:"lesson"}];c.scenes.forEach((sc,i)=>{out.push({k:"scene",i});(c.drills||[]).forEach((d,j)=>{if(d.after===sc.id)out.push({k:"drill",j})});if(c.exercise&&c.exercise.after===sc.id)out.push({k:"exercise"})});out.push({k:"quiz"},{k:"end"});return out}
function setStoryMode(on){const keyOf=st=>st?st.k+(st.i??st.j??""):"";let cur=null;if(TRACK==="full"&&CH&&S)cur=keyOf(steps(CH)[S.pos]);store.set("storymode",on);
  if(cur!==null){const ns=steps(CH);const idx=ns.findIndex(x=>keyOf(x)===cur);S.pos=Math.max(0,idx);S.max=Math.max(S.max||0,S.pos);save()}render()}
function fullGo(p){const L=steps(CH);if(p>=L.length)p=L.findIndex(x=>x.k==="end");S.pos=p;S.max=Math.max(S.max||0,p);save();render();top()}
function fullRender(){
  const st=steps(CH),cur=st[Math.min(S.pos,st.length-1)];
  const phase=k=>({open:"Story",lesson:"Lesson",scene:"Decisions",drill:"Decisions",exercise:"Decisions",quiz:"Quiz",end:"Debrief"})[k];
  const curPhase=STORY()?({open:"Story",scene:"Story",end:"Story",lesson:MENTOR()+"'s notes",drill:MENTOR()+"'s notes",exercise:MENTOR()+"'s notes",quiz:MENTOR()+"'s notes"})[cur.k]:phase(cur.k);const PH=STORY()?["Story",MENTOR()+"'s notes"]:["Story","Lesson","Decisions","Quiz","Debrief"];
  const chmap=`<ol class="chmap" aria-label="Chapter steps">${PH.map((p,i)=>{const idx=PH.indexOf(curPhase);return `<li class="${p===curPhase?"now":i<idx?"done":""}">${p}</li>`}).join("")}</ol>`;
  const nav=chmap+`<div class="stepnav">${st.map((x,i)=>`<button type="button" class="sdot ${i===S.pos?"now":""} ${i<=S.max?"seen":""}" data-p="${i}" title="${x.k}" ${i>S.max?"disabled":""}></button>`).join("")}</div>`;
  let h=nav;
  if(cur.k==="open"){
    h+=chapterArt()+`<div class="kicker">${esc(CH.part)} · Chapter ${CH.num} · ${esc(CH.weeks)}</div><h1>${CH.title}</h1>${STORY()?"":`<div class="tags" style="margin-bottom:12px">${(CH.tasks||[]).map(t=>`<span class="tag dom">${t} ${TASKNAMES[t]||""}</span>`).join("")}</div>`}${paras(CH.opening.map(p=>p))}${episodeCard(CH)}<div class="bar"><button class="btn" id="fnext" type="button">${STORY()?"Continue the story":"Next: the lesson"}</button></div>`;
  }else if(cur.k==="lesson"){
    const L=CH.lesson;h+=`<div class="kicker">Chapter ${CH.num} · The lesson · ${LESSON()}</div><h1>${esc(L.title)}</h1><p class="lessonintro">Ruth Calder is Sam's mentor, a retired NASA flight director on Halcyon's board. Her whiteboard is the lesson: the PMP ideas behind this chapter, before you make the decisions.</p>`+L.sections.map(s=>`<section class="lesson"><h2>${esc(s.h)}</h2>${paras(s.body)}${s.terms&&s.terms.length?`<dl class="terms">${s.terms.map(([t,d])=>`<dt>${t}</dt><dd>${d}</dd>`).join("")}</dl>`:""}${s.exam?`<div class="examtip"><b>How the exam asks it.</b> ${s.exam}</div>`:""}</section>`).join("")+videoCard(L.video,"Lesson video")+`<div class="bar"><button class="btn" id="fnext" type="button">Next: the decisions</button></div>`;
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
  }else if(cur.k==="quiz"){
    const q=CH.quiz,ans=S.quiz;
    h+=`<div class="kicker">Chapter ${CH.num} · Exam-style quiz</div><h2>${q.length} questions</h2><p class="prog">Answer them all, then check. Written like the real exam.</p><form id="quizform" novalidate>${q.map((x,qi)=>{const ord=order("q"+CH.num+"_"+qi,x.opts.length);return `<fieldset class="qitem"><legend><span class="qn">${qi+1}.</span> ${x.q}</legend>${ord.map((oi,pos)=>{const chosen=ans&&ans.v[qi]===oi;const right=ans&&oi===x.a;return `<label class="qopt ${ans?(right?"qright":chosen?"qwrong":""):""}"><input type="radio" name="q${qi}" value="${oi}" ${ans?"disabled":""} ${chosen?"checked":""}><span class="k">${"ABCD"[pos]}</span> ${x.opts[oi]}</label>`}).join("")}${ans?`<p class="qwhy"><b>${ans.v[qi]===x.a?"Correct.":"Not quite."}</b> ${x.why} <span class="tag">${x.task} ${TASKNAMES[x.task]||""}</span></p>`:""}</fieldset>`}).join("")}${ans?"":`<div id="qerr"></div><button class="btn" type="submit">Check my answers</button>`}</form>${ans?`<div class="callout"><b>Quiz score: ${ans.right} of ${q.length}</b> (${Math.round(ans.right/q.length*100)} percent).</div><div class="bar"><button class="btn" id="fnext" type="button">Finish the chapter</button><button class="btn ghost" id="qretry" type="button">Retake the quiz</button></div>`:""}`;
  }else{
    const n=CH.scenes.length,nxt=chapters().find(c=>c.num===CH.num+1);
    const dr=(CH.drills||[]).length,drOk=Object.values(S.drills||{}).reduce((a,x)=>a+(x.ok.every(Boolean)?1:0),0);
    const weak=DOMS.map(d=>[d,S.dom[d][1]?S.dom[d][0]/S.dom[d][1]:1]).sort((a,b)=>a[1]-b[1])[0];
    h+=`<div class="kicker">${esc(CH.part)} · Chapter ${CH.num} · Debrief</div><h1>${CH.title}</h1>${paras(CH.closing(S,allStates(),globalFlags()))}
     <div class="end-grid"><div class="card"><h3>Decisions</h3><div class="big">${S.score}/${n*3}</div></div><div class="card"><h3>Quiz</h3><div class="big">${S.quiz?S.quiz.right+"/"+CH.quiz.length:"·"}</div></div>${dr?`<div class="card"><h3>Drills</h3><div class="big">${drOk}/${dr}</div></div>`:""}${METERS.map(([k,l])=>`<div class="card"><h3>${l}</h3><div class="big">${S.m[k]}</div></div>`).join("")}</div>
     <div class="story"><p>Weakest area this chapter: <b>${weak[0]}</b> at ${Math.round(weak[1]*100)} percent, counting decisions and quiz together.</p></div>
     ${episodeCard(CH)}<div class="bar">${STORY()&&S.pos<steps(CH).length-1?`<button class="btn ghost" id="fnext" type="button">${MENTOR()}'s notes (optional)</button>`:""}${nxt?`<button class="btn" id="nextch" type="button">Chapter ${nxt.num}: ${nxt.title}</button>`:`<button class="btn" id="tomock" type="button">Take the mock exam</button>`}<button class="btn ghost" id="replay" type="button">Replay chapter ${CH.num}</button></div>`;
  }
  $("page").innerHTML=h;wireVideos();
  $("page").querySelectorAll(".sdot[data-p]").forEach(b=>b.onclick=()=>fullGo(+b.dataset.p));
  const nx=$("fnext");if(nx)nx.onclick=()=>fullGo(S.pos+1);
  if(cur.k==="scene"){const i=cur.i,sc=CH.scenes[i];
    if(S.picks[i]===undefined)$("page").querySelectorAll(".choice").forEach(b=>b.onclick=()=>{applyPick(S,sc,i,+b.dataset.j);save();render();const o=document.querySelector(".outcome");if(o)o.scrollIntoView({behavior:"smooth",block:"start"})});
    else{$("next").onclick=()=>fullGo(S.pos+1);$("redo").onclick=()=>{const p={...S.picks};delete p[i];const keep={pos:S.pos,max:S.max,drills:S.drills,ex:S.ex,quiz:S.quiz};const st=freshFull();Object.keys(p).map(Number).sort((a,b)=>a-b).forEach(k=>applyPick(st,CH.scenes[k],k,p[k]));Object.assign(st,keep);if(st.quiz)st.quiz.v.forEach((v,qi)=>{const x=CH.quiz[qi];st.dom[x.domain][1]+=3;if(v===x.a)st.dom[x.domain][0]+=3});S=st;save();render();top()}}}
  if(cur.k==="drill"){const d=CH.drills[cur.j];const f=$("drillform");if(f)f.onsubmit=e=>{e.preventDefault();const vals=d.fields.map((_,fi)=>$("df"+fi).value.replace(/[$,%\s]/g,""));const ok=d.fields.map((fl,fi)=>{const v=parseFloat(vals[fi]);return !isNaN(v)&&Math.abs(v-fl.answer)<=(fl.tol??0.01)});S.drills[cur.j]={vals,ok};save();render()};const r=$("dretry");if(r)r.onclick=()=>{delete S.drills[cur.j];save();render()}}
  if(cur.k==="exercise"){const e=CH.exercise;const f=$("exform");if(f)f.onsubmit=ev=>{ev.preventDefault();const v=e.items.map((_,ii)=>{const x=$("ex"+ii).value;return x===""?-1:+x});S.ex={v,right:v.filter((x,ii)=>x===e.items[ii].answer).length};save();render()};const r=$("exretry");if(r)r.onclick=()=>{S.ex=null;save();render()}}
  if(cur.k==="quiz"){const q=CH.quiz;const f=$("quizform");if(f)f.onsubmit=ev=>{ev.preventDefault();const v=q.map((_,qi)=>{const c=document.querySelector(`input[name=q${qi}]:checked`);return c?+c.value:-1});const miss=v.filter(x=>x<0).length;if(miss&&!confirm(`${miss} unanswered. Check anyway?`))return;S.quiz={v,right:v.filter((x,qi)=>x===q[qi].a).length};v.forEach((x,qi)=>{const d=q[qi].domain;S.dom[d][1]+=3;if(x===q[qi].a)S.dom[d][0]+=3});save();render();top()};const r=$("qretry");if(r)r.onclick=()=>{S.quiz.v.forEach((x,qi)=>{const d=q[qi].domain;S.dom[d][1]-=3;if(x===q[qi].a)S.dom[d][0]-=3});S.quiz=null;save();render();top()}}
  const nc=$("nextch");if(nc){const nxt=chapters().find(c=>c.num===CH.num+1);nc.onclick=()=>openChapter("full",nxt.num)}
  const tm=$("tomock");if(tm)tm.onclick=()=>openMock();
  const rp=$("replay");if(rp)rp.onclick=()=>{if(confirm(`Replay chapter ${CH.num} from the start? This clears its decisions, drills, and quiz.`)){S=freshFull();save();render();top()}};
}

/* ===== mock exam ===== */
let MS=null,mockTimer=null;
function MOCK_LIMIT(){return (COURSE.mockMinutes||240)*60}
function mockQuestions(){const all=[];(DATA().mock||[]).forEach(p=>p.questions.forEach((q,i)=>all.push({...q,id:p.part.slice(0,3)+i})));return all}
function freshMock(mode){const qs=mockQuestions();const seed=Date.now()%100000;const ord=order("mock"+seed,qs.length).map(i=>qs[i].id);return{mode,order:ord,ans:{},flagged:{},cur:0,elapsed:0,breaksTaken:[],onBreak:null,submitted:false,startedAt:new Date().toISOString()}}
function persistMock(){if(MS&&MS.order&&!MS.submitted)store.set("lastplace."+COURSE.id,{t:"mock"});store.set("c"+MOCK_KEY,MS);store.set("cur",MOCK_KEY);if(SYNC){const copy=JSON.parse(JSON.stringify(MS));clearTimeout(syncTimer);syncTimer=setTimeout(()=>SYNC(MOCK_KEY,copy),600)}}
function openMock(){TRACK="mock";store.set("track","mock");MS=store.get("c"+MOCK_KEY,null);render();top()}
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
   <div class="story"><p>PMI doesn't publish a passing score. Many instructors treat 75 percent or better on full-length practice exams as a sign you're ready. ${MS.mode==="exam"?`Time used: ${fmtTime(MS.elapsed)}.`:""}</p></div>
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
function practicePool(t){const pool=[];TRACKS.full.list().forEach(c=>c.quiz.forEach((q,i)=>pool.push({...q,src:`Chapter ${c.num} quiz`,pid:`f${c.num}q${i}`})));mockQuestions().forEach(q=>pool.push({...q,src:"Mock bank",pid:"m"+q.id}));return t==="mixed"?pool:pool.filter(q=>q.task===t)}
function startPractice(t){const pool=practicePool(t);if(!pool.length)return;const seed=Date.now()%9973;const pick=order("pr"+t+seed,pool.length).slice(0,10).map(i=>pool[i]);PR={task:t,qs:pick,v:null};TRACK="practice";renderPractice();top()}
function renderPractice(){setTimeout(navSync,0);
  $("railgame").hidden=true;$("mockcard").hidden=true;const {task,qs,v}=PR;
  $("page").innerHTML=`<div class="kicker">Practice set</div><h1>${task==="mixed"?"Mixed practice":`${task} ${TASKNAMES[task]}`}</h1><p class="prog">${qs.length} questions from the chapter quizzes and the mock bank. Results feed your progress map.</p>
   <form id="prform" novalidate>${qs.map((x,qi)=>{const ord=order(x.pid.startsWith("m")?"mq"+x.pid.slice(1):x.pid.replace(/^f(\d+)q(\d+)$/,"q$1_$2"),x.opts.length);return `<fieldset class="qitem"><legend><span class="qn">${qi+1}.</span> ${x.q}</legend>${ord.map((oi,pos)=>`<label class="qopt ${v?(oi===x.a?"qright":v[qi]===oi?"qwrong":""):""}"><input type="radio" name="p${qi}" value="${oi}" ${v?"disabled":""} ${v&&v[qi]===oi?"checked":""}><span class="k">${"ABCD"[pos]}</span> ${x.opts[oi]}</label>`).join("")}${v?`<p class="qwhy"><b>${v[qi]===x.a?"Correct.":"Not quite."}</b> ${x.why} <span class="tag">${x.task} · ${x.src}</span></p>`:""}</fieldset>`}).join("")}${v?"":`<button class="btn" type="submit">Check my answers</button>`}</form>
   ${v?`<div class="callout"><b>${v.filter((x,i)=>x===qs[i].a).length} of ${qs.length} correct.</b></div><div class="bar"><button class="btn" id="again" type="button">Another set</button><button class="btn ghost" id="todash" type="button">Back to progress</button></div>`:""}`;
  const f=$("prform");if(f)f.onsubmit=e=>{e.preventDefault();PR.v=qs.map((_,qi)=>{const c=document.querySelector(`input[name=p${qi}]:checked`);return c?+c.value:-1});
    const P=store.get("c"+(COURSE.base+902),null)||{tasks:{}};qs.forEach((x,qi)=>{if(PR.v[qi]<0)return;P.tasks[x.task]=P.tasks[x.task]||[0,0];P.tasks[x.task][1]++;if(PR.v[qi]===x.a)P.tasks[x.task][0]++});store.set("c"+(COURSE.base+902),P);if(SYNC)SYNC(COURSE.base+902,P);renderPractice();top()};
  const a=$("again");if(a)a.onclick=()=>startPractice(task);const d=$("todash");if(d)d.onclick=()=>renderDash();
}


/* ===== page narration: sticky player, per-page clips, word highlight ===== */
const NAR={car:false,audio:new Audio(),timings:{},key:null,page:null,listening:false,auto:store.get("auto2",false),rate:store.get("rate",1),map:[],words:[],raf:0,cur:-1};
NAR.audio.preload="auto";
function narKey(){if(!CH||(TRACK!=="full"&&TRACK!=="ref"))return null;return (TRACK==="ref"?"r":"f")+CH.num}
async function narTimings(key){if(NAR.timings[key])return NAR.timings[key];try{const r=await fetch(R(`audio/pages/${key}/timings.json`),{cache:"no-cache"});if(r.ok)NAR.timings[key]=await r.json()}catch(e){}return NAR.timings[key]||null}
function narPageId(){
  if(TRACK==="ref"){if(S.step<0)return["open",".story p"];if(S.step>=CH.scenes.length)return["end",".story p"];const i=S.step,p=S.picks[i];return p===undefined?["s"+i,".story p, .choice span:not(.k)"]:[`o${i}_${p}`,".outcome .story p"]}
  const st=steps(CH)[Math.min(S.pos,steps(CH).length-1)];
  if(st.k==="open")return["open",".story p"];if(st.k==="lesson")return["lesson",".lesson h2, .lesson .story p, .lesson .examtip"];if(st.k==="end")return["end",".story p"];
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
function narHighlight(){if(NAR.page==="book"){const pr=$("narprog");if(pr&&NAR.audio.duration)pr.style.width=(NAR.audio.currentTime/NAR.audio.duration*100)+"%";if(Math.round(NAR.audio.currentTime)%5===0)store.set(`bookpos.${NAR.book.ed}.${NAR.book.n}`,NAR.audio.currentTime);if(!NAR.audio.paused)NAR.raf=requestAnimationFrame(narHighlight);return}if(NAR.page==="car"){const pr=$("narprog");if(pr&&NAR.audio.duration)pr.style.width=(NAR.audio.currentTime/NAR.audio.duration*100)+"%";if(Math.round(NAR.audio.currentTime)%5===0)store.set("carpos."+NAR.key,NAR.audio.currentTime);if(!NAR.audio.paused)NAR.raf=requestAnimationFrame(narHighlight);return}const T=NAR.timings[NAR.key];const t=NAR.audio.currentTime;const W=T&&T[NAR.page]?T[NAR.page].w:[];
  let lo=0,hi=W.length-1,idx=-1;while(lo<=hi){const mid=(lo+hi)>>1;if(W[mid][1]<=t){idx=mid;lo=mid+1}else hi=mid-1}
  const di=idx>=0?NAR.map[idx]:null;if(di!==NAR.cur){if(NAR.cur!=null&&NAR.words[NAR.cur])NAR.words[NAR.cur].classList.remove("hl");if(di!=null&&NAR.words[di]){const w=NAR.words[di];w.classList.add("hl");const r=w.getBoundingClientRect();if(r.top<70||r.bottom>innerHeight-110)w.scrollIntoView({block:"center",behavior:"smooth"})}NAR.cur=di}
  const pr=$("narprog");if(pr&&NAR.audio.duration)pr.style.width=(NAR.audio.currentTime/NAR.audio.duration*100)+"%";
  if(!NAR.audio.paused)NAR.raf=requestAnimationFrame(narHighlight)}
function narUI(){const b=$("narbar");if(!b)return;const has=NAR.page==="car"||NAR.page==="book"||!!(NAR.key&&NAR.timings[NAR.key]&&NAR.page&&NAR.timings[NAR.key][NAR.page]);b.hidden=!has;document.body.classList.toggle("withbar",has);if(!has)return;
  $("narplay").textContent=NAR.audio.paused?"▶ Listen":"❚❚ Pause";$("narlabel").textContent=NAR.page==="book"?`Hands-free · Ch ${NAR.book.n} · ${NAR.book.ed==="story"?"Story only":"Story + lessons"}`:NAR.page==="car"?"Car mode · whole chapter":({open:"Opening",lesson:LESSON(),end:"Chapter ending"}[NAR.page]||(NAR.page[0]==="s"?"Decision":"Outcome"));}
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
  $("page").querySelectorAll(".episode").forEach(e=>e.hidden=true);NAR.words=wrapWords(sel);NAR.map=alignWords(T[pid].w,NAR.words);
  NAR.audio.src=R(`audio/pages/${key}/${pid}.mp3`);NAR.audio.playbackRate=NAR.rate;narUI();
  if(NAR.listening){NAR.audio.play().then(()=>{narUI();narHighlight()}).catch(()=>{NAR.listening=false;narUI()})}
}
NAR.audio.addEventListener("ended",()=>{if(NAR.page==="book"){const {ed,n}=NAR.book;store.set(`bookdone.${COURSE.id}.${ed}.${n}`,true);store.set(`bookpos.${COURSE.id}.${ed}.${n}`,0);const nx=Object.keys(BOOK.full).map(Number).filter(k=>k>n&&BOOK.full[k][ed]).sort((a,b)=>a-b)[0];if(nx)bookPlay(ed,nx);else{NAR.listening=false;narUI()}if(TRACK==="book")renderBook();return}if(NAR.page==="car"){NAR.listening=false;narUI();return}cancelAnimationFrame(NAR.raf);if(NAR.cur!=null&&NAR.words[NAR.cur])NAR.words[NAR.cur].classList.remove("hl");narUI();
  if(!NAR.auto)return;const pid=NAR.page||"";
  if(pid==="open"||pid==="lesson"){const b=$("fnext")||$("go");if(b)setTimeout(()=>b.click(),700)}
  else if(pid[0]==="o"){const b=$("next");if(b)setTimeout(()=>b.click(),900)}
  else NAR.listening=pid[0]==="s"?NAR.listening:false;});
function foldInit(){document.querySelectorAll("details.fold").forEach(d=>{const k="fold."+d.id;const v=store.get(k,null);if(v!==null)d.open=v;d.addEventListener("toggle",()=>store.set(k,d.open))})}
foldInit();
function narInit(){
  const bar=document.createElement("div");bar.id="narbar";bar.hidden=true;bar.innerHTML=`<div class="nartrack"><span id="narprog"></span></div><div class="narrow"><button class="btn" id="narplay" type="button">▶ Listen</button><span class="prog" id="narlabel"></span><label class="prog" for="narrate">Speed <select id="narrate">${[0.8,0.9,1,1.1,1.25,1.5].map(r=>`<option value="${r}" ${r==NAR.rate?"selected":""}>${r}x</option>`).join("")}</select></label><label class="chk prog" for="narauto"><input type="checkbox" id="narauto" ${NAR.auto?"checked":""}> Keep going</label><button class="btn small ghost" id="gohf" type="button">🎧 Go hands-free</button></div>`;
  document.body.appendChild(bar);
  $("narplay").onclick=()=>{if(NAR.audio.paused){NAR.listening=true;if(NAR.audio.ended)NAR.audio.currentTime=0;NAR.audio.play().then(()=>{narUI();narHighlight()})}else{NAR.listening=false;NAR.audio.pause();narUI()}};
  $("narrate").onchange=e=>{NAR.rate=+e.target.value;NAR.audio.playbackRate=NAR.rate;store.set("rate",NAR.rate)};
  $("narauto").onchange=e=>{NAR.auto=e.target.checked;store.set("auto2",NAR.auto)};
  $("gohf").onclick=async()=>{if(TRACK==="full"||TRACK==="ref")save();const n=TRACK==="full"&&CH?CH.num:1;const B=await bookManifest();const ed=store.get("bookEd."+COURSE.id,"story");const have=Object.keys(B.full).map(Number).filter(k=>B.full[k][ed]).sort((a,b)=>a-b);renderBook();top();if(have.length)bookPlay(ed,have.includes(n)?n:(have.find(k=>k>=n)||have[have.length-1]))};
  NAR.audio.addEventListener("pause",narUI);
}
narInit();window.__nar=NAR;
/* lock screen and car controls */
function narMedia(){if(!("mediaSession" in navigator))return;if(NAR.page==="book"){const c=TRACKS.full.list().find(x=>x.num===NAR.book.n);try{navigator.mediaSession.metadata=new MediaMetadata({title:`Chapter ${NAR.book.n}: ${c?c.title:""}`,artist:COURSE.full_title||"The Halcyon Launch",album:NAR.book.ed==="story"?"Hands-free, story only":"Hands-free, story + lessons",artwork:[{src:"/icons/icon-512.png",sizes:"512x512",type:"image/png"}]})}catch(e){}return}if(!CH)return;try{navigator.mediaSession.metadata=new MediaMetadata({title:`${CH.title}: ${$("narlabel")?$("narlabel").textContent:""}`,artist:COURSE.full_title||"The Halcyon Launch",album:TRACK==="full"?"Full Course":"Refresher",artwork:[{src:"/icons/icon-512.png",sizes:"512x512",type:"image/png"}]})}catch(e){}}
if("mediaSession" in navigator){try{
  navigator.mediaSession.setActionHandler("play",()=>{NAR.listening=true;NAR.audio.play().then(()=>{narUI();narHighlight()})});
  navigator.mediaSession.setActionHandler("pause",()=>{NAR.listening=false;NAR.audio.pause();narUI()});
  navigator.mediaSession.setActionHandler("nexttrack",()=>{const b=$("next")||$("fnext")||$("go");if(b)b.click()});
  navigator.mediaSession.setActionHandler("seekbackward",()=>{NAR.audio.currentTime=Math.max(0,NAR.audio.currentTime-10)});
  navigator.mediaSession.setActionHandler("seekforward",()=>{NAR.audio.currentTime=Math.min(NAR.audio.duration||0,NAR.audio.currentTime+10)});
}catch(e){}}
NAR.audio.addEventListener("play",narMedia);
if("serviceWorker" in navigator&&location.protocol==="https:")navigator.serviceWorker.register("/sw.js").catch(()=>{});



/* ===== cast wiki ===== */
function castList(){return DATA().cast||[]}
function storyReach(){let done=0;TRACKS.full.list().forEach(c=>{const st=c.num===(TRACK==="full"&&CH?CH.num:-1)?S:load("full",c.num);if(st&&(st.pos||0)>=steps(c).length-1)done=Math.max(done,c.num)});return done}
function avatar(c,size){const ini=c.name.split(" ").map(w=>w[0]).slice(0,2).join("");let h=0;for(const ch of c.id)h=(h*31+ch.charCodeAt(0))>>>0;const hue=h%360;
  return `<span class="av" style="width:${size}px;height:${size}px;--avh:${hue}"><img src="${R("cast/"+c.id+".jpg")}" alt="" loading="lazy" onerror="if(!this.dataset.f){this.dataset.f=1;this.src='${R("cast/"+c.id+".svg")}'}else this.remove()"><span>${esc(ini)}</span></span>`}
function renderCast(id){setTimeout(ambSync,0);setTimeout(navSync,0);
  TRACK="cast";$("railgame").hidden=true;$("mockcard").hidden=true;const L=castList();const reach=store.get("spoilers",false)?99:storyReach();
  if(!L.length){$("page").innerHTML=`<h1>Cast</h1><p class="prog">The cast guide is on its way.</p>`;return}
  if(!id){$("page").innerHTML=`<div class="kicker">The Halcyon Launch</div><h1>Cast</h1><div class="story"><p>Profiles fill in as you play the Full Course, so nothing gets spoiled. You've finished ${reach>=99?"everything (spoilers on)":reach?`chapter ${reach}`:"no chapters yet"}.</p></div>
    <div class="castgrid">${L.map(c=>{const seen=c.firstChapter<=Math.max(1,reach+1);return `<button class="castcard" type="button" data-c="${c.id}" ${seen?"":"disabled"}>${avatar(c,64)}<span><b>${seen?esc(c.name):"Not met yet"}</b><span class="prog">${seen?esc(c.role):`Appears in chapter ${c.firstChapter}`}</span></span></button>`}).join("")}</div>
    <label class="chk prog" style="margin-top:16px"><input type="checkbox" id="spoil" ${store.get("spoilers",false)?"checked":""}> Show everything, including spoilers</label>`;
    $("page").querySelectorAll("[data-c]").forEach(b=>b.onclick=()=>{renderCast(b.dataset.c);top()});$("spoil").onchange=e=>{store.set("spoilers",e.target.checked);renderCast()};return}
  const c=L.find(x=>x.id===id);const byId={};L.forEach(x=>byId[x.id]=x);
  $("page").innerHTML=`<div class="kicker"><button class="linkbtn" id="castback" type="button">Cast</button> · ${esc(c.role)}</div><div class="casthead">${avatar(c,112)}<div><h1>${esc(c.name)}</h1><p class="prog">First appears in chapter ${c.firstChapter}</p>${c.intro?`<button class="btn small" id="hear" type="button">▶ Hear ${esc(c.name.split(" ")[0])}</button>`:""}</div></div>
    ${c.quote&&c.quote.unlock<=reach+1?`<blockquote class="castquote">${c.quote.text}</blockquote>`:""}
    ${c.sections.map(sec=>sec.unlock<=Math.max(1,reach)||(sec.unlock===1)?`<section class="lesson"><h2>${esc(sec.title)}</h2>${paras(sec.body)}</section>`:`<section class="locked"><h2>${esc(sec.title)}</h2><p class="prog">Unlocks after chapter ${sec.unlock}.</p></section>`).join("")}
    ${(c.ties||[]).filter(t=>t.unlock<=Math.max(1,reach)).length?`<h2>Connections</h2><ul class="ties">${c.ties.filter(t=>t.unlock<=Math.max(1,reach)).map(t=>`<li><button class="linkbtn" data-c="${t.id}" type="button">${esc((byId[t.id]||{}).name||t.id)}</button>: ${esc(t.text)}</li>`).join("")}</ul>`:""}`;
  if(window.__castAudio)window.__castAudio.pause();const h=$("hear");if(h){const a=new Audio(R(`cast/voice/${c.id}.mp3`));window.__castAudio=a;a.onended=()=>h.textContent=`▶ Hear ${c.name.split(" ")[0]}`;a.onerror=()=>h.remove();h.onclick=()=>{if(a.paused){a.play().catch(()=>{});h.textContent="❚❚ Pause"}else{a.pause();h.textContent=`▶ Hear ${c.name.split(" ")[0]}`}}}
  $("castback").onclick=()=>{if(window.__castAudio)window.__castAudio.pause();renderCast();top()};$("page").querySelectorAll("[data-c]").forEach(b=>b.onclick=()=>{renderCast(b.dataset.c);top()});
}


function lastPlaceLabel(){const lp=store.get("lastplace."+COURSE.id,null);if(!lp)return null;if(lp.t==="mock")return["Mock exam",()=>openMock()];const c=TRACKS[lp.t]&&TRACKS[lp.t].list().find(x=>x.num===lp.n);if(!c)return null;return[`${lp.t==="ref"?"Refresher":"Ch"} ${c.num} · ${c.title}`,()=>openChapter(lp.t,c.num)]}
function navSync(){const map={home:"homelink",library:"liblink",dash:"proglink",practice:"proglink",cast:"castlink",book:"listenlink"};["liblink","homelink","proglink","castlink","listenlink"].forEach(id=>{const b=$(id);if(b)b.classList.remove("on")});
  const onId=!TRACK?"homelink":map[TRACK];if(onId&&$(onId))$(onId).classList.add("on");
  const cb=$("contlink");if(!cb)return;const lp=lastPlaceLabel();const inPlace=(TRACK==="full"||TRACK==="ref"||TRACK==="mock");
  if(lp&&!inPlace&&TRACK!==null){cb.hidden=false;cb.textContent="Continue: "+lp[0];cb.onclick=()=>{lp[1]();}}else cb.hidden=true;
  if(!inPlace&&lp&&(TRACK==="cast"||TRACK==="dash"||TRACK==="practice"||TRACK==="book")){const pg=$("page");if(pg&&!pg.querySelector(".backlink")){const d=document.createElement("p");d.className="backlink";d.innerHTML=`<button class="linkbtn" type="button">← Back to ${esc(lp[0])}</button>`;d.firstChild.onclick=()=>lp[1]();pg.prepend(d)}}}


/* ===== audiobook ===== */
let BOOK=null;
async function bookManifest(){if(BOOK&&Object.keys(BOOK.full||{}).length)return BOOK;try{const r=await fetch(R("audio/audiobook.json"),{cache:"no-store"});BOOK=r.ok?await r.json():{full:{}}}catch(e){BOOK={full:{}}}return BOOK}
function bookPlay(ed,n){const M=BOOK.full[n]&&BOOK.full[n][ed];if(!M)return;NAR.page="book";NAR.book={ed,n};NAR.key="book";NAR.audio.pause();NAR.audio.src=R(M.src);NAR.audio.playbackRate=NAR.rate;
  const pos=store.get(`bookpos.${COURSE.id}.${ed}.${n}`,0);NAR.audio.addEventListener("loadedmetadata",()=>{if(pos>5&&pos<(NAR.audio.duration-5))NAR.audio.currentTime=pos},{once:true});
  NAR.listening=true;NAR.audio.play().then(()=>{narUI();narHighlight();narMedia()}).catch(()=>{});narUI();if(TRACK==="book")renderBook()}
async function renderBook(){setTimeout(ambSync,0);
  TRACK="book";setTimeout(navSync,0);$("railgame").hidden=true;$("mockcard").hidden=true;const B=await bookManifest();if(TRACK!=="book")return;
  const ed=store.get("bookEd."+COURSE.id,"story");const full=TRACKS.full.list();
  const row=c=>{const M=B.full[c.num]&&B.full[c.num][ed];const done=store.get(`bookdone.${COURSE.id}.${ed}.${c.num}`,false);const now=NAR.page==="book"&&NAR.book&&NAR.book.n===c.num&&NAR.book.ed===ed;
    return `<button class="brow ${now?"now":""}" type="button" data-b="${c.num}" ${M?"":"disabled"}><span class="cn">${c.num}</span><span class="ct">${esc(c.title)}</span><span class="cs">${M?`${Math.round(M.min)} min`:"not recorded yet"}${done?" · ✓":""}${now?(NAR.audio.paused?" · paused":" · playing"):""}</span></button>`};
  $("page").innerHTML=`<div class="kicker">Hands-free</div><h1>Listen hands-free</h1><p class="lead">No tapping needed. It plays the story on the right-answer path, chapter after chapter, and keeps going with your phone locked. Pause or skip with your car or lock-screen controls.</p>
   <div class="edtoggle" role="radiogroup" aria-label="Edition"><button type="button" class="${ed==="story"?"on":""}" data-ed="story"><b>Story only</b><span class="prog">Just the novel. Sam makes the right calls and you hear what happens. About 10 to 13 minutes a chapter.</span></button><button type="button" class="${ed==="study"?"on":""}" data-ed="study"><b>Story + lessons</b><span class="prog">The story plus ${MENTOR()}'s lesson, and each decision read aloud with a pause, then the answer and why. About 25 minutes.</span></button></div>
   <p class="prog">Plays chapter to chapter on its own and remembers where you stopped. Works with the lock screen and car controls. Chapters are recorded as you reach them.</p>
   <h2>Full Course</h2><div class="brows">${full.map(row).join("")}</div>`;
  $("page").querySelectorAll("[data-ed]").forEach(b=>b.onclick=()=>{store.set("bookEd."+COURSE.id,b.dataset.ed);renderBook()});
  $("page").querySelectorAll("[data-b]").forEach(b=>b.onclick=()=>{const n=+b.dataset.b;if(NAR.page==="book"&&NAR.book&&NAR.book.n===n&&NAR.book.ed===ed){if(NAR.audio.paused){NAR.audio.play();narHighlight()}else NAR.audio.pause();setTimeout(renderBook,50);return}bookPlay(ed,n)});
}


/* ===== chapter art + "In this scene" cast strip ===== */
function REF_ART(){return COURSE.refArt||{}}
function chapterArt(){if(!CH)return "";const n=TRACK==="full"?CH.num:REF_ART()[CH.num];if(!n)return "";const nn=String(n).padStart(2,"0");
  return `<div class="chart"><img src="${R("art/full-ch"+nn+".jpg")}" alt="" onerror="if(!this.dataset.f){this.dataset.f=1;this.src='${R("art/full-ch"+nn+".svg")}'}else this.parentNode.remove()"></div>`}
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
function ambFor(text,kind){if(kind==="lesson")return "boardroom";for(const [k,re] of AMB_RULES)if(re.test(text))return k;return "office"}
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
  $("page").innerHTML=`<div class="kicker"><button class="linkbtn" type="button" id="tolib">Library</button> › ${esc(COURSE.title)}</div><h1>${esc(COURSE.full_title||COURSE.title)}</h1>
   ${lp?`<button class="hero" type="button" id="resume"><span class="prog">Pick up where you left off</span><b>${esc(lp[0])}</b><span class="go">Continue ›</span></button>`:`<button class="hero" type="button" id="resume"><span class="prog">New here?</span><b>Start the ${esc(COURSE.fullName||"Full Course")}: Chapter 1${TRACKS.full.list()[0]?", "+esc(TRACKS.full.list()[0].title):""}</b><span class="go">Begin ›</span></button>`}
   <button class="handsfree" type="button" id="hfree"><span>🎧</span><span><b>Listen hands-free</b><span class="prog">Starts at your current chapter. No tapping while you drive.</span></span></button>
   ${plan[0]?`<div class="nextstep"><span class="prog">${MENTOR()}'s next step for you</span><p><b>${esc(plan[0][0])}.</b> ${esc(plan[0][1])}</p><button class="btn small" type="button" id="planbtn">${plan[0][2].task?"Practice now":plan[0][2].mock?"Open mock exam":"Go"}</button> <button class="linkbtn" type="button" id="seeplan">See the full study plan</button></div>`:""}
   <h2>${esc(COURSE.fullName||"Full Course")} <span class="prog">${fullDone} of ${full.length} chapters done${COURSE.fullHours?" · "+COURSE.fullHours:""}</span></h2>
   <div class="ctiles">${full.map(c=>tile("full",c)).join("")}</div>
   ${ref.length?`<h2>Refresher <span class="prog">${ref.length} chapters · a fast review</span></h2><div class="ctiles">${ref.map(c=>tile("ref",c)).join("")}</div>`:""}
   <h2>Mock exam</h2><div class="card mockhome"><p>${COURSE.mockShort||"A full practice exam."} ${last?`Last attempt: <b>${last.right} of ${last.total}</b> (${Math.round(last.right/last.total*100)}%) on ${new Date(last.at).toLocaleDateString("en-US",{month:"short",day:"numeric"})}.`:"You haven't taken one yet."}</p><button class="btn" type="button" id="mockbtn">Open the mock exam</button></div>
   <div class="quick"><button class="card qlink" type="button" id="qprog"><b>Progress</b><span class="prog">Scores, the ${ALLT().length}-task map, practice sets</span></button><button class="card qlink" type="button" id="qcast"><b>Cast</b><span class="prog">Meet everyone, hear them talk</span></button></div>`;
  const pg=$("page");
  $("resume").onclick=()=>lp?lp[1]():openChapter("full",1);
  $("hfree").onclick=async()=>{const B=await bookManifest();const lpv=store.get("lastplace."+COURSE.id,null);const ed=store.get("bookEd."+COURSE.id,"story");let n=lpv&&lpv.t==="full"?lpv.n:1;const have=Object.keys(B.full).map(Number).filter(k=>B.full[k][ed]).sort((a,b)=>a-b);if(!have.length)return renderBook();if(!have.includes(n))n=have.find(k=>k>=n)||have[have.length-1];renderBook();bookPlay(ed,n)};
  pg.querySelectorAll("[data-open]").forEach(b=>b.onclick=()=>{const [tr,n]=b.dataset.open.split(":");openChapter(tr,+n)});
  $("tolib").onclick=()=>renderLibrary();$("mockbtn").onclick=()=>openMock();$("qprog").onclick=()=>{renderDash();top()};$("qcast").onclick=()=>{renderCast();top()};
  if($("planbtn")){const a=plan[0][2];$("planbtn").onclick=()=>{if(a.mock)return openMock();if(a.task)return startPractice(a.task);openChapter("full",a.open)};$("seeplan").onclick=()=>{renderDash();top()}}
}
function openChapter(tr,n){store.set("lastplace."+COURSE.id,{t:tr,n});TRACK=tr;store.set("track",tr);store.set("lastch."+COURSE.id+"."+tr,n);CH=chapters().find(c=>c.num===n);S=load(tr,n)||(tr==="ref"?freshRef():freshFull());store.set("cur",keyOf(tr,n));render();top()}
function resetChapter(n){if(!confirm(`Reset chapter ${n}? Your progress in this chapter will be cleared.`))return;const st=TRACK==="ref"?freshRef():freshFull();if(n===CH.num){S=st;save();render();top()}else{persist(TRACK,n,st);renderRail()}}
function renderRail(){
  const rg=$("railgame");if(!TRACK||["mock","dash","practice","cast","book","library"].includes(TRACK)){rg.hidden=true}else rg.hidden=false;
  $("trackname").textContent=TRACK?TRACKS[TRACK].name:"";
  if(TRACK==="mock"){$("mockcard").hidden=false;$("mockcard").innerHTML=MS&&!MS.submitted&&MS.order?`<h3>Mock exam</h3><p class="big" id="mocktime">${MS.mode==="exam"?fmtTime(MOCK_LIMIT()-MS.elapsed):"Practice"}</p><p class="prog">${Object.keys(MS.ans).length} of ${MS.order.length} answered</p>`:`<h3>Mock exam</h3><p class="prog">Pick a mode to start.</p>`;return}
  $("mockcard").hidden=true;if(!TRACK)return;
  $("meters").innerHTML=METERS.map(([k,l])=>{const v=S.m[k];const col=v>=60?"var(--good)":v>=40?"var(--mid)":"var(--bad)";return `<div class="meter"><div class="row"><span>${l}</span><span class="num">${v}</span></div><div class="track" role="img" aria-label="${l} ${v} of 100"><span style="width:${v}%;background:${col}"></span></div></div>`}).join("");
  const n=CH.scenes.length,dn=Object.keys(S.picks).length;
  $("prog").textContent=`Chapter ${CH.num} · ${dn} of ${n} decisions · Score ${S.score}/${n*3}`;
  $("dots").innerHTML=CH.scenes.map((sc,i)=>{const p=S.picks[i];return `<span class="dot ${p!==undefined?"s"+sc.opts[p].s:""}" title="Decision ${i+1}"></span>`}).join("");
  const tot=Object.fromEntries(DOMS.map(d=>[d,[0,0]]));chapters().forEach(c=>{const st=c.num===CH.num?S:load(TRACK,c.num);if(st)DOMS.forEach(d=>{tot[d][0]+=st.dom[d][0];tot[d][1]+=st.dom[d][1]})});
  const fmtd=([g,t])=>t?`${Math.round(g/t*100)}%`:"·";
  $("domains").innerHTML=DOMS.map(d=>`<div class="dom-row"><span>${d}</span><span class="prog">${fmtd(S.dom[d])} · ${fmtd(tot[d])}</span></div>`).join("");
  $("chapters").innerHTML=chapters().map(c=>{const lab=chapterProgress(TRACK,c);const started=!!load(TRACK,c.num)||c.num===CH.num&&(Object.keys(S.picks).length||(S.pos||0)>0||S.step>=0);return `<div class="chaprow"><button class="chap${c.num===CH.num?" cur":""}" data-n="${c.num}" type="button"><span class="n">${c.num}</span><span>${c.title}</span><span class="prog">${lab}</span></button>${started?`<button class="linkbtn reset" data-r="${c.num}" type="button" aria-label="Reset chapter ${c.num}">Reset</button>`:""}</div>`}).join("");
  $("chapters").querySelectorAll(".chap").forEach(b=>b.onclick=()=>{save();openChapter(TRACK,+b.dataset.n)});if($("chnote"))$("chnote").textContent=`Ch ${CH.num}: ${CH.title}`;
  $("chapters").querySelectorAll("[data-r]").forEach(b=>b.onclick=()=>resetChapter(+b.dataset.r));
  const cast=[...BASE_CAST,...(TRACK==="full"?FULL_CAST_EXTRA:[])];chapters().filter(c=>c.num<=CH.num&&c.cast).forEach(c=>c.cast.forEach(x=>cast.push(x)));const seen=new Map();cast.forEach(([n,d])=>seen.set(n,d));
  $("cast").innerHTML=[...seen].map(([n,d])=>{const w=castList().find(c=>c.name===n||c.name.split(" ")[0]===n.split(" ")[0]);return `<dt>${w?`<button class="linkbtn" data-castid="${w.id}" type="button">${n}</button>`:n}</dt><dd>${d}</dd>`}).join("");$("cast").querySelectorAll("[data-castid]").forEach(b=>b.onclick=()=>{if(TRACK==="full"||TRACK==="ref")save();renderCast(b.dataset.castid);top()});
}
function render(){_render();castStrip();narAttach();navSync();ambSync()}
function _render(){if(TRACK==="library")return renderLibrary();if(TRACK==="book")return renderBook();if(TRACK==="cast")return renderCast();if(TRACK==="dash")return renderDash();if(TRACK==="practice")return renderPractice();renderRail();if(!TRACK)return renderHome();if(TRACK==="mock")return mockRender();if(TRACK==="ref")return refRender();return fullRender()}

/* ===== accounts ===== */
const ONLINE=location.protocol.startsWith("http")&&location.hostname!=="localhost";
async function api(path,opts={}){const r=await fetch(path,{credentials:"same-origin",headers:{"Content-Type":"application/json"},...opts});let j={};try{j=await r.json()}catch(e){}return {ok:r.ok,status:r.status,...j}}
function clearLocal(){try{Object.keys(localStorage).filter(k=>k.startsWith("halcyon.")).forEach(k=>localStorage.removeItem(k))}catch(e){}}
function renderAuth(mode,invite){
  document.querySelector(".rail").hidden=true;const signup=mode==="signup";
  $("page").innerHTML=`<div class="kicker">The Halcyon Launch</div><h1>${signup?"Create your account":"Sign in"}</h1><div class="story"><p>${signup?"You've been invited to The Halcyon Launch, a story-driven PMP course. Your progress saves to your account so you can pick up anywhere.":"Invite only. Sign in to pick up where you left off."}</p></div>
   <form class="auth" id="authform" novalidate><div id="autherr"></div>${signup?'<label for="a-name">Name<input id="a-name" autocomplete="name" required></label>':""}<label for="a-email">Email<input id="a-email" type="email" autocomplete="email" required></label><label for="a-pw">Password${signup?" (10 characters or more)":""}<input id="a-pw" type="password" autocomplete="${signup?"new-password":"current-password"}" required></label><button class="btn" type="submit">${signup?"Create account":"Sign in"}</button></form>
   ${signup?'<p class="prog">Already have an account? <a href="/">Sign in</a></p>':'<p class="prog">No account? You need an invite link from Anthony.</p>'}`;
  $("authform").onsubmit=async e=>{e.preventDefault();$("autherr").innerHTML="";const b={email:$("a-email").value,password:$("a-pw").value};if(signup){b.name=$("a-name").value;b.token=invite}
    const r=await api("/api/auth?action="+(signup?"signup":"login"),{method:"POST",body:JSON.stringify(b)});if(!r.ok){$("autherr").innerHTML=`<div class="err">${esc(r.error||"That didn't work. Try again.")}</div>`;return}if(signup)history.replaceState(null,"","/");boot()};
}
function renderLibrary(){setTimeout(ambSync,0);TRACK="library";CH=null;$("railgame").hidden=true;$("mockcard").hidden=true;setTimeout(navSync,0);
  const card=c=>{const live=c.status==="live";let pr="";if(live){const lp=store.get("lastplace."+c.id,null);pr=lp?"In progress":"Not started"}
    return `<button class="libcard ${live?"live":"soon"}" type="button" data-course="${c.id}" ${live?"":"disabled"}><span class="libart" aria-hidden="true">${({pmp:"🚀",cphims:"🏥",asep:"🛰️",gh300:"🤖",pilot:"✈️"})[c.id]||"📘"}</span><span class="libtxt"><span class="prog">${esc(c.exam||"")}</span><b>${esc(c.full_title||c.title)}</b><span class="libstory">${esc(c.story||"")}</span><span class="libstate">${live?esc(pr):"In production"}</span></span></button>`};
  $("page").innerHTML=`<div class="kicker">Library</div><h1>Your courses</h1><div class="story"><p>Each course is a story you play through, with lessons, quizzes and a practice exam. Pick one to open it.</p></div><div class="libgrid">${COURSES.map(card).join("")}</div>`;
  $("page").querySelectorAll("[data-course]").forEach(b=>b.onclick=async()=>{if(await useCourse(b.dataset.course)){renderHome();renderRail();top()}})}
function resumeFrom(cur){const c=courseOfKey(cur||0);if(c.status==="live"&&c.id!==COURSE.id){useCourse(c.id).then(()=>resumeFrom(cur));return}cur=(cur||0)-COURSE.base;if(cur>=900)return openMock();if(cur>100){const L=TRACKS.full.list();if(L.find(c=>c.num===cur-100))return openChapter("full",cur-100)}else if(cur>=1){const L=TRACKS.ref.list();if(L.find(c=>c.num===cur))return openChapter("ref",cur)}renderHome()}
async function boot(){
  if($("ambtoggle")){ambUI();$("ambtoggle").onchange=e=>{AMB.on=e.target.checked;store.set("amb",AMB.on);AMB.cur=null;AMB.lastSting="";ambSync()};$("ambvol").oninput=e=>{AMB.vol=+e.target.value;store.set("ambvol",AMB.vol);AMB.els[AMB.i].volume=AMB.vol}}
  if($("storytoggle")){$("storytoggle").checked=STORY();$("storytoggle").onchange=e=>setStoryMode(e.target.checked)}
  if($("listenlink"))$("listenlink").onclick=()=>{if(TRACK==="full"||TRACK==="ref")save();clearInterval(mockTimer);renderBook();top()};
  if($("castlink"))$("castlink").onclick=()=>{if(TRACK==="full"||TRACK==="ref")save();clearInterval(mockTimer);renderCast();top()};
  $("proglink").onclick=()=>{if(TRACK==="full"||TRACK==="ref")save();clearInterval(mockTimer);renderDash();top()};
  if($("liblink"))$("liblink").onclick=()=>{if(TRACK==="full"||TRACK==="ref")save();clearInterval(mockTimer);renderLibrary();top()};
  $("homelink").onclick=()=>{if(TRACK==="full"||TRACK==="ref")save();clearInterval(mockTimer);renderHome();renderRail()};
  if(!ONLINE){$("usercard").hidden=false;$("signout").hidden=true;$("username").textContent="";resumeFrom(store.get("cur",0));return}
  let me;try{me=await api("/api/auth?action=me")}catch(e){me={user:null}}
  if(!me.user){const inv=new URLSearchParams(location.search).get("invite");
    if(inv){const v=await api("/api/auth?action=invite&token="+encodeURIComponent(inv));if(v.valid)return renderAuth("signup",inv);
      document.querySelector(".rail").hidden=true;$("page").innerHTML=`<h1>This invite has expired</h1><div class="story"><p>Invite links work once. Ask Anthony for a new one, or <a href="/">sign in</a> if you already have an account.</p></div>`;return}
    return renderAuth("login")}
  clearLocal();Object.entries(me.progress||{}).forEach(([n,st])=>store.set("c"+n,st&&Object.keys(st).length?st:null));
  SYNC=(n,st)=>api("/api/progress",{method:"PUT",body:JSON.stringify({chapter:n,state:st})}).catch(()=>{});
  document.querySelector(".rail").hidden=false;$("usercard").hidden=false;$("username").textContent=me.user.name;$("adminlink").hidden=!me.user.admin;
  $("signout").onclick=async()=>{await api("/api/auth?action=logout",{method:"POST"});clearLocal();location.href="/"};
  resumeFrom(me.user.cur||0);
}
boot();
})();
