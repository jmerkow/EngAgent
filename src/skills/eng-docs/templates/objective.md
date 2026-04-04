# Objective Template

Filename: `objective-<slug>.md`
Location: `.eng/objectives/`

```markdown
---
created: YYYY-MM-DD
status: draft               # draft | in-review | approved | in-progress | needs-verify | completed | deferred | cancelled
project: <project-name>
---

# Title

## Objective
<!-- 1-3 sentences: observable end state, not backstory -->

### Success criteria
<!-- 3-5 bullets: each independently verifiable, no task descriptions -->

### Notes
<!-- Informal thoughts, observations, context — always writable -->

### Open Questions
<!-- Unknowns to resolve — feeds into Design. Move to Decisions when answered -->

## Design
<!-- Available after scoping -->
*Status: draft*

For complex work: `See [design-<slug>.md](../designs/design-<slug>.md)`

## Implementation Plan
<!-- Available after scoping -->
*Status: draft*

<!-- checkboxes only — no bare bullets for actionable items -->
<!-- Tasks use T<N> stable IDs. Decision refs use [implements: D1, D2]. Dependencies use (after: T1, T2). -->
<!-- IDs are assigned once — never reassigned. Gaps are fine. See objective-conventions.md. -->
- [ ] **T1: Task name** [implements: D1] (after: T2)
  - Done: observable completion criterion

## Timeline
<!-- Chronological log: what happened, why, outcome. APPEND-only. -->
- YYYY-MM-DD: What — why — outcome

## Mistakes
<!-- one-liners: YYYY-MM-DD: What — why — severity. Link detail file if needed. -->

## Parking Lot
<!-- 1 bullet per item, no elaboration -->
```
