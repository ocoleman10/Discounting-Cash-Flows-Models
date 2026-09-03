// Verify authenticated state now that "remember me" was checked, and look
// at the Model Builder page while logged in.
const { chromium } = require('playwright');
const path = require('path');

const PROFILE_DIR = process.env.DCF_PROFILE_DIR || path.join(require('os').homedir(), '.dcf-automation-profile');
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

(async () => {
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true,
    userAgent: UA,
  });
  const page = context.pages()[0] || (await context.newPage());

  await page.goto('https://discountingcashflows.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  const loginVisible = await page.getByText('Login', { exact: true }).first().isVisible().catch(() => false);
  console.log('Login button visible on homepage?', loginVisible);
  await page.screenshot({ path: 'explore-home.png', fullPage: true });

  await page.goto('https://discountingcashflows.com/model-builder/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'explore-model-builder.png', fullPage: true });
  require('fs').writeFileSync('explore-dom.html', await page.content());
  console.log('URL:', page.url());
  console.log('Saved explore-home.png, explore-model-builder.png, explore-dom.html');

  await context.close();
})();
