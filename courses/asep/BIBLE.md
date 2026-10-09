# First Light: INCOSE ASEP course bible

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
**Halcyon's neighbor in the Denver tech corridor: Front Range Orbital ("FRO")**, about 400 people in a former lighting factory in Centennial. They're building **KESTREL-1**, a 150 kg Earth-observation smallsat: a 1.2 m ground sample distance optical imager plus a short-wave infrared band for wildfire detection, in a 525 km sun-synchronous orbit with a 10:30 descending node, S-band telemetry and command, X-band downlink, a 5-year design life, and a launch slot on a rideshare in 22 months. The customer is the **National Wildfire Monitoring Office (NWMO)**, a fictional federal civil agency that needs fire detection within 30 minutes of a satellite pass. The contract is a firm fixed price development plus a cost plus fixed fee operations option.

Use real, credible spacecraft details: subsystems (ADCS with reaction wheels and star trackers, EPS with deployable arrays and a battery sized for eclipse, thermal, propulsion for station-keeping and deorbit, C&DH, payload), reviews (MCR, SRR, SDR, PDR, CDR, TRR, PSR, FRR), environments testing (vibration, thermal vacuum, EMI/EMC), and the 25-year (now 5-year) deorbit expectation. Keep all organizations and people fictional.

## Cast and arcs
- **Nadia Brooks** (the lead, "you"). 31. Came from five years as a test engineer at an aircraft avionics shop in Colorado Springs, just moved into her first systems engineer role. Sharp at test, uneasy with ambiguity and with telling senior people no. Arc: from "make the test pass" to "make sure we're building the right thing," and finally to owning the system view in the room. Her father is a retired lineman for Xcel; his line "you don't climb a pole you haven't grounded" recurs.
- **Ruth Calder**. Retired NASA flight director, now on FRO's advisory board as a favor to an old colleague. Same Ruth: dry, kind, launch analogies, honest about numbers. Her lessons here are about integration and verification discipline. She references her 1991 loss only once, late, and briefly.
- **Wes Harland**. Chief engineer, 58, brilliant, has built twelve spacecraft, distrusts paperwork and sometimes skips it. Arc: learns that his intuition and a traced requirement are not enemies. His conflict with Nadia over requirements discipline drives Part One.
- **Amara Osei**. Program manager, 44, ex-Air Force acquisition officer. Cost and schedule are her world. Ally to Nadia, but pushes to cut test time. Arc: from "test is schedule risk" to "test is risk reduction."
- **Luis Ferreira**. Integration and test lead, 39, calm, owns the cleanroom. Nadia's natural friend from her test background. Arc: has to tell Nadia a hard truth about a verification gap she caused.
- **Dr. Helen Cho-Ramirez**. NWMO's program scientist and the voice of the customer. Knows fire, not spacecraft. Arc: her real need ("detect fires fast enough to dispatch") differs from what the contract says ("1.2 m resolution"), and the course turns on that gap.
- **Pavel Ruzicka**. Account lead at **Brightline Optics**, the supplier building the imager. Proud, overcommitted. Arc: a late delivery and an interface mismatch, handled through agreement processes, not blame.
- **Jun Takeda**. Junior systems engineer, 24, MBSE native, keeps the SysML model. Arc: Nadia's protege; by the end Jun leads a review.
- **Sam Okafor** cameos twice (ch3 and ch11) as a fellow Ruth mentee from Halcyon AI across town, trading notes over coffee. One line from him: "Same job, different hardware."
- New characters appear through each chapter's `cast` array.

