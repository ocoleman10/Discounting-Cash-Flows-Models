// Verify the reworked Forecasting Model/main.py runs cleanly: headless,
// captures the Console tab (for Python errors) and a screenshot of the result.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const PROFILE_DIR = process.env.DCF_PROFILE_DIR || path.join(require('os').homedir(), '.dcf-automation-profile');
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

const scriptPath = path.join(__dirname, '..', 'Forecasting Model', 'main.py');
const code = fs.readFileSync(scriptPath, 'utf8');
const ticker = process.argv[2] || 'AAPL';

(async () => {
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true,
    userAgent: UA,
    viewport: { width: 1400, height: 1400 },
  });
  const page = context.pages()[0] || (await context.newPage());
  page.on('dialog', (dialog) => dialog.accept());

  await page.goto('https://discountingcashflows.com/model-builder/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(300);
  await page.getByText('Actions', { exact: true }).first().click();
  await page.waitForTimeout(300);
  await page.getByText('Open Code Editor', { exact: true }).first().click();
  await page.waitForSelector('#codeEditor', { timeout: 15000 });
  await page.waitForTimeout(500);

  await page.evaluate(
    ({ code, ticker }) => {
      const store = window.Alpine.store('model');
      store.editorCode = code;
      store.ticker = ticker;
      if (window.ace) {
        const ed = window.ace.edit('codeEditor');
        if (ed) ed.setValue(code, -1);
      }
    },
    { code, ticker }
  );
  await page.waitForTimeout(300);

  console.log(`Running against ${ticker}...`);
  await page.evaluate(() => window.Alpine.store('model').executeCode());

  await page.getByText('Running ...', { exact: true }).waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
  await page.getByText('Running ...', { exact: true }).waitFor({ state: 'hidden', timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(1000);

  // Check the Console tab for Python errors/prints.
  await page.getByText('Console', { exact: true }).first().click().catch(() => {});
  await page.waitForTimeout(500);
  const consoleText = await page.evaluate(() => {
    const ed = window.ace && window.ace.edit('codeLog');
    return ed ? ed.getValue() : null;
  });
  console.log('--- Console tab ---');
  console.log(consoleText || '(empty)');

  await page.getByText('Preview', { exact: true }).first().click().catch(() => {});
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    const el = document.getElementById('modelPreviewWindow');
    if (el) el.scrollTop = el.scrollHeight;
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'verify-result-bottom.png', fullPage: false });
  console.log('Saved verify-result-bottom.png');

  await context.close();
})();
