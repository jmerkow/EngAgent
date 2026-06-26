# Detailed Mistake Capture

Use this workflow when the user explicitly wants to record a mistake in full detail.

## Workflow

1. Acknowledge what went wrong in one sentence. No defensiveness and no over-apologizing.
2. Capture details if they are not obvious:
   - **What:** What happened? What was the observable bad outcome?
   - **Why:** Root cause or contributing factor.
   - **Severity:** minor, moderate, or major.
3. Write a one-line entry to `## Mistakes` in the active objective:
   `- YYYY-MM-DD: What — why — severity (minor/moderate/major)`
4. If the mistake caused wasted work, wrong direction, or is likely to repeat, create a detailed log in `.eng/mistakes/`:
   - File: `mistake-<slug>-YYYY-MM-DD.md`
   - Frontmatter: `created`, `parent`, `agent`, `severity`, `trigger: mistake-capture`
   - Body: What, Why, Context, Impact, What should have happened
   - Link the detail file from the objective's `## Mistakes` entry
5. Resume by asking the user what they want to do next. Don't start fixing on your own.

## Rules

- This is a recording mechanism, not a course-correction mechanism.
- Don't minimize the mistake or pad it with caveats.
- If there is no active objective, write the mistake to a dated note in `.eng/scratch/` and note the gap.
- Use `mistake-capture` as the trigger value for detailed mistake logs created through this workflow.
