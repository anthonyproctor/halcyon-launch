// Audiobook follow-along text: one word index per chapter and edition, so the Audiobook page can show the words being read,
// highlight the current one, and seek when a paragraph is tapped. Writes, next to each edition's mp3 (from audiobook.json):
//   <audio>/episodes/chNN-story.json and chNN-study.json
//   {v:1, n, ed, src, sting, dur, p:[[pageId, "word word word", [start, start, ...]], ...]}
// one entry per spoken paragraph; the words are split on single spaces, one start time (seconds on the mp3's clock) per word.
// The episode clock is rebuilt the way the mp3 was assembled (same as tools/book_marks.mjs): the opening sting, then each page clip
// in plan order with its pause after it (4 s after a decision page, 1.2 s otherwise). Story only is one page ("story").
// The words are the page word timings (<audio>/pages/fN[s]/timings.json), so what shows is what was read. Paragraph breaks and
// punctuation come from the narration script (tools/pages.mjs, the right-answer path), lined up word by word with the timings; any
// stretch where the script and the timings disagree shows the timing words. No audio is rendered or touched.
// Skips an edition when the rebuilt clock doesn't add up to the mp3's real length (within 0.35 s), or when its audio or timings
// have uncommitted changes in git (still being narrated; --dirty to index anyway).
// usage: node tools/book_text.mjs --v2                 PMP v2 (audio/v2)
//        node tools/book_text.mjs --course pilot       a course in courses/<id>
//        add --chapters 1,4 for only those chapters. Safe to re-run; it rewrites only the files it indexes.
// tools/book_marks.sh runs it (with --dirty) after the bookmarks, so narrate_v2.sh, narrate_pilot.sh and narrate_course.sh index each new chapter.
// The engine checks each index against the mp3's length and hides the text if the audio was re-rendered after the index was built.
import fs from 'fs';
import path from 'path';
import {execFileSync} from 'child_process';
import {fileURLToPath} from 'url';
process.chdir(path.join(path.dirname(fileURLToPath(import.meta.url)),'..')); // paths below are from the repo root
const A=process.argv.slice(2),arg=k=>A.includes(k)?A[A.indexOf(k)+1]:null;
const CID=arg('--course'),V2=A.includes('--v2')&&!CID,DIRTY=A.includes('--dirty');
const ONLY=arg('--chapters')?new Set(arg('--chapters').split(',').map(Number)):null;
const ROOT=CID?`courses/${CID}/`:'',ADIR=ROOT+'audio'+(V2?'/v2':'');
const TMP=(process.env.TMPDIR||'/tmp').replace(/\/$/,'')+'/halcyon-booktext';fs.mkdirSync(TMP,{recursive:true});
const TOL=0.35;
const dur=f=>{try{return +execFileSync('ffprobe',['-v','error','-show_entries','format=duration','-of','csv=p=0',f]).toString()}catch(e){return NaN}};
const STING=[dur('audio/sting-open.mp3'),dur('audio/sting-close.mp3')]; // tools/add_stings.sh wraps every edition in these
let dirtySet=null;
const dirty=p=>{if(DIRTY)return false;if(!dirtySet){dirtySet=execFileSync('git',['status','--porcelain','--',ADIR]).toString().split('\n').filter(Boolean).map(l=>l.slice(3).replace(/^"|"$/g,''))}
  return dirtySet.some(d=>d===p||d.startsWith(p.replace(/\/?$/,'/'))||p.startsWith(d.replace(/\/?$/,'/')))};
const HAS=/[\p{L}\p{N}_]/u;
const toks=t=>String(t).split(/\s+/).filter(w=>HAS.test(w)); // = render_pages*.py: source words are the segment split on spaces
const key=w=>String(w).toLowerCase().normalize('NFKD').replace(/[^\p{L}\p{N}]/gu,'');
// script words S (with display text) against timing words W -> for each W index, the display word (script punctuation where they agree)
// and which script paragraph it sits in. Greedy walk that resyncs on the nearest 3-word run that agrees.
function line(S,W){const out=new Array(W.length);let i=0,j=0;const sk=S.map(s=>key(s.w)),wk=W.map(w=>key(w[0]));
  const same=(a,b)=>a<S.length&&b<W.length&&sk[a]===wk[b];
  while(j<W.length){
    if(same(i,j)){out[j]={w:S[i].w,p:S[i].p,m:1};i++;j++;continue}
    let hit=null;
    for(let d=1;d<=80&&!hit;d++)for(let di=0;di<=d;di++){const dj=d-di;if(same(i+di,j+dj)&&same(i+di+1,j+dj+1)&&same(i+di+2,j+dj+2)){hit=[di,dj];break}}
    if(!hit){const p=i<S.length?S[i].p:S.length?S[S.length-1].p:0;for(;j<W.length;j++)out[j]={w:W[j][0],p};break}
    const [di,dj]=hit;for(let k=0;k<dj;k++)out[j+k]={w:W[j+k][0],p:S[Math.min(i+Math.min(k,Math.max(0,di-1)),S.length-1)].p};i+=di;j+=dj} // paragraph never steps back
  return out}
