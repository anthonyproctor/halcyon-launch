// The Copilot Rollout (GH-300) exam week review (2026-10-25): one on screen page for the last days before the exam. Never narrated.
// Loaded from the gh300 scripts list in courses.js. engine.js (renderReview, route #gh300/review, the button in the home page's Practice exam
// card) reads window.HALCYON_REVIEW.gh300; its header explains sections and kinds.
// Shape: intro [paragraphs]; sections [[id, title, kind]]; features and policies [{group, note?, items:[{name, where?, d, ch, sec}]}]
// (kind list); responsible, prompting and rules [{r, why, ch, sec}] (kind rules); terms [{group, items:[{t, d, ch, sec}]}].
// ch and sec point at where the book teaches it: Full Course chapter ch, Asha's shift notes (the lesson), section index sec (0 based, in the
// order of courses/gh300/full/chNN.js lesson.sections). mock:true instead of ch means only the practice exam teaches it.
// Sources: the lessons, quizzes and explanations in courses/gh300/full/ch01.js to ch07.js and courses/gh300/mock/mock1.js, the Microsoft
// Learn GH-300 study guide "Skills measured as of August 7, 2026", and the coverage audit of 2026-10-25 (halcyon-private). Where GitHub
// changed something around the outline date (Copilot approvals after it, Spark closed to new users three days before it), the line says what to answer on the exam.
// Every line is in our own words. GitHub Docs and Microsoft Learn text is theirs: never paste it here. Copy rules: plain words,
// contractions, no dashes.
window.HALCYON_REVIEW=window.HALCYON_REVIEW||{};
window.HALCYON_REVIEW.gh300={
  intro:[
    "One screen for the last few days. Everything here is something the book already taught you, boiled down, with a link back to the lesson that teaches it.",
    "The GH-300 outline we follow is Microsoft Learn's skills list as of August 7, 2026: Copilot features 25 to 30 percent, responsible use 15 to 20, and data and architecture, prompt engineering, productivity, and privacy and safeguards 10 to 15 each. You get 100 minutes, you need 700 to pass, and some items may be interactive. Copilot changes fast. When the docs moved after the outline date, answer the way the outline did.",
    "This is our own summary. Microsoft Learn's current study guide is the official word on what's tested. The Copilot Rollout isn't affiliated with or endorsed by GitHub or Microsoft."
  ],
  sections:[["features","Features and where they live","list"],["policies","Policies and content exclusion","list"],["responsible","Responsible AI rules","rules"],["prompting","Prompt engineering rules","rules"],["terms","Key terms","terms"],["rules","What the exam wants","rules"]],
  features:[
    {group:"Plans", items:[
      {name:"Individual plans", where:"One person pays and manages it", d:"Free, Student, Pro, Pro+ and Max. More models and bigger allowances as you go up. The company gets no control over any of them.", ch:1, sec:0},
      {name:"Copilot Business", where:"Organizations", d:"Adds what a rollout needs: central seat management and policy control over the people you give seats to.", ch:1, sec:0},
      {name:"Copilot Enterprise", where:"GitHub Enterprise Cloud", d:"Everything in Business plus enterprise features and a larger allowance. Copilot doesn't run on Enterprise Server itself.", ch:1, sec:0},
      {name:"Usage allowance", where:"Every plan", d:"Each plan includes a monthly allowance, now counted in AI credits. Older material says premium requests. Heavier models and features use more.", ch:1, sec:0}
    ]},
    {group:"Surfaces and modes", items:[
      {name:"Inline suggestions", where:"Editor", d:"Code proposed as you type. Accept, reject or ignore it.", ch:1, sec:1},
      {name:"Enable it in the IDE", where:"VS Code, Visual Studio, JetBrains, Vim and Neovim, Xcode, Eclipse", d:"Install the extension and sign in with the account that holds the seat. GitHub.com isn't an IDE and has no extension.", ch:1, sec:1},
      {name:"Agent mode", where:"Editor, in Copilot Chat", d:"Edits several files, proposes terminal commands and keeps going while you watch and approve. Synchronous.", ch:2, sec:0},
      {name:"Copilot Edits", where:"Editor", d:"You pick the files and Copilot proposes changes only there. VS Code deprecated its Edit mode in March 2026, removed it in June, and points to agent mode, but the outline still names Edits.", ch:2, sec:3},
      {name:"Coding agent (now cloud agent)", where:"GitHub.com", d:"Assign it an issue. It works in the background in an Actions environment, pushes to a copilot/ branch and opens a draft pull request. Asynchronous.", ch:2, sec:0},
      {name:"Copilot code review", where:"Pull requests on GitHub.com", d:"Request it like a reviewer or set it to run automatically. By default it leaves a Comment review that doesn't count toward required approvals, and that's the exam answer.", ch:3, sec:2},
      {name:"Pull request summaries", where:"Copilot icon in the description or comment box", d:"Start from a blank box. It describes the diff, so you add why you changed it and how you tested.", ch:7, sec:3},
      {name:"Spaces", where:"GitHub.com", d:"Gathers repos, code, issues, pull requests, notes and files so Chat answers from that set. An organization's space can be shared with its members.", ch:4, sec:3},
      {name:"Spark", where:"GitHub.com, closed to new users in August 2026", d:"Built full stack apps from a plain language description. The outline still lists it, so know what it was for.", ch:7, sec:3}
    ]},
    {group:"The chat box", note:"Type @, / or # to see what your editor offers, because the lists vary.", items:[
      {name:"Participants: @", where:"IDE chat", d:"Bring a specialty: @github for GitHub skills, @terminal for the terminal, @vscode for the editor's own settings and commands.", ch:4, sec:3},
      {name:"Slash commands: /", where:"IDE chat and GitHub.com", d:"/explain, /fix, /tests, /doc in some editors, /clear for a fresh chat, /help. /new starts a new chat on GitHub.com but scaffolds a project in VS Code.", ch:4, sec:3},
      {name:"Context variables: #", where:"IDE chat", d:"Add context on purpose: #file, #selection, and #codebase in VS Code for the whole project. Older questions say @workspace for that idea.", ch:4, sec:3},
      {name:"Feedback", where:"Every chat response", d:"Thumbs up or down on a response or a review comment is how you rate it.", ch:4, sec:3}
    ]},
    {group:"Instructions and prompt files", items:[
      {name:"Repository instructions", where:".github/copilot-instructions.md", d:"Added to every request in that repo. Short, standalone rules about the project, build, tests and style. Not used for inline suggestions in VS Code.", ch:4, sec:0},
      {name:"Path specific instructions", where:".github/instructions/*.instructions.md", d:"An applyTo glob in the front matter picks the files. When it matches, these and the repository file both apply.", ch:4, sec:1},
      {name:"Personal and organization instructions", where:"GitHub.com", d:"Personal ones are yours, in Chat on GitHub.com. Organization ones need Business or Enterprise. All relevant sets are sent; personal ranks first if they conflict.", ch:4, sec:0},
      {name:"Review standards", where:"The same instructions files", d:"Short, imperative bullets with an example. They tell code review what to look for. They can't block a merge; rulesets do that.", ch:4, sec:2},
      {name:"Prompt files", where:".github/prompts/*.prompt.md", d:"Reusable prompts you run on demand by typing a slash and the name. IDEs only, not GitHub.com.", ch:4, sec:3}
    ]},
    {group:"Agents, sessions and MCP", items:[
      {name:"Agent guardrails", where:"Cloud agent", d:"One branch only, can't approve or merge its own pull request, the requester can't approve it, and workflows wait for approval by default.", ch:2, sec:1},
      {name:"Setup steps", where:".github/workflows/copilot-setup-steps.yml", d:"Preinstalls the tools the cloud agent needs behind its firewall. Mention @copilot in a comment to ask for changes.", ch:2, sec:1},
      {name:"Sessions and subagents", where:"Editor and CLI", d:"A long session crowds the context window. Start fresh for a new task, or send a focused job to a subagent that returns only the result.", ch:2, sec:3},
      {name:"MCP servers", where:".vscode/mcp.json, or repo Copilot settings for the cloud agent", d:"Connect agents to outside tools and data. On Business and Enterprise an organization policy decides if members can use them at all.", ch:2, sec:4}
    ]},
    {group:"Copilot CLI", items:[
      {name:"Install and sign in", where:"Terminal on Linux, macOS, Windows", d:"npm install -g @github/copilot (Node 22 or later), Homebrew, WinGet or the script. Needs a Copilot plan, then /login. An org seat also needs the CLI policy.", ch:6, sec:0},
      {name:"Interactive vs. programmatic", where:"copilot or copilot -p", d:"copilot starts a conversation you steer. -p runs one prompt and exits, for scripts. Shift+Tab cycles the default mode, plan and autopilot.", ch:6, sec:0},
      {name:"Trusted folders", where:"On start", d:"Start it in the project, never your home folder. Trust covers everything below. /add-dir adds a folder. Path checks are heuristic.", ch:6, sec:1},
      {name:"Tool approvals", where:"Prompts and flags", d:"Approving a tool for the session covers any arguments. --deny-tool beats --allow-tool. --allow-all-tools skips prompts, so use a sandbox.", ch:6, sec:2},
      {name:"Sessions and handoff", where:"Slash commands", d:"--continue or /resume brings a session back, /clear starts fresh, /compact and /context manage the window. /delegate hands work to the cloud agent.", ch:6, sec:3},
      {name:"@ in the CLI", where:"Prompt", d:"Here @ and a path adds a file. In IDE chat, @ calls a participant and # adds a file.", ch:6, sec:3}
    ]},
    {group:"Admin and reporting", items:[
      {name:"Seats", where:"Organization Settings, Copilot, Access", d:"Grant to all members or chosen teams and people. Billing starts when the seat is granted, not on first use.", ch:1, sec:2},
      {name:"Seats by REST API", where:"/orgs/{org}/copilot/billing", d:"Owners only. Removing a seat leaves it pending cancellation until the cycle ends. A team seat survives removing the person.", ch:6, sec:4},
      {name:"Audit log", where:"Search action:copilot", d:"Settings, policy and seat changes, like copilot.content_exclusion_changed. Kept 180 days. Never the prompts people type.", ch:5, sec:4},
      {name:"Usage metrics", where:"Dashboards and REST API", d:"Adoption and use: active users, features, acceptance, lines of code, pull request flow. The metrics policy has to be on, and the data runs two to three days behind.", ch:7, sec:0}
    ]}
  ],
  policies:[
    {group:"Who controls what", items:[
      {name:"Enterprise beats organization", d:"When an enterprise owner sets a policy, the organization can't override it. People follow whoever gives them their seat.", ch:1, sec:2},
      {name:"Personal plans sit outside the fence", d:"A developer on their own Pro plan isn't covered by company policies, exclusions or the audit log. The fix is an organization seat.", ch:1, sec:3},
      {name:"When organizations disagree", d:"Inside one enterprise, most features go least restrictive: one org turning it on is enough. The public code policy goes most restrictive.", ch:6, sec:4},
      {name:"Code review policy first", d:"Turn on the Copilot code review policy, then rulesets can request reviews automatically.", ch:6, sec:4},
      {name:"The CLI has its own policy", d:"Separate from the rest of Copilot. The cloud agent and MCP have theirs too.", ch:6, sec:4},
      {name:"Not every policy reaches every surface", d:"GitHub keeps a table. Content exclusion skips third party agents. The public code policy skips GitHub.com chat, the CLI and code review.", ch:5, sec:4}
    ]},
    {group:"Content exclusion", items:[
      {name:"What it does", d:"Keeps chosen files out of context: no inline suggestions there, no use in answers or suggestions elsewhere, no code review. Business and Enterprise only.", ch:5, sec:0},
      {name:"Who sets it, who it covers", d:"Repository admin: anyone in the enterprise working in that repo. Organization owner: people with a seat from that org. Enterprise owner: everyone in it.", ch:5, sec:0},
      {name:"Patterns", d:"One path per line, case ignored. Org rules name the repo first, or * for all. /scripts/* is that folder only; /scripts/** reaches everything below.", ch:5, sec:0},
      {name:"Where it doesn't reach", d:"Edit and agent modes in VS Code, symbolic links, remote filesystems, and type or hover details the IDE passes along. Preview on GitHub.com.", ch:5, sec:0},
      {name:"When it seems broken", d:"Changes take up to 30 minutes. Run Developer: Reload Window in VS Code, or restart the IDE. Then check the pattern, the surface and whose seat it is.", ch:5, sec:1},
      {name:"Test it", d:"The status bar icon gets a line through it in an excluded file. Ask Chat about the file: it shouldn't explain it or list it in References.", ch:5, sec:1}
    ]},
    {group:"Public code, data and ownership", items:[
      {name:"Suggestions matching public code", d:"Block drops a match, checked with about 150 characters of context. Allow shows it with code referencing: where it lives and its license.", ch:5, sec:2},
      {name:"Ownership", d:"GitHub doesn't claim ownership of suggestions. Checking what you ship, licenses included, is on you.", ch:5, sec:2},
      {name:"Retention on Business and Enterprise", d:"IDE chat and completions: prompts and suggestions aren't kept. GitHub.com, mobile and the CLI: 28 days. Engagement data: two years.", ch:5, sec:3},
      {name:"Training", d:"Business and Enterprise data doesn't train GitHub's models. Since April 24, 2026, Free, Pro, Pro+ and Max interactions may be used unless the person turns that off.", mock:true},
      {name:"Editor settings", d:"github.copilot.enable turns Copilot off by language for one person. It's a personal choice, not a company control like an exclusion.", ch:5, sec:0}
    ]}
  ],
  responsible:[
    {r:"Know the six principles.", why:"Fairness, reliability and safety, privacy and security, inclusiveness, transparency, and accountability. GitHub follows Microsoft's set.", ch:3, sec:3},
    {r:"Accountability stays with people.", why:"It means people answer for what the AI does. It doesn't mean finding one person to blame.", ch:3, sec:3},
    {r:"Know the harms by name.", why:"Overreliance, inaccurate or insecure code, bias from training data, and matches with licensed public code.", ch:3, sec:3},
    {r:"Copilot predicts; it doesn't look things up.", why:"So it can be confident and wrong, invent an API, lag a library's newest version, or answer differently next time.", ch:3, sec:1},
    {r:"Whoever accepts it owns it.", why:"Read it until you understand it, run it, and test it against what the code is meant to do.", ch:3, sec:2},
    {r:"Match review to risk.", why:"A README typo and an authentication change don't get the same look.", ch:3, sec:2},
    {r:"A click is a signature.", why:"Read every proposed command. Anything that changes state, like deploys, deletes or migrations, waits for a person who read it.", ch:2, sec:2},
    {r:"Agent work gets an independent review.", why:"The cloud agent can't approve its own pull request, and the person who asked for the work can't either.", ch:2, sec:1},
    {r:"Be honest about what's real.", why:"Transparency means saying what worked, what broke and what you don't know. Sample data in a prototype isn't a result.", ch:7, sec:3},
    {r:"Inclusiveness covers language too.", why:"English is Chat's main language, and prompts in others can do differently, so plan for the people who use them.", mock:true}
  ],
  prompting:[
    {r:"Single.", why:"One task per prompt. Three jobs in one ask split the answer three ways.", ch:4, sec:4},
    {r:"Specific.", why:"Explicit and detailed. Say the inputs, outputs and limits you want.", ch:4, sec:4},
    {r:"Short.", why:"Clear without piling on. Break big jobs into small ones.", ch:4, sec:4},
    {r:"Surround.", why:"Descriptive file names and the right files open. Close the tabs that don't matter.", ch:4, sec:4},
    {r:"Zero, one or few shot.", why:"No example is zero shot, fine for common patterns. One is one shot. Several is few shot, best when the format has to be exact.", ch:4, sec:4},
    {r:"Role prompting and chain prompting.", why:"Role asks Copilot to act as a kind of expert, like a security reviewer. Chain builds a result over several turns.", ch:4, sec:4},
    {r:"Goal, context, requirements, example.", why:"Start with the goal, give the schema or types as context, name every edge case, then show an example. Invent the data, never real rows.", ch:7, sec:1},
    {r:"Context decides the answer.", why:"Copilot builds each prompt from what you typed plus the current file, selection, open tabs, instructions files and chat history.", ch:4, sec:4},
    {r:"History rides along.", why:"Telling Copilot to ignore old turns doesn't remove them. Start a new thread with a short summary, or delete turns that didn't help.", ch:4, sec:4},
    {r:"Name the edges in test prompts.", why:"Empty input, nulls, the largest value, month ends, time zones. Tests that only confirm today's output aren't validation.", ch:3, sec:4}
  ],
  terms:[
    {group:"How a suggestion is made", items:[
      {t:"Context", d:"What Copilot uses to build a prompt: the file, code near the cursor, open tabs, project details and instructions.", ch:1, sec:4},
      {t:"Fill in the middle", d:"The model sees the code before and after the cursor, so a suggestion fits both sides.", ch:3, sec:0},
      {t:"Proxy", d:"GitHub's service in a GitHub owned Azure tenant between the editor and the model. It stops attempts to manipulate the prompt or the system. A separate toxicity filter screens out harmful content and personal data.", ch:3, sec:0},
      {t:"Post processing", d:"Checks on the way back: harmful content, common bugs and vulnerabilities, and public code matches when Block is set.", ch:3, sec:0},
      {t:"Suggestion lifecycle", d:"Gather context, build the prompt, proxy and filters, model, filters again, show it, then learn from what you accept or reject.", ch:3, sec:0},
      {t:"Context window", d:"The limited text a model can take in at once, chat history included.", ch:2, sec:3},
      {t:"Hallucination", d:"Confident output that's wrong, like a function that doesn't exist.", ch:1, sec:4}
    ]},
    {group:"Rollout and admin", items:[
      {t:"Seat", d:"A Copilot license granted to a member. Billing starts on grant.", ch:1, sec:2},
      {t:"Policy", d:"An org or enterprise setting for a feature, a privacy choice or model access.", ch:1, sec:2},
      {t:"Pending cancellation", d:"A removed seat's state. Access lasts until the billing cycle ends.", ch:6, sec:4},
      {t:"last_activity_at", d:"A seat's latest Copilot activity. IDE activity shows only with telemetry on.", ch:6, sec:4},
      {t:"Acceptance rate", d:"How often people accept suggestions. A sign of relevance and trust, not correctness.", ch:7, sec:0},
      {t:"Session log", d:"The record of what the cloud agent tried and ran, linked from its pull request.", ch:2, sec:1}
    ]},
    {group:"Privacy and safeguards", items:[
      {t:"Content exclusion", d:"A Business or Enterprise setting that keeps chosen files out of Copilot's context.", ch:5, sec:0},
      {t:"Semantic information", d:"Types and hover details the IDE can still pass from an excluded file.", ch:5, sec:0},
      {t:"Code referencing", d:"With matches allowed, the details on matching public code: where it is and its license.", ch:5, sec:2},
      {t:"User engagement data", d:"How people use Copilot, like accepting or dismissing. Kept two years.", ch:5, sec:3},
      {t:"Trusted directory", d:"A folder the CLI may read, change and run files in, with everything below it.", ch:6, sec:1}
    ]},
    {group:"Testing and productivity", items:[
      {t:"Edge case", d:"An input at the boundary of what code handles, where bugs hide.", ch:3, sec:4},
      {t:"Mock", d:"A stand in for an outside system so a test checks how your code calls it. Using one doesn't make a test a unit test.", ch:7, sec:2},
      {t:"Integration test", d:"Checks pieces working together, such as code against a real test database.", ch:7, sec:2},
      {t:"Characterization tests", d:"Tests that pin what old code does today, so a rewrite can be checked against it.", ch:7, sec:1},
      {t:"Programmatic mode", d:"Running the CLI with -p and one prompt. It does the task and exits.", ch:6, sec:0}
    ]}
  ],
  rules:[
    {r:"Policy control means an organization plan.", why:"Business or Enterprise. Mention of Enterprise Cloud and enterprise features leans Enterprise. An individual plan never gives the company control.", ch:1, sec:0},
    {r:"GitHub.com is the odd one out.", why:"In a list of IDEs, it's the trap. Copilot works there, but there's no extension to install.", ch:1, sec:1},
    {r:"In the IDE and watching: agent mode. Assigned an issue: cloud agent.", why:"Agent mode is synchronous in the editor. The coding agent works in the background and opens a pull request.", ch:2, sec:0},
    {r:"On the exam, Copilot's review isn't an approval.", why:"By default it leaves a Comment review. Copilot approvals reached the docs on September 1, 2026, after the outline, so on the exam the answer is no.", ch:7, sec:4},
    {r:"Rules for some files: a .instructions.md with applyTo.", why:"If the path matches, the path specific and the repository wide instructions both apply.", ch:4, sec:1},
    {r:"Instructions always ride along. Prompt files run on demand.", why:"Use instructions for standing rules and prompt files for a task you repeat.", ch:4, sec:3},
    {r:"Exclusion not working? Think timing first.", why:"Up to 30 minutes, or reload. Then the pattern, the surface and whose seat it is.", ch:5, sec:1},
    {r:"The audit log shows settings, not prompts.", why:"Policy, seat and exclusion changes, kept 180 days. Export or stream it for longer evidence.", ch:5, sec:4},
    {r:"Seats, usage and settings each have their own source.", why:"Seats come from the user management API, usage from the metrics dashboards and API, settings changes from the audit log.", ch:7, sec:0},
    {r:"Drifting answers in a long thread point to context.", why:"Fix it with a fresh session, a tighter prompt or a subagent, not by repeating yourself louder.", ch:2, sec:3},
    {r:"Responsible answers keep a person in the loop.", why:"Green checks and an AI review are inputs, not a sign off. Trusting it because it's usually right is wrong every time.", ch:3, sec:2},
    {r:"Fix the process, not the person.", why:"Answers that blame one person or ban the tool are almost always wrong.", ch:3, sec:3},
    {r:"Start the CLI in the project folder.", why:"Never your home folder. Keep approval flags narrow and people on anything that changes state.", ch:6, sec:1},
    {r:"Legacy code: explain, test, convert in steps, compare.", why:"A translation that compiles can still behave differently, so run the same input through both.", ch:7, sec:1},
    {r:"Copilot's security help isn't a full scan.", why:"It finds common problems and suggests fixes. Keep code scanning, and measure any performance change.", ch:7, sec:2}
  ]
};
