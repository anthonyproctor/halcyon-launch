// Find where each reading page (open, lesson, s0..sN, end) starts inside each audiobook file,
// from whisper transcripts made by book_marks.sh. Writes audio/bookmarks.json (with --v2, audio/v2/bookmarks.json from full/v2/):
// {"full":{"1":{"story":[["open",6.6],["s0",170.2],...],"study":[...]}}}
import fs from 'fs';
const CID=process.argv.includes('--course')?process.argv[process.argv.indexOf('--course')+1]:null; // no --course = the PMP course
const V2=process.argv.includes('--v2')&&!CID; // --v2: the PMP v2 preview (full/v2/ chapters, audio/v2/ files, audio/v2/bookmarks.json)
const ROOT=CID?`courses/${CID}/`:'';const BM='/tmp/claude-501/bm'+(CID?'-'+CID:'')+(V2?'-v2':'');const CDIR=ROOT+'full'+(V2?'/v2':''),ADIR=ROOT+'audio'+(V2?'/v2':''),AID='audio'+(V2?'_v2':'');
const st={flags:{},score:24,m:{trust:60,conf:60,health:60}};
const W=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen'];
const plain=s=>String(s).replace(/<prop\s+[^>]*>([\s\S]*?)<\/prop>/g,'$1').replace(/<[^>]+>/g,' ');
const NUM=new Set([...W,'twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety','hundred','thousand']);
const norm=s=>plain(s).toLowerCase().replace(/[^a-z0-9' ]+/g,' ').replace(/'/g,'').split(/\s+/).filter(w=>w&&!/\d/.test(w)&&!NUM.has(w)); // numbers dropped: whisper writes 31 where the text says thirty-one
function words(file){ // whisper segments -> [[word, time]] with times spread across each segment
  const j=JSON.parse(fs.readFileSync(file,'utf8'));const out=[];
  for(const s of j.transcription){const a=s.offsets.from/1000,b=s.offsets.to/1000;const w=norm(s.text);w.forEach((x,i)=>out.push([x,a+(b-a)*i/Math.max(1,w.length)]))}
  return out}
function find(ws,anchor,from){ // best fuzzy match of the anchor's first 8 words at or after index `from`
  const a=norm(anchor).slice(0,8);if(a.length<3)return null;let best=null,bs=0;
  for(let k=from;k<ws.length;k++){if(ws[k][0]!==a[0]&&ws[k][0]!==a[1])continue; // in-order match within a short window, tolerant of split or merged words
    let s=0,j=k;for(let q=0;q<a.length;q++){for(let x=j;x<Math.min(ws.length,k+a.length+4);x++)if(ws[x][0]===a[q]){s++;j=x+1;break}}if(s>bs){bs=s;best=k}if(s===a.length)break}
  return bs>=Math.ceil(a.length*0.6)?best:null}
const M={full:{}};let miss=0;
for(const f of fs.readdirSync(CDIR).filter(f=>/^ch\d+\.js$/.test(f)).sort()){
  globalThis.window={};new Function('window',fs.readFileSync(CDIR+'/'+f,'utf8'))(globalThis.window);
  const C=CID?globalThis.window.HALCYON_DATA[CID].full[0]:globalThis.window.HALCYON_FULL[0],nn=String(C.num).padStart(2,'0');
  const keep=p=>!(/\?\s*$/.test(plain(p).trim())&&plain(p).trim().split(/\s+/).length<14); // story edition drops short questions
  for(const [ed,id] of [['story',`${AID}_story_full-ch${nn}`],['study',`${AID}_full-ch${nn}`]]){
    const file=`${BM}/${id}.json`;if(!fs.existsSync(file))continue;const ws=words(file);
    const anchors=[['open',C.opening[0]]];
    if(ed==='study'&&C.lesson)anchors.push(['lesson',CID||V2?`${C.lesson.title}.`:`Ruth's whiteboard. ${C.lesson.title}.`]);
    C.scenes.forEach((sc,i)=>{const t=sc.text(st,{},{});anchors.push(['s'+i,ed==='study'?`Decision ${W[i+1]}. ${sc.title||''}. ${plain(t[0])}`:(t.find(keep)||t[0])])});
    anchors.push(['end',C.closing(st,{},{})[0]]);
    let cur=0;const marks=[];
    for(const [pid,a] of anchors){const k=find(ws,a,cur);if(k===null){miss++;console.log(`miss ch${C.num} ${ed} ${pid}`);continue}cur=k+1;marks.push([pid,+Math.max(0,ws[k][1]-0.3).toFixed(1)])}
    (M.full[C.num]??={})[ed]=marks;
  }
}
fs.writeFileSync(ADIR+'/bookmarks.json',JSON.stringify(M));
console.log('chapters',Object.keys(M.full).length,'misses',miss);
