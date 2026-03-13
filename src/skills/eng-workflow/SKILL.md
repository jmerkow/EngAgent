---
name: eng-workflow
description: Workflow phases, status values, and gate checklists. The single source of truth for how objectives move through scoping → planning → implementation → verification. Loaded by eng, eng-plan, eng-code.
---

# Workflow

## Status values

| Status | Ordinal | Phase | Meaning |
|---|---|---|---|
| `draft` | 0 | Scoping | Problem and success criteria being defined |
| `in-review` | 1 | Planning | Design and implementation plan in progress |
| `approved` | 2 | Ready | Plan confirmed, implementation can start |
| `in-progress` | 3 | Implementation | Tasks being executed |
| `needs-verify` | 4 | Verification | Implementation done, awaiting checks |
| `completed` | 5 | Done | Verified and finished |
| `deferred` | — | Paused | Back to backlog (reason required) |
| `cancelled` | — | Abandoned | Not doing this (reason required) |

Gate checks use `>=` on the ordinal: e.g., `/eng-go` requires status >= `approved` (2).

Terminal states (`deferred`, `cancelled`) have no ordinal — they exit the workflow. Both require a reason in the Timeline.

## Phase behavior

On session start, read the active objective's `status:` from frontmatter. Match to the phase above. Adjust behavior accordingly — scoping agents refuse implementation work, implementation agents refuse if status < approved.

## Gates

### Scoping → Planning (draft → in-review)
- [ ] Objective statement exists (1-3 sentences, observable end state)
- [ ] Success criteria exist (3-5 independently verifiable bullets)
- [ ] User confirmed scope

### Planning → Implementation (in-review → approved)
- [ ] Design `*Status: approved*` (or no design needed)
- [ ] Implementation plan written with done criteria (`*Status: approved*`)
- [ ] No contradictions between design decisions and tasks
- [ ] User confirmed plan

### Implementation → Verification (in-progress → needs-verify)
- [ ] All task checkboxes checked
- [ ] Deliverables exist on disk (no stubs, no TODOs)
- [ ] Files wired together where expected

### Verification → Done (needs-verify → completed)
- [ ] Design decision tests pass
- [ ] Success criteria independently verified
- [ ] User sign-off
