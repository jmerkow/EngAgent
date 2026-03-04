---
name: eng-status
description: Review current state of engineering objectives and progress
agent: eng-plan
---

Examine the current state of .eng,
Do not trust context from chat history — read everything fresh from disk. 
Give a concise summary of where things stand.

## Rules
- **Read-only.** Don't edit anything.
- Read all objectives in `.eng/objectives/` (check `status` field — focus on active ones).
- For each active objective, summarize: goal, how many tasks done vs remaining, key open questions, and last timeline entry.
- Keep it short — this is a dashboard view, not a deep dive.

## Workflow

1. List all files in `.eng/objectives/`.
2. **In parallel batch of 5 files**, delegate one `eng-research-sub` per objective. Each subagent must:
   1. **Document status.** Parse the objective per **eng-docs** template — status, goal, tasks (done/remaining), last timeline entry, blockers.
   2. **Codebase status.** Verify completed tasks' claimed outputs exist on disk.
   3. **Cross-check.** Flag done tasks with missing outputs, untracked files, or contradicted status.
3. Consolidate per objective: name, status, next action, blockers, cross-check discrepancies.
