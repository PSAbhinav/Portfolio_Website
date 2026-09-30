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
    "Portfolio of P S Abhinav Krishna: Project Trainee at Ramco Systems on rTask.ai, Claude Certified Architect, builder of practical AI and full-stack applications.",
  github: "https://github.com/PSAbhinav",
  linkedin: "https://linkedin.com/in/abhinav-pemmaraju-765221255",
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
    team: "rTask.ai product engineering",
    location: "Bengaluru, India",
    start: "2026-07",
    end: "",
    summary:
      "rTask.ai is Ramco's AI-first helpdesk. I work where retrieval, routing and the product surface meet, shipping test-first across the React front end, the Node API and the Python retrieval service.",
    highlights: [
      {
        label: "01 / Retrieval",
        metric: "Hybrid search across 92 production collections",
        detail:
          "Moved the retrieval service to BM25 plus vector search on Milvus and migrated every production collection with zero failures, so answers match exact terms and meaning at once.",
        visual: "retrieval",
      },
      {
        label: "02 / Routing",
        metric: "Two-thirds of intents resolved without an LLM call",
        detail:
          "Designed a 50-case benchmark for typed intent routing: full action and agent accuracy, a p95 under 660 ms, and a clear rule for when the model is worth calling.",
        visual: "routing",
      },
      {
        label: "03 / Connectors",
        metric: "Five enterprise sources, one knowledge base",
        detail:
          "Owned the Knowledge Base Connectors experience across Notion, Confluence, Google Drive, SharePoint and Azure, and ran a 200-item quality programme from commit to UAT with a tracker I built.",
        visual: "connectors",
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
      "Designed and executed test cases for the KPI and OKR set-up modules, then built a Playwright (TypeScript) regression framework with fixtures, page objects and a ten-suite KPI pack.",
    highlights: [],
  },
];

export const projects: PortfolioContent["projects"] = [
  {
    slug: "stockpro",
    title: "StockPro — AI Stock Dashboard",
    summary: "Live market dashboard with AI price predictions for Indian and US stocks.",
    description:
      "Real-time stock market dashboard featuring AI-powered price predictions, technical analysis, and live data for Indian & US stocks.",
    image: "/projects/stock-pro.webp",
    github: "https://github.com/PSAbhinav/StockPro",
    demo: "https://stockpro-0kjn.onrender.com/",
    tags: ["Python", "React", "AI", "Socket.IO"],
    featured: true,
    year: "2025",
  },
  {
    slug: "nexus-command",
    title: "NexusCommand — Digital Command Center",
    summary: "A personal command center for budgets and habits with a glass UI.",
    description:
      "Futuristic, cyberpunk-inspired personal command center with budget tracking, habit monitoring, and a sleek glassmorphic UI.",
    image: "/projects/nexus-command.webp",
    github: "https://github.com/PSAbhinav/nexus-command",
    demo: "https://nexus-command-hq.vercel.app/",
    tags: ["React", "Firebase", "Vite"],
    featured: true,
    year: "2026",
  },
  {
    slug: "task-manager",
    title: "TaskManager — Student Portal",
    summary: "Tasks, courses and schedules for students, synced in real time.",
    description:
      "Professional student portal for managing tasks, courses, and schedules with real-time cloud sync and university-restricted auth.",
    image: "/projects/task-manager.webp",
    github: "https://github.com/PSAbhinav/Task-Manager",
    demo: "https://taskmanager-student.vercel.app/",
    tags: ["React", "Firebase", "Vite"],
    featured: true,
    year: "2026",
  },
  {
    slug: "ai-quote-generator",
    title: "AI Quote Generator",
    summary: "Daily quotes generated by a language model, one tap at a time.",
    description:
      "Daily Inspiration, Powered by AI: A smart application that generates unique, meaningful quotes using advanced language models.",
    image: "/projects/ai-quote-generator.webp",
    github: "https://github.com/PSAbhinav/ai-quote-generator",
    demo: "",
    tags: ["Next.js", "AI", "Google Cloud", "TypeScript"],
    featured: false,
    year: "2026",
  },
  {
    slug: "ai-chess-bot",
    title: "AI Chess Bot",
    summary: "A chess engine that learns from every move it plays.",
    description:
      "Play Smarter: A bot that plays chess using an AI engine trained to improve with every move. Built for fun, challenge, and learning.",
    image: "/projects/ai-chess-bot.webp",
    github: "https://github.com/PSAbhinav/chess-ai",
    demo: "",
    tags: ["Python", "AI", "Machine Learning"],
    featured: false,
    year: "",
  },
  {
    slug: "audio-to-text",
    title: "Audio-to-Text Converter",
    summary: "Turns spoken notes into editable text with speech recognition.",
    description:
      "Convert Speech to Insights: A lightweight app that turns your audio notes into accurate, editable text using speech recognition.",
    image: "/projects/audio-to-text-converter.webp",
    github: "https://github.com/PSAbhinav/audio-text-flask-app.git",
    demo: "",
    tags: ["Python", "Speech Recognition", "NLP"],
    featured: false,
    year: "",
  },
  {
    slug: "basic-firewall",
    title: "Basic Firewall",
    summary: "A small rule-based firewall that flags suspicious traffic.",
    description:
      "Network Defense Simplified: A beginner-friendly but functional firewall that detects suspicious activity using basic filtering rules.",
    image: "/projects/basic-firewall.webp",
    github: "https://github.com/PSAbhinav/BasicFirewall.git",
    demo: "",
    tags: ["Python", "Networking", "Security"],
    featured: false,
    year: "",
  },
  {
    slug: "acadmaster",
    title: "AcadMaster — CGPA/SGPA Calculator",
    summary: "GPA calculations across grading systems, with history.",
    description:
      "Your Academic Companion: Automates GPA calculations, supports multiple grading systems, and stores historical results.",
    image: "/projects/acadmaster-cgpa-sgpa.webp",
    github: "https://github.com/KarthikeyanJ04/AcadMaster.git",
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
      { name: "Python", note: "RAG service, migration scripts, evaluation harnesses" },
      { name: "TypeScript", note: "helpdesk front end and Node.js API" },
      { name: "C", note: "systems fundamentals" },
      { name: "SQL", note: "PostgreSQL, MongoDB queries" },
    ],
  },
  {
    title: "Product engineering",
    skills: [
      { name: "React", note: "design-system components, Vite, Vitest" },
      { name: "Node.js & Express", note: "API routes, Jest suites" },
      { name: "FastAPI", note: "retrieval endpoints" },
      { name: "Playwright", note: "end-to-end and regression packs" },
    ],
  },
  {
    title: "AI systems",
    skills: [
      { name: "Claude API & Agent SDK", note: "agentic workflows, tool use" },
      { name: "RAG", note: "hybrid BM25 + vector, Milvus, ChromaDB" },
      { name: "Prompt engineering", note: "system prompts, guardrails, evals" },
      { name: "Claude Code", note: "daily driver for delivery" },
    ],
  },
];

