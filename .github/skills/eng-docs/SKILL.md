---
name: eng-docs
description: Structured engineering documentation system using .eng/ directories. Covers plan templates, log formats, metadata schemas, naming conventions, and task dependency syntax. Use when creating, reading, or updating files in .eng/ directories.
---

# Engineering Documentation System

## Directory Structure

Each project has a `.eng/` directory at its root:

```
<project-root>/
└── .eng/
    ├── plans/          # plans (the central hub for each effort)
    ├── logs/           # detailed session logs (linked from plans)
    ├── findings/       # investigation results, analysis docs
    └── archive/        # completed/superseded docs
```

Create this structure when it doesn't exist.

## Metadata Schemas

Every document in `.eng/` has YAML frontmatter.

### Plans

```yaml
---
created: YYYY-MM-DD
status: active              # active | completed | paused
project: <project-name>
parent: <plan-filename.md>  # optional — parent plan if this is a subplan
references: []              # optional — related plans or docs
---
```

### Log files

```yaml
---
created: YYYY-MM-DD
project: <project-name>
parent: <plan-filename.md>  # which plan this log serves
---
```

Log files are detailed session records. They capture what was read, tried, run, and corrected. They're linked from the plan's timeline, and only opened when deep context is needed.

### Findings

```yaml
---
created: YYYY-MM-DD
project: <project-name>
parent: <plan-filename.md>  # which plan produced this finding
---
```

Findings capture investigation results, analysis, or research. They live in `findings/` and are linked from the plan's Investigations field.

## Plan Template

```markdown
---
created: YYYY-MM-DD
status: active
project: <project-name>
---

# Title

## Objective
What we're trying to accomplish. Clear success criteria.

## Design
(Optional) Architectural decisions, key constraints, approach rationale.

## Tasks
- [ ] **Task name**
  - [ ] Subtask
- [ ] **Another task** · after: Task name
  - [ ] Subtask

## Logs

### Task Name
**Status:** One-line summary of where this stands
**Description:** What this task is and why (context beyond the title)

**Open Questions:**
- Unresolved things

**Decisions:**
- Resolved choices and why

**Investigations:**
- [Finding title](../findings/finding-slug.md)

**Timeline:**
- YYYY-MM-DD: What happened [details](../logs/YYYY-MM-DD-slug.md)

## Parking Lot
- Out-of-scope items discovered during work
```

### Plan conventions

- **Tasks** use nested markdown checkboxes.
- **Top-level tasks** are bold. Subtasks are plain.
- **Dependencies** use `· after: Task name` syntax on the task line. These are hints — the user can override ordering.
- **Logs section** has one subsection per task. All fields are optional except Status. Skip empty fields — no blank placeholders.
- **Parking Lot** goes at the end. Simple bullet list.
- The plan is the **central hub** — it links forward to logs and findings; those link back via `parent`.

### Per-task log fields

| Field | Required | Purpose |
|---|---|---|
| **Status** | Yes | One-line summary of where this stands |
| **Description** | No | Context beyond the task title |
| **Open Questions** | No | Unresolved things for this task |
| **Decisions** | No | Resolved choices and why |
| **Investigations** | No | Links to findings docs |
| **Timeline** | No | Chronological entries with links to detailed logs |

## Log File Template

Log files are the detail layer. Keep them as raw session records — what happened, what was tried, what was corrected. The plan's Logs section provides the summary; log files provide the depth.

```markdown
# YYYY-MM-DD - Session Title

## What happened
Concrete actions taken, in order.

## Decisions & corrections
What changed direction and why. Especially important: user corrections.

## Where things stand
State at end of session.
```

## Naming Conventions

- **Plans:** `plan-<slug>.md` (e.g., `plan-auth-refactor.md`)
- **Logs:** `YYYY-MM-DD-<slug>.md` (e.g., `2026-02-07-skill-extraction.md`)
- **Findings:** `finding-<slug>.md` (e.g., `finding-chat-template-analysis.md`)
- **Archive:** move files to `archive/` as-is, or with date suffix if needed: `plan-old.2026-02-07.md`

## Updating Plans

When completing work:

1. Check off tasks: `- [ ]` → `- [x]`
2. Update the task's Status in the Logs section
3. Add a Timeline entry with a link to the detailed log (if one was written)
4. Bubble up key decisions into the task's Decisions list

When something changes:

1. Update the task's Open Questions or Decisions as appropriate
2. If scope changes significantly, update the Objective or Tasks section directly

## Rules

- `after:` dependencies are **hints**, not hard blocks. The user can override ordering.
- Every document in `.eng/` must have YAML frontmatter.
- Plans are living documents — edit in place, don't create new versions.
- Only use `parent` and `references` for linking. No `children` or `related` fields — the plan is the hub.
- Keep findings focused — one topic per finding.
- When the user corrects you, record it in the relevant task's Decisions. This is how alignment improves.
