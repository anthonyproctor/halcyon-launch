/* Halcyon labs: optional hands-on work inside a chapter. Data driven, checked by fixed rules (no AI grading), never locks the story.
   A lab is {id,title,kind,hook:[...],source,questions:[...]} plus its kind's settings:
     chart    {img,w,h,credit,points:[{id,x,y,tag}]}                   x,y are pixels in the w x h image; tag:"l" puts the letter on the left
     calc     {inputs:[{id,label,min,max,step,value,unit}],presets:[{label,v:{}}],compute(v)=>{rows:[[label,value]],svg,note}}
     live     {live:{url,sample,sampleNote,parse(raw)=>ctx,show(ctx)=>html}}   answers can be functions of the parsed report
     evidence {files:[{name,text}],sql:true}                           CSV or plain text; sql.js loads from cdnjs only when SQL is opened
     sort     {sort:{mode:"buckets"|"order",items:[{id,label,note}],buckets:[{id,label}],answer,grid,table}}
   A question is {id,type:"choice"|"number"|"text"|"sort",q,opts,a,tol,unit,kb,alt,check(v,ctx),show(ctx),pt,hints:[],sol:[] or sol(ctx)}.
   Three wrong tries (or a right answer) shows the worked solution. State per lab: {q:{qid:{t,ok,shown,h,v}},arr,raw,src}. */
