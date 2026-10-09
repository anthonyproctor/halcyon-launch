# The Cascade Chair: CPHIMS Course bible

Read this whole file before writing anything. Also read `../../full/BIBLE.md` (the PMP bible: voice, answer-length rules, flags, prop formats, `data-who` speaker tags, file format) and `../../full/ch01.js` (object shape and voice). This course reuses that engine and those rules exactly, with the changes below. It lives in the same universe as the Halcyon PMP course, but it is its own continuity: don't assume any optional choice from the PMP course happened.

## Goal
A 13 to 16 hour story-driven CPHIMS course. Each chapter takes about 60 to 75 minutes: a story you can't put down, a lesson that actually teaches, 12 decisions, drills where the outline is math or analysis, an exercise, and a 15-question exam-style quiz. A reader who finishes, plus the two mock exams, should be ready for the HIMSS CPHIMS exam on the current outline.

## The exam (HIMSS CPHIMS Candidate Handbook, 2025). Every chapter maps to these 71 tasks.
Sources (check before you change any number here):
- Official 2025 Candidate Handbook (outline, format, eligibility, passing score method): https://dakotas.himss.org/sites/hde/files/media/file/2025/01/14/cphims-handbook.pdf
- Official CPHIMS page (eligibility, exam summary): https://www.himss.org/certifications/cphims/
- Third party study guide (cross-check only, not authority): https://open-exam-prep.com/study-guides/cphims/introduction/study-strategy

**Format.** The 2025 handbook says the exam is 100 multiple-choice questions, a score based on 100 of them, two hours. The HIMSS certification page and third party guides describe 115 questions with 100 scored (15 unscored pretest items). Treat 100 scored questions in two hours as fixed; the mocks below cover both counts. Each question has four options. Questions sit at three cognitive levels: Recall (RE), Application (AP), and Analysis (AN). The handbook doesn't publish a count per level.
**Passing score.** Set by the Angoff method and equated across forms. Don't quote a passing number in the course; the handbook doesn't give one. Retakes: wait 60 days.
**Eligibility (any one).** Bachelor's degree plus 5 years of information and management systems experience, 3 of them in a healthcare setting. Graduate degree plus 3 years, 2 in healthcare. Or 10 years, 8 in healthcare. Qualifying work: systems analysis, design, selection, implementation, support and maintenance, testing and evaluation, privacy and security, information systems, clinical informatics, management engineering. A healthcare setting includes providers, vendors, consulting firms, payers, government, academic, and public health.
**Never quote a HIMSS price** (exam, membership, review guide, retake, extension). If a character mentions cost, keep it vague ("the fee").

