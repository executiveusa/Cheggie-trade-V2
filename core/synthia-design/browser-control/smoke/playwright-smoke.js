#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

(async () => {
  const outDir = path.resolve(__dirname, '..', 'logs');
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleLogs = [];
  const requests = [];

  page.on('console', (msg) => {
    consoleLogs.push({ type: msg.type(), text: msg.text() });
  });

  page.on('request', (req) => {
    requests.push({ method: req.method(), url: req.url(), resourceType: req.resourceType() });
  });

  const target = process.argv[2] || 'https://github.com/browser-use/browser-harness';
  const response = await page.goto(target, { waitUntil: 'domcontentloaded' });
  const title = await page.title();
  const screenshotPath = path.join(outDir, 'smoke.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });

  const report = {
    target,
    ok: !!response,
    status: response ? response.status() : null,
    title,
    screenshotPath,
    consoleLogs,
    requests,
    checkedAt: new Date().toISOString(),
  };

  fs.writeFileSync(path.join(outDir, 'smoke-report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({
    status: report.status,
    title: report.title,
    screenshotPath: report.screenshotPath,
    consoleCount: report.consoleLogs.length,
    requestCount: report.requests.length,
  }, null, 2));

  await browser.close();
})();
