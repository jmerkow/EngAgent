# EngAgent

> **⚠️ Work in progress.** This project is under active development. Things may change.

A portable engineering agent for VS Code. Provides `@eng` agent, `/eng-*` prompts, and the `eng-docs` skill for structured engineering documentation.

## What's Included

| Type | Files | What it does |
|---|---|---|
| **Agent** | `eng.agent.md` | `@eng` — general-purpose engineering agent for planning, investigating, implementing, and tracking work |
| **Prompts** | `eng-plan.prompt.md` | `/eng-plan` — create or revise a plan |
| | `eng-go.prompt.md` | `/eng-go` — execute tasks from a plan |
| | `eng-learn.prompt.md` | `/eng-learn` — research and investigate |
| | `eng-status.prompt.md` | `/eng-status` — check progress |
| | `eng-fix.prompt.md` | `/eng-fix` — diagnose and fix issues |
| **Skill** | `eng-docs/SKILL.md` | Structured `.eng/` documentation system — plan templates, log formats, naming conventions |

## Install

Clone this repo, then run the install script for your OS. The script copies agents, prompts, and skills into `~/.copilot/engagent/` and registers that location in VS Code's settings so everything is auto-discovered in every workspace.

### Windows (PowerShell)

```powershell
git clone https://github.com/jmerkow/EngAgent.git
cd EngAgent
.\install.ps1
```

### macOS / Linux

> **⚠️ Untested.** The bash install script has not been verified on macOS or Linux yet. It should work, but please report issues if you run into problems.

```bash
git clone https://github.com/jmerkow/EngAgent.git
cd EngAgent
./install.sh
```

> **Note:** The bash script requires `jq` for VS Code settings registration. If `jq` isn't installed, files are still copied but you'll need to add the settings manually (the script prints the required entries).

> **Note:** Run the install script on your **local/client machine** — the one where VS Code itself is running. If you work over Remote SSH, Dev Containers, or WSL, install on the **client side only**, not on the remote host. VS Code reads agents, prompts, skills, and settings from the client's user profile, so they'll be available across all remote sessions automatically.

The install scripts are **idempotent** — re-running copies the latest files and only touches settings entries that aren't already present.

## Update

```bash
git pull
# then re-run install.ps1 or install.sh
```

## How It Works

The install script copies `.github/{agents,prompts,skills}/` from this repo into `~/.copilot/engagent/` and registers three VS Code settings:

```jsonc
{
    "chat.agentFilesLocations":  { "~/.copilot/engagent/agents": true },
    "chat.promptFilesLocations": { "~/.copilot/engagent/prompts": true },
    "chat.agentSkillsLocations": { "~/.copilot/engagent/skills": true }
}
```

This keeps EngAgent files self-contained in one directory, separate from your personal prompts and agents. VS Code discovers the files via these custom location settings.

## Usage

Once installed, in any VS Code workspace:

- **`@eng`** — chat with the engineering agent
- **`/eng-plan`** — create or revise an engineering plan
- **`/eng-go`** — pick up a plan and execute tasks
- **`/eng-learn`** — research mode, investigation without code changes
- **`/eng-status`** — quick progress check
- **`/eng-fix`** — diagnose and fix a problem

The agent uses `.eng/` directories in your project for structured documentation. See the [eng-docs skill](.github/skills/eng-docs/SKILL.md) for the full reference.
