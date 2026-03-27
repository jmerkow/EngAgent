# EngAgent

A portable agent system for GitHub Copilot in VS Code. Gives your AI agent a place to write things down, learn from mistakes, and pick up where it left off.

EngAgent creates `.eng/` directories in your projects, plain markdown files where the agent tracks objectives, captures findings, and logs what went wrong. It also includes agents and skills that know how to use those files. The idea is that each session builds on the last one instead of starting from scratch.

## Why EngAgent?

This project grew out of my own experience working with AI agents daily. I'd been collecting learnings, tweaking prompts, and building up informal patterns over time — and eventually decided to pull it all together into something more structured and reusable.

The guiding principle: **control and transparency**. I wanted to understand exactly what my agent system was doing, not have some massive project running a bunch of things behind the scenes. At the same time, I wanted it to actually be useful, to help me keep track of work across sessions and projects. I think this is a good starting point for anyone who wants structure around AI-assisted coding without handing the reins over completely.

I didn't know about the bigger projects in this space until after I'd already started. Early versions of EngAgent grew organically, and then I used the `@eng` agent itself to research projects like [Get Shit Done](https://github.com/gsd-build/get-shit-done/), [GitHub Spec Kit](https://github.com/github/spec-kit), and [Awesome Copilot](https://github.com/github/awesome-copilot). I incorporated the patterns that fit my pain points, things I'd identified through running retrospectives on my own sessions. Those are great projects and worth checking out. The space is crowded, and I don't expect a ton of usage here, but if anyone finds EngAgent useful I'd love to hear about it.

What makes EngAgent different:

- **Nothing hidden.** The repo is simple. You can follow exactly what's going on by reading the agents and skills. No layers of orchestration, no magic.
- **Retro-driven improvement.** After each session, run `/eng-retro` to capture what went wrong. Periodically, run the retro-analysis workflow in `/eng-retro` to surface recurring patterns across sessions. You use those patterns to refine the agent's behavioral rules. It's a manual loop — you decide what changes, but it compounds over time.
- **Portable across projects.** Install once, use everywhere. No per-repo setup beyond a quick `/eng-docs` scaffold pass.
- **You stay in control.** Three main agents (`@eng`, `@eng-plan`, and `@eng-code`) plus a small set of focused skills. No multi-agent swarms or autonomous pipelines. You see what the agent is doing and decide when to proceed.
- **Not just for code.** I use this for blog posts, sample repos, data science work, ML training runs, and general project tracking. The bigger tools in this space are geared toward production software teams. This works for anything you'd want an AI agent to help you think through and keep track of.
- **Research discipline.** The agent is told to actually look things up before acting. There are rules for when to stop researching, when to ask, and when it's gone down a rabbit hole too long.
- **Filesystem as memory.** `.eng/` directories are plain markdown, inspectable, diffable. No databases, no external services.
- **A place to learn.** This is also where I learn about the AI agent ecosystem.

## What's Included

| Type | Name | Purpose |
|---|---|---|
| **Agents** | [`@eng`](src/agents/eng.agent.md) | Utility work, verification, and whiteboard direct-execute tasks |
| | [`@eng-plan`](src/agents/eng-plan.agent.md) | Whiteboard exploration, scoping, design, and implementation planning |
| | [`@eng-code`](src/agents/eng-code.agent.md) | Implementation orchestrator for approved objectives |
| **Skills** | [`eng-docs`](src/skills/eng-docs/SKILL.md) | `.eng/` schemas, whiteboards, init scaffold workflow, mistake capture |
| | [`eng-workflow`](src/skills/eng-workflow/SKILL.md) | Phase rules, gates, and objective kickoff guidance |
| | [`eng-review`](src/skills/eng-review/SKILL.md) | Gate review, verification, and final sign-off |
| | [`eng-check`](src/skills/eng-check/SKILL.md) | Validation, migration, backfill, and repair for `.eng/` docs |
| | [`eng-push`](src/skills/eng-push/SKILL.md) | EngDirs init, commit/push, and sync lifecycle |
| | [`eng-retro`](src/skills/eng-retro/SKILL.md) | Retrospective collection and cross-session analysis |
| | [`journal`](src/skills/journal/SKILL.md) | Append-only work event log for key milestones and decisions |
| **Hooks** | PreCompact | Checkpoint before context compaction. Flushes objectives and decisions to disk |
| **Instructions** | [`preferences-coding`](preferences-coding.example.instructions.md) | Code quality, naming, and style rules |
| | [`preferences-universal`](preferences-universal.example.instructions.md) | Workflow, output, git, and collaboration conventions |

## The Library

[`docs/the-library/`](docs/the-library/README.md) is a curated knowledge base on AI agent frameworks, VS Code Copilot customization, and cross-cutting patterns. Built from research conducted while developing EngAgent — distilled into self-contained docs that anyone can read.

## How It Works

There are a few layers, but they're all just markdown files:

- **`preferences-coding.instructions.md`** and **`preferences-universal.instructions.md`** set coding style, naming, git conventions. Applies everywhere. These ship as defaults you can customize (see below).
- **`eng.agent.md`**, **`eng-plan.agent.md`**, and **`eng-code.agent.md`** define the main behaviors: whiteboard exploration, planning, implementation, verification, and utility work.
- **Skills** (`eng-docs`, `eng-workflow`, `eng-review`, `eng-retro`, and others) provide the domain procedures: schemas, gate logic, review workflows, and maintenance tasks.
- Then there's the **per-repo stuff** — `.eng/whiteboard/`, `.eng/objectives/`, `.eng/findings/`, `.eng/retros/`. This is where the agent reads what's been done and figures out what's next.

> [!NOTE]
> `.eng/` is gitignored by default. It's local working memory, not project source code.

### The `.eng/` directory

```
<project-root>/
└── .eng/
    ├── whiteboard/     # exploratory work before objective creation or direct execution
    ├── objectives/     # tracked work items (the central hub)
    ├── designs/        # separate design docs for complex work
    ├── findings/       # investigation results and analysis
    ├── mistakes/       # detailed mistake write-ups
    ├── retros/         # per-session retrospectives
    ├── scratch/        # ad-hoc notes, drafts, working files
    └── archive/        # completed or superseded docs
```

Use `/eng-docs` and follow the init scaffold workflow to set this up in any project. See [AGENTS.md](AGENTS.md) for the full inventory of agents, skills, hooks, and instructions.

## Install

Requires [Node.js](https://nodejs.org/) (18+).

```bash
git clone https://github.com/jmerkow/EngAgent.git
cd EngAgent
node cli.mjs build
node cli.mjs install
```

Before running `build`, you can optionally customize two things:

**Tools** — Copy `config.example.json` to `config.json` and add MCP server tools or other tools under the `tools` key. Use `*` for all agents or a specific agent name:

```json
{
  "tools": {
    "*": ["mcp_my-server_someTool"],
    "eng-plan": ["vscode.mermaid-chat-features/renderMermaidDiagram"]
  }
}
```

`build` reads this config and injects the tools into agent frontmatter.

**Preferences** — The preference instruction files ship as `.example.` defaults at the repo root. To customize, copy and edit:

```bash
cp preferences-coding.example.instructions.md preferences-coding.instructions.md
cp preferences-universal.example.instructions.md preferences-universal.instructions.md
# Edit to taste
```

Your copies are gitignored and won't be overwritten by `git pull`. The build uses your version when present, otherwise falls back to the shipped default.

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

VS Code discovers agents, skills, and instructions from these paths in every workspace. The prompt path is still registered for user-added prompt files, but EngAgent itself no longer ships workflow prompts.

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

1. **`/eng-docs`:** scaffold `.eng/` in your project and start from a whiteboard
2. **`@eng-plan`:** explore on the whiteboard, then scope, design, and plan tracked work
3. **`/eng-review`:** review gates, verify deliverables, and do final sign-off
4. **`@eng-code`:** implement approved objectives
5. **`/eng-retro`:** collect observations and analyze patterns across sessions

For ongoing work, `@eng`, `@eng-plan`, and `@eng-code` read `.eng/objectives/` and `.eng/whiteboard/` to pick up where they left off.

## Hooks (Experimental)

The PreCompact hook fires before VS Code compacts the conversation context. It reminds the agent to flush in-progress state to `.eng/objectives/` so work survives compaction.

Hooks are installed automatically by the init scaffold workflow in `/eng-docs` and live in `.github/hooks/hooks.json`. To disable, delete the file or remove the hook entry. See [VS Code hooks documentation](https://code.visualstudio.com/docs/copilot/chat/chat-hooks) for format details.

Additional hooks (pre-flight checks, terminal output handling, session start) are planned but not yet validated.

## Roadmap

### What's next

- **Better hook coverage:** session start, pre-flight checks, terminal output handling. Still figuring out what hooks can and can't do well.
- **Install improvements:** more customization options during install. ~~Right now preferences ship as-is; you should be able to bring your own.~~ Preferences are now customizable via the `.example.` pattern.
- **Agent personality:** soul files, tone customization, that kind of thing. The agents are functional but generic. It'd be fun to make them yours.
- **Smarter mistake capture:** automatic frustration detection and better mistake-routing into the retro system without extra prompting.
- **Dedicated research agent:** research mode has become one of the most useful parts of this system. A purpose-built research agent would take that further.
- **More borrowed patterns:** still watching projects like [Get Shit Done](https://github.com/gsd-build/get-shit-done/), [GitHub Spec Kit](https://github.com/github/spec-kit), and others for ideas worth pulling in.

### On the horizon

- **`.eng/` backup and sync:** right now `.eng/` is gitignored, which means it's local-only. That's dangerous. Looking at integrations with GitHub and Azure DevOps to store or back up `.eng/` contents. Maybe an MCP server, maybe something else. I don't know.

## Contributing

This is a solo project in active development. If you find it useful or have ideas, open an issue. Pull requests welcome for bug fixes; for new features, open an issue first to discuss.

The retro system is how this project evolves. Run `/eng-retro` after your sessions, use its analysis workflow to look for patterns, and if you find improvements to the agents or skills — that's a contribution. Fork, run the loop on your own projects, and send back what works.

## License

MIT
