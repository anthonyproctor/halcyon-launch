// The Halcyon Launch (PMP) labs, v2 world: Tallgrass Aerospace building the Halcyon relief ship for the Ares Relief Authority (ARA), 2061.
// Each lab is self contained: its numbers, network and cast list are stated in the lab itself, so they don't depend on the exact figures
// in the chapter files. They attach to chapters by topic through AT below; re-point a topic by changing its chapter number.
// v2 chapters: stakeholders are taught in ch1 (page one), the critical path in ch3, earned value in ch5.
// Formulas follow the conventions the course teaches (PMBOK and the PMP outline): CV = EV minus AC, SV = EV minus PV, CPI = EV / AC,
// SPI = EV / PV, EAC = BAC / CPI when current cost performance continues, ETC = EAC minus AC, VAC = BAC minus EAC,
// TCPI to hit BAC = (BAC minus EV) / (BAC minus AC). Critical path = longest path, total float = late start minus early start.
// Power and interest grid: high power and high interest manage closely, high power and low interest keep satisfied, low power and high
// interest keep informed, low power and low interest monitor. Copy rules: plain words, no dashes, Ruth talks to "you".
(function(){
const AT={stakeholders:1,schedule:3,ev:5}; // topic -> Full Course chapter
const usd=n=>(n<0?"-":"")+"$"+Math.round(Math.abs(n)).toLocaleString("en-US"),f2=n=>n.toFixed(2);
// weekly status for one work package, the departure stage valve test campaign, in $ thousands (week 1 to 6). BAC $2,040,000.
const WK=[[150,140,160],[320,290,330],[500,430,510],[670,570,680],[840,710,850],[1000,850,1000]];

const ev={id:"pmev",kind:"calc",title:"Run the numbers yourself",
  hook:[`Every Friday Imogen Hale's office at the ARA gets three numbers from you: what we planned to have done, what we actually got done, and what it cost. Here are the first six weeks of one work package, Hana's valve test campaign for the departure stage. Budget at completion is $2,040,000.`,
    `Load a week, read the gauges, and answer like it's Monday's call with the sponsor. Numbers first, then what they mean.`],
  inputs:[{id:"bac",label:"Budget at completion (BAC)",min:500,max:4000,step:10,value:2040,unit:"$K"},{id:"pv",label:"Planned value (PV)",min:0,max:4000,step:10,value:670,unit:"$K"},{id:"ev",label:"Earned value (EV)",min:0,max:4000,step:10,value:570,unit:"$K"},{id:"ac",label:"Actual cost (AC)",min:1,max:4000,step:10,value:680,unit:"$K"}],
  presets:WK.map(([pv,e,ac],i)=>({label:`Week ${i+1}`,v:{bac:2040,pv,ev:e,ac}})),
  compute:v=>{const K=1000,pv=v.pv*K,e=v.ev*K,ac=v.ac*K,bac=v.bac*K;const cpi=e/ac,spi=pv?e/pv:NaN,eac=bac/cpi,etc=eac-ac,vac=bac-eac,tcpi=(bac-e)/(bac-ac);
    const c=x=>x>=1?"good":x>=0.9?"mid":"bad";
    return {rows:[["CV",usd(e-ac),e-ac<0?"bad":"good"],["SV",usd(e-pv),e-pv<0?"bad":"good"],["CPI",f2(cpi),c(cpi)],["SPI",isNaN(spi)?"n/a":f2(spi),c(spi)],["EAC (BAC ÷ CPI)",usd(eac)],["ETC",usd(etc)],["VAC",usd(vac),vac<0?"bad":"good"],["TCPI to BAC",bac>ac?f2(tcpi):"spent",bac<=ac?"bad":tcpi>1.1?"bad":tcpi>1?"mid":"good"]],
      note:`${cpi<1?"Over budget":"On or under budget"} and ${spi<1?"behind schedule":"on or ahead of schedule"}. Under 1 is bad for both indexes.`,noteCls:cpi<1||spi<1?"bad":"good"}},
  source:`Practice figures for one Halcyon work package, stated here in full. Formulas as taught in the course: CPI = EV ÷ AC, SPI = EV ÷ PV, EAC = BAC ÷ CPI, ETC = EAC minus AC, VAC = BAC minus EAC, TCPI = (BAC minus EV) ÷ (BAC minus AC).`,
  questions:[
   {id:"cpi",type:"number",q:`Week 4: PV $670,000, EV $570,000, AC $680,000. What's the CPI, to two decimals?`,a:0.8382,tol:0.005,
    hints:[`EV always comes first. CPI is EV over the cost.`],
    sol:[`CPI = EV ÷ AC = 570,000 ÷ 680,000 = 0.84. Every dollar spent bought 84 cents of planned work.`]},
   {id:"eac",type:"number",q:`If that efficiency holds, what will the whole campaign cost? EAC in dollars.`,a:2433684,tol:6000,unit:"$",
    hints:[`Current performance continues means BAC divided by CPI.`],
    sol:[`EAC = BAC ÷ CPI = 2,040,000 ÷ 0.8382 = about $2,433,700. With CPI rounded to 0.84 you get $2,428,600. Either is fine. That's roughly $394,000 over, which is the VAC.`]},
   {id:"tcpi",type:"number",q:`What efficiency would the rest of the work need to finish on the $2,040,000 budget? TCPI, two decimals.`,a:1.0809,tol:0.005,
    hints:[`Work remaining over money remaining.`,`(BAC minus EV) ÷ (BAC minus AC).`],
    sol:[`(2,040,000 minus 570,000) ÷ (2,040,000 minus 680,000) = 1,470,000 ÷ 1,360,000 = 1.08. The team has been running at 0.84. Asking for 1.08 is a planning conversation, not a pep talk.`]},
   {id:"spiwk",type:"choice",q:`Load the weeks one at a time. In which week did SPI first drop below 0.90?`,opts:["Week 1","Week 2","Week 3","Week 4","Week 5","Week 6"],a:2,
    hints:[`Watch the SPI gauge as you step through the week buttons.`],
    sol:[`Week 1: 140 ÷ 150 = 0.93. Week 2: 290 ÷ 320 = 0.91. Week 3: 430 ÷ 500 = 0.86. That's the week to have caught it, three weeks before anyone said the word late.`]}
  ]};

// network: A 5 (none), B 4 (A), C 6 (A), D 8 (none), G 5 (D), E 5 (B,C,G), F 4 (E). Departure stage valve and flight software into integrated test.
// Forward pass: A 0-5, B 5-9, C 5-11, D 0-8, G 8-13, E 13-18, F 18-22. Backward: F 18, E 13, G 8, D 0, C 7, B 9, A 2.
// Critical D G E F, 22 days. Float: A 2, B 4, C 2.
const cp={id:"pmcp",kind:"sort",title:"Find the critical path",
  hook:[`Here's a slice of the departure stage schedule, in working days. The valve on one side: install it in the high bay, then leak check it and cycle test it at the same time, since both only need the valve installed. The flight software build and its independent review on the other. Both feed integrated testing, then the test conductor runs the stage on the stand.`,
    `Sort every activity: on the critical path, or has float. Then tell me how long it takes and how much room the cycle testing has. Don't guess from which one looks scariest.`],
  sort:{mode:"buckets",buckets:[{id:"crit",label:"On the critical path (zero float)"},{id:"float",label:"Has float"}],
    items:[{id:"A",label:"A Valve install",note:"5 days"},{id:"B",label:"B Leak check",note:"4 days"},{id:"C",label:"C Valve cycle testing",note:"6 days"},{id:"D",label:"D Flight software build",note:"8 days"},{id:"G",label:"G Independent software review",note:"5 days"},{id:"E",label:"E Integrated testing",note:"5 days"},{id:"F",label:"F Stand test",note:"4 days"}],
    answer:{A:"float",B:"float",C:"float",D:"crit",G:"crit",E:"crit",F:"crit"},
    table:[["Activity","Days","Depends on"],["A Valve install","5","none"],["B Leak check","4","A"],["C Valve cycle testing","6","A"],["D Flight software build","8","none"],["G Independent software review","5","D"],["E Integrated testing","5","B, C, G"],["F Stand test","4","E"]]},
  source:`A practice network in the Halcyon's world. Durations and dependencies are all in the table above.`,
  questions:[
   {id:"sort",type:"sort",q:`Put every card in the right box, then check.`,
    hints:[`List every path from start to finish and add up the days. There are three.`,`A, B, E, F is 18. A, C, E, F is 20. D, G, E, F is 22.`],
    sol:[`The longest path is D, G, E, F at 22 days, so those four have zero float. A, B and C sit on shorter paths, so they can slip a little without moving the finish.`]},
   {id:"dur",type:"number",q:`How long is the project, in working days?`,a:22,tol:0,unit:"days",
    hints:[`The project takes as long as its longest path.`],
    sol:[`22 days: 8 for the software build, 5 for the independent review, 5 for integrated testing, 4 on the stand.`]},
   {id:"flt",type:"number",q:`How much total float does C, valve cycle testing, have?`,a:2,tol:0,unit:"days",
    hints:[`Find the longest path C is on and compare it with the critical path.`],
    sol:[`C's longest path is A, C, E, F at 20 days. 22 minus 20 = 2 days of float. With a forward and backward pass, C's early start is 5 and its late start is 7, so total float is 7 minus 5 = 2. The valve feels scary, but the software is what sets the date here.`]}
  ]};

const sh={id:"pmgrid",kind:"sort",title:"Who goes where on the grid",
  hook:[`A rescue has more people riding on it than people building it. Some of them can't even come to the meeting. Here are eight, with what each one can change and how closely they're watching.`,
    `Power is what they can change. Interest is how much they care how it goes. Put each one on the grid. Get it wrong and you'll bore the people who can stop you and ignore the ones who'll live with the result.`],
  sort:{mode:"buckets",grid:{x:"Interest",y:"Power"},buckets:[{id:"ks",label:"Keep satisfied (high power, low interest)"},{id:"mc",label:"Manage closely (high power, high interest)"},{id:"mo",label:"Monitor (low power, low interest)"},{id:"ki",label:"Keep informed (low power, high interest)"}],
    items:[{id:"imogen",label:"Imogen Hale, ARA director",note:"The sponsor. Can move the money or stop the program. Asks about it every day."},{id:"garrett",label:"Garrett Lyle, Tallgrass CEO",note:"Owns the company building the ship and decides who works on it. Wants a weekly status."},
      {id:"finance",label:"The ARA's partner finance committee",note:"Approves anything that touches the budget. Reviews the program once a year."},{id:"range",label:"The range safety office at the Cape",note:"Can stop a launch with a failed review. Hasn't asked about the Halcyon yet."},
      {id:"station",label:"The 212 people on Ares Station",note:"Their lives ride on it, and they follow every log. Can't approve or stop anything from Mars."},{id:"families",label:"Families of Ares",note:"The crew's families on Earth. Want to know what's coming next. Can't change scope or dates."},
      {id:"vendor",label:"The cafeteria contractor at the plant",note:"Paid monthly on a fixed contract. Little say, little stake in the date."},{id:"rooms",label:"Tallgrass's facilities team",note:"Books the rooms for review week. No say, no stake."}],
    answer:{imogen:"mc",garrett:"mc",finance:"ks",range:"ks",station:"ki",families:"ki",vendor:"mo",rooms:"mo"}},
  source:`A practice cast in the Halcyon's world. Each card says what that person can change and how closely they're watching, which is all the grid needs.`,
  questions:[
   {id:"sort",type:"sort",q:`Place all eight, then check.`,
    hints:[`Read each card twice: once for power (can they change or stop it?) and once for interest (do they watch it?).`,`Two in each box.`],
    sol:[`Manage closely: Imogen Hale and Garrett Lyle. Keep satisfied: the finance committee and range safety. Keep informed: the station and Families of Ares. Monitor: the cafeteria contractor and facilities. Being far away doesn't make the station low interest. It makes them easy to forget, which is why they go on the grid.`]},
   {id:"move",type:"choice",q:`Range safety calls and asks for weekly detail on every change to the departure stage. What happens on the grid?`,opts:[`They move to manage closely`,`They stay in keep satisfied`,`They drop to monitor`],a:0,
    hints:[`Their power didn't change. What did?`],
    sol:[`Their interest just went up and their power was already high, so they move to manage closely. The grid isn't a one time chart. Update the register when people change.`]}
  ]};

(window.HALCYON_LABS=window.HALCYON_LABS||{}).pmp={[AT.stakeholders]:[sh],[AT.schedule]:[cp],[AT.ev]:[ev]};
})();
