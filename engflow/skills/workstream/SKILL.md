---
name: workstream
description: Workstream lifecycle for `.eng/` directories — create, discover, activate, and deactivate workstreams, plus the authoritative active-workstream contract used by parent agents and subagents. Use when organizing `.eng` artifacts by effort, deciding where `.eng` writes should go, or answering cross-workstream questions.
---

# Workstream Lifecycle

Workstreams are named directories under `.eng/workstreams/<slug>/` that group related engineering artifacts for one effort. Root `.eng/` remains the default when no workstream is active.

## Active workstream contract

This skill is the single source of truth for the active-workstream contract.

- The parent flow resolves the active workstream before every `.eng/` write. No active workstream → write to root `.eng/`.
- Only the parent flow or this skill changes active-workstream state. Subagents receive the path from the parent and treat it as read-only.
- If the active workstream is unknown or ambiguous, fall back to root `.eng/` or ask.
- When writing to a workstream, echo the target path so the user sees where the artifact landed.

## Rules

- Workstreams live under `.eng/workstreams/<slug>/`. No nesting.
- Every workstream has a `workstream.md`; see [templates/workstream.md](../docs/templates/workstream.md) in the **/engflow:docs** skill.
- Internal structure is free-form. Add files and subdirectories as the work demands.
- **DO NOT copy other workstreams structure.** Let the shape emerge from the work.

## Operations

### Create

1. Create `.eng/workstreams/<slug>/` with just a `workstream.md` from the template.
  - **DO NOT** pre-create subdirectories.
2. (Optional) Move related artifacts into the workstream only if tasked to do so.

### Discover

- For read-only questions across all workstreams (e.g., "what's in progress?"): search root `.eng/` plus each workstream's `workstream.md` and local objectives.
- Do not activate a workstream just to answer a cross-cutting question.

### Activate

1. Write a **session memory** `active-workstream` that contains the active workstream path, e.g. `active-workstream: <workspaceRoot>/.eng/workstreams/<slug>/`.
  - Use absolute paths to avoid ambiguity for subagents.
  - DO NOT write anything else to the active workstream — no objectives, no status, no project context.
2. Confirm the active workstream with the user, echoing the path and any relevant context from the `workstream.md` (e.g., description, milestones) to orient them.

- Once active, `.eng/` writes target the workstream directory instead of root.

### Deactivate

1. Clear the `active-workstream` memory from **session memory**.
2. Subsequent `.eng/` writes should return to root `<workspaceRoot>/.eng/`.
