# The Halcyon Launch: Full Course bible

Read this whole file before writing anything. Also read `../chapters/ARC.md` (refresher bible) and `../chapters/ch1.js` (voice and object shape). The Full Course retells and greatly deepens the same story. It is its own continuity: do NOT assume the refresher happened.

## Goal
A 15 to 20 hour story-driven PMP course. Each chapter takes about 60 to 75 minutes: a story you can't put down, a lesson that actually teaches, decisions, math drills, an exercise, and an exam-style quiz. A reader who finishes should be ready for the PMP exam on the July 9, 2026 outline.

## The exam (July 9, 2026 Exam Content Outline). Every chapter maps to these 26 tasks.
**People (33%)**: P1 Develop a common vision · P2 Manage conflicts · P3 Lead the project team · P4 Engage stakeholders · P5 Align stakeholder expectations · P6 Manage stakeholder expectations · P7 Help ensure knowledge transfer · P8 Plan and manage communication
**Process (41%)**: R1 Develop an integrated project management plan and plan delivery · R2 Develop and manage project scope · R3 Help ensure value-based delivery · R4 Plan and manage resources · R5 Plan and manage procurement · R6 Plan and manage finance · R7 Plan and optimize quality of products/deliverables · R8 Plan and manage schedule · R9 Evaluate project status · R10 Manage project closure
**Business Environment (26%)**: B1 Define and establish project governance · B2 Plan and manage project compliance · B3 Manage and control changes · B4 Remove impediments and manage issues · B5 Plan and manage risk · B6 Continuous improvement · B7 Support organizational change · B8 Evaluate external business environment changes
Note: risk, change control, and impediments are Business Environment on this outline. Tag accordingly. About 60% of the exam reflects agile and hybrid approaches; reflect that. Exam: 180 questions (170 scored), 240 minutes, two 10-minute breaks. PMBOK Guide 8th edition and PMI Code of Ethics (responsibility, respect, fairness, honesty) are fair game.

## Answer quality rules (non negotiable)
- PMI mindset: assess before acting, talk to the person first, servant leadership, follow and tailor the process, transparency, escalate only what you can't resolve, never hide problems, ethics first.
- Four options per decision and per quiz question. All four answer texts within about 10 percent of each other in length. The correct answer is the longest in at most 3 of every 10 items and the shortest in at least 3. Distractors are plausible things real PMs do.
- Math must compute exactly. Show the formula and the worked steps in the solution.
- No em or en dashes anywhere (use commas, periods, "to"). No AI tells ("delve", "tapestry", "it's worth noting", "not X but Y", "in today's fast paced"). Contractions. Plain words. Dialogue in <span class="said">"..."</span>. Use backtick template strings in JS to avoid quote escaping problems.

