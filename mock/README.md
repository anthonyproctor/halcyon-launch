# Mock exam format

180 single-answer multiple choice questions in three files, weighted to the July 9, 2026 outline:
- `mock/people.js`: 59 questions, People tasks P1 to P8
- `mock/process.js`: 74 questions, Process tasks R1 to R10
- `mock/business.js`: 47 questions, Business Environment tasks B1 to B8

Each file:
```js
(window.HALCYON_MOCK=window.HALCYON_MOCK||[]).push({ part:`People`, questions:[
  { q:`scenario question`, opts:[`a`,`b`,`c`,`d`], a:2, why:`why the right answer is right and the best distractor is wrong`,
    task:`P2`, domain:`People`, approach:`agile` }   // approach: agile | hybrid | predictive
]});
```
Case studies and figures (2026-10-25):
- A part may carry `cases:[{ id:`m1c1`, title:`Case: ...`, text:[`paragraph`, ...] }]` for the whole exam (PMP's two live on the Process part). An item in any part joins one with `case:`m1c1`, cq:2` (cq is its place in the case). The engine keeps a case's items together, in cq order, as one block wherever the shuffle puts it, shows the scenario above each of them, and moves a break that would fall inside a case to the case's end.
- An item may carry `fig:`<prop ...></prop>``, drawn above the stem. Kinds: a bar chart (`labels`, `values`), `kind="evm"` (`pv`, `ev`, `ac`), `kind="cfd"` (one attribute per state, values are band widths stacked bottom up in the order written, for example `done`, `testing`, `doing`, `backlog`), `kind="control"` (`values`, `mean`, `ucl`, `lcl`), `kind="network"` (`nodes="A:3,B:5"`, `edges="A>B"`), or a `type="doc"` prop with an HTML table. Screen readers get every value.

Rules: spread questions across every task in the domain roughly in proportion; about 60 percent agile or hybrid; scenario style like the real exam (a PM in a situation, "what should the project manager do first/next/best"), some calculation questions (EVM, PERT, channels, EMV, float, contract math) with exact numbers; four options within about 10 percent length of each other; correct answer position spread evenly; the correct answer not reliably longest; no em or en dashes; use generic fictional settings, NOT the Halcyon story (this is the neutral mock). Every `why` explains the PMI mindset. Validate with `node tools/check_full.mjs mock/<file>.js` (exit 0).

Form 2 (2026-10-25): `mock/form2_people.js`, `mock/form2_process.js`, `mock/form2_business.js` are a second full exam, 180 more items with the same weights (59 / 74 / 47, 72 predictive), all 26 tasks, two case studies (`m2c1`, `m2c2`, defined on the form 2 Process part) and six figure items. Each part carries `form:2, formName:"Practice exam 2"`, and its part name starts with a three letter prefix of its own (`Pe2`, `Pr2`, `Bu2`), because the engine makes question ids from `part.slice(0,3)` plus the index and those ids must not collide with form 1's `Peo`, `Pro`, `Bus`. A form 2 case item must point at a form 2 case. With two forms loaded the engine shows a form picker at `#pmp/mock`, and form 2 saves at base+910 and 911. `node tools/check_full.mjs` checks both forms when the files are present.