**Healthcare and Technology Environments (25%)**: E1 Types of healthcare organizations and their services (hospitals, clinics, ambulatory, community health, payers, regulators, research and academic) · E2 Interrelationships within and across organizations (HIE, public and private, continuity of care) · E3 Roles and responsibilities of HIMS professionals · E4 Laws, regulations, and accreditation (privacy, safety, security, pharmacy, environment of care, patient rights) · E5 Technology trends that improve outcomes (telemedicine, portals, wearables, population health) · E6 Healthcare applications (clinical, administrative, financial, consumer, business intelligence) · E7 Technology infrastructure (network, communications, data integration, privacy and security)
**Clinical Informatics (20%)**: C1 Clinical vocabulary (dose frequency, routes, body systems) · C2 Healthcare IT vocabulary · C3 Clinical metrics (average daily census, turnaround time, adherence, BCMA) · C4 System functionality that optimizes clinical effectiveness · C5 Interpret outcomes with analytics (reports, tables, graphs, charts, predictive models) · C6 Mechanisms for ongoing clinical content and decision support
**Healthcare Information and Systems Management (30%)**:
- Analysis: SA1 SDLC · SA2 Project management methodology (needs analysis, gap analysis, requirements) · SA3 Process improvement (DMAIC, PDCA) · SA4 Visualization tools (process maps, flow diagrams, gap analysis) · SA5 Interpret disparate data sets · SA6 Alternate processes and solutions · SA7 Strategic alignment · SA8 Cost-benefit analysis · SA9 Proposals with benefits realization plans · SA10 Business documents (RFP, RFI, SLA, SOW, NDA)
- Design: SB1 Interoperability of software, hardware, network, and medical devices · SB2 Standards compliance · SB3 Process to incorporate trends · SB4 Infrastructure for business continuity and disaster recovery · SB5 Evaluate emerging technologies · SB6 Data governance
- Selection, implementation, support, maintenance: SC1 Solution selection (stakeholders, demos, site visits, references) · SC2 Technical change management · SC3 Training and support (CBL, classroom, train the trainer, at-the-elbow superusers) · SC4 Implement while managing scope, schedule, budget, quality · SC5 Maintain systems (operate, upgrade) · SC6 Analyze problems and trends (error reports, help desk logs, surveys, metrics, network monitoring)
- Testing and evaluation: SD1 Formal testing (unit, integrated, stress, acceptance) · SD2 Internal controls during testing (security audits, versioning, change control) · SD3 Validate against contract and design specs · SD4 Benefits achieved and metrics (ROI, benchmarks, user satisfaction)
- Privacy and security: SE1 Policies and procedures (confidentiality, privacy, security, availability, integrity) · SE2 Assess and mitigate vulnerabilities · SE3 User access controls · SE4 Physical, technical, and administrative controls (servers, unattended computers, two-factor) · SE5 Roles for managing vulnerabilities · SE6 Data management controls (ownership, criticality, levels, retention and destruction, access) · SE7 Ongoing validation of security features
**Management and Leadership (25%)**: L1 Strategic planning · L2 Organizational environment (culture, values) · L3 Forecast technical and information needs · L4 IT strategic plan · L5 Evaluate performance (SLAs, KPIs) · L6 Effectiveness and user satisfaction · L7 Promote stakeholder understanding (resources, budget, prioritization) · L8 Policies and procedures · L9 Legal and regulatory compliance · L10 Ethical business principles · L11 Comparative analytics (benchmarks) · L12 Business communications · L13 Facilitate meetings (consensus, conflict) · L14 Consultative services · L15 Educational strategies · L16 Maintain IT competencies · L17 Risk management · L18 Ethical relationships with stakeholders (clinicians, vendors) · L19 Present data and recommendations · L20 Organizational change management · L21 Roles and job descriptions · L22 Staff competency · L23 Projects and portfolios · L24 Vendor contracts (cost, schedule, support, maintenance, performance) · L25 Budget and financial risks

Domain names for scene and quiz `domain` fields, exactly: `Environments`, `Clinical Informatics`, `Systems Management`, `Leadership`.

## Answer quality rules (non negotiable)
- HIMSS mindset: patient safety first, always. Assess and analyze before acting. Engage clinicians before you build, not after. Work through governance (the clinical informatics council, the change advisory board, data governance) instead of around it. The data owner decides, IT is the custodian. Least privilege and need to know. Standards before custom code. Follow the law and the policy, and when they're silent, choose the ethical option. Report and escalate privacy and safety events to the person who owns them (privacy officer, patient safety, CISO); never hide one. Downtime procedures exist before go-live, not during the outage. Measure against a baseline.
- Four options per decision and per quiz question. All four answer texts within about 10 percent of each other in length. The correct answer is the longest in at most 3 of every 10 items and the shortest in at least 3. Distractors are plausible things real health IT leaders do.
- Math must compute exactly. Show the formula and the worked steps in the solution.
- Real laws and bodies may be named in lessons and quiz items at the level the exam tests (HIPAA Privacy and Security Rules, HITECH, the 21st Century Cures Act information blocking provisions, EMTALA, CMS Conditions of Participation, 42 CFR Part 2, Joint Commission as an accreditor, FDA oversight of software as a medical device, ONC certification, TEFCA). Don't quote section numbers, fine amounts, or dates unless you verified them against the primary source this session. Story events involving them stay fictional: no real enforcement actions, no real companies' incidents, no state AI laws.
- No em or en dashes anywhere (use commas, periods, "to"). No AI tells ("delve", "tapestry", "it's worth noting", "not X but Y", "in today's fast paced"). Contractions. Plain words. Dialogue in `<span class="said" data-who="Name">"..."</span>`. Use backtick template strings in JS.

