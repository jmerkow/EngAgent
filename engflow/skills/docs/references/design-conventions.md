# Design Conventions

Conventions for writing and maintaining design docs. Referenced from docs SKILL.md.

## Two tiers

### Inline design

For simple work with no gray areas: use the `## Design` section in the objective with a status marker:

```markdown
## Design
*Status: draft*

Approach description.
```

### Full design doc

For complex work (gray areas, trade-offs, decisions that must survive across sessions): create `design-<slug>.md` in `.eng/designs/`.

Link from the objective: `See [design-<slug>.md](../designs/design-<slug>.md)`

See [design.md](../templates/design.md) for the full template.

## Decision format

Each decision is numbered (`D<N>`) and includes:
- **What to do** — the specific choice
- **If violated** — what goes wrong if the agent deviates
- **Test** — how to verify the decision was followed

## Sections

- **Decisions** — Locked once approved. Implement exactly.
- **Agent's Discretion** — Agent chooses approach without asking.
- **Deferred** — Captured ideas not in scope for this work.

## Status lifecycle

Design sections track `*Status: draft | in-review | approved*`. When approved, decisions become APPEND-only (notes OK, no rewrites).
