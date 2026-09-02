const { chromium } = require('playwright');
(async () => {
  try {
    const b = await chromium.launch({ headless: true });
    const p = await b.newPage({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    });
    const resp = await p.goto('https://discountingcashflows.com/', { waitUntil: 'domcontentloaded' });
    console.log('status:', resp.status());
    console.log('headers:', JSON.stringify(resp.headers(), null, 2));
    const body = await p.content();
    console.log('body snippet:', body.slice(0, 500));
    await b.close();
  } catch (e) {
    console.error('FAIL:', e.message);
    process.exit(1);
  }
})();
