// Hearth (ASEP): traveler buy off stamps, and one validation. Copy from halcyon-writer's badges proposal (2026-10-13), approved by
// Anthony 2026-10-13 (the shared chapter pattern until the book is finished). Shape and rules: badges.js header.
// The two pending hidden stamps sit on chapter 9 and 11 scenes that aren't written yet: never shown or evaluated until they're wired.
(window.HALCYON_BADGES=window.HALCYON_BADGES||{}).asep={
  form:"qastamp",one:"stamp",shelf:"Traveler stamps",
  color:{paper:"#f6f1fb",rim:"#6a3d9a",ink:"#6a3d9a"},
  readiness:{name:"Exit criteria",explain:"At {target} you've met them, and Gail would let you into the review."},
  // Phase 2 draws this: a Front Range Orbital badge with high bay access and a QA stamp number for the reader
  idCard:{title:"FRO badge",org:"Front Range Orbital",role:"SYSTEMS ENGINEER",access:"high bay",stampNumber:true,back:"the HEARTH traveler"},
  chapters:{prefix:"asep-ch",line:"Stamped and bought off. This step meets its requirements.",mark:"num"},
  items:[
    {id:"asep-book",name:"Validated by Crew",line:"The stamps say it was built right. The crew's signature says it was worth building.",mark:"sign",rule:{type:"book"}},
    {id:"asep-clean-run",name:"Zero Discrepancies",line:"Twelve calls and not one discrepancy report. Luis would pin it to the wall.",mark:"tag",rule:{type:"clean"}},
    {id:"asep-practice-pass",name:"Dry Run",line:"A full practice exam above the line. That was the dry run.",mark:"sheet",rule:{type:"exam",min:70}},
    {id:"asep-ready",name:"Exit Criteria Met",line:"Exit criteria reads 75 or better. You're ready for the review.",mark:"checklist",rule:{type:"readiness"}},
    {id:"asep-streak-3",name:"Repeatable",line:"Three days running. A result you can repeat is one you can trust.",mark:"waves",rule:{type:"streak",days:3}},
    {id:"asep-streak-7",name:"Holds Pressure",line:"A full week without a drop. It holds pressure.",mark:"gauge",rule:{type:"streak",days:7}},
    {id:"asep-her-words",hidden:true,name:"In Her Words",line:"You wrote Helen's need down in her words. That's where real requirements start.",mark:"quote",rule:{type:"pick",ch:1,scene:"f1s12",opt:2}},
    {id:"asep-pueblo",hidden:true,pending:true,name:"Pueblo",line:"Your father told you the story himself.",mark:"bolt",rule:{type:"pick",ch:9},
     plan:"Chapter 9, Nadia's visit to Frank: reaching the page where he tells it."},
    {id:"asep-which-bunk",hidden:true,pending:true,name:"Which Bunk",line:"She asked which bunk you'd pick. Now you know who it's for.",mark:"doors",rule:{type:"pick",ch:11},
     plan:"Chapter 11, Commander Okonjo's question during the evaluations: reaching that page."}
  ]
};
