// Every <span class="said"> must carry data-who from the allowed cast list.
// Files under full/v2/ are checked against the PMP v2 speakers (tools/v2meta.mjs: the v2 bible's list plus full/v2/cast.js), and so is a vlog prop's from.
import fs from 'fs';
const isV2=f=>/(^|\/)full\/v2\//.test(f);const files=process.argv.slice(2);
const V2M=files.some(isV2)?await import('./v2meta.mjs'):null;
const ALLOWED=new Set(["Sam","Ruth","Elena","Grant","Lena","Theo","Priya","Ochoa","Dana","Ray","Tomasz","Maria","Denise","Joan","Hal","Devin","Victor","Ken","Keisha","Rob","Nora","Helen","Alyssa","Marcus","Douglas","Owen","Ben","Nadia","man","woman"]);
let bad=0;
for(const f of files){const s=fs.readFileSync(f,'utf8');const OK=isV2(f)?V2M.V2_SPEAKERS:ALLOWED;const spans=s.match(/<span class=\\?"said\\?"[^>]*>/g)||[];let missing=0,unknown=new Set();
  spans.forEach(t=>{const m=t.match(/data-who=\\?"([^"\\]+)\\?"/);if(!m)missing++;else if(!OK.has(m[1]))unknown.add(m[1])});
  if(isV2(f))(s.match(/<prop\s[^>]*kind=\\?"vlog\\?"[^>]*>/g)||[]).forEach(t=>{const m=t.match(/ from=\\?"([^"\\]+)/);if(!m||!OK.has(m[1]))unknown.add('vlog from '+(m?m[1]:'(missing)'))});
  console.log(`${f}: ${spans.length} quotes, ${missing} untagged${unknown.size?", unknown: "+[...unknown].join(","):""}`);if(missing||unknown.size)bad++}
process.exit(bad?1:0);
