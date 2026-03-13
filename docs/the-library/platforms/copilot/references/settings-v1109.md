# VS Code Copilot Settings Reference (v1.108–1.109)

As of: January 2026 | VS Code 1.108–1.109

> Practical reference for VS Code Copilot settings relevant to agent mode, context management, and diagnostics. Captures the settings landscape as of v1.108 (Dec 2025) and v1.109 (Jan 2026). This is a dated snapshot — settings may change in later releases.
>
> **Key concepts:** conversation summarization, context editing, context window indicator, Copilot Memory, agent skills, hooks, MCP, diagnostic tools

## Context Management Settings

Settings that control how the context window is used, when summarization fires, and how memory persists.

| Setting | Type | Default | Introduced | Description |
|---|---|---|---|---|
| `github.copilot.chat.summarizeAgentConversationHistory.enabled` | boolean | `true` | pre-1.108 | Controls automatic conversation history summarization when the context window fills up. When enabled, VS Code compresses conversation history using a lighter model to free space. Disabling prevents silent context loss but means you'll hit the context ceiling and get errors instead [1][3]. |
| `github.copilot.chat.anthropic.contextEditing.enabled` | boolean | `false` | 1.109 | **Experimental.** Clears tool results and thinking tokens from previous turns, deferring summarization and maintaining more usable context. Claude models only. Based on Anthropic's context editing API [1][9]. |
| `github.copilot.chat.copilotMemory.enabled` | boolean | `false` | 1.109 | **Preview.** Enables the memory tool so the agent can store and recall information across sessions via GitHub's Copilot settings. Remembers coding preferences and conventions, not task progress. Requires GitHub-hosted repos [1][11]. |
| `github.copilot.chat.searchSubagent.enabled` | boolean | `false` | 1.109 | **Experimental.** Runs codebase searches in an isolated agent loop, preserving the main agent's context window. The search subagent can iteratively refine queries without consuming main context [1]. |
| `chat.agent.todoList.position` | string | — | ~1.103 | Positions the built-in todo list in chat (`"chatTop"`, `"chatBottom"`, etc.). The agent maintains and checks off tasks as it progresses, providing a persistent reference within the session [1]. |

## Diagnostic Tools

Tools for inspecting what's being sent to the model and how context is allocated.

### Context Window Indicator

The chat input area shows a context window indicator. Hover to see the exact token fraction (e.g., "15K/128K") with a breakdown by category [1]. This is the primary tool for monitoring context consumption during agent loops.

### Chat Debug View

Access via the chat overflow menu → **"Show Chat Debug View"**. Reveals the full layered prompt sent to the model — system prompt, dynamic workspace info, user request, and tool descriptions [3]. Use this to verify what instructions, attachments, and tool results are actually being sent.

### Chat Customization Diagnostics

New in v1.109. Right-click the Chat view → **Diagnostics**. Opens a Markdown document listing all currently loaded custom agents, prompt files, instruction files, skills, and any errors during loading [1]. Use this to troubleshoot why an instruction or skill isn't activating.

| Diagnostic Tool | How to Access | What It Shows |
|---|---|---|
| Context window indicator | Hover over indicator in chat input | Token usage breakdown by category [1] |
| Chat Debug View | Chat overflow menu → "Show Chat Debug View" | Full prompt layers sent to the model [3] |
| Chat Customization Diagnostics | Right-click Chat view → Diagnostics | All loaded agents, instructions, skills, errors [1] |

## Agent Mode Settings

Settings that control skills, hooks, subagents, model selection, and other agent behaviors.

### Skills and Instructions

| Setting | Type | Default | Introduced | Description |
|---|---|---|---|---|
| `chat.useAgentSkills` | boolean | `true` | 1.108 (exp), 1.109 (GA) | Enables Agent Skills. GA and on by default in v1.109. Skills provide domain knowledge via `SKILL.md` files loaded on-demand [1][2]. |
| `chat.agentSkillsLocations` | object | `.github/skills`, `.claude/skills` | 1.109 | Directories where VS Code looks for skill definitions. Personal skills at `~/.copilot/skills` and `~/.claude/skills` [1][4]. |
| `github.copilot.chat.organizationInstructions.enabled` | boolean | `true` | 1.109 | Applies organization-level custom instructions from your GitHub org settings automatically [1][3]. |
| `chat.instructionsFilesLocations` | object | `.github/instructions`, `.claude/rules` | pre-1.108 | Directories for file-based `.instructions.md` files. Supports workspace and user-level paths [3]. |

### Agents and Subagents

| Setting | Type | Default | Introduced | Description |
|---|---|---|---|---|
| `chat.customAgentInSubagent.enabled` | boolean | `false` | 1.109 | Enables custom agents to be invoked as subagents by other agents. Required for agent orchestration patterns [1]. |
| `chat.agentFilesLocations` | object | `.github/agents` | 1.109 | Additional directories where VS Code looks for `.agent.md` files [1]. |
| `chat.agent.thinking.collapsedTools` | boolean | — | 1.109 | Controls whether thinking tokens are shown collapsed alongside tool calls [1]. |

### Hooks

