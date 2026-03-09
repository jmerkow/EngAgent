---
title: Delegation and Subagents
description: Cross-framework patterns for multi-agent delegation — thin orchestrators, context isolation, structured returns, prompt design, parallel fan-out, tool restriction cascading, and anti-patterns. Grounded in GSD, Squad, Anthropic, and VS Code Copilot implementations.
topics: [delegation, subagents, orchestration, thin-orchestrator, context-isolation, structured-returns, parallel-execution, coordinator-pattern]
---

# Delegation and Subagents

> **Topics:** delegation, subagents, orchestration, thin orchestrator, context isolation, structured returns, parallel execution
> **Useful when:** designing multi-agent workflows, deciding when to delegate vs. answer directly, structuring delegation prompts, building coordinator agents, managing tool permissions across agent hierarchies, preventing delegation anti-patterns
> **Key concepts:** thin orchestrator, fat workers, context isolation boundary, structured status protocol (COMPLETE/PARTIAL/BLOCKED), delegation prompt template, response mode tiering, wave-based execution, file authorization, tool restriction cascading

## Overview

Every multi-agent framework faces the same core question: **when should an agent do work itself, and when should it delegate?** The ecosystem has converged on a small set of patterns that answer this question, differing mainly in how aggressively they delegate and how they manage context across the delegation boundary.

This document catalogs cross-framework delegation patterns grounded in concrete implementations. The patterns come from five primary sources:

- **GSD** (~25k stars) — fresh-context-per-task execution with thin orchestrators and wave-based parallelism. See [GSD](../frameworks/gsd.md).
- **Squad** (~660 stars) — persistent specialist teams coordinated by a thin routing layer. See [Squad](../frameworks/squad.md).
- **Anthropic** ("Building Effective Agents") — architectural patterns for routing, parallelization, and orchestrator-workers.
- **VS Code Copilot** — the `agent/runSubagent` tool, context isolation boundary, and hook-based context injection. See [Subagents and Delegation](../vscode/subagents-and-delegation.md).
- **CrewAI** (v1.10) — typed state pipelines, `@router` runtime classification, and hierarchical process orchestration.

The patterns cluster into three areas: **coordinator models** (how the orchestrator relates to its workers), **context management** (what crosses the delegation boundary), and **execution strategies** (when and how to fan out work).

## The Thin-Orchestrator Pattern

The highest-signal pattern across the ecosystem: **the orchestrator routes and synthesizes but never does heavy work itself.**

```mermaid
flowchart LR
    subgraph Workers ["Fresh-Context Workers"]
        direction TB
        W1["Worker A<br/>clean 200K window"]
        W2["Worker B<br/>clean 200K window"]
        W3["Worker C<br/>clean 200K window"]
    end

    Orchestrator --> W1 & W2 & W3
    W1 & W2 & W3 --> Orchestrator
```

The orchestrator holds routing logic, delegates work, and synthesizes results. It consumes minimal context — Squad's coordinator is deliberately lightweight, leaving the bulk of the 200K window for workers. Workers are specialized agents, each with a clean context window. The heavy implementation work always happens in worker contexts.

**GSD's implementation:** Prompts serve as orchestrators (~15% context). Agent files are fat workers with domain expertise. Four parallel researchers fan out for research; a planner creates atomic task plans; executors run in dependency-ordered waves; a verifier checks results. The orchestrator stays at 30–40% context usage while workers consume fresh 200K windows. ([GSD](../frameworks/gsd.md))

**Squad's implementation:** The coordinator agent (`squad.agent.md`) holds seven routing rules and agent charters. It delegates to named specialists (lead, frontend, backend, tester, scribe), each running in their own 200K context window. Fanning out to 5 agents effectively gives ~1M total tokens with zero shared context bloat. ([Squad](../frameworks/squad.md))

**Anthropic's framing:** The orchestrator-workers pattern is one of five architectural patterns in "Building Effective Agents." The orchestrator generates subtask prompts, delegates to workers, and synthesizes results. Workers can be different models — Opus for reasoning-heavy work, Haiku for mechanized tasks.

