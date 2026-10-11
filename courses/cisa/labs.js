// Exception Noted labs: optional evidence rooms, registered by chapter number. Engine: lab.js (kind "evidence": CSV and text files,
// a row filter, and SQL through sql.js loaded from cdnjs only when the SQL tab is opened). Every file is fictional and built to agree
// with the chapter it sits in. Copy rules: plain words, no dashes, Dot talks to "you" from her workpapers.
//
// Ch 1 "Terminated, still signing in": the classic third party access test (accounts compared with their access end dates, then
// sign ins compared with both). Facts it must agree with, all from courses/cisa/full/ch01.js scene f1s12 and the closing:
//   EXT0412 Dorothy Kessler, Examiner (read only), granted 2018-04-02, access end 2026-11-30, status ACTIVE.
//   Sign in 2027-03-09 10:12:37 UTC, sign out 10:41:05 UTC, Examiner portal. Denver is UTC minus 7 on March 9, 2027 (US daylight
//   saving starts March 14, 2027), so 10:12 UTC is 3:12 AM MST. Medical investigator's window: midnight to 1:30 AM, March 9.
//   Days from 2026-11-30 to 2027-03-09: 1 (to Dec 1) + 30 + 31 + 28 + 9 = 99. 2027 is not a leap year.
// A second exception (EXT0413, ACTIVE past its end date but never used) is there on purpose: the access review finds two exceptions,
// and only one of them is the clue.
(function(){
const LABS=(window.HALCYON_LABS=window.HALCYON_LABS||{});

const accounts=`account_id,name,organization,role,access_granted,access_end,status
EXT0301,Glen Tobin,Northgate Software,Vendor support,2024-01-10,2025-12-31,DISABLED
EXT0388,Sunita Rao,Hollins and Pike LLP,External auditor (read only),2026-09-01,2027-04-15,ACTIVE
EXT0412,Dorothy Kessler,Federal banking regulator,Examiner (read only),2018-04-02,2026-11-30,ACTIVE
EXT0413,Ray Duval,Federal banking regulator,Examiner (read only),2022-03-14,2026-11-30,ACTIVE
EXT0420,Ana Whitlock,Federal banking regulator,Examiner (read only),2023-05-01,2026-11-30,DISABLED
EXT0466,Pat Ng,Brightline Payroll,Vendor support,2025-06-01,2027-05-31,ACTIVE
EXT0479,Colm Byrne,Vellacott syndicate,Claims adjuster (read only),2026-02-02,2026-08-31,DISABLED
EXT0520,Marta Feld,Halverson Forensics,Incident responder,2027-03-05,2027-06-30,ACTIVE
EXT0521,Owen Price,Halverson Forensics,Incident responder,2027-03-05,2027-06-30,ACTIVE
EXT0533,Lena Ortiz,Keystone Card Services,Network support,2027-01-04,2027-12-31,ACTIVE`;

const signins=`timestamp_utc,account_id,application,event
2027-03-05T13:58:40Z,EXT0520,Incident console,SIGN_IN
2027-03-05T14:06:12Z,EXT0521,Incident console,SIGN_IN
2027-03-05T23:30:02Z,EXT0520,Incident console,SIGN_OUT
2027-03-05T23:41:19Z,EXT0521,Incident console,SIGN_OUT
2027-03-06T15:02:55Z,EXT0388,Audit document room,SIGN_IN
2027-03-06T15:20:08Z,EXT0520,Incident console,SIGN_IN
2027-03-06T16:47:31Z,EXT0388,Audit document room,SIGN_OUT
2027-03-07T01:12:44Z,EXT0520,Incident console,SIGN_OUT
2027-03-08T16:40:17Z,EXT0466,Payroll gateway,SIGN_IN
2027-03-08T17:05:51Z,EXT0466,Payroll gateway,SIGN_OUT
2027-03-08T18:11:03Z,EXT0533,Network management,SIGN_IN
2027-03-08T18:52:29Z,EXT0533,Network management,SIGN_OUT
2027-03-09T10:12:37Z,EXT0412,Examiner portal,SIGN_IN
2027-03-09T10:41:05Z,EXT0412,Examiner portal,SIGN_OUT
2027-03-09T14:31:50Z,EXT0521,Incident console,SIGN_IN
2027-03-09T15:44:26Z,EXT0388,Audit document room,SIGN_IN`;

const notes=`Henry Ashby, working notes, Tuesday 9 March 2027

Source: Meridian Clearing claim pack, Appendix C, pages 386 to 391.
Received from the insured's broker by email at 11:34 AM MST. Export run 2027-03-09 15:58 UTC.

Meridian access standard AC 7 (claim pack page 112):
  Third party accounts are disabled on the access end date.
  The quarterly access review compares third party accounts with their end dates.

Times in Appendix C are UTC.
Denver is UTC minus 7 until US daylight saving starts on 14 March 2027.

Lou Mancuso, text, 8:10 PM: time of death between midnight and 1:30 AM, 9 March.`;

LABS.cisa={
1:[{id:"c1access",kind:"evidence",title:"Terminated, still signing in",sql:true,
  hook:[`The first test I run in any access review is the dullest one there is. Take the list of accounts, take the date each one was supposed to stop working, and see which ones didn't. Then take the sign in log and see which of those somebody actually used.`,`These are the files from the claim pack, Lime Street, the way Meridian exported them. Henry's notes are in the third tab. Do it the way I taught you: the finding, the numbers, and then who you tell.`],
  files:[{name:"external_accounts.csv",text:accounts},{name:"signin_log.csv",text:signins},{name:"henry_notes.txt",text:notes}],
  source:`Made up files for chapter 1, nothing real. Meridian's log keeps UTC, like nearly every log you'll ever audit, so do the time zone sum first.`,
  questions:[
   {id:"active",type:"number",q:`How many external accounts are still ACTIVE after their access end date? Use 9 March 2027 as today.`,a:2,tol:0,unit:"accounts",
    hints:[`Look at the status and access_end columns together. Any ACTIVE account whose end date has passed is an exception.`,`In SQL: SELECT * FROM external_accounts WHERE status = 'ACTIVE' AND access_end < '2027-03-09'`],
    sol:[`Two. EXT0412, Dorothy Kessler, and EXT0413, Ray Duval. Both examiner accounts were due to end on 30 November 2026 and neither was disabled. EXT0420 ended the same day and was disabled properly, which tells you the process existed and then didn't run for the other two.`,`That's already a finding against Meridian's own standard AC 7, before anybody looks at a log.`]},
   {id:"who",type:"text",q:`Which of those accounts signed in after its access ended? Give the account id.`,a:"EXT0412",alt:[/^ext\s*0?412$/i,"dorothy kessler","kessler","dot kessler","dot"],
    hints:[`Compare signin_log.csv with your two exceptions on account_id.`,`In SQL: SELECT a.account_id, a.name, a.access_end, s.timestamp_utc, s.event FROM external_accounts a JOIN signin_log s ON a.account_id = s.account_id WHERE substr(s.timestamp_utc, 1, 10) > a.access_end`],
    sol:[`EXT0412, Dorothy Kessler. It signed in to the examiner portal at 10:12:37 UTC on 9 March 2027 and signed out at 10:41:05. Ray Duval's account is open too, but nobody used it in this period. Both go in the workpaper. Only one of them is a story.`]},
   {id:"local",type:"choice",q:`The sign in is stamped 10:12:37 UTC. What time was that in Denver?`,opts:[`5:12 AM on 9 March`,`10:12 AM on 9 March`,`3:12 AM on 10 March`,`3:12 AM on 9 March`],a:3,
    hints:[`Henry's notes give you the offset for that week.`,`Subtract seven hours. Daylight saving hasn't started yet.`],
    sol:[`10:12 UTC minus seven hours is 3:12 AM Mountain Standard Time on Tuesday, 9 March. The medical investigator puts Dot's death between midnight and 1:30. So the account was used at least an hour and forty minutes after she died.`,`Always convert log times before you compare them with anything a person tells you. A seven hour mistake would have put this sign in at breakfast.`]},
   {id:"days",type:"number",q:`How many days after its access end date was that sign in?`,a:99,tol:0,unit:"days",
    hints:[`Count from 30 November 2026 to 9 March 2027.`,`December has 31 days, January 31, and February 2027 has 28.`],
    sol:[`One day to 1 December, then 30 more to the end of December, 31 for January, 28 for February, and 9 into March. 1 + 30 + 31 + 28 + 9 = 99 days.`,`That number goes in the finding. It says how long the control had been failing when it mattered.`]},
   {id:"next",type:"choice",q:`You have the finding. What do you do with it tonight?`,opts:[`Email Meridian's internal audit director and ask him to explain it`,`Sign in to the examiner portal to see what the session looked at`,`Keep the file as received and report it via counsel to investigators`,`Hold it for the Friday interim view so the report is complete`],a:2,
    hints:[`Who is the appropriate party for a possible illegal act tied to a death?`,`Think about what each choice does to the evidence, and who learns about it first.`],
    sol:[`Preserve the file exactly as you received it, write down where it came from and when, and report it through counsel to the people whose job it is to act, here the detective and the FBI. Telling Meridian alerts the auditee. Signing in yourself goes beyond your authority and scope and adds your own activity to the evidence. Holding it for Friday delays a fact somebody needs now.`]}
  ]}]
};
})();
