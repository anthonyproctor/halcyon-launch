# The Halcyon Launch

A library of choose-your-path certification courses. Each one is a short novel with an exam inside it, in the style of business fables like *The Phoenix Project*. You play the lead, you make the calls, and the story changes with them. After every decision a mentor explains the best answer and why, the way the exam sees it.

**Play it:** https://halcyon-launch.vercel.app

## How it works

- About a dozen decisions per chapter, scored 3 for the best answer, 1 for a partial, 0 for a miss
- Your choices follow you: each option has its own outcome, some later scenes change, and chapter endings depend on how you played
- Every decision maps to the exam outline, and meters respond to your choices
- Each chapter has the story, a lesson, drills, an exercise and an exam-style quiz, plus a practice exam per course
- Read-aloud narration with a full cast, word-by-word highlighting, a seek slider, back 10 / forward 30, previous and next section, and a speed control
- A short, hand-picked YouTube explainer after decisions, playable in the page
- A Progress page tracks scores, maps mastery across the exam tasks, and builds a study plan

## Library

- **Continue** at the top opens wherever you left off, in any course
- **★ Pin** the books you're working on; the rest sort by when you last played them
- **About this book** on each card reads like a back cover: the premise, the cast, the exam, and how long it is
- Pins and history follow your account

## Listening

- **Audiobook:** every Full Course chapter in two editions. *Story only* is the novel on the best path, always with the good ending. *Story + lessons* adds the mentor's lesson and reads each decision with a pause, then the answer and why (about twice as long). It plays chapter to chapter with the phone locked, works with lock screen and car controls, and each chapter can be downloaded.
- **Resume anywhere:** your listening spot saves to your account, so you can stop on one device and pick up on another, in either edition.
- **Switch between reading and listening:** tap 🎧 Audiobook on a chapter and it starts at the scene you're reading. Open a chapter after listening and it offers to jump to the scene you were hearing. `audio/bookmarks.json` maps each scene to its spot in the audio, built by `tools/book_marks.sh` from the page word timings (whisper transcripts as the fallback).
- **Contents and sections:** every chapter lists its parts (opening, lesson, each decision by name, drills, quiz, ending) in the chapter header and the side menu, and the Audiobook lists each chapter's scenes with start times. Lessons and quizzes are always open; decisions open in order.
- **Focus mode:** hides scores and meters and moves the lesson to the end of the chapter. You still make every decision.
- **Ambience:** quiet scene-matched background sound under the reading narration.
- Focus mode and Ambience follow your account. The in-app **Guide** explains every control, and the site installs to an iPhone home screen as an app.

## Courses

The Library holds five story courses: **The Halcyon Launch** (PMP), **One Chart** (CPHIMS), **Hearth** (INCOSE ASEP), **The Copilot Rollout** (GitHub Copilot GH-300) and **Danny's Logbook** (FAA Private Pilot). The PMP course is complete; the others are in production, with chapters going live as they're written. Course content lives in `courses/<id>/`, with a story bible per course.

## PMP tracks

- **Full Course:** 15 chapters, about 15 to 20 hours. Each has a story, Ruth's Whiteboard lesson, 12 decisions, math drills, an exercise, and a 15-question quiz, mapped to all 26 tasks of the July 2026 PMP outline. Story bible in `full/BIBLE.md`.
- **Mock Exam:** 180 questions weighted 33/41/26 like the real exam, timed exam mode or practice mode.

`tools/check_full.mjs` and `tools/audit.mjs` lint content for answer giveaways, coverage, duplicates, and dashes.

## Accounts

Invite only. Each invite link works once. Progress (chapter, decisions, scores, listening spot, settings) saves to your account in Postgres, so you can pick up on any device. Admins make and revoke invites at `/admin`. QA mode, the Flag button and the test profile are for admins and the players marked Tester on `/admin` (`users.is_tester`, added by `lib/server.js` on first use); `/api/qa-report` refuses reports from anyone else.

## Mailing list

"Tell me when new books land" sits on Coming next and at the end of each About page. `api/subscribe.js` stores the email, the page it came from, the time, and a random unsubscribe token in `list_signups` (created on first use by `lib/list.js`), with a naive per IP rate limit (5 an hour, hashed IPs in `list_hits`). It answers the same whether or not the email was already there. Nothing is emailed from the site. `/api/unsubscribe?token=...` shows a Remove me button that deletes the row (and accepts one-click unsubscribe POSTs from mail apps). Admins see the list, remove people, and download a CSV with each person's unsubscribe link at `/admin`.

A static front end plus small serverless functions in `api/` (Neon Postgres, signed session cookie, scrypt password hashes). No build step. Narration is generated from the game text with Kokoro TTS, one voice per character: `tools/pages.mjs` and `tools/render_pages.py` make the per-page clips and word timings, and `tools/episode_full.mjs` with `tools/render_kokoro.py` make the Audiobook files.

All companies and people are fictional. Not affiliated with or endorsed by PMI. PMP is a registered mark of the Project Management Institute.