**The threshold rule.** GSD's practical heuristic: "For tasks with 3+ distinct subtasks, consider spawning subagents with fresh context." This isn't a hard rule — it's a signal. The stronger signal that you *should* have delegated: the parent starts forgetting earlier decisions, repeating research, or producing lower-quality output (context degradation at 50–70% usage).

### Thin Routing vs. Fat Orchestration

Not all coordinator patterns are thin. The ecosystem shows two distinct models:

| Model | Context cost | Who does the thinking | Frameworks |
|---|---|---|---|
| **Thin routing** | ~13–15% | Workers hold domain expertise | Squad, GSD, Anthropic |
| **Fat orchestration** | ~40–60% | Orchestrator holds expertise, delegates execution | shariqriazz, dhar174 |

In **thin routing**, the coordinator is a switchboard — it matches tasks to agents and merges results. In **fat orchestration**, the coordinator reasons about the problem, generates detailed task prompts, and controls the workflow end-to-end. Workers are mechanized: they execute what they're told.

The ecosystem consensus favors thin routing. Fat orchestrators accumulate context faster, degrade earlier, and create a single point of failure. The trade-off: thin routing requires more upfront agent design (charters, tool restrictions, clear boundaries) because the coordinator can't compensate at runtime.

**Warning against over-orchestration.** For single-developer workflows on short tasks, the coordination overhead of a full multi-agent system often exceeds the benefit. Start with behavioral rules in a single agent ("delegate when you have 3+ independent subtasks"), add a dedicated research subagent, and only build full coordinator patterns when the simpler approaches prove insufficient.

## Context Isolation

The delegation boundary is a **hard context wall**. Understanding what crosses it — and what doesn't — is fundamental to writing effective delegation prompts.

### What Crosses the Boundary

In VS Code Copilot's subagent system:

| Crosses to subagent | Does NOT cross |
|---|---|
| The task prompt from the parent | Conversation history |
| `additionalContext` from SubagentStart hook | Parent agent's `.agent.md` instructions |
| Named agent's own instructions (if using a custom agent) | `.instructions.md` files from the parent session |
| Named agent's own tools/model config | `copilot-instructions.md` from the workspace |
| | Results from sibling subagents |

| Crosses back to parent | Does NOT cross back |
|---|---|
| Final result summary | Intermediate tool calls |
| | Files read during exploration |
| | Dead ends and failed approaches |

This means a subagent that explores 50 files and hits 3 dead ends returns a 200-token summary, not 50K tokens of exploration noise. The context boundary is both the primary feature (clean context per subtask) and the primary constraint (subagents are blind to everything the parent knows unless explicitly told).

### Fresh Context Per Task (GSD) vs. Persistent Specialists (Squad)

The two dominant context models in the ecosystem represent opposing philosophies:

```mermaid
flowchart LR
    subgraph GSD ["GSD: Fresh Context Per Task"]
        direction TB
        O1["Orchestrator"] --> T1["Task 1<br/>fresh 200K"]
        O1 --> T2["Task 2<br/>fresh 200K"]
        O1 --> T3["Task 3<br/>fresh 200K"]
        T1 -. "context discarded" .-> X1["×"]
        T2 -. "context discarded" .-> X2["×"]
    end

    subgraph Squad ["Squad: Persistent Specialists"]
        direction TB
        O2["Coordinator"] --> S1["Frontend<br/>history.md"]
        O2 --> S2["Backend<br/>history.md"]
        O2 --> S3["Tester<br/>history.md"]
        S1 -. "knowledge persists" .-> S1
        S2 -. "knowledge persists" .-> S2
    end
```

**GSD** treats accumulated context as a liability. Each executor gets a fresh 200K-token window with precisely the information it needs. Quality stays high (well above the 35%-remaining warning zone). The trade-off: no learning across tasks. Every executor starts cold. ([GSD](../frameworks/gsd.md))

**Squad** treats accumulated context as an asset. Each specialist writes what they learned to `history.md` after every session. Decisions accumulate in `decisions.md`. Skills emerge from real work. The trade-off: memory systems bloat over time — Squad mitigates this with Scribe-enforced limits and the `squad nap` hygiene command. ([Squad](../frameworks/squad.md))

Both models work. GSD optimizes against **context rot**. Squad optimizes against **cold starts** (the cost of re-establishing context every session). Choose based on your dominant failure mode.

