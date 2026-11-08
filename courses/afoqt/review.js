// Commission (AFOQT) exam week review (2026-11-07): one on screen page for the last days before the test. Never narrated.
// Loaded from the afoqt scripts list in courses.js. engine.js (renderReview, route #afoqt/review, the button in the home page's Practice exam
// card) reads window.HALCYON_REVIEW.afoqt; its header explains sections and kinds.
// Shape: intro [paragraphs]; sections [[id, title, kind]]; format, composites and subtests [{group, note?, items:[{name, where?, d, ch, sec}]}]
// (kind list); minimums, sj and day [{r, why, ch, sec}] (kind rules); contrasts [{topic, l:[left label, right label], a, b, ch, sec}].
// ch and sec point at where the book teaches it: Full Course chapter ch, Vern's lesson, section index sec (0 based, in the order of
// courses/afoqt/full/chNN.js lesson.sections). mock:true instead of ch means only the practice tests teach it (Math Knowledge, Physical
// Science, Instrument Comprehension and Block Counting, whose lessons come in later chapters).
// Links reach ch01 to ch05. The AR and SDI items point at ch05 "Rate Problems"; rvLink shows no button for a chapter that isn't loaded, so
// those links appear once full/ch05.js is in the afoqt scripts list. The IC and AI rows and the climbing vs. diving contrast point at ch08's lesson (2026-11-08); their buttons appear once full/ch08.js is in the scripts list. The CSO and ABM composite rows link to ch01's
// composites section, which teaches both lists (added 2026-11-07). Exam check applied 2026-11-07.
// Sources: the lessons in courses/afoqt/full/ch01.js to ch04.js and the explanations in courses/afoqt/mock/t1_*.js and t2_*.js; the AFOQT
// outline map, bible fact check and figure spec of 2026-11-07 (halcyon-private), which rest on Pearson's AFOQT page (updated 2026-08-06),
// the Form T information pamphlet (updated 1 Aug 2015) and AFROTC detachment pages citing DAFMAN 36-2664. Disputed counts and times
// (RC 24 vs 38 minutes, SJ 16 vs 50 items, BC 5 vs 4.5 minutes) are marked [2015 pamphlet: n] and use the Pearson numbers. The CSO and ABM
// composite lists follow the pamphlet and are marked unsettled. No pamphlet, Pearson or prep book text is quoted or adapted; every example
// is ours. Copy rules: plain words, contractions, no dashes.
window.HALCYON_REVIEW=window.HALCYON_REVIEW||{};
window.HALCYON_REVIEW.afoqt={
  intro:[
    "One screen for the last few days. Everything here is something the book already taught you, boiled down, with a link back to the lesson that teaches it. A few subtests are taught in the practice tests so far, and those links open the practice test.",
    "This is the AFOQT as Pearson runs it now: Form T, on a computer, twelve subtests with eleven of them scored. Three of Pearson's numbers don't match the 2015 pamphlet, and they're marked where they come up. We use Pearson's, because it's newer. Check your own test notice before you sit.",
    "This is our own summary, and every example is ours. Commission isn't affiliated with or endorsed by the Department of the Air Force, AFPC or Pearson."
  ],
  sections:[["format","The test, start to finish","list"],["composites","What the composites are made of","list"],["minimums","Minimums and retests","rules"],["subtests","Subtest by subtest","list"],["sj","The Situational Judgment key","rules"],["contrasts","Easy to mix up","contrasts"],["day","The day before and the morning of","rules"]],
  format:[
    {group:"Getting a seat", items:[
      {name:"Which test", where:"Form T, since 2014", d:"Still the current form. It's given on a computer now, at a Pearson test center, a base test office or an ROTC detachment. Not at MEPS. That's the ASVAB.", ch:1, sec:0},
      {name:"The voucher", where:"From a recruiter or a base test control officer", d:"You can't book without one. The test itself is free.", ch:1, sec:0},
      {name:"How long", where:"About five hours", d:"That's check in and breaks included. The timed parts, with the 15 minute break, come to a bit over three and a half hours.", ch:1, sec:0},
      {name:"How it's scored", where:"Number right, then composites", d:"Scored on number right, then turned into composite percentiles. Nothing comes off for a wrong answer, so a guess is free. Pearson won't release your scores until every item has an answer. Scores post in two to three business days.", ch:1, sec:0}
    ]},
    {group:"The running order", note:"Pearson's order, items and minutes. Five choices on every item except Instrument Comprehension, which has four.", items:[
      {name:"1. Verbal Analogies", where:"25 items, 8 minutes", d:"Finish a pair to match the first one, or pick the whole pair that matches.", ch:1, sec:0},
      {name:"2. Arithmetic Reasoning", where:"25 items, 29 minutes", d:"Word problems, with scratch paper.", ch:1, sec:0},
      {name:"3. Word Knowledge", where:"25 items, 5 minutes", d:"One word in capitals, and you pick the closest meaning.", ch:1, sec:0},
      {name:"4. Math Knowledge", where:"25 items, 22 minutes", d:"Algebra, geometry and math vocabulary.", ch:6, sec:0},
      {name:"5. Reading Comprehension", where:"25 items, 24 minutes [2015 pamphlet: 38]", d:"Several passages, each with its own set of questions. The time is the one most worth checking on your test notice.", ch:1, sec:0},
      {name:"6. Situational Judgment", where:"16 items, 35 minutes [2015 pamphlet: 50]", d:"A junior officer's problem and five actions. You pick the most and the least effective. The pamphlet counted each pick as an item, so its 50 is 25 problems. Check your own test notice.", ch:1, sec:0},
      {name:"Break", where:"15 minutes", d:"The one scheduled break, right after Situational Judgment.", ch:1, sec:0},
      {name:"7. Self-Description Inventory", where:"240 statements, 45 minutes", d:"How you work and deal with people, on a five point agree scale. Not graded. It's there to help match people to jobs.", ch:5, sec:5},
      {name:"8. Physical Science", where:"20 items, 10 minutes", d:"High school physics, chemistry and earth science.", ch:1, sec:0},
      {name:"9. Table Reading", where:"40 items, 7 minutes", d:"An X and a Y, a big grid, and the number where they cross.", ch:1, sec:0},
      {name:"10. Instrument Comprehension", where:"25 items, 5 minutes", d:"An attitude dial and a compass, then four pictures of an airplane. Pick the one that matches.", ch:1, sec:0},
      {name:"11. Block Counting", where:"30 items, 5 minutes [2015 pamphlet: 4.5]", d:"A pile of blocks. Count how many a numbered block touches.", ch:1, sec:0},
      {name:"12. Aviation Information", where:"20 items, 8 minutes", d:"Aerodynamics, controls, instruments and the airfield.", ch:1, sec:0}
    ]}
  ],
  composites:[
    {group:"Composites", note:"Each is a percentile from 1 to 99, so a 60 beat about sixty percent of the comparison group. These lists follow the 2015 pamphlet. A newer citation of the Air Force manual lists CSO and ABM differently, so treat those two as unsettled.", items:[
      {name:"Pilot", d:"Math Knowledge, Table Reading, Instrument Comprehension and Aviation Information. Both versions agree on this one. If you want a cockpit, these are the four to push.", ch:1, sec:1},
      {name:"Combat Systems Officer (CSO)", d:"Word Knowledge, Math Knowledge, Table Reading and Block Counting in the pamphlet. The newer citation swaps in Verbal Analogies, Arithmetic Reasoning and Physical Science for Word Knowledge.", ch:1, sec:1},
      {name:"Air Battle Manager (ABM)", d:"Verbal Analogies, Math Knowledge, Table Reading, Instrument Comprehension, Block Counting and Aviation Information in the pamphlet. The newer citation has a different mix.", ch:1, sec:1},
      {name:"Academic Aptitude", d:"All five verbal and math subtests: Verbal Analogies, Arithmetic Reasoning, Word Knowledge, Math Knowledge and Reading Comprehension.", ch:1, sec:1},
      {name:"Verbal", d:"Verbal Analogies, Word Knowledge and Reading Comprehension.", ch:1, sec:1},
      {name:"Quantitative", d:"Arithmetic Reasoning and Math Knowledge.", ch:1, sec:1},
      {name:"Situational Judgment", d:"Reported as its own score. In the pamphlet, Physical Science and the inventory feed no composite.", ch:1, sec:1},
      {name:"PCSM", where:"Pilot candidates", d:"Not an AFOQT score. It combines your Pilot composite, a separate computer test called the TBAS, and your logged flying hours into a number from 1 to 99. The formula isn't published, and flying hour credit tops out at 41.", ch:1, sec:1}
    ]}
  ],
  minimums:[
    {r:"Verbal 15 and Quantitative 10.", why:"Any commission needs both, rated job or not.", ch:1, sec:1},
    {r:"25 on your rated composite.", why:"Pilot 25 for pilot, CSO 25 for CSO, ABM 25 for ABM. You still need Verbal 15 and Quantitative 10 on top of it.", ch:1, sec:1},
    {r:"Your unit's posting may add a floor.", why:"Some set a PCSM minimum, which means you need a TBAS score too. Some Guard units have also asked pilot applicants for CSO 10, with Pilot plus CSO at 50 or more. Read your own unit's posting, and ask your unit or recruiter which rule each line comes from.", ch:1, sec:1},
    {r:"Two tries, at least 90 days apart.", why:"A third try needs a waiver. Plan your date so there's room for a second one before your board if you need it.", ch:1, sec:1},
    {r:"Your best counts.", why:"Scores are superscored: your best result on each composite across all your tries. A second try can only raise a number. Form T scores don't expire.", ch:1, sec:1}
  ],
  subtests:[
    {group:"1. Verbal Analogies", note:"Can you name how two words are linked, and find the pair linked the same way?", items:[
      {name:"Traps", d:"A choice from the right topic with the wrong link. Aviation words next to an aviation stem aren't right just for being aviation words. And a pair that runs backward, strong to mild when the stem runs mild to strong.", ch:2, sec:1},
      {name:"Pacing", where:"About 19 seconds each", d:"At four minutes you want to be near item 13. Behind? Spend less on the ones you don't know cold.", ch:2, sec:2},
      {name:"Tricks", d:"Say the first pair as a sentence, then run every choice through it. Two choices fit? Your sentence is too loose. Tighten it until one drops out.", ch:2, sec:1}
    ]},
    {group:"2. Arithmetic Reasoning", note:"Can you turn a paragraph into a setup and work it on scratch paper?", items:[
      {name:"Traps", d:"Two hours twenty minutes written as 2.2 hours. Averaging two rates or two class averages when the times or group sizes differ. A real number from the problem that answers a different question.", ch:5, sec:1},
      {name:"Pacing", where:"About 70 seconds each", d:"Most of that minute goes to reading and setting up. It comes right after a fast subtest, so read the first problem twice.", ch:4, sec:4},
      {name:"Tricks", d:"Amount equals rate times time. Have two, get the third. Write units next to every number, and if they don't come out as what was asked, the setup's wrong. Practice without a calculator.", ch:5, sec:0},
      {name:"Speeds", d:"Head on or flying apart, add the speeds. Same way, subtract. Average speed? Total miles over total hours. Don't average the two speeds, that's the trap.", ch:5, sec:6},
      {name:"Ratios", d:"Cross multiply. A map scale's a ratio too. More of one and less of the other means inverse, so multiply instead. Splitting 7 to 4? Add the parts first, then divide.", ch:5, sec:7},
      {name:"Percents", d:"Change goes over the number you started with. Up 10, then down 10, and you're short. Simple interest is principal times rate times years. Undo a markup by dividing.", ch:5, sec:8},
      {name:"Mixtures and work", d:"Follow the pure stuff, amount times strength. Two working together? Add rates, not times. With both helping, it beats the faster one alone. With a drain, it's slower.", ch:5, sec:9},
      {name:"Other setups", d:"Weighted average: total over total, not the two averages split down the middle. Probability: what you want over everything. Overlaps: don't count the both group twice. Handshakes: n times n minus one, over two.", ch:5, sec:10}
    ]},
    {group:"3. Word Knowledge", note:"How big is your vocabulary, and can you take apart a word you half know?", items:[
      {name:"Traps", d:"A choice that shares the first syllable and nothing else. The exact opposite, for the person who knows the word but not which side it's on. Near meanings that are wrong in one way that matters.", ch:2, sec:0},
      {name:"Pacing", where:"About 12 seconds each", d:"Halfway is two and a half minutes, and you want to be near item 13. Know it or guess and go.", ch:2, sec:2},
      {name:"Tricks", d:"Break it into pieces: pre, post, sub, trans, port, dict, cred, ver. Check whether it praises or knocks, and drop the choices with the wrong charge. Between two near meanings, take the one you could swap in anywhere.", ch:2, sec:0}
    ]},
    {group:"4. Math Knowledge", note:"Algebra, geometry, factoring and the names of things, with no story wrapped around them.", items:[
      {name:"Traps", d:"Stopping one step early. Forgetting to flip the inequality when you divide by a negative. Area when they asked for circumference. Adding the legs of a right triangle instead of using the squares.", ch:6, sec:4},
      {name:"Pacing", where:"About 53 seconds each", d:"Quick recall items buy time for the geometry. Put your best guess on a long one and move on. Come back only if the screen lets you.", ch:6, sec:0},
      {name:"Tricks", d:"Triangle angles total 180. A polygon's inside angles add up to sides minus two, times 180. Same base, multiply: add the exponents. Factor a trinomial by finding the pair with the right product and the right sum. Plug your answer back in to check it.", ch:6, sec:6}
    ]},
    {group:"5. Reading Comprehension", note:"Can you read formal prose fast and answer only from what it says?", items:[
      {name:"Traps", d:"A choice that's true but isn't on the page. A real detail lifted from the wrong line. Main idea choices that cover only one paragraph. Extreme words like always, never and only in prose that hedges.", ch:3, sec:1},
      {name:"Pacing", where:"About a minute a question, reading included [2015 pamphlet gave more]", d:"Read each passage once for its shape: what each paragraph is doing. Don't memorize details. Know where they live.", ch:3, sec:0},
      {name:"Tricks", d:"Put a finger on the line that supports your answer. Can't find it? It isn't the answer. Watch the small words: may, must, unless, except, only after, by, not. A choice shorter and surer than its line probably dropped one.", ch:3, sec:2}
    ]},
    {group:"6. Situational Judgment", note:"Do you handle people problems the way experienced officers would?", items:[
      {name:"Traps", d:"Going over a head because it's faster. Briefing the boss behind a peer's back. Quietly doing someone's job for them. A quiet fix that leaves a false record in place.", ch:1, sec:2},
      {name:"Pacing", where:"About two minutes a problem, if Pearson's 16 are problems", d:"If your screen shows the pamphlet's 25 problems, it's closer to a minute and a half. Check the count when the subtest opens and set your halfway mark from it.", ch:2, sec:2},
      {name:"Tricks", d:"Read all five before you pick either one. Rank them. The least effective is easier to see once the others are in order. See the key below.", ch:2, sec:4}
    ]},
    {group:"7. Self-Description Inventory", note:"How you work and deal with people. Not graded, and there are no right answers.", items:[
      {name:"Traps", d:"Answering as the officer you think they want. Spending the time guessing what each line is for.", ch:5, sec:5},
      {name:"Pacing", where:"About 11 seconds each", d:"Take your first honest answer and keep moving. Answer every one. Pearson's page says each question must be answered to receive results.", ch:5, sec:5}
    ]},
    {group:"8. Physical Science", note:"High school physics, chemistry and earth and space science, mostly one step recall.", items:[
      {name:"Traps", d:"Mass and weight swapped: mass doesn't change on the moon. The final speed used as the acceleration. Thinking twice the speed means twice the energy. It's four times. Dividing a half life evenly when it halves.", ch:7, sec:1},
      {name:"Pacing", where:"About 30 seconds each", d:"Most are recall, so know it or guess. Save your seconds for the few with one step of math.", ch:7, sec:0},
      {name:"Tricks", d:"Force is mass times acceleration. Current is voltage over resistance. One pH step is ten times. Sound needs something to travel through, light doesn't. Seasons come from the tilt, not the distance.", ch:7, sec:3}
    ]},
    {group:"9. Table Reading", note:"Perceptual speed. Can you find one cell in a big grid without slipping a row?", items:[
      {name:"Traps", d:"Many wrong choices are the cells next door or the cell with X and Y swapped.", ch:1, sec:5},
      {name:"Pacing", where:"About 10 seconds each", d:"Accuracy first, then speed. A fast wrong answer is still wrong, and a cell next door is often one of the choices.", ch:1, sec:5},
      {name:"Tricks", d:"X is the column across the top. Y is the row down the side. Find the column, then slide down to the row, and say the sign out loud in your head so a minus doesn't vanish.", ch:1, sec:5}
    ]},
    {group:"10. Instrument Comprehension", note:"Can you see the airplane's attitude and heading from two dials?", items:[
      {name:"Traps", d:"Wrong pictures often miss on just one thing: bank, pitch or heading. Two may look right until you check that cue.", ch:8, sec:4},
      {name:"Pacing", where:"About 12 seconds each", d:"Check the cues in the same order every time, and throw out a picture the moment one cue misses.", ch:8, sec:4},
      {name:"Tricks", d:"You're looking north, east on your right. Horizon below the little airplane means climbing, above means diving. Whichever end of the horizon line sits higher, that's your low wing side. The pointer at the top agrees. East points the nose right, west left, south at you, north away.", ch:8, sec:3}
    ]},
    {group:"11. Block Counting", note:"3D spatial reasoning. How many blocks does a numbered block touch?", items:[
      {name:"Traps", d:"Counting a block that meets yours only at an edge or a corner. Missing the hidden block holding yours up.", mock:true},
      {name:"Pacing", where:"About 10 seconds each [2015 pamphlet: 9]", d:"Same pile for several items, so learn its shape on the first one and the rest go faster.", mock:true},
      {name:"Tricks", d:"Only face contact counts, and a partial face still counts. Go in the same order every time: above, below, then each side. Nothing floats, so anything resting on air has a block under it.", mock:true}
    ]},
    {group:"12. Aviation Information", note:"Aerodynamics, flight controls, instruments and the airfield.", items:[
      {name:"Traps", d:"Angle of incidence and angle of attack swapped. A stall is about angle of attack, at any airspeed.", ch:8, sec:6},
      {name:"Pacing", where:"About 24 seconds each", d:"Last subtest of a long day. Know it or guess, and finish with an answer on every item.", ch:8, sec:0},
      {name:"Tricks", d:"Each control with its axis and its motion. Ailerons, longitudinal, roll. Elevator, lateral, pitch. Rudder, vertical, yaw. Beacons: white and green is a land airport, and a military field flashes the white twice.", ch:1, sec:4}
    ]}
  ],
  sj:[
    {r:"The person closest to the problem, first.", why:"Directly, in private, and early. Talk to the person before you talk about them.", ch:1, sec:2},
    {r:"Then the chain of command, one level at a time.", why:"Use it after a direct try fails, not in place of one. Tell the person you're going up. Skipping a level is going over a head.", ch:2, sec:3},
    {r:"The big exception: something false or unsafe still in motion.", why:"Ask three things. Is it false or unsafe? Is somebody about to use it, a jet, a report, a commander? Is it still moving, not already caught? If all three are yes, the most effective pick usually stops it and reports it now.", ch:4, sec:0},
    {r:"Even then, keep the order.", why:"Your own supervisor before the office above them, face to face, not on the radio. A private word with the person first is fine if it doesn't slow the stop. What happens to them isn't your call.", ch:4, sec:0},
    {r:"Your own mistake? Report it before anybody asks.", why:"To the person it affects, with what you've already done about it. Waiting to see if anyone notices ranks low.", ch:4, sec:1},
    {r:"A signature says you did it or saw it.", why:"Signing for work you didn't see is a false record, even if the work turns out fine. Loyalty doesn't change that.", ch:4, sec:1},
    {r:"Bad news early, and from you.", why:"Carry out an order you don't like, and question it in private. Running it down in front of your people is one of the lowest picks there is.", ch:4, sec:2},
    {r:"Same message, right room.", why:"When two options say the same thing, the one that reaches the right person soonest without an audience wins.", ch:4, sec:3},
    {r:"Least effective does the most damage.", why:"A lie, a quiet cover, or going over a head usually beats a public correction for worst. Doing nothing can be least, but don't assume it.", ch:2, sec:4}
  ],
  contrasts:[
    {topic:"Pearson now vs. the 2015 pamphlet", l:["Pearson","2015 pamphlet"], a:"Reading Comprehension 24 minutes. Situational Judgment 16 items. Block Counting 5 minutes.", b:"38 minutes. 50 picks, or 25 problems. 4.5 minutes. Check your own test notice.", ch:1, sec:0},
    {topic:"Up the chain vs. over a head", l:["Up the chain","Over a head"], a:"You tried the person first, and you tell them you're going to the next level.", b:"You took it to their boss before you raised it with them.", ch:2, sec:3},
    {topic:"Stop and report vs. a quiet fix", l:["Stop and report","Quiet fix"], a:"The problem gets fixed and the person who needs to know hears about it. Often most effective.", b:"The problem gets fixed and nobody hears. The false record stays. Often least effective.", ch:4, sec:0},
    {topic:"Most vs. least effective", l:["Most","Least"], a:"Who owns the problem, and does this deal with it at the right level, soon and in private?", b:"Which one does the most harm? A lie or a skipped level usually beats slow.", ch:2, sec:4},
    {topic:"X vs. Y on Table Reading", l:["X","Y"], a:"The column, across the top.", b:"The row, down the side. Swapping them is the costliest slip on the page.", ch:1, sec:5},
    {topic:"Detail vs. inference", l:["Detail","Inference"], a:"One line says it. The trap is a real detail from a different line.", b:"Nobody wrote it, but the lines force it. Take the smallest step, not the bold leap.", ch:3, sec:1},
    {topic:"Climbing vs. diving on the attitude dial", l:["Climbing","Diving"], a:"The horizon line sits below the little airplane.", b:"The horizon line sits above it.", ch:8, sec:1},
    {topic:"Face vs. edge on Block Counting", l:["Counts","Doesn't count"], a:"Any shared face, even part of one.", b:"Touching only along an edge or at a corner.", mock:true},
    {topic:"Verbal vs. Quantitative", l:["Verbal","Quantitative"], a:"Analogies, Word Knowledge and Reading Comprehension. You need 15.", b:"Arithmetic Reasoning and Math Knowledge. You need 10.", ch:1, sec:1}
  ],
  day:[
    {r:"The day before: read your test notice and confirmation.", why:"Time, address, what ID to bring and when to show up. Then write the subtest order and minutes from the current Pearson page and check what you wrote against it.", ch:4, sec:4},
    {r:"The day before: read your unit's posting once more.", why:"The minimums, any PCSM floor and the dates, each line to its period. If one still isn't clear, ask your unit, not the break room.", ch:3, sec:4},
    {r:"The day before: one short set in test order, then stop.", why:"A timed analogy block straight into a few word problems, so the switch isn't new tomorrow. No new material. Go over your word pieces instead of learning new words.", ch:4, sec:4},
    {r:"The morning of: eat, and get there early.", why:"It's about five hours. Five minutes of analogies said out loud as sentences gets your head working before you walk in.", ch:2, sec:1},
    {r:"In the room: answer everything.", why:"Scoring counts the number right, and nothing comes off for a wrong answer, so a blank and a wrong answer cost the same. Guess and move.", ch:1, sec:0},
    {r:"In the room: look at the clock once, at halfway.", why:"Time left over items left. Do the division once, then go back to work.", ch:2, sec:2},
    {r:"At the break: reset for the second half.", why:"The inventory comes next. First honest answer, every statement. Then Physical Science, then the speed subtests, where accuracy comes first.", ch:5, sec:5},
    {r:"If one subtest goes badly, keep going.", why:"Composites mix several subtests, and your best score on each counts across your tries. One bad block doesn't decide the day.", ch:1, sec:1}
  ]
};
