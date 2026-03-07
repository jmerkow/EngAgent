# Anthropic Skills

[`anthropics/skills`](https://github.com/anthropics/skills) | ~85k stars | Skills Repository
Platforms: Claude Code, Claude.ai, Claude API, Cursor, GitHub Copilot, Roo Code

> Anthropic's official reference skill implementations for Claude — patterns, anatomy, anti-slop philosophy, and 6 skill design archetypes across 17+ example and production skills.
>
> **Key concepts:** SKILL.md, description-as-trigger, three-level progressive disclosure, constraint-based creativity, forced refinement, marketplace.json, scripts-as-black-boxes

## Overview

[`anthropics/skills`](https://github.com/anthropics/skills) is Anthropic's official public repository of Agent Skills for Claude. It contains 17+ skill implementations ranging from creative applications (algorithmic art, canvas design) to production document capabilities (PDF, DOCX, PPTX, XLSX) to development tools (MCP server builder, webapp testing). The repo serves three purposes:

1. **Reference implementations** — show how to build skills that work across Claude Code, Claude.ai, and the Claude API
2. **Production skills** — the document skills (docx, pdf, pptx, xlsx) are the actual source-available implementations powering Claude's document creation capabilities
3. **Open standard showcase** — demonstrates the [Agent Skills specification](https://agentskills.io/specification) adopted by Claude Code, Cursor, Mistral AI Vibe, Snowflake, TRAE, Spring AI, OpenHands, OpenAI, and others (see [agentskills.io](https://agentskills.io/) for the full adopter list)

The repo also includes a `template/SKILL.md` with the absolute minimum starting point (name + description frontmatter, one heading) and a `spec/` directory pointing to the full specification at agentskills.io.

Skills are distributed through Claude Code's plugin marketplace, direct upload to Claude.ai, or the Claude API. In Claude Code:

```bash
/plugin marketplace add anthropics/skills
/plugin install example-skills@anthropic-agent-skills
```

## Skill Anatomy

Every skill is a self-contained directory. The only required file is `SKILL.md` — everything else is optional and loaded on demand.

```
skill-name/
├── SKILL.md              # Required — YAML frontmatter + markdown instructions
├── scripts/              # Optional — executable code (Python/Bash/JS)
├── references/           # Optional — docs loaded into context when relevant
└── assets/               # Optional — files used in output (not loaded into context)
```

### SKILL.md Format

```yaml
---
name: skill-name              # Required. 1-64 chars, lowercase + hyphens only
description: >                # Required. 1-1024 chars. PRIMARY triggering mechanism.
  What it does, when to use it, specific trigger keywords.
license: Apache-2.0           # Optional
compatibility: Claude Code    # Optional. Environment requirements
metadata:                     # Optional. Arbitrary key-value pairs
  author: example-org
  version: "1.0"
allowed-tools: Bash(git:*) Read  # Optional. Experimental. Pre-approved tools
---

# Skill Title

[Markdown instructions — loaded only after the skill triggers]
```

Naming rules: lowercase alphanumeric + hyphens only, no leading/trailing hyphens, no consecutive `--`, must match the parent directory name, max 64 characters.

### Resource Directory Conventions

| Directory | Purpose | Loaded into context? |
|---|---|---|
| `scripts/` | Executable code for deterministic, repeatable tasks | No — executed directly, read only for patching |
| `references/` | Documentation Claude reads when relevant | Yes, on demand |
| `assets/` | Templates, images, fonts used in output | No — used in output, not read |

The skill-creator meta-skill states the principle explicitly: **"Scripts should be executed directly via `--help`, not read into the context window."** Scripts are black boxes.

## Description as Primary Trigger

The `description` field is the single most important design decision in a skill. It serves as the **primary triggering mechanism** — Claude's skill discovery system matches user requests against installed skill descriptions to decide which skill to activate.

From the skill-creator:
> The description is the PRIMARY triggering mechanism. Don't put "when to use" in the body (which is only loaded after triggering).

The metadata (name + description) budget is approximately 100 tokens per skill. All installed skills' metadata lives in context permanently, so descriptions must be dense with trigger keywords while staying under 1,024 characters.

## Progressive Disclosure

Skills use a three-level loading model that treats the context window as a shared resource:

```mermaid
flowchart LR
    L1["Level 1: Metadata\n~100 tokens\nAlways in context"] --> L2["Level 2: Instructions\n< 5,000 tokens\nLoaded on activation"]
    L2 --> L3["Level 3: Resources\nUnlimited\nLoaded on demand"]

    style L1 fill:#e8f5e9,stroke:#2e7d32
    style L2 fill:#fff3e0,stroke:#ef6c00
    style L3 fill:#fce4ec,stroke:#c62828
```

| Level | Content | Budget | When loaded |
|---|---|---|---|
| **Metadata** | `name` + `description` | ~100 tokens | Always — for every installed skill |
| **Instructions** | SKILL.md body | < 5,000 tokens (< 500 lines) | When skill triggers |
| **Resources** | scripts/, references/, assets/ | Unlimited | On demand, by Claude's judgment |

The guiding principle — that the context window is a shared resource — means every token in a skill must justify its cost against system prompt, conversation history, other skills' metadata, and user requests. The skill-creator instructs authors to challenge each piece of information: *"Does this paragraph justify its token cost?"**

The `template/SKILL.md` demonstrates the minimal form — just frontmatter and a heading. Start there; add resources only when the body approaches 500 lines or when deterministic operations need scripts.

## Six Skill Design Patterns

The repo contains 17+ skills (13 example + 4 production document skills) organized into two distribution groups via `marketplace.json`. The four document skills (`docx`, `pdf`, `pptx`, `xlsx`) are the source-available implementations powering Claude.ai's document capabilities — the most mature skill patterns at production scale.

Four exemplar skills illustrate the range of design archetypes: `algorithmic-art` (two-phase creative), `doc-coauthoring` (multi-stage with sub-agent testing), `frontend-design` (anti-pattern enforcement), and `skill-creator` (meta-skill). See [the repo](https://github.com/anthropics/skills) for the full catalog.

### Pattern 1: Two-Phase Creative

**Skills:** `algorithmic-art`, `canvas-design`

```mermaid
flowchart TD
    A[User request] --> B[Phase 1: Write philosophy document]
    B --> C[Standalone .md file with conceptual seed]
    C --> D[Phase 2: Express philosophy in code]
    D --> E[Output: p5.js / PDF / PNG]

    style B fill:#e3f2fd,stroke:#1565c0
    style D fill:#f3e5f5,stroke:#7b1fa2
```

Claude writes a design philosophy as a standalone markdown file first ("Organic Turbulence", "Quantum Harmonics", "Chromatic Language"), then executes it in code. The philosophy must embed a **"conceptual seed"** — a subtle niche reference that connects the art to its underlying concept, forcing creative depth beyond surface-level generation.

Fixed vs variable constraints prevent drift: templates define what NEVER changes (branding, layout structure) and what ALWAYS varies (algorithm, parameters, UI controls).

### Pattern 2: Multi-Stage with Sub-Agent Testing

**Skill:** `doc-coauthoring`

Three-stage workflow:
1. **Context gathering** — questions → info dump → clarifying questions
2. **Refinement** — per section: brainstorm 5–20 options → curate → gap check → draft → iterate
3. **Reader testing** — predict reader questions → spawn a fresh Claude instance (no context) to simulate a naive reader → iterate on findings

The sub-agent reader test is evaluation-by-proxy: a fresh instance with zero context reveals what the document fails to communicate. After 3 consecutive iterations with no changes, the skill prompts: *"Is there anything we can remove?"*

### Pattern 3: Anti-Pattern Enforcement

**Skills:** `frontend-design`, `web-artifacts-builder`

Instead of recommending what to do, these skills define **what is forbidden**:

| Skill | Forbidden Patterns |
|---|---|
| `frontend-design` | Inter/Roboto/Arial fonts. Purple gradients on white. Predictable layouts. Converging on common choices. |
| `web-artifacts-builder` | Excessive centered layouts. Purple gradients. Uniform rounded corners. Inter font. |

From `frontend-design`: *"Pick an extreme for tone. Never converge on common choices across generations."*

This is behavioral constraint as design philosophy — preferences encoded as prohibitions. See the Anti-AI-Slop Philosophy section below for the deeper rationale.

### Pattern 4: Toolkit

**Skill:** `slack-gif-creator`

Provides building blocks rather than templates:

- `GIFBuilder` — frame construction API
- `Validators` — constraint checking (size, FPS, color count)
- `Easing functions` — linear, ease_in, bounce_out, elastic_out, etc.
- `Animation Concepts` — Shake, Pulse, Bounce, Spin, Fade, Slide, Zoom, Explode

From the skill: *"Provides knowledge + utilities + flexibility, NOT rigid templates."*

Platform-specific constraints are baked in: 128×128 for Slack emoji, 480×480 for messages, 10–30 FPS, 48–128 colors, <3 seconds. Uses PIL/Pillow.

### Pattern 5: Preset Library

**Skill:** `theme-factory`

Ten pre-built themes (Ocean Depths, Sunset Boulevard, Arctic Frost, Midnight Galaxy, etc.) stored in a `themes/` directory with hex codes and font pairings. A `theme-showcase.pdf` enables visual selection. Custom themes can be created on the fly.

The skill is a curated catalog with an escape hatch — structured enough for quick selection, flexible enough for one-off needs.

### Pattern 6: Delegation

**Skill:** `internal-comms`

The SKILL.md body is a thin routing layer. All knowledge lives in reference files:

- `examples/3p-updates.md`
- `examples/company-newsletter.md`
- `examples/faq-answers.md`
- `examples/general-comms.md`

Content types: third-party updates, newsletters, FAQs, status reports, leadership updates, incident reports. This is maximum progressive disclosure — the SKILL.md is minimal, and the references carry all domain weight.

## The Anti-AI-Slop Philosophy

A cross-cutting theme across multiple skills: Anthropic actively fights generic, recognizable AI output. This isn't a style preference — it's a deliberate design philosophy that **default LLM outputs are unacceptable** for creative skills.

The approach: encode taste as prohibitions rather than aspirations.

| Skill | Anti-Slop Mechanism |
|---|---|
| `frontend-design` | Banned fonts (Inter, Roboto, Arial), banned color schemes (purple gradients on white), mandate extreme tone choices |
| `web-artifacts-builder` | Banned layouts (excessive centering), banned visual patterns (uniform rounded corners, purple gradients), banned fonts (Inter) |
| `canvas-design` | Require a "conceptual seed" — subtle niche reference per piece; no surface-level generation |
| `algorithmic-art` | Force specific philosophy names ("Organic Turbulence", "Quantum Harmonics") — never generic titles |

The pattern works because LLMs have strong defaults. Left unconstrained, Claude (like any LLM) gravitates toward the same fonts, color palettes, and layouts. By explicitly prohibiting the most common defaults, skills force divergent output — each generation must find its own aesthetic.

## Forced Refinement Pattern

The `canvas-design` skill builds iteration into its workflow: the final step **assumes the user said "it isn't perfect enough"** and forces a refinement pass. The workflow expects iteration by default rather than treating first-pass output as final.

This pairs with `doc-coauthoring`'s rule that after 3 iterations with no changes, the prompt shifts to *"is there anything we can remove?"* — moving from additive refinement to subtractive editing.

Together these encode a philosophy: **assume the first output needs work, and know when to stop.**

## The Skill-Creator Meta-Skill

`skill-creator` is the most complex skill in the repo. It teaches Claude to create other skills through a multi-step workflow:

1. **Capture Intent** — understand what the user wants to build
2. **Interview and Research** — ask questions, gather context
3. **Write the SKILL.md** — draft the skill file
4. **Test Cases** — create and run test prompts
5. **Improving** — refine based on feedback
6. **Package** — run `scripts/package_skill.py <path>` to create distributable `.skill` zip

### Reference Documents

Two reference files capture reusable structural patterns:

**`references/workflows.md`** — Two workflow types:
- **Sequential**: numbered steps with tool names (deterministic order)
- **Conditional**: branching logic with decision points (context-dependent)

**`references/output-patterns.md`** — Two output strategies:
- **Template pattern**: strict (fill-in-the-blank) vs flexible (structural guidance)
- **Examples pattern**: input/output pairs demonstrating desired style

Key insight from output-patterns: *"Examples help Claude understand the desired style and level of detail more clearly than descriptions alone."*

### Core Principles Embedded in skill-creator

These principles apply to all skill design, not just skills created by this meta-skill:

- **Treat the context window as a shared resource** — only add what Claude doesn't already know
- **"Claude is already very smart"** — challenge each piece of information for token cost
- **"Prefer concise examples over verbose explanations"** — show, don't tell
- **Match freedom to fragility** — high freedom for flexible tasks, low freedom (specific scripts) for fragile operations
- **No extraneous files** — no README, CHANGELOG, INSTALLATION_GUIDE; skills contain only what an agent needs
- **Flat references** — avoid deeply nested reference hierarchies; all reference files link directly from SKILL.md (one level deep)

## Plugin Marketplace and Distribution

Skills are grouped into plugins via `.claude-plugin/marketplace.json`:

```json
{
  "plugins": [
    {
      "name": "document-skills",
      "strict": false,
      "skills": ["./skills/xlsx", "./skills/docx", "./skills/pptx", "./skills/pdf"]
    },
    {
      "name": "example-skills",
      "strict": false,
      "skills": ["./skills/algorithmic-art", "./skills/brand-guidelines", "..."]
    }
  ]
}
```

The `strict` field controls plugin boundaries: when `false` (both plugins use this), the boundary is permissive. When `true`, only listed resources are accessible.

The **production vs example separation** is a deliberate distribution strategy:
- `document-skills` — production capabilities that power Claude.ai's document features
- `example-skills` — creative and development skills for learning and demonstration

Skills can also be packaged as `.skill` zip files (via `scripts/package_skill.py`) for distribution outside the marketplace — uploaded to Claude.ai or sent through the API.

## Quick Reference

| Concept | Detail |
|---|---|
| **Repo** | [anthropics/skills](https://github.com/anthropics/skills) — ~85k stars |
| **Standard** | [Agent Skills spec](https://agentskills.io/specification) — open, multi-platform |
| **Required files** | `SKILL.md` only (frontmatter: `name` + `description`) |
| **Optional dirs** | `scripts/`, `references/`, `assets/` |
| **Description limit** | 1–1,024 characters; serves as primary trigger |
| **Body limit** | < 5,000 tokens / < 500 lines recommended |
| **Name format** | Lowercase + hyphens, matches directory name, max 64 chars |
| **Metadata budget** | ~100 tokens per skill (always in context) |
| **Context budget** | 2% of context window (env: `SLASH_COMMAND_TOOL_CHAR_BUDGET`) |
| **Distribution** | Plugin marketplace, `.skill` zips, Claude.ai upload, API |
| **Design patterns** | Two-phase creative, multi-stage+testing, anti-pattern, toolkit, preset library, delegation |
| **Key principle** | Context window is a shared resource — minimize token cost |
| **Install (Claude Code)** | `/plugin marketplace add anthropics/skills` |

## References

- [anthropics/skills repository](https://github.com/anthropics/skills) — primary source
- [Agent Skills specification](https://agentskills.io/specification) — open standard
- [Agent Skills overview](https://agentskills.io) — standard homepage
- [What are skills?](https://support.claude.com/en/articles/12512176-what-are-skills) — Anthropic support article
- [Using skills in Claude](https://support.claude.com/en/articles/12512180-using-skills-in-claude) — usage guide
- [Creating custom skills](https://support.claude.com/en/articles/12512198-creating-custom-skills) — authoring guide
- [Equipping agents for the real world with Agent Skills](https://anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills) — engineering blog post
- [Skills API Quickstart](https://docs.claude.com/en/api/skills-guide) — API integration guide

## See Also

- [copilot-awesome.md](copilot-awesome.md) — awesome-copilot community collection of agents, prompts, skills
- [claude-cookbooks.md](claude-cookbooks.md) — Claude cookbooks with slash commands, agents, and tool-restricted workflows
- [spec-kit.md](spec-kit.md) — Spec Kit agent-agnostic project specification
- [../vscode/instructions-and-skills.md](../vscode/instructions-and-skills.md) — VS Code skills system (GitHub Copilot's `.github/skills/` convention)
- [../patterns/behavioral-rules.md](../patterns/behavioral-rules.md) — behavioral constraint patterns (related to anti-slop enforcement)
- [../vscode/customization-overview.md](../vscode/customization-overview.md) — VS Code Copilot customization architecture (agents, instructions, skills, hooks)
