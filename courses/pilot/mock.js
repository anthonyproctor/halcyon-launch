// Private Pilot course "Danny's Logbook": practice exam (60 questions, three options, weighted like the FAA PAR knowledge test).
// Settings are neutral and fictional (fictional airports and airplanes), not the Jordan story. Figures are typed into the stem.
// Every rule and number below was checked on 2026-10-10 against these sources (all read directly):
//   14 CFR part 61: https://www.ecfr.gov/api/renderer/v1/content/enhanced/current/title-14?part=61  (61.23, 61.56, 61.57, 61.113)
//   14 CFR part 91: https://www.ecfr.gov/api/renderer/v1/content/enhanced/current/title-14?part=91  (91.17, 91.113, 91.126, 91.130, 91.131, 91.151, 91.155, 91.159, 91.207, 91.211, 91.213, 91.215, 91.409)
//   14 CFR part 43: https://www.ecfr.gov/api/renderer/v1/content/enhanced/current/title-14?part=43
//   49 CFR part 830 (NTSB): https://www.ecfr.gov/api/renderer/v1/content/enhanced/current/title-49?part=830  (830.2, 830.5, 830.15)
//   AIM: https://www.faa.gov/air_traffic/publications/atpubs/aim_html/chap2_section_3.html (2-3 holding position markings)
//        https://www.faa.gov/air_traffic/publications/atpubs/aim_html/chap3_section_2.html (3-2-4 Class C communications)
//        https://www.faa.gov/air_traffic/publications/atpubs/aim_html/chap4_section_1.html (4-1-9 CTAF, 4-1-15 radar traffic information)
//        https://www.faa.gov/air_traffic/publications/atpubs/aim_html/chap4_section_3.html (TBL 4-3-1 light gun signals)
//        https://www.faa.gov/air_traffic/publications/atpubs/aim_html/chap6_section_2.html (6-2-4 ELT testing)
//        https://www.faa.gov/air_traffic/publications/atpubs/aim_html/chap6_section_3.html (6-3 distress, code 7700)
//        https://www.faa.gov/air_traffic/publications/atpubs/aim_html/chap6_section_4.html (6-4-2 code 7600)
//        https://www.faa.gov/air_traffic/publications/atpubs/aim_html/chap7_section_4.html (7-4 wake turbulence)
//        https://www.faa.gov/air_traffic/publications/atpubs/aim_html/chap8_section_1.html (8-1-1 alcohol)
//   PHAK FAA-H-8083-25C: https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/faa-h-8083-25c.pdf
//        and its MOSAIC addendum (sport pilot changes only, nothing here affected): https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/PHAK_Addendum_(MOSAIC).pdf
//   Airplane Flying Handbook FAA-H-8083-3C: https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/airplane_handbook/03_afh_ch2.pdf (taxiing in wind)
//        .../airplane_handbook/08_afh_ch7.pdf (ground reference maneuvers), .../12_afh_ch11.pdf (night, position lights), .../19_afh_ch18.pdf (emergencies)
//   Aviation Weather Handbook: the current edition is FAA-H-8083-28B (it replaced 28A): https://www.faa.gov/sites/faa.gov/files/FAA-H-8083-28B.pdf
//   Private Pilot Airplane ACS FAA-S-ACS-6C: https://www.faa.gov/training_testing/testing/acs/private_airplane_acs_6.pdf
// Course math conventions (BIBLE.md): pressure altitude = elevation + (29.92 minus setting) x 1,000; ISA = 15°C minus 2°C per 1,000 ft (PHAK ch 4);
// density altitude rule of thumb = PA + 120 x (OAT minus ISA); cloud base = spread ÷ 2.5°C x 1,000 ft (AWH 28B ch 12: 3°C minus 0.5°C per 1,000 ft);
// crosswind = wind x sine of the angle; stall speed rises with the square root of load factor (PHAK ch 5).
(function(){
const D=window.HALCYON_DATA=window.HALCYON_DATA||{};
const C=D.pilot=D.pilot||{};
C.mock=C.mock||[];

C.mock.push({ part:`Preflight`, questions:[

{ q:`A private pilot's most recent flight review was signed off on March 9, 2025. With no other qualifying training or checkride, through what date may the pilot act as pilot in command?`,
  opts:[`March 31, 2027`,
        `March 9, 2027`,
        `March 31, 2026`],
  a:0, why:`14 CFR 61.56(c) counts calendar months: the review must have been done since the beginning of the 24th calendar month before the month you fly. A March 2025 review covers every flight through the end of March 2027, so the last day is March 31, 2027. March 9, 2027 forgets the calendar month rule, and March 31, 2026 confuses the flight review with a 12 month annual inspection.`,
  task:`I.A`, domain:`Preflight` },

{ q:`A pilot who was 42 years old at the exam received a third class medical certificate on September 8, 2025. For private pilot privileges, when does it expire?`,
  opts:[`At the end of September 30, 2030`,
        `On September 8, 2027`,
        `At the end of September 30, 2027`],
  a:2, why:`Under 14 CFR 61.23(d), a third class medical for a pilot age 40 or older on the exam date lasts until the end of the 24th month after the month of the exam: the end of September 2027. The 60 month duration applies only to pilots under 40 at the exam, and medicals always run to the end of the month, not the exam day.`,
  task:`I.A`, domain:`Preflight` },

{ q:`A private pilot takes three friends on a sightseeing flight. Fuel, oil, and the airplane rental total $480. Under 14 CFR 61.113, what is the least the pilot may pay?`,
  opts:[`$120`,
        `$160`,
        `Nothing, if the friends agree to cover it`],
  a:0, why:`61.113(c) says a private pilot may not pay less than the pro rata share of fuel, oil, airport expenses, or rental. Four people are aboard, so $480 ÷ 4 = $120. Splitting $480 three ways ($160 each) leaves the pilot paying nothing, which turns the flight into carrying passengers for hire.`,
  task:`I.A`, domain:`Preflight` },

{ q:`A private pilot made three takeoffs and three touch and go landings in a tricycle gear single engine airplane at midday 40 days ago and has not flown since. Tonight's flight departs 2 hours after sunset with one passenger. Is the pilot current?`,
  opts:[`Yes. Three takeoffs and landings in the preceding 90 days satisfy both the day and the night rule`,
        `No. At night it takes three full stop landings made from 1 hour after sunset to 1 hour before sunrise`,
        `No. Touch and go landings never count toward any kind of passenger carrying currency at all`],
  a:1, why:`61.57(b) requires three takeoffs and three landings to a full stop within the preceding 90 days, made between 1 hour after sunset and 1 hour before sunrise, to carry passengers in that period. The midday touch and goes do satisfy 61.57(a) day currency in a tricycle gear airplane, which is why the "never count" option is wrong; only tailwheel day currency needs full stops.`,
  task:`I.A`, domain:`Preflight` },

{ q:`An airplane is used by a flight school for flight instruction for hire. Its last 100 hour inspection was at 1,452.0 hours. It was flown to a shop and the next inspection was completed at 1,557.5 hours. When is the following 100 hour inspection due?`,
  opts:[`1,657.5 hours`,
        `1,662.0 hours`,
        `1,652.0 hours`],
  a:2, why:`The inspection was due at 1,452.0 + 100 = 1,552.0. 14 CFR 91.409(b) lets you exceed it by up to 10 hours to reach a place where it can be done, but the excess counts toward the next 100 hours. The excess was 1,557.5 minus 1,552.0 = 5.5 hours, so the next one is due at 1,552.0 + 100 = 1,652.0. Counting 100 hours from 1,557.5 quietly gives the airplane 5.5 free hours.`,
  task:`I.B`, domain:`Preflight` },

{ q:`Under 14 CFR 91.207, when must the batteries in a required emergency locator transmitter be replaced or recharged?`,
  opts:[`At every annual inspection, whether or not the ELT was ever used`,
        `After 2 cumulative hours of use, or when their full useful life has expired`,
        `After more than 1 cumulative hour of use, or when 50 percent of their useful life has expired`],
  a:2, why:`91.207(c) sets two triggers: the transmitter has been in use for more than 1 cumulative hour, or 50 percent of the battery's useful life (as set by the manufacturer) has expired. The annual inspection is a separate requirement: 91.207(d) requires the ELT itself to be inspected every 12 calendar months.`,
  task:`I.B`, domain:`Preflight` },

{ q:`A small piston airplane with no Minimum Equipment List has an inoperative landing light. The light is not on the equipment list or kinds of operations list for day VFR, isn't required by 91.205 for day VFR, and no AD requires it. What must happen before a day VFR takeoff?`,
  opts:[`Nothing. Equipment that isn't required for day VFR can simply be left in place as is`,
        `It is removed or deactivated and placarded inoperative, and judged not a hazard`,
        `The owner must get a special flight permit for each flight until it is repaired`],
  a:1, why:`14 CFR 91.213(d) allows the flight, but only if the item is removed (with the control placarded and the work recorded) or deactivated and placarded "Inoperative," and a certificated pilot or mechanic determines it doesn't create a hazard. "Not required" doesn't mean "ignore it." A special flight permit is for an airplane that doesn't meet airworthiness requirements, which this one still does.`,
  task:`I.B`, domain:`Preflight` },

{ q:`Figure: <br><code>METAR KXYZ 141753Z 27014G22KT 4SM -RA BR BKN008 OVC015 12/10 A2996</code><br>What is the ceiling at KXYZ?`,
  opts:[`800 feet AGL`,
        `1,500 feet AGL`,
        `800 feet MSL`],
  a:0, why:`The ceiling is the lowest layer reported as broken or overcast (AWH 28B ch 24). BKN008 is broken at 800 feet, and METAR cloud heights are above ground level, not MSL. The overcast at 1,500 is a higher layer, not the ceiling. An 800 foot ceiling is also below the 1,000 feet that 91.155(c) requires for VFR beneath the ceiling in a surface area.`,
  task:`I.C`, domain:`Preflight` },

{ q:`A TAF contains <code>TEMPO 1421/1424 3SM TSRA BKN020CB</code>. What does the TEMPO group mean?`,
  opts:[`A 30 percent chance of thunderstorms between 2100Z and 2400Z on the 14th`,
        `A lasting change to these conditions starting at 2100Z on the 14th`,
        `Temporary changes, each lasting 1 hour or less, covering under half of 2100Z to 2400Z`],
  a:2, why:`AWH 28B ch 27: TEMPO marks temporary fluctuations that are likely (over 50 percent), last 1 hour or less each time, and in total cover less than half of the stated period. A 30 percent chance would be coded PROB30, and a lasting change would start with FM. Thunderstorms in a TEMPO group are still a reason to plan around that window.`,
  task:`I.C`, domain:`Preflight` },

{ q:`An airport at 3,200 feet MSL reports a temperature of 24°C and a dewpoint of 13°C. What is the approximate base of cumuliform clouds?`,
  opts:[`4,400 feet MSL`,
        `7,600 feet MSL`,
        `5,700 feet MSL`],
  a:1, why:`Rising unsaturated air cools about 3°C per 1,000 feet while its dewpoint drops about 0.5°C, so the spread closes 2.5°C per 1,000 feet (AWH 28B ch 12). Spread = 24 minus 13 = 11°C. 11 ÷ 2.5 = 4.4, so the base is 4,400 feet AGL. Add the field elevation: 4,400 + 3,200 = 7,600 feet MSL. 4,400 MSL forgets the elevation, and 5,700 uses the Fahrenheit divisor (4.4) with Celsius numbers.`,
  task:`I.C`, domain:`Preflight` },

{ q:`Figure: winds and temperatures aloft forecast<br><code>FT 6000 9000 12000 18000</code><br><code>XYZ 2414+08 2526+02 2635-04 7319-21</code><br>What is the forecast at 18,000 feet?`,
  opts:[`230° true at 119 knots, minus 21°C`,
        `230° true at 19 knots, minus 21°C`,
        `230° magnetic at 119 knots, minus 21°C`],
  a:0, why:`A direction code from 51 to 86 means the speed is 100 knots or more: subtract 50 from the direction and add 100 to the speed (AWH 28B). 73 minus 50 = 23, so 230°; 19 + 100 = 119 knots; temperature minus 21°C. Winds aloft directions are referenced to true north, not magnetic, so convert before using them with a magnetic course.`,
  task:`I.C`, domain:`Preflight` },

{ q:`Which event marks the start of the mature stage of a thunderstorm?`,
  opts:[`Strong downdrafts replacing the updrafts throughout the cell`,
        `Precipitation reaching the surface`,
        `A towering cumulus cloud growing on continuous updrafts`],
  a:1, why:`AWH 28B: the storm enters the mature stage when precipitation reaches the surface; falling rain drags air down into a downdraft beside the updraft, and the gust front spreads out ahead of the cell. Continuous updrafts describe the cumulus stage, and downdrafts throughout the cell describe the dissipating stage.`,
  task:`I.C`, domain:`Preflight` },

{ q:`Which conditions are typical of a stable air mass?`,
  opts:[`Stratiform clouds, smooth air, and restricted visibility`,
        `Cumuliform clouds, turbulence, and good visibility`,
        `Showery precipitation, smooth air, and good visibility`],
  a:0, why:`Stable air resists vertical motion, so clouds spread out in layers, the air is smooth, and haze, fog, or drizzle can hang in it and cut visibility (AWH 28B ch 11 links stable air with stratiform clouds, fog, and drizzle). Cumuliform clouds, turbulence, showers, and good visibility describe unstable air.`,
  task:`I.C`, domain:`Preflight` },

{ q:`Day VFR, 186 NM leg, forecast groundspeed 124 knots, fuel burn 8.6 gallons per hour. What is the minimum usable fuel to begin the flight under 14 CFR 91.151?`,
  opts:[`17.2 gallons`,
        `12.9 gallons`,
        `19.4 gallons`],
  a:0, why:`Time en route = 186 ÷ 124 = 1.5 hours. Trip fuel = 1.5 × 8.6 = 12.9 gallons. Day VFR reserve is 30 minutes at normal cruise: 0.5 × 8.6 = 4.3 gallons. Total 12.9 + 4.3 = 17.2 gallons. 12.9 has no reserve at all, and 19.4 uses the 45 minute night reserve.`,
  task:`I.D`, domain:`Preflight` },

{ q:`Night VFR, 175 NM leg, forecast groundspeed 105 knots, fuel burn 9.0 gallons per hour. What is the minimum usable fuel to begin the flight under 14 CFR 91.151?`,
  opts:[`19.5 gallons`,
        `24.0 gallons`,
        `21.8 gallons`],
  a:2, why:`Time = 175 ÷ 105 = 1.667 hours (1 hour 40 minutes). Trip fuel = 1.667 × 9.0 = 15.0 gallons. At night the reserve is 45 minutes: 0.75 × 9.0 = 6.75 gallons. Total 15.0 + 6.75 = 21.75, about 21.8 gallons. 19.5 uses the 30 minute day reserve; 24.0 assumes a full hour, which is a fine personal minimum but not the rule.`,
  task:`I.D`, domain:`Preflight` },

{ q:`True course 128°. The wind triangle gives a wind correction angle of 7° right. Variation is 11° east, and the compass card shows plus 2° deviation for this heading. What compass heading should you fly?`,
  opts:[`148°`,
        `112°`,
        `126°`],
  a:2, why:`Work it in order. True heading = 128 + 7 (right correction is added) = 135°. Magnetic heading = 135 minus 11 (east is least) = 124°. Compass heading = 124 + 2 = 126°. 148° adds the east variation instead of subtracting it, and 112° applies the wind correction the wrong way.`,
  task:`I.D`, domain:`Preflight` },

{ q:`You plan to cruise VFR more than 3,000 feet AGL on a true course of 185°. Magnetic variation is 12° east. Which cruising altitude complies with 14 CFR 91.159?`,
  opts:[`6,500 feet MSL`,
        `7,500 feet MSL`,
        `7,000 feet MSL`],
  a:1, why:`91.159 uses magnetic course. 185 minus 12 (east is least) = 173° magnetic, which falls in 0 to 179°, so fly an odd thousand plus 500, such as 7,500. 6,500 comes from using the true course of 185°, and 7,000 drops the extra 500 feet that VFR altitudes require.`,
  task:`I.D`, domain:`Preflight` },

{ q:`You're flying VFR at 6,500 feet MSL in Class E airspace, about 4,000 feet above the terrain. What are the minimum flight visibility and cloud clearance?`,
  opts:[`1 statute mile; 500 below, 1,000 above, 2,000 horizontal`,
        `3 statute miles; 500 below, 1,000 above, 2,000 horizontal`,
        `5 statute miles; 1,000 below, 1,000 above, 1 statute mile horizontal`],
  a:1, why:`14 CFR 91.155: Class E below 10,000 feet MSL requires 3 statute miles and 500 feet below, 1,000 feet above, 2,000 feet horizontal from clouds. The 1 mile version is Class G in the day above 1,200 AGL, and the 5 mile version applies at or above 10,000 feet MSL.`,
  task:`I.E`, domain:`Preflight` },

{ q:`During the day you're flying an airplane at 900 feet AGL in Class G airspace. What are the VFR weather minimums?`,
  opts:[`1 statute mile visibility and clear of clouds`,
        `3 statute miles visibility and clear of clouds`,
        `1 statute mile; 500 below, 1,000 above, 2,000 horizontal`],
  a:0, why:`14 CFR 91.155: in Class G at 1,200 feet or less above the surface, an airplane in the day needs 1 statute mile and clear of clouds. 3 miles and clear of clouds is the Class B rule, and 1 mile with 500/1,000/2,000 applies in Class G above 1,200 AGL in the day. Legal isn't the same as smart; 1 mile near the ground is very little room.`,
  task:`I.E`, domain:`Preflight` },

{ q:`What do you need before entering Class B airspace under VFR?`,
  opts:[`Two way radio contact in which the controller uses your call sign`,
        `A clearance from ATC to enter the Class B airspace`,
        `Only a Mode C transponder and ADS-B Out, since VFR traffic is not separated`],
  a:1, why:`14 CFR 91.131(a)(1) requires an ATC clearance before operating in Class B. Hearing your call sign is enough for Class C and D, not Class B; if the controller doesn't say "cleared into the Class B," stay out. The transponder and ADS-B Out are required too, but equipment alone never admits you.`,
  task:`I.E`, domain:`Preflight` },

{ q:`Within what area around a primary Class B airport does 14 CFR 91.215 require an altitude encoding transponder (the Mode C veil)?`,
  opts:[`Within 30 NM, from the surface to 10,000 feet MSL`,
        `Within 20 NM, from the surface to 10,000 feet MSL`,
        `Within 30 NM, from the surface to the top of the Class B`],
  a:0, why:`91.215(b)(2) covers all airspace within 30 nautical miles of the listed airports from the surface up to 10,000 feet MSL. 20 NM is the usual Class C outer area, not the veil. The veil's ceiling is 10,000 feet MSL, not the top of the Class B.`,
  task:`I.E`, domain:`Preflight` },

{ q:`Approaching Class C airspace, you call the approach controller. The reply is "Aircraft calling Millbrook Approach, stand by." What should you do?`,
  opts:[`Remain outside the Class C until the controller answers using your call sign`,
        `Enter the Class C, since the controller has answered your call`,
        `Enter the Class C, but stay below 2,500 feet AGL until called back`],
  a:0, why:`AIM 3-2-4: if the controller responds without using your aircraft identification, two way communication has not been established and you may not enter (14 CFR 91.130(c)). An answer without your call sign could have been meant for anyone. There's no altitude exception that lets you in early.`,
  task:`I.E`, domain:`Preflight` },

{ q:`Field elevation 4,300 feet, altimeter setting 30.12, temperature 32°C. What is the approximate density altitude?`,
  opts:[`About 7,600 feet`,
        `About 7,100 feet`,
        `About 4,100 feet`],
  a:1, why:`Pressure altitude = 4,300 + (29.92 minus 30.12) × 1,000 = 4,300 minus 200 = 4,100 feet. Standard temperature at 4,100 feet = 15 minus (2 × 4.1) = 6.8°C. Density altitude ≈ 4,100 + 120 × (32 minus 6.8) = 4,100 + 120 × 25.2 = 4,100 + 3,024 ≈ 7,100 feet. 7,600 comes from adding the 200 foot correction instead of subtracting it, and 4,100 is only the pressure altitude.`,
  task:`I.F`, domain:`Preflight` },

{ q:`Field elevation 1,380 feet, altimeter setting 29.68. What is the pressure altitude?`,
  opts:[`1,140 feet`,
        `1,380 feet`,
        `1,620 feet`],
  a:2, why:`Pressure altitude = elevation + (29.92 minus setting) × 1,000 = 1,380 + (0.24 × 1,000) = 1,380 + 240 = 1,620 feet. Lower than standard pressure means a higher pressure altitude. 1,140 subtracts the correction, and 1,380 ignores it.`,
  task:`I.F`, domain:`Preflight` },

{ q:`Figure: loading worksheet<br><code>Basic empty: 1,480 lb, moment 57,720</code><br><code>Front seats: 340 lb, arm 37.0</code><br><code>Rear seat: 150 lb, arm 73.0</code><br><code>Fuel: 40 gal at 6 lb/gal, arm 48.0</code><br><code>Baggage: 30 lb, arm 95.0</code><br>Where is the center of gravity?`,
  opts:[`42.0 inches aft of datum`,
        `47.8 inches aft of datum`,
        `42.7 inches aft of datum`],
  a:2, why:`Moments: front seats 340 × 37.0 = 12,580; rear 150 × 73.0 = 10,950; fuel 240 × 48.0 = 11,520; baggage 30 × 95.0 = 2,850. Total weight = 1,480 + 340 + 150 + 240 + 30 = 2,240 lb. Total moment = 57,720 + 12,580 + 10,950 + 11,520 + 2,850 = 95,620. CG = 95,620 ÷ 2,240 = 42.7 inches. Leaving out the baggage gives 42.0, and dividing by the weight without fuel (2,000 lb) gives 47.8.`,
  task:`I.F`, domain:`Preflight` },

{ q:`An airplane weighs 2,200 lb with the CG at 42.0 inches. If 60 lb of baggage is moved from the arm at 70 inches to the arm at 100 inches, where is the new CG?`,
  opts:[`44.7 inches`,
        `42.8 inches`,
        `41.2 inches`],
  a:1, why:`Total weight doesn't change. Change in CG = weight moved × distance moved ÷ total weight = 60 × 30 ÷ 2,200 = 0.8 inch. Moving weight aft moves the CG aft: 42.0 + 0.8 = 42.8 inches. 41.2 moves it the wrong way, and 44.7 uses the 100 inch arm instead of the 30 inch distance.`,
  task:`I.F`, domain:`Preflight` },

{ q:`Figure: takeoff distance at 2,300 lb, flaps up, paved dry runway<br><code>PA 4,000 ft, 20°C: ground roll 1,150 ft, total over 50 ft obstacle 2,050 ft</code><br><code>PA 4,000 ft, 30°C: ground roll 1,250 ft, total 2,240 ft</code><br><code>PA 6,000 ft, 20°C: ground roll 1,370 ft, total 2,480 ft</code><br><code>PA 6,000 ft, 30°C: ground roll 1,490 ft, total 2,730 ft</code><br><code>Note: decrease distances 10 percent for each 9 knots of headwind</code><br>At a pressure altitude of 6,000 feet, 30°C, with a 9 knot headwind, what distance is needed to clear a 50 foot obstacle?`,
  opts:[`2,457 feet`,
        `1,341 feet`,
        `2,730 feet`],
  a:0, why:`Read the row for 6,000 feet and 30°C: total distance over a 50 foot obstacle is 2,730 feet. A 9 knot headwind takes off 10 percent: 2,730 × 0.90 = 2,457 feet. 1,341 is the corrected ground roll (1,490 × 0.90), which won't clear anything, and 2,730 skips the wind correction. Many pilots add a safety margin on top of the chart number.`,
  task:`I.F`, domain:`Preflight` },

{ q:`What is the effect of loading an airplane with the CG aft of its aft limit?`,
  opts:[`It becomes less stable and may be hard or impossible to recover from a stall or spin`,
        `It becomes more stable but has a higher stall speed and slower cruise`,
        `It needs more back pressure to flare, so the nose wheel may touch first`],
  a:0, why:`PHAK ch 5: with the CG far aft the airplane is less stable, and in a spin the tail can be pulled out away from the spin axis so the nose can't be lowered to recover. A higher stall speed, slower cruise, and heavy back pressure in the flare are forward CG effects. An aft CG out of limits isn't a performance issue; it can kill.`,
  task:`I.F`, domain:`Preflight` },

{ q:`In an airplane with a fixed pitch propeller, what is usually the first indication of carburetor ice?`,
  opts:[`A rise in RPM followed by engine roughness`,
        `A rise in oil temperature with steady RPM`,
        `A loss of RPM, which may be followed by roughness`],
  a:2, why:`PHAK ch 7: with a fixed pitch propeller, carburetor ice first shows as a decrease in RPM, which may be followed by roughness. When you apply carburetor heat, RPM usually drops a bit more and then rises as the ice melts; the RPM rise comes after the fix, not as the warning. Ice can form in temperatures from about 20°F to as high as 100°F when humidity is high.`,
  task:`I.G`, domain:`Preflight` },

{ q:`The static port becomes blocked, but the pitot tube stays clear. How will the airspeed indicator read as you climb?`,
  opts:[`Lower than the actual airspeed`,
        `Higher than the actual airspeed`,
        `Normally, since only the pitot tube feeds it`],
  a:0, why:`PHAK ch 8: the trapped static pressure stays at the value where the port blocked. As you climb, pitot pressure falls but the static side doesn't, so the indicator shows less than actual. It reads high in a descent. The indicator needs both pitot and static pressure, so a blocked static port does affect it, along with the altimeter and VSI.`,
  task:`I.G`, domain:`Preflight` },

{ q:`You depart with the altimeter set to 30.15. En route the local setting is 29.85, but you don't reset it. The altimeter reads 4,500 feet. What is your approximate true altitude?`,
  opts:[`4,800 feet`,
        `4,500 feet`,
        `4,200 feet`],
  a:2, why:`The setting is off by 30.15 minus 29.85 = 0.30 inches. At about 1,000 feet per inch, the error is 0.30 × 1,000 = 300 feet (PHAK ch 8). When the actual pressure is lower than the setting in the window, you are lower than indicated: 4,500 minus 300 = 4,200 feet. "High to low, look out below."`,
  task:`I.G`, domain:`Preflight` },

{ q:`A cabin heater with a cracked exhaust muff leaks carbon monoxide into the cabin. Which type of hypoxia results?`,
  opts:[`Hypemic hypoxia`,
        `Hypoxic hypoxia`,
        `Histotoxic hypoxia`],
  a:0, why:`PHAK ch 17: hypemic hypoxia means the blood can't carry enough oxygen, and carbon monoxide poisoning is its most common form because CO binds to hemoglobin in place of oxygen. Hypoxic hypoxia is too little oxygen reaching the lungs, as at altitude. Histotoxic hypoxia is the cells being unable to use oxygen, as with alcohol or some drugs. Suspect CO: heat off, fresh air on, land.`,
  task:`I.H`, domain:`Preflight` },

{ q:`A pilot thinks, "Accidents happen to other pilots, not to me." Which antidote fits this hazardous attitude?`,
  opts:[`"Follow the rules. They are usually right."`,
        `"It could happen to me. Taking chances is foolish."`,
        `"Not so fast. Think first."`],
  a:1, why:`PHAK ch 2: this is invulnerability, and its antidote is "It could happen to me. Taking chances is foolish." "Follow the rules" answers anti authority, and "Not so fast" answers impulsivity.`,
  task:`I.H`, domain:`Preflight` },

{ q:`A pilot finishes a beer at 2330. Assuming the pilot isn't under the influence and has an alcohol concentration below 0.04, what is the earliest time 14 CFR 91.17 allows the pilot to act as a crewmember?`,
  opts:[`0530`,
        `0730`,
        `1130`],
  a:1, why:`91.17(a) bars acting as a crewmember within 8 hours after drinking alcohol, while under the influence, or at 0.04 or more. 2330 + 8 hours = 0730. 0530 is only 6 hours. 1130 fits the AIM's advice (8-1-1) to allow at least 12 to 24 hours between bottle and throttle, which is good practice, but it isn't the regulation. Alcohol can still affect you after 8 hours.`,
  task:`I.H`, domain:`Preflight` },

{ q:`An unpressurized airplane cruises at a cabin pressure altitude of 13,000 feet MSL for 45 minutes. Under 14 CFR 91.211, how long must the required flight crew use supplemental oxygen?`,
  opts:[`The full 45 minutes at that altitude`,
        `No time at all, since the airplane stays below 14,000 feet`,
        `The 15 minutes beyond the first 30 minutes`],
  a:2, why:`91.211(a)(1): above 12,500 up to and including 14,000 feet MSL, the required crew must use oxygen for the part of the flight at those altitudes that lasts more than 30 minutes. 45 minus 30 = 15 minutes. Oxygen for the whole time applies above 14,000 feet, and every occupant must be provided with oxygen above 15,000 feet. Night vision can start to fade as low as 5,000 feet (AIM 8-1-2).`,
  task:`I.H`, domain:`Preflight` },

{ q:`You're taxiing a tricycle gear airplane with a strong quartering tailwind from the left rear. How should you hold the controls?`,
  opts:[`Yoke turned left and held back`,
        `Yoke turned right and held forward`,
        `Yoke turned left and held forward`],
  a:1, why:`AFH ch 2: with a quartering tailwind, hold the elevator down and the upwind aileron down ("dive away from the wind"). The wind is from the left, so the left aileron goes down, which means turning the yoke right; elevator down means yoke forward. Turning the yoke into the wind is the quartering headwind technique (upwind aileron up); with the wind from behind, it lets the wind get under the left wing, and holding the yoke back lets it lift the tail.`,
  task:`II`, domain:`Preflight` }

]});

C.mock.push({ part:`Airport and flight`, questions:[

{ q:`While on downwind at a towered airport with a failed radio, you see a flashing green light from the tower. What does it mean?`,
  opts:[`Cleared to land on the runway in use`,
        `Return for landing; a steady green will follow`,
        `Give way to other aircraft and continue circling`],
  a:1, why:`AIM TBL 4-3-1: for an aircraft in flight, flashing green means return for landing, to be followed by steady green at the proper time. Steady green is cleared to land, and steady red is give way and continue circling. In flight, acknowledge in daylight by rocking your wings, and at night by blinking the landing or navigation lights.`,
  task:`III.A`, domain:`Airport and flight` },

{ q:`Taxiing toward a runway, you reach four yellow lines across the taxiway, two solid and two dashed, with the solid lines on your side. You have no clearance onto the runway. What must you do?`,
  opts:[`Continue, since you only stop when the dashed lines are on your side`,
        `Stop only if a red and white runway sign is also posted there`,
        `Stop so that no part of the airplane crosses the solid lines`],
  a:2, why:`AIM 2-3: runway holding position markings are four yellow lines, and the solid lines are always on the side where you must hold. Without a clearance, stop before them with no part of the airplane past them. The dashed side is the side you cross when leaving the runway. The red sign often stands beside the markings, but the markings require the stop on their own.`,
  task:`III.A`, domain:`Airport and flight` },

{ q:`Which of these requires immediate notification of the NTSB under 49 CFR 830.5?`,
  opts:[`A flat tire found after landing, with no other damage`,
        `An in flight fire`,
        `A precautionary landing at another airport to wait out weather`],
  a:1, why:`830.5(a)(4) lists an in flight fire as a serious incident that requires immediate notification, as does any accident with serious injury or substantial damage. A flat tire alone isn't substantial damage, and a precautionary landing with nothing damaged isn't an accident or a listed incident. After an accident the written report is due within 10 days (830.15).`,
  task:`III.A`, domain:`Airport and flight` },

{ q:`An airplane and a glider are converging at about the same altitude, and the airplane is to the glider's right. Which has the right of way?`,
  opts:[`The glider, because a glider has the right of way over powered aircraft`,
        `The airplane, because it is to the other aircraft's right`,
        `Whichever is lower, as long as neither is on final approach`],
  a:0, why:`14 CFR 91.113(d): the aircraft on the right has the right of way only when both are the same category. With different categories, a glider has the right of way over powered aircraft. The lower aircraft rule in 91.113(g) applies to aircraft approaching an airport to land. Right of way never replaces see and avoid.`,
  task:`III.B`, domain:`Airport and flight` },

{ q:`You're landing on the same runway behind a large airplane that just landed. How do you avoid its wake turbulence?`,
  opts:[`Stay at or above its approach path and land beyond its touchdown point`,
        `Fly slightly below its approach path and land before its touchdown point`,
        `Land well before its touchdown point, since vortices form only after touchdown`],
  a:0, why:`AIM 7-4: vortices form from rotation to touchdown and sink, so stay at or above the larger airplane's final approach path, note its touchdown point, and land beyond it. Landing before the rotation point is the technique for landing behind a departing airplane. Flying below the path puts you where the vortices sink.`,
  task:`III.B`, domain:`Airport and flight` },

{ q:`You're approaching to land at an airport without an operating control tower in Class G airspace. No light signals or markings call for right traffic. How must you turn?`,
  opts:[`In whichever direction gives the shortest pattern for the wind`,
        `Make all turns to the left`,
        `Make right turns when the wind favors the right side`],
  a:1, why:`14 CFR 91.126(b)(1): a fixed wing airplane approaching to land must make all turns to the left unless approved light signals or visual markings indicate right turns. Wind decides the runway, not the pattern direction. Self announce on the CTAF starting about 10 miles out (AIM 4-1-9).`,
  task:`III.B`, domain:`Airport and flight` },

{ q:`Runway 17 is in use. The wind is from 220° at 20 knots. What is the crosswind component?`,
  opts:[`About 13 knots`,
        `About 10 knots`,
        `About 15 knots`],
  a:2, why:`Runway 17 points 170°. Angle between wind and runway = 220 minus 170 = 50°. Crosswind = 20 × sin 50° = 20 × 0.766 ≈ 15 knots. About 13 knots is the headwind component (20 × cos 50° = 12.9). About 10 knots treats 50° like 30°, where the crosswind is half the wind.`,
  task:`IV`, domain:`Airport and flight` },

{ q:`Runway 28 is in use. The wind is from 310° at 18 knots, gusting to 26. Using the gust value, what crosswind should you plan for?`,
  opts:[`9 knots`,
        `23 knots`,
        `13 knots`],
  a:2, why:`Runway 28 points 280°, so the wind is 310 minus 280 = 30° off the runway. sin 30° = 0.5. Using the gust: 26 × 0.5 = 13 knots. 9 knots uses the steady wind only (18 × 0.5), and 23 knots is the gust headwind component (26 × cos 30° ≈ 22.5). Compare 13 knots with the airplane's demonstrated crosswind and your own limits.`,
  task:`IV`, domain:`Airport and flight` },

{ q:`On a heavy, hot day an airplane lifts off below its recommended speed thanks to ground effect. What can happen as it climbs out of ground effect?`,
  opts:[`It may settle back or climb very poorly because induced drag increases`,
        `It pitches up sharply because the wing makes more lift outside ground effect`,
        `It gains speed quickly because drag drops once it leaves the ground`],
  a:0, why:`PHAK ch 5: ground effect reduces induced drag, so the airplane may seem able to fly below the recommended speed. As it rises out of ground effect with too little speed, induced drag goes back up and climb performance can be marginal; the airplane can settle back to the runway or stall. Drag increases, not decreases, on leaving ground effect.`,
  task:`IV`, domain:`Airport and flight` },

{ q:`During a turn around a point with a steady wind, where should the bank be steepest?`,
  opts:[`When headed directly upwind`,
        `When headed directly downwind`,
        `When the wind is directly off a wingtip`],
  a:1, why:`AFH ch 7: groundspeed is highest when headed downwind, so the bank must be steepest there to hold a constant radius, and you then shallow the bank until it is shallowest headed directly upwind. That's why ground reference maneuvers are entered downwind. Keep the bank at or below 45° because stall speed rises in steeper banks.`,
  task:`V`, domain:`Airport and flight` },

{ q:`An airplane stalls at 50 knots in level flight. About what is its stall speed in a level, coordinated 60° banked turn?`,
  opts:[`71 knots`,
        `50 knots`,
        `100 knots`],
  a:0, why:`PHAK ch 5: a level 60° banked turn produces a load factor of 2 G, and stall speed rises with the square root of the load factor. √2 ≈ 1.41, so 50 × 1.41 ≈ 71 knots. 100 knots doubles the speed instead of using the square root, and 50 knots forgets that load factor changes stall speed at all.`,
  task:`VII`, domain:`Airport and flight` },

{ q:`Which statement about stalls is true?`,
  opts:[`A wing stalls only when the airspeed is below the published stall speed`,
        `A wing stalls at its critical angle of attack, at any airspeed or attitude`,
        `A wing stalls only when the nose is raised too far above the horizon`],
  a:1, why:`PHAK ch 5: any airplane, within the limits of its structure, can be stalled at any airspeed. The stall happens when the critical angle of attack is exceeded, which can happen in a steep turn, a pull up, or a nose low attitude. The published stall speed applies only to the stated weight, configuration, and 1 G flight.`,
  task:`VII`, domain:`Airport and flight` }

]});

C.mock.push({ part:`Navigation and emergencies`, questions:[

{ q:`Your plan uses a true airspeed of 105 knots. You pass checkpoint A at 1342 and checkpoint B, 18 NM farther, at 1351. Your destination is 54 NM beyond checkpoint B. What is your ETA?`,
  opts:[`1422`,
        `1418`,
        `1445`],
  a:1, why:`Use the groundspeed you actually measured. 18 NM in 9 minutes = 2 NM per minute = 120 knots. 54 NM ÷ 2 NM per minute = 27 minutes. 1351 + 27 minutes = 1418. 1422 uses the planned 105 knots, which isn't what the airplane is doing over the ground, and 1445 assumes 1 NM per minute.`,
  task:`VI`, domain:`Navigation and emergencies` },

{ q:`You divert to an alternate 38 NM away. Groundspeed is 95 knots and fuel burn is 9.0 gallons per hour. About how long will it take, and how much fuel will it use?`,
  opts:[`40 minutes and 6.0 gallons`,
        `38 minutes and 5.7 gallons`,
        `24 minutes and 3.6 gallons`],
  a:2, why:`Time = 38 ÷ 95 = 0.4 hour. 0.4 hour × 60 = 24 minutes. Fuel = 0.4 × 9.0 = 3.6 gallons. 40 minutes reads 0.4 hour as 40 minutes, and 38 minutes assumes 1 NM per minute. Check that 3.6 gallons still leaves your reserve.`,
  task:`VI`, domain:`Navigation and emergencies` },

{ q:`You tune and identify a VOR. With the OBS set to 030°, the CDI is centered with a TO indication. Where are you?`,
  opts:[`On the 030° radial, northeast of the station`,
        `On the 210° radial, northeast of the station`,
        `On the 210° radial, southwest of the station`],
  a:2, why:`PHAK ch 16: a centered needle with TO means flying 030° takes you to the station, so the station lies northeast of you and you're southwest of it. Radials are named going outbound from the station, so you're on the 210° radial (030 + 180). With a FROM flag, the same setting would put you on the 030° radial, northeast.`,
  task:`VI`, domain:`Navigation and emergencies` },

{ q:`You're lost and can't see a town or other landmark. According to the PHAK, what is the first thing to do?`,
  opts:[`Climb, if traffic and weather allow, for better radio and radar coverage`,
        `Descend so you can read the town names painted on water towers`,
        `Hold your heading and wait for a recognizable landmark to appear`],
  a:0, why:`PHAK ch 16, lost procedures: if no town is in sight, first climb, staying mindful of traffic and weather, because altitude increases radio and navigation reception and radar coverage. Then communicate, using frequencies on the sectional chart, and ATC can give vectors. Descending cuts reception and terrain margin, and waiting burns fuel.`,
  task:`VI`, domain:`Navigation and emergencies` },

{ q:`You're VFR and receiving radar traffic advisories (flight following) from approach control. Who is responsible for seeing and avoiding other aircraft?`,
  opts:[`The pilot, since the controller gives advisories only as workload allows`,
        `The controller, as long as you remain on the frequency`,
        `The controller in controlled airspace, and the pilot in Class G airspace`],
  a:0, why:`AIM 4-1-15: radar traffic information isn't meant to relieve the pilot of the responsibility to see and avoid other aircraft, and controllers may be unable to provide it because of workload, radar limits, or frequency congestion. Not every airplane shows up on radar, either. Flight following is still worth having; it just isn't separation.`,
  task:`VI`, domain:`Navigation and emergencies` },

{ q:`In the northern hemisphere you accelerate while flying on a heading of east. What does the magnetic compass show?`,
  opts:[`A turn toward the south`,
        `No error, since acceleration error happens only on north and south headings`,
        `A turn toward the north`],
  a:2, why:`PHAK ch 8: acceleration error appears on east and west headings. Accelerating shows a turn toward north, and decelerating shows a turn toward south (ANDS: accelerate north, decelerate south). North and south headings are where turning errors are largest, not acceleration errors.`,
  task:`VI`, domain:`Navigation and emergencies` },

{ q:`You're in a distress situation and not in contact with ATC. What transponder code should you set?`,
  opts:[`7700`,
        `7500`,
        `7600`],
  a:0, why:`AIM 6-3: if you can't immediately reach a facility, squawk 7700 (emergency) with Mode C. 7600 is for two way radio communication failure (AIM 6-4-2), and 7500 is the hijack code (AIM 4-1-20). When changing codes routinely, avoid passing through these three.`,
  task:`IX`, domain:`Navigation and emergencies` },

{ q:`The engine fails at about 400 feet AGL after takeoff, and it won't restart. Which action usually carries the lowest risk?`,
  opts:[`Turn back to the departure runway right away, before speed decays`,
        `Hold the climb attitude while you run the restart checklist`,
        `Lower the nose to a glide and land about straight ahead`],
  a:2, why:`AFH ch 18: first lower the nose and set the glide attitude. Continuing straight ahead or turning slightly lets you land under control and as slowly as possible, which usually is the lowest risk choice. A turn back uses far more altitude than most pilots expect and risks a stall at low altitude. Holding the climb attitude with no power leads straight to a stall.`,
  task:`IX`, domain:`Navigation and emergencies` },

{ q:`When does the AIM say an operational test of an analog 121.5 MHz ELT should be done in the aircraft?`,
  opts:[`Any time, as long as the test lasts less than a minute`,
        `During the first 5 minutes after any hour, for no more than three audible sweeps`,
        `Only in flight, so that search satellites can confirm the signal`],
  a:1, why:`AIM 6-2-4: analog 121.5/243 MHz ELTs should be tested only during the first 5 minutes after any hour, for no longer than three audible sweeps, or coordinated with the nearest control tower if done at another time. Airborne tests are not authorized. Testing at random times can set off a false alert.`,
  task:`IX`, domain:`Navigation and emergencies` },

{ q:`In flight you smell burning insulation and can't find the faulty circuit. What does the Airplane Flying Handbook recommend?`,
  opts:[`Turn on each avionics switch in turn to find which one is failing`,
        `Open the fresh air vents and continue the flight, since the smell should clear`,
        `Master and alternator off if conditions permit, then land as soon as possible`],
  a:2, why:`AFH ch 18: the odor of burning insulation is usually the first sign of an electrical fire. If you can't readily find and isolate the circuit, turn off the battery master and alternator switches if flight conditions permit, and land as soon as possible. Turning switches back on recreates the problem, and ignoring the smell lets the fire grow.`,
  task:`IX`, domain:`Navigation and emergencies` },

{ q:`At night, how should you look at a dim object to see it best?`,
  opts:[`Stare straight at it, since the center of the eye works best in the dark`,
        `Look about 10° above, below, or to one side of it`,
        `Look about 45° to one side and catch it in your side vision`],
  a:1, why:`PHAK ch 17: off center viewing means looking about 10° above, below, or to either side of the object. In low light the cones at the center of the eye don't work well, so staring straight at a dim object can make it disappear. 45° is too far off to see much detail.`,
  task:`XI`, domain:`Navigation and emergencies` },

{ q:`At night you see another airplane ahead at your altitude. You can see only its steady green position light and its flashing beacon. Which way is it moving?`,
  opts:[`It is coming toward you head on`,
        `It is flying away from you`,
        `It is crossing from your left to your right`],
  a:2, why:`AFH ch 11: the red light is on the left wingtip, green on the right wingtip, and white on the tail. Seeing only green means you're looking at its right side, so it's crossing from your left to your right. Head on you'd see both red and green, and flying away you'd see the white tail light.`,
  task:`XI`, domain:`Navigation and emergencies` }

]});
})();
