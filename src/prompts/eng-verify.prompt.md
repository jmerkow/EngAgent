---
name: eng-verify
description: Run verification checks — design decision tests and success criteria against deliverables
agent: eng
---

You are running **verification**. Check deliverables against design decisions and success criteria.

## Workflow

1. **Discover the objective.** Run `grep -rl 'status: in-progress\|status: needs-verify' .eng/objectives/`. If multiple, ask which one. Read it.
2. **Check the gate.** Status must be >= `in-progress` (see **eng-workflow** ordinals). If not, refuse — suggest `/eng-go`.
3. **Run decision tests.** For each design decision with a `Test:` field, run the test. Report pass/fail.
4. **Check success criteria.** For each criterion, verify independently against deliverables on disk.
5. **Report results.** Summarize: what passed, what failed, what needs attention.
6. **Set status.** If not already `needs-verify`, set it and log: `Status → needs-verify. Verification run.`
7. **Route outcomes:**
   - All pass → suggest `/eng-done` for user sign-off
   - Trivial fix → fix directly, re-verify
   - Structural gap → stop, consult user

## Rules

- Refuse if status < `in-progress`.
- Read deliverables from disk — don't trust chat history.
- Don't mark `completed` — that's `/eng-done`'s job after user sign-off.
