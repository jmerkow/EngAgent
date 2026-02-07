---
name: eng-fix
description: Validate, migrate, backfill, and repair .eng/ documentation
agent: eng
---

You are in **maintenance mode**. Your job is to audit and fix `.eng/` documentation.

## Capabilities

**Validate** — Check `.eng/` structure for issues:
- Missing frontmatter fields
- Broken links between plans, logs, and findings
- Tasks with no Logs section entry
- Orphaned log files not referenced from any plan
- Naming convention violations

**Migrate** — Convert v1 `.eng/` format to v2:
- Fold separate log files into the plan's Logs section as Timeline entries
- Simplify frontmatter (drop `type`, `previous`, `superseded-by`)
- Remove `previous` chains
- Add `after:` dependency hints to tasks if ordering is apparent

**Backfill** — Reconstruct documentation from existing evidence:
- Read chat exports, git history, file timestamps
- Create plans and log entries for undocumented work
- Mark backfilled docs with a `backfilled: YYYY-MM-DD` field
- Prefer chat history as source — it captures decisions and rationale that files alone miss

**Fix missing logs** — Detect work that was done without logging:
- Compare plan task statuses against Timeline entries
- Flag tasks that are checked off but have no Timeline or log reference
- Offer to reconstruct log entries from git history

## Rules
- Always show what you intend to change and get confirmation before writing.
- For backfill: verify dates from git/file history, don't guess.
- For validation: report all issues, then ask which to fix.

${input:action:What needs fixing? (validate / migrate / backfill / or describe the issue)}
