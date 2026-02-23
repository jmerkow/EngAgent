---
name: eng-docs
description: Structured engineering documentation system using .eng/ directories. Covers objective templates, findings format, metadata schemas, naming conventions, section mutability rules, and task dependency syntax. Use when creating, reading, or updating any file in .eng/ directories, including objectives, findings, retros, and archive. Also use when asked to scaffold a new .eng/ structure, check objective format compliance, archive completed objectives, or write handoff sections.
---

# Engineering Documentation System

## Directory Structure

Each project has a `.eng/` directory at its root:

```
<project-root>/
└── .eng/
    ├── objectives/     # objectives (the central hub for each effort)
    ├── findings/       # investigation results, analysis docs
    ├── retros/         # session retrospectives (see eng-retro skill)
    └── archive/        # completed/superseded docs
```

`.eng/` is gitignored. Use terminal commands (`find`, `cat`, `ls`) or set `includeIgnoredFiles: true` when searching for `.eng/` content — default search tools will silently skip it otherwise.

Create this structure when it doesn't exist. Retro-specific conventions (categories, severity rubric, analysis workflow) are in the **eng-retro** skill.

## Metadata Schemas

Every document in `.eng/` has YAML frontmatter.

### Objectives

```yaml
---
created: YYYY-MM-DD
status: draft               # draft | active | completed | paused
project: <project-name>
parent: <objective-filename.md>  # optional — parent objective if this is a sub-objective
references: []              # optional — related objectives or docs
---
```

Lifecycle: an objective starts as **draft** (problem defined, approach not yet confirmed). It becomes **active** when the user confirms the approach. It ends as **completed** or **paused**.

### Findings

```yaml
---
created: YYYY-MM-DD
project: <project-name>
parent: <objective-filename.md>  # which objective produced this finding
---
```

Findings capture investigation results, analysis, or research. They live in `findings/` and are linked from the objective's Investigations field.

## Templates

- **Objective:** [references/objective-template.md](references/objective-template.md) — copy when creating a new objective
- **Findings:** [references/findings-template.md](references/findings-template.md) — copy when writing up investigation results

## Objective Conventions

### Task format

- **Tasks** use nested markdown checkboxes.
- **Top-level tasks** are bold. Subtasks are plain.
- **Dependencies** use `· after: Task name` syntax on the task line. These are hints — the user can override ordering.
- **Checkbox auto-completion:** check the box in the same edit that produces the deliverable. Don't batch checkbox updates after the fact.

### Task enrichment

Simple tasks stay as one-line checkboxes. For complex tasks, add context directly under the checkbox:

```markdown
- [ ] **Migrate terminology: plan → objective**
  - Files: eng-docs SKILL.md, all objective-*.md, eng.agent.md, eng-plan.agent.md, prompts
  - Verify: `grep -r "plan-" .eng/objectives/` returns 0 results; all `parent:` frontmatter resolves
  - Done: No references to "plan" as our document type remain outside retro files
```

The enriched fields (Files, Verify, Done) are optional — use them when the executor needs more context than the title provides. Don't mandate structure for simple tasks.

### Success criteria

Success criteria are **observable truths**, not task descriptions.

- **Bad:** "Rename all files."
- **Good:** "All objective files use `objective-*.md` naming and all `parent:` references resolve."

When the objective involves connecting components, include **wiring criteria**:

> "The install script sets up hooks AND the hooks fire during agent sessions."

### Section mutability

Objective sections have implicit mutation policies:

| Section | Policy | Notes |
|---------|--------|-------|
| Objective / Success criteria | OVERWRITE until `status: active`, then IMMUTABLE | Scope locked once work begins |
| Design | OVERWRITE until `status: active`, then APPEND-only | Add notes, don't rewrite decisions |
| Tasks | Checkboxes toggle; text IMMUTABLE once in-progress | Don't reword tasks mid-flight |
| Progress → Status | OVERWRITE | Always reflects latest state |
| Progress → Decisions | APPEND-only | Historical record, never edited |
| Progress → Timeline | APPEND-only | Chronological, never reordered |
| Progress → Open Questions | Items MOVE to Decisions when resolved | Remove resolved items |
| Parking Lot | APPEND-only | User can promote or remove items |

### Discretion boundaries

When recording decisions, also note what was explicitly left to agent discretion. This prevents the agent from asking about things already marked as "your call."

Example: `- Timeline entry wording: agent's discretion — keep it descriptive.`

