# AGENTS.md

Project map for AI agents entering this codebase. Lists all agents, skills, hooks, and instructions with their purpose and location.

## Repository Structure

```
plugin.json                   # Root plugin manifest (primary install surface)
src/                          # Authored source files
├── agents/                   # Agent definitions, loaded via plugin.json
├── skills/                   # Skill definitions + references, loaded via plugin.json
└── instructions/             # Rule files, loaded via plugin.json -> rules
eng-agent-build/              # Legacy generated output from cli.mjs build
config.json                   # Local config for the legacy tool-injection flow
```

- `plugin.json` at the repo root is now the canonical plugin entrypoint. `copilot plugin install /path/to/EngAgent` should load directly from `src/`.
- `src/` remains the source of truth. `eng-agent-build/` is legacy output from `node cli.mjs build`; don't edit it directly.
- The legacy CLI install path still exists for compatibility, including `node cli.mjs install --workspace`, but Phase 1 plugin work should prefer the root manifest.

## The Library

`docs/the-library/` contains curated research on agent frameworks, VS Code customization, and orchestration patterns. Grep `docs/the-library/topics.md` to find docs by topic. Each doc starts with a title, optional badge line, and a blockquote description + Key concepts — read the first 10 lines to triage relevance before loading the full doc. Docs are self-contained; load one at a time.

## Key Conventions

- **`.eng/` is gitignored.** It's local working memory. Use `includeIgnoredFiles: true` or terminal commands when searching `.eng/` content.
- **Config-driven tool injection.** `config.json` can inject additional tools into agent frontmatter at build time for the legacy CLI flow (wildcard `*` or per-agent). Use `excludeTools` to remove tools from specific agents (e.g., leaf agents that shouldn't spawn subagents).
- **Customizable preferences.** `preferences-*.example.instructions.md` files at the repo root are shipped defaults. To customize, copy without the `.example.` suffix (e.g., `preferences-coding.instructions.md`). The build uses your copy when present; overrides are gitignored.

## Skills

| Skill | Purpose | Key Files |
|-------|---------|-----------|
| `check` | Validate `.eng/` documents against templates | `SKILL.md` |
| `docs` | Engineering documentation registry — file types, schemas, naming | `SKILL.md`, `references/` (templates, conventions) |
| `orchestration` | Delegation conventions for parent/subagents | `SKILL.md` |
| `push` | Git-based sync for `.eng/` directories (EngDirs) | `SKILL.md`, `scripts/init-engdirs.sh`, `scripts/pre-commit` |
| `retro` | Session retrospectives — mistakes, gaps, positives | `SKILL.md`, `references/` (template, categories) |
| `review` | Gate review, verification, and final sign-off workflows | `SKILL.md`, `references/` |
| `workflow` | Workflow phases, status values, gate checklists, whiteboard/objective entry | `SKILL.md`, `references/` |
| `doctor` | Save, compare, and diff installed agent tool/model state | `SKILL.md`, `scripts/agent-states.py` |
