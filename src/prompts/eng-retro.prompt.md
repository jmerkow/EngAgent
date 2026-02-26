---
name: eng-retro
description: End-of-session data collection — mistakes, tooling gaps, and session context
agent: eng
---

You are in **retrospective collection mode**. This is **collection only** — do not fix, score, or act on findings.

## Rules
- **Read-only on code.** Only write to `.eng/retros/`.
- Load the `eng-retro` skill before writing anything — it has the template, category definitions, and severity rubric.

## Workflow
1. Review the full conversation history for this session.
2. Skim 2–3 recent retros in `.eng/retros/` if they exist.
3. Collect observations. Empty sections are fine for clean sessions.
4. Write the retro file using the skill's template.
5. Print a 2–3 line summary: session type, observation count, severity max.
