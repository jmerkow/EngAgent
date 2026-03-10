# Journal Heuristics — Reference

For prompt/agent authors and domain onboarding. Not loaded during normal agent operation — see `agent-snippet.md` for the operational snippet.

## How It Works

Two layers: (1) **conventions** below that apply to every domain, and (2) **domain mappings** written into agent files that define when to journal. The eng mapping (§4) ships here. Other domains create their own via the onboarding questionnaire (§3).

---

## 1. Message Shape

`<verb> <subject> — <outcome/context>`

Em-dash delimiter. Outcome optional. One line. Plain words for grepability.

```
Approved design for cache layer — 6 decisions
Blocked on API response — waiting on external team
Completed T3 data migration — 12K rows, no errors
Started implementation phase
```

---

## 2. Level Selection

Top-down — first matching condition wins.

| Condition | Level |
|---|---|
| Urgent — demands immediate human attention | CRITICAL |
| Something failed or broke | ERROR |
| Needs attention within 24h | WARNING |
| Normal progression or event | INFO |
| Automated import or bulk backfill | DEBUG |

Mistakes default to WARNING. CRITICAL is rare and typically user-initiated.

---

## 3. Domain Onboarding

To adopt journaling for a new domain: identify the domain's events, map them to types + levels, write the mapping into agent files. The `/journal` prompt automates this.

Built-in types: `meeting`, `decision`, `task`, `note`, `correction`, `blocked`, `import`. Any custom string also accepted — keep short and greppable. Think about which types map naturally to your domain's events before inventing new ones.

**Questionnaire** (ask per domain, not per agent):

1. What are your domain's key lifecycle phases?
2. What events mark transitions between phases?
3. What decisions need to be discoverable later?
4. What failures or blockers occur?
5. What recurring events happen?

**Worked example** — data science pipeline:

| Trigger | Type | Level |
|---|---|---|
| Model selected for promotion | `decision` | INFO |
| Pipeline failed | `blocked` | ERROR |
| Data quality anomaly detected | `correction` | WARNING |

---

## 4. Eng Domain Mapping

For **top-level eng agents** (`eng`, `eng-plan`, `eng-code`, `eng-research`). Sub-agents don't journal — parents capture outcomes.

**Journal** (cross-cutting, passes the 3-month grep test):
- Status changes, gate pass/fail, design decisions locked, phase completions
- Mistakes, blocks/unblocks, delegation PARTIAL or BLOCKED
- Retros conducted, new objectives created

**Timeline only** (too granular for journal — summarize at phase boundaries):
- Individual task start/complete, delegation COMPLETE, review findings

Tag every journal entry with `--tag <objective-slug>`.
