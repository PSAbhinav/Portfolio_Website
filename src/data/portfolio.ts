import type { PortfolioContent } from "../lib/content-schema";
import copy from "./copy.json";

// Bundled content. The admin studio can override all of it once a database
// is connected; until then this is what the site shows.

export const profile: PortfolioContent["profile"] = {
  name: "P S Abhinav Krishna",
  image: "/Profile_Pic.jpg",
  role: "Project Trainee, RXD",
  company: "Ramco Systems",
  location: "Bengaluru, India",
  availability: "Open to conversations",
  tagline:
    "I build AI-first software that has to work on a Monday morning: helpdesk agents, retrieval pipelines and the tests that keep them honest.",
  metadataTitle: "P S Abhinav Krishna — AI engineer",
  metadataDescription:
    "Portfolio of P S Abhinav Krishna: Project Trainee at Ramco Systems on Chia AI, Claude Certified Architect, builder of practical AI and full-stack applications.",
  github: "https://github.com/PSAbhinav",
  linkedin: "https://linkedin.com/in/abhinav-pemmaraju-765221255",
  resume: "/resume.pdf",
};

export const contactEmail = "abhinavpemmaraju@gmail.com";

export const biography: string[] = [
  "I’m a Computer Science graduate who enjoys building practical applications and experimenting with new technologies, especially in AI and full-stack development. I’ve worked on projects across different domains, including a stock prediction platform, AI-based tools, and full-stack applications like task management systems and e-commerce setups.",
  "I focus on building things that go beyond basic prototypes—making them functional, usable, and closer to real-world applications. I’m particularly interested in integrating AI into everyday use cases and improving user experience through clean and intuitive design.",
  "Most of my learning comes from building, breaking, and figuring things out along the way. I’m always looking for opportunities to work on ideas that challenge me and help me grow as a developer.",
];

