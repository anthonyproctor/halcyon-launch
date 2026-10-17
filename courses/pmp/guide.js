// The Halcyon Launch (PMP) field guide (prototype, 2026-10-17): pictures of the places and machines the book keeps naming, to glance at
// while you listen. engine.js (renderFieldGuide, fgSheet, fgLink) reads window.HALCYON_GUIDE[course id].
// Each entry: id, title, kicker, bg (the picture's ground, behind its list thumbnail), aliases (words in the story that link to it, matched as whole words, case blind), svg, what (three plain
// sentences on what it is and how it works), levels [{from, text}]. A level shows once the reader has reached chapter `from`. An entry
// with no level reached shows only "Unlocks in chapter N". Inside the svg, any element with data-from="N" is dropped until chapter N.
// Canon: every fact is from full/v2/ch*.js (the bible only where noted). Keep text to plain story facts already in the chapters; never
// copy bible text here, and never say who pushed AR 2207 closed. Copy rules: plain words, contractions, no dashes.
// Pictures: hand written, flat, the palette of art/v2. Labels are real <text>, sized for a 480 wide viewBox shown about 350px wide on a
// phone (18 and up reads at 13px). No ids, no <style> (the svg is inlined, more than once on a page), no external images or fonts.
(function(){
const F='font-family="Arial,Helvetica,sans-serif"';

const breather=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 400" role="img">
<title>The Breather, cut away</title>
<desc>A cutaway of the Breather oxygen plant. Water comes in on the left into a water tank. Power and controls feed a stack of cells in the middle, which splits the water. Oxygen leaves on the right. A dashed amber box around the stacks marks the part that wears out, and the controls screen shows the stacks' cell voltages.</desc>
<rect width="480" height="400" fill="#16303f"/>
<g ${F}>
<text x="16" y="34" font-size="17" font-weight="700" letter-spacing="2" fill="#8dbcd4">THE BREATHER</text>
<rect x="120" y="58" width="240" height="282" rx="16" fill="#1d4052" stroke="#8dbcd4" stroke-width="2"/>
<path d="M120 300 l10 -8 l10 8 l10 -8 l10 8" stroke="#8dbcd4" stroke-width="2" fill="none" opacity=".5"/>
<rect x="140" y="76" width="200" height="46" rx="6" fill="#0b141b" stroke="#5fa37a" stroke-width="2"/>
<polyline points="254,118 268,114 282,115 296,111 310,112 326,107" stroke="#5fa37a" stroke-width="2.5" fill="none"/>
<text x="290" y="97" font-size="14" fill="#7fd0a0" text-anchor="middle">cell voltages</text>
<text x="150" y="106" font-size="20" font-weight="700" fill="#7fd0a0">Controls</text>
<line x1="240" y1="122" x2="240" y2="152" stroke="#5fa37a" stroke-width="2" stroke-dasharray="4 4"/>
<text x="240" y="146" font-size="18" font-weight="700" fill="#fff6dc" text-anchor="middle" stroke="#1d4052" stroke-width="6" paint-order="stroke">Stacks</text>
<line x1="152" y1="152" x2="152" y2="272" stroke="#8a96a3" stroke-width="5" stroke-linecap="round"/>
<line x1="328" y1="152" x2="328" y2="272" stroke="#8a96a3" stroke-width="5" stroke-linecap="round"/>
<rect x="160" y="158" width="160" height="12" rx="3" fill="#c9ccd1"/>
<rect x="160" y="176" width="160" height="12" rx="3" fill="#c9ccd1"/>
<rect x="160" y="194" width="160" height="12" rx="3" fill="#c9ccd1"/>
<rect x="160" y="212" width="160" height="12" rx="3" fill="#c9ccd1"/>
<rect x="160" y="230" width="160" height="12" rx="3" fill="#c9ccd1"/>
<rect x="160" y="248" width="160" height="12" rx="3" fill="#c9ccd1"/>
<rect x="144" y="152" width="192" height="114" rx="8" fill="none" stroke="#e0b25c" stroke-width="3" stroke-dasharray="8 6"/>
<text x="110" y="196" font-size="18" font-weight="700" fill="#f6d48a" text-anchor="end">Wears</text>
<text x="110" y="218" font-size="18" font-weight="700" fill="#f6d48a" text-anchor="end">out here</text>
<line x1="114" y1="208" x2="142" y2="208" stroke="#e0b25c" stroke-width="2.5"/>
<rect x="140" y="286" width="94" height="40" rx="6" fill="#23395b" stroke="#5aa0d8" stroke-width="2"/>
<text x="187" y="312" font-size="18" font-weight="700" fill="#cfe6f7" text-anchor="middle">Water</text>
<line x1="187" y1="286" x2="187" y2="266" stroke="#5aa0d8" stroke-width="4"/>
<rect x="246" y="286" width="94" height="40" rx="6" fill="#3a3028" stroke="#e0b25c" stroke-width="2"/>
<path d="M266 296 l-6 12 h8 l-5 12" stroke="#f6d48a" stroke-width="2.5" fill="none" stroke-linejoin="round"/>
<text x="304" y="312" font-size="18" font-weight="700" fill="#f6d48a" text-anchor="middle">Power</text>
<line x1="293" y1="286" x2="293" y2="266" stroke="#e0b25c" stroke-width="4"/>
<path d="M8 306 H132" stroke="#5aa0d8" stroke-width="5"/><path d="M128 298 l12 8 l-12 8z" fill="#5aa0d8"/>
<text x="62" y="292" font-size="18" font-weight="700" fill="#cfe6f7" text-anchor="middle">Water in</text>
<path d="M328 186 H462" stroke="#8dbcd4" stroke-width="5"/><path d="M460 178 l14 8 l-14 8z" fill="#8dbcd4"/>
<text x="412" y="172" font-size="18" font-weight="700" fill="#cfe6f7" text-anchor="middle">Oxygen out</text>
<text x="464" y="384" font-size="15" fill="#a9b6c2" text-anchor="end">Cutaway, not to scale</text>
</g>
</svg>`;

const campus=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 440" role="img">
<title>The Watkins campus, a map</title>
<desc>A map of the Tallgrass campus in Watkins. I-70 runs across the top, from Denver on the left toward Kansas on the right. Below it the high bay sits on one side of the access road and flight control, with its wind sock, on the other. A gravel road runs two miles out across the prairie to the test stand and its blockhouse. A pronghorn stands by the access road and the wind blows east.</desc>
<rect width="480" height="440" fill="#26352d"/>
<g stroke="#4f6b5a" stroke-width="2" stroke-linecap="round" opacity=".7">
<path d="M40 300 l4 -8 M48 300 l-2 -9 M420 200 l4 -8 M428 200 l-2 -9 M250 380 l4 -8 M258 380 l-2 -9 M360 250 l4 -8 M368 250 l-2 -9 M130 360 l4 -8 M138 360 l-2 -9"/>
</g>
<g ${F}>
<rect x="0" y="40" width="480" height="30" fill="#454d55"/>
<path d="M0 55 H480" stroke="#f6d48a" stroke-width="2" stroke-dasharray="14 12"/>
<text x="10" y="28" font-size="18" font-weight="700" fill="#e7e5e0">&#8592; Denver</text>
<text x="240" y="28" font-size="18" font-weight="700" fill="#e7e5e0" text-anchor="middle">I-70</text>
<text x="470" y="28" font-size="18" font-weight="700" fill="#e7e5e0" text-anchor="end">Kansas &#8594;</text>
<path d="M200 70 V250" stroke="#8a96a3" stroke-width="10"/>
<text x="222" y="248" font-size="15" fill="#c9ccd1" transform="rotate(-90 222 248)">access road</text>
<rect x="50" y="96" width="130" height="92" rx="4" fill="#f3f1ec" stroke="#c9ccd1" stroke-width="2"/>
<text x="115" y="138" font-size="20" font-weight="700" fill="#1d2024" text-anchor="middle">High bay</text>
<text x="115" y="162" font-size="13" font-weight="700" letter-spacing="2" fill="#596876" text-anchor="middle">TALLGRASS</text>
<rect x="226" y="112" width="128" height="46" rx="3" fill="#c9ccd1" stroke="#8a96a3" stroke-width="2"/>
<text x="290" y="141" font-size="17" font-weight="700" fill="#1d2024" text-anchor="middle">Flight control</text>
<line x1="372" y1="98" x2="372" y2="158" stroke="#e7e5e0" stroke-width="3"/>
<path d="M374 100 L410 105 L410 115 L374 120 Z" fill="#e0553b"/>
<path d="M386 102 V118 M398 103 V117" stroke="#f3f1ec" stroke-width="3"/>
<text x="420" y="140" font-size="16" fill="#e7e5e0" text-anchor="middle">Wind sock</text>
<g data-from="4"><rect x="62" y="188" width="78" height="36" rx="2" fill="#8a96a3" stroke="#c9ccd1" stroke-width="2"/>
<text x="101" y="246" font-size="17" font-weight="700" fill="#e7e5e0" text-anchor="middle">Building 6</text></g>
<g transform="translate(234 206) scale(1.5)"><path d="M0 10 q10 -8 24 -2 l4 -8 l3 2 l-3 9 v10 h-3 v-8 h-16 v8 h-3 z" fill="#c8945a"/><path d="M27 0 l-1 -6 M30 1 l2 -6" stroke="#2b2f36" stroke-width="2"/><path d="M4 8 h14" stroke="#f3f1ec" stroke-width="3"/></g>
<path d="M200 250 C 250 300, 320 320, 392 344" stroke="#b39a6a" stroke-width="6" fill="none" stroke-dasharray="12 7"/>
<text x="258" y="336" font-size="17" font-weight="700" fill="#e7d7b0" text-anchor="middle">2 miles</text>
<text x="258" y="356" font-size="17" font-weight="700" fill="#e7d7b0" text-anchor="middle">of gravel</text>
<g data-from="9"><path d="M206 256 l12 -12 M212 262 l12 -12 M372 346 l6 -14 M380 348 l6 -14" stroke="#e7e5e0" stroke-width="2.5" stroke-linecap="round"/>
<text x="330" y="304" font-size="16" font-weight="700" fill="#e7d7b0" text-anchor="middle">stand road</text></g>
<g transform="translate(392 318)"><path d="M0 0 V52 M30 0 V52 M0 10 L30 26 M30 10 L0 26 M0 30 L30 46 M30 30 L0 46" stroke="#c9ccd1" stroke-width="2.5" fill="none"/>
<rect x="9" y="4" width="12" height="44" rx="5" fill="#eef3f7"/><circle cx="0" cy="2" r="2.5" fill="#fff6dc"/><circle cx="30" cy="2" r="2.5" fill="#fff6dc"/></g>
<text x="466" y="392" font-size="18" font-weight="700" fill="#e7e5e0" text-anchor="end">Test stand</text>
<g data-from="2"><rect x="330" y="362" width="34" height="20" rx="2" fill="#3a3d44" stroke="#c9ccd1" stroke-width="2"/>
<text x="320" y="410" font-size="17" font-weight="700" fill="#e7e5e0" text-anchor="middle">Blockhouse</text></g>
<g stroke="#8dbcd4" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".85">
<path d="M330 214 q20 -10 40 0 t40 0"/><path d="M350 236 q20 -10 40 0 t40 0"/><path d="M322 258 q20 -10 40 0 t40 0"/>
</g>
<text x="452" y="242" font-size="16" fill="#cfe6f7" text-anchor="end" dy="34">wind</text>
<g data-from="10"><path d="M62 402 L14 430" stroke="#e7e5e0" stroke-width="3"/><path d="M8 434 l4 -15 l11 10 z" fill="#e7e5e0"/>
<text x="34" y="434" font-size="16" font-weight="700" fill="#e7e5e0">to Colorado Air and Space Port</text></g>
<g transform="translate(452 84)"><path d="M0 22 V0 M-6 8 L0 0 L6 8" stroke="#e7e5e0" stroke-width="2.5" fill="none"/><text x="0" y="40" font-size="15" font-weight="700" fill="#e7e5e0" text-anchor="middle">N</text></g>
<text x="472" y="434" font-size="14" fill="#a9b6c2" text-anchor="end">Not to scale</text>
</g>
</svg>`;

const stand=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 560" role="img">
<title>The test stand, Stand 2</title>
<desc>Stand 2 at night: a tower of white lights holding the departure stage, with frost blankets over its lower half and a crew member at its base for scale. The main oxidizer isolation valve, MOIV-1, sits low on the stage. The blockhouse is out on the prairie, about four hundred meters away. Below, a plot of cycle 3 from August 2059 shows the valve position reading jumping for 40 milliseconds, and a downstream pressure channel rippling inside the same 40 milliseconds.</desc>
<rect width="480" height="560" fill="#16303f"/>
<g ${F}>
<text data-from="2" x="16" y="34" font-size="17" font-weight="700" letter-spacing="2" fill="#8dbcd4">STAND 2</text>
<rect x="0" y="360" width="364" height="30" fill="#2b333b"/><rect x="386" y="360" width="94" height="30" fill="#2b333b"/>
<path d="M366 358 l-6 34 M388 358 l-6 34" stroke="#8a96a3" stroke-width="2.5"/>
<g stroke="#8a96a3" stroke-width="3" fill="none">
<path d="M222 60 V360 M338 60 V360"/>
<path d="M222 100 H338 M222 160 H338 M222 220 H338 M222 280 H338 M222 340 H338"/>
<path d="M222 100 L250 130 M338 100 L310 130 M222 220 L250 250 M338 220 L310 250" stroke-width="2"/>
</g>
<g fill="#fff6dc"><circle cx="222" cy="64" r="4"/><circle cx="338" cy="64" r="4"/><circle cx="222" cy="130" r="3.5"/><circle cx="338" cy="130" r="3.5"/><circle cx="222" cy="190" r="3.5"/><circle cx="338" cy="190" r="3.5"/><circle cx="222" cy="250" r="3.5"/><circle cx="338" cy="250" r="3.5"/><circle cx="222" cy="310" r="3.5"/><circle cx="338" cy="310" r="3.5"/></g>
<path d="M252 104 Q280 66 308 104 V350 H252 Z" fill="#eef3f7"/>
<rect x="252" y="214" width="56" height="136" fill="#c9ccd1"/>
<path d="M252 236 H308 M252 258 H308 M252 280 H308 M252 302 H308 M252 324 H308" stroke="#8a96a3" stroke-width="1.5"/>
<path d="M268 296 C 254 300, 252 318, 262 326 M292 296 C 306 300, 310 318, 300 326" stroke="#596876" stroke-width="3" fill="none"/>
<rect x="268" y="296" width="24" height="32" rx="5" fill="#8a96a3" stroke="#3a3d44" stroke-width="2"/>
<circle cx="280" cy="312" r="26" fill="none" stroke="#e0b25c" stroke-width="3"/>
<line x1="254" y1="312" x2="206" y2="312" stroke="#e0b25c" stroke-width="2.5"/>
<text x="200" y="306" font-size="20" font-weight="700" fill="#f6d48a" text-anchor="end">MOIV-1</text>
<text x="200" y="328" font-size="16" fill="#f6d48a" text-anchor="end">oxidizer valve</text>
<line x1="308" y1="170" x2="350" y2="170" stroke="#e7e5e0" stroke-width="2"/>
<text x="354" y="168" font-size="18" font-weight="700" fill="#e7e5e0">Departure</text>
<text x="354" y="188" font-size="18" font-weight="700" fill="#e7e5e0">stage</text>
<g data-from="2"><line x1="308" y1="244" x2="350" y2="244" stroke="#e7e5e0" stroke-width="2"/>
<text x="354" y="242" font-size="18" font-weight="700" fill="#e7e5e0">Frost</text>
<text x="354" y="262" font-size="18" font-weight="700" fill="#e7e5e0">blankets</text></g>
<g data-from="2"><rect x="410" y="322" width="62" height="38" rx="3" fill="#3a3d44" stroke="#8a96a3" stroke-width="2"/>
<rect x="417" y="331" width="10" height="9" fill="#5fa37a"/><rect x="430" y="331" width="10" height="9" fill="#5fa37a"/><rect x="443" y="331" width="10" height="9" fill="#5fa37a"/><rect x="456" y="331" width="10" height="9" fill="#5fa37a"/>
<text x="474" y="312" font-size="17" font-weight="700" fill="#e7e5e0" text-anchor="end">Blockhouse</text></g>
<g data-from="4"><path d="M342 352 H406" stroke="#fff6dc" stroke-width="2.5" stroke-dasharray="6 5"/><text x="374" y="342" font-size="16" font-weight="700" fill="#fff6dc" text-anchor="middle">400 m</text></g>
<g transform="translate(236 340)"><circle cx="0" cy="0" r="3.5" fill="#f6d48a"/><path d="M0 4 V13 M0 13 l-4 7 M0 13 l4 7 M-4 8 h8" stroke="#e0553b" stroke-width="3" stroke-linecap="round"/></g>
<g data-from="4"><path d="M372 64 q-2 -22 22 -22 q8 -16 28 -10 q18 -4 22 14 q16 2 14 18 z" fill="#596876"/>
<path d="M386 72 l-6 10 M404 72 l-6 10 M422 72 l-6 10 M440 72 l-6 10" stroke="#e7e5e0" stroke-width="2" stroke-linecap="round"/>
<text x="414" y="104" font-size="17" font-weight="700" fill="#e7e5e0" text-anchor="middle">R-0419:</text>
<text x="414" y="124" font-size="17" font-weight="700" fill="#e7e5e0" text-anchor="middle">storm risk</text></g>
<rect x="14" y="402" width="452" height="146" rx="8" fill="#0b141b" stroke="#596876" stroke-width="2"/>
<text x="28" y="430" font-size="17" font-weight="700" fill="#fff6dc">AR 2207 &#183; cycle 3 of 5 &#183; Aug 18, 2059</text>
<line x1="300" y1="440" x2="300" y2="538" stroke="#e0b25c" stroke-width="1.5" stroke-dasharray="4 4"/>
<line x1="352" y1="440" x2="352" y2="538" stroke="#e0b25c" stroke-width="1.5" stroke-dasharray="4 4"/>
<text x="326" y="456" font-size="17" font-weight="700" fill="#f6d48a" text-anchor="middle">40 ms</text>
<text x="28" y="482" font-size="17" font-weight="700" fill="#7fd0a0">Valve position</text>
<path d="M170 486 H300 V468 H352 V486 H452" stroke="#5fa37a" stroke-width="3" fill="none"/>
<g data-from="2"><text x="28" y="526" font-size="17" font-weight="700" fill="#cfe6f7">Ch 31 pressure</text>
<path d="M170 528 H302 l6 -10 l6 14 l6 -14 l6 12 l6 -12 l6 12 l6 -10 l6 8 H452" stroke="#5aa0d8" stroke-width="3" fill="none"/></g>
</g>
</svg>`;

window.HALCYON_GUIDE=window.HALCYON_GUIDE||{};
window.HALCYON_GUIDE.pmp=[
  // "split water" is a bible fact (water electrolysis, full/BIBLE.md premise and fixed facts); the chapters only say the plant's stacks wear.
  {id:"breather",title:"The Breather",kicker:"Oxygen plant",bg:"#16303f",aliases:["Breather"],svg:breather,
   what:"The Breather is the new oxygen plant Halcyon is carrying to Ares Station, to take over from the station's own plant, which is wearing out. It takes in water and power, and its stacks of cells split water into oxygen for the colony to breathe. The stacks are the part that wears, so a tired stack gets pulled and a fresh one goes in its place, and you can see the wear coming in their cell voltages.",
   levels:[
    {from:1,text:"There are two plants in this story. The station's old one is on Mars right now, keeping 212 people breathing, and it's failing. The Breather is the new one, still being built in Watkins. In her first log Ada says stack four of the old plant lost another two percent this week. By her math the colony has 952 days of air. Hollis's report says 1,012."},
    {from:2,text:"Bea's plan gives the Breather one box with four under it: stacks, water, power and controls. Owen Talbot's electrochemistry team works on it, eleven people in a lab at the far end of the high bay. And somebody has to get it from the lander into the station's plant room, a job nobody owned at first."},
    {from:3,text:"Its acceptance test runs in a chamber at Rio Puerco Electrochemical in Albuquerque, the company that built the stacks. The chamber can pull down to Mars surface pressure and chill to sixty below, and Paloma Benavidez is the only person there who has run a full stack in it. If a stack trips at pressure, the test can stretch from four weeks to eleven."},
    {from:6,text:"The station's plant sends its cell voltages to Earth every sol, to an ARA server in Denver. The Breather's control code gets tested on the station's own bench, with the station's engineers, across the light delay."},
    {from:8,text:"The station's spare stacks are gone. Every time one of the old plant's stacks quit, a spare went in, and the stores list never changed. While the Breather is installed and started, which takes about forty sols, the old plant has to keep the station breathing, so six new stacks for it now ride on Halcyon."},
    {from:10,text:"During the blackout the station pulled the leaking manifold off stack three of the old plant, and Ada was on the crew. A clamp let go. She got sixty one degree coolant on her left arm and hand, then hit the deck and cracked two ribs. Her medical report got to Earth before her own log did."}
   ]},
  {id:"campus",title:"The Watkins campus",kicker:"Tallgrass Aerospace",bg:"#26352d",aliases:["high bay","Watkins"],svg:campus,
   what:"Halcyon gets built in Watkins, thirty five minutes east of Sam's kitchen in Aurora on I-70, where the plains go flat and brown. The high bay's the white box you see from the interstate, ten stories tall, with TALLGRASS down the side. Flight control has its own building and a wind sock that's nearly always straight out. The test stand's two more miles out, down a gravel road.",
   levels:[
    {from:1,text:"Sam's run the high bay for nineteen years. There's a countdown clock over the doors, in days. Out front, the wind sock on flight control is usually straight out, and pronghorn hang around the access road watching traffic."},
    {from:2,text:"The county stopped plowing that gravel road in 2050. Out at the end of it, Wendell sits in the blockhouse with his boots on a cable tray and four screens in front of him, one for each side of the stage. Back in the high bay, Owen's lab is at the far end, and it smells like a swimming pool."},
    {from:4,text:"Building 6 has a cold flow cell, indoors, for cycling valves out of the weather. Nobody'd put a valve that big in it before."},
    {from:4,text:"The pad's four hundred meters from the blockhouse door. On a storm night its light is all you can see of it. If the road closes, you sleep on a cot in the blockhouse."},
    {from:10,text:"The finished departure stage leaves Watkins on an outsize freighter. It flies out of the Colorado Air and Space Port, bound for the Cape."},
    {from:13,text:"Flight control sits across the road from the high bay."},
    {from:15,text:"On launch morning the countdown clock over the high bay doors says zero."}
   ]},
  {id:"stand",title:"The test stand",kicker:"Propulsion testing",bg:"#16303f",aliases:["test stand","Stand 2","the stand"],svg:stand,
   what:"A propulsion test stand is a tower that holds a rocket stage on the ground while a crew chills it down, cycles its valves and fires it, with instruments recording every channel. Tallgrass's Stand 2 is two miles out on the prairie, and the crew runs it from a blockhouse out there with it. Halcyon's departure stage sits in it for its tests, and it doesn't leave for the Cape until they're done.",
   levels:[
    {from:1,text:"Halcyon's departure stage is bolted into the test stand two miles out on the prairie. In Bea's files, in a folder marked DO NOT CLOSE, Sam finds an anomaly report on the big valve that controls its oxygen. On the third of five test cycles, the valve's position reading disagreed with the close command for forty milliseconds."},
    {from:2,text:"In the dark the stand is a tower of white lights, with the departure stage bolted in and frost blankets over its lower half. MOIV-1 is a gray cylinder about the size of a beer keg, low on the stage in a nest of lines, wrapped in its own blanket. Both retests in 2059 ran the same afternoon, on the same stand, and both were clean, so the report was closed as unexplained, not repeatable."},
    {from:2,text:"The stand data shows a little more. A position sensor said the valve sat 0.4 millimeters off its seat while a limit switch said closed, and a pressure channel downstream, on a different rack, rippled at the same moment. Both racks shared one ground bus, and it had a fault, so the file alone can't tell you whether it was the valve or the noise."},
    {from:4,text:"R-0419 isn't a valve. It's the line in the risk register for a late season storm hitting Stand 2 during the valve campaign, with crews caught on the pad in high wind and cold and the road closed with people still out there. Hana logged it on April 1 with a response of monitor, reviewed weekly."},
    {from:10,text:"The departure stage finished on Stand 2 with its last Watkins hot fire, and every cycle of MOIV-1 came in under four milliseconds. Then it left for the Cape."}
   ]}
];
})();
