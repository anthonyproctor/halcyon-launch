# Hearth: INCOSE ASEP course bible

Read this whole file before writing anything. Also read `../../full/BIBLE.md` (the PMP course bible) for the shared voice, answer-quality rules, prop format, speaker tags, and file format, and `../../full/ch01.js` for the object shape. This course is a sibling course in the same app and the same universe. Its continuity is its own; the PMP story is backstory, not required reading.

## Goal
A 12 to 15 hour story-driven prep course for the INCOSE Associate Systems Engineering Professional (ASEP) knowledge exam. Each chapter takes 60 to 75 minutes: a story you want to keep listening to, a lesson that teaches, decisions, drills, an exercise, and an exam-style quiz. It complements the Olson Udemy course on the handbook that Anthony is already taking: the Udemy course covers the handbook front to back; this course makes the processes stick by living them on a real program.

## The exam (verify before writing; cite these)
- Multiple choice, closed book, based on the **INCOSE Systems Engineering Handbook**. INCOSE states the current exam is based on the content that overlaps the **4th and 5th editions** of the handbook. Teach to the 5th edition and avoid anything that exists only in one edition.
- **100 scored questions**, plus up to 50 unscored beta questions mixed in. Timing is **one minute per question**. The common online form is **120 questions in 120 minutes**; paper forms are commonly 100 questions in 100 minutes.
- INCOSE does not publish a fixed passing score here; do not state one. Tell the learner to aim high on practice and know the processes cold.
- Sources: https://www.incose.org/certification/becoming-certified/taking-the-exam , https://www.incose.org/certblog/certification-blog/2021/10/15/how-many-questions-are-on-the-incose-knowledge-exam , https://www.sesa.org.au/certifications/knowledge-exam/
- The handbook's process model follows **ISO/IEC/IEEE 15288** (2023). Its main parts: SE introduction and principles; life cycle concepts, models, and the 15288 process groups; life cycle analyses and methods (quality characteristics such as reliability, availability, maintainability, safety, security, plus MBSE and other methods); tailoring and application considerations; SE in practice (competencies, teams, cultures).
- Exam questions skew heavily to process knowledge: each process's purpose, key inputs and outputs, activities, and how processes connect. Teach purpose, inputs, outputs, and "who uses this next" for every process.

## Coverage codes (every chapter, decision, quiz item, and mock question maps to one)
**Technical processes (T)**: T1 Business or mission analysis · T2 Stakeholder needs and requirements definition · T3 System requirements definition · T4 System architecture definition · T5 Design definition · T6 System analysis · T7 Implementation · T8 Integration · T9 Verification · T10 Transition · T11 Validation · T12 Operation · T13 Maintenance · T14 Disposal
**Technical management processes (M)**: M1 Project planning · M2 Project assessment and control · M3 Decision management · M4 Risk management · M5 Configuration management · M6 Information management · M7 Measurement · M8 Quality assurance
**Agreement processes (A)**: A1 Acquisition · A2 Supply
**Organizational project-enabling processes (O)**: O1 Life cycle model management · O2 Infrastructure management · O3 Portfolio management · O4 Human resource management · O5 Quality management · O6 Knowledge management
**Cross-cutting (X)**: X1 SE principles, systems thinking, and life cycle concepts (stages, models, reviews) · X2 Quality characteristics and specialty engineering (reliability, availability, maintainability, safety, security, resilience, human systems integration) · X3 MBSE and modeling methods · X4 Tailoring and application across contexts (product lines, services, SoS, agile) · X5 SE in practice (competencies, teams, ethics, culture)

Target weight across course items: T about 45 percent, M about 25 percent, A and O about 12 percent together, X about 18 percent. This is a design assumption, not a published blueprint; say so nowhere in the course, just follow it.

## Answer quality rules (identical to the PMP course)
- Four options per decision and per quiz question, all within about 10 percent of each other in length. The correct answer is the longest in at most 4 of 12 decisions and the shortest in 2 to 4. Distractors are things a real engineer might do.
- Right answers follow the handbook's intent: define the problem before the solution, trace everything, verify against requirements and validate against stakeholder needs, manage risk and configuration deliberately, make decisions with stated criteria, and tailor on purpose rather than skip.
- Math must compute exactly with worked steps.
- No em or en dashes. No AI tells. Contractions. Plain words. Dialogue in `<span class="said" data-who="Name">"..."</span>`. Backtick template strings in JS.

