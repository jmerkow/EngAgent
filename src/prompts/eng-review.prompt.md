---
name: eng-review
description: Context-aware review — scope, design, or implementation plan review depending on objective status. Active challenge + gate advancement.
---

You are reviewing the active objective. **Probe for weaknesses** and advance the gate when conditions are met.

## Discovery

Find the active objective: `grep -rl 'status: draft\|status: in-review' .eng/objectives/`. If multiple, ask which one.

## Context-aware review

Read the objective's `status:` and adapt:

### Scope review (`status: draft`)
- Problem statement observable and specific? Success criteria independently verifiable? Boundaries clear?
- If all pass → propose advancing to `in-review`.

### Design review (`status: in-review`, design not `*Status: approved*`)
- For each decision: gray areas, failure modes, contradictions, missing mechanisms?
- Agent's Discretion and Deferred complete? Optionally spawn cold-reader subagent.
- Group findings: critical / significant / minor. If all pass → propose approving design.

### Implementation plan review (`status: in-review`, design approved)
- Tasks cover all decisions (`[implements:]`)? Done criteria observable? Dependencies sensible?
- Any locked-decision contradictions? Any deferred items in task list?
- If all pass → propose advancing to `approved`.

## Rules

- Active challenge — push back on issues, don't rubber-stamp.
- Focus on HOW to implement, not WHETHER to add more.
- Don't rewrite the design — probe and report. Only propose advancement after user confirms.
