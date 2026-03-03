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
<!-- 1-3 sentences: observable end state, not backstory -->

### Success criteria
<!-- 3-5 bullets: each independently verifiable, no task descriptions -->

## Design
<!-- one line if simple, link if complex -->
*Status: draft*

For complex work: `See [design-<slug>.md](../designs/design-<slug>.md)`

## Tasks
<!-- checkboxes only — no bare bullets for actionable items -->
- [ ] **Task name**
  - [ ] Subtask
- [ ] **Another task** · after: Task name

## Progress
<!-- one subsection per task, skip empty fields -->

### Task Name
**Status:** One-line summary

**Timeline:**
- YYYY-MM-DD: What — why — outcome

## Mistakes
<!-- one-liners: YYYY-MM-DD: What — why — severity. Link detail file if needed. -->
<!-- Don't duplicate content from mistake logs — summary + link. -->

## Parking Lot
<!-- 1 bullet per item, no elaboration -->
```
