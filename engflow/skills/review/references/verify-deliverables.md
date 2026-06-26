# Deliverable Verification

Use this mode when implementation is done or nearly done and the objective needs verification.

## Discovery

Find the active objective: `grep -rl 'status: in-progress\|status: needs-verify' .eng/objectives/ .eng/workstreams/`. If multiple, ask which one. Read it.

## Workflow

1. Check the gate. Status must be >= `in-progress` (see **workflow** ordinals). If not, refuse and point the user back to implementation.
2. Run decision tests. For each design decision with a `Test:` field, run the test and record pass/fail.
3. Check success criteria. Verify each criterion independently against deliverables on disk.
4. Report results. Summarize what passed, what failed, and what needs attention.
5. Set status. If not already `needs-verify`, set it and log: `Status -> needs-verify. Verification run.`
6. Route outcomes:
   - All pass -> suggest final sign-off mode in **review**.
   - Trivial fix -> fix directly, then re-verify.
   - Structural gap -> stop and consult the user.

## Rules

- Refuse if status < `in-progress`.
- Read deliverables from disk — don't trust chat history.
- Don't mark `completed` here. Final sign-off does that after user confirmation.
