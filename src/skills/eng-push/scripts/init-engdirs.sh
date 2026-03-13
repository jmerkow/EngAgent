#!/usr/bin/env bash
set -euo pipefail

# Initialize an existing .eng/ directory as an EngDirs orphan branch and push.
# Prerequisites: Remote repo must exist (private, can be empty).
#
# Usage: ./init-engdirs.sh [-y] <protocol+host> <owner/repo> <project-name> /path/to/project/.eng
# Example: ./init-engdirs.sh https+github owner/EngDirs MyProject .eng
# Example: ./init-engdirs.sh -y https+github owner/EngDirs MyProject .eng
#
# Supported: https+github, ssh+github (ado planned)
# Branch will be created as projects/<project-name>
# Use -y to skip interactive confirmation (for agent/script use).

AUTO_CONFIRM=false
if [[ "${1:-}" == "-y" ]]; then
  AUTO_CONFIRM=true
  shift
fi

HOST="${1:?Usage: $0 [-y] <protocol+host> <owner/repo> <project-name> /path/to/project/.eng}"
REPO_SLUG="${2:?Usage: $0 [-y] <protocol+host> <owner/repo> <project-name> /path/to/project/.eng}"
PROJECT_SLUG="${3:?Usage: $0 [-y] <protocol+host> <owner/repo> <project-name> /path/to/project/.eng}"
ENG_DIR="${4:?Usage: $0 [-y] <protocol+host> <owner/repo> <project-name> /path/to/project/.eng}"
BRANCH="projects/${PROJECT_SLUG}"

case "$HOST" in
  https+github)
    REPO="https://github.com/${REPO_SLUG}.git"
    ;;
  ssh+github)
    REPO="git@github.com:${REPO_SLUG}.git"
    ;;
  *+ado)
    echo "Error: ADO support not yet implemented"
    exit 1
    ;;
  *)
    echo "Error: unknown host '$HOST'. Supported: https+github, ssh+github"
    exit 1
    ;;
esac

if [[ ! -d "$ENG_DIR" ]]; then
  echo "Error: $ENG_DIR does not exist"
  exit 1
fi

echo "Directory: $ENG_DIR"
echo "Branch:    $BRANCH"
echo "Remote:    $REPO"

# Show what steps will run
if [[ -d "$ENG_DIR/.git" ]]; then
  echo "Status:    git already initialized, resuming"
else
  echo "Status:    fresh init"
fi

echo ""
if [[ "$AUTO_CONFIRM" == "true" ]]; then
  echo "Auto-confirmed (-y flag)"
else
  read -rp "Proceed? (y/N) " confirm
  [[ "$confirm" =~ ^[Yy]$ ]] || exit 0
fi

cd "$ENG_DIR"

# Step 1: git init (skip if already done)
if [[ ! -d .git ]]; then
  echo "» git init"
  git init
fi

# Step 2: orphan branch (skip if already on it)
CURRENT="$(git symbolic-ref --short HEAD 2>/dev/null || true)"
if [[ "$CURRENT" != "$BRANCH" ]]; then
  echo "» checkout --orphan $BRANCH"
  git checkout --orphan "$BRANCH"
fi

# Step 3: stage and commit (skip if nothing to commit)
git add -A
if ! git diff --cached --quiet 2>/dev/null; then
  echo "» commit"
  git commit -m "Initialize $BRANCH"
else
  echo "» nothing to commit, skipping"
fi

# Step 4: add remote (skip if already set)
if ! git remote get-url origin &>/dev/null; then
  echo "» adding remote"
  git remote add origin "$REPO"
fi

# Step 5: push
echo "» push"
git push -u origin "$BRANCH"

# Step 6: install pre-commit hook (skip if source not found)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
HOOK_SRC="$SCRIPT_DIR/pre-commit"
HOOK_DST=".git/hooks/pre-commit"
if [[ -f "$HOOK_SRC" ]]; then
  cp "$HOOK_SRC" "$HOOK_DST"
  chmod +x "$HOOK_DST"
  echo "» installed pre-commit hook"
else
  echo "» pre-commit hook not found at $HOOK_SRC, skipping"
fi

echo ""
echo "Done. $ENG_DIR is now tracked on $REPO branch $BRANCH"
