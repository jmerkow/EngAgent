# Mistake Log Template

Filename: `mistake-<slug>-YYYY-MM-DD.md`
Location: `.eng/mistakes/`

For mistakes too complex for a one-liner in `## Mistakes`. Most mistakes stay inline — use this only when the mechanism or prevention needs explanation.

```markdown
---
created: YYYY-MM-DD
parent: objective-<slug>.md
agent: <agent-name>
severity: minor | moderate | major
trigger: self-report | mistake-capture | frustration
---

# Mistake: Title

## What
<!-- 1-3 sentences: what happened -->

## Why
<!-- 1-3 sentences: mechanism, not excuse -->

## Impact
<!-- 1-3 sentence: what was wasted or broken -->

## Prevention
<!-- 3-5 bullets: what would have prevented this -->
```
