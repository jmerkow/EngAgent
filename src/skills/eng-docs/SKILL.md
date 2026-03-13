---
name: eng-docs
description: Engineering documentation registry — file types, schemas, naming, and template pointers for .eng/ directories. For workflow phases and gates, see eng-workflow. For objective conventions (task format, zones, mutability), see references/objective-conventions.md. For design conventions, see references/design-conventions.md.
---

# Engineering Documentation System

## Directory Structure

```
<project-root>/
└── .eng/
    ├── objectives/     # central hub for each piece of work
    ├── designs/        # design docs for complex work
    ├── findings/       # investigation results, analysis
    ├── mistakes/       # detailed mistake logs (linked from objectives)
    ├── retros/         # session retrospectives (see eng-retro skill)
    ├── scratch/        # working notes, drafts — low-ceremony, temporary
    └── archive/        # completed/superseded docs
```

`.eng/` is gitignored. Use terminal commands or `includeIgnoredFiles: true` when searching.

## File Types

### Objectives

**Purpose:** Central tracking document for a piece of work — scope, design, tasks, timeline.

```yaml
---
created: YYYY-MM-DD
status: draft       # draft | in-review | approved | in-progress | needs-verify | completed | deferred | cancelled
project: <name>
parent: <filename>  # optional — parent objective
references: []      # optional — related docs
---
```

**Template:** [references/objective-template.md](references/objective-template.md)
**Conventions:** [references/objective-conventions.md](references/objective-conventions.md) — task format, stable IDs, zones/mutability, success criteria

### Design Docs

**Purpose:** Locked decisions for complex work — what to do, what breaks if violated, how to verify.

```yaml
---
created: YYYY-MM-DD
status: draft       # draft | in-review | approved | deferred | cancelled
parent: objective-<slug>.md
---
```

**Template:** [references/design-template.md](references/design-template.md)
**Conventions:** [references/design-conventions.md](references/design-conventions.md) — tiers, decision format, status lifecycle

### Findings

**Purpose:** Investigation results and analysis, linked from objectives.

```yaml
---
created: YYYY-MM-DD
project: <name>
parent: <objective-filename.md>
---
```

**Template:** [references/findings-template.md](references/findings-template.md)

### Mistake Logs

**Purpose:** Detailed write-ups for mistakes too big for a one-liner in `## Mistakes`.

```yaml
---
created: YYYY-MM-DD
parent: objective-<slug>.md
agent: <agent-name>
severity: minor | moderate | major
trigger: self-report | /eng-wtf | frustration
---
```

**Template:** [references/mistake-template.md](references/mistake-template.md)

## Naming Conventions

- **Objectives:** `objective-<slug>.md`
- **Designs:** `design-<slug>.md`
- **Findings:** `finding-<slug>.md`
- **Mistake logs:** `mistake-<slug>-YYYY-MM-DD.md`
- **Retros:** see **eng-retro** skill
- **Archive:** move as-is, or with date suffix: `objective-old.2026-02-07.md`

## Terminology

"Plan", "objective", and "obj" are synonyms. File format is always `objective-<slug>.md`.

## Universal Rules

- Every `.eng/` document has YAML frontmatter.
- Objectives are living documents — edit in place, don't create versions.
- Only use `parent` and `references` for linking. No `children` or `related` fields.
- **Single source of truth.** One location is authoritative; others use a one-line summary + link.
- **Never delete `.eng/` files.** `.eng/` is gitignored — `rm` is permanent. Always `mv` to `.eng/archive/`.
- **Verify before destructive operations.** Verify inputs before running.
- **Cold read.** Every document should be understandable by a fresh agent with no conversation history.

## Related Skills

- **eng-workflow** — phases, gates, status lifecycle
- **eng-retro** — retro format, categories, analysis
- **eng-check** — document validation, cold-read checks
