---
name: eng-push
description: Push and sync lifecycle for .eng/ directories backed by EngDirs (a central git repo with orphan branches per project). Covers init, commit, push, pre-commit validation, and common failure modes. Use when setting up EngDirs for a project, committing .eng/ content, pushing to remote, or troubleshooting sync issues.
---

# eng-push — .eng/ Git Sync

## Overview

When configured, `.eng/` directories are backed by a private GitHub repo (EngDirs) using orphan branches — one branch per project, named `projects/{name}`. This skill covers the push/sync lifecycle. For document format and structure, see **eng-docs**.

## Setup Workflow

For first-time EngDirs setup, see [references/init-engdirs.md](references/init-engdirs.md).

## Repo Structure

```
EngDirs repo (private)
├── main                          # README, mdBook config (later)
├── projects/ProjectA (orphan)     # .eng/ content for ProjectA
├── projects/ProjectB (orphan)     # .eng/ content for ProjectB
└── ...
```

Each orphan branch mirrors the `.eng/` directory layout:
```
objectives/
findings/
retros/
archive/
scratch/
```

## Commit and Push

**Commit frequently, push judiciously.**

- Commit after any meaningful `.eng/` write — objectives updated, findings written, tasks checked off. Cost is near zero (private repo, orphan branches, working notes).
- Push less often: end of session, logical checkpoint, or before switching context.
- Use `git rebase -i` / fixup to squash small commits before pushing when clean history matters.
- No commit message validation — these are working notes. Keep messages descriptive but don't overthink them.

### Commands

```bash
cd .eng
git add -A && git commit -m "Update objective progress"
git push
```

## Pre-commit Hook

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
- HTTPS: re-authenticate with `gh auth login` or update the credential helper
- SSH: verify `ssh -T git@github.com` works; add key if not

If auth issues persist, punt to the user — don't attempt credential management.

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

### Upstream not set

**Symptom:** `git push` says "fatal: The current branch has no upstream branch."

**Fix:**
```bash
git push -u origin projects/{name}
```

## Anything Else

For merge conflicts, diverged history, or anything not covered above: **stop and ask the user.** EngDirs content is low-volume and rarely conflicts — complex git issues likely indicate a setup problem that needs human judgment.

## Scripts

- [scripts/init-engdirs.sh](scripts/init-engdirs.sh) — one-time setup: init git, create orphan branch, set remote, push
- [scripts/pre-commit](scripts/pre-commit) — pre-commit hook for naming and frontmatter validation
