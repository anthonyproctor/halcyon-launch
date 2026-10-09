# Cleared for Takeoff: Private Pilot course bible

Read this whole file before writing anything. Also read `../../full/BIBLE.md` (the PMP course bible) for the shared format, voice rules, answer-length rules, flags, props, and `data-who` speaker tags, and `../../full/ch01.js` for the exact object shape and voice. This course reuses that engine and those rules unless this file says otherwise.

## Goal
A 12 to 15 hour story-driven companion course for the FAA **Private Pilot Airplane (PAR) knowledge test**. It is a companion to Anthony's ground school (Sporty's), not a replacement. Each chapter takes about 60 to 75 minutes: a flight-school story you can't put down, a lesson that actually teaches the ACS knowledge elements, decisions in the cockpit and on the ground, E6B style math drills, a chart or weather exercise, and a 15-question test-style quiz. A reader who finishes should pass the PAR knowledge test and walk into the checkride oral understanding the why.

## The test (verified 2026-10-09)
- **Private Pilot Airplane (PAR) knowledge test:** 60 scored questions, plus up to 5 unscored validation questions (about 65 on screen). **2.0 hours** (reduced from 150 minutes effective April 24, 2023). **Passing score 70 percent** (42 of 60). Multiple choice, three options (A, B, C) on the real test.
- **Standard:** Private Pilot Airplane Airman Certification Standards, **FAA-S-ACS-6C** (effective May 31, 2024). Some older material still lists 2.5 hours; it's stale.
- **Supplement:** questions reference the Airman Knowledge Testing Supplement (FAA-CT-8080-2, figures: sectional excerpts, METAR/TAF, performance charts, weight and balance, airport diagrams). Our props and drills mimic those figures.
- **Primary references:** Pilot's Handbook of Aeronautical Knowledge (PHAK, FAA-H-8083-25), Airplane Flying Handbook (AFH, FAA-H-8083-3), Aviation Weather Handbook (FAA-H-8083-28), Aeronautical Information Manual (AIM), 14 CFR Parts 61 and 91, NTSB 830, Risk Management Handbook (FAA-H-8083-2).
- Sources:
  - FAA community advisory on reduced test times: https://www.faa.gov/training_testing/testing/community_advisory_april_2023
  - FAA ACS knowledge test table: https://www.faa.gov/training_testing/testing/acs/acs_knowledge_test_table.pdf
  - Private Pilot Airplane ACS: https://www.faa.gov/training_testing/testing/acs/private_airplane_acs_6.pdf
  - Exam facts summary (cross check): https://open-exam-prep.com/study-guides/faa-private-pilot/introduction/exam-facts
  - PHAK: https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/phak

### Important format difference from PMP
The real PAR test uses **three** options. Our decisions keep four options (story choices), but **quiz questions and the mock exam use three options (A, B, C)**. The validator for this course checks 3-option quiz items; answer-length and position rules apply the same way (right answer not reliably longest, positions balanced).

## ACS areas of operation and knowledge codes (FAA-S-ACS-6C)
Every quiz question and mock question is tagged with one of these task codes. Use the ACS element style in `why` text where useful (for example PA.I.C.K3).
- **PA.I Preflight Preparation:** I.A Pilot Qualifications · I.B Airworthiness Requirements · I.C Weather Information · I.D Cross-Country Flight Planning · I.E National Airspace System · I.F Performance and Limitations · I.G Operation of Systems · I.H Human Factors
- **PA.II Preflight Procedures:** II.A Preflight Assessment · II.B Flight Deck Management · II.C Engine Starting · II.D Taxiing · II.F Before Takeoff Check
- **PA.III Airport Operations:** III.A Communications, Light Signals, and Runway Lighting Systems · III.B Traffic Patterns
- **PA.IV Takeoffs, Landings, and Go-Arounds:** normal, crosswind, soft-field, short-field, forward slip, go-around
- **PA.V Performance and Ground Reference Maneuvers:** steep turns, ground reference maneuvers
- **PA.VI Navigation:** VI.A Pilotage and Dead Reckoning · VI.B Navigation Systems and Radar Services · VI.C Diversion · VI.D Lost Procedures
- **PA.VII Slow Flight and Stalls:** slow flight, power-off and power-on stalls, spin awareness
- **PA.VIII Basic Instrument Maneuvers**
- **PA.IX Emergency Operations:** emergency descent, emergency approach and landing, systems and equipment malfunctions, emergency equipment and survival gear
- **PA.XI Night Operations**
- **PA.XII Postflight Procedures**
Weighting for the written: Preflight Preparation (I.A to I.H) dominates real tests, especially regulations, airspace, weather, performance, and systems. Mirror that: about 60 percent of quiz and mock items from Area I, the rest spread across III, IV, VI, VII, IX, XI, and aeromedical/ADM.

