# Migration Guide: v1 → v2

Checklist for migrating a repo's `.eng/` directory from v1 conventions to v2. Run this once per repo.

## What's changing

| Concept | v1 | v2 |
|---------|----|----|
| Central hub document | "plan" | "objective" |
| Hub directory | `.eng/plans/` | `.eng/objectives/` |
| Hub file naming | `plan-<slug>.md` | `objective-<slug>.md` |
| Per-task section | `## Logs` | `## Progress` |
| Session detail files | `.eng/logs/` (dedicated dir) | No dedicated dir — use Progress → Timeline inline |
| Retro directory | `.eng/retros/` (existed but not in scaffold) | `.eng/retros/` (in standard scaffold) |
| Objective lifecycle | `active \| completed \| paused` | `draft \| active \| completed \| paused` |
| Frontmatter `parent:` | `parent: plan-*.md` | `parent: objective-*.md` |

**How to tell if a repo is v1 or v2:**
- Has `.eng/plans/` → v1
- Has `.eng/objectives/` → v2
- Has both → partial migration, finish it
- Has neither → no `.eng/` yet, will get v2 automatically

## Approach

1. **Create an objective** for the migration in `.eng/objectives/` (or add a task to an existing objective). Copy the checklist below into it.
2. **Copy the checklist into `.eng/CHANGELOG.md`** as a record. Check items off as you complete them.
3. **Process one file at a time.** Read, edit, validate, then move to the next. Don't batch renames or edits across multiple files without verifying each one.
4. This checklist covers the known v1→v2 changes. Your repo may have additional things to update — use judgment.

### Scripts vs. judgment

Some steps are purely mechanical — a script or one-liner can handle them safely across all files. Others require reading each file first and reasoning about what goes where before touching anything.

**Mechanical (scripts are fine):**
- Directory and file renames
- Frontmatter field updates (`parent:`, `references:`)
- Section header renames (`## Logs` → `## Progress`)
- String replacements for content references
- Heading level demotion once mapping is decided

**Judgment required — reason first, then act:**
- Mapping existing sections to template categories (especially findings: which sections belong under Context vs. Findings vs. Conclusions?)
- Identifying whether a section is substance or scaffolding
- Handling edge cases (missing sections, corrupted headings, content that fits multiple categories)

The failure mode is applying scripts to judgment steps — running a bulk demotion or insertion before you've read the file and decided where things go. Do the reasoning first, per file. The scripts are for execution after the map is clear.

## Checklist

