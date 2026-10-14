// CPHIMS course: "One Chart". Domains, task codes (HIMSS CPHIMS Candidate Handbook outline, effective May 1, 2024; the 2025 posting of it), and base cast.
(function(){
const D=window.HALCYON_DATA=window.HALCYON_DATA||{};
const C=D.cphims=D.cphims||{};
C.full=C.full||[];C.ref=C.ref||[];C.mock=C.mock||[];C.cast=C.cast||[];
C.meta={
  DOMS:["Environments","Clinical Informatics","Systems Management","Leadership"],
  TASKNAMES:{
    E1:"Types of healthcare organizations",E2:"Interrelationships across organizations",E3:"Roles of HIMS professionals",E4:"Laws, regulations, and accreditation",E5:"Technology trends that improve outcomes",E6:"Healthcare applications",E7:"Technology infrastructure",
    C1:"Clinical vocabulary",C2:"Healthcare IT vocabulary",C3:"Clinical metrics",C4:"System functionality for clinical effectiveness",C5:"Interpret outcomes with analytics",C6:"Clinical content and decision support",
    SA1:"Systems development life cycle",SA2:"Needs, gap analysis, and requirements",SA3:"Process improvement",SA4:"Visualization tools",SA5:"Interpret disparate data sets",SA6:"Alternate processes and solutions",SA7:"Strategic alignment",SA8:"Cost-benefit analysis",SA9:"Proposals and benefits realization",SA10:"Business documents",
    SB1:"Interoperability",SB2:"Standards compliance",SB3:"Incorporating trends",SB4:"Business continuity and disaster recovery",SB5:"Evaluate emerging technologies",SB6:"Data governance",
    SC1:"Solution selection",SC2:"Technical change management",SC3:"Training and support",SC4:"Implement within scope, schedule, budget, quality",SC5:"Maintain systems",SC6:"Analyze problems and trends",
    SD1:"Formal testing",SD2:"Internal controls during testing",SD3:"Validate against contract and design",SD4:"Benefits and metrics",
    SE1:"Privacy and security policies",SE2:"Assess and mitigate vulnerabilities",SE3:"User access controls",SE4:"Physical, technical, administrative controls",SE5:"Roles for managing vulnerabilities",SE6:"Data management controls",SE7:"Ongoing validation of security",
    L1:"Strategic planning",L2:"Organizational environment",L3:"Forecast technical and information needs",L4:"IT strategic plan",L5:"Evaluate performance",L6:"Effectiveness and user satisfaction",L7:"Promote stakeholder understanding",L8:"Policies and procedures",L9:"Legal and regulatory compliance",L10:"Ethical business principles",L11:"Comparative analytics",L12:"Business communications",L13:"Facilitate meetings",L14:"Consultative services",L15:"Educational strategies",L16:"Maintain IT competencies",L17:"Risk management",L18:"Ethical stakeholder relationships",L19:"Present data and recommendations",L20:"Organizational change management",L21:"Roles and job descriptions",L22:"Staff competency",L23:"Projects and portfolios",L24:"Vendor contracts",L25:"Budget and financial risks"
  },
  // Results page: Systems Management subdomains by task code prefix, and the chapters that teach each task (BIBLE.md coverage table,
  // copied 2026-10-12). A chapter not written yet shows as "coming in chapter N".
  SUBDOMS:{SA:"Analysis",SB:"Design",SC:"Selection and implementation",SD:"Testing",SE:"Privacy and security"},
  TASK_CHAPTERS:{E1:[1,2,6,12],E2:[1,2,4,11],E3:[1,2,7,12],E4:[2,10],E5:[4,5,8,11],E6:[1,3,4,8],E7:[3,8,9,10],C1:[4],C2:[2,3,4],C3:[4,5,11],C4:[4,5,7,9],C5:[5,6,11,12],C6:[5,8,9],
    SA1:[6],SA2:[6],SA3:[6],SA4:[4,6],SA5:[5],SA6:[6],SA7:[1],SA8:[6],SA9:[6],SA10:[7],SB1:[3,8],SB2:[3],SB3:[8],SB4:[8],SB5:[8],SB6:[8],
    SC1:[7],SC2:[9],SC3:[11],SC4:[9],SC5:[11],SC6:[3,9,11],SD1:[9],SD2:[9],SD3:[7,9],SD4:[11],SE1:[2,10],SE2:[10],SE3:[10],SE4:[10],SE5:[10],SE6:[10],SE7:[10],
    L1:[1,12],L2:[1],L3:[8,12],L4:[12],L5:[11,12],L6:[4,11],L7:[12],L8:[2,12],L9:[2,10],L10:[2,7],L11:[12],L12:[1,10],L13:[5,12],L14:[11],L15:[11],L16:[12],L17:[10],
    L18:[7],L19:[6,12],L20:[11],L21:[12],L22:[3,9],L23:[9,12],L24:[7],L25:[6,12]},
  BASE_CAST:[
    ["Maria Santos","You. Vice President of Clinical Systems, Cascade Valley Health. Fourteen years an ICU nurse."],
    ["Dr. Raymond Ochoa","CIO, Cascade Valley Health. Your boss. Wants the truth early and the numbers real."],
    ["Kiran Bhatt","Senior EHR analyst, ex-pharmacy tech. Builds the order sets. Never says no."],
    ["Marcus Bell","Interface engineer. Twenty-two years of HL7. Built Relay, and nobody else understands it."],
    ["Dr. Aisha Rahman","Chief Medical Information Officer. Hospitalist. Wants an alert for every risk."]
  ],
  FULL_CAST_EXTRA:[["Lucia Santos","Maria's daughter, 17. Applying to nursing school. Asks the questions Maria avoids."]]
};
})();
