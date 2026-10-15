// The Appeal (LSAT): court filing stamps, the way a clerk stamps a motion FILED. Shape and rules: badges.js header.
// Shared chapter pattern until the book is written; hidden stamps get wired when their scenes exist.
(window.HALCYON_BADGES=window.HALCYON_BADGES||{}).lsat={
  form:"stamp",one:"stamp",shelf:"Filed stamps",
  color:{paper:"#f4efe3",rim:"#b9ab8a",ink:"#7a2f2a"},
  readiness:{name:"Argument ready",explain:"At {target} you can find the conclusion, the gap and the answer that closes it, most of the time."},
  // The profile ID card: the courthouse visitor badge Dani clips on for the hearing. The reader's name goes where hers was.
  idCard:{title:"The visitor badge",note:"Dani's badge for the hearing",org:"Adams County Justice Center",lines:["Brighton, Colorado","Courtroom 5B"],role:"VISITOR",back:"A filed stamp for every chapter."},
  chapters:{prefix:"lsat-ch",line:"Stamped and filed. Chapter {n} is in the record.",mark:"stamp"},
  items:[
    {id:"lsat-book",name:"The Record",line:"Every chapter read, every argument taken apart, and the ruling in your hand.",mark:"ring",rule:{type:"book"}},
    {id:"lsat-clean-run",name:"No Gaps",line:"Every call in this chapter held up. Ana would leave the margin clean.",mark:"tickbar",rule:{type:"clean"}},
    {id:"lsat-practice-pass",name:"Timed",line:"A full practice exam under the clock, above the line. Then the real ones on LawHub.",mark:"clock",rule:{type:"exam",min:70}},
    {id:"lsat-ready",name:"Argument Ready",line:"Argument ready reads 75 or better. Now go prove it on LawHub.",mark:"pen",rule:{type:"readiness"}},
    {id:"lsat-streak-3",name:"Kitchen Table",line:"Three nights running at the kitchen table, the way Dani studied.",mark:"cups",rule:{type:"streak",days:3}},
    {id:"lsat-streak-7",name:"One Move a Call",line:"A week straight. One move a night adds up to a whole game.",mark:"board",rule:{type:"streak",days:7}}
  ]
};