- [ ] **Pre-flight** — Verify `.eng/` has v1 structure. Check if gitignored (use `mv` instead of `git mv` if so). Commit or stash uncommitted changes.
- [ ] **Rename directories** — `plans/` → `objectives/`. Create `retros/` if missing. Remove empty `logs/` (fold non-empty content into the relevant objective's Progress first).
- [ ] **Rename files** — Each `plan-*.md` → `objective-*.md` in `.eng/objectives/`. One at a time.
- [ ] **Update frontmatter** — In all `.eng/` subdirectories, update `parent:` and `references:` from `plan-*` → `objective-*`. Add `parent:` to any pre-convention files that lack it.
- [ ] **Rename sections in objectives** — `## Logs` → `## Progress`. Align Progress subsection field names to v2 (Status, Description, Open Questions, Decisions, Investigations, Timeline).
- [ ] **Update content references** — Replace "plan" → "objective" where it means the document type (not the verb). Check all `.eng/` subdirectories — findings and retro files may have stale path refs too.
- [ ] **Validate objectives against template** — Each file needs `## Objective`, `## Tasks`, `## Progress` at minimum.
- [ ] **Validate findings against template** — Each file needs `## Context`, `## Findings`, `## Conclusions`, plus frontmatter (`created`, `project`, `parent`). Process one file at a time. See [Findings validation procedure](#findings-validation-procedure).
- [ ] **Leave retro body text untouched** — historical records stay as-written. Do update retro frontmatter `parent:` refs.
- [ ] **Create or update `.eng/CHANGELOG.md`** — if `.eng/` is gitignored (no git history), create a changelog and record the migration.
- [ ] **Final validation** — no `plan-*.md` files remain, no stale `.eng/plans/` refs, no stale `parent: plan-` refs, no `## Logs` headers in objectives, no empty `logs/` directory.

## Findings validation procedure

This is a judgment step — do not script it across all files. Read each file, decide where things go, then act.

**Step 1 — Read and map (judgment, no edits yet)**

Run `grep -n "^## " <file>` to list all top-level sections. For each section, decide which template category it belongs to:

| Category | What goes here |
|---|---|
| `## Context` | Background, the question being investigated, source material, what prompted this |
| `## Findings` | What was discovered — investigations, comparisons, catalogs, analysis |
| `## Conclusions` | Takeaways, recommendations, priority rankings, actions for the parent objective |

Note the name of the first Findings section and the first Conclusions section. If a section is ambiguous, ask: is this "what I read/why I looked" (Context) or "what I found" (Findings)?

**Step 2 — Demotion (mechanical, per-file)**

Once the map is clear, demote all body `##` headings to `###`. The preserved headings — `Context`, `Findings`, `Conclusions`, `Sources` — are excluded:

```bash
sed -i -E '/^## (Context|Findings|Conclusions|Sources)/!s/^## /### /' <file>
```

Check whether existing `###` headings also need shifting (they would if their former `##` parent got demoted): `grep -n "^###" <file>`.

**Step 3 — Insert headings (targeted edits)**

Insert `## Findings` immediately before the first findings section, and `## Conclusions` immediately before the first conclusions section. Use the edit tool — the insertion point is different for every file.

**Step 4 — Sanity check**

Verify no heading level gaps (e.g. `##` jumping directly to `####`). See [Findings heading level check](#findings-heading-level-check) script.

Also check for these structural quality issues that insertion can expose:

- **Redundant subsection name** — does the first `###` under a section just restate the parent? E.g., `## Findings` / `### Key Findings` or `## Conclusions` / `### Summary`. If so, either remove the `###` and promote its children, or rename it to something more specific.
- **Numbering that assumed cross-section continuity** — if numbering was sequential across the whole document (1, 2, 3, 4...) and you've now split it into sections, check that numbers make sense in their new context. E.g., `## Conclusions` / `### 4. Priority Recommendations` reads as if three things came before it. Drop or reset the number.

**Edge cases:**
- `## Conclusion` (singular) → rename to `## Conclusions`
- `## Context` already present → keep it, don't duplicate
- Missing frontmatter fields → add them
- A section that fits two categories → put it where its *primary purpose* fits; content doesn't need to be perfectly partitioned

## Findings heading structure review

Work file by file. Max 3 subagents at a time. **Do not write new scripts** — sed for unambiguous mechanical shifts, `replace_string_in_file` for everything else. If you find yourself reaching for Python or a multi-step pipeline, try a different strategy. If still uncertain, stop and ask the user — explain the heading, what you see, and what's unclear.

**For each file:**

1. **Get the heading map:** `grep -n '^#\+ ' "$f"` — note level gaps, duplicate levels, numbers crossing section boundaries, lone `#`/`##` headings.

2. **For each suspicious heading:** read 5–10 lines of surrounding context before doing anything. Understand what that content is before deciding its level. Do not act on heading level alone.

3. **Reason** about what the file's content hierarchy should be, then make the heading levels match it. If a repeated pattern is pervasive and reads clearly, leave it.

4. **Edit:** sed only when the affected set is unambiguous from the grep output alone — no surrounding context needed to decide. Otherwise `replace_string_in_file`.

5. **Sanity check:** `grep -n '^#\+ ' "$f"` again — confirm parent→child relationships read as a coherent outline. Fix regressions before the next file.

## Helpful Scripts

### File rename loop
```bash
cd .eng/objectives
for f in plan-*.md; do mv "$f" "objective-${f#plan-}"; done  # use git mv if tracked
```

### Objective structure check
```bash
for f in .eng/objectives/objective-*.md; do
  echo "--- $(basename "$f") ---"
  grep -q "^## Objective" "$f" && echo "  Objective: PASS" || echo "  Objective: MISSING"
  grep -q "^## Tasks" "$f" && echo "  Tasks: PASS" || echo "  Tasks: MISSING"
  grep -q "^## Progress" "$f" && echo "  Progress: PASS" || echo "  Progress: MISSING"
done
```

### Findings structure check
```bash
for f in .eng/findings/finding-*.md; do
  echo "--- $(basename "$f") ---"
  grep -q "^## Context" "$f" && echo "  Context: PASS" || echo "  Context: MISSING"
  grep -q "^## Findings" "$f" && echo "  Findings: PASS" || echo "  Findings: MISSING"
  grep -q "^## Conclusions" "$f" && echo "  Conclusions: PASS" || echo "  Conclusions: MISSING"
  grep -q "^created:" "$f" && echo "  created: PASS" || echo "  created: MISSING"
  grep -q "^parent:" "$f" && echo "  parent: PASS" || echo "  parent: MISSING"
done
```

### Findings heading level check
```bash
for f in .eng/findings/finding-*.md; do
  issues=$(grep -n "^#" "$f" | sed 's/\(#*\).*/\1/' | awk '{n=length($0)} prev && n-prev>1 {print "jump "prev"→"n} {prev=n}')
  [ -n "$issues" ] && echo "$(basename "$f"): $issues" || echo "$(basename "$f"): OK"
done
```

### Stale reference validation
```bash
ls .eng/objectives/plan-*.md 2>/dev/null && echo "FAIL: plan-*.md files remain" || echo "PASS"
grep -r "\.eng/plans/" .eng/objectives/ .eng/findings/ && echo "FAIL: stale directory refs" || echo "PASS"
grep -r "parent: plan-" .eng/ && echo "FAIL: stale parent refs" || echo "PASS"
[ -d ".eng/logs/" ] && echo "FAIL: logs/ still exists" || echo "PASS"
grep -l "^## Logs" .eng/objectives/*.md && echo "FAIL: stale section headers" || echo "PASS"
```

## Notes

- The `@eng-plan` agent name stays — "plan" is a fine verb for what it does
- If the repo uses EngAgent's install script, re-run it after migration to get updated agents/prompts/skills
- Repos without `.eng/` don't need migration — they'll get v2 conventions automatically when `.eng/` is first created
