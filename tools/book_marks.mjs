// Find where each reading page (open, lesson, s0..sN, end) starts inside each audiobook file.
// Writes audio/bookmarks.json (with --v2, audio/v2/bookmarks.json from full/v2/):
// {"full":{"1":{"story":[["open",6.6],["s0",170.2],...],"study":[...]}}}
// Word times come from the page word timings the renderer wrote (<audio>/pages/fN[s]/timings.json, forced-aligned per page),
// laid out the way the episode was assembled: open sting, then each page clip in plan order with its pause (4 s after a decision,
// 1.2 s otherwise). That reconstruction is only used when it adds up to the mp3's real length (within 0.35 s); otherwise
// (no timings, or audio and timings from different renders) it falls back to the whisper transcripts from book_marks.sh.
// The whisper fallback spreads each segment's words evenly across the segment, so it can land a few seconds off.
// Each mark sits LEAD seconds before the first word of the page. --chapters 1,4 rewrites only those chapters and keeps the rest.
import fs from 'fs';
import {execFileSync} from 'child_process';
const CID=process.argv.includes('--course')?process.argv[process.argv.indexOf('--course')+1]:null; // no --course = the PMP course
const V2=process.argv.includes('--v2')&&!CID; // --v2: the PMP v2 preview (full/v2/ chapters, audio/v2/ files, audio/v2/bookmarks.json)
const ROOT=CID?`courses/${CID}/`:'';const BM='/tmp/claude-501/bm'+(CID?'-'+CID:'')+(V2?'-v2':'');const CDIR=ROOT+'full'+(V2?'/v2':''),ADIR=ROOT+'audio'+(V2?'/v2':''),AID='audio'+(V2?'_v2':'');
const st={flags:{},score:24,m:{trust:60,conf:60,health:60}};
const W=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen'];
const plain=s=>String(s).replace(/<prop\s+[^>]*>([\s\S]*?)<\/prop>/g,'$1').replace(/<[^>]+>/g,' ');
const NUM=new Set([...W,'twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety','hundred','thousand']);
const norm=s=>plain(s).toLowerCase().replace(/[^a-z0-9' ]+/g,' ').replace(/'/g,'').split(/\s+/).filter(w=>w&&!/\d/.test(w)&&!NUM.has(w)); // numbers dropped: whisper writes 31 where the text says thirty-one
const LEAD=0.2,TOL=0.35;
const ONLY=process.argv.includes('--chapters')?new Set(process.argv[process.argv.indexOf('--chapters')+1].split(',').map(Number)):null;
const dur=f=>{try{return +execFileSync('ffprobe',['-v','error','-show_entries','format=duration','-of','csv=p=0',f]).toString()}catch(e){return NaN}};
const STING=[dur('audio/sting-open.mp3'),dur('audio/sting-close.mp3')]; // tools/add_stings.sh wraps every edition in these
function timed(C,ed,mp3){ // page timings -> [[word, time]] on the episode clock, or null when they don't match this mp3
  const tf=`${ADIR}/pages/f${C.num}${ed==='story'?'s':''}/timings.json`;if(!fs.existsSync(tf)||!fs.existsSync(mp3))return null;
  const T=JSON.parse(fs.readFileSync(tf,'utf8'));
  const plan=ed==='story'?['story']:[...(T.intro?['intro']:[]),'open',...(C.lesson?['lesson']:[]),...C.scenes.flatMap((sc,i)=>['s'+i,`o${i}_${sc.opts.findIndex(o=>o.best)}`]),'end']; // = tools/pages.mjs plan
  if(plan.some(p=>!T[p]))return null;
  const out=[];let off=STING[0];
  for(const p of plan){for(const [w,a] of T[p].w){const x=norm(w);if(!x.length)out.push(['#',off+a]);for(const y of x)out.push([y,off+a])}off+=T[p].d+(p.startsWith('s')&&p!=='story'?4:1.2)} // pauses = render_pages*.py episode
  const want=off+STING[1],got=dur(mp3);
  if(!(Math.abs(want-got)<=TOL)){console.log(`ch${C.num} ${ed}: timings add up to ${want.toFixed(2)} s but ${mp3} is ${got.toFixed(2)} s, using whisper`);return null}
  return out}
function words(file){ // whisper segments -> [[word, time]] with times spread across each segment
  const j=JSON.parse(fs.readFileSync(file,'utf8'));const out=[];
  for(const s of j.transcription){const a=s.offsets.from/1000,b=s.offsets.to/1000;const w=norm(s.text);w.forEach((x,i)=>out.push([x,a+(b-a)*i/Math.max(1,w.length)]))}
  return out}
function find(ws,anchor,from){ // best fuzzy match of the anchor's first 8 words at or after index `from` (indexes into ws)
  const a=norm(anchor).slice(0,8);if(a.length<3)return null;
  const I=[];for(let i=from;i<ws.length;i++)if(ws[i][0]!=='#')I.push(i); // match on words only: '#' number slots (timings) don't use up the window
  let best=null,bs=0,bg=0;
  for(let k=0;k<I.length;k++){const w0=ws[I[k]][0];if(w0!==a[0]&&w0!==a[1])continue; // in-order match within a short window, tolerant of split or merged words
    let s=0,j=k,f=-1,l=k;for(let q=0;q<a.length;q++){for(let x=j;x<Math.min(I.length,k+a.length+4);x++)if(ws[I[x]][0]===a[q]){s++;j=x+1;if(f<0)f=x;l=x;break}}
    const g=f<0?0:l-f+1-s; // words skipped inside the match: a common first word ("the") a few words early skips the real start
    if(s>bs||(s===bs&&g<bg)){bs=s;bg=g;best=f}if(s===a.length&&g===0)break}
  if(best===null||bs<Math.ceil(a.length*0.6))return null;
  best=I[best]; // the mark goes on the first word that matched
  // an anchor that opens with a number ("8:57, Strasburg, ...") matched on its first word norm() keeps: step back over the
  // number words just before it ('#' slots, timings only) so the mark lands on "8:57", not "Strasburg"
  let lead=0;for(const r of plain(anchor).trim().split(/\s+/)){if(norm(r).length)break;lead++}
  while(lead-->0&&best>0&&ws[best-1][0]==='#'&&ws[best][1]-ws[best-1][1]<2.5)best--;
  return best}
const M=ONLY&&!process.argv.includes('--out')&&fs.existsSync(ADIR+'/bookmarks.json')?JSON.parse(fs.readFileSync(ADIR+'/bookmarks.json','utf8')):{full:{}};let miss=0;const SRC={timings:0,whisper:0};
for(const f of fs.readdirSync(CDIR).filter(f=>/^ch\d+\.js$/.test(f)).sort()){
  globalThis.window={};new Function('window',fs.readFileSync(CDIR+'/'+f,'utf8'))(globalThis.window);
  const C=CID?globalThis.window.HALCYON_DATA[CID].full[0]:globalThis.window.HALCYON_FULL[0],nn=String(C.num).padStart(2,'0');
  const keep=p=>!(/\?\s*$/.test(plain(p).trim())&&plain(p).trim().split(/\s+/).length<14); // story edition drops short questions
  if(ONLY&&!ONLY.has(C.num))continue;
  for(const [ed,id] of [['story',`${AID}_story_full-ch${nn}`],['study',`${AID}_full-ch${nn}`]]){
    const mp3=`${ADIR}/${ed==='story'?'story/':''}full-ch${nn}.mp3`,file=`${BM}/${id}.json`;
    let ws=timed(C,ed,mp3);const src=ws?'timings':'whisper';if(!ws){if(!fs.existsSync(file))continue;ws=words(file)}SRC[src]++;
    const anchors=[['open',C.opening[0]]];
    if(ed==='study'&&C.lesson)anchors.push(['lesson',CID||V2?`${C.lesson.title}.`:`Ruth's whiteboard. ${C.lesson.title}.`]);
    C.scenes.forEach((sc,i)=>{const t=sc.text(st,{},{});anchors.push(['s'+i,ed==='study'?`Decision ${W[i+1]}. ${sc.title||''}. ${plain(t[0])}`:(t.find(keep)||t[0])])});
    anchors.push(['end',C.closing(st,{},{})[0]]);
    let cur=0;const marks=[];
    for(const [pid,a] of anchors){const k=find(ws,a,cur);if(k===null){miss++;console.log(`miss ch${C.num} ${ed} ${pid}`);continue}cur=k+1;marks.push([pid,+Math.max(0,ws[k][1]-LEAD).toFixed(1)])}
    (M.full[C.num]??={})[ed]=marks;
  }
}
const OUT=process.argv.includes('--out')?process.argv[process.argv.indexOf('--out')+1]:ADIR+'/bookmarks.json'; // --out: write somewhere else (a dry run)
fs.writeFileSync(OUT+'.tmp',JSON.stringify(M));fs.renameSync(OUT+'.tmp',OUT);
console.log('chapters',Object.keys(M.full).length,'misses',miss,'editions from timings',SRC.timings,'from whisper',SRC.whisper);
