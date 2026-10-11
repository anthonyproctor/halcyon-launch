// Test fixtures for lab kinds no course uses yet (evidence with SQL, sort in order mode). Open #labtest to see them.
// The evidence lab is the shape a future CISA audit course would use: a few small files, a filter, optional SQL, and a finding.
(window.HALCYON_LABS=window.HALCYON_LABS||{}).__fixture=[
 {id:"fxev",kind:"evidence",title:"Terminated, but still in",sql:true,
  hook:["Two files from a user access review. Find the person who left the company but can still sign in."],
  files:[{name:"active_users.csv",text:"user_id,name,role,last_login\nu101,Ana Ruiz,Billing admin,2026-09-30\nu102,Ben Cole,Developer,2026-10-01\nu103,Cara Diaz,DBA,2026-10-02\nu104,Dev Shah,Support,2026-09-12\nu105,Eli Park,Developer,2026-10-03"},
         {name:"hr_terminations.csv",text:"user_id,name,termination_date\nu090,Fay Lin,2026-06-30\nu104,Dev Shah,2026-08-29"},
         {name:"policy.txt",text:"Access policy 4.2\nAccess is removed within 1 business day of termination.\nQuarterly reviews compare HR terminations to active accounts."}],
  questions:[{id:"who",type:"text",q:"Which user id is still active after termination?",a:"u104",alt:["dev shah",/^u\s*104$/i],hints:["Compare the two CSV files on user_id.","In SQL: SELECT * FROM active_users a JOIN hr_terminations t ON a.user_id = t.user_id"],sol:["u104, Dev Shah, terminated 2026-08-29 and last signed in 2026-09-12. That breaks policy 4.2, and it's a finding."]},
   {id:"days",type:"number",q:"How many days after termination was that last sign in?",a:14,tol:0,unit:"days",hints:["August has 31 days."],sol:["August 29 to September 12 is 14 days."]}]},
 {id:"fxord",kind:"sort",title:"Put the audit steps in order",
  sort:{mode:"order",items:[{id:"p",label:"Plan the audit"},{id:"f",label:"Do the fieldwork"},{id:"r",label:"Write the report"},{id:"u",label:"Follow up"}],start:["r","p","u","f"],answer:["p","f","r","u"]},
  questions:[{id:"ord",type:"sort",q:"Order them, then check.",hints:["Planning comes first."],sol:["Plan, fieldwork, report, follow up."]}]}
];
