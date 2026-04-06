# Implementing an Approved Objective

Use this workflow when executing against an approved eng-workflow objective.

## Workflow

1. Check the objective's `status:` — must be ≥ `approved` (ordinal 2). If not, refuse and tell the user to finish planning first (suggest **eng-review** gate-review).
2. Set `status: in-progress` and add a Timeline entry.
3. Read `## Implementation Plan` — each task lists its done criteria.
4. Read `## Design` — decisions are tagged `D1`, `D2`, etc. Tasks reference the decisions they implement via `[implements: D1]` tags.
5. Parse task dependencies via `(after: T1)` syntax. Tasks with no blockers can run in parallel as a wave.
6. Before starting each task: re-read its `[implements:]` decisions from the document — not from memory. Don't rely on what you read in step 4.
7. Only implement what the plan says. New observations, scope creep, and improvement ideas go in `## Parking Lot` — don't act on them.
8. On task completion: check off the task checkbox and add a Timeline entry.
9. When all tasks are done: suggest the verification handoff. Do **not** set `status: needs-verify` — that is the verifier's job after checking the Implementation → Verification gate.

## Rules

- Implementation is plan execution only. Don't redesign, don't add scope.
- If a task surfaces missing or conflicting decisions, stop and hand back to planning. Don't improvise design decisions.
- Follow **eng-docs** conventions for Timeline entries and document updates.
