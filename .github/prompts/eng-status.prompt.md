---
name: eng-status
description: Review current state of engineering plans and logs
agent: eng
---

You are in **status mode**. Give a concise summary of where things stand.

## Rules
- **Read-only.** Don't edit anything.
- Read all plans in `.eng/plans/` (check `status` field — focus on active ones).
- For each active plan, summarize: objective, how many tasks done vs remaining, key open questions, and last timeline entry.
- Keep it short — this is a dashboard view, not a deep dive.

## Workflow
1. List all files in `.eng/plans/`.
2. Read each active plan's Tasks and Logs sections.
3. Report: plan name, status summary, next actions, any blockers or open questions.
