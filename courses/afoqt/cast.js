// Cast wiki for "Commission" (AFOQT). Each section unlocks after the reader reaches the given chapter. Written 2026-11-07, chapter 1 people only.
// No portraits yet: a card with no cast/<id> picture shows the person's initials.
(function(){
const D=window.HALCYON_DATA=window.HALCYON_DATA||{};
const C=D.afoqt=D.afoqt||{};
C.cast=C.cast||[];
C.cast.push(
 { id:`kit`, intro:`Staff Sergeant Kit Darrow. I'm the crew chief on two two eight, a KC-135 that's older than my mother. My name's stenciled under the pilot's window. I can start all four engines and run them up until the whole jet shakes, and I can't let off the brakes. The rest of the month I'm an operator at the town water plant. That's most of what there is to know. Most of it.`, name:`Kit Darrow`, role:`Staff sergeant, 32. Crew chief on a Guard KC-135 at Tolliver Field. You.`, firstChapter:1, speaker:`Kit`,
   sections:[
    {unlock:1, title:`Who she is`, body:[`Kit is the dedicated crew chief on two two eight, a KC-135 tanker at Tolliver Field, the Missouri Air National Guard base on the north side of the Tolliver airport. She's been on the flight line eleven years. She's engine run qualified, so the only seat she's ever had up front is the left one, in a jet that's chocked.`,`Her name is stenciled under the pilot's window, CREW CHIEF SSGT K. DARROW, in white block letters Boyd painted in 2018 over his own. When she isn't on drill she's an operator at the town's water treatment plant, and she can work a chlorine feed rate in her head at three in the morning.`]},
    {unlock:1, title:`Family day`, body:[`At seven, on a family day, she sat in a navigator's seat in one of the wing's jets. She doesn't know which one. She remembers a man's voice, his hand pointing up at the ceiling, and crying in the car on the way home because she wanted something so badly.`,`The nav seats are gone now. Behind the pilots on two two eight there's a row of bolt holes in the floor.`]},
    {unlock:1, title:`The posting`, body:[`On the first drill weekend of 2027 a pilot vacancy went up on the shop corkboard, for a board that sits Saturday, July 10. She turns thirty three on June 3. She did the math on the back of a work card and came out five weeks over the line.`,`Seven years ago she put in for a board like this one, then pulled her package to stay for the spring inspection, because Boyd asked her to. That's the story she tells. She's told it so many times it's worn smooth.`]},
    {unlock:1, title:`I want it`, body:[`That Sunday night she put Vern's napkin on the kitchen counter and had her reasons ready, all of them about the wing. She didn't use any of them. She told Graham she wanted it, and it was the first time she'd said so out loud.`]}],
   quote:{unlock:1, text:`It's a yes with a string on it.`},
   ties:[{unlock:1,id:`graham`,text:`Her husband. Keeps the week on the fridge whiteboard.`},{unlock:1,id:`boyd`,text:`Her flight chief, and the man who trained her.`},{unlock:1,id:`fisk`,text:`Her assistant crew chief.`},{unlock:1,id:`vern`,text:`The old navigator from the diner counter. Tuesday, seven o'clock.`}] },

 { id:`vern`, intro:`Vern Pruett. I navigated tankers out of Tolliver, back when they still carried a navigator, and I keep the heritage room on base on Saturdays for the eleven people a year who come in. I'll teach you this test with a pencil and a napkin. Bring your own pencil.`, name:`Vern Pruett`, role:`Lieutenant colonel, retired. The wing's last navigator. Teaches the lessons.`, firstChapter:1, speaker:`Vern`,
   sections:[
    {unlock:1, title:`Who he is`, body:[`Vern is a retired navigator, seventy something, who sits up straighter on a diner stool than most people half his age. Corduroy jacket, a pencil behind his ear, a class ring worn thin on one side. He calls everyone by rank.`,`He navigated two two eight for twenty one years, on and off. Now he keeps the wing's heritage room on Saturdays.`]},
    {unlock:1, title:`The counter`, body:[`He was on the next stool at the Riverside Diner, on the county road a mile outside the main gate, when Kit came in still wearing her flight line coat. He clocked the streamer on her zipper with 228 inked on it before she'd sat down.`,`He took the test himself in 1973, an older version on paper, in a gym that smelled like floor wax.`]},
    {unlock:1, title:`The napkin`, body:[`He doesn't offer. He asks questions, and he waits. On a napkin, in square block capitals, he wrote SEXTANT IS TO NAVIGATOR AS BLANK IS TO CREW CHIEF and slid it over. When Kit asked him to teach her, he gave her a day, a time, and the brick ranch with the dead hedge on Cedar Street.`]}],
   quote:{unlock:1, text:`Bring a pencil, Sergeant. I'm not lending you mine.`},
   ties:[{unlock:1,id:`kit`,text:`The crew chief on his old jet. He'll teach her on Tuesdays.`}] },

 { id:`graham`, intro:`I'm Graham. I teach physics and chemistry at Tolliver High, and I keep our week on the whiteboard on the fridge, because between her plant shifts, my lab nights and drill, somebody has to. On drill weekends I draw a little tanker on Saturday.`, name:`Graham Darrow`, role:`Kit's husband, 36. Physics and chemistry teacher at Tolliver High.`, firstChapter:1, speaker:`Graham`,
   sections:[
    {unlock:1, title:`Who he is`, body:[`Graham teaches physics and chemistry at the high school. Every Sunday he moves Kit's plant shifts around his lab nights on the fridge whiteboard, and on drill weekends he draws a little cartoon tanker in the corner of Saturday.`,`He reads everything standing up, all the way to the end, the same way he reads lab reports. He did the age math on the posting faster than Kit did.`]},
    {unlock:1, title:`Okay`, body:[`When Kit told him she wanted it, he didn't answer right away. Then he said okay, capped the marker without writing anything, and hugged her hard with the marker still in his hand.`]}],
   quote:{unlock:1, text:`So what are you thinking?`},
   ties:[{unlock:1,id:`kit`,text:`His wife.`}] },

 { id:`boyd`, intro:`Master Sergeant Boyd. I've been on the KC-135 since 1996, and I trained the crew chief on two two eight myself. When the wing goes to the new jets, I go too. The shop goes to her. That's the plan, anyway.`, name:`Arlen Boyd`, role:`Master sergeant, 51. Flight chief, and Kit's trainer since she was twenty one.`, firstChapter:1, speaker:`Boyd`,
   sections:[
    {unlock:1, title:`Who he is`, body:[`Boyd is the flight chief. He's been on the KC-135 since 1996 and on Kit since she was twenty one. He taught her to safety wire, to read a forms binder, and to tell a pilot no. His name was on two two eight before hers, and he painted hers over it himself.`,`When the wing converts to the KC-46, around 2030, he'll retire, and he's told Kit more than once that the shop will be hers after him.`]},
    {unlock:1, title:`The look`, body:[`Whenever a board posting goes up he gets a look Kit knows, a man paying on a debt he thinks is his. When he found her reading the pilot posting, he asked her straight if she was thinking about it.`,`Page two of that posting says the application starts with the applicant's immediate supervisor. For Kit, that's him.`]}],
   quote:{unlock:1, text:`Seven years ago I asked you to stay.`},
   ties:[{unlock:1,id:`kit`,text:`His crew chief. He built her to run the shop after him.`},{unlock:1,id:`fisk`,text:`An airman in his flight.`}] },

 { id:`fisk`, intro:`Airman First Class Lonnie Fisk. I'm the assistant crew chief on two two eight, since August. I also work overnights at the distribution center out on Route 9, so if I look tired, that's why. I'm learning. Sergeant Darrow says sign for everything.`, name:`Lonnie Fisk`, role:`Airman first class, 20. Kit's assistant crew chief.`, firstChapter:1, speaker:`Fisk`,
   sections:[
    {unlock:1, title:`Who he is`, body:[`Fisk is twenty and has been Kit's assistant crew chief since August. He comes to drill straight off the overnight at a distribution center on Route 9, sometimes with the scanner lanyard still around his neck.`]},
    {unlock:1, title:`The flashlight`, body:[`On the four o'clock leak check he borrowed Kit's big flashlight out of her toolbox without signing for it, and forgot it was in his vest. She asked him for it quietly, and after the launch she walked him around the side of the truck and let him tell her the whole thing.`,`He asks good questions. What contingent means, and which way the elevator goes when the pilot pulls back.`]}],
   quote:{unlock:1, text:`Three's dry, Sergeant. No leaks. I looked twice.`},
   ties:[{unlock:1,id:`kit`,text:`His crew chief.`},{unlock:1,id:`boyd`,text:`His flight chief.`}] }
);
})();
