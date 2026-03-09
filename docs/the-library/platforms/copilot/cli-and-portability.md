# CLI and Portability

Platforms: GitHub Copilot (VS Code, CLI, GitHub.com)

> How GitHub Copilot's extensibility spans three agentic surfaces — VS Code, a standalone CLI, and the GitHub.com coding agent — with the `.github/` directory as the primary convergence layer, and where configuration still diverges. Covers the shared config format, user-level path differences, the Agent Plugins distribution system, and a practical portability strategy.
>
> **Key concepts:** `.github/` shared layer, Copilot CLI (`copilot`), Agent Plugins, `plugin.json`, three-tier portability strategy, `~/.copilot/` user directory, MCP config divergence, `COPILOT_CUSTOM_INSTRUCTIONS_DIRS`, marketplace registries

## Overview

GitHub Copilot's extensibility story has split into two agentic surfaces that now share a growing set of portable configuration formats. VS Code's agent mode (1.109+) and the standalone Copilot CLI (GA February 25, 2026 [1]) both support custom agents, skills, MCP servers, hooks, and the emerging plugin system. The GitHub.com coding agent shares much of the same `.github/`-based configuration [2]. The old `gh copilot suggest/explain` extension was deprecated in October 2025 and replaced by the full agentic CLI tool [1].

The key architectural insight: three layers of extensibility exist — file-based instructions (portable, passive context), agent skills (portable, on-demand capabilities), and MCP servers (universal, external tool integration) [3]. The `.github/` directory is the convergence point. What remains fragmented is the user-level configuration layer and MCP server locations.

## Shared Configuration

The `.github/` directory is the single most important portability layer. Both VS Code and Copilot CLI read from the same repository-level files [4][5]:

**Always-on instructions.** `.github/copilot-instructions.md` loads into every request on both surfaces. Both also recognize `AGENTS.md` at the repo root (an open standard also used by Claude Code, Cursor, and Gemini CLI) and `CLAUDE.md` for cross-tool compatibility [4][5]. The `/init` command in both environments auto-generates `copilot-instructions.md` tailored to the codebase's detected patterns [4].

**Conditional instructions.** `.instructions.md` files in `.github/instructions/` with YAML frontmatter `applyTo` glob patterns work on both surfaces. A file with `applyTo: "**/*.tsx"` injects React conventions only when working with matching files [4][5].

**Custom agents.** `.agent.md` files with YAML frontmatter (`name`, `description`, `tools`, optionally `model` and `handoffs`) live in `.github/agents/`. The format is identical across surfaces — a single file works in both VS Code and the CLI [6][5].

**Agent skills.** Self-contained folders with a `SKILL.md` file in `.github/skills/`. Skills are the most portable extensibility primitive — they work across all three surfaces: VS Code, Copilot CLI, and the GitHub.com coding agent [7][8].

**Hooks.** Lifecycle automation via `.github/hooks/` (preview). Both surfaces support the same hook format [3].

**Prompt files.** `.prompt.md` files in `.github/prompts/` are confirmed for VS Code, Visual Studio, and JetBrains but not yet confirmed for the CLI [3].

## Where Configuration Diverges

### User-level paths

The surfaces use different locations for personal configuration:

| Content | VS Code | Copilot CLI |
|---|---|---|
| User instructions | Settings Sync ("Prompts and Instructions") | `~/.copilot/copilot-instructions.md` |
| User agents | Configured via `chat.agentFilesLocations` | `~/.copilot/agents/` |
| User skills | Configured via `chat.agentSkillsLocations` | `~/.copilot/skills/` |
| General config | `settings.json` + profiles | `~/.copilot/config.json` |

There is no shared user-level configuration file between them [4][9]. VS Code settings like `github.copilot.chat.codeGeneration.instructions` are VS Code-only and flagged for potential deprecation [4].

### MCP server configuration

VS Code configures MCP servers in `.vscode/mcp.json` (supporting stdio, HTTP, SSE, and Unix socket transports). The CLI uses `~/.copilot/mcp-config.json` for user-level servers and `./copilot/mcp-config.json` for project-level ones — different file locations but compatible server definitions [9][3].

VS Code's MCP integration is more mature: it offers an MCP Gallery (`@mcp` in Extensions view) powered by the GitHub MCP Registry, auto-discovery of servers from other apps, and MCP Apps rendering interactive UI in chat [3]. The CLI provides `/mcp add` for interactive setup and `--additional-mcp-config` for loading extra configurations [9].

### CLI path configurability is limited

