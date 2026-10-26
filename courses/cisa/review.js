// Exception Noted (CISA) exam week review (2026-10-25): one on screen page for the last days before the exam. Never narrated.
// Loaded from the cisa scripts list in courses.js. engine.js (renderReview, route #cisa/review, the button in the home page's Practice exam
// card) reads window.HALCYON_REVIEW.cisa; its header explains sections and kinds.
// Shape: intro [paragraphs]; sections [[id, title, kind]]; domains and sampling [{group, note?, items:[{name, where?, d, ch, sec}]}]
// (kind list); terms [{group, items:[{t, d, ch, sec}]}]; rules [{r, why, ch, sec}]; contrasts [{topic, l:[left label, right label], a, b, ch, sec}].
// ch and sec point at where the book teaches it: Full Course chapter ch, Dot's Workpapers (the lesson), section index sec (0 based, in the
// order of courses/cisa/full/chNN.js lesson.sections). mock:true instead of ch means only the practice exam teaches it.
// Sources: the lessons, quizzes and explanations in courses/cisa/full/ch01.js to ch12.js and courses/cisa/mock.js, ISACA's CISA Exam
// Content Outline effective August 2024 (domains at 18, 18, 12, 26 and 26 percent) and Exam Candidate Guide v1.26 (150 questions,
// 240 minutes, 200 to 800 scale, 450 passes), and the coverage audit of 2026-10-25 (halcyon-private).
// Every line is in our own words. ISACA's outline, review manual, glossary and ITAF text are theirs: never paste them here. ITAF standards
// are named by topic, never by number. Copy rules: plain words, contractions, no dashes.
window.HALCYON_REVIEW=window.HALCYON_REVIEW||{};
window.HALCYON_REVIEW.cisa={
  intro:[
    "One screen for the last few days. Everything here is something the book already taught you, boiled down, with a link back to the lesson that teaches it.",
    "We follow ISACA's CISA exam content outline effective August 2024. Five domains, weighted 18, 18, 12, 26 and 26 percent. You get 150 multiple choice questions in four hours, scored from 200 to 800, and 450 passes. A few of the questions are unscored pretest items you can't pick out, so treat every one as if it counts. The clock keeps running through any break you take.",
    "This is our own summary. ISACA's current outline and candidate guide are the official word on what's tested. Exception Noted isn't affiliated with or endorsed by ISACA."
  ],
  sections:[["domains","The five domains","list"],["sampling","Sampling and evidence","list"],["terms","Key terms","terms"],["rules","What ISACA wants","rules"],["contrasts","Easy to mix up","contrasts"]],
  domains:[
    {group:"Domain 1: The audit process", note:"18 percent. How an audit gets authorized, planned, done, reported and checked.", items:[
      {name:"Standards and ethics", where:"ITAF and the Code of Professional Ethics", d:"Standards are mandatory, guidelines explain them, tools and techniques are examples. The code asks for objectivity, due care, confidentiality and telling every significant fact.", ch:1, sec:0},
      {name:"The audit charter", where:"Approved by the board or audit committee", d:"Says why audit exists: purpose, responsibility, authority, accountability. It's what gets you into the server room. An engagement letter does the same job for one outside engagement.", ch:1, sec:1},
      {name:"Independence", where:"Functional line to the audit committee", d:"In fact and in appearance. Budget and HR can run through an executive, as long as nobody can limit scope, fieldwork or the report.", ch:1, sec:2},
      {name:"Risk based planning", where:"Audit universe, then this year's plan", d:"Rank everything you could audit by risk and spend the hours where it's highest. A new system or channel mid year means you reassess the plan.", ch:1, sec:3},
      {name:"Kinds of engagements", d:"Integrated audit, forensic audit, SOC reports for service organizations, and control self assessment, where the business checks its own controls and audit facilitates.", ch:2, sec:0},
      {name:"The work program", d:"Sets out the steps that get the audit to its objectives, so the work is planned, assignable and reviewable.", mock:true},
      {name:"Analytics and AI as audit tools", where:"Audit algorithms", d:"Validate the tool on data whose answers you know, keep its output as evidence, follow up what it flags. The auditor still owns the conclusion.", ch:8, sec:7},
      {name:"Reporting", where:"Condition, criteria, cause, effect", d:"Exit meeting to confirm facts, management's response beside each finding, findings rated by risk, limitations stated where they matter.", ch:12, sec:0},
      {name:"Follow-up", d:"Verify that management's actions were actually taken, by testing, and report status to governance.", ch:12, sec:3},
      {name:"Quality of the audit work", d:"Qualified review before the report goes out, review notes resolved and documented, plus internal and external assessments of the function.", ch:12, sec:7}
    ]},
    {group:"Domain 2: Governance and management of IT", note:"18 percent. Who sets direction, who carries it out, and how anyone knows it's working.", items:[
      {name:"Governance and management", d:"The board evaluates, directs and monitors, and it's ultimately accountable. Management plans, builds and runs inside that direction.", ch:3, sec:0},
      {name:"Policies, standards, procedures", d:"Policy is intent, a standard makes it mandatory and specific, a procedure says how, a guideline only advises. After documenting comes testing whether it's followed.", ch:3, sec:1},
      {name:"Enterprise risk", d:"The board sets risk appetite. Responses are avoid, mitigate, transfer and accept. ALE is SLE times ARO. Accepting a risk takes someone with the authority to do it.", ch:3, sec:2},
      {name:"Measuring IT", d:"KGIs say whether the goal was met, KPIs say how the process is doing, and a balanced scorecard ties IT measures to business goals.", ch:3, sec:3},
      {name:"Vendors", where:"Right to audit, SLA, due diligence", d:"Check the vendor before you sign and again at renewal. Outsourcing moves the work, never the accountability.", ch:4, sec:0},
      {name:"People and money", d:"Mandatory leave and job rotation catch errors and fraud. Cross training and documentation answer a key person dependency.", ch:4, sec:1},
      {name:"Data governance", d:"The data owner classifies and approves access, the custodian protects. An inventory of what you hold comes before any classification.", ch:4, sec:2},
      {name:"Privacy", d:"Collect only what you need, do a privacy impact assessment before a new use, and test that practice matches the privacy notice.", ch:4, sec:3},
      {name:"Quality management", d:"QA is about the process, QC about the product. A certificate only covers the scope printed on it.", ch:4, sec:4},
      {name:"Enterprise architecture", d:"Current state, target state, and the gap analysis between them that becomes the roadmap. It has to serve the business strategy.", ch:4, sec:5}
    ]},
    {group:"Domain 3: Acquisition, development and implementation", note:"12 percent. Getting a system built or bought, and live, with controls in it.", items:[
      {name:"Project governance", d:"The sponsor owns the business case and the benefits. The steering committee makes the big calls, including stopping. CPI is EV over AC, SPI is EV over PV.", ch:5, sec:0},
      {name:"Business case and feasibility", d:"Revisit the case at each major decision point. Benefits get measured after go live, by the business.", ch:5, sec:1},
      {name:"Development methods", d:"Waterfall for stable requirements, agile with a product owner for changing ones, prototypes that mustn't slip into production. Escrow covers a vendor that fails.", ch:5, sec:2},
      {name:"Controls by design", d:"Input, processing and output controls are cheapest at requirements and design. The auditor advises on them and never designs or approves them.", ch:5, sec:3},
      {name:"Testing and go live", d:"Users run UAT and the business owner signs it. Regression testing after every change. Production data in test is masked. Management formally accepts the residual risk.", ch:5, sec:4},
      {name:"Release and configuration", d:"Deploy the build that was tested and approved, from a controlled library, by people independent of development.", ch:6, sec:1},
      {name:"Data conversion", d:"Reconcile record counts and control totals between old and new, explain every exception, and have the data owner sign off. Keep a tested rollback plan.", ch:6, sec:2},
      {name:"Post implementation review", d:"After things settle: did it meet its objectives and deliver its benefits, and do the controls work? Led by someone independent of the project.", ch:6, sec:3}
    ]},
    {group:"Domain 4: Operations and business resilience", note:"26 percent. Keeping systems running day to day, and getting them back.", items:[
      {name:"Components and assets", d:"Know every layer a system sits on and keep an inventory with owners. Unsupported software can't be patched, so its risk is accepted or reduced.", ch:8, sec:0},
      {name:"Job scheduling", d:"Schedule changes go through change management. Operator overrides are logged to a person and reviewed.", ch:6, sec:4},
      {name:"Interfaces", d:"Record counts, control totals, error handling with resubmission, and an owner for every interface.", ch:8, sec:1},
      {name:"Shadow IT and end user computing", d:"The risk is important data sitting outside IT's controls. The first step is a risk rated inventory.", ch:8, sec:2},
      {name:"Capacity and service levels", d:"Forecast from usage trends and business plans. Measure service levels with data the customer can check.", ch:8, sec:3},
      {name:"Availability math", where:"Service level targets", d:"A month of 30 days is 43,200 minutes. 99.9 percent available leaves about 43 minutes of downtime. Mean time to repair says how fast a failed part comes back.", mock:true},
      {name:"Incidents and problems", d:"Incident management restores service fast. Problem management finds and removes the root cause, often found by trending incidents.", ch:8, sec:4},
      {name:"Change, configuration and patching", d:"Sample from what actually changed in production and trace back to approvals. Emergency changes get approved soon after, by someone who didn't make them.", ch:6, sec:0},
      {name:"Logs", d:"Collected centrally, protected from the people they record, time synchronized, retained under policy, and reviewed.", ch:8, sec:5},
      {name:"Databases", d:"The DBA's access is individual, logged and reviewed by someone independent. Views limit what a user sees. Normalization stores each fact once.", ch:9, sec:5},
      {name:"Business impact analysis", d:"Comes first. It sets priorities, MTD, RTO and RPO, and the business owners set the objectives.", ch:7, sec:0},
      {name:"Resilience", d:"Redundancy removes single points of failure. Mirroring and clustering cover a part failing; a second site covers losing the site.", ch:7, sec:1},
      {name:"Backups", d:"Frequency follows the RPO. Keep a copy offsite and out of reach of the network. A restore test is the only proof.", ch:7, sec:2},
      {name:"Business continuity", d:"The business owns the BCP, built on the BIA. Keep it current, tested and reachable in a disaster, and fix what each test finds.", ch:7, sec:3},
      {name:"Disaster recovery", d:"IT's plan to restore within the RTO and RPO. Sites from mirrored to cold; tests from tabletop to full interruption.", ch:7, sec:4}
    ]},
    {group:"Domain 5: Protection of information assets", note:"26 percent. Security, from the front door to the forensic image.", items:[
      {name:"Security policy", d:"Approved at the top and reviewed on a cycle. It's the first document you read in a security audit. Exceptions need an owner, compensating controls and an expiry.", ch:9, sec:0},
      {name:"Physical access", d:"Named badges with least privilege and an expiry, mantraps against tailgating, and regular review of who holds access.", ch:9, sec:1},
      {name:"Environmental controls", d:"UPS for short outages, generator for long ones, pre-action sprinklers or a clean gas agent to protect equipment, all monitored and tested.", ch:9, sec:2},
      {name:"Identity and access", d:"Unique IDs make accountability possible. Least privilege, owner approval, changes driven by HR events, periodic access reviews.", ch:9, sec:3},
      {name:"Segregation of duties", d:"Split authorizing, recording, custody and reconciling. Where you can't, an independent review compensates.", ch:9, sec:4},
      {name:"Encryption and keys", d:"Symmetric for bulk data, asymmetric for key exchange, hashes to show change. Keys live apart from data, ideally in an HSM, under dual control.", ch:10, sec:1},
      {name:"PKI", d:"The RA checks who you are, the CA issues and revokes. Keep the root CA offline and revocation status current.", ch:10, sec:2},
      {name:"Network and endpoint", d:"Segment critical systems, give firewall rules owners and reviews, and cover every critical endpoint. IDS detects, IPS blocks.", ch:10, sec:3},
      {name:"Data loss prevention", d:"Built on accurate classification. Cover the channels data really uses, tune in monitor mode, then block.", ch:10, sec:4},
      {name:"Cloud", d:"The customer stays accountable for its data. Read the SOC report and run the controls it expects you to run.", ch:10, sec:5},
      {name:"Mobile, wireless and IoT", d:"MDM with remote wipe, containers for BYOD, individual Wi-Fi authentication, rogue access point scans, IoT on its own segment.", ch:10, sec:6},
      {name:"Attack methods", d:"Social engineering, phishing, ransomware, insiders, supply chain, SQL injection and cross site scripting, logic bombs, salami, DDoS.", ch:11, sec:2},
      {name:"Awareness", d:"Everyone with access, from onboarding on, with role based content, measured by behavior like phishing report rates.", ch:11, sec:3},
      {name:"Security testing", d:"Written authorization and rules of engagement before any test. Results speak only for the scope tested.", ch:11, sec:4},
      {name:"Monitoring", d:"A SIEM only sees the sources fed to it. Privileged users can't run their own monitoring.", ch:11, sec:5},
      {name:"Incident response", d:"Preparation; detection and analysis; containment, eradication and recovery; then the lessons learned review.", ch:11, sec:0},
      {name:"Evidence and forensics", d:"Preserve before you clean up. Most volatile first, disks through a write blocker, hashes and a chain of custody, analysis on verified copies.", ch:12, sec:8}
    ]}
  ],
  sampling:[
    {group:"Picking a sample", items:[
      {name:"Statistical or judgmental", d:"Random selection lets you measure sampling risk and project the result. A sample you picked by hand can find problems, but it can't say how big they are.", ch:2, sec:1},
      {name:"Attribute sampling", where:"Compliance tests", d:"Estimates a rate: how often the control failed, like a missing approval.", ch:2, sec:1},
      {name:"Variable sampling", where:"Substantive tests", d:"Estimates an amount: how many dollars are wrong.", ch:2, sec:1},
      {name:"Stop or go and discovery", d:"Stop or go ends early when you expect almost no errors and find none. Discovery looks for at least one case of something rare, like fraud.", ch:2, sec:1},
      {name:"What makes a sample bigger", d:"Higher confidence, tighter precision, a higher expected error rate, a lower tolerable error rate, and more spread in the values. Population size hardly matters once it's large.", ch:2, sec:1},
      {name:"Stratification", d:"Split a population into groups that behave alike and sample each, so a few big items don't get lost among thousands of small ones.", ch:2, sec:1},
      {name:"Materiality", d:"Your judgment of what size of error matters. Set it lower and you need more, and more precise, testing.", ch:1, sec:3}
    ]},
    {group:"Evidence that holds up", items:[
      {name:"Sufficient and appropriate", d:"Enough of it, and relevant and reliable. Checked with professional skepticism.", ch:1, sec:4},
      {name:"The reliability ladder", d:"From weakest: asking, watching, inspecting records, recalculating, re-performing. Written beats oral, direct beats handed over, independent beats the auditee's own.", ch:1, sec:4},
      {name:"Trust the file before the analysis", d:"Before you rely on a CAAT's output, check where the data came from and reconcile it to control totals.", ch:2, sec:2},
      {name:"A deviation is a lead", d:"A Benford's law failure or any other anomaly tells you where to look. It isn't proof of fraud.", ch:2, sec:2},
      {name:"Trace in the right direction", d:"To find what's missing, start from what exists: from production changes back to approvals, from devices back to the inventory.", ch:6, sec:0},
      {name:"Workpapers", d:"Enough that another competent auditor could follow how you got from what you did to what you found, kept safe from change.", ch:1, sec:4},
      {name:"Chain of custody", d:"Who held the evidence, when, and what they did with it, from collection on. Talk to counsel first if it may go to court.", ch:12, sec:8},
      {name:"Collecting digital evidence", d:"Memory and running processes first, then disks, then backups. Image through a write blocker, hash it, and work on a verified copy.", ch:11, sec:1}
    ]},
    {group:"Tests that run inside the system", note:"The exam wants these by name.", items:[
      {name:"Integrated test facility", d:"A dummy entity in live production. Your test transactions run through the real programs, then get reversed out.", ch:8, sec:6},
      {name:"Parallel simulation", d:"Real production data through your own program, compared with the system's results.", ch:8, sec:6},
      {name:"Test data", d:"Your transactions through their program. The mirror image of parallel simulation.", ch:8, sec:6},
      {name:"Embedded modules, snapshots and hooks", d:"Code inside the application that copies, photographs or flags chosen transactions as they pass. The backbone of continuous auditing.", ch:8, sec:6}
    ]}
  ],
  terms:[
    {group:"Audit", items:[
      {t:"Inherent risk", d:"How likely a material error is before any controls, just from what the area is.", ch:1, sec:3},
      {t:"Control risk", d:"The chance the controls won't prevent or catch that error in time.", ch:1, sec:3},
      {t:"Detection risk", d:"The chance your own procedures miss it. The only part of audit risk you control.", ch:1, sec:3},
      {t:"Re-performance", d:"Doing the control or procedure again yourself. Usually the most reliable evidence.", ch:1, sec:4},
      {t:"Control self assessment", d:"Process owners evaluate their own controls with audit as facilitator. It doesn't replace audit.", ch:2, sec:0},
      {t:"Scope limitation", d:"Something you couldn't examine, stated wherever it affects a conclusion.", ch:12, sec:0},
      {t:"Subsequent event", d:"Something significant after testing and before the report that may change a conclusion.", ch:12, sec:1},
      {t:"Irregularity", d:"A breach of policy or regulation. ISACA counts deliberate misstatements, fraud and altered records, and also gross negligence and unintentional illegal acts.", ch:12, sec:4}
    ]},
    {group:"Governance and risk", items:[
      {t:"Risk appetite", d:"How much and what kind of risk the organization will take for its goals. Set by the board.", ch:3, sec:2},
      {t:"Residual risk", d:"What's left after management's risk response, controls included.", ch:11, sec:6},
      {t:"ALE", d:"Annualized loss expectancy: single loss expectancy times annual rate of occurrence.", ch:3, sec:2},
      {t:"Balanced scorecard", d:"Measures across several perspectives that tie IT performance to business goals.", ch:3, sec:3},
      {t:"Right to audit clause", d:"Lets the customer, or its auditors, examine the vendor's controls and records.", ch:4, sec:0},
      {t:"Related party", d:"Someone tied to the organization's directors or managers. Dealings need disclosure and independent approval.", ch:4, sec:0},
      {t:"Privacy impact assessment", d:"A look at how a new system or use affects personal data, done before it starts.", ch:4, sec:3},
      {t:"Gap analysis", d:"Current state against target state. The result becomes the roadmap.", ch:4, sec:5}
    ]},
    {group:"Build and change", items:[
      {t:"Function point analysis", d:"Sizes software by what it delivers to users, whatever the language.", ch:5, sec:0},
      {t:"Requirements traceability matrix", d:"Links each requirement to its design, build and test, so you can see where one stopped.", ch:5, sec:3},
      {t:"Compensating control", d:"Answers the same risk by another route when the intended control is missing, and has to be shown to work.", ch:12, sec:6},
      {t:"Accreditation", d:"Management's formal acceptance of a system and its residual risk before production.", ch:5, sec:4},
      {t:"Source code escrow", d:"A third party holds the vendor's code and releases it if the vendor fails.", ch:5, sec:2},
      {t:"Hash total", d:"A sum of a field that means nothing as a number, like account numbers, used to show the same records came through.", ch:6, sec:2},
      {t:"Configuration baseline", d:"The approved setup of a system, used to spot changes that skipped change management.", ch:6, sec:0}
    ]},
    {group:"Operations and recovery", items:[
      {t:"Known error", d:"A problem whose root cause is known and has a documented workaround.", ch:8, sec:4},
      {t:"Operational level agreement", d:"An internal agreement between teams that holds up the service levels promised outside.", ch:8, sec:3},
      {t:"MTD", d:"The longest a process can be down before the harm is unacceptable. The RTO has to fit inside it.", ch:7, sec:0},
      {t:"Acceptable interruption window", d:"ISACA's name for the longest acceptable outage.", ch:7, sec:0},
      {t:"Maximum tolerable outage", d:"In ISACA's terms, how long the business can keep running in alternate mode.", ch:7, sec:0},
      {t:"Service delivery objective", d:"The level of service the business has to reach in alternate mode until normal service returns.", ch:7, sec:0},
      {t:"Mirrored site", d:"A recovery site running a live copy of production. Fastest and most expensive.", ch:7, sec:4},
      {t:"Single point of failure", d:"Any one part, person or supplier whose failure stops the whole thing.", ch:7, sec:1}
    ]},
    {group:"Security", items:[
      {t:"Non-repudiation", d:"The signer can't credibly deny signing. It depends on exclusive control of the private key.", ch:10, sec:2},
      {t:"Split knowledge and dual control", d:"No one holds a whole key, and two people have to act together.", ch:10, sec:1},
      {t:"Crossover error rate", d:"Where a biometric's false acceptance and false rejection rates meet. Lower is better.", ch:9, sec:3},
      {t:"Mantrap", d:"Two interlocking doors that let one person through at a time.", ch:9, sec:1},
      {t:"Zero trust", d:"Nothing is trusted for being inside the network. Every request is checked.", ch:10, sec:3},
      {t:"Honeypot", d:"A decoy system with no real data, there to detect and study intruders.", ch:10, sec:3},
      {t:"Complementary user entity controls", d:"Controls a provider's SOC report assumes the customer runs.", ch:10, sec:5},
      {t:"Order of volatility", d:"Collect the most fleeting evidence first: memory, then disk, then backups.", ch:11, sec:1}
    ]}
  ],
  rules:[
    {r:"Disclose any threat to your independence.", why:"Tell the appropriate people and let them decide. Don't quietly stay, quietly leave, or ask the auditee's permission.", ch:1, sec:2},
    {r:"The auditor advises and never decides.", why:"Recommending controls is fine. Designing, approving or running them impairs independence, and an auditor who designed a control can't audit it.", ch:5, sec:3},
    {r:"Think risk first.", why:"Planning, testing and follow-up go where the business risk is highest. The best answer usually starts from what could hurt the business.", ch:1, sec:3},
    {r:"Know the business before you test it.", why:"Planning starts with the process and its risks. Understand what a system supports before you pick controls to test.", mock:true},
    {r:"Accountability can't be outsourced or insured away.", why:"A vendor can do the work and insurance can pay for a loss, but the organization and its board still own the risk.", ch:4, sec:0},
    {r:"The business owns its data, risks and recovery targets.", why:"Data owners classify and approve access. Process owners set RTO and RPO. IT carries them out.", ch:4, sec:2},
    {r:"Evidence beats assurances.", why:"Independent, written, directly obtained evidence, and re-performance over a manager's word.", ch:1, sec:4},
    {r:"A control on paper isn't a control.", why:"A policy shows intent. Only testing shows whether it operates.", ch:9, sec:0},
    {r:"Build the control into the system.", why:"A system enforced control beats a procedure people have to remember, and controls are cheapest at design.", ch:5, sec:3},
    {r:"Compensating controls must cover the same risk.", why:"And they have to be shown to work. A check after the money's gone doesn't replace one meant to stop it.", ch:12, sec:6},
    {r:"Fix the cause, not the symptom.", why:"Recurring incidents call for problem management, and a failed recovery test calls for finding out why.", ch:8, sec:4},
    {r:"BIA first.", why:"Recovery strategy, continuity plans and backup frequency all come from the business impact analysis.", ch:7, sec:0},
    {r:"Only a restore proves a backup.", why:"And a tabletop can't prove a recovery time. Measure tests against the objectives and fix the gaps.", ch:7, sec:2},
    {r:"Report up, and around the people involved.", why:"Significant findings go in writing to those charged with governance. Irregularities go to an appropriate party above those involved, never to the suspect.", ch:12, sec:4},
    {r:"Preserve before you clean up.", why:"Capture evidence before eradication and recovery, and don't confront anyone or tip them off first.", ch:11, sec:1},
    {r:"Management owns compliance and risk acceptance.", why:"The auditor finds the requirements, tests them and reports. Risk above appetite goes to senior management and the board.", ch:12, sec:5}
  ],
  contrasts:[
    {topic:"Compliance vs. substantive testing", l:["Compliance test","Substantive test"], a:"Did the control operate? Attribute sampling, a rate.", b:"Are the amounts right? Variable sampling, a dollar value.", ch:2, sec:1},
    {topic:"Governance vs. management", l:["Governance","Management"], a:"Evaluates, directs and monitors. The board.", b:"Plans, builds, runs and monitors inside that direction.", ch:3, sec:0},
    {topic:"Two IT committees", l:["IT strategy committee","IT steering committee"], a:"Board level. Advises the board on IT strategy and alignment.", b:"Management level. Sets project priorities, approves and monitors projects.", ch:3, sec:0},
    {topic:"Standard vs. guideline", l:["Standard","Guideline"], a:"Mandatory and specific. Makes a policy measurable.", b:"Recommended practice. Advice only.", ch:3, sec:1},
    {topic:"KGI vs. KPI", l:["KGI","KPI"], a:"Was the goal achieved? Looks back.", b:"How is the process performing toward it? Looks ahead.", ch:3, sec:3},
    {topic:"Data owner vs. custodian", l:["Owner","Custodian"], a:"The business manager. Classifies the data and approves access.", b:"Usually IT. Stores and protects it the way the owner says.", ch:4, sec:2},
    {topic:"QA vs. QC", l:["Quality assurance","Quality control"], a:"About the process that produces the work.", b:"About the product, checked against requirements.", ch:4, sec:4},
    {topic:"SOC Type 1 vs. Type 2", l:["Type 1","Type 2"], a:"Design of controls at a point in time.", b:"Design and operating effectiveness over a period. What you need to rely on controls all year.", ch:2, sec:0},
    {topic:"Incident vs. problem", l:["Incident","Problem"], a:"An interruption. Restore service fast.", b:"The underlying cause of one or more incidents. Find it and remove it.", ch:8, sec:4},
    {topic:"RTO vs. RPO", l:["RTO","RPO"], a:"How fast the system has to be back.", b:"How much data, in time, you can afford to lose. It sets backup frequency.", ch:7, sec:0},
    {topic:"Replication vs. backup", l:["Replication","Backup"], a:"Copies changes as they happen, corruption included. Keeps you up.", b:"A point in time copy kept apart. Gets you back to before the damage.", ch:7, sec:1},
    {topic:"Incremental vs. differential restore", l:["Incremental","Differential"], a:"Last full plus every incremental since.", b:"Last full plus the latest differential.", ch:7, sec:2},
    {topic:"Hot site vs. cold site", l:["Hot","Cold"], a:"Equipped and ready in hours. Costs more.", b:"Space and power only. Cheapest and slowest.", ch:7, sec:4},
    {topic:"Parallel test vs. full interruption", l:["Parallel","Full interruption"], a:"Recovery systems process real work while production keeps running.", b:"Production stops and work moves to the recovery site. Most thorough, most risk.", ch:7, sec:4},
    {topic:"ITF vs. parallel simulation", l:["Integrated test facility","Parallel simulation"], a:"Your test data, their programs, in live production.", b:"Their real data, your program.", ch:8, sec:6},
    {topic:"Log retention vs. preservation", l:["Retention","Preservation"], a:"Routine keeping for a set period under policy.", b:"Keeping specific logs past routine because an incident or investigation needs them.", ch:8, sec:5},
    {topic:"Symmetric vs. asymmetric", l:["Symmetric","Asymmetric"], a:"One shared key. Fast, for bulk data, but the key has to travel safely.", b:"A key pair. Solves key exchange and signing, slower.", ch:10, sec:0},
    {topic:"CA vs. RA", l:["Certificate authority","Registration authority"], a:"Issues, signs and revokes certificates.", b:"Checks the applicant's identity first.", ch:10, sec:2},
    {topic:"IDS vs. IPS", l:["IDS","IPS"], a:"Detects and alerts.", b:"Sits inline and blocks.", ch:10, sec:3},
    {topic:"Vulnerability scan vs. penetration test", l:["Scan","Pen test"], a:"Finds and lists known weaknesses, usually automated.", b:"Tries to exploit them to show real impact, under written rules of engagement.", ch:11, sec:4},
    {topic:"Inherent vs. residual risk", l:["Inherent","Residual"], a:"Before any response.", b:"After management's response, controls included.", ch:11, sec:6}
  ]
};
