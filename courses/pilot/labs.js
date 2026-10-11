// Danny's Logbook labs: optional hands-on work, registered by chapter number. Engine: lab.js. Every number below comes from the chapter
// it sits in or from the primary source named next to it. Copy rules: plain words, no dashes, Abby talks to "you".
//
// Ch 3 METAR: decoded per the FAA Aviation Weather Handbook, FAA-H-8083-28B, ch 24 (wind dddff(Gfmfm)KT in degrees true and knots,
// VRB, 00000KT calm; visibility in statute miles with whole numbers and fractions, P6SM; sky cover FEW SCT BKN OVC and VV with heights
// in hundreds of feet AGL; ceiling = lowest BKN, OVC, or vertical visibility; altimeter A followed by inches of mercury times 100):
// https://www.faa.gov/sites/faa.gov/files/FAA-H-8083-28B.pdf . Live data: https://aviationweather.gov/data/api/ through /api/metar.
// The offline sample is the chapter's own fictional fog METAR from courses/pilot/full/ch03.js.
//
// Ch 4 chart: FAA Denver VFR Sectional, GeoTIFF from https://aeronav.faa.gov/visual/09-03-2026/sectional-files/Denver.zip (metadata:
// publication 2026-07-09, current through 2026-10-28; Lambert conformal conic, NAD83). Cropped to pixels x 14100 to 15850, y 380 to
// 1940 of the full chart and scaled to 1150 x 1025. Points were placed by projecting coordinates into the chart's own georeference, then
// checked by eye against the image and against the Denver Class B legal description, Federal Register 2026-06762 (effective
// 2026-07-09): https://www.federalregister.gov/documents/full_text/text/2026/04/08/2026-06762.txt . Point of Origin 39-48-45N
// 104-39-39W, radials treated as magnetic. Distances below are from the Point of Origin.
//   A  KAPA 39-34-12N 104-50-57W, 17.0 NM at 211 true. Class D "-80" box on the chart (FR 2024-30530: surface to but not including
//      8,000 MSL). Above it Area E, 8,000 to 12,000 (the FAA's Centennial pilot page: "The base of the KDEN Class B airspace over KAPA is 8,000").
//   B  39.396N 104.680W near Franktown, 25.0 NM at 182 true: Area L, 9,000 to 12,000. Chart label 120 over 90 right next to it.
//   C  39.644N 104.190W, 24.0 NM at 115 true: Area M, 10,000 to 12,000. Chart label 120 over 100 in the same piece.
//   D  39.573N 104.560W, 15.1 NM at 162 true: Area E (10 to 20 miles, south of the 090 radial, east of I-25), 8,000 to 12,000.
//      13 NM from Centennial, well outside its Class D. No line of the Class B separates D from Centennial.
//   E  39.869N 104.402W, 12.4 NM at 074 true: Area F (10 to 15 miles between the 025 and 090 radials), 7,000 to 12,000. Label 120 over 70.
//   F  39.891N 104.718W, 5.4 NM at 331 true, on Denver International: Area A, surface to 12,000. Label 120 over SFC.
//   Bennett and Cherry Creek Reservoir were left out on purpose: both sit on a Class D boundary line on this chart.
//
// Ch 5 weight and balance: Biscuit's numbers exactly as ch05.js uses them (basic empty 1,486 lb at +39.5, moment 58,697; front seats +37,
// rear +73, baggage +95 max 120 lb, fuel +48, 40 gal usable at 6 lb/gal, max 2,300 lb; CG +35.0 to +47.3 at 1,950 lb or less, +38.5 to
// +47.3 at 2,300 lb, straight line between, from TCDS 3A12). Russ's sheet and the weight shift are scene f5s10.
//
// Ch 9 wind triangle: the chapter's formulas (WCA = asin(ws sin(wd minus TC) / TAS), GS = TAS cos WCA minus ws cos(wd minus TC)),
// TAS 105, wind 320 true at 16, and the nav log legs in scene f9s6: BEND to Strasburg TC 046 (WCA -9, TH 037, GS 103) and
// Strasburg to KCFO TC 290 (WCA +4, TH 294, GS 91).
(function(){
const LABS=(window.HALCYON_LABS=window.HALCYON_LABS||{});
const f0=n=>Math.round(n).toLocaleString("en-US"),f1=n=>n.toFixed(1),f2=n=>n.toFixed(2);
const pad3=n=>String(((Math.round(n)%360)+360)%360||360).padStart(3,"0");

/* ---------- METAR ---------- */
function metar(raw){
  const body=String(raw).replace(/\s+RMK\s[\s\S]*$/,"").trim().split(/\s+/);const o={raw,wind:null,vis:null,visP:false,clouds:[],alt:null};
  for(let i=0;i<body.length;i++){const t=body[i];let m;
    if(!o.wind&&(m=t.match(/^(\d{3}|VRB)(\d{2,3})(?:G(\d{2,3}))?KT$/)))o.wind={dir:m[1]==="VRB"?"VRB":+m[1],spd:+m[2],gust:m[3]?+m[3]:null};
    else if(o.vis===null&&/^\d$/.test(t)&&/^\d\/\dSM$/.test(body[i+1]||"")){const [a,b]=body[i+1].replace("SM","").split("/");o.vis=+t+a/b;i++}
    else if(o.vis===null&&(m=t.match(/^([PM])?(\d+)(?:\/(\d+))?SM$/))){o.vis=m[3]?m[2]/m[3]:+m[2];o.visP=m[1]==="P"}
    else if((m=t.match(/^(FEW|SCT|BKN|OVC|VV)(\d{3})/)))o.clouds.push({c:m[1],h:+m[2]*100});
    else if((m=t.match(/^A(\d{4})$/)))o.alt=+m[1]/100}
  if(!o.wind||o.vis===null||o.alt===null)throw new Error("unreadable");
  const ceil=o.clouds.filter(c=>/BKN|OVC|VV/.test(c.c)).map(c=>c.h);o.ceil=ceil.length?Math.min(...ceil):null;
  const calm=o.wind.dir===0&&o.wind.spd===0;o.calm=calm;return o}
const metarSample="METAR KAPA 061153Z 07009KT 2SM BR OVC004 09/08 A3021 RMK AO2 SLP232 T00890078";
const fmtVis=c=>c.visP?"more than 6 statute miles (P6SM)":`${c.vis} statute mile${c.vis===1?"":"s"}`;

LABS.pilot={
3:[{id:"p3metar",kind:"live",title:"Decode Centennial, right now",
  hook:[`Enough of my made up reports. This one's real. It's Centennial as of the last hour, and it doesn't care whether you've had coffee.`,`Decode the four things I'd ask you for before we walk to the airplane. Then look out a window and see if it agrees.`],
  live:{url:"/api/metar?ids=KAPA",sample:metarSample,parse:metar,sampleNote:"Sample report from chapter 3 (the live feed didn't answer). The lab works the same way.",
    show:c=>`Everything after RMK is remarks. You can skip them for this.`,
    tests:[["METAR KAPA 111753Z 21017G22KT 10SM FEW070 SCT130 SCT200 25/04 A2987 RMK AO2 PK WND 23029/1716",c=>c.wind.dir===210&&c.wind.spd===17&&c.wind.gust===22&&c.vis===10&&c.ceil===null&&c.alt===29.87],
      ["METAR KDEN 010000Z VRB03KT P6SM BKN012 OVC030 10/05 A3001",c=>c.wind.dir==="VRB"&&c.visP&&c.vis===6&&c.ceil===1200],
      ["METAR KAPA 010000Z 00000KT 1 1/2SM BR VV002 05/05 A2990",c=>c.calm&&c.vis===1.5&&c.ceil===200&&c.alt===29.9],
      ["SPECI KAPA 010000Z 36010KT M1/4SM FG OVC001 02/02 A3010",c=>c.wind.dir===360&&c.vis===0.25&&c.ceil===100],
      ["METAR KAPA 010000Z AUTO 18005KT 10SM CLR 20/M02 A3012 RMK AO2 SLP100",c=>c.ceil===null&&c.clouds.length===0&&c.alt===30.12]]},
  source:`Live METAR from aviationweather.gov, the NWS Aviation Weather Center. Decoding follows the FAA Aviation Weather Handbook, FAA-H-8083-28B, chapter 24.`,
  questions:[
   {id:"wdir",type:"number",kb:"text",q:`Which way is the wind coming from, in degrees? Type <b>calm</b> or <b>VRB</b> if that's what it says.`,unit:"degrees true",
    check:(v,c)=>{const s=String(v).trim().toLowerCase();if(c.wind.dir==="VRB")return /^(vrb|variable)/.test(s);if(c.calm)return /^(calm|0+)$/.test(s);const n=HalcyonLab.num(v);return n!==null&&n===c.wind.dir},
    show:c=>c.wind.dir==="VRB"?"Variable (VRB)":c.calm?"Calm":`${String(c.wind.dir).padStart(3,"0")} degrees true`,
    hints:[`It's the first group after the date and time, the one ending in KT.`,`The first three digits are the direction the wind blows from, in degrees true. METAR winds are true, not magnetic.`],
    sol:c=>[`The wind group is <b>${c.raw.match(/\b(\d{3}|VRB)\d{2,3}(G\d{2,3})?KT\b/)[0]}</b>. ${c.wind.dir==="VRB"?"VRB means the direction is variable.":c.calm?"Five zeros means calm.":`The first three digits, ${String(c.wind.dir).padStart(3,"0")}, are where it's coming from, in degrees true.`} The ATIS and the tower give you magnetic. The METAR doesn't.`]},
   {id:"wspd",type:"number",q:`How fast is the steady wind, in knots? Leave the gust out.`,unit:"knots",a:c=>c.wind.spd,tol:0,
    hints:[`Same group. The two digits after the direction are the speed.`,`A G and more digits would be the gust. The question wants the number before the G.`],
    sol:c=>[`Steady wind ${c.wind.spd} knots${c.wind.gust?`, gusting ${c.wind.gust}. Plan your crosswind on the gust, not the steady number`:". No gust reported"}.`]},
   {id:"vis",type:"number",kb:"text",q:`What's the visibility, in statute miles? Fractions are fine, like 1 1/2.`,unit:"SM",
    check:(v,c)=>{const s=String(v).trim().toLowerCase();if(c.visP&&/^(p6|6\+|>\s*6|more than 6|greater than 6)/.test(s))return true;const n=HalcyonLab.num(v);return n!==null&&Math.abs(n-c.vis)<0.01},
    show:fmtVis,
    hints:[`Look for the group ending in SM.`,`P6SM means more than six. A number and a fraction can be split across two groups, like 1 1/2SM.`],
    sol:c=>[`Visibility is ${fmtVis(c)}. ${c.vis<3?"Under 3 miles is under basic VFR in controlled airspace near the surface. We'd be staying home.":"That's at least the 3 miles basic VFR wants here."}`]},
   {id:"ceil",type:"number",kb:"text",q:`What's the ceiling, in feet above the ground? If there isn't one, type <b>none</b>.`,unit:"feet AGL",
    check:(v,c)=>{const s=String(v).trim().toLowerCase();if(c.ceil===null)return /^(none|no( ceiling)?|nil|n\/?a|unlimited|clear)$/.test(s);const n=HalcyonLab.num(v);return n!==null&&n===c.ceil},
    show:c=>c.ceil===null?"None":`${f0(c.ceil)} feet AGL`,
    hints:[`A ceiling is the lowest layer that's broken (BKN) or overcast (OVC), or a vertical visibility (VV). FEW and SCT don't count.`,`Cloud heights are three digits in hundreds of feet above the ground. 004 is 400 feet. 120 is 12,000.`],
    sol:c=>[c.clouds.length?`Layers: ${c.clouds.map(x=>`${x.c} at ${f0(x.h)}`).join(", ")}. `+(c.ceil===null?`None of them are broken or overcast, so there's no ceiling.`:`The lowest broken, overcast, or vertical visibility layer is at ${f0(c.ceil)} feet AGL. That's the ceiling.`):`No cloud layers reported, so there's no ceiling.`,`Heights in a METAR are above the ground. Add field elevation, 5,885, to get MSL.`]},
   {id:"alt",type:"number",q:`What's the altimeter setting, in inches of mercury?`,unit:"inHg",a:c=>c.alt,tol:0.005,
    hints:[`It's the group that starts with A.`,`A3021 means 30.21. Put the decimal point after the first two digits.`],
    sol:c=>[`A${String(Math.round(c.alt*100))} is ${c.alt.toFixed(2)} inches. That's what goes in the Kollsman window, and what you'd use for pressure altitude: 29.92 minus the setting, times 1,000, added to field elevation.`]}
  ]}],

4:[{id:"p4chart",kind:"chart",title:"What's over each circle",img:"labs/denver-sectional-kapa.jpg",w:1150,h:1025,
  alt:"A crop of the FAA Denver sectional chart around Centennial Airport, with six lettered points",
  credit:`Chart: FAA Denver Sectional, edition effective July 9, 2026, cropped around Centennial. Public domain. Not for navigation.`,
  hook:[`That's the real chart, cut down to our corner. Six circles. Tell me what's over each one.`,`Floors and ceilings in the blue fractions are MSL, in hundreds of feet. Tap a letter to jump to its question, and zoom in if you need to. If you can do this at the kitchen table, you can do it at 7,500 with the sun in your eyes.`],
  points:[{id:"A",x:179,y:660},{id:"B",x:414,y:954,tag:"l"},{id:"C",x:1055,y:507,tag:"l"},{id:"D",x:565,y:644},{id:"E",x:759,y:128},{id:"F",x:338,y:102}],
  source:`Answers checked against the chart itself and the Denver Class B legal description in Federal Register 2026-06762, effective July 9, 2026.`,
  questions:[
   {id:"a1",pt:"A",type:"choice",q:`Point A is Centennial. What airspace starts at the surface there, and where does it stop?`,
    opts:[`Class D, up to but not including 8,000 MSL`,`Class B, from the surface to 12,000 MSL`,`Class C, from the surface to 8,000 MSL`,`Class D, from the surface to 2,500 AGL`],a:0,
    hints:[`Look for the dashed blue line around the field and the little box next to it.`,`A minus sign in the box means up to but not including.`],
    sol:[`The dashed blue line is Class D. The box says minus 80: up to but not including 8,000 MSL, which is exactly where the Class B starts. Stacked like Legos.`]},
   {id:"a2",pt:"A",type:"number",q:`What's the floor of the Class B over Centennial, in feet MSL?`,a:8000,unit:"feet MSL",
    hints:[`It's the altitude the Class D stops just short of.`],
    sol:[`8,000 MSL, up to 12,000. Field elevation is 5,885, so you have about 2,100 feet between the runway and the shelf. My rule keeps you at 7,700 or lower.`]},
   {id:"b",pt:"B",type:"number",q:`What's the floor of the Class B over point B, in feet MSL?`,a:9000,unit:"feet MSL",
    hints:[`Find the blue fraction in the same piece as B. It's close.`,`Bottom number is the floor, in hundreds of feet.`],
    sol:[`120 over 90: floor 9,000 MSL, ceiling 12,000. B is between the 20 and 30 mile rings south of Denver, where the cake gets taller.`]},
   {id:"c",pt:"C",type:"number",q:`And over point C, out east? Floor in feet MSL.`,a:10000,unit:"feet MSL",
    hints:[`The fraction for C's piece is a little southwest of it.`,`Three digits on the bottom still means hundreds of feet.`],
    sol:[`120 over 100: floor 10,000 MSL. Under that you're out of the Class B, but you're still inside the 30 mile Mode C veil, so the transponder and ADS-B stay on.`]},
   {id:"d",pt:"D",type:"choice",q:`You're over point D at 7,500 MSL. Where are you?`,
    opts:[`Under the Class B. The floor here is 8,000.`,`Inside the Class B, so you need a clearance.`,`Inside Centennial's Class D.`],a:0,
    hints:[`D is between the 10 and 20 mile rings south of Denver. Is there a solid blue line between D and Centennial?`,`There isn't. Same piece as Centennial, same floor.`],
    sol:[`D is in the same piece of the Class B as Centennial, floor 8,000. At 7,500 you're 500 feet under it, which is legal and a little closer than I like. It's also miles from the dashed Class D line.`]},
   {id:"e",pt:"E",type:"choice",q:`Same altitude, 7,500 MSL, over point E. Where are you now?`,
    opts:[`Under the Class B. The floor here is 8,000.`,`Inside the Class B. The floor here is 7,000, so you need a clearance.`,`Above the Class B.`],a:1,
    hints:[`Find the fraction right next to E.`],
    sol:[`120 over 70: floor 7,000. At 7,500 you're 500 feet inside it without a clearance. Same altitude as D, different answer. Check the floor of every piece you'll cross, not just the one over home.`]},
   {id:"f",pt:"F",type:"choice",q:`Point F is on Denver International. Where does the Class B start there?`,
    opts:[`At the surface`,`7,000 MSL`,`8,000 MSL`,`12,000 MSL`],a:0,
    hints:[`Look for the fraction with letters on the bottom instead of numbers.`],
    sol:[`120 over SFC: the surface area around the big airport goes from the ground to 12,000. That's the bottom tier of the upside down wedding cake.`]}
  ]}],

5:[{id:"p5wb",kind:"calc",title:"Load Biscuit",
  hook:[`Here's Biscuit's sheet as a calculator. Same empty weight, same arms, same envelope as the binder.`,`Slide people and fuel around and watch the dot. Then load Russ's softball trip and tell me what you see. Don't trust the dot more than your own arithmetic. Check one by hand.`],
  inputs:[{id:"front",label:"Front seats",min:0,max:400,step:1,value:312,unit:"lb"},{id:"rear",label:"Rear seats",min:0,max:400,step:1,value:0,unit:"lb"},{id:"bag",label:"Baggage",min:0,max:120,step:1,value:20,unit:"lb"},{id:"fuel",label:"Fuel",min:0,max:40,step:0.5,value:40,unit:"gal"}],
  presets:[{label:"You and Abby",v:{front:312,rear:0,bag:20,fuel:40}},{label:"Russ's sheet",v:{front:180,rear:380,bag:120,fuel:20}},{label:"Dev moves up front",v:{front:370,rear:190,bag:120,fuel:20}}],
  compute:v=>{const it=[[1486,39.5],[v.front,37],[v.rear,73],[v.bag,95],[v.fuel*6,48]];const W=it.reduce((a,x)=>a+x[0],0);const M=58697+it.slice(1).reduce((a,x)=>a+x[0]*x[1],0);const cg=M/W;
    const fwd=W<=1950?35:35+(W-1950)*0.01;const zW=W-v.fuel*6,zcg=(M-v.fuel*6*48)/zW;const over=W>2300,fwdOut=cg<fwd-1e-9,aftOut=cg>47.3+1e-9;
    const ok=!over&&!fwdOut&&!aftOut;
    const X=c=>40+(c-34)/(48.5-34)*440,Y=w=>210-(w-1400)/(2400-1400)*190;
    const env=[[35,1400],[35,1950],[38.5,2300],[47.3,2300],[47.3,1400]].map(([c,w])=>`${X(c).toFixed(1)},${Y(w).toFixed(1)}`).join(" ");
    const svg=`<svg viewBox="0 0 500 240" role="img" aria-label="CG envelope with the current load at ${f2(cg)} inches and ${f0(W)} pounds"><polygon points="${env}" fill="currentColor" fill-opacity=".08" stroke="currentColor" stroke-width="2"/><g font-size="11" fill="currentColor" opacity=".7">${[35,38,41,44,47].map(c=>`<text x="${X(c)}" y="230" text-anchor="middle">${c}</text>`).join("")}${[1500,1800,2100,2300].map(w=>`<text x="34" y="${Y(w)+4}" text-anchor="end">${w}</text>`).join("")}<text x="260" y="15" text-anchor="middle">Weight (lb) up, CG (inches aft of datum) across</text></g><line x1="${X(zcg)}" y1="${Y(zW)}" x2="${X(cg)}" y2="${Y(W)}" stroke="currentColor" stroke-dasharray="4 4" opacity=".6"/><circle cx="${X(zcg)}" cy="${Y(zW)}" r="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="${X(Math.min(48.5,Math.max(34,cg)))}" cy="${Y(Math.min(2400,W))}" r="7" fill="${ok?"#2e7350":"#c0392b"}" stroke="#fff" stroke-width="2"/></svg>`;
    return {rows:[["Total weight",f0(W)+" lb",over?"bad":""],["Total moment",f0(M)+" lb-in"],["CG",f2(cg)+" in",fwdOut||aftOut?"bad":"good"],["Forward limit here",f2(fwd)+" in"],["Aft limit","47.30 in"],["Room to max gross",f0(2300-W)+" lb",over?"bad":""]],svg,
      note:over?`Over 2,300 lb by ${f0(W-2300)} lb. Not legal to fly.`:aftOut?`CG is aft of 47.3. Not legal, and the dangerous side to be on.`:fwdOut?`CG is forward of the limit at this weight.`:`Inside the envelope. The hollow dot is the same load with the fuel burned off.`,noteCls:ok?"good":"bad"}},
  source:`Biscuit's numbers from chapter 5: empty weight from her current weight and balance report, arms and the CG envelope from FAA Type Certificate Data Sheet 3A12 for the 172N. Practice only. Use the airplane's own paperwork to fly.`,
  questions:[
   {id:"russ",type:"choice",q:`Load Russ's sheet: Russ at 180 up front, Mike and Dev at 380 in back, 120 pounds of clubs, 20 gallons. Can he go?`,
    opts:[`Yes. It's under 2,300 and inside the envelope.`,`No. It's over 2,300 pounds.`,`No. The CG is aft of 47.3.`],a:2,
    hints:[`Tap "Russ's sheet" and look at the total weight and the CG.`,`He's under max gross. Check the CG against the aft limit.`],
    sol:[`2,286 pounds and 110,257 pound inches. 110,257 ÷ 2,286 = 48.23 inches. The aft limit is 47.3 at every weight, so it's almost an inch aft. Under gross means nothing if the dot's outside the box.`]},
   {id:"shift",type:"number",q:`Move Dev up front. What's the new CG, in inches aft of the datum?`,a:45.24,tol:0.05,unit:"inches",
    hints:[`Tap "Dev moves up front", or work the weight shift formula: CG change = weight moved × distance ÷ total weight.`,`190 pounds moving from 73 to 37 is 36 inches.`],
    sol:[`190 × 36 = 6,840. ÷ 2,286 = 2.99 inches forward. 48.23 minus 2.99 = 45.24. Same weight, and now it's inside, with room.`]},
   {id:"fuel",type:"number",q:`With Dev up front and the clubs still in back, what's the most fuel Russ can carry and stay at or under 2,300 pounds? Gallons.`,a:22.33,tol:0.35,unit:"gallons",
    hints:[`Find the weight without any fuel, then see how many pounds are left under 2,300.`,`Fuel weighs 6 pounds a gallon.`],
    sol:[`Without fuel: 1,486 + 370 + 190 + 120 = 2,166 pounds. 2,300 minus 2,166 = 134 pounds. 134 ÷ 6 = 22.3 gallons, so call it 22. At 22.3 the CG is about 45.3, still inside. He planned 20, so he's legal, with not much to spare.`]}
  ]}],

9:[{id:"p9e6b",kind:"calc",title:"The wind triangle",
  hook:[`This is the wind side of an E6B, without the little dot and the grid. Put in the course, your airspeed, and the wind, and it gives you heading and groundspeed and draws the triangle.`,`Use it to check the rest of Jordan's nav log. The drawing's just there so you can see which way you're crabbing.`],
  inputs:[{id:"tc",label:"True course",min:0,max:359,step:1,value:358,unit:"°"},{id:"tas",label:"True airspeed",min:60,max:140,step:1,value:105,unit:"kt"},{id:"wd",label:"Wind from",min:0,max:359,step:1,value:320,unit:"° true"},{id:"ws",label:"Wind speed",min:0,max:40,step:1,value:16,unit:"kt"}],
  presets:[{label:"Strasburg to Roggen",v:{tc:358,tas:105,wd:320,ws:16}},{label:"Centennial to BEND",v:{tc:79,tas:105,wd:320,ws:16}}],
  compute:v=>{const r=Math.PI/180,wa=v.wd-v.tc,x=v.ws*Math.sin(wa*r)/v.tas;if(Math.abs(x)>1)return {rows:[["Wind correction","too strong"]],note:"The wind is faster than the crosswind you can correct for at this airspeed.",noteCls:"bad"};
    const wca=Math.asin(x)/r,gs=v.tas*Math.cos(wca*r)-v.ws*Math.cos(wa*r),th=v.tc+Math.round(wca);
    // drawing: heading/TAS from the origin, wind from its tip, ground track back to the origin's line
    const s=190/Math.max(v.tas,gs,1),hx=Math.sin((v.tc+wca)*r)*v.tas*s,hy=-Math.cos((v.tc+wca)*r)*v.tas*s,wx=-Math.sin(v.wd*r)*v.ws*s,wy=Math.cos(v.wd*r)*v.ws*s,gx=hx+wx,gy=hy+wy;
    const xs=[0,hx,gx],ys=[0,hy,gy],cx=250-(Math.min(...xs)+Math.max(...xs))/2,cy=128-(Math.min(...ys)+Math.max(...ys))/2;
    const ar=(x1,y1,x2,y2,col,lab,dash,side)=>{const a=Math.atan2(y2-y1,x2-x1),L=10,nx=-Math.sin(a)*side,ny=Math.cos(a)*side,mx=cx+(x1+x2)/2+nx*10,my=cy+(y1+y2)/2+ny*14;return `<g stroke="${col}" fill="${col}"><line x1="${cx+x1}" y1="${cy+y1}" x2="${cx+x2}" y2="${cy+y2}" stroke-width="3" ${dash?`stroke-dasharray="7 5"`:""}/><polygon points="${cx+x2},${cy+y2} ${cx+x2-L*Math.cos(a-0.4)},${cy+y2-L*Math.sin(a-0.4)} ${cx+x2-L*Math.cos(a+0.4)},${cy+y2-L*Math.sin(a+0.4)}" stroke="none"/></g><text x="${mx}" y="${my+4}" font-size="13" text-anchor="${Math.abs(nx)<0.3?"middle":nx<0?"end":"start"}" fill="${col}" font-weight="600">${lab}</text>`};
    const side=wca>=0?1:-1;
    const svg=`<svg viewBox="0 0 500 250" role="img" aria-label="Wind triangle: heading ${pad3(th)} at ${v.tas} knots, wind from ${v.wd} at ${v.ws}, ground track ${pad3(v.tc)} at ${Math.round(gs)} knots"><text x="20" y="22" font-size="12" fill="currentColor" opacity=".7">N ↑</text>${ar(0,0,hx,hy,"#2d6b7a","Heading, TAS",false,side)}${ar(hx,hy,gx,gy,"#c9952f","Wind",false,-side)}${ar(0,0,gx,gy,"#c0473b","Track, GS",true,-side)}</svg>`;
    return {rows:[["Wind angle",f0(((wa%360)+540)%360-180)+"°"],["WCA",(wca>=0?"+":"")+f1(wca)+"° ("+(Math.round(wca)===0?"none":Math.round(wca)>0?Math.round(wca)+" right":-Math.round(wca)+" left")+")"],["True heading",pad3(th)],["Groundspeed",f1(gs)+" kt"]],svg,note:`Heading uses the WCA rounded to the nearest degree, like the nav log.`}},
  source:`Formulas and numbers from chapter 9: TAS 105 knots, the FB wind at 9,000 from 320 true at 16, and the true courses on Jordan's nav log.`,
  questions:[
   {id:"wca1",type:"number",kb:"text",q:`BEND to Strasburg, true course 046. What wind correction angle? Degrees to the nearest whole one, left is negative.`,a:-8.74,tol:0.3,unit:"degrees",
    hints:[`Set true course to 46 and leave the wind and airspeed alone.`,`The wind is from 320, off your left side, so you crab left. Left is negative.`],
    sol:[`Wind angle: 320 minus 046 = 274 degrees, the same angle as minus 86. sin 274 = minus 0.998. 16 × minus 0.998 ÷ 105 = minus 0.152. asin(minus 0.152) = minus 8.7, so 9 left.`]},
   {id:"th1",type:"number",q:`And the true heading for that leg?`,a:37,tol:0,unit:"degrees",
    hints:[`True heading is true course plus the WCA, with left as minus.`],
    sol:[`046 minus 9 = 037. That's what's on the nav log. Then 7 east variation makes it 030 magnetic.`]},
   {id:"gs1",type:"number",q:`Groundspeed on that leg, in knots?`,a:103,tol:1,unit:"knots",
    hints:[`GS = TAS × cos(WCA) minus wind speed × cos(wind angle).`],
    sol:[`105 × cos 8.7 = 103.8. 16 × cos 274 = 1.1. 103.8 minus 1.1 = 102.7, about 103 knots. Almost a pure crosswind, so it barely costs you anything.`]},
   {id:"th2",type:"number",q:`Strasburg to the Space Port, true course 290. True heading?`,a:294,tol:0,unit:"degrees",
    hints:[`Now the wind is from 30 degrees right of the nose. You crab right, so the WCA is positive.`],
    sol:[`Wind angle 320 minus 290 = 30. 16 × sin 30 ÷ 105 = 0.076, asin = 4.4, so 4 right. 290 + 4 = 294.`]},
   {id:"gs2",type:"number",q:`Groundspeed on that one?`,a:91,tol:1,unit:"knots",
    hints:[`Most of that wind is on the nose now.`],
    sol:[`105 × cos 4.4 = 104.7. 16 × cos 30 = 13.9. 104.7 minus 13.9 = 90.8, about 91 knots. Same wind, a lot more headwind. That's why the last leg home always takes longer than you think.`]}
  ]}]
};
})();
