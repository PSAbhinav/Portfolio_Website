---
workflow: faceless-explainer
flow: automation
storyboard: no
message: "An AI helpdesk answers in under a second because it routes without the model, searches two ways at once, and reads from one knowledge base"
destination: website-embed
aspect: 1920x1080
output_resolution: 3840x2160
fps: 30
language: en
audience: "Visitors to P S Abhinav Krishna's portfolio: recruiters and engineers"
length: 22-28s
angle: how-to
narration: no
---

## Intent

A short, muted-autoplay explainer embedded in the portfolio's Field Guide: how an AI helpdesk
answers one real employee question, illustrating the three things built at rTask.ai
(intent routing, hybrid retrieval, knowledge-base connectors). Not a tour of the website.
Quiet, printed field-notes feel.

## Customizations

- On-screen title, first beat: "How an AI helpdesk answers in under a second".
- Five beats: question types in; intent routing (typed judgment 470 ms: Create ticket / IT access / 0.99,
  full model call lane to 1,840 ms, label "Two-thirds of intents never need the model"); hybrid retrieval
  (BM25 weights vpn/token/expire/sso + embedding neighbourhood fuse to a ranked list, label
  "Hybrid search across 92 production collections on Milvus"); connectors (Notion, Confluence,
  Google Drive, SharePoint, Azure into one knowledge base, label "Five enterprise sources, one knowledge base");
  resolution (answer card, "Source: SSO rollout runbook", elapsed "0.9 s", final label
  "Built test-first at Ramco Systems · rTask.ai").
- Must read MUTED: every beat carries a short on-screen label. No voice. No music (silent file).
- Last frame's background matches the first frame's so the file loops; the last frame doubles as the poster.
- Deliverables: 4K 3840x2160 30 fps H.264 High yuv420p CRF 18 faststart; 1080p transcode; 4K poster JPG.

## Notes

- Visual system is the site's Field Notes tokens exactly: paper #F6F1E8, paper-2 #EFE8DC, ink #16140F,
  ink-2 #5B564B, rule #D9D1C2, vermilion #B8391F; Fraunces / Inter Tight / JetBrains Mono from the
  project's node_modules/@fontsource-variable. Hairlines, 2 px corners, no shadows, no gradients, no stock.
- Reuse geometry and labels of src/components/guide/{Retrieval,Routing,Connectors}Explainer.tsx.
- Facts: only the numbers above. No other claims.
- Write only inside video-output/. No git. Do not touch port 3111.
