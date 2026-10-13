// The Copilot Rollout (GH-300): good catch cards. Copy from halcyon-writer's badges proposal (2026-10-13), approved by Anthony
// 2026-10-13 (the shared chapter pattern until the book is finished). Shape and rules: badges.js header. The readiness target is
// courses.js target (80, it's a retake), never set here. The pending hidden card sits on a chapter 7 scene that isn't written yet.
(window.HALCYON_BADGES=window.HALCYON_BADGES||{}).gh300={
  form:"card",one:"card",shelf:"Good catch cards",
  color:{paper:"#fbf6e6",rim:"#b8c4dd",ink:"#7b3fa0"},
  readiness:{name:"Retake ready",explain:"At {target}, book the retake."},
  // Phase 2 draws this: a Halcyon AI badge with a small purple index card clipped to the lanyard where the earned cards stack up
  idCard:{title:"Halcyon AI badge",org:"Halcyon",role:"ROLLOUT LEAD",clip:"purple index card"},
  chapters:{prefix:"gh300-ch",line:"A purple card for this one. Asha writes them after a good shift.",mark:"num"},
  items:[
    {id:"gh300-book",name:"Rollout Lead",line:"Seven chapters. Nobody picked you for this, and the team followed you anyway.",mark:"stack",rule:{type:"book"}},
    {id:"gh300-clean-run",name:"Good Catch",line:"Every call in this chapter held up on review. Asha calls that a good catch.",mark:"tick",rule:{type:"clean"}},
    {id:"gh300-practice-pass",name:"Practice Round",line:"A full practice exam above the line. Asha would ask what you missed first.",mark:"checklist",rule:{type:"exam",min:70}},
    {id:"gh300-ready",name:"Book It",line:"Retake ready reads 80 or better. Go book the retake.",mark:"calendar",rule:{type:"readiness"}},
    {id:"gh300-streak-3",name:"Three Nights",line:"Three days in a row. Asha worked stretches like that for thirty years.",mark:"moons",rule:{type:"streak",days:3}},
    {id:"gh300-streak-7",name:"Sunday to Sunday",line:"A full week, one Sunday dinner to the next.",mark:"bowl",rule:{type:"streak",days:7}},
    {id:"gh300-no-names",hidden:true,name:"No Names on It",line:"You kept names off the numbers. Renata never had to worry about it.",mark:"chart",rule:{type:"pick",ch:1,scene:"f1s11",opt:0}},
    {id:"gh300-show-me",hidden:true,pending:true,name:"Show Me",line:"Your father asked to see it, and you showed him.",mark:"laptop",rule:{type:"pick",ch:7},
     plan:"Chapter 7, Sunday dinner, when Raj asks Priya to show him the thing: reaching that page."}
  ]
};
