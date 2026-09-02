// Smoke test: confirms Playwright can launch a persistent, logged-in browser
// profile and reach discountingcashflows.com's model editor.
//
// First run: a browser window opens to the site. Log in manually (once) --
// the session is saved to ./browser-profile and reused on every future run,
// so you won't need to log in again.
//
// Usage:
//   npx playwright install chromium   (already run once)
//   node smoke-test.js

const { chromium } = require('playwright');
const path = require('path');

const PROFILE_DIR = path.join(__dirname, 'browser-profile');
const SITE_URL = 'https://discountingcashflows.com/';

(async () => {
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    // The site 403s Playwright's default headless UA string; a normal
    // Chrome UA gets a plain 200.
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  });
  const page = context.pages()[0] || (await context.newPage());

  await page.goto(SITE_URL, { waitUntil: 'domcontentloaded' });

  console.log('Loaded:', await page.title());
  console.log('If this is the first run, log in now in the opened window.');
  console.log('Press Ctrl+C here once you are done / logged in.');

  await page.screenshot({ path: 'smoke-test.png', fullPage: true });
  console.log('Saved screenshot to automation/smoke-test.png');

  // Keep the browser open for 60s so you have time to log in on first run.
  await page.waitForTimeout(60_000);

  await context.close();
})();