| Setting | Type | Default | Introduced | Description |
|---|---|---|---|---|
| `chat.hooks.enabled` | boolean | `false` | 1.109 | **Preview.** Enables agent hooks — custom shell commands at 8 lifecycle points: `PreToolUse`, `PostToolUse`, `SessionStart`, `Stop`, `SubagentStart`, `SubagentStop`, and others. Same format as Claude Code and Copilot CLI [1][5]. |

### Anthropic Model Settings

| Setting | Type | Default | Introduced | Description |
|---|---|---|---|---|
| `github.copilot.chat.anthropic.thinking.budgetTokens` | number | — | 1.109 | Configures the thinking budget for Anthropic models. Set to `0` to disable extended thinking entirely [1]. |
| `github.copilot.chat.anthropic.toolSearchTool.enabled` | boolean | — | 1.109 | Enables the tool search tool for Claude models, helping discover relevant tools from a larger pool [1][10]. |
| `github.copilot.chat.anthropic.contextEditing.enabled` | boolean | `false` | 1.109 | See Context Management Settings above [1][9]. |

### Model Selection

| Setting | Type | Default | Introduced | Description |
|---|---|---|---|---|
| `github.copilot.chat.implementAgent.model` | string | `""` | 1.109 | **Experimental.** Default language model for the Plan agent's implementation step. Format: `Model Name (vendor)`, e.g., `GPT-5 (copilot)` [1]. |
| `inlineChat.defaultModel` | string | — | 1.109 | Default model for inline chat sessions [1]. |

### Chat UX and Session Management

| Setting | Type | Default | Introduced | Description |
|---|---|---|---|---|
| `chat.requestQueuing.enabled` | boolean | — | 1.109 | **Experimental.** Enables message steering and queueing — send follow-up messages while a request is running [1][8]. |
| `chat.requestQueuing.defaultAction` | string | `"steer"` | 1.109 | Default send button action: `"steer"` (redirect agent) or `"queue"` (wait for completion) [1]. |
| `chat.thinking.style` | string | — | 1.109 | Choose between detailed or compact thinking display styles [1]. |
| `chat.restoreLastPanelSession` | boolean | `false` | 1.108 | Whether to restore the last chat session on restart. Default changed to `false` in v1.108 [2]. |
| `chat.editMode.hidden` | boolean | `true` | 1.109 | **Experimental.** Hides edit mode from the agent dropdown since agent mode is a superset [1]. |

## Recommended Configuration

A starting point for agent mode optimized for context preservation and visibility. Copy to your `settings.json`:

```jsonc
{
  // Context management — prevent silent context loss
  "github.copilot.chat.summarizeAgentConversationHistory.enabled": false,
  "github.copilot.chat.anthropic.contextEditing.enabled": true,
  "github.copilot.chat.searchSubagent.enabled": true,

  // Cross-session memory
  "github.copilot.chat.copilotMemory.enabled": true,

  // Agent features
  "chat.hooks.enabled": true,
  "chat.customAgentInSubagent.enabled": true,

  // Visibility
  "chat.agent.todoList.position": "chatTop",
  "chat.requestQueuing.enabled": true
}
```

**Trade-offs:**
- Disabling summarization means you'll hit context limits and get errors instead of lossy compression. Start new sessions proactively — target ~15–20 exchanges before refresh.
- Context editing is Claude-only and experimental. Monitor for unexpected behavior.
- Copilot Memory requires GitHub-hosted repos and stores preferences, not task state.

## References

- [1] [VS Code 1.109 Release Notes (January 2026)](https://code.visualstudio.com/updates/v1_109)
- [2] [VS Code 1.108 Release Notes (December 2025)](https://code.visualstudio.com/updates/v1_108)
- [3] [VS Code Docs: Custom Instructions](https://code.visualstudio.com/docs/copilot/customization/custom-instructions)
- [4] [VS Code Docs: Agent Skills](https://code.visualstudio.com/docs/copilot/customization/agent-skills)
- [5] [VS Code Docs: Agent Hooks](https://code.visualstudio.com/docs/copilot/customization/hooks)
- [6] [VS Code Docs: MCP Servers](https://code.visualstudio.com/docs/copilot/customization/mcp-servers)
- [7] [VS Code Docs: Subagents](https://code.visualstudio.com/docs/copilot/agents/subagents)
- [8] [VS Code Docs: Chat Sessions](https://code.visualstudio.com/docs/copilot/chat/chat-sessions)
- [9] [Anthropic Docs: Context Editing](https://platform.claude.com/docs/en/build-with-claude/context-editing)
- [10] [Anthropic Docs: Tool Search Tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-search-tool)
- [11] [GitHub Docs: Copilot Memory](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/copilot-memory)

## See Also

- [Customization Overview](../customization-overview.md) — the full building-blocks architecture
- [Instructions and Skills](../instructions-and-skills.md) — activation models, SKILL.md anatomy, instruction cascade
- [Hooks and Lifecycle](../hooks-and-lifecycle.md) — the 8 lifecycle events and hook configuration
- [Subagents and Delegation](../subagents-and-delegation.md) — context isolation and parallel execution
- [Context and Persistence](../../patterns/context-and-persistence.md) — cross-framework context management patterns
