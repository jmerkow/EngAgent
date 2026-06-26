---
name: check
description: Validate and repair .eng/ documents against templates for format compliance, migrations, backfill, bloat, and cold-read clarity. Use when checking document quality, repairing docs, or reviewing before handoff.
---

# check — Document Validation

Check `.eng/` documents against their templates. Two modes: compliance check and cold read.

## Usage

Load this skill, then provide a file path and optional mode:

- **Default (compliance):** Check format, length hints, bloat, duplication against the relevant template.
- **Cold read:** Check whether a fresh agent with no conversation history could pick up this document and act.

## Maintenance Workflows

For broader `.eng/` repair work, validate, migrate, backfill, or reconstruct missing progress with the **/engflow:docs** skill's [references/maintenance-workflows.md](../docs/references/maintenance-workflows.md).

## Compliance Check

For each section in the document:

1. **Identify the template.** Match by document type (objective, design, finding, mistake log, retro).
2. **Check section presence.** Are all required sections present? Any unexpected sections?
3. **Check length hints.** Compare actual content against the template's `<!-- hint -->` comments:
   - `<!-- 1-3 sentences -->` — count sentences
   - `<!-- 3-5 bullets -->` — count bullets
   - `<!-- no prose -->` — flag paragraph text
   - `<!-- one line -->` — flag multi-line content
4. **Check duplication.** Flag content that appears in multiple files. The rule: one-line summary + link, never copy.
5. **Check bloat signals:**
   - Backstory in Objective section (should be end-state only)
   - Deliberation in Design section (belongs in scratch)
   - Prose where structured format exists (decisions, tasks, observations)
   - Repeated context across sections

## Cold Read Check

Read the document as if you have zero conversation history. Flag:

- **Unexplained references:** Names, decisions, or terms used without definition or link.
- **Missing rationale:** Decisions without "why" or "if violated."
- **Implicit context:** Statements that only make sense if you were in the conversation that produced them.
- **Broken links:** References to files or sections that don't resolve.
- **Ambiguous scope:** Would a fresh agent know what to do next?

## Output Format

```markdown
## check: {filename}
Mode: compliance | cold-read | both

### Violations
- **[section]** hint: `<!-- 1-3 sentences -->` actual: 8 sentences
- **[section]** duplicated content — also in {other-file}

### Cold Read Gaps (if cold-read mode)
- **[section]** unexplained reference: "{term}" — no definition or link
- **[section]** decision D3 has no rationale

### Suggestions
- Compress {section} from 12 lines to ~5
- Move deliberation from Design to .eng/scratch/
```

## Rules

- Don't rewrite the document. Report violations and suggest — the author decides.
- When both modes requested, run compliance first, cold read second.
- A passing cold read is stronger evidence of quality than passing compliance — compliance checks format, cold read checks substance.
