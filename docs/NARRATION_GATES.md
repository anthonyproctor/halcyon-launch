# Narration gates

Six checks for the Gemini narration: five added 2026-11-07, and script_gate added 2026-11-11. They sit beside the gates the renderer already runs: whisper coverage, the voice gate (tools/voice_gate.py) and the pace gate (tools/pace_gate.py).

All six are read only. They never render, never call Gemini, never spend money and never write audio. They read what the renderer already left on disk: the page mp3s, `timings.json`, the cached takes and the page specs from `tools/pages.mjs`. Every one exits 0. They report; they don't block.

## Required before audio ships

Run these on every chapter that was rendered or re-rendered, and have the voice director triage the reports. Save a copy of `~/.cache/halcyon-gemini-tts/takes.json` before each render; it is what `--changed-since` reads, and the takes it lists as changed include the ones the renderer's own pace rounds re-rolled.

1. `node tools/cue_check.mjs <course> <ch>` (before the render)
2. `.ttsvenv/bin/python tools/tone_gate.py <course> <ch> --edition both`
3. `.ttsvenv/bin/python tools/flow_gate.py <course> <ch> --edition both`
4. `.ttsvenv/bin/python tools/pron_check.py <course> <ch> --edition both`
5. `.ttsvenv/bin/python tools/script_gate.py <course> <ch> --edition both --changed-since <takes.json copy>`
6. `python3 tools/voice_report.py <course> --edition both`

Calibration used the books Anthony approved by ear: Hearth (asep), the pilot book and CPHIMS, study edition unless noted. On those books every flag counts as a false alarm, so the flag rates below are false alarm ceilings. Note that most CPHIMS pages were skipped: its text changed after the render, so its timing words no longer line up with the text. That leaves 585 judged lines, against about 1,500 to 2,700 for the other two books.

| Gate | When | Flags on asep | Flags on pilot | Rate on approved audio |
|---|---|---|---|---|
| cue_check | before render | 4 warnings | 7 warnings | warns only |
| tone_gate | after render | 0 of 1,532 lines | 8 of 2,714 lines | 0.29% at most |
| flow_gate | after render | 3 of 3,679 seams | 12 of 5,255 seams | 0.23% at most |
| pron_check | after render | 4 of 2,217 term lines | 17 of 2,212 term lines | 0.8% at most |
| voice_report | after render | 0 study, 2 story | 0 | 4 of 384 character-chapters (1.0%) |
| script_gate | after render | | | 0 of 4,425 takes on Commission (calibrated 2026-11-11, see its section) |

Run them with `.ttsvenv/bin/python` (torch and transformers live there). cue_check runs on node.

## cue_check.mjs: lines that need a cue (before render)

`node tools/cue_check.mjs <course> <chapter|all|1-3> [--min 2] [--quiet] [--json out.json]`

It lists emotionally loaded said lines that carry no `data-tone`. The lines come from `tools/pages.mjs` (variants off), so they are exactly what the renderer will voice. The narrator isn't judged, since it can't carry a cue. Neither is the mentor's teaching on the lesson and debrief pages. The mentor's own tagged lines are judged.

How a line scores:

| Points | Signal |
|---|---|
| +2 | a delivery verb in the narration around the line (the 30 words before, the 15 after): whispered, murmured, hissed, shouted, snapped, under her breath, voice broke, and so on |
| +2 | a grief, anger or fear word in that narration |
| +1 | such a word in the line itself |
| +1 | an exclamation mark (+2 for several, or "!" with an emotion word) |
| +1 | the line is its page's peak (highest score, already 2 or more) |

A line scoring 2 or more with no cue is listed. Tuning on asep and pilot removed "yellow" (it matched yell), "glare shield", "engine roaring", "a gust shook it" and "dead air".

Cue density means cued character lines over all character lines. The averages are PMP v2 at 20.5% and Hearth at 15.9%. A chapter under 75% of the Hearth average is marked LOW. The averages are cached in `~/.cache/halcyon-gemini-tts/reports/cue-baseline.json` and rebuilt when a chapter file changes.

