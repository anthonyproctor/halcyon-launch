// CISA course: "Exception Noted" (book one of the Annex series). Domains and task codes follow the
// ISACA CISA Examination Content Outline (effective August 2024), as printed in Appendix A of the
// ISACA Certification Exam Candidate Guide, version 1.26 (2026):
// https://www.isaca.org/-/media/files/isacadp/project/isaca/certification/exam-candidate-guides/2026/exam-candidate-guide.pdf
// and https://www.isaca.org/credentialing/cisa/cisa-exam-content-outline (read 2026-10-11).
(function(){
const D=window.HALCYON_DATA=window.HALCYON_DATA||{};
const C=D.cisa=D.cisa||{};
C.full=C.full||[];C.ref=C.ref||[];C.mock=C.mock||[];C.cast=C.cast||[];
C.meta={
  DOMS:["Auditing Process","Governance and Management of IT","Acquisition and Implementation","Operations and Resilience","Protection of Information Assets"],
  TASKNAMES:{
    "1A1":"IS audit standards, guidelines, functions, and codes of ethics","1A2":"Types of audits, assessments, and reviews","1A3":"Risk-based audit planning","1A4":"Types of controls and considerations",
    "1B1":"Audit project management","1B2":"Audit testing and sampling methodology","1B3":"Audit evidence collection techniques","1B4":"Audit data analytics","1B5":"Reporting and communication techniques","1B6":"Quality assurance and improvement of the audit process",
    "2A1":"Laws, regulations, and industry standards","2A2":"Organizational structure, IT governance, and IT strategy","2A3":"IT policies, standards, procedures, and practices","2A4":"Enterprise architecture","2A5":"Enterprise risk management","2A6":"Privacy program and principles","2A7":"Data governance and classification",
    "2B1":"IT resource management","2B2":"IT vendor management","2B3":"IT performance monitoring and reporting","2B4":"Quality assurance and quality management of IT",
    "3A1":"Project governance and management","3A2":"Business case and feasibility analysis","3A3":"System development methodologies","3A4":"Control identification and design",
    "3B1":"System readiness and implementation testing","3B2":"Implementation configuration and release management","3B3":"System migration, infrastructure deployment, and data conversion","3B4":"Post-implementation review",
    "4A1":"IT components","4A2":"IT asset management","4A3":"Job scheduling and production process automation","4A4":"System interfaces","4A5":"Shadow IT and end-user computing","4A6":"Systems availability and capacity management","4A7":"Problem and incident management","4A8":"IT change, configuration, and patch management","4A9":"Operational log management","4A10":"IT service level management","4A11":"Database management",
    "4B1":"Business impact analysis","4B2":"System and operational resilience","4B3":"Data backup, storage, and restoration","4B4":"Business continuity plan","4B5":"Disaster recovery plans",
    "5A1":"Information asset security policies, frameworks, standards, and guidelines","5A2":"Physical and environmental controls","5A3":"Identity and access management","5A4":"Network and endpoint security","5A5":"Data loss prevention","5A6":"Data encryption","5A7":"Public key infrastructure","5A8":"Cloud and virtualized environments","5A9":"Mobile, wireless, and IoT devices",
    "5B1":"Security awareness training and programs","5B2":"Information system attack methods and techniques","5B3":"Security testing tools and techniques","5B4":"Security monitoring logs, tools, and techniques","5B5":"Security incident response management","5B6":"Evidence collection and forensics"
  },
  // Results page: the chapters that teach each task (BIBLE.md "Book one chapter plan", main tasks column, copied 2026-10-12).
  // A chapter not written yet shows as "coming in chapter N".
  TASK_CHAPTERS:{"1A1":[1,12],"1A2":[2],"1A3":[1],"1A4":[1,12],"1B1":[1],"1B2":[2],"1B3":[1,11],"1B4":[1,2,8],"1B5":[1,3,12],"1B6":[2,12],
    "2A1":[1,12],"2A2":[3,12],"2A3":[3],"2A4":[4],"2A5":[3,11],"2A6":[4],"2A7":[4],"2B1":[4],"2B2":[4],"2B3":[3],"2B4":[4],
    "3A1":[5],"3A2":[5],"3A3":[5],"3A4":[5],"3B1":[5],"3B2":[6],"3B3":[6],"3B4":[6],
    "4A1":[8],"4A2":[8],"4A3":[6],"4A4":[8],"4A5":[8],"4A6":[8],"4A7":[8],"4A8":[6],"4A9":[8],"4A10":[8,12],"4A11":[2,9],"4B1":[7],"4B2":[7],"4B3":[7],"4B4":[7],"4B5":[7],
    "5A1":[3,9],"5A2":[9],"5A3":[9],"5A4":[10],"5A5":[10],"5A6":[10],"5A7":[10],"5A8":[10],"5A9":[10],"5B1":[11],"5B2":[11],"5B3":[11,12],"5B4":[11],"5B5":[11],"5B6":[1,11,12]},
  BASE_CAST:[
    ["Henry Ashby","You. 42, a Londoner, ex British Army intelligence. Breach claims investigator for a Lloyd's syndicate, now its man in Denver."],
    ["Dorothy Kessler","Dot. 71, retired federal IT examiner. Taught Henry American audit practice in a diner booth on Colfax. Found dead at the Brown Palace."],
    ["Lou Mancuso","Denver Police detective. Brought two coffees. Already doesn't like this."],
    ["Giles Fenwick","Henry's claims director in London, at One Lime Street. Wants an answer by Friday."],
    ["Nkechi Obi","FBI special agent, Denver cyber squad."]
  ],
  FULL_CAST_EXTRA:[
    ["Maisie Ashby","Henry's daughter, 14. Lives in Boulder with her mother. Barely speaks to him."],
    ["Arthur Ashby","Henry's father, 79. Retired Lloyd's underwriter in a care home in north London."]
  ]
};
})();
