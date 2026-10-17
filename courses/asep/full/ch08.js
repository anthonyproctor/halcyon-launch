(((window.HALCYON_DATA=window.HALCYON_DATA||{}).asep=window.HALCYON_DATA.asep||{}).full=window.HALCYON_DATA.asep.full||[]).push({
  num: 8, part: `Part Two: Development`, title: `Thinner Than It Looks`, weeks: `Weeks 17 to 21`,
  tasks: [`M1`,`M2`,`M5`,`M7`,`M8`,`O5`,`T5`,`X1`,`X2`,`X5`],
  cast: [
    [`Ines`,`FRO's quality manager. Keeps the company's quality system and runs its audits.`]
  ],
  opening: [
    `Nadia came in Saturday morning to finish the review package and found Wes's truck already in the lot, parked across two spaces, the way people park when they've stopped thinking about parking.`,
    `The test cell lights were on. He was on a stool by the valve panel with his reading glasses pushed up on his head, looking at the red tag she'd hung on the seal fixture the afternoon before. He didn't turn around.`,
    `<span class="said" data-who="Wes">"I got Merle at home,"</span> he said. <span class="said" data-who="Wes">"Brannock's plant manager. I bought my first seals off him when he was still running the press himself."</span>`,
    `She waited. Wes had a way of telling a thing in the order it had happened to him.`,
    `<span class="said" data-who="Wes">"First he says every lot passed. Then he says they've been tuning the post-cure. The oven time after molding. Orders went up last spring and they shortened it to keep up, a little at a time, and every time somebody signed it off as minor."</span> He rubbed his eyes. <span class="said" data-who="Wes">"He couldn't tell me how many times."</span>`,
    `<span class="said" data-who="Nadia">"Shortened it how much?"</span>`,
    `<span class="said" data-who="Wes">"He's finding out. I told him to mold ours the old way, the long cure, like their first lot. He said it's the same rubber. I said humor me."</span> For a second he almost smiled. <span class="said" data-who="Wes">"Week nineteen, no charge. He didn't argue about the money. That tells you something."</span>`,
    `<span class="said" data-who="Nadia">"Did he put that in writing?"</span>`,
    `<span class="said" data-who="Wes">"Merle's word's been good since before you were born."</span> He stood, folded the glasses into his shirt pocket, and looked at the tag again. Her name, the lot number, yesterday's date. <span class="said" data-who="Wes">"Tiago's rule?"</span>`,
    `<span class="said" data-who="Nadia">"Tiago's rule."</span>`,
    `<span class="said" data-who="Wes">"It's a good rule."</span>`,
    `The preliminary design review was Thursday. The critical one was planned three weeks after that, at the end of week twenty one. Most of HEARTH's structure came off Wes's cargo drawings, so detail had run alongside, and Halo's node team couldn't finish its own design until HEARTH's was set. That weekend she'd be in Pueblo. She'd texted her father the date with him still on the line.`,
    `The wire on the tag had slipped a little overnight. She left him on the stool with the tag. At the top of the stairs she looked back, and he hadn't moved.`
  ],
  lesson: {
    title: `Colleen's Flight Notes: what it really weighs`,
    sections: [
      { h: `The paper airplane`,
        body: [`On Saturday Colleen had her airplane weighed. A shop at the Erie airport drained the fuel, rolled it onto three platform scales, one under each wheel, and read the numbers off a gray box on a cord while Nadia held the clipboard. The empty weight in the logbook had been worked out on paper for decades. A radio in, a heater out, each change added or subtracted with a pencil. The scales said thirty four pounds more than the paper.`,
          `<span class="said" data-who="Colleen">"Nobody lies on a weight and balance sheet,"</span> Colleen said. <span class="said" data-who="Colleen">"They just stop checking it."</span>`,
          `Design definition is the process that takes the architecture down to the detail needed to build each element. For every element it sets the design characteristics, the values that matter, such as dimensions, materials, mass and power, using design enablers, the equations, models, drawings and heuristics that work them out. It also plans for the enabling systems the element needs, the fixtures and facilities that make, test and handle it. It produces the design artifacts: drawings, specifications, models and parts lists, each traced to requirements and the architecture, with the reasons for the choices recorded. It decides how each element will be obtained, whether made, bought or reused, and checks any reused design against its new conditions. Once approved, the result is the baseline that implementation builds to.`],
        terms: [[`Design definition`,`The process that provides enough detailed data about the system and its elements to build them, consistent with the architecture and requirements.`],[`Design enabler`,`A means used to work out and express a design, such as equations, models, drawings, tables of margins, patterns or heuristics.`]],
        exam: `Design definition turns architecture into buildable detail: characteristics, enablers, artifacts and rationale, traced to requirements. Its output is the design baseline.` },
      { h: `Two gates`,
        body: [`Colleen did two checks before every trip that mattered. The night before, at her kitchen table, she worked the route, the weather and the weights to see whether the trip made sense at all. At the end of the runway, engine running, she checked that this airplane, today, was ready to go.`,
          `Design has two gates like that. A preliminary design review asks whether the preliminary design meets the allocated requirements with acceptable risk, so detailed design can start. On many programs it sets the allocated baseline. A critical design review asks whether the detailed design is complete, meets its requirements with adequate margin, and is ready to build, code and integrate. Passing it usually sets the product baseline, the build to set.`,
          `Each review has entry criteria, which say what has to exist before it's worth holding: a data package with evidence, sent ahead so reviewers can read it. Exit criteria say what the review must show to close. Reviews are event driven. They happen when the entry criteria are met, not because a date arrived. Every reviewer's item gets a disposition, accepted or rejected with a reason, an owner and a date. A review can pass, pass with actions, or say not yet, and the last one is a legitimate answer.`],
        terms: [[`Entry criteria`,`The conditions that must be met, with evidence, before a review is held.`],[`Exit criteria`,`What a review must demonstrate to be closed, such as design maturity, margins and dispositioned review items.`]],
        exam: `PDR: preliminary design meets allocated requirements with acceptable risk, ready for detail. CDR: detailed design complete, meets requirements, ready to build; sets the product baseline. Reviews are event driven.` },
      { h: `What's left over`,
        body: [`Colleen redid her numbers with the new weight. Her must from the legal pad, full fuel and two passengers, still held, with nineteen pounds to spare instead of fifty three. <span class="said" data-who="Colleen">"I flew the old number for two years,"</span> she said. <span class="said" data-who="Colleen">"I was fine. I just didn't know by how much."</span>`,
          `Measurement collects and reports data so the project can decide things in time. For the design, the measures that matter most are technical performance measures. A technical performance measure follows one critical parameter, such as mass, power, heat rejection or leak rate, against a planned profile over time, with thresholds that trigger action before the requirement is missed. Mass properties is one of the quality characteristics: mass, center of gravity and inertia, estimated early and confirmed by weighing. Many programs split mass this way. The current best estimate is what the design weighs now. A growth allowance, sized by maturity, covers what it's expected to gain: small for parts already weighed, more for parts calculated from drawings, most for estimates. Estimate plus growth is the predicted mass, and margin is what's left between that and the allocation. The trend matters as much as today's number.`,
          `Reporting margin honestly is part of the work. A number can be arithmetically true and still mislead. INCOSE's code of ethics asks its members to be honest and objective in what they report, and the people deciding can only act on what they're shown.`],
        terms: [[`Technical performance measure (TPM)`,`A measure of a critical technical parameter, tracked against a planned profile and thresholds to show whether a requirement will be met.`],[`Margin`,`The difference between an allocation or requirement and the predicted value, after growth allowance.`]],
        exam: `Predicted mass is the current estimate plus growth allowance. Margin is allocation minus predicted. Growth allowance isn't margin. TPMs show trends against a plan, early enough to act.` },
      { h: `Who signs for a change`,
        body: [`The shop's mechanic had written up the radio. A different person, an inspector, had signed it off. <span class="said" data-who="Colleen">"He doesn't work for the mechanic,"</span> Colleen said. <span class="said" data-who="Colleen">"That's the point of him."</span>`,
          `Configuration management controls changes to anything baselined. A change request says what and why. Each affected area assesses the impact. A configuration control board approves, rejects or defers it. The change is carried into every document and order it touches, and status accounting records where everything stands.`,
          `Two processes look after quality. Quality management works at the organization's level: it sets the quality policy, objectives and system, often built on a standard such as ISO 9001, checks whether they're working, and takes corrective action when they aren't. Quality assurance works inside a project: it evaluates the project's products and processes to make sure the organization's quality procedures are being applied, and records the problems it finds. An audit follows a problem wherever it leads, including into the organization's own paperwork. Corrective action fixes the cause, looks for the same gap elsewhere, and checks later that the fix held.`],
        terms: [[`Configuration control board`,`The group with authority to approve, reject or defer changes to baselined items, after impact assessment.`],[`Quality management vs. quality assurance`,`Quality management sets and improves the organization's quality system. Quality assurance checks that a project applies it.`]],
        exam: `Change control: request, impact assessment, board decision, implementation, status accounting. Quality management is organizational; quality assurance is per project. Corrective action targets causes, not symptoms.` }
    ]
  },
  scenes: [
    { id:`f8s1`, domain:`Technical management`, task:`M2`, title:`Monday's pumpdown`,
      text:(s,all,G)=>{const p7=(all&&all[7]&&all[7].picks)||{};const sep=p7[7]===1;const opp=p7[7]===2;const cut=p7[7]===3;
        return [`Monday of week eighteen the forward hatch's qualification article sat on Tiago's stand in the test cell, ready to go into the chamber. Gus was at the valve panel with his hand nowhere near a valve.`,
        (sep
          ?`The seal fixture's own test was still on the board for week twenty one, and its sample seal was on hold in Ohio with everything else from the lot.`
          :`The seal fixture sat beside it, built for a shared pumpdown that wasn't going to happen, its sample seal under the red tag.`+(opp?` Tiago's opportunity had depended on a fixture ready by Friday. The fixture had been ready. The seal in it was on hold, so he'd let the opportunity go and put the two tests back the way they'd started.`:cut?` With the fixture out of it, the hatch went back to its own procedure, full day hold and all.`:``)),
        `The seal in the hatch's groove came from Brannock's fourth lot, the one at 22 percent, molded after the cure had started getting shorter. It wasn't the seal HEARTH would fly. The flight seals would come from a lot that didn't exist yet. Behind this test the cell was booked solid with the aft hatch through week thirty.`,
        `<span class="said" data-who="Tiago">"I can pump it down in ten minutes,"</span> Tiago said. <span class="said" data-who="Tiago">"Tell me what it'll prove."</span>`]},
      opts:[
        {t:`Run it to qualify the hatch only, with the seal deviation written down.`, s:3, best:true, d:{trust:4,conf:5,health:5},
          after:`Tiago writes the deviation on the procedure's first page before Gus touches a valve: seal from lot four, not representative of flight, so this run qualifies the hatch's structure, latches and groove, not the seal. The seal gets its own fixture run on the new lot in week twenty three, in a slot Tiago makes by moving the aft hatch's setup to a Saturday. By Wednesday night the hatch has held for a full day at a third of its allowed leak rate.`,
          why:`When a risk turns into an issue, control works out what the planned work can still prove and adjusts the rest. Running the test for what it can honestly show, recording the deviation, and planning the seal's own qualification keeps the evidence straight and the schedule moving.`},
        {t:`Hold the hatch test until the new lot ships, and run it with a flight seal.`, s:1, d:{trust:3,conf:1,health:0},
          after:`The hatch waits. The new lot ships in week twenty two, the cell is full behind the aft hatch, and the forward hatch's qualification slides to week thirty one, after the review that was supposed to use it.`,
          why:`Wanting representative hardware is the right instinct. Control also weighs what waiting costs, and here most of the test could be run now, honestly scoped.`},
        {t:`Drop the qualification leak test and rely on the flight hatch's acceptance.`, s:0, flag:`cuttest`, d:{trust:4,conf:-3,health:-6},
          after:`The aft hatch gets its days back. The forward hatch's design goes to both reviews with no qualification leak data, and the first hatch of this design ever measured in a chamber will be the one that flies.`,
          why:`Qualification proves the design, with margin, before it's built for flight. Acceptance checks that each unit was built right. Cutting one because the other exists trades evidence for schedule.`},
        {t:`Run it as planned, and count it as the seal's qualification test as well.`, s:0, d:{trust:3,conf:-2,health:-4},
          after:`The hatch passes. The report says hatch and seal qualified. The seal it qualified came off the short cure, and the flight seals won't.`,
          why:`A test qualifies the configuration that was tested and nothing more. Claiming more than the hardware represents puts a pass on the record for something that wasn't tested.`}
      ]},
    { id:`f8s2`, domain:`Technical`, task:`T5`, title:`The package`,
      text:(s,all,G)=>{const hid=G&&G.hidrisk;return [`Tuesday was the day the review package had to go to Halo, forty eight hours ahead, by the review plan. Two things weren't in it. Halo's node team had promised the aft berthing loads in week seventeen and hadn't sent them, so the aft hatch's ring was still sized on the forward hatch's numbers. And the seal for both hatches was a lot on hold in Ohio.`,
        (hid
          ?`Since Friday Amara had read every page of the package herself before it went anywhere. The chair of FRO's board had asked for a seat at Thursday's review, and Amara had said yes before she was asked twice.`
          :`Amara had the package open on her laptop and the contract schedule open beside it.`),
        `<span class="said" data-who="Wes">"Push it a week,"</span> Wes said. <span class="said" data-who="Wes">"I don't walk into a review with holes in it."</span> <span class="said" data-who="Amara">"Thursday's in the contract,"</span> Amara said. They both looked at Nadia.`]},
      opts:[
        {t:`Send the package today as it stands, and let the review find the gaps.`, s:0, d:{trust:3,conf:-2,health:-4},
          after:`The package goes out with its gaps unmarked. On Thursday the reviewers find them one at a time and spend an hour on each.`,
          why:`Entry criteria exist so a review spends its time judging the design, not discovering what's missing from the package.`},
        {t:`Slip the review until Halo's loads are in and the new seal lot has passed.`, s:0, d:{trust:3,conf:-1,health:-3},
          after:`Amara reads the contract date out loud and keeps Thursday. The package goes out with its two gaps unmarked, and Nadia's slip is a line in the minutes.`,
          why:`Entry criteria ask whether the design is mature enough to be judged. They don't require every open issue closed first.`},
        {t:`Check each entry criterion against its evidence, and declare the two gaps.`, s:3, best:true, d:{trust:3,conf:5,health:5},
          after:`Jun builds the checklist from the review plan: requirements allocated and traced, a preliminary design for every element, interfaces at preliminary revision, margins, risks, a verification approach. Eleven of thirteen have evidence. The other two go on the package's first page with an owner and a date each: Halo's aft loads, and the seal lot. Amara reads the page over Nadia's shoulder, then keeps Thursday.`,
          why:`Reviews are event driven. They're held when the entry criteria are met with evidence, and known gaps are declared up front so reviewers can judge the design with the whole picture.`},
        {t:`Hold PDR Thursday for the forward end, and give the aft end its own review.`, s:1, d:{trust:3,conf:1,health:0},
          after:`The review stays on time and the aft end gets its own day in week twenty. The berthing ring between them belongs to neither one.`,
          why:`A separate review for a less mature element can be good tailoring. Splitting at an interface leaves the interface itself unreviewed.`}
      ]},
    { id:`f8s3`, domain:`Technical management`, task:`M7`, title:`Forty one rows`,
      text:(s,all,G)=>{const pk=s.picks||{};const ran=pk[0]===0||pk[0]===3;
        return [`Wednesday Jun was building the slide for HEARTH's technical measures. The model held forty one numbers with a requirement behind each one, from cabin noise to the hygiene station's flow rate. Amara wanted one slide.`,
        (ran
          ?`The hatch was in the chamber, a day into its hold, and its leak rate so far was a third of what it was allowed. It was the first measured number for anything on the slide.`
          :`There'd be no measured leak rate from the forward hatch before PDR. Every number on the slide would be a prediction.`),
        `<span class="said" data-who="Jun">"Which ones go on it?"</span> he asked. <span class="said" data-who="Jun">"If I pick wrong, it's the one nobody looked at that bites us."</span>`]},
      opts:[
        {t:`Put all forty one on the slide, each with its requirement and today's value.`, s:0, d:{trust:3,conf:-1,health:-3},
          after:`Forty one rows in small type. The reviewers find mass on the second page, under the hygiene station's flow rate.`,
          why:`TPMs are a few parameters chosen for importance and risk. Tracking everything at once hides the ones that matter.`},
        {t:`Pick a few tied to key requirements or risks, each with a planned profile.`, s:3, best:true, d:{trust:4,conf:5,health:5},
          after:`Four lines: mass, power, heat rejection and leak rate. Each gets its requirement, the value planned for every review from now to ship, a threshold that triggers action, and today's estimate with its margin. Jun draws mass first, a planned line climbing toward the allocation and today's estimate under it. Margin today is 1,010 kilograms.`,
          why:`A TPM tracks a critical parameter against a planned profile, with thresholds, so a bad trend shows before a requirement is missed. Choose them for the requirements and risks that matter most.`},
        {t:`Track mass on its own chart, and check the other forty at each design review.`, s:1, d:{trust:3,conf:1,health:0},
          after:`Mass gets a careful chart. Heat rejection, which the rack's new power card just raised by two hundred watts, waits for CDR to get a look.`,
          why:`Mass is a good TPM. One isn't enough when other critical parameters can drift just as far.`},
        {t:`Track drawings released and tests passed each week as the design's progress.`, s:0, d:{trust:3,conf:-2,health:-3},
          after:`The chart climbs every week. It measures how much design is done, not whether the design will work.`,
          why:`Drawings and tests are progress measures. A TPM measures technical performance against a requirement.`}
      ]},
    { id:`f8s4`, domain:`Technical`, task:`T5`, title:`Thirty one items`,
      text:(s,all,G)=>{const gut=G&&G.unweightedtrade;return [`PDR ran all Thursday in the conference room over the lobby. Halo sent its program manager, Helen, and a structures reviewer who read every load case before she said a word. Odette sat next to the hazard reports. Halo's aft loads arrived at noon, in the middle of it, and they were higher than the forward hatch's. The aft ring would need more metal.`,
        (gut
          ?`When the aft hatch came up, the structures reviewer asked for the trade behind it, since it cost mass. Nadia's record said four options had been looked at and the room had chosen. The reviewer wrote an item asking for the criteria.`
          :`When the aft hatch came up, the structures reviewer asked for the trade behind it, read the weights and the mass score, and moved on.`),
        `By five there were thirty one review items on the whiteboard. Some were typos. One said the aft ring couldn't be detailed until it was resized. Halo's program manager capped his pen. <span class="said" data-who="man">"Where does that leave us?"</span>`]},
      opts:[
        {t:`Call PDR passed, with every chart shown and no objections raised.`, s:0, d:{trust:4,conf:-2,health:-4},
          after:`The minutes say passed. The thirty one items go out on Monday with no owners, and the aft ring's sits on the list beside a typo.`,
          why:`A review closes on its exit criteria, not on the absence of objections.`},
        {t:`Keep PDR open past today until all thirty one review items are closed.`, s:0, d:{trust:2,conf:-1,health:-3},
          after:`Amara reads the exit criteria back to her, and the board passes it with actions anyway, at seven. Nadia's list of thirty one goes out with every item still dated the same day.`,
          why:`A review can pass with actions when none of the open items shows the design unfit to proceed.`},
        {t:`Pass it today, and put all thirty one items on a list to close before CDR.`, s:1, d:{trust:3,conf:1,health:0},
          after:`The list is long and real. With no disposition on each, the item that blocks the aft ring gets the same date as a typo.`,
          why:`Passing with actions is right. Each item still needs a disposition, so the ones that block the next stage are known.`},
        {t:`Disposition every item with Halo, then check the exit criteria one by one.`, s:3, best:true, d:{trust:3,conf:5,health:5},
          after:`It runs to half past seven. Each item gets accepted or rejected with a reason, an owner and a date. One blocks detail on the aft ring until Wes resizes it for Halo's loads, by Wednesday. The board reads the exit criteria out one at a time. The design meets its allocated requirements with acceptable risk, so PDR passes with nineteen actions, and the allocated baseline is set.`,
          why:`A review closes on its exit criteria. Every item gets a disposition, and the review can pass with actions when none shows the design unfit to go on. The approved design becomes the baseline.`}
      ]},
    { id:`f8s5`, domain:`Technical management`, task:`M5`, title:`Humor me`,
      text:(s,all,G)=>[`Friday morning FRO's buyer forwarded Nadia a note from Brannock's scheduler. The new lot was set for Monday, long cure, per Wes Harland, by phone. Could someone send that in writing?`,`The seal's drawing named Brannock's material spec by number. Nothing on it said which cure, and the order said standard. Since last night the drawing was under the board, part of HEARTH's allocated baseline.`,`Wes read the note at his desk. <span class="said" data-who="Wes">"Merle's good for it,"</span> he said. <span class="said" data-who="Wes">"I told you that Saturday."</span>`],
      opts:[
        {t:`Let Wes's call to Merle stand as the direction for Monday's lot.`, s:0, d:{trust:4,conf:-2,health:-4},
          after:`Brannock molds on Monday. The lot's paperwork says standard, the drawing says standard, and the only record of the long cure is a phone call.`,
          why:`A change to a baselined item needs a record and a decision. Verbal direction to a supplier sits outside configuration control and outside the agreement.`},
        {t:`Let Brannock mold Monday, and write the change request after to match.`, s:1, d:{trust:3,conf:1,health:0},
          after:`The paperwork catches up by Thursday. The change was decided before anyone else assessed it, and the board's approval reads like a receipt.`,
          why:`Writing it up records the change, but after the fact the impact assessment can't shape the decision.`},
        {t:`Write the change request today, and get the board's decision before Monday.`, s:3, best:true, d:{trust:3,conf:5,health:5},
          after:`They write it at Wes's desk: the drawing names the long cure, and Brannock has to tell FRO before changing its process again. Odette, Tiago and the buyer assess it before lunch. The board meets at four and approves it, and the buyer sends the order change at five. Wes signs as the requester, and he signs first.`,
          why:`Configuration management controls changes to baselined items: a written request, an impact assessment by those affected, a board decision, and the change carried into the drawings and the order before the work starts.`},
        {t:`Stop the new lot until the audit finds what went wrong, then decide.`, s:0, d:{trust:2,conf:-1,health:-3},
          after:`Wes calls Merle back and tells him to wait. Amara gets him on the phone again an hour later, and the molding goes ahead Monday, on a phone call, with nothing on the drawing.`,
          why:`Waiting for a full root cause before any containment costs time the change process could have saved, with the same control.`}
      ]},
    { id:`f8s6`, domain:`Agreement and organizational`, task:`O5`, title:`Both ends`,
      text:(s,all,G)=>[`Brannock's first findings came Monday of week nineteen. Merle had found the count: four cuts to the post-cure since last spring, each approved inside Brannock as minor, each one judged by itself.`,`Ines, FRO's quality manager, brought the findings to the HEARTH room on Tuesday. FRO's quality system called for an audit after any nonconformance on flight hardware, and she was the one who scoped it. She was small and precise and had a habit of reading a document's revision letter before its title.`,`<span class="said" data-who="Wes">"Their oven,"</span> Wes said. <span class="said" data-who="Wes">"Their problem."</span> <span class="said" data-who="woman">"Maybe,"</span> Ines said. <span class="said" data-who="woman">"I wrote FRO's purchase template nine years ago. I'd like somebody who isn't me to tell me if I'm auditing the right end."</span>`],
      opts:[
        {t:`Scope the audit to Brannock's plant, where the cure was changed.`, s:0, d:{trust:3,conf:-1,health:-3},
          after:`Ines spends two days in Ohio and comes back with three findings, all Brannock's. FRO's order, which never asked for anything past Brannock's standard, never comes up in Ohio.`,
          why:`An audit follows the problem through the whole chain, including the organization's own processes. Scoping it to the supplier decides the answer in advance.`},
        {t:`Scope the audit to cover both ends of the order, including FRO's.`, s:3, best:true, d:{trust:4,conf:5,health:5},
          after:`Ines takes Nadia and FRO's buyer to Ohio on Wednesday. They spend the morning in Brannock's change records and the afternoon on FRO's own purchase order, laid out on Brannock's conference table next to the lot certificates. Brannock's quality manager says it's the first time a customer has brought its own paperwork to an audit.`,
          why:`Quality management checks whether the quality system is working, and an audit follows a problem wherever it leads, including into the organization's own processes. A supplier's nonconformance often has a cause on the buyer's side too.`},
        {t:`Ask Brannock for its own root cause report and review it closely.`, s:1, d:{trust:3,conf:1,health:0},
          after:`Brannock's report is careful and complete about Brannock. It doesn't mention FRO's order, because it was never asked to look there.`,
          why:`A supplier's own investigation is useful evidence. It can't audit the buyer's side, and that's where half of this cause sits.`},
        {t:`Drop Brannock from the approved list and audit another seal maker.`, s:0, d:{trust:2,conf:-2,health:-4},
          after:`Amara prices it before lunch: a new compound, new qualification, four months. Brannock stays, and the audit loses two days to the argument.`,
          why:`Switching suppliers without finding the cause moves the problem. Corrective action starts with where it really came from.`}
      ]},
    { id:`f8s7`, domain:`Agreement and organizational`, task:`O5`, title:`What the order asked`,
      text:(s,all,G)=>{const p6=(s.picks||{})[5];return [`Thursday Ines put her findings on the HEARTH room screen. Two causes, one at each end of the order.`+(p6!==undefined&&p6!==1?` Ines had gone back through FRO's own receiving file anyway, because her procedure said to, and found the second cause herself on Wednesday night.`:``),`<prop type="doc" title="FRO quality audit, HEARTH hatch seal lot nonconformance, findings">Finding 1, Brannock: post-cure shortened four times since last spring. Each change classed as minor and judged alone. No review of the total. No notice to customers.<br>Finding 2, FRO: purchase order called for Brannock standard compound with a certificate of conformance. It did not require aging to the 15 year design life or notice of process changes. Receiving checked that each certificate read PASS.</prop>`,`<span class="said" data-who="Wes">"So whose is it?"</span> Wes asked. <span class="said" data-who="woman">"I'm not writing a name,"</span> Ines said. <span class="said" data-who="woman">"I'm writing two causes. One of them's my template."</span> She said it the way she read revision letters, first. <span class="said" data-who="woman">"Now I need the corrective action."</span>`]},
      opts:[
        {t:`Send Brannock a corrective action request and close FRO's finding as minor.`, s:0, d:{trust:3,conf:-2,health:-4},
          after:`Brannock fixes its side. FRO's template still buys standard, and the next order for a fifteen year part goes out the same way.`,
          why:`Corrective action addresses every cause found. Closing the organization's own finding as minor leaves half the cause in place.`},
        {t:`Add fifteen year aging and a process change clause to this seal order.`, s:1, d:{trust:3,conf:1,health:0},
          after:`The seal order is fixed by Friday. Eleven other FRO orders for parts that have to last fifteen years still say standard.`,
          why:`Fixing the order in front of you is containment. Corrective action looks for the same gap across the organization.`},
        {t:`Test every seal lot at FRO before acceptance, whatever its certificate says.`, s:0, d:{trust:3,conf:-1,health:-3},
          after:`FRO buys an oven and a compression tester. It catches the next bad lot after it's been made. Nothing upstream changes.`,
          why:`More inspection detects problems. Corrective action removes the cause so the problem isn't made in the first place.`},
        {t:`Fix each cause at its source and check FRO's other open orders for it.`, s:3, best:true, d:{trust:4,conf:5,health:5},
          after:`Brannock changes its procedure so cure changes add up, and any change to a customer's material gets that customer's notice. FRO's process owner changes the purchase template: anything with a design life gets aging to that life in the order, and a process change clause. The buyer pulls every open order. Eleven have the same gap. Ines puts a date in week thirty to check the fixes held.`,
          why:`Quality management takes corrective action on causes, not symptoms: fix the process at each source, look for the same gap elsewhere, and check later that the fix holds.`}
      ]},
    { id:`f8s8`, domain:`Technical management`, task:`M5`, title:`Forty kilograms`,
      text:(s,all,G)=>{const blamed=G&&G.blamedsupplier;return [`Monday of week twenty Tiago asked Tamarack for the rack's mass, so he could ballast the stand-in that would go into HEARTH in week twenty four. The real rack would follow in week twenty seven.`,
        (blamed
          ?`Pavel's answer came copied to his contracts manager, as everything did now.`
          :`Pavel called back within the hour.`),
        `Six hundred kilograms. ICD revision B said 560. The 120 volt power card was most of it, then the rear face plumbing and the Ethernet board, all things FRO had asked for.`,(blamed
          ?`<span class="said" data-who="Tiago">"He'll never say he should've sent it,"</span> Tiago said. <span class="said" data-who="Tiago">"Not with that cc on it."</span>`
          :`<span class="said" data-who="Pavel">"I should've sent it when the card went in,"</span> Pavel said. <span class="said" data-who="Pavel">"I thought somebody would weigh it later."</span>`)]},
      opts:[
        {t:`Open an ICD change for the mass and assess its impact across HEARTH.`, s:3, best:true, d:{trust:4,conf:5,health:5},
          after:`The impact sheet is full by Tuesday: mount loads up four percent and still inside the brackets' margin, the center of gravity eleven millimeters aft, and forty kilograms plus growth on the mass roll-up. The board approves revision C on Wednesday, and Pavel signs from Frederick. Tiago ballasts the stand-in to six hundred.`,
          why:`An interface property such as mass is part of the ICD baseline. Changing it takes a change request, impact assessment on every affected item, a board decision, and the new revision issued and recorded.`},
        {t:`Put six hundred in the mass roll-up, and fix the ICD at its next revision.`, s:1, d:{trust:3,conf:1,health:0},
          after:`The roll-up is right. The ICD still says 560, and the stand-in crew builds its ballast to the ICD.`,
          why:`Updating the estimate is good. Leaving the baseline behind means people working to the controlled document work to the wrong number.`},
        {t:`Hold Tamarack to the ICD and ask them to take the forty kilograms out.`, s:0, d:{trust:-2,conf:-1,health:-3},
          after:`Pavel's team spends two weeks finding nine kilograms. The rest is the power card FRO asked for.`,
          why:`The growth came from changes FRO requested. Assess a change's impact before directing a fix, and fix it where it costs the system least.`},
        {t:`Keep the ICD at 560 and let HEARTH's growth allowance absorb the forty.`, s:0, d:{trust:3,conf:-2,health:-4},
          after:`The allowance takes it on paper. The rack's mounts are still designed for 560.`,
          why:`Quietly absorbing a real change hides it from everyone who works to the baseline. It still needs a change request and an impact assessment.`}
      ]},
    { id:`f8s9`, domain:`Technical management`, task:`M7`, title:`Measured, calculated, estimated`,
      text:(s,all,G)=>[`Tuesday Jun brought the CDR mass roll-up to Nadia's desk. Every line had a maturity next to it. Measured meant somebody had put it on a scale: the berthing mechanism off its vendor's truck, and a few hundred bought boxes weighed at the dock. Calculated meant it came from a released drawing. Estimated meant somebody's best guess, Tamarack's rack among them now. HEARTH's mass plan gave each a growth allowance, two percent, six and fifteen.`,`<prop type="doc" title="HEARTH mass roll-up for CDR, summary">Allocation, not to exceed: 15,000 kg.<br>Measured: 3,000 kg. Growth 2 percent.<br>Calculated: 8,500 kg. Growth 6 percent.<br>Estimated: 1,800 kg. Growth 15 percent.<br>CDR floor: margin of at least 5 percent of allocation.</prop>`,`<span class="said" data-who="Jun">"How do I show it?"</span> Jun asked.`],
      opts:[
        {t:`Show each subsystem's estimate against its own allocation, row by row.`, s:0, d:{trust:3,conf:-1,health:-3},
          after:`Every row is green. The system total, and what's left of it, isn't on the chart.`,
          why:`Subsystem budgets matter, but the system margin and its trend are what the TPM is for.`},
        {t:`Show today's predicted mass and its margin against the CDR floor.`, s:1, d:{trust:3,conf:1,health:0},
          after:`The number is right and easy to read. It can't show which way it's been going.`,
          why:`A correct point value is useful. A TPM also shows the trend against the planned profile, which is where the warning lives.`},
        {t:`Plot predicted mass and margin from SRR on, against the planned profile.`, s:3, best:true, d:{trust:4,conf:5,health:5},
          after:`Jun plots it from SRR forward: predicted mass climbing toward the allocation, the margin shrinking under it, and the planned margin stepping down at each review. At CDR the margin is 860 kilograms against a floor of 750. It's dropped at every review, and fastest since PDR.`,
          why:`A TPM shows the current predicted value with its growth allowance, against a planned profile and thresholds, over time. The trend tells you more than any single point.`},
        {t:`Report mass from the drawings now, and add the rack once it's weighed.`, s:0, d:{trust:3,conf:-2,health:-4},
          after:`The total drops by six hundred kilograms, and so does the truth of it.`,
          why:`Leaving out unmeasured items makes margin look bigger. Estimates go in with their growth allowance until they're measured.`}
      ]},
    { id:`f8s10`, domain:`Cross-cutting`, task:`X5`, title:`Wes's pocket`,
      text:(s,all,G)=>{const hid=G&&G.hidrisk;return [`Wednesday Jun stood at Nadia's desk with his laptop and didn't sit down. Wes had seen the chart.`,`<span class="said" data-who="Jun">"He says margin is allocation minus today's estimate. Seventeen hundred kilograms, eleven percent. He says growth is his pocket. He's kept one on every module he ever built and never once put it on a customer's chart."</span> Jun scrolled to the slide, where his name sat in the corner. <span class="said" data-who="Jun">"He says eight sixty makes Halo nervous, and a nervous customer asks for mass back."</span>`,`Both numbers came out of the same spreadsheet. Neither one was false.`,
        (hid
          ?`Since the seal, Amara had stopped coming by Nadia's desk. She sent her questions in email now, and she'd send one about this number.`
          :`The slide was due to Halo by Friday.`)]},
      opts:[
        {t:`Use Wes's number, allocation minus today's estimate, as the margin on the chart.`, s:0, flag:`paddedmargin`, d:{trust:4,conf:-3,health:-6},
          after:`The chart says seventeen hundred kilograms, eleven percent, and every digit on it is correct. Jun presents it. He doesn't look at Nadia while he does.`,
          why:`A number can be arithmetically true and still mislead. Margin with the expected growth folded in shows a reserve as if it were free, and the people deciding can't see it.`},
        {t:`Show both numbers side by side, and let Halo's reviewers pick one.`, s:1, d:{trust:3,conf:1,health:0},
          after:`Halo's reviewers take the bigger one, because it's labeled margin too.`,
          why:`Showing everything is honest as far as it goes. The engineer still owns saying which number answers the question.`},
        {t:`Report 860 now, and add the trend line at the next review once it settles.`, s:0, d:{trust:3,conf:-2,health:-4},
          after:`The number is right. Where it's heading stays on Jun's laptop.`,
          why:`Leaving out the part that worries you misleads by selection, even when every number shown is true.`},
        {t:`Report 860 with the growth shown as its own line, and walk Wes through it.`, s:3, best:true, d:{trust:4,conf:5,health:5},
          after:`They go to Wes's desk together. Nadia says the growth isn't a pocket, it's what the drawings will weigh once they're metal, and Halo's arm will lift what they weigh. Jun shows him the line. Wes looks at it a while. <span class="said" data-who="Wes">"Structure'll use all of its six,"</span> he says. <span class="said" data-who="Wes">"Always does."</span> Jun writes that in the notes under the chart, with Wes's name on it.`,
          why:`SE in practice includes reporting status honestly, with uncertainty in view, even when the number is unwelcome. INCOSE's code of ethics asks for honesty and objectivity, and decision makers can only act on what they're shown.`}
      ]},
    { id:`f8s11`, domain:`Technical`, task:`T5`, title:`What it's built with`,
      text:(s,all,G)=>[`Monday of week twenty one the CDR package went to Halo. Four hundred and twelve drawings, three hundred and eighty eight of them released, the aft ring's resized set among them.`,
        (G&&G.acceptedwesreqs
          ?`The overhead harness channel, one of Wes's three from week six, had come into the baseline with no parent and no change request. Its brackets weren't on any drawing. The harness lead found that on Friday and drew them over the weekend.`
          :`The overhead harness channel Wes had taken through the board in week six was on its own released drawing, brackets and all.`),
        `Tiago read the package index standing up and handed it back. <span class="said" data-who="Tiago">"The lifting fixture isn't in here. Or the transport cradle, or the leak test fixtures."</span> <span class="said" data-who="Wes">"That's ground support,"</span> Wes said. <span class="said" data-who="Wes">"CDR's the module."</span>`],
      opts:[
        {t:`Keep the enabling items out of CDR, and design them once the module's set.`, s:0, d:{trust:3,conf:-2,health:-3},
          after:`The package is the module and only the module. In week thirty the module is ready to lift, and the lifting fixture is still a drawing in work.`,
          why:`A design isn't ready to build until the enabling systems it's made, tested and handled with are designed alongside it.`},
        {t:`Add the enabling items' designs to the CDR package alongside the module.`, s:3, best:true, d:{trust:4,conf:5,health:5},
          after:`Tiago's list goes in: the lifting fixture, the transport cradle, the leak test fixtures and the rack's handling dolly. Two are designed, two aren't, and those two get dates. On Thursday Halo's structures reviewer opens the lifting fixture's drawing first, because a lifting fixture is what holds a module in the air.`,
          why:`The fixtures, cradles and test equipment a module needs are enabling systems, and they have to mature alongside the design they support. A detailed design isn't ready to build if what it's built and lifted with isn't designed.`},
        {t:`List the enabling items as open actions in the package, for after CDR.`, s:1, d:{trust:3,conf:1,health:0},
          after:`They're on the list with dates after CDR. One of them, the leak test fixture, is needed in week twenty three.`,
          why:`Listing them beats leaving them out. Enablers with long lead times have to mature alongside the design they support.`},
        {t:`Hold CDR on its date, and let the release count of ninety four percent decide.`, s:0, d:{trust:3,conf:-1,health:-3},
          after:`Ninety four percent does clear the bar. Every fixture is in the other six.`,
          why:`A release count is a useful entry measure. It can't say whether the right things are in the package.`}
      ]},
    { id:`f8s12`, domain:`Technical`, task:`T5`, title:`Ten past six`,
      text:(s,all,G)=>{const pad=(s.flags&&s.flags.paddedmargin)||(G&&G.paddedmargin);const p7=(all&&all[7]&&all[7].picks)||{};const bk=p7[3]===2;const both=(s.picks||{})[9]===1;
        return [`CDR ran Thursday and Friday. On Friday morning Brannock's routine result on the new lot came in: compression set 15 percent, long cure, a pass. The fifteen year aging result was due in week twenty eight.`+(bk?` Jun's backup compound had passed its own qualification on Wednesday, and a change request to add it to the drawing as an alternate was in the board's queue.`:``),
        (pad
          ?`The mass chart said seventeen hundred kilograms of margin. Halo's program manager glanced at it and turned the page.`
          :both
          ?`The mass chart showed both numbers. Halo's program manager read the bigger one and turned the page.`
          :`The mass chart said 860 kilograms, a hundred and ten over the floor. Halo's program manager stopped on it. Helen asked what the crew would lose first if it went under, and Wes said stowage, before Nadia could.`),
        `At twenty to six the board had heard everything. Halo's program manager looked at his watch and then at Nadia. <span class="said" data-who="man">"Does it pass?"</span>`]},
      opts:[
        {t:`Pass it with actions and put the mass margin on watch with a trigger.`, s:3, best:true, d:{trust:3,conf:5,health:5},
          after:`The board reads the exit criteria aloud. The detailed design is complete and meets its requirements, every margin clears its floor, and every review item has a disposition. CDR passes with fourteen actions at ten past six. The released drawings become the product baseline, under the board from tonight. Jun adds one line to the register: mass on watch, trigger at 750 kilograms, with the savings Wes has priced.`,
          why:`CDR closes on its exit criteria: a complete detailed design that meets its requirements with adequate margin, ready to build. Passing sets the build to baseline. A margin that clears its floor by a little still gets watched, with a trigger.`},
        {t:`Pass it on the exit criteria, with every margin clearing its CDR floor.`, s:1, d:{trust:3,conf:1,health:0},
          after:`It's true, and the minutes say so. Mass goes into the build with no trigger on it, so the first warning will be a weigh-in.`,
          why:`Clearing the floor meets the criterion. A thin margin still needs active tracking with a trigger after the review.`},
        {t:`Keep CDR open until the mass margin is back above ten percent.`, s:0, d:{trust:2,conf:-1,health:-3},
          after:`Halo's program manager hears her out, then reads the exit criteria aloud himself, one at a time. Every one is met. The board passes it at ten past six over her objection, and the margin goes into the build with no trigger on it.`,
          why:`The exit criteria were met. Margin is managed through the TPM and its triggers, not by holding the review past its criteria.`},
        {t:`Pass it, and ask Halo to raise the mass allocation now for later growth.`, s:0, d:{trust:3,conf:-1,health:-3},
          after:`Halo's program manager says he'll ask his arm team. To him it sounds like FRO doesn't believe its own numbers.`,
          why:`An allocation is a requirement from the customer. Asking to change it without a need, at the review, weakens the case the review just made.`}
      ]}
  ],
  drills: [
    { after:`f8s9`, title:`The margin at CDR`, setup:[`Jun's CDR roll-up has three maturity groups. Measured: 3,000 kg, growth allowance 2 percent. Calculated from released drawings: 8,500 kg, growth 6 percent. Estimated: 1,800 kg, growth 15 percent.`,`The allocation is 15,000 kg, not to exceed. At CDR the program requires a margin of at least 5 percent of the allocation. Predicted mass is the current best estimate plus growth. Margin is the allocation minus predicted mass.`],
      fields:[{label:`Current best estimate (kg)`, answer:13300, tol:0},{label:`Growth allowance (kg)`, answer:840, tol:0},{label:`Predicted mass (kg)`, answer:14140, tol:0},{label:`Margin (kg)`, answer:860, tol:0},{label:`Margin, percent of allocation`, answer:5.73, tol:0.01},{label:`Margin above the CDR floor (kg)`, answer:110, tol:0}],
      solution:[`Current best estimate: 3,000 + 8,500 + 1,800 = 13,300 kg.`,`Growth: 3,000 times 0.02 is 60. 8,500 times 0.06 is 510. 1,800 times 0.15 is 270. Total 840 kg.`,`Predicted mass: 13,300 + 840 = 14,140 kg.`,`Margin: 15,000 minus 14,140 = 860 kg. As a share of the allocation, 860 divided by 15,000 is 0.0573, or 5.73 percent.`,`The floor is 5 percent of 15,000, which is 750 kg. 860 minus 750 leaves 110 kg above it.`,`Allocation minus the estimate alone would read 15,000 minus 13,300 = 1,700 kg, or 11.3 percent. That's the number that looks good, and 840 kg of it is growth the drawings are expected to use.`,`At PDR the margin was 1,010 kg. 1,010 minus 860 is 150 kg in three weeks, about 50 a week. The floor is a line. The trend is the warning.`] }
  ],
  exercise: { after:`f8s4`, title:`Which review?`, intro:`Four reviews along the way. Pick the one each statement belongs to.`,
    items:[
      {prompt:`The detailed drawings are shown complete and ready for the shop.`, choices:[`SRR`,`PDR`,`CDR`,`TRR`], answer:2, why:`Showing the detailed design is complete and ready to build is the critical design review's job.`},
      {prompt:`The preliminary design is shown to meet its allocated requirements with acceptable risk.`, choices:[`PDR`,`CDR`,`SRR`,`TRR`], answer:0, why:`That's the preliminary design review. It clears the design to go into detail.`},
      {prompt:`The system requirements set is agreed and baselined.`, choices:[`CDR`,`TRR`,`PDR`,`SRR`], answer:3, why:`The system requirements review baselines the requirements, as HEARTH's did in week six.`},
      {prompt:`Test procedures, articles and facilities are confirmed ready before a test starts.`, choices:[`PDR`,`TRR`,`CDR`,`SRR`], answer:1, why:`A test readiness review checks that everything needed for a test is in place before it begins.`},
      {prompt:`The build to baseline is set.`, choices:[`SRR`,`PDR`,`TRR`,`CDR`], answer:3, why:`Passing CDR usually sets the product baseline, the set the shop builds to.`},
      {prompt:`The allocated baseline is set, so detailed design can begin.`, choices:[`TRR`,`PDR`,`SRR`,`CDR`], answer:1, why:`On many programs PDR sets the allocated baseline, and detailed design starts from it.`}
    ]},
  quiz: [
    {q:`What is the main purpose of the design definition process?`, opts:[`Provide the detail needed to build each element, consistent with the architecture`,`Decide which needs belong to which stakeholders, and turn them into requirements`,`Confirm through tests and analysis that the built system meets its requirements`,`Select the life cycle model and the stages that the whole project will follow`], a:0, why:`Design definition provides enough detailed data about the system and its elements to implement them, consistent with the architecture and requirements.`, task:`T5`, domain:`Technical`},
    {q:`Which review usually confirms that the detailed design is complete and ready to build?`, opts:[`System requirements review`,`Preliminary design review`,`Critical design review`,`Test readiness review`], a:2, why:`The critical design review checks that the detailed design is complete, meets its requirements with adequate margin, and is ready to build. Passing it usually sets the product baseline.`, task:`T5`, domain:`Technical`},
    {q:`Two days before a design review, two entry items lack evidence. What's the best approach?`, opts:[`Hold it on the date, and let the reviewers find the gaps`,`Postpone it until every open issue is fully closed`,`Cancel it and fold its content into the next review`,`Check the criteria, declare the gaps, decide on that`], a:3, why:`Reviews are event driven. Check each entry criterion against evidence, declare known gaps up front, and hold the review if the gaps don't stop reviewers judging the design.`, task:`T5`, domain:`Technical`},
    {q:`What is the configuration control board's main role?`, opts:[`Write the change requests that engineers submit`,`Decide on proposed changes to baselined items`,`Audit the quality systems of new suppliers`,`Release each drawing once its designer is done`], a:1, why:`The board approves, rejects or defers proposed changes to baselined items, after the affected areas have assessed the impact.`, task:`M5`, domain:`Technical management`},
    {q:`A supplier's part will weigh more than the agreed ICD says. What should happen before the change is approved?`, opts:[`An impact assessment from every affected area`,`An update to the mass roll-up only, for now`,`A request that the supplier remove the extra mass`,`A note in the next design review's minutes`], a:0, why:`A change to a baselined interface needs its impact assessed on everything it touches, such as loads, center of gravity and the mass margin, before the board decides.`, task:`M5`, domain:`Technical management`},
    {q:`Which process sets an organization's quality policy and objectives, and takes corrective action when they aren't met?`, opts:[`Quality assurance`,`Verification`,`Quality management`,`Configuration management`], a:2, why:`Quality management works at the organization's level: it sets the quality system, assesses whether it's working, and corrects it. Quality assurance applies it within a project.`, task:`O5`, domain:`Agreement and organizational`},
    {q:`An audit finds a supplier changed its process without notice, and the buyer's orders never required notice. What's the best corrective action?`, opts:[`Ask the supplier to fix its own change procedure`,`Add incoming testing of every single lot from that supplier`,`Replace the supplier with another qualified source`,`Fix both processes and check other orders for the gap`], a:3, why:`Corrective action addresses every cause found, at its source, looks for the same gap elsewhere, and later verifies the fix held.`, task:`O5`, domain:`Agreement and organizational`},
    {q:`A senior engineer wants margin shown as allocation minus current estimate, leaving out expected growth. What does ethical practice call for?`, opts:[`Use the senior engineer's figure, since it's their design`,`Show margin after growth, with growth on its own line`,`Show both figures and let the customer choose one`,`Show the larger figure, and footnote the smaller one`], a:1, why:`Report what the decision makers need to judge accurately. Margin after growth, with the growth visible, is honest. A true sum that hides spoken-for mass misleads.`, task:`X5`, domain:`Cross-cutting`},
    {q:`On a technical team, who is responsible for raising a concern that a status report will mislead its readers?`, opts:[`Only the program manager who signs the report`,`Only the quality manager who audits the program`,`Any engineer who sees it, whatever their level`,`Only the chief engineer who owns the design`], a:2, why:`Honest reporting is part of every engineer's practice. INCOSE's code of ethics applies to each member, not only to people with authority.`, task:`X5`, domain:`Cross-cutting`},
    {q:`Allocation is 2,000 kg. The current best estimate is 1,600 kg, with a growth allowance of 120 kg. What is the margin?`, opts:[`400 kg`,`120 kg`,`520 kg`,`280 kg`], a:3, why:`Predicted mass is 1,600 + 120 = 1,720 kg. Margin is 2,000 minus 1,720 = 280 kg. 400 kg treats the growth allowance as margin.`, task:`M7`, domain:`Technical management`},
    {q:`A qualification test's hardware is no longer fully representative after a supplier problem. What should project control do?`, opts:[`Run it for what it can validly show, and plan the rest`,`Cancel it, since the unit's acceptance test covers it`,`Run it as planned and record a full qualification`,`Hold all testing until every part is representative`], a:0, why:`Control adjusts the plan to what the work can still prove: run the valid part, record the deviation, and plan the rest of the qualification.`, task:`M2`, domain:`Technical management`},
    {q:`Mass properties engineering, as a quality characteristic, covers which of these?`, opts:[`Mass, center of gravity, and moments of inertia`,`Cost and schedule of the heaviest assemblies`,`Material strength at the system's load limits`,`Volume, dimensions, and the overall envelope of the system`], a:0, why:`Mass properties covers mass, center of gravity and inertia, estimated early, tracked, and confirmed by measurement.`, task:`X2`, domain:`Cross-cutting`},
    {q:`Which process evaluates a project's products and processes to check that the organization's quality procedures are being applied?`, opts:[`Quality management`,`Quality assurance`,`Validation`,`Measurement`], a:1, why:`Quality assurance works within the project, evaluating products and processes against the organization's quality procedures. Quality management sets and improves those procedures.`, task:`M8`, domain:`Technical management`},
    {q:`When should a technical review in the life cycle be held?`, opts:[`On the date it was set at contract award`,`Once its entry criteria are met, as an event`,`Whenever the customer asks for a status update`,`After the work it reviews is fully finished`], a:1, why:`Technical reviews are event driven. They're held when the entry criteria are met, so the review has something mature enough to judge.`, task:`X1`, domain:`Cross-cutting`},
    {q:`Where are a program's technical reviews and their entry and exit criteria usually planned?`, opts:[`In each review's own minutes, written afterward`,`In the customer's statement of work only`,`In the verification matrix, beside tests`,`In the systems engineering management plan`], a:3, why:`Project planning sets the technical reviews, their timing and criteria, usually in the systems engineering management plan, so everyone prepares for the same gates.`, task:`M1`, domain:`Technical management`}
  ],
  closing:(s,all,G)=>{G=G||{};const pad=(s.flags&&s.flags.paddedmargin)||G.paddedmargin;const cut=(s.flags&&s.flags.cuttest)||G.cuttest;const hid=G.hidrisk;const wait=(s.picks||{})[0]===1;const pk=s.picks||{};const both=pk[9]===1;const wes=pk[9]===3;const p7=(all&&all[7]&&all[7].picks)||{};const osp=p7[11]===2?` The Osprey go or no go was Monday, and she'd want this weekend's numbers.`:p7[11]===1?``:` Osprey's proposal was due next week, and she'd want this weekend's numbers in it.`;
    return [
    `CDR closed at ten past six on Friday. Halo's program manager signed the minutes standing up, with his coat on, because his flight left at eight.`,
    (pad
      ?`The mass chart in his bag said seventeen hundred kilograms of margin, eleven percent. It had gone through two days of review without a question.`
      :both
      ?`The mass chart in his bag showed both numbers, seventeen hundred and 860, and he'd circled the bigger one.`
      :`The mass chart in his bag said 860 kilograms of margin, a hundred and ten over the floor, with the growth on its own line underneath. He'd circled the hundred and ten.`),
    (hid
      ?`The chair of FRO's board had sat in the back row both days, which she'd never done for a design review. When it was over she asked Amara for the full register, every line, and Amara handed it to her printed.`
      :`Amara walked Halo's people down to the lobby.`+osp+` Wes went back to his desk, because the aft ring's drawings still had a week of changes in them.`),
    `Her bag was already in the car. She was halfway across the high bay to the side door when Tiago called her over. He had the forward hatch's qualification article off its stand and hanging from the crane on its sling, with a load cell between the hook and the sling. Gus kept a hand on the tag line so it wouldn't turn.`,
    (cut
      ?`It had never been in the chamber. With no leak test left on the schedule it had sat on the stand for three weeks, and Tiago wanted one number off it before it went to storage.`
      :wait
        ?`Its leak test was still waiting on the new lot, weeks out. Tiago wanted one number off it before it went back under its cover.`
        :`It had done its leak test. Before it went to storage, Tiago wanted one more number off it.`),
    `<span class="said" data-who="Tiago">"First piece we've built ourselves on a scale,"</span> he said. <span class="said" data-who="Tiago">"Sling's zeroed out."</span>`,
    `Jun's roll-up had the hatch assembly, door, frame and ring, at 850 kilograms, calculated from released drawings, with six percent on top for growth. Fifty one kilograms of room.`,
    `The display climbed, wavered while the hatch settled, and stopped.`,
    `Gus read it off. <span class="said" data-who="man">"Nine oh six."</span>`,
    `Fifty six over the drawings. Five past its whole allowance, on the first part FRO had made with its own hands. She did the rest standing there. If every calculated part came in like this one, growth would run fifty kilograms past what Jun had allowed, and the margin would come down to 810. Sixty over the floor.`+(pad||both?` Not seventeen hundred. Not anything like what Halo had taken home.`:``)+(wes?` Wes had said structure would use all of its six percent. This piece had used all of it, and five kilograms more.`:``),
    `<span class="said" data-who="Tiago">"That's still a pass,"</span> Tiago said. It was. It was inside everything anyone had promised.`,
    `<span class="said" data-who="Nadia">"Weigh it again?"</span>`,
    `Gus lowered it an inch, took it back up, and didn't ask why. The numbers climbed and wavered and stopped in the same place.`,
    `Pueblo was two hours south, and her father would ask how the review went, and she'd tell him it passed. Then she'd tell him the rest.`
  ]},
  episode:{src:`audio/full-ch08.mp3`, len:`about 35 minutes`},
  next:`Pueblo`
});
