// Hearth (INCOSE ASEP) exam week review (2026-10-25): one on screen page for the last days before the exam. Never narrated.
// Loaded from the asep scripts list in courses.js. engine.js (renderReview, route #asep/review, the button in the home page's Practice exam
// card) reads window.HALCYON_REVIEW.asep; its header explains sections and kinds.
// Shape: intro [paragraphs]; sections [[id, title, kind]]; lifecycle [{group, note?, items:[{name, d, ch, sec}]}] (kind list);
// terms [{group, items:[{t, d, ch, sec}]}]; rules [{r, why, ch, sec}]; contrasts [{topic, l:[left label, right label], a, b, ch, sec}].
// ch and sec point at where the book teaches it: Full Course chapter ch, Colleen's Flight Notes (the lesson), section index sec (0 based,
// in the order of courses/asep/full/chNN.js lesson.sections). mock:true instead of ch means only the practice exam teaches it.
// Sources: the lessons, quizzes and explanations in courses/asep/full/ch01.js to ch12.js and courses/asep/mock/*.js, the 25 learning
// objectives in INCOSE's SE Handbook 5th edition flyer, and the coverage audit of 2026-10-25 (halcyon-private). Process names and order
// follow the four ISO/IEC/IEEE 15288 process groups the book teaches.
// Every line is in our own words. Handbook text is INCOSE copyright: never paste its wording here. Copy rules: plain words, contractions,
// no dashes.
window.HALCYON_REVIEW=window.HALCYON_REVIEW||{};
window.HALCYON_REVIEW.asep={
  intro:[
    "One screen for the last few days. Everything here is something Hearth already taught you, boiled down, with a link back to the lesson that teaches it.",
    "The ASEP knowledge exam covers the INCOSE Systems Engineering Handbook, 5th edition, and nothing else. The standard sitting is 120 single answer questions in 120 minutes, and 100 of them count. INCOSE doesn't publish a pass mark or how many questions come from each learning objective, so give every part of the handbook its due.",
    "This is our own summary. INCOSE's learning objectives and the handbook itself are the official word on what's tested. Hearth isn't affiliated with or endorsed by INCOSE."
  ],
  sections:[["lifecycle","Life cycle and processes","list"],["terms","Key terms","terms"],["rules","What the exam wants","rules"],["contrasts","Easy to mix up","contrasts"]],
  lifecycle:[
    {group:"Life cycle stages", note:"Six generic stages, with a decision gate between each pair. A gate can go ahead, go ahead with actions, keep working, go back, hold or stop.", items:[
      {name:"Concept", d:"Work out what's needed and whether it can be done.", ch:1, sec:1},
      {name:"Development", d:"Define, design, build, verify and validate the system.", ch:1, sec:1},
      {name:"Production", d:"Make it, one unit or many.", ch:1, sec:1},
      {name:"Utilization", d:"People use it to do the job. It runs at the same time as Support.", ch:1, sec:1},
      {name:"Support", d:"Keep it working while it's in use.", ch:1, sec:1},
      {name:"Retirement", d:"Take it out of service and get rid of it safely.", ch:1, sec:1}
    ]},
    {group:"Agreement processes", items:[
      {name:"Acquisition", d:"The buyer's side: plan the buy, pick a supplier, agree terms, watch the work and accept the product.", ch:6, sec:0},
      {name:"Supply", d:"The supplier's side: answer the need, agree terms, do the work, deliver and support it.", ch:6, sec:0}
    ]},
    {group:"Organizational project enabling processes", items:[
      {name:"Life cycle model management", d:"Set up the organization's processes and life cycle models, see how well they work, and improve them.", ch:12, sec:3},
      {name:"Infrastructure management", d:"Provide and look after the facilities, tools, IT and services projects need.", ch:10, sec:2},
      {name:"Portfolio management", d:"Decide which projects to start, keep, redirect or end, given the strategy and what the company can carry.", ch:5, sec:3},
      {name:"Human resource management", d:"Get projects the skilled people they need, by growing them or bringing them in.", ch:5, sec:3},
      {name:"Quality management", d:"Set the organization's quality policy, goals and system, and fix it when it isn't working.", ch:8, sec:3},
      {name:"Knowledge management", d:"Capture what the organization knows and put it where the next project will reuse it.", ch:10, sec:3}
    ]},
    {group:"Technical management processes", items:[
      {name:"Project planning", d:"Build and keep the plans, including the SEMP that says how the technical work will run.", ch:1, sec:3},
      {name:"Project assessment and control", d:"Compare progress with the plan, forecast where it's going, and act when it drifts.", ch:6, sec:3},
      {name:"Decision management", d:"Give choices a structured basis: options, criteria, evaluation and a recorded reason.", ch:5, sec:0},
      {name:"Risk management", d:"Find, rate, treat and watch risks, all the way through the life cycle.", ch:7, sec:0},
      {name:"Configuration management", d:"Control changes to anything baselined and keep the records in step with the real system.", ch:8, sec:3},
      {name:"Information management", d:"Get the right information to the right people, current and protected, and keep or dispose of it on purpose.", ch:10, sec:3},
      {name:"Measurement", d:"Collect and report the data that answers what decision makers need to know.", ch:5, sec:3},
      {name:"Quality assurance", d:"Check, independently, that the project follows its plans, procedures and requirements.", ch:11, sec:3}
    ]},
    {group:"Technical processes", note:"In the order ISO/IEC/IEEE 15288 lists them, from the first question to the last day.", items:[
      {name:"Business or mission analysis", d:"Pin down the problem or opportunity and the kinds of solution that could work.", ch:1, sec:3},
      {name:"Stakeholder needs and requirements definition", d:"Find out what the people with a stake need in the real setting, and turn that into stakeholder requirements.", ch:2, sec:0},
      {name:"System requirements definition", d:"Turn stakeholder requirements into what the system itself must do, ready to verify and baseline.", ch:3, sec:0},
      {name:"System architecture definition", d:"Come up with candidate architectures, pick one, and describe it in models and views that agree.", ch:4, sec:0},
      {name:"Design definition", d:"Add enough detail to build, buy or reuse each element.", ch:8, sec:0},
      {name:"System analysis", d:"Supply the data behind technical decisions, with the assumptions and uncertainty spelled out.", ch:4, sec:3},
      {name:"Implementation", d:"Make one element to its design and hand it on with the record of how it was built.", ch:10, sec:0},
      {name:"Integration", d:"Put the built elements together in a planned order and check each interface as you go.", ch:10, sec:1},
      {name:"Verification", d:"Show with objective evidence that each element and the system meet their specified requirements.", ch:11, sec:0},
      {name:"Transition", d:"Move the system to where it'll work and hand it over ready, with training, spares and records.", ch:12, sec:0},
      {name:"Validation", d:"Show with objective evidence that the system does what stakeholders need, in real use and the real setting.", ch:11, sec:0},
      {name:"Operation", d:"Run the system to deliver its services and watch how it performs.", ch:12, sec:1},
      {name:"Maintenance", d:"Keep the system able to deliver, with logistics and spares behind it.", ch:12, sec:1},
      {name:"Disposal", d:"End the system's use safely. It's planned from the concept stage and covers parts retired along the way.", ch:12, sec:2}
    ]}
  ],
  terms:[
    {group:"Systems and systems thinking", items:[
      {t:"System", d:"Parts that interact to do something none of them can do alone.", ch:1, sec:0},
      {t:"Emergent behavior", d:"Behavior that only shows up when the parts work together. It's where the value and the surprises live.", ch:1, sec:0},
      {t:"System of interest", d:"The system whose life cycle you're answerable for, as opposed to the systems and environment around it.", ch:2, sec:4},
      {t:"Enabling system", d:"Something that supports the system through its life without being part of it in use, like a test cell or a shipping fixture.", ch:2, sec:4},
      {t:"Complex, not just complicated", d:"A complicated system has many parts you can understand one at a time. A complex one has adaptive parts and interactions that make the whole hard to predict.", mock:true},
      {t:"System of systems", d:"A whole made of systems that each have their own owner, purpose and life. The four kinds, from most central control to least: directed, acknowledged, collaborative, virtual.", ch:4, sec:3}
    ]},
    {group:"Needs and requirements", items:[
      {t:"ConOps", d:"The organization's picture of how it'll operate and where the system fits. Usually starts in mission analysis.", ch:2, sec:1},
      {t:"OpsCon", d:"The users' picture of how one system will be used, built from scenarios: normal days, bad days and maintenance.", ch:2, sec:1},
      {t:"MOE, MOP, TPM", d:"How well the mission is met in the stakeholder's terms; a measurable system attribute behind it; a critical number tracked over time against a plan and a limit.", ch:2, sec:2},
      {t:"Good requirement", d:"Necessary, appropriate, unambiguous, complete, singular, feasible, verifiable, correct and conforming. Traceability is an attribute it carries, not one of the nine.", ch:3, sec:1},
      {t:"Traceability", d:"Links up to each requirement's source and down to its design and verification. It finds orphans, gaps and everything a change touches.", ch:3, sec:3},
      {t:"Requirements baseline", d:"The approved set, fixed at the system requirements review and changed only through configuration control.", ch:3, sec:3}
    ]},
    {group:"Architecture and models", items:[
      {t:"Allocation", d:"Handing each function and requirement to the element that will meet it, often with derived requirements.", ch:4, sec:0},
      {t:"N-squared diagram", d:"Elements on the diagonal, interfaces in the other cells. Outputs run along the row, inputs down the column, and n elements give n times (n minus 1) possible one way interfaces.", ch:4, sec:1},
      {t:"ICD", d:"Interface control document. The agreed definition of an interface, signed by both owners and kept under configuration control.", ch:4, sec:1},
      {t:"MBSE", d:"Model based systems engineering. The model is the main product and documents come out of it.", ch:4, sec:2},
      {t:"Digital thread and digital twin", d:"The thread links data across the life cycle so a change can be followed. A twin models one specific built unit, kept in step with its data.", ch:4, sec:2}
    ]},
    {group:"Reviews and control", items:[
      {t:"Entry and exit criteria", d:"What has to exist, with evidence, before a review is held, and what it has to show to close.", ch:8, sec:1},
      {t:"TRR", d:"Test readiness review. Article, procedures, facilities, people, safety and open items are checked before a formal test.", ch:11, sec:3},
      {t:"Configuration control board", d:"The group that approves, rejects or defers a change to a baseline after its impact is assessed.", ch:8, sec:3},
      {t:"Verification matrix", d:"For every requirement: method, level, event, success criteria, evidence and status.", ch:11, sec:1},
      {t:"Physical and functional configuration audits", d:"Physical: the item as built matches its design documents. Functional: it performs as its requirements say.", ch:10, sec:3}
    ]},
    {group:"Risk and decisions", items:[
      {t:"Risk", d:"An uncertain event or condition that would hurt the objectives if it happened. Rated by likelihood and consequence.", ch:7, sec:0},
      {t:"Risk exposure", d:"Probability times impact. A 30 percent chance of a $500,000 hit is $150,000 of exposure.", ch:7, sec:1},
      {t:"Watch item", d:"A risk you're keeping an eye on, with a trigger that brings it back for action.", ch:7, sec:2},
      {t:"Opportunity", d:"An uncertain event that would help. It gets an owner, a benefit and a trigger, like a threat does.", ch:7, sec:2},
      {t:"Leading indicator", d:"A trend you can act on before the outcome shows, with a threshold set short of the limit.", ch:7, sec:3},
      {t:"Sensitivity analysis", d:"Shift the weights or scores and see if the winner changes. If it holds, the choice is robust.", ch:5, sec:2},
      {t:"Value engineering", d:"Keep every required function and find the cheapest way to do each one. Dropping a function is descoping, not this.", ch:5, sec:2}
    ]},
    {group:"Quality characteristics", items:[
      {t:"Reliability", d:"The chance the system does its job, under stated conditions, for a stated time. A number with no time attached means nothing.", ch:9, sec:0},
      {t:"Availability", d:"The chance it's ready when it's called on. Inherent counts repair only; operational adds the waits for parts and people.", ch:9, sec:1},
      {t:"Maintainability", d:"How quickly and easily the people and tools really on hand can keep it working or bring it back.", ch:9, sec:1},
      {t:"Resilience", d:"Keeps giving the needed capability when something goes wrong, by seeing it coming, riding it out and recovering.", ch:7, sec:3},
      {t:"Human systems integration", d:"Treating operators and maintainers as part of the system and designing around their tasks, workload and training.", ch:9, sec:3},
      {t:"System security", d:"Protecting the system's function from threats, designed in from the requirements, with least access and layered defenses.", ch:9, sec:3},
      {t:"Affordability", d:"Whether the whole life cycle cost fits what stakeholders can pay while it still meets their needs.", ch:5, sec:2},
      {t:"EMC", d:"Electromagnetic compatibility. Working in its electromagnetic surroundings without causing or suffering interference. It's a whole system property.", ch:11, sec:2}
    ]},
    {group:"How SE gets applied", items:[
      {t:"Tailoring", d:"Fitting the processes to the system's type, domain and size on purpose, with the reasons written down. It never drops what protects people.", ch:9, sec:3},
      {t:"Agile systems engineering", d:"Short iterations with working results and stakeholders in the loop, fitted into the program's life cycle.", ch:6, sec:2},
      {t:"Lean", d:"Find what the stakeholder values and strip out the waste. In engineering the biggest waste is often waiting.", ch:6, sec:2},
      {t:"Product line engineering", d:"A family of products built from shared, controlled assets, with the differences managed as variation points.", ch:12, sec:3},
      {t:"SE competency framework", d:"INCOSE's map of what a systems engineer needs, in five groups and five levels from awareness to expert.", ch:4, sec:3}
    ]}
  ],
  rules:[
    {r:"Think whole system.", why:"An answer that looks at the whole, the interactions, the stakeholders and the full life is usually right. One that tunes one part alone usually isn't.", ch:1, sec:0},
    {r:"Problem before solution.", why:"If a team jumps to a design before the problem is defined, the best answer goes back to mission analysis and stakeholder needs.", ch:1, sec:3},
    {r:"A gate can say not yet.", why:"Gate and review outcomes go beyond yes or no. Reviews are held when their entry criteria are met, not because a date showed up.", ch:8, sec:1},
    {r:"Vague words are a red flag.", why:"Quick, easy, adequate, safe or user friendly with no number or condition means the requirement can't be verified. Two behaviors joined by and means it isn't singular.", ch:3, sec:1},
    {r:"Pick the verification method when you write the requirement.", why:"Present or marked is inspection, can't be fully tested is analysis, observed pass or fail is demonstration, and measured under control is test.", ch:3, sec:2},
    {r:"After the baseline, everything goes through change control.", why:"Change request, impact assessment, board decision, carry it through, then record status. An agreed ICD changes only with both owners signing.", ch:8, sec:3},
    {r:"Architecture comes before design.", why:"Functions get allocated to elements first. An answer that jumps to detailed design before that is out of order.", ch:4, sec:0},
    {r:"Set criteria and weights before you score.", why:"Musts screen options out before any scoring. Weights come from the stakeholders, up front, with reasons written down.", ch:5, sec:1},
    {r:"Write risks as cause and consequence, and keep at it.", why:"Risk management runs the whole life. Avoid, mitigate, transfer or accept, and remember transfer moves the cost, not what happens.", ch:7, sec:2},
    {r:"Growth allowance isn't margin.", why:"Predicted value is the current estimate plus growth. Margin is what's left between that and the allocation.", ch:8, sec:2},
    {r:"Redundancy only counts if the branches are independent.", why:"A shared part, supply or procedure is a common cause, and it takes out both sides at once.", ch:9, sec:0},
    {r:"Tailor, don't skip.", why:"Agile, Lean and tailoring change how the work is done. Interfaces, gates and safety requirements stay under control.", ch:9, sec:3},
    {r:"Integrate step by step.", why:"Add one element at a time so a new fault points at the last thing added. Use a stand in when an element is late.", ch:10, sec:1},
    {r:"A requirement closes on evidence, not on a test being run.", why:"The evidence is reviewed against the success criteria and accepted before the matrix says closed.", ch:11, sec:1},
    {r:"Test like you fly.", why:"Use the real configuration, environment and use. Where you can't, name the gap and cover it another way. Proof test comes before the leak test.", ch:11, sec:2},
    {r:"Plan the end at the start.", why:"Transition, support and disposal all get planned early, because their enabling systems and design choices take time.", ch:12, sec:2},
    {r:"Look for the cause in the process, not a person.", why:"Teams that blame hear about problems late. Corrective action fixes the cause and checks the fix held.", ch:6, sec:3}
  ],
  contrasts:[
    {topic:"Verification vs. validation", l:["Verification","Validation"], a:"Did we build it right? Checked against the specified requirements, at every level.", b:"Did we build the right thing? Checked against stakeholder needs, in real use and the real setting, ideally with real users.", ch:11, sec:0},
    {topic:"Needs vs. requirements", l:["Need","Requirement"], a:"What a stakeholder wants, in their own words.", b:"A clear, checkable statement of it, with no design hidden inside, traced back to the need.", ch:2, sec:3},
    {topic:"Stakeholder vs. system requirements", l:["Stakeholder requirements","System requirements"], a:"The users' view. The system is validated against these.", b:"The system's view of what it must do and how well. These get verified and feed architecture.", ch:3, sec:0},
    {topic:"ConOps vs. OpsCon", l:["ConOps","OpsCon"], a:"The organization's view of how it'll operate and where the system fits.", b:"The users' view of how one system is used day to day, told in scenarios.", ch:2, sec:1},
    {topic:"MOE vs. MOP", l:["MOE","MOP"], a:"How well the mission is met, in the stakeholder's terms, with no solution named.", b:"A measurable trait of the system, like hatch open time, that explains the MOE.", ch:2, sec:2},
    {topic:"Functional vs. physical architecture", l:["Functional","Physical"], a:"What the system must do and the flows between functions. No hardware named. Also called logical.", b:"Which elements do it and how they connect.", ch:4, sec:0},
    {topic:"Viewpoint vs. view", l:["Viewpoint","View"], a:"The template: the rules for building a kind of view that answers certain concerns.", b:"The product: that template applied to this system.", ch:4, sec:2},
    {topic:"PDR vs. CDR", l:["PDR","CDR"], a:"The preliminary design meets the allocated requirements with acceptable risk, so detailed design can start.", b:"The detailed design is complete, has margin and is ready to build. It usually sets the product baseline.", ch:8, sec:1},
    {topic:"Quality management vs. quality assurance", l:["Quality management","Quality assurance"], a:"The organization's level. Sets and improves the quality system.", b:"The project's level. Checks that the project applies it.", ch:8, sec:3},
    {topic:"Configuration vs. information management", l:["Configuration management","Information management"], a:"Controls changes to baselined items and keeps their status.", b:"The wider job: the right information to the right people, current, protected, kept and disposed of.", ch:3, sec:3},
    {topic:"Information vs. knowledge management", l:["Information management","Knowledge management"], a:"Serves one project's information.", b:"Serves the organization, turning what people know into things the next project reuses.", ch:10, sec:3},
    {topic:"Integration check vs. verification", l:["Integration check","Verification"], a:"The parts are put together right and each interface works as defined.", b:"The system meets its requirements. Integration checks give it something sound to test.", ch:10, sec:1},
    {topic:"Qualification vs. acceptance testing", l:["Qualification","Acceptance"], a:"Proves the design, with margin.", b:"Screens each flight unit for workmanship without using up its life.", ch:11, sec:2},
    {topic:"Leading vs. lagging indicators", l:["Leading","Lagging"], a:"Shows a trend early enough to act, like margin shrinking month by month.", b:"Reports what already happened, like defects found or money spent.", ch:7, sec:3},
    {topic:"Risk vs. issue", l:["Risk","Issue"], a:"Might happen. Handled through risk management.", b:"Has happened. Worked through project assessment and control.", ch:7, sec:2},
    {topic:"Reliability vs. resilience", l:["Reliability","Resilience"], a:"Tries to keep the failure from happening.", b:"Plans for the day it happens anyway and keeps the capability going.", ch:7, sec:3}
  ]
};
