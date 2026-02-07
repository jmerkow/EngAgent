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

Clone this repo, then run the install script for your OS. The script copies agents, prompts, and skills into your VS Code User profile directory where they're auto-discovered in every workspace.

### Windows (PowerShell)

```powershell
git clone https://github.com/jmerkow/EngAgent.git
cd EngAgent
.\install.ps1
```

### macOS / Linux

```bash
git clone https://github.com/jmerkow/EngAgent.git
cd EngAgent
./install.sh
```

> **Note:** Run the install script on your **local machine** (where VS Code is installed), not on a remote SSH host. VS Code discovers agents/prompts from the client-side User profile, so they'll be available on all remotes automatically.

The install scripts will **overwrite** existing files with the same name (e.g., if you already have an `eng-plan.prompt.md` in your UserData, it gets replaced). Files that aren't in this repo are left untouched — your personal prompts and agents are safe.

## Update

```bash
git pull
# then re-run install.ps1 or install.sh
```

## How It Works

VS Code auto-discovers `.agent.md`, `.prompt.md`, and `SKILL.md` files from its User profile directory:

| OS | Path |
|---|---|
| Windows | `%APPDATA%\Code\User\{agents,prompts,skills}\` |
| macOS | `~/Library/Application Support/Code/User/{agents,prompts,skills}/` |
| Linux | `~/.config/Code/User/{agents,prompts,skills}/` |

The install script copies from `.github/{agents,prompts,skills}/` in this repo into the appropriate location. No VS Code settings changes needed.

## Usage

Once installed, in any VS Code workspace:

- **`@eng`** — chat with the engineering agent
- **`/eng-plan`** — create or revise an engineering plan
- **`/eng-go`** — pick up a plan and execute tasks
- **`/eng-learn`** — research mode, investigation without code changes
- **`/eng-status`** — quick progress check
- **`/eng-fix`** — diagnose and fix a problem

The agent uses `.eng/` directories in your project for structured documentation. See the [eng-docs skill](.github/skills/eng-docs/SKILL.md) for the full reference.