Known false alarm: the verb belongs to someone else in the same sentence. For example, "Rosie shrieked" sits beside Frank's line, and "Ellie shouts" sits beside Claire's.

## tone_gate.py: delivery against its cue (after render)

`.ttsvenv/bin/python tools/tone_gate.py <course> <chapter|all> [--book 1-12] [--ser] [--narrator] [--edition study|story|both]`

Per line it measures median pitch, pitch range and spread in semitones, spectral tilt (vocal effort), periodicity, loudness and pace. Each one becomes a z score against that character's own book baseline. The baseline is built from their untoned lines with no "!" and half a second or more of voiced speech, and it needs at least 8 such lines.

Arousal is `A = (z pitch + z effort + 0.5 z range) / 3`.

On approved audio, quiet cues read at A -0.9, high cues at +1.1, and untoned lines at 0.0 with the 99.5th percentile at +1.7. So the features move the way the cues ask.

| Flag | Rule |
|---|---|
| FLAT | the cue asks for heat (angry, sharp, urgent, excited, frightened...) with no "level / even / controlled" word, and the line reads A <= -0.5 and range z <= -1.0 |
| HOT | an untoned line with no "!" and no emotion word reads A >= 2.0. With `--ser`, a line also flags when the model hears angry at p >= 0.8 and A >= 1.5 |
| LOUD | a whisper cue reads in full voice (periodicity z >= 0 and effort z >= 0), or a quiet cue reads A >= 1.2 |
| PITCH | a cued line reads well above the character's base pitch and the cue doesn't ask for a raised voice: 6.0 st or more over the base median with pitch z >= 3, or 3.0 st over the base and 4.5 st over the same character's line one or two lines away on the page. Added 2026-11-11 |

PITCH judges quiet cues and every other cue except heat words (the FLAT list) and lift words (surprised, glad, laughing, teasing, excited, proud and the like). Before it, a cued line was only judged by FLAT and LOUD, so a "Dry, wary." line could land anywhere. The course mentor isn't judged on PITCH: on approved Hearth, Colleen's cued lines sit 5 to 10 st over her teaching baseline (20 of 21 asep marks in tuning were hers). Calibration on the triage cases:

| Line | Reading | Result |
|---|---|---|
| Teo, The Appeal Study ch10 o4_1, the pre-fix take ("Low, insistent, shaken.", still cached) | 181 Hz, +10.9 st over his Study base, pitch z +5.4 | PITCH |
| Teo, the same line now ("Low, flat, insistent.") | 99 Hz, +0.5 st | passes |
| Jordan, Danny's Logbook ch8 "It's on yours too." ("Low, plain, serious.") | 203 to 204 Hz, +3.4 to +3.8 st over her base, +4.8 to +5.2 st over "Fatigue's on here." | PITCH, both editions |

Jordan's line is only caught by the neighbour rule. On the base alone it sits with dozens of approved quiet lines (her book base is about 166 Hz, not the 152 Hz of the line before it), so a base threshold low enough to catch it would add 40 to 100 marks a book.

Small baselines (added 2026-11-11). A character with fewer than 30 baseline lines in an edition borrows the other edition's baseline when that one has more lines (the editions share most takes), and any baseline under 30 lines uses wider floors: 2.0 st for pitch and 1.5 st for pitch range. Before this, Teo's first Story baseline in The Appeal (10 lines, range spread at its 0.8 st floor) gave 7 false alarms, and Claire's Story pitch spread in Danny's Logbook fell from 2.51 to the 1.5 st floor when P-R1 replaced her 110 Hz outlier, which made an approved line read z +6.1 (1 false alarm). Both are gone.

Flag counts, both editions, every chapter with timings, before and after the 2026-11-11 changes:

