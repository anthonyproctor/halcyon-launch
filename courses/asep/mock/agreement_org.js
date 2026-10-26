// INCOSE ASEP course "Hearth": practice exam bank, Agreement and organizational part (10 items, 9 scored and 1 unscored pretest items marked scored:false).
// The four mock files (technical.js, management.js, agreement_org.js, crosscutting.js) make one 120 item form: 100 scored and 20 unscored,
// timed at 120 minutes, the standard INCOSE knowledge exam sitting. Built 2026-10-25 against the 25 learning objectives in INCOSE's
// SE Handbook learning objectives flyer (exam on the 5th edition only since 15 March 2025). INCOSE publishes no weights, so the bank
// spreads about 4 to 6 items per objective (LO numbers in the group comments follow the flyer's order). Task codes are the ones in
// meta.js; interface items carry T4 where interfaces are defined and T8 where they're managed at integration.
// Original items in plain words, not copied from the handbook or any question bank, and none repeat the chapter quizzes.
// Neutral settings, not the HEARTH story. Not affiliated with INCOSE. Question ids are part.slice(0,3)+index, so never reorder items.
(function(){
const D=window.HALCYON_DATA=window.HALCYON_DATA||{};
const C=D.asep=D.asep||{};
C.mock=C.mock||[];

C.mock.push({ part:`Agreement and organizational`, questions:[

// LO3 Life cycles
{ q:`Which input most directly drives improvements to an organization's standard life cycle processes?`,
  opts:[`The latest stakeholder requirements on one project`,
        `Each project's list of open technical risks`,
        `The supplier's monthly cost and schedule reports`,
        `Assessments of how they perform on projects`],
  a:3, why:`Life cycle model management assesses how the standard processes work in use and improves them from what it finds. A risk list or a supplier report belongs to one project, and one project's requirements say nothing about whether the process itself works.`,
  task:`O1`, domain:`Agreement and organizational`, scored:true },

// LO4 Acquisition and supply
{ q:`An acquirer has defined what it needs and is ready to look for a supplier. What usually comes next in the acquisition process?`,
  opts:[`Track the supplier's progress against its agreed milestones`,
        `Sign a contract with the lowest priced vendor`,
        `Send a request for proposals to possible suppliers`,
        `Accept delivery of a first article for review`],
  a:2, why:`Acquisition prepares the request, sends it out, evaluates the responses, selects a supplier and then reaches an agreement. Monitoring and acceptance come only after an agreement exists, and price alone isn't a sound basis for selection.`,
  task:`A1`, domain:`Agreement and organizational`, scored:true },
{ q:`A supplier delivers a pump skid at the end of a contract. What is the acquirer's main remaining job in acquisition?`,
  opts:[`Confirm it meets the agreement, then accept it`,
        `Verify every component the supplier bought`,
        `Take over the supplier's quality records`,
        `Rewrite the agreement so it matches what arrived`],
  a:0, why:`Acquisition ends with the acquirer confirming the product meets the agreed acceptance criteria, accepting it and closing the agreement. Checking every bought component is the supplier's job, and rewriting the agreement to fit what arrived hides any shortfall.`,
  task:`A1`, domain:`Agreement and organizational`, scored:false },
{ q:`A supplier sees a request for proposals for work it has never done, though it could hire for it. What does the supply process call for first?`,
  opts:[`Bid a low price now and hire the staff after the award`,
        `Decide whether to bid, given what it can deliver`,
        `Ask the acquirer to rewrite the request to fit its skills`,
        `Respond right away to protect the customer relationship`],
  a:1, why:`Supply starts by finding and assessing an opportunity, and that includes an honest look at whether the organization can deliver. Bidding first and staffing later puts the agreement at risk before it's signed.`,
  task:`A2`, domain:`Agreement and organizational`, scored:true },
{ q:`A supplier wants to ship a batch of sensors with a connector change the acquirer hasn't seen. What should the supplier do?`,
  opts:[`Agree the change with the acquirer before shipping`,
        `Ship and fix any problems under the warranty`,
        `Ship and note the change in the delivery papers`,
        `Hold the batch until the acquirer asks about it`],
  a:0, why:`Supply delivers what the agreement says, and any change to the product goes through the agreement first. A note in the delivery papers leaves the acquirer to discover a nonconforming product at acceptance.`,
  task:`A2`, domain:`Agreement and organizational`, scored:true },

// LO5 Business and enterprise integration
{ q:`Test servers sit broken for weeks because no one maintains them across projects. Which organizational process has the gap?`,
  opts:[`Portfolio management`,
        `Project assessment and control`,
        `Infrastructure management`,
        `Configuration management`],
  a:2, why:`Infrastructure management provides and maintains the facilities, tools and equipment that projects share. Project assessment and control can flag that one project is blocked, but keeping shared equipment working across projects is an organization level job.`,
  task:`O2`, domain:`Agreement and organizational`, scored:true },
{ q:`A company has more approved projects than it can staff, and two of them no longer fit its strategy. Which process should act?`,
  opts:[`Portfolio management`,
        `Human resource management`,
        `Decision management`,
        `Project assessment and control`],
  a:0, why:`Portfolio management starts, redirects and ends projects so the set matches strategy and resources. Project control works inside one project, and human resource management can find people but doesn't decide which projects deserve them.`,
  task:`O3`, domain:`Agreement and organizational`, scored:true },
{ q:`Which activity belongs to human resource management in the handbook's sense?`,
  opts:[`Keeping the organization's lessons learned`,
        `Assigning tasks within one project's detailed schedule`,
        `Building the skills future projects will need`,
        `Buying the tools a project team will use`],
  a:2, why:`Human resource management makes sure the organization has people with the right skills, now and for the work ahead. Assigning tasks is project planning, lessons learned are knowledge management, and tools come from infrastructure management.`,
  task:`O4`, domain:`Agreement and organizational`, scored:true },
{ q:`What does quality management set at the organization level?`,
  opts:[`Each project's acceptance test plan and criteria`,
        `The product's reliability requirements`,
        `The supplier's quality inspection results`,
        `The quality policy and its objectives`],
  a:3, why:`Quality management sets the organization's quality policy and objectives, and the procedures that carry them out, then acts when they aren't met. Test plans, inspections and reliability requirements live at the project or product level.`,
  task:`O5`, domain:`Agreement and organizational`, scored:true },
{ q:`A firm keeps solving the same bridge corrosion problem because each project team starts from scratch. Which process would help most?`,
  opts:[`Information management`,
        `Quality assurance`,
        `Knowledge management`,
        `Configuration management`],
  a:2, why:`Knowledge management captures knowledge such as lessons and proven solutions and makes it reusable across projects. Information management is the near miss, but it handles one project's information items, not what the organization learns.`,
  task:`O6`, domain:`Agreement and organizational`, scored:true }

]});
})();