Task codes for tagging (use exactly these strings): `I.A` `I.B` `I.C` `I.D` `I.E` `I.F` `I.G` `I.H` `II` `III.A` `III.B` `IV` `V` `VI` `VII` `VIII` `IX` `XI` `XII`. Domain field for each item: `Preflight` (I.x, II), `Airport and flight` (III, IV, V, VII, VIII, XII), `Navigation and emergencies` (VI, IX, XI).

## Answer quality rules
Identical to the PMP bible, plus:
- **Safety first, always.** The best answer is the conservative, regulation-compliant, risk-managed choice. Never teach or reward anything unsafe or illegal. When a distractor is unsafe, the `why` says plainly why it could hurt someone.
- **Exact regulations.** Cite the specific 14 CFR section or AIM paragraph in lesson text or `why` when it settles the answer (for example 91.155 basic VFR weather minimums, 61.57 recency, 91.103 preflight action, 91.205 required equipment, 91.211 oxygen, 91.17 alcohol). Double check every number against the source.
- **Exact math.** Show formula and steps. Use standard conventions: density altitude rule of thumb DA ≈ PA + 120 × (OAT minus ISA temp), ISA = 15°C minus 2°C per 1,000 ft; pressure altitude = field elevation + (29.92 minus altimeter) × 1,000; crosswind = wind speed × sin(angle) using the clock rule or exact sine; weight and balance moment = weight × arm, CG = total moment ÷ total weight; time = distance ÷ groundspeed; fuel = time × burn rate plus required reserve (91.151: 30 minutes day, 45 minutes night). Use realistic Cessna 172S numbers (empty weight about 1,680 lb, max gross 2,550 lb normal category, 53 gal usable, about 9 to 10 gal/hr cruise burn at 2,400 RPM).
- No em or en dashes. Contractions. Plain words. Dialogue in `<span class="said" data-who="Name">"..."</span>`.

## Cast and arcs
- **Sam Okafor** (you). 42. The same Sam from the PMP course, a year after the Cascade launch, now running delivery at Halcyon. Former Air Force F-16 crew chief and maintenance NCO: spent twelve years making jets safe for other people to fly and never flew himself. Knows airplanes as machines down to the safety wire; has to learn that flying is a different skill. His flaw: confidence from the maintenance world, assuming knowing the airplane means knowing how to fly it, and a habit of pushing through to get the job done (get-there-itis). Arc: from mechanic to pilot in command, learning that the best pilots are the ones who decide not to go.
- **Ray Mendez**. 68. Sam's old flight chief (MSgt, retired). Gruff, funny, grew up around jets. Ray's line "the jet doesn't care how you feel" from the PMP course becomes the course's safety refrain. Ray encouraged Sam to finally learn. Late in the course (ch10), Ray tells the story of a pilot he knew who flew into weather to make a family dinner and didn't come home.
- **Captain Nina Alvarez**. 34. Sam's CFI at the flying club. Former regional airline first officer, now instructing while she waits on a medical issue to clear (she was grounded for six months, which she reveals in ch8; it's why she takes aeromedical factors seriously). Exacting, warm, allergic to shortcuts. Teaches with "what's the worst thing that happens if you're wrong?" Arc: she's rebuilding her own confidence too; the night Sam makes a good no-go call (ch10), she tells him why it mattered to her.
- **Ruth Calder**. 68. Retired NASA flight director (from the PMP course). Sam calls her when he's deciding things. She is the voice of risk management and decision-making (PAVE, IMSAFE, the 3P model), and she reminds him that "go" is a decision with consequences, and so is "no go."
- **Dana Okafor**. Sam's wife, chemistry teacher. Skeptical and supportive. Her chemistry brain makes her ask great questions about density altitude and carburetor ice. She's his first passenger (ch12), and his decisions about passengers (and her comfort) matter.
- **The Front Range Flyers club** (fictional) at **Centennial Airport (KAPA)**, a towered Class D airport under the Denver Class B shelf. Members:
  - **Marcus Webb**, 61, retired airline captain, club safety officer, runs the monthly safety meeting.
  - **Jess Park**, 26, fellow student, three lessons ahead of Sam, competitive, sharp on regulations, prone to rushing preflights.
  - **Tom Briggs**, 55, the club's A&P mechanic, Sam's natural ally; they talk airplanes like old friends.
  - **Kendra Lowe**, the designated pilot examiner (DPE) Sam meets at his checkride (ch12).