| Book | Before | After | What changed |
|---|---|---|---|
| The Appeal (lsat) | 12 (HOT 2, LOUD 10) | 14 (HOT 2, LOUD 4, PITCH 8) | 6 of Teo's 7 new Story LOUD false alarms gone (his Story baseline now borrows Study's; "People talk when they're dying." still flags in both editions, as before); 8 PITCH: Teo, Luis and Ronnie, 4 lines in both editions |
| Commission (afoqt) | 4 (FLAT 2, LOUD 2) | 13 (FLAT 2, LOUD 2, PITCH 9) | 9 PITCH, all Kit (her quiet, plain and calm cues landing 3 to 9 st over her base) |
| Danny's Logbook (pilot) | 8 (HOT 6, LOUD 2) | 14 (HOT 5, LOUD 2, PITCH 7) | Claire's Story HOT gone; 7 PITCH, Jordan's "It's on yours too." among them |

Spread floors are 1.5 st for pitch and 2.0 dB for effort. Floors of 0.8 and 1.0 gave 13 pilot flags; 1.5 and 2.0 give 8, with the same sensitivity. Headings, codes and one word interjections are skipped (pace_gate's list).

Sensitivity check: each cued line was relabelled with the opposite cue and judged again. A quiet read labelled "sharp" flags FLAT 29 to 44% of the time per book (49 of 157 lines overall, 31%). An uncued quiet read never flags HOT.

The `--ser` option uses superb/wav2vec2-base-superb-er (Apache 2.0, 378 MB, labels neutral, happy, angry, sad). It is cached per clip in `~/.cache/halcyon-gemini-tts/narration/ser-*.json`. It calls 7% of approved Hearth character lines angry, so it is weak on TTS and only a tie-breaker. Leave it off by default. The CC-BY-NC arousal model from audeering was ruled out on its license.

Known false alarm: mentors. Abby's baseline is mostly calm debrief teaching, so her livelier story lines on the outcome pages read HOT (6 of the 8 pilot flags).

## flow_gate.py: seams between lines (after render)

`.ttsvenv/bin/python tools/flow_gate.py <course> <chapter|all> [--edition ...]`

The renderer lays silence on purpose: the page's pause segments, 0.18 s on a change of voice, and 0.04 s before and 0.08 s after a line of two words or fewer. The gate subtracts that planned silence from the gap it measures (voiced end to voiced start).

| Flag | Rule | Approved books |
|---|---|---|
| GAP_LONG | leftover silence over 1.0 s (1.6 s on the lesson page) | p99.5 0.76 s, max 1.97 s |
| GAP_SHORT | a voice change with under 0.12 s between | never under 0.16 s |
| LOUD_JUMP | a step over 4.0 dB in K-weighted LUFS between lines of 1 s or more | p99.5 2.5 dB, max 3.9 dB |
| ENERGY_JUMP | the same character, lines at most 4 apart on the page, same cue, pitch moves 4.5 st or more AND effort moves 4.5 dB or more the same way | 2 of 1,103 pairs |

ENERGY_JUMP ignores jumps near 12 st, which are the pitch tracker skipping an octave. It also skips the narrator, which moves between story and options on purpose: 9 of 13 asep marks were the narrator before it was excluded.

The renderer levels every clip to about -21 dBFS, so LOUD_JUMP only fires when leveling hit its gain limits.

## pron_check.py: names and terms against what whisper heard (after render)

`.ttsvenv/bin/python tools/pron_check.py <course> <chapter|all> [--learn] [--no-fallback]`

The lists live in `tools/pron/<course>.json`. Each entry has:

- `term`, as written in the chapter text
- `ok`: spoken forms the way whisper writes them, compared on letters and digits only
- `wrong`: known misreads
- `word: true` for an all caps name said as a word, where letters (H.E.R.T.H.) count as a misread
- `case`

There are seed lists for afoqt (Pruett, Yates, Darrow, Tolliver, KC-135, two two eight, AFOQT, PCSM, TBAS, plus the cast), pilot and asep. Run `--learn` after a render to see every form whisper used and grow the lists. The afoqt list is untested because that book has no audio yet.

Transcripts come from these places:

- **The renderer's own.** `render_pages_gemini.py` writes each page it checks to `/private/tmp/gemtts-*/<pid>.r<round>.wav`, and whisper.cpp leaves a `.wav.json` beside it. The dirs aren't labelled, so pages are matched by page id and length (within 0.02 s of `timings.json` "d"). They live in /tmp and vanish on reboot. This covered 906 of 942 asep pages and 832 of 875 pilot pages on 2026-11-07.
- **The line alone, as a fallback.** The line's clip is transcribed on its own with the same model, cached by md5 in `~/.cache/halcyon-gemini-tts/transcripts/`. This is used when there is no page transcript, when the page transcript skipped the line, or when the page transcript flagged it. Every flag is re-heard alone before it stands, as the renderer does.

A line passes when an ok form is heard (longest form first), or a heard run is at least 0.8 similar to one. A wrong form counts only when whisper heard it more often than the line itself says it, so "a man from Halo" isn't a misread of FRO.

Learned on approved audio:

- HEARTH is said "harth", the correct sound of the word hearth, and whisper writes it Harth. That is now ok; it had been 44 false misreads.
- Whisper writes a spoken "niner" as the digit 9 (Cessna 4-7-9-1 Echo).

## voice_report.py: a whole book, chapter by chapter (after render)

`python3 tools/voice_report.py <course> [--edition study|story|both] [--all]`

It reads the voice gate's book file (`voices/<course>-<audio>.json`) and the render reports. For each character it gives:

- each chapter's mean embedding against the centroid of the other chapters (leave one out)
- the chapter's median pitch against the character's book median

| Mark | Rule | Approved books |
|---|---|---|
| VOICE | sim under the character's median minus 0.04, or under 0.93 | p99 drop 0.027, 1st percentile sim 0.941 |
| PITCH | median pitch off the book median by more than 3.0 st | p99 2.5 st, max 2.8 st |

A chapter is only marked when the character has 5 or more takes in it. With 3 takes, approved chapters swung 2 to 7 st.

No model or audio is loaded, so it takes about a second per book.

## script_gate.py: what was said against the text (after render)

`.ttsvenv/bin/python tools/script_gate.py <course> <chapter|all|1-3> [--edition study|story|both] [--out r.json] [--changed-since takes.json] [--all-takes] [--no-confirm]`

It catches added, repeated and dropped words. The renderer's coverage check can't see them: it counts only missing words, so a page with every word plus extra ones passes. Two got through every gate in Commission and were found only by diffing a whole lesson transcript against its text: an ad-lib, "So that's how to hand off and manage.", in the ch10 lesson (q22 R1), and Vern breaking off at "Nobody's ever minus" and reading the paragraph again from the top in the ch6 lesson (q22 R2).

What it checks: every Gemini request the renderer sends for the chapter, a single line or a same-speaker run, on its cached take as Gemini returned it. The requests are rebuilt by running `render_pages_gemini.py` up to its synthesis step on the `pages.mjs` spec, so the text compared is the text sent, respellings included. A take shared by both editions is heard once. A request whose take isn't cached (the text changed after the render) is listed as skipped.

How:

1. Each take is transcribed with whisper.cpp large-v3-turbo (`~/.cache/whisper/ggml-large-v3-turbo.bin`, `SCRIPT_GATE_MODEL` overrides it) with `-mc 0 -ml 1 -sow`. `-mc 0` keeps no text context between whisper's 30 s chunks. With context, whisper loops at chunk edges on long runs and writes a sentence twice: 9 false doublings and 3 false missing sentences in The Appeal on 2026-11-11, all clean with `-mc 0`.
2. Text and transcript become word tokens: lower case, digits spelled out (86,400,000 is "eighty six million four hundred thousand"), hyphens split. A respelled word (the renderer's SAY and SAY_COURSE) is one token that matches the written word, the respelling or any `ok` form for it in `tools/pron/<course>.json`; a name in the pron list that isn't respelled gets its `ok` forms too. So "TAY-oh" heard "Teo", "A F O Q T" heard "AFOQT" and "Pruitt" heard "Pruett" all match.
3. The token lists are aligned: difflib on exact tokens, then a small edit-distance pass inside each mismatch that pairs near spellings and lets one token stand for up to six on the other side.
4. Flags, counted in written words (a number is one word however it's read):

| Flag | Rule |
|---|---|
| INSERT | 3 or more heard words in a row that the text doesn't have |
| REPEAT | an INSERT whose words are text said within 80 tokens of it (the run read again) |
| DROP | 4 or more words of the text in a row that weren't heard |

5. Every flag is re-heard: 1.5 s either side of it (plus the insert's own length, so a re-read stretch has its first reading in the window) is cut from the take and transcribed alone, then aligned to the text around it. The flag stands only if the same kind of gap shows up again. Where the window cuts into speech, its first and last two heard words don't count, and a DROP must sit between matched words.

`--changed-since <copy of takes.json>` checks only takes made since the copy: a request whose take number differs from the copy, or whose take audio is newer than the copy file. `--all-takes` checks every cached take of each request, not only the current one (old takes are marked "not current"), which is how a fix is compared with the take it replaced.

Calibration (2026-11-11, Commission, Study unless noted):

| Take | Result |
|---|---|
| ch6 lesson run "Absolute value is distance from zero...", take 0 (cache 53292f8f..., the q22 R2 restart) | REPEAT, 19 words at 0.2 s: "Absolute value ... Nobody's ever minus" read twice |
| ch10 lesson run, take 1 (the q22 R1 ad-lib) | INSERT, 8 words at 91.2 s: "So that's how to hand off and manage." |
| ch6 and ch10 lessons, current takes | pass |
| ch6 and ch10, every cached take (`--all-takes`, 697 takes) | 7 flags: the two above, 3 more on older takes no page plays now (not checked by ear), and the 2 current ch10 repeats below |

Whole book, current takes, both editions: 4 flags on 4,425 takes (189,818 words), on 3 distinct takes. All 3 are real repeats, heard again by small.en: Vern ch10 o5_1 reads "Let's talk about that one. Mission first sounds right." twice; the narrator's ch10 s8 take (in both editions) reads "Then Instrument Comprehension." twice; Vern's Story ch9 run at 28:19 reads "It's four. Block 3 and the plain one ... a strip of the back one." twice. No false alarms on that book, so the false alarm rate is 0 of 4,425 takes. The book took 58 minutes the first time; cached transcripts make a re-run take seconds.

Tuning: takes of 12 s or less are packed several to one 27 s file (each whisper file costs a full 30 s window), which made the gate about 4 times quicker. Words whisper writes after a take's end are dropped: it wrote "We'll see you next time." into the trailing silence of the ch10 intro take.

The report lists, per flag, the speaker, the pages that play the take, the line's page and chapter time, the take number and cache file, the seconds into the take, what was heard or not heard, and the text around it. Transcripts are cached by audio md5 in `~/.cache/halcyon-gemini-tts/transcripts/script-*.json`.

## Renderer changes, 2026-11-11

**A requested re-roll sticks.** On 11/11 The Appeal Study ch6 s9_v1 (Luis, "This the part where you get me out, mija?") was bumped for a fresh take. The renderer made it, then its pace round hinted the line ("... Unhurried, matching the room."), found the hinted take from 11/10 already in the cache (e3e97bf1...), ranked it higher and kept it, so the old take with 2 s of hiss came back. Now the pace round only reuses a cached hinted take that was made for the base take the line has now:

- `~/.cache/halcyon-gemini-tts/pace_base.json` records, per hinted request (by base_hash), the base take it goes with and its own take. Every hint still in use at the end of a render is recorded. A hinted take whose record names an older base take is old.
- A hinted take with no record (made before 11/11) is old only when its base take is new to this render: it had no cached audio when the render started (a bump asked for before the render), or the render re-rolled it. A `GEMINI_PREFETCH` run that makes a base take writes it to `new_takes.json`, so the render after it still knows the take is new.
- An old hinted take is never used. The hinted request is bumped past every cached take, so the pace round makes a fresh one, and the best of the two fresh takes is kept as before. The report lists these under `gate["pace_old_hint"]`.
- Judging legacy hinted takes by file time instead was ruled out: 254 cached hinted takes across the eight books are older than their line's current base take, approved ones among them (Danny's Logbook Story ch8 "And if you are?"), and every one would have been re-made on its next pace flag.
- No base request changes. A dry run built every request of every chapter of all eight books, both editions (184 specs, 31,653 distinct requests), with the renderer before and after: every voice, style, request text and base_hash is identical, and so is every hinted request. The ch6 s9_v1 take from 11/10 is still the current hinted take today. Because its base take (3) is now cached, the next render won't call it new: to redo fix 4, bump the base request once more (or bump the hinted request), then render s9_v1.

**Keeping a split said line in one run (on by default since 2026-11-11; `GEMINI_RUN_KEEP_SPLIT=0` turns it off).** Runs are cut at 1,500 characters. A said line split by a tag ("Ten minutes each in the morning," / "Ana said." / "Where's the fight?") is two segments of one character, and the cut can fall between them, so the halves come from two requests and sound like two readings (The Appeal Story ch11). With the option on, a run never ends between the halves of a split line with the same cue: the first half moves to the next run. The tag is a narrator segment of 12 words or fewer, the first half doesn't end a sentence, and no pause sits between. It changes the request text of these runs, which record again on their next render:

| Book | Runs that change | Split lines | New audio, about |
|---|---|---|---|
| The Appeal (lsat) | 6 | 3: Story ch4, ch7, ch11 (Ana) | 9 min |
| Hearth (asep) | 10 | 3: Story ch2, ch3 (Colleen), ch11 (Nadia) | 8 min |
| CPHIMS | 5 | 1: Study ch11 s7 (Maria, three variant pages) | 3 min |
| Danny's Logbook (pilot) | 3 | 1: Story ch7 (Abby) | 2 min |
| PMP v2, CISA, GH-300, Commission | 0 | 0 | 0 |

## Incremental render, 2026-11-12

A one line voice fix (a cue change or a take bump) used to take 30 to 45 minutes a chapter even with 0 to 2 Gemini calls, because every page was assembled, whispered, aligned and gated again. Profile of a fully cached Commission ch4 (both editions, the render before this change):

| Phase | Study (82 pages) | Story (1 page) |
|---|---|---|
| whisper.cpp check of every page, 3 rounds | 404 s | 216 s |
| wav2vec2 CTC alignment | 225 s | 111 s |
| Gemini: one batch job for 1 re-roll (about 3 min wait), the rest cache reads | 187 s | 0 s |
| voice gate (WavLM embeddings) | 156 s | 58 s |
| whisper of suspect segments alone | 101 s | 65 s |
| assembly | 82 s | 21 s |
| keep the best take (rebuild) | 25 s | 42 s |
| mp3 encode | 32 s | 10 s |
| **render total** | **1,214 s** | **526 s** |

Then `book_marks.sh` whispered both new episode files again because their mtime changed (176 s), and the stings took 13 s: about 32 minutes in all for 1 Gemini call. The re-roll rounds re-rolled 11 and 5 requests nobody had touched.

**What is reused.** Every render leaves a record per page in `~/.cache/halcyon-gemini-tts/pages/<course>-<audio>-<key>/<pid>.json`, plus `<pid>.flac` (the page's exact 16 bit samples) for pages in the episode plan. On the next render a page is reused when its fingerprint matches (RENDER_VERSION, model, gate and alignment settings, the page spec as given, every request it sends with its current take, and its speakers' casting entries), every take it ended with (pace hinted and pinned ones too) is still current, and its mp3 and timings entry on disk are the ones the record wrote, byte for byte. A reused page is not assembled, whispered, aligned or re-rolled, and its mp3 is not rewritten. Its timings entry and gate result are carried over (`"reused": true` on the page in the report). Its lines still count in the chapter's voice and pace baselines, and its voice and pace flags are judged again for the report, but they don't re-roll.

**Changed pages** render and gate as before, with two limits so a fix doesn't churn the lines around it:

- The pace hints a changed page ended with go back on the lines that still send the same request and take.
- Only new requests are re-rolled: a request this edition's last render didn't send with its current take. A flag on an unchanged request is reported only. `REROLL_HELD=1` re-rolls those too (the old behaviour inside a changed page). A page that shares a re-rolled request is pulled in and rendered in full.

`FULL=1` ignores the records and renders every page the old way (and writes fresh records). The first render of a chapter after this change is a full one. Bump `RENDER_VERSION` in the renderer when a change there, or in what it calls (the text clean in `gemini_tts.py`, `align_ctc.py`, `voice_gate.py`, the gaps between clips), alters a page's audio, timings or gate result for the same requests and takes.

**The episode** is joined from the pages' 16 bit samples in plan order (the same bytes the old float join gave), so a reused page goes in exactly as it was rendered.

**Small Gemini calls go live.** `GEMINI_LIVE_MAX` (default 4): in batch mode, a call for that many new requests or fewer goes live. A batch job took about 3 minutes even for one request. Live is the standard price (twice batch, about $0.001 a line) and has a small daily quota; a used up quota falls back to batch.

**book_marks.** `book_marks.sh` now asks `book_marks.mjs --need-whisper` which audiobook files the page timings can't place, and whispers only those. When the timings add up to the mp3 (the normal case), a re-rendered chapter costs no whisper pass. `BM_DIR` points both at another transcript folder.

**Measured** on a scratch copy of Commission ch4, both editions, `narrate_course.sh` steps without R2 (2026-11-12):

| Run | Study | Story | Stings | book_marks | Total |
|---|---|---|---|---|---|
| Full render, before this change | 1,214 s | 526 s | 13 s | 176 s | about 32 min |
| `FULL=1`, after | 1,039 s | 543 s | 13 s | 8 s | 26.7 min |
| Incremental, nothing changed | 14 s | 7 s | 13 s | 8 s | 42 s |
| One cue changed (Boyd, "Get in. It's cold."): 3 study pages and the story page | 40 s | 162 s | 13 s | 8 s | 3.7 min |
| The same line changed again; the voice gate re-rolled it once in each edition | 56 s | 220 s | 14 s | 8 s | 5.0 min |

Every unchanged page's mp3 and timings entry came out byte for byte the same as the full render's, and the nothing changed run gave identical episodes, before and after stings, and an identical `bookmarks.json`. With the cue change, each episode's samples differ only inside the changed page (study s5, story the 2.6 s around the line), and each episode mp3 is exactly the encode of its page samples. The story edition is one page, so a fix there still whispers the whole edition: about 71 s a round, now the largest cost.

## Caches

- `~/.cache/halcyon-gemini-tts/narration/<course>-<key>.json`: per line features, keyed by mp3 size and mtime. The first pass takes about 1 to 3 minutes a chapter on a loaded machine; later passes take seconds.
- `narration/ser-*.json`: SER labels.
- `transcripts/`: pron_check clip transcripts.
- `transcripts/script-*.json`: script_gate take transcripts (large-v3-turbo, `-mc 0`), by audio md5.
- `pace_base.json`: the base take each hinted request was made for. `new_takes.json`: base takes a prefetch made that no render has used yet.
- `pages/<course>-<audio>-<key>/`: the incremental render's page records and samples (about 105 MB a chapter, both editions).
- Reports go to `~/.cache/halcyon-gemini-tts/reports/{tone,flow,pron,cue,voice-report,script}-*.json`.
