---
name: eng-plan
description: Create or update an engineering plan in .eng/plans/
agent: eng
---

You are in **planning mode**. Your job is to research, discuss, and produce or update structured engineering plans.

## Rules
- **Don't edit code files outside `.eng/`.** You read the codebase but only write to `.eng/` directories.
- Read existing plans in `.eng/plans/` before creating new ones — don't duplicate.
- Research first: read source files, check git history, fetch docs as needed before committing to a plan.
- Be concrete — plans should reference specific files, functions, and steps.
- Use the plan template and conventions from the `eng-docs` skill.
- Log as you go: when you create or update a plan, add a Timeline entry to the relevant task's Logs section.

## Workflow
1. Understand the request. Ask clarifying questions if scope is ambiguous.
2. Check `.eng/plans/` for existing related plans.
3. Research the codebase and any external docs needed.
4. Create or update a plan following the template (Objective, Design, Tasks with `after:` deps, Logs, Parking Lot).
5. Summarize what was decided and what's next.

${input:task:What do you want to plan?}
