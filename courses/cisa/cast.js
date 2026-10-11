// Cast wiki for "Exception Noted" (CISA). Each section unlocks after the reader reaches the given chapter. Only chapter 1 is written,
// so every section here unlocks at 1. Add later sections as chapters land, and never unlock a fact before its chapter.
(function(){
const D=window.HALCYON_DATA=window.HALCYON_DATA||{};
const C=D.cisa=D.cisa||{};
C.cast=C.cast||[];
C.cast.push(
 { id:`henry`, intro:`I'm Henry Ashby. I investigate breach claims for a syndicate at Lloyd's, which means when a company gets hacked and asks for its money, I'm the one who decides whether it's owed. They sent me to Denver eleven months ago. I still wear a tie. The city has opinions about that.`, name:`Henry Ashby`, role:`Breach claims investigator for a Lloyd's syndicate, 42, posted to Denver. You.`, firstChapter:1, speaker:`Henry`,
   look:`White British man, 42, short dark hair going gray at the temples, clean shaven, tired gray eyes, navy suit with a loosened tie, raincoat over one arm, the posture of someone who used to be in the army.`,
   sections:[
    {unlock:1, title:`Who he is`, body:[`Henry grew up in north London, the son of a Lloyd's underwriter. He served in the Intelligence Corps before he went into insurance, and he still reads a room the way he was taught to: exits, hands, what's on the table.`,`He's the Denver investigator for the Vellacott syndicate at One Lime Street. He took the posting to be near his daughter, who lives in Boulder with her mother and doesn't much want to see him.`]},
    {unlock:1, title:`Lime Street`, body:[`In June a woman in the next booth at a diner on Colfax told him he held his fork like it owed him money. That was Dot Kessler. For nine months of Saturdays she taught him how Americans audit things, and called him Lime Street after the address on his card.`,`On Tuesday, March 9, 2027, she was found dead at the Brown Palace holding that card. The same morning, London gave him a 300 million dollar claim with her name in it.`]}],
   quote:{unlock:1, text:`It means she wasn't finished.`},
   ties:[{unlock:1,id:`dot`,text:`His Saturday teacher.`},{unlock:1,id:`maisie`,text:`His daughter. Fourteen.`},{unlock:1,id:`arthur`,text:`His father, in a care home in Muswell Hill.`},{unlock:1,id:`giles`,text:`His boss in London.`}] },

 { id:`dot`, intro:`Dorothy Kessler. Dot, if you're buying breakfast. I spent thirty eight years as a federal IT examiner, reading the paperwork of people who move money for a living. Most of them were honest. All of them thought they were.`, name:`Dorothy Kessler`, role:`Retired federal IT examiner, 71. Henry's teacher. Found dead at the Brown Palace.`, firstChapter:1, speaker:`Dot`,
   look:`White American woman, 71, short silver hair, reading glasses on a beaded chain, blue cardigan, sharp amused eyes, a green ink pen in her hand.`,
   sections:[
    {unlock:1, title:`The examiner`, body:[`Dot examined the IT of banks and the companies that serve them for a federal banking regulator. Her last examinations were of Meridian Clearing, from 2018 to 2026. She retired at the end of them and lived alone off Colfax on the east side.`,`She marked her workpapers in green ink: a tick for agreed, a tick with a bar for agreed to source, a circle for exception. She tore sugar packets into strips while she listened, and she knitted her own tea cozies because hotel pots lose their heat.`]},
    {unlock:1, title:`The last night`, body:[`On Monday night she checked into the Brown Palace for one night and paid cash. At 11:48 she left Henry a voicemail asking him to come at seven and bring a pen, because they were filing in the morning. She was found in the armchair facing the door, with two cups on the tray and one of them clean.`,`Her red folder says Finding one, the capstone, exception noted, see 1994. Her sticky note says Check the year. Don't trust the dome.`]}],
   quote:{unlock:1, text:`A nice man telling you it's all fine is the bottom of the pile, however nice he is.`},
   ties:[{unlock:1,id:`henry`,text:`Lime Street.`},{unlock:1,id:`arthur`,text:`He remembers an American with a red folder.`}] },

 { id:`lou`, intro:`Lou Mancuso, Denver Police. I don't like it when the dead hold business cards. I like it less when the man on the card turns up in a tie.`, name:`Lou Mancuso`, role:`Denver Police detective. Brought two coffees.`, firstChapter:1, speaker:`Lou`,
   look:`White American man in his late fifties, big and broad, gray hair, gray stubble, gray overcoat with the collar up, a police lanyard, a paper coffee cup in each hand.`,
   sections:[
    {unlock:1, title:`The detective`, body:[`Lou caught Dot's death at the Brown Palace. He photographs before he touches, writes down the word guess when you say it, and has no patience for weather when he asked for names. He hasn't decided about Henry yet.`]}],
   ties:[{unlock:1,id:`henry`,text:`Hands in pockets, please.`},{unlock:1,id:`nkechi`,text:`Called the FBI about the card.`}] },

 { id:`giles`, intro:`Giles Fenwick, claims director, Vellacott. Three hundred million, Henry. The whole limit. Friday would be lovely.`, name:`Giles Fenwick`, role:`Henry's claims director in London, at One Lime Street.`, firstChapter:1, speaker:`Giles`,
   look:`White British man, about 60, thinning fair hair swept back, ruddy cheeks, pinstripe suit, open collar, a man who has just come in from a brisk walk.`,
   sections:[
    {unlock:1, title:`London`, body:[`Giles runs claims for the fictional Vellacott syndicate and talks as if he's just come in from a brisk walk. He assigned Henry the Meridian claim because Henry is the only one of them in the same time zone as the damage. He wants a view by Friday, because the board asks on Monday.`]}],
   ties:[{unlock:1,id:`henry`,text:`His man in Denver.`}] },

 { id:`nkechi`, intro:`Special Agent Nkechi Obi, FBI, Denver cyber squad. I'd like your file. Informally. Today.`, name:`Nkechi Obi`, role:`FBI special agent, Denver cyber squad.`, firstChapter:1, speaker:`Nkechi`,
   look:`Black woman of Nigerian heritage, about 40, close cropped natural hair, navy parka over a plain blazer, a credential wallet held up steadily, calm and unreadable.`,
   sections:[
    {unlock:1, title:`The agent`, body:[`Meridian reported its ransomware to the FBI on Friday. On Tuesday a Denver detective rang to say a retired examiner had died holding a claims investigator's card, so Agent Obi climbed the stairs above a bicycle shop on Wazee Street. She expected the answer about counsel. She found the voicemail useful.`]}],
   ties:[{unlock:1,id:`henry`,text:`Holds evidence she wants.`},{unlock:1,id:`lou`,text:`He called her in.`}] },

 { id:`maisie`, intro:`I'm Maisie. I'm fourteen. My science fair project is on Benford's law, which is how you can tell when somebody made numbers up. It's not about my dad.`, name:`Maisie Ashby`, role:`Henry's daughter, 14. Lives in Boulder with her mother.`, firstChapter:1, speaker:`Maisie`,
   look:`Girl, 14, long curly brown hair in a loose ponytail, oversized hoodie, phone in hand, guarded expression.`,
   sections:[
    {unlock:1, title:`Boulder`, body:[`Maisie lives in Boulder with her mother, Laura, and her stepfather. She hadn't rung her father in six weeks when she called him at 6:47 on Tuesday morning and then texted never mind.`,`Her science fair is Thursday at six. The project is Benford's law: in a lot of real numbers, the first digit is 1 about thirty percent of the time, and made up numbers come out too even.`]}],
   ties:[{unlock:1,id:`henry`,text:`Her dad. It's complicated.`},{unlock:1,id:`laura`,text:`Her mum.`}] },

 { id:`arthur`, intro:`Arthur Ashby. Underwriter. I had a box in the Room for thirty years. They rang the Lutine today, you know. Good news.`, name:`Arthur Ashby`, role:`Henry's father, 79. Retired Lloyd's underwriter with dementia, in a care home in north London.`, firstChapter:1, speaker:`Arthur`,
   look:`White British man, 79, thin white hair, large frame gone slight, cardigan over a collared shirt and tie, kind confused eyes, sitting in a care home armchair.`,
   sections:[
    {unlock:1, title:`Elmcroft`, body:[`Arthur wrote risks at Lloyd's for most of his working life and has lived at Elmcroft, a care home in Muswell Hill, since the autumn. He does better before the evening news. The night nurse holds the phone for him on Tuesdays.`,`On the first Tuesday of the Meridian claim he asked whether Dorothy had found Henry. The American girl, with the red folder. He said she'd come to the Room about a Denver risk in 1994, and that he'd put a line on it. His last big line.`]}],
   ties:[{unlock:1,id:`henry`,text:`His son.`},{unlock:1,id:`precious`,text:`Holds the phone.`},{unlock:1,id:`dot`,text:`Remembers her, maybe.`}] },

 { id:`precious`, intro:`Precious Mensah. I'm the night nurse at Elmcroft. He's had a good day. I'll hold the phone, he keeps dropping it.`, name:`Precious Mensah`, role:`Night nurse at Elmcroft care home in Muswell Hill.`, firstChapter:1, speaker:`Precious`,
   look:`Black British woman of Ghanaian heritage, about 45, hair wrapped neatly, navy nurse's tunic, warm and practical expression.`,
   sections:[
    {unlock:1, title:`Tuesdays at eight`, body:[`Precious rings Henry at eight on Tuesday evenings, London time, because Arthur does better before the news. She keeps the visitors' book and offered to check last year's for a Dorothy.`]}],
   ties:[{unlock:1,id:`arthur`,text:`Her patient.`}] },

 { id:`leonard`, intro:`Leonard Pratt, director of internal audit at Meridian Clearing. Happy to walk you through our report so you don't have to reinvent the wheel.`, name:`Leonard Pratt`, role:`Director of internal audit at Meridian Clearing. Reports to the CFO.`, firstChapter:1, speaker:`Leonard`,
   look:`White American man, about 50, neat brown hair, rimless glasses, pressed blue shirt with a company lanyard, eager smile.`,
   sections:[
    {unlock:1, title:`Internal audit`, body:[`Leonard sent Henry Meridian's 2026 IT general controls report before anyone asked for it. Controls effective, no significant findings, signed off by the CFO he reports to. His charter is signed by the CFO too, and by nobody on the board. His workpapers will take a little longer.`]}],
   ties:[{unlock:1,id:`henry`,text:`Very helpful.`}] },

 { id:`laura`, intro:`Laura. Maisie's mother. I'd like her to have a father who picks up.`, name:`Laura`, role:`Maisie's mother and Henry's ex wife. Lives in Boulder.`, firstChapter:1, speaker:`Laura`,
   look:`American woman, early forties, shoulder length auburn hair, fleece jacket, reading glasses pushed up on her head, patient but tired expression.`,
   sections:[
    {unlock:1, title:`Boulder`, body:[`Laura lives in Boulder with Maisie and her husband. She told Maisie to ask Henry to the science fair.`]}],
   ties:[{unlock:1,id:`maisie`,text:`Her daughter.`},{unlock:1,id:`henry`,text:`Her ex husband.`}] }
);
})();
