// INCOSE ASEP course "Hearth": practice exam 2, Agreement and organizational part (10 items, 9 scored and 1 unscored pretest items marked scored:false).
// The four form 2 files (technical2.js, management2.js, agreement_org2.js, crosscutting2.js) make a second 120 item form: 100 scored
// and 20 unscored, timed at 120 minutes like form 1. Each part carries form:2 and formName, so the engine shows a form picker and keeps
// form 2's attempts and history apart from form 1's. Built 2026-10-25 against the same 25 learning objectives in INCOSE's SE Handbook
// learning objectives flyer (5th edition), with the same count per objective as form 1 and fresh situations. Task codes are the ones
// in meta.js; interface items carry T4 where interfaces are defined and T8 where they're managed at integration.
// Original items in plain words, not copied from the handbook or any question bank, and none repeat form 1 or the chapter quizzes.
// Neutral settings, not the HEARTH story. Not affiliated with INCOSE. Question ids are part.slice(0,3)+index (A2:0 and up), so never reorder items.
(function(){
const D=window.HALCYON_DATA=window.HALCYON_DATA||{};
const C=D.asep=D.asep||{};
C.mock=C.mock||[];

C.mock.push({ part:`A2: Agreement and organizational`, form:2, formName:`Practice exam 2`, questions:[

// LO3 Life cycles
{ q:`Every project at a company names its own stages and gates, so leaders can't compare one project's progress with another's. Which process should fix this?`,
  opts:[`Life cycle model management`,
        `Configuration management`,
        `Project assessment and control`,
        `Portfolio management`],
  a:0, why:`Life cycle model management sets the organization's standard life cycle models and processes that projects tailor from, which gives every project a common set of stages and gates. Assessment and control works inside one project. Portfolio management uses the comparisons to choose projects but doesn't define the stages, and configuration management controls baselines.`,
  task:`O1`, domain:`Agreement and organizational`, scored:true },

// LO4 Acquisition and supply
{ q:`An acquirer receives three proposals for a ground station. What should it base its supplier choice on?`,
  opts:[`Criteria drawn from the strongest of the proposals`,
        `Whichever supplier offers the lowest price`,
        `Criteria it set before the proposals came in`,
        `The supplier it has worked with the longest`],
  a:2, why:`Acquisition sets its evaluation criteria before it asks for proposals, so each supplier is judged on the same, fair terms. Price matters but is one criterion among several, and a long relationship isn't evidence of fit. Building the criteria from one proposal tilts the choice toward it.`,
  task:`A1`, domain:`Agreement and organizational`, scored:true },
{ q:`What does the acquisition process aim to achieve for an acquirer?`,
  opts:[`A supplier's internal processes, brought up to its own standard`,
        `A set of requirements written for its own engineering team`,
        `A product or service that meets its needs, from a supplier`,
        `A contract that moves every risk onto the supplier`],
  a:2, why:`Acquisition is how an organization gets a product or service from a supplier that meets its requirements. Reviewing a supplier's processes can be part of it, but it isn't the aim. Writing requirements is a technical process, and an agreement that tries to push every risk onto the supplier usually raises the price or fails.`,
  task:`A1`, domain:`Agreement and organizational`, scored:false },
{ q:`A supplier's product has been accepted. What's left in the supply process?`,
  opts:[`Keep the product's records and drawings until the acquirer pays`,
        `Hand the acquirer its design files to maintain on its own`,
        `Start the next version, and offer it before the acquirer asks`,
        `Transfer it and any agreed support, then close the agreement`],
  a:3, why:`After acceptance, the supplier transfers the product and the support the agreement calls for, collects payment and closes the agreement. Starting a new version isn't owed. Records and design files go to the acquirer only as the agreement says, not as leverage or by default.`,
  task:`A2`, domain:`Agreement and organizational`, scored:true },
{ q:`A company buys parts from its suppliers and sells the finished unit to a prime contractor. How do the acquisition and supply processes apply to it?`,
  opts:[`It's only an acquirer, as it buys more than it sells`,
        `It's an acquirer to those below it and a supplier to the prime`,
        `Neither process applies until the prime signs a contract with it`,
        `It's only a supplier, as the prime is the final customer`],
  a:1, why:`The same organization can play both roles in a supply chain: it acquires from those below it and supplies those above it, with an agreement at each link. Calling it only one or the other leaves half its agreements unmanaged, and its agreements with its own suppliers don't wait on the prime's contract.`,
  task:`A2`, domain:`Agreement and organizational`, scored:true },

// LO5 Business and enterprise integration
{ q:`A company is moving every program onto one shared modeling tool and repository. Which organizational process sets it up and keeps it running?`,
  opts:[`Life cycle model management`,
        `Information management`,
        `Knowledge management`,
        `Infrastructure management`],
  a:3, why:`Infrastructure management provides and maintains the facilities, tools and computing that projects use, which includes a shared modeling environment. Knowledge management decides what lessons and assets are kept for reuse, and information management handles a project's information, not the tool platform. Life cycle model management sets the standard processes, not the tools that run them.`,
  task:`O2`, domain:`Agreement and organizational`, scored:true },
{ q:`What does portfolio management give a project when it decides to start one?`,
  opts:[`A chosen design, and the system requirements behind it`,
        `Authority to proceed, funding and resources`,
        `A trained team, standard tools and a place to work`,
        `A finished plan, schedule and work breakdown structure`],
  a:1, why:`Portfolio management authorizes a project, assigns its funds and resources and sets what it's expected to deliver, then keeps checking that it still fits. The project does its own planning and technical work. Trained people and tools come from human resource and infrastructure management.`,
  task:`O3`, domain:`Agreement and organizational`, scored:true },
{ q:`A new project needs a test lead. How do human resource management and project planning share that job?`,
  opts:[`Project planning hires the lead; human resource management sets the pay`,
        `Human resource management runs the project's tasks once the lead starts`,
        `Human resource management supplies people; project planning assigns roles`,
        `Project planning trains the lead; human resource management writes the plan`],
  a:2, why:`Human resource management works across the organization, hiring, developing and keeping people with the skills projects need. Project planning then names who does what on the project from that pool. Running tasks and writing the plan belong to the project, and hiring and training are human resource work.`,
  task:`O4`, domain:`Agreement and organizational`, scored:true },
{ q:`Customer complaints rise across four programs, and each traces to the same weak review practice in the company's standard process. Which process should evaluate this and act for the whole company?`,
  opts:[`Quality management`,
        `Quality assurance`,
        `Project assessment and control`,
        `Decision management`],
  a:0, why:`Quality management works at the organization level: it sets quality policy and objectives, looks at results across projects and takes corrective action on the shared process. Quality assurance checks one project's products and processes. Decision management and assessment and control also work inside a project.`,
  task:`O5`, domain:`Agreement and organizational`, scored:true },
{ q:`Which of these is an output of knowledge management?`,
  opts:[`Lessons and design patterns stored where others will find them`,
        `Approved baselines for each of a project's configuration items`,
        `A project's test data, backed up and kept for the agreed time`,
        `A hiring plan that brings in skills the company is missing`],
  a:0, why:`Knowledge management captures what the organization knows, such as lessons learned, patterns and reusable assets, and makes it easy to find and use again. Baselines belong to configuration management, a project's records to information management, and hiring to human resource management.`,
  task:`O6`, domain:`Agreement and organizational`, scored:true }

]});
})();
