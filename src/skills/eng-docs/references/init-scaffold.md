# Initial Scaffold Workflow

Use this workflow to scaffold `.eng/` in a new or existing project.

## Rules

- If `.eng/objectives/` already exists and contains files, list what is there and stop. Don't overwrite existing work.
- If migration is needed, use **eng-check** maintenance workflows rather than rebuilding from scratch.
- Ask one user question, then proceed. Don't interview the user.

## Workflow

### 1. Check existing state
Look for a `.eng/` directory. If `objectives/` exists with files, report the contents and stop.

### 2. Detect project context
Read until you have enough context:
- current working directory name
- `package.json` -> `name`
- `pyproject.toml` -> `[project] name`
- `Cargo.toml` -> `[package] name`
- `go.mod` -> module name
- `README.md` title and description

Derive a project slug (lowercase, hyphenated) and one-sentence purpose. Confirm only if truly ambiguous.

### 3. Ask one question
Ask in plain text:
> What are you working on, or what problem brought you here?

Use the answer to seed the initial objective.

### 4. Create directory structure
Create this baseline layout:

```text
.eng/
├── objectives/
├── designs/
├── findings/
├── mistakes/
├── retros/
├── scratch/
├── whiteboard/
└── archive/
```

### 5. Update `.gitignore`
If `.gitignore` exists, make sure it contains:

```text
# Engineering docs (local only)
.eng/
```

If `.gitignore` does not exist, create it with those lines.

### 6. Install hooks
Create `.github/hooks/hooks.json` with the PreCompact checkpoint hook so in-progress state gets flushed before context compaction.

### 7. Create initial whiteboard
Create `.eng/whiteboard/<date>-<slug>.md` using the whiteboard template.
Populate:
- `created`: today's date
- **Title**: what the user said they are working on, or `<project> kickoff` if unclear
- **Thoughts**: 1-3 sentences synthesizing the conversation
- **Open Questions** and **Next Step** only if they are already obvious

### 8. Validate
Run the validation script from this skill:

```bash
bash {path-to-eng-docs-skill}/scripts/validate-eng.sh <project-root>
```

### 9. Report
List what was created, then say:
- the whiteboard is now the default starting point for this work
- next step: continue exploring in `eng-plan` or `eng`
