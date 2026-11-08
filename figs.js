/* Picture figures for exam items (Commission, the AFOQT course, 2026-11-07): Instrument Comprehension dials and aircraft, Block Counting piles,
   Table Reading grids. Pure string builders with no DOM, so the engine (engine.js figChart and optHTML), tools/voices.mjs, tools/check_course.mjs
   and the node tests all draw, speak and check them the same way. Every kind is <prop type="chart" kind="..."> with these attributes:
   kind="dials"   bank (degrees, left negative), pitch (degrees, climb positive), heading (0 to 359): an attitude indicator and a compass side by side.
                  The horizon card turns and slides; the aircraft symbol and the bank pointer at the top of the case stay fixed, so in a left bank the
                  pointer sits left of the card's zero index, and in a climb the horizon sits below the aircraft symbol. The compass needle points at the heading.
   kind="plane"   heading, bank, pitch, optional elev (the look down angle, default 4, so wings in level flight show as thin plates rather than a line): a small aircraft for an answer option, seen by an observer
                  who looks north from about the aircraft's altitude (east is on the right), so heading 270 flies left and heading 180 points the nose at the viewer.
   kind="blocks"  boxes="x,y,z,w,d,h;..." (corner and size per block, z up) and labels="1:0,2:5" (block number : box index): an isometric pile.
                  touches(boxes,i) lists the boxes that share part of a face with box i (corner and edge contact don't count).
   kind="xytable" seed (an integer) and n (default 10): a grid with X across from -n to n and Y down from n to -n; xyVal(seed,x,y) is a cell's value.
   draw(a) returns {svg,say} or null for other kinds; say(a) is the reading in words (the svg's aria-label, and what narration speaks);
   check(a,{option}) lists problems with a figure's attributes. */
