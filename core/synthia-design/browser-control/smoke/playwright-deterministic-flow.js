#!/usr/bin/env node
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('https://example.com', { waitUntil: 'domcontentloaded' });
  const title = await page.title();
  const heading = await page.locator('h1').innerText();

  if (title !== 'Example Domain') {
    throw new Error(`Unexpected title: ${title}`);
  }
  if (!heading.includes('Example Domain')) {
    throw new Error(`Unexpected heading: ${heading}`);
  }

  console.log('Deterministic flow passed', { title, heading });
  await browser.close();
})();
