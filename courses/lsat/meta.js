// LSAT course: "The Appeal". Domains and task codes for the LSAT as it runs since August 2026 (two scored Logical Reasoning sections, one
// scored Reading Comprehension section). Codes are Halcyon's own study taxonomy, paraphrased from LSAC's public skill descriptions; the
// question type names are generic. Halcyon isn't affiliated with or endorsed by LSAC.
(function(){
const D=window.HALCYON_DATA=window.HALCYON_DATA||{};
const C=D.lsat=D.lsat||{};
C.full=C.full||[];C.ref=C.ref||[];C.mock=C.mock||[];C.cast=C.cast||[];
C.meta={
  DOMS:["Logical Reasoning","Reading Comprehension"],
  TASKNAMES:{
    LR01:"Main conclusion",LR02:"Role of a statement",LR03:"Complete the argument",LR04:"Necessary assumption",LR05:"Sufficient assumption",
    LR06:"Flaw",LR07:"Strengthen",LR08:"Weaken",LR09:"Must be true",LR10:"Most strongly supported",LR11:"Must be false",
    LR12:"Principle, identify",LR13:"Principle, apply",LR14:"Parallel reasoning",LR15:"Parallel flaw",LR16:"Method of reasoning",
    LR17:"Evaluate the argument",LR18:"Resolve the paradox",LR19:"Point at issue",LR20:"Point of agreement",
    RC01:"Main idea",RC02:"Primary purpose",RC03:"Author's attitude",RC04:"Would agree with",RC05:"Specific detail",RC06:"Inference",
    RC07:"Meaning in context",RC08:"Function of a detail or paragraph",RC09:"Organization",RC10:"Analogy",RC11:"Application",
    RC12:"Principle in a passage",RC13:"Strengthen or weaken a passage claim",RC14:"Comparative passages"
  },
  // The chapters that teach each task in a scene (BIBLE.md coverage table, 2026-10-15). A chapter not written yet shows as "coming in chapter N".
  TASK_CHAPTERS:{LR01:[1,12],LR02:[1,2,11],LR03:[1,9],LR04:[2,3,9,12],LR05:[2,10],LR06:[3,7,8,9,11],LR07:[4,8,11],LR08:[4,8,11],
    LR09:[5,9,12],LR10:[5,8,9,12],LR11:[5,10],LR12:[6,12],LR13:[6,11],LR14:[7,12],LR15:[7,11],LR16:[3,7,12],LR17:[8,10],LR18:[9,10],
    LR19:[6,11],LR20:[6,11],RC01:[1,9,12],RC02:[1,9],RC03:[3,8,10],RC04:[4,5,9,12],RC05:[2,5,8],RC06:[2,5,8,10],RC07:[2,9],
    RC08:[1,3,9],RC09:[3,9],RC10:[7,11],RC11:[6,10,12],RC12:[6,10,12],RC13:[4,8,11],RC14:[7,11]},
  BASE_CAST:[
    ["Dani Ruiz","You. Paralegal at the Denver public defender's office, studying for the LSAT at night."],
    ["Luis Ruiz","Your father. Nineteen years into a forty year sentence for a 2007 bar fight death in Commerce City."],
    ["Teo Ruiz","Your brother. Diesel mechanic. Hasn't visited your father in ten years."],
    ["Ana Brennan","Appellate lawyer on Federal Boulevard. She lost your father's appeal in 2010."]
  ]
};
})();
