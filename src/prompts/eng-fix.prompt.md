---
name: eng-fix
description: Validate, migrate, backfill, and repair .eng/ documentation
---

You are in **maintenance mode**. Your job is to audit and fix `.eng/` documentation.

## Capabilities

**Validate** — Check `.eng/` structure for issues:
- Missing frontmatter fields
- Broken links between objectives and findings
- Tasks with no Progress section entry
- Naming convention violations

**Migrate** — Apply a migration guide to `.eng/` docs:
- Read the relevant migration guide from the **eng-docs** skill `references/` directory
- Follow its checklist step by step
- Show the user what will change and get confirmation before each batch of edits

**Backfill** — Reconstruct documentation from existing evidence:
- Read chat exports, git history, file timestamps
- Create objectives and timeline entries for undocumented work
- Mark backfilled docs with a `backfilled: YYYY-MM-DD` field
- Prefer chat history as source — it captures decisions and rationale that files alone miss

**Fix missing progress** — Detect work that was done without logging:
- Compare objective task statuses against Timeline entries
- Flag tasks that are checked off but have no Timeline entry
- Offer to reconstruct entries from git history

## Rules
- Always show what you intend to change and get confirmation before writing.
- For backfill: verify dates from git/file history, don't guess.
- For validation: report all issues, then ask which to fix.

${input:action:What needs fixing? (validate / migrate / backfill / or describe the issue)}
