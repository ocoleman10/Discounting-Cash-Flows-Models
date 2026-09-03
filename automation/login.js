// Interactive login: opens a visible browser to discountingcashflows.com and
// waits for YOU to log in, however long that takes. Press Enter in this
// terminal once you're logged in, and the session is saved to
// ./browser-profile for every future script to reuse.

const { chromium } = require('playwright');
const path = require('path');
const readline = require('readline');

// IMPORTANT: this must live on the native Linux filesystem, not /mnt/c.
// Chromium's profile storage (cookies DB, LevelDB) misbehaves on Windows
// drives mounted into WSL (drvfs) -- that was silently breaking login
// persistence and causing Django CSRF failures on submit.
const PROFILE_DIR = process.env.DCF_PROFILE_DIR || path.join(require('os').homedir(), '.dcf-automation-profile');
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

function waitForEnter(prompt) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(prompt, () => { rl.close(); resolve(); }));
}

(async () => {
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    userAgent: UA,
  });
  const page = context.pages()[0] || (await context.newPage());

  await page.goto('https://discountingcashflows.com/', { waitUntil: 'domcontentloaded' });

  await waitForEnter(
    '\nBrowser window opened. Log in there (Login button, top right), then come back here and press Enter...\n'
  );

  // Reload so we can verify from a clean page load that the session stuck.
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  const loginVisible = await page
    .getByText('Login', { exact: true })
    .first()
    .isVisible()
    .catch(() => false);

  if (loginVisible) {
    console.log('\n⚠️  Still seeing a "Login" button after reload — login may not have completed.');
  } else {
    console.log('\n✅ Login button is gone after reload — looks logged in.');
  }

  await page.screenshot({ path: 'login-check.png', fullPage: true });
  console.log('Saved login-check.png for visual confirmation.');

  await context.close();
})();