### Context Injection via Hooks

VS Code's SubagentStart hook (Preview) bridges the isolation gap. A hook script fires when a subagent spawns and injects `additionalContext` — project state, coding conventions, active objectives — into the subagent's context. This directly addresses the "subagent hallucination problem": subagents making decisions without project context.

Squad achieves the same effect structurally: every agent reads `decisions.md` before starting work, because each spawn gets a fresh context with `decisions.md` loaded. GSD achieves it through plan-as-prompt: the plan document *is* the executor's prompt, containing all context the executor needs.

The approaches converge on the same principle: **context must be explicitly injected at delegation time**. Relying on inherited context, shared memory, or "the agent will figure it out" produces hallucinations.

## Structured Returns

No framework enforces structure on subagent output. The fix is a **prompt convention** that every framework has independently converged on.

### The Status Protocol

GSD's convention, widely adopted across the ecosystem:

```
## COMPLETE
## BLOCKED: {reason}
## NEEDS REVIEW: {what}
```

The parent checks for this status line to decide next steps without re-reading the full report. EngAgent extends this to a three-value protocol:

| Status | Meaning | Parent's response |
|---|---|---|
| `COMPLETE` | Task finished, results reliable | Accept, proceed |
| `PARTIAL: {what's missing}` | >66% confident, some gaps | Accept with noted gaps |
| `BLOCKED: {reason}` | Cannot proceed | Spawn refined sub (never retry same prompt) |

GSD uses phase-specific headers (`PLANNING COMPLETE`, `VERIFICATION PASSED`, `ISSUES FOUND`) that the orchestrator pattern-matches for routing. Squad relies on the coordinator interpreting results in context. CrewAI uses typed Pydantic `BaseModel` outputs — the most structured approach, but requiring code infrastructure.

### Aggregation After Parallel Execution

When multiple subagents return results, the parent must aggregate. Three models from the ecosystem:

| Model | Source | Mechanism |
|---|---|---|
| **Programmatic merge** | Anthropic | Parent code stitches results or votes across them. No LLM involved in aggregation. |
| **Dedicated synthesizer** | GSD | A synthesizer agent consumes all parallel results and produces unified output. Intermediate file artifacts serve as structured interchange. |
| **Typed state accumulation** | CrewAI | Pydantic `BaseModel` state flows through a pipeline. `and_` operator waits for all parallel results. Each step's output is typed and accessible. |

The practical protocol after all subagents report: (a) identify agreements across results, (b) flag contradictions, (c) note gaps no subagent covered. This applies regardless of which mechanical aggregation model you use.

## Delegation Prompt Structure

The hardest part of delegation is writing prompts that work without shared context. The ecosystem has converged on a five-part template:

### The Template

```
1. Task:         What to investigate or produce
2. Entry points: Relevant file paths, URLs, or starting locations
3. Context:      Key facts the subagent needs (conventions, constraints, active objective)
4. Deliverable:  Expected output format and sections
5. Budget:       Tool call limit (5-15 for research subtasks)
```

**Entry points** replace implicit references. Instead of "research the auth pattern we discussed earlier" (the subagent has no "earlier"), you say "research the authentication pattern in `src/auth/`, specifically how JWT tokens are validated in `middleware/auth.ts`."

**File authorization** scopes the subagent's attention. Squad's orchestration log includes "Files authorized to read" and "Files agent must produce." GSD's XML task plans use `<files>` tags listing exactly which files each task touches. Both are behavioral — no framework enforces file-level access control at runtime — but they sharply reduce scope wandering.

**Budget** is a self-reporting convention. No framework implements per-agent tool call budgets mechanically. The convention: "Use 5–15 tool calls. If you hit 15 without high confidence, report what you found and what's uncertain — don't keep going." This is ahead of the ecosystem — most frameworks use the context window itself as the implicit budget.

### Example Delegation Prompt

