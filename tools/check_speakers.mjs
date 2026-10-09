// Every <span class="said"> must carry data-who from the allowed cast list.
import fs from 'fs';
const ALLOWED=new Set(["Sam","Ruth","Elena","Grant","Lena","Theo","Priya","Ochoa","Dana","Ray","Tomasz","Maria","Denise","Joan","Hal","Devin","Victor","Ken","Keisha","Rob","Nora","Helen","Alyssa","Marcus","Douglas","Owen","Ben","Nadia","man","woman"]);
let bad=0;
for(const f of process.argv.slice(2)){const s=fs.readFileSync(f,'utf8');const spans=s.match(/<span class=\\?"said\\?"[^>]*>/g)||[];let missing=0,unknown=new Set();
  spans.forEach(t=>{const m=t.match(/data-who=\\?"([^"\\]+)\\?"/);if(!m)missing++;else if(!ALLOWED.has(m[1]))unknown.add(m[1])});
  console.log(`${f}: ${spans.length} quotes, ${missing} untagged${unknown.size?", unknown: "+[...unknown].join(","):""}`);if(missing||unknown.size)bad++}
process.exit(bad?1:0);
