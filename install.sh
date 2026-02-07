#!/usr/bin/env bash
#
# Installs EngAgent agents, prompts, and skills into VS Code UserData.
#
# Copies .github/{agents,prompts,skills} from this repo into your VS Code
# User profile directory. Files placed there are auto-discovered by VS Code
# in every workspace, including remote SSH sessions.
#
# Run from the repo root: ./install.sh
# To update: git pull && ./install.sh

set -euo pipefail

# --- Locate repo root (where this script lives) ---
REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"

# --- Detect OS and set VS Code UserData path ---
case "$(uname -s)" in
    Darwin)
        CODE_USER_DIR="$HOME/Library/Application Support/Code/User"
        ;;
    Linux)
        CODE_USER_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/Code/User"
        ;;
    MINGW*|MSYS*|CYGWIN*)
        CODE_USER_DIR="$APPDATA/Code/User"
        ;;
    *)
        echo "Error: Unsupported OS: $(uname -s)" >&2
        exit 1
        ;;
esac

if [ ! -d "$CODE_USER_DIR" ]; then
    echo "Error: VS Code UserData not found at: $CODE_USER_DIR" >&2
    echo "Is VS Code installed?" >&2
    exit 1
fi

# --- Copy each category ---
COPIED=0
SKIPPED=0

for CATEGORY in agents prompts skills; do
    SRC_DIR="$REPO_ROOT/.github/$CATEGORY"
    DEST_DIR="$CODE_USER_DIR/$CATEGORY"

    if [ ! -d "$SRC_DIR" ]; then
        echo "  Warning: Source not found, skipping: $SRC_DIR"
        SKIPPED=$((SKIPPED + 1))
        continue
    fi

    # Create destination if needed
    mkdir -p "$DEST_DIR"

    # Copy files recursively (preserves subdirectory structure for skills)
    while IFS= read -r -d '' FILE; do
        REL_PATH="${FILE#"$SRC_DIR/"}"
        DEST_PATH="$DEST_DIR/$REL_PATH"

        # Create parent directory if needed
        mkdir -p "$(dirname "$DEST_PATH")"

        cp "$FILE" "$DEST_PATH"
        echo "  $CATEGORY/$REL_PATH"
        COPIED=$((COPIED + 1))
    done < <(find "$SRC_DIR" -type f -print0)
done

echo ""
echo "Done. Copied $COPIED file(s) to: $CODE_USER_DIR"
if [ "$SKIPPED" -gt 0 ]; then
    echo "Skipped $SKIPPED missing source(s)."
fi
echo ""
echo "Restart VS Code or reload the window for changes to take effect."
