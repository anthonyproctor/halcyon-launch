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
Rules: spread questions across every task in the domain roughly in proportion; about 60 percent agile or hybrid; scenario style like the real exam (a PM in a situation, "what should the project manager do first/next/best"), some calculation questions (EVM, PERT, channels, EMV, float, contract math) with exact numbers; four options within about 10 percent length of each other; correct answer position spread evenly; the correct answer not reliably longest; no em or en dashes; use generic fictional settings, NOT the Halcyon story (this is the neutral mock). Every `why` explains the PMI mindset. Validate with `node tools/check_full.mjs mock/<file>.js` (exit 0).
