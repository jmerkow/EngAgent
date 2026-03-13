# Context Engineering

> Principles for filling the context window with the right information — budget management, progressive disclosure, the empirical case for minimal context files, and the summarization trap. Distinct from *persistence* (surviving across sessions); this covers *optimization within a session*.
>
> **Key concepts:** four strategies (Write/Select/Compress/Isolate), context budget, dumb zone, KV-cache stability, lost-in-the-middle, progressive disclosure, focused vs. broad context files, summarization trap, AGENTS.md empirical evidence

## Overview

Context engineering is the successor to prompt engineering. Where prompt engineering focuses on crafting individual instructions, context engineering manages the **entire information ecosystem** the model sees: system prompts, tool definitions, conversation history, retrieved documents, memory, state, and examples [1][2].

The term crystallized in mid-2025. Dex Horthy (HumanLayer) framed it in "12 Factor Agents" as the core discipline because LLMs are stateless functions [3]. Walden Yan (Cognition/Devin) called it "the #1 job of engineers building AI agents" [4]. Andrej Karpathy codified the analogy: "The LLM is the CPU, the context window is RAM, and context engineering is the OS" [5]. Anthropic's September 2025 guide formalized the goal: **find the smallest possible set of high-signal tokens that maximize likelihood of the desired outcome** [6].

Four core strategies, articulated by Lance Martin (LangChain, June 2025) and now widely adopted [7]:

| Strategy | What it does | Examples |
|---|---|---|
| **Write** | Save context outside the window for later retrieval | Scratchpads, progress files, memory stores |
| **Select** | Pull the right context in at the right time | RAG, tool selection, `#file:` references |
| **Compress** | Retain only required tokens | Summarization, trimming, compaction |
| **Isolate** | Partition context across specialized systems | Subagents, sandboxes, search subagents |

These strategies work in tension. Write and Select expand what's available; Compress and Isolate shrink what's loaded. The art is balancing them so the model has *enough* context to act correctly but not so much that it degrades. The rest of this document covers what the evidence says about getting that balance right.


## AGENTS.md as Evidence

Four academic studies between October 2025 and February 2026 provide the first empirical data on how context files affect agent behavior.

**Scale and structure.** Mohsenimofidi et al. [8] studied 466 open-source repositories and identified five presentation modes in context files — descriptive, prescriptive, prohibitive, explanatory, and conditional — but found no established content structure yet. TypeScript repositories dominated (135 of 466). The most common file pair was `(AGENTS.md, CLAUDE.md)`, found in 25 repositories.

**What developers prioritize.** The "Agent READMEs" study [9] analyzed 2,303 context files from 1,925 repositories and found these are evolving configuration artifacts, not static documentation. Developers prioritize functional context: **build/run commands (62.3%)**, implementation details (69.9%), and architecture (67.7%). The critical gap: **security requirements appear in only 14.5% of files** [9].

**Measurable efficiency gains.** A January 2026 study [10] measured the impact directly: agents with access to AGENTS.md files completed tasks **28.6% faster** (median completion time) and used **16–20% fewer output tokens**. Context files demonstrably improve agent efficiency.

**The broad-file trap.** An ETH Zurich study [11] introduced the counterpoint: overly broad context files can **reduce task success rates** while increasing inference costs by over 20%. Developer-provided files improved success only marginally (+4%), while LLM-generated files had a small negative effect (−3%) [11]. The resolution: **focused, minimal files improve efficiency; broad files degrade effectiveness** by expanding the agent's constraint space without proportional information gain.

Taken together, the evidence is clear: context files work, but only when they're concise and targeted. Adding more information past the point of relevance actively hurts.


## The Context Budget Problem

The context window is not free storage — it's a performance-sensitive resource. Three empirical findings define the budget constraints.

### The "dumb zone"

Horthy's "12 Factor Agents" [3] identified a critical threshold: agent performance degrades sharply when **more than 40% of the context window is consumed**. Below 40%, agents reason well over the available information. Above it, they increasingly miss details, repeat work, and make errors. This threshold is a practitioner heuristic, not a formal benchmark, but it aligns with findings from multiple sources.

### KV-cache effects

Manus AI [12], which rebuilt its agent framework four times, identified **KV-cache hit rate as the single most important metric** for production agents. Their recommendations: keep prompt prefixes stable, make context append-only, use deterministic serialization, and mask tools rather than removing them mid-conversation (to preserve cache alignment) [12]. Every structural change to the prompt invalidates the cache and forces recomputation — a hidden cost that makes dynamic context manipulation expensive at scale.