export const certifications: PortfolioContent["certifications"] = [
  {
    title: "Claude Certified Architect – Professional",
    issuer: "Anthropic",
    date: "2026-09",
    url: "https://www.credly.com/badges/0ea1a99f-14a8-4c43-ba6a-e22b0db21da3",
    score: "825 / 1000",
  },
  {
    title: "Claude Certified Associate – Foundations",
    issuer: "Anthropic",
    date: "2026-09",
    url: "https://www.credly.com/badges/0085865c-3e09-404e-9dec-2e75f49da002",
    score: "835 / 1000",
  },
  { title: "Claude 101", issuer: "Anthropic Academy", date: "2026-09", url: "/certificates/claude-101.pdf", score: "" },
  { title: "Claude Code 101", issuer: "Anthropic Academy", date: "2026-09", url: "/certificates/claude-code-101.pdf", score: "" },
  {
    title: "ML Using Python",
    issuer: "Infosys Springboard",
    date: "2025-05",
    url: "https://drive.google.com/file/d/1P__x8h2vE5AYMCb_2IoXHxwWm2r6J1CJ/view",
    score: "",
  },
  {
    title: "Project Management with Agile",
    issuer: "Infosys Springboard",
    date: "2024-11",
    url: "https://drive.google.com/file/d/18tevBizTpCzR4C0JeQzqS2OEXiE1akWF/view",
    score: "",
  },
  {
    title: "AI & LLM",
    issuer: "Udemy",
    date: "2024-10",
    url: "https://drive.google.com/file/d/1Oke5HUyrqVV0NtdwbYjYFOCqZW9wbjG0/view",
    score: "",
  },
  {
    title: "UNIX & Linux OS Fundamentals",
    issuer: "Infosys Springboard",
    date: "2024-02",
    url: "https://drive.google.com/file/d/1txsLQD7kLGX6HC_yixOUjbviPAj1JL_i/view",
    score: "",
  },
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

export const defaultContent: PortfolioContent = {
  profile,
  contactEmail,
  biography,
  experience,
  projects,
  skillGroups,
  certifications,
  education,
  copy,
};
