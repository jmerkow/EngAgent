#!/usr/bin/env bash
#
# Installs EngAgent into ~/.copilot/engagent and registers paths in VS Code.
#
# Copies .github/{agents,prompts,skills} into ~/.copilot/engagent/ and adds
# the paths to VS Code's chat.agentFilesLocations, chat.promptFilesLocations,
# and chat.agentSkillsLocations settings.
#
# Run from the repo root: ./install.sh
# To update: git pull && ./install.sh

set -euo pipefail

# --- Locate repo root (where this script lives) ---
REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"

# --- Destination: ~/.copilot/engagent ---
ENGAGENT_DIR="$HOME/.copilot/engagent"

# --- Detect OS and set VS Code settings.json path ---
case "$(uname -s)" in
    Darwin)
        SETTINGS_FILE="$HOME/Library/Application Support/Code/User/settings.json"
        ;;
    Linux)
        SETTINGS_FILE="${XDG_CONFIG_HOME:-$HOME/.config}/Code/User/settings.json"
        ;;
    MINGW*|MSYS*|CYGWIN*)
        SETTINGS_FILE="$APPDATA/Code/User/settings.json"
        ;;
    *)
        echo "Error: Unsupported OS: $(uname -s)" >&2
        exit 1
        ;;
esac

SETTINGS_DIR="$(dirname "$SETTINGS_FILE")"
if [ ! -d "$SETTINGS_DIR" ]; then
    echo "Error: VS Code UserData not found at: $SETTINGS_DIR" >&2
    echo "Is VS Code installed?" >&2
    exit 1
fi

# --- Copy .github/{agents,prompts,skills} → ~/.copilot/engagent/ ---
COPIED=0
SKIPPED=0

for CATEGORY in agents prompts skills; do
    SRC_DIR="$REPO_ROOT/.github/$CATEGORY"
    DEST_DIR="$ENGAGENT_DIR/$CATEGORY"

    if [ ! -d "$SRC_DIR" ]; then
        echo "  Warning: Source not found, skipping: $SRC_DIR"
        SKIPPED=$((SKIPPED + 1))
        continue
    fi

    mkdir -p "$DEST_DIR"

    while IFS= read -r -d '' FILE; do
        REL_PATH="${FILE#"$SRC_DIR/"}"
        DEST_PATH="$DEST_DIR/$REL_PATH"
        mkdir -p "$(dirname "$DEST_PATH")"
        cp "$FILE" "$DEST_PATH"
        echo "  $CATEGORY/$REL_PATH"
        COPIED=$((COPIED + 1))
    done < <(find "$SRC_DIR" -type f -print0)
done

echo ""
echo "Copied $COPIED file(s) to: $ENGAGENT_DIR"

# --- Register paths in VS Code settings.json ---
# Requires jq for JSON manipulation
if ! command -v jq &>/dev/null; then
    echo ""
    echo "Warning: jq not found. Skipping VS Code settings update." >&2
    echo "Install jq and re-run, or manually add these to settings.json:" >&2
    echo "  chat.agentFilesLocations:  { \"~/.copilot/engagent/agents\": true }" >&2
    echo "  chat.promptFilesLocations: { \"~/.copilot/engagent/prompts\": true }" >&2
    echo "  chat.agentSkillsLocations: { \"~/.copilot/engagent/skills\": true }" >&2
else
    # Ensure settings.json exists
    if [ ! -f "$SETTINGS_FILE" ]; then
        echo "{}" > "$SETTINGS_FILE"
    fi

    SETTINGS_CHANGED=false

    declare -A SETTING_MAP=(
        ["chat.agentFilesLocations"]="~/.copilot/engagent/agents"
        ["chat.promptFilesLocations"]="~/.copilot/engagent/prompts"
        ["chat.agentSkillsLocations"]="~/.copilot/engagent/skills"
    )

    for KEY in "${!SETTING_MAP[@]}"; do
        PATH_VAL="${SETTING_MAP[$KEY]}"

        # Check if the path is already a key in the object
        EXISTING=$(jq -r --arg k "$KEY" --arg v "$PATH_VAL" \
            'if (.[$k] // {}) | has($v) then "yes" else "no" end' \
            "$SETTINGS_FILE")

        if [ "$EXISTING" = "no" ]; then
            # Add path as key with value true (object format: { "path": true })
            TEMP=$(jq --arg k "$KEY" --arg v "$PATH_VAL" \
                '.[$k] = ((.[$k] // {}) + {($v): true})' "$SETTINGS_FILE")
            echo "$TEMP" > "$SETTINGS_FILE"
            SETTINGS_CHANGED=true
            echo "  Added setting: $KEY"
        else
            echo "  Already set: $KEY"
        fi
    done

    if [ "$SETTINGS_CHANGED" = true ]; then
        echo ""
        echo "Updated VS Code settings: $SETTINGS_FILE"
    else
        echo ""
        echo "VS Code settings already up to date."
    fi
fi

if [ "$SKIPPED" -gt 0 ]; then
    echo "Skipped $SKIPPED missing source(s)."
fi
echo ""
echo "Restart VS Code or reload the window for changes to take effect."
