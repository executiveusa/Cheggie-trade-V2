#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VENDOR_DIR="$ROOT_DIR/vendor"
HARNESS_DIR="$VENDOR_DIR/browser-harness"
REPO_URL="https://github.com/browser-use/browser-harness.git"

mkdir -p "$VENDOR_DIR"

if [ -d "$HARNESS_DIR/.git" ]; then
  echo "browser-harness already present at $HARNESS_DIR"
else
  echo "Cloning browser-harness..."
  git clone "$REPO_URL" "$HARNESS_DIR"
fi

if [ -f "$HARNESS_DIR/install.md" ]; then
  echo "Read this first: $HARNESS_DIR/install.md"
else
  echo "WARN: install.md not found in cloned repo"
fi

if [ -f "$HARNESS_DIR/SKILL.md" ]; then
  echo "Then read: $HARNESS_DIR/SKILL.md"
else
  echo "WARN: SKILL.md not found in cloned repo"
fi

echo "Use these paths for extension work:"
echo "- helpers: $HARNESS_DIR/agent-workspace/agent_helpers.py"
echo "- domain skills: $HARNESS_DIR/agent-workspace/domain-skills/"
