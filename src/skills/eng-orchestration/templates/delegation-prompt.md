# Delegation Prompt Template

Use these fields when delegating to a subagent:

- **Task:** specific question or work item. Include scope restrictions.
- **Entry points:** files, dirs, or URLs to start from.
- **Context:** key facts the sub needs — locked decisions, constraints, authorized write scope, patterns to follow.
- **Deliverable:** what to return and in what format.
- **Budget:** tool call limit (optional for simple work, explicit for research or larger tasks).

**Task** and **Deliverable** are the minimum. **Entry points** save the sub from blind searching. **Context** is required for anything non-trivial. **Budget** sets effort expectations — err generous.