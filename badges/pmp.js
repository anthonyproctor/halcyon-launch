// The Halcyon Launch (PMP): mission patches. Copy from halcyon-writer's badges proposal (2026-10-13), approved by Anthony 2026-10-13
// (keep "Launch poll" as the exam meter, keep Doc). Shape and rules: badges.js header. Scene ids and options checked by tools/check_badges.mjs.
// The readiness target is courses.js target (75), never set here.
(window.HALCYON_BADGES=window.HALCYON_BADGES||{}).pmp={
  form:"patch",one:"patch",shelf:"Mission patches",
  color:{bg:"#1f2f55",rim:"#c9a33a",ink:"#f1dc9a"},
  readiness:{name:"Launch poll",explain:"At {target}, you're go."},
  // Phase 2 (the profile page) draws this: a Tallgrass and ARA program badge on a lanyard
  idCard:{title:"Halcyon program badge",org:"Tallgrass Aerospace and the Ares Relief Authority",role:"PROGRAM TEAM",logo:"wind sock",back:"LOGS FROM ARES",backCounts:"chapters"},
  items:[
    {id:"pmp-ch01",name:"Twenty Six Months",line:"One window, twenty six months out, and you've started the count.",mark:"orbit",rule:{type:"chapter",ch:1}},
    {id:"pmp-ch02",name:"Unexplained, Not Repeatable",line:"The plan has a baseline, and AR 2207 has a reader.",mark:"folder",rule:{type:"chapter",ch:2}},
    {id:"pmp-ch03",name:"The Critical Path",line:"You found the longest road through the ship, and you know where its float went.",mark:"path",rule:{type:"chapter",ch:3}},
    {id:"pmp-ch04",name:"The Valve",line:"A spring blizzard on the prairie, and a valve that still has a question in it.",mark:"valve",rule:{type:"chapter",ch:4}},
    {id:"pmp-ch05",name:"The Numbers",line:"A ballroom in Washington, and numbers with your name under them.",mark:"dial",rule:{type:"chapter",ch:5}},
    {id:"pmp-ch06",name:"Twenty Two Minutes",line:"One team, two planets, and twenty two minutes of light between them.",mark:"planets",rule:{type:"chapter",ch:6}},
    {id:"pmp-ch07",name:"The Sprint",line:"Software that flies has to be tested the way it flies. You know that now.",mark:"burndown",rule:{type:"chapter",ch:7}},
    {id:"pmp-ch08",name:"The Contract",line:"Pueblo, a steel mill out the window, and a supplier who wanted the truth too.",mark:"pen",rule:{type:"chapter",ch:8}},
    {id:"pmp-ch09",name:"Conjunction",line:"Mars went behind the Sun, and you kept working through the quiet.",mark:"eclipse",rule:{type:"chapter",ch:9}},
    {id:"pmp-ch10",name:"The Stack",line:"Three launches from the Cape, and a storm with a name.",mark:"rockets",rule:{type:"chapter",ch:10}},
    {id:"pmp-ch11",name:"The Feed",line:"The outside world turned toward Watkins, and the plan had to turn with it.",mark:"dish",rule:{type:"chapter",ch:11}},
    {id:"pmp-ch12",name:"Hand Off",line:"What a few people knew now lives with the people who are staying.",mark:"relay",rule:{type:"chapter",ch:12}},
    {id:"pmp-ch13",name:"The Waiver",line:"A hearing room, bad coffee, and a signature line you thought hard about.",mark:"sign",rule:{type:"chapter",ch:13}},
    {id:"pmp-ch14",name:"Countdown",line:"You wrote the criteria down before anybody knew the answer.",mark:"tminus",rule:{type:"chapter",ch:14}},
    {id:"pmp-ch15",name:"The Window",line:"The window's closed. Whatever it held, you were there for all of it.",mark:"arc",rule:{type:"chapter",ch:15}},
    {id:"pmp-book",name:"Halcyon Program",line:"From the first log to the last page of the binder, you saw it all the way through.",mark:"crew",rule:{type:"book"}},
    {id:"pmp-clean-run",name:"That's a Go",line:"Twelve calls in one chapter, every one of them right. Ruth would want you on her loop.",mark:"toggle",rule:{type:"clean"}},
    {id:"pmp-practice-pass",name:"Integrated Sim",line:"You flew the whole sim and came out above the line.",mark:"console",rule:{type:"exam",min:70}},
    {id:"pmp-ready",name:"Go for Launch",line:"Your launch poll reads 75 or better. On the board, you're go.",mark:"board",rule:{type:"readiness"}},
    {id:"pmp-streak-3",name:"Three Logs",line:"Three days running. Logs work best when they keep coming.",mark:"cards",rule:{type:"streak",days:3}},
    {id:"pmp-streak-7",name:"Five Forty",line:"A week of mornings in a row. Ada's logs land at 5:40, and so did you.",mark:"clock",rule:{type:"streak",days:7}},
    {id:"pmp-manifest",hidden:true,name:"OKAFOR, ADA N.",line:"The vision is 212 names now, and one of them is hers.",mark:"tape",rule:{type:"pick",ch:1,scene:"f1s5",opt:1}},
    {id:"pmp-handline",hidden:true,name:"Handline",line:"You stopped the test and brought Arlo in. People first, every time.",mark:"rope",rule:{type:"pick",ch:4,scene:"f4s3",opt:0}},
    {id:"pmp-doc",hidden:true,name:"Doc",line:"You told her about Leo, even the part you'll never know.",mark:"bag",rule:{type:"pick",ch:13,scene:"f13s12",opt:1}},
    {id:"pmp-telescope",hidden:true,name:"The Telescope",line:"The pages were always hers. You asked her at her own table.",mark:"telescope",rule:{type:"pick",ch:15,scene:"f15s11",opt:1}}
  ]
};
