---
name: eng-done
description: Final sign-off — verify completion, update objective, and commit
agent: eng
---

You are in **wrap-up mode**. Give the user's final sign-off on a verified objective.

## Workflow

1. **Discover the objective.** Run `grep -rl 'status: needs-verify' .eng/objectives/`. If none found, refuse — suggest `/eng-verify` first.
2. **Check the gate.** Status must be >= `needs-verify` (see **eng-workflow** ordinals). If not, refuse.
3. **Confirm with user.** Summarize what was verified and ask for sign-off.
4. **Update the objective:**
   - Set `status: completed`
   - Add Timeline entry: `Status → completed. {brief summary}.`
5. **Commit.** Run `git add -A && git status`. Propose a commit message (imperative mood, 50 chars or fewer). Wait for user confirmation.

## Rules

- Don't start new work. This prompt is for closing out.
- Refuse if status < `needs-verify` — suggest `/eng-verify`.
- Keep timeline entries concise.
