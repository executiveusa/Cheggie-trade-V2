#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if ! node -e "require.resolve('playwright')" >/dev/null 2>&1; then
  echo "ERROR: playwright is not installed. Run: npm run setup:playwright"
  exit 1
fi

node ./smoke/playwright-smoke.js "${1:-https://github.com/browser-use/browser-harness}"
node ./smoke/playwright-deterministic-flow.js

echo "Smoke suite completed."
