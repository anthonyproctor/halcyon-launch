// Exception Noted (CISA): case file stamps. Copy from halcyon-writer's badges proposal (2026-10-13), approved by Anthony 2026-10-13
// (the ID is Henry's business card; the shared chapter pattern until the book is finished). Shape and rules: badges.js header.
// The two pending hidden stamps sit on chapter 11 and 12 scenes that aren't written yet: never shown or evaluated until they're wired.
(window.HALCYON_BADGES=window.HALCYON_BADGES||{}).cisa={
  form:"stamp",one:"stamp",shelf:"Case file stamps",
  color:{paper:"#f7f1df",rim:"#c9bc97",ink:"#2f7d4a"},
  readiness:{name:"Ready to sign",explain:"At {target} you've got enough evidence to put your name on it."},
  // Phase 2 draws this: Henry's business card, the one Dot was holding in chapter 1. The reader's name goes where his was.
  idCard:{title:"The Vellacott card",note:"Henry's business card",org:"Vellacott syndicate",lines:["One Lime Street, London","Wazee Street, Denver"],role:"CLAIMS INVESTIGATOR",back:"Dot's green ticks, one for every chapter",backCounts:"chapters"},
  chapters:{prefix:"cisa-ch",line:"Ticked in green. Chapter {n} is in the file.",mark:"tick"},
  items:[
    {id:"cisa-book",name:"Exception Noted",line:"Every chapter in the file, and the exception reported to the people who needed it.",mark:"ring",rule:{type:"book"}},
    {id:"cisa-clean-run",name:"Agreed to Source",line:"Every call in this chapter agrees to source. Dot would put a bar through the tick.",mark:"tickbar",rule:{type:"clean"}},
    {id:"cisa-practice-pass",name:"Reviewed",line:"A full practice exam, reviewed and above the line. File it.",mark:"stamp",rule:{type:"exam",min:70}},
    {id:"cisa-ready",name:"Sufficient Evidence",line:"Ready to sign reads 75 or better. That's enough to sign.",mark:"sign",rule:{type:"readiness"}},
    {id:"cisa-streak-3",name:"On Time",line:"Three days running. Precious rings at eight every Tuesday, and she'd approve.",mark:"phone",rule:{type:"streak",days:3}},
    {id:"cisa-streak-7",name:"Colfax Regular",line:"A week straight. Nine months of Saturday breakfasts started the same way.",mark:"cups",rule:{type:"streak",days:7}},
    {id:"cisa-rang-her",hidden:true,name:"Rang Her",line:"You rang Maisie back before the bus came.",mark:"mobile",rule:{type:"pick",ch:1,scene:"f1s3",opt:0}},
    {id:"cisa-six-oclock",hidden:true,name:"Six O'Clock",line:"Their method's in writing, and you were in Boulder by six.",mark:"ribbon",rule:{type:"pick",ch:2,scene:"f2s12",opt:1}},
    {id:"cisa-on-her-knee",hidden:true,pending:true,name:"On Her Knee",line:"You let your father tell it his way, and he remembered the folder.",mark:"folder",rule:{type:"pick",ch:11},
     plan:"Chapter 11, the London call where Arthur remembers the folder: the chapter's last scene on that call with pushedarthur not set."},
    {id:"cisa-passed",hidden:true,pending:true,name:"Passed",line:"One word, and Laura sent it to you herself.",mark:"bubble",rule:{type:"pick",ch:12},
     plan:"Chapter 12, Thursday, April 1, when Laura's one word text arrives: reaching that page."}
  ]
};
