(((window.HALCYON_DATA=window.HALCYON_DATA||{}).asep=window.HALCYON_DATA.asep||{}).full=window.HALCYON_DATA.asep.full||[]).push({
  num: 10, part: `Part Three: Integration and Beyond`, title: `The Harness`, weeks: `Weeks 24 to 28`,
  tasks: [`M5`,`M6`,`O2`,`O6`,`T7`,`T8`,`X1`,`X3`],
  cast: [],
  opening: [
    `Wes's truck was in the lot at ten to seven on Friday, parked inside the lines for once. Half the high bay lights were still on night mode. She found him inside HEARTH at the relief plate by the hatch, cargo drawings rolled under one arm, pencil behind his ear, same shirt as yesterday.`,
    `He didn't say good morning. <span class="said" data-who="Wes">"I went through all eleven cargo sets,"</span> he said. <span class="said" data-who="Wes">"Every place a manual valve sits in front of something that's supposed to work by itself. There's one more. The cabin pressure transducers. Same valve, same tag, so we could leak test the port."</span> He flicked the red handle with a fingernail. It didn't move. <span class="said" data-who="Wes">"Twenty years I've been putting these in."</span>`,
    `He'd drawn the fix in pencil on the back of a cargo drawing. The red valve was gone. The two relief valves bolted straight onto the tee, and the tee onto the one fitting through the shell.`,
    `<span class="said" data-who="Wes">"Cargo had one hole, and I'm keeping it,"</span> he said. <span class="said" data-who="Wes">"I'm losing the handle."</span>`,
    `<span class="said" data-who="Nadia">"And the proof test?"</span>`,
    `<span class="said" data-who="Wes">"Tiago pulls both valves and plugs the ports. Proof, leak, then the valves go back on and get their own leak check in place."</span>`,
    `<span class="said" data-who="Nadia">"And the night somebody leaves a plug in."</span>`,
    `She heard it as it came out. Three weeks back, at Callie's sink, dish towel in hand, she'd said it nearly word for word, and Callie had dropped the towel on the counter.`,
    `Wes didn't argue. Tiago did. He'd come in early too, and was leaning in the hatch with a coffee from the gas station on Arapahoe. <span class="said" data-who="Tiago">"Then the plug's got a handle on it as long as my forearm, painted red,"</span> he said. <span class="said" data-who="Tiago">"Make it so the vent cap won't go on with a plug in. You can't close the plate over one."</span> Wes looked at him, then wrote it on the drawing.`,
    `It was Callie's answer with a wrench in it. Build it so the crew won't let him up. Nadia kept that to herself.`,
    `Odette came up at nine and rewrote HR-22 at the HEARTH room table. The two relief valves would share only the tee and the fitting through the shell, passive metal, covered the way the shell itself was covered: design for minimum risk, big margins, proved at proof pressure with everything else. The plugs went on the closeout list as ground items. Two people would sign that both were out before the plate closed for flight.`,
    `<span class="said" data-who="Odette">"Two valves, two plugs, two names,"</span> she said, and wrote that across the bottom of the page.`,
    `The product baseline had been under the board since CDR, so the fix would go in as a change request. Wes wrote it himself, with the transducer valve on the same page, and put his own name in the box for the requester. Then he rolled the cargo drawings up and tucked them back under his arm.`,
    `<span class="said" data-who="Wes">"It was one valve,"</span> he said.`
  ],
  lesson: {
    title: `Colleen's Flight Notes: the logbook`,
    sections: [
      { h: `Built on a board`,
        body: [`Colleen's airplane was getting a new radio. On Saturday of week twenty five Nadia found her at the avionics shop at Erie, watching a technician build the harness on a pegboard: a nail at every branch, the drawing taped above it, each wire cut, labeled and tied in place long before it went near the airplane.`,
          `<span class="said" data-who="Colleen">"She builds it on the board so it fits in the panel,"</span> Colleen said. <span class="said" data-who="Colleen">"You don't want to find a short wire behind the instruments."</span> Then, without looking up from the pegboard: <span class="said" data-who="Colleen">"How's your sister?"</span>`,
          `<span class="said" data-who="Nadia">"Fine."</span> Colleen let that sit, and went back to watching the wires.`,
          `Implementation is the process that realizes one system element, hardware, software or a service, to its design. The element might be made, bought or reused; design usually decides which, and implementation carries it out. It plans the work and the enabling systems the work needs, like tooling, test sets and that pegboard. It builds the element, checks it against its design characteristics, then packages and stores it. It records the evidence: what it was built from, how, by whom, and how it tested, so the record travels with the part. When a drawing can't be built as written, or a material can't be had, implementation sends the question back to design instead of deciding alone.`],
        terms: [[`Implementation`,`The process that realizes a specified system element, whether made, bought or reused, to its design.`],[`As-built record`,`The evidence of how an element was actually built and tested: materials, serials, people, results.`]],
        exam: `Implementation realizes one element to its design and hands on the element plus its evidence. Departures go back to design, not around it.` },
      { h: `One breaker at a time`,
        body: [`With the radio in, the technician pulled every circuit breaker, powered the radio alone, then pushed the others in one by one with a headset on, listening for a whine. <span class="said" data-who="Colleen">"Turn it all on at once and hear noise,"</span> Colleen said, <span class="said" data-who="Colleen">"and you've got nine suspects."</span>`,
          `Integration combines realized elements into a whole that meets the requirements, architecture and design. It starts with a strategy: the order elements come together, set by what depends on what, where faults are likely, and which elements are most critical. Bringing everything together at once, sometimes called big bang integration, saves set-up and hides faults. Incremental build-up adds one element or group at a time and checks each step, so a new fault usually lives in the last thing added. Elements that aren't ready are stood in for by simulators, stubs or mass models, which are enabling systems too.`,
          `At each step, integration checks confirm the elements are assembled right and each interface works as defined: connectors, power, signals, fluids, data. They aren't verification of the system. They make sure verification has something sound to test. On the V, integration climbs the right side opposite architecture, where the interfaces were defined. When something unexpected happens, integration records it as an anomaly, keeps the configuration as it was, and finds the cause before changing anything.`],
        terms: [[`Integration strategy`,`The planned order and method for combining elements, chosen for dependencies and fault isolation.`],[`Integration check`,`A check that elements are correctly assembled and their interfaces work as defined, before system verification.`]],
        exam: `Integration order follows dependencies. Incremental build-up isolates faults; big bang hides them. Simulators and stand-ins are enabling systems. Integration checks confirm assembly and interfaces.` },
      { h: `The shop's bench`,
        body: [`The shop had one test bench, booked by three airplanes that week, and every gauge on it carried a calibration sticker with a date. <span class="said" data-who="Colleen">"The shop decides what benches it owns,"</span> Colleen said. <span class="said" data-who="Colleen">"My airplane just has to be on the schedule."</span>`,
          `Infrastructure management provides the facilities, tools, equipment, IT and services projects need, through the whole life cycle. It's an organizational process. It collects needs from projects, plans capacity, gets or builds what's missing, maintains and calibrates what exists, and changes it as needs change. A test cell, a clean room and a calibrated gauge all belong to it. When two projects want the same facility, the conflict is settled at the organization's level, with the portfolio in view.`],
        terms: [[`Infrastructure management`,`The organizational process that provides and maintains the facilities, tools, equipment and services projects need.`]],
        exam: `Infrastructure management is organizational: facilities, tools, IT and services for projects, with capacity, maintenance and calibration planned from project needs.` },
      { h: `What the book says`,
        body: [`Before the airplane left, the shop's inspector wrote the radio into the logbook: what came out, what went in, the serial numbers, his signature. <span class="said" data-who="Colleen">"The airplane is whatever the logbook says,"</span> Colleen said, <span class="said" data-who="Colleen">"plus anything somebody forgot to write. The next mechanic only gets the first part."</span>`,
          `Configuration management keeps a system and its records in step. It identifies the configuration items and their baselines, controls changes to them, keeps status accounting of what's approved, built and installed, down to the serial number, and checks with audits. A functional configuration audit confirms an item performs as its requirements say. A physical configuration audit confirms the item as built matches its design documents, by looking at the hardware. Integration is hard on configuration: troubleshooting swaps, temporary parts and ground items move in and out every day. Each one has to come back into the record, or the record describes a system that isn't there.`,
          `Information management decides what information a project creates and receives, where it's kept, who can see it, in what form, for how long, and how it's disposed of, including other parties' protected data. Knowledge management works across projects. It captures what the organization knows, including what lives only in experienced people's heads, and puts it where the next project will meet it: standards, checklists, training and models. A lesson that changes nothing hasn't been learned.`],
        terms: [[`Physical configuration audit`,`A check that an item as built matches its design documentation. A functional audit checks that it performs as required.`],[`Knowledge management`,`Capturing what an organization knows and putting it where future work will reuse it.`]],
        exam: `CM: identify, control change, account for status, audit. Physical audit: as built matches design. Functional audit: it performs. Information management serves the project; knowledge management serves the organization.` }
    ]
  },
  scenes: [
    { id:`f10s1`, domain:`Technical`, task:`T8`, title:`Twenty one steps`,
      text:(s,all,G)=>{const p8=(all&&all[8]&&all[8].picks)||{};const ballast=p8[7]===0?`six hundred kilograms of steel ballast`:`its steel ballast built to the ICD's number`;return [`Monday of week twenty five Tiago's integration sequence covered most of the wall in his office off the high bay: twenty one steps, from the first breaker in HEARTH's power distribution to the rack making air. The stand-in had been in its bay since Thursday, ${ballast} with Tamarack's connectors on its back.`,`The real rack would reach the high bay in week twenty six and go into HEARTH in week twenty seven. Proof testing started in week twenty nine.`,`<span class="said" data-who="Amara">"Two weeks of steps on a steel box,"</span> Amara said. <span class="said" data-who="Amara">"Then we do them again on the real one. Tell me why I'm paying twice."</span> Wes, from the doorway: <span class="said" data-who="Wes">"Put the rack in first when it gets here. It's the one that's late. Build around it."</span>`]},
      opts:[
        {t:`Build it up in stages, power, data, coolant, then the rack, and check each before the next.`, s:3, best:true, d:{trust:4,conf:5,health:5},
          after:`The twenty one steps fall into four stages, and each stage ends with a check before the next one starts. The stand-in holds the rack's place through the first three. For the data stage Jun writes a simulator that answers on HEARTH's network the way the rack's controller will. Nothing that can be proven on the steel box waits for the real one. It gets proven early, where a fault can only be in the last thing added. Amara takes back four days by running checkouts on a second shift.`,
          why:`Integration order follows dependencies, and incremental build-up checks each step so a new fault usually sits in the last element added. Stand-ins and simulators are enabling systems that let integration start before every element is ready.`},
        {t:`Keep the stages, but run the data and coolant steps together. They don't share a connector.`, s:1, d:{trust:3,conf:1,health:0},
          after:`It saves three days. On the first combined run the network drops twice, and for a morning they can't say whether it's the cable or the coolant pump's motor starting up.`,
          why:`Combining steps saves set-up time, but it gives a fault more places to hide. Each increment should be small enough that a failure points somewhere.`},
        {t:`Wait for the real rack, and bring everything together at once in week twenty seven.`, s:0, d:{trust:3,conf:-2,health:-4},
          after:`Tiago walks Amara through week twenty seven with forty connections made in one day and a fault somewhere among them. She keeps his stages, and the stand-in work goes ahead anyway.`,
          why:`Integrating everything at once, sometimes called big bang integration, saves set-up but makes faults hard to find. Incremental build-up isolates them.`},
        {t:`Put the real rack in first when it arrives, then bring HEARTH's systems up around it.`, s:0, d:{trust:3,conf:-1,health:-3},
          after:`The rack would go into a module whose power and data haven't been checked. Tiago won't power it until they are, so the rack's first two weeks in HEARTH go to checking what it's plugged into.`,
          why:`Here the rack depends on HEARTH's power and data, so it goes in after they're proven. Integrating critical elements early can be a sound strategy, but not before the interfaces they plug into have been checked.`}
      ]},
    { id:`f10s2`, domain:`Technical`, task:`T7`, title:`Cargo stock`,
      text:(s,all,G)=>[`Tuesday the harness shop's lead caught Nadia at the shop door with a spool in each hand. The stand-in's harnesses had come off his pegboards in week twenty three, built from the shop's cargo stock, which was fine for a steel box that would never leave the ground. Now he was building the flight set, and the wire the drawings called for had run out four harnesses short.`,`The supplier quoted five weeks. On his shelf sat two thousand meters of cargo wire, same gauge, same color code. He held that spool up.`,`<span class="said" data-who="man">"It's flown,"</span> he said. <span class="said" data-who="man">"I can have the set done Friday."</span>`],
      opts:[
        {t:`Use the cargo wire, and write the substitution on every traveler so it's on record.`, s:1, d:{trust:3,conf:1,health:0},
          after:`Every traveler is honest about it. The harnesses go into HEARTH with insulation that was never tested for a crewed cabin, and the record shows exactly where.`,
          why:`Recording a substitution is better than hiding it, but implementation doesn't decide that a substitute meets the design. That question belongs to design.`},
        {t:`Send it to design as a question: does the cargo wire meet the drawing? Then build.`, s:3, best:true, d:{trust:3,conf:5,health:5},
          after:`Jun has the answer by lunch. HEARTH's cabin wire has to pass the crewed cabin flammability and offgassing tests, and the cargo wire's insulation was never tested to that standard. Cargo modules weren't built for people to live in. The harness lead calls distributors while Jun finds an equal on the approved list. A warehouse in Aurora has eight hundred meters of it, three days out. The shop builds those four last, and each traveler says which reel.`,
          why:`Implementation builds to the design. When a material can't be had as specified, the question goes back to design definition, which decides whether a substitute meets the design's characteristics.`},
        {t:`Hold those four harnesses for the specified wire, and build the rest of the set now.`, s:0, d:{trust:3,conf:-1,health:-3},
          after:`Amara won't wait five weeks. The harness lead finds the right wire himself, at a warehouse in Aurora, three days out, and asks why the question went to a calendar instead of a phone.`,
          why:`Waiting is safe, but implementation feeds constraints back to design so alternatives can be judged. A five week stop with no question asked costs time a quick answer would have saved.`},
        {t:`Build with the cargo wire. Same gauge, same colors, and it's flown on every cargo module.`, s:0, d:{trust:4,conf:-2,health:-4},
          after:`The set is done Friday, built with insulation that was never tested for a crewed cabin. Odette's materials list will find it, and four harnesses will be built twice.`,
          why:`Same gauge isn't the same design. Flight history in an uncrewed module says nothing about flammability or offgassing in a cabin with people in it.`}
      ]},
    { id:`f10s3`, domain:`Agreement and organizational`, task:`O6`, title:`Document two hundred and fifteen`,
      text:(s,all,G)=>{const p9=(all&&all[9]&&all[9].picks)||{};const p7=(all&&all[7]&&all[7].picks)||{};const pad=G&&G.paddedmargin;const m=810-(p9[2]===1?9:0)-(p9[5]===2?3:0);
        return [`The board approved Wes's change on Tuesday. Wednesday morning Gus cut the safety wire and lifted the red valve out of the relief line, and Wes asked for it. It went on the shelf over his desk with its tag still on. Jun took a kilogram and a half off the mass roll-up. Every kilogram counted now, on a margin of about ${m}.`+(pad?` Halo's chart still said seventeen hundred.`:``),
        `Amara wanted the relief tee written up as a lesson learned before the week was out. FRO's lessons learned lived in a shared folder: two hundred and fourteen documents, the newest eight years old. Tiago said he'd opened it once, to see if it existed.`,
        `<span class="said" data-who="Wes">"Lessons learned is where a lesson goes to die,"</span> Wes said. <span class="said" data-who="Wes">"I've got thirty years of these, and they're up here."</span> He tapped his temple with the pencil.`+(p7[11]===1?` FRO's next module, whenever it came, would start from HEARTH's drawings.`:` If a second module ever came, Osprey's or anyone's, it would start from HEARTH's drawings.`)]},
      opts:[
        {t:`Leave it in HR-22 and the change request. Anyone who needs it later can look it up there.`, s:0, d:{trust:3,conf:-2,health:-3},
          after:`The record is complete and correct. The next designer looking at a relief line will be looking at a drawing, not at a hazard report from another program.`,
          why:`Project records hold what happened. Knowledge management puts the lesson where future work will use it.`},
        {t:`Write a careful lessons learned report, and file it in the program's lessons folder.`, s:1, d:{trust:3,conf:1,health:0},
          after:`It's a good report. It becomes document two hundred and fifteen.`,
          why:`Writing the lesson down is a start. Unless it changes the standards, checklists or training people use, the next project won't meet it.`},
        {t:`Write it into FRO's design checklist and standards, with the story and an owner.`, s:3, best:true, d:{trust:4,conf:5,health:5},
          after:`It goes where the next designer will trip on it. FRO's design review checklist gets a line: no single manual valve, plug or cap in the path of controls meant to work alone. The standard relief drawing loses its valve. The lesson gets one paragraph with the cargo history, the fix, Odette's name and Wes's. Then Jun asks Wes for an hour a week to walk the cargo drawings with a recorder running. Wes says two hours, and bring coffee.`,
          why:`Knowledge management makes knowledge reusable across the organization: lessons turned into standards, checklists and training, and know-how that lives in experienced people's heads drawn out and kept.`},
        {t:`Save the lessons for the end of the program, when there's time to do them properly.`, s:0, d:{trust:3,conf:-1,health:-3},
          after:`By week thirty eight three of the people who know the story are on other work, and the fix is one line in a list of forty.`,
          why:`Lessons fade fast. Capture them as they happen, while the people and the reasons are still in the room.`}
      ]},
    { id:`f10s4`, domain:`Agreement and organizational`, task:`O2`, title:`Built for cargo`,
      text:(s,all,G)=>{const p7=(all&&all[7]&&all[7].picks)||{};return [`Thursday Tiago walked Nadia and FRO's facilities manager through the pressure test cell. HEARTH's proof test was set for week twenty nine. The cell had been built for cargo modules, and the facilities manager had kept it running since the first one.`,`Tiago had his list on a clipboard. The nitrogen line into the cell was sized for a cargo module, and HEARTH's ninety cubic meters would take fourteen hours to fill. The cell's pressure gauges came due for calibration in week thirty, and the calibration lab was booked three weeks out. The compressor's yearly service sat on the facilities calendar in week twenty nine.`+(p7[11]===1?``:` A second module, if one came, would want the same cell the year after.`),`<span class="said" data-who="man">"It's run fine for eleven modules,"</span> the facilities manager said. <span class="said" data-who="man">"Tell me what's different."</span>`]},
      opts:[
        {t:`Book the calibration lab today for the gauges, and live with the long fill.`, s:1, d:{trust:3,conf:1,health:0},
          after:`The gauges are covered through ship. The fill still eats the first day of the test, and the compressor service stays in week twenty nine until Tiago spots it on a calendar.`,
          why:`Fixing the item you spotted helps. Infrastructure needs are planned as a whole, from the project's schedule, with the facility's owner.`},
        {t:`Rent a nitrogen trailer for HEARTH's test, and leave the cell's own plumbing as it is.`, s:0, d:{trust:3,conf:-1,health:-3},
          after:`The trailer covers the fill. The facilities manager hears about it from the driver, and the compressor service and the gauges are still on their old dates.`,
          why:`A workaround for one project leaves the facility's capacity and upkeep unplanned. Infrastructure is managed for the organization, with its owner.`},
        {t:`Leave it with facilities. The building is theirs, and HEARTH is one of their users.`, s:0, d:{trust:3,conf:-2,health:-3},
          after:`Facilities runs the cell the way it ran for cargo. Tiago finds the compressor service on the calendar the Friday before proof and spends a morning getting it moved.`,
          why:`Infrastructure management works from what projects need, and projects have to say what that is. A facility's owner left to guess plans for the last program.`},
        {t:`Give facilities HEARTH's needs from its test plan, and plan the cell's work together.`, s:3, best:true, d:{trust:4,conf:5,health:5},
          after:`Tiago's clipboard turns into a page: what HEARTH needs from the cell, week by week, through ship. The compressor service moves to week twenty six. The gauges go to the calibration lab in week twenty seven, good through ship, not just through proof. A bigger nitrogen line goes on the facilities plan for the winter shutdown, with a trailer to cover HEARTH until then. The facilities manager adds the cell to the page he shows FRO's board every quarter, with HEARTH's dates and a blank row for the next module.`,
          why:`Infrastructure management provides and maintains the facilities, equipment and services projects need, across the life cycle. It plans capacity and upkeep from the projects' needs, at the organization's level.`}
      ]},
    { id:`f10s5`, domain:`Technical`, task:`T7`, title:`Off the pegboard`,
      text:(s,all,G)=>[`Sunday at eight she'd made her call to Pueblo and kept it to the weather. Callie had put a photo in the family thread that afternoon, no caption: the first red tomato off the plants out back, held up in both of Rosie's hands. Nadia typed three replies, deleted them, and sent a heart.`,`Monday the flight harnesses started coming off the shop's pegboards. Each label carried a drawing number and a dash: dash one for the stand-in set built in week twenty three, dash three for flight. The rack's power harness was W-114. Its data harness was W-117. On the cargo modules the shop had tested harnesses after they were installed, all of them in one day.`,`<span class="said" data-who="man">"Saves a day on the bench,"</span> the harness lead said. <span class="said" data-who="man">"We've always done it that way."</span>`],
      opts:[
        {t:`Test each harness on the bench, and send it with a traveler of how it was built and tested.`, s:3, best:true, d:{trust:4,conf:5,health:5},
          after:`Every wire gets continuity and insulation resistance on the bench, where a fault costs a re-crimp instead of a day inside the module. Each harness leaves with a traveler: drawing, dash number, serial, wire reel, crimp tool, the tester's name, and the numbers. Jun asks the shop to wrap the stand-in's dash ones in yellow tape at both ends, so they can't be mistaken for flight.`,
          why:`Implementation realizes each element and records the evidence: what it was built from, how, by whom, and how it tested. Checking an element before integration keeps faults out of the assembly, and the record travels with the part.`},
        {t:`Test them installed in HEARTH, all in one day, the way the shop has always done it.`, s:0, d:{trust:3,conf:-2,health:-3},
          after:`The day inside HEARTH finds two bad crimps behind the rack bay. Each one takes half a day to reach.`,
          why:`Finding element faults after integration costs far more than finding them on the bench. Implementation checks each element before it's handed on.`},
        {t:`Test each one on the bench, and keep the results in the shop's own log for reference.`, s:1, d:{trust:3,conf:1,health:0},
          after:`The tests are done. The results stay in the shop's binder, and the harness that goes into HEARTH carries nothing but its label.`,
          why:`Testing is right, but the evidence has to travel with the element so integration and configuration records can use it.`},
        {t:`Inspect them by eye and check the labels. The shop's harnesses have always been good.`, s:0, d:{trust:3,conf:-1,health:-3},
          after:`The labels are all correct. One harness has a pin pushed back in its connector, which a label doesn't show.`,
          why:`Inspection finds what can be seen. Electrical testing finds what can't, and implementation records both.`}
      ]},
    { id:`f10s6`, domain:`Technical`, task:`T8`, title:`Fit isn't function`,
      text:(s,all,G)=>{const blamed=G&&G.blamedsupplier;const noic=G&&G.nointerfacecontrol;const wes=G&&G.acceptedwesreqs;return [
        (blamed
          ?`The rack came down from Frederick on Tuesday of week twenty six in a box truck, with a driver and a packet of paperwork. Pavel's note about it was copied to his contracts manager.`
          :`The rack came down from Frederick on Tuesday of week twenty six in a box truck, and Irena rode in the cab with her own torque wrench on her lap. She'd built most of its frame. Her week at the lake started the Thursday after first power.`),
        `It sat in the high bay on its dolly under a clean tent. Tiago had the install for Monday and first power for Tuesday. The stand-in had carried Tamarack's own connectors since week twenty four, and every one of them had mated.`+(noic?` The rack's interface list had started as an email thread back in week eight, and some of what was agreed in it had never left the thread.`:``)+(wes?` The overhead channel the rack's harnesses ran through still hung on brackets drawn over a weekend in week twenty, and two of them sat four centimeters off the harness drawing.`:``),
        `<span class="said" data-who="Tiago">"Connectors fit,"</span> Tiago said. <span class="said" data-who="Tiago">"Do I need more than that?"</span>`]},
      opts:[
        {t:`Mate it like the stand-in. That carried Tamarack's real connectors, and they all fit.`, s:0, d:{trust:3,conf:-2,health:-4},
          after:`The connectors fit, the way they fit the stand-in. Fit says nothing about what's on the pins.`,
          why:`A stand-in proves fit and form. Each interface still needs checking for function against its definition before mating.`},
        {t:`Check the power interface first, since bad voltage hurts the rack, then mate the rest.`, s:1, d:{trust:3,conf:1,health:0},
          after:`Power checks clean. Data and coolant mate on trust, and the quick disconnects see their first real pressure with the rack on the end of them.`,
          why:`Starting with the riskiest interface is sensible. Every interface still gets checked against the ICD before mating.`},
        {t:`Ask Tamarack to certify the rack meets the ICD, and mate it once that's been signed.`, s:0, d:{trust:3,conf:-1,health:-3},
          after:`The certificate arrives Friday. It says the rack meets the ICD on its side. HEARTH's side was never part of it.`,
          why:`An interface has two sides. A supplier's certificate covers its element, not the integrated connection.`},
        {t:`Check each interface, on both sides, against the ICD at the connector before mating.`, s:3, best:true, d:{trust:4,conf:5,health:5},
          after:`Jun builds the checklist from the ICD, line by line. Every pin at HEARTH's harness ends. Voltage at the connector with a load on it. The rack's chassis bond to its mounts. Coolant pressure and flow at the quick disconnects, with water at temperature. On the rack's side, its connector pinouts against the same pages. Everything checks. One question goes on the open list: the ICD says how the rack's chassis bonds to HEARTH, and nothing about where the data cable's shield is grounded.`,
          why:`Integration checks each interface against its definition before elements are joined, so a mismatch shows up as a reading, not as damage. Fit isn't function, and the interface document is the reference.`}
      ]},
    { id:`f10s7`, domain:`Technical`, task:`T7`, title:`Every day it's better`,
      text:(s,all,G)=>[`Friday FRO's flight software lead brought HEARTH's half of the rack software to Tiago's integration meeting. Her team had been working in sprints since week twelve. The newest build on her branch had a fix in it from Wednesday, for a command signing timeout they'd hit in the lab.`,`<span class="said" data-who="woman">"I'll load whatever's newest Tuesday morning,"</span> she said. <span class="said" data-who="woman">"Every day it's better."</span>`],
      opts:[
        {t:`Load the newest build from the branch Tuesday, since it has Wednesday's fix in it.`, s:0, d:{trust:3,conf:-2,health:-3},
          after:`Tuesday's build is Tuesday's build. By Thursday the bay can't say which one ran Tuesday night.`,
          why:`An element handed to integration needs a fixed identity. A build that changes daily can't be traced or repeated.`},
        {t:`Deliver a tagged build that passed its unit tests, with release notes and a version.`, s:3, best:true, d:{trust:3,conf:5,health:5},
          after:`Version 0.9.2 is tagged Friday afternoon with Wednesday's fix in it, and released to integration the controlled way: a named version, approved, with a record of what's in it. Four hundred and twelve unit tests, all passing. Three known issues, each with a workaround, on one page. The integration log records the version and the file's checksum. On Tuesday, when the panel says 0.9.2, everyone in the bay knows exactly what that is.`,
          why:`Implementing a software element ends in a defined, tested release: built from a known version, unit tested, documented and recorded, so integration knows exactly which element it has. Configuration management's release control governs what gets released and when.`},
        {t:`Deliver a tagged build, and patch it on the bench if anything comes up on Tuesday.`, s:1, d:{trust:3,conf:1,health:0},
          after:`The tag is clean. By Wednesday there are two bench patches on top of it, and the panel still says 0.9.2.`,
          why:`Starting from a tagged release is right. Changes during integration still need new versions, or the record stops matching what's running.`},
        {t:`Skip the unit tests this once. Integration is going to exercise every function anyway.`, s:0, d:{trust:3,conf:-1,health:-3},
          after:`Integration exercises every function and finds two faults a unit test would have caught in a minute. Each one costs the bay half a day.`,
          why:`Unit testing checks an element before it's handed on. Integration is for how elements work together, not for finding faults inside one.`}
      ]},
    { id:`f10s8`, domain:`Technical management`, task:`M6`, title:`Three hundred photos`,
      text:(s,all,G)=>{const blamed=G&&G.blamedsupplier;return [`Monday of week twenty seven the real rack went into its bay. By noon HEARTH's integration had produced a binder of as-run procedures in Tiago's pencil, three hundred photos on Gus's phone, and the model check results on Jun's laptop.`,
        (blamed
          ?`Tamarack's acceptance data had come by email, every page stamped proprietary, with the contracts manager copied.`
          :`Irena had brought Tamarack's acceptance data on a thumb drive, every page stamped proprietary.`),
        `At two Helen called. Halo wanted to see HEARTH's integration data as it came in, and Halo's sustaining engineers would need it for fifteen years after that.`]},
      opts:[
        {t:`Scan the binder and the photos into the program's shared drive, a folder for each week.`, s:1, d:{trust:3,conf:1,health:0},
          after:`Everything is in one place. Week twenty seven's folder holds three hundred files named by the phone that took them.`,
          why:`Collecting the information is a start. It still needs identification, versions, access control and retention to be usable later.`},
        {t:`Keep it in one controlled place: named, versioned, access by role, Tamarack's marked.`, s:3, best:true, d:{trust:4,conf:5,health:5},
          after:`Jun and Tiago set up the integration record that afternoon. Every as-run procedure, photo and anomaly report gets an ID, a date, and the configuration it was taken on. Gus's photos go in named by step. Halo gets a view of everything FRO owns. Tamarack's pages stay marked, visible only to the people Pavel's agreement names. The plan says who keeps it, in what format, and for how long: fifteen years, then the station's end of life.`,
          why:`Information management plans what information a project creates and receives, how it's identified, stored, protected and shared, who can reach it, and how long it's kept. Other parties' protected data is handled on their terms.`},
        {t:`Send Halo everything as it comes in, so the customer sees all of it, unfiltered.`, s:0, d:{trust:3,conf:-2,health:-4},
          after:`Tamarack's proprietary pages land in Halo's inbox the first afternoon. Pavel calls Nadia before she's back at her desk.`,
          why:`Sharing has to respect agreements and protected data. Information management decides who gets what, in what form.`},
        {t:`Leave each team's records where they are now, and gather them all for the proof test.`, s:0, d:{trust:3,conf:-1,health:-3},
          after:`Thursday someone needs Tuesday's as-run procedure, and it's in a binder in Tiago's truck.`,
          why:`Information spread across teams can't be found when it's needed. Plan where it lives before it piles up.`}
      ]},
    { id:`f10s9`, domain:`Technical`, task:`T8`, title:`First power`,
      text:(s,all,G)=>{const blamed=G&&G.blamedsupplier;return [`Tuesday evening, with the rack mated, Tiago stood at the power panel with the procedure clipped open. W-114 ran the rack's power down from the overhead channel. W-117 ran its data. Both were dash three, flight, off the shop's bench the week before.`+(blamed?``:` Irena stood at the rack's front face, where the controller's screen would come up.`),`<span class="said" data-who="Tiago">"The stand-in's been powered forty times,"</span> Tiago said. <span class="said" data-who="Tiago">"How careful do you want this?"</span>`]},
      opts:[
        {t:`Bring it up in stages with the current limited, checking each reading before the next.`, s:3, best:true, d:{trust:4,conf:5,health:5},
          after:`The power card comes up at ten percent current limit, then half, then full. The controller boots. The fans go to low speed, then high. At every hold Jun reads the numbers against the band he predicted, and each one sits inside it. At twenty to nine the rack is pulling cabin air through its sorbent beds in its own bay. Tiago writes the time on the procedure's last page.`,
          why:`First power of an integrated element goes in steps, with limits and expected values at each, so an interface fault shows up small and early. Integration checks the elements together, in place.`},
        {t:`Apply full power at once, with a hand on the breaker and every channel being logged.`, s:1, d:{trust:3,conf:1,health:0},
          after:`It comes up clean. If it hadn't, the logger would have recorded everything about the first quarter second, after it was over.`,
          why:`Logging and a hand on the breaker help, but staged power with limits keeps a fault small enough to recover from.`},
        {t:`Skip the procedure's holds. The stand-in has already powered through every connector.`, s:0, d:{trust:3,conf:-2,health:-3},
          after:`It comes up. The stand-in never drew power like a rack, so nothing on record says what the card did at inrush.`,
          why:`A stand-in doesn't load the interface the way the real element does. Each new element gets its own staged first power.`},
        {t:`Power the rack off a lab supply on the floor first, where a fault can't reach HEARTH.`, s:0, d:{trust:3,conf:-1,health:-3},
          after:`The rack runs fine on the lab supply. That's Tamarack's acceptance test again, and HEARTH's power is still untried with the rack on it.`,
          why:`Powering an element by itself repeats element testing. Integration checks it through the real interfaces it will use.`}
      ]},
    { id:`f10s10`, domain:`Technical`, task:`T8`, title:`Nine drops`,
      text:(s,all,G)=>{const p=s.picks||{};const sw=p[6]===1?`0.9.2`:p[6]===2?`0.9.2 plus two bench patches`:p[6]===3?`0.9.2, unit tests not run`:`branch build, no tag`;return [`Tiago had been running two shifts since the rack went in. When first shift came on Wednesday, second shift had left a page on the clipboard.`,`<prop type="doc" title="Integration anomaly report IAR-27-03, HEARTH rack bay (open)">Observed: rack controller drops off HEARTH's network. Nine times in fourteen hours, four to six seconds each.<br>Pattern: every drop within two seconds of the rack fans stepping up to high speed.<br>Configuration: real rack. W-114 dash 3, power. W-117 dash 3, data. Flight software ${sw}.<br>Effect: CO2 removal pauses during each drop. Rack recovers on its own.<br>Status: open.</prop>`,`Gus already had a spare harness over his shoulder. <span class="said" data-who="man">"Start swapping?"</span> he asked.`]},
      opts:[
        {t:`Start swapping harnesses one at a time, and note what changed after each swap.`, s:1, d:{trust:3,conf:1,health:0},
          after:`By noon three harnesses have been in and out. The notes say which ones, mostly.`,
          why:`One change at a time is right. Without the starting configuration recorded and a plan for each change, the troubleshooting can become the next problem.`},
        {t:`Keep the fans off high speed during integration, and come back to it in testing.`, s:0, d:{trust:3,conf:-2,health:-4},
          after:`Amara won't carry an open anomaly into the pressure test. Gus starts swapping harnesses after lunch.`,
          why:`Working around an anomaly leaves its cause in the system. Integration records it and finds the cause before moving on.`},
        {t:`Safe it, record the configuration, then troubleshoot from a written plan.`, s:3, best:true, d:{trust:4,conf:5,health:5},
          after:`Tiago puts the rack in standby. Jun photographs every connector and writes each harness into the report by dash number and serial. On the whiteboard they list what could cause it: power noise, the data harness, the controller, the software. Jun turns that into a numbered plan, one change per step, each with what it should show and how to put it back. Gus initials each step as he does it. By four the drops follow fan speed and nothing else. Jun pulls both drawings. Tamarack grounds the data cable's shield at the rack. HEARTH's drawing grounds it at both ends. Two grounds and a fan motor make a loop.`,
          why:`When integration hits an anomaly, make the system safe, record the configuration, and investigate from a plan, one change at a time. The cause comes before the fix, and every change is recorded so it can be undone.`},
        {t:`Send the rack back to Tamarack, since it's their controller that keeps dropping.`, s:0, d:{trust:2,conf:-2,health:-4},
          after:`Amara says the rack isn't going back up the highway for a fault that hasn't been found. Gus starts swapping harnesses after lunch.`,
          why:`An integration anomaly lives at the interface until shown otherwise. Shipping an element back before the cause is known can lose the evidence.`}
      ]},
    { id:`f10s11`, domain:`Technical management`, task:`M5`, title:`Dash one`,
      text:(s,all,G)=>{const p=s.picks||{};const blamed=G&&G.blamedsupplier;const noic=G&&G.nointerfacecontrol;return [`Wednesday night second shift put the stand-in's data harness into the rack bay, W-117 dash one, from the week twenty three set. It grounded the shield at HEARTH's end only, the old cargo way.`+(p[9]===2?` It was step six on Jun's plan.`:` It was one more harness in a long day.`),
        `By Thursday morning the rack had run eleven hours with its fans on high and hadn't dropped once.`+(blamed
          ?` Tamarack's engineer answered Jun's email at nine: yes, the rack had always grounded its shields at its own end.`
          :` Irena had seen it as soon as Jun showed her HEARTH's drawing. Tamarack had always grounded its shields at the rack. She'd pushed her lake week back two days to watch the night run, and didn't mention it.`)+(noic?` The grounding scheme had come up once, in the week eight email thread, and gone no further.`:``),
        `<span class="said" data-who="Tiago">"It works,"</span> Tiago said. <span class="said" data-who="Tiago">"Proof test's in two weeks. Leave it in, and make the drawing match."</span>`]},
      opts:[
        {t:`Record it as installed, change the shield drawing and ICD, and build a flight harness to it.`, s:3, best:true, d:{trust:4,conf:5,health:5},
          after:`By noon the as-built list says W-117 dash one is installed, temporary, with a red tag on the harness itself. A change request grounds the shield at HEARTH's end only, on the drawing and in a new ICD revision that finally says how both sides handle shields. The board approves it Friday. The shop builds W-117 dash five on Monday from flight wire, it goes in Tuesday, and the list changes again that afternoon.`,
          why:`Configuration management keeps the record matching the hardware. A change found in integration gets a change request, an impact assessment and a board decision; the baseline and interface documents are updated, and status accounting records what's installed at every step.`},
        {t:`Leave the dash one in for now, and record the swap in the anomaly report's closure.`, s:1, d:{trust:3,conf:1,health:0},
          after:`The anomaly report says what happened. The as-built list still says dash three, and the drawing still grounds both ends.`,
          why:`An anomaly record isn't the configuration record. The installed configuration and the baseline both have to change, through change control.`},
        {t:`Close the anomaly and leave the dash one in. It works, and the drawing can catch up.`, s:0, flag:`noconfigcapture`, d:{trust:4,conf:-3,health:-6},
          after:`The anomaly closes Thursday with one word: resolved. The as-built list says dash three. The drawing still grounds the shield at both ends, so the next harness the shop builds will bring the drops back.`,
          why:`A fix that isn't captured in configuration management leaves the record describing hardware that isn't there, and the baseline still calls for the fault.`},
        {t:`Put the flight dash three back, and keep hunting until the drops stop with it in place.`, s:0, d:{trust:3,conf:-1,health:-3},
          after:`The drops come back within the hour. Tiago puts the dash one back in at lunch, and the bay is where it started, minus a morning.`,
          why:`Once the cause is shown, the job is to change the design through control, not to keep searching for a different answer.`}
      ]},
    { id:`f10s12`, domain:`Technical management`, task:`M5`, title:`What's in it`,
      text:(s,all,G)=>{const hid=G&&G.hidrisk;return [`Monday of week twenty eight Odette needed one thing before she'd sign HEARTH into the proof test: that the module in the cell would be the module on the drawings. Ines came up from quality to ask the same question her own way.`+(hid?` The board's chair had asked to see the answer.`:``),`Brannock's fifteen year aging result on the long cure lot was due Friday.`,`<span class="said" data-who="woman">"What's in it?"</span> Ines asked. <span class="said" data-who="woman">"Not what's on the list. What's in it."</span>`]},
      opts:[
        {t:`Check the as-built list against the drawing tree on screen, and fix any mismatch.`, s:1, d:{trust:3,conf:1,health:0},
          after:`Every line on the list has a drawing. The list and the drawings agree. Neither one has been held up against what's bolted in the bay.`,
          why:`Status accounting keeps the records consistent with each other. An audit checks the records against the actual hardware.`},
        {t:`Use the build records. Every harness and part has signed paperwork, so it's covered.`, s:0, d:{trust:3,conf:-1,health:-3},
          after:`The records say how each part was built and tested. They can't say which ones ended up in the module.`,
          why:`A build record holds an element's history. Whether it's the one installed is a question for the audit.`},
        {t:`Skip it this time. Every integration check passed, so the configuration is fine.`, s:0, d:{trust:3,conf:-2,health:-4},
          after:`Odette won't sign on that, and the audit goes on the plan anyway. Passing checks show the system works, not that it's the system on the drawings.`,
          why:`Passing checks shows function. Configuration audits show the hardware is what the baseline says it is.`},
        {t:`Run a physical configuration audit: walk the module against the list and drawings.`, s:3, best:true, d:{trust:4,conf:5,health:5},
          after:`Jun and Ines plan it for Monday of week twenty nine, the day before proof: every item on the as-built list found in the module, its label and serial read, its drawing and revision checked. Ines wants two people on each check and no one checking their own work. A functional audit against the requirements goes on the plan for the end of testing.`,
          why:`A physical configuration audit confirms the item as built matches its design documents, by looking at the hardware. A functional audit confirms it performs as required. Status accounting alone checks the records against each other.`}
      ]}
  ],
  exercise: { after:`f10s12`, title:`Which process?`, intro:`Six things that happened in HEARTH's integration weeks. Pick the process each one belongs to.`,
    items:[
      {prompt:`The harness shop sends a wire question back to design before building.`, choices:[`Implementation`,`Integration`,`Verification`,`Transition`], answer:0, why:`Realizing an element to its design, and sending departures back to design, is implementation.`},
      {prompt:`The rack goes in only after power, data and coolant are each checked.`, choices:[`Verification`,`Implementation`,`Integration`,`Operation`], answer:2, why:`Choosing the order elements come together, and checking each step, is integration.`},
      {prompt:`The as-built list changes the day a data harness is swapped.`, choices:[`Information management`,`Configuration management`,`Quality assurance`,`Knowledge management`], answer:1, why:`Recording what's actually installed is configuration status accounting, part of configuration management.`},
      {prompt:`The test cell's gauges get calibrated and its compressor service moves.`, choices:[`Project planning`,`Portfolio management`,`Quality management`,`Infrastructure management`], answer:3, why:`Keeping facilities and equipment ready for projects is infrastructure management.`},
      {prompt:`Tamarack's marked pages are visible only to named people and kept fifteen years.`, choices:[`Information management`,`Configuration management`,`Acquisition`,`Knowledge management`], answer:0, why:`Deciding who can see project information, and how long it's kept, is information management.`},
      {prompt:`The relief valve lesson becomes a line on FRO's design review checklist.`, choices:[`Information management`,`Quality assurance`,`Knowledge management`,`Risk management`], answer:2, why:`Putting a lesson where future work will reuse it is knowledge management.`}
    ]},
  quiz: [
    {q:`What is the main purpose of the integration process?`, opts:[`Combine realized elements into a whole that meets requirements and design`,`Build each separate element to the detail its own design calls for`,`Confirm with objective evidence that the system meets its requirements`,`Move the finished system to its users, along with the support it needs`], a:0, why:`Integration synthesizes realized elements into a system consistent with the requirements, architecture and design. Building elements is implementation, confirming requirements is verification, and handover is transition.`, task:`T8`, domain:`Technical`},
    {q:`Why is incremental build-up often preferred to bringing every element together at once?`, opts:[`It removes the need for later system verification`,`It needs fewer simulators and other enabling systems`,`A new fault usually lies in the last element added`,`It lets each element skip its own testing beforehand`], a:2, why:`Adding and checking one element or group at a time localizes faults. Big bang integration saves set-up but makes faults hard to find.`, task:`T8`, domain:`Technical`},
    {q:`One element won't be ready when integration needs to start. What's the usual approach?`, opts:[`Wait, since integration without every element proves little`,`Use a simulator, stub or stand-in in its place for now`,`Integrate the rest, and leave that element's interfaces out`,`Ask its supplier to ship it now and finish testing later`], a:1, why:`Simulators, stubs and stand-ins are integration enabling systems. They let integration begin and check interfaces before every element is ready.`, task:`T8`, domain:`Technical`},
    {q:`What do integration checks mainly confirm?`, opts:[`That the system satisfies all of its stakeholder needs`,`That each element was built to its own detail drawing`,`That the system is ready for handover to its operator`,`That elements are assembled right and interfaces work`], a:3, why:`Integration checks confirm correct assembly and that each interface works as defined. Meeting requirements is verification, meeting needs is validation, and building to drawings is implementation.`, task:`T8`, domain:`Technical`},
    {q:`An anomaly appears during integration. What should come first?`, opts:[`Swap the likeliest part and see if the fault clears`,`Return the suspect element to its supplier for study`,`Work around it, and log it for verification to handle`,`Make the system safe and record its configuration`], a:3, why:`Safe the system and preserve the configuration first, so the evidence survives. Then investigate from a plan, one recorded change at a time.`, task:`T8`, domain:`Technical`},
    {q:`What is the main purpose of the implementation process?`, opts:[`Realize a specified system element to its design`,`Combine elements into a complete working system`,`Define the system's logical and physical architecture`,`Confirm the finished system meets stakeholder needs`], a:0, why:`Implementation realizes one system element, whether made, bought or reused, to its design. Combining elements is integration.`, task:`T7`, domain:`Technical`},
    {q:`A shop can't get the material its drawing specifies. What should implementation do?`, opts:[`Use the closest equal on the shelf, and note it`,`Send the question back to design to decide`,`Wait for the specified material, however long`,`Use a substitute, and let testing catch issues`], a:1, why:`Implementation builds to the design. A constraint like an unavailable material goes back to design definition, which decides whether a substitute meets the design.`, task:`T7`, domain:`Technical`},
    {q:`Along with the element itself, what should implementation hand on?`, opts:[`The final verification report for the whole system`,`An updated concept of operations for the users`,`A record of how the element was built and tested`,`The integration strategy for all the system's elements`], a:2, why:`Implementation records the evidence for each element: materials, serials, who built and tested it, and the results, so integration and configuration records can use it.`, task:`T7`, domain:`Technical`},
    {q:`Which process provides and maintains the facilities, tools and equipment projects need?`, opts:[`Life cycle model management`,`Configuration management`,`Infrastructure management`,`Portfolio management`], a:2, why:`Infrastructure management is the organizational process that provides, maintains and improves facilities, tools, equipment, IT and services for projects.`, task:`O2`, domain:`Agreement and organizational`},
    {q:`A planned project will need the same test cell as a current one. What should infrastructure management do?`, opts:[`Let whichever project books the cell first keep it`,`Leave the two project managers to work it out`,`Build a second test cell before the new project starts`,`Plan the cell's capacity and upkeep for both projects`], a:3, why:`Infrastructure management plans capacity, maintenance and changes from all the projects' needs, at the organization's level, with the portfolio in view.`, task:`O2`, domain:`Agreement and organizational`},
    {q:`What does a physical configuration audit confirm?`, opts:[`The item performs as its requirements say it should`,`The item as built matches its design documents`,`Every change request has an approved disposition`,`The item's supplier follows its own quality system`], a:1, why:`A physical configuration audit compares the item as built with its design documentation. A functional configuration audit confirms it performs as required.`, task:`M5`, domain:`Technical management`},
    {q:`Which process decides what project information is kept, where, who can see it, and for how long?`, opts:[`Information management`,`Configuration management`,`Knowledge management`,`Quality assurance`], a:0, why:`Information management plans how project information is identified, stored, protected, shared, retained and disposed of. Knowledge management works across projects.`, task:`M6`, domain:`Technical management`},
    {q:`What best shows an organization has learned a lesson from a project?`, opts:[`A full report on it sits in the lessons folder`,`It changed a standard, checklist or training`,`It was presented at the end of project review`,`Every team member signed that they'd read it`], a:1, why:`Knowledge management puts lessons where future work will meet them, in standards, checklists, training and models. A report alone changes nothing.`, task:`O6`, domain:`Agreement and organizational`},
    {q:`An integration fault traces to a grounding detail neither side's interface document covered. Which method most directly prevents this?`, opts:[`More system level testing after integration is complete`,`A weighted trade study, with a sensitivity check on it`,`Interface management, defining and controlling interfaces`,`Risk management, rating the fault's likelihood and impact`], a:2, why:`Interface management defines each interface's characteristics fully, records them in controlled interface documents, and manages changes, so details like grounding aren't left to either side.`, task:`X3`, domain:`Cross-cutting`},
    {q:`On the V model, integration on the right side pairs most directly with which left side activity?`, opts:[`Business or mission analysis`,`Stakeholder needs definition`,`Implementation of each element`,`System architecture definition`], a:3, why:`Architecture defines the elements and their interfaces, and integration on the opposite side of the V puts those elements together and checks those interfaces.`, task:`X1`, domain:`Cross-cutting`}
  ],
  closing:(s,all,G)=>{G=G||{};const pk=s.picks||{};const noconf=(s.flags&&s.flags.noconfigcapture)||G.noconfigcapture;const cap=pk[10]===0;const planned=pk[9]===2;
    return [
    `Friday of week twenty eight Gus was putting the troubleshooting kit back in the cage. Nadia was at Tiago's desk with the proof test procedure, her phone face down beside it, because Brannock's result was due by five.`,
    `Gus came out of the cage with a harness coiled in a clear bag`+(pk[4]!==2?`, its traveler folded inside`:``)+`. He set it on the desk between the procedure and her phone. Nadia turned the bag until the label came around. W-114, dash three. Serial seven.`,
    `<span class="said" data-who="Tiago">"That's in the rack."</span>`,
    `<span class="said" data-who="man">"Pulled it myself,"</span> Gus said. <span class="said" data-who="man">"Wednesday, end of my shift. I was going to put it back first thing."</span>`,
    `Power had been the first branch on the whiteboard. He'd put in the stand-in's harness to rule it out, nothing changed, and he'd bagged the flight one so it wouldn't get stepped on. That night the drops stopped, and there was never a next step.`+(planned
      ?` It was on Jun's plan in Gus's initials. Step four: W-114 to dash one, no change. Step five: restore W-114. Step five had nothing beside it. Step six had second shift's initials. Jun's drawings had pointed at the shield by four, and second shift had gone straight to it.`
      :pk[9]===0
        ?` Gus's notes said what came out. Nothing in them said what had to go back.`
        :` None of it was on paper. The troubleshooting had run in marker on a whiteboard, and the whiteboard had been wiped Monday for the proof test schedule.`),
    `Nadia opened the as-built list on her laptop. W-114, dash three, serial seven, installed week twenty seven. It said exactly what should have been there.`+(cap
      ?` W-117 had changed twice in a week, and both changes were on the list. W-114 had never been changed on purpose, so it had never been changed at all.`
      :noconf
        ?` Below it, W-117 said dash three as well. It had said that since Thursday, over a harness that wasn't.`
        :``),
    `In the rack bay, under the overhead channel's cover, the rack's power ran through a dash one: built in week twenty three for a steel box of ballast, out of cargo wire.`+(pk[1]===1?` Nadia had turned that wire away herself in week twenty five, for a crewed cabin.`:``)+(pk[4]===0
      ?(cap
        ?` It had yellow tape at both ends. Second shift had worked beside it Tuesday putting in dash five, and nobody looks twice at a harness that isn't the problem.`
        :` It had yellow tape at both ends. It had been wearing it all week, under a cover that only comes off for maintenance.`)
      :``),
    `<span class="said" data-who="Tiago">"It's run clean all week,"</span> Tiago said.`,
    `<span class="said" data-who="Nadia">"On that."</span>`+(pk[11]===3?` Ines's walk-down was Monday. It would have turned up then.`:``),
    `The night somebody leaves a plug in. She'd said it at Callie's sink. It hadn't been a plug, and the man who'd left it was the one who carried it out of the cage. Callie would have something to say about that. Nadia didn't know yet what she'd say back.`,
    `Gus looked back at the cage. <span class="said" data-who="man">"There was a seal in a bag on that shelf for two years once,"</span> he said. <span class="said" data-who="man">"This one's been nine days."</span>`
  ]},
  episode:{src:`audio/full-ch10.mp3`, len:`about 35 minutes`},
  next:`Test Like You Fly`
});
