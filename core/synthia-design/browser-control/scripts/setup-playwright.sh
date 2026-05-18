#!/usr/bin/env bash
set -euo pipefail

cd "$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [ ! -f package.json ]; then
  npm init -y >/dev/null
fi

npm install --save-dev playwright
npx playwright install chromium
echo "Playwright setup complete."
