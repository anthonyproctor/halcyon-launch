// Every <span class="said"> in a PMP Full Course chapter must carry data-who from the live v2 speakers (tools/v2meta.mjs: the v2 bible's
// list plus full/v2/cast.js), and so must a vlog prop's from. No arguments: every live chapter listed in full/v2/preview.js.
import fs from 'fs';
const isV2=()=>true;let files=process.argv.slice(2);
if(!files.length){const w={};new Function('window',fs.readFileSync('full/v2/preview.js','utf8'))(w);files=(w.HALCYON_V2.files||[]).filter(f=>/^ch\d+\.js$/.test(f)).map(f=>'full/v2/'+f)}
const V2M=await import('./v2meta.mjs');
const ALLOWED=V2M.V2_SPEAKERS;
let bad=0;
for(const f of files){const s=fs.readFileSync(f,'utf8');const OK=isV2(f)?V2M.V2_SPEAKERS:ALLOWED;const spans=s.match(/<span class=\\?"said\\?"[^>]*>/g)||[];let missing=0,unknown=new Set();
  spans.forEach(t=>{const m=t.match(/data-who=\\?"([^"\\]+)\\?"/);if(!m)missing++;else if(!OK.has(m[1]))unknown.add(m[1])});
  if(isV2(f))(s.match(/<prop\s[^>]*kind=\\?"vlog\\?"[^>]*>/g)||[]).forEach(t=>{const m=t.match(/ from=\\?"([^"\\]+)/);if(!m||!OK.has(m[1]))unknown.add('vlog from '+(m?m[1]:'(missing)'))});
  console.log(`${f}: ${spans.length} quotes, ${missing} untagged${unknown.size?", unknown: "+[...unknown].join(","):""}`);if(missing||unknown.size)bad++}
process.exit(bad?1:0);
