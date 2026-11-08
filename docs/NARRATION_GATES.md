# Narration gates

Five checks for the Gemini narration, added 2026-11-07. They sit beside the gates the renderer already runs: whisper coverage, the voice gate (tools/voice_gate.py) and the pace gate (tools/pace_gate.py).

All five are read only. They never render, never call Gemini, never spend money and never write audio. They read what the renderer already left on disk: the page mp3s, `timings.json` and the page specs from `tools/pages.mjs`. Every one exits 0. They report; they don't block.

Calibration used the books Anthony approved by ear: Hearth (asep), the pilot book and CPHIMS, study edition unless noted. On those books every flag counts as a false alarm, so the flag rates below are false alarm ceilings. Note that most CPHIMS pages were skipped: its text changed after the render, so its timing words no longer line up with the text. That leaves 585 judged lines, against about 1,500 to 2,700 for the other two books.

| Gate | When | Flags on asep | Flags on pilot | Rate on approved audio |
|---|---|---|---|---|
| cue_check | before render | 4 warnings | 7 warnings | warns only |
| tone_gate | after render | 0 of 1,532 lines | 8 of 2,714 lines | 0.29% at most |
| flow_gate | after render | 3 of 3,679 seams | 12 of 5,255 seams | 0.23% at most |
| pron_check | after render | 4 of 2,217 term lines | 17 of 2,212 term lines | 0.8% at most |
| voice_report | after render | 0 study, 2 story | 0 | 4 of 384 character-chapters (1.0%) |

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

## Caches

- `~/.cache/halcyon-gemini-tts/narration/<course>-<key>.json`: per line features, keyed by mp3 size and mtime. The first pass takes about 1 to 3 minutes a chapter on a loaded machine; later passes take seconds.
- `narration/ser-*.json`: SER labels.
- `transcripts/`: pron_check clip transcripts.
- Reports go to `~/.cache/halcyon-gemini-tts/reports/{tone,flow,pron,cue,voice-report}-*.json`.
