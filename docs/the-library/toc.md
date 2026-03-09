# Table of Contents

## Projects

- [GSD (Get Shit Done)](projects/gsd.md) — Meta-prompting framework for AI-assisted development with fresh-context-per-task execution and phased workflows
- [Squad](projects/squad.md) — Multi-agent team simulator for GitHub Copilot with persistent named specialists and filesystem-based shared memory
- [Spec Kit](projects/spec-kit.md) — GitHub's Spec-Driven Development toolkit that scaffolds structured specifications across 20+ AI coding agents
- [Awesome Copilot](projects/copilot-awesome.md) — GitHub's official community marketplace of agents, instructions, skills, hooks, plugins, and workflows for Copilot
- [Anthropic Skills](projects/anthropic-skills.md) — Anthropic's official reference skill implementations for Claude with 6 design archetypes and anti-slop philosophy
- [Claude Cookbooks](projects/claude-cookbooks.md) — Anthropic's official cookbook for Claude with agentic patterns, tool-restricted agents, and four-layer validation

## Platforms

### Copilot

- [Customization Overview](platforms/copilot/customization-overview.md) — The complete architecture of VS Code's Copilot customization system and its building blocks
- [Instructions and Skills](platforms/copilot/instructions-and-skills.md) — Activation models, layering cascade, SKILL.md anatomy, and content-based resolution
- [Hooks and Lifecycle](platforms/copilot/hooks-and-lifecycle.md) — Deterministic shell commands at 8 lifecycle events for security, quality, and audit
- [Subagents and Delegation](platforms/copilot/subagents-and-delegation.md) — The runSubagent tool, context isolation, and orchestration patterns
- [CLI and Portability](platforms/copilot/cli-and-portability.md) — How Copilot's extensibility spans VS Code, CLI, and GitHub.com — shared config, divergence points, Agent Plugins, and portability strategy
- [Settings Reference (v1.108–1.109)](platforms/copilot/references/settings-v1109.md) — Recommended VS Code Copilot settings for agent mode, diagnostic tools, and context management

## Landscape

- [Data Science Agents](landscape/data-science-agents.md) — AI agent systems for data science workflows: production systems, cloud platform integrations, scientific reasoning agents, and coverage gaps

## Patterns

- [Context Engineering](patterns/context-engineering.md) — Principles for filling the context window: budget management, progressive disclosure, AGENTS.md empirical evidence, and the summarization trap
- [Delegation and Subagents](patterns/delegation-and-subagents.md) — Cross-framework delegation patterns: thin orchestrators, context isolation, structured returns, parallel fan-out
- [Context and Persistence](patterns/context-and-persistence.md) — How frameworks persist state, manage context windows, handle session handoffs, and maintain memory
- [Behavioral Rules](patterns/behavioral-rules.md) — Autonomy boundaries, quality constraints, failure escalation, and anti-slop patterns across frameworks
