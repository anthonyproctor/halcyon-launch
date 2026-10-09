// Private Pilot course: "Danny's Logbook". Domains, ACS task codes (FAA-S-ACS-6C), and base cast.
(function(){
const D=window.HALCYON_DATA=window.HALCYON_DATA||{};
const C=D.pilot=D.pilot||{};
C.full=C.full||[];C.ref=C.ref||[];C.mock=C.mock||[];C.cast=C.cast||[];
C.meta={
  DOMS:["Preflight","Airport and flight","Navigation and emergencies"],
  TASKNAMES:{
    "I.A":"Pilot qualifications","I.B":"Airworthiness requirements","I.C":"Weather information","I.D":"Cross-country flight planning",
    "I.E":"National Airspace System","I.F":"Performance and limitations","I.G":"Operation of systems","I.H":"Human factors",
    "II":"Preflight procedures","III.A":"Communications, light signals, and runway lighting","III.B":"Traffic patterns",
    "IV":"Takeoffs, landings, and go-arounds","V":"Performance and ground reference maneuvers","VI":"Navigation",
    "VII":"Slow flight and stalls","VIII":"Basic instrument maneuvers","IX":"Emergency operations","XI":"Night operations","XII":"Postflight procedures"
  },
  BASE_CAST:[
    ["Jordan Reyes","You. 35, commercial HVAC estimator in Aurora. Has never flown. Inherited a quarter of an airplane."],
    ["Danny Reyes","Jordan's older brother. Private pilot for eleven years. Died in March at 41. Left the logbook."],
    ["Abby Strand","Flight instructor at the club, 28. Counting hours toward an airline job. Doesn't do pep talks."],
    ["Walt Herrera","Partner and club safety officer. Retired airline dispatcher. Wants the share sold back."],
    ["Marisol Tran","Partner and A&P mechanic. Danny's closest friend at the airport."]
  ],
  FULL_CAST_EXTRA:[
    ["Lourdes Reyes","Jordan and Danny's mother. Hates the airplane."],
    ["Claire Reyes","Danny's widow. ER nurse in Denver. Practical, tired, honest."],
    ["Ellie Reyes","Danny's daughter, 9. Asks the best questions in the course."]
  ]
};
})();
