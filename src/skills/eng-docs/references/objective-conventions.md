# Objective Conventions

Conventions for writing and maintaining objectives. Referenced from eng-docs SKILL.md.

## Task format

- **Every task and subtask is a checkbox** (`- [ ]`). Never use bare bullets for actionable items — bare bullets are for enrichment metadata only (Files, Done).
- **Top-level tasks** are bold. Subtasks are plain.
- **Checkbox auto-completion:** check the box in the same edit that produces the deliverable.

### Stable IDs (T<N> / D<N>)

Tasks use `T<N>` IDs, design decisions use `D<N>` IDs. IDs are assigned once and never reassigned to different items. Splitting is fine (T3 → T3.1 + T3.2, or T3 + T3.1). New items use the next unused number. Don't cascade-renumber — gaps are fine.

### Dependencies and decision references

- **Dependencies:** `(after: T1, T2)` on the task line. These are hints — the user can override ordering.
- **Decision references:** `[implements: D1, D2]` links a task to the design decisions it carries out. The agent re-reads those decisions before starting the task.

### Task enrichment

Simple tasks stay as one-line checkboxes. For complex tasks, add context:

```markdown
- [ ] **T3: Migrate terminology** [implements: D2] (after: T1)
  - Files: eng-docs SKILL.md, all objective-*.md
  - Done: No references to old naming remain
```

## Section zones and mutability

Sections have two layered constraints:

- **Zone** controls *who decides*: **Open** (agent writes freely) or **Protected** (agent drafts, user confirms before gate).
- **Mutability** controls *how content evolves*: OVERWRITE, APPEND-only, or IMMUTABLE.

| Section | Zone | Mutability | Notes |
|---------|------|------------|-------|
| Objective / Success criteria | Protected | OVERWRITE until approved, then IMMUTABLE | Scope locked once approved |
| Notes / Open Questions | Open | Notes: OVERWRITE; Questions: MOVE to Decisions when resolved | Available during scoping |
| Design | Protected | OVERWRITE until approved, then APPEND-only | Add notes, don't rewrite decisions |
| Implementation Plan | Protected | Checkboxes toggle; text IMMUTABLE once in-progress | Don't reword tasks mid-flight |
| Timeline | Open | APPEND-only | Chronological, never reordered |
| Mistakes | Open | APPEND-only | Agent writes freely |
| Parking Lot | Open | APPEND-only | User can promote or remove items |

## Success criteria

Success criteria are **observable truths**, not task descriptions.

- **Bad:** "Rename all files."
- **Good:** "All objective files use `objective-*.md` naming and all `parent:` references resolve."

Include **wiring criteria** when connecting components: "The script sets up hooks AND the hooks fire during sessions."

## Growth and specificity

- **Objectives grow over time.** Early objectives describe problems and success criteria. Don't write implementation subtasks until the user confirms the approach.
- **Agent observations go to Parking Lot.** Tasks must trace to user-stated problems. If the agent notices something, it goes in Parking Lot — not the Implementation Plan.
- The objective is the **central hub** — it links forward to findings and retros; those link back via `parent`.

## Discretion boundaries

When recording decisions, note what's left to agent discretion. This prevents the agent from asking about things already marked as "your call."

## Handoff section

Include `## Handoff` when work may continue in a different session. Write for a cold-start reader: current state, what's done, what's next, key decisions, gotchas.
