# EngAgent

A portable engineering agent system for GitHub Copilot in VS Code. It gives your AI agent structured memory, retro-driven self-improvement, and consistent behavior across every project you work on.

The core idea: AI agents are more effective when they have a place to write things down. EngAgent provides that place (`.eng/` directories) along with agents, prompts, and skills that know how to use it. Objectives track what you're doing and why. Findings capture what you learned. Retros capture what went wrong. Each session picks up where the last one left off.

Built for solo practitioners who work with AI agents daily and want the agent to get better over time — not just within a session, but across sessions and projects.

## Why EngAgent?

We studied the major agent configuration projects — [shariqriazz/global-project-agents-md](https://github.com/shariqriazz/global-project-agents-md), [dhar174/custom_github_copilot_agent_builder](https://github.com/dhar174/custom_github_copilot_agent_builder), [github/awesome-copilot](https://github.com/github/awesome-copilot), and [anthropics/anthropic-cookbook](https://github.com/anthropics/anthropic-cookbook) — and incorporated their best ideas. But none of them solved the problem we kept hitting: **agents don't learn from their mistakes.**

| Project | Strength | Gap |
|---|---|---|
| shariqriazz | Excellent behavioral rules, auto-detection scaffolding | No session memory, no retro loop |
| dhar174 | Rich context layers (memory, decisions, specs) | Complex 5-phase pipeline, team-oriented |
| awesome-copilot | Huge pattern catalog, DAG workflows, hooks | Reference collection, not an opinionated system |
| anthropic-cookbook | Research subagent patterns, context compaction | API-level recipes, not workspace tooling |

EngAgent cherry-picks the best patterns (confidence scoring, autonomy zones, constraint-over-capability, progressive disclosure) and adds what's missing: **a retro-driven feedback loop**. After each session, you run `/eng-retro` to capture what went wrong. Periodically, `/eng-retro-analysis` aggregates those retros and surfaces recurring patterns. You then use those patterns to refine the agent's behavioral rules. It's a manual loop — you decide what changes to make — but it's structured enough that improvements compound over time.

Other differences:
- **Portable across projects** — install once, use everywhere. No per-repo setup beyond `/eng-init`.
- **Solo-first** — no orchestrator overhead, no agent swarms. One agent does the work; a second handles planning. Light subagent use for parallel research, with more delegation patterns coming.
- **Research discipline** — unified rules for how the agent investigates before acting: confidence scoring (know when to stop researching), tool call budgets (don't spiral), failure escalation (two strikes, reassess), and pre-implementation context maps. The agent is encouraged to search documentation, fetch web resources, and use all available tools — not just guess from what's in context.
- **Filesystem as memory** — `.eng/` directories are plain markdown, inspectable, diffable. No databases, no external services.

## What's Included

| Type | Name | Purpose |
|---|---|---|
| **Agents** | `@eng` | General-purpose engineering agent — plans, investigates, implements, and tracks work |
| | `@eng-plan` | Planning-only mode — researches and produces objectives without editing code |
| **Prompts** | `/eng-init` | Bootstrap `.eng/` structure in a new project (run once per repo) |
| | `/eng-status` | Dashboard view of active objectives and progress |
| | `/eng-done` | Wrap up current task — update progress and commit |
| | `/eng-fix` | Validate, migrate, backfill, or repair `.eng/` documentation |
| | `/eng-retro` | End-of-session retrospective — collect mistakes, gaps, and positives |
| | `/eng-retro-analysis` | Cross-session pattern analysis across multiple retros |
| **Skills** | `eng-docs` | `.eng/` documentation system — objective templates, findings format, naming conventions |
| | `eng-retro` | Retrospective system — collection template, severity rubric, category taxonomy |
| **Hooks** | PreCompact | Checkpoint before context compaction — flushes objectives and decisions to disk |
| **Instructions** | `preferences.instructions.md` | Universal coding preferences — style, naming, git conventions |

## How It Works

EngAgent uses a four-tier instruction model:

1. **Global preferences** — `preferences.instructions.md` applies to all files in all workspaces. Coding style, naming, git conventions.
2. **Agent definitions** — `eng.agent.md` and `eng-plan.agent.md` define behavioral rules: autonomy zones, research discipline, when to ask vs. proceed.
3. **Skills** — `eng-docs` and `eng-retro` provide domain knowledge that agents load on demand when working with `.eng/` files.
4. **Per-repo context** — `.eng/objectives/`, `.eng/findings/`, `.eng/retros/` in each project. The agent reads these to understand what's been done and what's next.

The `.eng/` directory is gitignored by default — it's local working memory, not project source code.

### The `.eng/` directory

```
<project-root>/
└── .eng/
    ├── objectives/     # living work trackers (the central hub)
    ├── findings/       # investigation results and analysis
    ├── retros/         # per-session retrospectives
    ├── archive/        # completed or superseded docs
    └── scratch/        # ad-hoc notes, no structure required
```

Use `/eng-init` to scaffold this in any project. See [AGENTS.md](AGENTS.md) for the full inventory of agents, prompts, skills, and hooks.

## Install

Requires [Node.js](https://nodejs.org/) (18+).

```bash
git clone https://github.com/jmerkow/EngAgent.git
cd EngAgent
node cli.mjs build
node cli.mjs install
```

Before running `build`, you can optionally customize `config.json` to inject MCP server tools or any other tools into the agents. Copy `config.example.json` to `config.json` and add tools under the `tools` key — use `*` for all agents or a specific agent name:

```json
{
  "tools": {
    "*": ["mcp_my-server_someTool"],
    "eng-plan": ["vscode.mermaid-chat-features/renderMermaidDiagram"]
  }
}
```

`build` reads this config and injects the tools into agent frontmatter.

You can also add tools at runtime — when chatting with `@eng` or `@eng-plan`, click the **tools** icon in the chat input, toggle on any MCP servers or built-in tools you want, and save. This doesn't require a rebuild.

**What the commands do:**

1. `build` copies `src/` into `.github/`, injecting any configured tools into agent files
2. `install` symlinks `.github/` to `~/.copilot/engagent/` and registers four VS Code settings:

```jsonc
{
    "chat.agentFilesLocations":        { "~/.copilot/engagent/agents": true },
    "chat.promptFilesLocations":       { "~/.copilot/engagent/prompts": true },
    "chat.agentSkillsLocations":       { "~/.copilot/engagent/skills": true },
    "chat.instructionsFilesLocations": { "~/.copilot/engagent/instructions": true }
}
```

VS Code discovers agents, prompts, skills, and instructions from these paths in every workspace.

> **Note:** Install on your **local/client machine** — the one running VS Code. If you use Remote SSH, Dev Containers, or WSL, install on the **client side only**. VS Code reads these settings from the client's user profile.

### Configuration

`config.json` also supports:

- `installDir` — override the default `~/.copilot/engagent` location

### Update

```bash
git pull
node cli.mjs build
```

Symlinks mean no reinstall — the build step is enough.

### Uninstall

```bash
node cli.mjs uninstall
```

Removes the symlink and VS Code settings entries.

## Quick Start

Once installed, in any VS Code workspace:

1. **`/eng-init`** — scaffold `.eng/` in your project (once per repo)
2. **`@eng-plan`** — define an objective, research the problem, plan tasks
3. **`@eng`** — implement tasks from the active objective
4. **`/eng-done`** — wrap up, update progress, commit
5. **`/eng-retro`** — collect observations at end of session

For ongoing work, `@eng` reads `.eng/objectives/` to pick up where you left off. Use `/eng-status` for a quick dashboard.

## Hooks (Experimental)

The PreCompact hook fires before VS Code compacts the conversation context. It reminds the agent to flush in-progress state to `.eng/objectives/` so work survives compaction.

Hooks are installed automatically by `/eng-init` and live in `.github/hooks/hooks.json`. To disable, delete the file or remove the hook entry. See [VS Code hooks documentation](https://code.visualstudio.com/docs/copilot/chat/chat-hooks) for format details.

Additional hooks (pre-flight checks, terminal output handling, session start) are planned but not yet validated.

## Roadmap

Near-term planned additions:

- **Session start hook** — auto-load active objectives and preferences when a chat session begins
- **Pre-flight hook** — verify `.eng/` conventions are loaded before creating or editing `.eng/` files
- **`/eng-validate` prompt** — check `.eng/` structure against conventions, flag issues
- **JSON Schema for frontmatter** — machine-verify objective and findings metadata
- **Parallel track detection** — identify independent task streams in objectives and run them concurrently (inspired by [GSD-for-Copilot](https://github.com/henningway/gsd-for-copilot))
- **Thin orchestrator rule** — guidance for spawning subagents on complex multi-part tasks
- **Parallel research subagents** — concurrent deep-dives instead of serial reads during planning

See [AGENTS.md](AGENTS.md) for the full project map.

## Contributing

This is a solo project in active development. If you find it useful or have ideas, open an issue. Pull requests welcome for bug fixes; for new features, open an issue first to discuss.

The retro system is how this project evolves. Run `/eng-retro` after your sessions, look at what patterns emerge with `/eng-retro-analysis`, and if you find improvements to the agents, prompts, or skills — that's a contribution. Fork, run the loop on your own projects, and send back what works.

## License

MIT
