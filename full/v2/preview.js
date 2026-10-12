// v2 preview manifest. Loaded only by the unlisted preview (/?v2#pmp/full/1); index.html and courses.js never load it.
// files: the v2 drafts to load in place of full/ch*.js and full/cast.js. Add each new chapter here as it's drafted.
// course: the PMP courses.js fields from full/BIBLE_v2_proposal.md ("What changes", item 1), applied in memory for the preview session.
// meta: the PMP engine fallbacks v2 replaces (BASE_CAST and FULL_CAST_EXTRA, item 2). TASKNAMES and DOMS are unchanged by the 2026 ECO.
// labs: false hides the v1 PMP labs in the preview.
// audio: set to true once audio/v2/ narration exists (pages under audio/v2/pages/fN, audiobook.json, bookmarks.json); until then the preview skips audio.
// At switch-over these values move into courses.js and engine.js; see full/v2/README.md.
window.HALCYON_V2={
  files:["cast.js","ch01.js","ch02.js","ch03.js","ch04.js","ch05.js","ch06.js","ch07.js","ch08.js","ch09.js"],
  audio:false,
  labs:false, // the v1 labs in courses/pmp/labs.js teach the v1 story; true shows them in the preview once v2 labs replace them
  course:{
    about:["It's 2061. Ares Station, a Mars colony of 212 people, is losing its oxygen plant. Earth's only rescue is the Halcyon, a relief ship being built on the plains east of Denver, and orbital mechanics give it one window to launch, twenty six months away. Miss it and the next one comes too late.",
      "Sam Okafor ran F-16 crews in the Air Force until a jet he signed off didn't come home. He has kept a high bay running ever since and has never run a project. Then the first project manager breaks, and Sam gets the ship. His daughter Ada is a hydroponics engineer on the station. They can only trade recorded logs, ten to twenty minutes apart, and hers are honest.",
      "Ruth Calder lost a ship of her own twenty six years ago because she believed an optimistic schedule. She gives Sam her console log one page at a time."],
    story:"Sam Okafor gets one launch window to save a Mars colony, and his daughter is on it.",
    mentorRole:"Ruth Calder, the flight director who lost the Petrel",mentor:"Ruth",mentorFull:"Ruth Calder",
    lessonName:"Ruth's Console Log",
    lessonIntro:"Ruth Calder was the Petrel's flight director. Each lesson starts with a page from her console log, and then she tells you what it taught her: the PMP ideas behind this chapter, before you make the decisions.",
    meters:[["trust","Team trust"],["conf","Stakeholder confidence"],["health","Halcyon readiness"]],stateTitle:"Mission state",
    leads:{3:["That's a go.","Good. That's what I'd want on my loop.","Exactly right."],1:["Close, but not quite.","Defensible. Not the best call.","You're in the neighborhood."],0:["That one's going to cost you.","I'd have called a hold there.","Let's talk about that one."]},
    flags:["rosylog","nocharter","buriedar","r_reopened","trustedai","pushedstand","r_testarticle","hidnumbers","r_reserve","exposedada","cutregression","r_autonomy","squeezedaldergrove","sacrificedhana","crashedtest","r_protectedtest","spunmedia","r_wendell","skippedwendell"],
    speakers:["Sam","Ada","Ruth","Imogen","Garrett","Hana","Rafa","Wendell","Quinn","Yusra","Frances","Simon","Calvin","Peg","Nell","Hollis","Bea","Ray","Leo","Paloma","Chiamaka","Arlo","Corinne","man","woman"],
    mockBlurb:"Weighted like the July 2026 exam: People 33 percent, Process 41 percent, Business Environment 26 percent, about 60 percent agile or hybrid. All questions are single answer; the real exam opens with a case study section and also has multiple response, matching, point and click, and graphic-based items."
  },
  meta:{
    BASE_CAST:[["Sam Okafor","You. Tallgrass integration operations manager, former Air Force F-16 crew chief."],["Ruth Calder","Retired ARA flight director on the Independent Readiness Board."],["Ada Okafor","Sam's daughter. Hydroponics engineer on Ares Station. Speaks only in recorded logs."],["Imogen Hale","Director of the Ares Relief Authority. The program's sponsor."],["Garrett Lyle","Founder and CEO of Tallgrass Aerospace."],["Hana Iwasaki","Propulsion lead. Owns the departure stage."],["Rafa Quintero","Flight software lead. Runs the agile side."]],
    FULL_CAST_EXTRA:[["Ray Mendez","Sam's old flight chief, retired, in Tucson."],["Quinn Abernathy","Scheduler, now Sam's deputy."],["Wendell Price","Test conductor. Reads stand data by feel."]]
  }
};