VS Code offers granular path control via `chat.instructionsFilesLocations`, `chat.agentFilesLocations`, `chat.agentSkillsLocations`, and `chat.promptFilesLocations`. The CLI has no direct equivalents for most of these [9]:

| VS Code setting | CLI equivalent | Coverage |
|---|---|---|
| `chat.instructionsFilesLocations` | `COPILOT_CUSTOM_INSTRUCTIONS_DIRS` | Partial — `.instructions.md` and `AGENTS.md` only |
| `chat.agentSkillsLocations` | None | Skills only from hardcoded paths |
| `chat.agentFilesLocations` | None | Agents only from hardcoded paths |
| `chat.promptFilesLocations` | None | No equivalent |

`COPILOT_CUSTOM_INSTRUCTIONS_DIRS` accepts a comma-separated list of directories but covers only instruction files and `AGENTS.md` — not skills, agents, or MCP configurations [5]. Setting `XDG_CONFIG_HOME` redirects the entire `~/.copilot` tree, which is the only way to relocate user-level skills and agents [9]. An open issue (github/copilot-cli#1440) requests expanded path configurability [10].

### Surface-exclusive features

**CLI-only:** Autopilot mode (fully autonomous execution), `/fleet` for parallel subagents, `/delegate` and the `&` prefix for cloud coding agent delegation, Esc-Esc rewind, and `copilot -p "prompt"` single-prompt mode for CI/CD [1][9].

**VS Code-only:** Chat Customizations Editor, MCP Gallery, MCP Apps, inline code suggestions and Next Edit Suggestions, visual diff integration, `handoffs` for multi-agent orchestration, and Settings Sync for cross-device instruction syncing [3][6].

## Agent Plugins

Agent Plugins (preview, VS Code 1.110, February 2026 [11]) are prepackaged bundles that can include custom agents, skills, slash commands, hooks, and MCP server configurations — everything needed to distribute a complete workflow [11].

### The plugin.json manifest

The minimum requirement is a `plugin.json` with a `name` field. Optional fields include `description`, `version`, `author`, `homepage`, `repository`, `license`, `keywords`, `category`, and `tags`. Path fields (`agents`, `skills`, `commands`, `hooks`, `mcpServers`) default to conventional directories but can be overridden [12][13]:

```json
{
  "name": "eng-agent",
  "description": "Engineering productivity tools",
  "version": "1.0.0",
  "agents": "agents/",
  "skills": ["skills/", "extra-skills/"],
  "hooks": "hooks.json",
  "mcpServers": ".mcp.json"
}
```

The CLI searches for `plugin.json` in three locations: `.github/plugin/plugin.json`, `.claude-plugin/plugin.json`, and the repository root [12].

### Three installation methods

**Direct repo install (CLI).** `copilot plugin install owner/repo` clones any GitHub repo and registers it. Subdirectory plugins use colon syntax: `copilot plugin install owner/repo:path/to/plugin`. Installed plugins land in `~/.copilot/installed-plugins/_direct/` [12][13].

**Marketplace registries.** `chat.plugins.marketplaces` in VS Code points to Git repos containing a `marketplace.json` registry listing multiple plugins. Default marketplaces include `github/copilot-plugins` and `github/awesome-copilot` (21,000+ stars) [11][14]. The CLI equivalent is `copilot plugin marketplace add owner/repo` [12].

**Local registration (VS Code).** `chat.plugins.paths` registers local directories as plugins for development [11]:

```json
"chat.plugins.paths": {
    "/home/user/repos/my-plugin": true
}
```

### Plugin management

The CLI provides full lifecycle commands: `plugin list`, `plugin update`, `plugin uninstall`, `plugin marketplace browse`, and `plugin marketplace remove` [12][13]. Deduplication follows first-found-wins for agents and skills (project-level overrides plugin-level) and last-wins for MCP servers [12].

### Distribution status

No npm-equivalent package manager exists for Copilot configurations. The plugin system lacks formal dependency resolution and semantic versioning. Distribution is primarily Git-based — clone, fork, or reference a marketplace repo [3]. VS Code extensions can also contribute skills via a `chatSkills` contribution point in `package.json` [7].

## Portability Strategy

The practical approach for portable Copilot configurations uses a three-tier strategy:

### Tier 1: Repository-level `.github/` (works everywhere)

Maximize what lives in `.github/`. Instructions, agents, skills, and hooks all work across VS Code, CLI, and the coding agent [4][5][7]. This is where cross-platform convergence is happening and should be the default location for shared configuration.

### Tier 2: User-level `~/.copilot/` (CLI native, VS Code configurable)

Use `~/.copilot/` for personal configurations. The CLI reads from it natively [5]. Configure VS Code's `chat.instructionsFilesLocations` and `chat.agentSkillsLocations` to also read from this directory for convergence [4][6]. This is a natural candidate for dotfiles management, though no community has yet established standard practices (chezmoi templates, stow configs) [3].

### Tier 3: Surface-specific overrides

Manage MCP server configurations separately per platform (`.vscode/mcp.json` vs `~/.copilot/mcp-config.json`). Use VS Code-only features (`handoffs`, inline suggestions) and CLI-only features (Autopilot, `/fleet`) where they add value, keeping the portable core in tiers 1–2 [9][3].

### Skills are the most portable primitive

Skills work on all three surfaces without modification [7][8]. They carry their own context (scripts, templates, examples) and activate via semantic matching or explicit invocation. For cross-surface extensibility, skills should be the primary investment target.

### Cross-surface compatibility gradient

| Feature | VS Code | CLI | Coding Agent | JetBrains |
|---|---|---|---|---|
| `.github/copilot-instructions.md` | Yes | Yes | Yes | Yes |
| `.instructions.md` (conditional) | Yes | Yes | Yes | No |
| `AGENTS.md` | Yes | Yes | Yes | No |
| Custom agents (`.agent.md`) | Yes | Yes | Yes | No |
| Agent skills (`SKILL.md`) | Yes | Yes | Yes | No |
| Hooks | Yes | Yes | Partial | No |
| Prompt files (`.prompt.md`) | Yes | No | No | Yes |
| Agent Plugins | Yes | Yes | No | No |
| MCP servers | Yes | Yes | Yes | Partial |

Copilot Memory — repo-scoped learned preferences that auto-expire after 28 days, on by default for Pro/Pro+ users as of March 4, 2026 [15] — is a novel form of cross-platform configuration requiring no file management.

## References

[1] [GitHub Copilot CLI Is Now Generally Available](https://github.blog/changelog/2026-02-25-github-copilot-cli-is-now-generally-available/) — GitHub Changelog, February 25, 2026
[2] [Copilot Code Review and Coding Agent Now Support Agent-Specific Instructions](https://github.blog/changelog/2025-11-12-copilot-code-review-and-coding-agent-now-support-agent-specific-instructions/) — GitHub Changelog, November 12, 2025
[3] [Making Agents Practical for Real-World Development](https://code.visualstudio.com/blogs/2026/03/05/making-agents-practical-for-real-world-development) — VS Code Blog, March 5, 2026
[4] [Use Custom Instructions in VS Code](https://code.visualstudio.com/docs/copilot/customization/custom-instructions) — VS Code Docs
[5] [Adding Custom Instructions for GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-custom-instructions) — GitHub Docs
[6] [Custom Agents in VS Code](https://code.visualstudio.com/docs/copilot/customization/custom-agents) — VS Code Docs
[7] [Use Agent Skills in VS Code](https://code.visualstudio.com/docs/copilot/customization/agent-skills) — VS Code Docs
[8] [Creating Agent Skills for GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/create-skills) — GitHub Docs
[9] [Configure GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/set-up-copilot-cli/configure-copilot-cli) — GitHub Docs
[10] [Allow Custom Path for Global copilot-instructions.md — Issue #1440](https://github.com/github/copilot-cli/issues/1440) — github/copilot-cli, February 13, 2026
[11] [Agent Plugins in VS Code (Preview)](https://code.visualstudio.com/docs/copilot/customization/agent-plugins) — VS Code Docs
[12] [Finding and Installing Plugins for GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/plugins-finding-installing) — GitHub Docs
[13] [GitHub Copilot CLI Plugin Reference](https://docs.github.com/en/copilot/reference/cli-plugin-reference) — GitHub Docs
[14] [github/awesome-copilot](https://github.com/github/awesome-copilot) — Community marketplace repository
[15] [GitHub Copilot in Visual Studio Code v1.110 — February Release](https://github.blog/changelog/2026-03-06-github-copilot-in-visual-studio-code-v1-110-february-release/) — GitHub Changelog, March 6, 2026

## See Also

- [Customization Overview](customization-overview.md) — The full VS Code building-block architecture (agents, instructions, skills, prompts, hooks, MCP, plugins, language models)
- [Instructions and Skills](instructions-and-skills.md) — Deep dive on activation models, layering cascade, and SKILL.md anatomy
- [Hooks and Lifecycle](hooks-and-lifecycle.md) — Deterministic lifecycle automation across surfaces
- [Subagents and Delegation](subagents-and-delegation.md) — The `runSubagent` tool and multi-agent orchestration patterns