## Chapter plan (num, title, focus, codes, ending)
**Part One: Concept**
1. **Kickoff** (week 1). Nadia's first day; the signed contract; Wes's "we know what to build"; Ruth's first coffee. Mission analysis and the problem space before the solution, life cycle stages and reviews, the SE "V". Codes: T1, X1, M1, O1. Ends: Helen says something that doesn't match the contract.
2. **What They Actually Need** (weeks 2 to 4). Stakeholder identification, needs elicitation, concept of operations, operational scenarios, MOEs, turning needs into stakeholder requirements, validation intent. Drill: classify needs vs requirements; MOE vs MOP vs TPM. Codes: T2, T11, X1. Ends: the 30-minute detection need exposes a ground segment gap.
3. **Good Requirements** (weeks 4 to 6). System requirements definition, requirement quality characteristics (necessary, unambiguous, verifiable, singular, feasible, traceable), verification methods (inspection, analysis, demonstration, test), traceability, requirements baseline. Drill: rewrite bad requirements; assign verification methods. Sam cameo. Codes: T3, T9, M5. Ends: the SRR passes but Wes added three "obvious" requirements outside the baseline.
4. **Shape of the System** (weeks 6 to 9). Architecture definition, functional and physical architectures, interfaces and N-squared diagrams, viewpoints, MBSE with Jun's model. Exercise: allocate functions to subsystems. Codes: T4, X3, T6. Ends: the imager interface from Brightline doesn't match the bus.
5. **The Trade** (weeks 9 to 11). Decision management and trade studies: criteria, weights, sensitivity; system analysis for the SWIR band vs better optics. Drill: weighted-sum trade with a sensitivity check (exact numbers). Codes: M3, T6, T5. Ends: the trade picks the SWIR band; Amara hates the schedule hit.
**Part Two: Development**
6. **Supplier** (weeks 11 to 14). Acquisition and supply processes, the agreement, statement of work, ICDs, acceptance criteria, managing Brightline's late delivery and the interface fix. Codes: A1, A2, M2, M5. Ends: a revised ICD and a delivery date everyone believes.
7. **Risk** (weeks 14 to 17). Risk management: identification, likelihood and consequence, risk matrix, handling (avoid, mitigate, transfer, accept), watch items, risk burn-down; opportunities. Drill: risk exposure and a burn-down. Codes: M4, M7, X2. Ends: a reaction wheel lot has a known bearing issue.
8. **Design Review** (weeks 17 to 21). Design definition, PDR and CDR entry and exit criteria, technical performance measures with margins (mass, power, pointing), configuration control boards. Drill: margin and TPM tracking (exact numbers). Codes: T5, M7, M5, M2. Ends: CDR passes with a mass margin that's thinner than it looks.
9. **Ilities** (weeks 21 to 24). Reliability (MTBF, redundancy, single-point failures), availability, maintainability for a spacecraft, safety and hazard analysis, cybersecurity for the ground segment, human systems integration for operators. Drill: series and parallel reliability (exact numbers). Codes: X2, T6, M8. Ends: a single-point failure in the battery charge path.
**Part Three: Integration and Beyond**
10. **Integration** (weeks 24 to 28). Implementation and integration strategy, build-up sequence, interface verification, the cleanroom, first power-on, anomaly handling, configuration and information management. Codes: T7, T8, M6, M5. Ends: a harness swapped during integration was never captured in configuration.
11. **Test Like You Fly** (weeks 28 to 33). Verification vs validation, the verification matrix, environments testing (vibe, TVAC, EMI), test like you fly, requirements closure, the gap Luis finds. Sam cameo. Codes: T9, T11, M8, X1. Ends: Nadia admits her own verification gap at the TRR.
12. **Ship It** (weeks 33 to 38). Transition to the launch provider, pre-ship review, readiness reviews, operations planning, the operations option, maintenance of the ground system, end-of-life disposal and deorbit planning. Codes: T10, T12, T13, T14. Ends: KESTREL-1 ships.
**Part Four: The Organization** (shorter chapters may be combined by the writer if needed, but keep 12 chapters total by folding these themes into chapters 10 to 12 if necessary; preferred is to keep the twelve above and weave O codes through every chapter)
- Weave O1 to O6 throughout: FRO's life cycle model (ch1, ch12), infrastructure and the cleanroom (ch10), portfolio decisions when FRO bids a second satellite (ch7, ch12), hiring and growing Jun (ch4, ch11), the quality management system and audits (ch8, ch11), lessons learned and knowledge management (ch10, ch12). Tailoring (X4) appears in ch1, ch6, and ch12 (agile ground software, a smallsat tailoring of heavy NASA-style processes). X5 SE in practice and ethics in ch11 and ch12.
- **Coda inside ch12**: launch night, first light from orbit, the first wildfire detection in 24 minutes, Helen's message, Ruth's last line.

## Cross-chapter flags
Set via an option's `flag:"name"` on one clearly wrong option; read with `(s.flags.X||G.X)` in the setting chapter and `G.X` later. Use only these:
| flag | set in | meaning | read in |
|---|---|---|---|
| `skippedconops` | ch2 | wrote requirements before an operations concept | ch3, ch11 |
| `acceptedwesreqs` | ch3 | let Wes's requirements in without change control | ch8, ch10 |
| `nointerfacecontrol` | ch4 | treated the imager interface informally | ch6, ch10 |
| `unweightedtrade` | ch5 | chose by gut instead of criteria and weights | ch8, ch12 |
| `blamedsupplier` | ch6 | went adversarial with Brightline | ch10, ch12 |
| `hidrisk` | ch7 | kept the wheel risk off the board's register | ch9, ch11 |
| `paddedmargin` | ch8 | reported margin that included hidden reserve | ch9, ch12 |
| `cuttest` | ch8 | agreed to cut a test to protect the schedule | ch11 |
| `noconfigcapture` | ch10 | fixed the harness without capturing it in CM | ch11 |
| `rushedtrr` | ch11 | went into test with open items unresolved | ch12 |

## Story props (same format as the PMP bible)
1 to 3 per chapter: Helen's email about detection timing (ch1), the concept of operations excerpt (ch2), a bad-then-good requirement as a doc (ch3), an N-squared table as a doc (ch4), the trade matrix as a bars chart (ch5), the ICD change notice (ch6), the risk register entry (ch7), mass margin bars at CDR (ch8), a reliability block summary (ch9), the integration anomaly report (ch10), the verification matrix excerpt (ch11), the first-light image caption and Helen's message (ch12).

## Mock exam plan
- 120 single-answer questions (the app's mock engine supports single answer only), timed at 120 minutes, scenario-heavy but also direct process knowledge ("Which process produces the..."; "What is the primary purpose of..."), in neutral fictional settings, NOT the KESTREL story.
- Files: `courses/asep/mock/technical.js` (54 questions), `management.js` (30), `agreement_org.js` (14), `crosscutting.js` (22). Same object format as the PMP mock (`part`, `questions` with `q, opts, a, why, task, domain`), with `domain` set to one of `Technical`, `Technical management`, `Agreement and organizational`, `Cross-cutting`, and `task` set to the codes above.
- Validate with the shared checker once it supports these codes (the course engine maps code prefixes T, M, A, O, X to those four domains).

## File format
`courses/asep/full/chNN.js`, same object shape as the PMP Full Course (`window.HALCYON_FULL.push({...})`), with `tasks` and every scene and quiz `task` using the codes above and `domain` set to one of the four domains above. 12 scenes per chapter (ids `f{N}s{i}`), lesson 700 to 1100 words, drills where the plan says, an exercise in about half the chapters, 15 quiz questions, `closing`, `episode:{src:\`audio/full-chNN.mp3\`}`, and `next`. Speaker tags must use cast first names (Nadia, Ruth, Wes, Amara, Luis, Helen, Pavel, Jun, Sam, plus any new cast) or `man` / `woman`.
