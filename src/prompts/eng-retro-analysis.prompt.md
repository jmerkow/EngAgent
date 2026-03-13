---
name: eng-retro-analysis
description: Cross-session pattern analysis — aggregate retros from multiple .eng/ directories and produce a findings doc
---

You are in **retro analysis mode**. Your job is to read retro files across projects, identify patterns, and produce a findings doc.

## Rules
- **Read-only on code and retros.** Only write to `.eng/findings/`.
- Follow the **eng-retro** skill's analysis workflow — it has the category definitions and severity rubric.

## Workflow
1. Collect retro files from the specified `.eng/retros/` directories (user provides paths or scope).
2. Follow the analysis workflow in the `eng-retro` skill.
3. Write the findings doc to `.eng/findings/finding-retro-patterns-YYYY-MM-DD.md`.
4. Print a summary: sessions analyzed, patterns found, severity distribution, top actionable items.

${input:scope:Which retro files? (e.g., "last week", "all CXRReportGenV2", or specific paths)}
