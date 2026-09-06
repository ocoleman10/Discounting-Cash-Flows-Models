# Automation

Drives [discountingcashflows.com](https://discountingcashflows.com/)'s model editor with
[Playwright](https://playwright.dev/) so you can run a `main.py` against a ticker with one
command instead of copy-pasting it into the browser by hand.

**Prerequisites:**

- [Node.js](https://nodejs.org/) installed
- Your own free account at [discountingcashflows.com](https://discountingcashflows.com/)

Works the same on Windows, macOS, and Linux (including inside WSL).

## Setup (one time)

```bash
cd automation
npm install
```

These scripts automatically drive the **Microsoft Edge** browser.

- **Windows / macOS:** Edge is already installed. Nothing else to do.
- **Linux (including WSL):** install it and its system libraries first:

```bash
npx playwright install msedge
sudo npx playwright install-deps msedge
```

Then, still from inside `automation/`, log in once — this opens a real browser window,
waits for you to log in, and saves the session so every future run reuses it:

```bash
node login.js
```

Log in on the page that opens, **check "Remember me"** (otherwise the session won't survive
the browser closing), then come back to the terminal and press Enter. It'll confirm whether
the login stuck.

## Running a model

Run this from inside `automation/` too:

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

## Dev tools

`smoke-test.js` is a quick diagnostic, separate from the main `login.js` / `run-model.js`
flow above -- it just confirms Playwright can launch the saved profile and reach the site,
useful when something's not working and you want to isolate whether it's the browser/profile
or the actual run. Run from inside `automation/`:

```bash
node smoke-test.js
```

## Notes

- The saved login lives outside this repo (in your home directory), never committed.
- If login ever stops working, just re-run `node login.js`.
