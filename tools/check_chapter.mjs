// Lints chapter files: schema, one best per scene, answer-length tells, dashes.
import fs from 'fs';
global.window={};
const files=process.argv.slice(2);
for(const f of files){eval(fs.readFileSync(f,'utf8'));}
let bad=0;
for(const c of window.HALCYON){
  let longestBest=0,shortestBest=0;const lines=[];
  c.scenes.forEach(sc=>{
    const L=sc.opts.map(o=>o.t.length);const b=sc.opts.findIndex(o=>o.best);
    const max=Math.max(...L),min=Math.min(...L);
    const others=L.filter((_,k)=>k!==b);if(L[b]>Math.max(...others))longestBest++;if(L[b]>1.1*Math.max(...others)){console.log('GIVEAWAY best much longer',sc.id);bad++} if(L[b]===min)shortestBest++;
    const rank=[...L].sort((a,b)=>b-a).indexOf(L[b])+1;
    const spread=Math.round((max-min)/max*100);
    lines.push(`${sc.id} best=#${rank} longest  lens=${L.join("/")} spread=${spread}%`);
    if(sc.opts.filter(o=>o.best).length!==1||sc.opts[b].s!==3){console.log("SCHEMA",sc.id);bad++}
  });
  const txt=JSON.stringify(c)+c.scenes.map(s=>s.text({flags:{},score:20}).join(" ")).join(" ")+c.closing({flags:{},score:20},{}).join(" ");
  const dashes=(txt.match(/[–—]/g)||[]).length;
  console.log(`ch${c.num} ${c.title}: best is longest in ${longestBest}/10, shortest in ${shortestBest}/10, dashes=${dashes}, videos=${Object.keys(c.videos||{}).length}`);
  lines.forEach(l=>console.log("  "+l));
  if(longestBest>4||dashes)bad++;
}
process.exit(bad?1:0);
