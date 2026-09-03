# Automation

Drives [discountingcashflows.com](https://discountingcashflows.com/)'s model editor with
[Playwright](https://playwright.dev/) so you can run a `main.py` against a ticker with one
command instead of copy-pasting it into the browser by hand.

This is a plain Node.js + Playwright setup — it works the same on Windows, macOS, and Linux
(including inside WSL). You'll need your own free account on the site; this doesn't share
or bypass that requirement.

## Setup (one time)

```bash
cd automation
npm install
npx playwright install chromium
```

On Linux (including WSL), Chromium also needs a few system libraries the first time:

```bash
sudo npx playwright install-deps chromium
```

Then log in once — this opens a real browser window, waits for you to log in, and saves
the session so every future run reuses it:

```bash
node login.js
```

Log in on the page that opens, **check "Remember me"** (otherwise the session won't survive
the browser closing), then come back to the terminal and press Enter. It'll confirm whether
the login stuck.

## Running a model

```bash
node run-model.js "<path-to-main.py>" <TICKER>
```

Examples:

```bash
node run-model.js "../Data Tables/main.py" AAPL
node run-model.js "../Forecasting Model/main.py" NVDA
```

This opens a visible browser window, pastes that `main.py` into the site's code editor, sets
the ticker, runs it, and leaves the window open on the **Preview** tab so you can look at the
result on the real site. Close the window yourself when you're done — nothing is saved to
disk by default.

Add `--save` to also write a screenshot, the rendered HTML, and the console log to
`automation/runs/`:

```bash
node run-model.js "../Data Tables/main.py" AAPL --save
```

## Notes

- The saved login lives outside this repo (in your home directory), never committed.
- If login ever stops working, just re-run `node login.js`.
