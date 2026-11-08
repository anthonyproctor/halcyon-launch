# Release gates

These checks answer one question the older checkers can't: was the learner actually taught each official objective, before it was tested, in the audio they actually hear? They come from the last section of the independent all-books audit of 2026-11-07. All of them are read only.

Three gates are built so far:

| Gate | Command | Fails on |
|---|---|---|
| Objective coverage | `node tools/check_coverage.mjs <course>` | An objective that's absent or only mentioned |
| Taught before tested | `node tools/check_taught_before_tested.mjs <course>` | An item that tests something no earlier lesson teaches |
| Audio parity | `node tools/check_audio_parity.mjs <course>` | Nothing yet. It only reports |

Every command takes a course id (`afoqt asep pilot pmp cphims gh300 cisa lsat`) or `all`. Add `--warn` to print without failing, so a book still being written can run it.

## The outline maps: tools/coverage/&lt;course&gt;.json

Each course has one machine-readable map of its official outline.

| Course | Objectives | What they are |
|---|---|---|
| afoqt | 56 | Form T subtests and their content areas, plus a format objective per subtest. Some content splits are Halcyon's own, and the map's notes say which. |
| asep | 25 | The INCOSE SE Handbook 5th edition learning objectives |
| pilot | 258 | ACS 6C knowledge elements for ASEL (risk elements not yet added) |
| pmp | 164 | The July 2026 ECO: 26 tasks and 138 enablers |
| cphims | 71 | Candidate Handbook tasks, effective May 1, 2024 |
| gh300 | 41 | Study guide bullets, skills as of Aug 7, 2026 |
| cisa | 60 | Job practice subtopics, August 2024 (the 43 task statements aren't mapped yet) |
| lsat | 34 | Halcyon's own question-family taxonomy. LSAC publishes no such list, and the file says so (`"taxonomy": "halcyon"`). |

Each objective has these fields:

- `id`: built from the official numbering.
- `text`: paraphrased, never copied.
- `source`: the source and its version.
- `group` and `kind`: kind is definition, procedural, judgment, visual or calculation, and the depth rubric will use it later.
- `tasks`: the course's existing task codes from `meta.js` TASKNAMES, which is how quiz and mock tags join the map.
- `match`: the phrases that identify teaching about it.
- `refs`: lesson sections as `{ch, sec, h, auto}`, where `sec` is the 0-based index into `lesson.sections`.
- `status` and `depth`: as of the last seeding.

The match phrases were chosen from the subject, not from the lessons, so the check stays independent of the text it's checking. Where a phrase was later widened for a synonym, the map's `outline.notes` records it.

`node tools/coverage/seed.mjs <course>|all` refreshes the refs from today's text. Every seeded ref is `auto: true`. A reviewer confirms a ref by reading the section and setting `auto: false` (add `reviewer` and `date`). Confirmed refs survive reseeding. A reviewer can also add a ref the phrases missed, and the gate accepts it if the section still has at least 60 words of non-story prose.

## What counts as teaching

Lesson prose is `lesson.sections[].body` plus the section's `exam` line. A few things never count, because a tag is an author's claim, not instruction:

- A paragraph marked `<!--story-->`.
- A paragraph holding a `<prop>` page (Ruth's console log).
- A `terms` card.
- A quiz explanation.
- A task tag on its own. This was the flaw the audit found in `tools/audit.mjs`.

A section explains an objective when its matching non-story prose runs at least 60 words and it isn't a passing mention. That means one of these:

- Two matching paragraphs.
- Two different match phrases.
- The section heading itself matches.

## Gate 1: objective coverage

`check_coverage.mjs` re-checks every ref against today's text and gives each objective one status:

| Status | Meaning |
|---|---|
| absent | Nothing in the book touches it |
| mentioned | It turns up in a term card, a story line, a short sentence or a question, but no section explains it |
| explained | A verified lesson section explains it |
| practiced | Explained, and a chapter quiz, decision, exercise or drill assesses it by its own text (or by a task tag that maps to that one objective alone) |
| independently assessed | Practiced, and a mock or final item assesses it the same way |

The gate fails on any objective that's absent or mentioned. Depth is the matching prose in verified refs, with each shared paragraph split evenly between every objective it matches, so one paragraph can't earn full credit for five tags. Objectives under 80 words are listed as thin. Depth flags thin coverage. It never certifies that coverage is enough.

The report also lists:
- refs that no longer hold
- objectives whose status changed since seeding
- sections that now explain an objective but aren't refs yet

## Gate 2: taught before tested

`check_taught_before_tested.mjs` covers every decision, chapter quiz item, exercise item, drill, mock item and final item. For each one it finds the objectives the item assesses: the objectives under its task tag, narrowed by the item's own text. If the text names none of them, all of them stay in. It then checks two things:

- **UNTAUGHT**: none of those objectives is explained by a lesson in that chapter or earlier. Mock and final items may lean on any chapter.
- **CONCEPT**: the stem or keyed answer uses one of the outline's concepts that no teaching paragraph uses at or before that chapter. A teaching paragraph means 40 or more words of non-story prose, or an exam line. "On screen only" means the concept appears only on a term card, which the audio never reads. Test-format objectives (`AFOQT.*.format`) are skipped here, because their phrases are item wording ("closest in meaning"), not concepts.

Use `--ref HEAD` to check the committed text instead of the working tree. Use `--lessons-ref HEAD` to keep today's items but use the committed lessons, which shows what a lesson fix closed.

**Proof it would have caught the PMP Kanban and flow gap.** The check ran with today's items against the lessons before the ch06 "Pull, not push" and ch10 flow sections were written. It flagged seven flow items, and all seven now pass:

- ch06 quiz 8: WIP limit
- ch12 quiz 8: cumulative flow
- ch13 quiz 9: Kanban, throughput
- ch14 quiz 10: Kanban, WIP limit
- mock Process q21: value stream
- mock Process q65: cumulative flow
- practice exam 2 Process q66: lead time

It still misses ch10 quiz 8 (Little's Law). That item is tagged R9, and its stem uses no phrase from R9's match lists. Widening R9 is a reviewer call.

## Gate 3: audio parity (report only)

`check_audio_parity.mjs` reports three things for each chapter.

**Terms.** `tools/pages.mjs` never narrates `terms`, so every definition is screen only. The report counts:
- definitions whose content words no narrated lesson paragraph of that chapter carries (under half of them in the best paragraph)
- terms that are never said in the chapter at all

**Manifest.** Whether the course's `audiobook.json` lists the chapter for the study and story editions, for every chapter `courses.js` loads.

**Stale audio.** The manifests carry no text hash, so the words each recording was aligned to (`pages/fN/timings.json`, and `fNs` for the story edition) are the only record of what was read. The check rebuilds every page's script with `tools/pages.mjs` (read only, into a temp folder) and compares word bags. A page is stale when 3 or more words, and over 2 percent of them, differ. Variant pages that were never recorded are ignored.

To make this exact later, `render_pages_gemini.py` should write a hash of each page's script next to its timings, and this check should compare hashes.

## Still to build

These are the other gates the audit named:
- official-outline lock
- depth rubric by `kind`
- release reachability
- review provenance (review.js `ch`/`sec` pointers against the maps)
- exam-profile contract
- visual fidelity
- duplication and semantic-family separation
- answer validity
- claim freshness (`tools/check_claims.mjs` is a start)
- assessment calibration
- independent release review on frozen content and audio hashes