export const experience: PortfolioContent["experience"] = [
  {
    company: "Ramco Systems",
    title: "Project Trainee, RXD",
    team: "Chia AI product engineering",
    location: "Bengaluru, India",
    start: "2026-07",
    end: "",
    summary:
      "My main assignment is Chia AI, Ramco's AI-first helpdesk platform: retrieval, intent routing and the knowledge-base experience, shipped test-first across a React front end, a Node.js API and a Python retrieval service. Alongside it I have delivered front-end work for two other product teams, an employee-engagement product with HR, and an internal learning programme on agentic AI.",
    highlights: [
      {
        label: "01 / Retrieval",
        metric: "Migrating production search to hybrid BM25",
        detail:
          "Planned and ran the retrieval service's move to BM25 plus vector search on Milvus. A bash CLI written for the run migrated every production collection with zero failures, so answers now match exact terms and meaning at once.",
        visual: "retrieval",
      },
      {
        label: "02 / Routing",
        metric: "Evaluating Jev for the routing layer",
        detail:
          "Asked whether TypeSafe Jev could stand in for the LLM as the helpdesk's intent router, I built a 50-case benchmark: full action and agent accuracy, a p95 under 660 ms, and a clear rule for when the model is still worth calling.",
        visual: "routing",
      },
      {
        label: "03 / Connectors",
        metric: "Knowledge Base Connectors, redesigned end to end",
        detail:
          "Fixed the UI and UX of the Knowledge Base Connectors across Notion, Confluence, Google Drive, SharePoint and Azure, owning the final look and feel, a 200-item fix list through six review rounds, and a tracker from commit to UAT.",
        visual: "connectors",
      },
      {
        label: "04 / Component platform",
        metric: "The front end of a component platform, fifteen screens",
        detail:
          "Built the user interface of an internal platform that imports a React repository, extracts its components into a searchable library with live previews, and lets a team edit, check and merge them with an AI agent's plan approved first. Fifteen screens, a design-system seed with light and dark themes, Playwright verification and accessibility fixes. Infrastructure and the model integration were a colleague's.",
        visual: "none",
      },
      {
        label: "05 / Knowledge visualiser",
        metric: "A knowledge base you can fly through, for the ERP team",
        detail:
          "Owned the front end of a 3D knowledge-base explorer and its 2D execution-flow view: radar and sonar sweeps in SVG and CSS, animated journey traces, auto-play down a service chain, camera pacing, zoom-to-cursor, a presenter mode and a calm chrome that fades when idle, all honouring reduced motion. Graph logic, data and back end were a colleague's.",
        visual: "none",
      },
      {
        label: "06 / Employee engagement",
        metric: "Vibe Check, a ten-second daily mood pulse built with HR",
        detail:
          "From kickoff to a pilot-ready prototype in four days: a card that opens once a day with one question, a reveal screen, a mood dashboard by team that never shows a group under seven people, an admin console with four roles, Microsoft sign-in and a deploy kit. A 257-question engine with repeat and cooldown rules, 95 unit and 22 end-to-end tests, and the approvals, rollout and demo documents.",
        visual: "none",
      },
      {
        label: "07 / Low-code enablement",
        metric: "React screens rebuilt as low-code modules, then taught",
        detail:
          "Rebuilt HR set-up screens from React into the company's low-code studio as page definitions: list and card views with create, edit, filter, import and export drawers, following shared conventions. Ran a learning-and-teaching module so a colleague could ship their own, which they did.",
        visual: "none",
      },
      {
        label: "08 / Teaching",
        metric: "An eight-session agentic AI programme with a live quiz",
        detail:
          "Planned and delivered eight weekly sessions for colleagues, from AI foundations and prompt engineering through RAG, agents, context engineering and shipping to production: eight decks, eight study guides, 38 live demos, and a quiz app with a host console, speed scoring and standings that carry across the season.",
        visual: "none",
      },
    ],
  },
  {
    company: "Ramco Systems",
    title: "QA Intern",
    team: "Quality engineering",
    location: "Bengaluru, India",
    start: "2026-04",
    end: "2026-07",
    summary:
      "Tested HR set-up modules, built the team's Playwright regression framework and a starter kit other testers adopted, and replaced hand-written daily status reports with QTrack, a test-tracking dashboard I built alone that the testing teams still use.",
    highlights: [
      {
        label: "01 / QTrack",
        metric: "Every test, every owner, one dashboard",
        detail:
          "Built QTrack end to end as a QA intern: a role-based test-tracking dashboard where every suite, run, owner and outcome lives in one place. Deployed internally and used daily by the testing teams in place of manual status updates.",
        visual: "none",
      },
      {
        label: "02 / Test automation",
        metric: "An Excel-driven Playwright framework and a starter kit",
        detail:
          "Test cases are written once in a spreadsheet; the framework generates standard Playwright specs from it, runs them in parallel on Chrome and Edge, and reports back against the original case IDs. 127 cases across ten suites for one module, a second module scaffolded, page objects and fixtures, a handover pack, and a copy-and-go starter kit colleagues used for their own screens.",
        visual: "none",
      },
    ],
  },
];