// narration script (tools/pages.mjs, run in dir) lined up with this edition's timings -> paragraphs [[pid, words[], times[]]] on the episode clock
function script(n,ed,dir,T){const out=`${TMP}/ch${n}-${ed}${dir==='.'?'':'-head'}.json`;
  execFileSync('node',['tools/pages.mjs','full',String(n),out,...(ed==='story'?['--story']:[]),...(CID?['--course',CID]:[]),...(V2?['--v2']:[])],{cwd:dir,stdio:['ignore','ignore','ignore']});
  const J=JSON.parse(fs.readFileSync(out,'utf8'));const plan=J.plan;if(plan.some(p=>!T[p]||!J.pages[p]))return null;
  const P=[];let off=STING[0],agree=0,total=0;
  for(const pid of plan){
    const S=[];let pi=0,open=false;for(const s of J.pages[pid]){if('pause' in s){if(open){pi++;open=false}continue}for(const w of toks(s.t)){S.push({w,p:pi});open=true}}
    const W=T[pid].w,L=line(S,W);const base=P.length;
    W.forEach((w,k)=>{const x=L[k],q=base+x.p;while(P.length<=q)P.push([pid,[],[]]);P[q][1].push(x.w);P[q][2].push(+(off+w[1]).toFixed(2));total++;if(x.m)agree++});
    for(let q=P.length-1;q>=base;q--)if(!P[q][1].length)P.splice(q,1);
    off+=T[pid].d+(pid.startsWith('s')&&pid!=='story'?4:1.2)} // pauses = render_pages*.py episode
  return {P,agree,total,off}}
// the committed chapter text and script tools, unpacked once into TMP/head
let SNAP=null;
function snap(){if(SNAP)return SNAP;SNAP=TMP+'/head';fs.rmSync(SNAP,{recursive:true,force:true});fs.mkdirSync(SNAP,{recursive:true});
  const tar=execFileSync('git',['archive','HEAD','tools/pages.mjs','tools/voices.mjs','order.js','courses.js',CID?`courses/${CID}/full`:'full'],{maxBuffer:1<<28});
  execFileSync('tar',['-x','-C',SNAP],{input:tar});return SNAP}
const nn=n=>String(n).padStart(2,'0');
const B=JSON.parse(fs.readFileSync(ADIR+'/audiobook.json','utf8')).full;
const report={ok:[],skip:[]};
for(const n of Object.keys(B).map(Number).sort((a,b)=>a-b)){if(ONLY&&!ONLY.has(n))continue;
  for(const ed of ['story','study']){const M=B[n][ed];if(!M)continue;
    const mp3=ROOT+M.src,tdir=`${ADIR}/pages/f${n}${ed==='story'?'s':''}`,tf=tdir+'/timings.json',tag=`ch${n} ${ed}`;
    if(!fs.existsSync(mp3)||!fs.existsSync(tf)){report.skip.push(`${tag}: no audio or timings`);continue}
    const file=`${ADIR}/episodes/ch${nn(n)}-${ed}.json`;
    const stale=why=>{let gone='';try{const o=JSON.parse(fs.readFileSync(file,'utf8'));if(!(Math.abs(o.dur-dur(mp3))<=TOL)){fs.rmSync(file);gone=', removed the old index (it no longer matches the mp3)'}}catch(e){}report.skip.push(`${tag}: ${why}${gone}`)};
    if(dirty(mp3)||dirty(tdir)){stale('audio has uncommitted changes (being narrated?), not indexed');continue}
    const T=JSON.parse(fs.readFileSync(tf,'utf8'));
    // the script from the chapter text as it is now; if that no longer matches what was narrated (text edited since), the committed text
    let R;try{R=script(n,ed,'.',T);if(R&&R.agree<R.total*0.995){try{const H=script(n,ed,snap(),T);if(H&&H.agree>R.agree)R={...H,head:1}}catch(e){}}}catch(e){report.skip.push(`${tag}: the narration script didn't build (${String(e.message).split('\n')[0]})`);continue} // one bad chapter never stops the run
    if(!R){report.skip.push(`${tag}: timings missing pages of the plan`);continue}
    const {P,agree,total,off}=R;
    const want=off+STING[1],got=dur(mp3);
    if(!(Math.abs(want-got)<=TOL)){stale(`timings add up to ${want.toFixed(2)} s but the mp3 is ${got.toFixed(2)} s (audio and timings from different renders)`);continue}
    // times must not go backwards
    // (a word the aligner placed late, past the next word's start, is pulled back to it, so the highlight never runs backwards)
    const all=P.flatMap(p=>p[2].map((t,k)=>[p[2],k]));let back=0;
    for(let k=all.length-2;k>=0;k--){const [a,i]=all[k],[b,j]=all[k+1];if(a[i]>b[j]+0.01){a[i]=b[j];back++}}
    fs.mkdirSync(path.dirname(file),{recursive:true});
    const doc={v:1,n,ed,src:M.src,sting:+STING[0].toFixed(3),dur:+got.toFixed(2),p:P.map(([pid,w,t])=>[pid,w.join(' '),t])};
    fs.writeFileSync(file+'.tmp',JSON.stringify(doc));fs.renameSync(file+'.tmp',file);
    report.ok.push(`${tag}: ${P.length} paragraphs, ${total} words, script lined up on ${(agree/total*100).toFixed(1)}%${R.head?' (committed chapter text)':''}${back?`, ${back} late word times pulled back`:''} -> ${file}`)}}
for(const l of report.ok)console.log('ok  ',l);for(const l of report.skip)console.log('skip',l);
