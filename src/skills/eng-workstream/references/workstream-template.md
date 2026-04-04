# Workstream Info Template

File location: `.eng/workstreams/<slug>/workstream.md`

```markdown
---
created: YYYY-MM-DD   # optional
---

# Workstream Title

One-line description of the effort.

## Context
<!-- optional prose: related objectives, related workstreams, or background a cold reader should know -->
```

## Rules

- Keep the title and description readable in isolation — `eng-workstream resume` uses this file to summarize available workstreams.
- `created:` is optional but recommended for new workstreams.
- Remove optional sections you don't need.
- **Do not duplicate what the directory already shows.** No artifact tables, file inventories, or counts — `ls` does that. Write prose that tells a cold reader *what this effort is about*, not *what files exist*.
- Keep this file brief. Start with frontmatter + title + one-liner. Let it grow from there only when the work demands it.
- **Justify every line.** Before finishing, review each line: does it duplicate what the directory shows, repeat what an objective says, or add something a cold reader actually needs? Cut what doesn't earn its place.
