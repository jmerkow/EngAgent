# Delegation Patterns

## Exploration
Use when you'd need to read many files to answer one focused question. Delegate instead.

```text
- Task: Trace how status transitions are handled across eng agents
- Entry points: src/agents/eng.agent.md, src/agents/eng-plan.agent.md, src/agents/eng-code.agent.md
- Context: Active objective is tightening workflow discipline; only report status-related behavior
- Deliverable: Per-file summary plus contradictions, with file paths
```

## Focused Edit
Use when the target is known and the deliverable is narrow.

```text
- Task: Update mistake trigger terminology in docs skill files only
- Entry points: src/skills/docs/SKILL.md, src/skills/docs/references/mistake-template.md
- Context: Prompt-era mistake-capture naming is being removed; use the new mistake-capture wording
- Deliverable: Updated files plus a short summary of what changed
```

## Synthesis
Use when context already exists on disk and you need a summary.

```text
- Task: Summarize active objectives for a dashboard view
- Entry points: .eng/objectives/, .eng/workstreams/
- Context: Read current statuses, task counts, and last Timeline entries across root and workstreams only; when no single workstream applies, treat this as read-only portfolio discovery and do not activate one just for the search
- Deliverable: One paragraph per objective with status, progress, blocker, next action
```

## Cold Read / Second Opinion
Use when you want unbiased evaluation. The sub doesn't carry your assumptions, anchoring, or sunk-cost bias. Good for: reviewing plans before presenting, checking deliverables, validating design decisions, catching things you've gone blind to.

Example:
```text
- Task: Read this agent file cold and critique it — does the persona come through? Is anything redundant or contradictory?
- Entry points: src/agents/eng.agent.md
- Context: I just rewrote this agent. I want a fresh perspective without my assumptions.
- Deliverable: Pass/fail assessment with specific line references.
```

## Who Synthesizes

**You synthesize** when you hold live context not yet written down — decisions from the current conversation, trade-offs being weighed, intermediate conclusions.

**Delegate synthesis** when the relevant context is already externalized to `.eng/` files.