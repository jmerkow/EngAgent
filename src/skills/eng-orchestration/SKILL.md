---
name: eng-orchestration
description: Delegation rules for parent agents using subagents. Use before spawning subs or planning parallel work.
---

# Orchestration

## Core Principle

Delegation is the default. Your bias is to act — fight it. If a sub can do the work, delegate it. Subs aren't just more efficient — they're *better* at focused tasks than you are. They have fresh context, no anchoring, and their full attention on one thing. You get better results by orchestrating well than by doing the work yourself.

Subs are not just for heavy work. Use them for cold reads, second opinions, and verification. Get fresh eyes often: before presenting a plan, after complex edits, when validating decisions. Don't wait until you're unsure — make it a habit.

## What to Delegate

| Pattern | Use when | Details |
|---------|----------|---------|
| Exploration | Need to read many files for one question | [references/patterns.md](references/patterns.md#exploration) |
| Focused edit | Target known, deliverable narrow | [references/patterns.md](references/patterns.md#focused-edit) |
| Synthesis | Context already on disk, need a summary | [references/patterns.md](references/patterns.md#synthesis) |
| Cold read | Want unbiased evaluation without your assumptions | [references/patterns.md](references/patterns.md#cold-read--second-opinion) |

Rule of thumb: if you can write a self-contained prompt without restating your entire working state, delegate it.

**Don't delegate:** decisions you haven't written down, vague scope without entry points, tasks without a clear deliverable format.

## How to Delegate

Voice your delegation plan before spawning subs. State what the tasks are, which are independent and should run in parallel, which have dependencies, what you expect each sub to return, and what you will do with the results.

<delegation_checklist>
Before every delegation:
1. Is this mine or should a sub handle it?
2. What context does the sub need? What should I purposely withhold?
3. What do I expect back - format, budget, depth?
4. If `.eng/` writes are involved: remind the sub to check for an active workstream via **eng-workstream**.
</delegation_checklist>

For the prompt template, see [templates/delegation-prompt.md](templates/delegation-prompt.md).

## Rules

- Err generous on budget — too much is better than too little.
- Concise output by default. Cite file paths, don't paste content.
- Run independent subs in parallel when possible.

## Managing Subs

Every sub response ends with: `## Status: COMPLETE | PARTIAL: {what's missing} | BLOCKED: {reason}`

- COMPLETE — integrate the results.
- PARTIAL — retry with more budget, fill the gap yourself, or accept partial.
- BLOCKED — investigate. Usually a prompt issue or missing context.
- BLOCKED: prompt-too-vague — rewrite your prompt with more specificity. Don't resend unchanged.

When to synthesize yourself: when you hold live context not yet written down. Delegate synthesis when the context is already on disk. If a sub returns PARTIAL because it couldn't find context, that's a gap in what you've written down — externalize it.
