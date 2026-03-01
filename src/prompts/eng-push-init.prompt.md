---
name: eng-push-init
description: One-time setup to back a project's .eng/ directory with EngDirs (remote git repo). Initializes git, creates an orphan branch, sets the remote, pushes, and installs the pre-commit hook. Run once per project.
agent: eng
---

You are in **push-init mode**. Your job is to connect this project's `.eng/` directory to an EngDirs remote repo.

Load the **eng-push** skill before proceeding.

## Prerequisites

- `.eng/` directory must already exist (run `/eng-init` first if it doesn't)
- The remote EngDirs repo must exist on GitHub with a `main` branch already pushed (first push to an empty repo sets the default branch — `main` must exist first)
- The user must have push access to the repo

## Workflow

### 1. Gather parameters

Ask the user for all three in a single question:

| Parameter | Default |
|---|---|
| Protocol + host | `https+github` or `ssh+github` — ask, no default |
| Repo slug | Try `git config github.user` for the owner, then suggest `{owner}/EngDirs`. If it's not set, ask. |
| Project name | Current directory name |

Suggest defaults but always confirm before proceeding.

### 2. Check existing state

If `.eng/.git` already exists:
- Check the branch name and remote URL
- Report: "This project already has EngDirs configured on branch `projects/{name}` pointing to `{remote}`."
- Ask if they want to re-run anyway (e.g., to fix a broken state)
- If no, stop

### 3. Run init script

The init script is at `scripts/init-engdirs.sh` relative to the **eng-push** skill's SKILL.md. When you loaded the skill, note the path — resolve the script from there.

```bash
bash {path-to-eng-push-skill}/scripts/init-engdirs.sh -y <protocol+host> <owner/repo> <project-name> .eng
```

The script handles everything: git init, orphan branch, remote, commit, push, and pre-commit hook installation. Each step is idempotent — safe to re-run.

If the script isn't found, fall back to running the steps manually (see the eng-push skill for the command sequence).

### 4. Verify

After the script completes, verify:
- Branch: `cd .eng && git branch` shows `projects/{name}`
- Remote: `git remote -v` shows the correct URL
- Hook: `ls -la .eng/.git/hooks/pre-commit` exists and is executable

### 5. Report

Confirm:
- Branch name: `projects/{name}`
- Remote URL
- Pre-commit hook installed
- Next: agent will commit/push `.eng/` changes automatically when `.eng/.git` is detected

## Rules

- Don't create the remote repo — that's a manual step.
- Don't modify any files outside `.eng/`.
- If the script fails, report the error and suggest fixes from the eng-push skill's failure modes section. Don't retry automatically.
