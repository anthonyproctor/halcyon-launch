# The Halcyon Launch

A story-driven PMP practice game, built in the style of business fables like *The Phoenix Project* and *The Five Dysfunctions of a Team*.

You play Sam Okafor, an infrastructure ops manager at Halcyon AI who gets drafted to rescue the company's biggest customer launch with fourteen weeks left. Every chapter is a run of decisions. After each one you see what happened, and Ruth Calder, a retired NASA flight director on the board, explains the PMI mindset behind the best answer.

**Play it:** https://halcyon-launch.vercel.app

## How it works

- Ten decisions per chapter, scored against the PMI mindset (3 for the best answer, 1 for a partial, 0 for a miss)
- Every decision is tagged to an exam area: People, Process, or Business Environment
- Meters for team trust, stakeholder confidence, and delivery health respond to your choices
- Earlier choices change later scenes
- Read-aloud narration with a full cast, word-by-word highlighting, a seek slider, back 10 / forward 30, previous and next section, and a speed control
- A short, hand-picked YouTube explainer after every decision, playable in the page
- Your weakest exam area is called out at the end of each chapter

## Listening

- **Audiobook:** every Full Course chapter in two editions. *Story only* is the novel on the right-answer path (about 10 to 13 minutes). *Story + lessons* adds Ruth's lesson and reads each decision with a pause, then the answer and why (about 25 minutes). It plays chapter to chapter with the phone locked, works with lock screen and car controls, and each chapter can be downloaded.
- **Resume anywhere:** your listening spot saves to your account, so you can stop on one device and pick up on another, in either edition.
- **Switch between reading and listening:** tap 🎧 Audiobook on a chapter and it starts at the scene you're reading. Open a chapter after listening and it offers to jump to the scene you were hearing. `audio/bookmarks.json` maps each scene to its spot in the audio, built by `tools/book_marks.sh` from whisper transcripts.
- **Focus mode:** hides scores and meters and moves the lesson to the end of the chapter. You still make every decision.
- **Ambience:** quiet scene-matched background sound under the reading narration.
- Focus mode and Ambience follow your account. The in-app **Guide** explains every control, and the site installs to an iPhone home screen as an app.

## Courses

The Library holds five story courses: **The Halcyon Launch** (PMP), **One Chart** (CPHIMS), **Hearth** (INCOSE ASEP), **The Copilot Rollout** (GitHub Copilot GH-300) and **Danny's Logbook** (FAA Private Pilot). The PMP course is complete; the others are in production, with chapters going live as they're written. Course content lives in `courses/<id>/`, with a story bible per course.

## PMP tracks

- **Refresher:** 6 chapters, about 2.5 hours of decisions and debriefs.
- **Full Course:** 15 chapters, about 15 to 20 hours. Each has a story, Ruth's Whiteboard lesson, 12 decisions, math drills, an exercise, and a 15-question quiz, mapped to all 26 tasks of the July 2026 PMP outline. Story bible in `full/BIBLE.md`.
- **Mock Exam:** 180 questions weighted 33/41/26 like the real exam, timed exam mode or practice mode.

A Progress page tracks every score, maps mastery across the 26 tasks, builds a study plan, and serves targeted practice sets. `tools/check_full.mjs` and `tools/audit.mjs` lint content for answer giveaways, coverage, duplicates, and dashes.

## Refresher chapters

1. The Promotion
2. Burn-In
3. Storming
4. The Demo
5. Go-Live
6. Closeout

## Accounts

Invite only. Each invite link works once. Progress (chapter, decisions, scores, listening spot, settings) saves to your account in Postgres, so you can pick up on any device. Admins make and revoke invites at `/admin`.

A static front end plus three small serverless functions in `api/` (Neon Postgres, signed session cookie, scrypt password hashes). No build step. Narration is generated from the game text with Kokoro TTS, one voice per character: `tools/pages.mjs` and `tools/render_pages.py` make the per-page clips and word timings, and `tools/episode_full.mjs` with `tools/render_kokoro.py` make the Audiobook files.

All companies and people are fictional. Not affiliated with or endorsed by PMI. PMP is a registered mark of the Project Management Institute.
