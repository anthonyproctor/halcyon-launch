// Commission (AFOQT): maintenance sign offs, the way a crew chief signs off a job on the jet's forms. Shape and rules: badges.js header.
// Shared chapter pattern until the book is written; hidden sign offs get wired when their scenes exist.
(window.HALCYON_BADGES=window.HALCYON_BADGES||{}).afoqt={
  form:"signoff",one:"sign off",shelf:"Jet sign offs",
  color:{paper:"#eef0ea",rim:"#9aa392",ink:"#2f4a3a"},
  readiness:{name:"Test ready",explain:"At {target} you're answering the way the real test wants, across every scored section, most of the time."},
  chapters:{prefix:"afoqt-ch",line:"Signed off. Chapter {n} is done and the jet's good.",mark:"checklist"},
  items:[
    {id:"afoqt-book",name:"Two Two Eight",line:"Every chapter flown, from the first engine run to the score.",mark:"ring",rule:{type:"book"}},
    {id:"afoqt-clean-run",name:"No Write Ups",line:"Every call in this chapter held up. Vern wouldn't change a line in your log.",mark:"tickbar",rule:{type:"clean"}},
    {id:"afoqt-practice-pass",name:"Five Hours",line:"A full practice test under the clock, above the line.",mark:"clock",rule:{type:"exam",min:70}},
    {id:"afoqt-ready",name:"Test Ready",line:"Test ready reads 75 or better. Book the real one.",mark:"dial",rule:{type:"readiness"}},
    {id:"afoqt-streak-3",name:"Before the Launch",line:"Three days running, the way Kit studied before the 4 AM go.",mark:"cups",rule:{type:"streak",days:3}},
    {id:"afoqt-streak-7",name:"One Log a Week",line:"A week straight. Vern hands you the next log.",mark:"logline",rule:{type:"streak",days:7}}
  ]
};
