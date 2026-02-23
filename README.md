# EngAgent

A portable agent system for GitHub Copilot in VS Code. Gives your AI agent a place to write things down, learn from mistakes, and pick up where it left off.

EngAgent creates `.eng/` directories in your projects, plain markdown files where the agent tracks objectives, captures findings, and logs what went wrong. It also includes agents, prompts, and skills that know how to use those files. The idea is that each session builds on the last one instead of starting from scratch.

## Why EngAgent?

This project grew out of my own experience working with AI agents daily. I'd been collecting learnings, tweaking prompts, and building up informal patterns over time — and eventually decided to pull it all together into something more structured and reusable.

The guiding principle: **control and transparency**. I wanted to understand exactly what my agent system was doing, not have some massive project running a bunch of things behind the scenes. At the same time, I wanted it to actually be useful, to help me keep track of work across sessions and projects. I think this is a good starting point for anyone who wants structure around AI-assisted coding without handing the reins over completely.

I didn't know about the bigger projects in this space until after I'd already started. Early versions of EngAgent grew organically, and then I used the `@eng` agent itself to research projects like [Get Shit Done](https://github.com/gsd-build/get-shit-done/), [GitHub Spec Kit](https://github.com/github/spec-kit), and [Awesome Copilot](https://github.com/github/awesome-copilot). I incorporated the patterns that fit my pain points, things I'd identified through running retrospectives on my own sessions. Those are great projects and worth checking out. The space is crowded, and I don't expect a ton of usage here, but if anyone finds EngAgent useful I'd love to hear about it.

What makes EngAgent different:

- **Nothing hidden.** The repo is simple. You can follow exactly what's going on by reading the agents, prompts, and skills. No layers of orchestration, no magic.
- **Retro-driven improvement.** After each session, run `/eng-retro` to capture what went wrong. Periodically, `/eng-retro-analysis` aggregates those retros and surfaces recurring patterns. You use those patterns to refine the agent's behavioral rules. It's a manual loop — you decide what changes, but it compounds over time. The prompts aren't perfect, but they're solid.
- **Portable across projects.** Install once, use everywhere. No per-repo setup beyond `/eng-init`.
- **You stay in control.** Two agents (`@eng` and `@eng-plan`), a handful of prompts, no multi-agent swarms or autonomous pipelines. You see what the agent is doing and decide when to proceed.
- **Not just for code.** I use this for blog posts, sample repos, data science work, ML training runs, and general project tracking. The bigger tools in this space are geared toward production software teams. This works for anything you'd want an AI agent to help you think through and keep track of.
- **Research discipline.** The agent is told to actually look things up before acting. There are rules for when to stop researching, when to ask, and when it's gone down a rabbit hole too long.
- **Filesystem as memory.** `.eng/` directories are plain markdown, inspectable, diffable. No databases, no external services.
- **A place to learn.** This is also where I learn about the AI agent ecosystem.

## What's Included

| Type | Name | Purpose |
|---|---|---|
| **Agents** | [`@eng`](src/agents/eng.agent.md) | General-purpose engineering agent. Plans, investigates, implements, and tracks work |
| | [`@eng-plan`](src/agents/eng-plan.agent.md) | Planning-only mode. Researches and produces objectives without editing code |
| **Prompts** | [`/eng-init`](src/prompts/eng-init.prompt.md) | Bootstrap `.eng/` structure in a new project (run once per repo) |
| | [`/eng-status`](src/prompts/eng-status.prompt.md) | Dashboard view of active objectives and progress |
| | [`/eng-done`](src/prompts/eng-done.prompt.md) | Wrap up current task. Update progress and commit |
| | [`/eng-fix`](src/prompts/eng-fix.prompt.md) | Validate, migrate, backfill, or repair `.eng/` documentation |
| | [`/eng-retro`](src/prompts/eng-retro.prompt.md) | End-of-session retrospective. Collect mistakes, gaps, and positives |
| | [`/eng-retro-analysis`](src/prompts/eng-retro-analysis.prompt.md) | Cross-session pattern analysis across multiple retros |
| **Skills** | [`eng-docs`](src/skills/eng-docs/SKILL.md) | `.eng/` documentation system: objective templates, findings format, naming conventions |
| | [`eng-retro`](src/skills/eng-retro/SKILL.md) | Retrospective system: collection template, severity rubric, category taxonomy |
| **Hooks** | PreCompact | Checkpoint before context compaction. Flushes objectives and decisions to disk |
| **Instructions** | [`preferences.instructions.md`](src/instructions/preferences.instructions.md) | Universal coding preferences: style, naming, git conventions |

## How It Works

There are a few layers, but they're all just markdown files:

- **`preferences.instructions.md`** sets coding style, naming, git conventions. Applies everywhere.
- **`eng.agent.md`** and **`eng-plan.agent.md`** are the agent definitions. They have the behavioral rules: when to ask, when to just do it, how much to research before acting.
- **Skills** (`eng-docs`, `eng-retro`) give the agent domain knowledge about `.eng/` file formats. It loads these on demand.
- Then there's the **per-repo stuff** — `.eng/objectives/`, `.eng/findings/`, `.eng/retros/`. This is where the agent reads what's been done and figures out what's next.

> [!NOTE]
> `.eng/` is gitignored by default. It's local working memory, not project source code.

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

Before running `build`, you can optionally customize `config.json` to inject MCP server tools or any other tools into the agents. Copy `config.example.json` to `config.json` and add tools under the `tools` key. Use `*` for all agents or a specific agent name:

```json
{
  "tools": {
    "*": ["mcp_my-server_someTool"],
    "eng-plan": ["vscode.mermaid-chat-features/renderMermaidDiagram"]
  }
}
```

`build` reads this config and injects the tools into agent frontmatter.

You can also add tools at runtime. When chatting with `@eng` or `@eng-plan`, click the **tools** icon in the chat input, toggle on any MCP servers or built-in tools you want, and save. This doesn't require a rebuild.

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

> [!IMPORTANT]
> Install on your **local/client machine**, the one running VS Code. If you use Remote SSH, you currently need to install on **both the client and the remote** due to a [VS Code bug](https://github.com/microsoft/vscode/issues/293768). This should eventually be client-side only.

### Configuration

`config.json` also supports:

- `installDir`: override the default `~/.copilot/engagent` location

### Update

```bash
git pull
node cli.mjs build
```

Symlinks mean no reinstall. The build step is enough.

### Uninstall

```bash
node cli.mjs uninstall
```

Removes the symlink and VS Code settings entries.

## Quick Start

Once installed, in any VS Code workspace:

1. **`/eng-init`:** scaffold `.eng/` in your project (once per repo)
2. **`@eng-plan`:** define an objective, research the problem, plan tasks
3. **`@eng`:** implement tasks from the active objective
4. **`/eng-done`:** wrap up, update progress, commit
5. **`/eng-retro`:** collect observations at end of session

For ongoing work, `@eng` reads `.eng/objectives/` to pick up where you left off. Use `/eng-status` for a quick dashboard.

## Hooks (Experimental)

The PreCompact hook fires before VS Code compacts the conversation context. It reminds the agent to flush in-progress state to `.eng/objectives/` so work survives compaction.

Hooks are installed automatically by `/eng-init` and live in `.github/hooks/hooks.json`. To disable, delete the file or remove the hook entry. See [VS Code hooks documentation](https://code.visualstudio.com/docs/copilot/chat/chat-hooks) for format details.

Additional hooks (pre-flight checks, terminal output handling, session start) are planned but not yet validated.

## Roadmap

### What's next

- **Better hook coverage:** session start, pre-flight checks, terminal output handling. Still figuring out what hooks can and can't do well.
- **Install improvements:** more customization options during install. Right now preferences ship as-is; you should be able to bring your own.
- **Agent personality:** soul files, tone customization, that kind of thing. The agents are functional but generic. It'd be fun to make them yours.
- **Smarter mistake capture:** automatic frustration detection, "why did you do that?" prompts that feed into the retro system without a manual `/eng-retro` step.
- **Dedicated research agent:** research mode has become one of the most useful parts of this system. A purpose-built research agent would take that further.
- **More borrowed patterns:** still watching projects like [Get Shit Done](https://github.com/gsd-build/get-shit-done/), [GitHub Spec Kit](https://github.com/github/spec-kit), and others for ideas worth pulling in.

### On the horizon

- **`.eng/` backup and sync:** right now `.eng/` is gitignored, which means it's local-only. That's dangerous. Looking at integrations with GitHub and Azure DevOps to store or back up `.eng/` contents. Maybe an MCP server, maybe something else. I don't know.

## Contributing

This is a solo project in active development. If you find it useful or have ideas, open an issue. Pull requests welcome for bug fixes; for new features, open an issue first to discuss.

The retro system is how this project evolves. Run `/eng-retro` after your sessions, look at what patterns emerge with `/eng-retro-analysis`, and if you find improvements to the agents, prompts, or skills — that's a contribution. Fork, run the loop on your own projects, and send back what works.

## License

MIT
