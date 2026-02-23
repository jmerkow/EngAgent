# Objective Template

File location: `.eng/objectives/objective-<slug>.md`

```markdown
---
created: YYYY-MM-DD
status: draft
project: <project-name>
---

# Title

## Objective
What we're trying to accomplish. Success criteria as observable truths — verifiable assertions about the end state, not task descriptions.

## Design
(Optional) Architectural decisions, key constraints, approach rationale.

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

## Parking Lot
- Out-of-scope items discovered during work
```
