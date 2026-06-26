# Retro Categories

## Mistake Categories

### bad-assumption
Formed a conclusion or took action before reading the relevant evidence. The most frequent category (16 instances across 16 sessions).

Examples:
- Diagnosed auth error as expired credentials without reading the exception handler that was masking the real error
- Created `.eng/` plan with wrong format from memory instead of reading SKILL.md
- Updated ownership model from stale context instead of re-checking current data

### unnecessary-action
Did something the user didn't ask for — extra scope, unrequested features, redundant process steps.

Examples:
- Edited a build artifact in addition to the source file
- Added verbosity macros and bell notifications to a Makefile when only `-s` was needed
- Used `ask_questions` to confirm something the user would provide inline anyway
- Created an exploratory script proactively without user request

### missed-context
Relevant information existed and was accessible but wasn't read or wasn't noticed.

Examples:
- Didn't check `.gitignore` before editing a file that turned out to be a build output
- Didn't notice outbox advisory notes that contained explicit guidance
- Didn't consider MSI as credential source on an Azure VM

### misunderstood-intent
Interpreted the user's request incorrectly — wrong scope, wrong audience, wrong deliverable type.

Examples:
- Created implementation tasks when the session was about writing a guide for someone else
- Kept speculative tasks after user said "nothing pending"
- Didn't create both files when user asked to split a plan in two

### tool-misuse
Used the wrong tool or didn't check what tools were available.

Examples:
- Used `az devops` CLI when ADO MCP tools were already configured
- Used WorkIQ tool for an ADO query
- Claimed ADO MCP tools didn't exist when they were loaded in the session

### hallucination
Stated something factually false that wasn't based on any evidence.

Examples:
- Claimed an SDK attribute existed that doesn't (`ml_client.environments._operation.get()`)

### wrong-file
Wrote content to the wrong file or directory.

Examples:
- Added a tooling log entry to a customer engagement data log instead of the plan's timeline

### over-explanation
Provided excessive detail, caveats, or framing beyond what was asked.

## Gap Categories

### missing-convention
A recurring situation has no documented convention, forcing ad-hoc decisions each time.

Examples:
- No guidance on plan specificity levels (rough vs implementation-ready)
- No convention for where agent observations go vs user-requested tasks
- No source vs build artifact distinction

### workflow-friction
A workflow is harder or slower than it should be.

Examples:
- Handoff between sessions requires manual summary
- Multiple fetch attempts to find VS Code docs (no known starting points)
- Container crash with no log visibility

### missing-skill
A domain-specific knowledge package would prevent repeated waste.

Examples:
- No pattern for long-running commands (20-40 min deploys)
- Repeated boilerplate in throwaway pandas scripts

### missing-prompt
A workflow that should be triggered by a prompt doesn't have one.

### context-loss
Information from a prior step or session is lost and must be re-discovered.

Examples:
- Meeting action items stay in chat with no `.eng/` tracking
- No "last imported through" watermark for data imports

### repetitive-work
The same manual steps are performed across multiple sessions.
