# Starting a New Objective

Use this workflow when the user explicitly wants a new tracked objective.

## Workflow

1. Check for existing objectives in `.eng/objectives/` so you don't duplicate tracked work.
2. Create the objective using the **eng-docs** objective template.
3. Set frontmatter:
   - `created`: today's date
   - `status: draft`
   - `project`: project slug or repo name
4. Scope the problem:
   - What is the observable problem or desired end state? (1-3 sentences)
   - What are the success criteria? (3-5 independently verifiable bullets)
   - What is in scope and out of scope?
5. Capture initial thoughts in `### Notes` and `### Open Questions`.
6. Do not write to `## Design` or `## Implementation Plan` during scoping.
7. Add a Timeline entry: `Status -> draft. Objective created.`
8. When scope is clear, use **eng-review** in gate-review mode to check the scoping gate and advance to planning.

## Rules

- A new objective is scoping only. No design or implementation tasks yet.
- Follow **eng-docs** conventions and **eng-workflow** phase rules.
- If the user did not explicitly ask for a new objective, don't create one. Use the whiteboard entry point instead.
