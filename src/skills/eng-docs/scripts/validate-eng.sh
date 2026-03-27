#!/usr/bin/env bash
set -euo pipefail

target="${1:-.}"
if [ -d "$target/.eng" ]; then
  project_root="$target"
  eng_dir="$target/.eng"
elif [ "$(basename "$target")" = ".eng" ]; then
  project_root="$(dirname "$target")"
  eng_dir="$target"
else
  echo "Usage: validate-eng.sh [project-root|path-to-.eng]" >&2
  exit 2
fi

required_dirs=(objectives designs findings mistakes retros scratch whiteboard archive)
fail=0

echo "== Required directories =="
for dir in "${required_dirs[@]}"; do
  if [ -d "$eng_dir/$dir" ]; then
    echo "PASS  $dir/"
  else
    echo "FAIL  missing $dir/"
    fail=1
  fi
done

echo
echo "== Required files and wiring =="
if [ -f "$project_root/.github/hooks/hooks.json" ]; then
  echo "PASS  .github/hooks/hooks.json"
else
  echo "FAIL  missing .github/hooks/hooks.json"
  fail=1
fi

if [ -f "$project_root/.gitignore" ] && grep -Eq '^[[:space:]]*\.eng/$' "$project_root/.gitignore"; then
  echo "PASS  .gitignore contains .eng/"
else
  echo "FAIL  .gitignore missing .eng/ entry"
  fail=1
fi

if find "$eng_dir/objectives" -maxdepth 1 -type f -name 'objective-*.md' | grep -q . || find "$eng_dir/whiteboard" -maxdepth 1 -type f -name '*.md' | grep -q .; then
  echo "PASS  starting document exists (objective or whiteboard)"
else
  echo "FAIL  missing starting document in objectives/ or whiteboard/"
  fail=1
fi

exit "$fail"
