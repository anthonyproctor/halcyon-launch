// Course registry. Each course owns a key block (base) so progress never collides.
window.HALCYON_COURSES=[
  {id:"pmp",title:"PMP",full_title:"The Halcyon Launch",exam:"Project Management Professional (PMI)",story:"Sam Okafor gets drafted to rescue Halcyon AI's biggest customer launch with fourteen weeks left.",base:0,root:"",status:"live",
   taskDomain:{P:"People",R:"Process",B:"Business Environment"},refArt:{1:1,2:4,3:6,4:7,5:9,6:10},
   fullName:"Full Course",fullHours:"about 15 to 20 hours",mockTitle:"PMP practice exam",mockMinutes:240,mockBreaks:[60,120],
   mockBlurb:"Weighted like the July 2026 exam: People 33 percent, Process 41 percent, Business Environment 26 percent, with most questions agile or hybrid. All questions are single answer; the real exam also has multi-select, matching, and hotspot items.",
   mockShort:"180 questions in 240 minutes, weighted like the real exam."},
  {id:"cphims",title:"CPHIMS",scripts:["meta.js","full/ch01.js"],taskDomain:{E:"Environments",C:"Clinical Informatics",S:"Systems Management",L:"Leadership"},
   fullName:"Full Course",fullHours:"about 13 to 16 hours",mockTitle:"CPHIMS practice exam",mockMinutes:120,mockBreaks:[],
   mockBlurb:"Weighted like the HIMSS outline: Environments 25 percent, Clinical Informatics 20 percent, Systems Management 30 percent, Leadership 25 percent. Four options per question at recall, application, and analysis levels.",
   mockShort:"115 questions in 120 minutes, 100 of them scored, weighted like the real exam.",
   mentor:"Ochoa",lessonName:"Ochoa's Legal Pad",levels:true,options:4,
   flags:["solofix","skippedprivacy","blamedmarcus","dismissedwalt","allalerts","softroi","tookthetickets","nodrtest","skippedregression","sharedlogin"],
   speakers:["Maria","Raymond","Kiran","Marcus","Aisha","Joan","Brett","Walt","Tasha","Glenn","Nate","Denise","Lucia","Sam","Ruth"],
   exam:"Certified Professional in Healthcare Information and Management Systems (HIMSS)",full_title:"One Chart",story:"Maria Santos inherits a legacy EHR at three Wyoming hospitals that loses vendor support in twenty months.",base:10000,root:"courses/cphims/",status:"live"},
  {id:"asep",title:"INCOSE ASEP",full_title:"Hearth",exam:"Associate Systems Engineering Professional (INCOSE)",story:"Nadia Brooks, a test engineer in her first systems job, helps build a habitat module for a private space station and learns the crew needs more than the volume the contract promises.",base:20000,root:"courses/asep/",status:"production"},
  {id:"gh300",title:"GH-300",full_title:"The Copilot Rollout",exam:"GitHub Copilot (Microsoft)",story:"Priya Shah gets handed Halcyon's Copilot rollout and a skeptical team.",base:30000,root:"courses/gh300/",status:"production"},
  {id:"pilot",title:"Private Pilot",full_title:"Cleared for Solo",exam:"FAA Private Pilot Airplane knowledge test (PAR)",story:"Twelve years of keeping F-16s safe for other pilots, and now it's your turn in the left seat at Centennial.",base:40000,root:"courses/pilot/",status:"production"}
];
