````markdown
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

**Problem:** What we're solving and why existing approach falls short.

**Approach:** High-level summary of the solution direction.

## Decisions

*LOCKED — implement exactly. Violating any requires user approval.*

**D1. Decision name**

Description of the decision.

- *If violated:* What goes wrong.
- *Test:* How to verify this was implemented correctly.

## Agent's Discretion

*Agent chooses approach. Don't ask about these.*

- Area where agent picks the implementation detail

## Deferred

*Not now — revisit later. Each item captured so it doesn't get lost.*

- Feature or idea — why it's deferred

## Reference

*Optional. Supporting detail for implementers: tables, templates, examples.*
```

````
