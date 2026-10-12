/* Halcyon QA mode, for testers: flag a wrong voice, a mispronounced word, a highlight that's off, a typo, a story problem.
   On with ?qa=1 (off with ?qa=0) or the QA mode switch on the Guide page; remembered on this device. Off by default.
   QA on:  a name chip before every spoken line (plus the Gemini voice id when the page's timings.json carries a "_voices" map),
           a small bar while a page plays (book, chapter, page id, line, speaker, time) with a Flag button,
           and right click or press and hold on any line to flag that line.
   "Show who's speaking" is the plain reader setting: name chips only, nothing else.
   Reports go to /api/qa-report (lib/qa.js); tools/qa_pull.mjs pulls them. The engine's read only hook is window.HalcyonState (engine.js). */
(function(){
"use strict";
const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const SP="halcyon.";
const store={get(k,d){try{const v=localStorage.getItem(SP+k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem(SP+k,JSON.stringify(v))}catch(e){}}};
const TYPES=[["wrong_voice","Wrong voice"],["text_mismatch","Text doesn't match audio"],["voice_changed","Voice changed mid-scene"],["mispronounced","Mispronounced"],["highlight_off","Highlight off"],["audio_glitch","Audio glitch"],["typo","Typo"],["story","Story or fact"],["other","Other"]];
const LINESEL="h1, h2, .story p, .choice"; // a "line" is a heading, a story paragraph or a choice, counted in page order
const QA={on:false,who:store.get("showwho",false)};
const ST=()=>{try{return window.HalcyonState?window.HalcyonState():{}}catch(e){return {}}};

/* ===== on and off ===== */
function qaFromURL(){try{let v=new URLSearchParams(location.search).get("qa");const m=location.hash.match(/[?&]qa=([01])\b/);if(m){v=m[1];const h=location.hash.replace(/[?&]qa=[01]\b/,"").replace(/[?&]$/,"");history.replaceState(null,"",location.pathname+location.search+h)}if(v==="1"||v==="0")store.set("qa",v==="1")}catch(e){}}  // ?qa=1 works before or after the #route
qaFromURL();QA.on=!!store.get("qa",false);
function applyMode(){document.body.classList.toggle("qa-on",QA.on);document.body.classList.toggle("qa-who",QA.who||QA.on);markSpeakers();barTick();
  const a=$("qatoggle");if(a)a.checked=QA.on;const b=$("whotoggle");if(b)b.checked=QA.who}
function setQA(on){QA.on=!!on;store.set("qa",QA.on);applyMode()}
function setWho(on){QA.who=!!on;store.set("showwho",QA.who);applyMode()}

/* ===== speaker chips: CSS draws the name (::before, attr(data-who)), so no text lands in the page and the narration highlight sees the same words ===== */
function voiceMap(st){const T=st.timings,V=T&&(T._voices||T.voices);if(!V||typeof V!=="object")return null;return V[st.page]&&typeof V[st.page]==="object"?V[st.page]:V}
function voiceOf(V,who){if(!V||!who)return "";const v=V[who]??V[who.toLowerCase()];return typeof v==="string"?v:v&&typeof v==="object"&&v.voice?String(v.voice):""}
function markSpeakers(){const pg=$("page");if(!pg)return;const V=QA.on?voiceMap(ST()):null;
  pg.querySelectorAll(LINESEL).forEach(line=>{let prev=null;line.querySelectorAll(".said[data-who]").forEach(s=>{const who=s.dataset.who;s.classList.toggle("who1",who!==prev);prev=who;
    const v=voiceOf(V,who);if(v)s.dataset.voice=v;else delete s.dataset.voice})});
  pg.dataset.qav=V?"1":""}

/* ===== where a line is: index among the page's lines, its speaker, its text ===== */
function lineInfo(el){const pg=$("page");const line=el&&el.closest&&el.closest(LINESEL);if(!line||!pg||!pg.contains(line))return null;
  const all=[...pg.querySelectorAll(LINESEL)];const said=(el.closest&&el.closest(".said[data-who]"))||line.querySelector(".said[data-who]");
  return {line:all.indexOf(line),speaker:said?said.dataset.who:"Narrator",voice:said&&said.dataset.voice||"",text:(line.textContent||"").replace(/\s+/g," ").trim().slice(0,300)}}
function playingLine(){const w=document.querySelector("#page .w.hl");const li=w?lineInfo(w):null;if(li){const s=w.closest(".said[data-who]");li.speaker=s?s.dataset.who:"Narrator";li.voice=s&&s.dataset.voice||""}return li} // the word being read decides the speaker, not the paragraph
function context(li){const st=ST();li=li||{};
  return {course:st.course||"",book:st.book||"",chapter:st.chapter??null,chTitle:st.chTitle||"",page:[st.key,st.page].filter(Boolean).join(" "),
    line:li.line>=0?li.line:null,speaker:li.speaker||"",voice:li.voice||"",text:li.text||"",
    src:st.src?String(st.src).replace(/^https?:\/\/[^/]+/,""):"",t:st.src?Math.round((st.t||0)*100)/100:null,
    track:st.mode==="audiobook"?(st.ed==="study"?"study":"story"):(st.story?"story":"study"),mode:st.mode||"read",
    route:String(location.hash||"").slice(1,80),ua:navigator.userAgent.slice(0,300)}}
const fmt=t=>t==null?"":`${Math.floor(t/60)}:${(t%60).toFixed(1).padStart(4,"0")}`;

/* ===== the QA bar, while a page plays ===== */
function bar(){let b=$("qabar");if(b)return b;b=document.createElement("div");b.id="qabar";b.hidden=true;b.setAttribute("role","status");
  b.innerHTML=`<span class="qainfo" id="qainfo"></span><button type="button" class="qaflag" id="qaflagbtn">Flag</button>`;document.body.appendChild(b);
  $("qaflagbtn").onclick=()=>openForm(playingLine());return b}
function barTick(){const st=ST();const show=QA.on&&!!st.src&&st.mode!=="read"&&(!st.paused||st.t>0);const b=$("qabar")||(show?bar():null);if(!b)return;
  b.hidden=!show;if(!show)return;
  const nb=$("narbar");b.style.bottom=((nb&&!nb.hidden?nb.offsetHeight:0)+8)+"px";
  const li=st.mode==="page"?playingLine():null;
  const parts=[st.chapter!=null?"Ch "+st.chapter:"",[st.key,st.page].filter(Boolean).join(" "),li&&li.line>=0?"line "+li.line:"",li?li.speaker+(li.voice?" ("+li.voice+")":""):"",fmt(st.t)].filter(Boolean);
  const s=parts.join(" · ");const i=$("qainfo");if(i.dataset.s!==s+st.book){i.dataset.s=s+st.book;i.innerHTML=`<span class="qabook">${esc(st.book)} · </span>${esc(s)}`;i.title=(st.book?st.book+" · ":"")+s}
  if($("page")&&$("page").dataset.qav!==(voiceMap(st)?"1":""))markSpeakers()}
setInterval(()=>{if(QA.on)barTick()},250);

/* ===== the Flag form ===== */
function openForm(li){closeForm();const ctx=context(li);const tester=store.get("qa.tester","");
  const box=document.createElement("div");box.id="qaform";box.className="qaover";
  box.innerHTML=`<form class="qapanel" role="dialog" aria-modal="true" aria-labelledby="qahead" novalidate>
   <h2 id="qahead">Flag a problem</h2>
   ${ctx.text?`<p class="qaline">${ctx.speaker?`<b>${esc(ctx.speaker)}</b> `:""}${esc(ctx.text.length>140?ctx.text.slice(0,140)+"…":ctx.text)}</p>`:""}
   <label>What's wrong<select id="qatype" required><option value="">Choose one</option>${TYPES.map(([k,l])=>`<option value="${k}">${l}</option>`).join("")}</select></label>
   <label>Note (optional)<textarea id="qanote" maxlength="500" rows="3" placeholder="What you heard or saw"></textarea><span class="prog" id="qacount">0 of 500</span></label>
   <label>Your name (optional, saved on this device only)<input id="qatester" maxlength="40" autocomplete="off" value="${esc(tester)}"></label>
   <details class="qactx"><summary>What gets sent with it</summary><dl>${[["Book",ctx.book],["Chapter",ctx.chapter],["Page",ctx.page],["Line",ctx.line],["Speaker",ctx.speaker],["Voice",ctx.voice],["Audio",ctx.src],["Time",fmt(ctx.t)],["Track",ctx.track],["Browser",ctx.ua]].filter(([,v])=>v!==""&&v!=null).map(([k,v])=>`<dt>${k}</dt><dd>${esc(v)}</dd>`).join("")}</dl></details>
   <p class="qamsg" id="qamsg" role="alert"></p>
   <div class="bar"><button class="btn" type="submit" id="qasend">Send</button><button class="btn ghost" type="button" id="qacancel">Cancel</button></div></form>`;
  document.body.appendChild(box);
  const f=box.querySelector("form");$("qatype").focus();
  $("qanote").oninput=e=>{$("qacount").textContent=`${e.target.value.length} of 500`};
  $("qacancel").onclick=closeForm;box.addEventListener("click",e=>{if(e.target===box)closeForm()});
  box.addEventListener("keydown",e=>{if(e.key==="Escape")closeForm()});
  f.onsubmit=async e=>{e.preventDefault();const type=$("qatype").value,msg=$("qamsg");
    if(!type){msg.textContent="Pick what kind of problem it is.";$("qatype").focus();return}
    const name=$("qatester").value.trim().slice(0,40);store.set("qa.tester",name);
    const payload={type,note:$("qanote").value.slice(0,500),ctx};if(name)payload.tester=name;
    $("qasend").disabled=true;msg.textContent="Sending…";
    try{const r=await fetch("/api/qa-report",{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});let j={};try{j=await r.json()}catch(x){}
      if(!r.ok)throw new Error(j.error||"That didn't go through. Try again in a minute.");
      f.innerHTML=`<h2 id="qahead">Sent</h2><p>Thanks. That goes straight to the fix list.</p><div class="bar"><button class="btn" type="button" id="qadone">Close</button></div>`;$("qadone").onclick=closeForm;$("qadone").focus()}
    catch(err){msg.textContent=err.message||"That didn't go through.";$("qasend").disabled=false}}}
function closeForm(){const b=$("qaform");if(b)b.remove()}

/* ===== right click or press and hold a line ===== */
document.addEventListener("contextmenu",e=>{if(!QA.on)return;const li=lineInfo(e.target);if(!li)return;e.preventDefault();openForm(li)});
let press=null;
document.addEventListener("touchstart",e=>{if(!QA.on||e.touches.length!==1)return;const li=lineInfo(e.target);if(!li)return;const t=e.touches[0];
  press={x:t.clientX,y:t.clientY,fired:false,timer:setTimeout(()=>{if(press){press.fired=true;openForm(li)}},550)}},{passive:true});
document.addEventListener("touchmove",e=>{if(!press)return;const t=e.touches[0];if(Math.abs(t.clientX-press.x)>10||Math.abs(t.clientY-press.y)>10){clearTimeout(press.timer);press=null}},{passive:true});
document.addEventListener("touchend",e=>{if(!press)return;clearTimeout(press.timer);if(press.fired)e.preventDefault();press=null},{passive:false}); // a long press on a choice must not also pick it

/* ===== settings, on the Guide page: Show who's speaking (everyone) and QA mode (testers) ===== */
function settingsUI(){const d=$("pdbgt");if(!d||$("qatoggle"))return;const lab=d.closest("label");if(!lab)return;
  const h=lab.previousElementSibling&&lab.previousElementSibling.tagName==="H2"?lab.previousElementSibling:lab;
  h.insertAdjacentHTML("beforebegin",`<h2>Reading</h2><label class="chk prog"><input type="checkbox" id="whotoggle" ${QA.who?"checked":""}> Show who's speaking (a small name tag before each spoken line)</label>`);
  lab.insertAdjacentHTML("afterend",`<label class="chk prog qaset"><input type="checkbox" id="qatoggle" ${QA.on?"checked":""}> QA mode, for testers. It adds name tags with voice details, a bar that shows the exact spot while a page plays, and a Flag button. Right click or press and hold any line to flag it.</label>`);
  $("whotoggle").onchange=e=>setWho(e.target.checked);$("qatoggle").onchange=e=>setQA(e.target.checked)}

/* the engine redraws #page with innerHTML on every step: mark speakers and add the settings after each redraw */
function onPage(){markSpeakers();settingsUI();barTick()}
const pg=$("page");if(pg)new MutationObserver(onPage).observe(pg,{childList:true});
applyMode();onPage();
window.HalcyonQA={setQA,setWho,openForm,context,lineInfo};
})();
