## Journal

Log work events using the journal skill. One event per call, commits automatically.

```bash
python <skill-path>/scripts/journal.py <LEVEL> -m "<verb> <subject> — <outcome>" -t <type> --tag <slug> --project <project>
```

Batch mode (2+ events in one turn): add `--no-commit` to each, then `commit -m "<summary>"` once at the end.

**What to log:** Decisions, status changes, blockers, mistakes, meeting outcomes — anything you'd want to grep for in 3 months. When unsure, suggest logging and let the user confirm.

**Flag routing:**
- `--tag <slug>` on every entry — objective slugs, project names, topic tags
- Level: ERROR = broke, WARNING = needs attention / mistakes, INFO = normal event, DEBUG = bulk import
- `-t`: `meeting`, `decision`, `task`, `note`, `correction`, `blocked`, `import` (or any custom string)
- `--project`: infer from context, ask if ambiguous

Messages: `<verb> <subject> — <outcome>` — one line, em-dash delimiter, outcome optional.
