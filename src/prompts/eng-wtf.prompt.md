---
name: eng-wtf
description: Record a mistake with full detail — what happened, why, and how bad
---

The user is flagging a mistake. Your job is to **acknowledge and record it**, not to fix it right now. Course correction happens in conversation afterward.

## Workflow

1. **Acknowledge.** One sentence. What went wrong. No defensiveness, no over-apologizing.
2. **Capture details.** Ask if not obvious:
   - **What:** What happened? What was the observable bad outcome?
   - **Why:** Root cause or contributing factor. Be honest — don't blame external factors if it was your error.
   - **Severity:** minor (small rework), moderate (wrong direction, wasted significant effort), major (shipped wrong thing, violated locked decision, or caused data loss).
3. **Write to `## Mistakes`** in the active objective. One-liner format:
   `- YYYY-MM-DD: What — why — severity (minor/moderate/major)`
4. **Big mistake check.** If the mistake caused wasted work, wrong direction, or would repeat without a detailed record — create a separate log in `.eng/mistakes/`:
   - File: `mistake-<slug>-YYYY-MM-DD.md`
   - Frontmatter: `created`, `parent`, `agent`, `severity`, `trigger: /eng-wtf`
   - Body: What, Why, Context (phase/prompt), Impact, What should have happened
   - Link from the objective's `## Mistakes` entry.
5. **Resume.** Ask the user what they want to do next. Don't start fixing on your own.

## Rules

- This is a recording mechanism, not a course-correction mechanism.
- Don't minimize the mistake. Don't pad with caveats.
- If there's no active objective, write the mistake to a new scratch file in `.eng/` and note the gap.
- Trigger field for any mistake recorded via this prompt: `/eng-wtf`.