(function(W){
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const D=Math.PI/180,r1=x=>Math.round(x*10)/10,P=(x,y)=>r1(x)+","+r1(y),N=v=>v===undefined||String(v).trim()===""?NaN:+v,num=v=>Number.isFinite(N(v))?N(v):0;
const KINDS=new Set(["dials","plane","blocks","xytable"]);let uid=0;
const PTS=["north","northeast","east","southeast","south","southwest","west","northwest"];
const norm=h=>((Math.round(h)%360)+360)%360;
function hdgSay(h){h=norm(h);const t=String(h).padStart(3,"0");return h%45===0?`heading ${PTS[h/45]}, ${t}`:`heading ${t}`}
function attSay(b,p){const bs=b?`banked ${Math.abs(b)} degrees ${b<0?"left":"right"}`:"wings level",ps=p>0?`climbing ${p} degrees`:p<0?`diving ${-p} degrees`:"nose level";
  return !b&&!p?"straight and level":`${ps}, ${bs}`}
const svgOf=(cls,vb,say,inner)=>`<svg viewBox="${vb}" role="img" aria-label="${esc(say)}" class="fchart fpic ${cls}">${inner}</svg>`;

/* ---- Instrument Comprehension: the two dials ---- */
function dials(a){const b=num(a.bank),p=num(a.pitch),h=num(a.heading),k=3.2,id="fai"+(++uid),pk=Math.max(-28,Math.min(28,p))*k;
  const say=`Attitude indicator: ${attSay(b,p)}. Compass: ${hdgSay(h)}.`;
  let ladder="";[-20,-10,10,20].forEach(d=>{ladder+=`<line x1="${d%20?-14:-24}" x2="${d%20?14:24}" y1="${-d*k}" y2="${-d*k}" class="fhz fthin"/>`});
  let ring="";[-60,-45,-30,-20,-10,10,20,30,45,60].forEach(t=>{const L=t%30===0?16:9,s=Math.sin(t*D),c=Math.cos(t*D);ring+=`<line x1="${r1(s*98)}" y1="${r1(-c*98)}" x2="${r1(s*(98-L))}" y2="${r1(-c*(98-L))}" class="fhz"/>`});
  let card="";for(let t=0;t<360;t+=10){const L=t%30===0?14:7,s=Math.sin(t*D),c=Math.cos(t*D);card+=`<line x1="${r1(s*98)}" y1="${r1(-c*98)}" x2="${r1(s*(98-L))}" y2="${r1(-c*(98-L))}" class="fhz${t%30?" fthin":""}"/>`}
  ["N","E","S","W"].forEach((l,i)=>{const s=Math.sin(i*90*D),c=Math.cos(i*90*D);card+=`<text x="${r1(s*70)}" y="${r1(-c*70+8)}" text-anchor="middle" class="fdl">${l}</text>`});
  const ai=`<g transform="translate(130,122)"><defs><clipPath id="${id}"><circle r="98"/></clipPath></defs><g clip-path="url(#${id})"><g transform="rotate(${r1(-b)})">`+
    `<g transform="translate(0,${r1(pk)})"><rect x="-240" y="-400" width="480" height="400" class="fsky"/><rect x="-240" y="0" width="480" height="400" class="fgnd"/><line x1="-240" x2="240" y1="0" y2="0" class="fhz fhzl"/>${ladder}</g>`+
    `${ring}<polygon points="0,-97 -8,-82 8,-82" class="fidx"/></g></g><circle r="99" class="fcase"/>`+
    `<polygon points="0,-99 -8,-113 8,-113" class="fptr"/><path d="M-62 0H-20L-10 11L0 0L10 11L20 0H62" class="facs"/><circle r="4" class="facd"/></g>`;
  const hi=`<g transform="translate(390,122)"><circle r="99" class="fcase fcard"/>${card}<g transform="rotate(${r1(norm(h))})"><polygon points="0,-84 10,-60 3.5,-60 3.5,34 -3.5,34 -3.5,-60 -10,-60" class="fndl"/></g><circle r="6" class="facd"/></g>`;
  const lab=`<text x="130" y="254" text-anchor="middle">Attitude</text><text x="390" y="254" text-anchor="middle">Compass</text>`;
  return {svg:svgOf("fk-dials","0 0 520 264",say,ai+hi+lab),say}}

/* ---- Instrument Comprehension: an aircraft picture. Body axes: f forward, r right wing, u up. World: E east, U up, N north.
   The observer looks north from a little above (elev), orthographic, faces sorted far to near (painter's order). ---- */
const SOL=[],PLT=[];
(function model(){const ring=(x,rad)=>[...Array(8)].map((_,i)=>[x,rad*Math.cos((i+.5)*Math.PI/4),rad*Math.sin((i+.5)*Math.PI/4)]);
  const rs=[ring(-4.7,.24),ring(-1.6,.58),ring(2.9,.58),ring(4.3,.27)],tip=[5.0,0,-.03];
  for(let s=0;s<3;s++)for(let i=0;i<8;i++){const j=(i+1)%8,A=rs[s],B=rs[s+1],x=(A[i][0]+B[i][0])/2;SOL.push({p:[A[i],A[j],B[j],B[i]],c:[x,0,0]})}
  for(let i=0;i<8;i++)SOL.push({p:[rs[3][i],rs[3][(i+1)%8],tip],c:[4.4,0,0],nose:1}); // the nose cone is dark (a radome), so a nose toward the viewer reads
  SOL.push({p:rs[0].slice().reverse(),c:[-4.2,0,0],noz:1}); // the tail end is an open nozzle, so a tail toward the viewer reads
  const cp=[[3.3,-.3,.42],[1.0,-.36,.48],[1.5,0,.9],[2.75,0,.98],[3.3,.3,.42],[1.0,.36,.48]],cc=[2.1,0,.5]; // canopy: a small tent on the nose
  [[0,1,2,3],[4,3,2,5],[0,3,4],[1,5,2]].forEach(f=>SOL.push({p:f.map(i=>cp[i]),c:cc,can:1}));
  const half=(sg,root0,root1,tip0,tip1,rr,rt,u)=>PLT.push({p:[[root0,sg*rr,u],[tip0,sg*rt,u],[tip1,sg*rt,u],[root1,sg*rr,u]]});
  [1,-1].forEach(sg=>{half(sg,1.1,-.9,-.5,-1.5,.5,5.1,-.08);half(sg,-3.5,-4.6,-4.25,-4.75,.22,1.95,.08)});
  PLT.push({p:[[-2.9,0,.45],[-4.15,0,2.2],[-4.75,0,2.2],[-4.7,0,.2]],fin:1})})();
function plane(a){const h=num(a.heading)*D,p=num(a.pitch)*D,b=num(a.bank)*D,e=(a.elev===undefined?4:num(a.elev))*D,S=15;
  const sh=Math.sin(h),ch=Math.cos(h),sp=Math.sin(p),cp=Math.cos(p),sb=Math.sin(b),cb=Math.cos(b);
  const F=[sh*cp,sp,ch*cp],R0=[ch,0,-sh],U0=[-sh*sp,cp,-ch*sp],Rv=R0.map((v,i)=>v*cb-U0[i]*sb),Uv=U0.map((v,i)=>v*cb+R0[i]*sb);
  const se=Math.sin(e),ce=Math.cos(e);
  const V=([f,r,u])=>{const E=f*F[0]+r*Rv[0]+u*Uv[0],U=f*F[1]+r*Rv[1]+u*Uv[1],Nn=f*F[2]+r*Rv[2]+u*Uv[2];return [E,U*ce+Nn*se,Nn*ce-U*se]};
  const Lt=(v=>{const m=Math.hypot(...v);return v.map(x=>x/m)})([-.45,.8,-.55]),upV=(()=>{const o=V([0,0,0]),t=V([0,0,1]);return t.map((x,i)=>x-o[i])})();
  const sub=(x,y)=>x.map((v,i)=>v-y[i]),dot=(x,y)=>x[0]*y[0]+x[1]*y[1]+x[2]*y[2];
  const newell=q=>{let n=[0,0,0];q.forEach((c,i)=>{const d=q[(i+1)%q.length];n[0]+=(c[1]-d[1])*(c[2]+d[2]);n[1]+=(c[2]-d[2])*(c[0]+d[0]);n[2]+=(c[0]-d[0])*(c[1]+d[1])});const m=Math.hypot(...n)||1;return n.map(x=>x/m)};
  const out=[];
  SOL.forEach(f=>{const q=f.p.map(V),n=newell(q),ctr=q.reduce((s,c)=>s.map((v,i)=>v+c[i]/q.length),[0,0,0]);let m=n;if(dot(m,sub(ctr,V(f.c)))<0)m=m.map(x=>-x);
    if(m[2]>.02)return;out.push({q,z:ctr[2],l:Math.max(0,dot(m,Lt)),can:f.can||f.nose,noz:f.noz})});
  PLT.forEach(f=>{const q=f.p.map(V);let m=newell(q),under=false;if(m[2]>0)m=m.map(x=>-x);if(!f.fin)under=dot(m,upV)<0;
    out.push({q,z:q.reduce((s,c)=>s+c[2],0)/q.length,l:Math.max(0,dot(m,Lt)),under,fin:f.fin})});
  out.sort((x,y)=>y.z-x.z);
  const g=out.map(o=>{const pct=o.can?0:Math.round(o.under||o.fin?8+30*o.l:30+70*o.l);
    return `<polygon points="${o.q.map(c=>P(c[0]*S,-c[1]*S)).join(" ")}" class="fpl${o.can?" fcan":o.noz?" fnoz":o.fin?" ffin":""}"${o.can||o.noz?"":` style="fill:color-mix(in srgb,var(--plhi) ${pct}%,var(--pllo))"`}/>`}).join("");
  const say=`Aircraft ${attSay(num(a.bank),num(a.pitch))}, ${hdgSay(num(a.heading))}.`;
  return {svg:svgOf("fk-plane","-100 -82 200 164",say,g),say}}

/* ---- Block Counting ---- */
function parseBoxes(s){if(Array.isArray(s))return s;return String(s||"").split(";").map(t=>t.trim()).filter(Boolean).map(t=>t.split(",").map(Number)).map(v=>v.length===6&&v.every(Number.isFinite)?{x:v[0],y:v[1],z:v[2],w:v[3],d:v[4],h:v[5]}:null)}
const ov=(a0,a1,b0,b1)=>Math.min(a1,b1)-Math.max(a0,b0),EPS=1e-9;
const ovs=(A,C)=>[ov(A.x,A.x+A.w,C.x,C.x+C.w),ov(A.y,A.y+A.d,C.y,C.y+C.d),ov(A.z,A.z+A.h,C.z,C.z+C.h)];
// the boxes sharing part of a face with box i: flush on one axis, a positive overlap on the other two
function touches(boxes,i){const B=parseBoxes(boxes),A=B[i];if(!A)return [];return B.map((_,j)=>j).filter(j=>{if(j===i||!B[j])return false;const o=ovs(A,B[j]);return o.filter(v=>Math.abs(v)<EPS).length===1&&o.filter(v=>v>EPS).length===2})}
const floating=boxes=>{const B=parseBoxes(boxes);return B.map((A,i)=>i).filter(i=>{const A=B[i];if(!A||A.z<=EPS)return false;return !B.some(C=>C&&C!==A&&Math.abs(C.z+C.h-A.z)<EPS&&ov(A.x,A.x+A.w,C.x,C.x+C.w)>EPS&&ov(A.y,A.y+A.d,C.y,C.y+C.d)>EPS)})};
const overlapping=boxes=>{const B=parseBoxes(boxes),o=[];B.forEach((A,i)=>B.forEach((C,j)=>{if(j>i&&A&&C&&ovs(A,C).every(v=>v>EPS))o.push([i,j])}));return o};
const parseLabels=s=>String(s||"").split(",").map(t=>t.trim()).filter(Boolean).map(t=>{const [n,i]=t.split(":").map(x=>x.trim());return {n,i:+i}});
// isometric: x runs down to the right, y down to the left, z up. Seen from +x +y +z: the top, +x and +y faces show.
const ISO=(x,y,z)=>[(x-y)*.866,(x+y)*.5-z];
function blockOrder(B){const behind=(A,C)=>A.x+A.w<=C.x+EPS||A.y+A.d<=C.y+EPS||A.z+A.h<=C.z+EPS,left=B.map((_,i)=>i),o=[];
  while(left.length){let k=left.findIndex(i=>left.every(j=>j===i||!behind(B[j],B[i])||behind(B[i],B[j])));if(k<0)k=0;o.push(left.splice(k,1)[0])}return o}
const hexOf=A=>{const x1=A.x+A.w,y1=A.y+A.d,z1=A.z+A.h;return [[A.x,A.y,z1],[x1,A.y,z1],[x1,A.y,A.z],[x1,y1,A.z],[A.x,y1,A.z],[A.x,y1,z1]].map(c=>ISO(...c))};
const inside=(pt,poly)=>{let s=0;for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],c=(b[0]-a[0])*(pt[1]-a[1])-(b[1]-a[1])*(pt[0]-a[0]);if(Math.abs(c)<1e-6)return false;if(s&&Math.sign(c)!==s)return false;s=Math.sign(c)}return true};
function blockLayout(a){const B=parseBoxes(a.boxes).filter(Boolean),ord=blockOrder(B),pos=new Map(ord.map((b,k)=>[b,k])),L=parseLabels(a.labels);
  // a label goes on the numbered block's face that shows the most (the top first): a 7 by 7 sample of each face, minus the points a block drawn
  // later covers, and the visible sample nearest the middle of what shows
  const spots=L.map(({n,i})=>{const A=B[i];if(!A)return {n,i,pt:null,hidden:true};const x1=A.x+A.w,y1=A.y+A.d,z1=A.z+A.h,later=ord.slice(pos.get(i)+1).map(j=>hexOf(B[j])),g=[...Array(7)].map((_,k)=>(k+.5)/7);
    const faces=[(u,v)=>ISO(A.x+u*A.w,A.y+v*A.d,z1),(u,v)=>ISO(x1,A.y+u*A.d,A.z+v*A.h),(u,v)=>ISO(A.x+u*A.w,y1,A.z+v*A.h)].map(f=>g.flatMap(u=>g.map(v=>f(u,v))).filter(c=>!later.some(h=>inside(c,h))));
    const best=faces[0].length>=20?faces[0]:faces.reduce((m,f)=>f.length>m.length?f:m,[]);if(best.length<4)return {n,i,pt:ISO(A.x+A.w/2,A.y+A.d/2,z1),hidden:true};
    const c=[best.reduce((s,p)=>s+p[0],0)/best.length,best.reduce((s,p)=>s+p[1],0)/best.length],pt=best.reduce((m,p)=>Math.hypot(p[0]-c[0],p[1]-c[1])<Math.hypot(m[0]-c[0],m[1]-c[1])?p:m);
    return {n,i,pt,hidden:false}});
  return {B,ord,spots}}
