// The Appeal (LSAT) exam week review (2026-10-25): one on screen page for the last days before the test. Never narrated.
// Loaded from the lsat scripts list in courses.js. engine.js (renderReview, route #lsat/review, the button in the home page's Practice exam
// card) reads window.HALCYON_REVIEW.lsat; its header explains sections and kinds.
// Shape: intro [paragraphs]; sections [[id, title, kind]]; lr, flaws and rc [{group, note?, items:[{name, where?, d, ch, sec}]}] (kind list);
// conditional and timing [{r, why, ch, sec}] (kind rules); contrasts [{topic, l:[left label, right label], a, b, ch, sec}].
// ch and sec point at where the book teaches it: Full Course chapter ch, Ana's Pencil (the lesson), section index sec (0 based, in the order
// of courses/lsat/full/chNN.js lesson.sections). mock:true instead of ch means only the practice test teaches it.
// Sources: the lessons, quizzes and explanations in courses/lsat/full/ch01.js to ch12.js and courses/lsat/mock/lr1.js, rc.js and lr2.js;
// LSAC's current test format pages (two scored LR sections, one scored RC, one unscored section, 35 minutes each, a 10 minute break
// after section 2, no Analytical Reasoning since August 2024, LSAT Argumentative Writing unscored and required); and the coverage audit
// of 2026-10-25 (halcyon-private). Stem cues are paraphrased in our own words. No LSAC or PrepTest text is quoted or adapted here.
// Study plan (2026-11-06): sections lawhub, plan and blind. LawHub facts from lsac.org, read 2026-11-06: Official LSAT Practice Tests
// (https://www.lsac.org/lsat/prepare/official-lsat-practice-tests: four full four section PrepTests free through LawHub; LawHub Advantage
// gives one year of access to a larger library), https://www.lsac.org/lawhub (a LawHub account is free; Advantage is a paid yearly
// upgrade), and The LSAT Will Look a Little Different Starting August 2027 (https://www.lsac.org/lsat-will-look-little-different-starting-august-2027:
// RC first, 40 questions in 52 minutes; two LR sections of 32 in 45 minutes; unscored questions inside each section; a 10 minute break
// after each of the first two sections; new format practice tests from February 2027). No price is quoted, by the bible's rule. The plan and the
// blind review method are general study practice in our own words. The two new flaw items are taught in ch3 "Two more" and the chain
// and unless rules in ch5 "Chains and counting words"; the blind review section points to ch8 "The review" (2026-11-06 fix pass).
// Copy rules: plain words, contractions, no dashes.
window.HALCYON_REVIEW=window.HALCYON_REVIEW||{};
window.HALCYON_REVIEW.lsat={
  intro:[
    "One screen for the last few days. Everything here is something the book already taught you, boiled down, with a link back to the lesson that teaches it.",
    "This is the current LSAT: four multiple choice sections of 35 minutes each. Two scored Logical Reasoning sections, one scored Reading Comprehension section, and one unscored section of either kind that you can't pick out. There's a 10 minute break after section two. Logic games ended in August 2024, so there are none here. LSAT Argumentative Writing is separate and unscored, and it has to be on file before your score is released.",
    "This is our own summary, and every example is ours. LSAC's own pages are the official word on the test. The Appeal isn't affiliated with or endorsed by LSAC."
  ],
  sections:[["lr","Logical Reasoning, type by type","list"],["flaws","Flaw patterns","list"],["conditional","Conditional logic and counting words","rules"],["rc","Reading Comprehension","list"],["timing","Timing plan","rules"],["contrasts","Easy to mix up","contrasts"],["lawhub","Real tests on LawHub","rules"],["plan","Study plan, week by week","rules"],["blind","Blind review","rules"]],
  lr:[
    {group:"Find the structure", note:"Every argument is a claim and some reasons. Find the conclusion before you judge anything.", items:[
      {name:"Main conclusion", where:"Asks for the main point or conclusion", d:"Ask each sentence why you should believe it. The claim nothing else is there to support is the conclusion. Traps: a premise, the intermediate conclusion, or a choice stronger than the author.", ch:1, sec:0},
      {name:"Role of a statement", where:"Asks what job a quoted claim does", d:"Name the job before you read the choices. Arrows in and out make it intermediate, only out is a premise, only in is the main conclusion.", ch:1, sec:1},
      {name:"Complete the argument", where:"Ends in a blank", d:"After so or therefore, the blank is the conclusion. After because, it's the premise that closes the gap. Write your own ending first, at the strength the premises earn.", ch:1, sec:2},
      {name:"Method of reasoning", where:"Asks how the argument proceeds", d:"Describe the moves without the subject, then test every word of each choice against what the arguer actually did.", ch:3, sec:3}
    ]},
    {group:"Assumptions and principles", items:[
      {name:"Necessary assumption", where:"The argument depends on or requires it", d:"Deny each choice plainly. Keep the one whose denial sinks the argument. Modest is good here, and too strong is the trap.", ch:2, sec:0},
      {name:"Sufficient assumption", where:"If assumed, the conclusion follows", d:"Find the idea that shows up only in the conclusion and bridge it to the premises. Strong words like all, every and only are good here.", ch:2, sec:1},
      {name:"Principle that justifies", where:"Which rule, if valid, supports the reasoning", d:"Works like a sufficient assumption. The rule's when has to fit the facts and its then has to fit the conclusion. A broad rule is fine.", ch:6, sec:0},
      {name:"Principle applied", where:"Which case conforms to the rule", d:"Write down every condition and every unless first, then test each choice against the list. A rule says nothing about cases it doesn't reach.", ch:6, sec:1}
    ]},
    {group:"Flaw and its cousins", items:[
      {name:"Flaw", where:"Asks why the reasoning is open to criticism", d:"Treat the premises as true. Say the flaw in one plain sentence before you look. Cut choices that describe a move it never made, attack a premise, or are true but not the error.", ch:3, sec:0},
      {name:"Parallel reasoning", where:"Asks which argument reasons most like it", d:"Write the bones. Match the conclusion's type and strength first, then the premises. Order doesn't matter and the subject never does.", ch:7, sec:0},
      {name:"Parallel flaw", where:"Asks which one is flawed the same way", d:"Name the flaw, then find that exact mistake. A different flaw is wrong, and so is a choice that one extra word quietly fixed.", ch:7, sec:1}
    ]},
    {group:"Strengthen, weaken, evaluate", items:[
      {name:"Strengthen", d:"Treat each choice as true. Rule out a rival cause, show the sample was fair, or close off another explanation. Strong is fine if it pushes the right way.", ch:4, sec:1},
      {name:"Weaken", d:"Don't deny a premise. Add a fact that makes the step to the conclusion less safe: another cause, a skewed sample, an explanation that fits just as well.", ch:4, sec:2},
      {name:"Evaluate", where:"Asks what would be most useful to know", d:"Answer each choice yes, then no. The right one moves the argument both times. A choice that only checks a premise cuts one way.", ch:8, sec:3}
    ]},
    {group:"Draw the inference", items:[
      {name:"Must be true", where:"If the statements are true, what else must be", d:"There's no argument to fix. Join two facts. Anything one word past the page is wrong.", ch:5, sec:0},
      {name:"Most strongly supported", d:"A notch softer: the claim the facts back best, usually by one short step. Be suspicious of all, always and proves.", ch:5, sec:0},
      {name:"Cannot be true", where:"Must be false, or could be true except", d:"Find the one choice that contradicts the facts. Merely unlikely isn't enough.", ch:5, sec:2}
    ]},
    {group:"Two speakers and paradoxes", items:[
      {name:"Point at issue", where:"Asks what the two disagree about", d:"Ask both speakers about every choice. You need one yes and one no, from what they said or plainly implied. A concession is agreement.", ch:6, sec:2},
      {name:"Point of agreement", d:"Two yeses. It often hides in the concession, and it can be smaller than either side's position.", ch:6, sec:3},
      {name:"Resolve the paradox", where:"Asks what explains a discrepancy", d:"Both facts stay true. The answer makes them fit together, often through a difference nobody mentioned. A choice that explains only one fact is the trap.", ch:9, sec:1}
    ]}
  ],
  flaws:[
    {group:"The shapes that keep coming back", note:"The choices describe the move in plain words, rarely by name. Match the description to the argument.", items:[
      {name:"Group and member", d:"What's true of the whole group gets pinned on one member, or the other way round.", ch:3, sec:1},
      {name:"Fits isn't shows", d:"The facts fit this explanation, so it must be this one. Ask what else would leave the same facts behind.", ch:3, sec:1},
      {name:"One reason", d:"Someone did a thing, and the argument picks one reason as if there were no other.", ch:3, sec:1},
      {name:"Nobody said otherwise", d:"No evidence it happened gets treated as evidence it didn't, especially when nobody looked.", ch:3, sec:1},
      {name:"Attacking the source", d:"The argument goes after who made the claim instead of what's wrong with it.", ch:3, sec:1},
      {name:"After, so because", d:"One thing followed or went with another, so it caused it. Something else may cause both, or it's chance.", ch:3, sec:1},
      {name:"Needed treated as enough", d:"A requirement gets treated as a guarantee, or a guarantee as the only way.", ch:2, sec:2},
      {name:"The reversed rule", d:"Every A is a B becomes every B is an A. Running a rule backward without denying both halves.", ch:2, sec:1},
      {name:"Interested witness", d:"Showing a witness has a reason to lie weakens the testimony. Concluding it's false goes too far.", ch:11, sec:0}
    ]},
    {group:"Numbers and samples", items:[
      {name:"Share vs. count", d:"A smaller share can still be a bigger number if the total grew. Doubled from two is four. Ask of what, and how many.", ch:8, sec:0},
      {name:"Averages", d:"One huge number in the total can drag an average anywhere. Ask what went into it before calling it typical.", ch:8, sec:0},
      {name:"A sample that picked itself", d:"Comment cards, web polls, the cases somebody reported. How they got in matters more than how many.", ch:8, sec:1},
      {name:"Ignoring the base rate", d:"Most fires start while someone's home, but most cooking happens then too. Set the number beside how common the thing is overall.", ch:8, sec:2},
      {name:"Counting only who's left", d:"A study that drops the members it lost track of can overstate its result, because the missing ones may differ.", mock:true}
    ]},
    {group:"Two more to know", items:[
      {name:"A word that changes meaning", d:"A key word means one thing in a premise and something else in the conclusion. Say what the word means each time it shows up.", ch:3, sec:2},
      {name:"Arguing in a circle", d:"The reason only holds if the conclusion is already true. Ask whether any reason stands on its own.", ch:3, sec:2}
    ]}
  ],
  conditional:[
    {r:"If A, then B: A is enough for B.", why:"It doesn't say A is the only way to get B.", ch:2, sec:1},
    {r:"The contrapositive is free.", why:"If A then B gives you one move: no B, so no A. Flip both halves and deny both, and it's always as true as the original.", ch:5, sec:2},
    {r:"Never flip without denying.", why:"Every A is a B doesn't give you every B is an A. On an inference question that reversed rule shows up as a choice that sounds just like a fact you were given.", ch:5, sec:1},
    {r:"A requirement is a floor, a guarantee is a ceiling.", why:"Most outcomes need several floors, and no one of them is enough. Once in a while one statement is both.", ch:2, sec:2},
    {r:"Deny the plain way.", why:"The opposite of all is not all, not none. The opposite of some is none.", ch:2, sec:0},
    {r:"Most plus most makes some.", why:"Two groups that each take more than half of the same whole have to overlap. Some plus some gives you nothing.", ch:5, sec:3},
    {r:"Watch the size of the words.", why:"If the facts say most, the answer can't say all. Some can't become most, can can't become will, and after can't become because.", ch:9, sec:2},
    {r:"Check the when and the then.", why:"A principle needs both halves to land: its condition met by the facts, its result matching the conclusion.", ch:6, sec:0},
    {r:"A rule only decides what it reaches.", why:"It says what happens when its condition is met. It's silent about every other case.", ch:6, sec:1},
    {r:"Chain the ifs.", why:"If A then B, and if B then C, gives you if A then C. So no C means no A. Line up the arrows before you read the choices.", ch:5, sec:3},
    {r:"Unless means if not.", why:"A unless B says that if B doesn't happen, A does. Turn it into an if before you chain it.", ch:5, sec:3}
  ],
  rc:[
    {group:"Reading the passage", note:"Four sets of five to eight questions, one of them usually a pair of shorter passages.", items:[
      {name:"Read it as an argument", d:"Who's talking, what do they claim, and what is each paragraph for? Stay inside the page.", ch:1, sec:4},
      {name:"Keep the voices apart", d:"What a witness said, what someone wrote down, and what someone else concluded are three different things.", ch:5, sec:4},
      {name:"Court opinions", d:"The main point is the decision. One reason along the way isn't the point, and the order of issues may be the lawyer's.", ch:9, sec:3},
      {name:"Comparative passages", d:"Before the questions, say in one sentence how the two passages relate.", ch:7, sec:3}
    ]},
    {group:"Question types", items:[
      {name:"Main idea and primary purpose", d:"The whole passage at its own scope. Purpose is the main idea as a verb: argue, describe, challenge.", ch:1, sec:4},
      {name:"Specific detail", where:"According to the passage", d:"The answer is in a line you can point to. Go back and find it every time.", ch:2, sec:3},
      {name:"Inference", where:"Suggests, implies, can be inferred", d:"A line from the passage plus one small step. If you have to argue for it, it's too far.", ch:5, sec:4},
      {name:"Meaning in context", d:"What the word means in that sentence, not in the dictionary.", ch:9, sec:3},
      {name:"Function and organization", d:"Why a piece is there, and the order of the jobs the paragraphs do. Shuffled order is the trap.", ch:3, sec:4},
      {name:"Author's attitude", d:"Read word choice, hedging and emphasis. Extreme attitudes are the usual trap.", ch:3, sec:4},
      {name:"Would agree with", d:"Stated, or very nearly stated, by the author or the person named.", ch:4, sec:3},
      {name:"Strengthen or weaken a passage claim", d:"Underline the claim the stem names before you read the choices.", ch:4, sec:3},
      {name:"Application and principle", d:"Run the new case through the passage's own conditions, one at a time. Don't add a condition or drop one.", ch:6, sec:4},
      {name:"Analogy", where:"Most similar or most analogous", d:"Name the relationship in plain words, then ignore every choice's topic.", ch:7, sec:4}
    ]}
  ],
  timing:[
    {r:"Every section counts.", why:"Four sections of 35 minutes, and the unscored one can be anywhere. How hard a section felt won't tell you which it was.", ch:9, sec:0},
    {r:"Know your pace.", why:"About 25 LR questions in 35 minutes is roughly a minute and 25 seconds each. RC is four sets, so about 8 or 9 minutes a set. The timed practice sections are where you learn the feel.", mock:true},
    {r:"Never leave a blank.", why:"A wrong answer costs nothing a blank wouldn't. A blank is the only answer sure to be wrong.", ch:9, sec:0},
    {r:"Don't let one question eat the clock.", why:"Every question is worth the same. Give it its share, put in your best guess, flag it, go get the easy one, and come back if there's time.", ch:9, sec:0},
    {r:"In the last minute, fill everything.", why:"Pick a letter for every one you haven't opened, then spend the seconds left reading one of them.", ch:9, sec:0},
    {r:"The break is still the test.", why:"Ten minutes after section two. No phone, no talking about questions, no scratch paper. Water, bathroom, a walk, and back early.", ch:9, sec:0},
    {r:"Practice on the real thing.", why:"LawHub has LSAC's released PrepTests, a few free and more in a paid library. Take them in the timed mode.", ch:1, sec:4},
    {r:"Do the writing early.", why:"LSAT Argumentative Writing opens 8 days before the test window. 15 minutes to plan, 35 to write. Take a position and answer the other perspectives fairly.", ch:9, sec:4}
  ],
  contrasts:[
    {topic:"Necessary vs. sufficient assumption", l:["Necessary","Sufficient"], a:"What the argument can't live without. Deny it and the argument falls. Modest wins.", b:"What would finish the argument. Add it and the conclusion has to follow. Strong wins.", ch:2, sec:1},
    {topic:"Necessary vs. sufficient condition", l:["Requirement","Guarantee"], a:"Has to be there, but isn't enough alone.", b:"Enough to bring the result, but maybe not the only way.", ch:2, sec:2},
    {topic:"Must be true vs. most strongly supported", l:["Must be true","Most strongly supported"], a:"The facts prove it. It can't be false if they're true.", b:"The facts back it best, usually by a short step, without guaranteeing it.", ch:5, sec:0},
    {topic:"Could be true vs. must be true", l:["Could be true","Must be true"], a:"Nothing rules it out. Not enough unless the stem asks for it.", b:"Nothing could make it false.", ch:5, sec:1},
    {topic:"Weakening vs. attacking a premise", l:["Weaken","Attack a premise"], a:"Adds a fact that makes the step to the conclusion less safe.", b:"Says a premise is false. The test treats premises as true, so this is never the answer.", ch:4, sec:2},
    {topic:"Point at issue vs. point of agreement", l:["Point at issue","Point of agreement"], a:"One speaker says yes and the other says no.", b:"Both say yes, often in the concession.", ch:6, sec:2},
    {topic:"Parallel reasoning vs. parallel flaw", l:["Parallel reasoning","Parallel flaw"], a:"Same structure, good or bad. Match the bones.", b:"Same mistake. Name the flaw first, then find its twin.", ch:7, sec:1},
    {topic:"Principle that justifies vs. principle the facts support", l:["Justify","Supported by the facts"], a:"Broad is fine, if it covers the case and reaches the conclusion.", b:"A rule that reaches far past the case says more than the facts show.", ch:6, sec:0},
    {topic:"Share vs. count", l:["Share","Count"], a:"A part of a whole. Says nothing about how many until you know the whole.", b:"How many. Says nothing about how big a part until you know the whole.", ch:8, sec:0},
    {topic:"Detail vs. inference", l:["Detail","Inference"], a:"What the passage says. Point to the line.", b:"What it supports without saying. The line plus one step.", ch:5, sec:4},
    {topic:"Main idea vs. primary purpose", l:["Main idea","Primary purpose"], a:"What the passage says, as a whole.", b:"What the author is trying to do with it, as a verb.", ch:1, sec:4},
    {topic:"A reason to lie vs. a lie", l:["Has a reason to lie","Is lying"], a:"Weakens an argument that leans on the witness.", b:"Doesn't follow. Getting from one to the other is a flaw.", ch:11, sec:0}
  ],
  lawhub:[
    {r:"Get a free LawHub account.", why:"LawHub is LSAC's own prep site. It runs past tests, which LSAC calls PrepTests, in the same screen you'll use on test day, with flags, highlighting and the question bar. A free account comes with four full PrepTests. Source: the Official LSAT Practice Tests page on lsac.org, checked November 6, 2026.", ch:1, sec:4},
    {r:"LawHub Advantage is the paid library.", why:"It's a yearly subscription that opens a much bigger library of full PrepTests, plus some law school tools. The price changes, so check lsac.org before you buy. Buy it once you've used the free tests, not before.", ch:1, sec:4},
    {r:"Take them like the real thing.", why:"Time every section at 35 minutes and take the 10 minute break after section two. Treat every section as scored, since on test day you won't know which one isn't. Untimed work is for review, not for tests.", ch:9, sec:0},
    {r:"LawHub tests are already in this format.", why:"Logic games left the test in August 2024, and LawHub says every PrepTest in its LSAT Prep library now follows the current format. Games only turn up in old printed PrepTest books. If you use one of those, leave the games section out and take the others.", ch:9, sec:0},
    {r:"Check which format your test date uses.", why:"LSAC says the test changes with the August 2027 test. Reading Comprehension comes first, 40 questions in 52 minutes, then two Logical Reasoning sections of 32 questions in 45 minutes each. The unscored questions sit inside each section, and there's a break after each of the first two. Tests through June 2027 keep the four section format this book uses. LSAC says practice tests in the new format come to LawHub in February 2027. Source: The LSAT Will Look a Little Different Starting August 2027, on lsac.org, checked November 6, 2026.", ch:9, sec:0}
  ],
  plan:[
    {r:"Week 1: chapters 1 and 2, then a starting score.", why:"Read and decide your way through the first two chapters and their quizzes. At the end of the week, take one free PrepTest on LawHub, timed, without studying for it. It's a starting line, not a verdict. Start a log of your misses the same day.", ch:1, sec:0},
    {r:"Weeks 2 and 3: chapters 3 and 4.", why:"Flaws, then strengthen and weaken, the two biggest families on the test. Do every quiz item, and log each miss by type and by the trap that caught you.", ch:3, sec:0},
    {r:"Weeks 4 and 5: chapters 5 and 6, and your first timed sections.", why:"Inference and principles. Take the practice test one section at a time in exam mode: a Logical Reasoning section in week 4 and the Reading Comprehension section in week 5. Blind review each one before you look at the score.", ch:5, sec:0},
    {r:"Weeks 6 and 7: chapters 7 and 8, then full sitting 1.", why:"Parallel reasoning, paired passages and numbers. At the end of week 7, take full sitting 1 straight through, break and all. Blind review it the next day.", ch:7, sec:0},
    {r:"Week 8: chapter 9 and a second PrepTest.", why:"Chapter 9 is test day: pacing, the break, guessing and the writing. Then take a second free PrepTest under real timing. Compare it with your first one by question type, not only by score.", ch:9, sec:0},
    {r:"Weeks 9 and 10: chapters 10 to 12, sittings 2 and 3.", why:"Finish the book. Take full sitting 2 at the end of week 9 and full sitting 3 at the end of week 10, and blind review each. By now your log should name your two or three weakest types. Reread those lessons.", ch:10, sec:0},
    {r:"Weeks 11 to 13: PrepTests, one or two a week.", why:"Use the last two free PrepTests, then LawHub Advantage if you want more. One full test a week at first, two a week near the end, each followed by a full blind review. Reviewing a test should take about as long as taking it. Between tests, work your weakest types with the chapter quizzes.", ch:9, sec:0},
    {r:"Test week: keep it light.", why:"One timed section a day at most, and nothing the day before. Get LSAT Argumentative Writing done once it opens, about eight days before your test, so it isn't hanging over you. Check LSAC's test day rules and your ID one more time.", ch:9, sec:4},
    {r:"Less time each week? Keep the order.", why:"Stretch the chapters over more weeks if you have to. Keep the timed sittings and PrepTests in the same order, and don't skip the review. The review is where most of the points come from.", ch:1, sec:4}
  ],
  blind:[
    {r:"Flag what you're unsure of as you go.", why:"During a timed section, flag every question you weren't sure of, even the ones you think you got. When time runs out, don't look at any answers yet.", ch:8, sec:5},
    {r:"Redo the flagged ones with no clock.", why:"Before you score anything, go back to each flagged question and work it again, slowly. Write one line on why your answer is right and why the strongest wrong one is wrong. Change an answer only if you can say why.", ch:8, sec:5},
    {r:"Score it twice.", why:"Score your timed answers and your blind review answers separately. The timed score is where you are. The blind review score is what you can do with time to think. A big gap points to speed or nerves. A low score on both points to a skill you still need.", ch:8, sec:5},
    {r:"Study every miss, and every lucky guess.", why:"For each question you still missed, and each one you got right by guessing, work out why the right answer is right and why yours is wrong. Read the explanation only after you've tried.", ch:8, sec:5},
    {r:"Log it by type and by trap.", why:"Write down the question type, the trap that caught you, such as too strong, reversed or off topic, and what you'll do next time. After a few tests, the log tells you which lessons to reread.", ch:8, sec:5},
    {r:"Try old misses again later.", why:"A week or two later, work the questions you missed again, cold. If you miss one again, it goes back in the log.", ch:8, sec:5}
  ]
};
