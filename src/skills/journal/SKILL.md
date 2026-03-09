---
name: journal
description: Log work events to the journal. Use when capturing meetings, decisions, tasks, corrections, or any work activity. Also use when the user narrates what happened — extract events and log them.
---

# Work Journal

Append-only work event log using Python `logging`. Log during conversations via `scripts/journal.py`. Query with grep.

## Quick Start

```bash
# Single-project repo (most common) — logs to {journal-dir}/events.log
python <skill-path>/scripts/journal.py INFO -m "Weekly sync — agreed on Q3 timeline" -t meeting
python <skill-path>/scripts/journal.py WARNING -m "Dependency blocked for 2 weeks" -t blocked
python <skill-path>/scripts/journal.py INFO -m "Chose option B for API design" -t decision --tag architecture

# Hub repo tracking multiple projects — logs to {journal-dir}/{project}/events.log
python <skill-path>/scripts/journal.py INFO -m "Mars weekly sync" -t meeting --project ce
python <skill-path>/scripts/journal.py INFO -m "Package validation" -t task --project cxr-v2

# Query
grep "WARNING\|ERROR\|CRITICAL" <journal-dir>/events.log    # needs attention
grep "\[task\]" <journal-dir>/events.log                     # tasks
```

## Log Levels

| Level | Meaning |
|---|---|
| DEBUG | Automated imports, routine noise |
| INFO | Normal work events |
| WARNING | Needs attention — blocked, overdue, waiting |
| ERROR | System/tool failure |
| CRITICAL | Urgent — stop what you're doing |

## Event Types (`-t`)

Built-in: `meeting`, `decision`, `task`, `note`, `correction`, `blocked`, `import`. Any custom string also accepted.

## CLI Flags

| Flag | Required | Description |
|---|---|---|
| (positional) | yes | Log level |
| `-m, --message` | yes | Event description |
| `-t, --type` | no | Event type (default: `note`) |
| `--project` | no | Project subdirectory (omit for single-project repos) |
| `--entity` | no | Entity name (free text) |
| `--at` | no | When it happened (ISO datetime, default: now) |
| `--tag` | no | Repeatable tags |

## Configuration

The journal directory is resolved in this order:

1. **`.journal` file** in workspace root — one line, just the path (e.g., `.eng/journal`). Primary mechanism.
2. **`.eng/` directory** exists — uses `.eng/journal/`, writes `.journal` file to pin it.
3. **Fallback** — uses `.journals/`, writes `.journal` file to pin it.

On first use, if no `.journal` file exists, journal.py auto-detects and writes one so the path is stable going forward.

To change the journal location, edit `.journal`:
```
.journals
```

## Agent Conventions

- Log immediately during conversation — don't batch
- One event per call
- Use `--at` for past events
- Infer project from context; ask if ambiguous
- After logging, check stdout for push reminders and act on them

## When to Wire In Journaling

Guidance for prompt authors deciding whether their agent should include the journal `references/agent-snippet.md`:

- **Good fits**: agents handling meetings, customer conversations, status updates, planning sessions, retrospectives, decision-making, weekly reviews
- **Skip it**: pure code generation, linting, formatting, one-shot tasks with no decisions or context worth preserving
- **Litmus test**: "Would I want to search for this in 3 months?" — yes → journal it

## Sync & Backends

### File backend (always active)

Events write to `{journal-dir}/{project}/events.log`. When the journal lives inside `.eng/` and EngDirs is configured, events sync automatically via eng-push. One push = everything.

**Auto-commit**: After writing, if the journal directory is inside a git repo, journal.py runs `git add && git commit`. Events are captured in git history immediately without a manual step.

**Push reminder**: If unpushed commits exist, journal.py prints a reminder. The agent can act on it or surface it to the user.

### Cloud backend (future — Application Insights)

The Python `logging` handler architecture supports adding an `AzureLogHandler` for Application Insights. When configured, events go to the cloud on write — no push, no pull, queryable via KQL from any machine. File backend continues to run as a local backup.

Not built yet. The handler architecture makes it ~10 lines when the need is concrete.

## Related Skills

- **eng-push** — syncs `.eng/` (including journal when colocated) to EngDirs remote
- **eng-docs** — engineering documentation system (objectives, findings, retros)
