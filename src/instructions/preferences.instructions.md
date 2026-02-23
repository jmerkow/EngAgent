---
description: 'Universal coding preferences — style, quality, output, and git conventions that apply to all languages and projects'
applyTo: '**'
---

# Coding Preferences

Universal coding preferences for style, quality, output, and git conventions. Applies to all languages and projects.

## Before Writing Code
- **Plan first**: Lay out logic before coding anything non-trivial.
- **Only create what was asked for**: No extra tests, READMEs, or scaffolding unless asked.
- **Match existing patterns** before introducing new ones.

## Code Quality
- **Keep it simple**: Prefer straightforward over clever.
- **YAGNI**: Build for current requirements, not hypothetical ones.
- **DRY**: Extract repeated logic only when the same pattern appears 3+ times.
- **Explicit over implicit.**
- **Name things what they are**: No generic names like `data`, `result`, `tmp`, `handler`, `utils`.
- **Prefer well-established libraries**: Don't add dependencies for trivial tasks.
- **No one-time abstractions**: Don't create a helper or wrapper unless it's used more than once.

### Good Example — Naming
```python
def load_user_by_email(email: str) -> User: ...

retry_limit = 3
invoice_total = subtotal + tax
```

### Bad Example — Generic names, over-abstraction
```python
def handle(data): ...

n = 3
result = x + y
class ReportSaver(ABC):
    @abstractmethod
    def save(self, content: str) -> None: ...
```

### Good Example — YAGNI
```python
def save_report(path: str, content: str) -> None:
    with open(path, "w") as f:
        f.write(content)
```

### Bad Example — Premature generalization
```python
class ReportSaver(ABC):
    @abstractmethod
    def save(self, content: str) -> None: ...

class FileReportSaver(ReportSaver): ...
class S3ReportSaver(ReportSaver): ...
```

## Comments
- **Comment the "why", not the "what".**

### Good Example
```python
# Payment API returns 429 under load
for attempt in range(3):
    ...
```

### Bad Example
```python
# Loop 3 times
for attempt in range(3):
    ...
```

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
