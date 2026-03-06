---
description: 'Load eng-docs (file types, schemas, templates) and eng-workflow (phases, gates) before editing .eng/ files'
applyTo: '.eng/**'
---

The **eng-docs** skill has file type schemas, naming conventions, and template pointers — follow them when creating or editing `.eng/` files. Convention details (task format, zones/mutability, design tiers) are in the skill's `references/` directory. The **eng-workflow** skill defines phases, status values, and gate checklists. Load **eng-check** when validating documents.

If `.eng/.git` exists, this directory is backed by EngDirs. Commit after meaningful writes. The **eng-push** skill covers commit/push mechanics.
