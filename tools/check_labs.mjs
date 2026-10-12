// Validates lab files: node tools/check_labs.mjs [courseId ...]   (no ids = every course with a labs file, plus the #labtest fixtures)
// Checks shape, that every answer key passes its own check and wrong choices fail, sort keys cover every card, calculators run,
// live parsers read the bundled sample, chart points sit on the image, and visible copy has no dashes. DUMP=file writes the copy out.
import fs from 'fs';
import { pathToFileURL } from 'url';
export function checkLabs(ids){
  globalThis.window=globalThis.window||{};const W=globalThis.window;
  new Function('window',fs.readFileSync('lab.js','utf8'))(W);const HL=W.HalcyonLab;globalThis.HalcyonLab=HL;
  new Function('window',fs.readFileSync('courses.js','utf8'))(W);
  let bad=0;const err=m=>{console.log("  ERROR "+m);bad++};const copy=[];
  const dash=t=>/[–—]|\s-\s/.test(t);
  const txt=(x,ctx)=>{const v=typeof x==="function"?x(ctx):x;return Array.isArray(v)?v.join("\n"):String(v??"")};
  const courses=W.HALCYON_COURSES.filter(c=>c.labs&&(!ids.length||ids.includes(c.id)));
  const sets=courses.map(c=>{new Function('window',fs.readFileSync(c.root+c.labs,'utf8'))(W);return [c,W.HALCYON_LABS[c.id]||{}]});
  if(!ids.length||ids.includes("__fixture")){new Function('window',fs.readFileSync('tools/lab_fixture.js','utf8'))(W);sets.push([{id:"__fixture",root:""},{1:W.HALCYON_LABS.__fixture}])}
  for(const [c,byCh] of sets){
    const nums=c.id==="pmp"?(()=>{const w={};new Function('window',fs.readFileSync('full/v2/preview.js','utf8'))(w);return w.HALCYON_V2.files.filter(f=>/^ch\d+\.js$/.test(f)).map(f=>+f.match(/\d+/)[0])})() /* PMP v2: the live chapters listed in full/v2/preview.js */:c.id==="__fixture"?[1]:fs.readdirSync(c.root+'full').filter(f=>/^ch\d+\.js$/.test(f)).map(f=>+f.match(/\d+/)[0]);
    const seen=new Set();
    for(const [ch,labs] of Object.entries(byCh)){
      if(!nums.includes(+ch))err(`${c.id}: labs registered for chapter ${ch}, which doesn't exist`);
      for(const lab of labs){console.log(`${c.id} ch${ch} ${lab.id} (${lab.kind}) ${lab.title}`);
        if(seen.has(lab.id))err(`duplicate lab id ${lab.id}`);seen.add(lab.id);
        if(!HL.KIND[lab.kind])err(`unknown kind ${lab.kind}`);
        if(!lab.questions||!lab.questions.length)err("no questions");
        let ctx=lab.ctx||{};
        if(lab.kind==="live"){try{ctx=lab.live.parse(lab.live.sample)}catch(e){err("live sample doesn't parse: "+e.message)}if(!/^\/api\//.test(lab.live.url))err("live url should go through /api/");
          if(lab.live.tests)for(const [raw,want] of lab.live.tests){let got;try{got=lab.live.parse(raw)}catch(e){got=e.message}const g=JSON.stringify(want(got));if(g!=="true")err(`live parse test failed for ${raw}`)}}
        if(lab.kind==="calc"){const v=Object.fromEntries(lab.inputs.map(i=>[i.id,i.value]));
          for(const [lbl,vals] of [["defaults",v],...(lab.presets||[]).map(p=>[p.label,{...v,...p.v}])]){try{const r=lab.compute(vals);if(!r.rows||!r.rows.length)err(`compute(${lbl}) gave no rows`);copy.push(r.note||"")}catch(e){err(`compute(${lbl}) threw ${e.message}`)}}
          lab.inputs.forEach(i=>{if(!(i.min<=i.value&&i.value<=i.max))err(`input ${i.id} default outside its range`)});(lab.presets||[]).forEach(p=>Object.entries(p.v).forEach(([k,x])=>{const i=lab.inputs.find(y=>y.id===k);if(!i)err(`preset ${p.label} sets unknown input ${k}`);else if(x<i.min||x>i.max)err(`preset ${p.label} ${k}=${x} outside range`)}))}
        if(lab.kind==="chart"){const ids=new Set((lab.points||[]).map(p=>p.id));(lab.points||[]).forEach(p=>{if(!(p.x>=0&&p.x<=lab.w&&p.y>=0&&p.y<=lab.h))err(`point ${p.id} off the image`)});
          lab.questions.forEach(q=>{if(q.pt&&!ids.has(q.pt))err(`question ${q.id} points at missing ${q.pt}`)});
          const f=c.root+lab.img;if(!fs.existsSync(f))err("image missing "+f);else{const b=fs.readFileSync(f);let i=2,dim=null;while(i<b.length){if(b[i]!==0xFF){i++;continue}const m=b[i+1];if(m>=0xC0&&m<=0xC3){dim=[b.readUInt16BE(i+7),b.readUInt16BE(i+5)];break}i+=2+b.readUInt16BE(i+2)}
            if(!dim||dim[0]!==lab.w||dim[1]!==lab.h)err(`image is ${dim} but lab says ${lab.w}x${lab.h}`);if(b.length>420000)err(`image is ${Math.round(b.length/1024)} KB, over 400`)}
          if(!/FAA|credit|Chart/i.test(lab.credit||""))err("chart needs a credit line")}
        if(lab.kind==="sort"){const S=lab.sort;const items=S.items.map(i=>i.id);
          if(S.mode==="order"){if(JSON.stringify([...S.answer].sort())!==JSON.stringify([...items].sort()))err("order answer doesn't list every item once")}
          else{const bks=new Set(S.buckets.map(b=>b.id));items.forEach(id=>{if(!bks.has(S.answer[id]))err(`sort item ${id} has no valid bucket`)})}
          S.items.forEach(i=>copy.push(i.label,i.note||""));S.buckets&&S.buckets.forEach(b=>copy.push(b.label))}
        if(lab.kind==="evidence"){(lab.files||[]).forEach(f=>{if(/\.csv$/i.test(f.name)){const rows=HL.parseCSV(f.text);if(rows.some(r=>r.length!==rows[0].length))err(`${f.name}: ragged rows`)}})}
        const qids=new Set();
        for(const q of lab.questions){if(qids.has(q.id))err(`duplicate question id ${q.id}`);qids.add(q.id);
          if(!["choice","number","text","sort"].includes(q.type))err(`${q.id}: bad type ${q.type}`);
          if(!q.hints||!q.hints.length)err(`${q.id}: no hints`);if(!q.sol)err(`${q.id}: no worked solution`);
          const st={q:{}};
          if(q.type==="choice"){if(!Array.isArray(q.opts)||q.opts.length<2)err(`${q.id}: choice needs options`);const k=typeof q.a==="function"?q.a(ctx):q.a;if(!(Number.isInteger(k)&&k>=0&&k<q.opts.length))err(`${q.id}: key not among the options`);
            q.opts.forEach((o,i)=>{if(HL.check(lab,q,String(i),ctx,st)!==(i===k))err(`${q.id}: option ${i} checks wrong`)});copy.push(...q.opts)}
          else if(q.type==="sort"){if(lab.kind!=="sort")err(`${q.id}: sort question outside a sort lab`);else{const s2={q:{},arr:lab.sort.mode==="order"?[...lab.sort.answer]:{...lab.sort.answer}};if(!HL.check(lab,q,"sort",ctx,s2))err(`${q.id}: the sort key doesn't pass`);if(HL.check(lab,q,"sort",ctx,{q:{}}))err(`${q.id}: an empty sort passes`)}}
          else{let key;if(q.a!==undefined)key=String(typeof q.a==="function"?q.a(ctx):q.a);else if(q.show){const s=String(q.show(ctx)).replace(/,/g,"");const m=s.match(/-?\d+(\.\d+)?/);key=m?m[0]:s.toLowerCase().split(/\s/)[0]}
            if(key===undefined)err(`${q.id}: no key`);else if(!HL.check(lab,q,key,ctx,st))err(`${q.id}: its own key "${key}" fails the check`);
            if(q.type==="number"&&q.a!==undefined&&typeof q.a!=="function"&&HL.check(lab,q,String(+q.a+(q.tol||0)+1),ctx,st))err(`${q.id}: a wrong number passes`);
            if(HL.check(lab,q,"banana",ctx,st))err(`${q.id}: nonsense passes`)}
          copy.push(q.q,...(q.hints||[]).map(h=>txt(h,ctx)),txt(q.sol,ctx));if(q.show)copy.push(txt(q.show,ctx))}
        copy.push(txt(lab.title),txt(lab.hook),txt(lab.source),txt(lab.credit||""),txt(lab.alt||""));if(lab.live)copy.push(lab.live.sampleNote||"",lab.live.show?lab.live.show(ctx):"");if(lab.inputs)lab.inputs.forEach(i=>copy.push(i.label));(lab.presets||[]).forEach(p=>copy.push(p.label))}}}
  const all=copy.join("\n").replace(/<[^>]+>/g,"");dash(all)&&all.split("\n").filter(dash).forEach(l=>err("dash in copy: "+l.slice(0,90)));
  if(process.env.DUMP)fs.writeFileSync(process.env.DUMP,all);
  return bad}
if(import.meta.url===pathToFileURL(process.argv[1]).href){const bad=checkLabs(process.argv.slice(2));console.log(bad?`${bad} lab error(s)`:"labs ok");process.exit(bad?1:0)}
