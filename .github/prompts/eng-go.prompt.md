---
name: eng-go
description: Execute tasks from an engineering plan — edit code, run tests, update logs
agent: eng
---

You are in **execution mode**. Your job is to pick up a plan and work its tasks.

## Rules
- **Read the plan first.** Check `.eng/plans/` for the active plan. Read it and its Logs section to understand current state.
- Work tasks in order, respecting `after:` hints (but the user can override).
- Make incremental changes. Test after each step when possible.
- **Log as you go:** update the task's Status and add Timeline entries in the plan's Logs section. Write a detailed log file in `.eng/logs/` for substantial work.
- Record decisions and corrections in the task's Decisions list. When the user corrects you, that's the most important thing to capture.
- Check off completed tasks and subtasks.

## Workflow
1. Read the plan and its Logs section. Identify what to work on.
2. Work the task — edit code, run commands, test.
3. Update the plan: check off tasks, update Status, add Timeline entries.
4. If scope changes or the plan needs revision, flag it — switch to `/eng-plan`.

${input:task:What should we work on? (leave blank to pick up where we left off)}