### Lost-in-the-middle

The Chroma "Context Rot" report [13] tested 18 frontier LLMs and confirmed that performance degrades as context length increases, even on simple tasks. Models attend best to information at the **beginning and end** of context; middle content gets systematically under-weighted. This "lost-in-the-middle" effect means that naively appending more context doesn't just waste tokens — it actively buries earlier information. Combining all three effects: overloaded context costs more (KV-cache misses), performs worse (dumb zone), and selectively forgets (lost-in-the-middle).


## Writing Effective Context Files

The empirical evidence from §AGENTS.md as Evidence and production experience converge on a set of principles for writing context files — whether `AGENTS.md`, `CLAUDE.md`, `copilot-instructions.md`, or any other format.

### Focused beats broad

The ETH Zurich finding [11] is the headline: broad files hurt more than they help. Concrete guidelines:

- **Keep every line load-bearing.** No filler, no redundant information. If it already exists in README or source code, don't repeat it.
- **Prioritize build/test commands and explicit boundaries** over narrative description. When test commands are listed, agents attempt to execute them and self-correct [9].
- **Never send an LLM to do a linter's job.** Code style enforcement belongs in formatters and linters, not context files — it wastes precious tokens on every turn [6].
- **Target under 150 lines** for a root-level context file. Some teams achieve excellent results with under 60 lines.

### Progressive disclosure

For large codebases, a single file doesn't scale. The "Codified Context" paper [14] found that 100,000+ line codebases need **hierarchical, nested files** — a root-level file for universal rules and subdirectory files for local constraints. Closest file to the edited code wins.

Anthropic's Agent Skills [6] formalize this as three-level progressive loading: (1) the model always sees the skill's name and description (lightweight metadata), (2) if the request matches, the full instructions load, (3) additional resources load only when explicitly referenced. This pattern applies beyond skills — any context system benefits from loading detail on demand rather than up front.

### Minimal universal context with pointers

The recommended architecture combines focused files with just-in-time retrieval [6]:

1. **Root context file** — build commands, test commands, security boundaries, architectural invariants. The information every task needs.
2. **Subdirectory context files** — local conventions, component-specific patterns. Loaded when the agent works in that directory.
3. **On-demand resources** — detailed documentation, examples, templates. Loaded via tool calls or explicit references (`#file:`, skill resources) only when needed.

This is the "Select" strategy from the four-strategy framework: the agent has lightweight pointers to detailed context and retrieves what it needs per task, rather than paying the token cost for everything on every turn.

### Hand-written over generated

LLM-generated context files tend to restate existing documentation without adding signal [11]. Hand-written files consistently outperform them because humans know which information is *non-obvious* — the things an agent wouldn't discover from reading source code alone.


## The Summarization Trap

When the context window fills during a long agent session, platforms must make room. VS Code Copilot's approach — automatic conversation history summarization — provides a well-documented case study of how compression can go wrong.

### The mechanism

