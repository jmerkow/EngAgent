---
name: eng-init
description: Initialize .eng/ documentation structure in a new or existing project. Creates directories, updates .gitignore, and seeds an initial objective from a brief conversation. Run once per project.
agent: eng
---

You are in **scaffold mode**. Your job is to set up `.eng/` documentation infrastructure in this project.

## Rules
- If `.eng/objectives/` already exists and contains files, list what's there and stop. Don't overwrite. Tell the user to use `/eng-fix migrate` if they need to migrate, or just open an existing objective.
- Load the **eng-docs** skill before creating any `.eng/` files.
- One question, then proceed — don't interview the user.

## Workflow

### 1. Check existing state
Look for a `.eng/` directory. If `objectives/` exists with files, report contents and stop.

Otherwise continue.

### 2. Detect project context
Read in order until you have enough:
- Current working directory name
- `package.json` → `name` field
- `pyproject.toml` → `[project] name`
- `Cargo.toml` → `[package] name`
- `go.mod` → module name
- `README.md` first 30 lines (title + description)

Derive: project slug (lowercase-hyphenated) and one-sentence purpose. You'll use both in the initial objective. Confirm with the user only if truly ambiguous.

### 3. Ask the user one question
Ask plaintext — no form, no bullet list:

> "What are you working on, or what problem brought you here?"

Wait for their answer. Use it to populate the objective.

### 4. Create directory structure

```
.eng/
├── objectives/
├── findings/
├── retros/
├── archive/
└── scratch/
```

`scratch/` is for ad-hoc notes and research dumps — no frontmatter required.

### 5. Update .gitignore
Check for `.gitignore` at the project root.
- If it exists: check if `.eng/` is already in it. If not, append:
  ```
  # Engineering docs (local only)
  .eng/
  ```
- If it doesn't exist: create it with those two lines.

### 6. Install hooks
Create `.github/hooks/hooks.json` with the PreCompact checkpoint hook:

```json
{
  "hooks": {
    "PreCompact": [
      {
        "type": "command",
        "command": "echo '{\"systemMessage\": \"CHECKPOINT — context compaction imminent. Before continuing: (1) Update the active objective in .eng/objectives/ — check off completed tasks, add any new decisions to the Progress section, add a timeline entry dated today with what happened and current status. (2) If mid-task, note what you were doing and the next step. This ensures your work survives compaction.\"}'",
        "timeout": 5
      }
    ]
  }
}
```

This fires before context compaction and reminds the agent to flush state to disk.

### 7. Create initial objective
Create `.eng/objectives/objective-<project-slug>-init.md`.

Use the objective template from the **eng-docs** skill. Populate:

- `created`: today's date
- `status: draft`
- `project`: inferred project slug
- **Title**: what the user said they're working on (or project name + "kickoff" if unclear)
- **Objective section**: 2–3 sentences synthesizing the conversation. End with: `Success criteria: TBD — define with @eng-plan before starting implementation.`
- **Tasks**: one starter task only:
  ```
  - [ ] **Define scope and success criteria** · Use @eng-plan to refine this objective's Objective section and mark status active before implementation begins.
  ```
- Skip `## Progress` — no work has been done yet.

### 8. Report
List what was created (files + directories). Then say:

- The objective is `status: draft` — scope hasn't been confirmed yet.
- Next step: run `@eng-plan` to define success criteria and mark it active.
- Or if they're ready to start planning now, suggest they switch to `@eng-plan` directly.
