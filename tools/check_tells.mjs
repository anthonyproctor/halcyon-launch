// Leading-answer check for decision scenes: can a test taker find the best option without knowing the material?
// rule = skip options that justify themselves (since / so that / because), then take the one with the most clauses.
// usage: node tools/check_tells.mjs <chapter.js> [...]   exit 1 if a file breaks a limit (rule > 35%, best longest > 35%, clause gap > 1, best shortest or fewest clauses > 40%)
import fs from 'fs';
const J=/\b(since|so that|so the|because)\b/i, cl=t=>t.split(/,| and |:|;/).length;
let bad=0;
function mock(f){ // mock/*.js: {q, opts:[strings], a}
  const src=fs.readFileSync(f,'utf8'); const w={}; new Function('window',src)(w); let n=0,hit=0,lng=0,sh=0,few=0,cb=0,co=0,no=0,jb=0,jo=0;
  for(const p of w.HALCYON_MOCK||[]) for(const q of p.questions){ n++; const os=q.opts.map((t,k)=>({t,s:k===q.a?3:0}));
    const sc=o=>(J.test(o.t)?-10:0)+cl(o.t), pk=os.reduce((a,b)=>sc(b)>sc(a)?b:a), L=os.reduce((a,b)=>b.t.length>a.t.length?b:a);
    if(pk.s===3)hit++; if(L.s===3)lng++; const S=os.reduce((a,b)=>b.t.length<a.t.length?b:a), F=os.reduce((a,b)=>cl(b.t)<cl(a.t)?b:a); if(S.s===3)sh++; if(F.s===3)few++; for(const o of os){ if(o.s===3){cb+=cl(o.t); if(J.test(o.t))jb++;} else {co+=cl(o.t); no++; if(J.test(o.t))jo++;} } }
  return {n,hit,lng,sh,few,cb,co,no,jb,jo};
}
for (const f of process.argv.slice(2)){
  if(/mock\//.test(f)){ const m=mock(f); if(!m.n) continue; const r=100*m.hit/m.n,l=100*m.lng/m.n,gap=m.cb/m.n-m.co/m.no,rs=100*m.sh/m.n,rf=100*m.few/m.n,fail=r>35||l>35||gap>1||rs>40||rf>40; if(fail)bad++;
    console.log(`${fail?'FAIL':'ok  '} ${f}: ${m.n} questions, rule ${r.toFixed(0)}%, key longest ${l.toFixed(0)}%, shortest ${rs.toFixed(0)}%, fewest clauses ${rf.toFixed(0)}%, clauses key ${(m.cb/m.n).toFixed(1)} vs others ${(m.co/m.no).toFixed(1)}, justify key ${m.jb} others ${m.jo}/${m.no}`); continue; }
  const src=fs.readFileSync(f,'utf8'); let i=0,n=0,hit=0,lng=0,sh=0,few=0,cb=0,co=0,no=0,jb=0,jo=0; const flagged=[];
  while((i=src.indexOf('opts:[',i))!==-1){let d=0,j=i+5;for(;j<src.length;j++){const c=src[j];if(c==='[')d++;else if(c===']'){d--;if(!d)break;}}
    const id=(src.slice(Math.max(0,src.lastIndexOf('id:`',i)),i).match(/id:`([^`]+)`/)||[])[1];
    const os=[...src.slice(i,j).matchAll(/\{t:`([^`]*)`,\s*s:(\d)/g)].map(m=>({t:m[1],s:+m[2]})); i=j;
    if(os.length<2||!os.some(o=>o.s===3)) continue; n++;
    const sc=o=>(J.test(o.t)?-10:0)+cl(o.t), p=os.reduce((a,b)=>sc(b)>sc(a)?b:a), L=os.reduce((a,b)=>b.t.length>a.t.length?b:a);
    if(p.s===3){hit++; flagged.push(id);} if(L.s===3) lng++;
    const S=os.reduce((a,b)=>b.t.length<a.t.length?b:a), F=os.reduce((a,b)=>cl(b.t)<cl(a.t)?b:a); if(S.s===3) sh++; if(F.s===3) few++;
    for(const o of os){ if(o.s===3){cb+=cl(o.t); if(J.test(o.t))jb++;} else {co+=cl(o.t); no++; if(J.test(o.t))jo++;} } }
  if(!n) continue;
  const r=100*hit/n, l=100*lng/n, gap=cb/n-co/no, rs=100*sh/n, rf=100*few/n, fail=r>35||l>35||gap>1||rs>40||rf>40;
  if(fail) bad++;
  console.log(`${fail?'FAIL':'ok  '} ${f}: ${n} decisions, rule ${r.toFixed(0)}%, best longest ${l.toFixed(0)}%, shortest ${rs.toFixed(0)}%, fewest clauses ${rf.toFixed(0)}%, clauses best ${(cb/n).toFixed(1)} vs others ${(co/no).toFixed(1)}, justify best ${jb} others ${jo}/${no}${flagged.length?'  rule finds: '+flagged.join(' '):''}`);
}
process.exit(bad?1:0);
