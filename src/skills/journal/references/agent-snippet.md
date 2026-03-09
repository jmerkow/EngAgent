## Journal

Log events during conversations using the journal skill. One event per call, log immediately.

**When to log:** meetings, decisions, tasks, blockers, corrections, customer interactions.

**How:**
```bash
python <skill-path>/scripts/journal.py <LEVEL> -m "<message>" -t <type> --project <project>
```

Infer project from context. Use `--at` for past events. Levels: INFO (normal), WARNING (needs attention), ERROR (failure).