```markdown
**Task:** Investigate how the codebase handles error propagation from API
routes to the client.

**Entry points:**
- `src/api/routes/` — route handlers
- `src/middleware/error.ts` — error middleware
- `src/types/errors.ts` — error type definitions

**Context:** The project uses Express with TypeScript. Errors should use
the `AppError` class from `src/types/errors.ts`. We suspect some routes
throw raw strings instead.

**Deliverable:** Return with sections:
- ## Summary (3-5 sentences)
- ## Findings (file-by-file analysis with evidence)
- ## Violations (routes not using AppError, with line numbers)
- ## Status: COMPLETE | BLOCKED: {reason}

**Budget:** 10 tool calls maximum.
```

## Response Mode Tiering

Not every request deserves a full multi-agent spawn. Squad formalizes this with four tiers:

| Mode | Latency | Behavior | Example |
|---|---|---|---|
| **Direct** | ~2–3s | Coordinator answers from memory | "What port does the server run on?" |
| **Lightweight** | ~8–12s | One agent, minimal prompt | "Add a TODO comment to auth.ts" |
| **Standard** | ~25–35s | Full agent spawn with context | "Implement the login endpoint" |
| **Full** | ~40–60s | Multi-agent parallel spawn | "Build the user dashboard feature" |

The critical insight is **Rule 3: Quick facts → answer directly.** Don't spawn an agent for something the coordinator already knows.

Anthropic's routing pattern achieves the same effect architecturally: a classifier routes easy queries to a lower-cost model for direct response, while complex queries go to a higher-cost orchestration pipeline. GSD's "quick mode" is the opt-out — skip research, planning, and verification for simple changes.

The tiering heuristic maps cleanly to research workflows:

| Classification | Workflow | Subagents |
|---|---|---|
| **Straightforward** | Answer directly, no artifacts | 0 (0–2 tool calls) |
| **Depth-first** | Standard investigation | 1–2 (5–10 tool calls total) |
| **Breadth-first** | Parallel fan-out, comprehensive | 3–5 (15+ tool calls across subs) |

## Parallel Execution Models

### Wave-Based Execution (GSD)

GSD groups task plans into waves based on dependency analysis:

```
Wave 1 (parallel)        Wave 2 (parallel)       Wave 3 (serial)
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ Plan 01  │ │ Plan 02  │ │ Plan 03  │ │ Plan 04  │ │ Plan 05  │
│ User     │ │ Product  │ │ Orders   │ │ Cart     │ │ Checkout │
│ Model    │ │ Model    │ │ API      │ │ API      │ │ UI       │
└──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘
     └────────────┴───────────┘            ↑             ↑
            Dependencies flow forward
```

Independent plans run in the same wave (parallel). Dependent plans wait in later waves. File conflicts serialize within a single plan. Each executor gets a fresh context window — a 5-plan wave effectively uses ~1M total tokens (5 × 200K) with zero shared context bloat.

Wave-based execution is **conservative parallelism**: analyze dependencies upfront, group into ordered waves, serialize when uncertain. It sacrifices some throughput for safety.

### Eager Fan-Out (Squad)

Squad defaults to launching all independent agents simultaneously without upfront wave analysis. The coordinator does live dependency analysis, fans out independent work immediately, and serializes only when data dependencies exist. Deadlock detection catches circular dependencies.

