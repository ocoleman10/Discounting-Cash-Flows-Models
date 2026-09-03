const { chromium } = require('playwright');
const path = require('path');

const PROFILE_DIR = process.env.DCF_PROFILE_DIR || path.join(require('os').homedir(), '.dcf-automation-profile');
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

(async () => {
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true,
    userAgent: UA,
    viewport: { width: 1400, height: 1000 },
  });
  const page = context.pages()[0] || (await context.newPage());

  await page.goto('https://discountingcashflows.com/model-builder/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'explore-step1-loaded.png', fullPage: false });

  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'explore-step2-escape.png', fullPage: false });

  await page.getByText('Actions', { exact: true }).first().click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'explore-step3-actions.png', fullPage: false });

  await page.getByText('Open Code Editor', { exact: true }).first().click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'explore-step4-editor.png', fullPage: false });

  console.log('codeEditor exists:', await page.locator('#codeEditor').count());
  console.log('URL:', page.url());

  await context.close();
})();
