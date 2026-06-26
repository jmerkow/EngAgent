---
name: docs
description: >
  Engineering documentation registry — file types, schemas, templates, and conventions for .eng/ directories.
  Document types: whiteboard, objective, implementation log, design, finding, mistake, scratch, workstream.
  For workflow phases and gates, see workflow. For objective conventions, see references/objective-conventions.md.
  For design conventions, see references/design-conventions.md.
---

# Engineering Documentation

## Init

Create `.eng/`, add to parent `.gitignore`, and `git init` inside it. `.eng/` is its own git repo — commit early and often. Subdirectories are created as needed. Use terminal commands or `includeIgnoredFiles: true` when searching `.eng/`.

## Document Types

| Type | When to use | Template | Conventions |
|------|-------------|----------|-------------|
| Whiteboard | Exploratory work, nothing active | [templates/whiteboard.md](templates/whiteboard.md) | — |
| Objective | Track a piece of work | [templates/objective.md](templates/objective.md) | [references/objective-conventions.md](references/objective-conventions.md) |
| Implementation log | Track execution of a coding task or objective | [templates/implementation-log.md](templates/implementation-log.md) | — |
| Design | Lock decisions for complex work | [templates/design.md](templates/design.md) | [references/design-conventions.md](references/design-conventions.md) |
| Finding | Investigation results | [templates/findings.md](templates/findings.md) | — |
| Mistake | Detailed mistake write-up | [templates/mistake.md](templates/mistake.md) | [references/mistake-capture.md](references/mistake-capture.md) |
| Scratch | Working notes, throwaway | (no template) | — |
| Workstream | Co-located artifacts for one effort | [templates/workstream.md](templates/workstream.md) | See **/engflow:workstream** skill |

## Validation

For document validation and cold-read checks, use the **/engflow:check** skill.
For maintenance workflows (migrate, backfill, reconstruct), see [references/maintenance-workflows.md](references/maintenance-workflows.md).

## Universal Rules

- YAML frontmatter on every `.eng/` document.
- Edit in place — don't create versions.
- Single source of truth — one-line summary + link, never copy.
- Cold read — every document understandable by a fresh agent with no history.
- `parent` and `references` for linking. No `children` or `related` fields.
- **Don't lose work.** Commit before deleting. `git rm` is safe (history preserves it). Never `rm` uncommitted files commit first.