export const projects: PortfolioContent["projects"] = [
  {
    slug: "qtrack",
    title: "QTrack — QA tracking dashboard",
    summary: "One dashboard for every test the team runs, with roles. Built alone as a QA intern; in daily use at Ramco.",
    description:
      "Reporting test status by hand every day as a QA intern, I built the fix: a test-tracking dashboard with role-based access where every suite, run, owner and outcome lives in one place. Designed, built and deployed alone; Ramco's testing teams use it daily. Its first screen is automated with Playwright.",
    image: "/projects/qtrack.webp",
    github: "",
    demo: "",
    tags: ["QA tooling", "Role-based access", "Internal at Ramco"],
    featured: true,
    year: "2026",
  },
  {
    slug: "cmd-blueprint",
    title: "Component platform — front end and blueprint",
    summary: "A platform that turns a React repository into a searchable, previewable, editable component library. I built its fifteen screens.",
    description:
      "Import a React repository and the platform extracts its components into a library with live previews, a studio workspace, token and storyboard views, testing and docs, plus an agent rail whose plans you approve before anything changes. I built the entire front end and its design-system seed; the public blueprint page explains the product from first principles.",
    image: "/projects/cmd-blueprint.webp",
    github: "",
    demo: "https://cmd-2-blueprint.vercel.app/",
    tags: ["Next.js", "shadcn/ui", "Design system"],
    featured: false,
    year: "2026",
  },
  {
    slug: "vibe-check",
    title: "Vibe Check — daily team mood pulse",
    summary: "One question a day, answered in ten seconds from a card on the laptop; HR reads the mood by team, never by person.",
    description:
      "Built with HR from kickoff to a pilot-ready prototype: a daily card with an avatar and one question, a reveal screen with a note from HR, a mood dashboard with trends by team and bucket that hides any group under seven people, an admin console with four roles, Microsoft sign-in and a deploy kit. 257 questions, 95 unit and 22 end-to-end tests.",
    image: "/projects/vibe-check.webp",
    github: "",
    demo: "",
    tags: ["Next.js", "Behavioural design", "Internal at Ramco"],
    featured: false,
    year: "2026",
  },
  {
    slug: "orbital-academy",
    title: "Orbital Academy — rocket and orbit simulator",
    summary: "Build a rocket from real hardware, fly a webcast-style launch and arm a real insertion burn, in the browser.",
    description:
      "A physics-first space programme for every age: a catalogue of about 30 real engines and 34 real stages, a go/no-go weather poll, a webcast-style mission control room for the launch and a guidance-planned insertion burn. Rebuilt on a real physics engine as the successor to the Satellite-Sim prototypes.",
    image: "/projects/orbital-academy.webp",
    github: "https://github.com/PSAbhinav/satellite-sim",
    demo: "https://psabhinav.github.io/satellite-sim/",
    tags: ["TypeScript", "Physics engine", "3D"],
    featured: true,
    year: "2026",
  },
  {
    slug: "dsa-visualizer",
    title: "DSA Visualizer",
    summary: "Data structures and algorithms taught by seeing: animated visualisers, code in several languages and practice problems.",
    description:
      "An interactive platform for data structures and algorithms: visualisers for arrays, linked lists, stacks, queues, trees, graphs, sorting and dynamic programming; a beginner-to-pro progression with pseudocode and complexity analysis; practice sets per topic; progress tracked behind Google sign-in.",
    image: "/projects/dsa-visualizer.webp",
    github: "https://github.com/PSAbhinav/dsa-visualizer",
    demo: "https://dsa-visualizer-v10.vercel.app/",
    tags: ["Next.js", "Framer Motion", "Firebase"],
    featured: true,
    year: "2026",
  },
  {
    slug: "claude-marketplace",
    title: "Claude Marketplace — a Claude Code plugin catalogue",
    summary: "One browsable catalogue of agents, commands, skills and MCP servers for Claude Code, installable as native plugins.",
    description:
      "A curated Claude Code marketplace with a live dashboard. Component packs bundle 423 agents, 346 slash commands, 885 skills and 92 MCP servers into per-category plugins, alongside community plugins installed from their public upstreams. Add it with /plugin marketplace add PSAbhinav/claude-plugins.",
    image: "/projects/claude-marketplace.webp",
    github: "https://github.com/PSAbhinav/claude-plugins",
    demo: "https://claude-code-marketplace-hub.vercel.app/",
    tags: ["Claude Code", "Plugins", "Python"],
    featured: false,
    year: "2026",
  },
  {
    slug: "portfolio-website",
    title: "Field Notes — this portfolio",
    summary: "The site you are reading: scroll-driven chapters, a shader background and a private studio that edits everything without code.",
    description:
      "Next.js 15 with a paper-and-ink identity and one vermilion signal colour: scroll-linked chapters that always have a plain alternative, a WebGL background, interactive explainers of the helpdesk work, and a studio behind a passphrase and an authenticator for content, analytics, the inbox and this résumé.",
    image: "/projects/portfolio-website.webp",
    github: "https://github.com/PSAbhinav/Portfolio_Website",
    demo: "https://abhinavs-portfolio.vercel.app/",
    tags: ["Next.js", "GSAP", "WebGL"],
    featured: false,
    year: "2026",
  },
  {
    slug: "agentic-ai-learning-hub",
    title: "Agentic AI Learning Hub",
    summary: "A 13-module course platform for learning agentic AI, with a studio, a planner and progress saved per learner.",
    description:
      "The companion platform for the Learning Agentic AI programme I run: thirteen modules from AI foundations and prompt engineering through to agents, with a lesson studio, a planner, awards and progress saved per account. Two designs, Classic and Visual, share the same saved progress.",
    image: "/projects/agentic-ai-learning-hub.webp",
    github: "",
    demo: "https://agentic-ai-learning-hub.vercel.app/",
    tags: ["Teaching", "Course platform", "Web app"],
    featured: false,
    year: "2026",
  },
  {
    slug: "learning-agentic-ai-quiz",
    title: "Learning Agentic AI — live quiz",
    summary: "A live quiz for the Learning Agentic AI sessions, with standings that carry over from one session to the next.",
    description:
      "The quiz run live during the Learning Agentic AI sessions. Participants join with a display name while their employee ID guards the score, and overall standings persist across sessions so points carry over week to week.",
    image: "/projects/learning-agentic-ai-quiz.webp",
    github: "",
    demo: "https://learning-agentic-ai-quiz.vercel.app/",
    tags: ["Live quiz", "Teaching", "Web app"],
    featured: false,
    year: "2026",
  },
  {
    slug: "shadowtrace",
    title: "ShadowTrace — forensic identity dashboard",
    summary: "Real-time sign-in forensics: live geolocation, dynamic risk scoring and sign-out-everywhere, with no mock data.",
    description:
      "A forensic dashboard for identity protection built on a zero-mock rule: every event, geolocation and threat score comes from live telemetry. Real-time IP-to-geo resolution per sign-in, risk scores from login patterns and device metadata, TOTP-protected restoration and global session revocation.",
    image: "/projects/shadowtrace.webp",
    github: "https://github.com/PSAbhinav/ShadowTrace",
    demo: "https://shadowtrace-ai.vercel.app/",
    tags: ["TypeScript", "Security", "Realtime"],
    featured: false,
    year: "2026",
  },
  {
    slug: "analystos",
    title: "AnalystOS — AI financial research terminal",
    summary: "An equity research terminal with live DCF models, an AI investment-committee consensus and 3D market metrics.",
    description:
      "A 3D-first analyst operating system for next-generation investors: a hero cockpit, a global intelligence view, a DCF sandbox, an AI investment committee that reaches a consensus view, pricing plans and a secure vault.",
    image: "/projects/analystos.webp",
    github: "",
    demo: "https://analystos-terminal.vercel.app/",
    tags: ["Finance", "AI", "3D UI"],
    featured: false,
    year: "2026",
  },
  {
    slug: "stockpro",
    title: "StockPro — AI stock dashboard",
    summary: "Live market dashboard with AI price predictions for Indian and US stocks.",
    description:
      "Real-time stock market dashboard with AI-powered price predictions, technical analysis, multi-timeframe signals, live news and NSE and NASDAQ movers, plus a global stock search.",
    image: "/projects/stock-pro.webp",
    github: "https://github.com/PSAbhinav/StockPro",
    demo: "https://stock-pro-ai.vercel.app/",
    tags: ["Python", "Next.js", "AI"],
    featured: false,
    year: "2025",
  },
  {
    slug: "nexus-command",
    title: "NexusCommand — personal command centre",
    summary: "A cloud-synced command centre for finances, goals, productivity and health with a glass UI.",
    description:
      "A cyberpunk-inspired personal command centre: a finance tracker with budgets and insights, goals and habit streaks, Kanban tasks with a focus timer, and health metrics, all synced through Firebase behind secure sign-in.",
    image: "/projects/nexus-command.webp",
    github: "https://github.com/PSAbhinav/nexus-command",
    demo: "https://nexus-command-hq.vercel.app/",
    tags: ["React", "Firebase", "Vite"],
    featured: false,
    year: "2026",
  },
  {
    slug: "fitlife",
    title: "FitLife — your day, your training, your plate",
    summary: "A daily timetable, a 12-week dumbbell and bodyweight programme and a vegetarian high-protein plan, generated from your settings.",
    description:
      "Built for one person and generated from their settings: the day as a timeline of blocks with a live card for what is happening now, a coach note for the week, the day's training session and the day's meals with protein per plate. Visitors see a sample day until they sign in.",
    image: "/projects/fitlife.webp",
    github: "",
    demo: "https://thefitlife.vercel.app/",
    tags: ["Personal app", "Planning", "Web app"],
    featured: false,
    year: "2026",
  },
  {
    slug: "keystone",
    title: "Keystone — assessment portal",
    summary: "An examination workspace for students, tutors and administrators, with practice and feedback in one place.",
    description:
      "Keystone Academia's assessment portal: a focused examination experience where students take assessments and see practice and feedback together, tutors review, and administrators provision the accounts. Sign-in is by administrator-issued accounts.",
    image: "/projects/keystone.webp",
    github: "",
    demo: "https://keystone-assessment-portal.vercel.app/",
    tags: ["Education", "Role-based access", "Web app"],
    featured: false,
    year: "2026",
  },
  {
    slug: "task-manager",
    title: "TaskManager — student portal",
    summary: "Tasks, courses and schedules for students, synced in real time.",
    description:
      "A student productivity portal for tasks, courses and a real-time daily schedule, with cloud sync through Firebase and sign-in restricted to institutional e-mail addresses.",
    image: "/projects/task-manager.webp",
    github: "https://github.com/PSAbhinav/Task-Manager",
    demo: "https://taskmanager-student.vercel.app/",
    tags: ["React", "Firebase", "Vite"],
    featured: false,
    year: "2026",
  },
  {
    slug: "culinary-recommender",
    title: "AI culinary recommendation system",
    summary: "Personalised recipes generated from the ingredients and preferences a user enters. Final-year project.",
    description:
      "My B.E. final-year project: an AI-powered culinary system that generates personalised recipes from the ingredients and preferences a user enters, pairing the recommendation logic with a dynamic interface built for scalability and real-time response.",
    image: "/projects/ai-recipe-recommender.webp",
    github: "",
    demo: "",
    tags: ["AI", "Recommendation", "Final-year project"],
    featured: false,
    year: "2025",
  },
  {
    slug: "smart-package-assistant",
    title: "Smart Package Assistant",
    summary: "A terminal assistant that finds and installs Linux packages from a plain-language request across APT, Snap and Flatpak.",
    description:
      "An AI-powered terminal application for Zorin OS 18 and Ubuntu 22.04: it understands what you need from a plain-language description, searches APT, Snap and Flatpak concurrently, ranks the results by relevance and installs with one command. Ships with a coloured TUI and a desktop launcher.",
    image: "/projects/smart-package-assistant.webp",
    github: "https://github.com/PSAbhinav/smart-package-assistant",
    demo: "",
    tags: ["Python", "Linux", "TUI"],
    featured: false,
    year: "2025",
  },
  {
    slug: "leetcode-bot",
    title: "LeetCode daily challenge bot",
    summary: "An n8n workflow that posts a daily set of unsolved LeetCode problems to Discord and logs them in Google Sheets.",
    description:
      "Picks three Easy, one Medium and one Hard unsolved problem each day, never repeats one until the whole set is solved, and posts a formatted message to a Discord channel on a schedule. Built entirely in n8n, with Google Sheets as both the problem database and the log.",
    image: "/projects/leetcode-bot.webp",
    github: "https://github.com/PSAbhinav/LeetCode-Bot",
    demo: "",
    tags: ["n8n", "Discord", "Automation"],
    featured: false,
    year: "2025",
  },
  {
    slug: "ai-quote-generator",
    title: "AI Quote Generator",
    summary: "Quotes generated by a language model from the mood or topic a user selects.",
    description:
      "A small AI Studio application that generates unique, meaningful quotes with the Gemini API from the mood or topic the user picks.",
    image: "/projects/ai-quote-generator.webp",
    github: "https://github.com/PSAbhinav/AI-Quote-Generator",
    demo: "",
    tags: ["TypeScript", "Gemini API", "AI Studio"],
    featured: false,
    year: "2026",
  },
  {
    slug: "ai-chess-bot",
    title: "Chess with an AI opponent",
    summary: "A Pygame chess game with a negamax opponent that searches a fixed depth with alpha-beta pruning.",
    description:
      "A chess game with a graphical board in Pygame: two-player mode, an AI opponent that searches a fixed depth with negamax and alpha-beta pruning, and the full rule set including checkmate, stalemate, promotion, en passant and castling.",
    image: "/projects/ai-chess-bot.webp",
    github: "https://github.com/PSAbhinav/chess-ai",
    demo: "",
    tags: ["Python", "Pygame", "Search algorithms"],
    featured: false,
    year: "2025",
  },
  {
    slug: "audio-to-text",
    title: "Audio-to-text with Whisper",
    summary: "A Flask app that transcribes WAV audio to text with segment timestamps using OpenAI Whisper.",
    description:
      "A small Flask web application that runs OpenAI's Whisper model locally to transcribe WAV recordings to text with segment-level timestamps, plus an endpoint to download the source audio.",
    image: "/projects/audio-to-text-converter.webp",
    github: "https://github.com/PSAbhinav/audio-text-flask-app",
    demo: "",
    tags: ["Python", "Flask", "Whisper"],
    featured: false,
    year: "2025",
  },
  {
    slug: "basic-firewall",
    title: "Basic Firewall",
    summary: "Blocks and unblocks websites on Windows through the hosts file, with DNS flushing and a block test.",
    description:
      "A Python script for local website blocking on Windows: block or unblock domains (bare and www) by redirecting them in the hosts file, flush the DNS cache automatically and test whether a site is blocked at the DNS level. Needs administrator rights by design.",
    image: "/projects/basic-firewall.webp",
    github: "https://github.com/PSAbhinav/BasicFirewall",
    demo: "",
    tags: ["Python", "Windows", "Networking"],
    featured: false,
    year: "2025",
  },
  {
    slug: "satellite-sim-phases",
    title: "Satellite-Sim Phase 3 and 4",
    summary: "The earlier satellite simulator prototypes, each a front end and back end pair, that Orbital Academy replaced.",
    description:
      "Two iterations of the original satellite simulator, each a JavaScript front end with its own back end and mock telemetry. Kept public as the record of where Orbital Academy started; Phase 3 lives in the sibling repository Satellite-Sim_Phase-3.",
    image: "/projects/satellite-sim-phases.webp",
    github: "https://github.com/PSAbhinav/Satellite-Sim_Phase-4",
    demo: "",
    tags: ["JavaScript", "Prototype", "Simulation"],
    featured: false,
    year: "2025",
  },
  {
    slug: "acadmaster",
    title: "AcadMaster — CGPA/SGPA calculator",
    summary: "GPA calculations across grading systems, with history.",
    description:
      "Automates GPA calculations, supports multiple grading systems, and stores historical results.",
    image: "/projects/acadmaster-cgpa-sgpa.webp",
    github: "https://github.com/KarthikeyanJ04/AcadMaster",
    demo: "",
    tags: ["React", "JavaScript", "Education"],
    featured: false,
    year: "",
  },
];

