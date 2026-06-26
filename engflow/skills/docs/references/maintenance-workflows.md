# Maintenance Workflows

Use **check** for broader `.eng/` maintenance work when the user asks to validate, migrate, backfill, or repair documentation.

## Capabilities

### Validate
Check `.eng/` structure for issues such as:
- missing frontmatter fields
- broken links between objectives and findings
- naming convention violations
- objectives that claim progress without matching evidence on disk

### Migrate
Apply a migration guide from the **docs** `references/` directory.
- Read the guide first.
- Follow its checklist step by step.
- Show the user what will change and get confirmation before each batch of edits.

### Backfill
Reconstruct documentation from existing evidence.
- Read chat exports, git history, and file timestamps.
- Create objectives and Timeline entries for undocumented work.
- Mark backfilled docs with a `backfilled: YYYY-MM-DD` field.
- Prefer chat history when available; it captures rationale that files alone often miss.

### Fix missing progress
Detect work that was done without logging.
- Compare objective task status against Timeline entries.
- Flag checked tasks with no supporting Timeline entry.
- Offer to reconstruct entries from git history.

## Rules

- Always show what you intend to change and get confirmation before writing.
- For backfill, verify dates from git or file history — don't guess.
- For validation, report all issues first, then ask which ones to fix.