## The program
**Front Range Orbital ("FRO")**, about 400 people in a former lighting factory in Centennial, Colorado, a few miles from Halcyon AI. FRO builds pressurized structures. Its first big contract: **HEARTH**, a commercial space station habitat module. HEARTH is a rigid aluminum pressure vessel about 4.4 m in diameter and 8 m long, roughly 90 cubic meters of pressurized volume, carrying four crew quarters, a galley, a hygiene station, an air revitalization rack, power and data distribution, a thermal control loop that rejects heat to the station's radiators, micrometeoroid and orbital debris (MMOD) shielding, and a common berthing mechanism with a hatch. It flies in about 400 km low Earth orbit at 51.6 degrees, launches in 30 months on a heavy lift rocket, berths to the host station with the station's robotic arm, and has a 15 year design life.

The customer is **Halo Orbital**, a fictional commercial station operator assembling **Halo Station**, a private station meant to replace the government lab when it retires. Halo buys HEARTH under a firm fixed price development contract with a cost plus fixed fee sustaining engineering option. Halo's crews include government astronauts, so the module must meet a fictional **crew certification standard** issued by the **Office of Crewed Spaceflight Certification (OCSC)**, a fictional federal office that audits human rating. The contract says "at least 90 cubic meters of habitable volume for a crew of four." Halo's real need, which the course turns on, is that four people can live, work, sleep, and **survive a fire or a depressurization** in that volume for 180 day missions.

Use real, credible human spaceflight details: subsystems (structure and mechanisms, environmental control and life support (ECLSS) with CO2 removal, trace contaminant control, and humidity control, active and passive thermal control, power distribution from host station power, avionics and data, fire detection and suppression, crew systems), hazards (fire, depressurization, toxic release, collision, crew injury), human rating principles (two fault tolerance for catastrophic hazards, crew override, safe haven), orbital replacement units for on-orbit maintenance, reviews (MCR, SRR, SDR, PDR, CDR, TRR, the safety review phases 0 to III, PSR, FRR), and environments and pressure testing (proof pressure, leak rate, vibration and acoustic, thermal vacuum, EMI/EMC, human-in-the-loop crew evaluations). The government lab can be mentioned generically as "the old station"; keep every organization and person fictional.