export const skillGroups: PortfolioContent["skillGroups"] = [
  {
    title: "Languages",
    skills: [
      { name: "Python", note: "RAG service, migration CLIs, evaluation harnesses" },
      { name: "TypeScript", note: "helpdesk front end, Node API, this site" },
      { name: "JavaScript", note: "Vite apps, n8n workflows" },
      { name: "Kotlin", note: "Jetpack Compose apps" },
      { name: "SQL", note: "PostgreSQL, Neon" },
      { name: "C", note: "systems fundamentals" },
      { name: "HTML & CSS", note: "design systems, responsive layout" },
    ],
  },
  {
    title: "Front end",
    skills: [
      { name: "React", note: "design-system components, hooks" },
      { name: "Next.js", note: "App Router, server routes, this portfolio" },
      { name: "Vite", note: "fast SPA builds" },
      { name: "Tailwind CSS", note: "utility styling" },
      { name: "GSAP & Framer Motion", note: "scroll choreography, transitions" },
      { name: "WebGL shaders", note: "the background of this site" },
      { name: "Jetpack Compose", note: "Android UI" },
    ],
  },
  {
    title: "Back end & data",
    skills: [
      { name: "Node.js & Express", note: "REST APIs, Jest suites" },
      { name: "FastAPI & Flask", note: "retrieval endpoints, Whisper transcription" },
      { name: "PostgreSQL & MongoDB", note: "schemas, queries, migrations" },
      { name: "Firebase", note: "auth, Firestore, real-time sync" },
      { name: "Milvus & ChromaDB", note: "vector stores for RAG" },
      { name: "Docker", note: "local services, deployable images" },
    ],
  },
  {
    title: "AI systems",
    skills: [
      { name: "Claude API & Agent SDK", note: "agentic workflows, tool use" },
      { name: "RAG", note: "hybrid BM25 + vector, Cohere embeddings" },
      { name: "LLM evaluation & routing", note: "benchmarks, p95 budgets, typed intents" },
      { name: "Prompt engineering", note: "system prompts, guardrails, evals" },
      { name: "OpenAI, Gemini, Bedrock", note: "multi-provider integrations" },
      { name: "Whisper", note: "speech to text" },
    ],
  },
  {
    title: "Testing & tooling",
    skills: [
      { name: "Playwright", note: "end-to-end and regression packs" },
      { name: "Vitest & Jest", note: "unit and API suites" },
      { name: "Manual test design", note: "cases, defects, handover" },
      { name: "Git & GitHub", note: "branching, MRs, delivery tracking" },
      { name: "Vercel & Neon", note: "deployment, serverless Postgres" },
      { name: "n8n", note: "scheduled automations" },
      { name: "Claude Code, Cursor, Windsurf", note: "AI-assisted delivery, daily" },
    ],
  },
];

