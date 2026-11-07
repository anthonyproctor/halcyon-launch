// Test fixture for tests/afoqt_figures.spec.mjs: a made-up AFOQT chapter 1 whose quiz carries every picture kind (figs.js): an Instrument
// Comprehension item (dials, four aircraft options), a Block Counting pile, a Table Reading grid, and one plain text item. Served in place of
// courses/afoqt/full/ch01.js.
(((window.HALCYON_DATA=window.HALCYON_DATA||{}).afoqt=window.HALCYON_DATA.afoqt||{}).full=window.HALCYON_DATA.afoqt.full||[]).push({
  num:1,part:`Part One: Fixture`,title:`Fixture Chapter`,weeks:`January 2027`,tasks:[`IC`,`BC`,`TR`,`SJ`],cast:[],
  opening:[`Fixture opening paragraph.`],
  lesson:{title:`Vern's Logs: fixture`,sections:[{h:`Read the dials`,body:[`Fixture lesson body.`],exam:`Fixture exam tip.`}]},
  scenes:[...Array(12)].map((_,i)=>({id:`f1s${i+1}`,domain:`Judgment`,task:`SJ`,title:`Fixture scene ${i+1}`,text:()=>[`Fixture scene ${i+1} text.`],
    opts:[{t:`The best fixture option ${i+1}`,s:3,best:true,d:{},after:`Best after.`,why:`Best why.`},{t:`A partial fixture option`,s:1,d:{},after:`Partial after.`,why:`Partial why.`},{t:`A weak fixture option`,s:0,d:{},after:`Weak after.`,why:`Weak why.`},{t:`Another weak option`,s:0,d:{},after:`Weak after.`,why:`Weak why.`}]})),
  quiz:[
    {q:`Which aircraft matches the instruments?`,fig:`<prop type="chart" kind="dials" title="Instruments" bank="-30" pitch="10" heading="90"></prop>`,
     opts:[`<prop type="chart" kind="plane" heading="90" bank="-30" pitch="10"></prop>`,`<prop type="chart" kind="plane" heading="90" bank="30" pitch="10"></prop>`,`<prop type="chart" kind="plane" heading="90" bank="-30" pitch="-10"></prop>`,`<prop type="chart" kind="plane" heading="270" bank="-30" pitch="10"></prop>`],
     a:0,why:`Climbing, banked left, heading east.`,task:`IC`,domain:`Speed and Spatial`},
    {q:`How many blocks does block 2 touch?`,fig:`<prop type="chart" kind="blocks" title="Pile A" boxes="0,0,0,2,1,1;0,1,0,2,1,1;0,2,0,2,1,1;2,0,0,1,3,1;0,0,1,1,2,1;1,0,1,1,2,1;0,2,1,3,1,1;0,0,2,2,1,1" labels="1:7,2:4,3:2,4:3,5:6"></prop>`,
     opts:[`2`,`3`,`4`,`5`,`6`],a:3,why:`Two below, one beside, one behind, one on top.`,task:`BC`,domain:`Speed and Spatial`},
    {q:`What number is at X = 1, Y = -2?`,fig:`<prop type="chart" kind="xytable" title="Table 1" seed="7"></prop>`,
     opts:[`57`,`58`,`59`,`60`,`61`],a:1,why:`Column 1, row -2.`,task:`TR`,domain:`Speed and Spatial`},
    {q:`A plain text question?`,opts:[`Text choice one`,`Text choice two`,`Text choice three`,`Text choice four`,`Text choice five`],a:2,why:`Fixture why.`,task:`SJ`,domain:`Judgment`}
  ],
  closing:()=>[`Fixture closing.`],
  episode:null
});
