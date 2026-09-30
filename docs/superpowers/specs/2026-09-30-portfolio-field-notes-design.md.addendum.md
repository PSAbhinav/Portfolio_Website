# Addendum (2026-09-30, iteration 2): Field guide, single gallery, feedback fixes

Owner feedback after the first build changed these parts of the design:

- **Now → Field guide.** The pinned two-column chapter becomes three scroll-driven interactive explainers, one per highlight, in the spirit of the living-learning-platform skill: hybrid retrieval (query → BM25 term weights and embedding neighbourhood → fused ranking), intent routing (visitor picks an intent; a typed judgment races a full model call, with a threshold rule), and connectors (five sources drawn into one knowledge base, with a commit→UAT delivery sweep). Progress comes from ScrollTrigger on desktop with motion allowed; everywhere else the finished state renders. `highlight.visual` selects the explainer.
- **Work → Gallery.** All projects appear once. Desktop with motion: a pinned horizontal reel driven by vertical scroll (native scrolling only), with a counter and progress line and a Reel/Grid toggle. Reduced motion, narrow screens, or a deep link: a two-column grid.
- **Copy.** Ramco work is described at capability level (retrieval, routing, connectors); merge-request counts and ticket language are gone. Dates: QA Intern Apr–Jul 2026, Project Trainee RXD from Jul 2026.
- **Removed.** All "FIG." captions; the project index; analytics text and back-to-top from the footer (footer is one compact row).
- **Credentials.** Anthropic Academy certificates ship as PDFs under `/certificates` and open from their badges; Credly badges keep "Verify".
- **Images.** Project artwork re-encoded as WebP; the four 640px illustrations upscaled to 2560px for crispness (no new detail is possible from those sources), served at quality 90 with a 56vw size hint.
- **Contact.** Succeeds whenever the message is safe: e-mailed when SMTP is configured, otherwise stored in the studio inbox when a database exists. Only with neither does the visitor see the fallback.
- **Social image.** `public/og.png` (1200×630), generated from the site's own tokens and fonts, used for Open Graph and Twitter cards.
