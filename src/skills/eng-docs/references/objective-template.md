# Objective Template

File location: `.eng/objectives/objective-<slug>.md`

```markdown
---
created: YYYY-MM-DD
status: draft               # draft | in-review | approved | completed | deferred | cancelled
project: <project-name>
---

# Title

## Objective
What we're trying to accomplish. Success criteria as observable truths — verifiable assertions about the end state, not task descriptions.

## Design
*Status: draft*

(Optional) Approach rationale, key constraints. For complex work with gray areas, use a full design doc instead: `See [design-<slug>.md](../designs/design-<slug>.md)`

## Tasks
- [ ] **Task name**
  - [ ] Subtask
- [ ] **Another task** · after: Task name
  - [ ] Subtask

## Progress

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
- YYYY-MM-DD: What happened — why — outcome

## Mistakes
*Captured as they happen. Feeds retro system.*
<!-- Log it: wrong assumption → wasted work, missed available context, convention loaded but not applied, unnecessary action, scope creep past gate, user correction (frustration-trigger). -->
<!-- Don't log: normal course corrections, unknowable things (missing docs), user-initiated pivots. -->
- YYYY-MM-DD: What — why — severity (minor/moderate/major)

## Parking Lot
- Out-of-scope items discovered during work
```
