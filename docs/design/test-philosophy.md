# Testing & Verification

How we verify that the EngAgent system works correctly — agent files, skills, prompts, and workflows.

## The Problem

EngAgent is a context engineering system. Its "code" is markdown files that instruct AI agents. You can't unit test "does eng-plan refuse to write a design during scoping?" without running eng-plan on a real objective. There's no assertion framework for agent behavior.

Instead, we verify in layers — from cheap mechanical checks to expensive real-world usage.

## Verification Layers

### Layer 1: Mechanical checks (during implementation)

Every file has two budgets:

**Line budget** — a maximum line count. Checked with `wc -l`. If a file exceeds its budget, it needs review — is the content justified, or has it bloated?

**Content checklist** — a list of things that MUST be present in the file. Checked by reading/grepping. This prevents an implementer from hitting the line budget by gutting important content.

Both checks run immediately after producing or editing a deliverable. Don't move to the next task until the current one passes.

The example below shows what a content checklist looks like. Each file being created or modified gets its own checklist in the implementation plan — not here. This doc defines the pattern; the tasks define the specifics.

Example:
```
eng-docs SKILL.md:
  Line budget: ≤ 120
  Content:
    - [ ] Directory structure section
    - [ ] Objective schema (frontmatter YAML)
    - [ ] Design doc schema
    - [ ] Template links (objective, design, findings, mistake)
    - [ ] Naming conventions
    - [ ] No workflow content (grep for "gate", "phase", "lifecycle" returns 0)
```

### Layer 2: Cold-read verification (after implementation)

Spawn a subagent with no conversation context. Give it one file. Ask:

- What does this file tell you to do?
- What's missing?
- Is anything confusing or contradictory?

This tests whether the file is **self-contained and coherent** — not whether it loads at the right time (that's Layer 3). Do this for each agent file and each skill file.

A cold reader catches things the author misses: jargon without explanation, implicit assumptions, references to things that don't exist in the file.

### Layer 3: Scenario walk-through (after all files are done)

Write 3-4 workflow scenarios and have a subagent trace through each one manually. The subagent reads the actual files (agent, skills, prompts, instructions) and lists:

1. What files would load for this scenario
2. What rules apply
3. What the agent knows and doesn't know
4. Any gaps or contradictions

Example scenarios:
- "You're eng-plan. The objective has `status: draft`. User wants to start scoping. What do you load? What do you do?"
- "You're eng-code. User ran `/eng-go`. The objective has `status: approved`. What do you check? What do you do?"
- "You're eng. User ran `/eng-verify`. The objective has `status: needs-verify`. How do you verify?"

This is the closest we get to simulating context loading without running a real session. It tests the system end-to-end — not individual files, but how they compose.

### Layer 4: Smoke test (actual usage)

After everything is built, use the system on a real objective. Pick something small from the backlog. Run through the full workflow: scoping → planning → implementation → verification.

This is the only real test. Everything else is approximation. The first real objective after a system change IS the smoke test. Capture what breaks and fix it.

## When to use each layer

| Layer | When | Cost | What it catches |
|---|---|---|---|
| **Mechanical** | Every task, during implementation | Seconds | Bloat, missing sections, leftover content |
| **Cold read** | Per file, after mechanical passes | ~5 min per file | Incoherent instructions, implicit assumptions, missing context |
| **Scenario** | Once, after all files are done | ~30 min | Cross-file contradictions, loading gaps, workflow breaks |
| **Smoke test** | Once, on next real objective | Hours | Everything else — real-world behavior |

