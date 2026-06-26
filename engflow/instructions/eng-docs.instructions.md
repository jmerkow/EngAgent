---
description: 'Load docs (file types, schemas, templates) and workflow (phases, gates) before editing .eng/ files'
applyTo: '.eng/**'
---

The **/engflow:docs** skill has file type schemas, naming conventions, and template pointers; follow them when creating or editing `.eng/` files. Convention details (task format, zones/mutability, design tiers) are in the skill's `references/` directory. The **/engflow:workflow** skill defines phases, status values, and gate checklists. Load **/engflow:check** when validating documents.

If `.eng/.git` exists, this directory is backed by EngDirs. Commit after meaningful writes. The **/engflow:push** skill covers commit/push mechanics.
