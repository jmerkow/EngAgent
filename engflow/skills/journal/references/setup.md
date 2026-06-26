# Journal Setup

First-time setup for the `journal` CLI command.

## What This Does

Installs `journal.py` as a pip package so you can run `journal` directly instead of `python .../journal.py`.

## Steps

### 1. Auto-approve terminal access (recommended)

Add to your VS Code `settings.json`:
```json
"chat.tools.terminal.autoApprove": { "journal": true }
```

### 2. Install the package

```bash
pip install -e <skill-path>/scripts/
```

The agent resolves `<skill-path>` from the skill location at runtime.

### 3. Verify

```bash
journal --help
```

### 4. Log a test entry

```bash
journal INFO -m "Journal installed" -t note
```

If the test entry appears in your journal log, setup is complete.
