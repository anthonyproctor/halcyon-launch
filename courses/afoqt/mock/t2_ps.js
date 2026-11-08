// AFOQT course "Commission": Practice Test 2, part B, subtest 2 of 6: Physical Science (20 items, 10 minutes). Written 2026-11-07.
// Form "M18:" (see courses/lsat/mock/lr1.js for how forms work). Part B is M17 Situational Judgment, M18 Physical Science, M19 Table Reading, M20 Instrument Comprehension, M21 Block Counting, M22 Aviation Information.
// High school level: physics 11 (free fall, inertia, vectors, conductors, static charge, magnets, visible light, the spectrum, Doppler,
// boiling point, work), chemistry 4 (sublimation, noble gases, rust, neutralization), earth and space 5 (specific heat and climate, Earth's
// core, igneous rock, sunlight travel time, falling barometer). No calculator. Two items take one step of arithmetic (free fall speed, work);
// the other 18 are one-step recall, like the real test. No topic repeats Test 1.
// Tasks: PS 20. Keys by slot: 4/4/4/4/4.
// Original items written for Halcyon, not taken from the AFOQT information pamphlet, any official sample or any prep book, and none closely
// repeats a chapter quiz item, a chapter decision or a Practice Test 1 item (checked 2026-11-07 against ch01 to ch04 and t1_*.js). Halcyon isn't
// affiliated with or endorsed by the Department of the Air Force, AFPC or Pearson. Five choices; the engine shuffles them on display, so no explanation
// names a letter. Ids are the part prefix plus the array index: never reorder items.
(function(){
const D=window.HALCYON_DATA=window.HALCYON_DATA||{};
const C=D.afoqt=D.afoqt||{};
C.mock=C.mock||[];

C.mock.push({ part:`M18: Physical Science`, formName:`Test 2: Physical Science`,
questions:[

{ q:`A ball is dropped from a tall tower. Ignoring air resistance, about how fast is it falling after 2 seconds?`,
  opts:[`200 m/s`,
        `10 m/s`,
        `20 m/s`,
        `5 m/s`,
        `40 m/s`],
  a:2, why:`Free fall: v = g × t. 9.8 m/s² × 2 s = 19.6, call it 20 m/s. 10 is one second's worth; 40 is g × t², from squaring the time; 200 adds a zero; 5 is ½g, a piece of the distance formula.`,
  task:`PS`, domain:`Science and Aviation` },

{ q:`The bus brakes hard and everyone standing lurches forward. What's behind that?`,
  opts:[`Gravity`,
        `Friction`,
        `Newton's third law`,
        `Momentum transfer to the bus`,
        `Inertia`],
  a:4, why:`First law, inertia. The passengers keep moving forward at the old speed until something stops them; the bus stopped, they didn't. Third law is the action and reaction pair, a different idea.`,
  task:`PS`, domain:`Science and Aviation` },

{ q:`Which of these is a vector quantity?`,
  opts:[`Speed`,
        `Time`,
        `Velocity`,
        `Temperature`,
        `Mass`],
  a:2, why:`Vector = size plus direction. Velocity is 30 m/s north; speed is just 30 m/s. Mass, temperature and time are scalars: a size only.`,
  task:`PS`, domain:`Science and Aviation` },

{ q:`Which of these materials is the best conductor of electricity?`,
  opts:[`Copper`,
        `Plastic`,
        `Glass`,
        `Rubber`,
        `Dry wood`],
  a:0, why:`Metals carry current: their outer electrons move freely. Copper is the standard for wiring. Rubber, glass, dry wood and plastic are insulators.`,
  task:`PS`, domain:`Science and Aviation` },

{ q:`Rub a balloon on your hair and it sticks to a wall. What did the rubbing do?`,
  opts:[`Moved protons from the hair to the balloon`,
        `Made the balloon magnetic`,
        `Moved electrons from the hair to the balloon`,
        `Warmed the balloon until its surface turned sticky`,
        `Built up air pressure on the balloon's surface`],
  a:2, why:`Static charge. Rubbing knocks electrons loose; they move to the balloon, which goes negative. The wall's charges shift, and opposite charges attract. Protons stay locked in the nucleus, and no magnetism is involved.`,
  task:`PS`, domain:`Science and Aviation` },

{ q:`Hold two bar magnets north pole to north pole. They`,
  opts:[`pull together`,
        `lose their magnetism`,
        `have no effect on each other`,
        `spin to line up east and west`,
        `push apart`],
  a:4, why:`Like poles repel, unlike poles attract. North to north pushes apart; north to south pulls together.`,
  task:`PS`, domain:`Science and Aviation` },

{ q:`Which color of visible light has the longest wavelength?`,
  opts:[`Green`,
        `Red`,
        `Blue`,
        `Violet`,
        `Yellow`],
  a:1, why:`Red. ROYGBIV runs long to short wavelength, red down to violet. Long wavelength, low frequency.`,
  task:`PS`, domain:`Science and Aviation` },

{ q:`Which of these has the highest frequency?`,
  opts:[`Radio waves`,
        `Visible light`,
        `Infrared`,
        `Microwaves`,
        `Gamma rays`],
  a:4, why:`Electromagnetic spectrum, low to high frequency: radio, microwave, infrared, visible, ultraviolet, X ray, gamma. Gamma sits at the top, with the shortest wavelength and the most energy.`,
  task:`PS`, domain:`Science and Aviation` },

{ q:`An ambulance's siren sounds higher pitched as it comes toward you and lower after it passes. This is called`,
  opts:[`resonance`,
        `interference`,
        `an echo`,
        `the Doppler effect`,
        `the greenhouse effect`],
  a:3, why:`Doppler effect. A source moving toward you bunches its waves up: higher frequency, higher pitch. Moving away it stretches them out. Echo is a reflection; resonance is a match of natural frequencies.`,
  task:`PS`, domain:`Science and Aviation` },

{ q:`On a high mountain, water boils below 100 °C. That's because`,
  opts:[`the air pressure is lower`,
        `gravity is much weaker up there`,
        `the sunlight is stronger`,
        `the air is colder`,
        `the water holds less salt`],
  a:0, why:`Water boils once its vapor pressure reaches the air pressure on it. Up a mountain there's less air on top: about 90 °C at 3,000 m. Gravity hardly changes.`,
  task:`PS`, domain:`Science and Aviation` },

{ q:`Dry ice turns straight from a solid into a gas without becoming a liquid. This change is called`,
  opts:[`evaporation`,
        `sublimation`,
        `melting`,
        `deposition`,
        `condensation`],
  a:1, why:`Solid → gas = sublimation. Gas → solid is deposition (frost). Liquid → gas is evaporation; gas → liquid is condensation.`,
  task:`PS`, domain:`Science and Aviation` },

{ q:`Towns on the coast usually have milder summers and winters than towns far inland. The main reason is that water`,
  opts:[`is denser than the land beside it`,
        `blocks the wind coming off the land`,
        `evaporates more slowly than soil dries`,
        `reflects most of the sunlight that reaches it`,
        `has a high specific heat`],
  a:4, why:`Water's specific heat is high: it soaks up and gives off heat slowly. The sea keeps the coast mild; dry land swings hot and cold.`,
  task:`PS`, domain:`Science and Aviation` },

{ q:`Helium and neon hardly ever react with other elements because they`,
  opts:[`are always found as liquids`,
        `have no protons in the nucleus`,
        `have full outer electron shells`,
        `carry a strong electric charge at all times`,
        `have very large atoms`],
  a:2, why:`Noble gases: outer shell already full, so there's nothing to gain, lose or share. Every element has protons, and these two are gases, neutral and small.`,
  task:`PS`, domain:`Science and Aviation` },

{ q:`Iron left out in the rain slowly turns to rust. This is an example of`,
  opts:[`a chemical change`,
        `a physical change`,
        `a change of state`,
        `radioactive decay`,
        `sublimation`],
  a:0, why:`Rust is a new substance, iron oxide, made when iron reacts with oxygen and water. New substance = chemical change. Melting or bending iron is physical: still iron.`,
  task:`PS`, domain:`Science and Aviation` },

{ q:`When an acid and a base react with each other, the main products are`,
  opts:[`a stronger acid`,
        `hydrogen and helium`,
        `a gas and a metal`,
        `a salt and water`,
        `a metal and oxygen`],
  a:3, why:`Neutralization: acid + base → salt + water. Hydrochloric acid plus sodium hydroxide gives table salt and water.`,
  task:`PS`, domain:`Science and Aviation` },

{ q:`Which layer of the Earth is liquid?`,
  opts:[`The upper mantle`,
        `The outer core`,
        `The crust`,
        `The inner core`,
        `The lithosphere`],
  a:1, why:`Crust and lithosphere are solid rock; the mantle is solid that flows very slowly; the outer core is liquid iron and nickel; the inner core is solid under enormous pressure. The moving outer core drives Earth's magnetic field.`,
  task:`PS`, domain:`Science and Aviation` },

{ q:`Granite and basalt form when molten rock cools and hardens. They are`,
  opts:[`metamorphic rocks`,
        `fossil rocks`,
        `sedimentary rocks`,
        `igneous rocks`,
        `mineral salts`],
  a:3, why:`Igneous = from magma or lava. Sedimentary = layers pressed together (sandstone). Metamorphic = changed by heat and pressure (marble).`,
  task:`PS`, domain:`Science and Aviation` },

{ q:`Light from the Sun takes about how long to reach Earth?`,
  opts:[`8 days`,
        `8 hours`,
        `8 seconds`,
        `8 minutes`,
        `1 second`],
  a:3, why:`150,000,000 km ÷ 300,000 km/s = 500 s ≈ 8 min 20 s. Moonlight: about 1 s.`,
  task:`PS`, domain:`Science and Aviation` },

{ q:`A worker pushes a crate 4 m across the floor with a steady force of 50 N. How much work is done on the crate?`,
  opts:[`12.5 J`,
        `200 J`,
        `2000 J`,
        `54 J`,
        `46 J`],
  a:1, why:`W = F × d = 50 N × 4 m = 200 J. 12.5 is 50 ÷ 4; 54 just adds the numbers.`,
  task:`PS`, domain:`Science and Aviation` },

{ q:`A falling barometer, with air pressure dropping over several hours, usually means`,
  opts:[`clouds and stormy weather are likely`,
        `the humidity is falling fast`,
        `the temperature will stay steady for a few days`,
        `clear, dry weather is coming`,
        `the wind is about to stop`],
  a:0, why:`Falling barometer = low pressure on the way: rising air, clouds, rain. Rising barometer = a high: sinking air, mostly clear.`,
  task:`PS`, domain:`Science and Aviation` }

]});
})();