export const certifications: PortfolioContent["certifications"] = [
  {
    title: "Claude Certified Architect – Professional",
    issuer: "Anthropic",
    date: "2026-09",
    url: "https://www.credly.com/badges/0ea1a99f-14a8-4c43-ba6a-e22b0db21da3",
    file: "/certificates/claude-certified-architect-professional.pdf",
    score: "825 / 1000",
  },
  {
    title: "Claude Certified Associate – Foundations",
    issuer: "Anthropic",
    date: "2026-09",
    url: "https://www.credly.com/badges/0085865c-3e09-404e-9dec-2e75f49da002",
    file: "/certificates/claude-certified-associate-foundations.pdf",
    score: "835 / 1000",
  },
  { title: "Claude 101", issuer: "Anthropic Academy", date: "2026-09", url: "", file: "/certificates/claude-101.pdf", score: "" },
  { title: "Claude Code 101", issuer: "Anthropic Academy", date: "2026-09", url: "", file: "/certificates/claude-code-101.pdf", score: "" },
  { title: "Network Security Essentials", issuer: "Infosys Springboard", date: "2025-10", url: "", file: "/certificates/network-security-essentials.pdf", score: "" },
  { title: "Machine Learning using Python", issuer: "Infosys Springboard", date: "2025-05", url: "", file: "/certificates/ml-using-python.pdf", score: "" },
  { title: "Project Management with Agile", issuer: "Infosys Springboard", date: "2024-11", url: "", file: "/certificates/project-management-with-agile.pdf", score: "" },
  { title: "AI & LLM", issuer: "Udemy", date: "2024-10", url: "", file: "/certificates/ai-and-llm.pdf", score: "" },
  { title: "UNIX & Linux OS Fundamentals", issuer: "Infosys Springboard", date: "2024-02", url: "", file: "/certificates/unix-linux-os-fundamentals.pdf", score: "" },
  { title: "Data Structures and Algorithms Masterclass", issuer: "Infosys Springboard", date: "2024-01", url: "", file: "/certificates/data-structures-and-algorithms.pdf", score: "" },
  { title: "Design Thinking", issuer: "Infosys Springboard", date: "2023-03", url: "", file: "/certificates/design-thinking.pdf", score: "" },
];

