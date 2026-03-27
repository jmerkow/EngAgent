---
name: eng-orchestration
description: Delegation conventions for parent agents using subagents. Covers when to delegate, prompt structure, result handling, effort calibration, and the COMPLETE/PARTIAL/BLOCKED status protocol. Load before delegating to subagents.
---

# Orchestration Conventions

Conventions for parent agents delegating work to subagents via `runSubagent`. Load this skill before your first delegation in a session.

## When to Delegate

Delegate when the work is **independent** and **context-separable** — the subagent can finish without your live working memory.

**Good delegation targets:**
- Research sub-questions with clear entry points
- Multi-file exploration where raw reads would bloat the parent context
- File edits where task, scope, and pattern are already defined
- Synthesis of `.eng/` content that is already written down
- Parallel investigations across different parts of the codebase

Rule of thumb: if you can write a self-contained prompt without restating your entire working state, delegate it.

## In-Parent Work

These stay in the parent, never delegated:

1. **Unexternalized decisions** — anything decided in conversation but not yet written to `.eng/`
2. **Single-file reads at known paths** — the active objective, one design decision, one template, one known config file
3. **Small known-location edits (<=2 files)** — task checkbox, Timeline entry, Parking Lot append, typo fix
4. **Status transitions and gate judgments** — the parent owns lifecycle state
5. **User-facing clarification** — asking questions, disambiguating intent, confirming trade-offs
6. **Task sequencing** — deciding what to do next and ordering subtasks

Everything else — multi-file exploration, research, coding, and synthesis of externalized content — should usually be delegated when the prompt can be self-contained.

## Delegation Patterns

### Pattern: context-heavy exploration
Use a subagent when the parent would otherwise need to read many files just to answer one focused question.

```text
- Task: Trace how status transitions are handled across eng agents
- Entry points: src/agents/eng.agent.md, src/agents/eng-plan.agent.md, src/agents/eng-code.agent.md
- Context: Active objective is tightening workflow discipline; only report status-related behavior
- Deliverable: Per-file summary plus contradictions, with file paths
```

### Pattern: focused edit with known entry points
Use a subagent when the implementation target is already known and the deliverable is narrow.

```text
- Task: Update mistake trigger terminology in eng-docs skill files only
- Entry points: src/skills/eng-docs/SKILL.md, src/skills/eng-docs/references/mistake-template.md
- Context: Prompt-era mistake-capture naming is being removed; use the new mistake-capture wording
- Deliverable: Updated files plus a short summary of what changed
```

### Pattern: externalized synthesis
Use a subagent when the relevant context already exists on disk and the job is to summarize it.

```text
- Task: Summarize active objectives for a dashboard view
- Entry points: .eng/objectives/
- Context: Read current statuses, task counts, and last Timeline entries only
- Deliverable: One paragraph per objective with status, progress, blocker, next action
```

## Delegation Anti-Patterns

Avoid these:

- Delegating decisions you just made but have not written down yet
- Delegating trivial known-path reads or <=2-file housekeeping edits
- Delegating "look around and fix whatever seems wrong" without scope restrictions
- Delegating without entry points when you already know where the work lives
- Delegating without a deliverable format, then blaming the sub for returning the wrong shape

## Pre-delegation Checklist

Run this omission check before every delegation:

1. **Can the sub finish without my live context?** If not, write the missing context to `.eng/` first or do it yourself.
2. **Did I name entry points?** If not, the sub wastes budget searching.
3. **Is the deliverable format clear?** If not, the sub may return something unusable.

If any answer is "no", tighten the prompt before delegating.

## Delegation Prompt Template

Every delegation prompt includes these fields:

```text
- Task: specific question or work item (include scope restrictions here)
- Entry points: files, dirs, or URLs to start from
- Context: key facts the sub needs — active objective path, locked decisions,
  constraints, patterns to follow
- Deliverable: what to return and in what format
- Budget: tool call limit (optional for simple work, explicit for research or larger tasks)
```

**Task** and **Deliverable** are the minimum. **Context** is required for anything non-trivial. **Entry points** save the sub from blind searching. **Budget** sets expectations for effort.

## Effort Calibration

**Best guess, err generous.** Estimate what the sub needs, then round up — too much context and budget is better than too little.

If a sub returns PARTIAL or low confidence, escalate: retry with more budget, better entry points, or do it yourself.

Use these questions when sizing the budget:
- **Predictability:** Known location or open-ended exploration?
- **Independence:** Can the sub finish without unwritten context?
- **Context size:** How much reading is needed before acting?

Think of delegation as a context-budget trade: delegate when sending a short prompt costs less than carrying the raw file content in the parent.

## Output Budgets

Default to concise subagent outputs unless the parent explicitly asks for depth.

- **COMPLETE** — short structured result, usually 3-6 bullets or short paragraphs plus the required status block
- **PARTIAL** — name what is missing in 1-3 bullets
- **BLOCKED** — state the blocker directly, no long narrative
- Cite file paths or URLs instead of pasting long excerpts
- Prefer summaries over step-by-step narration unless the parent asked for a transcript

If the parent needs more detail, it should ask for that detail in the Deliverable field.

## Result Handling

### Structured status protocol

Every subagent response ends with a status line:

```text
## Status: COMPLETE | PARTIAL: {what's missing} | BLOCKED: {reason}
```

- **COMPLETE** — the sub answered the question or finished the task fully.
- **PARTIAL: {what's missing}** — the sub made progress but could not finish.
- **BLOCKED: {reason}** — the sub could not make meaningful progress.
- **BLOCKED: prompt-too-vague** — the prompt had multiple plausible interpretations, missing entry points, or unclear scope. Parent action: rewrite the prompt with more specificity and do not resend it unchanged.

Parent actions by status:
- **COMPLETE** -> integrate the results.
- **PARTIAL** -> retry with more budget, fill the gap yourself, or accept the partial result.
- **BLOCKED** -> investigate the blocker. Usually a prompt issue, missing context, or a tool limitation.

### Who synthesizes

**Parent synthesizes** when it holds live context not yet written down — decisions made in the current conversation, trade-offs being weighed, or intermediate conclusions.

**Delegate synthesis** when the relevant context is already externalized to `.eng/` files.

#### Example: parent synthesizes
You've just finished a design discussion with the user. Five locked decisions are still only in your head. Write the design yourself; the sub would be missing the real constraints.

#### Example: delegated synthesis
The user asks for a status summary across three objectives and the objectives are already up to date on disk. Delegate the summary.

### Documentation-smell heuristic

If a synthesis sub returns PARTIAL because it could not find context it needed, that is usually a signal that the context should have been written to `.eng/` but was not. Treat that as a documentation gap.

## Minimum Context for `.eng/` Operations

When delegating `.eng/`-related tasks, include these essentials so the subagent can orient without loading the full eng-docs skill:

- **Active objective path:** `.eng/objectives/objective-*.md`
- **Key file naming patterns:**
  - Objectives: `objective-*.md`
  - Findings: `finding-*.md`
  - Retros: `retro-*.md`
  - Mistakes: `mistake-*.md`
  - Designs: `design-*.md`
- **Directory structure:** objectives, findings, retros, scratch

See the **eng-docs** skill for full schemas, templates, and section mutability rules.
