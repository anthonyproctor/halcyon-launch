# The Halcyon Launch

A story-driven PMP practice game, built in the style of business fables like *The Phoenix Project* and *The Five Dysfunctions of a Team*.

You play Sam Okafor, an infrastructure ops manager at Halcyon AI who gets drafted to rescue the company's biggest customer launch with fourteen weeks left. Every chapter is a run of decisions. After each one you see what happened, and Ruth Calder, a retired NASA flight director on the board, explains the PMI mindset behind the best answer.

**Play it:** https://halcyon-launch.vercel.app

## How it works

- Ten decisions per chapter, scored against the PMI mindset (3 for the best answer, 1 for a partial, 0 for a miss)
- Every decision is tagged to an exam area: People, Process, or Business Environment
- Meters for team trust, stakeholder confidence, and delivery health respond to your choices
- Earlier choices change later scenes
- Read-aloud narration with a speed control
- A short, hand-picked YouTube explainer after every decision, playable in the page
- A full audio episode per chapter (about 20 minutes) that pauses at each decision, for listening in the car or the gym
- Your weakest exam area is called out at the end of each chapter

## Three tracks

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

Invite only. Each invite link works once. Progress (chapter, decisions, scores) saves to your account in Postgres, so you can pick up on any device. Admins make and revoke invites at `/admin`.

A static front end plus three small serverless functions in `api/` (Neon Postgres, signed session cookie, scrypt password hashes). No build step. Audio episodes are generated from the game text with `tools/episode_script.mjs` and `tools/render_episode.py` (macOS voices plus ffmpeg). Progress saves in your browser.

All companies and people are fictional. Not affiliated with or endorsed by PMI. PMP is a registered mark of the Project Management Institute.