VS Code automatically summarizes conversation history when context approaches capacity, controlled by the setting `github.copilot.chat.summarizeAgentConversationHistory.enabled` [15]. An open-source PR [16] reveals two modes: "Simple" mode (using a lighter model with caching) and "Full" mode (using the main model's budget). The summarizer is a blunt instrument: it compresses the full conversation into a compact summary, replacing detailed step-by-step history with a digest.

### What breaks

The summarizer routinely destroys critical state: the original plan, intermediate results, file references, and custom instructions. This is documented across multiple GitHub issues:

- **Issue #6154** [17]: Agent loses all context at the "continue to iterate" point, responding "I don't see any previous context."
- **Issue #11966** [18]: Agent "does too-extensive summarization and then the instructions and data in session is lost and it starts running build commands again and again."
- **Issue #268907** [19]: Agent forgets its original todo list during long tasks and generates a different plan mid-execution.
- **Discussion #162256** [20]: Multiple users confirm that after "Summarized conversation history" appears, "the agent loses all context, and I am back to square one."

The lost-in-the-middle effect [13] compounds the problem: once detailed history is replaced with a summary positioned in the middle of the prompt, the model under-attends to it.

### Mitigations

The summarization trap is fundamentally a **Write** strategy failure — critical state lives only in the conversation and gets destroyed when the conversation compresses. The fix is to externalize state before it can be lost:

- **Externalize plans and progress** into files the agent can re-read (`progress.md`, `plan.md`). Instructions should include "read `#file:progress.md` before each step and update it after."
- **Use subagents for context isolation.** Research, exploration, and other context-heavy operations run in child contexts and return only results — preventing the parent from filling up. (See [Delegation and Subagents](delegation-and-subagents.md).)
- **Keep sessions short.** Community consensus is ~15–20 exchanges before degradation begins [15]. One feature per session.
- **Disable automatic summarization** (`summarizeAgentConversationHistory.enabled: false`) and start new sessions manually when context fills — predictable failure is better than silent corruption.
- **Enable context editing** for Claude models (`anthropic.contextEditing.enabled`) — this clears tool results and thinking tokens from previous turns, deferring the point at which summarization triggers [15].

The deeper lesson: any context management strategy that relies on compression as a primary mechanism will eventually destroy the information it's trying to preserve. The four-strategy framework suggests a better ordering: **Write** state externally first, **Select** it back in per-turn, and treat **Compress** as a last resort rather than a default.


## References

[1] W. Yan, "Don't Build Multi-Agents," June 12, 2025. https://www.cognition.ai/blog/dont-build-multi-agents

[2] T. Lütke, post on X (formerly Twitter), June 18, 2025.

[3] D. Horthy, "12 Factor Agents," HumanLayer, April 2025. https://github.com/humanlayer/12-factor-agents

[4] W. Yan, "Don't Build Multi-Agents," June 12, 2025. https://www.cognition.ai/blog/dont-build-multi-agents

[5] A. Karpathy, post on X (formerly Twitter), June 19, 2025.

[6] Anthropic, "Effective Context Engineering for AI Agents," September 29, 2025. https://docs.anthropic.com/en/docs/build-with-claude/context-engineering

[7] L. Martin, "Context Engineering," LangChain blog, June 2025.

[8] F. Mohsenimofidi et al., "Context Engineering for AI Agents in Open-Source Software," arXiv:2510.21413, October 2025. — 466 repositories, 5 presentation modes, accepted at MSR 2026.

[9] "Agent READMEs," arXiv:2511.12884, November 2025. — 2,303 context files from 1,925 repositories.

[10] "On the Impact of AGENTS.md Files on the Efficiency of AI Coding Agents," arXiv:2601.20404, January 2026. — 28.6% faster completion, 16–20% fewer tokens.

[11] "Evaluating AGENTS.md," ETH Zurich, arXiv:2602.11988, February 2026. — Broad files reduce success rates, increase inference costs 20%+.

[12] Manus AI, "Context Engineering for AI Agents," July 2025. https://manus.im/blog/context-engineering-for-ai-agents

[13] Chroma, "Context Rot Report," July 2025. — 18 frontier LLMs tested; performance degrades with context length.

[14] "Codified Context," arXiv:2602.20478, February 2026. — Hierarchical nested files for 100K+ line codebases.

[15] VS Code Copilot documentation and release notes, v1.108–v1.109, January–February 2026. https://code.visualstudio.com/updates

[16] PR #1846, microsoft/vscode-copilot-chat, November 2025. — Two summarization modes (Simple, Full).

[17] GitHub Issue #6154, microsoft/vscode-copilot-chat, March 2025. — Agent loses all context after summarization.

[18] GitHub Issue #11966, microsoft/vscode-copilot-chat, June 2025. — Over-extensive summarization destroys session state.

[19] GitHub Issue #268907, microsoft/vscode, September 2025. — Agent forgets todo list and generates new plan mid-task.

[20] GitHub Discussion #162256, microsoft/vscode, June 2025. — Multiple users confirm total context loss after summarization.


## See Also

- [Context and Persistence](context-and-persistence.md) — How frameworks persist state across sessions (filesystem-as-database, memory hierarchies, handoff patterns). Complementary: persistence = surviving across sessions; engineering = optimizing within a session.
- [Delegation and Subagents](delegation-and-subagents.md) — Context isolation via subagents is one of the four core strategies (Isolate).
- [Behavioral Rules](behavioral-rules.md) — Constraint patterns that shape what context files should contain.
- [Instructions and Skills](../platforms/copilot/instructions-and-skills.md) — VS Code's implementation of progressive disclosure for context files.
