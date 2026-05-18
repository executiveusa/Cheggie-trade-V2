#!/usr/bin/env bash
set -euo pipefail

if ! command -v codex >/dev/null 2>&1; then
  echo "ERROR: codex CLI is not installed or not on PATH."
  echo "Install Codex CLI first, then rerun this script."
  exit 1
fi

# Adds the Chrome DevTools MCP server to codex.
codex mcp add chrome-devtools -- npx chrome-devtools-mcp@latest

cat <<MSG

Chrome DevTools MCP configured.
To connect to existing Chrome remote debugging session:
  npx chrome-devtools-mcp@latest --browser-url=http://127.0.0.1:9222
MSG
