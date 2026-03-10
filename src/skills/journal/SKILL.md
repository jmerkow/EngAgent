---
name: journal
description: Log work events to the journal. Use when capturing meetings, decisions, tasks, corrections, or any work activity. Also use when the user narrates what happened — extract events and log them.
argument-hint: 'Tell me what happened...'
---

# Work Journal

Append-only work event log using Python `logging`. Log during conversations via `scripts/journal.py`. Query with grep.

## Quick Start

```bash
# Single event (commits immediately — existing behavior)
python <skill-path>/scripts/journal.py INFO -m "Weekly sync — agreed on Q3 timeline" -t meeting
python <skill-path>/scripts/journal.py WARNING -m "Dependency blocked for 2 weeks" -t blocked

# Batch mode (log several events, commit once at the end)
python <skill-path>/scripts/journal.py INFO -m "Agreed on Q3 timeline" -t decision --no-commit
python <skill-path>/scripts/journal.py INFO -m "Dependency blocked for 2 weeks" -t blocked --no-commit
python <skill-path>/scripts/journal.py commit -m "standup recap"

# Hub repo tracking multiple projects — logs to {journal-dir}/{project}/events.log
python <skill-path>/scripts/journal.py INFO -m "Mars weekly sync" -t meeting --project ce
python <skill-path>/scripts/journal.py INFO -m "Package validation" -t task --project cxr-v2

# Query
grep "WARNING\|ERROR\|CRITICAL" <journal-dir>/events.log    # needs attention
grep "\[task\]" <journal-dir>/events.log                     # tasks
```

## Log Levels

Evaluate top-down — first matching condition wins. Mistakes default to WARNING. See `references/heuristics.md` for full guidance.

| Level | Condition |
|---|---|
| CRITICAL | Urgent — demands immediate human attention |
| ERROR | Something failed or broke |
| WARNING | Needs attention within 24h |
| INFO | Normal progression or event |
| DEBUG | Automated import or bulk backfill |

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
| `--no-commit` | no | Skip git commit (use with `commit` subcommand for batch mode) |

### `commit` Subcommand

Commit all pending journal changes in one shot. Use after logging events with `--no-commit`.

```bash
python <skill-path>/scripts/journal.py commit                       # default message "batch update"
python <skill-path>/scripts/journal.py commit -m "standup recap"    # custom commit message
```

| Flag | Required | Description |
|---|---|---|
| `-m, --message` | no | Commit message (default: `batch update`) |
| `--project` | no | Project subdirectory (matches `--project` used during logging) |

## Configuration

The script auto-detects where to write on first use and remembers the choice. No manual setup needed.

To change the journal location later, edit the `.journal` file in the workspace root (one line, just the path):
```
.journals
```

## Agent Conventions

- **Single event**: Log and commit immediately (default behavior, no extra flags)
- **Multiple events in one turn** (2+): Use `--no-commit` on each event, then call `commit` once at the end — avoids creating a separate git commit per event
- One event per call
- Use `--at` for past events
- Infer project from context; ask if ambiguous
- After logging (or committing), check stdout for push reminders and act on them

**When to use `--no-commit`:** Any time you will log more than one event before the conversation moves on — recaps, meeting notes, importing past events, user narrating multiple things that happened. If in doubt and you know more events are coming, use `--no-commit`. You can always run `commit` at the end to flush.

## When to Wire In Journaling

Guidance for prompt authors deciding whether their agent should include the journal `references/agent-snippet.md`:

- **Good fits**: agents handling meetings, customer conversations, status updates, planning sessions, retrospectives, decision-making, weekly reviews
- **Skip it**: pure code generation, linting, formatting, one-shot tasks with no decisions or context worth preserving
- **Litmus test**: "Would I want to search for this in 3 months?" — yes → journal it

**Journal vs Timeline:** Journal captures cross-cutting summaries (≤1 line, tagged, greppable). Objective Timelines capture per-objective granular detail. Status changes and decisions go in both; minor events go in Timeline only. See `references/heuristics.md` for the full framework and domain onboarding.

## Sync & Backends

### File backend (always active)

Events write to `{journal-dir}/{project}/events.log`. When the journal lives inside `.eng/` and EngDirs is configured, events sync automatically via eng-push. One push = everything.

**Auto-commit**: After writing, if the journal directory is inside a git repo, journal.py runs `git add && git commit`. Events are captured in git history immediately without a manual step.

**Push reminder**: If unpushed commits exist, journal.py prints a reminder. The agent can act on it or surface it to the user.

## Related Skills

- **eng-push** — syncs `.eng/` (including journal when colocated) to EngDirs remote
- **eng-docs** — engineering documentation system (objectives, findings, retros)
