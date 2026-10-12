# full/v2: The Halcyon Launch v2 (LIVE, read in place)
The rewritten PMP story course: 2061, a Mars colony losing its air, one launch window, and Sam Okafor running the rescue ship with his daughter on the station.
Written to `full/BIBLE_v2_proposal.md` and its Decisions (2026-10-11).

## Live in place since 2026-10-11
Anthony approved replacing the v1 book. The v1 chapters, `full/cast.js`, v1 chapter audio and page clips, and v1 chapter art were deleted (git history only).
The engine loads `full/v2/preview.js`, then every file in its `files` list from `full/v2/`, for every reader. Art, portraits, and audio come from `art/v2/`, `cast/v2/`, `audio/v2/`
(initials and no art until they exist; no audio until `audio:true` in preview.js; the Audiobook lists only chapters in `audio/v2/audiobook.json`).
Course text is in the `pmp` entry of `courses.js`, the cast fallbacks in `engine.js`. Saved progress for the v2 Full Course is under keys 201 to 215 (v1 used 101 to 115, left on the server unread),
and Audiobook and page positions and Labs waiting under 904 (v1: 903). The mock (900 to 902) is unchanged. The v1 Refresher was deleted on 2026-10-12 (Anthony's call).
The labs in `courses/pmp/labs.js` are set in the v2 world (stakeholders ch1, critical path ch3, earned value ch5).
When a chapter is ready, add it to `files` in `preview.js`.

## Checks and narration
- `node tools/check_full.mjs full/v2/ch01.js` checks a v2 chapter against the v2 flags (the bible's Flags table), speakers (the bible's `speakers` list plus `full/v2/cast.js`), approach tags, case clusters, and vlog attributes. Run v1 files separately; the v1 check is unchanged.
- `node tools/check_speakers.mjs full/v2/ch01.js` does the same speaker check, including each vlog's `from`.
- `node tools/pages.mjs full 1 out.json --v2` (add `--story` for the Story only edition) builds the narration spec. Its `audio` field sends `render_pages.py` output to `audio/v2/pages/f1`, so v1 audio is never overwritten. The v2 voices are in the `CAST` maps in `tools/render_pages.py` and `tools/render_kokoro.py`.

## File move (later, once all 15 chapters exist)
Already done in place: courses.js fields (step 5), engine cast and lesson intro and ambience (step 6), saved progress (step 7: new key block), refresher retired from the UI (step 8), labs (step 9),
check_full/check_speakers default to the live v2 chapters (part of step 10), sw.js cache bump (step 11), mock checked (step 12: generic, no v1 story). What's left is the move itself:
steps 1 to 4, then make `V2()` in engine.js the identity, drop `FULL_BASE`'s PMP special case only if progress keys move too (they shouldn't), and update `readyCount`, sw.js SHELL, and tools/pages.mjs paths.
Original plan, for reference:
1. Files: `git mv full/v2/chNN.js full/chNN.js` for all 15 (replacing v1), `full/v2/cast.js` to `full/cast.js`. Keep v1 in git history only. Move `full/BIBLE.md` aside and promote `full/BIBLE_v2_proposal.md`. Replace `full/PORTRAIT_PROMPTS.md`.
2. Episode paths inside the chapters: each chapter's `episode.src` says `audio/v2/full-chNN.mp3`; change to `audio/full-chNN.mp3` when the files move (the only chapter edit the switch needs).
3. Audio: move `audio/v2/pages/fN` to `audio/pages/fN`, `audio/v2/full-chNN.mp3` and `audio/v2/story/full-chNN.mp3` to `audio/` and `audio/story/`, and `audio/v2/audiobook.json` and `audio/v2/bookmarks.json` to `audio/`. Re-run `tools/book_marks.sh` if marks were built for the v2 paths.
4. Art and portraits: `art/v2/full-chNN.*` to `art/`, `cast/v2/*` to `cast/`, `cast/v2/voice/*` to `cast/voice/`. Sam, Ruth, and Ray keep their ids, so their v1 portraits and voice samples get replaced, not added.
5. courses.js, the `pmp` entry: copy `course` from `preview.js` (about, story, mentorRole, mentor, mentorFull, lessonName, lessonIntro, meters, stateTitle, leads, flags, speakers, mockBlurb). Keep `mockMinutes:240` and `mockBreaks:[60,120]`. Update `full_title` if the book gets a new title. `refArt` follows the refresher decision in step 8.
6. engine.js: set `BASE_CAST` and `FULL_CAST_EXTRA` to `meta` in `preview.js` (TASKNAMES and DOMS don't change). Replace the hardcoded PMP lesson intro fallback ("Ruth Calder is Sam's mentor, a retired NASA flight director...") with the v2 `lessonIntro`, or drop it since courses.js now sets one. Rewrite `TRACKS.full` blurb only if the hours change. `AMB_RULES`: add mission control, wind on the plains, launch, rain and surf at the Cape; retire servers and hospital for PMP. `RUTH_LEADS` can stay (courses.js `leads` overrides it). The `V2P` preview code can stay (harmless) or come out with `preview.js`.
7. Saved progress: v1 readers have chapter state under keys `c101` to `c115` (and the Audiobook resume points). v2 chapters reuse those keys, so old picks would land on new scenes. Decide before the flip: clear PMP Full Course progress for everyone (one admin pass over `/api/progress`), or move PMP Full Course to a new key block. The refresher (`c1` to `c6`) and mock (`c900`) are unaffected.
8. Refresher track: deleted on 2026-10-12, not rewritten.
9. Labs: `courses/pmp/labs.js` teaches against the v1 story. Rewrite or drop per chapter.
10. Tools: in `tools/check_full.mjs` replace the v1 `FLAGS` list with the v2 flags (after the move, files aren't under `full/v2/`, so path detection won't pick v2 mode; pass `--v2` until then); in `tools/check_speakers.mjs` replace `ALLOWED` with the v2 speakers; point `tools/v2meta.mjs` at the promoted bible. In `tools/pages.mjs` drop the `Ruth's whiteboard.` prefix for PMP (v2 lesson titles name the console log) and retire `--v2`; same prefix in `tools/episode_full.mjs`. Keep the v1 keys in the `CAST` maps until no v1 audio needs re-rendering.
11. sw.js: bump `CACHE` so phones fetch the new chapters; the SHELL file names don't change.
12. Mock exam (`mock/`): no change needed; optionally add a case study block.
