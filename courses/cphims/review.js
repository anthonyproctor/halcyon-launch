// One Chart (CPHIMS) exam week review (2026-11-07): one on screen page for the last days before the test. Never narrated.
// Loads once "review.js" is in the cphims scripts list in courses.js (the caller adds it). engine.js (renderReview, route #cphims/review, the button in the home page's Practice exam
// card) reads window.HALCYON_REVIEW.cphims; its header explains sections and kinds.
// Shape: intro [paragraphs]; sections [[id, title, kind]]; format and domains [{group, note?, items:[{name, where?, d, ch, sec}]}] (kind list);
// env, clin, sys and lead [{group, items:[{t, d, ch, sec}]}] (kind terms); math [{group, note?, items:[{name, f, means, ex, ch, sec}]}]
// (kind formulas); rules and day [{r, why, ch, sec}] (kind rules); contrasts [{topic, l:[left label, right label], a, b, ch, sec}].
// ch and sec point at where the book teaches it: Full Course chapter ch, Ochoa's Legal Pad (the lesson), section index sec (0 based, in the
// order of courses/cphims/full/chNN.js lesson.sections). mock:true instead of ch means only the practice exams teach it. The test format,
// scoring and test day rules aren't taught in any lesson, so those items open the practice exam, which runs the same format.
// Groups in the four domain sections carry the outline's task codes (meta.js and tools/coverage/cphims.json use the same codes).
// Sources: the lessons in courses/cphims/full/ch01.js to ch12.js and the explanations in courses/cphims/mock/mock1.js and mock2.js; the
// outline map tools/coverage/cphims.json (71 tasks); the codex audit of 2026-11-07 (halcyon-private); and the HIMSS CPHIMS Candidate
// Handbook, effective May 1, 2024 (HIMSS hosted PDF, read 2026-11-07): two hours, four options, scaled 200 to 800 with 600 to pass, equating,
// no guessing penalty, on screen calculator, one sheet of scratch paper, arrive 30 minutes early, two IDs, 60 day retake wait, three year
// renewal with 45 CE hours. The handbook lists 100 questions; the 115 with 15 unscored pretest count is from the HIMSS certification page
// (cited by the audit and BIBLE.md; the page refused a plain fetch on 2026-11-07), so the page says both. Domain weights 25, 20, 30 and 25
// match the handbook and courses.js examWeights. Every worked example was recomputed by hand on 2026-11-07, and none reuses a mock or quiz
// number set. Every line is in our own words. Copy rules: plain words, contractions, no dashes, "minus" for subtraction.
window.HALCYON_REVIEW=window.HALCYON_REVIEW||{};
window.HALCYON_REVIEW.cphims={
  intro:[
    "One screen for the last few days. Everything here is something the book already taught you, boiled down, with a link back to the lesson that teaches it. A few topics show up only in the practice exams, and those links open the practice exam. So do the format and test day items, since no lesson covers them.",
    "We follow HIMSS's CPHIMS Candidate Handbook, effective May 1, 2024, and its outline: four content areas and 71 tasks, with the task codes shown on each group. The HIMSS certification page describes 115 questions with 100 of them scored. The handbook lists 100. Either way you get two hours. Check your Pearson VUE confirmation and the current handbook before you sit.",
    "This is our own summary, and every example is ours. One Chart isn't affiliated with or endorsed by HIMSS. CPHIMS is a registered mark of HIMSS."
  ],
  sections:[["format","The test, start to finish","list"],["domains","The four domains","list"],["env","Environments: key terms","terms"],["clin","Clinical Informatics: key terms","terms"],["sys","Systems Management: key terms","terms"],["lead","Management and Leadership: key terms","terms"],["math","The math","formulas"],["rules","What the test wants","rules"],["contrasts","Easy to mix up","contrasts"],["day","The day before and the morning of","rules"]],
  format:[
    {group:"The sitting", items:[
      {name:"How many questions", where:"HIMSS page and handbook", d:"The HIMSS certification page says 115, with 100 scored and 15 unscored pretest items you can't pick out. The May 2024 handbook lists 100. Treat every one as if it counts.", mock:true},
      {name:"How long", where:"Two hours", d:"A countdown timer runs on every screen. The short tutorial before you start doesn't come out of your two hours.", mock:true},
      {name:"What a question looks like", where:"Four options, one answer", d:"One question at a time. You can change an answer as often as you like, skip one and come back, or flag it for review.", mock:true},
      {name:"Three levels", where:"Recall, application, analysis", d:"Some ask what a thing is, some ask you to use it in a new case, and some ask you to weigh a situation and pick the best fix. The handbook doesn't say how many of each.", mock:true},
      {name:"Where you sit", where:"Pearson VUE", d:"A test center, or online with OnVUE once your computer passes Pearson's system check. You book and sit within the 90 day window HIMSS gives you.", mock:true}
    ]},
    {group:"Scoring and after", items:[
      {name:"The pass mark", where:"Scaled score", d:"Scores run from 200 to 800, and 600 passes on every form. HIMSS equates forms so a harder one isn't held against you, and it doesn't publish how many right answers 600 takes.", mock:true},
      {name:"Guessing", where:"No penalty", d:"A blank and a wrong answer cost the same, so answer everything.", mock:true},
      {name:"Your result", where:"On screen at the end", d:"Pass or fail shows on screen at the end. The score report, through Pearson's portal, adds a bar for each content area showing where you were stronger.", mock:true},
      {name:"If it doesn't go your way", where:"60 days", d:"You wait 60 days to test again. You can apply for the retake right away, and up to two retakes within a year of your first application come at a lower fee.", mock:true},
      {name:"Keeping it", where:"Every three years", d:"Renew with 45 hours of continuing education and a fee, or by passing the exam again.", mock:true}
    ]}
  ],
  domains:[
    {group:"Weights and what they cover", note:"The four content areas and their share of the scored questions, from the handbook. 7, 6, 33 and 25 tasks make 71.", items:[
      {name:"Healthcare and Technology Environments", where:"25 percent, tasks E1 to E7", d:"The healthcare world (kinds of organizations, how they connect, who does what, the rules, trends) and the technology world (the applications and the infrastructure under them).", mock:true},
      {name:"Clinical Informatics", where:"20 percent, tasks C1 to C6", d:"Clinical and IT vocabulary, clinical metrics, building functions that help care, reading outcomes and models, and keeping decision support current.", mock:true},
      {name:"Healthcare Information and Systems Management", where:"30 percent, tasks SA, SB, SC, SD, SE", d:"The biggest share. Analysis, design, selection and implementation, testing and evaluation, and privacy and security. That's 33 tasks across the whole life of a system.", mock:true},
      {name:"Management and Leadership", where:"25 percent, tasks L1 to L25", d:"Strategy, forecasting, performance, policy, ethics, communication, meetings, consulting, education, risk, change, staffing, projects, contracts and money.", mock:true}
    ]}
  ],
  env:[
    {group:"E1 Kinds of organizations and who pays", items:[
      {t:"Critical access hospital", d:"A small rural hospital with 25 inpatient beds or fewer and emergency care around the clock, usually far from the next hospital. Medicare pays it on its reasonable costs, IT spending included.", ch:6, sec:3},
      {t:"Ambulatory care", d:"The patient goes home the same day: clinics, surgery centers, urgent care.", ch:1, sec:0},
      {t:"Community health center", d:"Primary care for anyone, whether or not they can pay, often on a sliding fee, with its own board.", ch:12, sec:0},
      {t:"Payers, regulators, accreditors", d:"Payers decide what gets paid (insurers, Medicare, Medicaid). Regulators like CMS write rules. Accreditors like The Joint Commission survey against standards.", ch:1, sec:0},
      {t:"Medicare Administrative Contractor", d:"Processes original Medicare fee for service claims for a region. A Medicare Advantage member's claim goes to the private plan instead.", ch:1, sec:0},
      {t:"MS-DRG", d:"Under Medicare's inpatient prospective payment system, the DRG on the discharge mostly sets what the hospital is paid for the stay.", ch:1, sec:0},
      {t:"Accountable care organization", d:"Shares savings when a whole population's cost of care comes in under a benchmark and quality holds, so it needs data from every setting.", ch:1, sec:0}
    ]},
    {group:"E2 How organizations connect", items:[
      {t:"Health information exchange", d:"Moves clinical data between organizations that don't share a system.", ch:1, sec:1},
      {t:"Continuity of care", d:"The next caregiver knows what the last one knew. Every transfer and referral is a place it can break.", ch:1, sec:1},
      {t:"TEFCA", d:"A national framework that links exchange networks so records can follow a patient across the country.", ch:2, sec:2},
      {t:"Record locator service", d:"Tells a query which organizations hold a patient's records, so the records can stay where they are.", ch:1, sec:1}
    ]},
    {group:"E3 Who does what", items:[
      {t:"CIO", d:"IT strategy and budget for the whole organization. Usually answers to the CEO.", ch:1, sec:2},
      {t:"CMIO and CNIO", d:"The physician and nursing leaders who connect clinical practice to the systems. Decision support and clinician adoption run through them.", ch:1, sec:2},
      {t:"Clinical informatics council", d:"Where clinical content decisions get made, like what goes in an order set. IT builds what it decides.", ch:1, sec:2},
      {t:"Health information management director", d:"Owns the completeness of the legal health record and the release of information from it.", ch:1, sec:2},
      {t:"RACI chart", d:"Names exactly one person accountable for each decision, plus who's responsible, consulted and informed.", ch:1, sec:2}
    ]},
    {group:"E4 Laws, rules and accreditation", items:[
      {t:"Conditions of Participation", d:"What CMS requires before a hospital can take Medicare and Medicaid patients. With deemed status, an accreditor's survey counts as meeting them.", ch:2, sec:0},
      {t:"Tracer", d:"A surveyor follows one patient's care through the building and talks to the people who gave it.", ch:2, sec:0},
      {t:"HIPAA Privacy Rule", d:"All PHI, in any form. Treatment, payment and operations need no authorization. Patients get rights to access, amendment (correction), an accounting of disclosures, restrictions and a notice of privacy practices.", ch:2, sec:1},
      {t:"Minimum necessary", d:"Use or share only what the job needs. It doesn't apply when one provider sends information to another for treatment.", ch:2, sec:1},
      {t:"HITECH", d:"Added breach notification, made business associates directly liable, raised penalties and paid hospitals to adopt certified EHRs.", ch:2, sec:1},
      {t:"Information blocking", d:"Interfering with access to or exchange of electronic health information. Allowed only when law requires it or an exception like harm, privacy, security or infeasibility fits.", ch:2, sec:2},
      {t:"42 CFR Part 2", d:"Tighter protection for substance use treatment records from federally assisted programs. One consent can now cover treatment, payment and operations. Using them against the patient in a court or agency case still takes a separate, specific consent or a court order.", ch:2, sec:2},
      {t:"EMTALA", d:"A medical screening exam and stabilizing care, or a proper transfer, for anyone who comes to the emergency department, whatever they can pay.", ch:2, sec:3},
      {t:"Controlled substance e-prescribing", d:"The DEA requires two factor authentication when the prescriber signs.", ch:2, sec:3},
      {t:"Research waiver", d:"When getting each patient's authorization isn't practical, an IRB or privacy board can waive it if the study meets the criteria.", ch:2, sec:1}
    ]},
    {group:"E5 Trends", items:[
      {t:"Telehealth, telepharmacy, portals, wearables", d:"Each earns its place by measured outcomes against a baseline, not by being new.", ch:4, sec:4},
      {t:"Trends worth the work", d:"The ones that reach patients: remote ICU monitoring, FHIR apps, care at home, population health.", ch:8, sec:3},
      {t:"Store and forward", d:"A photo or study sent now and reviewed later. It's a good fit for weak broadband. Remote monitoring sends home readings instead.", ch:8, sec:3}
    ]},
    {group:"E6 Application families", items:[
      {t:"Clinical", d:"The EHR, CPOE, eMAR, BCMA, the lab system, pharmacy and PACS.", ch:1, sec:3},
      {t:"Administrative", d:"Registration and ADT, scheduling, supply chain.", ch:1, sec:3},
      {t:"Financial", d:"The revenue cycle: charge capture, coding, billing, claims.", ch:1, sec:3},
      {t:"Consumer", d:"Anything the patient touches: the portal, telehealth, remote monitoring.", ch:1, sec:3},
      {t:"Business intelligence", d:"A warehouse that pulls from all the others for reports, dashboards and analytics.", ch:1, sec:3},
      {t:"Enterprise resource planning", d:"Runs purchasing, payroll, HR and the general ledger.", ch:1, sec:3}
    ]},
    {group:"E7 Infrastructure", items:[
      {t:"LAN, WAN, VPN, firewall", d:"Inside a building, between buildings, a secure tunnel across someone else's network, and the gate that decides what crosses.", ch:3, sec:0},
      {t:"Interface engine", d:"A hub every system sends to once. It translates, routes, queues and logs, and it needs its own redundancy.", ch:3, sec:0},
      {t:"ACK", d:"The receiver's reply to an HL7 message: accepted, error or rejected. A commit accept only means it was received and stored.", ch:3, sec:0},
      {t:"Device network segment", d:"Medical devices on their own slice of the network, so fewer people and machines can reach them.", ch:3, sec:3},
      {t:"Quality of service", d:"Network settings that put clinical traffic first when a link is busy.", ch:9, sec:5}
    ]}
  ],
  clin:[
    {group:"C1 Clinical words", items:[
      {t:"Daily, BID, TID, QID", d:"Doses per day, given at the hospital's standard times.", ch:4, sec:0},
      {t:"q4h, q6h, q8h, q12h", d:"Every so many hours around the clock, counted from the first dose.", ch:4, sec:0},
      {t:"PRN, STAT, AC, PC, HS", d:"As needed (a good order says for what and how often at most), now, before meals, after meals, at bedtime.", ch:4, sec:0},
      {t:"PO, SL, IV, IM, SubQ, PR", d:"By mouth, under the tongue, into a vein, into a muscle, under the skin, rectally.", ch:4, sec:0},
      {t:"Body systems", d:"Cardiovascular, respiratory, renal, gastrointestinal, neurologic, endocrine, musculoskeletal, hematologic, and integumentary, which is the skin.", ch:4, sec:0},
      {t:"Do-not-use list", d:"The Joint Commission's banned shorthand: U, IU, QD, QOD, trailing zeros, missing leading zeros, and MS, MSO4 and MgSO4. Write the words out.", ch:4, sec:0}
    ]},
    {group:"C2 IT words and standards", items:[
      {t:"HL7 v2", d:"The workhorse inside hospitals. ADT A01 admit, A02 transfer, A03 discharge, A04 outpatient registration, A08 update. ORM or OML carries orders, ORU results. PID is the patient segment and OBX holds each result value.", ch:3, sec:1},
      {t:"C-CDA", d:"Whole clinical documents in XML. The Continuity of Care Document travels with a patient at a transfer or referral.", ch:3, sec:1},
      {t:"FHIR", d:"Small resources like Patient, Observation and MedicationRequest over web APIs. What patient apps use.", ch:3, sec:1},
      {t:"DICOM, X12, NCPDP SCRIPT", d:"Images, payer transactions (837 claim, 835 payment, 270 and 271 eligibility), and e-prescriptions.", ch:3, sec:1},
      {t:"SNOMED CT, LOINC, RxNorm", d:"Clinical terms and problems, lab tests and observations, drugs.", ch:3, sec:2},
      {t:"ICD-10-CM, ICD-10-PCS, CPT", d:"Diagnoses, inpatient hospital procedures, physician and outpatient services.", ch:3, sec:2},
      {t:"Four levels of interoperability", d:"Foundational (it arrives), structural (it parses), semantic (both sides mean the same thing), organizational (the policy and trust to share it).", ch:3, sec:2}
    ]},
    {group:"C3 Clinical metrics", items:[
      {t:"Turnaround time", d:"Needs a defined start and stop. Report the median and a slow percentile, because an average hides the longest waits.", ch:4, sec:2},
      {t:"Who counts as inpatient", d:"Observation and swing bed patients get counted differently in different reports, so census numbers can disagree.", ch:4, sec:2},
      {t:"Adherence", d:"The share of cases where the expected step happened, like an order set used.", ch:4, sec:2},
      {t:"Proportion of days covered", d:"Uses pharmacy fill dates to show whether patients had the drug on hand, not just whether it was prescribed.", ch:4, sec:2}
    ]},
    {group:"C4 Functions that help care", items:[
      {t:"Closed loop medication management", d:"CPOE, pharmacist check, profiled cabinet, bedside scan against the eMAR, smart pump. Each step checks the one before.", ch:4, sec:1},
      {t:"Medication reconciliation", d:"At every transition, compare what the patient was taking with what's ordered now.", ch:4, sec:1},
      {t:"Workaround", d:"A sign of where the system fights the work. Find out why before you take it away.", ch:4, sec:1},
      {t:"Smart pump integration", d:"The order programs the pump and the pump reports what it did, which cuts hand programming errors.", ch:3, sec:3},
      {t:"Point of care fit", d:"Clinical functionality counts when it shows up where the decision happens, one click from the next step.", ch:7, sec:3}
    ]},
    {group:"C5 Reading outcomes", items:[
      {t:"Run chart", d:"Values in time order with a median line. Six or more in a row on one side is a shift. Five or more going one way is a trend.", ch:5, sec:3},
      {t:"Control chart", d:"Adds a mean and limits about three standard deviations out. Inside is common cause noise. Outside, or a pattern, is special cause.", ch:5, sec:3},
      {t:"Outcome, process, balancing", d:"What happens to the patient, what the team does, and whether the fix caused harm somewhere else.", ch:5, sec:3},
      {t:"Silent mode and drift", d:"Run a model unseen on your own patients first. After go-live, watch it by site and group, because data, patients and practice change.", ch:5, sec:5},
      {t:"Area under the curve", d:"0.5 is a coin flip and 1.0 is perfect. A vendor's number belongs to the hospitals it came from.", ch:12, sec:2},
      {t:"Picking a chart", d:"A line for change over time, bars to compare categories, a scatter plot for two numeric measures.", ch:5, sec:3}
    ]},
    {group:"C6 Keeping content current", items:[
      {t:"Interruptive and passive CDS", d:"One stops you and needs an answer. The other is there when you look.", ch:5, sec:0},
      {t:"Five rights of CDS", d:"Right information, right person, right format, right channel, right time in the workflow.", ch:5, sec:0},
      {t:"Alert fatigue", d:"Too many low value alerts teach people to override them all, including the one that matters.", ch:5, sec:1},
      {t:"CDS governance", d:"Every alert and order set has a clinical owner, a reason, a measure, a version and a review date. Unowned or useless ones get retired.", ch:8, sec:4}
    ]}
  ],
  sys:[
    {group:"SA Analysis", items:[
      {t:"SDLC", d:"Planning (the business case), analysis, design, build and test, implementation, maintenance and support. Skipping a phase just moves its work later, where it costs more.", ch:6, sec:0},
      {t:"Needs and gap analysis", d:"Ask the people who do the work, map today and the future, and list what's missing between them.", ch:6, sec:1},
      {t:"Testable requirement", d:"Specific and measurable, like a click count checked in test. \"Easy\" isn't a requirement.", ch:6, sec:1},
      {t:"Process maps", d:"Ovals start and end, rectangles are steps, diamonds are decisions. Swimlanes give each role a row so the handoffs show.", ch:4, sec:3},
      {t:"Value stream map", d:"The whole flow, with value added steps split from waits.", ch:4, sec:3},
      {t:"Mismatched data sources", d:"Before you compare two reports, check how each defines the measure, the period and the patients. Compare like with like.", ch:6, sec:5},
      {t:"Alternatives", d:"Doing nothing is always one. Price every option over the same period on the same criteria.", ch:6, sec:3},
      {t:"Total cost of ownership", d:"Every cost over the period: licenses, services, hardware, interfaces, training, backfill and internal staff time.", ch:6, sec:3},
      {t:"Strategic fit", d:"A proposal names the organizational goal it serves.", ch:1, sec:4},
      {t:"Benefits realization plan", d:"For each benefit: owner, baseline, target, measure, data source and review dates.", ch:6, sec:5},
      {t:"RFI, RFP, RFQ", d:"A nonbinding question to the market, a formal request for firm comparable offers, a price for something you've fully defined.", ch:7, sec:0},
      {t:"NDA, BAA, SOW, SLA", d:"Protects secrets, covers PHI, defines the work and its acceptance, measures performance with remedies.", ch:7, sec:1}
    ]},
    {group:"SB Design", items:[
      {t:"Business impact analysis", d:"What an outage of each system costs patients and operations over time. Owners set the recovery targets from it.", ch:8, sec:0},
      {t:"Hot, warm, cold site", d:"Minutes to hours with current data, hours to days restoring from backup, days to weeks from bare space. Mirrored adds a live copy and automatic failover.", ch:8, sec:1},
      {t:"Real redundancy", d:"Two paths that can't fail together. A second circuit in the same trench doesn't count.", ch:8, sec:1},
      {t:"Ransomware proof backups", d:"Offline or unchangeable copies the attacker can't reach.", ch:8, sec:1},
      {t:"Owner, steward, custodian", d:"The business leader who decides, the person who keeps definitions and quality right, and IT, which stores it and applies the access the owner allows.", ch:8, sec:2},
      {t:"Master patient index", d:"Links every record to one person. A duplicate splits a history. An overlay merges two people, which is worse.", ch:8, sec:2},
      {t:"Technology intake", d:"One path for every request and trend: screen it against strategy, pilot with measures set first, then scale or stop.", ch:8, sec:3},
      {t:"Device integration", d:"Biomed owns the devices and IT owns the network. Both agree before anything changes.", ch:3, sec:3},
      {t:"Standards compliance", d:"Send data in the standard vocabulary, not a local code. Local lab codes get mapped to LOINC, so a test means the same thing at every site.", ch:3, sec:2}
    ]},
    {group:"SC Selection, implementation and support", items:[
      {t:"Selection committee", d:"Each member scores what their role can judge: clinicians the workflow, the CISO security, the privacy officer data handling, finance cost, legal the contract.", ch:7, sec:2},
      {t:"Scripted demo", d:"Your scenarios, the same for every vendor, scored as they run. Weights are set before the first demo.", ch:7, sec:3},
      {t:"References", d:"Sites you pick from the full client list, users talked to without the vendor, and one customer who left.", ch:7, sec:3},
      {t:"Change advisory board", d:"Reviews each request for change for impact, test evidence, a back-out plan and timing. Standard changes are routine and cleared ahead of time. Emergency changes get a fast yes and a full review after.", ch:9, sec:3},
      {t:"Training methods", d:"Computer based learning, classroom practice, train the trainer, and at the elbow support. Access waits on a proficiency check.", ch:11, sec:0},
      {t:"Superusers", d:"Floor staff with extra training, no patient load during go-live, on every shift.", ch:11, sec:0},
      {t:"Command center and hypercare", d:"One place where every go-live issue gets a severity and an owner, through the weeks of extra support until things settle.", ch:11, sec:2},
      {t:"Upgrades", d:"Read the release notes against your build, test in a copy of production with regression, plan the downtime, keep a back-out plan. Falling behind is the risk.", ch:11, sec:3},
      {t:"Help desk data", d:"Group tickets by time, place and wording, and line them up with recent changes. Restore service first, then find the cause.", ch:9, sec:5}
    ]},
    {group:"SD Testing and evaluation", items:[
      {t:"Test types", d:"Unit (one piece), system (one application), integrated (across systems), regression (rerun after a change), load (expected peak), stress (past the peak), user acceptance (users decide it's ready).", ch:9, sec:0},
      {t:"Smoke test", d:"A quick check that a new build opens and the main screens load before deeper testing.", ch:9, sec:0},
      {t:"Entry and exit criteria", d:"Set before testing starts, like a pass rate and no open severity one or two defects.", ch:9, sec:1},
      {t:"Traceability matrix", d:"Links every requirement and contract test to a script, so nothing promised goes untested.", ch:9, sec:1},
      {t:"Edge tests", d:"A limit of twenty gets tested at nineteen, twenty, twenty-one and well past it.", ch:9, sec:1},
      {t:"Test controls", d:"Separate environments, version numbers on every build, moves by ticket, masked or test data, and no one person who builds, tests and promotes.", ch:9, sec:2},
      {t:"Acceptance criteria", d:"Tests written from the contract and design that a deliverable passes before it's accepted and paid.", ch:7, sec:4}
    ]},
    {group:"SE Privacy and security", items:[
      {t:"Confidentiality, integrity, availability", d:"Seen only by the right people, accurate, and there when needed. Ransomware hits availability first.", ch:10, sec:0},
      {t:"Incident response", d:"Prepare, detect and analyze, contain, eradicate, recover, learn. Isolate the segment and keep machines on to save evidence.", ch:10, sec:0},
      {t:"Least privilege and need to know", d:"Each role gets what the job needs, narrowed to the patients in your care. Unique logins, removed the day someone leaves.", ch:10, sec:1},
      {t:"Break-the-glass", d:"Emergency access outside your usual rights, with a stated reason, logged and reviewed.", ch:10, sec:1},
      {t:"Administrative, physical, technical", d:"Policies and training, locked rooms and drive disposal, unique IDs and logoff and encryption.", ch:10, sec:2},
      {t:"Encryption", d:"At rest and in transit. Properly encrypted data isn't unsecured PHI under the breach rule.", ch:10, sec:2},
      {t:"Vulnerability roles", d:"Security scans and rates, the system owner is accountable for the fix, IT applies it through change control, and a missed deadline needs a signed exception with a compensating control.", ch:10, sec:3},
      {t:"Classification, retention, legal hold", d:"Every data set gets an owner, a level and a retention period. A legal hold stops destruction whatever the schedule says.", ch:10, sec:4},
      {t:"Checking controls still work", d:"Common practice, not a HIPAA schedule: owners review access each quarter, someone reads audit logs, scans run monthly, and an independent tester runs penetration tests.", ch:10, sec:5},
      {t:"Breach", d:"Presumed unless a four factor risk assessment shows low probability of compromise. Patients hear without unreasonable delay, no later than 60 days after discovery. 500 or more: HHS at the same time. Under 500: log it and report to HHS within 60 days after the year ends. More than 500 in one state: the media there.", ch:10, sec:6}
    ]}
  ],
  lead:[
    {group:"L1 to L4 Strategy and forecasting", items:[
      {t:"Mission and vision", d:"Why the organization exists, and where it wants to be.", ch:12, sec:0},
      {t:"SWOT", d:"Strengths and weaknesses inside, opportunities and threats outside.", ch:12, sec:0},
      {t:"IT strategic plan", d:"Current state, where the organization's going, initiatives on a roadmap, governance, cost, measures and risks. It follows the organization's plan.", ch:12, sec:0},
      {t:"Culture", d:"The values, habits and history of the people who'll live with the change. Learn it before you change it.", ch:1, sec:4},
      {t:"Just culture", d:"Honest mistakes are system problems, risky choices get coaching, and only reckless acts get punished, so people report.", ch:1, sec:4},
      {t:"Forecasting", d:"Build from drivers like volumes, new services and users, and redo it every year.", ch:12, sec:1}
    ]},
    {group:"L5, L6, L11, L19 Measuring and reporting", items:[
      {t:"KPI", d:"A measure tied to a goal, with a target, an owner, a data source and a schedule.", ch:12, sec:2},
      {t:"SLA in practice", d:"Measure it with your own data, agree when the clock starts and stops, and use the contract's remedies.", ch:11, sec:2},
      {t:"Effectiveness and satisfaction", d:"Does it improve care, and how is it to use. Both against a baseline.", ch:4, sec:4},
      {t:"Benchmark", d:"Fair only when definitions match and the peers look like you. A gap is a question, not a verdict.", ch:12, sec:2},
      {t:"Presenting to decision makers", d:"Lead with the recommendation and the decision you need, show the risk on one page, and brief the key people first.", ch:6, sec:5}
    ]},
    {group:"L7, L9, L10, L12 to L14, L18 Stakeholders, ethics and the room", items:[
      {t:"Showing the limits", d:"Publish the ranking, the resources and the budget so a leader can see why a request sits below the line and what would move it.", ch:12, sec:1},
      {t:"Gifts during a selection", d:"Decline and disclose.", ch:7, sec:5},
      {t:"Personal conflict", d:"Disclose in writing and step out of scoring that vendor.", ch:7, sec:5},
      {t:"Fair bidding", d:"Same information, same day, one procurement contact. No bidder sees another's price.", ch:7, sec:5},
      {t:"Consensus", d:"A decision everyone can live with. Start from agreement and test the disagreement with a time limited pilot and a stop rule.", ch:5, sec:4},
      {t:"Facilitation", d:"Shared goal first, criteria before options, then the way to decide the room agreed to.", ch:12, sec:4},
      {t:"Internal consultant", d:"Find the need behind the request, bring options with their costs, recommend one, and let the owner decide.", ch:11, sec:1},
      {t:"Incident communication", d:"One voice, staff first, the same facts for everyone, what isn't known yet, and when you'll speak again.", ch:10, sec:6}
    ]},
    {group:"L8, L15, L16, L20 to L22 People and policy", items:[
      {t:"Education strategy", d:"Who learns what, how and when. Train by role, close to go-live, on real cases, and check proficiency before a login. Busy physicians and night staff need e-learning or short sessions, not one long class.", ch:11, sec:0},
      {t:"Policy and procedure", d:"What and why, signed off through governance, versus how. Each has an owner and a review date.", ch:12, sec:3},
      {t:"ADKAR", d:"Awareness, desire, knowledge, ability, reinforcement.", ch:11, sec:1},
      {t:"Champions", d:"Respected peers who use the system well. Some of the best were skeptics first.", ch:11, sec:1},
      {t:"Job description", d:"Purpose, duties, decision rights, reporting line and skills, plus what the role doesn't own.", ch:12, sec:3},
      {t:"Succession plan", d:"For any role one person holds: who could step in, how ready, and the training to get there.", ch:12, sec:3},
      {t:"Competency validation", d:"A defined skill, practice, and sign-off by someone who watched it done.", ch:9, sec:4},
      {t:"Staying current", d:"Continuing education, associations, conferences, certifications that renew, and a funded plan for each person.", ch:12, sec:5}
    ]},
    {group:"L17, L23 to L25 Risk, projects, contracts and money", items:[
      {t:"Risk responses", d:"Avoid, mitigate, transfer, accept. Insurance transfers part of the money, not the duty to patients.", ch:10, sec:3},
      {t:"Portfolio", d:"Every project together, ranked against strategy, risk, value and analyst hours. Mandatory work goes first.", ch:12, sec:1},
      {t:"Program", d:"Related projects managed together for benefits they can't deliver alone.", ch:9, sec:4},
      {t:"Contract reading", d:"Cost, schedule, support, performance with remedies, and the way out with your data returned.", ch:7, sec:4},
      {t:"Indemnification", d:"The vendor covers you if a third party sues over its product.", ch:7, sec:4},
      {t:"Operating and capital", d:"This year's salaries, subscriptions and support, versus things that last.", ch:12, sec:2},
      {t:"Contingency reserve", d:"Money held for risks you've named. Sensitivity analysis shows what happens when the case is wrong.", ch:6, sec:4}
    ]}
  ],
  math:[
    {group:"Counting the floor (C3)", note:"One running example: a 120 bed unit over a 31 day month.", items:[
      {name:"Average daily census", f:"inpatient days / days in the period", means:"How many patients were in beds on an average day.", ex:"2,790 inpatient days / 31 days = 90 patients.", ch:4, sec:2},
      {name:"Occupancy", f:"census / staffed beds", means:"How full the unit ran.", ex:"90 / 120 = 0.75, or 75 percent.", ch:4, sec:2},
      {name:"Average length of stay", f:"days of stays that ended / discharges", means:"How long a typical stay ran. Inpatient days over discharges is the common shortcut.", ex:"Stays that ended that month add up to 2,790 days over 620 discharges: 4.5 days.", ch:4, sec:2},
      {name:"BCMA scan compliance", f:"doses with both scans / all doses given", means:"How often the bedside check really happened.", ex:"3,000 doses given, both scans on 2,850: 0.95, or 95 percent.", ch:4, sec:2}
    ]},
    {group:"Alerts and models (C5, C6)", note:"One made up two by two: 1,000 patients, 50 had the condition. The alert fired on 200, and 40 of those had it.", items:[
      {name:"Sensitivity and specificity", f:"TP / (TP + FN) and TN / (TN + FP)", means:"Of the sick, how many it caught. Of the well, how many it left alone.", ex:"TP 40, FN 10, FP 160, TN 790. Sensitivity 40 / 50 = 80 percent. Specificity 790 / 950 = 83.2 percent.", ch:5, sec:2},
      {name:"PPV and NPV", f:"TP / (TP + FP) and TN / (TN + FN)", means:"When it fires, how often it's right. When it's quiet, how often that's right. PPV falls when the condition is rare.", ex:"PPV 40 / 200 = 20 percent. NPV 790 / 800 = 98.75 percent.", ch:5, sec:2},
      {name:"Override rate", f:"alerts overridden / alerts fired", means:"A starting point. Sample the overrides before you decide what the rate means.", ex:"1,710 / 1,800 = 0.95, or 95 percent.", ch:5, sec:1}
    ]},
    {group:"The business case (SA8, SD4, L23, L25)", items:[
      {name:"Net present value", f:"sum of each year's net cash / (1 + r) to the year, minus the initial cost", means:"Positive means it beats the cost of capital, which the CFO sets.", ex:"Cost 100,000, then 60,000 a year for 2 years at 10 percent. 60,000 / 1.1 = 54,545. 60,000 / 1.21 = 49,587. Total 104,132, minus 100,000 = NPV of about 4,132.", ch:6, sec:4},
      {name:"Payback period", f:"time until cumulative net cash equals the initial cost", means:"How fast you get the money back. It ignores what comes after.", ex:"Cost 250,000, saving 100,000 a year: 2.5 years.", ch:6, sec:4},
      {name:"ROI", f:"(total benefits minus total costs) / total costs", means:"Divide by costs, not by benefits.", ex:"(900,000 minus 600,000) / 600,000 = 0.5, or 50 percent.", ch:6, sec:4},
      {name:"Budget variance", f:"budget minus actual, then / budget", means:"For an expense line, negative is unfavorable. Split one time causes from recurring ones.", ex:"Budget 500,000, actual 540,000. Variance minus 40,000, or minus 8 percent. Unfavorable.", ch:12, sec:2},
      {name:"Cost performance index", f:"earned value / actual cost", means:"Below 1 means over budget for the work done.", ex:"450,000 / 500,000 = 0.9.", ch:9, sec:4},
      {name:"Expected value of named risks", f:"sum of probability x impact", means:"One way to size a contingency for the risks you've listed.", ex:"0.4 x 100,000 + 0.25 x 200,000 = 40,000 + 50,000 = 90,000.", ch:6, sec:4}
    ]},
    {group:"Uptime, growth and risk (SB4, L3, L5, L17, SE2)", items:[
      {name:"Allowed downtime", f:"(1 minus availability) x minutes in the period", means:"Turns an SLA percent into minutes. A 30 day month has 43,200.", ex:"99.95 percent: 0.0005 x 43,200 = 21.6 minutes a month.", ch:8, sec:1},
      {name:"Compound growth", f:"today x (1 + growth rate) to the number of years", means:"For storage and capacity forecasts. Adding the same amount each year undercounts.", ex:"50 TB growing 10 percent a year for 3 years: 50 x 1.331 = 66.55 TB.", ch:8, sec:3},
      {name:"Single and annual loss", f:"SLE = asset value x exposure factor. ALE = SLE x ARO", means:"A control is worth buying when it cuts ALE by more than it costs a year.", ex:"400,000 x 0.25 = 100,000 SLE. Once every 5 years, ARO 0.2: ALE 20,000 a year.", ch:10, sec:3},
      {name:"Risk score", f:"likelihood x impact, each 1 to 5", means:"25 is the worst. Rank by the score.", ex:"Likelihood 4, impact 3 = 12.", ch:10, sec:3}
    ]},
    {group:"Testing, support and results (SD1, SC6, SD4)", items:[
      {name:"Pass rate and defect density", f:"scripts passed / scripts run, and defects / size tested", means:"Say what size unit you use and keep it the same each build.", ex:"188 / 200 = 94 percent. 30 defects / 200 scripts = 0.15 per script.", ch:9, sec:1},
      {name:"Tickets per 100 users", f:"tickets / users x 100", means:"Compares support load across sites of different sizes.", ex:"360 / 1,200 x 100 = 30.", ch:11, sec:2},
      {name:"First contact resolution", f:"tickets solved on first contact / all tickets", means:"Low often means questions the desk can't answer, a training gap.", ex:"540 / 900 = 0.6, or 60 percent.", ch:11, sec:2},
      {name:"Percent change", f:"(new minus baseline) / baseline", means:"Not the same as percentage points. Say which one you mean.", ex:"60 to 75 percent is 15 points and a 25 percent change.", ch:11, sec:4}
    ]}
  ],
  rules:[
    {r:"Match the decision to its owner.", why:"Clinical content goes to clinicians through governance, security to the CISO, privacy to the privacy officer, IT strategy to the CIO.", ch:1, sec:2},
    {r:"Look past your own walls.", why:"A system change reaches referring clinics, the HIE, payers, public health and receiving hospitals. The best answer usually names them.", ch:1, sec:1},
    {r:"Nothing delays the screening exam.", why:"An EMTALA trap often hides in a registration or downtime workflow. Asking about insurance is fine only if it doesn't delay the screening. Calling the insurer for authorization waits until after.", ch:2, sec:3},
    {r:"A delay in sharing records: think information blocking.", why:"Then ask whether a specific exception fits this patient. A blanket hold usually doesn't.", ch:2, sec:2},
    {r:"Fix the cause of a workaround.", why:"Punishing staff or ripping out the override tends to make it worse.", ch:4, sec:1},
    {r:"Bad CDS: find the missing right first.", why:"Change who gets it, when, or in what form before you add another alert.", ch:5, sec:0},
    {r:"Three good weeks aren't a signal.", why:"Compare against a baseline over time and use run or control chart rules.", ch:5, sec:3},
    {r:"Validate a vendor's model on your own patients.", why:"Run it silently, compare with what happened, then keep watching for drift.", ch:5, sec:5},
    {r:"Business case, then requirements, then design.", why:"The case decides whether to do it, analysis finds the needs, and design decides how to meet them.", ch:6, sec:0},
    {r:"An honest case shows the downside.", why:"An answer that inflates benefits or hides a financial risk to win approval is wrong even when the project is good.", ch:6, sec:4},
    {r:"Owners set RTO and RPO. IT designs to them.", why:"Tighter targets cost more, so they go where patients need them.", ch:8, sec:0},
    {r:"Who may see the data is the owner's call.", why:"Not the analyst who maps it or the admin who can grant it in five minutes.", ch:8, sec:2},
    {r:"A promise counts when it's in the contract with a test.", why:"Best efforts isn't a standard. Compare vendors on total cost over the same multi year period.", ch:7, sec:4},
    {r:"When the date slips, keep the testing.", why:"Trade scope, people, money or the date in the open, and let the sponsor decide.", ch:9, sec:4},
    {r:"\"No clinical impact\" is a claim to check.", why:"On a shared system, a change built for three hospitals reaches all of them unless someone proves otherwise.", ch:9, sec:3},
    {r:"A shared login is the wrong answer, even in an emergency.", why:"Pick individual emergency accounts or break-the-glass with review.", ch:10, sec:1},
    {r:"The legal hold wins.", why:"Until counsel lifts it, nothing tied to the case gets destroyed.", ch:10, sec:4},
    {r:"The breach clock starts at discovery.", why:"Sixty days from when it was known, or should have been, not from the final report.", ch:10, sec:6},
    {r:"Every initiative names the goal it serves.", why:"The IT plan comes from the organization's plan, not from IT's backlog or a vendor's roadmap.", ch:12, sec:0},
    {r:"Common ground before a vote.", why:"In a split meeting, agree on the goal and criteria first. The chair doesn't take a side.", ch:12, sec:4},
    {r:"Treat resistance as information.", why:"Listen, fix the real barrier, use champions, and measure before any mandate.", ch:11, sec:1},
    {r:"Read the qualifier.", why:"FIRST, BEST and MOST change which of two good answers wins. The first step is often to gather facts or involve the owner.", mock:true}
  ],
  contrasts:[
    {topic:"RTO vs. RPO", l:["RTO","RPO"], a:"How fast the system has to be back.", b:"How much data you can lose, counted back from the failure.", ch:8, sec:0},
    {topic:"Business continuity vs. disaster recovery", l:["Continuity","Recovery"], a:"Keeps the work going while the system is down: paper, people, downtime views.", b:"Brings the systems back.", ch:8, sec:0},
    {topic:"Hot vs. warm site", l:["Hot","Warm"], a:"Fully equipped with current data. Minutes to hours.", b:"Partly equipped, restore from backup. Hours to days.", ch:8, sec:1},
    {topic:"Privacy Rule vs. Security Rule", l:["Privacy","Security"], a:"All PHI in any form, uses and disclosures, patient rights.", b:"Electronic PHI only, with administrative, physical and technical safeguards.", ch:2, sec:1},
    {topic:"Law vs. regulation", l:["Law","Regulation"], a:"Passed by Congress or a legislature.", b:"The detailed rule an agency writes to carry it out. It has the force of law.", ch:2, sec:0},
    {topic:"NDA vs. BAA", l:["NDA","BAA"], a:"A bidder sees your network diagrams.", b:"A vendor creates, receives, keeps or sends PHI for you.", ch:7, sec:1},
    {topic:"SOW vs. SLA", l:["SOW","SLA"], a:"What gets delivered, by when, and how it's accepted.", b:"How well a service performs, and what happens when it misses.", ch:7, sec:1},
    {topic:"RFI vs. RFP", l:["RFI","RFP"], a:"You don't know the market yet. Nonbinding.", b:"You know your requirements and want firm offers you can compare.", ch:7, sec:0},
    {topic:"Gift vs. personal conflict", l:["Gift","Personal conflict"], a:"Decline and disclose.", b:"Disclose and step out of scoring that vendor.", ch:7, sec:5},
    {topic:"BID vs. q12h", l:["BID","q12h"], a:"Twice a day at the hospital's standard times.", b:"Every twelve hours by the clock from the first dose.", ch:4, sec:0},
    {topic:"ICD-10-CM vs. ICD-10-PCS", l:["CM","PCS"], a:"Diagnoses.", b:"Inpatient hospital procedures. Physician services are CPT.", ch:3, sec:2},
    {topic:"Structural vs. semantic interoperability", l:["Structural","Semantic"], a:"The receiver can parse the format.", b:"Both sides mean the same thing by the codes, so the data can be used.", ch:3, sec:2},
    {topic:"Commit accept vs. application accept", l:["Commit","Application"], a:"The message arrived and was stored.", b:"The receiver actually processed it.", ch:3, sec:0},
    {topic:"Sensitivity vs. PPV", l:["Sensitivity","PPV"], a:"Of the sick, how many it caught. What a committee looks at.", b:"When it fires, how often it's right. What the nurse lives with.", ch:5, sec:2},
    {topic:"Common vs. special cause", l:["Common","Special"], a:"Normal noise inside the control limits.", b:"Outside the limits or a nonrandom pattern. Investigate.", ch:5, sec:3},
    {topic:"Interruptive vs. passive CDS", l:["Interruptive","Passive"], a:"Stops the user for an answer.", b:"Shown where the user looks, without stopping them.", ch:5, sec:0},
    {topic:"Hard vs. soft stop", l:["Hard stop","Soft stop"], a:"Blocks the action. Only for what must never happen.", b:"Can be overridden with a reason.", ch:5, sec:0},
    {topic:"DMAIC vs. PDCA", l:["DMAIC","PDCA"], a:"Tends to fit a problem whose cause is unclear and has to be found in the data.", b:"Tends to fit a change idea that's ready to test small and safely.", ch:6, sec:2},
    {topic:"Hard vs. soft benefits", l:["Hard","Soft"], a:"Cash you can trace, like a license you stop paying.", b:"Real but hard to price. Report it as a measured outcome, not borrowed dollars.", ch:6, sec:4},
    {topic:"Data owner vs. data steward", l:["Owner","Steward"], a:"The business leader accountable for the data. Decides use and quality.", b:"Keeps definitions and quality right day to day for the owner.", ch:8, sec:2},
    {topic:"Duplicate vs. overlay", l:["Duplicate","Overlay"], a:"One person split across two records.", b:"Two people merged into one record. Worse.", ch:8, sec:2},
    {topic:"Load vs. stress test", l:["Load","Stress"], a:"Runs the expected peak to find where it slows.", b:"Goes past the peak to find where it breaks.", ch:9, sec:0},
    {topic:"Unit vs. integrated test", l:["Unit","Integrated"], a:"One piece by itself, usually by its builder.", b:"Real workflows across systems, where migration defects tend to live.", ch:9, sec:0},
    {topic:"Incident vs. problem", l:["Incident","Problem"], a:"One interruption. Restore service.", b:"The cause behind repeated incidents. Find the root cause.", ch:11, sec:2},
    {topic:"Percent change vs. percentage points", l:["Percent change","Points"], a:"(New minus baseline) / baseline.", b:"The plain difference between two percentages.", ch:11, sec:4},
    {topic:"Mission vs. vision", l:["Mission","Vision"], a:"Why the organization exists.", b:"Where it wants to be.", ch:12, sec:0},
    {topic:"Policy vs. procedure", l:["Policy","Procedure"], a:"What and why. Governance signs off on it.", b:"How, step by step.", ch:12, sec:3},
    {topic:"Mitigate vs. transfer", l:["Mitigate","Transfer"], a:"Lower the likelihood or the impact with a control.", b:"Shift part of the money, like insurance. The incident is still yours.", ch:10, sec:3},
    {topic:"Query vs. directed exchange", l:["Query","Directed"], a:"Search the HIE for records you don't know exist, like an ED with an unconscious patient.", b:"Push a document to a known recipient, like a consult note to the patient's own doctor.", ch:1, sec:1},
    {topic:"Store and forward vs. remote monitoring", l:["Store and forward","Remote monitoring"], a:"An image or study sent now and read later.", b:"Home readings like weight or blood pressure sent to the care team.", ch:8, sec:3},
    {topic:"Program vs. portfolio", l:["Program","Portfolio"], a:"Related projects run together for shared benefits.", b:"Every project and program, related or not, ranked against strategy.", ch:9, sec:4},
    {topic:"Indemnification vs. limitation of liability", l:["Indemnification","Limitation of liability"], a:"The vendor covers you if someone sues over its product.", b:"Caps what each side can owe.", ch:7, sec:4}
  ],
  day:[
    {r:"The day before: check your confirmation and your IDs.", why:"Bring the Pearson VUE confirmation. You need two IDs: a current government photo ID with your signature, and a second with your name and signature. Both names have to match your registration. No temporary IDs.", mock:true},
    {r:"The day before: do the math once, by hand.", why:"Census, a two by two, NPV, ALE, allowed downtime and percent change. At a test center there's an on screen calculator and one sheet of scratch paper, and you can't bring your own calculator. OnVUE has its own rules.", ch:5, sec:2},
    {r:"The day before: read the contrasts out loud.", why:"Pairs that sound alike are the easiest points to drop. No new material tonight.", mock:true},
    {r:"The day before: say who owns what.", why:"Data owner, steward and custodian, then the system owner, CISO and privacy officer. Many questions come down to who should decide.", ch:8, sec:2},
    {r:"The morning of: get to the test center 30 minutes early.", why:"More than 15 minutes late and you won't be let in. Personal belongings stay out of the room, so leave most of them at home.", mock:true},
    {r:"In the room: answer everything.", why:"There's no penalty for guessing. Skip or flag the slow ones and come back. The pretest items look like the rest, so treat each one as scored.", mock:true},
    {r:"In the room: about a minute a question.", why:"Two hours for 115 is just over a minute each. Check once at the halfway mark, around question 58 with about an hour left.", mock:true},
    {r:"In the room: when two answers look right, pick the one for the patient.", why:"The best answer usually fixes the cause, involves the owner and keeps patients safe, over the quick fix or the punishment.", ch:4, sec:1},
    {r:"After: pass or fail is on the screen.", why:"The score report, through Pearson's portal, adds a bar for each domain. If it's a fail, the bars tell you where to study for the retake in 60 days.", mock:true}
  ]
};