- **The airplane:** **N4725S, a club Cessna 172S with six-pack analog gauges and a panel GPS navigator** (no glass cockpit), so the course teaches the analog instruments the test still covers.

## Fixed facts
- Home airport **KAPA Centennial** (field elevation about 5,885 ft MSL, towered Class D, underlies the Denver Class B). Practice area east of the airport over the plains. Alternate fields: **KBJC Rocky Mountain Metropolitan**, **KFTG Front Range**, **KCOS** (Class C), **KLMO Vance Brand**, **KGXY Greeley**.
- Density altitude is a constant character: summer afternoons at KAPA push density altitude above 8,000 ft. The mountains to the west mean turbulence, mountain wave, and rapidly building afternoon thunderstorms.
- Sam's first solo is in ch7, first solo cross-country in ch9, knowledge test in ch11, checkride in ch12.
- Never cite real accidents by name or real people. Fictional NTSB-style anecdotes only, clearly fictional.

## Chapter plan (num, title, content, ACS codes, drills and exercises, ending)
1. **Discovery Flight.** Ray talks Sam into a discovery flight. Meet Nina, the club, N4725S. Pilot certification path (student pilot certificate, medical classes, 61.103 eligibility, 61.109 hours), the four forces, airplane parts and controls. Decisions: medical (third class vs first class for a career, BasicMed limits), choosing an instructor. Drill: none, or a simple hours-to-certificate count. Exercise: match controls to axes. Codes I.A, I.G. Ends: Sam's hands shaking after landing, not from fear.
2. **The Machine.** Systems: engine (four stroke, magnetos, carburetor vs fuel injection, mixture), fuel system, electrical, pitot-static instruments and gyros, failure indications. Sam's maintenance background helps and hurts (he wants to troubleshoot instead of fly). Airworthiness: 91.205 required equipment (TOMATO FLAMES), 91.213 inoperative equipment, AROW documents, required inspections (annual, 100 hour, ELT, transponder, pitot-static). Drill: hours to next 100 hour inspection; can it fly with this item inop. Codes I.B, I.G. Ends: Tom finds a squawk Sam missed on preflight.
3. **Weather School.** METAR, TAF, winds aloft, prog charts, AIRMETs and SIGMETs, PIREPs, fronts, stability, thunderstorms, fog, icing, mountain wave. Sam cancels his first lesson because of wind and feels foolish; Nina tells him it was right. Props: real-format METARs and TAFs for KAPA. Exercise: decode a METAR and TAF line by line. Drill: dewpoint spread and cloud base estimate ((temp minus dewpoint) ÷ 2.5 × 1,000 ft AGL). Codes I.C. Ends: an afternoon thunderstorm over the Palmer Divide.
4. **Airspace.** Class A, B, C, D, E, G; Denver Class B shelves; Class D at KAPA; VFR weather minimums (91.155) by class and altitude; special use airspace, TFRs, NOTAMs. Radio work with Centennial Tower and Denver Approach (flight following). Props: a sectional excerpt description and a TFR NOTAM. Exercise: sectional chart reading (symbols, airspace floors and ceilings, MEFs). Codes I.E, III.A. Ends: Sam nearly busts the Class B shelf on a training flight; Nina catches it.
5. **Performance.** Density altitude, takeoff and landing distance charts, climb performance, weight and balance, CG effects. A hot August afternoon at KAPA. Drills: density altitude from field elevation, altimeter, temperature; weight and balance with Sam, Nina, and fuel (find CG, check limits); takeoff distance from a POH table with a headwind correction. Codes I.F. Ends: the decision not to take a third passenger on a hot day.
6. **Pattern Work.** Traffic patterns, right of way (91.113), wake turbulence, runway markings and lighting, light gun signals, crosswind takeoffs and landings, go-arounds, forward slips. Jess has a hard landing. Drill: crosswind and headwind components for KAPA runways. Exercise: runway markings and light gun signals. Codes III.B, III.A, IV. Ends: Nina gets out of the airplane and hands Sam the logbook.
7. **First Solo.** Pre-solo knowledge test, 61.87 solo requirements and endorsements, slow flight, stalls, spin awareness, steep turns, ground reference maneuvers. The solo itself, three takeoffs and landings, told minute by minute. Props: the solo endorsement logbook entry. Codes VII, V, I.A. Ends: the shirt tail cut, Ray on the phone.
8. **Human Factors.** Aeromedical (hypoxia, hyperventilation, spatial disorientation, carbon monoxide, alcohol and drugs, 91.17, fatigue, middle ear, motion sickness), IMSAFE, PAVE, 3P, hazardous attitudes and antidotes, aeronautical decision-making, CRM, SRM. Nina's grounding story. Ruth on decision-making. Exercise: match hazardous attitudes to antidotes. Codes I.H. Ends: Sam realizes his get-there-itis has a name.
9. **Cross-Country.** Pilotage and dead reckoning, VFR navigation log, true course to magnetic heading (variation, deviation, wind correction), VOR, GPS, flight following, diversion and lost procedures, fuel planning (91.151). Sam's first solo cross-country, KAPA to KGXY to KFTG. Drills: nav log leg (true course, wind correction angle, groundspeed, time en route, fuel); time-speed-distance diversion. Props: the nav log and a flight plan. Codes I.D, VI. Ends: a diversion around building buildups.
10. **The No-Go.** Night operations (night currency 61.57, lighting, illusions, night vision), emergencies (engine failure, electrical failure, fire, emergency landings, ELT, 121.5), and the course's emotional center: a beautiful evening, family waiting, marginal weather, and the decision. Ray's story. Codes XI, IX, I.H. Ends: Sam stays on the ground, and it's the best flight he never made.
11. **The Written.** Regulations review (61 and 91 essentials, NTSB 830 reporting, logbook requirements, privileges and limitations of a private pilot 61.113, recency 61.56 flight review and 61.57), test-taking strategy, and the knowledge test day at a testing center. Exercise: which regulation answers this question. Codes I.A, I.B, XII. Ends: the score (Sam passes) and the areas he missed (these feed the study plan).
12. **Checkride.** The oral and the flight with the DPE: everything comes together. Postflight procedures. Sam's first passenger is Dana, on a calm morning, and the last scene mirrors chapter 1. Codes II, XII, I.A, IV. Ends: the temporary certificate, and Ray saying the jet finally belongs to Sam.

