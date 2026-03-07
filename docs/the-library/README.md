# The Library

Curated knowledge base on AI agent frameworks, VS Code Copilot customization, and cross-cutting patterns.

## About This Library

This library was built using an AI research agent ([EngAgent](../../README.md)) that systematically investigated frameworks, documentation, and ecosystem repos. The research was a learning exercise — each investigation helped inform design decisions about EngAgent itself (how to structure agents, manage context, handle delegation, constrain behavior). The findings documents are structured notes with citations, comparisons, and extracted patterns. This library distills that research into self-contained, browseable docs so others can benefit from what we learned.

**How it was built:**
1. A research agent investigated each topic as part of building EngAgent — each finding directly informed a design decision
2. Findings were classified: extract, keep, or archive
3. Extractable content was curated into the docs you see here — rewritten for a general audience, stripped of internal project references, fact-checked against primary sources, and cross-linked

**Three audiences:** These docs are written to serve the author (personal reference), agents working in the repo (scannable, factual context with structured headers), and external readers (self-contained, no unexplained jargon).

## Where to Start

- **[Table of Contents](toc.md)** — browse all 13 docs by category
- **[Topic Index](topics.md)** — look up a specific concept, pattern, or term

## What's Covered

**Projects** — Six external projects studied in depth: GSD (fresh-context-per-task phased execution), Squad (persistent named specialists), Spec Kit (agent-agnostic specification), awesome-copilot (community marketplace), Anthropic's official skills, and the Claude cookbooks.

**VS Code Copilot** — The customization system in depth: the building blocks, how instructions and skills activate, the hooks lifecycle, and subagent delegation mechanics.

**Patterns** — Cross-cutting patterns that appear across multiple frameworks: delegation and orchestration, context persistence and memory, and behavioral rules and constraints.

## Adding a Doc

### Philosophy

Lead with insight, not reproduction. Cross-reference existing docs — don't duplicate.

**Where it goes:** `projects/` for external repos, `vscode/` for VS Code Copilot features (VS Code-specific only for now), `patterns/` for cross-cutting patterns across 2+ frameworks.

**Style:** Be concise. Separate patterns from implementation — pattern docs describe the general principle and cite frameworks; project docs go deep on one project's details. Don't reproduce reference material — summarize what matters, link out. Every doc should be self-contained for a reader who hasn't seen the rest.

**Required structure:** `# Title` → blockquote description + `**Key concepts:**` → `## Overview` (first) → topic sections → `## References` → `## See Also` (last). Project docs add a badge line and `Platforms:` between the title and blockquote.

**References:** Only link to things a reader can actually check — other the-library docs, web URLs, official documentation. No internal `.eng/` files, findings, or local-only paths.

### Checklist

- [ ] Correct directory, header format matches
- [ ] `## Overview` first, `## References` then `## See Also` last
- [ ] See Also links are bidirectional
- [ ] No broken internal links
- [ ] References are all reachable (library docs or web URLs, no `.eng/` paths)
- [ ] Entry added to [toc.md](toc.md) and terms added to [topics.md](topics.md)
