// Runs one of this repo's main.py model scripts against a ticker in
// discountingcashflows.com's model editor, in a real visible browser
// window, using the saved login profile. The window is left open so you
// can look at the result on the actual site -- nothing is saved to disk
// unless you pass --save.
//
// Usage:
//   node run-model.js <path-to-main.py> <TICKER> [--save]
//
// Examples:
//   node run-model.js "../Data Tables/main.py" AAPL
//   node run-model.js "../Forecasting Model/main.py" MSFT --save

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const PROFILE_DIR = process.env.DCF_PROFILE_DIR || path.join(require('os').homedir(), '.dcf-automation-profile');
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

const rawArgs = process.argv.slice(2);
const save = rawArgs.includes('--save');
const [scriptPathArg, tickerArg] = rawArgs.filter((a) => a !== '--save');

if (!scriptPathArg || !tickerArg) {
  console.error('Usage: node run-model.js <path-to-main.py> <TICKER> [--save]');
  process.exit(1);
}

const code = fs.readFileSync(path.resolve(scriptPathArg), 'utf8');
const ticker = tickerArg.toUpperCase();

(async () => {
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    channel: 'msedge', // drive the real, already-installed Edge instead of
    // Playwright's bundled "Chrome for Testing" build
    userAgent: UA,
    viewport: null, // use the real window size instead of a fixed viewport
    args: ['--start-maximized'],
  });
  const page = context.pages()[0] || (await context.newPage());

  // A prior run can leave "unsaved changes" in localStorage, which makes
  // "Open Code Editor" pop a confirm() dialog we'd otherwise never answer.
  // Always discard -- we're about to overwrite the code anyway.
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

  // Load the script + ticker into the Alpine store directly (avoids
  // simulated keystrokes, which risk corruption from Ace's
  // auto-closing brackets/quotes on this much punctuation-heavy code).
  await page.evaluate(
    ({ code, ticker }) => {
      const store = window.Alpine.store('model');
      store.editorCode = code;
      store.ticker = ticker;
      // Keep the visible Ace editor in sync too, since you're watching it.
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

  // Wait for the run to finish: the "Running ..." indicator disappears
  // once htmx settles the response into #modelPreviewWindow.
  await page
    .getByText('Running ...', { exact: true })
    .waitFor({ state: 'visible', timeout: 5000 })
    .catch(() => {});
  await page
    .getByText('Running ...', { exact: true })
    .waitFor({ state: 'hidden', timeout: 30000 })
    .catch(() => {});

  // Bring the Preview tab into view (it may already be selected, but the
  // right-hand panel can default elsewhere depending on prior state).
  await page.getByText('Preview', { exact: true }).first().click().catch(() => {});

  if (save) {
    const outDir = path.join(__dirname, 'runs');
    fs.mkdirSync(outDir, { recursive: true });
    const base = `${ticker}-${path.basename(path.dirname(path.resolve(scriptPathArg)))}`.replace(/\s+/g, '-');

    const previewHtml = await page.locator('#modelPreviewWindow').innerHTML().catch(() => '');
    fs.writeFileSync(path.join(outDir, `${base}-preview.html`), previewHtml);

    const consoleText = await page.evaluate(() => {
      const ed = window.ace && window.ace.edit('codeLog');
      return ed ? ed.getValue() : null;
    });
    if (consoleText !== null) {
      fs.writeFileSync(path.join(outDir, `${base}-console.log`), consoleText);
    }

    await page.screenshot({ path: path.join(outDir, `${base}.png`), fullPage: false });
    console.log(`Also saved results to automation/runs/${base}.*`);
  }

  console.log('Done -- results are showing in the browser window. Close it whenever you\'re finished.');

  // Leave the browser open. Exit this script cleanly once you close the
  // window yourself, instead of closing it out from under you.
  context.on('close', () => process.exit(0));
})();
