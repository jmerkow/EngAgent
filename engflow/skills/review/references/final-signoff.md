# Final Sign-Off

Use this mode after verification has passed and the user is ready to close the objective.

## Workflow

1. Discover the objective. Find `status: needs-verify` objectives in `.eng/objectives/` and `.eng/workstreams/`. If none exist, refuse and suggest verification first.
2. Check the gate. Status must be >= `needs-verify`.
3. Confirm with the user. Summarize what was verified and ask for sign-off.
4. Update the objective:
   - Set `status: completed`
   - Add Timeline entry: `Status -> completed. {brief summary}.`
5. Prepare the commit. Run `git add -A && git status`, propose an imperative commit message (50 chars or fewer), and wait for confirmation before committing.

## Rules

- Don't start new work. This mode is for closing out.
- Refuse if status < `needs-verify`.
- Keep Timeline entries concise.
