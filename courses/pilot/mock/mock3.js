// Private Pilot course "Danny's Logbook": practice exam 3 (60 questions, three options, 120 minutes, 70 to pass, like forms 1 and 2).
// Built 2026-11-07. Form 3 leans on the FAA's own figures: 29 items show a real page from the Airman Knowledge Testing Supplement,
// FAA-CT-8080-2H, through the engine's image figure (fig: a <prop type="img"> from courses/pilot/figs/manifest.json, copied unchanged).
// About a quarter of the real PAR test sends you to a supplement figure, and forms 1 and 2 only typed them out as text.
// Figures used: 8 density altitude, 9 taxi control positions, 12 METAR, 15 TAF, 17 winds aloft, 20, 22 and 25 sectional excerpts,
// 34 loading graph and CG envelope, 36 wind component, 37 landing graph, 38 landing table, 40 takeoff graph, 47 VASI, 48 airport diagram,
// 49 closed runway and tetrahedron, 50 segmented circle, 64 airport markings, 65 airport signs.
// Every figure item is answerable only from the figure (the stem points at a place on it and never gives the value), and each why shows
// the reading. Values were read from the supplement pages (halcyon-private/sources/faa, the 300 dpi crops in courses/pilot/figs) on
// 2026-11-07: sectional data blocks, shelf labels, MEFs and obstruction pairs at full resolution, chart lines by pixel position against
// the printed scales (CG envelope at 1,900 lb: forward about 66, utility aft about 77, normal aft about 90; baggage line arm about 93;
// takeoff graph wind section reference line about 1,500 ft in the worked example).
// Spread like forms 1 and 2 (the FAA publishes no area weights): Preflight 36, Airport and flight 12, Navigation and emergencies 12.
// The non figure items go where the bank was thin (II, IV, V, VII, VIII, XII, XI, IX, VI). 15 items work a number from a chart or by hand.
// Original items, not FAA test bank or FAA sample questions. None closely repeats form 1, form 2 or a chapter quiz item (stem plus key
// word Jaccard against all of them, checked 2026-11-07).
// The engine reads parts by part.slice(0,3) for question ids and by the "M3:" prefix for the form, so this part starts "M3:".
// Sources, each rule read on 2026-11-07: eCFR title 14 (61.51(e), 91.157(b)(4), 91.205(c), 91.411(a)); AIM html (2-1-2 VASI, 2-1-10 runway
// guard lights, 2-3-3, 2-3-4, 2-3-5, 2-3-9 markings and signs, 4-3-3 pattern altitude, 4-3-4 segmented circle and tetrahedron, 4-3-21
// exiting the runway, 8-1-2 oxygen at night); AC 91-36D (2,000 ft AGL over noise sensitive areas); PHAK ch 2, 5, 7, 12, 16, 17; AFH
// FAA-H-8083-3C ch 2, 5, 6, 7, 9, 14, 18; Aeronautical Chart User's Guide (data blocks, MEF, obstructions).
// Course math conventions (BIBLE.md): pressure altitude from the chart's conversion table; ISA 15°C minus 2°C per 1,000 ft; 120 ft of
// density altitude per °C; avgas 6 lb per gallon.
(function(){
const D=window.HALCYON_DATA=window.HALCYON_DATA||{};
const C=D.pilot=D.pilot||{};
C.mock=C.mock||[];

C.mock.push({ part:`M3: Practice exam 3`, questions:[

// ===== Area I.A pilot qualifications =====
{ q:`Under 14 CFR 61.51, when may a private pilot log pilot in command time?`,
  opts:[`When they're sole manipulator of the controls in an aircraft they're rated for`,
        `Only when they're acting as pilot in command, with passengers aboard the airplane`,
        `Only on flights an instructor has endorsed in their logbook`],
  a:0, why:`61.51(e)(1)(i): a private pilot may log PIC time for the flight time during which they're the sole manipulator of the controls of an aircraft for which they're rated. They may also log it as the sole occupant, or when acting as PIC of an aircraft that needs more than one pilot. Logging PIC and acting as PIC are separate questions.`,
  task:`I.A`, domain:`Preflight` },

// ===== I.B airworthiness =====
{ q:`A VFR only airplane's altimeter and static system were last tested 30 months ago. Under 14 CFR 91.411, may it still be flown VFR?`,
  opts:[`Yes, since the 24 month test is for IFR in controlled airspace`,
        `No, the test is due every 24 calendar months for every kind of flight`,
        `Only after a special flight permit to fly it to a repair shop`],
  a:0, why:`91.411(a): the altimeter, static system, and automatic altitude reporting test every 24 calendar months is required to operate under IFR in controlled airspace. A VFR flight doesn't need it. The transponder test under 91.413 is a different rule, and it does apply to VFR flights that use the transponder.`,
  task:`I.B`, domain:`Preflight` },

// ===== I.C weather, FAA figures 12, 15 and 17 =====
{ fig:`<prop type="img" src="courses/pilot/figs/fig-metar.webp" title="Figure 12. Aviation Routine Weather Reports" alt="FAA figure 12, five METAR and SPECI reports for KINK, KBOI, KLAX, KMDW and KJFK" w="1600" h="358"></prop>`,
  q:`Using the figure, which station reports the lowest ceiling, and how high is it?`,
  opts:[`KLAX, 700 feet AGL`,
        `KMDW, 700 feet AGL`,
        `KJFK, 500 feet AGL`],
  a:2, why:`A ceiling is the lowest broken or overcast layer, or a vertical visibility. KJFK reports OVC005, overcast at 500 feet AGL, the lowest of the five. KMDW has OVC007, 700 feet. KLAX has SCT007 and SCT250, two scattered layers, so KLAX has no ceiling at all. KINK is SKC, and KBOI's only layer is SCT150.`,
  task:`I.C`, domain:`Preflight` },

{ fig:`<prop type="img" src="courses/pilot/figs/fig-metar.webp" title="Figure 12. Aviation Routine Weather Reports" alt="FAA figure 12, five METAR and SPECI reports for KINK, KBOI, KLAX, KMDW and KJFK" w="1600" h="358"></prop>`,
  q:`Using the figure, what does the KJFK report say about runway visual range?`,
  opts:[`Runway 4's RVR is 2,200 feet`,
        `Runway 22's RVR is 400 meters`,
        `Runway 4 is closed until 2200Z`],
  a:0, why:`RVR is reported with the visibility: R, the runway number, a slash, then the range in feet. KJFK's R04/2200 means runway 4 visual range 2,200 feet, with a prevailing visibility of 1/2 SM in fog. RVR is how far down the runway a pilot can see the lights or markings. A closed runway would be a NOTAM, not a METAR group.`,
  task:`I.C`, domain:`Preflight` },

{ fig:`<prop type="img" src="courses/pilot/figs/fig-taf.webp" title="Figure 15. Terminal Aerodrome Forecasts" alt="FAA figure 15, terminal aerodrome forecasts for KMEM and KOKC with FM, TEMPO, PROB40 and BECMG groups" w="1600" h="582"></prop>`,
  q:`Using the figure, what ceiling does the KMEM forecast give from 2200Z on the 12th?`,
  opts:[`3,000 feet broken`,
        `1,500 feet broken`,
        `2,500 feet overcast`],
  a:1, why:`FM122200 starts a new forecast at 2200Z on the 12th: wind 330° true at 15 gusting 20 knots, visibility better than 6 SM (P6SM), BKN015 OVC025. The ceiling is the lowest broken or overcast layer, BKN015, 1,500 feet AGL. BKN030 belongs to the forecast before 2200Z, and OVC025 is the higher layer above the ceiling.`,
  task:`I.C`, domain:`Preflight` },

{ fig:`<prop type="img" src="courses/pilot/figs/fig-winds-aloft.webp" title="Figure 17. Winds and Temperatures Aloft Forecast" alt="FAA figure 17, winds and temperatures aloft forecast table for ALS, AMA, DEN, HLC, MKC and STL at 3,000 to 39,000 feet" w="1600" h="412"></prop>`,
  q:`Using the figure, which station has the strongest forecast wind at 34,000 feet?`,
  opts:[`MKC, about 72 knots`,
        `ALS, about 67 knots`,
        `STL, about 106 knots`],
  a:2, why:`When the first two digits are more than 36, subtract 50 from them for the direction and add 100 to the speed. STL's 730649 is 73 minus 50, 230°, at 06 + 100 = 106 knots, minus 49°C. MKC's 237252 is 230° at 72 knots, and ALS's 246755 is 240° at 67 knots. Read without the rule, STL's group looks like a 6 knot breeze, which is the trap.`,
  task:`I.C`, domain:`Preflight` },

{ fig:`<prop type="img" src="courses/pilot/figs/fig-winds-aloft.webp" title="Figure 17. Winds and Temperatures Aloft Forecast" alt="FAA figure 17, winds and temperatures aloft forecast table for ALS, AMA, DEN, HLC, MKC and STL at 3,000 to 39,000 feet" w="1600" h="412"></prop>`,
  q:`Using the figure, what are the forecast wind and temperature over MKC at 6,000 feet?`,
  opts:[`200° true at 6 knots, minus 3°C`,
        `020° true at 6 knots, plus 3°C`,
        `200° true at 6 knots, plus 3°C`],
  a:2, why:`MKC at 6000 reads 2006+03. The first two digits are the direction in tens of degrees true, 200°. The next two are the speed, 06 knots. Then comes the temperature with its sign, plus 3°C. The sign is printed down low; only above 24,000 feet is it left off, because up there it's always below zero.`,
  task:`I.C`, domain:`Preflight` },

{ q:`What is a squall line?`,
  opts:[`A broad area of steady rain that forms along a slow warm front`,
        `A line of fog banks that forms where cold and warm air meet`,
        `A narrow band of active thunderstorms, often near a cold front`],
  a:2, why:`PHAK ch 12 and the Aviation Weather Handbook: a squall line is a narrow band of active thunderstorms. It often forms on or ahead of a cold front in moist, unstable air, but it can form far from any front. It can be too long to go around and too severe to go through. Steady rain along a warm front is stratiform weather, not a squall line.`,
  task:`I.C`, domain:`Preflight` },

// ===== I.D cross country planning, FAA figure 22 =====
{ q:`How often are VFR sectional charts revised, so you need a new edition?`,
  opts:[`Every 28 days`,
        `Every 56 days`,
        `Every 6 months`],
  a:1, why:`The FAA publishes sectional charts on a 56 day cycle, and the old edition is out of date when the new one takes effect. Between editions, check the NOTAMs and the Chart Supplement for changes, and plan with the current chart.`,
  task:`I.D`, domain:`Preflight` },

{ fig:`<prop type="img" src="courses/pilot/figs/fig-sectional-22.webp" title="Figure 22. Sectional Chart Excerpt" alt="FAA figure 22, sectional chart excerpt of hilly terrain around a large lake with small airports, a contour interval legend and numbered red markers at the points the questions ask about" w="1600" h="2128"></prop>`,
  q:`Using the figure, what is the maximum elevation figure in the quadrangle that holds area 3?`,
  opts:[`5,282 feet MSL`,
        `4,251 feet MSL`,
        `6,600 feet MSL`],
  a:2, why:`The MEF is the big blue number in each quadrangle, thousands in the large digit and hundreds in the small one. Area 3 sits in the quadrangle marked 66, so the MEF is 6,600 feet MSL, which clears the highest terrain and obstructions in that box. 5,282 is a spot elevation near area 3, and 4,251 is the top of an obstruction to its east.`,
  task:`I.D`, domain:`Preflight` },

{ fig:`<prop type="img" src="courses/pilot/figs/fig-sectional-22.webp" title="Figure 22. Sectional Chart Excerpt" alt="FAA figure 22, sectional chart excerpt of hilly terrain around a large lake with small airports, a contour interval legend and numbered red markers at the points the questions ask about" w="1600" h="2128"></prop>`,
  q:`Using the figure, about how tall is the tallest obstruction in the group just east of area 3, measured from the ground?`,
  opts:[`247 feet`,
        `4,251 feet`,
        `4,004 feet`],
  a:0, why:`An obstruction's top is printed in bold in feet MSL, with its height above the ground in parentheses under it. The tallest in that group reads 4251 over (247): the top is 4,251 feet MSL, and the structure stands 247 feet above the ground. 4,004 feet is the ground under it, 4,251 minus 247.`,
  task:`I.D`, domain:`Preflight` },

// ===== I.E airspace, FAA figures 20, 22 and 25 =====
{ fig:`<prop type="img" src="courses/pilot/figs/fig-sectional-20.webp" title="Figure 20. Sectional Chart Excerpt" alt="FAA figure 20, sectional chart excerpt of a coastal area with airports, airspace boundaries and numbered red markers at the points the questions ask about" w="1600" h="2128"></prop>`,
  q:`Using the figure, you'll pass just north of area 6. What does the FAA ask of pilots flying over that area?`,
  opts:[`Stay at least 1,000 feet above the surface`,
        `Stay at least 2,000 feet MSL`,
        `Stay at least 2,000 feet above the surface`],
  a:2, why:`The blue outline and label just north of area 6 mark the Back Bay National Wildlife Refuge. Over charted wildlife refuges and other noise sensitive areas, the FAA asks pilots to stay at least 2,000 feet above the surface (AC 91-36D and the Aeronautical Chart User's Guide). It's a request, not a regulation, and it's measured from the ground, not from sea level.`,
  task:`I.E`, domain:`Preflight` },

{ fig:`<prop type="img" src="courses/pilot/figs/fig-sectional-22.webp" title="Figure 22. Sectional Chart Excerpt" alt="FAA figure 22, sectional chart excerpt of hilly terrain around a large lake with small airports, a contour interval legend and numbered red markers at the points the questions ask about" w="1600" h="2128"></prop>`,
  q:`Using the figure, what airspace begins at the surface over the Coeur d'Alene airport (COE)?`,
  opts:[`Class E, during its published hours`,
        `Class D, run by the airport's control tower`,
        `Class G, with Class E starting at 700 feet AGL`],
  a:0, why:`The dashed magenta line around COE marks a Class E surface area, and the note beside it (see NOTAMs/Directory for Class E (sfc) eff hrs) says it isn't in effect all the time. COE has no control tower: there's no CT frequency in its data block, and its 122.8 is the CTAF. Outside those hours the surface airspace there is Class G.`,
  task:`I.E`, domain:`Preflight` },

{ fig:`<prop type="img" src="courses/pilot/figs/fig-sectional-25.webp" title="Figure 25. Sectional Chart Excerpt" alt="FAA figure 25, sectional chart excerpt of a busy Class B area over a large city, with several towered airports and numbered red markers at the points the questions ask about" w="1600" h="2128"></prop>`,
  q:`Using the figure, between what altitudes does Class B airspace lie over area 7?`,
  opts:[`3,000 to 11,000 feet MSL`,
        `4,000 to 10,000 feet MSL`,
        `4,000 to 11,000 feet MSL`],
  a:2, why:`Class B shelves are labeled with the ceiling over the floor, in hundreds of feet MSL. The label beside area 7 reads 110 over 40, so Class B runs from 4,000 to 11,000 feet MSL there. 110 over 30 marks the next shelf in toward Dallas, and 100 over 40 is the outer shelf up north near Denton. Below 4,000 you're under the Class B but still inside its 30 NM Mode C veil.`,
  task:`I.E`, domain:`Preflight` },

{ q:`An hour after sunset, a private pilot with no instrument rating asks for a special VFR clearance to depart a Class D surface area. Under 14 CFR 91.157, can the pilot get it?`,
  opts:[`No, not at night unless the pilot is instrument rated`,
        `Yes, with 1 SM of flight visibility and clear of clouds`,
        `Yes, if the position and anticollision lights all work`],
  a:0, why:`91.157(b)(4): special VFR between sunset and sunrise needs a pilot who meets the Part 61 requirements for instrument flight and an airplane equipped for IFR under 91.205(d). By day, special VFR takes an ATC clearance, 1 SM flight visibility, and staying clear of clouds, with 1 SM ground visibility to take off or land. Working lights make the airplane legal for night VFR, not for night special VFR.`,
  task:`I.E`, domain:`Preflight` },

// ===== I.F performance and limitations, FAA figures 8, 34, 36, 37, 38 and 40 =====
{ fig:`<prop type="img" src="courses/pilot/figs/fig-density-altitude.webp" title="Figure 8. Density Altitude Chart" alt="FAA figure 8, density altitude chart: slanted pressure altitude lines from minus 1,000 to 14,000 feet over outside air temperature, read against approximate density altitude, with a table of altimeter settings and pressure altitude conversion factors" w="1400" h="1374"></prop>`,
  q:`An airport sits at 5,120 feet MSL, and the altimeter setting there is 30.10. Using the figure, how warm would it have to get for the density altitude to reach 9,000 feet?`,
  opts:[`About 30°C`,
        `About 40°C`,
        `About 50°C`],
  a:1, why:`Start with pressure altitude. The table's factor for 30.1 is minus 165, so 5,120 minus 165 = 4,955 feet, right on the 5,000 foot line. Follow that line up to 9 on the density altitude scale and read straight down: about 41°C (106°F). The rule of thumb agrees. Standard at 5,000 feet is about 5°C, and 4,000 more feet at 120 feet per degree is about 33 degrees warmer, 38°C. At 30°C you'd only be near 7,800 feet.`,
  task:`I.F`, domain:`Preflight` },

{ fig:`<prop type="img" src="courses/pilot/figs/fig-wind-component.webp" title="Figure 36. Crosswind Component Graph" alt="FAA figure 36, crosswind component graph: quarter circle wind speed arcs and angle lines between wind and runway, read down to crosswind component and across to headwind component, with a worked example" w="1400" h="1167"></prop>`,
  q:`An airport has runways 1 and 13, and the wind is from 080° at 25 knots. Using the figure, which runway gives the smaller crosswind, and about how much?`,
  opts:[`Runway 1, about 9 knots`,
        `Runway 13, about 19 knots`,
        `Runway 1, about 23 knots`],
  a:1, why:`Runway 13 sits 50° off the wind (130 minus 80). Runway 1 sits 70° off (80 minus 10). On the chart, the 25 knot arc meets the 50° line about 19 knots across, with 16 knots down the runway, and meets the 70° line about 23 knots across. Runway 13 wins. 9 knots is runway 1's headwind, not its crosswind.`,
  task:`I.F`, domain:`Preflight` },

{ fig:`<prop type="img" src="courses/pilot/figs/fig-wind-component.webp" title="Figure 36. Crosswind Component Graph" alt="FAA figure 36, crosswind component graph: quarter circle wind speed arcs and angle lines between wind and runway, read down to crosswind component and across to headwind component, with a worked example" w="1400" h="1167"></prop>`,
  q:`The POH gives a maximum demonstrated crosswind of 12 knots. You'll land on runway 6 with the wind from 100°. Using the figure, about how strong can the wind get before the crosswind reaches 12 knots?`,
  opts:[`About 16 knots`,
        `About 19 knots`,
        `About 12 knots`],
  a:1, why:`The angle is 100 minus 60, 40°. On the chart, find 12 on the crosswind scale, go straight up to the 40° line, and read the arc there: about 19 knots. As a check, 12 ÷ 0.64 (the sine of 40°) = 18.7. 16 knots is what you'd find on the 50° line. The demonstrated value isn't a structural limit, but it's a sound personal one.`,
  task:`I.F`, domain:`Preflight` },

{ fig:`<prop type="img" src="courses/pilot/figs/fig-cg-envelope.webp" title="Figure 34. Airplane Weight and Balance Graphs" alt="FAA figure 34, bottom half, center of gravity moment envelope: loaded airplane weight against loaded moment divided by 1,000, with the normal and utility category areas" w="1400" h="786"></prop>`,
  q:`After loading, the airplane weighs 1,900 pounds, and its moment divided by 1,000 is 79.0. Using the figure, which is true?`,
  opts:[`It's inside both the normal and the utility category areas`,
        `It's in the normal category area, but aft of the utility area`,
        `It's aft of the envelope, in both of the categories`],
  a:1, why:`Go up the weight scale to 1,900 pounds. There the normal category runs from about 66 to about 90, so 79.0 is inside it. The utility area's dashed aft line crosses 1,900 pounds at about 77, so 79.0 is behind it. Being under 2,000 pounds isn't enough for the utility category; the moment has to sit in that narrower area too. Fly it as a normal category airplane.`,
  task:`I.F`, domain:`Preflight` },

{ fig:`<prop type="img" src="courses/pilot/figs/fig-loading-graph.webp" title="Figure 34. Airplane Weight and Balance Graphs" alt="FAA figure 34, top half, loading graph: load weight in pounds against load moment divided by 1,000 for the pilot and front passenger, rear passengers, baggage and fuel" w="1400" h="1025"></prop>`,
  q:`Using the figure, what is the load moment divided by 1,000 for 120 pounds of baggage?`,
  opts:[`About 8.7`,
        `About 4.5`,
        `About 11.2`],
  a:2, why:`Go across from 120 pounds until you hit the baggage line, then drop straight down to the moment scale: about 11.2. The same 120 pounds on the rear seat line gives 8.7, and on the front seat line 4.5. And 120 is the limit for that area, per the label on the baggage line.`,
  task:`I.F`, domain:`Preflight` },

{ fig:`<prop type="img" src="courses/pilot/figs/fig-landing-table.webp" title="Figure 38. Airplane Landing Distance Table" alt="FAA figure 38, airplane landing distance table at 1,600 pounds: ground roll and total to clear a 50 foot obstacle at sea level, 2,500, 5,000 and 7,500 feet, with notes on headwind, temperature and grass runways" w="1400" h="305"></prop>`,
  q:`Using the figure, what ground roll should you plan for a landing on a dry grass runway at 2,500 feet, standard temperature, zero wind?`,
  opts:[`About 564 feet`,
        `About 697 feet`,
        `About 1,362 feet`],
  a:1, why:`At 2,500 feet the table gives a 470 foot ground roll and 1,135 feet total over a 50 foot obstacle. Note 3 says that on dry grass you add 20 percent of the obstacle figure to both numbers: 20 percent of 1,135 is 227, so the ground roll is 470 + 227 = 697 feet. 564 adds 20 percent of the ground roll instead, and 1,362 is the total distance on grass.`,
  task:`I.F`, domain:`Preflight` },

{ fig:`<prop type="img" src="courses/pilot/figs/fig-landing-table.webp" title="Figure 38. Airplane Landing Distance Table" alt="FAA figure 38, airplane landing distance table at 1,600 pounds: ground roll and total to clear a 50 foot obstacle at sea level, 2,500, 5,000 and 7,500 feet, with notes on headwind, temperature and grass runways" w="1400" h="305"></prop>`,
  q:`Using the figure, what ground roll should you plan at 7,500 feet, standard temperature, on a hard surface with a 12 knot headwind?`,
  opts:[`About 468 feet`,
        `About 364 feet`,
        `About 879 feet`],
  a:1, why:`At 7,500 feet the ground roll is 520 feet. Note 1 takes off 10 percent for each 4 knots of headwind, and 12 knots is three steps, 30 percent: 520 × 0.70 = 364 feet. 468 takes off only one step. 879 is the total over a 50 foot obstacle after the same cut, 1,255 × 0.70.`,
  task:`I.F`, domain:`Preflight` },

{ fig:`<prop type="img" src="courses/pilot/figs/fig-landing-graph.webp" title="Figure 37. Airplane Landing Distance Graph" alt="FAA figure 37, airplane landing distance graph: outside air temperature and pressure altitude, then weight, then wind component, then a 50 foot obstacle, read across reference lines, with a worked example" w="1600" h="1001"></prop>`,
  q:`Using the figure, what approach speed at 50 feet should you fly when landing at 2,500 pounds?`,
  opts:[`About 73 knots`,
        `About 64 knots`,
        `About 68 knots`],
  a:1, why:`The little weight table up top does the work. 2,600 pounds gets 65 knots and 2,400 gets 63, so split the difference at 2,500: about 64. Pick 73 and you've read the MPH column by mistake (75 and 72 average 73.5). 68 is the 2,800 pound number.`,
  task:`I.F`, domain:`Preflight` },

{ fig:`<prop type="img" src="courses/pilot/figs/fig-takeoff-graph.webp" title="Figure 40. Airplane Takeoff Distance Graph" alt="FAA figure 40, airplane takeoff distance graph: outside air temperature and pressure altitude, then weight, then wind component, then obstacle height, read across reference lines, with a worked example" w="1600" h="955"></prop>`,
  q:`Using the figure, if the worked example had calm wind instead of its headwind, about what would the ground roll be?`,
  opts:[`About 1,250 feet`,
        `About 2,300 feet`,
        `About 1,500 feet`],
  a:2, why:`Trace the example. Its line hits the wind section's reference line at about 1,500 feet, then the 9 knot headwind guide pulls it down to 1,375. Calm wind? You stop at the reference line and read about 1,500. The 2,300 is the example's total over the obstacle, not a ground roll, and anything shorter than 1,375 would mean no wind beats a headwind. It doesn't.`,
  task:`I.F`, domain:`Preflight` },

{ q:`An airplane takes off at 2,350 pounds with its CG at 42.0 inches. In flight it burns 30 gallons of fuel from tanks at an arm of 48.0 inches. Where is the CG when it lands?`,
  opts:[`42.0 inches`,
        `42.5 inches`,
        `41.5 inches`],
  a:2, why:`Start with the takeoff moment: 2,350 × 42.0 = 98,700. Thirty gallons is 180 pounds, and at 48.0 inches that's 8,640 of moment gone. What's left is 2,170 pounds and 90,060. Divide: 41.5 inches. The fuel sat behind the CG, so burning it pulls the CG forward.`,
  task:`I.F`, domain:`Preflight` },

// ===== I.G systems =====
{ q:`The avgas grade your engine calls for isn't available. According to the PHAK, what may you use instead?`,
  opts:[`The next higher grade of avgas`,
        `A lower grade, run with a full rich mixture`,
        `Auto gas with the same octane rating`],
  a:0, why:`PHAK ch 7 says go one grade up if yours isn't there, never down. Lower octane fuel is how you get detonation and hot cylinders. Auto gas needs an STC for that engine and airframe, and nobody gave you one.`,
  task:`I.G`, domain:`Preflight` },

{ q:`In an airplane with a constant speed propeller, you're adding power for a climb. In what order should you move the controls?`,
  opts:[`Throttle first, then the propeller control`,
        `Propeller control first, then the throttle`,
        `Both together, keeping manifold pressure and RPM matched`],
  a:1, why:`PHAK ch 7. Big manifold pressure with low RPM is hard on the engine, so going up, it's RPM first and then manifold pressure. Coming down it's the reverse: throttle back, then RPM.`,
  task:`I.G`, domain:`Preflight` },

{ q:`In a long climb on a hot day, the oil temperature and cylinder head temperature run high. What does the PHAK suggest?`,
  opts:[`Lean the mixture and raise the nose for a steeper climb`,
        `Add power so the engine turns faster and cools itself`,
        `Enrich the mixture and lower the nose for more airspeed`],
  a:2, why:`PHAK ch 7 lists the fixes: more fuel (enrich), more cooling air (a shallower climb at a higher airspeed), less power, and cowl flaps open if you've got them. Lean and steep is exactly backward.`,
  task:`I.G`, domain:`Preflight` },

{ q:`A pilot plans a low pass over a friend's backyard party, thinking, "They'll love this, and I'm good enough to pull it off." Which antidote does the PHAK pair with this attitude?`,
  opts:[`"Taking chances is foolish."`,
        `"Not so fast. Think first."`,
        `"I'm not helpless. I can make a difference."`],
  a:0, why:`PHAK ch 2, figure 2-4: taking a risk to impress people is macho, "I can do it," and its antidote is "Taking chances is foolish." "Not so fast. Think first." answers impulsivity, and "I'm not helpless." answers resignation.`,
  task:`I.H`, domain:`Preflight` },

// ===== I.H human factors =====
{ q:`In the PHAK's 3P model of risk management, what are the three steps?`,
  opts:[`Plan, prepare, proceed`,
        `Pilot, plane, passengers`,
        `Perceive, process, perform`],
  a:2, why:`PHAK ch 2: the 3P model is perceive (spot the hazards), process (judge the risk each one brings), and perform (act to cut the risk, then watch how it works). It runs over and over through a flight. Pilot and plane come from PAVE, the hazard checklist (pilot, aircraft, environment, external pressures), not from 3P.`,
  task:`I.H`, domain:`Preflight` },

{ q:`In cloud, an airplane rolls very slowly into a bank, too slowly for the inner ear to notice. The pilot sees it on the attitude indicator and rolls level, then feels banked the other way. What is this?`,
  opts:[`A Coriolis illusion`,
        `A case of the leans`,
        `A graveyard spiral`],
  a:1, why:`PHAK ch 17: the leans. The inner ear misses the slow roll, then senses the quick correction as a roll the other way, so wings level feels like a bank. The urge is to roll back into the original bank. Believe the instruments. A Coriolis illusion comes from moving your head in a long turn, and a graveyard spiral is a descending turn that feels level.`,
  task:`I.H`, domain:`Preflight` },

// ===== II preflight procedures and taxiing, FAA figures 9, 48, 64 and 65 =====
{ fig:`<prop type="img" src="courses/pilot/figs/fig-taxi-controls.webp" title="Figure 9. Control Position for Taxi" alt="FAA figure 9, control position for taxi: a high wing airplane seen from above with four wind arrows, A left front quarter, B right front quarter, C left rear quarter, D right rear quarter" w="1000" h="913"></prop>`,
  q:`In a tailwheel airplane, how should you hold the controls while taxiing with the wind from arrow A in the figure?`,
  opts:[`Elevator up, left aileron down`,
        `Elevator down, left aileron down`,
        `Elevator up, left aileron up`],
  a:2, why:`Arrow A is a quartering headwind from the left front. AFH ch 2: into a quartering headwind, hold the upwind aileron up, here the left, by turning the controls toward the wind. AFH ch 14 adds that a tailwheel airplane usually holds the elevator full back, elevator up, to keep weight on the tailwheel and help it steer. Aileron down on the upwind side is for a quartering tailwind, not a headwind.`,
  task:`II`, domain:`Preflight` },

{ fig:`<prop type="img" src="courses/pilot/figs/fig-airport-diagram.webp" title="Figure 48. Airport Diagram" alt="FAA figure 48, airport diagram with parallel runways, taxiways, ramps, a tower and an air carrier terminal, with red letter markers at runway and taxiway markings" w="1200" h="1339"></prop>`,
  q:`Using the figure, you're landing on runway 12. Where does the part of the runway you may land on begin?`,
  opts:[`At B, right after the arrows`,
        `At A, where the paving starts`,
        `At the first taxiway past B`],
  a:0, why:`Arrows on a runway mean a displaced threshold. They run from A up to B, and B is the threshold bar, so you land past B (AIM 2-3-3).`,
  task:`II`, domain:`Preflight` },

{ fig:`<prop type="img" src="courses/pilot/figs/fig-airport-markings.webp" title="Figure 64. Airport Markings" alt="FAA figure 64, airport markings: a runway and taxiways with hold short, ILS critical area and taxiway edge markings at red letter markers A to F" w="1200" h="1244"></prop>`,
  q:`Using the figure, what does the marking at E tell a pilot?`,
  opts:[`Hold short of the runway ahead; you need a clearance to cross`,
        `It's a taxiway holding point; stop there when ATC says to`,
        `It's the edge of the movement area; call ground before going on`],
  a:1, why:`That single dashed yellow line at E is where ATC can hold you short of an intersecting taxiway (AIM 2-3-5). The pink 4 beside it is a geographic position marking (AIM 2-3-4), mostly for low visibility, so a controller can say hold at 4. You stop there only if you're told to. A runway hold marking looks different, two solid lines and two dashed, like the one down at the runway. One solid and one dashed is the movement area edge.`,
  task:`II`, domain:`Preflight` },

{ fig:`<prop type="img" src="courses/pilot/figs/fig-airport-signs.webp" title="Figure 65. U.S. Airport Signs" alt="FAA figure 65, U.S. airport signs lettered A to N: mandatory red signs, yellow direction and destination signs, a black location sign, and runway and taxiway pavement markings" w="1000" h="1372"></prop>`,
  q:`Using the figure, you're taxiing off a runway after landing and pass sign G. What does it tell you?`,
  opts:[`You're past the holding position and clear of the runway`,
        `You're leaving the ILS critical area`,
        `Stop and hold here until ATC clears you onto the runway`],
  a:0, why:`G is the runway boundary sign (AIM 2-3-9): yellow, with a picture of the hold short marking on it. You see it on your way off the runway. Once your tail's past it, you're off. H, the one with the ladder, is the ILS critical area version. The red ones, like A, are the stop signs.`,
  task:`II`, domain:`Preflight` },

{ q:`Taxiing at night, you see a pair of yellow lights flashing alternately beside the taxiway ahead. What are they telling you?`,
  opts:[`A runway holding position is coming up`,
        `The taxiway ends just ahead, so stop now`,
        `The tower wants you to hold for a light signal`],
  a:0, why:`Those are elevated runway guard lights, wig wags (AIM 2-1-10). They sit on both sides of the taxiway at a runway holding position, and what they're saying is runway ahead. Stop at the hold line unless you've been cleared on. A taxiway that just ends gets a yellow and black striped marker, and light gun signals come from the tower cab.`,
  task:`II`, domain:`Preflight` },

// ===== III.A communications and runway lighting, FAA figures 20 and 47 =====
{ fig:`<prop type="img" src="courses/pilot/figs/fig-vasi.webp" title="Figure 47. VASI Illustrations" alt="FAA figure 47, four two bar VASI illustrations labeled A to D, each a runway seen on approach with near and far light bars in red and white combinations" w="1000" h="1077"></prop>`,
  q:`Using the figure, which picture should you hold all the way down final?`,
  opts:[`Illustration C`,
        `Illustration A`,
        `Illustration D`],
  a:1, why:`On a two bar VASI the near bar is the lower row and the far bar the upper. On the glide path the near bar shows white and the far bar red, red over white, which is A. All white, as in C, means high. All red, as in D, means low (AIM 2-1-2).`,
  task:`III.A`, domain:`Airport and flight` },

{ fig:`<prop type="img" src="courses/pilot/figs/fig-sectional-20.webp" title="Figure 20. Sectional Chart Excerpt" alt="FAA figure 20, sectional chart excerpt of a coastal area with airports, airspace boundaries and numbered red markers at the points the questions ask about" w="1600" h="2128"></prop>`,
  q:`Using the figure, you'll land at Newport News/Williamsburg (PHF) at night, after the tower has closed. On what frequency should you self-announce?`,
  opts:[`122.95`,
        `122.2`,
        `118.7`],
  a:2, why:`PHF's data block shows CT 118.7 with a star, so the tower is part time, and the C in a circle after it marks 118.7 as the CTAF when the tower is closed. 122.95 is the UNICOM. 122.2 is a Flight Service frequency, listed above the Newport News RCO box.`,
  task:`III.A`, domain:`Airport and flight` },

// ===== III.B traffic patterns, FAA figures 22, 49 and 50 =====
{ fig:`<prop type="img" src="courses/pilot/figs/fig-landing-indicators.webp" title="Figure 49. Airport Diagram" alt="FAA figure 49, airport diagram of crossing runways 18 36 and 4 22 with closed runway X markings and a segmented circle with a tetrahedron landing direction indicator" w="1000" h="858"></prop>`,
  q:`Using the figure, which runway should you land on?`,
  opts:[`Runway 22`,
        `Runway 36`,
        `Runway 18`],
  a:2, why:`The small end of the tetrahedron points the direction to land, here toward the southwest (AIM 4-3-4, which also warns against reading it as a wind indicator). Runway 22 would line up best, but the X at each end means it's closed. On the open runway, 18 lands toward the south, the way the tetrahedron points; 36 would land the opposite way.`,
  task:`III.B`, domain:`Airport and flight` },

{ fig:`<prop type="img" src="courses/pilot/figs/fig-segmented-circle.webp" title="Figure 50. Wind Sock Airport Landing Indicator" alt="FAA figure 50, wind sock airport landing indicator: a segmented circle with a wind cone in the middle and four L shaped traffic pattern indicators, north arrow up" w="1000" h="858"></prop>`,
  q:`Using the figure, a pilot will land toward the west. What traffic pattern do the indicators call for?`,
  opts:[`Left traffic, with the pattern south of the runway`,
        `Right traffic, with the pattern north of the runway`,
        `Left traffic, with the pattern north of the runway`],
  a:1, why:`Each L beside the circle is a landing strip indicator, the long leg, with a traffic pattern indicator, the short leg, which shows the turn onto final (AIM 4-3-4). Landing west means arriving from the east, and the east indicator's short leg points north: base leg north of the runway, turning right onto final. That's right traffic with the downwind north of the runway. Every pattern at this field stays north or west of it.`,
  task:`III.B`, domain:`Airport and flight` },

{ fig:`<prop type="img" src="courses/pilot/figs/fig-sectional-22.webp" title="Figure 22. Sectional Chart Excerpt" alt="FAA figure 22, sectional chart excerpt of hilly terrain around a large lake with small airports, a contour interval legend and numbered red markers at the points the questions ask about" w="1600" h="2128"></prop>`,
  q:`Using the figure, no pattern altitude is published for Sandpoint (SZT), so you'll fly the usual 1,000 feet above the field. What altitude is that?`,
  opts:[`About 2,130 feet MSL`,
        `About 3,130 feet MSL`,
        `About 3,630 feet MSL`],
  a:1, why:`Sandpoint's data block gives the field elevation as 2131, the first number on the italic line. 2,131 + 1,000 = about 3,130 feet MSL. AIM 4-3-3: propeller driven airplanes fly the pattern at 1,000 feet AGL unless the airport publishes something else; large and turbine airplanes use at least 1,500 feet AGL. Check the Chart Supplement before you go.`,
  task:`III.B`, domain:`Airport and flight` },

// ===== IV takeoffs, landings, and go arounds =====
{ q:`On a soft field takeoff, what does the AFH say to do right after the airplane lifts off?`,
  opts:[`Level off in ground effect and let it speed up`,
        `Climb at once at VX to get away from the surface`,
        `Lower the nose so the wheels touch for a moment`],
  a:0, why:`AFH ch 6: get the weight off the wheels as early as you can and lift off at the lowest possible airspeed. Then lower the nose a little and fly level just above the surface, in ground effect, until you reach VX or VY. Trying to climb at that low speed can settle you back onto the ground or stall you.`,
  task:`IV`, domain:`Airport and flight` },

{ q:`On landing, the airplane hits hard and bounces well up off the runway. What does the AFH say is the safest move?`,
  opts:[`Add full power and go around at once`,
        `Push forward to get the wheels back down`,
        `Hold the attitude and let it settle back`],
  a:0, why:`AFH ch 9: when a bounce is severe, the safest thing is an immediate go around. A light bounce can be handled by holding the landing attitude and adding a little power to soften the next touchdown. Pushing forward is how a bounce becomes a porpoise and a hard landing on the nosewheel.`,
  task:`IV`, domain:`Airport and flight` },

// ===== V ground reference, VII slow flight and stalls, VIII basic instruments =====
{ q:`According to the AFH, at about what height should ground reference maneuvers such as turns around a point be flown?`,
  opts:[`600 to 1,000 feet AGL`,
        `300 to 500 feet AGL`,
        `1,500 to 2,000 feet AGL`],
  a:0, why:`AFH ch 7 and the ACS: 600 to 1,000 feet AGL. That's low enough to see the wind drift against the ground and high enough to leave room for an engine failure. Pick a point away from people, buildings and towers, since 91.119 still applies.`,
  task:`V`, domain:`Airport and flight` },

{ q:`Going around from a slow, full flap approach with full nose up trim, a pilot adds full power, and the nose rises sharply. What does the AFH say to do?`,
  opts:[`Push forward firmly, then retrim and clean up`,
        `Let it climb, since steep is safest near the ground`,
        `Pull the power back until the nose comes down`],
  a:0, why:`AFH ch 5 calls this the elevator trim stall: power plus nose up trim at low speed pitches the airplane up into a stall. Hold firm forward pressure to keep a safe climb attitude, retrim, and raise the flaps in steps as the airspeed builds. Taking the power off near the ground trades one problem for a worse one.`,
  task:`VII`, domain:`Airport and flight` },

{ q:`As you slow from cruise into slow flight, how do the flight controls change?`,
  opts:[`They get stiffer, so smaller movements are needed`,
        `They get less effective, so you need bigger movements`,
        `They feel the same, since the trim takes up the change`],
  a:1, why:`AFH ch 5: with less air flowing over the control surfaces, control effectiveness drops as the airspeed drops, and it takes larger control movements to get the same response. Pilots call that feel mushy. It's one of the cues that you're getting close to a stall, along with the sound of the air and the stall warning.`,
  task:`VII`, domain:`Airport and flight` },

{ q:`A VFR pilot who has blundered into cloud wants to turn back the way they came. According to the AFH, what is the most bank they should use?`,
  opts:[`About 30° of bank`,
        `No more than 10°`,
        `About 45° of bank`],
  a:1, why:`AFH ch 18: turns are the most dangerous maneuver for a pilot without instrument training, because the urge to overcontrol leads to steep banks and a graveyard spiral. Use the smallest practical bank, never more than 10°, and keep the wings level on the attitude indicator between small turns if the heading change is large.`,
  task:`VIII`, domain:`Airport and flight` },

// ===== XII postflight =====
{ q:`After landing, the tower gives you no other instructions. Where should you stop to run the after landing checklist?`,
  opts:[`With all of the airplane past the holding position markings`,
        `As soon as the nosewheel is off the runway and on the taxiway`,
        `On the runway, after slowing down and asking the tower`],
  a:0, why:`AIM 4-3-21: exit at the first available taxiway without delay, and with no instructions from ATC, taxi beyond the runway holding position markings for the landing runway. Once every part of the airplane is past them, hold there until ATC tells you more. Don't stop on the runway at a towered airport or exit onto another runway without approval.`,
  task:`XII`, domain:`Airport and flight` },

// ===== VI navigation =====
{ q:`Inbound to a VOR with the OBS set to 090 and a TO flag, you're heading about 090, and the CDI needle sits left of center. Which way is the course, and what do you do?`,
  opts:[`To your right, so turn right away from the needle`,
        `To your left, so turn left toward the needle`,
        `Behind you, so reset the OBS to 270`],
  a:1, why:`With a TO flag and a heading close to the OBS setting, the needle shows where the course is: needle left, course left. Turn a little left, toward the needle, to intercept, and hold a correction until it centers (PHAK ch 16).`,
  task:`VI`, domain:`Navigation and emergencies` },

{ q:`You've passed over a VOR and are now flying outbound, heading 270, but you left the OBS set to 090. What will the CDI do?`,
  opts:[`Work normally, with the needle pointing toward the course`,
        `Center and show OFF until you reset it`,
        `Show reverse sensing, pointing away from the course`],
  a:2, why:`With 090 set while you fly 270, the flag reads TO even though you're flying away from the station, and the needle works backward: steering toward it takes you farther off course. Set the OBS to 270, close to your heading, and you get a FROM flag and normal sensing (PHAK ch 16).`,
  task:`VI`, domain:`Navigation and emergencies` },

{ q:`On a true course of 360°, the wind is from 270° at 20 knots. To hold the course, how will your true heading compare with it?`,
  opts:[`It will be east of the course`,
        `It will be west of the course`,
        `It will equal the course`],
  a:1, why:`PHAK ch 16, wind correction. A wind out of the west at 20 knots will drift you east of the line, so you crab into it, pointing west of north. Your true heading comes out around 350°, less than the course. Left wind, left correction.`,
  task:`VI`, domain:`Navigation and emergencies` },

{ q:`On a sectional chart, a dashed magenta line is labeled 11°W. What is it?`,
  opts:[`An isogonic line, joining points of 11° west variation`,
        `The agonic line, where the variation measures 11 degrees`,
        `A VOR radial lying 11° west of true north`],
  a:0, why:`PHAK ch 16: isogonic lines join places with the same magnetic variation. 11°W means magnetic north lies 11° west of true north there, so you add 11 to a true course to get the magnetic course: west is best. The agonic line is the one with zero variation.`,
  task:`VI`, domain:`Navigation and emergencies` },

{ q:`Your true airspeed is 110 knots, and the wind is a direct headwind of 20 knots. About how long will a 75 NM leg take?`,
  opts:[`About 41 minutes`,
        `About 34 minutes`,
        `About 50 minutes`],
  a:2, why:`Subtract the headwind first. 110 minus 20 leaves a 90 knot groundspeed, and 75 NM at 90 knots takes 0.83 hours, which is 50 minutes. The 41 minute answer forgot the wind entirely (75 ÷ 110); the 34 minute one added it (75 ÷ 130).`,
  task:`VI`, domain:`Navigation and emergencies` },

// ===== IX emergency operations =====
{ q:`An engine failure leaves you no choice but to land in a forest. What does the AFH advise?`,
  opts:[`Into the wind, flaps down, nose high, at minimum speed`,
        `Aim for the tallest trees, to let the branches slow you`,
        `Keep the speed up and aim for a gap between trunks`],
  a:0, why:`The AFH's tree landing advice in ch 18: normal landing flaps and gear, head into the wind to keep the groundspeed down, and arrive at the lowest safe airspeed, not below the stall, nose high, so the belly and wings take the first hit and the windshield doesn't. Low trees with thick crowns cushion better than tall thin ones. Keep the fuselage off heavy trunks.`,
  task:`IX`, domain:`Navigation and emergencies` },

{ q:`Cruising in humid air, the RPM slowly drops and the engine begins to run rough. You pull full carburetor heat, and for a moment it runs even rougher. What should you do?`,
  opts:[`Push the heat back off, since the heat caused it`,
        `Lean the mixture until all the roughness stops`,
        `Keep the heat on while melted ice goes through`],
  a:2, why:`From PHAK ch 7: when you pull full heat on an iced carburetor, power drops further and the engine may shake while the melted ice goes through, anywhere from 30 seconds to several minutes. That's expected. Leave the heat on; the RPM should come back higher than before. Pushing it in now just lets the ice build again.`,
  task:`IX`, domain:`Navigation and emergencies` },

{ q:`On approach, you lower the flaps and the airplane rolls hard to one side. Only one flap came down. What does the AFH say about the landing?`,
  opts:[`Fly it on a bit fast, with no crosswind from the lowered flap's side`,
        `Slow to the normal speed and flare high to soften the touchdown`,
        `Land with the crosswind from the lowered flap's side to hold it up`],
  a:0, why:`AFH ch 18 on split flaps: the roll goes toward the wing with less flap, so you'll hold near full opposite aileron, plus opposite rudder against the extra drag. Plan a faster approach, fly it onto the runway with no big flare, and pick a runway where the crosswind isn't coming from the flapped side, since you may not have the aileron left to fight it.`,
  task:`IX`, domain:`Navigation and emergencies` },

{ q:`In flight, the up elevator cable breaks. The yoke moves back with no effect, but forward still works. According to the AFH, how can you keep pitch control?`,
  opts:[`Use only power, since the elevator is now useless`,
        `Trim nose down and pull back to raise the nose`,
        `Trim nose up, then push forward to set the attitude`],
  a:2, why:`AFH ch 18: with the up cable gone, apply considerable nose up trim, then push forward to hold the attitude you want. More forward pressure lowers the nose, less raises it, and releasing forward pressure gives you the flare. If it were the down cable, you'd do the reverse with nose down trim.`,
  task:`IX`, domain:`Navigation and emergencies` },

// ===== XI night operations, FAA figure 20 =====
{ fig:`<prop type="img" src="courses/pilot/figs/fig-sectional-20.webp" title="Figure 20. Sectional Chart Excerpt" alt="FAA figure 20, sectional chart excerpt of a coastal area with airports, airspace boundaries and numbered red markers at the points the questions ask about" w="1600" h="2128"></prop>`,
  q:`Using the figure, can you count on runway lights for a night landing at First Flight (FFA), area 5?`,
  opts:[`Yes, they're on from sunset to sunrise`,
        `No, its data block shows no runway lighting`,
        `Yes, if you key the microphone on its CTAF`],
  a:1, why:`FFA's data block reads 12, then a dash, then 30: field elevation 12 feet, a dash where the lighting code goes, and a 3,000 foot runway. The dash means no lighting is charted. An L there would mean lights from sunset to sunrise, and *L means some limitation, often pilot controlled lighting, which is when you'd key the mic. Check the Chart Supplement before a night trip.`,
  task:`XI`, domain:`Navigation and emergencies` },

{ q:`For best protection, above about what altitude does the AIM encourage pilots to use supplemental oxygen at night?`,
  opts:[`10,000 feet`,
        `12,500 feet`,
        `5,000 feet`],
  a:2, why:`AIM 8-1-2: hypoxia dulls night vision early, so the AIM encourages supplemental oxygen above 10,000 feet by day and above 5,000 feet at night. 12,500 feet is where 91.211 starts requiring it for the crew, after 30 minutes. The AIM's numbers are advice, the rule is the floor.`,
  task:`XI`, domain:`Navigation and emergencies` },

{ q:`On a personal night flight, a private pilot finds the landing light burned out. Under 14 CFR 91.205, may the pilot still go?`,
  opts:[`Yes, if position and anticollision lights work`,
        `No, since a landing light is required at night`,
        `Yes, but only inside the airport's traffic pattern`],
  a:0, why:`91.205(c) lists the extra equipment for VFR at night: position lights, an approved anticollision light system, an adequate source of electrical energy, a spare set of fuses, and, if the aircraft is operated for hire, one electric landing light. On a personal flight the landing light isn't required, though it's smart to have one working.`,
  task:`XI`, domain:`Navigation and emergencies` }

]});
})();
