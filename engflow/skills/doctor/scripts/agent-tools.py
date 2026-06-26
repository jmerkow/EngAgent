#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.10"
# dependencies = ["pyyaml"]
# ///

"""Safely manipulate agent-file frontmatter.

The right way to edit an agent's frontmatter is to parse it as YAML, mutate the
keys you care about, and dump it back, preserving every other key and its order.
String/regex surgery on the raw text drops sibling keys (agents, model, handoffs)
and corrupts list blocks. This script does the YAML round-trip for you.

Commands:
  get      Print an agent's frontmatter as JSON.
  set      Replace a frontmatter key's value (tools, model, etc.).
  expand   Expand toolset names to leaf tool IDs (BFS) and write them to `tools`.

`tools` and `agents` are written as flow lists (["a", "b"]); other lists stay block.
"""

import argparse
import json
import re
import sys
from collections import deque
from pathlib import Path

import yaml


class FlowList(list):
    """List dumped in YAML flow style: [a, b, c]."""


def _flow_list_rep(dumper, data):
    return dumper.represent_sequence("tag:yaml.org,2002:seq", data, flow_style=True)


yaml.SafeDumper.add_representer(FlowList, _flow_list_rep)

FLOW_KEYS = {"tools", "agents"}


def split_frontmatter(text: str) -> tuple[dict, str]:
    """Return (frontmatter_dict, body_text). Raises if no frontmatter."""
    start = text.index("---")
    end = text.index("\n---", start + 3)
    front = yaml.safe_load(text[start + 3 : end]) or {}
    body = text[end + 4 :].lstrip("\n")
    return front, body


def dump_agent(front: dict, body: str) -> str:
    out = {k: (FlowList(v) if k in FLOW_KEYS and isinstance(v, list) else v) for k, v in front.items()}
    dumped = yaml.safe_dump(out, sort_keys=False, allow_unicode=True, width=10**9, default_flow_style=False)
    return "---\n" + dumped + "---\n" + body


def load_toolsets(path: Path) -> dict:
    text = path.read_text(encoding="utf-8")
    text = re.sub(r"//[^\n]*", "", text)            # strip // comments
    text = re.sub(r",(\s*[}\]])", r"\1", text)      # strip trailing commas
    return json.loads(text)


def expand_toolsets(toolsets: dict, start_keys: list[str]) -> list[str]:
    """BFS over toolset references; return ordered, de-duplicated leaf tool IDs."""
    seen_sets: set[str] = set()
    seen_leaves: set[str] = set()
    leaves: list[str] = []
    queue = deque(start_keys)
    while queue:
        item = queue.popleft()
        if item in toolsets:
            if item in seen_sets:
                continue
            seen_sets.add(item)
            queue.extend(toolsets[item].get("tools", []))
        elif item not in seen_leaves:
            seen_leaves.add(item)
            leaves.append(item)
    return leaves


def _parse_value(raw: str):
    """Comma list -> list; otherwise YAML-scalar parse."""
    if "," in raw:
        return [v.strip() for v in raw.split(",") if v.strip()]
    return yaml.safe_load(raw)


def cmd_get(args):
    front, _ = split_frontmatter(Path(args.agent).read_text(encoding="utf-8"))
    print(json.dumps(front, indent=2, ensure_ascii=False))


def cmd_set(args):
    path = Path(args.agent)
    front, body = split_frontmatter(path.read_text(encoding="utf-8"))
    front[args.key] = _parse_value(args.value)
    path.write_text(dump_agent(front, body), encoding="utf-8")
    print(f"set {args.key} on {path.name}")


def cmd_expand(args):
    path = Path(args.agent)
    leaves = expand_toolsets(load_toolsets(Path(args.toolsets)), [k.strip() for k in args.keys.split(",")])
    front, body = split_frontmatter(path.read_text(encoding="utf-8"))
    front["tools"] = leaves
    path.write_text(dump_agent(front, body), encoding="utf-8")
    print(f"expanded {len(leaves)} tools into {path.name}")


def main():
    parser = argparse.ArgumentParser(description="Safely manipulate agent-file frontmatter.")
    sub = parser.add_subparsers(dest="command", required=True)

    g = sub.add_parser("get", help="Print frontmatter as JSON.")
    g.add_argument("agent")
    g.set_defaults(func=cmd_get)

    s = sub.add_parser("set", help="Replace a frontmatter key's value.")
    s.add_argument("agent")
    s.add_argument("key")
    s.add_argument("value", help="Scalar, or comma-separated list.")
    s.set_defaults(func=cmd_set)

    e = sub.add_parser("expand", help="Expand toolset names to leaf tools and write to `tools`.")
    e.add_argument("agent")
    e.add_argument("--toolsets", required=True, help="Path to *.toolsets.jsonc")
    e.add_argument("--keys", required=True, help="Comma-separated toolset names, e.g. ~ask,~common")
    e.set_defaults(func=cmd_expand)

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
