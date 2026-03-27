# Gate Review

Review the active objective, probe for weaknesses, and advance the gate when conditions are met.

## Discovery

Find the active objective: `grep -rl 'status: draft\|status: in-review' .eng/objectives/`. If multiple, ask which one.

## Context-aware review

Read the objective's `status:` and adapt:

### Scope review (`status: draft`)
- Problem statement observable and specific?
- Success criteria independently verifiable?
- Boundaries clear?
- If all pass, propose advancing to `in-review`.

### Design review (`status: in-review`, design not `*Status: approved*`)
- For each decision: gray areas, failure modes, contradictions, missing mechanisms?
- Are `Agent's Discretion` and `Deferred` complete?
- Optionally use a cold-reader subagent if the design feels dense.
- Group findings as critical, significant, or minor.
- If all pass, propose approving the design.

### Implementation plan review (`status: in-review`, design approved)
- Do tasks cover all decisions via `[implements:]`?
- Are done criteria observable?
- Are dependencies sensible?
- Any contradictions with locked decisions or deferred items?
- If all pass, propose advancing to `approved`.

## Rules

- Active challenge: push back on issues, don't rubber-stamp.
- Focus on HOW to implement, not WHETHER to add more.
- Don't rewrite the design while reviewing it. Probe and report.
- Only propose advancement after the user confirms.