(function(){
"use strict";
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const RT={};const rt=id=>RT[id]||(RT[id]={});
const KIND={chart:"Chart",calc:"Calculator",live:"Live data",evidence:"Evidence",sort:"Sort"};
const SQLJS="https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/";
const TRIES=3;
const when=t=>{const d=new Date(t);return isNaN(d)?String(t||""):d.toLocaleString("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit",timeZoneName:"short"})};
const val=(x,ctx)=>typeof x==="function"?x(ctx):x;
function num(s){s=String(s??"").replace(/[$,%]/g,"").replace(/\s*(ft|feet|kt|kts|knots|sm|lb|lbs|in|inches|gal|gallons|deg|degrees|days|°)\.?$/i,"").trim();let m;
  if((m=s.match(/^([+-]?\d+)\s+(\d+)\/(\d+)$/)))return +m[1]+(m[1].startsWith("-")?-1:1)*m[2]/m[3];
  if((m=s.match(/^([+-]?\d+)\/(\d+)$/)))return m[1]/m[2];
  return /^[+-]?(\d+\.?\d*|\.\d+)$/.test(s)?parseFloat(s):null}
const norm=s=>String(s??"").toLowerCase().replace(/[^a-z0-9.]+/g," ").trim();
function qs(lab){return lab.questions||[]}
function qst(st,q){st.q=st.q||{};return st.q[q.id]||(st.q[q.id]={t:0,h:0})}
function resolved(st,q){const x=st&&st.q&&st.q[q.id];return !!(x&&(x.ok||x.shown))}
function done(lab,st){return !!st&&qs(lab).length>0&&qs(lab).every(q=>resolved(st,q))}
function ctxOf(lab){return lab.kind==="live"?(rt(lab.id).ctx||null):(lab.ctx||{})}
/* ----- sort helpers ----- */
function arrOf(lab,st){const S=lab.sort;if(S.mode==="order"){if(!Array.isArray(st.arr))st.arr=(S.start||S.items.map(i=>i.id)).slice();return st.arr}if(!st.arr||Array.isArray(st.arr))st.arr={};return st.arr}
function sortScore(lab,st){const S=lab.sort,a=arrOf(lab,st);let right=0;if(S.mode==="order")S.answer.forEach((id,i)=>{if(a[i]===id)right++});else S.items.forEach(it=>{if(a[it.id]===S.answer[it.id])right++});return{right,total:S.items.length}}
function check(lab,q,v,ctx,st){if(q.check)return !!q.check(v,ctx);const k=val(q.a,ctx);
  if(q.type==="choice")return String(v)===String(k);
  if(q.type==="number"){const n=num(v);return n!==null&&Math.abs(n-k)<=(q.tol||0)+1e-9}
  if(q.type==="text"){const t=norm(v);return t!==""&&[k,...(q.alt||[])].some(a=>a instanceof RegExp?a.test(String(v).trim()):norm(a)===t)}
  if(q.type==="sort"){const s=sortScore(lab,st);return s.right===s.total}
  return false}
function answerText(lab,q,ctx){if(q.show)return q.show(ctx);const k=val(q.a,ctx);if(q.type==="choice")return q.opts[k];if(q.type==="number")return (typeof k==="number"?k.toLocaleString("en-US",{maximumFractionDigits:4}):k)+(q.unit?" "+q.unit:"");return String(k)}
/* ----- widgets ----- */
function chartHTML(lab){const pts=lab.points||[];return `<div class="lchart"><div class="lcscroll"><div class="lcwrap" style="aspect-ratio:${lab.w}/${lab.h}"><img src="${esc(lab._R(lab.img))}" alt="${esc(lab.alt||lab.title)}" loading="lazy">${pts.map(p=>`<button type="button" class="lcpt${p.tag==="l"?" tl":""}" style="left:${(p.x/lab.w*100).toFixed(2)}%;top:${(p.y/lab.h*100).toFixed(2)}%" data-pt="${esc(p.id)}" aria-label="Point ${esc(p.id)}"><span>${esc(p.id)}</span></button>`).join("")}</div></div><div class="lcbar"><button type="button" class="btn small ghost" data-zoom>Zoom in</button><span class="prog">${lab.credit||""}</span></div></div>`}
function calcHTML(lab){const v=rt(lab.id).v||(rt(lab.id).v=Object.fromEntries(lab.inputs.map(i=>[i.id,i.value])));
  return `<div class="lcalc">${lab.presets?`<div class="lpre"><span class="prog">Load:</span>${lab.presets.map((p,i)=>`<button type="button" class="btn small ghost" data-pre="${i}">${esc(p.label)}</button>`).join("")}</div>`:""}<div class="lcin">${lab.inputs.map(i=>`<label class="lcrow"><span class="lcl">${esc(i.label)}</span><input type="range" min="${i.min}" max="${i.max}" step="${i.step||1}" value="${v[i.id]}" data-in="${i.id}" aria-label="${esc(i.label)}"><span class="lcn"><input type="text" inputmode="decimal" value="${v[i.id]}" data-inn="${i.id}" aria-label="${esc(i.label)} value"><span class="prog">${esc(i.unit||"")}</span></span></label>`).join("")}</div><div class="lcout" aria-live="polite">${calcOut(lab)}</div></div>`}
function calcOut(lab){let r;try{r=lab.compute(rt(lab.id).v)}catch(e){return `<p class="prog">Check the inputs.</p>`}
  return `<div class="lcres">${r.rows.map(([k,v,c])=>`<div><span class="lck">${esc(k)}</span><b class="lcv ${c||""}">${esc(v)}</b></div>`).join("")}</div>${r.svg?`<div class="lsvg">${r.svg}</div>`:""}${r.note?`<p class="lnote ${r.noteCls||""}">${esc(r.note)}</p>`:""}`}
function liveHTML(lab,st){const R=rt(lab.id);if(!R.ctx)return `<div class="llive"><p class="prog">Getting the latest report…</p></div>`;
  const L=lab.live;const badge=R.src==="live"?`Live from aviationweather.gov${R.time?" · issued "+esc(when(R.time)):""}`:R.src==="saved"?`The report you started with${R.time?" · issued "+esc(when(R.time)):""}`:esc(L.sampleNote||"Sample report. The live feed didn't answer, so this one's from the chapter.");
  return `<div class="llive"><div class="lbadge ${R.src==="live"?"on":""}">${badge}</div><pre class="lraw">${esc(R.raw)}</pre>${L.show?`<div class="prog">${L.show(R.ctx)}</div>`:""}<button type="button" class="btn small ghost" data-refetch>Get the latest report</button></div>`}
function parseCSV(t){const rows=[];let row=[],f="",q=false;t=String(t).replace(/\r/g,"");for(let i=0;i<t.length;i++){const c=t[i];if(q){if(c==='"'){if(t[i+1]==='"'){f+='"';i++}else q=false}else f+=c}else if(c==='"')q=true;else if(c===","){row.push(f);f=""}else if(c==="\n"){row.push(f);rows.push(row);row=[];f=""}else f+=c}if(f!==""||row.length){row.push(f);rows.push(row)}return rows.filter(r=>r.some(x=>x!==""))}
const isCSV=f=>/\.csv$/i.test(f.name);
function evTable(lab){const R=rt(lab.id),f=lab.files[R.tab||0],flt=(R.filter||"").toLowerCase();
  if(!isCSV(f)){const lines=String(f.text).split("\n").filter(l=>!flt||l.toLowerCase().includes(flt));return `<pre class="lraw levtxt">${esc(lines.join("\n"))}</pre><p class="prog">${lines.length} lines${flt?" match":""}</p>`}
  const [hd,...rows]=parseCSV(f.text);const shown=rows.filter(r=>!flt||r.join(" ").toLowerCase().includes(flt));
  return `<div class="tablewrap"><table><tr>${hd.map(h=>`<th>${esc(h)}</th>`).join("")}</tr>${shown.map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</table></div><p class="prog">${shown.length} of ${rows.length} rows</p>`}
function evidenceHTML(lab){const R=rt(lab.id);const sqlOn=R.tab==="sql";
  return `<div class="levd"><div class="ltabs" role="tablist">${lab.files.map((f,i)=>`<button type="button" role="tab" class="ltab ${!sqlOn&&(R.tab||0)===i?"on":""}" data-tab="${i}">${esc(f.name)}</button>`).join("")}${lab.sql?`<button type="button" role="tab" class="ltab ${sqlOn?"on":""}" data-tab="sql">SQL</button>`:""}</div>
   ${sqlOn?`<div class="lsql"><p class="prog">Each CSV is a table named after its file. Try <code>SELECT * FROM ${esc(tname(lab.files.find(isCSV)||{name:"t"}))} LIMIT 5</code>.</p><textarea rows="3" data-sqlq spellcheck="false">${esc(R.sqlq||"")}</textarea><div class="bar"><button type="button" class="btn small" data-sqlrun>Run</button><span class="prog" data-sqlst>${R.db?"Ready":""}</span></div><div data-sqlout>${R.sqlout||""}</div></div>`
   :`<input type="search" class="lsearch" placeholder="Filter rows" value="${esc(R.filter||"")}" data-filter aria-label="Filter rows"><div data-evt>${evTable(lab)}</div>`}</div>`}
const tname=f=>String(f.name).replace(/\.[^.]+$/,"").replace(/[^A-Za-z0-9_]/g,"_");
function loadSQL(){if(window.initSqlJs)return Promise.resolve(window.initSqlJs);return new Promise((ok,no)=>{const s=document.createElement("script");s.src=SQLJS+"sql-wasm.js";s.crossOrigin="anonymous";s.onload=()=>ok(window.initSqlJs);s.onerror=()=>no(new Error("load"));document.head.appendChild(s)})}
async function sqlDB(lab){const R=rt(lab.id);if(R.db)return R.db;const init=await loadSQL();const SQL=await init({locateFile:f=>SQLJS+f});const db=new SQL.Database();
  lab.files.filter(isCSV).forEach(f=>{const [hd,...rows]=parseCSV(f.text);const numeric=hd.map((_,c)=>rows.every(r=>r[c]===""||/^-?\d+(\.\d+)?$/.test(r[c])));
    db.run(`CREATE TABLE "${tname(f)}" (${hd.map((h,c)=>`"${h.replace(/"/g,"")}" ${numeric[c]?"REAL":"TEXT"}`).join(",")})`);const ins=db.prepare(`INSERT INTO "${tname(f)}" VALUES (${hd.map(()=>"?").join(",")})`);rows.forEach(r=>ins.run(hd.map((_,c)=>numeric[c]&&r[c]!==""?+r[c]:(r[c]??null))));ins.free()});
  return R.db=db}
function sortHTML(lab,st,locked){const S=lab.sort,a=arrOf(lab,st),R=rt(lab.id),byId=Object.fromEntries(S.items.map(i=>[i.id,i]));
  const item=id=>{const it=byId[id];return `<button type="button" class="lit ${R.sel===id?"sel":""}" data-it="${esc(id)}" ${locked?"disabled":`draggable="true"`} aria-pressed="${R.sel===id}">${esc(it.label)}${it.note?`<span class="prog">${esc(it.note)}</span>`:""}</button>`};
  const table=S.table?`<div class="tablewrap"><table>${S.table.map((r,ri)=>`<tr>${r.map(c=>ri?`<td>${esc(c)}</td>`:`<th>${esc(c)}</th>`).join("")}</tr>`).join("")}</table></div>`:"";
  if(S.mode==="order")return table+`<ol class="lord">${a.map((id,i)=>`<li class="lordi" data-oi="${i}" ${locked?"":`draggable="true"`}><span class="lordl">${esc(byId[id].label)}${byId[id].note?`<span class="prog">${esc(byId[id].note)}</span>`:""}</span>${locked?"":`<span class="lordb"><button type="button" class="btn small ghost" data-up="${i}" aria-label="Move ${esc(byId[id].label)} up" ${i?"":"disabled"}>↑</button><button type="button" class="btn small ghost" data-dn="${i}" aria-label="Move ${esc(byId[id].label)} down" ${i<a.length-1?"":"disabled"}>↓</button></span>`}</li>`).join("")}</ol>`;
  const pool=S.items.filter(it=>!a[it.id]).map(it=>item(it.id)).join("");
  const bk=b=>`<div class="lbk" data-b="${esc(b.id)}"><button type="button" class="lbkh" data-mv="${esc(b.id)}" ${locked?"disabled":""}>${esc(b.label)}${R.sel&&!locked?`<span class="prog"> · tap to place here</span>`:""}</button><div class="lbki">${S.items.filter(it=>a[it.id]===b.id).map(it=>item(it.id)).join("")}</div></div>`;
  return table+(pool||!locked?`<div class="lpool" data-b=""><span class="prog">${pool?(R.sel?"Now tap a box to place it.":"Tap a card, then tap the box it belongs in. On a computer you can drag."):"All placed. Tap a card to move it again."}</span>${pool}</div>`:"")+
    (S.grid?`<div class="lgridwrap"><span class="laxis ly">${esc(S.grid.y)} ↑</span><div class="lbks lgrid">${S.buckets.map(bk).join("")}</div><span class="laxis lx">${esc(S.grid.x)} →</span></div>`:`<div class="lbks">${S.buckets.map(bk).join("")}</div>`)}
function widgetHTML(lab,st,locked){return lab.kind==="chart"?chartHTML(lab):lab.kind==="calc"?calcHTML(lab):lab.kind==="live"?liveHTML(lab,st):lab.kind==="evidence"?evidenceHTML(lab):lab.kind==="sort"?`<div class="lsort">${sortHTML(lab,st,locked)}</div>`:""}
/* ----- questions ----- */
function qHTML(lab,st,q,i,ctx,env){const x=qst(st,q),fin=x.ok||x.shown,name=`lq_${lab.id}_${q.id}`;const hints=q.hints||[];
  let inp="";if(!ctx&&lab.kind==="live")inp=`<p class="prog">Waiting for the report.</p>`;
  else if(q.type==="choice")inp=`<div class="lqopts" role="radiogroup">${q.opts.map((o,oi)=>{const right=fin&&oi===val(q.a,ctx),mine=x.v!==undefined&&+x.v===oi;return `<label class="qopt ${fin?(right?"qright":mine&&!x.ok?"qwrong":""):""}"><input type="radio" name="${name}" value="${oi}" ${mine?"checked":""} ${fin?"disabled":""}> ${esc(o)}</label>`}).join("")}</div>`;
  else if(q.type==="number"||q.type==="text")inp=`<label class="lqin">${q.label?esc(q.label):"Your answer"}<input type="text" ${q.type==="number"?`inputmode="${q.kb||"decimal"}"`:""} autocomplete="off" value="${esc(x.v??"")}" ${fin?"disabled":""} data-qin="${esc(q.id)}"><span class="prog">${esc(q.unit||"")}</span></label>`;
  const fb=x.ok?`<p class="lfb good"><b>Correct.</b>${x.t?` On try ${x.t+1}.`:""}</p>`:x.shown?`<p class="lfb mid"><b>Here's the answer:</b> ${esc(answerText(lab,q,ctx))}</p>`:x.t?`<p class="lfb bad">${x.msg?esc(x.msg)+" ":""}Not yet. ${TRIES-x.t} ${TRIES-x.t===1?"try":"tries"} left before the answer shows.</p>`:"";
  const sol=fin?val(q.sol,ctx):null;
  return `<div class="labq ${x.ok?"ok":x.shown?"shown":""}" data-q="${esc(q.id)}" id="lq-${esc(lab.id)}-${esc(q.id)}"><p class="lqp"><span class="lqn">${i+1}</span><span>${q.pt?`<button type="button" class="lptc" data-ptq="${esc(q.pt)}">Point ${esc(q.pt)}</button> `:""}${q.q}</span></p>${inp}
   ${x.h?`<ul class="lhints">${hints.slice(0,x.h).map(h=>`<li>${val(h,ctx)}</li>`).join("")}</ul>`:""}${fb}
   ${fin?(sol&&sol.length?`<div class="mentor"><div class="who">Worked solution</div>${env.paras(sol)}</div>`:""):(ctx||lab.kind!=="live")?`<div class="bar"><button type="button" class="btn small" data-chk="${esc(q.id)}">${q.type==="sort"?"Check my sort":"Check"}</button>${x.h<hints.length?`<button type="button" class="btn small ghost" data-hint="${esc(q.id)}">Hint${hints.length>1?` (${hints.length-x.h} left)`:""}</button>`:""}<button type="button" class="linkbtn lshow" data-giveup="${esc(q.id)}">Show the answer</button></div>`:""}</div>`}
function labHTML(lab,st,k,n,env){const ctx=ctxOf(lab),d=done(lab,st),locked=qs(lab).filter(q=>q.type==="sort").every(q=>resolved(st,q))&&qs(lab).some(q=>q.type==="sort");
  const nres=qs(lab).filter(q=>resolved(st,q)).length;
  return `<div class="labhead"><span class="tag dom">Lab${n>1?` ${k+1} of ${n}`:""} · ${KIND[lab.kind]||lab.kind}</span><span class="prog">${d?"✓ Done":nres?`${nres} of ${qs(lab).length} answered`:`${qs(lab).length} question${qs(lab).length>1?"s":""}`}</span></div>
   <h2>${esc(lab.title)}</h2>${lab.hook?`<div class="mentor"><div class="who">${esc(env.mentor)}</div>${env.paras(lab.hook)}</div>`:""}
   <div class="labw">${widgetHTML(lab,st,locked)}</div>
   <div class="labqs">${qs(lab).map((q,i)=>qHTML(lab,st,q,i,ctx,env)).join("")}</div>
   ${lab.source?`<p class="prog labsrc">${lab.source}</p>`:""}${d||nres?`<div class="bar"><button type="button" class="linkbtn" data-reset>Clear this lab and try it again</button></div>`:""}`}
/* ----- live data ----- */
async function fetchLive(lab,force){const R=rt(lab.id),L=lab.live;R.ctx=null;
  let raw=null,time="";try{const ctl=new AbortController();const t=setTimeout(()=>ctl.abort(),7000);const r=await fetch(L.url,{signal:ctl.signal,cache:force?"no-cache":"default"});clearTimeout(t);if(r.ok){const j=await r.json();raw=j.raw||null;time=j.time||""}}catch(e){}
  let ctx=null;if(raw){try{ctx=L.parse(raw)}catch(e){ctx=null}}
  if(ctx){Object.assign(R,{raw,ctx,src:"live",time})}else Object.assign(R,{raw:L.sample,ctx:L.parse(L.sample),src:"sample",time:""})}
/* ----- mount: render a lab into el and wire it ----- */
function mount(el,lab,st,env){lab._R=env.R;const rerender=()=>mount(el,lab,st,env);
  if(lab.kind==="live"){const R=rt(lab.id);if(!R.ctx&&st.raw){try{Object.assign(R,{raw:st.raw,ctx:lab.live.parse(st.raw),src:st.src==="sample"?"sample":"saved",time:st.time||""})}catch(e){}}
    if(!R.ctx&&!R.loading){R.loading=true;fetchLive(lab).then(()=>{R.loading=false;if(el.isConnected)rerender()})}}
  const was=done(lab,st);el.innerHTML=labHTML(lab,st,env.k||0,env.n||1,env);
  const commit=()=>{if(lab.kind==="live"&&!st.raw){const R=rt(lab.id);st.raw=R.raw;st.src=R.src;st.time=R.time}env.save(lab,st,!was&&done(lab,st))};
  const $$=s=>[...el.querySelectorAll(s)];
  const qById=id=>qs(lab).find(q=>q.id===id);
  const readV=q=>{if(q.type==="choice"){const c=el.querySelector(`input[name="lq_${lab.id}_${q.id}"]:checked`);return c?c.value:null}if(q.type==="sort")return "sort";const i=el.querySelector(`[data-qin="${q.id}"]`);return i?i.value:null};
  $$("[data-chk]").forEach(b=>b.onclick=()=>{const q=qById(b.dataset.chk),x=qst(st,q),v=readV(q);if(v===null||String(v).trim()===""){b.textContent=q.type==="choice"?"Pick one first":"Type an answer first";return}
    const ok=check(lab,q,v,ctxOf(lab),st);x.v=q.type==="sort"?undefined:v;x.msg="";
    if(ok)x.ok=true;else{x.t++;if(q.type==="sort"){const s=sortScore(lab,st);x.msg=`${s.right} of ${s.total} are in the right place.`}else if(q.type==="number"&&num(v)===null)x.msg="That doesn't read as a number.";if(x.t>=TRIES)x.shown=true}
    commit();rerender();const n=el.querySelector(`#lq-${CSS.escape(lab.id)}-${CSS.escape(q.id)}`);if(n&&n.getBoundingClientRect().top<60)n.scrollIntoView({block:"start",behavior:"smooth"})});
  $$("[data-hint]").forEach(b=>b.onclick=()=>{const x=qst(st,qById(b.dataset.hint));x.h++;commit();rerender()});
  $$("[data-giveup]").forEach(b=>b.onclick=()=>{const x=qst(st,qById(b.dataset.giveup));x.shown=true;commit();rerender()});
  $$("[data-qin]").forEach(i=>i.onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();const b=el.querySelector(`[data-chk="${i.dataset.qin}"]`);if(b)b.click()}});
  const rs=el.querySelector("[data-reset]");if(rs)rs.onclick=()=>{if(!confirm("Clear your answers for this lab?"))return;for(const k of Object.keys(st))delete st[k];st.q={};if(lab.kind==="live"){const R=rt(lab.id);R.ctx=null}commit();rerender()};
  /* chart */
  const flash=n=>{if(!n)return;n.classList.remove("flash");void n.offsetWidth;n.classList.add("flash")};
  $$("[data-pt]").forEach(b=>b.onclick=()=>{const q=qs(lab).find(x=>x.pt===b.dataset.pt&&!resolved(st,x))||qs(lab).find(x=>x.pt===b.dataset.pt);if(!q)return;const n=el.querySelector(`#lq-${CSS.escape(lab.id)}-${CSS.escape(q.id)}`);n.scrollIntoView({block:"center",behavior:"smooth"});flash(n)});
  $$("[data-ptq]").forEach(b=>b.onclick=()=>{const p=el.querySelector(`[data-pt="${CSS.escape(b.dataset.ptq)}"]`),sc=el.querySelector(".lcscroll");if(!p)return;el.querySelector(".lchart").scrollIntoView({block:"start",behavior:"smooth"});if(sc)sc.scrollLeft=Math.max(0,p.offsetLeft-sc.clientWidth/2);flash(p)});
  const zb=el.querySelector("[data-zoom]");if(zb){const ch=el.querySelector(".lchart");if(rt(lab.id).zoom){ch.classList.add("zoomed");zb.textContent="Zoom out"}zb.onclick=()=>{const R=rt(lab.id);R.zoom=!R.zoom;ch.classList.toggle("zoomed",R.zoom);zb.textContent=R.zoom?"Zoom out":"Zoom in"}}
  /* calc */
  if(lab.kind==="calc"){const R=rt(lab.id),out=el.querySelector(".lcout");const inp=lab.inputs;
    const set=(id,v,from)=>{const i=inp.find(x=>x.id===id);let n=num(v);if(n===null)return;n=Math.min(i.max,Math.max(i.min,n));R.v[id]=n;if(from!=="r")el.querySelector(`[data-in="${id}"]`).value=n;if(from!=="n")el.querySelector(`[data-inn="${id}"]`).value=n;out.innerHTML=calcOut(lab)};
    $$("[data-in]").forEach(r=>r.oninput=()=>set(r.dataset.in,r.value,"r"));
    $$("[data-inn]").forEach(r=>{r.oninput=()=>{if(num(r.value)!==null)set(r.dataset.inn,r.value,"n")};r.onchange=()=>set(r.dataset.inn,r.value)});
    $$("[data-pre]").forEach(b=>b.onclick=()=>{const p=lab.presets[+b.dataset.pre];Object.entries(p.v).forEach(([k,v])=>set(k,v))})}
  /* live */
  const rf=el.querySelector("[data-refetch]");if(rf)rf.onclick=async()=>{const started=qs(lab).some(q=>(st.q||{})[q.id]&&(st.q[q.id].t||st.q[q.id].ok||st.q[q.id].shown));if(started&&!confirm("A new report means new answers. Clear this lab and start over with the latest report?"))return;for(const k of Object.keys(st))delete st[k];st.q={};rt(lab.id).ctx=null;rerender();await fetchLive(lab,true);commit();if(el.isConnected)rerender()};
  /* evidence */
  if(lab.kind==="evidence"){const R=rt(lab.id);
    $$("[data-tab]").forEach(b=>b.onclick=()=>{R.tab=b.dataset.tab==="sql"?"sql":+b.dataset.tab;rerender()});
    const fl=el.querySelector("[data-filter]");if(fl)fl.oninput=()=>{R.filter=fl.value;el.querySelector("[data-evt]").innerHTML=evTable(lab)};
    const run=el.querySelector("[data-sqlrun]");if(run)run.onclick=async()=>{const ta=el.querySelector("[data-sqlq]"),stEl=el.querySelector("[data-sqlst]"),out=el.querySelector("[data-sqlout]");R.sqlq=ta.value;stEl.textContent="Loading SQL…";
      try{const db=await sqlDB(lab);stEl.textContent="Ready";const res=db.exec(ta.value);R.sqlout=res.length?res.map(r=>`<div class="tablewrap"><table><tr>${r.columns.map(c=>`<th>${esc(c)}</th>`).join("")}</tr>${r.values.map(v=>`<tr>${v.map(c=>`<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</table></div><p class="prog">${r.values.length} rows</p>`).join(""):`<p class="prog">No rows.</p>`}
      catch(e){stEl.textContent="";R.sqlout=`<p class="lfb bad">${e.message==="load"?"SQL couldn't load. Check your connection; the filter still works.":esc(e.message)}</p>`}out.innerHTML=R.sqlout}}
  /* sort */
  if(lab.kind==="sort"){const S=lab.sort,R=rt(lab.id),a=arrOf(lab,st);
    const move=(id,b)=>{if(S.mode==="order")return;if(b)a[id]=b;else delete a[id];R.sel=null;commit();rerender()};
    $$("[data-it]").forEach(b=>{b.onclick=e=>{e.stopPropagation();R.sel=R.sel===b.dataset.it?null:b.dataset.it;rerender();const n=el.querySelector(`[data-it="${CSS.escape(b.dataset.it)}"]`);if(n)n.focus()};
      b.ondragstart=e=>{e.dataTransfer.setData("text/plain",b.dataset.it);e.dataTransfer.effectAllowed="move"}});
    $$("[data-mv]").forEach(b=>b.onclick=()=>{if(R.sel)move(R.sel,b.dataset.mv)});
    $$(".lbk,.lpool").forEach(z=>{z.onclick=e=>{if(R.sel&&!e.target.closest("[data-it]"))move(R.sel,z.dataset.b)};z.ondragover=e=>{e.preventDefault();z.classList.add("over")};z.ondragleave=()=>z.classList.remove("over");z.ondrop=e=>{e.preventDefault();z.classList.remove("over");const id=e.dataTransfer.getData("text/plain");if(id)move(id,z.dataset.b)}});
    const swap=(i,j)=>{if(j<0||j>=a.length)return;[a[i],a[j]]=[a[j],a[i]];commit();rerender()};
    $$("[data-up]").forEach(b=>b.onclick=()=>swap(+b.dataset.up,+b.dataset.up-1));$$("[data-dn]").forEach(b=>b.onclick=()=>swap(+b.dataset.dn,+b.dataset.dn+1));
    $$("[data-oi]").forEach(li=>{li.ondragstart=e=>e.dataTransfer.setData("text/plain",li.dataset.oi);li.ondragover=e=>e.preventDefault();li.ondrop=e=>{e.preventDefault();const from=+e.dataTransfer.getData("text/plain"),to=+li.dataset.oi;if(isNaN(from)||from===to)return;const [m]=a.splice(from,1);a.splice(to,0,m);commit();rerender()}})}
}
window.HalcyonLab={mount,done,check,num,parseCSV,sortScore,answerText,KIND};
})();
