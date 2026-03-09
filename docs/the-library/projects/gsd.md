# GSD (Get Shit Done)

[`gsd-build/get-shit-done`](https://github.com/gsd-build/get-shit-done) | ~25k stars | MIT | Framework | Version 1.22.4 | Last verified: 2026-03-05
Platforms: Claude Code, OpenCode, Gemini CLI, Codex

> A meta-prompting and context engineering framework for AI-assisted development that solves context rot through fresh-context-per-task execution, phased workflows, and XML-structured plans. Originally built for Claude Code, with community ports to other platforms.
>
> **Key concepts:** fresh context per task, wave-based execution, planning lock, deviation rules, STATE.md persistence, XML task plans, context budget monitoring, model profiles

## Overview

GSD (by TÂCHES / glittercowboy) is a meta-prompting and context engineering framework that makes AI coding agents reliable for non-trivial projects. Its core thesis: **context rot — the quality degradation that happens as an agent fills its context window — is the primary failure mode of AI-assisted development.** GSD solves it by giving each task a fresh 200k-token context window with precisely the information it needs, nothing more [1].

The framework is opinionated about *how* agents work: phased execution (discuss → plan → execute → verify), atomic task plans in XML, wave-based parallel execution, and structured state files that carry knowledge across sessions. What the user sees is a handful of slash commands. Behind the scenes: context engineering, subagent orchestration, and state management [1].

GSD originally targeted Claude Code exclusively. As of v1.22, it natively supports Claude Code, OpenCode, Gemini CLI, and Codex via a unified installer (`npx get-shit-done-cc@latest`). Community ports extend it to other platforms (see [Ecosystem](#ecosystem) below), though VS Code Copilot is notably absent — GSD closed requests for Copilot support as "not planned" (issues #600, #679) [1].

```mermaid
flowchart LR
    subgraph Initialization
        NP["/gsd:new-project"]
        NP --> PROJECT["PROJECT.md"]
        NP --> REQ["REQUIREMENTS.md"]
        NP --> ROAD["ROADMAP.md"]
        NP --> STATE["STATE.md"]
    end

    subgraph Per-Phase Loop
        D["/gsd:discuss-phase N"] --> CTX["CONTEXT.md"]
        CTX --> P["/gsd:plan-phase N"]
        P --> PLAN["PLAN.md (XML tasks)"]
        PLAN --> E["/gsd:execute-phase N"]
        E --> SUM["SUMMARY.md"]
        SUM --> V["/gsd:verify-work N"]
    end

    Initialization --> Per-Phase Loop
```

Where Spec Kit tells agents *what to build* and Squad tells agents *who does what*, GSD tells agents *how to execute* — with engineering discipline that prevents the quality degradation most people experience with AI coding. The trade-off is platform lock-in: GSD's 84+ internal `@path` references, tool-specific commands, and subagent orchestration patterns are deeply coupled to Claude Code's `Task`, `Bash`, `Read`, and `Write` tools [1].

## The Fresh-Context-Per-Task Model

GSD's most important architectural decision is that **each task executes in a fresh context window**. The orchestrator spawns a subagent, gives it a single plan file and relevant project context, and that subagent works with a clean 200k-token budget. When it finishes, its context is discarded. The next task gets a fresh window [1].

This directly addresses the problem that most AI coding sessions degrade as context fills. GSD's context-monitor uses *remaining* context percentage [1]:

| Remaining Context | Status | GSD's Response |
|---|---|---|
| >35% remaining | Normal | Proceed without modification |
| ≤35% remaining | Warning | Compress context, use outlines |
| ≤25% remaining | Critical | Mandatory state dump, fresh session |

By keeping each task to 2–3 atomic operations (sized to complete well under 50%), GSD ensures executors always work in the peak-quality zone [1]. The orchestrator's context does accumulate over a session, but it carries only summaries and routing decisions — the heavy implementation work always happens in clean subagent contexts.

This is the opposite of Squad's approach, where persistent agents accumulate knowledge across sessions. GSD treats accumulated context as a liability; Squad treats it as an asset. Both models work — they optimize for different failure modes.

## Workflow Phases

GSD structures every project as a sequence of milestones, each containing ordered phases [1]. Each phase passes through four stages:

### Discuss

```
/gsd:discuss-phase N
```

The system analyzes the phase and surfaces gray areas — implementation decisions that affect the result but aren't specified in the requirements. For visual features: layout, density, interactions, empty states. For APIs: response format, error handling, verbosity. The output — a `CONTEXT.md` file — feeds directly into research and planning [1].

GSD captures user preferences using three boundary categories [1]:

- **Decisions** — locked. Agents must implement exactly as specified.
- **Agent's Discretion** — the agent chooses within these areas.
- **Deferred Ideas** — explicitly out of scope. Agents must not include them.

The explicit "agent's discretion" zone is a notable pattern — it prevents agents from asking about decisions that were deliberately left open.

### Plan

```
/gsd:plan-phase N
```

The system researches the domain (guided by `CONTEXT.md` decisions), creates 2–3 atomic task plans with XML structure, and verifies plans against requirements — looping until they pass. Each plan is sized to execute in a fresh context window [1].

Plans follow the **plan-as-prompt principle**: the plan document is directly consumable by the executing agent [1]. It doesn't get translated, summarized, or interpreted. The executor reads `PLAN.md` raw. This means plans must contain everything the executor needs — file paths, verification commands, done criteria — not just descriptions of work.

A planning lock enforces discipline: the system refuses to execute implementation commands until plan files exist and have been approved. In interactive mode, the user must explicitly approve the plan before any code is written. This is a hard gate, not a suggestion [1].

### Execute

```
/gsd:execute-phase N
```

Plans run in dependency-ordered waves. Independent plans execute in parallel; dependent plans wait for their prerequisites. Each task gets its own atomic git commit [1].

### Verify

```
/gsd:verify-work N
```

Automated verification checks that code exists and tests pass. Then the system walks the user through manual acceptance testing — extracting testable deliverables and checking each one. Failures spawn debug agents that create fix plans for immediate re-execution [1].

GSD's verification is **goal-backward**: it checks whether observable outcomes match the plan's `must_haves`, not whether tasks were completed [1]. The distinction matters — tasks can complete without achieving their goals (built the pieces but never wired them together).

## Wave-Based Parallel Execution

Plans are grouped into waves based on dependency analysis:

```
┌─────────────────────────────────────────────────────────────┐
│  WAVE 1 (parallel)       WAVE 2 (parallel)       WAVE 3    │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌───────┐│
│  │ Plan 01 │ │ Plan 02 │ │ Plan 03 │ │ Plan 04 │ │Plan 05││
│  │ User    │ │ Product │ │ Orders  │ │ Cart    │ │Checkout│
│  │ Model   │ │ Model   │ │ API     │ │ API     │ │ UI    ││
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └───────┘│
│       └───────────┴──────────┘           ↑           ↑     │
│              Dependencies flow forward                      │
└─────────────────────────────────────────────────────────────┘
```

- Independent plans → same wave → run in parallel
- Dependent plans → later wave → wait for prerequisites
- File conflicts → serialized within a single plan

Vertical slices (Plan 01: User feature end-to-end) parallelize better than horizontal layers (Plan 01: All models) because they minimize cross-plan file dependencies [1].

Each executor in a wave gets its own fresh context window. This means a 5-plan phase effectively uses ~1M total tokens (5 × 200k) with zero shared context bloat [1] — the same token multiplication strategy that Squad achieves through specialist agents.

## Deviation Rules

GSD codifies a 4-tier autonomy system for handling surprises during execution [1]:

| Rule | Trigger | Action | Human Input? |
|---|---|---|---|
| 1 | Bug — broken behavior, errors, type errors, race conditions, leaks | Auto-fix, document in summary | No |
| 2 | Missing critical — error handling, validation, auth, CSRF/CORS, rate limiting, indexes, logging | Auto-fix, document in summary | No |
| 3 | Blocker — missing deps, wrong types, broken imports, missing env/config, circular deps | Auto-fix, document in summary | No |
| 4 | Architectural — new DB table, schema change, new service, switching libs, breaking API | **Stop and ask the user** | Yes |

Only rule 4 requires human approval. Rules 1–3 give the agent pre-authorized freedom for routine deviations. This is deliberately permissive — the philosophy is that stopping to ask about every discovered bug destroys flow and wastes context. The safeguard is documentation: every auto-fix must be recorded in the task summary so the user sees what changed [1].

The 4-tier model is one of GSD's most practically useful patterns. GSD draws a clear line: bugs, security issues, and blockers are the agent's job; architectural changes are the user's call.

## Context Window Health Monitoring

GSD (and especially the Antigravity port) includes continuous context health monitoring based on *remaining* context percentage.

The monitoring is *continuous* rather than triggered — the system tracks consumption throughout execution, not just at specific checkpoints. The DEBUG.md template advises: "If evidence grows very large (10+ entries), consider whether you're going in circles" — encouraging agents to recognize circular debugging loops and dump state rather than persisting [1].

The Antigravity port adds dedicated skills for this: `token-budget` (track and manage usage), `context-compressor` (compress for efficiency), `context-fetch` (search-first loading), and `context-health-monitor` (detect quality degradation) [3].

## STATE.md and Session Persistence

`STATE.md` is GSD's cross-session memory file [1]. It tracks decisions, blockers, current position in the workflow, and what's next as structured markdown sections (Project Reference, Current Position, Performance Metrics, Accumulated Context, Session Continuity). It's updated after every task completion — the equivalent of an agent saving its game. Note: PLAN.md and DEBUG.md use YAML frontmatter, but STATE.md is plain markdown.

The session handoff flow:

- **`/gsd:pause-work`** — creates a structured state snapshot: current position, completed work, remaining work, decisions made, blockers, next action
- **`/gsd:resume-work`** — loads the snapshot to restore full context in a new session [1]

GSD-for-Copilot extended this pattern with `.continue-here.md` — a per-phase file that captures richer handoff state including a "vibe" field (one-line mood of the work) and an explicit "next action" pointer (exactly what to do first when resuming) [2]. This is the most novel addition in the Copilot port, addressing the common problem of returning to a session and not knowing where to start.

### Section-Level Mutability Rules

GSD's DEBUG.md template tags each section with a mutation policy via `<section_rules>`:

| Policy | Sections | Purpose |
|---|---|---|
| **OVERWRITE** | Status, current focus | Always reflects latest state |
| **APPEND-only** | Evidence, eliminated hypotheses, timeline | History preserved |
| **IMMUTABLE** | Original trigger, symptoms, spec once finalized | Reference point never changes |

This prevents agents from accidentally rewriting history when updating state [1]. The pattern is simple to implement and eliminates an entire class of state corruption bugs.

## XML Task Plans and the Plan-as-Prompt Principle

Every GSD task plan uses structured XML optimized for Claude's processing:

```xml
<task type="auto">
  <name>Create login endpoint</name>
  <files>src/app/api/auth/login/route.ts</files>
  <action>
    Use jose for JWT (not jsonwebtoken - CommonJS issues).
    Validate credentials against users table.
    Return httpOnly cookie on success.
  </action>
  <verify>curl -X POST localhost:3000/api/auth/login returns 200 + Set-Cookie</verify>
  <done>Valid credentials return cookie, invalid return 401</done>
</task>
```

Key fields: `<files>` (what to touch), `<action>` (what to do), `<verify>` (how to check), `<done>` (definition of done). The verification criteria are built into every task — the executor knows how to check its own work without additional instructions [1].

No translation layer, no summarization, no interpretation. This has two implications: (1) plans must be self-contained with all context an executor needs [1], and (2) the planning phase is effectively prompt engineering for the execution phase.

## Structured Returns for Orchestration

Every GSD agent returns a standardized status header that the orchestrator parses to decide next steps:

```
## PLANNING COMPLETE
## PLANNING INCONCLUSIVE
## VERIFICATION PASSED
## ISSUES FOUND
## CHECKPOINT REACHED
```

This convention enables reliable orchestration — the thin orchestrator doesn't need to read and interpret the full agent output. It pattern-matches the status line and routes accordingly [1].

## Model Profile System

GSD maps agent roles to model tiers, allowing users to balance quality against token cost:

| Profile | Planner | Executor | Verifier |
|---|---|---|---|
| **quality** | Opus | Opus | Sonnet |
| **balanced** (default) | Opus | Sonnet | Sonnet |
| **budget** | Sonnet | Sonnet | Haiku |

The insight: not all phases need the same model capability. Planning is reasoning-heavy and benefits from the strongest model. Execution is more mechanical. Verification needs less raw capability. Users switch profiles with `/gsd:set-profile <profile>` [1].

## Multi-Agent Orchestration

Every GSD stage uses the same orchestration pattern: a thin orchestrator spawns specialized agents, collects results, and routes to the next step.

| Stage | Orchestrator Role | Subagents |
|---|---|---|
| Research | Coordinates, presents findings | 4 parallel researchers (stack, features, architecture, pitfalls) |
| Planning | Validates, manages iteration | Planner creates plans, checker verifies, loop until pass |
| Execution | Groups into waves, tracks progress | Executors implement in parallel, each with fresh context |
| Verification | Presents results, routes next | Verifier checks goals, debuggers diagnose failures |

The orchestrator never does heavy lifting. It stays lean — carrying only summaries and routing decisions, well below the context warning threshold — while the real work happens in fresh subagent contexts. This is how GSD scales to large phases without degradation [1].

## Ecosystem

GSD started as a Claude Code-only tool. As it gained popularity, community ports emerged for other platforms; several have since been absorbed into the main project as native runtimes.

| Project | Platform | Status | License | Stars |
|---|---|---|---|---|
| [get-shit-done](https://github.com/gsd-build/get-shit-done) | Claude Code, OpenCode, Gemini CLI, Codex | Active (v1.22.4) | MIT | ~25k |
| [GSD-for-Copilot](https://github.com/Punal100/get-stuff-done-for-github-copilot) | VS Code Copilot | Archived (Feb 8, 2026) | MIT | 75 |
| [GSD-Antigravity](https://github.com/toonight/get-shit-done-for-antigravity) | Model-agnostic | Active | MIT | ~560 |
| gsd-opencode | OpenCode | Absorbed into main project | — | — |
| gsd-gemini | Gemini CLI | Absorbed into main project (archived) | — | — |

**GSD-for-Copilot** (by Punal Manalan, 16 contributors) was a faithful translation of GSD concepts into VS Code Copilot's customization system: 11 agents, 27 prompts, 12 skills, 9 instructions [2]. Its most notable structural insight: **no orchestrator agent**. Prompt files serve as orchestrators (~15% context), while agent files are fat workers with domain expertise [2]. It was ported via an intermediate Kilo Code adaptation by the same author [4]. Now archived and read-only.

**GSD-Antigravity** (by toonight) took a different approach: rewrite GSD to be fully model-agnostic [3]. A single `PROJECT_RULES.md` contains canonical rules; optional `adapters/CLAUDE.md`, `adapters/GEMINI.md`, and `adapters/GPT_OSS.md` add model-specific enhancements. It also introduced token-budget skills and search-first mode with helper scripts — patterns that have influenced the main GSD project [3].

### VS Code Copilot Compatibility

GSD does not support VS Code Copilot natively. The gap is structural, not cosmetic:

- 84+ `@path` references need rewriting for Copilot's tool surface [1]
- Claude Code's `Task` tool maps to Copilot's `runSubagent`, but orchestration patterns differ
- No global install mechanism — GSD uses `npx` which targets Claude Code's slash command system
- Hook patterns differ — Claude Code hooks are prompt-based; Copilot hooks are code-based

One user reported getting ~80% functionality working manually (issue #76), but the project closed Copilot support requests as "not planned" [1]. The GSD-for-Copilot port was the community's response, but its archival in February 2026 left no actively maintained Copilot path [2].

## Configuration

GSD offers project-level settings (mode, granularity, workflow toggles, parallelization, git branching) configurable during `/gsd:new-project` or via `/gsd:settings` [5]. See the [GSD User Guide](https://github.com/gsd-build/get-shit-done/blob/main/docs/USER-GUIDE.md) for the full configuration reference.

## References

[1] [GSD repository](https://github.com/gsd-build/get-shit-done) — original project by TÂCHES (~25k stars, MIT, actively maintained)
[2] [GSD-for-Copilot](https://github.com/Punal100/get-stuff-done-for-github-copilot) — archived MIT port for VS Code Copilot (75 stars, 16 contributors, archived Feb 2026)
[3] [GSD-Antigravity](https://github.com/toonight/get-shit-done-for-antigravity) — model-agnostic port with adapter pattern (~560 stars, MIT)
[4] [GSD-for-Kilo Code](https://github.com/punal100/get-stuff-done-for-kilocode) — intermediate port that the Copilot version was based on
[5] [GSD User Guide](https://github.com/gsd-build/get-shit-done/blob/main/docs/USER-GUIDE.md) — full configuration reference and workflow documentation

## See Also

- [Spec Kit](spec-kit.md) — agent-agnostic specification tool (complementary: define what to build, hand off to GSD-style execution)
- [Squad](squad.md) — contrasting approach: persistent specialists vs. GSD's fresh-context disposable executors
- [Delegation and Subagents](../patterns/delegation-and-subagents.md) — cross-framework delegation patterns, including GSD's thin-orchestrator model
- [Context and Persistence](../patterns/context-and-persistence.md) — how frameworks handle state, including GSD's STATE.md and context budget monitoring
- [Behavioral Rules](../patterns/behavioral-rules.md) — autonomy and constraint patterns, including GSD's deviation rules and planning lock
- [Claude Cookbooks](claude-cookbooks.md) — Anthropic's cookbook with sub-agent patterns, slash commands, and tool restrictions
- [Awesome Copilot](copilot-awesome.md) — community marketplace of Copilot agents, instructions, skills, and plugins
- [Subagents and Delegation](../platforms/copilot/subagents-and-delegation.md) — VS Code Copilot subagent mechanics and scope control
