---
name: review
description: Context-aware review workflow for .eng objectives — gate review, deliverable verification, and final sign-off. Use when reviewing scope/design/plans, verifying implementation, or closing out verified work.
---

# review — Review, Verify, Sign Off

Choose the mode from the active objective's status and the user's ask.

## Modes

- **Gate review** — for `draft` or `in-review` objectives. See [references/gate-review.md](references/gate-review.md).
- **Deliverable verification** — for `in-progress` or `needs-verify` objectives that need decision tests and success-criteria checks. See [references/verify-deliverables.md](references/verify-deliverables.md).
- **Final sign-off** — for `needs-verify` objectives that passed verification and are ready to close. See [references/final-signoff.md](references/final-signoff.md).

## Rules

- Read the objective fresh from disk before selecting a mode.
- Follow **workflow** status ordinals and gate criteria.
- Keep procedures in the reference files; don't duplicate them here.
- Final sign-off still requires explicit user confirmation before any commit.
