# Migration Guide: v2 → v3

Checklist for migrating a repo's `.eng/` directory from v2 conventions to v3. Run this once per repo.

## What's changing

| Concept | v2 | v3 |
|---------|----|----|
| Workflow phases | Problem → Tasks → Implement | Research → Design → Plan → Implement → Verify |
| Objective lifecycle | `draft \| active \| completed \| paused` | `draft \| in-review \| approved \| completed \| deferred \| cancelled` |
| Design | Optional `## Design` section, no conventions | Two-tier: inline (simple) or full `design-*.md` (complex) |
| Design directory | — | `.eng/designs/` |
| Mistakes directory | — | `.eng/mistakes/` |
| Mistake capture | Retro only (post-session) | As-it-happens: self-report, `/eng-wtf`, frustration detection |
| Section control | Mutability rules only | Zone (Open/Protected) × mutability |
| Phase transitions | None | Three gates: D→P, P→I, I→V |
| `## Mistakes` section | — | Between Progress and Parking Lot in objectives |

**How to tell if a repo is v2 or v3:**
- Has `status: active` in objectives → v2
- Has `status: approved` in objectives → v3
- Has `.eng/designs/` → v3
- No `## Mistakes` section in objectives → v2

## Approach

Most v2 repos can adopt v3 incrementally — the new conventions are additive, not breaking. Existing objectives don't need to be rewritten unless they're actively in progress.

1. **Update directory structure** — add new directories
2. **Update active objectives** — add missing sections, update status vocabulary
3. **Completed objectives are fine as-is** — don't touch them

## Checklist

- [ ] **Create new directories** — `mkdir -p .eng/designs .eng/mistakes`
- [ ] **Update active objective frontmatter** — Replace `status: active` with `status: approved` (if user-confirmed) or `status: in-review` (if still being discussed). Replace `status: paused` with `status: deferred` and add a reason to the Timeline.
- [ ] **Add `## Mistakes` section** — For each active objective, add between Progress and Parking Lot:
  ```markdown
  ## Mistakes
  *Captured as they happen. Feeds retro system.*
  ```
- [ ] **Update inline `## Design` sections** — If an active objective has a `## Design` section, add a status marker:
  ```markdown
  ## Design
  *Status: approved*
  ```
- [ ] **Leave completed objectives alone** — `status: completed` is valid in both v2 and v3. Don't migrate finished work.
- [ ] **Final validation** — Run the validation script below.

## Validation

```bash
echo "=== Directory structure ==="
[ -d ".eng/designs" ] && echo "  designs/: PASS" || echo "  designs/: MISSING"
[ -d ".eng/mistakes" ] && echo "  mistakes/: PASS" || echo "  mistakes/: MISSING"

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

## Notes

- **v3 is additive.** No renames, no directory moves, no breaking changes to existing files.
- **Completed objectives don't need migration.** The old `status: completed` is still valid.
- **Agents enforce the new workflow automatically.** Once you update EngAgent (re-run install or rebuild), the gates and mistake capture kick in for new work without changing existing docs.
- **Design docs are optional.** Simple work skips the design phase entirely. The gate only blocks if gray areas were surfaced and not addressed.
