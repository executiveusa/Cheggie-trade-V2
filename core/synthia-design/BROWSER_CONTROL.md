# Browser Control Playbook

## Tool Selection Policy

Use the smallest sufficient tool before each task:

1. **Browser Harness first** for open-ended, self-healing automation and learned workflows.
2. **Chrome DevTools MCP first** for live inspection: console, network, DOM snapshots, screenshots, Lighthouse/perf, and frontend debugging.
3. **Playwright** for deterministic scripts, CI, regression checks, and cross-browser coverage.
4. **Selenium** only as fallback for legacy WebDriver or non-CDP edge cases.

## Safety Rules

- Never submit purchases/payments/legal forms/crypto/irreversible account changes without explicit confirmation.
- Never log secrets, tokens, cookies, passwords, or private session artifacts.
- Before using a real logged-in profile, state intent and minimize exposed data.
- **Remote debugging warning:** while port `9222` is open, local apps can control your browser.
- Prefer isolated/temporary profiles unless explicitly asked to use real profile/session.

## Workspace Layout

- `browser-control/scripts/` setup scripts.
- `browser-control/smoke/` smoke tests and deterministic flows.
- `browser-control/domain-skills/` reusable site-specific workflow notes.
- `browser-control/vendor/browser-harness/` vendored harness repo (after setup).

## Setup Commands

From repo root:

```bash
cd browser-control
npm run setup:harness
npm run setup:mcp
npm run setup:playwright
npm run setup:selenium  # optional fallback
```

### Browser Harness notes

`setup:harness` clones `https://github.com/browser-use/browser-harness` into `browser-control/vendor/browser-harness`.
After cloning, read in this order:
1. `vendor/browser-harness/install.md`
2. `vendor/browser-harness/SKILL.md`

Then extend via:
- `vendor/browser-harness/agent-workspace/agent_helpers.py`
- `vendor/browser-harness/agent-workspace/domain-skills/`

Avoid modifying harness core unless necessary; prefer helpers and domain skills.

### Chrome DevTools MCP command

```bash
codex mcp add chrome-devtools -- npx chrome-devtools-mcp@latest
```

Connect to an already running Chrome with remote debugging:

```bash
npx chrome-devtools-mcp@latest --browser-url=http://127.0.0.1:9222
```

## Start Chrome with Remote Debugging

### macOS
```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9222 \
  --user-data-dir=/tmp/chrome-debug-profile
```

### Linux
```bash
google-chrome \
  --remote-debugging-port=9222 \
  --user-data-dir=/tmp/chrome-debug-profile
```

### Windows (PowerShell)
```powershell
& "C:\Program Files\Google\Chrome\Application\chrome.exe" `
  --remote-debugging-port=9222 `
  --user-data-dir="$env:TEMP\chrome-debug-profile"
```

## Smoke Verification

### Required checks
1. Open page.
2. Take screenshot.
3. Read title.
4. Inspect console logs.
5. Capture network requests.
6. Run deterministic Playwright flow.

Run:

```bash
cd browser-control
npm install
npm run setup:playwright
npm run smoke -- https://github.com/browser-use/browser-harness
npm run smoke:flow
npm run smoke:suite -- https://github.com/browser-use/browser-harness
```

Outputs:
- Screenshot: `browser-control/logs/smoke.png`
- Report: `browser-control/logs/smoke-report.json`

## Operational Behavior

- Log actions, observations, retries, and final state for each run.
- Keep automation idempotent whenever possible.
- When selectors/timing fail, update helper/domain skill instead of repeating brittle manual steps.
- Activate setup/verification tabs when running in an interactive browser session so the user can see progress.

## Troubleshooting

- **GitHub clone fails with 403 tunnel**: check proxy/network policy; fallback to running in an environment with outbound GitHub access.
- **`codex mcp add` fails**: verify Codex CLI installed and user config writable.
- **Playwright browser missing**: rerun `npx playwright install chromium`.
- **Remote debug attach fails**: confirm Chrome was started with `--remote-debugging-port=9222` and no port conflicts.
