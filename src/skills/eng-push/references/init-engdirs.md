# EngDirs Init Workflow

Use this workflow to connect a project's `.eng/` directory to an EngDirs remote repository.

## Prerequisites

- `.eng/` must already exist. Use the **eng-docs** init scaffold workflow first if it does not.
- The remote EngDirs repository must already exist and have a `main` branch.
- The user must have push access to the remote.

## Workflow

### 1. Gather parameters
Ask for all three in one question:
- protocol + host: `https+github` or `ssh+github`
- repo slug: suggest `{owner}/EngDirs` if `git config github.user` resolves an owner
- project name: current directory name by default

Suggest defaults but always confirm before proceeding.

### 2. Check existing state
If `.eng/.git` already exists:
- check the branch name and remote URL
- report the current EngDirs configuration
- ask whether the user wants to re-run anyway
- if not, stop

### 3. Run init script
The init script is at `scripts/init-engdirs.sh` relative to the **eng-push** skill.

```bash
bash {path-to-eng-push-skill}/scripts/init-engdirs.sh -y <protocol+host> <owner/repo> <project-name> .eng
```

The script handles git init, orphan branch creation, remote setup, first commit, push, and pre-commit hook installation.
If the script is missing, fall back to the manual steps documented in **eng-push**.

### 4. Verify
After the script completes, verify:
- branch: `cd .eng && git branch` shows `projects/{name}`
- remote: `git remote -v` shows the correct URL
- hook: `.eng/.git/hooks/pre-commit` exists and is executable

### 5. Report
Confirm:
- branch name
- remote URL
- pre-commit hook installed
- next step: `.eng/` changes can now be committed and pushed through EngDirs

## Rules

- Don't create the remote repository yourself.
- Don't modify files outside `.eng/` while running this workflow.
- If the script fails, report the error and suggest fixes from **eng-push**. Don't retry automatically.
