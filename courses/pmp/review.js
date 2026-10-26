// The Halcyon Launch (PMP) exam week review (2026-10-25): one on screen page for the last days before the exam. Never narrated.
// engine.js (renderReview, route #<course>/review, the button in the home page's Practice exam card) reads window.HALCYON_REVIEW[course id];
// a book without an entry shows no button and no page.
// Shape: intro [paragraphs]; formulas [{group, items:[{name, f, means, ex, ch, sec}]}]; terms [{group, items:[{t, d, ch, sec}]}];
// rules [{r, why, ch, sec}]; contrasts [{topic, pred, agile, ch, sec}].
// ch and sec point at where the book teaches it: Full Course chapter ch, Ruth's Console Log (the lesson), section index sec (0 based, in the
// order of full/v2/chNN.js lesson.sections). The engine opens that lesson, scrolls to the section and labels the link with the section's
// own heading, so a renamed heading needs no change here. mock:true instead of ch means the book teaches it only in the practice exam.
// Sources: the lessons, drills, quizzes and explanations in full/v2/ch01.js to ch15.js and mock/*.js, and the July 2026 PMP Examination
// Content Outline (People 33, Process 41, Business Environment 26; about 40 percent predictive, the rest agile or hybrid).
// Every definition is in our own words. PMBOK Guide text is PMI copyright: never paste its wording here.
// Every worked example was recomputed by hand on 2026-10-25. Copy rules: plain words, contractions, no dashes, "minus" for subtraction.
window.HALCYON_REVIEW=window.HALCYON_REVIEW||{};
window.HALCYON_REVIEW.pmp={
  intro:[
    "One screen for the last few days. Everything here is something the book already taught you, boiled down, with a link back to the lesson that teaches it.",
    "The July 2026 exam weights the domains People 33 percent, Process 41 percent and Business Environment 26 percent. About 40 percent of the questions are predictive and the rest are agile or hybrid, so expect both kinds of thinking on the same day.",
    "This is our own summary. PMI's current exam content outline is the official word on what's tested. Halcyon isn't affiliated with or endorsed by PMI."
  ],
  formulas:[
    {group:"Earned value", note:"One running example: a $100,000 job (BAC) planned evenly over 10 weeks. At the end of week 4, 30 percent of the work is done and it has cost $36,000.", items:[
      {name:"Planned value (PV)", f:"Budget for the work scheduled by the status date", means:"What you meant to have done by now, in dollars.", ex:"4 of 10 weeks on a $100,000 plan: PV = $40,000.", ch:5, sec:2},
      {name:"Earned value (EV)", f:"EV = percent complete x BAC", means:"The budget value of the work actually finished.", ex:"30 percent x $100,000 = $30,000.", ch:5, sec:2},
      {name:"Actual cost (AC)", f:"What the work performed so far really cost", means:"Cost incurred so far for the work performed. A commitment, like a purchase order for work not yet done, doesn't count until the cost is incurred.", ex:"Hours and invoices to date: AC = $36,000.", ch:5, sec:2},
      {name:"Cost variance (CV)", f:"CV = EV minus AC", means:"Negative means over budget.", ex:"30,000 minus 36,000 = negative $6,000, so over budget.", ch:5, sec:3},
      {name:"Schedule variance (SV)", f:"SV = EV minus PV", means:"Negative means behind schedule. It's in dollars, not days.", ex:"30,000 minus 40,000 = negative $10,000, so behind.", ch:5, sec:3},
      {name:"Cost performance index (CPI)", f:"CPI = EV / AC", means:"Value earned per dollar spent. Under 1 is bad.", ex:"30,000 / 36,000 = 0.83.", ch:5, sec:3},
      {name:"Schedule performance index (SPI)", f:"SPI = EV / PV", means:"Work done per unit of work planned. Under 1 is bad.", ex:"30,000 / 40,000 = 0.75.", ch:5, sec:3},
      {name:"EAC, if things keep going like this", f:"EAC = BAC / CPI", means:"Use it when the question says current performance will continue.", ex:"100,000 / 0.833 = $120,000.", ch:5, sec:4},
      {name:"EAC, if the problem was a one time event", f:"EAC = AC + (BAC minus EV)", means:"The rest of the work is expected to go at budget.", ex:"36,000 + 70,000 = $106,000.", ch:5, sec:4},
      {name:"EAC, if the original estimate was wrong", f:"EAC = AC + a new bottom up ETC", means:"Throw out the old estimate for the remaining work and build a new one.", ex:"36,000 + a fresh $80,000 estimate = $116,000.", ch:5, sec:4},
      {name:"EAC, if cost and schedule both drive the rest", f:"EAC = AC + (BAC minus EV) / (CPI x SPI)", means:"Use it when you're over budget, behind, and must still hit the date.", ex:"36,000 + 70,000 / (0.833 x 0.75) = 36,000 + 112,000 = $148,000.", ch:5, sec:4},
      {name:"Estimate to complete (ETC)", f:"ETC = EAC minus AC", means:"What the remaining work is expected to cost.", ex:"120,000 minus 36,000 = $84,000.", ch:5, sec:4},
      {name:"Variance at completion (VAC)", f:"VAC = BAC minus EAC", means:"The overrun (negative) or savings (positive) you now expect at the end.", ex:"100,000 minus 120,000 = negative $20,000.", ch:5, sec:4},
      {name:"TCPI to hit the budget", f:"TCPI = (BAC minus EV) / (BAC minus AC)", means:"The CPI the rest of the work needs to land on the original budget. Over 1 means you have to get better.", ex:"70,000 / 64,000 = 1.09, a big jump from 0.83.", ch:5, sec:5},
      {name:"TCPI to hit a new EAC", f:"TCPI = (BAC minus EV) / (EAC minus AC)", means:"The CPI needed to land on an approved new forecast instead.", ex:"70,000 / 84,000 = 0.83, the pace you're already on.", ch:5, sec:5},
      {name:"Agile earned value", f:"EV = (accepted points / planned points) x release budget", means:"Only accepted, done points earn value.", ex:"120 of 400 points on a $500,000 release: 0.3 x 500,000 = $150,000.", ch:5, sec:2},
      {name:"Cost baseline and budget", f:"Baseline = estimates + contingency. Budget = baseline + management reserve.", means:"In the usual setup contingency is inside the baseline and management reserve isn't. PMBOK 8 also shows contingency held outside it, so follow the question.", ex:"800,000 + 80,000 = $880,000 baseline; + 50,000 = $930,000 budget.", ch:5, sec:1},
      {name:"Earned schedule", f:"SV(t) = ES minus AT. SPI(t) = ES / AT.", means:"Schedule performance in time instead of money. ES is the point on the plan where today's EV was due; AT is time spent so far. It isn't in the PMBOK Guide and rarely shows up on the exam.", ex:"ES 12.5 days at day 15: SV(t) = negative 2.5 days, SPI(t) = 0.83.", ch:14, sec:4}
    ]},
    {group:"Estimating and the schedule", items:[
      {name:"PERT (beta) estimate", f:"(O + 4M + P) / 6", means:"A three point estimate weighted toward the most likely value.", ex:"O 4, M 7, P 16 days: (4 + 28 + 16) / 6 = 8 days.", ch:3, sec:1},
      {name:"Triangular estimate", f:"(O + M + P) / 3", means:"A plain average of the three points. Read which one the question asks for.", ex:"(4 + 7 + 16) / 3 = 9 days.", ch:3, sec:1},
      {name:"Activity standard deviation", f:"(P minus O) / 6", means:"How uncertain one estimate is.", ex:"(16 minus 4) / 6 = 2 days.", ch:3, sec:1},
      {name:"Path standard deviation", f:"Square root of the sum of the activity variances (SD squared)", means:"Add variances along a path, never standard deviations.", ex:"SDs of 2 and 1.5: 4 + 2.25 = 6.25, square root 2.5 days (not 3.5).", ch:3, sec:1},
      {name:"Critical path", f:"The longest path through the network", means:"It sets the shortest possible finish. Its total float is usually zero; strictly, it's the path with the least float, which can be negative when a date is imposed.", ex:"Paths of 13 and 16 days: the 16 day path is critical and the other has 3 days of float.", ch:3, sec:2},
      {name:"Total float", f:"LS minus ES (or LF minus EF)", means:"How far an activity can slip before the project end moves.", ex:"ES day 5, LS day 8: 3 days of total float.", ch:3, sec:2},
      {name:"Free float", f:"Earliest ES of the successors minus the activity's EF", means:"How far it can slip before it delays anything that follows.", ex:"EF day 10, next activity's ES day 12: 2 days of free float.", ch:3, sec:2},
      {name:"Crash cost slope", f:"(Crash cost minus normal cost) / (normal duration minus crash duration)", means:"Cost per day saved. Crash the cheapest critical activity first.", ex:"$20,000 for 10 days, or $29,000 for 7: 9,000 / 3 = $3,000 a day.", ch:3, sec:3}
    ]},
    {group:"Risk, quality and money", items:[
      {name:"Expected monetary value (EMV)", f:"EMV = probability x impact", means:"Threats come out negative and opportunities positive.", ex:"30 percent chance of a $50,000 hit: 0.3 x negative 50,000 = negative $15,000.", ch:4, sec:3},
      {name:"Is a risk response worth it?", f:"Exposure before vs. exposure after + the response's cost", means:"Pay for the response only if it lowers the total expected cost.", ex:"0.4 x 25,000 = 10,000 before; 0.1 x 25,000 + 6,000 = 8,500 after. It saves $1,500.", mock:true},
      {name:"Decision tree", f:"Each option: fixed cost + the sum of (probability x outcome)", means:"Pick the lowest expected cost or highest expected value. Don't forget the fixed cost.", ex:"Test for $10,000 with a 20 percent chance of $40,000 rework = 18,000. Skip it with a 50 percent chance = 20,000. Test.", ch:4, sec:4},
      {name:"Cost of quality", f:"Conformance (prevention + appraisal) + nonconformance (internal + external failure)", means:"Spend to get it right and to check it, versus what failure costs before or after delivery.", ex:"Training 5,000 + testing 15,000 + rework 8,000 + warranty 12,000 = $40,000.", ch:4, sec:1},
      {name:"Net present value (NPV)", f:"Each year's cash / (1 + rate) to the power of the year, added up, minus the cost", means:"Money later is worth less than money now. Higher NPV wins.", ex:"$100,000 now, $60,000 back in each of 2 years at 10 percent: 54,545 + 49,587 minus 100,000 = $4,132.", mock:true}
    ]},
    {group:"Contracts", items:[
      {name:"FPIF final fee and price", f:"Fee = target fee + seller's share x (target cost minus actual cost). Price = actual cost + fee, capped at the ceiling.", means:"The seller shares savings and overruns, but the buyer never pays past the ceiling.", ex:"Target cost 200,000, fee 20,000, 70/30, actual 180,000: fee 26,000, price $206,000.", ch:8, sec:2},
      {name:"Point of total assumption (PTA)", f:"(Ceiling price minus target price) / buyer's share + target cost", means:"Past this cost, the seller pays every extra dollar.", ex:"Same deal, ceiling 240,000: 20,000 / 0.7 + 200,000 = $228,571.", ch:8, sec:2},
      {name:"CPIF final fee", f:"Fee = target fee + seller's share x (target cost minus actual cost), between a minimum and maximum fee", means:"Costs are paid in full; only the fee moves. There's no PTA.", ex:"Target 300,000, fee 24,000, 80/20, actual 340,000: fee 16,000, total $356,000.", ch:8, sec:2},
      {name:"Make or buy breakeven", f:"Fixed cost / (per unit cost of the option without the fixed cost minus per unit cost of the option with it)", means:"Past the breakeven quantity, the option with the fixed cost wins. Ignore sunk costs.", ex:"Buy the unit for 24,000 and run it for 400 a day, or lease one at 1,200 a day: 24,000 / (1,200 minus 400) = 30 days.", ch:8, sec:6}
    ]},
    {group:"Agile and the team", items:[
      {name:"Communication channels", f:"n x (n minus 1) / 2", means:"Channels grow much faster than the team.", ex:"8 people: 28. Add 4 more: 12 x 11 / 2 = 66, so 38 new channels.", ch:6, sec:4},
      {name:"Velocity forecast", f:"Points left / velocity, as a range", means:"Use the low and high of recent sprints to give a range. One date from the best sprint ever is the trap.", ex:"150 points at 28 to 31 a sprint: 4.8 to 5.4, so plan on 5 to 6 sprints.", ch:7, sec:3},
      {name:"Weighted shortest job first (WSJF)", f:"Cost of delay / job size", means:"Highest score goes first.", ex:"A: 20 / 5 = 4. C: 12 / 2 = 6. C goes first.", ch:7, sec:2},
      {name:"Agile cost forecast", f:"Cost per sprint x sprints left", means:"A stable team costs about the same each sprint, so scope is what flexes.", ex:"$40,000 a sprint x 6 sprints = $240,000.", mock:true}
    ]}
  ],
  terms:[
    {group:"Starting and governing", items:[
      {t:"Project", d:"Temporary work in a unique setting that's meant to create value; ongoing repeated work is operations.", ch:1, sec:0},
      {t:"Project charter", d:"The sponsor's document that authorizes the project and gives the PM the authority to use resources.", ch:1, sec:1},
      {t:"Sponsor", d:"The person who backs the project with money and support and is answerable for clearing its way.", ch:1, sec:1},
      {t:"Governance", d:"Who gets to decide what, the rules they decide by, and the path a decision climbs when it's too big.", ch:1, sec:2},
      {t:"Organizational process assets", d:"The organization's own templates, procedures, policies and past lessons that a project can draw on.", ch:1, sec:2},
      {t:"Stakeholder register", d:"The list of everyone with a stake: who they are, their role, what they need and expect, how much sway they have, and how you've classified them. Current versus desired engagement is tracked in the engagement assessment matrix.", ch:1, sec:3},
      {t:"Salience model", d:"Sorts stakeholders by power, legitimacy and urgency; the ones with all three get the most attention.", ch:11, sec:2},
      {t:"Tailoring", d:"Choosing and adjusting the approach and processes to fit this project, instead of running every process by default.", ch:1, sec:5}
    ]},
    {group:"Planning and scope", items:[
      {t:"Integrated project management plan", d:"The one plan that ties every subsidiary plan and baseline together, owned by the PM and built with the team.", ch:2, sec:0},
      {t:"Scope baseline", d:"The approved scope statement, WBS and WBS dictionary that scope is measured against.", ch:2, sec:2},
      {t:"100 percent rule", d:"Each level of the WBS holds all the work of the level above it and nothing extra.", ch:2, sec:2},
      {t:"Scope creep and gold plating", d:"Creep is scope that grows without control; gold plating is the team adding extras nobody asked for.", ch:2, sec:1},
      {t:"Rolling wave planning", d:"Plan the near work in detail and the far work loosely, and fill in detail as you learn.", ch:2, sec:2},
      {t:"Change control board", d:"The group that reviews change requests and approves or rejects changes to the baselines.", ch:2, sec:3}
    ]},
    {group:"Schedule, quality and risk", items:[
      {t:"Crashing and fast tracking", d:"Crashing adds resources to critical work for more money; fast tracking overlaps work that was planned in sequence, at the risk of rework.", ch:3, sec:3},
      {t:"Smoothing and leveling", d:"Smoothing stays inside float so the end date holds; leveling moves dates to fit limited people and can push the end out.", ch:3, sec:4},
      {t:"QA and QC", d:"QA checks the process so the results can be trusted; QC inspects the deliverable itself for defects.", ch:4, sec:0},
      {t:"Fishbone and five whys", d:"A fishbone lays out many possible causes by category; five whys digs down through one.", ch:4, sec:2},
      {t:"Risk and issue", d:"A risk might happen; an issue is happening now, and a risk that comes true becomes one.", ch:2, sec:4},
      {t:"Qualitative and quantitative analysis", d:"Qualitative ranks risks by probability and impact; quantitative puts numbers on the top ones, such as EMV or a simulation.", ch:4, sec:3},
      {t:"Threat responses", d:"Avoid removes the cause, transfer moves the hit to someone else, mitigate shrinks it, accept lives with it, and escalate hands it to whoever owns it.", ch:4, sec:5},
      {t:"Opportunity responses", d:"Exploit makes it certain, share partners to capture it, enhance raises its odds or size, and accept or escalate work as they do for threats.", ch:4, sec:5},
      {t:"Residual and secondary risk", d:"Residual risk is what's left after a response; secondary risk is new risk the response creates.", ch:10, sec:2},
      {t:"Contingency and fallback plans", d:"The contingency plan runs when a risk's trigger fires; the fallback plan is the backup if the contingency plan doesn't work. PMBOK 8 uses the two names loosely for any trigger based response, so read how the question uses them.", ch:10, sec:2},
      {t:"Contingency and management reserve", d:"Contingency covers known risks and sits in the baseline under the PM; management reserve covers surprises, sits outside it, and needs approval.", ch:4, sec:6},
      {t:"Risk appetite and threshold", d:"Appetite is how much uncertainty someone will accept; the threshold turns that into a line you can measure.", ch:13, sec:1},
      {t:"Waiver and deviation", d:"Both are permission not to meet a requirement: a deviation before it's baselined, a waiver after. Neither makes the risk go away. This is systems engineering vocabulary the book uses, not a PMBOK term.", ch:13, sec:2}
    ]},
    {group:"People and teams", items:[
      {t:"Servant leadership", d:"Leading by clearing obstacles, growing people and shielding the team so it can do the work.", ch:3, sec:7},
      {t:"Tuckman's stages", d:"Forming, storming, norming, performing, adjourning; a team can slide back when people come or go.", ch:6, sec:1},
      {t:"Team charter", d:"The team's own agreement on how it works together, written by the team, and not the same thing as the project charter.", ch:6, sec:2},
      {t:"Conflict modes", d:"Collaborate, compromise, smooth, force and withdraw; collaborating on the real need is the usual best answer.", ch:6, sec:3},
      {t:"Psychological safety", d:"The shared sense that you can speak up, admit a mistake or disagree without being punished for it.", ch:6, sec:5},
      {t:"Emotional intelligence", d:"Reading and handling your own feelings and other people's: self awareness, self control, motivation, empathy and social skill.", ch:6, sec:5},
      {t:"Coaching and mentoring", d:"Coaching helps with one specific task or goal; mentoring supports someone's longer growth.", ch:9, sec:3},
      {t:"RACI", d:"A grid of who's Responsible, Accountable, Consulted and Informed, with exactly one A on each line.", ch:9, sec:3},
      {t:"Tacit and explicit knowledge", d:"Explicit knowledge can be written down; tacit knowledge lives in experience and moves by working side by side.", ch:12, sec:1},
      {t:"ADKAR", d:"Awareness, desire, knowledge, ability, reinforcement: find the first one a person is missing and work on that.", ch:9, sec:2},
      {t:"Just culture", d:"Asks what went wrong before who did it, and judges people on their choices rather than the outcome.", ch:9, sec:1}
    ]},
    {group:"Agile delivery", items:[
      {t:"Product owner", d:"The one person who orders the backlog and answers for the product's value.", ch:7, sec:2},
      {t:"Minimum viable product", d:"The smallest working version that tests whether the riskiest assumption holds.", ch:7, sec:1},
      {t:"Definition of done", d:"The quality bar every item has to clear to count as done; acceptance criteria are the extra conditions for one item.", ch:7, sec:5},
      {t:"Velocity", d:"Points the team finishes per sprint, used to forecast and never to compare teams or set targets.", ch:7, sec:3},
      {t:"Timebox", d:"A fixed length of time; the work changes to fit it, not the other way round.", ch:7, sec:3},
      {t:"Burndown and burnup", d:"A burndown shows work left over time; a burnup shows work done and total scope, so added scope is visible.", ch:7, sec:4},
      {t:"MoSCoW", d:"Must, should, could and won't have this time; the musts are the smallest usable set.", ch:7, sec:2},
      {t:"Technical debt", d:"The future price of a shortcut in design or code, which grows if nobody can see it.", ch:7, sec:2},
      {t:"Verification and validation", d:"Verification asks if you built it to the spec; validation asks if you built the right thing.", ch:7, sec:5}
    ]},
    {group:"Contracts, money and the outside world", items:[
      {t:"Contract types", d:"Fixed price puts cost risk on the seller, cost plus puts it on the buyer, and time and materials sits between.", ch:8, sec:1},
      {t:"Claim and constructive change", d:"A claim is a demand the other side hasn't agreed to; a constructive change is extra work the buyer directed without a formal change.", ch:8, sec:3},
      {t:"BATNA", d:"What you'll do if there's no deal, which sets the point where you walk away.", ch:8, sec:4},
      {t:"Termination for convenience or default", d:"Convenience is the buyer's choice and the seller gets paid for work done; default is the seller's failure, usually after a cure notice.", ch:8, sec:5},
      {t:"Sunk cost", d:"Money already spent, which has no place in a decision about what to do next.", ch:11, sec:5},
      {t:"PESTLE", d:"A scan of political, economic, social, technological, legal and environmental changes outside the project.", ch:11, sec:1},
      {t:"Configuration management", d:"Knowing exactly what version of everything is built and installed, and controlling changes to it.", ch:10, sec:4}
    ]},
    {group:"Value and closing", items:[
      {t:"Output and benefit", d:"An output is the thing the project makes; a benefit is the gain people get from using it.", ch:14, sec:5},
      {t:"Benefits owner", d:"The named person who tracks and reports whether the benefits actually show up, often after the project ends.", ch:14, sec:5},
      {t:"Lessons learned register", d:"Started early, added to all along, and handed to the organization's repository at closing.", ch:15, sec:4},
      {t:"Transition", d:"Handing the result to the people who'll run it, once they've shown they're ready against agreed criteria.", ch:15, sec:2},
      {t:"Closing", d:"Formal acceptance, handover, contracts closed, lessons routed, people released and records archived, even for a cancelled project.", ch:15, sec:0}
    ]}
  ],
  rules:[
    {r:"Assess before you act.", why:"On an inherited project or a fresh problem, gather facts from the data and the people first. Announcing, rebuilding or escalating on day one is the trap.", ch:1, sec:7},
    {r:"Escalate to the level that has the authority.", why:"The PM analyzes and recommends. A risk or decision past your limits goes to the level whose objective it threatens, and they have to take ownership.", ch:13, sec:1},
    {r:"Analyze the impact of a change before anything else.", why:"Don't build it before approval and don't turn it down on your own, even when the sponsor asked.", ch:2, sec:3},
    {r:"On agile teams, lead as a servant.", why:"Remove impediments, coach and protect the pace. Don't assign tasks or decide for a self organizing team.", ch:3, sec:7},
    {r:"The people doing the work estimate it.", why:"History and expert judgment are checks. A number handed down by management is the trap.", ch:3, sec:0},
    {r:"Talk to people directly and privately first.", why:"A conflict or a broken ground rule starts with a private conversation, not a public reprimand or a wait until the retrospective.", ch:6, sec:2},
    {r:"Collaborate when there's time.", why:"Work the real need with both sides. Force is for emergencies, safety first among them. Withdraw only to let tempers cool, then come back to it. Separating people isn't a fix.", ch:6, sec:3},
    {r:"Safety comes first.", why:"When people could get hurt, stop the work and make it safe before you count the schedule cost.", ch:4, sec:7},
    {r:"Report the real number.", why:"Give the accurate figure with its cause and your plan. Rounding, reframing and true but misleading wording are all wrong.", ch:5, sec:0},
    {r:"Disclose a conflict of interest and step back.", why:"Even a good price doesn't excuse steering work to a friend without disclosure.", ch:8, sec:7},
    {r:"The product owner orders the backlog.", why:"A stakeholder who wants something moved talks to the product owner. The developers size the work.", ch:7, sec:2},
    {r:"When a sprint is in trouble, change the scope.", why:"Renegotiate with the product owner. Don't cut quality and don't stretch the timebox.", ch:7, sec:3},
    {r:"AI output is an input to check.", why:"Validate its assumptions with the team and test it independently. Trusting it as is and banning it outright are both distractors.", ch:7, sec:6},
    {r:"When a trigger fires, run the planned response.", why:"Don't wait for better information or call a meeting to analyze a risk you already planned for.", ch:10, sec:2},
    {r:"A risk that comes true is an issue.", why:"Give it an owner, run the response and tell the people affected promptly. Don't wait for the root cause before saying anything.", ch:10, sec:6},
    {r:"Known risk: contingency. Surprise: management reserve.", why:"Contingency is the PM's to use. Management reserve goes through change control.", ch:4, sec:6},
    {r:"Set criteria before the data.", why:"Decide what passes, what each result triggers and who decides before the test. Criteria written after the results are the trap.", ch:14, sec:1},
    {r:"Rebaseline only for an approved change.", why:"Never rebaseline just to make the variances go away.", ch:5, sec:6},
    {r:"A new stakeholder goes in the register.", why:"Update the register and assess their needs. A baselined plan isn't a reason to ignore them.", ch:1, sec:3},
    {r:"Design communication around the distance.", why:"For teams across time zones or delays, set the norms on purpose: asynchronous updates by default, one shared record, agreed response times and fair meeting hours. Piling on more live meetings is the distractor.", ch:6, sec:4},
    {r:"Negotiate a claim first, and keep working.", why:"Then mediation or arbitration, and court last. The seller keeps performing while it's settled.", ch:8, sec:3},
    {r:"An outside change gets assessed, then goes through change control.", why:"Confirm what changed, size its impact on scope or the backlog, then process it. Ignoring it and rushing around it are both wrong.", ch:11, sec:1},
    {r:"Thank the person who admits a mistake.", why:"Get the facts into the record, protect them from retaliation and fix the system. Blame and quiet burial are distractors.", ch:9, sec:1},
    {r:"Hand over against readiness, not a date.", why:"The receiving team proves it's ready in a realistic rehearsal, and open risks get named owners.", ch:12, sec:5},
    {r:"Close formally, even when the project fails.", why:"Acceptance, contracts, lessons, release and archive, plus a written reason if it ended early.", ch:15, sec:8},
    {r:"In ethics questions, take the harder honest path.", why:"The right answer is usually slower and more uncomfortable, and it goes through the proper authority.", ch:13, sec:8}
  ],
  contrasts:[
    {topic:"Scope", pred:"Defined early in a scope statement and WBS, then controlled against the baseline.", agile:"Emerges in an ordered backlog the product owner refines every sprint.", ch:2, sec:2},
    {topic:"Planning", pred:"Detailed plan up front, with rolling wave detail for later work.", agile:"Plan each sprint; the release forecast is a range from velocity.", ch:7, sec:3},
    {topic:"Estimating", pred:"Hours and dollars, bottom up, analogous or parametric.", agile:"Relative story points, sized by the developers.", ch:3, sec:0},
    {topic:"Change", pred:"A change request, impact analysis and the change control board.", agile:"The product owner reorders the backlog; the sprint goal stays put.", ch:2, sec:3},
    {topic:"Tracking progress", pred:"Earned value against the baseline: CV, SV, CPI, SPI.", agile:"Velocity, burndown and burnup charts, and accepted work.", ch:7, sec:4},
    {topic:"Quality", pred:"A quality management plan, process audits, and inspection of deliverables at planned points.", agile:"A definition of done every item meets, every sprint.", ch:7, sec:5},
    {topic:"Delivery", pred:"Mostly one delivery near the end.", agile:"Small usable increments, highest value first, with the riskiest assumptions tested early and feedback every time.", ch:7, sec:1},
    {topic:"Leadership", pred:"The PM coordinates the plan and controls to the baseline.", agile:"A servant leader removes impediments and the team organizes itself.", ch:3, sec:7},
    {topic:"Cost", pred:"A cost baseline with contingency, plus management reserve.", agile:"A steady team cost per sprint, with scope as the part that flexes.", mock:true},
    {topic:"Learning", pred:"A lessons learned register, updated all along and reviewed at phase ends and closing.", agile:"A retrospective every sprint with owned improvements.", ch:14, sec:7},
    {topic:"Choosing", pred:"Stable, well understood work with fixed requirements.", agile:"Uncertain work that needs fast feedback. Mixed work is hybrid, joined at agreed integration points.", ch:1, sec:5}
  ]
};
