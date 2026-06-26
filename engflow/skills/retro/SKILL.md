---
name: retro
description: Retrospective system for agent sessions — structured collection of mistakes, tooling gaps, and positives, plus cross-session pattern analysis. Use when running a retro, reviewing session quality, collecting observations about agent behavior, analyzing patterns across multiple retros, or producing a retro findings doc.
---

# Retrospective System

Part of the `.eng/` documentation system. Retro files live in `.eng/retros/` alongside objectives and findings. For file format conventions, frontmatter schemas, and naming patterns, see the **/engflow:docs** skill; it is the authority on `.eng/` structure.

Two workflows: **collection** (per-session) and **analysis** (cross-session). Never mix them in the same document.

## Collection Workflow

Collect structured observations from a single chat session. Output: one retro file in `.eng/retros/`.

1. Review the full conversation history.
2. Skim 2–3 recent retros in `.eng/retros/` if they exist — note recurring patterns but don't analyze.
3. Collect observations honestly. Empty sections are fine if the session was clean.
4. Write the retro file using the template in [references/retro-template.md](references/retro-template.md).
5. Print a 2–3 line summary: session type, observation count, severity max.

### Severity Rubric

| Level | Criteria |
|---|---|
| **minor** | User corrected with a short remark. No wasted work beyond the immediate undo. |
| **moderate** | Required user to explain what was wrong. Some wasted effort or a digression. |
| **major** | User had to intervene multiple times, cancel actions, or lost meaningful work/visibility. |

If unsure, pick the lower severity. Inflation makes retros useless for trend detection.

### Category Taxonomy

See [references/categories.md](references/categories.md) for definitions and real examples of each mistake and gap category.

### Rules

- Be concrete — quote or paraphrase actual moments. Vague observations have no aggregation value.
- Don't editorialize or suggest fixes. State what happened and why it matters, then move on.
- Don't manufacture findings for clean sessions.
- One retro per session. Don't append to existing retro files.

## Analysis Workflow

Analyze patterns across multiple retro files. Output: a findings doc in `.eng/findings/`.

1. Read all retro files in scope (usually a date range or project).
2. List every individual mistake and gap with session attribution.
3. Group into patterns by root cause, not surface symptom.
4. Compare against prior findings docs — note what's improving, stable, or worsening.
5. Categorize by actionability: hook-solvable, instruction update, new convention, new skill, project-specific, behavioral-only.
6. Write to `.eng/findings/finding-retro-patterns-YYYY-MM-DD.md`.

### Analysis Rules

- Every claim traces to specific retro entries. No unsourced generalizations.
- Patterns need 3+ instances across 2+ sessions to be worth naming.
- Tag frequency and severity distribution are required — they're the trend signal.
- Include "What's Working Well" — reinforcement matters as much as correction.