function blocks(a){const {B,ord,spots}=blockLayout(a),S=40,X=v=>r1(v*S);let mnx=1e9,mny=1e9,mxx=-1e9,mxy=-1e9;
  B.forEach(A=>hexOf(A).forEach(([x,y])=>{mnx=Math.min(mnx,x);mxx=Math.max(mxx,x);mny=Math.min(mny,y);mxy=Math.max(mxy,y)}));
  let g="";ord.forEach(i=>{const A=B[i],x1=A.x+A.w,y1=A.y+A.d,z1=A.z+A.h,f=(c,cl)=>`<polygon points="${c.map(p=>{const s=ISO(...p);return X(s[0])+","+X(s[1])}).join(" ")}" class="${cl}"/>`;
    g+=f([[A.x,A.y,z1],[x1,A.y,z1],[x1,y1,z1],[A.x,y1,z1]],"fbt")+f([[x1,A.y,A.z],[x1,y1,A.z],[x1,y1,z1],[x1,A.y,z1]],"fbr")+f([[A.x,y1,A.z],[x1,y1,A.z],[x1,y1,z1],[A.x,y1,z1]],"fbl")});
  spots.forEach(s=>{if(!s.pt)return;g+=`<circle cx="${X(s.pt[0])}" cy="${X(s.pt[1])}" r="14" class="fbn"/><text x="${X(s.pt[0])}" y="${X(s.pt[1])+7}" text-anchor="middle" class="fbnt">${esc(s.n)}</text>`});
  const pad=20,vb=`${X(mnx)-pad} ${X(mny)-pad} ${r1((mxx-mnx)*S+2*pad)} ${r1((mxy-mny)*S+2*pad)}`;
  const zs=[...new Set(B.map(A=>A.z))].sort((p,q)=>p-q),lay=zs.map(z=>B.filter(A=>A.z===z).length);
  const say=`${a.title?a.title+". ":""}A pile of ${B.length} blocks${zs.length>1?`, ${lay.map((c,k)=>`${c} ${k?`in layer ${k+1}`:"on the bottom"}`).join(", ")}`:""}. Numbered blocks: ${spots.map(s=>s.n).join(", ")}.`;
  return {svg:svgOf("fk-blocks",vb,say,g),say}}

