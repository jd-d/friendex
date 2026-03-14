#!/usr/bin/env bash
# Launch the Electron desktop app.
# Unsets ELECTRON_RUN_AS_NODE which VS Code sets in its terminal,
# preventing Electron from loading its GUI modules.

unset ELECTRON_RUN_AS_NODE
cd "$(dirname "$0")/.." || exit 1
npm run dev:desktop