## Cast and arcs (give every chapter at least one character moment)
Speaker tags (`data-who`) use these first names only, plus `man` and `woman` for walk-ons: Maria, Raymond, Kiran, Marcus, Aisha, Joan, Brett, Walt, Tasha, Glenn, Nate, Denise, Lucia, Sam, Ruth.
- **Maria Santos** (the lead, you). 44. Ex-ICU nurse, 14 years at the bedside in Greeley, then nurse informatics director and the product owner on the Halcyon launch. Now Vice President of Clinical Systems, reporting to Ochoa, owning the EHR, clinical applications, interfaces, and the analyst team across 11 hospitals. Fierce about patient safety, fast, used to fixing things herself at 2 AM. Arc: from the nurse who fixes it to the leader who builds the system that fixes it; learns that governance, data, and saying no to clinicians she loves are also patient safety. Private thread: when she was a new nurse, a transfer patient from a small Wyoming hospital arrived with a faxed med list missing a page, and she caught the anticoagulant dose only by luck. She tells it in pieces (hinted ch3, partial ch7, full ch11). Daughter **Lucia**, 17, is applying to nursing school and asks the questions Maria avoids.
- **Dr. Raymond Ochoa**. CIO, Cascade Valley Health. Mentor and foil. Skeptical, fair, wants the truth early, blunt about money. Pushes Maria to think like an executive and sometimes pushes too hard (he'd cut the training budget to protect the go-live date). Hides that he plans to retire. Arc: from testing her to trusting her; in ch12 he tells the board she should be interim CIO. His `why` debriefs carry the course.
- **Kiran Bhatt**. Senior EHR analyst, ex-pharmacy technician, builds order sets and med workflows. Perfectionist who never says no and never says "I'm drowning." Arc: burns out in ch6 and ch9, gets a real role description in ch12 leading the superuser and content program.
- **Marcus Bell**. Interface engineer, 22 years of HL7 v2, owns the interface engine nobody else understands. Grumpy, funny, a single point of failure who hoards knowledge because it's the only job security he trusts. Arc: from gatekeeper to teacher; he trains two junior analysts by ch10 and runs the FHIR work in ch8.
- **Dr. Aisha Rahman**. Chief Medical Information Officer, hospitalist. Brilliant, data-driven, wants an alert for every risk. Ally to Maria and occasional rival for the same budget. Arc: learns alert fatigue the hard way in ch5; becomes the voice for clinical decision support governance.
- **Joan Whitfield**. Privacy officer. Precise, unflappable, not anti-technology, allergic to surprises. Arc: from the person Maria forgets to call to the person she calls first.
- **Nate Ostrowski**. CISO, former Army signal officer. Calm in a crisis, impatient with clinicians who share logins. Leads the ch10 response with Maria.
- **Brett Kessler**. Account executive for Corvane, the EHR vendor. Charming, generous with dinners and suite tickets, under quota pressure. Arc: tests Maria's ethics in ch7; after Corvane misses an SLA in ch11 he's the one who tells her the truth before his company does.
- **Dr. Walt Hagen**. General surgeon at the Laramie hospital, 31 years in practice, prints every note, counts clicks out loud. The skeptic. Arc: he's right about something important in ch4, gets ignored or heard depending on the player, and by ch11 he's an at-the-elbow champion on his own floor.
- **Tasha Greene**. Service desk manager. Lives in ticket data, sees every problem a week before anyone else. Arc: Maria learns to read Tasha's trend reports as early warning (ch9, ch11).
- **Glenn Morrow**. CFO. Not hostile, just allergic to soft numbers. Wants NPV, not adjectives.
- **Denise Harmon** (cameo). Nurse manager at Cheyenne, the resistor turned champion from the Halcyon launch. Appears in ch4 and ch11 as a superuser and a straight talker.
- **Sam Okafor** (cameo). Director of Delivery at Halcyon AI. Appears in ch1 (the phase two discharge instructions agents are part of Maria's portfolio) and ch8 (he puts Maria in touch with Ruth). He never rescues her.
- **Ruth Calder** (cameo). Retired NASA flight director, Halcyon board member. One coffee in ch8 about contingency and disaster recovery ("you test the abort before you need it"), one note in ch12. Her 1991 loss can be referenced in one line, never retold.

## Fixed facts
- Cascade Valley Health: 11 hospitals in Colorado and Wyoming (including Fort Collins, Greeley, and Cheyenne), plus about 40 clinics and a home health agency. Owned health plan: none. Cascade participates in a regional health information exchange.
- Halcyon AI's clinical documentation agents went live at all 11 hospitals in the PMP story. This course starts eight months after that go-live. Clinicians use them; they're stable; discharge instructions agents are now Cascade's phase two project.
- **Corvane** is Cascade's system-wide EHR (fictional) at 8 hospitals. Three Wyoming hospitals (Cheyenne, Laramie, Rawlins) still run **MedaLink**, a legacy EHR (fictional) from an old affiliation; MedaLink's vendor has announced end of support in 20 months. That migration, "One Chart," is the spine of the course.
- **Relay** is the interface engine (fictional). Marcus built most of it.
- Ochoa holds a weekly 30-minute one-on-one with Maria (Tuesdays, 7:30 AM) and expects a one-page status before it.
- The Clinical Informatics Council (Aisha chairs, Maria co-chairs) owns clinical content and decision support. The Change Advisory Board meets Thursdays.
- Never cite real companies' internal events or real vendors by name for story events. Product names in the story are fictional.

## Chapter plan (num, title, timeframe, required content, tasks, ending)
Domain scene counts are per chapter (12 scenes). Across the course they total Environments 36, Clinical Informatics 29, Systems Management 43, Leadership 36, which is 25 / 20 / 30 / 25 percent. Hold to these counts.

**Part One: The Inheritance**
1. **The Corner Office** (month 1). [E6 C0 S2 L4] Maria accepts the VP role; the MedaLink end-of-support letter lands on day one. Types of healthcare organizations and how Cascade's hospitals, clinics, home health, the HIE, payers, and regulators fit together; roles of HIMS professionals (CIO, CMIO, CNIO, CISO, privacy officer, analysts); application families (clinical, administrative, financial, consumer, BI); strategic alignment of One Chart to the system plan; Maria's first all-hands and first meeting with Walt. Sam cameo about phase two. No drill. Exercise: match the role to the responsibility. Tasks: E1, E2, E3, E6, SA7, L1, L2, L12. Ends: Marcus calls at 11:40 PM, the lab results interface to Laramie stopped three hours ago and nobody noticed.
2. **The Rulebook** (months 1 to 2). [E7 C1 S1 L3] The interface outage's fallout meets an unannounced accreditation survey at Greeley. Laws and accreditation (HIPAA Privacy and Security Rules, HITECH, information blocking, EMTALA, Conditions of Participation, 42 CFR Part 2, pharmacy and environment of care, patient rights); HIE consent and continuity of care; payers; who is accountable for what; Joan's first scene. No drill. Exercise: which rule or body governs this situation. Tasks: E4, E2, E1, E3, C2, SE1, L9, L8, L10. Ends: the survey passes with one finding, and the finding is about the downtime procedures Maria owns.
3. **The Plumbing** (months 2 to 3). [E6 C1 S4 L1] Root cause of the Laramie outage. Infrastructure (network, communications, interface engines, data integration); interoperability of software, hardware, network, and medical devices (infusion pumps, monitors); standards (HL7 v2, CDA, FHIR, DICOM, X12, NCPDP, SNOMED CT, LOINC, ICD-10, RxNorm, CPT); network monitoring; Marcus as the single point of failure. Maria's first hint about the faxed med list. Drill: interface error rate and backlog clearance time. Tasks: E7, E6, SB1, SB2, SC6, C2, L22. Ends: Aisha asks for a sepsis alert across all 11 hospitals by spring; Walt files a formal complaint about click counts.

**Part Two: The Floor**
4. **The Floor** (months 3 to 4). [E2 C8 S1 L1] Maria does a week of rounding at Laramie and Cheyenne. Clinical vocabulary (dose frequency like q6h, BID, PRN; routes like PO, IV, SubQ; body systems); clinical metrics (average daily census, length of stay, turnaround time, order to administration, BCMA scan compliance, adherence); system functionality that helps or hurts (order sets, BCMA, eMAR, CPOE); Walt is right that a MedaLink workaround is hiding missed scans. Denise cameo. Drills: average daily census; BCMA scan compliance rate. Tasks: C1, C3, C4, C2, E6, E5, SA4, L6. Ends: the BCMA numbers at Rawlins are worse than anyone reported, and they've been worse for a year.
5. **The Alert** (months 4 to 5). [E1 C9 S1 L1] Aisha's sepsis alert goes live in a pilot. Clinical decision support (five rights of CDS, interruptive vs passive alerts, alert fatigue, override rates); interpreting outcomes with analytics (run charts, control charts, 2x2 tables, sensitivity, specificity, PPV, predictive models and their drift); ongoing content governance; a nurse overrides the alert on a patient who is septic. Drills: sensitivity, specificity, and PPV from a 2x2 table; alert override rate. Tasks: C5, C6, C4, C3, SA5, E5, L13. Ends: Ochoa says the board wants the One Chart business case in 30 days, with real numbers.

**Part Three: One Chart**
6. **The Business Case** (months 5 to 6). [E1 C2 S7 L2] Building the case to move the Wyoming hospitals onto Corvane. SDLC; needs analysis, gap analysis, and requirements; current and future state process maps; DMAIC vs PDCA; interpreting disparate data sets; alternatives (stay, replace, extend MedaLink support); cost-benefit analysis; a proposal with a benefits realization plan; Glenn's questions. Kiran starts missing lunch. Drills: NPV of the migration; payback period and ROI. Tasks: SA1, SA2, SA3, SA4, SA6, SA8, SA9, C5, L19, L25. Ends: the board approves, and asks Maria to bid the implementation services and the integration tools.
7. **The Selection** (months 6 to 7). [E1 C1 S6 L4] Selecting implementation partners and a FHIR integration platform. RFI vs RFP; demos with scripted scenarios; site visits; references; SOW, SLA, NDA; vendor contract terms (cost, schedule, support, maintenance, performance, exit); ethics with vendors (Brett's suite tickets and a dinner invitation); a stakeholder selection committee where Walt has a vote. Maria tells part of the fax story to the committee. Drill: weighted scoring matrix; five-year total cost of ownership. Exercise: which document do you need (RFI, RFP, SOW, SLA, NDA, BAA). Tasks: SA10, SC1, L24, L18, L10, SD3, E3, C4. Ends: the contract is signed, and Nate's first architecture review finds the vendor's cloud environment has no tested recovery plan.
8. **The Blueprint** (months 7 to 9). [E4 C1 S6 L1] Designing One Chart. Business continuity and disaster recovery (RTO, RPO, hot, warm, cold sites, downtime procedures, read-only downtime views); data governance (stewards, owners, data dictionary, master patient index and duplicate records); process to incorporate trends and evaluate emerging technology (FHIR APIs, patient portal, remote monitoring for Wyoming's rural patients, telehealth); infrastructure and medical device integration. Ruth coffee via Sam. Marcus starts teaching. Drill: availability percentage to downtime minutes; pick the backup design that meets the RTO and RPO. Tasks: SB4, SB6, SB3, SB5, SB1, E5, E7, E6, C6, L3. Ends: the build starts, and the first integrated test fails 31 of 120 scripts.
9. **The Build** (months 9 to 12). [E1 C2 S7 L2] Building and testing. Formal testing (unit, system, integrated, regression, stress or volume, user acceptance); internal controls during testing (versioning, change control, segregation of duties, security testing); validating against contract and design specs; technical change management and the change advisory board; managing scope, schedule, budget, and quality; Kiran hits the wall; Tasha's tickets from the Corvane hospitals show a pattern. Drill: test pass rate and defect density by build. Exercise: name the test type. Tasks: SD1, SD2, SD3, SC2, SC4, SC6, C4, C6, E7, L22, L23. Ends: three weeks before go-live, a clinic in Rawlins gets a ransomware note.

**Part Four: The Chair**
10. **The Lock** (months 12 to 13). [E3 C0 S6 L3] Ransomware at a Wyoming clinic. Privacy and security policies (confidentiality, integrity, availability); vulnerability assessment and mitigation; user access controls (role-based access, least privilege, break-the-glass, termination of access); physical, technical, and administrative controls (unattended workstations, two-factor, encryption); roles in vulnerability management; data management controls (ownership, criticality, classification, retention and destruction); ongoing validation (access reviews, audit logs, penetration tests by others); breach assessment with Joan and the incident response plan with Nate; risk management. Drills: annualized loss expectancy (SLE = asset value x exposure factor, ALE = SLE x ARO); likelihood x impact risk score. Tasks: SE1, SE2, SE3, SE4, SE5, SE6, SE7, E4, E7, L17, L9, L12. Ends: the clinic is restored from clean backups, One Chart go-live holds its date, and Joan tells Maria she was the first call this time (or, if `skippedprivacy` is set, the second).
11. **Go-Live** (months 13 to 15). [E2 C3 S2 L5] One Chart goes live at Cheyenne, Laramie, and Rawlins. Training and support (computer-based learning, classroom, train the trainer, at-the-elbow superusers); organizational change management; command center; system maintenance and the first upgrade; problem and trend analysis from help desk logs and surveys; benefits realization against the baseline (BCMA compliance, turnaround time, documentation time, user satisfaction); Corvane misses an SLA and Brett tells the truth; Walt on the floor in a superuser vest; Maria's full fax story, told to Lucia. Drills: tickets per 100 users and first-contact resolution rate; percent change in BCMA compliance from baseline. Exercise: pick the training method. Tasks: SC3, SC5, SC6, SD4, C3, C5, E5, E2, L20, L15, L6, L5, L14. Ends: Ochoa asks Maria to present the three-year IT strategic plan to the board, and won't say why it has to be her.
12. **The Next Chair** (months 16 to 18). [E2 C1 S0 L9] The strategic plan and the board. Strategic planning and the IT strategic plan; forecasting technical and information needs; portfolio management and prioritization; KPIs, SLAs, and benchmarks; budget and financial risk; policies and procedures; roles, job descriptions, and staff competency (Kiran's new role, Marcus's succession plan); maintaining IT competencies (certification, CPHIMS named in story only in passing); facilitating a board session through conflict between Aisha and Glenn; ethics in a hard recommendation; Ochoa's retirement. Ruth sends one note. Drills: operating budget variance; KPI against benchmark. Tasks: L1, L4, L3, L23, L5, L11, L25, L7, L8, L21, L16, L13, L19, E1, E3, C5. Ends: the board names Maria interim CIO; the last scene mirrors chapter 1 (a letter on her first day, this time from a Rawlins nurse).

## Coverage table (every task, where it's taught)
Each task appears as a scene `task` in at least one chapter listed and in at least two quiz items across the course.
| Domain | Task | Chapters |
|---|---|---|
| Environments | E1 | 1, 2, 12 |
| | E2 | 1, 2, 4, 11 |
| | E3 | 1, 2, 7, 12 |
| | E4 | 2, 10 |
| | E5 | 4, 5, 8, 11 |
| | E6 | 1, 3, 4, 8 |
| | E7 | 3, 8, 9, 10 |
| Clinical Informatics | C1 | 4 |
| | C2 | 2, 3, 4 |
| | C3 | 4, 5, 11 |
| | C4 | 4, 5, 7, 9 |
| | C5 | 5, 6, 11, 12 |
| | C6 | 5, 8, 9 |
| Systems Management | SA1 | 6 |
| | SA2 | 6 |
| | SA3 | 6 |
| | SA4 | 4, 6 |
| | SA5 | 5 |
| | SA6 | 6 |
| | SA7 | 1 |
| | SA8 | 6 |
| | SA9 | 6 |
| | SA10 | 7 |
| | SB1 | 3, 8 |
| | SB2 | 3 |
| | SB3 | 8 |
| | SB4 | 8 |
| | SB5 | 8 |
| | SB6 | 8 |
| | SC1 | 7 |
| | SC2 | 9 |
| | SC3 | 11 |
| | SC4 | 9 |
| | SC5 | 11 |
| | SC6 | 3, 9, 11 |
| | SD1 | 9 |
| | SD2 | 9 |
| | SD3 | 7, 9 |
| | SD4 | 11 |
| | SE1 | 2, 10 |
| | SE2 to SE7 | 10 |
| Leadership | L1 | 1, 12 |
| | L2 | 1 |
| | L3 | 8, 12 |
| | L4 | 12 |
| | L5 | 11, 12 |
| | L6 | 4, 11 |
| | L7 | 12 |
| | L8 | 2, 12 |
| | L9 | 2, 10 |
| | L10 | 2, 7 |
| | L11 | 12 |
| | L12 | 1, 10 |
| | L13 | 5, 12 |
| | L14 | 11 |
| | L15 | 11 |
| | L16 | 12 |
| | L17 | 10 |
| | L18 | 7 |
| | L19 | 6, 12 |
| | L20 | 11 |
| | L21 | 12 |
| | L22 | 3, 9 |
| | L23 | 9, 12 |
| | L24 | 7 |
| | L25 | 6, 12 |
Quizzes: each chapter's 15 items lean toward its scene mix, but every quiz carries at least two items from a domain the chapter isn't about (spaced review). Course totals across 180 quiz items: Environments 45, Clinical Informatics 36, Systems Management 54, Leadership 45. Add `level:"RE"|"AP"|"AN"` to every quiz item; aim for about 20 percent RE, 45 percent AP, 35 percent AN (a course target, not an official split).

## Drills (exact numbers, worked solutions)
Drills use the PMP `drills` shape. Every number must compute exactly; round only where the field says so and set `tol` to match.
- ch3: interface error rate = rejected messages / total messages; backlog clearance time = queued messages / (processing rate minus arrival rate).
- ch4: average daily census = total inpatient days in the period / days in the period; BCMA scan compliance = scanned administrations / total administrations.
- ch5: sensitivity = TP / (TP + FN); specificity = TN / (TN + FP); PPV = TP / (TP + FP); override rate = overridden alerts / alerts fired.
- ch6: NPV = sum of net cash flow / (1 + r)^t minus initial cost; payback period; ROI = (total benefits minus total costs) / total costs.
- ch7: weighted score = sum of weight x rating; five-year TCO = license + implementation + annual support x 5 + internal labor.
- ch8: allowed downtime = (1 minus availability) x minutes in the period (99.9 percent of a 30-day month is 43.2 minutes); match backup design to RTO and RPO.
- ch9: test pass rate = passed / executed; defect density = defects / test scripts (or per function point, state which).
- ch10: SLE = asset value x exposure factor; ALE = SLE x ARO; risk score = likelihood x impact on a 1 to 5 scale.
- ch11: tickets per 100 users; first-contact resolution = resolved on first contact / total tickets; percent change = (new minus baseline) / baseline.
- ch12: budget variance = budget minus actual (and percent); KPI gap to benchmark.

## Cross-chapter flags (your choices follow you)
Set via an option's `flag:"name"` on one clearly wrong option (s:0 or s:1) in the setting chapter. Read with `(s.flags.X||G.X)` in the setting chapter and `G.X` in later ones. A flag changes a sentence, a reaction, or an outcome line, never the canonical plot. Use only these names, only in these chapters:
| flag | set in | meaning | read in |
|---|---|---|---|
| `solofix` | ch1 | Maria fixed the interface herself at midnight and skipped change control | ch3, ch9 |
| `skippedprivacy` | ch2 | didn't bring Joan in on the HIE consent question | ch7, ch10 |
| `blamedmarcus` | ch3 | blamed Marcus for the outage in front of the team | ch8, ch12 |
| `dismissedwalt` | ch4 | brushed off Walt's complaint about the BCMA workaround | ch7, ch11 |
| `allalerts` | ch5 | turned on every alert Aisha asked for, no governance | ch9, ch11 |
| `softroi` | ch6 | rounded the benefits up to get the business case through | ch11, ch12 |
| `tookthetickets` | ch7 | accepted Brett's suite tickets during the selection | ch10, ch12 |
| `nodrtest` | ch8 | approved the recovery design without a failover test | ch10 |
| `skippedregression` | ch9 | cut regression testing to hold the date | ch11 |
| `sharedlogin` | ch10 | let the ED use a shared login during the incident | ch11, ch12 |

## Story props (1 to 3 per chapter, where the story has an artifact)
Same prop formats as the PMP bible (`email`, `chat`, `text`, `doc`, `chart`). Suggested props:
- ch1: email from the MedaLink vendor, "End of support notice"; chat from Marcus at 11:40 PM.
- ch2: doc, the survey finding on downtime procedures; text from Joan.
- ch3: chart `kind="bars"`, Relay queue depth by hour; doc, an HL7 ADT message snippet in plain words.
- ch4: chart `kind="bars"`, BCMA compliance by hospital; text from Lucia.
- ch5: doc, the sepsis alert firing rules; chart `kind="bars"`, override rate by unit.
- ch6: doc, the one-page business case Glenn sees.
- ch7: email from Brett, "Broncos Sunday?"; doc, the scoring matrix summary.
- ch8: doc, RTO and RPO table; chat from Sam introducing Ruth.
- ch9: chart `kind="bars"`, test pass rate by build; chat from Tasha at 6:05 AM.
- ch10: doc, the ransom note as the clinic manager read it to Nate (no real group names); email from Joan, "Breach risk assessment"; text from Nate.
- ch11: chart `kind="bars"`, tickets per day of hypercare; text from Walt.
- ch12: doc, the strategic plan's one-page summary; email from Ruth; letter from a Rawlins nurse as a `doc`.
Keep them short. The narrator reads prop text, so it must read naturally aloud. No dashes.

## Lesson and debrief voice
Lessons are **"Ochoa's Legal Pad"**: 700 to 1100 words, Ochoa explaining at his whiteboard or over breakfast at the Greeley diner, plain and blunt, with terms and an `exam` note on how HIMSS asks it. Option `why` text is Ochoa's debrief in his voice. In ch8 Ruth writes the lesson's final section; in ch12 Ochoa's last lesson ends with Ruth's note. Every lesson gets one vetted video (checked live with the oembed endpoint, ideally under 15 minutes).

## File format
`courses/cphims/full/chNN.js` (two digits), the same object shape as the PMP Full Course (`(window.HALCYON_FULL=window.HALCYON_FULL||[]).push({...})`; the engine swaps data per course). Changes from the PMP shape:
- `part`: one of `Part One: The Inheritance`, `Part Two: The Floor`, `Part Three: One Chart`, `Part Four: The Chair`. `weeks` holds the timeframe string ("Months 3 to 4").
- `tasks` and every scene and quiz `task` use the codes above; `domain` uses the four names above.
- 12 scenes, ids `f{N}s1` to `f{N}s12`. Exactly one best (s:3) per scene, at least one partial.
- Quiz: 15 items, four options, `a` 0 to 3, no position more than 6 of 15, plus `level`.
- `episode:{src:\`audio/full-chNN.mp3\`, len:\`about 35 minutes\`}`, path relative to `courses/cphims/`. `next` is the next title; omit on ch12.
- Cast file `courses/cphims/full/cast.js`; mocks in `courses/cphims/mock/`.

## Mock exam plan
Two full mocks, `courses/cphims/mock/mock1.js` and `mock2.js`, built after all 12 chapters pass checks. New items only, never copied from chapter quizzes.
- **Format:** 115 items, 120-minute timer, four options each, matching the HIMSS page. 100 are scored and 15 are unscored pretest items (`scored:false`), mixed in and not shown as unscored to the reader until the score report. A "handbook mode" toggle runs only the 100 scored items in 120 minutes, matching the 2025 handbook.
- **Domain mix of the 100 scored items:** Environments 25, Clinical Informatics 20, Systems Management 30, Leadership 25. The 15 pretest items: 4, 3, 4, 4.
- **Systems Management split of the 30:** Analysis 9, Design 6, Selection and implementation 6, Testing 4, Privacy and security 5 (follows the outline's task counts; a course choice, not an official split).
- **Cognitive mix:** about 20 RE, 45 AP, 35 AN of the 100 scored.
- **Coverage:** every one of the 71 tasks appears at least once across the two mocks; no task more than 4 times in one mock. Correct answer positions spread so none exceeds 30 percent.
- **Item shape:** `{q, opts:[4], a, why, task, domain, level, scored}`. Short scenarios set in Cascade or a fictional sister system; stems answerable without having read the story.
- **Score report:** percent by domain and by Systems Management subdomain, with the chapter to reread for each weak area. No pass or fail line, since HIMSS doesn't publish one.

## Validation
Run `node tools/check_full.mjs courses/cphims/full/chNN.js` (with the CPHIMS task code list) and `node tools/check_speakers.mjs` from the repo root; both must exit 0. Run the AI detector on a dump of the prose and keep every chunk under 30 percent. Grep every file for em and en dashes before calling it done.
