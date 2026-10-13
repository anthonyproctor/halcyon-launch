// PMP v2 validation data, read from the source documents so the checks follow them:
// flags from the "Flags table" in full/BIBLE.md, speakers from the bible's `speakers` list plus every `speaker` in full/v2/cast.js.
import fs from 'fs';
export const isV2=f=>/(^|\/)full\/v2\//.test(f);
const bible=fs.readFileSync('full/BIBLE.md','utf8');
const table=(bible.split(/^## Flags table$/m)[1]||'').split(/^## /m)[0];
export const V2_FLAGS=new Set([...table.matchAll(/^\| `([a-z_]+)` \|/gm)].map(m=>m[1]));
const line=(bible.match(/`speakers`: ([^\n]+)/)||[])[1]||'';
const w={};new Function('window',fs.readFileSync('full/v2/cast.js','utf8'))(w);
export const V2_SPEAKERS=new Set([...line.replace(/\.\s*$/,'').split(/,\s*/).filter(Boolean),...(w.HALCYON_CAST||[]).map(c=>c.speaker).filter(Boolean),'man','woman']);
export const APPROACHES=new Set(['predictive','agile','hybrid']);
if(!V2_FLAGS.size||V2_SPEAKERS.size<3)throw new Error('v2meta: could not read the flags table or speakers from full/BIBLE.md');