## Cast and arcs
- **Nadia Brooks** (the lead, "you"). 31. Came from five years as a test engineer at an aircraft avionics shop in Colorado Springs, just moved into her first systems engineer role. Sharp at test, uneasy with ambiguity and with telling senior people no. Arc: from "make the test pass" to "make sure we're building the right thing," and finally to owning the system view in the room. Her father is a retired lineman for Xcel; his line "you don't climb a pole you haven't grounded" recurs, and it lands harder on a program where the people at risk will live inside the thing.
- **Ruth Calder**. Retired NASA flight director, now on FRO's advisory board as a favor to an old colleague. Same Ruth: dry, kind, launch analogies, honest about numbers. On a crewed program her lessons have more weight: integration, verification discipline, and the fact that a hazard report is a promise to a person. She references her 1991 loss only once, late, and briefly.
- **Wes Harland**. Chief engineer, 58, brilliant, built pressure vessels and cargo modules for decades, distrusts paperwork and sometimes skips it. Arc: learns that his intuition and a traced requirement are not enemies. His conflict with Nadia over requirements discipline drives Part One.
- **Amara Osei**. Program manager, 44, ex-Air Force acquisition officer. Cost and schedule are her world. Ally to Nadia, but pushes to cut test time. Arc: from "test is schedule risk" to "test is risk reduction."
- **Luis Ferreira**. Integration and test lead, 39, calm, owns the high bay and the pressure test cell. Nadia's natural friend from her test background. Arc: has to tell Nadia a hard truth about a verification gap she caused.
- **Helen Cho-Ramirez**. Halo Orbital's director of crew operations, a former flight surgeon who spent years supporting long-duration crews. The voice of the customer and of the crew. Arc: her real need (a crew of four that can live there and get through an emergency) differs from what the contract says (a volume number), and the course turns on that gap.
- **Pavel Ruzicka**. Account lead at **Brightline Life Systems**, the supplier building the air revitalization rack. Proud, overcommitted. Arc: a late delivery and an interface mismatch (the rack's power, data, and coolant connections don't match HEARTH's), handled through agreement processes, not blame.
- **Jun Takeda**. Junior systems engineer, 24, MBSE native, keeps the SysML model. Arc: Nadia's protege; by the end Jun leads a review.
- **Commander Tess Okonjo**. A government astronaut assigned to Halo's first crew, who joins the human-in-the-loop evaluations. Few lines, high weight: she's the person the requirements are for.
- **Sam Okafor** cameos twice (ch3 and ch11) as a fellow Ruth mentee from Halcyon AI across town, trading notes over coffee. One line from him: "Same job, different hardware."
- New characters appear through each chapter's `cast` array.

## Chapter plan (num, title, focus, codes, ending)
**Part One: Concept**
1. **Kickoff** (week 1). Nadia's first day; the signed contract; Wes's "it's a can with air in it, we know what to build"; Ruth's first coffee. Mission analysis and the problem space before the solution, life cycle stages and reviews, the SE "V". Codes: T1, X1, M1, O1. Ends: Helen says something about fire and safe haven that isn't in the contract.
2. **What They Actually Need** (weeks 2 to 4). Stakeholder identification (Halo, the crew, OCSC, the host station, the launch provider, ground controllers), needs elicitation, concept of operations, day-in-the-life and emergency scenarios, MOEs, turning needs into stakeholder requirements, validation intent. Drill: classify needs vs requirements; MOE vs MOP vs TPM. Codes: T2, T11, X1. Ends: the depressurization scenario shows the crew can't reach the hatch from the far crew quarters in the time the scenario allows.
3. **Good Requirements** (weeks 4 to 6). System requirements definition, requirement quality characteristics (necessary, unambiguous, verifiable, singular, feasible, traceable), verification methods (inspection, analysis, demonstration, test), traceability, requirements baseline. Drill: rewrite bad requirements; assign verification methods. Sam cameo. Codes: T3, T9, M5. Ends: the SRR passes but Wes added three "obvious" requirements outside the baseline.
4. **Shape of the System** (weeks 6 to 9). Architecture definition, functional and physical architectures, interfaces to the host station and N-squared diagrams, viewpoints, MBSE with Jun's model. Exercise: allocate functions to subsystems. Codes: T4, X3, T6. Ends: the air revitalization rack interface from Brightline doesn't match HEARTH.
5. **The Trade** (weeks 9 to 11). Decision management and trade studies: criteria, weights, sensitivity; system analysis for a rigid module with internal layout changes vs moving the crew quarters and adding a second egress path. Drill: weighted-sum trade with a sensitivity check (exact numbers). Codes: M3, T6, T5. Ends: the trade picks the second egress path; Amara hates the schedule hit.
**Part Two: Development**
6. **Supplier** (weeks 11 to 14). Acquisition and supply processes, the agreement, statement of work, ICDs, acceptance criteria, managing Brightline's late delivery and the interface fix. Codes: A1, A2, M2, M5. Ends: a revised ICD and a delivery date everyone believes.
7. **Risk** (weeks 14 to 17). Risk management: identification, likelihood and consequence, risk matrix, handling (avoid, mitigate, transfer, accept), watch items, risk burn-down; opportunities. Drill: risk exposure and a burn-down. Codes: M4, M7, X2. Ends: a lot of hatch seal material fails a supplier's aging test.
8. **Design Review** (weeks 17 to 21). Design definition, PDR and CDR entry and exit criteria, technical performance measures with margins (mass, power, heat rejection, leak rate), configuration control boards. Drill: margin and TPM tracking (exact numbers). Codes: T5, M7, M5, M2. Ends: CDR passes with a mass margin that's thinner than it looks.
9. **Ilities** (weeks 21 to 24). Reliability (MTBF, redundancy, single-point failures), availability, maintainability on orbit (orbital replacement units, crew time), safety and hazard analysis with two fault tolerance and the safety review phases, cybersecurity for the command path, human systems integration for crew and controllers. Drill: series and parallel reliability (exact numbers). Codes: X2, T6, M8. Ends: a single-point failure in the cabin pressure relief path.
**Part Three: Integration and Beyond**
10. **Integration** (weeks 24 to 28). Implementation and integration strategy, build-up sequence, interface verification, the high bay, first power-on, anomaly handling, configuration and information management. Codes: T7, T8, M6, M5. Ends: a harness swapped during integration was never captured in configuration.
11. **Test Like You Fly** (weeks 28 to 33). Verification vs validation, the verification matrix, proof pressure, leak, acoustic, thermal vacuum, EMI, and the human-in-the-loop evaluation with Commander Okonjo (validation in the crew's hands), requirements closure, the gap Luis finds. Sam cameo. Codes: T9, T11, M8, X1. Ends: Nadia admits her own verification gap at the TRR.
12. **Ship It** (weeks 33 to 38). Transition to the launch provider and to Halo, pre-ship review, the final safety review, readiness reviews, operations planning, the sustaining engineering option, maintenance and logistics for 15 years, and end-of-life disposal with the station. Codes: T10, T12, T13, T14. Ends: HEARTH ships.
**Weaving the organizational and cross-cutting codes** (keep twelve chapters; weave these through)
- O1 to O6 throughout: FRO's life cycle model (ch1, ch12), infrastructure and the pressure test cell (ch10), portfolio decisions when FRO bids a second module for another station (ch7, ch12), hiring and growing Jun (ch4, ch11), the quality management system and audits (ch8, ch11), lessons learned and knowledge management (ch10, ch12). Tailoring (X4) appears in ch1, ch6, and ch12 (agile flight software, tailoring heavy government processes to a commercial program without tailoring away crew safety). X5 SE in practice and ethics in ch11 and ch12.
- **Coda inside ch12**: launch night, the robotic arm berthing HEARTH to Halo Station, the hatch opening, the first crew sleeping in the module, Helen's message, Ruth's last line.

## Cross-chapter flags
Set via an option's `flag:"name"` on one clearly wrong option; read with `(s.flags.X||G.X)` in the setting chapter and `G.X` later. Use only these:
| flag | set in | meaning | read in |
|---|---|---|---|
| `skippedconops` | ch2 | wrote requirements before an operations concept | ch3, ch11 |
| `acceptedwesreqs` | ch3 | let Wes's requirements in without change control | ch8, ch10 |
| `nointerfacecontrol` | ch4 | treated the air rack interface informally | ch6, ch10 |
| `unweightedtrade` | ch5 | chose by gut instead of criteria and weights | ch8, ch12 |
| `blamedsupplier` | ch6 | went adversarial with Brightline | ch10, ch12 |
| `hidrisk` | ch7 | kept the hatch seal risk off the board's register | ch9, ch11 |
| `paddedmargin` | ch8 | reported margin that included hidden reserve | ch9, ch12 |
| `cuttest` | ch8 | agreed to cut a test to protect the schedule | ch11 |
| `noconfigcapture` | ch10 | fixed the harness without capturing it in CM | ch11 |
| `rushedtrr` | ch11 | went into test with open items unresolved | ch12 |

## Story props (same format as the PMP bible)
1 to 3 per chapter: Helen's email about fire and safe haven (ch1), the concept of operations excerpt (ch2), a bad-then-good requirement as a doc (ch3), an N-squared table as a doc (ch4), the egress trade matrix as a bars chart (ch5), the ICD change notice (ch6), the risk register entry (ch7), mass and leak rate margin bars at CDR (ch8), a reliability block summary (ch9), the integration anomaly report (ch10), the verification matrix excerpt (ch11), the berthing timeline and Helen's message (ch12).

## Mock exam plan
- 120 single-answer questions (the app's mock engine supports single answer only), timed at 120 minutes, scenario-heavy but also direct process knowledge ("Which process produces the..."; "What is the primary purpose of..."), in neutral fictional settings, NOT the HEARTH story.
- Files: `courses/asep/mock/technical.js` (54 questions), `management.js` (30), `agreement_org.js` (14), `crosscutting.js` (22). Same object format as the PMP mock (`part`, `questions` with `q, opts, a, why, task, domain`), with `domain` set to one of `Technical`, `Technical management`, `Agreement and organizational`, `Cross-cutting`, and `task` set to the codes above.
- Validate with the shared checker once it supports these codes (the course engine maps code prefixes T, M, A, O, X to those four domains).

## File format
`courses/asep/full/chNN.js`, same object shape as the PMP Full Course (`window.HALCYON_FULL.push({...})`), with `tasks` and every scene and quiz `task` using the codes above and `domain` set to one of the four domains above. 12 scenes per chapter (ids `f{N}s{i}`), lesson 700 to 1100 words, drills where the plan says, an exercise in about half the chapters, 15 quiz questions, `closing`, `episode:{src:\`audio/full-chNN.mp3\`}`, and `next`. Speaker tags must use cast first names (Nadia, Ruth, Wes, Amara, Luis, Helen, Pavel, Jun, Tess, Sam, plus any new cast) or `man` / `woman`.
