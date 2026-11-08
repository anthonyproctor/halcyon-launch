// Danny's Logbook (pilot) exam week review (2026-10-25): one on screen page for the last days before the FAA knowledge test. Never narrated.
// Loaded from the pilot scripts list in courses.js. engine.js (renderReview, route #pilot/review, the button in the home page's Practice exam
// card) reads window.HALCYON_REVIEW.pilot; its header explains sections and kinds.
// Shape: intro [paragraphs]; sections [[id, title, kind]]; numbers, airspace, weather and aero [{group, note?, items:[{name, where?, d, ch, sec}]}]
// (kind list); codes and formulas [{group, note?, items:[{name, f, means, ex, ch, sec}]}] (kind formulas); rules [{r, why, ch, sec}];
// contrasts [{topic, l:[left label, right label], a, b, ch, sec}].
// ch and sec point at where the book teaches it: Full Course chapter ch, Abby's Ground School (the lesson), section index sec (0 based, in
// the order of courses/pilot/full/chNN.js lesson.sections). mock:true instead of ch means only the practice exam teaches it.
// Sources: the lessons, quizzes and explanations in courses/pilot/full/ch01.js to ch12.js and courses/pilot/mock.js; FAA-S-ACS-6C, the
// Airman Knowledge Testing Matrix (PAR: 60 questions, 2.0 hours, 70 to pass), 14 CFR Parts 43, 61 and 91, 49 CFR 830, the AIM and
// AC 91-78A; and the coverage audit of 2026-10-25 (halcyon-private). Corrected facts used here: the 172N airspeed arcs (white 41 to 85,
// green 47 to 128, yellow 128 to 160, red line 160 KIAS), BasicMed under 61.113(i) as amended November 2024, and AC 91-78A for EFBs.
// Every worked example was recomputed by hand on 2026-10-25. Every line is in our own words; FAA text appears only as short reg
// citations. Copy rules: plain words, contractions, no dashes, "minus" for subtraction.
window.HALCYON_REVIEW=window.HALCYON_REVIEW||{};
window.HALCYON_REVIEW.pilot={
  intro:[
    "One screen for the last few days. Everything here is something the book already taught you, boiled down, with a link back to the lesson that teaches it.",
    "We follow the FAA's Private Pilot Airplane ACS (FAA-S-ACS-6C), 14 CFR and the AIM. The knowledge test is 60 questions in 2.0 hours, and 70 percent passes. Figures come from the testing supplement, FAA-CT-8080-2H, or are built into the question. A book that says 2.5 hours is out of date.",
    "This is our own summary. The FAA's current ACS, regulations and testing matrix are the official word on what's tested. Danny's Logbook isn't affiliated with or endorsed by the FAA."
  ],
  sections:[["numbers","Regs and numbers to know cold","list"],["airspace","Airspace and airports","list"],["codes","Weather codes","formulas"],["weather","Weather hazards and products","list"],["formulas","Performance, weight and balance, and the math","formulas"],["aero","Aerodynamics and the airplane","list"],["rules","What the test wants","rules"],["contrasts","Easy to mix up","contrasts"]],
  numbers:[
    {group:"Getting the certificate", items:[
      {name:"Student pilot certificate", where:"Apply in IACRA", d:"At least 16 for airplanes, and able to read, speak, write and understand English. You can take lessons without it, but you can't solo.", ch:1, sec:0},
      {name:"Private pilot eligibility", where:"61.103", d:"At least 17, English, a passed knowledge test and checkride, and the 61.109 experience.", ch:1, sec:0},
      {name:"The 61.109 hours", where:"61.109(a)", d:"40 total. 20 with an instructor: 3 cross country, 3 night (one cross country over 100 NM total and 10 full stop landings), 3 on instruments, 3 of checkride prep in the 2 calendar months before. 10 solo: 5 cross country with one 150 NM trip, full stops at three points and one leg over 50 NM, plus 3 full stop landings at a towered field.", ch:1, sec:0},
      {name:"Sitting the knowledge test", where:"61.35", d:"An instructor's endorsement and ID with a photo, signature, date of birth and residential address. Not a medical and not a solo endorsement.", ch:11, sec:1},
      {name:"How long a pass lasts", where:"61.39", d:"24 calendar months before the month you finish the checkride. The instructor's prep endorsement has to be within 2 calendar months.", ch:11, sec:2},
      {name:"Temporary certificate", where:"61.17", d:"Good for up to 120 days, until the permanent one arrives.", ch:12, sec:6},
      {name:"Credit after a discontinued checkride", where:"61.43(f)", d:"Areas you passed count if you finish the rest within 60 days.", ch:12, sec:4}
    ]},
    {group:"Students and solo", items:[
      {name:"Before the first solo", where:"61.87", d:"A pre-solo knowledge test from your instructor, who reviews every wrong answer. The solo endorsement names the make and model and lasts 90 days.", ch:7, sec:0},
      {name:"Student limits", where:"61.89", d:"No passengers, no hire, no flying with under 3 SM visibility by day or 5 SM at night, visual reference to the surface, and any limits the instructor writes.", ch:7, sec:1},
      {name:"Solo cross country", where:"61.93", d:"Anything beyond 25 NM needs the cross country training. One endorsement for the make and model, then a new one for each flight after the instructor checks the planning.", ch:9, sec:0},
      {name:"Solo in Class B", where:"61.95", d:"Training on that airspace, in it, and an endorsement within the last 90 days.", ch:4, sec:1}
    ]},
    {group:"Privileges and staying current", items:[
      {name:"No flying for hire", where:"61.113(a) and (c)", d:"You may share fuel, oil, airport fees and rental, and you pay at least your pro rata share. You need your own reason to go, and you can't advertise seats.", ch:11, sec:3},
      {name:"Flight review", where:"61.56", d:"1 hour of ground and 1 hour of flight within 24 calendar months. A checkride or a WINGS phase counts.", ch:11, sec:4},
      {name:"Passenger currency", where:"61.57(a)", d:"3 takeoffs and 3 landings in the last 90 days, same category and class. Tailwheel landings are full stops.", ch:11, sec:4},
      {name:"Night passengers", where:"61.57(b)", d:"3 takeoffs and 3 full stop landings between 1 hour after sunset and 1 hour before sunrise, in the last 90 days.", ch:10, sec:0},
      {name:"Extra endorsements", where:"61.31", d:"Complex (retractable gear, flaps, controllable prop), high performance (over 200 hp), tailwheel and high altitude. One time each, from an instructor.", ch:11, sec:6},
      {name:"Address and DUI reports", where:"61.60 and 61.15(e)", d:"Tell the FAA of a move in writing within 30 days. Report a motor vehicle action within 60 days.", ch:11, sec:6}
    ]},
    {group:"Medical", items:[
      {name:"Third class medical", where:"61.23", d:"For private privileges: through the end of the 60th month after the exam month if you were under 40 at the exam, the 24th month if you were 40 or older.", ch:11, sec:5},
      {name:"BasicMed", where:"61.23(c)(3) and 61.113(i), as amended November 2024", d:"An FAA medical held after July 14, 2006, a physician exam with the FAA checklist every 48 calendar months, and the online course every 24. No more than 6 passengers, in an aircraft for no more than 7 occupants and 12,500 lb, at or below 18,000 MSL, 250 KIAS or less, in the U.S., not for hire.", ch:11, sec:5},
      {name:"What you carry as PIC", where:"61.3", d:"Pilot certificate, photo ID and medical. Under BasicMed a U.S. driver's license takes the medical's place.", ch:11, sec:5},
      {name:"Grounding yourself", where:"61.53", d:"No PIC while you know of a condition or medication that would fail your medical.", ch:8, sec:1}
    ]},
    {group:"Alcohol, oxygen and fuel", items:[
      {name:"Alcohol", where:"91.17", d:"Not within 8 hours of a drink, not under the influence, not at 0.04 or more, not on a drug that hurts your judgment. The AIM's 12 to 24 hours is advice, not the rule.", ch:8, sec:2},
      {name:"Oxygen", where:"91.211", d:"Crew uses it after 30 minutes above 12,500 up to 14,000, the whole time above 14,000, and above 15,000 everyone aboard must be provided it.", ch:8, sec:4},
      {name:"VFR fuel", where:"91.151", d:"Enough to the first intended landing plus 30 minutes by day, 45 at night, at normal cruise.", ch:9, sec:4},
      {name:"After scuba", where:"AIM", d:"12 hours without decompression stops, 24 with them, before flying up to 8,000 feet. 24 hours before going higher.", ch:8, sec:5}
    ]},
    {group:"The airplane's paperwork", items:[
      {name:"Documents aboard", where:"AROW, 91.203", d:"Airworthiness certificate (displayed), registration, operating limitations, weight and balance. The maintenance records stay on the ground.", ch:11, sec:7},
      {name:"Registration", where:"47.40 and 47.41", d:"Good for 7 years. It ends early on sale or destruction, or 30 days after the holder dies.", ch:11, sec:7},
      {name:"Inspections", where:"91.409, 91.207, 91.413", d:"Annual every 12 calendar months. 100 hour only when flown for hire, with 10 hours of grace to reach a shop. ELT every 12 calendar months, battery at 1 hour of use or half its life. Transponder every 24 calendar months.", ch:2, sec:5},
      {name:"Airworthiness directives", where:"Part 39", d:"Mandatory. The owner or operator is primarily responsible, and the PIC still decides before each flight.", ch:11, sec:8},
      {name:"Flying with something broken", where:"91.213(d)", d:"With no MEL: not required, removed or deactivated, placarded INOPERATIVE, and judged not a hazard.", ch:2, sec:7},
      {name:"Preventive maintenance", where:"Part 43 Appendix A, 43.3(g), 43.7(f), 43.9", d:"A certificated pilot may do the listed small jobs on an airplane they own or operate, outside Parts 121, 129 and 135, and log the work. Approving it for return to service takes at least a private certificate.", ch:2, sec:6}
    ]},
    {group:"Rules of the air", items:[
      {name:"PIC authority", where:"91.3", d:"Final authority. You may deviate to meet an emergency, and write a report if the FAA asks.", ch:1, sec:4},
      {name:"Preflight action", where:"91.103", d:"Runway lengths and takeoff and landing data for every flight. Weather, fuel, alternatives and known delays for one away from the airport.", ch:1, sec:4},
      {name:"Minimum safe altitudes", where:"91.119", d:"Over a congested area, 1,000 feet above the highest obstacle within 2,000 feet. Elsewhere 500 feet AGL, and 500 feet from people, vessels, vehicles and structures over open water or sparse areas.", ch:11, sec:6},
      {name:"Cruising altitudes", where:"91.159", d:"Only above 3,000 AGL. Magnetic course 0 to 179: odd thousands plus 500. 180 to 359: even thousands plus 500.", ch:9, sec:5},
      {name:"Belts", where:"91.107", d:"The PIC briefs everyone and has them belted for taxi, takeoff and landing.", ch:12, sec:7},
      {name:"Accidents and incidents", where:"49 CFR 830", d:"Notify the NTSB right away of an accident or a listed incident like an in-flight fire or a flight control failure. The written report is due within 10 days of an accident, or 7 if an overdue aircraft is still missing. After an incident, file one only if the NTSB asks.", ch:11, sec:9},
      {name:"NASA report", where:"ASRS", d:"Filed within 10 days, it can waive the penalty for an honest mistake.", ch:4, sec:7}
    ]}
  ],
  airspace:[
    {group:"The classes", items:[
      {name:"Class A", d:"18,000 MSL up to FL600. IFR only, and not shown on VFR charts.", ch:4, sec:0},
      {name:"Class B", where:"Solid blue on the sectional", d:"Go in only once ATC says you're cleared into it. Two way radio, Mode C and ADS-B Out. 3 SM and clear of clouds. 200 knots under a shelf.", ch:4, sec:1},
      {name:"Class C", where:"Solid magenta", d:"Usually a 5 NM core from the surface and a 10 NM shelf from 1,200 AGL, both to 4,000 AGL. Two way radio communication established, Mode C and ADS-B Out.", ch:4, sec:3},
      {name:"Class D", where:"Dashed blue", d:"Usually the surface to 2,500 AGL around a tower. Talk to them before you enter. A minus sign on the ceiling means up to but not including.", ch:4, sec:3},
      {name:"Class E", d:"Floors at the surface (dashed magenta), 700 AGL (magenta vignette), 1,200 AGL (blue vignette next to Class G), or 14,500 MSL where nothing else is drawn.", ch:4, sec:0},
      {name:"Class G", d:"Uncontrolled. From the surface up to the base of the Class E above it.", ch:4, sec:0},
      {name:"Mode C and ADS-B Out", where:"91.215 and 91.225", d:"Class A, B and C, the 30 NM veil to 10,000 MSL, above B and C, and at or above 10,000 MSL except within 2,500 AGL.", ch:4, sec:2},
      {name:"Transponder codes", d:"1200 VFR, 7500 hijack, 7600 lost comm, 7700 emergency. Already talking to ATC? Keep your assigned code.", ch:10, sec:9}
    ]},
    {group:"VFR weather minimums", note:"91.155. Visibility, then distance below, above and beside the clouds.", items:[
      {name:"Class B", d:"3 SM, clear of clouds.", ch:4, sec:4},
      {name:"Class C, D, and E below 10,000 MSL", d:"3 SM, 500 below, 1,000 above, 2,000 horizontal. Three one five two.", ch:4, sec:4},
      {name:"Class E at or above 10,000 MSL", d:"5 SM, 1,000 below, 1,000 above, 1 SM horizontal.", ch:4, sec:4},
      {name:"Class G, 1,200 AGL or less", d:"Day 1 SM and clear of clouds. Night 3 SM and three one five two, except 1 SM and clear of clouds in a pattern within half a mile of the runway.", ch:4, sec:4},
      {name:"Class G above 1,200 AGL, below 10,000 MSL", d:"Day 1 SM, night 3 SM, both with 500 below, 1,000 above, 2,000 horizontal.", ch:4, sec:4},
      {name:"In a surface area", where:"91.155(c) and (d)", d:"No VFR under a ceiling below 1,000 feet, and 3 SM ground visibility to take off, land or enter the pattern.", ch:4, sec:4},
      {name:"Special VFR", where:"91.157", d:"An ATC clearance, clear of clouds, 1 SM, inside a surface area below 10,000 MSL. At night only for instrument rated pilots in IFR equipped airplanes.", ch:4, sec:4}
    ]},
    {group:"On the chart and off it", items:[
      {name:"Special use airspace", d:"Prohibited (P) and restricted (R) are regulatory: stay out, or get permission when R is active. MOAs, alert (A) and warning (W) areas are cautions. Controlled firing areas aren't charted.", ch:4, sec:5},
      {name:"Military training routes", d:"Four digits: no segment above 1,500 AGL. Three digits: at least one segment above it.", ch:4, sec:5},
      {name:"Sectional numbers", d:"Obstruction top in bold MSL with its height AGL in parentheses. The maximum elevation figure in each grid square. The airport data block gives elevation, lighting, longest runway and CTAF.", ch:4, sec:5},
      {name:"TFRs and NOTAMs", where:"91.137 to 91.145", d:"TFRs are FDC NOTAMs, and most aren't on the chart. Checking them is part of preflight.", ch:4, sec:6}
    ]},
    {group:"Radio and lights", items:[
      {name:"Initial call", d:"Facility, your full call sign, where you are, what you want, and the ATIS letter. Abbreviate your call sign only after the controller does.", ch:4, sec:7},
      {name:"Established communication", d:"The controller said your call sign. \"Aircraft calling, standby\" doesn't count.", ch:4, sec:3},
      {name:"Light gun signals", d:"Steady green: cleared for takeoff, or cleared to land. Flashing green: taxi, or come back to land. Steady red: stop, or give way and keep circling. Flashing red: clear the runway, or don't land. Flashing white: back to the start, ground only.", ch:6, sec:7},
      {name:"Radio out in Class D", where:"91.129(d)", d:"VFR weather, the tower in sight, and a light gun clearance to land.", ch:6, sec:7}
    ]},
    {group:"Airports and traffic", items:[
      {name:"The pattern", d:"1,000 AGL for propeller airplanes unless published. Join at 45 degrees to midfield downwind. Left turns unless marked or assigned.", ch:6, sec:0},
      {name:"Segmented circle", d:"The wind cone's big end points into the wind. Land into it, then read the pattern indicator for that runway.", ch:6, sec:1},
      {name:"Right of way", where:"91.113", d:"Distress first. Then balloon, glider, towing or refueling, airship, everyone else. Converging: the one on the right. Head on: both turn right. Overtaking: the one being passed has the right of way, and the one passing goes right. Landing: the lower one, without cutting in.", ch:6, sec:2},
      {name:"Wake turbulence", d:"Worst behind heavy, clean, slow airplanes, and in a light quartering tailwind. Land past their touchdown, lift off before their rotation.", ch:6, sec:3},
      {name:"Markings and signs", d:"Hold on the solid side of the hold line. Red with white letters is mandatory. A black sign with yellow letters tells you where you are, a yellow sign with black letters tells you where to go.", ch:6, sec:4},
      {name:"Airport lights", d:"PAPI: two white and two red is on path. White and green beacon: civil land airport. Taxiways blue. Pilot controlled lights: 7, 5 or 3 clicks in 5 seconds, 15 minutes.", ch:10, sec:3},
      {name:"LAHSO and red lights", d:"You can decline LAHSO, and students shouldn't take it. Red runway status lights mean stop and call ATC, even with a clearance.", ch:6, sec:6},
      {name:"Taxiing in wind", d:"Quartering headwind: yoke into the wind, elevator neutral. Quartering tailwind: yoke away from the wind and held forward.", ch:6, sec:8}
    ]}
  ],
  codes:[
    {group:"METAR", note:"One made up report, read group by group: METAR KXYZ 251753Z 33012G22KT 4SM -RA BR FEW015 BKN035 OVC080 08/M03 A2998 RMK AO2.", items:[
      {name:"Time", f:"251753Z", means:"Day, then time in Zulu.", ex:"The 25th at 1753 UTC.", ch:3, sec:2},
      {name:"Wind", f:"33012G22KT", means:"Direction true, speed and gusts in knots. VRB is variable, 00000KT is calm.", ex:"From 330 true at 12 knots, gusting 22.", ch:3, sec:2},
      {name:"Visibility and weather", f:"4SM -RA BR", means:"Statute miles, then intensity and codes. Minus is light, plus is heavy.", ex:"4 miles in light rain and mist.", ch:3, sec:2},
      {name:"Sky and ceiling", f:"FEW015 BKN035 OVC080", means:"Bases in hundreds of feet AGL. The ceiling is the lowest broken or overcast layer, or a VV.", ex:"Ceiling 3,500 AGL. The FEW layer doesn't count.", ch:3, sec:2},
      {name:"Temperature, dewpoint, altimeter", f:"08/M03 A2998", means:"Celsius, with M for minus, then the altimeter setting.", ex:"8°C, dewpoint minus 3°C, altimeter 29.98.", ch:3, sec:2},
      {name:"Station type", f:"AO2", means:"Automated, with a sensor that tells rain from snow. AO1 has none.", ex:"This one can tell rain from snow.", ch:3, sec:2}
    ]},
    {group:"TAF and time", items:[
      {name:"Valid period", f:"TAF KXYZ 251720Z 2518/2618", means:"Issued, then valid from and to. A TAF covers 5 SM around the runways.", ex:"Valid 1800Z on the 25th to 1800Z on the 26th.", ch:3, sec:3},
      {name:"Change groups", f:"FM260200 / TEMPO 2520/2524 / PROB30", means:"FM replaces everything from that time. TEMPO is short changes, an hour or less each, under half the period. PROB30 is a 30 percent chance.", ex:"FM260200 is a whole new forecast from 0200Z on the 26th.", ch:3, sec:3},
      {name:"Zulu to local", f:"Mountain Daylight = UTC minus 6, Standard = UTC minus 7", means:"Convert before you decide anything.", ex:"1800Z is noon MDT, 1100 MST.", ch:3, sec:3}
    ]},
    {group:"Winds and temperatures aloft (FB)", items:[
      {name:"Normal group", f:"DDff+TT", means:"Direction in tens of degrees true, speed in knots, temperature in °C.", ex:"2635-04 is 260 true at 35 knots, minus 4°C.", ch:3, sec:4},
      {name:"Light and variable", f:"9900", means:"Under 5 knots.", ex:"9900+05 is light and variable, plus 5°C.", ch:3, sec:4},
      {name:"100 knots or more", f:"Direction over 36: subtract 50, add 100 to speed", means:"Above 24,000 feet the temperature is negative with no sign.", ex:"731960 is 230 true at 119 knots, minus 60°C.", ch:3, sec:4},
      {name:"The blanks", f:"No wind within 1,500 ft of the station, no temperature within 2,500 ft or at 3,000", means:"A blank is no forecast, not calm.", ex:"A station at 5,400 feet shows nothing at 3,000 or 6,000.", ch:3, sec:4}
    ]}
  ],
  weather:[
    {group:"Products", items:[
      {name:"AIRMETs", d:"Sierra: IFR and mountain obscuration. Tango: moderate turbulence, sustained surface wind over 30 knots, low level wind shear. Zulu: moderate icing and freezing levels.", ch:3, sec:5},
      {name:"Convective SIGMET", d:"Thunderstorms. Issued hourly at 55 past, valid 2 hours, and it implies severe turbulence, severe icing and wind shear.", ch:3, sec:5},
      {name:"PIREP", d:"Location, time, altitude in MSL, aircraft type, and at least one weather element.", ch:3, sec:5},
      {name:"Prog charts", d:"Low level significant weather runs from the surface to FL240: flight categories, turbulence, freezing levels, and no icing.", ch:3, sec:4},
      {name:"Datalink weather", where:"FIS-B on 978 MHz", d:"For strategy, not for picking a gap between cells. The radar picture can be 15 to 20 minutes older than its time stamp.", ch:9, sec:10},
      {name:"Electronic flight bag", where:"AC 91-78A", d:"Fine in place of paper in Part 91 if it's current. Plan for it failing and carry a backup.", ch:9, sec:10}
    ]},
    {group:"Hazards", items:[
      {name:"Stable and unstable air", d:"Stable: stratus, smooth air, steady rain, poor visibility. Unstable: cumulus, bumps, showers, good visibility. An inversion is stable.", ch:3, sec:0},
      {name:"Fronts", d:"Every front brings a wind shift. Cold fronts are fast and showery with clearing behind. Warm fronts are slow, layered and low visibility ahead.", ch:3, sec:1},
      {name:"Thunderstorms", d:"Cumulus stage is updrafts. Mature starts when rain reaches the ground. Dissipating is downdrafts. Microburst: headwind, then downdraft, then tailwind.", ch:3, sec:6},
      {name:"Fog", d:"Radiation fog on clear, calm nights. Advection fog when moist air moves over cooler ground. Upslope fog needs wind pushing air uphill.", ch:3, sec:7},
      {name:"Icing and frost", d:"Structural ice needs visible moisture and freezing temperatures. Clear ice is worse than rime. Frost comes off completely before flight.", ch:3, sec:7},
      {name:"Mountain wave", d:"Lenticular clouds mark it, and rotor under the crests can be severe to extreme.", ch:3, sec:7}
    ]}
  ],
  formulas:[
    {group:"Altitude and performance", note:"One running example: a field at 4,800 feet, altimeter 29.72, temperature 30°C, dewpoint 20°C.", items:[
      {name:"Pressure altitude", f:"PA = field elevation + (29.92 minus altimeter setting) x 1,000", means:"Setting above 29.92 puts PA below the field. Below 29.92 puts it above.", ex:"4,800 + (29.92 minus 29.72) x 1,000 = 4,800 + 200 = 5,000 feet.", ch:5, sec:0},
      {name:"Standard temperature", f:"15°C minus 2°C per 1,000 feet of PA", means:"Use it at the pressure altitude, never 15°C at a high field.", ex:"15 minus 2 x 5 = 5°C at 5,000 feet.", ch:5, sec:1},
      {name:"Density altitude", f:"DA ≈ PA + 120 x (OAT minus standard temperature)", means:"The altitude the airplane performs as if it's at. Heat, height, low pressure and humidity all raise it.", ex:"5,000 + 120 x (30 minus 5) = 5,000 + 3,000 = about 8,000 feet.", ch:5, sec:1},
      {name:"Cloud base", f:"Spread in °C / 2.5 x 1,000, or spread in °F / 4.4 x 1,000", means:"The answer is feet AGL. Add field elevation for MSL.", ex:"(30 minus 20) / 2.5 x 1,000 = 4,000 AGL, about 8,800 MSL.", ch:3, sec:0},
      {name:"Weight and takeoff distance", f:"About 10 percent more weight = at least 21 percent more takeoff distance", means:"Weight is the performance number you control.", ex:"A 1,000 foot takeoff roll becomes at least 1,210 feet.", ch:5, sec:4},
      {name:"Altimeter not reset", f:"Error ≈ (setting in the window minus the local setting) x 1,000 feet", means:"From high pressure to low without resetting, the altimeter reads higher than you are.", ex:"Window 30.10, local 29.90: you're about 200 feet lower than it shows.", ch:2, sec:3}
    ]},
    {group:"Weight and balance", note:"One running example: empty 1,500 lb at 39.0 in, front seats 340 lb at 37.0, 40 gallons of fuel at 48.0, a 50 lb bag at 95.0.", items:[
      {name:"Fuel weight", f:"Avgas = 6 lb per gallon", means:"Turn gallons into pounds before anything else.", ex:"40 gallons x 6 = 240 lb.", ch:5, sec:5},
      {name:"Moment", f:"Moment = weight x arm", means:"Pound inches. Arms are measured from the datum, positive aft.", ex:"Front seats: 340 x 37.0 = 12,580.", ch:5, sec:5},
      {name:"CG", f:"CG = total moment / total weight", means:"Then check it against the envelope.", ex:"58,500 + 12,580 + 11,520 + 4,750 = 87,350; 87,350 / 2,130 = 41.0 inches aft of the datum.", ch:5, sec:5},
      {name:"Weight shift", f:"Change in CG = weight moved x distance moved / total weight", means:"Rearrange it for whatever the question leaves out.", ex:"Move the bag from 95 to 73 inches: 50 x 22 / 2,130 = 0.5, so the CG goes forward to about 40.5.", ch:5, sec:5},
      {name:"Useful load", f:"Useful load = maximum weight minus basic empty weight", means:"Pilot, passengers, baggage, usable fuel and drainable oil.", ex:"2,300 minus 1,500 = 800 lb.", ch:5, sec:4}
    ]},
    {group:"Wind and turns", items:[
      {name:"Crosswind component", f:"Crosswind = wind x sin(angle). Headwind = wind x cos(angle).", means:"Runways, ATIS and tower winds are magnetic. METAR and TAF winds are true.", ex:"Runway 35, tower wind 020 at 20: angle 30°, crosswind 20 x 0.5 = 10 knots, headwind about 17.", ch:6, sec:8},
      {name:"Clock rule", f:"15° = 1/4, 30° = 1/2, 45° = 3/4, 60° or more = all of it", means:"The crosswind part, in your head.", ex:"Wind 40° off the runway at 16 knots: between 1/2 and 3/4, about 10 or 11 knots.", ch:6, sec:8},
      {name:"Gust factor", f:"Add half of (gust minus steady wind) to approach speed", means:"For gusty landings.", ex:"Wind 18 gusting 28: gust factor 10, add 5 knots.", ch:6, sec:9},
      {name:"Load factor", f:"n = 1 / cos(bank)", means:"30° is 1.15 G, 45° is 1.41, 60° is 2.0. A level 75° turn passes the 3.8 G normal category limit.", ex:"45°: 1 / 0.707 = 1.41 G.", ch:7, sec:6},
      {name:"Stall speed in a turn", f:"Stall speed x square root of n", means:"Load factor climbs fast past 45°, and stall speed with it.", ex:"48 knots at 60°: 48 x 1.414 = about 68 knots.", ch:7, sec:6}
    ]},
    {group:"Navigation and money", items:[
      {name:"Time, speed, distance", f:"Time = distance / groundspeed", means:"Hours times 60 for minutes.", ex:"135 NM at 90 knots = 1.5 hours, 90 minutes.", ch:9, sec:4},
      {name:"Fuel with reserve", f:"Fuel = burn x (time + 0.5 hour by day, or 0.75 at night)", means:"91.151 reserve, to the first intended landing.", ex:"1.5 hours at 8 gph: day 8 x 2.0 = 16 gallons; night 8 x 2.25 = 18.", ch:9, sec:4},
      {name:"Compass chain", f:"TC ± WCA = TH ± variation = MH ± deviation = CH", means:"East is least, west is best. Right wind correction adds.", ex:"TC 090, 6° right = TH 096, 10° east = MH 086, deviation +2 = CH 088.", ch:9, sec:3},
      {name:"60 to 1 rule", f:"Degrees off = miles off x 60 / miles flown", means:"About 1 mile off for each degree, every 60 miles.", ex:"4 NM off after 40 NM: 4 x 60 / 40 = 6° off course.", ch:9, sec:12},
      {name:"VOR time to station", f:"Minutes = seconds for the bearing change / degrees of change", means:"Put the station off your wingtip and time it.", ex:"10° in 90 seconds = 9 minutes to the station.", ch:9, sec:6},
      {name:"Glide distance", f:"About 1.5 NM per 1,000 feet AGL in the 172N, in still air", means:"Best glide, flaps up. Wind changes the answer.", ex:"6,000 AGL: about 9 NM.", ch:10, sec:7},
      {name:"Pro rata share", f:"Least the pilot pays = (fuel + oil + airport fees + rental) / everyone aboard", means:"Count the pilot. Nothing else is shareable.", ex:"$360 rental + $40 landing fee, pilot and 3 friends: 400 / 4 = $100.", ch:11, sec:3},
      {name:"Calendar months", f:"Count to the last day of the month", means:"Medicals, flight reviews, annuals and the knowledge test window all run to month end.", ex:"Flight review on September 3, 2026: good through September 30, 2028.", ch:11, sec:4}
    ]}
  ],
  aero:[
    {group:"How it flies", items:[
      {name:"Four forces", d:"In straight, level, unaccelerated flight the opposing forces are equal. Lift greater than weight means a climb is starting.", ch:1, sec:1},
      {name:"Axes and controls", d:"Ailerons roll, elevator pitches, rudder yaws. Aileron alone yaws the nose away from the turn: adverse yaw.", ch:1, sec:3},
      {name:"Trim tab", d:"Relieves control pressure, and moves opposite the elevator.", ch:1, sec:3},
      {name:"Left turning tendencies", d:"Torque, spiraling slipstream, P factor (the descending right blade bites more) and gyroscopic precession. Worst at high power, low airspeed and high angle of attack. Right rudder fixes it.", ch:7, sec:3},
      {name:"Stalls", d:"A wing stalls at its critical angle of attack, at any airspeed or attitude. Recovery starts by reducing the angle of attack.", ch:7, sec:5},
      {name:"Spins", d:"A stall plus yaw. Power idle, ailerons neutral, full opposite rudder, brisk forward elevator.", ch:7, sec:7},
      {name:"Maneuvering speed", d:"VA drops as weight drops. In the 172N: 97 KIAS at 2,300 lb, 89 at 1,950, 80 at 1,600. It isn't marked on the dial.", ch:7, sec:6},
      {name:"Ground effect", d:"Less induced drag within about a wingspan of the ground. It can lift you off before the airplane can climb.", ch:5, sec:7},
      {name:"Slow flight", d:"Flown with no stall warning under ACS 6C, airspeed plus 10, minus 0. Behind the power curve, pitch holds airspeed and power holds altitude.", ch:7, sec:4},
      {name:"Steep turns", d:"About 45° of bank. The outside wing goes faster and makes more lift, so the bank tends to steepen. If the nose drops, take out bank before adding back pressure.", ch:7, sec:8},
      {name:"Ground reference", d:"Around a point, the steepest bank is where groundspeed is highest, heading downwind. The shallowest is upwind.", ch:7, sec:9}
    ]},
    {group:"The airspeed indicator", note:"The 172N's marks, in KIAS.", items:[
      {name:"White arc, 41 to 85", d:"Flap range. Bottom is VSO, stall in landing configuration. Top is VFE, maximum flap extended speed.", ch:2, sec:4},
      {name:"Green arc, 47 to 128", d:"Normal range. Bottom is VS1, stall in a specified configuration. Top is VNO, maximum structural cruising speed.", ch:2, sec:4},
      {name:"Yellow arc, 128 to 160", d:"Caution range, smooth air only.", ch:2, sec:4},
      {name:"Red line, 160", d:"VNE, never exceed.", ch:2, sec:4}
    ]},
    {group:"Engine and systems", items:[
      {name:"Magnetos", d:"Make their own spark, so an electrical failure doesn't stop the engine. A broken P lead leaves a mag hot. No drop on the mag check is a problem too.", ch:2, sec:0},
      {name:"Carburetor ice", d:"First sign with a fixed pitch prop is lost RPM. Carb heat with ice: RPM drops, then rises. The mixture gets richer as you climb.", ch:2, sec:1},
      {name:"Detonation", d:"Too lean, too hot, or the wrong grade of fuel.", ch:2, sec:1},
      {name:"Ammeter", d:"Shows whether the alternator is charging or the battery is carrying the load.", ch:2, sec:2},
      {name:"Pitot static failures", d:"Blocked static: altimeter frozen, VSI at zero. Blocked pitot and drain: airspeed acts like an altimeter. Alternate static reads a little high.", ch:2, sec:3},
      {name:"Gyros", d:"Vacuum runs the attitude and heading indicators in most trainers. Rigidity in space and precession.", ch:2, sec:3}
    ]}
  ],
  rules:[
    {r:"Read the figure's conditions line first.", why:"Then apply the chart's own wind and weight notes. Headwind credit is small and the tailwind penalty is big.", ch:5, sec:3},
    {r:"Convert true and magnetic before you subtract.", why:"METAR, TAF, FB winds and sectional courses are true. Runways, ATIS, tower winds and cruising altitudes go by magnetic.", ch:6, sec:8},
    {r:"Count calendar months to the end of the month.", why:"An annual done any day in August is good through August 31 the next year.", ch:2, sec:5},
    {r:"The PIC decides.", why:"Final authority for the flight and the one who says the airplane is in condition for safe flight.", ch:11, sec:7},
    {r:"Students never carry passengers.", why:"Not by day, not at night, not if a friend asks nicely.", ch:7, sec:1},
    {r:"Stall recovery starts with angle of attack.", why:"Lower the nose first, then wings level and power.", ch:7, sec:5},
    {r:"Disoriented? Believe the instruments.", why:"Your inner ear lies in turns, accelerations and the dark.", ch:8, sec:7},
    {r:"Ask for help early.", why:"Urgency starts at doubt about position, fuel or weather. Lost? Climb, then use every resource.", ch:10, sec:9},
    {r:"Engine fire: fuel off. Alternator out: shed load.", why:"Then land, at the nearest suitable airport for the alternator.", ch:10, sec:8},
    {r:"Go-around: power first.", why:"Full power, carb heat off, pitch to climb, flaps up in steps.", ch:6, sec:10},
    {r:"Flight following never replaces see and avoid.", why:"It's workload permitting, and it isn't a clearance into Class B.", ch:9, sec:8},
    {r:"Datalink weather is a strategy tool.", why:"The picture shows where weather was. Use it to go around an area, not between two cells.", ch:9, sec:10},
    {r:"The rule beats the recommendation.", why:"8 hours is the reg and 12 to 24 is the AIM's advice. Pick the one the question asks for.", ch:8, sec:2},
    {r:"Name the hazardous attitude, then its antidote.", why:"Anti-authority, impulsivity, invulnerability, macho, resignation. The test gives you a thought and wants the match.", ch:8, sec:10},
    {r:"External pressure feeds get-there-itis.", why:"It's the E in PAVE, and managing it is the biggest key to risk management.", ch:8, sec:11},
    {r:"Personal minimums only get tighter.", why:"Set them ahead of time, and never loosen them to finish one flight.", ch:8, sec:12},
    {r:"Mark it and move on.", why:"Two minutes a question, most need far less. A blank is wrong, so answer everything.", ch:11, sec:11}
  ],
  contrasts:[
    {topic:"Pressure vs. density altitude", l:["Pressure altitude","Density altitude"], a:"Height above the 29.92 datum. Read it with 29.92 set.", b:"Pressure altitude corrected for temperature. What the airplane feels.", ch:5, sec:1},
    {topic:"VX vs. VY", l:["VX","VY"], a:"Best angle. Most height per distance, for clearing obstacles.", b:"Best rate. Most height per minute.", ch:5, sec:7},
    {topic:"Forward vs. aft CG", l:["Forward","Aft"], a:"More stable, higher stall speed, heavier flare, a little slower.", b:"Less stable, lighter controls, a little faster, harder stall and spin recovery.", ch:5, sec:6},
    {topic:"Cold vs. warm front", l:["Cold front","Warm front"], a:"Fast and steep, showers or storms, then clearing and gusty wind.", b:"Slow and gentle, layered cloud, steady rain and fog ahead.", ch:3, sec:1},
    {topic:"FM vs. TEMPO", l:["FM","TEMPO"], a:"A whole new set of conditions from that time on.", b:"Short changes, an hour or less each, covering under half the period.", ch:3, sec:3},
    {topic:"Clear vs. rime ice", l:["Clear","Rime"], a:"Glossy and heavy, from large supercooled drops. Worse.", b:"Rough and milky, from small drops.", ch:3, sec:7},
    {topic:"Annual vs. 100 hour", l:["Annual","100 hour"], a:"Every airplane, every 12 calendar months.", b:"Only when flown for hire. 10 hours of grace to reach a shop, and the overfly counts against the next one.", ch:2, sec:5},
    {topic:"Standard vs. special airworthiness certificate", l:["Standard","Special"], a:"Normal, utility, acrobatic, commuter and transport.", b:"Experimental, restricted, limited, light sport, primary, provisional and special flight permits, with limitations.", ch:2, sec:6},
    {topic:"Flight review vs. passenger currency", l:["61.56","61.57"], a:"Can you fly as PIC at all? Every 24 calendar months.", b:"Can you carry passengers? 3 takeoffs and landings in 90 days.", ch:11, sec:4},
    {topic:"Night for logging vs. night for passengers", l:["Logging night","Night passengers"], a:"End of evening civil twilight to the start of morning civil twilight.", b:"1 hour after sunset to 1 hour before sunrise. Position lights are a third clock: sunset to sunrise.", ch:10, sec:0},
    {topic:"Flashing green", l:["On the ground","In the air"], a:"Cleared to taxi.", b:"Return for landing.", ch:6, sec:7},
    {topic:"Best glide vs. minimum sink", l:["Best glide","Minimum sink"], a:"Farthest distance per foot of altitude. 65 KIAS in the 172N.", b:"Slower. Longest time aloft, less distance.", ch:10, sec:7},
    {topic:"Forced vs. precautionary landing", l:["Forced","Precautionary"], a:"You have to land now. Flight can't continue.", b:"You choose to, because going on is possible but unwise.", ch:10, sec:7},
    {topic:"Hypemic vs. histotoxic hypoxia", l:["Hypemic","Histotoxic"], a:"Blood can't carry oxygen. Carbon monoxide.", b:"Cells can't use it. Alcohol, drugs, poisons.", ch:8, sec:4},
    {topic:"Hyperventilation vs. hypoxia", l:["Hyperventilation","Hypoxia"], a:"Too much breathing. Slow down, talk out loud.", b:"Too little oxygen. Get to oxygen or lower.", ch:8, sec:5},
    {topic:"Narrow vs. wide runway", l:["Narrower than usual","Wider than usual"], a:"Looks high, so you fly low.", b:"Looks low, so you fly high.", ch:8, sec:9},
    {topic:"Disapproval vs. discontinuance", l:["Notice of Disapproval","Letter of Discontinuance"], a:"A task below standard. The retest needs more training and an endorsement.", b:"Stopped for weather, airworthiness, illness or safety. No new endorsement.", ch:12, sec:4},
    {topic:"Accident vs. incident", l:["Accident","Incident"], a:"Death, serious injury or substantial damage.", b:"Something short of that which affects safety. Only the listed ones need an immediate call.", ch:11, sec:9}
  ]
};
