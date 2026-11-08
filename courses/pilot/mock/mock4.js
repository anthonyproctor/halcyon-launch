// Private Pilot course "Danny's Logbook": practice exam 4 (60 questions, three options, 120 minutes, 70 to pass, like forms 1 to 3).
// Built 2026-11-08 for the figure and practice depth pass, revised the same day after the exam check. 37 items show a real page from the
// FAA's Airman Knowledge Testing Supplement, FAA-CT-8080-2H, through the engine's image figure (fig: a <prop type="img"> copied unchanged
// from courses/pilot/figs/manifest.json).
// Figures used: 6 heading indicator, 8 density altitude, 12 METAR, 15 TAF, 17 winds aloft, 18 weather depiction, 19 low level SIGWX prog,
// 20, 22 and 25 sectional excerpts, 28 VOR, 34 loading graph and CG envelope, 36 wind component, 37 landing graph, 38 landing table,
// 40 takeoff graph and its speed table, 48 airport diagram, 49 closed runways and segmented circle, 58 compass card, 64 airport markings,
// 65 airport signs. Figures 6, 18, 19, 28 and 58 (and 4, used in form 1) were added to courses/pilot/figs on 2026-11-08.
// Figure 18, the weather depiction chart, is a legacy product with no section in the Aviation Weather Handbook (FAA-H-8083-28B),
// but the testing supplement still carries it, so form 4 asks it from its own legend. Figure 19 was recropped (round 2) to show the full
// title boxes and the Pacific coast labels, as on supplement page 2-18.
// Every figure item is answered from the figure: the stem points at a place on it and never gives the value. Each figure item has a
// "reads" comment with what was read off the image on 2026-11-08 (300 dpi crops viewed at 2x to 3x; chart lines located by pixel against
// the printed scales and drawn back over the chart as an overlay to check). Form 4 asks different cells than form 3 and the chapter quizzes
// (no repeat of KJFK RVR, KMEM 2200Z, MKC 6000, STL 34000, FFA lights, CPK, PHF, area 3 MEF, 4251, COE Class E, SZT, area 7, the 2549
// tower, 520/1,255 at 7,500 ft with headwind, grass at 2,500 ft, the 8 kt headwind cell, 120 lb baggage, 48 gallons, 1,900 lb/79.0, VASI, sign B or G, marking E, runway 12,
// runway 18 on fig 49, fig 9 taxi winds, fig 50).
// Readings worth knowing for a later form: fig 8 lines fit y = b minus 0.655x (SL b=1602, 4,000 b=1248, 5,000 b=1158, 6,000 b=1066,
// 7,000 b=973.5) on the 1400 px image with 0 ft at y=1217 and 74.4 px per 1,000 ft, 0°F at x=155 and 7.245 px per °F. Fig 34 envelope:
// forward limit about 62.8 at 1,800 lb, about 81 at 2,178 lb; aft limit about 103 at 2,178 lb. Fig 40 at 30°C, 2,000 ft, 2,600 lb, calm:
// ground roll about 940, over 50 ft about 1,450 to 1,500. Fig 37 at 10°C, 4,000 ft: about 1,260 at the reference line, 1,110 at
// 2,600 lb, 960 with 10 kt of headwind. Fig 37's obstacle guide lines agree with its worked example (exam check trace: a 1,080 to 1,100
// ft ground roll carries to about 1,650 to 1,700 ft at 50 ft), so its obstacle section is a valid cell. Fig 4 airspeed indicator by tick
// angle: white arc 55 to 100, green from about 60 to 165, yellow 165 to the red line at about 208.
// Spread like forms 1 to 3 (the FAA publishes no area weights): Preflight 36, Airport and flight 12, Navigation and emergencies 12.
// The 23 non figure items cover II to XII breadth and the compass turning rule, and every one is taught in a chapter lesson. 16 items
// work a number from a chart or by hand.
// Original items, not FAA test bank or FAA sample questions. None closely repeats form 1, 2 or 3 or a chapter quiz (checked by concept
// against all 238 quiz items and 180 mock items, 2026-11-08). The engine reads parts by part.slice(0,3) for question ids and by the "M4:"
// prefix for the form, so this part starts "M4:".
// Sources, read 2026-11-08: eCFR title 14 (61.35, 61.47(b), 91.126(b), 91.157, 91.207(d), Part 91 App. D); AIM html 2-1-3 (REIL),
// 2-1-10 (taxiway edge lights blue), 2-3-5, 2-3-6, 2-3-10, 2-3-13 (markings and signs), 4-3-3 (pattern), 4-3-4 (segmented circle),
// 7-4 (wake); PHAK FAA-H-8083-25C ch 2 (DECIDE), 7 (ammeter, four strokes), 8 (heading indicator 15° an hour, compass turning errors and
// deviation), 16 (VOR), 17 (fatigue); Aviation Weather Handbook FAA-H-8083-28B ch 27.9.1 (low level SIGWX: red IFR, scalloped MVFR,
// top/base with base omitted = surface); AFH FAA-H-8083-3C ch 2 (shutdown), 9 (ballooning), 10 (steep turns), 11 (red light), 18
// (emergency landings, energy); Instrument Flying Handbook (nose high recovery); FAA-S-ACS-6C (1,500 ft AGL floor); Aeronautical Chart
// User's Guide (data blocks, obstructions, UC, NAVAID boxes, Class D ceilings, NO SVFR).
// Course math conventions (BIBLE.md): pressure altitude from the chart's conversion table; ISA 15°C minus 2°C per 1,000 ft.
(function(){
const D=window.HALCYON_DATA=window.HALCYON_DATA||{};
const C=D.pilot=D.pilot||{};
C.mock=C.mock||[];

C.mock.push({ part:`M4: Practice exam 4`, questions:[
// ===== Area I.A pilot qualifications =====
{ q:`What does an applicant need to take the private pilot knowledge test?`,
  opts:[`A current medical certificate and a solo endorsement`,
        `A logbook showing at least 40 hours of flight time`,
        `An instructor's endorsement and a photo ID`],
  a:2, why:`61.35(a): an endorsement from an authorized instructor saying the ground training or home study course is done, and proper identification with a photo, signature, date of birth and address. No medical is needed to sit the test, no solo endorsement, and no flight hours. The 40 hours belong to the practical test.`,
  task:`I.A`, domain:`Preflight` },
{ q:`Unless they've agreed otherwise beforehand, who is pilot in command during a private pilot practical test?`,
  opts:[`The examiner, who's evaluating the flight`,
        `The applicant, who's being evaluated`,
        `Whoever holds the higher pilot certificate`],
  a:1, why:`61.47(b): the examiner isn't the pilot in command unless they agree to act as PIC, by prior arrangement, for the flight or part of it. So by default the applicant is PIC, and the applicant's decisions are part of the test. Certificate level doesn't decide it.`,
  task:`I.A`, domain:`Preflight` },

// ===== I.B airworthiness =====
{ q:`An airplane's ELT was inspected on May 14, 2026. Under 14 CFR 91.207, through what date may it fly before the next inspection is due?`,
  opts:[`May 14, 2027`,
        `May 31, 2027`,
        `May 31, 2028`],
  a:1, why:`91.207(d): the ELT has to be inspected within 12 calendar months of the last inspection. Calendar months run to the end of the month, so a May 14, 2026 inspection is good through May 31, 2027. May 14 forgets the end of the month, and May 31, 2028 is the 24 month cycle that belongs to the transponder.`,
  task:`I.B`, domain:`Preflight` },

// ===== I.C weather, FAA figures 12, 15, 17, 18 and 19 =====
// M4:3 reads (checked against the image 2026-11-08): KMDW: SPECI 121856Z 32005KT 1 1/2SM RA OVC007 17/16 A2980 RMK RAB35
{ fig:`<prop type="img" src="courses/pilot/figs/fig-metar.webp" title="Figure 12. Aviation Routine Weather Reports" alt="FAA figure 12, five METAR and SPECI reports for KINK, KBOI, KLAX, KMDW and KJFK" w="1600" h="358"></prop>`,
  q:`Using the figure, what does the remark at the end of the KMDW report mean?`,
  opts:[`Rain is falling on runway 35 at the field`,
        `Rain should end within the next 35 minutes`,
        `Rain began at 35 minutes past the hour`],
  a:2, why:`In METAR remarks, a weather code followed by B and a time means it began then. RAB35 is rain beginning at 35 minutes past the hour, so at 1835Z, 21 minutes before this 1856Z SPECI. An E would mean it ended. Runway numbers show up in RVR groups, never in a rain remark.`,
  task:`I.C`, domain:`Preflight` },
// M4:4 reads (checked against the image 2026-11-08): KMEM 121720Z 1218/1324
{ fig:`<prop type="img" src="courses/pilot/figs/fig-taf.webp" title="Figure 15. Terminal Aerodrome Forecasts" alt="FAA figure 15, terminal aerodrome forecasts for KMEM and KOKC with FM, TEMPO, PROB40 and BECMG groups" w="1600" h="582"></prop>`,
  q:`Using the figure, for what period is the KMEM forecast valid?`,
  opts:[`From 1800Z on the 12th to 2400Z on the 13th`,
        `From 1720Z on the 12th to 1720Z on the 13th`,
        `From 1200Z on the 18th to 1300Z on the 24th`],
  a:0, why:`After the issue time comes the valid period, day and hour on each side of the slash. 1218/1324 is the 12th at 1800Z to the 13th at 2400Z, a 30 hour TAF. 121720Z is when it was issued, not when it starts. Reading 1218 as hour 12 of the 18th mixes up the order: day first, then hour.`,
  task:`I.C`, domain:`Preflight` },
// M4:5 reads (checked against the image 2026-11-08): KOKC 051130Z 0512/0618 14008KT 5SM BR BKN030 TEMPO 0513/0516 1 1/2SM BR FM051600 18010KT P6SM SKC; PROB40 0600/0606 2SM TSRA OVC008CB
{ fig:`<prop type="img" src="courses/pilot/figs/fig-taf.webp" title="Figure 15. Terminal Aerodrome Forecasts" alt="FAA figure 15, terminal aerodrome forecasts for KMEM and KOKC with FM, TEMPO, PROB40 and BECMG groups" w="1600" h="582"></prop>`,
  q:`Using the figure, what does the KOKC forecast call for at times between 1300Z and 1600Z on the 5th?`,
  opts:[`Visibility down to 1 1/2 SM in mist`,
        `Thunderstorms with an 800 foot overcast`,
        `Clear skies, visibility over 6 SM`],
  a:0, why:`TEMPO 0513/0516 1 1/2SM BR means that from 1300Z to 1600Z on the 5th, visibility will drop to 1 1/2 SM in mist at times, for less than an hour at a time. The thunderstorms with OVC008CB are the PROB40 group the next morning, 0600Z to 0606Z on the 6th. Clear skies start with FM051600.`,
  task:`I.C`, domain:`Preflight` },
// M4:6 reads (checked against the image 2026-11-08): HLC 9000: 2113-03
{ fig:`<prop type="img" src="courses/pilot/figs/fig-winds-aloft.webp" title="Figure 17. Winds and Temperatures Aloft Forecast" alt="FAA figure 17, winds and temperatures aloft forecast table for ALS, AMA, DEN, HLC, MKC and STL at 3,000 to 39,000 feet" w="1600" h="412"></prop>`,
  q:`Using the figure, what's the forecast at 9,000 feet over HLC, and how does its temperature compare with standard?`,
  opts:[`130° true at 21 knots, minus 3°C, right at standard`,
        `210° true at 13 knots, minus 3°C, 6°C colder than standard`,
        `210° true at 13 knots, minus 3°C, right at standard`],
  a:2, why:`HLC at 9000 reads 2113-03: 210° true, 13 knots, minus 3°C. Standard temperature at 9,000 feet is 15 minus 2 for each 1,000 feet, 15 minus 18, which is minus 3°C, so the forecast is right at standard. Swapping the pairs gives 130° at 21, which is the trap.`,
  task:`I.C`, domain:`Preflight` },
// M4:7 reads (checked against the image 2026-11-08): FB WBC 151745 / DATA BASED ON 151200Z / VALID 1600Z FOR USE 1800-0300Z. TEMPS NEG ABV 24000
{ fig:`<prop type="img" src="courses/pilot/figs/fig-winds-aloft.webp" title="Figure 17. Winds and Temperatures Aloft Forecast" alt="FAA figure 17, winds and temperatures aloft forecast table for ALS, AMA, DEN, HLC, MKC and STL at 3,000 to 39,000 feet" w="1600" h="412"></prop>`,
  q:`Using the figure, during what period is this winds aloft forecast meant to be used?`,
  opts:[`From 1200Z to 1600Z`,
        `From 1745Z to 0300Z`,
        `From 1800Z to 0300Z`],
  a:2, why:`The header says it all: data based on 151200Z, valid 1600Z, for use 1800 to 0300Z. 1745Z is when it was issued (FB WBC 151745), and 1200Z is when the data was taken. Use the forecast only inside its for use window.`,
  task:`I.C`, domain:`Preflight` },
// M4:8 reads (checked against the image 2026-11-08): turned upright; E sits inside the hatched (shaded) area over Tennessee and Kentucky; legend: shaded = IFR, CIG < 1000 ft and/or VSBY < 3 mi; contoured without shading = MVFR; no contours = VFR
{ fig:`<prop type="img" src="courses/pilot/figs/fig-weather-depiction.webp" title="Figure 18. Weather Depiction Chart" alt="FAA figure 18, weather depiction chart of the United States at 16Z: station circles, shaded and contoured areas, fronts, a legend and red letters A to H" w="1600" h="1075"></prop>`,
  q:`Using the figure, what conditions were reported at area E?`,
  opts:[`Marginal VFR, with ceilings from 1,000 up to 3,000 feet`,
        `VFR, with ceilings above 3,000 feet and over 5 miles`,
        `IFR, ceilings under 1,000 feet or visibility under 3 miles`],
  a:2, why:`Area E sits inside a shaded, hatched area. The chart's own legend reads: shaded areas, IFR, ceiling less than 1,000 feet and/or visibility less than 3 miles. A contour with no shading is marginal VFR, and no contour at all is VFR. The station numbers right around E run from about 500 to 1,600 feet, but the shading is what answers it.`,
  task:`I.C`, domain:`Preflight` },
// M4:9 reads (checked against the image 2026-11-08): title block: WEATHER DEPICTION 16Z SAT 14 APR 20XX; stations shown 1262 OUT OF 1462
{ fig:`<prop type="img" src="courses/pilot/figs/fig-weather-depiction.webp" title="Figure 18. Weather Depiction Chart" alt="FAA figure 18, weather depiction chart of the United States at 16Z: station circles, shaded and contoured areas, fronts, a legend and red letters A to H" w="1600" h="1075"></prop>`,
  q:`Using the figure, what kind of information does this chart give, and for when?`,
  opts:[`Forecast conditions 12 hours after 1600Z`,
        `Observed conditions at 1600Z on Saturday`,
        `Forecast conditions valid from 1600Z to 0400Z`],
  a:1, why:`The title block says weather depiction, 16Z Saturday the 14th. It's a picture of what stations reported at that hour, drawn from surface observations, not a forecast. Treat it like a map of old METARs: good for the big picture, and already getting stale. The prog charts are the forecasts. It's a legacy chart that isn't in the current Aviation Weather Handbook, but the knowledge test supplement still shows it.`,
  task:`I.C`, domain:`Preflight` },
// M4:10 reads (checked against the image 2026-11-08): upper (12 hr, VT 18Z Sat Apr 14 2012): solid red line around most of NC, all of SC and the northern edge of GA; light blue scalloped line around it from VA to the Gulf coast; legend red = ceiling below 1,000 and/or visibility below 3 miles
{ fig:`<prop type="img" src="courses/pilot/figs/fig-sigwx-prog.webp" title="Figure 19. Low-Level Significant Weather (SIGWX) Prognostic Charts" alt="FAA figure 19, two low level significant weather prog charts, 12 hour above and 24 hour below, with IFR, marginal VFR, turbulence and freezing level lines and a legend" w="1400" h="1722"></prop>`,
  q:`Using the figure, what does the 12 hour chart forecast for South Carolina?`,
  opts:[`IFR, a ceiling under 1,000 feet or visibility under 3 miles`,
        `Marginal VFR, with a ceiling from 1,000 to 3,000 feet`,
        `Moderate or greater turbulence from the surface up`],
  a:0, why:`On the upper chart, valid 18Z Saturday, a solid red line wraps the Carolinas, and the legend says red means a ceiling under 1,000 feet and/or visibility under 3 miles: IFR. The scalloped blue line around it is the bigger marginal VFR area, and turbulence areas are dashed yellow. AWH ch 27: VFR areas aren't drawn at all.`,
  task:`I.C`, domain:`Preflight` },
// M4:11 reads (checked against the image 2026-11-08): upper chart: '180 /' with the moderate turbulence symbol over Utah, inside dashed yellow lines; legend: top/base in hundreds of feet MSL; AWH 27.9.1.2.2: base omitted = to the surface
{ fig:`<prop type="img" src="courses/pilot/figs/fig-sigwx-prog.webp" title="Figure 19. Low-Level Significant Weather (SIGWX) Prognostic Charts" alt="FAA figure 19, two low level significant weather prog charts, 12 hour above and 24 hour below, with IFR, marginal VFR, turbulence and freezing level lines and a legend" w="1400" h="1722"></prop>`,
  q:`Using the figure, what turbulence does the 12 hour chart forecast over Utah?`,
  opts:[`Moderate, from 18,000 feet MSL up to FL240`,
        `Moderate, from the surface to 18,000 feet MSL`,
        `Severe, from the surface to 18,000 feet MSL`],
  a:1, why:`Over Utah the upper chart shows the moderate turbulence symbol, a single peak, with 180 over a slash and nothing after it. The number before the slash is the top in hundreds of feet MSL. AWH ch 27: when the base is left off, the turbulence reaches the surface. So moderate, surface to 18,000. Severe uses a double peak.`,
  task:`I.C`, domain:`Preflight` },

// ===== I.D cross-country planning, FAA figures 20 and 22 =====
// M4:12 reads (checked against the image 2026-11-08): box SE of ECG near Camden Point: CAUTION: UNMARKED BALLOON ON CABLE TO 3008' MSL. CHECK NOTAMS.
{ fig:`<prop type="img" src="courses/pilot/figs/fig-sectional-20.webp" title="Figure 20. Sectional Chart Excerpt" alt="FAA figure 20, sectional chart excerpt of a coastal area with airports, airspace boundaries and numbered red markers at the points the questions ask about" w="1600" h="2128"></prop>`,
  q:`Using the figure, you'll fly low along the Pasquotank River just southeast of Elizabeth City (ECG), near area 3. What does the chart warn you about there?`,
  opts:[`Parachute jumping from up to 3,000 feet AGL`,
        `An unmarked balloon on a cable to 3,008 feet MSL`,
        `A tower 3,008 feet tall by the blimp hangars`],
  a:1, why:`The boxed note south of ECG reads: caution, unmarked balloon on cable to 3,008 feet MSL, check NOTAMs. A tethered balloon is an obstruction you may not see, and the cable is worse. The blimp hangars and the parachute symbols elsewhere on the chart are the distractions. Check NOTAMs before a low leg there.`,
  task:`I.D`, domain:`Preflight` },
// M4:13 reads (checked against the image 2026-11-08): COE box: 122.05 above, VOR-DME COEUR D'ALENE 108.8 (underlined) Ch 25 COE, BOISE below
{ fig:`<prop type="img" src="courses/pilot/figs/fig-sectional-22.webp" title="Figure 22. Sectional Chart Excerpt" alt="FAA figure 22, sectional chart excerpt of hilly terrain around a large lake with small airports, a contour interval legend and numbered red markers at the points the questions ask about" w="1600" h="2128"></prop>`,
  q:`Using the figure, on what frequency can you talk to Flight Service near the Coeur d'Alene VOR-DME?`,
  opts:[`122.05`,
        `108.8`,
        `135.075`],
  a:0, why:`A frequency printed above a NAVAID box is a Flight Service frequency, and the name under the box, Boise, is the station you'd be calling. 108.8 is the VOR-DME's own frequency, and it's underlined, which means no voice on it. 135.075 is the AWOS at Coeur d'Alene airport.`,
  task:`I.D`, domain:`Preflight` },
// M4:14 reads (checked against the image 2026-11-08): W of area 1: obstruction 2630 (215) UC
{ fig:`<prop type="img" src="courses/pilot/figs/fig-sectional-22.webp" title="Figure 22. Sectional Chart Excerpt" alt="FAA figure 22, sectional chart excerpt of hilly terrain around a large lake with small airports, a contour interval legend and numbered red markers at the points the questions ask about" w="1600" h="2128"></prop>`,
  q:`Using the figure, you'll cross the obstruction just west of area 1 at 3,000 feet MSL. About how far above its top will you be?`,
  opts:[`About 370 feet`,
        `About 2,785 feet`,
        `About 155 feet`],
  a:0, why:`The obstruction is labeled 2630 over (215) UC. The top number is the top of the structure in feet MSL, the number in parentheses is its height above the ground, and UC means under construction or reported, position and elevation not yet verified. 3,000 minus 2,630 is 370 feet. 2,785 subtracts the AGL height, and 155 adds the two numbers together.`,
  task:`I.D`, domain:`Preflight` },
{ q:`A 171 NM leg at a groundspeed of 114 knots burns 8.4 gallons per hour. How much fuel will the leg itself use?`,
  opts:[`About 16.8 gallons`,
        `About 12.6 gallons`,
        `About 9.0 gallons`],
  a:1, why:`Time = 171 ÷ 114 = 1.5 hours. Fuel = 1.5 × 8.4 = 12.6 gallons. 16.8 adds the 30 minute day reserve, which you plan on top but don't burn on the leg. 9.0 multiplies the time by 6, the pounds in a gallon, instead of the burn rate.`,
  task:`I.D`, domain:`Preflight` },

// ===== I.E airspace, FAA figure 25 =====
// M4:16 reads (checked against the image 2026-11-08): Denton (DTO): dashed Class D circle, ceiling box [25]; area 1 under Class B 100/40
{ fig:`<prop type="img" src="courses/pilot/figs/fig-sectional-25.webp" title="Figure 25. Sectional Chart Excerpt" alt="FAA figure 25, sectional chart excerpt of a busy Class B area over a large city, with several towered airports and numbered red markers at the points the questions ask about" w="1600" h="2128"></prop>`,
  q:`Using the figure, up to what altitude does Denton's Class D airspace reach, near area 1?`,
  opts:[`Up to and including 2,500 feet AGL`,
        `Up to and including 2,500 feet MSL`,
        `Up to but not including 2,500 feet MSL`],
  a:1, why:`The number in the dashed box beside Denton is 25, so the Class D runs from the surface up to and including 2,500 feet MSL. Charted Class D ceilings are MSL, in hundreds of feet. A minus sign in front, like -25, would mean up to but not including that altitude, usually because Class B starts there.`,
  task:`I.E`, domain:`Preflight` },
// M4:17 reads (checked against the image 2026-11-08): above DALLAS/FT WORTH INTL (DFW): NO SVFR; CT 124.15 126.55 127.5 134.9, ATIS 123.775
{ fig:`<prop type="img" src="courses/pilot/figs/fig-sectional-25.webp" title="Figure 25. Sectional Chart Excerpt" alt="FAA figure 25, sectional chart excerpt of a busy Class B area over a large city, with several towered airports and numbered red markers at the points the questions ask about" w="1600" h="2128"></prop>`,
  q:`Using the figure, what does the chart say about Special VFR at Dallas/Fort Worth International (DFW), near area 5?`,
  opts:[`Special VFR needs a tower clearance there`,
        `Fixed wing Special VFR isn't allowed there`,
        `Special VFR is allowed there only by day`],
  a:1, why:`NO SVFR is printed above DFW's name. 91.157 and Appendix D to Part 91 list the airports where fixed wing Special VFR isn't allowed, and the chart flags them this way. At most other surface areas you can ask ATC for Special VFR, but not here.`,
  task:`I.E`, domain:`Preflight` },
// M4:18 reads (checked against the image 2026-11-08): box near NFW: HIGH PERFORMANCE MILITARY JET ACTIVITY 8000' AND BELOW WITHIN 12 NM OF NFW
{ fig:`<prop type="img" src="courses/pilot/figs/fig-sectional-25.webp" title="Figure 25. Sectional Chart Excerpt" alt="FAA figure 25, sectional chart excerpt of a busy Class B area over a large city, with several towered airports and numbered red markers at the points the questions ask about" w="1600" h="2128"></prop>`,
  q:`Using the figure, you'll pass near Fort Worth NAS JRB (Carswell), NFW, at 3,500 feet MSL. What does the chart warn you about?`,
  opts:[`Military jets at 8,000 feet and below within 12 NM`,
        `A restricted area from the surface to 8,000 feet`,
        `Parachute jumping within 12 NM of the field`],
  a:0, why:`The boxed note near NFW reads: high performance military jet activity 8,000 feet and below within 12 NM of NFW. It isn't special use airspace, just a warning to look hard and talk to approach. At 3,500 feet you're inside that band, so flight following is a smart call.`,
  task:`I.E`, domain:`Preflight` },

// ===== I.F performance and limitations, FAA figures 8, 34, 36, 37, 38 and 40 =====
// M4:19 reads (checked against the image 2026-11-08): 29.7 -> 205; 27 C at the 4,000 ft line reads about 6,150 to 6,200 ft (pixel check)
{ fig:`<prop type="img" src="courses/pilot/figs/fig-density-altitude.webp" title="Figure 8. Density Altitude Chart" alt="FAA figure 8, density altitude chart: slanted pressure altitude lines from minus 1,000 to 14,000 feet over outside air temperature, read against approximate density altitude, with a table of altimeter settings and pressure altitude conversion factors" w="1400" h="1374"></prop>`,
  q:`An airport sits at 3,850 feet MSL. The altimeter setting is 29.70, and it's 27°C. Using the figure, about what is the density altitude?`,
  opts:[`About 4,100 feet`,
        `About 2,700 feet`,
        `About 6,200 feet`],
  a:2, why:`First the pressure altitude. The little table says 29.7 is worth 205 feet, so 3,850 + 205 gets you about 4,055. Now find 27°C on the bottom (that's 80°F), run up to the 4,000 foot line, and look left: about 6,200 feet. If you answered 4,100 you stopped at pressure altitude. 2,700 is what happens when 27 gets read as Fahrenheit.`,
  task:`I.F`, domain:`Preflight` },
// M4:20 reads (checked against the image 2026-11-08): 29.8 -> 112, PA 6,912; -7 C (19.4 F) x 296: 7,000 line y 780, 6,000 line y 872, so y 788 = 5,810 ft; +7 C (44.6 F) x 478 gives y 668 = 7,380 ft (pixel check)
{ fig:`<prop type="img" src="courses/pilot/figs/fig-density-altitude.webp" title="Figure 8. Density Altitude Chart" alt="FAA figure 8, density altitude chart: slanted pressure altitude lines from minus 1,000 to 14,000 feet over outside air temperature, read against approximate density altitude, with a table of altimeter settings and pressure altitude conversion factors" w="1400" h="1374"></prop>`,
  q:`Field elevation is 6,800 feet, the altimeter setting is 29.80, and the temperature is minus 7°C. Using the figure, about what is the density altitude?`,
  opts:[`About 6,900 feet`,
        `About 5,800 feet`,
        `About 7,400 feet`],
  a:1, why:`29.8 is worth 112 feet in the table, so pressure altitude comes out at 6,912. Minus 7°C is about 20°F. Go up from there to just under the 7,000 foot line and read across: roughly 5,800. Cold air is dense, so the airplane performs as if it were lower than the field, and standard up there would be about plus 1°C. 7,400 is the plus 7°C misread, and 6,900 is just pressure altitude.`,
  task:`I.F`, domain:`Preflight` },
// M4:21 reads (checked against the image 2026-11-08): 50 deg line at the 20 kt arc: crosswind about 15, headwind about 13
{ fig:`<prop type="img" src="courses/pilot/figs/fig-wind-component.webp" title="Figure 36. Crosswind Component Graph" alt="FAA figure 36, crosswind component graph: quarter circle wind speed arcs and angle lines between wind and runway, read down to crosswind component and across to headwind component, with a worked example" w="1400" h="1167"></prop>`,
  q:`You'll land on runway 35, and the wind is from 040° at 20 knots. Using the figure, what are the wind components?`,
  opts:[`About 13 knots crosswind, 15 knots headwind`,
        `About 10 knots crosswind, 17 knots headwind`,
        `About 15 knots crosswind, 13 knots headwind`],
  a:2, why:`Runway 35 points about 350°. From 350° to 040° is 50°. On the chart, run the 50° line out to the 20 knot arc. Straight down from there is about 15 knots of crosswind, and straight across is about 13 knots of headwind, which match 20 × sin 50° and 20 × cos 50°. People swap the two all the time. 10 and 17 would be a 30° angle.`,
  task:`I.F`, domain:`Preflight` },
// M4:22 reads (checked against the image 2026-11-08): front line ends 400 lb at 15.05 (arm ~37.6): 320 lb -> 12.0; rear line 400 lb at 29.3 (arm ~73.3): 160 lb -> 11.7
{ fig:`<prop type="img" src="courses/pilot/figs/fig-loading-graph.webp" title="Figure 34. Airplane Weight and Balance Graphs" alt="FAA figure 34, top half, loading graph: load weight in pounds against load moment divided by 1,000 for the pilot and front passenger, rear passengers, baggage and fuel" w="1400" h="1025"></prop>`,
  q:`The pilot and front passenger weigh 320 pounds together, and the rear passenger 160. Using the figure, what's their combined load moment divided by 1,000?`,
  opts:[`About 18.0`,
        `About 35.0`,
        `About 23.7`],
  a:2, why:`Two lines, two readings. 320 pounds on the front seat line comes out near 12.0, and 160 on the rear passenger line comes out near 11.7. Together, about 23.7. Run all 480 pounds up the front line and you'd get 18.0; up the rear line, 35.0. Same pounds, different seats, different moments, because the back seat is farther from the datum.`,
  task:`I.F`, domain:`Preflight` },
// M4:23 reads (checked against the image 2026-11-08): forward limit at 1,800 lb is about 62.8 (pixel); utility aft about 73
{ fig:`<prop type="img" src="courses/pilot/figs/fig-cg-envelope.webp" title="Figure 34. Airplane Weight and Balance Graphs" alt="FAA figure 34, bottom half, center of gravity moment envelope: loaded airplane weight against loaded moment divided by 1,000, with the normal and utility category areas" w="1400" h="786"></prop>`,
  q:`Loaded, the airplane weighs 1,800 pounds with a moment divided by 1,000 of 60.0. Using the figure, which is true?`,
  opts:[`It's forward of the forward limit`,
        `It's inside the utility category`,
        `It's inside the normal category only`],
  a:0, why:`Go up to 1,800 pounds and across. The forward edge of the envelope crosses 1,800 at a moment of about 63. 60.0 is left of that, so the CG is forward of the limit and outside both categories. Too far forward raises the stall speed and can leave you short of elevator in the flare.`,
  task:`I.F`, domain:`Preflight` },
// M4:24 reads (checked against the image 2026-11-08): 7,500 ft & 32 F: ground roll 520, total 1,255; note 2: plus 10% for each 60 F above standard
{ fig:`<prop type="img" src="courses/pilot/figs/fig-landing-table.webp" title="Figure 38. Airplane Landing Distance Table" alt="FAA figure 38, airplane landing distance table at 1,600 pounds: ground roll and total to clear a 50 foot obstacle at sea level, 2,500, 5,000 and 7,500 feet, with notes on headwind, temperature and grass runways" w="1400" h="305"></prop>`,
  q:`Using the figure, what total distance to clear a 50 foot obstacle should you plan at 7,500 feet, 92°F, zero wind, on a hard surface?`,
  opts:[`About 1,255 feet`,
        `About 1,381 feet`,
        `About 1,506 feet`],
  a:1, why:`The 7,500 foot column is for 32°F, so 92°F is 60° above standard. Note 2 adds 10 percent for each 60°F: 1,255 × 1.10 = about 1,381 feet. 1,255 skips the temperature note, and 1,506 adds 20 percent, as if it were two steps.`,
  task:`I.F`, domain:`Preflight` },
// M4:25 reads (checked against the image 2026-11-08): 30 C x=534, 2,000 ft line y=700 (1,216 ft at ref); weight guide to 2,600 lb y=727 (~940 ft); obstacle 50 ft y=678 (~1,445 ft)
{ fig:`<prop type="img" src="courses/pilot/figs/fig-takeoff-graph.webp" title="Figure 40. Airplane Takeoff Distance Graph" alt="FAA figure 40, airplane takeoff distance graph: outside air temperature and pressure altitude, then weight, then wind component, then obstacle height, read across reference lines, with a worked example" w="1600" h="955"></prop>`,
  q:`Using the figure, what total distance should you plan to clear a 50 foot obstacle at 30°C, a pressure altitude of 2,000 feet, 2,600 pounds, and calm wind?`,
  opts:[`About 950 feet`,
        `About 2,050 feet`,
        `About 1,500 feet`],
  a:2, why:`Here's the path. 30°C up to the 2,000 foot line and across: about 1,220 feet at the first reference line. Down the guide lines to 2,600 pounds: about 950. Calm wind means no change. Up the guide lines to the 50 foot mark: roughly 1,450 to 1,500. Pick 950 and you've stopped at the ground roll. Pick 2,050 and you've ignored the weight section.`,
  task:`I.F`, domain:`Preflight` },
// M4:26 reads (checked against the image 2026-11-08): table 2,600 lb: lift-off 63 kt / 72 mph, 50 ft 68 kt / 78 mph
{ fig:`<prop type="img" src="courses/pilot/figs/fig-takeoff-graph.webp" title="Figure 40. Airplane Takeoff Distance Graph" alt="FAA figure 40, airplane takeoff distance graph: outside air temperature and pressure altitude, then weight, then wind component, then obstacle height, read across reference lines, with a worked example" w="1600" h="955"></prop>`,
  q:`Using the figure, at 2,600 pounds, what speed should you have at 50 feet on takeoff?`,
  opts:[`63 knots`,
        `68 knots`,
        `78 knots`],
  a:1, why:`The little speed table at the top of the figure has a row for 2,600 pounds: 63 knots at lift-off, 68 knots at 50 feet, and 78 in the mph column. The question wants 50 feet, in knots.`,
  task:`I.F`, domain:`Preflight` },
// M4:27 reads (checked against the image 2026-11-08): 10 C x=393, 4,000 ft line y=716.5 (~1,263 ft); 2,600 lb y=745 (~1,112 ft); 10 kt headwind y=775 (~957 ft)
{ fig:`<prop type="img" src="courses/pilot/figs/fig-landing-graph.webp" title="Figure 37. Airplane Landing Distance Graph" alt="FAA figure 37, airplane landing distance graph: outside air temperature and pressure altitude, then weight, then wind component, then a 50 foot obstacle, read across reference lines, with a worked example" w="1600" h="1001"></prop>`,
  q:`Using the figure, what landing ground roll should you plan at 10°C, a pressure altitude of 4,000 feet, 2,600 pounds, and a 10 knot headwind?`,
  opts:[`About 960 feet`,
        `About 1,110 feet`,
        `About 1,260 feet`],
  a:0, why:`From 10°C up to the 4,000 foot line, then across: about 1,260 feet at the reference line. Down to 2,600 pounds: about 1,110. Down the headwind lines to 10 knots: about 960. There's no obstacle in this question, so 960 is your ground roll. 1,110 forgot the wind, and 1,260 forgot both the weight and the wind.`,
  task:`I.F`, domain:`Preflight` },

// ===== I.G systems =====
{ q:`In cruise, a center zero ammeter stays pinned to the full charge side. What does the PHAK say that points to?`,
  opts:[`A failed alternator`,
        `A battery that's fully charged`,
        `A voltage regulator malfunction`],
  a:2, why:`PHAK ch 7: pinned on the plus side points at the voltage regulator, and pinned on the minus side points at the alternator. A healthy full battery sits near zero, not pinned. Whatever the cause, pull up the POH, shed load, and plan to land.`,
  task:`I.G`, domain:`Preflight` },
{ q:`In a piston engine's cycle, which stroke comes right after compression?`,
  opts:[`The exhaust stroke`,
        `The intake stroke`,
        `The power stroke`],
  a:2, why:`The order is intake, compression, power, exhaust. After the charge is squeezed, the plugs fire and the burning mixture pushes the piston down, and that's the power stroke. Exhaust comes after it, then intake again.`,
  task:`I.G`, domain:`Preflight` },

// ===== I.H human factors =====
{ q:`In the PHAK's DECIDE loop, what comes right after Detect?`,
  opts:[`Choose a course of action`,
        `Evaluate the effect of the action`,
        `Estimate the need to react`],
  a:2, why:`DECIDE: Detect that something changed, Estimate the need to react, Choose a course of action, Identify solutions, Do the necessary actions, Evaluate the effects. Choosing comes third, and evaluating closes the loop.`,
  task:`I.H`, domain:`Preflight` },
{ q:`After a night with almost no sleep, a pilot feels alert enough to fly. What does the PHAK say about acute fatigue?`,
  opts:[`Stay on the ground until rested`,
        `Fly only short local flights in good weather`,
        `Fly, but bring caffeine for the trip home`],
  a:0, why:`PHAK ch 17: if you're suffering from acute fatigue, stay on the ground. Fatigue dulls judgment before you notice it, which is why feeling fine isn't proof. Caffeine hides it, and a short local flight still ends in a landing.`,
  task:`I.H`, domain:`Preflight` },

// ===== II preflight procedures, FAA figures 48, 64 and 65 =====
// M4:32 reads (checked against the image 2026-11-08): K: yellow sign, black 'B' and an arrow pointing right
{ fig:`<prop type="img" src="courses/pilot/figs/fig-airport-signs.webp" title="Figure 65. U.S. Airport Signs" alt="FAA figure 65, U.S. airport signs lettered A to N: mandatory red signs, yellow direction and destination signs, a black location sign, and runway and taxiway pavement markings" w="1000" h="1372"></prop>`,
  q:`Using the figure, you're taxiing and see sign K. What does it tell you?`,
  opts:[`Taxiway B goes off to the right`,
        `You're now on taxiway B`,
        `Hold short of runway B ahead`],
  a:0, why:`AIM 2-3-10: a direction sign is black letters on yellow with an arrow, and it shows which way the taxiway named on it goes from the intersection ahead. Sign K says taxiway B is to the right. A location sign, like E, is yellow on black and says where you are, and runways have numbers, not letters.`,
  task:`II`, domain:`Preflight` },
// M4:33 reads (checked against the image 2026-11-08): C: strip lower left with X marks at its end and along the connecting pavement
{ fig:`<prop type="img" src="courses/pilot/figs/fig-airport-diagram.webp" title="Figure 48. Airport Diagram" alt="FAA figure 48, airport diagram with parallel runways, taxiways, ramps, a tower and an air carrier terminal, with red letter markers at runway and taxiway markings" w="1200" h="1339"></prop>`,
  q:`Using the figure, what may you use the pavement marked with Xs near C for?`,
  opts:[`Taxiing only, not takeoff or landing`,
        `Nothing at all, it's closed`,
        `Takeoff only, not landing`],
  a:1, why:`AIM 2-3-6: an X on a runway or taxiway means it's closed to all operations, permanently or for now. The strip at C has an X at each end and more along it. Don't taxi on it, take off from it, or land on it, whatever it looks like from the air.`,
  task:`II`, domain:`Preflight` },
// M4:34 reads (checked against the image 2026-11-08): D: two solid + two dashed yellow lines across the horizontal runway, solid on the right (east) side, dashed toward runway 19
{ fig:`<prop type="img" src="courses/pilot/figs/fig-airport-markings.webp" title="Figure 64. Airport Markings" alt="FAA figure 64, airport markings: a runway and taxiways with hold short, ILS critical area and taxiway edge markings at red letter markers A to F" w="1200" h="1244"></prop>`,
  q:`Using the figure, what is the marking at D?`,
  opts:[`A hold short line painted across a runway`,
        `A taxiway edge marking at the end of the pavement`,
        `An ILS critical area boundary on a taxiway`],
  a:0, why:`D is two solid and two dashed yellow lines across the runway at the bottom, where it nears runway 19. AIM 2-3-5: the same hold short line can be painted on a runway, and it's where you stop if ATC tells you to hold short of the crossing runway, as in LAHSO. Stop on the solid side.`,
  task:`II`, domain:`Preflight` },
// M4:35 reads (checked against the image 2026-11-08): L: black sign, white numeral 4, no border
{ fig:`<prop type="img" src="courses/pilot/figs/fig-airport-signs.webp" title="Figure 65. U.S. Airport Signs" alt="FAA figure 65, U.S. airport signs lettered A to N: mandatory red signs, yellow direction and destination signs, a black location sign, and runway and taxiway pavement markings" w="1000" h="1372"></prop>`,
  q:`Using the figure, you're rolling out after landing and pass sign L beside the runway. What does it tell you?`,
  opts:[`About 4,000 feet of runway remain`,
        `You're rolling along runway 4 now`,
        `Taxiway 4 is the next turnoff ahead`],
  a:0, why:`AIM 2-3-13: a runway distance remaining sign is a white number on a black background, in thousands of feet. Sign L says about 4,000 feet left. Location signs are yellow on black with a yellow border: E is a taxiway location sign, and F is a runway location sign.`,
  task:`II`, domain:`Preflight` },

// ===== III.A communications and lighting, FAA figure 20 =====
// M4:36 reads (checked against the image 2026-11-08): ECG: CT 120.5 star C, ASOS 124.375, 11 *L 72 122.95, RP 1, 10, 19
{ fig:`<prop type="img" src="courses/pilot/figs/fig-sectional-20.webp" title="Figure 20. Sectional Chart Excerpt" alt="FAA figure 20, sectional chart excerpt of a coastal area with airports, airspace boundaries and numbered red markers at the points the questions ask about" w="1600" h="2128"></prop>`,
  q:`Using the figure, inbound to Elizabeth City (ECG) near area 3, on what frequency can you hear the automated weather?`,
  opts:[`120.5`,
        `124.375`,
        `121.125`],
  a:1, why:`ECG's data block lists CT 120.5 with a star (a part time tower) and ASOS 124.375. The ASOS is the weather. 121.125 is the AWOS at Northeastern Regional, down at area 4. Listen to it before you call the tower, so your first call can say you have it.`,
  task:`III.A`, domain:`Airport and flight` },
// M4:37 reads (checked against the image 2026-11-08): NORFOLK INTL: CT 120.8, ATIS 127.15, 27 L 90; OCEANA NAS/SOUCEK (NTU): CT 127.075, ATIS 317.6
{ fig:`<prop type="img" src="courses/pilot/figs/fig-sectional-20.webp" title="Figure 20. Sectional Chart Excerpt" alt="FAA figure 20, sectional chart excerpt of a coastal area with airports, airspace boundaries and numbered red markers at the points the questions ask about" w="1600" h="2128"></prop>`,
  q:`Using the figure, landing at Norfolk International (ORF) near area 1, on what frequency do you get ATIS?`,
  opts:[`127.15`,
        `120.8`,
        `127.075`],
  a:0, why:`Norfolk International's data block reads CT 120.8, ATIS 127.15, then 27 L 90. ATIS is 127.15. 120.8 is the tower, and 127.075 is the tower at Oceana NAS, east of area 1.`,
  task:`III.A`, domain:`Airport and flight` },
{ q:`At night you see a pair of synchronized flashing white lights on either side of a runway threshold. What are they?`,
  opts:[`Runway end identifier lights`,
        `Runway guard lights at the hold line`,
        `Runway status lights in the pavement`],
  a:0, why:`AIM 2-1-3: runway end identifier lights, REIL, are a pair of synchronized flashing lights on each side of the threshold. They help you pick out the approach end of a runway quickly. Runway guard lights are yellow and sit at taxiway hold lines, and runway status lights are red, in the pavement.`,
  task:`III.A`, domain:`Airport and flight` },

// ===== III.B traffic patterns, FAA figures 22 and 49 =====
// M4:39 reads (checked against the image 2026-11-08): SHOSHONE CO (S83): 2227 *L 53 122.8 C, RP 7
{ fig:`<prop type="img" src="courses/pilot/figs/fig-sectional-22.webp" title="Figure 22. Sectional Chart Excerpt" alt="FAA figure 22, sectional chart excerpt of hilly terrain around a large lake with small airports, a contour interval legend and numbered red markers at the points the questions ask about" w="1600" h="2128"></prop>`,
  q:`Using the figure, you'll land on runway 7 at Shoshone County (S83), southeast of area 3. Which way do you turn in the pattern?`,
  opts:[`Right turns for runway 7`,
        `Left turns for runway 7`,
        `Right turns, but only at night`],
  a:0, why:`S83's data block ends RP 7: right traffic for runway 7. 91.126(b) makes turns left unless the airport says otherwise, and RP in a data block is how a sectional says otherwise. Runway 25, not listed, keeps left traffic. The Chart Supplement has the details.`,
  task:`III.B`, domain:`Airport and flight` },
{ q:`Staying in the pattern after takeoff at a non-towered airport, when does the AIM say to turn crosswind?`,
  opts:[`Right over the departure end, at 500 feet above the runway`,
        `As soon as you're at least 300 feet above the runway`,
        `Beyond the departure end, within 300 feet of pattern altitude`],
  a:2, why:`AIM 4-3-3: if you're staying in the pattern, start the crosswind turn beyond the departure end of the runway, within 300 feet of pattern altitude. Turning low over the runway puts you in the way of anyone departing behind you, and it costs you room if the engine quits.`,
  task:`III.B`, domain:`Airport and flight` },
// M4:41 reads (checked against the image 2026-11-08): S indicator: long leg N-S below the circle, short leg pointing W at its outer end -> runway 36 left traffic; N indicator short leg also W (18 right); 4-22 has X marks
{ fig:`<prop type="img" src="courses/pilot/figs/fig-landing-indicators.webp" title="Figure 49. Airport Diagram" alt="FAA figure 49, airport diagram of crossing runways 18 36 and 4 22 with closed runway X markings and a segmented circle with a tetrahedron landing direction indicator" w="1000" h="858"></prop>`,
  q:`Using the figure, if you land on runway 36, what traffic pattern do the indicators call for?`,
  opts:[`Right turns, with the pattern to the east`,
        `Left turns, with the pattern to the west`,
        `Right turns, with the pattern off to the west`],
  a:1, why:`AIM 4-3-4: each L shaped traffic pattern indicator shows the base leg and final for one runway. The indicator on the south side, for a landing to the north, has its short leg pointing west. Heading north, west is on your left, so it's left traffic with the pattern west of the runway.`,
  task:`III.B`, domain:`Airport and flight` },

// ===== IV takeoffs and landings =====
{ q:`During the flare, the airplane balloons a little. According to the AFH, what can help cushion the landing?`,
  opts:[`A little power, closed right after touchdown`,
        `Firm forward pressure to put it on the runway`,
        `Raising the flaps so it settles faster`],
  a:0, why:`AFH ch 9: depending on how much it balloons, adding power keeps the airspeed from bleeding off and the wing from quitting, and the throttle comes back to idle right after touchdown. Shoving the nose down risks a bounce or a nosewheel first landing. If the balloon is big, go around.`,
  task:`IV`, domain:`Airport and flight` },
{ q:`Which wind is most likely to leave a landing jet's wake sitting on the runway where you'll touch down?`,
  opts:[`A strong direct headwind`,
        `A strong direct crosswind`,
        `A light quartering tailwind`],
  a:2, why:`AIM 7-4: vortices sink and drift with the wind, and a light quartering tailwind can carry them forward into your touchdown zone and keep them there. That's the case the AIM tells you to treat with maximum caution. Strong wind breaks them up faster.`,
  task:`IV`, domain:`Airport and flight` },

// ===== V performance maneuvers =====
{ q:`In a 45° steep turn, the nose has dropped well below the horizon and you're losing altitude fast. What should you do first?`,
  opts:[`Add back pressure, then reduce the bank`,
        `Reduce the bank, then add back pressure`,
        `Add power, then steepen the bank`],
  a:1, why:`When the nose drops in a steep turn, most of the lift is pointing sideways. Pulling harder first only tightens the turn and loads the wings. Shallow the bank first, then back pressure brings the nose up, then roll back to 45°.`,
  task:`V`, domain:`Airport and flight` },

// ===== VII slow flight and stalls =====
{ q:`On the private pilot checkride, slow flight and stalls have to be done from a height that lets you finish no lower than what?`,
  opts:[`1,000 feet AGL`,
        `1,500 feet AGL`,
        `3,000 feet AGL`],
  a:1, why:`The ACS, FAA-S-ACS-6C, has the applicant pick an altitude that lets the task be completed no lower than 1,500 feet AGL, for slow flight and for each stall task. It's about leaving room to recover. 1,000 feet is pattern altitude.`,
  task:`VII`, domain:`Airport and flight` },

// ===== VIII basic instrument maneuvers =====
{ q:`Under the hood, you find the nose high and the airspeed dropping. In what order do you recover?`,
  opts:[`Level the wings, lower the nose, add power`,
        `Lower the nose, reduce power, level the wings`,
        `Add power, lower the nose, level the wings`],
  a:2, why:`For a nose high attitude with falling airspeed, the IFH order is power, pitch, then bank: add power, lower the nose to the level flight attitude, then level the wings. That keeps you from stalling while you fix the bank. The nose low recovery is the one that starts with the power coming back and the wings level.`,
  task:`VIII`, domain:`Airport and flight` },

// ===== XII postflight =====
{ q:`Why does a normal shutdown pull the mixture to idle cutoff, rather than turning the magnetos off?`,
  opts:[`So the battery can recharge before the master goes off`,
        `So the carburetor stays full of fuel for the next start`,
        `So the engine stops with no fuel left in the cylinders`],
  a:2, why:`Idle cutoff starves the engine, so it quits with no unburned fuel left in the cylinders, and then the mags go off. The AFH ch 2 shutdown list puts the mixture before the mag switch, after a check that the mags ground at idle. A propeller with fuel in the cylinders and a live mag behind it can start if someone moves it.`,
  task:`XII`, domain:`Airport and flight` },

// ===== VI navigation, FAA figures 20, 28, 58 and 6 =====
// M4:48 reads (checked against the image 2026-11-08): VORTAC NORFOLK 116.9 Ch 116 ORF; airway to NNE labeled 027 deg, V1-139
{ fig:`<prop type="img" src="courses/pilot/figs/fig-sectional-20.webp" title="Figure 20. Sectional Chart Excerpt" alt="FAA figure 20, sectional chart excerpt of a coastal area with airports, airspace boundaries and numbered red markers at the points the questions ask about" w="1600" h="2128"></prop>`,
  q:`Using the figure, you'll track outbound from the Norfolk VORTAC near area 1 along V1-139, toward the northeast. What do you set?`,
  opts:[`116.9, and 207 with a TO flag`,
        `127.15, and 027 with a FROM flag`,
        `116.9, and 027 with a FROM flag`],
  a:2, why:`The Norfolk VORTAC box reads 116.9 Ch 116 ORF, and the airway leaving it to the north northeast is labeled 027° V1-139. Outbound on the 027° radial, you set 027 and see a FROM flag. 207 with a TO flag would give you reverse sensing, and 127.15 is Norfolk International's ATIS.`,
  task:`VI`, domain:`Navigation and emergencies` },
// M4:49 reads (checked against the image 2026-11-08): which indicator shows the 030 radial, outbound (not a dual VOR check): 1: OBS 210 TO, needle right; 2: 210 FR centered; 3: 210 no flag; 4: 210 TO needle left; 5: 210 TO centered; 6: 210 FR needle left; 7: 030 no flag; 8: 030 TO centered; 9: 030 FR centered
{ fig:`<prop type="img" src="courses/pilot/figs/fig-vor.webp" title="Figure 28. VOR" alt="FAA figure 28, nine VOR indicators numbered 1 to 9, each with a course selector, a needle and a TO or FROM flag" w="1600" h="1446"></prop>`,
  q:`Using the figure, which indicator shows the airplane on the 030° radial, set up to fly outbound on it?`,
  opts:[`Indicator 8`,
        `Indicator 2`,
        `Indicator 9`],
  a:2, why:`A radial runs from the station. On the 030° radial outbound, you set 030 and see a centered needle with a FROM flag: indicator 9. Indicator 8 is 030 with a TO flag, so it's on the 210° radial heading in. Indicator 2 is 210 FROM, also on the 210° radial. Indicator 5 is on the 030° radial too, set to fly inbound.`,
  task:`VI`, domain:`Navigation and emergencies` },
{ q:`Near 40° north latitude, you're turning right from east toward south using only the magnetic compass. By the PHAK rule of thumb, when should you stop the turn?`,
  opts:[`When the compass reads about 145°`,
        `When the compass reads about 215°`,
        `When the compass reads exactly 180°`],
  a:1, why:`PHAK ch 8: turning toward south, let the compass pass the heading before you stop, by about 15° plus half the latitude. At 40° that's 15 + 20 = 35° past south, so about 215°. Stopping early at 145° is the rule for turning toward north. Stopping at 180° leaves you short of south.`,
  task:`VI`, domain:`Navigation and emergencies` },
// M4:51 reads (checked against the image 2026-11-08): For N 30 60 E 120 150 / Steer 0 27 56 85 116 148; For S 210 240 W 300 330 / Steer 181 214 244 274 303 332
{ fig:`<prop type="img" src="courses/pilot/figs/fig-compass-card.webp" title="Figure 58. Compass Card" alt="FAA figure 58, compass deviation card: the heading you want, For, above the compass heading to fly, Steer, every 30 degrees" w="1400" h="286"></prop>`,
  q:`True course is 238°, the wind correction is 7° right, and variation is 5° east. Using the figure, what compass heading do you steer?`,
  opts:[`244°`,
        `240°`,
        `254°`],
  a:0, why:`True heading is 238 + 7 = 245°. East is least, so magnetic heading is 245 minus 5 = 240°. The compass card says for 240, steer 244. 240 forgets the deviation card, and 254 adds the east variation instead of subtracting it, then applies the card.`,
  task:`VI`, domain:`Navigation and emergencies` },
// M4:52 reads (checked against the image 2026-11-08): nose of the airplane symbol on W, card reads 270
{ fig:`<prop type="img" src="courses/pilot/figs/fig-heading-indicator.webp" title="Figure 6. Heading Indicator" alt="FAA figure 6, heading indicator: a compass card behind a small airplane symbol whose nose points at the heading, with a push to cage knob" w="1000" h="992"></prop>`,
  q:`You set the heading indicator to the compass 1 hour 20 minutes ago. Now, straight and level, the compass reads 290°. Using the figure, what's going on?`,
  opts:[`It has drifted about 20°, so trust it over the compass`,
        `It has drifted about 20°, so reset it to 290°`,
        `It reads 290°, so the two still agree`],
  a:1, why:`The heading indicator shows W under the airplane's nose, 270°, while the compass reads 290°. That's 20° of drift, about what the PHAK's 15° an hour from the Earth's rotation alone gives in 1 hour 20 minutes. In steady straight and level flight the compass is right, so reset the heading indicator to it.`,
  task:`VI`, domain:`Navigation and emergencies` },

// ===== IX emergency operations =====
{ q:`The engine quits at 6,000 feet AGL over broken terrain. According to the AFH, how should you choose where to land?`,
  opts:[`Head for the nearest field you can see from here`,
        `Pick the exact spot now and don't change it at all`,
        `Pick a general area first, then a spot lower down`],
  a:2, why:`AFH ch 18: from a good height, pick the general area first, because terrain is hard to judge from up high. You may drop the plan once for one that's clearly better, but not more than once. A planned landing on poor ground beats an uncontrolled one on a good field.`,
  task:`IX`, domain:`Navigation and emergencies` },
{ q:`Low on fuel and losing daylight, a pilot chooses to land in a hayfield while the engine still runs well. What kind of landing is it?`,
  opts:[`A forced landing`,
        `A precautionary landing`,
        `An emergency landing under 91.3`],
  a:1, why:`AFH ch 18: a precautionary landing is one the pilot chooses while more flight is possible but not advisable, for weather, fuel, being lost, or a rough engine. A forced landing is one you have to make right now, as after an engine failure. 91.3 is the PIC's emergency authority, not a kind of landing.`,
  task:`IX`, domain:`Navigation and emergencies` },
{ q:`For an off field landing, how does touching down at 80 knots of groundspeed compare with 40 knots?`,
  opts:[`About four times the energy to absorb`,
        `About twice the energy to absorb`,
        `About the same, if the field is long`],
  a:0, why:`AFH ch 18: doubling the groundspeed quadruples the energy that has to go somewhere, because energy goes with the square of speed. That's why you land into the wind if you can, at the slowest speed you can control. A long field helps with the distance, not the energy.`,
  task:`IX`, domain:`Navigation and emergencies` },
{ q:`The engine quits with plenty of fuel in the left tank, because the selector is on the empty right tank. What's this called?`,
  opts:[`Fuel starvation`,
        `Fuel exhaustion`,
        `Vapor lock`],
  a:0, why:`Fuel starvation is having fuel aboard but not getting it to the engine: the selector on an empty tank, a plugged vent, water in the line. Fuel exhaustion is running every tank dry. Both are pilot preventable, and starvation is often fixed in seconds by switching tanks.`,
  task:`IX`, domain:`Navigation and emergencies` },

// ===== XI night operations =====
// M4:57 reads (checked against the image 2026-11-08): NORTHEASTERN RGNL (EDE): AWOS-3 121.125, 20 *L 60 123.0 C
{ fig:`<prop type="img" src="courses/pilot/figs/fig-sectional-20.webp" title="Figure 20. Sectional Chart Excerpt" alt="FAA figure 20, sectional chart excerpt of a coastal area with airports, airspace boundaries and numbered red markers at the points the questions ask about" w="1600" h="2128"></prop>`,
  q:`Using the figure, you'll land at Northeastern Regional (EDE), area 4, at night. What does its data block tell you about the runway?`,
  opts:[`Lighting has limits, and the longest runway is 6,000 feet`,
        `Lights run sunset to sunrise, and the runway is 2,000 feet`,
        `There's no lighting, and the longest runway is 600 feet`],
  a:0, why:`EDE's data block reads 20 *L 60 123.0: field elevation 20 feet, *L for lighting with limitations (part time or pilot controlled, check the Chart Supplement), a 6,000 foot longest runway, and a CTAF of 123.0. A plain L would mean lights from sunset to sunrise, and a dash would mean none.`,
  task:`XI`, domain:`Navigation and emergencies` },
{ q:`Taxiing at night, what color are the taxiway edge lights?`,
  opts:[`Green, along the centerline`,
        `Blue, along the edges`,
        `White, along the edges`],
  a:1, why:`AIM 2-1-10: taxiway edge lights are blue. If there are centerline lights, they're green. Runway edges are white. Blue means taxiway, so keep a row of blue lights on each side of you.`,
  task:`XI`, domain:`Navigation and emergencies` },
{ q:`At night you read the sectional by a red flashlight. What does the AFH warn about red light?`,
  opts:[`It slows down your eyes' adaptation to the dark`,
        `It's not allowed by 91.209 on the flight deck`,
        `It distorts the colors printed on the chart`],
  a:2, why:`AFH ch 11: a red light won't wreck your night vision, but it changes how the colors on a chart look, and anything printed in red can vanish. That's why plenty of pilots carry a dim white light for the chart. 91.209 is about the airplane's own lights.`,
  task:`XI`, domain:`Navigation and emergencies` }

]});
})();