/* ---- Table Reading ---- */
const mix=(s,x,y)=>{let h=Math.imul(s|0,374761393)^Math.imul(x|0,668265263)^Math.imul(y|0,1274126177);h=Math.imul(h^(h>>>13),1274126177);h^=h>>>16;return h>>>0};
// a cell's two digit value: a gentle slope across X and down Y (set by the seed) plus a wobble of one, so neighbors look alike
function xyVal(seed,x,y){const s=seed|0,hs=mix(s,977,-31),ax=1+(hs&1),ay=1+((hs>>1)&1),c=53+((hs>>2)%5);return Math.max(10,Math.min(99,c+ax*x-ay*y+(mix(s,x,y)%3)-1))}
// the values next to a cell (eight neighbors), distinct and never the cell's own value: distractors that punish a one row or one column slip
function xyNear(seed,x,y,n=10){const v=xyVal(seed,x,y),o=[];for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]]){const X=x+dx,Y=y+dy;if(Math.abs(X)>n||Math.abs(Y)>n)continue;const w=xyVal(seed,X,Y);if(w!==v&&!o.includes(w))o.push(w)}return o}
function xytable(a){const n=Math.max(1,Math.min(15,Math.round(N(a.n)||10))),sd=num(a.seed),xs=[],ys=[];for(let k=-n;k<=n;k++){xs.push(k);ys.unshift(k)}
  const say=`${a.title?a.title+". ":""}A table of two digit numbers, X across from ${-n} to ${n} and Y down from ${n} to ${-n}. Each answer is the number where a column and a row meet.`;
  const t=`<div class="tablewrap xyt" role="region" tabindex="0" aria-label="${esc(say)}"><table><thead><tr><th scope="col" class="xyc">Y \\ X</th>${xs.map(x=>`<th scope="col">${x}</th>`).join("")}</tr></thead><tbody>${ys.map(y=>`<tr><th scope="row">${y}</th>${xs.map(x=>`<td>${xyVal(sd,x,y)}</td>`).join("")}</tr>`).join("")}</tbody></table></div><p class="xyhint">Swipe the grid sideways to see every column.</p>`;
  return {svg:t,say}}

