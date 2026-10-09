// Course registry. Each course owns a key block (base) so progress never collides.
window.HALCYON_COURSES=[
  {id:"pmp",title:"PMP",full_title:"The Halcyon Launch",exam:"Project Management Professional (PMI)",story:"Sam Okafor gets drafted to rescue Halcyon AI's biggest customer launch with fourteen weeks left.",base:0,root:"",status:"live",
   taskDomain:{P:"People",R:"Process",B:"Business Environment"},refArt:{1:1,2:4,3:6,4:7,5:9,6:10},
   fullName:"Full Course",fullHours:"about 15 to 20 hours",mockTitle:"PMP practice exam",mockMinutes:240,mockBreaks:[60,120],
   mockBlurb:"Weighted like the July 2026 exam: People 33 percent, Process 41 percent, Business Environment 26 percent, with most questions agile or hybrid. All questions are single answer; the real exam also has multi-select, matching, and hotspot items.",
   mockShort:"180 questions in 240 minutes, weighted like the real exam."},
  {id:"cphims",title:"CPHIMS",full_title:"CPHIMS",exam:"Certified Professional in Healthcare Information and Management Systems (HIMSS)",story:"Story in review.",base:10000,root:"courses/cphims/",status:"production"},
  {id:"asep",title:"INCOSE ASEP",full_title:"KESTREL-1",exam:"Associate Systems Engineering Professional (INCOSE)",story:"Nadia Brooks, a test engineer in her first systems job, has to find out what the customer actually needs from a wildfire-detection smallsat.",base:20000,root:"courses/asep/",status:"production"},
  {id:"gh300",title:"GH-300",full_title:"The Copilot Rollout",exam:"GitHub Copilot (Microsoft)",story:"Priya Shah gets handed Halcyon's Copilot rollout and a skeptical team.",base:30000,root:"courses/gh300/",status:"production"},
  {id:"pilot",title:"Private Pilot",full_title:"Cleared for Solo",exam:"FAA Private Pilot Airplane knowledge test (PAR)",story:"Twelve years of keeping F-16s safe for other pilots, and now it's your turn in the left seat at Centennial.",base:40000,root:"courses/pilot/",status:"production"}
];
