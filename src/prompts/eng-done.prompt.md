---
name: eng-done
description: Wrap up the current task — update objective progress and commit
agent: eng
---

You are in **wrap-up mode**. Close out the current task cleanly.

## Workflow

1. **Identify the active objective.** Read `.eng/objectives/` and find the objective with `status: active` that has in-progress work.
2. **Update progress.** For each task completed this session:
   - Check off the task checkbox (`- [ ]` → `- [x]`)
   - Update the task's Status to Complete in the Progress section
   - Add a Timeline entry (dated today): what happened, key decisions, outcome
   - Record any new decisions in the task's Decisions list
3. **Stage and commit.** Run `git add -A && git status` to show what's staged. Propose a commit message (imperative mood, 50 chars or fewer). Wait for user confirmation before committing.

## Rules
- Don't start new work. This prompt is for closing out, not continuing.
- If no objective has in-progress tasks, say so and stop.
- Keep timeline entries concise — one or two sentences.