## Cast and arcs (the heart of it; give every chapter at least one character moment)
- **Sam Okafor** (you). 41. Former Air Force maintenance NCO, ran F-16 flight line crews, then 12 years in infrastructure. Methodical, calm, distrusts slides. Reluctant leader who thinks leading means doing it yourself; learns leading means making others able. Married to **Dana** (a high school chemistry teacher, dry humor, notices when he's not sleeping). His old flight chief, **MSgt (ret.) Ray Mendez**, appears in memories and one phone call; Ray's line "the jet doesn't care how you feel" recurs. Arc: from fixer to leader; in Part Two, from leader to builder of leaders.
- **Ruth Calder**. 67. Retired NASA flight director, Halcyon board member, mentor. Plain spoken, launch analogies, funny. Carries a private failure: early in her career she stayed quiet about a sensor anomaly on an uncrewed mission to avoid looking alarmist; the vehicle was lost. Nobody died, but she never forgot it. She reveals it in pieces (hinted ch4, partial ch9, full story ch14). It is why she pushes Sam on honesty about numbers.
- **Elena Vasquez**. CEO and founder. Brilliant, impatient, board pressure, sometimes treats dates as wishes. Arc: learns to trust honest forecasts; in Part Two promotes Sam and then tests him.
- **Grant Mercer**. Chief Revenue Officer. Overpromiser, charming, hates being contradicted in public. Arc: adversary to ally; in ch14 he's the one who brings an ethics problem to Sam.
- **Lena Cho**. CTO. Conflict-avoidant, kind, technically excellent. Arc: learns to have hard conversations; delivers one to Elena in ch12.
- **Theo Lindqvist**. ML platform lead, the bottleneck ("Brent"). Burns out, resigns in ch6, knowledge transfer arc; returns as a contractor in ch13 on his own terms.
- **Priya Shah**. Junior engineer who shadows Theo, becomes platform lead, then Sam's protege. Quiet, sharp, underestimates herself. By ch15 she runs a project.
- **Tomasz Nowak**. Lead of the Kraków contractor team (eight hours ahead of Denver). Direct, proud, wary of being treated as cheap labor.
- **Devin Ruiz**. Engineer, coasting since his last manager left; turns around with coaching (ch6).
- **Dr. Raymond Ochoa**. CIO, Cascade Valley Health (11 hospitals, Colorado and Wyoming). Skeptical, fair, wants the truth early.
- **Maria Santos**. Nurse informatics director at Cascade, the product owner from ch7. Ex-ICU nurse, fierce about patient safety.
- **Denise Harmon**. Nurse manager at Cascade's Cheyenne hospital. Leads the resistance to AI documentation in ch9, becomes the best champion.
- **Joan Pruitt**. Halcyon procurement lead. Contract precise, secretly loves a good negotiation.
- **Hal Brennan**. IronPeak account manager (GPU colocation).
- **LabelForge**: data labeling vendor, fixed price, late.
- Part Two adds: **Victor Adeyemi** (new board member, PE background, wants cuts, ch11 to ch15) and **Northgate Health** (a second hospital customer, ch12 to ch15).

## Fixed facts
- Halcyon AI: about 600 people, Series C, Denver (LoDo office). Product: AI agents that draft clinical documentation for clinicians to review and sign.
- Cascade contract: go-live 14 weeks from day one, signed by sales before engineering estimated. Phased release decided in ch1 or ch2 (core agents at Fort Collins, Greeley, and Cheyenne on the contract date, remaining 8 hospitals over 4 weeks). Discharge instructions became a phase two change request.
- Vendors: IronPeak (GPU colocation, fixed install windows), LabelForge (clinical note labeling, fixed price, late, nurse annotators in three batches).
- Weekly 15-minute call with Ochoa and a one-page Friday status.
- Never cite real laws or real companies' internal events. Regulatory items are fictional or generic (HIPAA is fine to name).

## Chapter plan (num, title, weeks, required content, tasks to cover, ending)
**Part One: The Cascade Launch**
1. **The Promotion** (week 1). Sam drafted after the PM quits; meets Ruth; discovery; missing charter; the contract date; first honest forecast. Tasks: P1, B1, R1, P4. Ends: Elena chooses a phased release; Ruth at the coffee shop in Golden.
2. **The Plan** (weeks 1 to 2). Building the integrated plan: scope statement, WBS for the infrastructure and a product backlog for the software, estimating (analogous, parametric, three point PERT), critical path and float, schedule baseline, tailoring the hybrid approach. Drills: PERT estimate and standard deviation; critical path with float on a small network (give the activity table). Tasks: R1, R2, R8, B3. Ends: baseline signed; IronPeak calls about the cluster.
3. **The Team** (weeks 2 to 3). Resources and the team: RACI, resource calendars, onboarding Kraków (virtual team, time zones, working agreements), team charter, Tuckman stages, motivation theories briefly, communication planning. Drill: communication channels n(n-1)/2 before and after adding Kraków. Tasks: R4, P3, P8, P1. Ends: first sprint review is quiet; Sam sees the trust problem.
4. **Burn-In** (weeks 3 to 5). Half the GPUs fail burn-in. Quality (cost of quality, QA vs QC, root cause, control charts briefly), risk (register, qualitative vs quantitative, EMV, responses including escalate), IronPeak warranty. Drill: EMV decision. Exercise: classify risk responses. Ruth's first hint about her past. Tasks: R7, B5, R5, B4. Ends: cluster fixed, float burned; Theo hasn't slept.
5. **The Numbers** (weeks 5 to 6). Board meeting. Finance: cost baseline, contingency vs management reserve, earned value in full (PV, EV, AC, SV, CV, SPI, CPI, EAC with the right formula for the situation, ETC, VAC, TCPI), forecasting, status reporting. Drills: full EVM set with numbers that compute exactly; TCPI. Tasks: R6, R9, P6. Ends: Theo resigns.
6. **Storming** (weeks 6 to 8). Conflict and knowledge transfer: Lena and Grant clash, conflict modes (collaborate best), Theo's exit and knowledge transfer (tacit vs explicit), Devin coaching, emotional intelligence when Sam loses his temper, Dana at home. Exercise: match conflict situations to resolution modes. Tasks: P2, P7, P3, B4. Ends: team norms; Priya steps up; demo scheduled.
7. **The Demo** (weeks 8 to 10). Value-based delivery: Maria as product owner, MVP, backlog prioritization (MoSCoW, value), definition of done and acceptance criteria, an agent invents a medication in the first demo, transparency with the customer, technical debt, retrospectives, velocity and burndown. Drill: velocity forecast for remaining backlog. Tasks: R3, R2, P5, P6, R7. Ends: second demo succeeds.
8. **The Contract** (weeks 9 to 11). Procurement depth: contract types (FFP, FPIF, CPFF, CPIF, T&M) with an FPIF point of total assumption or incentive fee drill, make-or-buy, LabelForge claims and negotiation, change control board for a customer scope change, Joan's negotiation. Drill: incentive fee calculation. Tasks: R5, B3, B2. Ends: go/no-go criteria agreed for week 14.
9. **Go-Live** (weeks 11 to 14). Compliance and org change: privacy data in logs (contain, escalate, follow the incident process), Denise and the nurses (change management, ADKAR or similar, champions, training), go/no-go, cutover and rollback, hypercare, sponsor wants to skip testing. Ruth tells part of her story. Tasks: B2, B7, R7, P6, B4. Ends: three hospitals live on the date.
10. **Closeout** (weeks 15 to 18). Closure: remaining hospitals, final acceptance, transition to operations, contract closeout and claims, lessons learned without blame, releasing resources, recognition, benefits realization ownership, continuous improvement (kaizen, retrospectives at org level). Tasks: R10, B6, P7, P4. Ends: Elena offers Sam Director of Delivery.
**Part Two: The PMO**
11. **The Offer** (month 6). Sam builds a delivery office: PMO types (supportive, controlling, directive), governance, project selection (NPV, IRR concept, payback, benefit cost ratio), business case and charter for discharge instructions phase two, Victor Adeyemi joins the board. Drills: NPV and payback. Tasks: B1, P1, R6, B8. Ends: Northgate Health signs, with a deadline.
12. **The Shock** (month 7). External environment: a competitor launches cheaper; a fictional state guidance changes clinical AI rules; Victor pushes for cuts; Lena finally confronts Elena. PESTLE scanning, re-planning, risk escalation, compliance updates. Tasks: B8, B5, B2, P2. Ends: Halcyon cuts a product line; two teams merge.
13. **Two Projects** (months 7 to 9). Multi-project resource conflict, Theo returns as a contractor, stakeholder alignment across two customers, scaling communications, scaled agile basics, dependencies across teams. Drill: resource leveling on a small schedule. Tasks: R4, P5, P8, R8, P3. Ends: Grant comes to Sam with something wrong.
14. **The Hard Conversation** (month 9). Ethics and culture: Grant learns sales promised Northgate a capability that doesn't exist and a report was shaded; PMI Code of Ethics; honesty with the board; Ruth's full story; organizational change at Halcyon. Tasks: B7, P6, B4, B1, P4. Ends: Sam tells the board the truth; Victor respects it.
15. **Liftoff** (month 10 and coda). Northgate go-live and phase two delivered; Priya runs her first project with Sam as coach; knowledge transfer to the next generation; final retrospective; Ruth retires from the board; last scene mirrors chapter 1 (an email at 6:12 AM, this time good news). Tasks: P7, P3, R10, B6, P1. Ends: the course.

## Cross-chapter flags (your choices follow you)
Set via an option's `flag:"name"` (only on the option that should set it). Read in scene `text:(s,all,G)=>` where `G` holds every flag set in any earlier chapter. Use only these names, and only in the chapters listed:
- `allhands` (ch1, read ch3): Sam announced himself instead of listening.
- `nocharter` (ch1, read ch5): skipped the charter.
- `blamedtheo` (ch4, read ch6, ch13): Sam blamed Theo publicly for the burn-in miss.
- `hidnumbers` (ch5, read ch9, ch14): Sam softened bad EVM numbers to the board.
- `publicfight` (ch6, read ch12): Sam let Lena and Grant's fight play out in front of the team.
- `hiddefect` (ch7, read ch9): Sam didn't tell Cascade about the invented medication right away.
- `skippedtest` (ch9, read ch10): Sam agreed to skip final testing.
- `cutcorners` (ch12, read ch14): Sam agreed to Victor's cuts without analysis.
A flag only adds a sentence or a consequence line; the canonical story continues either way.

## File format (each chapter is one JS file)
`full/chNN.js` (two digits). Push exactly one object:
```js
(window.HALCYON_FULL=window.HALCYON_FULL||[]).push({
  num: 4, part: "Part One: The Cascade Launch", title: "Burn-In", weeks: "Weeks 3 to 5",
  tasks: ["R7","B5","R5","B4"],                       // outline task codes covered
  cast: [["Hal Brennan","IronPeak account manager."]], // new characters only
  opening: [`para`, `para`, ...],                      // 5 to 9 paragraphs, character-rich
  lesson: {                                            // Ruth's Whiteboard, 700 to 1100 words total
    title: `Quality and risk`,
    sections: [ {h:`Heading`, body:[`para`,`para`], terms:[[`Term`,`definition`]], exam:`How the exam asks it, 1 to 3 sentences`} ],
    video: [`youtubeId`,`title`,`channel`,`m:ss`]      // one vetted video for the lesson
  },
  scenes: [                                            // 12 decisions
    { id:`f4s1`, domain:`Business Environment`, task:`B5`, title:`Short title`,
      text:(s,all,G)=>[`para`,`para`],                 // 2 to 4 paragraphs, story first
      opts:[ {t:`choice`, s:3, best:true, d:{trust:4,conf:2,health:5}, after:`what happened`, why:`Ruth explains`, flag:`optional`}, ... 4 total ] }
  ],
  drills: [                                            // 0 to 3 math drills placed after a scene
    { after:`f4s6`, title:`Expected monetary value`, setup:[`story framing`, `data`],
      table:[[`Header`,`Header`],[`row`,`row`]],       // optional
      fields:[ {label:`EMV of option A ($)`, answer:-12000, tol:1} ],
      solution:[`Formula`, `Worked steps`, `What it means`] }
  ],
  exercise: { after:`f4s9`, title:`Pick the risk response`, intro:`one line`,
    items:[ {prompt:`situation`, choices:[`Avoid`,`Transfer`,`Mitigate`,`Accept`,`Escalate`], answer:2, why:`explanation`} ] }, // 5 to 8 items, optional for chapters without one
  quiz: [ {q:`exam-style question`, opts:[`a`,`b`,`c`,`d`], a:1, why:`explanation`, task:`B5`, domain:`Business Environment`} ], // 15 questions
  closing:(s,all,G)=>[`para`, ...],                    // ends with the hook into the next chapter
  episode:{src:`audio/full-ch04.mp3`, len:`about 35 minutes`},
  next:`The Numbers`                                   // omit on ch15
});
```
Scoring: s is 3 best, 1 partial, 0 miss. Exactly one best per scene, at least one partial. Quiz `a` is the 0-based index of the right answer; spread correct answers across positions (no position more than 6 of 15).

## Validation
Run `node tools/check_full.mjs full/chNN.js` from the repo root; it must exit 0. Run the AI detector on a dump of your prose and keep every chunk under 30 percent.

## Consequences v2: more choices that bite later (added 2026-10-09)
Each new flag is SET on one clearly wrong option (s:0 or s:1) in its chapter and READ in later chapters, where it changes a sentence, a character's reaction, or an outcome line (never the canonical plot). Read it with `(s.flags.X||G.X)` in the setting chapter and `G.X` in later ones.
| flag | set in | meaning | read in |
|---|---|---|---|
| `paddedestimates` | ch2 | padded every estimate instead of three-point estimating | ch5, ch8 |
| `noteamcharter` | ch3 | skipped the team charter / working agreements | ch6 |
| `hidfromochoa` | ch4 | didn't tell Ochoa about the cluster failure promptly | ch7, ch9 |
| `sidelineddevin` | ch6 | took Devin off the work instead of coaching him | ch13, ch15 |
| `overrodepo` | ch7 | overrode Maria (product owner) on backlog priority | ch9, ch12 |
| `squeezedlabelforge` | ch8 | played hardball with LabelForge instead of negotiating on interests | ch10 |
| `forcedrollout` | ch9 | pushed the rollout over the nurses' objections without change management | ch10, ch15 |
| `nolessons` | ch10 | skipped lessons learned | ch13 |
| `nobusinesscase` | ch11 | approved phase two without a business case | ch12, ch14 |
| `overloadedpriya` | ch13 | piled both projects onto Priya | ch15 |

## Story props (added 2026-10-09)
Where the story has an artifact, render it as a prop instead of describing it: a paragraph string that starts with `<prop ` is rendered as-is. Formats:
- Email: `<prop type="email" from="Elena Vasquez" to="Sam Okafor" time="6:12 AM" subject="Cascade">body text, may include <br></prop>`
- Chat (Slack): `<prop type="chat" from="Theo" time="11:48 PM">message text</prop>`
- Text message: `<prop type="text" from="Ray Mendez" time="9:02 PM">message</prop>`
- Document or memo: `<prop type="doc" title="Project charter">short body, may include <br></prop>`
- Chart: `<prop type="chart" kind="evm" title="Cascade earned value, week 6" pv="..." ev="..." ac="..."></prop>` (numbers as comma lists for weeks) or `kind="bars"` with `labels` and `values`.
Use 1 to 3 props per chapter where the story naturally has an artifact. Keep them short. The narrator reads the prop text, so it must read naturally aloud. No dashes.