Eager fan-out is **aggressive parallelism**: start everything that *could* be independent, handle conflicts as they arise. It maximizes throughput but requires reliable structured returns and conflict resolution (Squad's decisions inbox handles concurrent writes).

### Multi-Perspective Fan-Out (Anthropic / VS Code)

A specialized parallel pattern: multiple subagents analyze the same artifact from different perspectives with no anchoring between them.

```yaml
# VS Code multi-perspective review pattern
---
name: Thorough Reviewer
tools: ['agent', 'read', 'search']
---
Run each perspective as a parallel subagent:
- Correctness reviewer: logic errors, edge cases, type issues
- Code quality reviewer: readability, naming, duplication
- Security reviewer: input validation, injection risks
- Architecture reviewer: codebase patterns, design consistency
```

Context isolation is a feature here: each reviewer starts fresh, with no bias from other reviewers' findings. The orchestrator synthesizes independent results into a prioritized summary. This same pattern works for research fan-out (parallel exploration of independent sub-questions) and document review (parallel check of different quality dimensions).

## Tool Restriction Cascading

Permissions flow downward through the delegation hierarchy via the `tools` field in agent frontmatter:

```mermaid
flowchart TB
    C["Coordinator<br/>tools: agent, edit, search, read"]
    P["Planner<br/>tools: read, search"]
    I["Implementer<br/>tools: edit, read, search"]
    R["Reviewer<br/>tools: read, search"]

    C -->|plan task| P
    C -->|code task| I
    C -->|review task| R

    style P fill:#e8f5e9
    style R fill:#e8f5e9
    style I fill:#fff3e0
```

Workers with read-only tools (`read`, `search`) can't accidentally modify files during research. Workers with narrow scope can use faster, cheaper models since they have focused tasks. GSD maps this to model profiles: planners get the strongest model (Opus), executors get a capable model (Sonnet), verifiers get the cheapest (Haiku).

The `agents` field on a coordinator restricts which named agents it can spawn as subagents. Setting `agents: ['Planner', 'Implementer']` means the coordinator can only delegate to those two — not to arbitrary agents. Combined with `disable-model-invocation: true` on workers, this creates "protected" agents accessible only through explicit whitelisting.

**No file-level enforcement exists.** All surveyed frameworks (GSD, Squad, dhar174, VS Code) use behavioral file authorization — the delegation prompt says which files to touch, but nothing prevents the subagent from reading or writing elsewhere. File authorization is guidance, not a security boundary.

## Nesting Depth

**Consensus: two levels maximum.** All frameworks avoid deep recursion:

| Framework | Maximum depth | Mechanism |
|---|---|---|
| GSD | 2 (orchestrator → executor) | Architectural — never nests deeper |
| CrewAI | 2–3 (Flow → Crew → agents) | Flat by design, no depth limit |
| Anthropic | 1 (all patterns single-level) | Documented patterns are flat |
| VS Code | Undocumented | No stated limit, but nesting is untested |

The practical rule: coordinator → worker is the standard pattern. Worker → sub-worker adds uncontrolled depth, makes debugging difficult, and compounds context isolation problems. If a worker's task is too complex for a single agent, decompose it at the coordinator level, not the worker level.

## Delegation Trigger Heuristics

When should a coordinator delegate instead of doing work inline? Four tests from the ecosystem:

| Test | Question | Source |
|---|---|---|
| **Subtask count** | Are there 3+ distinct independent subtasks? | GSD threshold rule |
| **Context budget** | Would this task exceed 30–40% of the parent's remaining context? | GSD quality curve, Squad context audit |
| **Independence** | Can subtasks be enumerated upfront? Are they independent? | Anthropic predictability test |
| **Perspective** | Does this benefit from multiple independent viewpoints? | Anthropic parallelization pattern |

If any test returns yes, delegation is likely the right call. If all return no, do the work inline.

**GSD's always-delegate philosophy:** GSD delegates by default. Quick mode (skip research/planning/verification) is the opt-out. This works because GSD is designed around delegation — the entire framework is orchestration infrastructure.

**Squad's quick-facts exception:** Rule 3 — "don't spawn an agent for 'what port does the server run on?'" The coordinator answers from memory when delegation overhead exceeds task complexity.

## Anti-Patterns

### Over-Delegation

**Symptom:** Every request spawns subagents, even trivial ones. Simple factual questions take 30+ seconds because they route through the full multi-agent pipeline.

**Root cause:** No response tiering. The coordinator treats all requests as complex.

**Fix:** Implement the quick-facts rule: if the coordinator can answer in 2–3 seconds from existing context, answer directly. Only delegate when the task genuinely benefits from context isolation or parallel processing.

### Under-Contexting

**Symptom:** Subagents produce hallucinated results, ignore project conventions, or explore irrelevant code. The parent has to discard results and retry.

**Root cause:** Delegation prompts use implicit references ("fix the bug we discussed") or omit conventions, file paths, and constraints. The subagent fills gaps with guesses.

**Fix:** Use the five-part delegation prompt template. Every delegation prompt must include task, entry points, context, deliverable format, and budget. If a SubagentStart hook is available, inject project conventions there as a supplementary layer.

### Circular Delegation

**Symptom:** Agent A delegates to Agent B, which delegates back to Agent A (or to Agent C which delegates to Agent A). Context is consumed with no progress.

**Root cause:** No nesting depth cap. Workers can spawn their own subagents without constraint.

**Fix:** Cap nesting at two levels. Leaf-level workers should have `agents: []` in their frontmatter (no subagent spawning allowed). Only coordinators should have the `agent` tool.

### Retry-Same-Prompt

**Symptom:** A subagent returns BLOCKED. The parent retries with the identical prompt. The subagent hits the same block.

**Root cause:** No error handling protocol for delegation failures.

**Fix:** GSD's pattern: on failure, a debugger agent diagnoses the problem and produces a fix plan. The executor retries with the *new* plan, not the original. Squad's variant: rejected work routes to a *different* agent. The minimum viable protocol: if BLOCKED, spawn a second sub with a *refined* question incorporating what the first sub reported. Never retry the exact same prompt.

### Orchestrator Bloat

**Symptom:** The coordinator's context fills up because it holds too much state — detailed task histories, full subagent results, accumulated decisions. Quality degrades.

**Root cause:** The orchestrator is fat, not thin. It retains information that should stay in workers' contexts.

**Fix:** Keep the orchestrator thin: routing logic + result summaries only. Full exploration, file contents, and intermediate reasoning stay in worker contexts and are discarded. Squad's coordinator targets 13% of the 200K context window. GSD's orchestrators target 30–40%.

## Quick Reference

| Pattern | What it is | Key frameworks |
|---|---|---|
| Thin orchestrator | Coordinator routes and synthesizes, never does heavy work | GSD, Squad, Anthropic |
| Fresh context per task | Each worker gets a clean context window | GSD, VS Code subagents |
| Persistent specialists | Workers accumulate knowledge across sessions | Squad |
| Structured status returns | `COMPLETE` / `BLOCKED` / `PARTIAL` ending every subagent response | GSD, EngAgent |
| Five-part delegation prompt | Task, entry points, context, deliverable, budget | GSD (XML plans), Squad (orchestration log) |
| Response mode tiering | Direct / lightweight / standard / full based on request weight | Squad |
| Wave-based execution | Dependency-ordered parallel waves | GSD |
| Eager fan-out | Spawn all independent agents immediately | Squad |
| Multi-perspective fan-out | Parallel subagents with independent viewpoints, no anchoring | Anthropic, VS Code |
| Tool restriction cascading | Read-only workers, edit workers, coordinator with `agent` tool | VS Code, GSD (model profiles) |
| File authorization | Behavioral file-level scoping in delegation prompts | Squad, GSD |
| Two-level nesting cap | Coordinator → worker maximum depth | GSD, ecosystem consensus |
| Quick-facts direct answer | Coordinator answers trivially from memory, no delegation | Squad Rule 3 |

## References

- [Anthropic, "Building Effective Agents"](https://anthropic.com/engineering/building-effective-agents) — architectural patterns for routing, parallelization, and orchestrator-workers
- [GSD repository](https://github.com/gsd-build/get-shit-done) — fresh-context execution framework (~25k stars, MIT)
- [Squad repository](https://github.com/bradygaster/squad) — persistent specialist teams for GitHub Copilot (~660 stars, MIT)
- [CrewAI documentation](https://docs.crewai.com/concepts/flows) — Flows, Crews, `@router`, typed state pipelines
- [VS Code Subagents documentation](https://code.visualstudio.com/docs/copilot/agents/subagents) — official docs for the `agent/runSubagent` tool
- [VS Code Custom Agents](https://code.visualstudio.com/docs/copilot/customization/custom-agents) — agent frontmatter, `agents` field, `tools` field

## See Also

- [GSD](../frameworks/gsd.md) — deep dive on fresh-context-per-task execution, wave parallelism, deviation rules, and model profiles
- [Squad](../frameworks/squad.md) — deep dive on persistent specialists, memory system, reviewer protocol, and Ralph
- [Subagents and Delegation](../vscode/subagents-and-delegation.md) — VS Code Copilot-specific mechanics: `runSubagent` tool, hook integration, scope control
- [context-and-persistence.md](context-and-persistence.md) — how frameworks handle state across sessions and delegation boundaries
- [behavioral-rules.md](behavioral-rules.md) — autonomy zones, deviation rules, and constraint patterns that govern delegated agents
