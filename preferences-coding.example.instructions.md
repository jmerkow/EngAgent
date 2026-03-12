---
description: 'Code quality, naming, and style rules. Apply when writing, editing, or reviewing source code in any language. Do NOT load for documentation-only tasks, .eng/ file edits, or markdown authoring.'
---

# Coding Preferences

Code quality, naming, and style rules for all languages.

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
