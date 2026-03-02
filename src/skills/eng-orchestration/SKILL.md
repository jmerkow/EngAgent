---
name: eng-orchestration
description: Delegation conventions for parent agents using subagents. Covers when to delegate, prompt structure, result handling, effort calibration, and the COMPLETE/PARTIAL/BLOCKED status protocol. Load before delegating to subagents.
---

# Orchestration Conventions

Conventions for parent agents delegating work to subagents via `runSubagent`. Load this skill before your first delegation in a session.

## When to Delegate

Delegate when the work is **independent** and **context-separable** — the subagent can do the job without your live working memory.

**Good delegation targets:**
- Research sub-questions with clear entry points
- File edits where the task, scope, and pattern are well-defined
- Synthesis of `.eng/` content that's already written down
- Parallel investigations across different parts of the codebase

**Keep in-parent:**
- Work that depends on decisions you just made but haven't written down yet
- Tasks requiring multi-step judgment calls that build on each other
- Anything where you'd need to send most of your current context to the sub

Rule of thumb: if you can write a self-contained prompt without restating your entire working state, delegate it.

## Delegation Prompt Template

Every delegation prompt includes these fields:

```
- Task: specific question or work item (include scope restrictions here if needed,
  e.g., "edit files in src/agents/ only")
- Entry points: files, dirs, or URLs to start from
- Context: key facts the sub needs — active objective path, relevant decisions,
  constraints, patterns to follow
- Deliverable: what to return and in what format
- Budget: tool call limit (optional — omit for simple tasks, set explicitly for
  research or large investigations)
```

**Task** and **Deliverable** are the minimum. **Context** is required for anything non-trivial — a subagent starting cold needs to know what objective is active, what decisions are locked, and what constraints apply. **Entry points** save the sub from blind searching. **Budget** sets expectations for effort.

### Example: research delegation

```
- Task: Investigate how VS Code propagates workspace-level instructions to subagents
- Entry points: VS Code docs at https://code.visualstudio.com/docs/copilot/chat/chat-agents,
  the applyTo field in .github/instructions/*.instructions.md
- Context: We're adding a new leaf agent (eng-sub) and need to confirm instructions
  reach it without explicit wiring. Active objective: objective-orchestration-improvements.md
- Deliverable: Findings doc in .eng/findings/ with evidence for/against automatic propagation
- Budget: 15 tool calls
```

### Example: edit delegation

```
- Task: Add scratch/ to the .eng/ directory listing in eng-docs SKILL.md.
  Edit files in src/skills/eng-docs/ only.
- Entry points: src/skills/eng-docs/SKILL.md, directory structure section
- Context: scratch/ is a new low-ceremony directory for agent working notes and drafts.
  Minimal description — don't over-formalize. See D5 in design-orchestration-improvements.md.
- Deliverable: Updated SKILL.md with scratch/ in the directory tree and a one-line description
```

## Effort Calibration

**Best guess, err generous.** Estimate what the sub needs, then round up — too much context and budget is better than too little.

If a sub returns PARTIAL or low confidence, that's a signal to escalate: retry with more budget, better entry points, or do it yourself.

No formal tiers. Use these questions as aids when estimating, not as mandates:

- **Predictability:** Is the answer in a known location, or does the sub need to explore? Known → smaller budget. Unknown → larger.
- **Independence:** Can the sub finish without information only you have? If not, either write that info to `.eng/` first or do it yourself.
- **Context size:** How much does the sub need to read to act? If it's more than a few files, consider whether a broader scope justifies the delegation overhead.

Calibrate over time — if subs consistently return PARTIAL at budget N, your baseline estimate is too low.

## Result Handling

### Structured status protocol

Every subagent response ends with a status line:

```
## Status: COMPLETE | PARTIAL: {what's missing} | BLOCKED: {reason}
```

- **COMPLETE** — sub answered the question or finished the task fully.
- **PARTIAL: {what's missing}** — sub made progress but couldn't finish. The description says what's left.
- **BLOCKED: {reason}** — sub couldn't make meaningful progress. The reason explains why.

Parent actions by status:
- **COMPLETE** → integrate the results.
- **PARTIAL** → decide: retry with more budget, fill the gap yourself, or accept partial results.
- **BLOCKED** → investigate the blocker. Usually a prompt issue (missing context, wrong entry points) or a tool limitation.

### Who synthesizes

**Parent synthesizes** when it holds live context not yet written down — decisions made in the current conversation, trade-offs being weighed, intermediate conclusions.

**Delegate synthesis** when the relevant context is already externalized to `.eng/` files. The whole point of structured documentation is that context isn't trapped in one agent's head.

#### Example: parent synthesizes

You've just finished a design discussion with the user. You have 5 locked decisions in your working memory that aren't yet written to the design doc. You need to write the design doc — do it yourself, because the sub would be missing the decisions.

#### Example: delegated synthesis

The user asks for a status summary across 3 objectives. All objectives are in `.eng/objectives/` with up-to-date Progress sections. Delegate to a sub:

```
- Task: Produce a status summary across active objectives
- Entry points: .eng/objectives/
- Context: User wants a high-level dashboard view. Read Progress sections and
  task checkboxes from each active objective.
- Deliverable: Structured summary — per-objective: title, status, tasks done/total,
  key blockers or open questions
```

### The documentation-smell heuristic

If a synthesis sub returns PARTIAL because it couldn't find context it needed, that's a signal: the context probably should have been written to `.eng/` but wasn't. Treat it as a documentation gap.

This is a heuristic, not a certainty — PARTIAL can also mean budget issues or a poorly scoped prompt. But if the missing context is something you know and haven't externalized, that's a mistake worth logging. Write the context down, retry if needed.
