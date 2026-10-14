// One Chart (CPHIMS): competency sign offs. Copy from halcyon-writer's badges proposal (2026-10-13), approved by Anthony 2026-10-13
// (the shared chapter pattern until the book is finished). Shape and rules: badges.js header.
// The two pending hidden sign offs sit on chapter 8 and 11 scenes that aren't written yet: never shown or evaluated until they're wired.
(window.HALCYON_BADGES=window.HALCYON_BADGES||{}).cphims={
  form:"signoff",one:"sign off",shelf:"Competency sign offs",
  color:{paper:"#f2f8f8",rim:"#7fb1b5",ink:"#1d6a72"},
  readiness:{name:"Survey ready",explain:"At {target} you're ready for them to walk in unannounced."},
  // Phase 2 draws this: a Cascade Valley Health ID with a badge buddy card that shows the readiness number
  idCard:{title:"Cascade badge",org:"Cascade Valley Health",role:"VP CLINICAL SYSTEMS",credential:"RN",buddy:"readiness",back:"competency checklist"},
  chapters:{prefix:"cphims-ch",line:"Signed off. Ochoa initialed it and said nothing, which from him is praise.",mark:"num"},
  items:[
    {id:"cphims-book",name:"Independent",line:"Twelve lines, all initialed. Validated, independent.",mark:"tick",rule:{type:"book"}},
    {id:"cphims-clean-run",name:"No Variance",line:"Every call in this chapter was the safe one. Nothing to write up.",mark:"sheet",rule:{type:"clean"}},
    {id:"cphims-practice-pass",name:"Mock Survey",line:"You passed a full mock survey. The real one won't be a surprise.",mark:"checklist",rule:{type:"exam",min:70}},
    {id:"cphims-ready",name:"Ready for the Surveyor",line:"Survey ready reads 75 or better. Let them walk in.",mark:"door",rule:{type:"readiness"}},
    {id:"cphims-streak-3",name:"Three Twelves",line:"Three days in a row. Most nurses call that a week.",mark:"grid",rule:{type:"streak",days:3}},
    {id:"cphims-streak-7",name:"Seven On",line:"Seven days running. Bev would call you kid and mean it kindly.",mark:"calendar",rule:{type:"streak",days:7}},
    {id:"cphims-kid",hidden:true,name:"Kid",line:"You let Bev answer, then owned the gap yourself.",mark:"clipboard",rule:{type:"pick",ch:2,scene:"f2s1",opt:1}},
    {id:"cphims-called-irene",hidden:true,name:"Called Irene",line:"Four years, and you made the call.",mark:"cups",rule:{type:"pick",ch:8,scene:"f8s1"}},
    {id:"cphims-page-two",hidden:true,pending:true,name:"Page Two",line:"You told Lucia all of it, the missing page and the luck.",mark:"sheet",rule:{type:"pick",ch:11},
     plan:"Chapter 11, Maria tells Lucia the whole fax story: reaching that page."}
  ]
};