function draw(a){if(!a||a.type!=="chart"||!KINDS.has(a.kind))return null;return ({dials,plane,blocks,xytable})[a.kind](a)}
// what a listener hears for the figure (its aria-label): the readings, never the markup
function say(a){const d=a&&a.type==="chart"&&KINDS.has(a.kind)?draw(a):null;return d?d.say:""}
function check(a,o={}){const e=[];if(!a||!KINDS.has(a.kind))return e;const need=(k,lo,hi)=>{const v=N(a[k]);if(!Number.isFinite(v))e.push(`${a.kind} needs ${k}`);else if(v<lo||v>hi)e.push(`${a.kind} ${k} ${v} outside ${lo} to ${hi}`)};
  if(!o.option&&!a.title)e.push(`${a.kind} figure needs a title`);
  if(a.kind==="dials"||a.kind==="plane"){need("bank",-90,90);need("pitch",-45,45);need("heading",0,359)}
  if(a.kind==="blocks"){const B=parseBoxes(a.boxes);if(!B.length)e.push("blocks needs boxes");B.forEach((b,i)=>{if(!b)e.push(`blocks box ${i} needs six numbers x,y,z,w,d,h`);else if(b.w<=0||b.d<=0||b.h<=0)e.push(`blocks box ${i} needs a positive size`)});
    if(B.every(Boolean)){overlapping(B).forEach(([i,j])=>e.push(`blocks boxes ${i} and ${j} overlap`));floating(B).forEach(i=>e.push(`blocks box ${i} floats (nothing under it)`));
      const L=parseLabels(a.labels);if(!L.length)e.push("blocks needs labels");L.forEach(({n,i})=>{if(!B[i])e.push(`blocks label ${n} names box ${i}, which isn't there`)});
      if(new Set(L.map(l=>l.n)).size!==L.length)e.push("blocks label numbers repeat");if(L.every(l=>B[l.i]))blockLayout(a).spots.forEach(s=>{if(s.hidden)e.push(`blocks label ${s.n} has no face in view`)})}}
  if(a.kind==="xytable"){if(!Number.isInteger(N(a.seed)))e.push("xytable needs an integer seed");if(a.n!==undefined&&!(Number.isInteger(N(a.n))&&N(a.n)>=2&&N(a.n)<=15))e.push("xytable n is 2 to 15")}
  return e}
W.HalcyonFigs={KINDS:[...KINDS],draw,say,check,xyVal,xyNear,parseBoxes,touches,floating,overlapping};
})(typeof window!=="undefined"?window:globalThis);
