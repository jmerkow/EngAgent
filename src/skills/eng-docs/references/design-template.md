# Design Doc Template

File location: `.eng/designs/design-<slug>.md`

```markdown
---
created: YYYY-MM-DD
status: draft               # draft | in-review | approved | deferred | cancelled
parent: objective-<slug>.md
---

# Design: Title

## Overview
<!-- 1-3 sentences of concise description -->

**Problem:** What we're solving.

**Approach:** Solution direction.

## Decisions
<!-- one block per decision, no prose between them -->
*LOCKED — implement exactly. Violating any requires user approval.*

**D1. Decision name.** What to do.
- *If violated:* What goes wrong.
- *Test:* How to verify.

## Agent's Discretion
<!-- 3-5 bullets max -->
- Area where agent picks the implementation detail

## Deferred
<!-- 1 bullet per item: what — why deferred -->
- Feature or idea — why it's deferred

## Reference
<!-- optional: tables, examples, supporting detail for implementers -->
<!-- deliberation and exploration belong in .eng/scratch/, not here -->
```

## Usage

The design section's `*Status:*` marker tracks progress through the planning sub-phase:

- `*Status: draft*` — decisions being explored
- `*Status: in-review*` — ready for review and challenge
- `*Status: approved*` — decisions locked; implementation can reference them

For inline designs (simple work, no gray areas), use the `## Design` section directly in the objective with the same `*Status:*` marker pattern.
