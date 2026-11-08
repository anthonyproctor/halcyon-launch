// AFOQT course "Commission": Practice Test 2, part B, subtest 6 of 6: Aviation Information (20 items, 8 minutes). Written 2026-11-07.
// Form "M22:" (see courses/lsat/mock/lr1.js for how forms work). Part B is M17 Situational Judgment, M18 Physical Science, M19 Table Reading, M20 Instrument Comprehension, M21 Block Counting, M22 Aviation Information.
// Aerodynamics 6 (dihedral, parasite drag, wake turbulence, CG, left turning tendency, frost), controls 2 (stabilator, spoilers), instruments 4
// (attitude gyro, standard pressure, white arc, absolute altitude), airfield and ATC 5 (runway centerline lights, closed runway, location sign,
// light gun, lost radio code), helicopters 2 (collective, tail rotor), engine 1 (mixture). Facts follow the FAA Pilot's Handbook of
// Aeronautical Knowledge, the Helicopter Flying Handbook and the Aeronautical Information Manual, paraphrased; no text copied. No topic repeats Test 1.
// Tasks: AI 20. Keys by slot: 4/4/4/4/4.
// Original items written for Halcyon, not taken from the AFOQT information pamphlet, any official sample or any prep book, and none closely
// repeats a chapter quiz item, a chapter decision or a Practice Test 1 item (checked 2026-11-07 against ch01 to ch04 and t1_*.js). Halcyon isn't
// affiliated with or endorsed by the Department of the Air Force, AFPC or Pearson. Five choices; the engine shuffles them on display, so no explanation
// names a letter. Ids are the part prefix plus the array index: never reorder items.
(function(){
const D=window.HALCYON_DATA=window.HALCYON_DATA||{};
const C=D.afoqt=D.afoqt||{};
C.mock=C.mock||[];

C.mock.push({ part:`M22: Aviation Information`, formName:`Test 2: Aviation Information`,
questions:[

{ q:`Wing dihedral, with the wingtips set higher than the wing roots, mainly gives an airplane`,
  opts:[`stability in roll`,
        `a lower stall speed with the flaps down`,
        `better directional control while taxiing`,
        `more lift at low airspeeds`,
        `less drag in a climb`],
  a:0, why:`PHAK, Aerodynamics of Flight. Dihedral = roll stability. Wing drops, airplane slips toward it, low wing meets the air at a higher angle and comes back up.`,
  task:`AI`, domain:`Science and Aviation` },

{ q:`As an airplane's airspeed increases in level flight, parasite drag`,
  opts:[`stays the same`,
        `drops to zero`,
        `turns into induced drag`,
        `decreases`,
        `increases`],
  a:4, why:`PHAK, Aerodynamics of Flight. Parasite drag (form, friction, interference) grows with the square of airspeed. Induced drag does the opposite: highest when slow, at high angle of attack.`,
  task:`AI`, domain:`Science and Aviation` },

{ q:`Wake turbulence from an aircraft is strongest when that aircraft is`,
  opts:[`light, clean and fast`,
        `heavy, clean and slow`,
        `heavy, gear down and fast`,
        `climbing at full power and fast`,
        `light, flaps down and slow`],
  a:1, why:`AIM chapter 7, wake turbulence. Vortex strength goes with weight and angle of attack, so heavy, clean (gear and flaps up) and slow is the worst case. Weight is the big factor.`,
  task:`AI`, domain:`Science and Aviation` },

{ q:`Some airplanes have a stabilator in place of a fixed horizontal stabilizer and an elevator. A stabilator is`,
  opts:[`a small tab that trims out pressure on the elevator`,
        `a fixed fin on top of the tail that keeps the nose straight`,
        `a hinged panel on the wing's leading edge that delays a stall`,
        `a winglet that cuts drag at the wingtip`,
        `a one piece horizontal tail that pivots to control pitch`],
  a:4, why:`PHAK, Flight Controls. Stabilator = the whole horizontal tail pivoting on one hinge, doing the elevator's job: pitch. It's very sensitive, so it carries an antiservo tab for feel. The fin is the vertical stabilizer (yaw stability); the leading edge panel is a slat.`,
  task:`AI`, domain:`Science and Aviation` },

{ q:`On a large airplane's wing, spoilers are raised to`,
  opts:[`control yaw on the runway`,
        `lower the stall speed for landing`,
        `trim out control pressure`,
        `reduce lift and increase drag`,
        `increase lift, camber and climb rate for takeoff`],
  a:3, why:`PHAK, Flight Controls. Spoilers break up the airflow on top of the wing: less lift, more drag. Used to descend without speeding up, to help roll, and to put weight on the wheels after touchdown.`,
  task:`AI`, domain:`Science and Aviation` },

{ q:`An airplane loaded with its center of gravity behind the aft limit will`,
  opts:[`stall at a higher airspeed than normal`,
        `need extra nose up trim to land`,
        `burn its fuel faster in cruise`,
        `be less stable and harder to recover from a stall`,
        `be more stable, with a heavier nose, and harder to rotate`],
  a:3, why:`PHAK, Weight and Balance. Aft CG: the tail has less leverage to bring the nose down, so pitch gets touchy and stall or spin recovery can become impossible. A forward CG is the heavy nose, higher stall speed case.`,
  task:`AI`, domain:`Science and Aviation` },

{ q:`The attitude indicator works because a spinning gyroscope`,
  opts:[`keeps its orientation in space`,
        `measures the airflow over the wing`,
        `senses the rate of a turn only`,
        `responds to changes in air pressure`,
        `points to magnetic north`],
  a:0, why:`PHAK, Flight Instruments. Rigidity in space: a spinning gyro holds its plane of rotation while the airplane moves around it, so the horizon card stays put. Turn rate is the turn coordinator's job; magnetic north is the compass's.`,
  task:`AI`, domain:`Science and Aviation` },

{ q:`In the standard atmosphere at sea level, the pressure is`,
  opts:[`29.92 inches of mercury`,
        `30.92 inches of mercury`,
        `14.7 inches of mercury`,
        `59 inches of mercury`,
        `1,000 inches of mercury`],
  a:0, why:`PHAK, Weather Theory. Standard sea level: 29.92 inHg (1013.2 hPa) and 15 °C (59 °F). 14.7 is pounds per square inch, the same pressure in different units.`,
  task:`AI`, domain:`Science and Aviation` },

{ q:`On the airspeed indicator, the white arc marks`,
  opts:[`the best glide speed`,
        `the caution range for smooth air only`,
        `the never exceed speed`,
        `the flap operating range`,
        `the normal operating range`],
  a:3, why:`PHAK, Flight Instruments. White arc: full flap stall speed at the bottom, maximum flap extended speed at the top. Green is normal operation; yellow is smooth air only; the red line is never exceed.`,
  task:`AI`, domain:`Science and Aviation` },

{ q:`Rolling out after a night landing, the pilot sees the runway centerline lights change from all white to red and white. About how much runway is left?`,
  opts:[`about 500 ft`,
        `about 1,000 ft`,
        `about 2,000 ft`,
        `about 4,000 ft`,
        `about 3,000 ft`],
  a:4, why:`AIM chapter 2, airport lighting. Centerline lights are white until 3,000 ft remain, then alternate red and white for 2,000 ft, then go all red for the last 1,000 ft. Red and white = 3,000 ft left; all red = 1,000 ft.`,
  task:`AI`, domain:`Science and Aviation` },

{ q:`A large yellow X painted on a runway means the runway is`,
  opts:[`a displaced threshold`,
        `a parallel taxiway`,
        `closed`,
        `for takeoffs only`,
        `for helicopters only`],
  a:2, why:`AIM chapter 2, airport markings. A yellow X on a runway or taxiway marks it closed. Displaced thresholds use white arrows, and helipads have their own H.`,
  task:`AI`, domain:`Science and Aviation` },

{ q:`An airport sign with a black background and a yellow letter or number tells a pilot`,
  opts:[`where to stop and hold short of a runway`,
        `the taxiway or runway they're on`,
        `how much runway is left`,
        `where the fuel pumps are`,
        `which way to turn to reach a taxiway`],
  a:1, why:`AIM chapter 2, airport signs. Black with yellow = location sign: you are here. Red with white = mandatory, such as hold short. Yellow with black = direction or destination. Black with a white number = distance remaining.`,
  task:`AI`, domain:`Science and Aviation` },

{ q:`An aircraft in flight with no radio sees a steady green light from the control tower. It means`,
  opts:[`cleared for takeoff`,
        `return for landing`,
        `cleared to land`,
        `airport unsafe, do not land`,
        `give way and keep circling`],
  a:2, why:`AIM chapter 4, light gun signals. Steady green in flight = cleared to land (on the ground it's cleared for takeoff). Flashing green in flight = return for landing; steady red = give way and keep circling; flashing red = airport unsafe.`,
  task:`AI`, domain:`Science and Aviation` },

{ q:`A pilot whose radios have failed sets the transponder to code`,
  opts:[`7500`,
        `1200`,
        `7700`,
        `7600`,
        `7000`],
  a:3, why:`AIM chapter 6, emergency procedures. 7600 = lost radio. 7700 = general emergency, 7500 = hijacking. 1200 is the normal VFR code in the US.`,
  task:`AI`, domain:`Science and Aviation` },

{ q:`What does a helicopter's collective control change?`,
  opts:[`the tilt of the main rotor disc, for speed and direction`,
        `the pitch of the tail rotor blades`,
        `the trim of the horizontal stabilizer`,
        `the throttle setting only`,
        `the pitch of all the main rotor blades at once`],
  a:4, why:`Helicopter Flying Handbook. Collective: all main blades at the same time, so more lift to climb, less to descend. Tilting the disc is the cyclic; tail rotor pitch is the pedals.`,
  task:`AI`, domain:`Science and Aviation` },

{ q:`What's a single rotor helicopter's tail rotor mainly for? To`,
  opts:[`push the helicopter forward once it reaches cruise speed`,
        `keep the main rotor turning`,
        `counter the torque that would spin the fuselage`,
        `cool the engine compartment`,
        `add lift when the helicopter is hovering`],
  a:2, why:`Helicopter Flying Handbook. Engine turns the rotor one way; the fuselage wants to go the other (third law). Tail rotor thrust cancels it; pedals vary it.`,
  task:`AI`, domain:`Science and Aviation` },

{ q:`On the takeoff roll in a single engine trainer whose prop turns clockwise as the pilot sees it, the nose wants to go`,
  opts:[`up, so the pilot pushes forward`,
        `down, so the pilot pulls back`,
        `left, so the pilot adds right rudder`,
        `right, so the pilot adds left rudder`,
        `nowhere, since the forces cancel out`],
  a:2, why:`PHAK, Aerodynamics of Flight. Left turning tendencies: torque, spiraling slipstream, P factor, gyroscopic precession. Torque and the spiraling slipstream are strongest at high power and low speed, which is the takeoff roll; P factor adds at high angle of attack. Nose goes left, so right rudder.`,
  task:`AI`, domain:`Science and Aviation` },

{ q:`Climbing a piston airplane to 8,000 ft, the pilot leans the mixture. The reason is that`,
  opts:[`the propeller loses its grip on the air`,
        `the air gets thinner, so the mixture gets too rich`,
        `the engine needs more fuel up high`,
        `the oil pressure drops with height`,
        `the fuel gets colder and thicker as the airplane climbs`],
  a:1, why:`PHAK, Aircraft Systems. The carburetor is set for sea level air. Up high the air thins but the fuel doesn't, so the mix runs rich: rough engine, lost power. Leaning brings the ratio back.`,
  task:`AI`, domain:`Science and Aviation` },

{ q:`There's frost on top of the wings at preflight. Why must it come off before takeoff? It`,
  opts:[`disrupts the airflow and can raise the stall speed`,
        `adds weight, and pushes the airplane over its gross weight`,
        `blocks the pitot tube on the wing`,
        `freezes the ailerons in place`,
        `shows up only in the dark`],
  a:0, why:`PHAK, Aerodynamics of Flight. Frost roughens the upper surface, so the airflow separates early: less lift, more drag, a higher stall speed. Even frost as rough as sandpaper can keep an airplane from lifting off.`,
  task:`AI`, domain:`Science and Aviation` },

{ q:`An aircraft's absolute altitude is its height above`,
  opts:[`the airport where it took off`,
        `the ground directly below`,
        `the standard datum plane`,
        `the highest terrain within ten miles`,
        `mean sea level`],
  a:1, why:`PHAK, Flight Instruments. Absolute = above ground level (AGL). True = above mean sea level. Pressure altitude is read from the standard datum plane, with 29.92 set.`,
  task:`AI`, domain:`Science and Aviation` }

]});
})();
