---
description: 'Reload eng-docs conventions before editing .eng/ files'
applyTo: '.eng/**'
---

The **eng-docs** skill has schemas, templates, and conventions for this file — follow them when creating or editing. Load the **eng-check** skill when validating documents or checking quality.

If `.eng/.git` exists, this directory is backed by EngDirs. Commit after meaningful writes (objectives updated, findings written, tasks checked off). Committing is cheap — use it frequently. Commit and push in separate commands. The **eng-push** skill covers commit/push mechanics and failure modes.
