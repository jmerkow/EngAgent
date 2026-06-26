#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.10"
# dependencies = ["pyyaml"]
# ///

"""Snapshot, check, and diff agent tool/model state.

Pass agent files or directories to scope the run. With no paths, the enclosing
plugin's agents directory is used. State is merged into the JSON store, so saving
a subset updates only those agents and leaves the rest intact.
"""

import argparse
import json
import sys
from pathlib import Path

import yaml

STATE_PATH = Path.home() / ".engflow" / "agent-states.json"


def find_plugin_agents_dir() -> Path:
    for directory in [Path(__file__).resolve().parent, *Path(__file__).resolve().parents]:
        manifest = directory / "plugin.json"
        if manifest.exists():
            config = json.loads(manifest.read_text())
            return directory / config.get("agents", "agents/")
    sys.exit("No paths given and no plugin.json found above the script.")


def collect_files(paths: list[str]) -> list[Path]:
    if not paths:
        paths = [str(find_plugin_agents_dir())]
    files = []
    for raw in paths:
        path = Path(raw)
        if path.is_dir():
            files.extend(sorted(path.rglob("*.agent.md")))
        elif path.is_file():
            files.append(path)
        else:
            sys.exit(f"Path not found: {raw}")
    return files


def read_agents(paths: list[str]) -> dict:
    agents = {}
    for path in collect_files(paths):
        front = yaml.safe_load(path.read_text().split("---", 2)[1]) or {}
        name = front.get("name") or path.name.removesuffix(".agent.md")
        agents[name] = {
            "tools": sorted(front.get("tools") or []),
            "model": front.get("model") or None,
        }
    return agents


def read_state() -> dict:
    if STATE_PATH.exists():
        return json.loads(STATE_PATH.read_text())
    return {}


def diff(saved: dict, current: dict, detect_removed: bool) -> list[str]:
    names = set(current) | (set(saved) if detect_removed else set())
    out = []
    for name in sorted(names):
        before, after = saved.get(name), current.get(name)
        if before is None:
            out.append(f"{name}: added")
        elif after is None:
            out.append(f"{name}: removed")
        elif before != after:
            out.append(f"{name}: changed {before} -> {after}")
    return out


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=["save", "check", "diff"])
    parser.add_argument("--all", action="store_true", help="Check all agents (default when no paths are passed).")
    parser.add_argument("paths", nargs="*", help="Agent files or directories. Default: this plugin's agents.")
    args = parser.parse_args()

    if args.all:
        args.paths = []

    current = read_agents(args.paths)
    scoped = bool(args.paths)

    if args.command == "save":
        state = read_state()
        state.update(current)
        STATE_PATH.parent.mkdir(parents=True, exist_ok=True)
        STATE_PATH.write_text(json.dumps(state, indent=2, sort_keys=True) + "\n")
        print(f"Saved {len(current)} agents ({len(state)} total) to {STATE_PATH}")
        return

    if not STATE_PATH.exists():
        sys.exit(f"No baseline. Run save first: {STATE_PATH}")
    changes = diff(read_state(), current, detect_removed=not scoped)

    if args.command == "diff":
        print("\n".join(changes) if changes else "No differences.")
        return

    print("State: clean" if not changes else "State: drift")
    for change in changes:
        print(f"- {change}")


if __name__ == "__main__":
    main()
