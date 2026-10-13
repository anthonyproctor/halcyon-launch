// Danny's Logbook (Private Pilot): logbook endorsements. Copy from halcyon-writer's badges proposal (2026-10-13), approved by Anthony
// 2026-10-13 (Signed Off for the Written OK as written). In world and decorative: never laid out like a real FAA endorsement, no
// regulation numbers. Shape and rules: badges.js header. The readiness target is courses.js target (80), never set here.
(window.HALCYON_BADGES=window.HALCYON_BADGES||{}).pilot={
  form:"endorsement",one:"endorsement",shelf:"Logbook endorsements",
  color:{paper:"#f2ead6",rim:"#b9a57e",ink:"#24508f"},
  readiness:{name:"Written ready",explain:"The real test passes at 70. Get this to {target}, and Abby says go take it. This isn't an FAA endorsement. You still need one from an authorized instructor before you test."},
  // Phase 2 draws this: the reader's own logbook, N4791E beside the first entry, TOTAL TIME = listening hours
  idCard:{title:"Your logbook",tail:"N4791E",total:"listening hours",back:"Remarks"},
  items:[
    {id:"pilot-ch01",name:"Discovery Flight",line:"First line in the book, in Abby's pen.",mark:"num",rule:{type:"chapter",ch:1}},
    {id:"pilot-ch02",name:"The Machine",line:"Systems with the cowling off. You read every line of the records, and it mattered.",mark:"num",rule:{type:"chapter",ch:2}},
    {id:"pilot-ch03",name:"Weather School",line:"Weather. Canceling for wind counts as a lesson, and Abby logged it as one.",mark:"num",rule:{type:"chapter",ch:3}},
    {id:"pilot-ch04",name:"Airspace",line:"Airspace. You know where the shelves are now.",mark:"num",rule:{type:"chapter",ch:4}},
    {id:"pilot-ch05",name:"Performance",line:"Performance. You did the math and told a nine year old no. That's the job.",mark:"num",rule:{type:"chapter",ch:5}},
    {id:"pilot-ch06",name:"Pattern Work",line:"Pattern work. Three, full stop.",mark:"num",rule:{type:"chapter",ch:6}},
    {id:"pilot-ch07",name:"First Solo",line:"First solo. The shirt tail's on the wall.",mark:"num",rule:{type:"chapter",ch:7}},
    {id:"pilot-ch08",name:"Human Factors",line:"Human factors. You put yourself on the checklist.",mark:"num",rule:{type:"chapter",ch:8}},
    {id:"pilot-ch09",name:"Cross-Country",line:"Cross country. You planned it, flew it, and changed the plan when the sky did.",mark:"num",rule:{type:"chapter",ch:9}},
    {id:"pilot-ch10",name:"The No-Go",line:"Night and emergencies. Some of the best entries are flights that never happened.",mark:"num",rule:{type:"chapter",ch:10}},
    {id:"pilot-ch11",name:"The Written",line:"The written. The score's yours, and so are the codes you missed.",mark:"num",rule:{type:"chapter",ch:11}},
    {id:"pilot-ch12",name:"Checkride",line:"Checkride. Kendra's signature, and a cushion on the right seat.",mark:"num",rule:{type:"chapter",ch:12}},
    {id:"pilot-book",name:"The Remarks Column",line:"Every chapter flown, all the way to Akron. The remarks column is yours now.",mark:"cert",rule:{type:"book"}},
    {id:"pilot-clean-run",name:"No Squawks",line:"Every call in this chapter was the safe one. Biscuit's squawk sheet stays blank.",mark:"sheet",rule:{type:"clean"}},
    {id:"pilot-practice-pass",name:"Practice Written",line:"A full practice test at 70 or better. Put the codes you missed on a card.",mark:"clipboard",rule:{type:"exam",min:70}},
    {id:"pilot-ready",name:"Signed Off for the Written",line:"Written ready reads 80 or better. Abby says go take it. The real endorsement still comes from your instructor.",mark:"logline",rule:{type:"readiness"}},
    {id:"pilot-streak-3",name:"Current",line:"Three days in a row. Pilots call that staying current.",mark:"runways",rule:{type:"streak",days:3}},
    {id:"pilot-streak-7",name:"Didn't Let It Sit",line:"A full week. Danny's note asked for one thing, and you're doing it.",mark:"tag",rule:{type:"streak",days:7}},
    {id:"pilot-went-around",hidden:true,name:"Went Around",line:"First solo, high on final, and you went around. Nobody had to tell you.",mark:"headset",rule:{type:"pick",ch:7,scene:"f7s12",opt:0}},
    {id:"pilot-the-card",hidden:true,name:"The Card",line:"Ellie wanted nine. Your card said 7:30, and you went with the card.",mark:"stamp",rule:{type:"pick",ch:8,scene:"f8s12",opt:0}},
    {id:"pilot-drove",hidden:true,name:"Drove",line:"You drove to Pueblo. Danny's logbook says he got lucky. Yours doesn't have to.",mark:"keys",rule:{type:"pick",ch:10,scene:"f10s12",opt:3}},
    {id:"pilot-over-the-panel",hidden:true,name:"Over the Panel",line:"Ellie asked, and you told her the truth. Then she could see over the panel.",mark:"cushion",rule:{type:"pick",ch:12,scene:"f12s12",opt:1}}
  ]
};
