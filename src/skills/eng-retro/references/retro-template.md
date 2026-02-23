# Retro File Template

File location: `.eng/retros/retro-{YYYY-MM-DDTHH-MM-SS}-{slug}.md` using UTC timestamp and a short descriptive slug (2-4 words, kebab-case) summarizing the session's main focus.

Examples: `retro-2026-02-20T19-30-00-auth-debugging.md`, `retro-2026-02-13T22-00-00-bulk-import.md`

```markdown
# Session Retro — {timestamp} — {slug}

## Session Context
<!-- 2-4 sentences: what the user was working on, repos/files involved, rough scope -->

## Work Completed
<!-- Bulleted list of concrete deliverables or actions taken -->

## Observations

### Agent Mistakes
<!-- Format:
- **[category]** Brief description
  - What happened: ...
  - What should have happened: ...
  - Severity: minor | moderate | major
-->

### Tooling & Workflow Gaps
<!-- Format:
- **[category]** Brief description
  - Pain point: ...
  - Suggested improvement: skill | prompt | convention | tool | other
-->

### What Worked Well
<!-- Brief notes on effective approaches worth reinforcing -->

## Raw Tags
<!-- Machine-friendly summary for grep/aggregation -->
<!-- mistakes: [comma-separated categories] -->
<!-- gaps: [comma-separated categories] -->
<!-- severity-max: minor|moderate|major -->
<!-- session-type: planning | implementation | debugging | research | mixed -->
```
