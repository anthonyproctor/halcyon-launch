// Claims linter (2026-11-07). Reads every lesson, why, after, review line and mock explanation in a course and:
//  FAILS on any claim tools/claims_rules.json lists as ruled false (so a fixed mistake can't come back), and
//  WARNS on absolute claims about how the test is built (every/always/never/exactly/only near choices, answers, items, the test).
// usage: node tools/check_claims.mjs <course id>   (or "all"). Exit 1 on a FAIL. Warnings are for a reviewer to look at.
import fs from "node:fs";import path from "node:path";
const R=JSON.parse(fs.readFileSync(new URL("./claims_rules.json",import.meta.url),"utf8")).rules;
const root=path.resolve(path.dirname(new URL(import.meta.url).pathname),"..");
const ids=process.argv[2]==="all"||!process.argv[2]?[...new Set(["pmp",...fs.readdirSync(path.join(root,"courses")).filter(d=>fs.existsSync(path.join(root,"courses",d,"full")))])]:[process.argv[2]];
const ABS=/\b(every|always|never|exactly|only|all)\b[^.!?]{0,50}\b(choices?|answers?|options?|wrong ones|items?|questions?|the test|the exam|distractors?)\b/i;
const HEDGE=/\b(many|some|often|usually|most|can|may|might|tends?)\b/i;
let fails=0,warns=0;
// PMP lives in full/v2 and final/; courses.js blurbs are checked with every course
const files=id=>{const d=path.join(root,"courses",id),out=[path.join(root,"courses.js")];if(id==="pmp"){const v=path.join(root,"full","v2");for(const f of fs.readdirSync(v))if(f.endsWith(".js"))out.push(path.join(v,f));if(fs.existsSync(path.join(root,"final","pmp.js")))out.push(path.join(root,"final","pmp.js"))}for(const sub of ["full","mock"]){const p=path.join(d,sub);if(fs.existsSync(p))for(const f of fs.readdirSync(p))if(f.endsWith(".js"))out.push(path.join(p,f))}for(const f of ["review.js","intros.js","mock.js"])if(fs.existsSync(path.join(d,f)))out.push(path.join(d,f));return out};
for(const id of ids){
  const rules=R.filter(r=>r.course==="*"||r.course===id).map(r=>({...r,re:new RegExp(r.pattern,"i"),un:r.unless?new RegExp(r.unless,"i"):null}));
  for(const f of files(id)){
    const lines=fs.readFileSync(f,"utf8").split("\n");
    lines.forEach((ln,i)=>{
      if(/^\s*(\/\/|\/\*|\*)/.test(ln))return; // code comments aren't learner facing
      const sents=ln.replace(/<span class="said"[^>]*>[\s\S]*?<\/span>/g," ").replace(/<[^>]+>/g," ").split(/(?<=[.!?])\s+/); // said spans dropped first: what a character says out loud is story, not a claim about the test
      for(const s of sents){
        for(const r of rules)if(r.re.test(s)&&!(r.un&&r.un.test(s))){fails++;console.log(`FAIL ${path.relative(root,f)}:${i+1}  ${r.why}\n     "${s.trim().slice(0,160)}"`)}
        if(ABS.test(s)&&!HEDGE.test(s)&&/\b(test|exam|subtest|section|choices?|answers?)\b/i.test(s)){warns++;if(process.env.CLAIMS_VERBOSE)console.log(`warn ${path.relative(root,f)}:${i+1}  "${s.trim().slice(0,140)}"`)}
      }
    });
  }
}
console.log(`check_claims: ${fails} ruled-false claim(s), ${warns} absolute claim(s) to review${process.env.CLAIMS_VERBOSE?"":" (CLAIMS_VERBOSE=1 lists them)"}`);
process.exit(fails?1:0);
