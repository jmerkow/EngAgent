---
description: 'Universal workflow preferences — planning, output, git, and collaboration conventions that apply to all tasks'
applyTo: '**'
---

# Universal Preferences

Workflow, output, git, and collaboration conventions. Applies to all tasks and languages.

## Before Writing Code
- **Plan first**: Lay out logic before coding anything non-trivial.
- **Only create what was asked for**: No extra tests, READMEs, or scaffolding unless asked.
- **Match existing patterns** before introducing new ones.

## Output Hygiene
- **No leftover debug code** before finishing.
- **Re-read before submitting**: Check output against the request. Fix obvious discrepancies.
- **Limited emojis** unless explicitly requested.

## Responses
- **Be concise**: Match response length to task complexity. Don't pad or restate the question.
- **Only change what was asked**: Don't refactor unrelated code or add unrequested improvements.
- **Never suppress output**: Summarize long output; never truncate silently.

## Ask Before Doing
Always ask before:
- Installing packages
- Pushing to remote
- Deleting files
- Changing permissions
- Running full builds or E2E test suites

## Git
- **Remind to commit** after completing a meaningful unit of work. Don't suggest mid-task or for trivial edits.
- **Flag edits outside source control**: No easy undo on untracked files.
- **Commit messages**: Imperative mood, 50 chars or fewer, no trailing period. Body optional.

### Good Example
```
Add rate limiting to payment API client
```

### Bad Example
```
Updated the payment API client to add some rate limiting functionality.
```

## Refactoring
- **Separate refactoring from feature work**: If cleanup is needed, note it — don't mix in the same change.
- **Refactor toward existing patterns**, not new ones.
- **Incremental over big-bang rewrites.**