### Growth and specificity

- **Objectives grow over time.** Early objectives describe problems and success criteria. Don't write implementation subtasks or design choices until the user confirms the approach.
- **Agent observations go to Parking Lot.** Tasks must trace to user-stated problems or requests. If the agent notices something (a code smell, a potential improvement), it goes in Parking Lot — not Tasks — unless the user explicitly promotes it.
- The objective is the **central hub** — it links forward to findings and retros; those link back via `parent`.
- **Parking Lot** goes at the end. Simple bullet list.

### When to create a new objective

Create a **new objective** when:
- The work has different success criteria than any existing objective
- The scope is clearly independent (different project area, different deliverable)

**Extend an existing objective** when:
- New work furthers the same success criteria
- The discovery happened during work on that objective and is directly related

When uncertain, extend. A Parking Lot entry in the existing objective is cheaper than a premature new objective.

### Handoff section

Objectives should include a `## Handoff` section when work may continue in a different session or with a different agent. Write it for a cold-start reader: current state, what's done, what's next, key decisions already made, and any gotchas.

## Per-task Progress Fields

The objective's `## Progress` section has one subsection per task. All fields are optional except Status. Skip empty fields — no blank placeholders.

| Field | Required | Policy | Purpose |
|---|---|---|---|
| **Status** | Yes | OVERWRITE | One-line summary of where this stands |
| **Description** | No | OVERWRITE | Context beyond the task title |
| **Open Questions** | No | MOVE to Decisions | Unresolved things for this task |
| **Decisions** | No | APPEND-only | Resolved choices and why |
| **Investigations** | No | APPEND-only | Links to findings docs |
| **Timeline** | No | APPEND-only | Chronological: what + why + outcome |

### Timeline entries

Timeline entries should be self-contained — a reader should understand what happened without following links.

```
- YYYY-MM-DD: What happened — why — outcome
```

Good: `2026-02-21: Cross-reference analysis complete. Subagent analyzed 7 patterns against ecosystem findings. 4 new subtasks added, 3 existing refined.`

Bad: `2026-02-21: Did analysis [link]`

Include key data inline. External links are supplementary, not required.

## Discussion and Assessment Sessions

Not all sessions produce code or checked-off tasks. Some sessions are exploratory: discussing approach, assessing options, making decisions. These are legitimate work.

For discussion/assessment sessions:
- Record decisions in the relevant objective's Decisions field
- If the discussion produces a structured analysis, write it as a findings doc
- Update the objective's Timeline with what was discussed and decided
- Don't create tasks just to check them off — a session that produces one good decision is valuable

## Naming Conventions

- **Objectives:** `objective-<slug>.md` (e.g., `objective-auth-refactor.md`)
- **Findings:** `finding-<slug>.md` (e.g., `finding-chat-template-analysis.md`)
- **Retros:** see **eng-retro** skill for naming convention
- **Archive:** move files to `archive/` as-is, or with date suffix if needed: `objective-old.2026-02-07.md`

## Updating Objectives

When completing work (or use `/eng-done` to do this interactively):

1. Check off the task checkbox (`- [ ]` → `- [x]`) in the same edit as the deliverable
2. Update the task's Status in the Progress section
3. Add a Timeline entry describing what happened, why, and the outcome
4. Bubble up key decisions into the task's Decisions list
5. Commit — don't let completed work sit uncommitted. Offer to commit after finishing a task or before switching context.

When something changes:

1. Update the task's Open Questions or Decisions as appropriate
2. If scope changes significantly, update the Objective or Tasks section directly (only while `status: draft`)

## Rules

- `after:` dependencies are **hints**, not hard blocks. The user can override ordering.
- Every document in `.eng/` must have YAML frontmatter.
- Objectives are living documents — edit in place, don't create new versions.
- Only use `parent` and `references` for linking. No `children` or `related` fields — the objective is the hub.
- Keep findings focused — one topic per finding.
- When the user corrects you, record it in the relevant task's Decisions. This is how alignment improves.
- **Single source of truth.** When a fact appears in multiple docs (objective, findings, retro), one location is authoritative and others reference it. Corrections happen in one place. If a finding establishes a conclusion, the objective references the finding rather than restating the conclusion.
- **Retro scope.** A retro covers one session. Cross-session pattern analysis is a separate workflow that produces a findings doc (e.g., `finding-retro-patterns-YYYY-MM-DD.md`). Don't mix collection and analysis in the same document.
