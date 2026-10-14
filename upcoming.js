// "Coming next" page (#upcoming): what readers can look forward to. Reader facing and spoiler free:
// premise, setting, people, the exam in plain words, and status. No endings, twists, flag names, or production notes.
// engine.js renders it (renderUpcoming). Courses already in courses.js are linked by id, and their chapter counts
// come from the registry, so this file doesn't need editing when a chapter goes live.
window.HALCYON_UPCOMING={
  intro:"What's on the desk right now. We don't give away endings here, so read every word.",

  featured:{
    course:"cisa", title:"Exception Noted", kicker:"Book one of a new cyber thriller series", status:"In production",
    soon:"Chapter 1 coming", cover:{line:"Book one", place:"Denver", exam:"CISA"},
    paras:[
      "Henry Ashby is 42 and from London, and he still wears a tie in a city of fleece. His job is breach claims for a Lloyd's syndicate: a company gets hacked, wants its money, and he works out whether they get it.",
      "He took the Denver posting to be near his daughter, Maisie. She's fourteen, she lives in Boulder with her mother, and she barely speaks to him.",
      "The one person in town who's glad to see him is Dot Kessler, a retired federal IT examiner who teaches him American audit practice over Saturday breakfast on Colfax. Then Dot is found dead at the Brown Palace, holding his business card and her workpapers. Every finding in them is a clue.",
      "Meanwhile his father, Arthur, is in a care home in north London. Each week he remembers a little less."
    ],
    facts:[
      ["Where","Denver, and the real places in it: DIA, the State Capitol's mile high steps, the Mint, the Brown Palace."],
      ["You play","Henry Ashby, 42, breach claims investigator."],
      ["Your teacher","Dot Kessler, through the workpapers she left him."],
      ["Around him","Maisie, his daughter. A Denver detective who doesn't like him. An FBI agent who might. His boss in London, who wants an answer by Friday. His father, Arthur."],
      ["What you'll learn","The CISA exam from ISACA. How IT audits work, start to finish, plus IT governance, building and changing systems, keeping them running, and protecting information."]
    ]
  },

  series:{
    title:"One hero, seven books, seven cities",
    intro:"Each book is one certification and one city. Henry's the same man in every one, a little more changed each time.",
    books:[
      {n:1,place:"Denver",exam:"CISA",line:"A dead woman's workpapers and a claim that doesn't add up.",status:"In production"},
      {n:2,place:"Tallinn",exam:"Security+",line:"Estonia in winter. The whole government runs online, and somebody wants in.",status:"Planned"},
      {n:3,place:"Singapore",exam:"CySA+",line:"A city that watches everything. His job is to notice what it missed.",status:"Planned"},
      {n:4,place:"Monaco",exam:"PenTest+",line:"A tiny country with a lot of money, and this time Henry's paid to break in.",status:"Planned"},
      {n:5,place:"Iceland and Svalbard",exam:"CCSP",line:"Server halls on lava fields, and a vault in the Arctic. Your data has to sleep somewhere.",status:"Planned"},
      {n:6,place:"London",exam:"CISM",line:"Home at last. Now he runs the room instead of reading it.",status:"Planned"},
      {n:7,place:"Washington",exam:"CISSP",line:"The last book and the biggest exam, in the city that writes the rules.",status:"Planned"}
    ]
  },

  rewrite:{
    course:"pmp", title:"The Halcyon Launch", kicker:"The new edition, from the ground up", status:"New edition live", soon:"New chapters on the way", ofPlanned:true,
    cover:{line:"2061", place:"Ares Station, Mars", exam:"PMP"},
    paras:[
      "It's 2061, and the oxygen plant on Ares Station is failing. That's 212 people on Mars. Earth has one rescue ship, the Halcyon, and one launch window, a bit over two years out. Miss it and the next one's too late.",
      "Sam Okafor used to be an Air Force crew chief. For nineteen years he's kept an aerospace plant east of Denver running. He's never run a project. Now he's got this one.",
      "His daughter Ada is one of the 212. She's 24. Her messages take up to twenty two minutes to get home, and his take just as long to get back.",
      "Ruth Calder ran flights once, and lost one. She teaches Sam out of her old console log, page by page."
    ],
    facts:[
      ["You play","Sam Okafor. He's never run a project."],
      ["Your teacher","Ruth Calder, through her console log."],
      ["What you'll learn","The PMI PMP exam: leading people, running the work, and keeping a project tied to what it's for, with predictive, agile, and hybrid ways of working."]
    ]
  },

  shelf:{
    title:"More chapters on the way",
    intro:"Books you can start today. Each one shows how many chapters are out, and the rest are being written.",
    ids:["cphims","asep","gh300"]
  },

  finale:{
    course:"pilot", title:"Danny's Logbook", status:"All 12 chapters out", art:"/courses/pilot/art/full-ch01.svg",
    paras:[
      "Jordan Reyes inherited her late brother's share of a 1978 Cessna, his logbook, and one year to learn to fly it or sell it.",
      "All twelve chapters are out. The audiobook for the last six is being recorded now, so if you listen in the car, it won't be long."
    ]
  }
};
