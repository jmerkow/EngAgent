# Migration Guide: v2 → v3

Checklist for migrating a repo's `.eng/` directory from v2 conventions to v3. Run this once per repo.

## How to tell if a repo needs migration

- `status: active` or `status: paused` in objective frontmatter → v2
- Missing `.eng/designs/`, `.eng/mistakes/`, or `.eng/scratch/` → v2
- Active objectives without `## Mistakes` section → v2

## Checklist

- [ ] **Create new directories** — `mkdir -p .eng/designs .eng/mistakes .eng/scratch`
- [ ] **Fix status values in active objective frontmatter:**
  - `status: active` → `status: approved` (if user-confirmed) or `status: in-review` (if still being discussed)
  - `status: paused` → `status: deferred` (add a reason to the Timeline)
  - `status: completed` is unchanged — leave it
- [ ] **Add `## Mistakes` section** to each active objective, between Progress and Parking Lot:
  ```markdown
  ## Mistakes
  *Captured as they happen. Feeds retro system.*
  ```
- [ ] **Add status marker to inline `## Design` sections** in active objectives:
  ```markdown
  ## Design
  *Status: approved*
  ```
- [ ] **Leave completed objectives alone** — no changes needed.

## Validation

```bash
echo "=== Directory structure ==="
[ -d ".eng/designs" ] && echo "  designs/: PASS" || echo "  designs/: MISSING"
[ -d ".eng/mistakes" ] && echo "  mistakes/: PASS" || echo "  mistakes/: MISSING"
[ -d ".eng/scratch" ] && echo "  scratch/: PASS" || echo "  scratch/: MISSING"

echo "=== Stale status values ==="
grep -rl "status: active" .eng/objectives/ 2>/dev/null && echo "  FAIL: 'active' should be 'approved' or 'in-review'" || echo "  PASS: no 'active' status"
grep -rl "status: paused" .eng/objectives/ 2>/dev/null && echo "  FAIL: 'paused' should be 'deferred'" || echo "  PASS: no 'paused' status"

echo "=== Active objectives have Mistakes section ==="
for f in .eng/objectives/objective-*.md; do
  status=$(grep "^status:" "$f" | head -1 | awk '{print $2}')
  if [ "$status" = "approved" ] || [ "$status" = "in-review" ] || [ "$status" = "draft" ]; then
    grep -q "^## Mistakes" "$f" && echo "  $(basename "$f"): PASS" || echo "  $(basename "$f"): MISSING ## Mistakes"
  fi
done
```