export const education: PortfolioContent["education"] = [
  {
    title: "B.E. in Computer Science Engineering",
    place: "Sai Vidya Institute of Technology, Bengaluru",
    date: "2022 - 2026",
    description: "Core computer science with a focus on web development. Graduated with a CGPA of 8.85.",
  },
  {
    title: "Pre-University (PUC)",
    place: "Narayana PU College, Bengaluru",
    date: "2020 - 2022",
    description: "Computer Science and Mathematics stream, 74%.",
  },
  {
    title: "Secondary School (SSLC)",
    place: "Narayana E-Techno School, Bengaluru",
    date: "2019 - 2020",
    description: "Completed 10th grade with 83% and a strong focus on Mathematics.",
  },
];

export const settings: PortfolioContent["settings"] = {
  daylightMode: true,
  defaultMode: "light",
  dayStartsAt: 6,
  nightStartsAt: 19,
  palette: {
    light: { paper: "#F6F1E8", paper2: "#EFE8DC", ink: "#16140F", ink2: "#5B564B", rule: "#D9D1C2", signal: "#B8391F", signalInk: "#FFF7F2" },
    dark: { paper: "#12110F", paper2: "#1A1816", ink: "#EFE9DE", ink2: "#A69F91", rule: "#2B2825", signal: "#FF6A45", signalInk: "#1A0C08" },
  },
  showIntro: true,
  showCursor: true,
  film: {
    enabled: true,
    src: "/video/helpdesk.mp4",
    poster: "/video/helpdesk.jpg",
    title: "How an AI helpdesk answers in under a second",
    caption: "Live animation · 27 s · loops",
  },
};

export const defaultContent: PortfolioContent = {
  profile,
  contactEmail,
  biography,
  experience,
  projects,
  skillGroups,
  certifications,
  education,
  settings,
  copy,
};
