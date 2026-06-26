# Retro File Template

File location: `.eng/retros/retro-{YYYY-MM-DDTHH-MM-SS}-{slug}.md` using UTC timestamp and a short descriptive slug (2-4 words, kebab-case) summarizing the session's main focus.

Examples: `retro-2026-02-20T19-30-00-auth-debugging.md`, `retro-2026-02-13T22-00-00-bulk-import.md`

```markdown
# Session Retro — {timestamp} — {slug}

## Session Context
<!-- 1-3 sentences: what the user was working on, scope -->

## Work Completed
<!-- 3-5 bullets: concrete deliverables -->

## Observations

### Agent Mistakes
<!-- one block per mistake, no prose between them -->
- **[category]** Brief description
  - What happened:
  - What should have happened:
  - Severity: minor | moderate | major

### Tooling & Workflow Gaps
<!-- one block per gap -->
- **[category]** Brief description
  - Pain point:
  - Suggested improvement: skill | prompt | convention | tool | other

### What Worked Well
<!-- 3-5 bullets max -->

## Raw Tags
<!-- machine-friendly, one line each -->
<!-- mistakes: [comma-separated categories] -->
<!-- gaps: [comma-separated categories] -->
<!-- severity-max: minor|moderate|major -->
<!-- session-type: planning | implementation | debugging | research | mixed -->
```
