// Cast wiki for "The Cascade Chair" (CPHIMS). Each section unlocks after the reader reaches the given chapter, so nothing is spoiled.
// Portraits: courses/cphims/cast/<id>.svg (tools/cast_avatars_cphims.py). Voice samples: courses/cphims/cast/voice (tools/cast_samples.py cphims).
(function(){
const D=window.HALCYON_DATA=window.HALCYON_DATA||{};
const C=D.cphims=D.cphims||{};
C.cast=C.cast||[];
C.cast.push(
 { id:`maria`, intro:`I'm Maria Santos. Fourteen years as an ICU nurse in Greeley, then informatics, and now Vice President of Clinical Systems at Cascade Valley Health. Eleven hospitals, one old system, and a letter on my first day that says it's going away. I'm used to fixing things myself at two in the morning. I'm told that has to change.`, name:`Maria Santos`, role:`Vice President of Clinical Systems, 44. Former ICU nurse. You.`, firstChapter:1, speaker:`Maria`,
   look:`Latina woman, 44, dark hair in a low knot, navy blazer over a plain top, a hospital badge clipped at the collar, steady eyes that have worked a lot of night shifts.`,
   sections:[
    {unlock:1, title:`Who she is`, body:[`Maria spent fourteen years at the bedside in the Greeley ICU before she moved into nursing informatics. She was Cascade's product owner on the Penwright launch, the system that drafts a clinician's note while they talk, and she stayed with it until it was boring, which is the goal.`,`Now she owns the electronic health record, every clinical application that plugs into it, the interfaces between them, and the analysts who keep it all running across eleven hospitals, forty clinics and a home health agency.`]},
    {unlock:1, title:`How she works`, body:[`Fast, fierce about patient safety, and used to being the person who gets the call at 2 AM and fixes it herself. That habit made her good at the bedside. It's the thing her new job keeps asking her to put down.`]},
    {unlock:1, title:`At home`, body:[`Her daughter Lucia is seventeen and applying to nursing school. Lucia asks the questions Maria would rather not answer.`]},
    {unlock:3, title:`Something she doesn't talk about`, body:[`There's a night from her first year on the unit that Maria keeps to herself. A transfer from a small Wyoming hospital, and a page that wasn't there. She mentions it once and changes the subject.`]},
    {unlock:12, title:`The chair`, body:[`By the end of the book the board has a question for her about the chair at the head of the table. Play it to find out what she answers.`]}
   ],
   ties:[{id:`ochoa`, unlock:1, text:`Her boss and the one who hired her.`},{id:`lucia`, unlock:1, text:`Her daughter.`},{id:`irene`, unlock:8, text:`Her old charge nurse in Greeley.`}]},

 { id:`ochoa`, intro:`Raymond Ochoa, CIO. I hired Maria because she's been woken up by every system we own. I'd like that to stop being an accident. Breakfast is at the diner, 7:30, and I'll want a legal pad on the table. Before you fix anything, know what you own and who you serve.`, name:`Dr. Raymond Ochoa`, role:`Chief Information Officer, Cascade Valley Health. Maria's boss.`, firstChapter:1, speaker:`Ochoa`,
   look:`Hispanic man in his early sixties, short gray hair, reading glasses pushed up, open collar shirt under a gray sport coat, a yellow legal pad under one arm.`,
   sections:[
    {unlock:1, title:`Who he is`, body:[`Ochoa runs information technology for all of Cascade. He's skeptical, fair, and blunt about money, and he wants the truth early, even when it's bad. His lessons happen over breakfast at a diner in Greeley, on a legal pad.`]},
    {unlock:1, title:`How he teaches`, body:[`He pushes Maria to think like an executive, and sometimes he pushes too hard. He'll ask what a choice costs before he asks whether it's right, and then he'll ask whether it's right.`]},
    {unlock:12, title:`What he hadn't said`, body:[`Ochoa had a plan of his own the whole time. It comes out in the last chapter.`]}
   ],
   ties:[{id:`maria`, unlock:1, text:`He hired her and tests her.`},{id:`glenn`, unlock:6, text:`The CFO he answers to on money.`}]},

 { id:`lucia`, intro:`I'm Lucia. Maria's daughter. I'm applying to nursing school, which my mom says is great in the voice she uses when she means it's complicated. I ask her questions. She answers some of them.`, name:`Lucia`, role:`Maria's daughter, 17. Applying to nursing school.`, firstChapter:1, speaker:`Lucia`,
   look:`Latina girl, 17, long dark hair in a messy ponytail, a hoodie with the sleeves pushed up, a laptop under one arm, a look that's already ahead of the conversation.`,
   sections:[
    {unlock:1, title:`Who she is`, body:[`Lucia is seventeen, quick, and dry, and she's decided she wants to be a nurse like her mother was. She writes her application essays at the kitchen table and asks Maria the hard questions on purpose.`]},
    {unlock:7, title:`Where she's going`, body:[`Lucia picks a nursing program, and her reason matters to her mother more than she lets on.`]}
   ],
   ties:[{id:`maria`, unlock:1, text:`Her mother.`}]},

 { id:`kiran`, intro:`Kiran Bhatt, senior EHR analyst. I build order sets and medication workflows. I used to be a pharmacy tech, so I know what happens when a screen is wrong. If you need something by morning, I usually have a proposal ready. Where do you want to start?`, name:`Kiran Bhatt`, role:`Senior EHR analyst. Former pharmacy technician.`, firstChapter:1, speaker:`Kiran`,
   look:`South Asian man, early thirties, short black hair, rolled shirtsleeves, a lanyard badge, two pens in his shirt pocket, eager and a little tired.`,
   sections:[
    {unlock:1, title:`Who he is`, body:[`Kiran builds the order sets and medication workflows nurses and doctors use every day. He's precise, quick, and always ready with a plan. He never says no, and he never says he's drowning.`]},
    {unlock:9, title:`Two in the morning`, body:[`Kiran is the person Maria used to be. Chapter 9 is where that stops being a compliment.`]}
   ],
   ties:[{id:`maria`, unlock:1, text:`His boss.`},{id:`marcus`, unlock:1, text:`Works the other side of every interface with him.`}]},

 { id:`marcus`, intro:`Marcus Bell. Interfaces. Twenty two years of HL7, and I know where every message in this company goes, because I put it there. The emergency change note had my timestamps, so the firewall team found their side in ten minutes. That part went right.`, name:`Marcus Bell`, role:`Interface engineer. Twenty two years of HL7.`, firstChapter:1, speaker:`Marcus`,
   look:`Black man in his fifties, close cropped gray beard, bald, a fleece vest over a flannel shirt, reading glasses on a cord, a coffee mug that says RELAY.`,
   sections:[
    {unlock:1, title:`Who he is`, body:[`Marcus runs Relay, the interface engine nobody else fully understands. He's grumpy, funny, and the reason messages reach the right place. He keeps most of it in his head.`]},
    {unlock:3, title:`The one point of failure`, body:[`What happens when the only person who understands a system is unreachable? Chapter 3 finds out, and Marcus has reasons for being that person.`]},
    {unlock:8, title:`Teaching`, body:[`Marcus starts teaching two junior analysts what he knows, which turns out to be harder than doing it himself.`]}
   ],
   ties:[{id:`kiran`, unlock:1, text:`They build both ends of a feed.`},{id:`nate`, unlock:3, text:`Security keeps asking about his access.`}]},

 { id:`aisha`, intro:`Aisha Rahman, Chief Medical Information Officer. I'm a hospitalist, I read the data, and I want a warning on the screen for every way a patient can get hurt. Thank you for not going around us.`, name:`Dr. Aisha Rahman`, role:`Chief Medical Information Officer. Hospitalist.`, firstChapter:1, speaker:`Aisha`,
   look:`South Asian woman, early forties, dark hair pinned up, small gold earrings, white coat over a gray blouse, a tablet in hand, quick and focused.`,
   sections:[
    {unlock:1, title:`Who she is`, body:[`Aisha represents the physicians in every system decision. She's brilliant, data driven, and an ally to Maria, and sometimes a rival for the same budget.`]},
    {unlock:5, title:`The alert`, body:[`Aisha wants a sepsis alert at all eleven hospitals by spring. Chapter 5 is what happens when an alert fires too often.`]}
   ],
   ties:[{id:`maria`, unlock:1, text:`Her peer and her ally.`},{id:`glenn`, unlock:6, text:`They don't count benefits the same way.`}]},

 { id:`joan`, intro:`Joan Whitfield, privacy officer. I'm not against technology. I'm against surprises. You called me before I had to call you. Keep doing that.`, name:`Joan Whitfield`, role:`Privacy officer.`, firstChapter:2, speaker:`Joan`,
   look:`White woman in her late fifties, silver bob, rimless glasses, a charcoal cardigan over a collared blouse, a thin binder held flat against her chest.`,
   sections:[
    {unlock:2, title:`Who she is`, body:[`Joan keeps Cascade on the right side of HIPAA and every other rule about patient information. She's precise and unflappable. She's the person Maria forgets to call, at first.`]},
    {unlock:10, title:`When it matters`, body:[`In chapter 10, Joan is the one who decides what counts as a breach and who has to be told.`]}
   ],
   ties:[{id:`maria`, unlock:2, text:`Learns to call her first.`},{id:`nate`, unlock:10, text:`Works the breach with him.`}]},

 { id:`nate`, intro:`Nate Ostrowski, Chief Information Security Officer. I was an Army signal officer before this. I stay calm in a crisis. What I don't stay calm about is a shared login. A backup who isn't on call, isn't trained, and doesn't open change tickets isn't a backup.`, name:`Nate Ostrowski`, role:`Chief Information Security Officer. Former Army signal officer.`, firstChapter:3, speaker:`Nate`,
   look:`White man in his late forties, high and tight graying hair, clean shaven, a pressed blue button down with the sleeves down, an ID badge on a black lanyard.`,
   sections:[
    {unlock:3, title:`Who he is`, body:[`Nate runs security for Cascade. Calm, exact, and short on patience for clinicians who share passwords. He's the one who asks who else has access.`]},
    {unlock:10, title:`The lock`, body:[`Chapter 10 is Nate's chapter as much as Maria's: an incident, a plan, and the days that follow.`]}
   ],
   ties:[{id:`marcus`, unlock:3, text:`Keeps asking about his access.`},{id:`joan`, unlock:10, text:`Works the breach with her.`}]},

 { id:`walt`, intro:`Walt Hagen. General surgeon, Laramie, thirty one years. I print every note and I count the clicks out loud, because somebody should. Fewer clicks. I'll hold you to that.`, name:`Dr. Walt Hagen`, role:`General surgeon at the Laramie hospital. Thirty one years in practice.`, firstChapter:1, speaker:`Walt`,
   look:`White man in his early sixties, thinning white hair, deep lines, scrubs under a long white coat, reading glasses low on his nose, a printed note folded in his hand.`,
   sections:[
    {unlock:1, title:`Who he is`, body:[`Walt has been a surgeon in Laramie for thirty one years. He prints every note, counts clicks out loud, and tells anyone who'll listen when a screen got worse. He's the skeptic.`]},
    {unlock:4, title:`What he's right about`, body:[`In chapter 4 Walt says something nobody wants to hear, and it matters whether anyone listens.`]},
    {unlock:11, title:`On the floor`, body:[`By go-live, Walt has a different job on his own floor than anyone expected.`]}
   ],
   ties:[{id:`maria`, unlock:1, text:`His complaint is on her desk on day one.`}]},

 { id:`glenn`, intro:`Glenn Morrow, CFO. I'm not against spending. I'm against soft numbers. Ask my reimbursement team for that number. Don't guess it.`, name:`Glenn Morrow`, role:`Chief Financial Officer.`, firstChapter:6, speaker:`Glenn`,
   look:`White man in his late fifties, neat gray hair, wire glasses, a dark suit and a plain tie, a calculator and a sharpened pencil on the table in front of him.`,
   sections:[
    {unlock:6, title:`Who he is`, body:[`Glenn wants net present value, not adjectives. He isn't hostile, he's exact, and he notices every number that was rounded up.`]},
    {unlock:6, title:`Where he started`, body:[`His first job was the cost report for a twenty bed hospital in western Nebraska. He's been reading the fine print ever since.`]}
   ],
   ties:[{id:`ochoa`, unlock:6, text:`The CIO answers to him on money.`},{id:`aisha`, unlock:6, text:`They count benefits differently.`}]},

 { id:`brett`, intro:`Brett Talbot, Corvane. I'm the account executive, which means I'm the one you call when something's wrong, and the one who brings the good tickets when something's right. Most customers just turn it on.`, name:`Brett Talbot`, role:`Account executive for Corvane, the EHR vendor.`, firstChapter:5, speaker:`Brett`,
   look:`White man in his late thirties, styled brown hair, a quarter zip with a small logo over a collared shirt, an easy grin, a phone in his hand.`,
   sections:[
    {unlock:5, title:`Who he is`, body:[`Brett sells and supports Corvane, the electronic health record most of Cascade runs on. He's charming, generous with dinners and suite tickets, and under quota pressure.`]},
    {unlock:7, title:`The selection`, body:[`When Cascade picks partners in chapter 7, Brett's friendliness becomes a question Maria has to answer.`]}
   ],
   ties:[{id:`maria`, unlock:5, text:`His biggest customer contact.`}]},

 { id:`tasha`, intro:`Tasha Greene, service desk. I read the tickets. All of them. Forty minutes each, at the rate we're verifying.`, name:`Tasha Greene`, role:`Service desk manager.`, firstChapter:9, speaker:`Tasha`,
   look:`Black woman in her forties, natural hair pulled back, a headset around her neck, a cardigan over a company polo, a second monitor's glow on her glasses.`,
   sections:[
    {unlock:9, title:`Who she is`, body:[`Tasha runs the service desk and lives in the ticket data. She sees a problem a week before anyone else does, if anyone asks her.`]}
   ],
   ties:[{id:`maria`, unlock:9, text:`Maria learns to read her trend reports.`}]},

 { id:`gail`, intro:`Gail, Chief Nursing Officer in Rawlins. We're a small hospital at the far end of the road. We'd have loved to have you. The road had other plans.`, name:`Gail`, role:`Chief Nursing Officer, the Rawlins hospital.`, firstChapter:4, speaker:`Gail`,
   look:`White woman in her late fifties, short practical gray hair, a fleece over navy scrubs, a ring of keys on a lanyard, weathered and steady.`,
   sections:[
    {unlock:4, title:`Who she is`, body:[`Gail runs nursing at Rawlins, the smallest and farthest of Cascade's Wyoming hospitals. She's plainspoken and proud of her staff.`]},
    {unlock:5, title:`Her numbers`, body:[`Gail starts watching her own numbers closely, and she asks for the truth.`]}
   ],
   ties:[{id:`maria`, unlock:4, text:`Maria owes her a straight answer.`}]},

 { id:`denise`, intro:`Denise Harmon. Nurse manager in Cheyenne. I fought the last launch, then I helped run it. You're in my building. I hear you've been counting things.`, name:`Denise Harmon`, role:`Nurse manager, Cheyenne. A superuser from the Penwright launch.`, firstChapter:4, speaker:`Denise`,
   look:`Black woman in her fifties, short natural hair, reading glasses on her head, navy scrubs with a manager's badge, arms folded, half a smile.`,
   sections:[
    {unlock:4, title:`Who she is`, body:[`Denise fought the Penwright launch, then became one of its best champions. She tells Maria the truth about her floor, whether Maria wants it or not.`]}
   ],
   ties:[{id:`maria`, unlock:4, text:`They've done a launch together.`}]},

 { id:`theo`, intro:`Theo Reyes, Penwright. Ten years of nights in the Greeley ICU before I switched sides. Maria was my partner on that unit. Now I'm the vendor, so she checks my math. Build it once. I'll tell Cheyenne the why.`, name:`Theo Reyes`, role:`Director of Clinical Delivery at Penwright. Maria's old night shift partner.`, firstChapter:1, speaker:`Theo`,
   look:`White man in his mid forties, sandy hair going gray, a quarter zip with a small logo, an easy smile, a coffee in hand.`,
   sections:[
    {unlock:1, title:`Who he is`, body:[`Theo and Maria worked nights together in the Greeley ICU for ten years. He left the bedside first and told her she'd be good at informatics. Now he's on the vendor side of her biggest contract: warm, honest, and still a vendor.`]}
   ],
   ties:[{id:`maria`, unlock:1, text:`Her old night shift partner.`},{id:`irene`, unlock:8, text:`They both came up under her.`}]},

 { id:`irene`, intro:`Irene Kowalski. I ran the Greeley ICU, a long time ago now. I taught two of the best nurses I ever had, and one of them hasn't called me in four years. You're here now. Sit down before it gets cold.`, name:`Irene Kowalski`, role:`Retired Greeley ICU nurse manager, 71.`, firstChapter:8, speaker:`Irene`,
   look:`White woman, 71, short white hair, sharp eyes behind round glasses, a cardigan over a turtleneck, a coffee mug in each hand.`,
   sections:[
    {unlock:8, title:`Who she is`, body:[`Irene was the night charge nurse when Maria started in Greeley and the unit manager for Maria's last decade there. She ran the ICU on paper through a nineteen hour downtime and wrote the unit's first downtime binder afterward.`]},
    {unlock:8, title:`Coffee`, body:[`She still lives in the same brick house in west Greeley. Chapter 8 is the coffee.`]}
   ],
   ties:[{id:`maria`, unlock:8, text:`She taught Maria.`},{id:`theo`, unlock:8, text:`She taught Theo too.`}]},

 { id:`henry`, intro:`Morning. Henry Ashby, for the insurer. I'll want the logs and the images as your team preserved them, with the hashes, and a record of who's handled them.`, name:`Henry Ashby`, role:`The cyber insurer's breach investigator. A Londoner based in Denver.`, firstChapter:10, speaker:`Henry`,
   look:`White man in his early forties, dark hair going gray at the temples, a navy blazer over a loosened tie, a hard case under one arm, tired eyes that miss nothing.`,
   sections:[
    {unlock:10, title:`Who he is`, body:[`The insurer sends Henry on day four. He's polite, dry and exact, he asks for evidence as it was preserved, and he won't log in to look for himself.`]}
   ],
   ties:[{id:`nate`, unlock:10, text:`Asks him who decided the backups were clean.`}]}
);
})();
