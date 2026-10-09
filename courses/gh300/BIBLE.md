# The Halcyon Launch: Copilot Course bible (GH-300 retake prep)

Read this whole file and `../../full/BIBLE.md` (the PMP bible: voice, answer rules, prop formats, `data-who` speaker tags, file format) before writing anything. This course reuses that format exactly, with the changes below.

## Goal
A story-driven retake prep course for **Exam GH-300: GitHub Copilot**. Anthony scored **686 of 700** on attempt 1 (2026-10-05). The course must lift his weakest section first and keep the rest warm. About 6 to 8 hours: 7 chapters, each about 50 to 60 minutes (story, Ruth's Whiteboard lesson, 11 decisions, an exercise or drill, a 15-question quiz), plus a full mock exam.

## The exam (verified 2026-10-09)
Source: Microsoft Learn study guide, "Skills measured as of August 7, 2026" (https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/gh-300, page updated 2026-07-09) and the certification page (https://learn.microsoft.com/en-us/credentials/certifications/github-copilot/, updated 2026-09-22).
- **Format:** 100 minutes, proctored through Pearson VUE, passing score **700** on a 1 to 1000 scale. May include interactive items. Retake after 24 hours for the first retake. Certification valid 2 years.
- **Question count:** NOT published on either page. Treat "about 60 to 65 questions" as community lore, unverified. The mock exam uses 60.
- **Preview features:** "Most questions cover features that are generally available. The exam may contain questions on Preview features if those features are commonly used."

### Skills measured (task codes used in this course)
| Code | Domain (weight) | Anthony's attempt 1 |
|---|---|---|
| **F** | Use GitHub Copilot features (25 to 30%) | ~60%, WEAKEST and BIGGEST |
| **R** | Use GitHub Copilot responsibly (15 to 20%) | ~67% |
| **S** | Configure privacy, content exclusions, and safeguards (10 to 15%) | ~69% |
| **P** | Apply prompt engineering and context crafting (10 to 15%) | ~70% |
| **D** | Understand GitHub Copilot data and architecture (10 to 15%) | ~78% |
| **V** | Improve developer productivity with GitHub Copilot (10 to 15%) | ~81% |
(The study guide lists "GitHub Copilot features (25 to 30%)" twice; treat it as the single Features domain.)

Sub-skills, tagged for decisions and quiz items:
- **F1** Use Copilot in the IDE: enable it; trigger it through inline suggestions, chat, CLI, and agent mode; configure content exclusions for files or repositories.
- **F2** Use GitHub Copilot CLI: what it is and why it helps; installing it; key features and commands; interactive use and sessions; generating scripts and managing files.
- **F3** Features and capabilities: Agent Mode, Copilot Edits, and MCP; managing agent sessions and delegating to sub-agents to save context; code review and coding assistance; Spaces, Spark, pull request summaries, and review standards set through instructions files; limits, options, feedback, and commands of Copilot Chat; reusable prompt files.
- **F4** Org settings and policies: org-wide policy management; enabling Copilot code review policies; feature availability across IDEs and github.com; audit log events; managing subscriptions with the REST API.
- **R1** Responsible AI principles: risks and limitations of generative AI; ethical use; potential harms and mitigations.
- **R2** Validate and operate: why AI output must be validated; operating Copilot responsibly.
- **S1** Privacy settings and exclusions: content exclusions and editor settings; ownership and limitations of outputs.
- **S2** Safeguards and troubleshooting: the filter for suggestions matching public code; resolving issues with suggestions and exclusions.
- **P1** Craft prompts: structure and context; how context is determined; zero-shot and few-shot; best practices.
- **P2** Engineer prompts: principles; process flow and chat history.
- **D1** Data handling and flow: usage, flow, and sharing; input processing and prompt building; proxy filtering and post-processing.
- **D2** Lifecycle and limitations: the suggestion lifecycle; limitations of LLMs and Copilot.
- **V1** Productivity and quality: generation, refactoring, documentation; faster learning and less context switching; sample data; modernizing legacy code.
- **V2** Testing and security: unit and integration tests; edge cases and assertions; security and performance suggestions.

### Product facts to teach (verify each against docs.github.com before writing; note anything not GA)
- **Agent mode** (in the IDE, synchronous, you watch and approve edits and terminal commands) versus **Copilot coding agent / cloud agent** (assigned an issue on github.com, works asynchronously in its own environment, opens a pull request for review). This distinction was a missed point on attempt 1. Teach it twice, in two chapters.
- **Instructions:** repository-wide `.github/copilot-instructions.md`; path-specific `.github/instructions/*.instructions.md` with `applyTo` glob front matter; reusable **prompt files** (`.github/prompts/*.prompt.md`). Code review standards can be set through instructions files.
- **Chat:** participants (for example `@workspace`, `@terminal`, `@github`), slash commands (for example `/explain`, `/fix`, `/tests`, `/doc`), and context variables (for example `#file`, `#selection`). Verify the current names in the docs; some have changed across IDE versions, so teach the concept and the most stable examples.
- **Copilot CLI:** install, sessions, interactive use, generating scripts, managing files.
- **IDE extensions:** VS Code, Visual Studio, JetBrains IDEs, Neovim, Xcode, Eclipse. GitHub.com is NOT an IDE extension (a missed point on attempt 1).
- **Plans (current docs, 2026-10):** Copilot Free, Copilot Student, Pro, Pro+, Max, Business, Enterprise, with usage measured in AI credits. **Exam caution:** the exam was written against the August 7, 2026 outline and may still use older plan wording (for example "premium requests"). Teach the stable distinctions: individual plans versus Business and Enterprise; Business adds centralized policy management; Enterprise adds enterprise-grade capabilities on GitHub Enterprise Cloud. Flag any plan detail not confirmed in the docs as unverified.
- **Content exclusions:** set at repository, organization, or enterprise level (plan dependent); excluded content isn't used as context and doesn't get inline suggestions; known limitations (for example some IDE features or symbolic links may not honor exclusions; changes can take time to apply). Verify current limitations.
- **Public code filter / code referencing:** block or allow suggestions matching public code; code referencing shows matches and licenses when allowed.
- **Data:** prompt building from editor context, the proxy and content filters, post-processing, retention differences by plan and surface. Use the GitHub Trust Center and docs as the source.
- **Audit log** events for Copilot; **REST API** for managing seats and subscriptions.

## Story
**Pitch:** Six months after Cascade went live, Elena wants every Halcyon engineer on GitHub Copilot by the end of the quarter, and she gives the rollout to Priya Shah, who just ran her first project. Priya has the tools, a skeptical team, a security lead who has read every privacy clause, and a deadline, and she has to get everyone using Copilot well, safely, and in a way the auditors will accept.

**Point of view:** Priya Shah, not Sam. Sam is now Director of Delivery and Priya's coach (he appears in most chapters, briefly, the way Ruth did for him). Ruth Calder still runs the Whiteboard lessons; she frames them as "flight rules for a new kind of copilot." This course can be played without the PMP course.

### Cast (reuse; add only where needed)
- **Priya Shah** (protagonist): platform lead turned rollout lead. Careful, sharp, now learning to lead peers who are senior to her.
- **Sam Okafor:** her coach. Asks questions instead of giving answers.
- **Ruth Calder:** Whiteboard mentor.
- **Theo Lindqvist:** back on contract. Brilliant, skeptical of AI writing his code ("I'll trust it when it can explain my own Terraform to me"), becomes the best power user by chapter 5.
- **Lena Cho:** CTO, sponsor of the rollout.
- **Ken Ito:** security and privacy lead. Owns content exclusions, the public code filter, and audit logs. Calm, precise.
- **Tomasz Nowak** and the **Kraków team:** early adopters, eight hours ahead; they hit the agent-mode versus coding-agent confusion first.
- **Nora Kim:** compliance; wants evidence for the SOC 2 and HIPAA auditors.
- **Devin Ruiz:** the engineer who over-trusts suggestions; his unreviewed Copilot code ships a bug in chapter 3.
- New: **Renata Vega**, a junior engineer in her first month, who learns faster with Copilot and asks the questions everyone else is embarrassed to ask.

## Chapter plan
| # | Title | Story | Codes | Notes |
|---|---|---|---|---|
| 1 | **The Mandate** | Elena's 6:12 AM email: everyone on Copilot this quarter. Priya inventories plans and IDEs, discovers half the team is on personal Pro accounts, and has to pick the org plan and turn Copilot on. | F1, F4, R1 | Plans, IDE extensions (GitHub.com is not one), enabling Copilot, org policy basics. Exercise: which plan fits which need. |
| 2 | **Two Kinds of Agent** | Kraków assigns an issue to the coding agent expecting it to work in their IDE; Theo uses agent mode and approves a terminal command he didn't read. | F3, F1, R2 | Agent mode versus coding agent, taught deeply. Copilot Edits, MCP basics, agent sessions and sub-agents for context. Exercise: sort ten tasks into inline, chat, agent mode, coding agent, CLI. |
| 3 | **The Bug Nobody Wrote** | Devin ships Copilot-generated code without review; it breaks a date calculation in production. | R1, R2, D2, V2 | Validating output, limitations of LLMs, the suggestion lifecycle, generating tests and edge cases. Props: the PR diff, the incident chat. |
| 4 | **House Rules** | Priya writes the team's instructions: repo-wide `copilot-instructions.md`, path-specific instructions with `applyTo`, reusable prompt files, review standards for Copilot code review. | F3, P1, P2 | Props: the actual instruction files. Drill/exercise: given a folder layout, which instructions apply. Chat participants, slash commands, and context variables. |
| 5 | **Fences** | Ken finds patient-adjacent config files being read as context; Nora wants evidence. Content exclusions, the public code filter, code referencing, audit log events. | S1, S2, F4, D1 | Data flow: prompt building, proxy filters, post-processing, retention. Troubleshooting exclusions that "don't work." Props: Ken's exclusion config, an audit log excerpt. |
| 6 | **Command Line** | The infra team lives in terminals. Theo becomes the Copilot CLI champion: install, sessions, scripts, file management. Org settings and seat management through the REST API. | F2, F4, V1 | Props: a CLI session transcript. Exercise: match commands to outcomes. |
| 7 | **The Retro** | Quarter-end: adoption numbers, a legacy module modernized, Renata's first big PR, the board asks if it was worth it. Priya presents honestly, including what didn't work. | V1, V2, P1, R1 | Productivity claims versus evidence; modernizing legacy code; sample data; a final scene where Priya realizes she led without needing permission. |

Weighting check: Features (F) appears in 6 of 7 chapters and takes at least 30% of all decisions and quiz items; Responsible (R) about 18%; S, P, D, V about 12 to 13% each.

## Cross-chapter flags (6)
| flag | set in | meaning | read in |
|---|---|---|---|
| `personalseats` | ch1 | let engineers keep personal plans instead of moving them to the org plan | ch5 (exclusions and policy don't reach them), ch7 |
| `agentblur` | ch2 | didn't clear up agent mode versus coding agent with the team | ch4, ch6 |
| `blamedevin` | ch3 | blamed Devin publicly for the bug instead of fixing the review process | ch7 |
| `noinstructions` | ch4 | skipped the instructions files and relied on tribal knowledge | ch5, ch7 |
| `filteroff` | ch5 | turned off the public code filter to unblock a team | ch7 (a license question surfaces) |
| `cliunsafe` | ch6 | let the CLI run commands without review | ch7 |

## Rules
Everything in the PMP bible's "Answer quality rules" applies: four options, lengths within about 10 percent, the right answer not the longest in more than 4 of 11 decisions and the shortest in at least 2, plausible distractors, explanations that teach. Product facts must match current GitHub docs; anything in preview gets labeled as preview in the lesson. No em or en dashes. Contractions, plain words, and the Phoenix Project voice. Every quiz question tests something taught earlier in the chapter's story or lesson.

## Mock exam plan
60 single-answer questions (the real exam may also include interactive items), weighted F 17, R 11, S 8, P 8, D 8, V 8. Generic settings, not the Halcyon story. Scenario style ("a developer wants to...", "an organization owner must..."). Include 6 to 8 questions that discriminate agent mode versus coding agent versus CLI versus chat, since those cost points on attempt 1.

## File layout (same engine, new course)
`courses/gh300/full/chNN.js` pushing to `window.HALCYON_FULL` (the engine swaps data per course), `courses/gh300/mock/*.js`, `courses/gh300/full/cast.js`. Task codes above replace the PMP codes for this course; the checker gets a per-course code list.
