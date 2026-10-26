// Private Pilot course "Danny's Logbook": practice exam 2 (60 questions, three options, 120 minutes, 70 to pass, like form 1 in mock.js).
// Built 2026-10-25. Same spread as form 1, the way the PAR test usually runs (the FAA publishes no area weights): Area I 36
// (I.A 5, I.B 3, I.C 7, I.D 4, I.E 5, I.F 5, I.G 4, I.H 3), II 1, III.A 3, III.B 2, IV 2, V 1, VII 1, VIII 2, XII 1, VI 5, IX 3, XI 3.
// 16 calculation items, each with a typed fig prop (figHTML), plus 3 figure reading items: 19 figures. Keys: 20 at each index.
// check_tells (2026-10-25): rule 17%, key longest 25%, shortest 23%, fewest clauses 25%. Highest stem plus key Jaccard 0.34.
// Settings and airports are fictional, not the Jordan story. Original items; none closely repeats form 1 or a chapter quiz item
// (stem plus key word Jaccard, checked against the 60 form 1 items and the 238 quiz items in full/ch01 to ch12).
// The engine reads parts by part.slice(0,3) for question ids and by the "M2:" prefix for the form, so this part starts "M2:".
// Form 1's parts (Preflight, Airport and flight, Navigation and emergencies) carry no prefix, so they stay form 1 with their saved keys.
// Every rule and number below was checked on 2026-10-25 against these sources (all read directly):
//   eCFR title 14, current to 2026-10-22: 1.1 (ceiling, night), 21.197, 61.23(c)(3), 61.31(g), 61.56(a), 61.57(b), 61.113(b), (e), (i)
//     (BasicMed limits as amended by Amdt. 61-158, Nov. 18, 2024), 91.126(b), 91.151(a), 91.155(a), 91.157, 91.207(d), 91.209, 91.225(d)(4),
//     91.413(a), 91.417(a)(2)(v)
//   AIM (faa.gov aim_html): 1-1-17 (VFR GPS database), 2-1-9 (beacons), 3-2-4 (Class C), 3-4-4 (warning areas), 4-2-4 (call signs),
//     4-3-3 (pattern altitude), 4-3-18 (taxi, readbacks, runway crossings), 5-1-5 and 5-1-14 (VFR flight plans), 6-2-4 (ELT false alarms),
//     6-3-1 (MAYDAY, PAN-PAN), 7-1-6 (Convective SIGMET), 7-4-6 (wake, departing behind), 8-1-5 (illusions); Pilot/Controller Glossary
//     (MONITOR, URGENCY, DISTRESS)
//   PHAK FAA-H-8083-25C ch 2 (PAVE), 4 (lapse rate), 5 (precession), 7 (detonation), 8 (pitot static, gyros), 11 (performance),
//     12 (inversion), 16 (navigation), 17 (time of useful consciousness)
//   AFH FAA-H-8083-3C ch 3 (overbanking), 5 (cross control stall), 6 (crosswind takeoff), 9 (gust factor), 18 (cabin fire, alternator)
//   Aviation Weather Handbook FAA-H-8083-28B 24.5.1.6 (PIREP sky condition, MSL) and 27.9.1.2 (Low-Level SIGWX shows no icing)
//   Instrument Flying Handbook FAA-H-8083-15B (cross check errors)
// Course math conventions (BIBLE.md): ISA lapse 2°C per 1,000 ft; 1 inch on a sectional (1:500,000) is about 6.86 NM; 60 to 1 rule.
(function(){
const D=window.HALCYON_DATA=window.HALCYON_DATA||{};
const C=D.pilot=D.pilot||{};
C.mock=C.mock||[];

C.mock.push({ part:`M2: Practice exam 2`, questions:[

// ===== Area I.A pilot qualifications =====
{ q:`A private pilot flying under BasicMed wants to take 6 passengers in an airplane authorized for 7 occupants, with a maximum takeoff weight of 5,200 pounds, cruising at 9,500 feet. Does BasicMed allow the flight?`,
  opts:[`Yes. The flight fits within every BasicMed limit`,
        `No, BasicMed allows no more than 5 passengers aboard`,
        `No, BasicMed limits the airplane to just 6 occupants`],
  a:0, why:`61.113(i), as amended in November 2024: under BasicMed the aircraft may be authorized for up to 7 occupants and 12,500 pounds maximum takeoff weight, with no more than 6 passengers, at or below 18,000 feet MSL and 250 knots indicated. This flight fits every limit. The 5 passenger and 6 occupant numbers are the old limits from before the 2024 change. The pilot still needs the course within 24 calendar months and the exam within 48 calendar months under 61.23(c)(3).`,
  task:`I.A`, domain:`Preflight` },

{ q:`A private pilot wants to act as pilot in command of a pressurized single engine airplane with a service ceiling of 28,000 feet. Under 14 CFR 61.31, what does the pilot need first?`,
  opts:[`High altitude training with instructor endorsements`,
        `Only a high performance endorsement, if the engine has over 200 horsepower`,
        `Nothing extra, since pressurization means no oxygen rule applies to the flight`],
  a:0, why:`61.31(g): an aircraft with a service ceiling or maximum operating altitude above 25,000 feet MSL takes logged ground training on high altitude operations and logged training in a pressurized aircraft or a representative simulator, each with an instructor's endorsement. A high performance endorsement may also apply under 61.31(f), but it doesn't replace this one. Pressurization is the reason for the training, not an exemption from it.`,
  task:`I.A`, domain:`Preflight` },

{ q:`What is the least a flight review under 14 CFR 61.56 must include?`,
  opts:[`1 hour of flight training and 1 hour of ground training`,
        `2 hours of flight training, with three takeoffs and landings`,
        `A practice knowledge test and 1 hour of flight training`],
  a:0, why:`61.56(a): at least 1 hour of flight training and 1 hour of ground training, covering the current Part 91 rules and whatever maneuvers the instructor decides you need to show. There's no knowledge test in it and no landing count. Three takeoffs and landings are the 61.57 passenger currency rule, which is a separate thing.`,
  task:`I.A`, domain:`Preflight` },

{ q:`A private pilot who owns a landscaping company flies alone in a rented airplane to meet a client two states away. The company pays for the rental. Does 14 CFR 61.113 allow it?`,
  opts:[`No, because a private pilot's flight can never be paid for by anyone`,
        `Yes, but only after 200 hours of logged time, and with a second class medical`,
        `Yes, if it's only incidental to the business and carries no one for hire`],
  a:2, why:`61.113(b): a private pilot may act as pilot in command for compensation in connection with a business or job if the flight is only incidental to it and the airplane carries no passengers or property for compensation or hire. Flying yourself to a client meeting fits. The 200 hour figure belongs to 61.113(f), the aircraft salesman who demonstrates an airplane to a buyer.`,
  task:`I.A`, domain:`Preflight` },

{ q:`A private pilot flies a search for a missing hiker. The search is run by the county sheriff's office, which offers to repay the pilot's fuel and the airplane rental. May the pilot accept?`,
  opts:[`Yes, since repayment is allowed on a search an agency directs`,
        `Only for the fuel, and only if a passenger also shares the cost`,
        `No, because only a commercial pilot may be repaid for a flight`],
  a:0, why:`61.113(e): a private pilot may be reimbursed for operating expenses directly related to search and location operations, limited to fuel, oil, airport expenditures, or rental fees, when a local, state, or federal agency or a search organization sanctions and directs the operation. A sheriff's office qualifies. No commercial certificate is needed for this, and sharing costs with passengers is a different rule, 61.113(c).`,
  task:`I.A`, domain:`Preflight` },

// ===== I.B airworthiness =====
{ fig:`<prop type="doc" title="Figure: avionics logbook entry, described">March 3, 2025. ATC transponder and altitude reporting equipment tested and inspected under 14 CFR 91.413 and found to comply. Signed by a certificated repair station.</prop>`,
  q:`Using the figure, through what date may the transponder be used without another test?`,
  opts:[`March 3, 2026`,
        `March 31, 2027`,
        `March 3, 2027`],
  a:1, why:`91.413(a): the transponder must have been tested and inspected within the preceding 24 calendar months. Calendar months run to the end of the month, so a test on March 3, 2025 is good through March 31, 2027. March 3, 2027 forgets the end of the month, and a one year date is the ELT inspection cycle (91.207(d)), not the transponder's.`,
  task:`I.B`, domain:`Preflight` },

{ q:`An airplane's annual inspection ran out last month. The owner wants to fly it to a shop at another airport to have the inspection done there. What makes that flight legal?`,
  opts:[`An instructor endorsement in the owner's logbook for the trip`,
        `A placard marking the airplane inoperative except for that trip`,
        `A special flight permit from the FAA for the ferry flight`],
  a:2, why:`14 CFR 21.197(a)(1): a special flight permit can be issued for an aircraft that doesn't currently meet its airworthiness requirements but is capable of safe flight, to fly it to a base where repairs, alterations, or maintenance will be done. An instructor endorsement covers pilot training, not the airplane. A placard works for some inoperative equipment under 91.213, but it can't stand in for an overdue annual.`,
  task:`I.B`, domain:`Preflight` },

{ q:`An airworthiness directive on an airplane calls for a repeat inspection every 100 hours. Under 14 CFR 91.417, what must the maintenance records show about it?`,
  opts:[`The date it was first complied with and the mechanic's name`,
        `Its current status, including when the next repeat inspection is due`,
        `Nothing extra, since a repeat inspection is logged with the annual`],
  a:1, why:`91.417(a)(2)(v): the records must show the current status of each applicable AD, including the method of compliance, the AD number and revision date, and for a recurring AD, the time and date when the next action is required. The owner or operator keeps those records. A first compliance date alone doesn't tell the next pilot whether the airplane is legal today.`,
  task:`I.B`, domain:`Preflight` },

// ===== I.C weather =====
{ fig:`<prop type="doc" title="Figure: METAR">METAR KQRS 080655Z 00000KT 1/4SM FG VV002 08/08 A3011</prop>`,
  q:`Using the figure, what is the ceiling at KQRS?`,
  opts:[`None, because no cloud layer is reported`,
        `1/4 mile, the visibility reported in the fog`,
        `200 feet AGL, from the vertical visibility, VV002`],
  a:2, why:`14 CFR 1.1 counts a sky reported as an obscuration as a ceiling, and the METAR gives its height as vertical visibility. VV002 means fog hides the sky and an observer can see 200 feet up into it, so the ceiling is 200 feet AGL. 1/4SM is how far you can see across the ground, not up, and a hidden sky has a ceiling even with no cloud layer reported.`,
  task:`I.C`, domain:`Preflight` },

{ fig:`<prop type="doc" title="Figure: pilot weather report">UA /OV ABC090015/TM 1840/FL065/TP C182/SK BKN045-TOP058/TA M02/TB LGT/IC LGT RIME</prop>`,
  q:`Using the figure, where are the base and top of the broken layer the pilot reported?`,
  opts:[`Base 4,500 feet AGL, top 5,800 feet AGL`,
        `Base 5,800 feet MSL, top 6,500 feet MSL`,
        `Base 4,500 feet MSL, top 5,800 feet MSL`],
  a:2, why:`AWH 28B, PIREP sky condition: bases and tops in a PIREP are coded in hundreds of feet MSL. BKN045-TOP058 is a broken layer with its base at 4,500 and its top at 5,800 feet MSL. METARs give cloud heights above the ground, which is the trap here, and 6,500 is the pilot's own altitude from the /FL group.`,
  task:`I.C`, domain:`Preflight` },

{ q:`On a clear, calm morning, the air over an airport gets warmer with height for the first 1,500 feet. What weather does this layer usually bring near the ground?`,
  opts:[`Smooth air, with haze, smoke, or fog trapped under it`,
        `Turbulence, showers, and gusts, as warm air rises through it`,
        `Strong gusty surface winds as the layer breaks apart`],
  a:0, why:`PHAK ch 12: a temperature inversion is a shallow layer of smooth, stable air near the ground where temperature rises with height. It acts as a lid, so when the air is humid it traps fog, haze, smoke, and low clouds, and visibility drops. Stable air doesn't rise on its own, so showers are out. You can find wind shear at the top of the layer, but not gusty wind at the surface.`,
  task:`I.C`, domain:`Preflight` },

{ fig:`<prop type="doc" title="Figure: surface observation">Pinecrest, field elevation 1,000 feet MSL: temperature 14°C, dewpoint 6°C.</prop>`,
  q:`Using the figure and the standard lapse rate, about where should you expect the freezing level?`,
  opts:[`About 7,000 feet MSL`,
        `About 5,700 feet MSL`,
        `About 8,000 feet MSL`],
  a:2, why:`The standard lapse rate is about 2°C per 1,000 feet (PHAK ch 4). The air has to cool 14°C to reach 0°C, which takes about 7,000 feet, so the freezing level is near 1,000 + 7,000 = 8,000 feet MSL. 7,000 forgets to add the field elevation, and 5,700 uses 3°C per 1,000 feet, the rate for a rising dry parcel. The dewpoint doesn't enter into it. Real lapse rates vary, so check the forecast freezing level too.`,
  task:`I.C`, domain:`Preflight` },

{ fig:`<prop type="doc" title="Figure: winds and temperatures aloft forecast">FT 3000 6000 9000<br>QRS 2715 2725+08 2935+02</prop>`,
  q:`Using the figure, what are the forecast wind and temperature at 7,500 feet?`,
  opts:[`290° true at 35 knots, plus 2°C`,
        `280° true at 30 knots, plus 5°C`,
        `280° magnetic at 30 knots, plus 5°C`],
  a:1, why:`7,500 feet is halfway between the 6,000 and 9,000 foot groups, so take the halfway values: 270° and 290° give 280°, 25 and 35 knots give 30, and plus 8 and plus 2 give plus 5°C. The forecast gives direction from true north (AWH 28B), so magnetic is wrong, and 290° at 35 is just the 9,000 foot group with no interpolation.`,
  task:`I.C`, domain:`Preflight` },

{ q:`A Convective SIGMET along your route describes a line of thunderstorms and says nothing about icing or turbulence. What should you assume?`,
  opts:[`Severe turbulence, severe icing, and low level wind shear`,
        `Only the hazards printed in it: storms, hail, and heavy rain`,
        `Moderate turbulence, which AIRMET Tango covers for the rest`],
  a:0, why:`AIM 7-1-6: any Convective SIGMET implies severe or greater turbulence, severe icing, and low level wind shear, whether it lists them or not. AIRMET Tango is for moderate turbulence away from storms, not for what a line of thunderstorms brings.`,
  task:`I.C`, domain:`Preflight` },

{ q:`You're planning with the Low Level Significant Weather chart. Which hazard will you need a different product to find?`,
  opts:[`In flight icing`,
        `Moderate or greater turbulence`,
        `Areas of IFR and marginal VFR`],
  a:0, why:`AWH 28B 27.9.1: the Low-Level SIGWX chart shows flying categories (IFR and marginal VFR), moderate or greater turbulence, and freezing levels, up to FL240. In flight icing isn't shown on it. For icing, read AIRMET Zulu, the icing products, and PIREPs.`,
  task:`I.C`, domain:`Preflight` },

// ===== I.D cross-country planning =====
{ fig:`<prop type="doc" title="Figure: flight log">Planned departure 0915 Mountain Standard Time (UTC minus 7). Leg 141 NM at a planned groundspeed of 94 knots.</prop>`,
  q:`Using the figure, what is the ETA in Zulu?`,
  opts:[`1045Z`,
        `1645Z`,
        `1745Z`],
  a:2, why:`141 ÷ 94 = 1.5 hours, or 90 minutes, so you land at 1045 local. Mountain Standard Time is UTC minus 7, so add 7 hours: 1745Z. 1045Z leaves the time in local, and 1645Z adds only 6 hours, which is right for daylight time but not for standard time.`,
  task:`I.D`, domain:`Preflight` },

{ fig:`<prop type="doc" title="Figure: fuel planning">Usable fuel left after start, taxi, and climb: 24 gallons. Cruise burn: 8.0 gallons per hour. Forecast groundspeed: 110 knots. Day VFR.</prop>`,
  q:`Using the figure, how far away can the first point of intended landing be under 14 CFR 91.151?`,
  opts:[`330 NM`,
        `275 NM`,
        `248 NM`],
  a:1, why:`24 ÷ 8.0 = 3.0 hours of fuel. 91.151(a)(1) requires enough to reach the first point of intended landing and then fly 30 more minutes by day, so 2.5 hours can go to the trip: 2.5 × 110 = 275 NM. 330 NM uses every drop and keeps no reserve, and 248 NM holds back the 45 minute reserve that applies only at night.`,
  task:`I.D`, domain:`Preflight` },

{ q:`You land at a towered airport on a VFR flight plan, and the tower clears you to taxi to parking. What happens to your flight plan?`,
  opts:[`The tower closes it once you've cleared the runway`,
        `It stays open, and you close it with Flight Service`,
        `It closes on its own when your ETA passes`],
  a:1, why:`AIM 5-1-14: towers don't close VFR flight plans, because they don't know which VFR airplanes are on one. You close it with Flight Service, or ask an ATC facility to relay it. If you don't close it or report within 30 minutes after your ETA, search and rescue starts, which is the opposite of closing on its own.`,
  task:`I.D`, domain:`Preflight` },

{ q:`Your VFR flight plan shows a proposed departure of 1500Z. A maintenance delay holds you on the ground until 1730Z. According to the AIM, what should you expect?`,
  opts:[`It activated at 1500Z on its own, so cancel it now`,
        `It stays on file until the end of the day`,
        `Flight Service may have dropped it, so file it again`],
  a:2, why:`AIM 5-1-5: VFR flight plan proposals are normally kept for two hours after the proposed departure time. At 1730Z you're two and a half hours past it, so plan on filing again. A flight plan only activates by itself if you filed it with an assumed departure time, and nothing keeps a proposal all day.`,
  task:`I.D`, domain:`Preflight` },

// ===== I.E airspace =====
{ fig:`<prop type="doc" title="Figure: airport listing, described">RIDGEWAY (fictional). Field elevation 1,300 feet. Airspace: Class C, standard dimensions.</prop>`,
  q:`Using the figure, you're 7 NM from Ridgeway, cruising at 2,000 feet MSL. Where are you?`,
  opts:[`Inside the Class C shelf, so you need two way radio contact first`,
        `Under the shelf, so you're outside the Class C`,
        `Inside the Class C surface area, which reaches out to 10 NM`],
  a:1, why:`AIM 3-2-4: a standard Class C has a 5 NM core from the surface to 4,000 feet above the airport and a 10 NM shelf from 1,200 to 4,000 feet above the airport. 1,300 + 1,200 = 2,500 feet MSL, so at 2,000 feet and 7 NM you're under the shelf, outside the Class C. The surface area reaches only 5 NM. Real ones vary, so the sectional's numbers win.`,
  task:`I.E`, domain:`Preflight` },

{ q:`Over the 48 states and outside any Class B or C, you cruise at 11,500 feet MSL over a ridge that rises to 9,300 feet. Under 14 CFR 91.225, do you need ADS-B Out there?`,
  opts:[`No. You're within 2,500 feet of the surface below you`,
        `Yes, it's required everywhere at or above 10,000 feet MSL`,
        `No, it's only required inside Class B and Class C`],
  a:0, why:`91.225(d)(4): ADS-B Out is required in Class E over the 48 states at and above 10,000 feet MSL, excluding the airspace at and below 2,500 feet above the surface. 11,500 minus 9,300 = 2,200 feet above the ridge, so you're in the excluded layer. The rule reaches well beyond Class B and C, since the veil and the airspace above 10,000 count too, but not where the ground is this close.`,
  task:`I.E`, domain:`Preflight` },

{ q:`By day you're VFR in Class G airspace at 8,500 feet MSL, about 3,000 feet above the terrain. Which conditions meet the 14 CFR 91.155 minimums there?`,
  opts:[`Visibility 5 SM, a cloud layer 700 feet above you`,
        `Visibility 3/4 SM, and clear of all clouds`,
        `Visibility 2 SM, the only clouds a layer 1,200 feet above`],
  a:2, why:`91.155(a): in Class G more than 1,200 feet above the surface but below 10,000 feet MSL, the day minimums are 1 statute mile, and 500 feet below, 1,000 feet above, and 2,000 feet horizontal from clouds. 2 miles with the nearest cloud 1,200 feet up meets all of it. A layer 700 feet above breaks the 1,000 foot rule even with 5 miles, and 3/4 mile is under the 1 mile minimum. Clear of clouds is enough only at or below 1,200 feet above the surface.`,
  task:`I.E`, domain:`Preflight` },

{ fig:`<prop type="doc" title="Figure: sectional chart, described">Inside a solid blue line, the numbers 70 over 40, written as a fraction.</prop>`,
  q:`Using the figure, do you need a Class B clearance to fly through this area at 3,500 feet MSL?`,
  opts:[`Yes, because 3,500 feet is inside the Class B there`,
        `No. The floor of the Class B there is 4,000 feet MSL`,
        `Yes, because the Class B floor there is 4,000 feet AGL`],
  a:1, why:`On a sectional, a Class B shelf is drawn in solid blue, and the fraction gives its ceiling over its floor in hundreds of feet MSL. 70 over 40 means 7,000 down to 4,000 feet MSL, so at 3,500 you're under it and need no Class B clearance. You still need Mode C and ADS-B Out inside the 30 NM veil. The numbers are MSL, never AGL.`,
  task:`I.E`, domain:`Preflight` },

{ q:`On a sectional, an area off the coast is marked W followed by a number. What is it?`,
  opts:[`Airspace 3 NM or more offshore that may hold hazardous activity`,
        `Prohibited airspace that no civil aircraft may enter at any time`,
        `A wildlife refuge where pilots are asked to stay above 2,000 feet AGL`],
  a:0, why:`AIM 3-4-4: a warning area extends from 3 NM outward from the U.S. coast and contains activity that may be hazardous to nonparticipating aircraft. It's nonregulatory, so you may fly in it, but find out what's going on first. Prohibited areas are marked P, and the 2,000 foot request is for wildlife refuges and parks, which are charted differently.`,
  task:`I.E`, domain:`Preflight` },

// ===== I.F performance =====
{ fig:`<prop type="doc" title="Figure: landing distance table, read off as text">Flaps 30, paved dry runway, zero wind<br>Pressure altitude 2,000 ft, 15°C: ground roll 560 ft, total over 50 ft obstacle 1,320 ft<br>Pressure altitude 2,000 ft, 25°C: ground roll 580 ft, total over 50 ft obstacle 1,350 ft<br>Notes: decrease distances 10 percent for each 9 knots of headwind. For tailwinds up to 10 knots, increase distances 10 percent for each 2 knots.</prop>`,
  q:`Using the figure, at a pressure altitude of 2,000 feet and 25°C with a 4 knot tailwind, what total distance is needed to land over a 50 foot obstacle?`,
  opts:[`1,485 feet`,
        `1,620 feet`,
        `1,290 feet`],
  a:1, why:`A 4 knot tailwind is two steps of 2 knots, so add 20 percent: 1,350 × 1.2 = 1,620 feet. 1,485 adds only one 10 percent step, and 1,290 treats the tailwind as a headwind. A tailwind costs far more than a headwind gives back, which is the point of the note (PHAK ch 11).`,
  task:`I.F`, domain:`Preflight` },

{ fig:`<prop type="doc" title="Figure: loading graph and CG envelope, read off as text">Moment ÷ 1,000 (pound inches)<br>Empty airplane: 1,420 lb, 55.6<br>Pilot and front passenger: 340 lb, 12.6<br>Rear passenger: 150 lb, 11.0<br>Fuel, 38 gallons: 228 lb, 10.9<br>Baggage: 40 lb, 3.8<br>CG envelope from 2,150 to 2,200 lb: moment ÷ 1,000 must be between 84.0 and 101.5</prop>`,
  q:`Using the figure, what are the total weight and moment ÷ 1,000, and is the airplane within limits?`,
  opts:[`2,138 lb and 90.1, inside the envelope`,
        `2,178 lb and 93.9, inside the envelope`,
        `2,178 lb and 93.9, aft of the aft limit`],
  a:1, why:`Add the weights: 1,420 + 340 + 150 + 228 + 40 = 2,178 lb. Add the moments: 55.6 + 12.6 + 11.0 + 10.9 + 3.8 = 93.9. At that weight the envelope allows 84.0 to 101.5, so 93.9 is inside. 2,138 and 90.1 leave out the baggage. As a number, the CG is 93,900 ÷ 2,178 = 43.1 inches.`,
  task:`I.F`, domain:`Preflight` },

{ fig:`<prop type="doc" title="Figure: loading summary">Maximum takeoff weight: 2,300 lb<br>Takeoff weight with full fuel, three people, and bags: 2,412 lb<br>Avgas weighs 6 lb per gallon</prop>`,
  q:`Using the figure, how much fuel must come out to get down to maximum takeoff weight?`,
  opts:[`At least 18 gallons`,
        `At least 19 gallons`,
        `At least 16 gallons`],
  a:1, why:`2,412 minus 2,300 = 112 pounds over. At 6 pounds a gallon that's 112 ÷ 6 = 18.7 gallons, and you round up, so at least 19 gallons, and then check that what's left still covers the trip and the reserve. 18 gallons leaves the airplane 4 pounds over, and 16 uses 7 pounds a gallon, which isn't avgas.`,
  task:`I.F`, domain:`Preflight` },

{ fig:`<prop type="doc" title="Figure: time, fuel, and distance to climb, read off as text">Standard temperature, counted from sea level<br>4,000 ft: 6 min, 1.4 gal, 9 NM<br>6,000 ft: 10 min, 2.2 gal, 15 NM<br>8,000 ft: 15 min, 3.1 gal, 22 NM<br>Note: add 1.1 gallons for start, taxi, and takeoff</prop>`,
  q:`Using the figure, you depart an airport at a pressure altitude of 4,000 feet and climb to 8,000 feet. How much fuel will it take, including start, taxi, and takeoff?`,
  opts:[`4.2 gallons`,
        `1.7 gallons`,
        `2.8 gallons`],
  a:2, why:`The table counts from sea level, so subtract the departure line from the cruise line: 3.1 minus 1.4 = 1.7 gallons for the climb, then add the 1.1 from the note: 2.8 gallons. 4.2 never subtracts the airport's line. 1.7 leaves out the 1.1 gallons in the note.`,
  task:`I.F`, domain:`Preflight` },

{ q:`In a tailwheel airplane whose propeller turns clockwise as seen from the cockpit, the pilot raises the tail quickly during the takeoff roll. Which way does gyroscopic precession push the nose?`,
  opts:[`To the left`,
        `To the right`,
        `Up, against the elevator`],
  a:0, why:`PHAK ch 5: raising the tail is like pushing forward on the top of the spinning propeller, and precession makes that force act 90 degrees ahead in the direction of rotation, on the right side of the disc. That yaws the nose to the left, so it takes right rudder. Tailwheel pilots feel it most, right as the tail comes up. It turns the pitch change into yaw, not into more pitch.`,
  task:`I.F`, domain:`Preflight` },

// ===== I.G systems =====
{ q:`In a climb through freezing rain, ice closes both the ram air inlet and the drain hole of the pitot head. Nothing else ices. What will the airspeed indicator do as the climb goes on?`,
  opts:[`Read higher the higher you climb`,
        `Drop to zero and stay there`,
        `Freeze at the airspeed it showed when it iced`],
  a:0, why:`PHAK ch 8: with the ram opening and the drain both blocked, the air in the pitot line is trapped, while the static pressure keeps falling as you climb. The difference grows, so the indicator reads higher and higher, like an altimeter. It drops to zero when the ram opening is blocked and the drain stays open. A steady reading happens only in level flight.`,
  task:`I.G`, domain:`Preflight` },

{ q:`Which of these is a common cause of detonation in a piston engine?`,
  opts:[`Carburetor heat used in cruise at a low power setting`,
        `A mixture set richer than best power in cruise`,
        `Using fuel of a lower grade than the manufacturer specifies`],
  a:2, why:`PHAK ch 7: common causes of detonation are a lower fuel grade than specified, very high manifold pressure with low RPM, high power with an excessively lean mixture, and long ground running or steep climbs that heat the cylinders. A rich mixture does the opposite and cools them, and carb heat at low power costs a little power but doesn't cause detonation.`,
  task:`I.G`, domain:`Preflight` },

{ q:`Why should a pilot check the heading indicator against the magnetic compass about every 15 minutes?`,
  opts:[`Friction makes the heading indicator slowly precess`,
        `The compass slowly loses its magnetism in flight`,
        `The heading indicator lags in turns, and it leads on rollout`],
  a:0, why:`PHAK ch 8: a heading indicator without automatic north seeking slowly drifts from precession, mostly caused by friction, so check it about every 15 minutes and reset it to the compass in straight and level flight at a steady speed, when the compass is settled. The compass doesn't lose its magnetism, and lagging in turns is a compass error, not a gyro one.`,
  task:`I.G`, domain:`Preflight` },

{ q:`The attitude indicator and heading indicator depend on which property of a spinning gyro?`,
  opts:[`Precession`,
        `Centrifugal force`,
        `Rigidity in space`],
  a:2, why:`PHAK ch 8: gyro instruments work on two properties. Rigidity in space keeps a spinning rotor fixed in its plane while the airplane moves around it, and that's what the attitude and heading indicators show. Precession, the 90 degree deflection of a pushed rotor, is what the turn coordinator uses. Centrifugal force isn't one of them.`,
  task:`I.G`, domain:`Preflight` },

// ===== I.H human factors =====
{ q:`On a night takeoff over dark terrain, a pilot accelerates hard and suddenly feels the nose pitching up too steeply. What is the illusion, and what does it tempt the pilot to do?`,
  opts:[`Coriolis illusion, tempting a pull into a steeper climb`,
        `Somatogravic illusion, tempting a push into a nose low dive`,
        `The leans, tempting a roll back toward the old bank`],
  a:1, why:`AIM 8-1-5: a rapid acceleration on takeoff can create the illusion of a nose up attitude, and the disoriented pilot pushes into a nose low attitude, or a dive. Over dark ground at night there's nothing outside to correct it, so trust the attitude indicator. Coriolis comes from moving your head in a prolonged turn, and the leans comes from an abrupt return to level after a gradual bank.`,
  task:`I.H`, domain:`Preflight` },

{ q:`A pilot's friends are waiting at the destination for a wedding, and the pilot feels pushed to go even though the weather is marginal. Which PAVE element is this?`,
  opts:[`External pressures`,
        `The pilot, under IMSAFE`,
        `The environment`],
  a:0, why:`PHAK ch 2, PAVE: external pressures are influences from outside the flight that push you to finish it, often at the expense of safety, like someone waiting at the airport or a passenger you don't want to let down. The weather itself is the environment, and IMSAFE is your own fitness to fly. Naming the pressure is how you take its power away.`,
  task:`I.H`, domain:`Preflight` },

{ q:`According to the PHAK, about how much time of useful consciousness does a pilot have at 25,000 feet MSL without supplemental oxygen?`,
  opts:[`30 minutes or more`,
        `About 3 to 5 minutes`,
        `About 9 to 15 seconds`],
  a:1, why:`PHAK ch 17 gives about 30 minutes or more at 20,000 feet, 5 to 10 minutes at 22,000, 3 to 5 minutes at 25,000, and 9 to 15 seconds at 45,000. Time of useful consciousness is how long you can still make and carry out good decisions, not how long until you pass out, and it falls off fast with altitude.`,
  task:`I.H`, domain:`Preflight` },

// ===== II preflight procedures =====
{ q:`Ground control says, "Taxi to runway 28 via Alpha, monitor tower." You reach the runway 28 hold short line. What should you do?`,
  opts:[`Hold short while listening on the tower frequency`,
        `Call the tower and ask for your takeoff clearance`,
        `Taxi onto the runway and wait, since you were told to monitor`],
  a:0, why:`In the Pilot/Controller Glossary, monitor means listen on that frequency and stand by for instructions, and under normal conditions don't call. So you hold short, switch, and wait for the tower to call you. A clearance to taxi to a runway isn't a clearance to enter it (AIM 4-3-18). Only a takeoff or line up and wait clearance puts you on it.`,
  task:`II`, domain:`Preflight` },

// ===== III.A communications, signals, lighting =====
{ q:`Ground control tells you, "Taxi to runway 17 via Bravo, hold short of runway 22." What must your reply include?`,
  opts:[`Your call sign, to show you heard it`,
        `A readback, with your call sign and the hold short`,
        `"Wilco," because taxi instructions aren't a clearance`],
  a:1, why:`AIM 4-3-18: ATC must get a readback of every runway hold short instruction, and pilots should read back the runway assignment, any clearance to enter a runway, and any instruction to hold short of one. "Wilco" or a call sign alone doesn't prove you heard the hold short. You also need an explicit clearance to cross any runway, so 22 stays off limits until you get one.`,
  task:`III.A`, domain:`Airport and flight` },

{ q:`When may a pilot begin using an abbreviated call sign, such as the type and the last three characters, with a controller?`,
  opts:[`Only after the controller has shortened it first`,
        `On the first call, to keep the frequency clear`,
        `Any time the frequency is busy with other airplanes`],
  a:0, why:`AIM 4-2-4: controllers may start using an abbreviated call sign after communication is established, and the pilot may then use it too. Never abbreviate on the first call, or when similar call signs are on the frequency. A busy frequency is the worst time to invite a mix up.`,
  task:`III.A`, domain:`Airport and flight` },

{ q:`At midday, the rotating beacon at a towered airport in a Class D surface area is turning. What does that often mean?`,
  opts:[`The tower is closed and the airspace is now Class G`,
        `A large aircraft has just landed or departed`,
        `Visibility under 3 miles or a ceiling under 1,000 feet`],
  a:2, why:`AIM 2-1-9: in Class B, C, D, and E surface areas, a beacon turning in daylight often means ground visibility is less than 3 miles or the ceiling is less than 1,000 feet, so VFR flight there needs a clearance (91.157 Special VFR). The AIM also says not to rely on the beacon alone, so read the weather. The beacon doesn't announce tower hours, and traffic doesn't switch it on.`,
  task:`III.A`, domain:`Airport and flight` },

// ===== III.B traffic patterns =====
{ q:`You're cleared for takeoff behind a large jet that just departed the same runway. What does the AIM recommend?`,
  opts:[`Lift off before its rotation point, and climb above its path`,
        `Lift off well past its rotation point and stay under its climb path`,
        `Wait 30 seconds, then use a normal takeoff and climb`],
  a:0, why:`AIM 7-4-6: departing behind a larger aircraft, note its rotation point, rotate before it, and keep climbing above its climb path until you can turn clear of the wake. Vortices start at rotation and sink, so under the path is exactly where they go. A short wait doesn't help if you then fly through its wake.`,
  task:`III.B`, domain:`Airport and flight` },

{ fig:`<prop type="doc" title="Figure: Chart Supplement entry, described">CEDAR VALLEY (fictional). Field elevation 4,215. Runway 17-35, 5,200 by 75 feet, asphalt. Runway 35: right traffic. No traffic pattern altitude published. CTAF 122.8.</prop>`,
  q:`Using the figure, you'll land on runway 35. Which pattern direction and altitude should you plan on?`,
  opts:[`Left traffic at 5,215 feet MSL`,
        `Right traffic at 1,000 feet MSL`,
        `Right traffic at 5,215 feet MSL`],
  a:2, why:`The Chart Supplement lists any nonstandard pattern, and right traffic for runway 35 overrides the default left turns of 91.126(b). With no published pattern altitude, the AIM 4-3-3 recommendation for propeller airplanes is 1,000 feet above the ground: 4,215 + 1,000 = 5,215 feet MSL. 1,000 feet MSL would put you underground here.`,
  task:`III.B`, domain:`Airport and flight` },

// ===== IV takeoffs and landings =====
{ q:`At the start of a takeoff roll with a direct crosswind from the right, how should the pilot hold the ailerons, and how should that change?`,
  opts:[`Full left aileron at first, then more as the airplane speeds up`,
        `Neutral at first, then right aileron once the airplane is airborne`,
        `Full right aileron at first, then less as the airplane picks up speed`],
  a:2, why:`AFH ch 6: with a crosswind, start the takeoff roll with full aileron into the wind, here right, and hold it until the ailerons start to work. As speed builds, ease it off so you hold just enough to keep the upwind wing from rising. Aileron away from the wind lifts the upwind wing, and waiting until you're airborne lets the wind get under that wing on the ground.`,
  task:`IV`, domain:`Airport and flight` },

{ fig:`<prop type="doc" title="Figure: ATIS and POH">ATIS: wind 230 at 12, gusting 22.<br>POH normal approach speed: 65 knots.</prop>`,
  q:`Using the figure and the AFH guidance on gusty air, what approach speed should you fly?`,
  opts:[`About 75 knots`,
        `About 70 knots`,
        `About 76 knots`],
  a:1, why:`AFH ch 9: pilots often add one half of the gust factor to the normal approach speed. The gust factor is the gust minus the steady wind, 22 minus 12 = 10 knots, so add 5: 65 + 5 = 70 knots. 75 adds all 10 knots. 76 adds half of 22, the gust, when it should be half of 10.`,
  task:`IV`, domain:`Airport and flight` },

// ===== V performance maneuvers =====
{ q:`During a 45 degree steep turn, the airplane keeps trying to roll steeper on its own. What causes it, and what should the pilot do?`,
  opts:[`The inside wing is faster and makes more lift, so add inside rudder`,
        `Adverse yaw from the ailerons, which takes more back pressure on the yoke`,
        `The outside wing is faster, and makes more lift, so hold opposite aileron`],
  a:2, why:`AFH ch 3: in a steep turn the outside wing flies a bigger circle, so it's faster and makes more lift, and the bank wants to keep increasing. That's the overbanking tendency, and you hold it with some opposite aileron once you reach the bank you want. The inside wing is the slower one, and adverse yaw shows up as you roll in, not as a steepening bank.`,
  task:`V`, domain:`Airport and flight` },

// ===== VII slow flight and stalls =====
{ q:`Overshooting the turn to final, a pilot keeps the bank shallow and pushes inside rudder to bring the nose around, then pulls back to stop the nose from dropping. What is the danger?`,
  opts:[`A slipping turn that lowers the nose and builds a lot of airspeed`,
        `A secondary stall from recovering too fast out of the turn`,
        `A cross control stall, which can roll it into a spin near the ground`],
  a:2, why:`AFH ch 5: this is the setup for a skidding cross control stall. Inside rudder steepens the bank and drops the nose, the pilot pulls, and if the wing stalls the airplane can roll fast toward the inside and spin, with no height left to recover. The safe answer to an overshoot is a go-around. A slip is the opposite control mix, and a secondary stall follows a botched stall recovery.`,
  task:`VII`, domain:`Airport and flight` },

// ===== VIII basic instrument maneuvers =====
{ q:`Under the hood, the attitude indicator slowly tilts, the heading indicator wanders, and the suction gauge reads low. Which instruments should you fly by now?`,
  opts:[`The turn coordinator, airspeed indicator, and altimeter`,
        `The attitude and heading indicators, but cross check them more often`,
        `Only the magnetic compass and the vertical speed indicator`],
  a:0, why:`PHAK ch 8: in most trainers the vacuum pump drives the attitude indicator and heading indicator, so a low suction reading means both are failing and should be covered or ignored. The electric turn coordinator and the pitot static instruments still work, and the compass gives heading. The VSI works too, but it isn't enough by itself.`,
  task:`VIII`, domain:`Airport and flight` },

{ q:`Under the hood, a pilot keeps the scan moving but believes the vertical speed indicator over everything else because it's the easiest gauge to read, even when it lags. Which scan error is this?`,
  opts:[`Omission`,
        `Fixation`,
        `Emphasis`],
  a:2, why:`Instrument Flying Handbook, cross check errors: emphasis is relying on the instrument you understand best, even when it gives wrong or incomplete information, instead of the combination you need. Fixation is staring at one gauge while the others drift, and omission is leaving one out of the scan. This pilot is still scanning, just not believing the scan.`,
  task:`VIII`, domain:`Airport and flight` },

// ===== XII postflight =====
{ q:`At the end of every flight, what does the AIM suggest a pilot do before shutting down the engine?`,
  opts:[`Squawk 7700 briefly to test the transponder link`,
        `Switch the ELT on to check that it still transmits`,
        `Listen on 121.5 MHz for an ELT that went off by mistake`],
  a:2, why:`AIM 6-2-4: hard landings, ground handling, and maintenance set off ELTs by accident, and the AIM suggests monitoring 121.5 MHz before engine shutdown at the end of each flight. Hear it? Switch yours off and listen again. Squawking 7700 declares an emergency, and switching the ELT on sends a false distress signal.`,
  task:`XII`, domain:`Airport and flight` },

// ===== VI navigation =====
{ fig:`<prop type="doc" title="Figure: flight log, described">Leg 60 NM. At the 20 NM checkpoint the airplane is 2 NM left of the course line. 40 NM to go.</prop>`,
  q:`Using the figure, about how many degrees right should you turn to fly straight to the destination?`,
  opts:[`About 6 degrees`,
        `About 3 degrees`,
        `About 9 degrees`],
  a:2, why:`60 to 1: 2 NM off in 20 NM is 2 ÷ 20 × 60 = 6 degrees of error, which is what the wind has been doing to you. Turning 6 degrees only stops the drift. Closing the 2 NM in the 40 NM left takes another 2 ÷ 40 × 60 = 3 degrees, so turn about 9 degrees right. 3 degrees alone closes the gap but leaves the drift.`,
  task:`VI`, domain:`Navigation and emergencies` },

{ fig:`<prop type="doc" title="Figure: VOR indicator, described">The needle sits two dots off center. Each dot on this indicator is 2 degrees. The station is 45 NM away.</prop>`,
  q:`Using the figure, about how far are you from the radial you've selected?`,
  opts:[`About 4 NM`,
        `About 3 NM`,
        `About 5 NM`],
  a:1, why:`Two dots at 2 degrees each is 4 degrees off. By the 60 to 1 rule, a degree is about 1 NM wide at 60 NM from the station, so at 45 NM it's 45 ÷ 60 = 0.75 NM a degree, and 4 degrees is about 3 NM. 4 NM is true only at 60 NM out, and 5 NM divides the wrong way. Radials spread apart as you move away from the station.`,
  task:`VI`, domain:`Navigation and emergencies` },

{ fig:`<prop type="doc" title="Figure: plotter on a sectional chart, described">Sectional scale 1:500,000. The course line from departure to destination measures 9 inches.</prop>`,
  q:`Using the figure, about how long is the leg?`,
  opts:[`About 72 NM`,
        `About 62 NM`,
        `About 45 NM`],
  a:1, why:`On a sectional, one inch is about 6.86 NM, or about 8 statute miles. 9 × 6.86 = 62 NM. 72 puts the statute mile figure on a nautical mile answer, and 45 uses 5 per inch, which isn't the sectional scale. The NM side of the plotter does this for you.`,
  task:`VI`, domain:`Navigation and emergencies` },

{ q:`En route, weather ahead forces a diversion to an alternate airport. According to the PHAK, what should you do first?`,
  opts:[`Turn toward it promptly, then refine heading, time, and fuel`,
        `Hold the heading you have while you plot the new course on the chart`,
        `Circle a landmark until you've worked out the new groundspeed`],
  a:0, why:`PHAK ch 16, diversion: estimate the course to the alternate, turn promptly, and then work out the heading, groundspeed, arrival time, and fuel while you fly the airplane. Holding a heading toward the weather while you plot buys you nothing, and circling burns fuel and time you may need.`,
  task:`VI`, domain:`Navigation and emergencies` },

{ q:`Your VFR panel GPS database expired last month. According to the AIM, how should you treat it?`,
  opts:[`As unusable for any flight until it's updated`,
        `As usable, but not for moving map work near critical airspace`,
        `As fully usable, because VFR databases never go out of date`],
  a:1, why:`AIM 1-1-17: there's no requirement to update a database for VFR navigation, though it should be kept current, and the AIM doesn't recommend using a moving map with an outdated database in and around critical airspace. Check waypoints against current charts or the Chart Supplement. An old database isn't banned, but it is out of date, because airspace and frequencies change.`,
  task:`VI`, domain:`Navigation and emergencies` },

// ===== IX emergency operations =====
{ q:`A fire breaks out in the cabin in flight. According to the AFH, when should you open the cabin air vents to clear the smoke?`,
  opts:[`After the extinguisher, and never before it`,
        `First, before using the extinguisher`,
        `Never, until the airplane is on the ground`],
  a:0, why:`AFH ch 18: smoke can be cleared by opening the cabin air vents, but only after the fire extinguisher, if you have one, has been used. Opening them first feeds the fire. If the smoke gets worse when the vents open, close them right away, because the fire may be in the heater system or the airflow is feeding it.`,
  task:`IX`, domain:`Navigation and emergencies` },

{ q:`A passenger becomes ill in flight, and you want priority for a quick landing. The airplane itself is fine. Which call fits?`,
  opts:[`"Mayday," said three times`,
        `Squawk 7600 and call the tower`,
        `"Pan-pan," said three times`],
  a:2, why:`Pilot/Controller Glossary: urgency is being concerned about safety and needing timely but not immediate help, and distress is serious or imminent danger needing immediate help. A sick passenger in a sound airplane is urgency, so under AIM 6-3-1 the call starts with PAN-PAN, preferably said three times. MAYDAY is for distress, and 7600 means a radio failure.`,
  task:`IX`, domain:`Navigation and emergencies` },

{ q:`In cruise, the ammeter shows a steady discharge and the low voltage light comes on. The alternator has failed. What should you do?`,
  opts:[`Shed electrical load and land at the nearest suitable airport`,
        `Continue as planned, since the engine will keep running on magnetos`,
        `Cycle each magneto off in turn, and listen for the bad one`],
  a:0, why:`AFH ch 18: after an alternator failure the battery carries everything, and it won't last long, so cut the electrical load right away and land at the nearest suitable airport. The engine does keep running on the magnetos, but that won't help once the radios and lights go. The magnetos have nothing to do with the alternator.`,
  task:`IX`, domain:`Navigation and emergencies` },

// ===== XI night operations =====
{ q:`At night you see an airport beacon showing two quick white flashes between each green flash. What kind of airport is it?`,
  opts:[`A lighted civilian land airport`,
        `A military airport`,
        `A lighted seaplane base`],
  a:1, why:`AIM 2-1-9: a civilian land airport's beacon alternates white and green, and a military airport's beacon is told apart by two quick white flashes between the green flashes. A water airport uses white and yellow.`,
  task:`XI`, domain:`Navigation and emergencies` },

{ q:`At night, a pilot stares at a single light on dark ground for several seconds, and it seems to start moving. What is this, and what's the cure?`,
  opts:[`Night myopia, and the cure is to focus on a distant light`,
        `Autokinesis, and the cure is to keep your eyes moving all around`,
        `A false horizon, and the cure is to level the wings on the light`],
  a:1, why:`AIM 8-1-5: in the dark, a still light stared at for many seconds appears to move, and a pilot trying to line up with it can lose control. That's autokinesis. Keep your eyes moving and cross check the instruments. A false horizon comes from sloping clouds or ground lights that look like stars, and leveling the wings on a light is how it catches you.`,
  task:`XI`, domain:`Navigation and emergencies` },

{ fig:`<prop type="doc" title="Figure: sun and twilight times at the airport today">Sunset 1712. End of evening civil twilight 1740.</prop>`,
  q:`Using the figure, what is the earliest time a landing tonight counts toward 61.57(b) night passenger currency?`,
  opts:[`1740, the end of civil twilight`,
        `1812, one hour after sunset`,
        `1712, at sunset`],
  a:1, why:`61.57(b) counts takeoffs and landings to a full stop made from 1 hour after sunset to 1 hour before sunrise: 1712 + 1 hour = 1812. The end of civil twilight, 1740, is when night starts under 14 CFR 1.1, which is the night you log and the night 61.109 training uses. Sunset is when the position lights have to be on (91.209).`,
  task:`XI`, domain:`Navigation and emergencies` }

]});
})();
