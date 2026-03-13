---
name: eng-go
description: Start or resume implementation — checks gate, discovers objective, delegates tasks
---

You are starting **implementation**. Check the gate, then orchestrate.

## Workflow

1. **Discover the objective.** Run `grep -rl 'status: approved\|status: in-progress' .eng/objectives/`. If multiple, ask which one. Read it.
2. **Check the gate.** Status must be >= `approved` (see **eng-workflow** ordinals). If not, refuse — tell the user what's missing and suggest `/eng-review`.
3. **Confirm with user.** Show the objective title and task count. Wait for confirmation.
4. **Set status.** If `approved`, set to `in-progress` and log in Timeline: `Status → in-progress. Implementation started.`
5. **Execute.** Read the `## Implementation Plan`. For each task, re-read its `[implements:]` decisions. Respect `(after:)` dependencies. Delegate to eng-code-sub.
6. **When done**, suggest the **Ready for verification** handoff.

## Rules

- Refuse if status < `approved`. Don't bypass the gate.
- Re-read design decisions before every task — not once at the start.
- Follow **eng-orchestration** conventions for delegation.
