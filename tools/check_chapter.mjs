// Lints chapter files: schema, one best per scene, the decision question, answer-length tells, dashes.
// usage: node tools/check_chapter.mjs full/v2/ch02.js [more chapter files]   (v1 files push to window.HALCYON, v2 to window.HALCYON_FULL, course books to window.HALCYON_DATA[id].full)
import fs from 'fs';
global.window={};
const files=process.argv.slice(2);
for(const f of files){eval(fs.readFileSync(f,'utf8'));}
let bad=0;
const chapters=[...(window.HALCYON||[]),...(window.HALCYON_FULL||[]),...Object.values(window.HALCYON_DATA||{}).flatMap(d=>d.full||[])]; // course books push to window.HALCYON_DATA[id].full
if(!files.length||!chapters.length){console.log('usage: node tools/check_chapter.mjs <chapter file>... (no chapters found)');process.exit(2)}
for(const c of chapters){
  let longestBest=0,shortestBest=0;const lines=[];
  const scenes=c.scenes.filter(sc=>Array.isArray(sc.opts)&&sc.opts.length);
  scenes.forEach(sc=>{
    const L=sc.opts.map(o=>o.t.length);const b=sc.opts.findIndex(o=>o.best);
    const max=Math.max(...L),min=Math.min(...L);
    const others=L.filter((_,k)=>k!==b);if(L[b]>Math.max(...others))longestBest++;if(L[b]>1.1*Math.max(...others)){console.log('GIVEAWAY best much longer',sc.id);bad++} if(L[b]===min)shortestBest++;
    const rank=[...L].sort((a,b)=>b-a).indexOf(L[b])+1;
    const spread=Math.round((max-min)/max*100);
    lines.push(`${sc.id} best=#${rank} longest  lens=${L.join("/")} spread=${spread}%`);
    if(sc.opts.filter(o=>o.best).length!==1||sc.opts[b].s!==3){console.log("SCHEMA",sc.id);bad++}
    if(sc.q!==undefined&&(typeof sc.q!=="string"||!/\?$/.test(sc.q.trim())||/[<>]/.test(sc.q))){console.log("QUESTION must be plain text ending in ?",sc.id);bad++} // the decision question (2026-10-18), read before the options
  });
  const txt=JSON.stringify(c)+c.scenes.map(s=>(typeof s.text==="function"?s.text({flags:{},score:20},{},{}):[]).join(" ")).join(" ")+c.closing({flags:{},score:20},{},{}).join(" ");
  const dashes=(txt.match(/[–—]/g)||[]).length;
  console.log(`ch${c.num} ${c.title}: best is longest in ${longestBest}/${scenes.length}, shortest in ${shortestBest}/${scenes.length}, dashes=${dashes}, videos=${Object.keys(c.videos||{}).length}`);
  lines.forEach(l=>console.log("  "+l));
  if(longestBest>0.4*scenes.length||dashes)bad++; // 4 of 10 was the original bar
}
process.exit(bad?1:0);
