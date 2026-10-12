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
//
// Ch 2 "First digits": a first digit (Benford) test on the claimed settlements. Facts it must agree with, all from
// courses/cisa/full/ch02.js (opening chart, scenes f2s1, f2s9, f2s11, the drill) and ch01.js f1s11:
//   12,400 claimed settlements totaling $41,000,000. 2,906 of them between $9,000 and $9,999.99, every one leading with 9.
//   Corrected first digit counts 1 to 9: 2871, 1662, 1190, 913, 758, 629, 556, 481, 3340 (sum 12,400). Henry's 2:52 AM first run on
//   Wednesday, March 10 counted the total row too (a leading 4), so it showed 914 fours and added to 12,401; the file here is corrected.
//   Benford share log10(1 + 1/d): .30103 .17609 .12494 .09691 .07918 .06695 .05799 .05115 .04576.
//   Expected 9s for 12,400 = 567.4; excess 3,340 minus 567 = 2,773. Remove the 2,906 and 434 leading 9s remain, against
//   9,494 x .04576 = 434.4 expected. Maisie's bills: 48 months, $61 to $148.
(function(){
const LABS=(window.HALCYON_LABS=window.HALCYON_LABS||{});

const digits=`digit,claimed_count
1,2871
2,1662
3,1190
4,913
5,758
6,629
7,556
8,481
9,3340`;

const benford=`digit,benford_share
1,0.30103
2,0.17609
3,0.12494
4,0.09691
5,0.07918
6,0.06695
7,0.05799
8,0.05115
9,0.04576`;

const maisie=`who made these up? (science fair notes, maisie ashby, grade 9)

benfords law: in lots of real numbers the first digit is 1 about 30% of the time and 9 only about 4.6%.
share for digit d = log10(1 + 1/d). i checked it on my calculator for all nine.

data set 1: population of every town and city in colorado (state website). fits really well.
data set 2: 31 people in my class each made up 10 numbers (310 numbers). way too flat. people think 5 and 7 look random lol
data set 3: mums electric bills, 48 months, smallest $61 biggest $148. DOESNT FIT. broken???

update wed: not broken. benford needs numbers that cover lots of sizes (like 10 to 700,000).
bills only go from 61 to 148 so the first digit can only really be 1, 6, 7, 8 or 9.
also it doesnt work on numbers people assign, like phone numbers or zip codes, or prices that end in .99

also update: dads chart added up to 12,401 instead of 12,400. he counted the total line. i found it.`;

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
  ]}],
2:[{id:"c2digits",kind:"evidence",title:"First digits",sql:true,
  hook:[`A fourteen year old has the right idea, Lime Street. Before you read a single settlement, count how they start. Honest numbers lean toward the small digits. Numbers somebody chose don't.`,`Here's the claim list by first digit, the shares the law expects, and the notes from a science fair project, which are better than some workpapers I've reviewed. Work out where the list departs from the curve, and then work out how much of the departure you can explain.`],
  files:[{name:"settlement_first_digits.csv",text:digits},{name:"benford_expected.csv",text:benford},{name:"maisie_notes.txt",text:maisie}],
  source:`Made up files for chapter 2, nothing real. The digit counts are for the 12,400 settlements Meridian claimed as fraud, after Henry took the total row out.`,
  questions:[
   {id:"exp9",type:"number",q:`Out of 12,400 settlements, how many does Benford's law expect to begin with a 9? Round to the nearest whole number.`,a:567,tol:1,unit:"settlements",
    hints:[`Multiply the population by the share for 9 in benford_expected.csv.`,`In SQL: SELECT digit, ROUND(benford_share * 12400) AS expected FROM benford_expected`],
    sol:[`12,400 × 0.04576 = 567.4, so about 567. Meridian's list has 3,340, nearly six times as many.`]},
   {id:"excess",type:"number",q:`How many more settlements begin with 9 than the law expects?`,a:2773,tol:2,unit:"settlements",
    hints:[`Compare claimed_count for digit 9 with your expected figure.`,`In SQL: SELECT d.digit, d.claimed_count, ROUND(b.benford_share * 12400) AS expected, d.claimed_count-ROUND(b.benford_share * 12400) AS diff FROM settlement_first_digits d JOIN benford_expected b ON d.digit = b.digit`],
    sol:[`3,340 minus 567 = 2,773. Every other digit sits below its expected count, which is what you'd see if a big block of extra 9s had been added to an otherwise ordinary list. The excess is close to the 2,906 settlements just under the $10,000 line. The next question tests whether it's exactly them.`]},
   {id:"left9",type:"number",q:`Take out the 2,906 settlements between $9,000 and $9,999.99. How many leading 9s are left?`,a:434,tol:0,unit:"settlements",
    hints:[`Every one of the 2,906 begins with a 9.`,`3,340 minus 2,906.`],
    sol:[`3,340 minus 2,906 = 434. The rest of the list is 12,400 minus 2,906 = 9,494 settlements, and Benford expects 9,494 × 0.04576 = 434.4 of those to begin with 9. Take the block under the line away and what's left looks like ordinary numbers.`]},
   {id:"means",type:"choice",q:`What does the test tell you?`,opts:[`The 12,400 settlements were made up, so the claim should be declined`,`Benford's law can't be used on payments, so the result means nothing`,`The excess is the 2,906 under the line; test those first, then the rest`,`Meridian's settlement system has a fault that rounds amounts up`],a:2,
    hints:[`Is a digit test evidence of fraud, or a pointer to where you sample?`,`Think about what the 434 told you about the other 9,494.`],
    sol:[`The whole excess of 9s sits in the 2,906 settlements just under the second approver line, and the other 9,494 follow the curve. That tells you where to sample first and what to test there: source documents, approvals, and destinations. It doesn't prove fraud, and it doesn't clear the other 9,494 either. They still get their own sample.`]},
   {id:"bills",type:"choice",q:`Maisie's third data set didn't fit. Why not?`,opts:[`Electric bills are assigned numbers, like zip codes`,`Forty eight bills is too few for any test at all`,`Her mum must have rounded the amounts by hand`,`The bills cover too narrow a range to spread out`],a:3,
    hints:[`Look at the smallest and biggest bill in her notes.`,`How many orders of magnitude does $61 to $148 cover?`],
    sol:[`The bills only run from $61 to $148, so the first digit can only be 1, 6, 7, 8, or 9. Benford's law needs data that spans several orders of magnitude. Knowing when a test shouldn't work is half of using it, in a science fair or an audit.`]}
  ]}],
};
})();
