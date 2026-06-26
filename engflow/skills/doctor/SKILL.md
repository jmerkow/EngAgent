---
name: doctor
description: Save, compare, and diff installed EngFlow agent tool and model state, and safely edit agent-file frontmatter (set keys, expand toolsets). Use when checking whether installed agent state drifted from a baseline, or when editing an agent's tools/model/frontmatter. Keywords: doctor, save, check, diff, tool drift, model drift, agent state, edit agent frontmatter, expand toolsets, set tools.
---

# Doctor

Doctor snapshots installed agent frontmatter `tools` and `model` data, stores the baseline in `~/.engflow/agent-states.json`, and compares later runs against that baseline.

## Commands

Run the bundled script from the plugin root or any descendant directory:

```bash
uv run src/skills/doctor/scripts/agent-states.py save
uv run src/skills/doctor/scripts/agent-states.py check
uv run src/skills/doctor/scripts/agent-states.py diff
```

Pass one or more agent files or directories to scope the run:

```bash
uv run src/skills/doctor/scripts/agent-states.py check src/agents/eng-code.agent.md
uv run src/skills/doctor/scripts/agent-states.py diff src/agents/
uv run src/skills/doctor/scripts/agent-states.py save src/agents/eng.agent.md
```

The script declares its `pyyaml` dependency inline. `uv run` resolves it automatically.

`--all` is accepted by all commands for forward compatibility. It currently checks agents only.

## What each command does

- `save` records the current agent tool/model snapshot. When paths are provided, it updates only those agents in `~/.engflow/agent-states.json` and preserves the rest.
- `check` compares the current snapshot to the saved baseline and reports clean or drift. When paths are provided, it checks only those agents.
- `diff` prints per-agent tool and model differences against the saved baseline. When paths are provided, it diffs only those agents/directories.

## Manipulating agent files

To **edit** an agent's frontmatter (not just inspect it), use `agent-tools.py`. The VS Code
tools picker does not reliably write tool selections back into a `.agent.md` file, and raw
string/regex edits drop sibling keys (`agents`, `model`, `handoffs`) or corrupt list blocks.
This script parses the frontmatter as YAML, mutates only the keys you name, and dumps it back
with every other key and its order preserved. `tools` and `agents` are written as flow lists.

```bash
# Print an agent's frontmatter as JSON
uv run src/skills/doctor/scripts/agent-tools.py get src/agents/eng.agent.md

# Replace a key's value (scalar or comma-separated list)
uv run src/skills/doctor/scripts/agent-tools.py set src/agents/eng.agent.md model "Claude Opus 4.6 (copilot)"

# Expand toolset names to leaf tool IDs (BFS) and write them to `tools`
uv run src/skills/doctor/scripts/agent-tools.py expand src/agents/eng.agent.md \
  --toolsets ~/path/to/your.toolsets.jsonc --keys "~ask,~common,~internal,~personal"
```

`expand` resolves toolset references recursively (a toolset may reference other toolsets),
de-duplicates, and preserves order. Use it to keep an agent's `tools` in sync with a
`*.toolsets.jsonc` definition without hand-editing a long flat list.

## Notes

- Doctor reads the current plugin's `plugin.json`, resolves its `agents` path, and inspects the agent files found there.
- `agent-states.py` does not modify the installed plugin copy, rewrite frontmatter, or auto-fix issues. `agent-tools.py` is the explicit, opt-in way to edit frontmatter.