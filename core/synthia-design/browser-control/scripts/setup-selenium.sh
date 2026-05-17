#!/usr/bin/env bash
set -euo pipefail

cd "$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [ ! -f package.json ]; then
  npm init -y >/dev/null
fi

npm install --save-dev selenium-webdriver chromedriver

echo "Selenium + ChromeDriver installed (fallback path)."
