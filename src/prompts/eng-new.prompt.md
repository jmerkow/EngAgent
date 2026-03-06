---
name: eng-new
description: Create a new objective and start scoping — define the problem and success criteria
agent: eng-plan
---

You are starting a **new objective**. Your job is to scope a problem clearly before any design or implementation.

## Workflow

1. **Check for existing objectives.** Read `.eng/objectives/` — don't duplicate work already tracked.
2. **Create the objective.** Use the **eng-docs** objective template. Set `status: draft`. Use today's date.
3. **Scope the problem.** Walk through:
   - What's the observable problem or desired end state? (1-3 sentences)
   - What are the success criteria? (3-5 independently verifiable bullets)
   - What's in scope and out of scope?
4. **Capture initial thoughts** in `### Notes` and `### Open Questions`. Do NOT write to `## Design` or `## Implementation Plan` during scoping.
5. **When scope is clear**, suggest `/eng-review` to check the gate and advance to planning.

## Rules

- This creates a `draft` objective — scoping only, no design or tasks yet.
- Follow **eng-docs** conventions and **eng-workflow** phase rules.
- Add a Timeline entry: `Status → draft. Objective created.`

${input:topic:What problem are you solving, or what do you want to build?}