## Cross-chapter flags (safety culture that follows you)
Set on a clearly wrong option (s:0 or s:1) and read later. Use `(s.flags.X||G.X)` in the setting chapter and `G.X` later.
| flag | set in | meaning | read in |
|---|---|---|---|
| `rushedpreflight` | ch2 | skipped part of the preflight to save time | ch6, ch12 |
| `ignoredwind` | ch3 | flew a lesson in winds beyond his personal minimums | ch6 |
| `noflightfollowing` | ch4 | declined flight following near the Class B | ch9 |
| `skippedwb` | ch5 | guessed weight and balance instead of computing it | ch12 |
| `forcedlanding` | ch6 | forced a bad approach instead of going around | ch7 |
| `nopersonalmins` | ch8 | didn't write personal minimums | ch10 |
| `thinfuel` | ch9 | planned the leg with legal but thin fuel reserve | ch10 |
| `pushedweather` | ch10 | went in the marginal weather (the canonical story still has him stay; the flag changes the outcome text to a scary, survivable lesson) | ch12 |

## Props (same format as the PMP bible)
Use 1 to 3 per chapter: METAR and TAF lines (type "doc" with monospace content), NOTAM and TFR text, the logbook endorsement (type "doc"), nav log (type "doc"), POH performance table (type "doc" or chart kind "bars"), weight and balance worksheet (type "doc"), texts from Ray and Dana (type "text"), club chat messages (type "chat").

## Quiz and mock exam
- **Chapter quiz:** 15 questions, **three options** (A, B, C), tagged with the task codes above and a domain. Test style: concise stem, often referencing a figure-like prop or a number to compute.
- **Mock exam:** 60 questions, three options, 2.0 hours, weighted like the real test (about 60 percent Area I, with heavy regulations, airspace, weather, performance, systems, and ADM), including at least 15 calculation questions (density altitude, pressure altitude, weight and balance and CG shifts, crosswind, time-speed-distance, fuel, cloud base, true course to compass heading). Neutral fictional settings, not the Sam story. Passing 70 percent.

## File format
Same as the PMP Full Course (`full/chNN.js` inside this course folder, pushing to `window.HALCYON_FULL`), with these differences: `quiz` items have three `opts` and `a` in 0 to 2; decisions keep four options. Audio, art, and cast files live under this course folder.

## Validation
Use the course-aware validator (`node tools/check_full.mjs --course pilot courses/pilot/full/chNN.js`) once it supports three-option quizzes and this course's task codes; until then, follow the rules above by hand and run the AI detector on every chapter (every chunk under 30 percent).
