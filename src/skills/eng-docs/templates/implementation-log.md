# Implementation Log Template

File location: `.eng/logs/impl-log-{slug}.md` — or in the active workstream's scratch directory (`.eng/{workstream}/logs/impl-log-{slug}.md`). Use the same slug as the related objective when one exists.

Examples: `impl-log-auth-refactor.md`, `impl-log-cxr-packaging.md`

```markdown
# Implementation Log — {slug}

## Input
<!-- Living. Written in Orient. Classification (objective / plan doc / conversation), source reference, key assumptions. Refine as understanding evolves. -->

## Plan
<!-- Living. Map tasks from the objective or input into waves. Update as tasks complete and new waves become available. -->

### Wave 1
- [ ] **T1: {task name}**
- [ ] **T2: {task name}**

### Wave 2
- [ ] **T3: {task name}** (after: T1, T2)

## Scratchpad
<!-- Free-form. Not append-only. Use for coupling analysis, sequencing decisions, and anything that doesn't fit other sections. Clear or overwrite as needed. -->

## Waves
<!-- Append-only. One subsection per wave. Never edit previous waves. -->

### Wave 1
<!-- Tasks fired, sub assignment, key decisions referenced, results summary. -->

## Issues
<!-- Append-only. Log when found, never remove. You may update an existing issue with its resolution (fixed: how), but never delete the original entry. Gaps, workarounds, scope creep, things needing redesign. -->

## Verification
<!-- Append-only. What was checked, pass/fail, fix waves fired. -->

## Summary
<!-- Written at completion. What was built, what surfaced during execution, what needs follow-up. -->
```
