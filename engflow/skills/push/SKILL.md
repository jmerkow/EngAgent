---
name: push
description: EngDirs sync lifecycle for `.eng/` directories backed by a central GitHub repo with one orphan branch per project. Use when initializing EngDirs for a project, committing or pushing `.eng/` changes, checking the pre-commit hook, setting an upstream branch, recovering from detached HEAD, or troubleshooting EngDirs auth and `git push` failures such as 403 or permission denied.
---

# EngDirs Push and Sync

This skill covers the `.eng/` Git sync lifecycle. Use **docs** for `.eng/` document format and structure.

## Overview

- Stay in this file for day-to-day commit/push work, hook behavior, and the failure modes below.
- Read [references/init-engdirs.md](references/init-engdirs.md) when the task is first-time EngDirs setup or re-running init for an existing `.eng/`.
- For merge conflicts, diverged history, or anything outside the documented cases here, stop and ask the user.

## Setup Workflow

For first-time EngDirs setup, read [references/init-engdirs.md](references/init-engdirs.md) and follow it exactly.

Read [scripts/init-engdirs.sh](scripts/init-engdirs.sh) only when the init workflow fails or you need to explain the script's exact behavior.

## Repo Structure

EngDirs uses:
- `main` for repo-level docs and shared config
- `projects/{name}` orphan branches for project-specific `.eng/` content

## Commit and Push

**Commit frequently, push judiciously.**

1. Commit after any meaningful `.eng/` write — objectives updated, findings written, tasks checked off.
2. Push at the end of a session, at a logical checkpoint, or before switching context.
3. If clean history matters, squash or fixup small local commits before pushing.
4. Keep commit messages descriptive; there is no commit-message validation.

### Commands

```bash
cd .eng
git add -A && git commit -m "Update objective progress"
git push
```

Success looks like:
- the commit is created locally without hook errors
- `git push` completes on `projects/{name}` without upstream or auth failures

## Pre-commit Hook

Read [scripts/pre-commit](scripts/pre-commit) when a commit is blocked and you need the exact validation rules.

A pre-commit hook validates `.eng/` content before each commit:

- **File naming:** objectives must match `objective-*.md`, findings `finding-*.md`, retros `retro-*.md`
- **Frontmatter exists:** files in `objectives/`, `findings/`, `retros/` must start with `---`
- Violations block the commit. Use `git commit --no-verify` to bypass.

The hook is installed by the init workflow in [references/init-engdirs.md](references/init-engdirs.md) via symlink from `.eng/.git/hooks/pre-commit` to the skill's script.

## Common Failure Modes

### Auth failure (403 / permission denied)

**Symptom:** `git push` fails with 403 or "Permission denied (publickey)".

**Cause:** HTTPS token expired or SSH key not configured for the EngDirs repo.

**Fix:**
- HTTPS: re-authenticate with `gh auth login` or update the credential helper.
- SSH: verify `ssh -T git@github.com` works; add a key if not.

If auth issues persist, stop and ask the user. Don't attempt credential management.

### Detached HEAD

**Symptom:** `git status` shows "HEAD detached" instead of a branch name.

**Cause:** Usually from a checkout of a specific commit, or interrupted init.

**Fix:**
```bash
cd .eng
git checkout projects/{name}
# If branch doesn't exist locally:
git checkout -b projects/{name} HEAD
git push -u origin projects/{name}
```

Success looks like: `git branch --show-current` returns `projects/{name}`.

### Upstream not set

**Symptom:** `git push` says "fatal: The current branch has no upstream branch."

**Fix:**
```bash
git push -u origin projects/{name}
```

Success looks like: later plain `git push` works without `-u`.

## Anything Else

For merge conflicts, diverged history, or anything not covered above: **stop and ask the user.** EngDirs content is low-volume and rarely conflicts — complex git issues likely indicate a setup problem that needs human judgment.

## Scripts

- [references/init-engdirs.md](references/init-engdirs.md) — read for first-time setup or re-running init; includes prerequisites, parameters, and verification
- [scripts/init-engdirs.sh](scripts/init-engdirs.sh) — one-time setup: init git, create orphan branch, set remote, push, install pre-commit hook
- [scripts/pre-commit](scripts/pre-commit) — read when diagnosing blocked commits or exact naming/frontmatter validation
