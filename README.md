# Discounting-Cash-Flows-Models

Custom financial models built to help investors analyze their investments.

## How to run these models

The `main.py` files in this repo aren't standalone Python scripts. They are written in the model DSL used by [discountingcashflows.com](https://discountingcashflows.com/)'s
in-browser model editor, which injects objects like `model`, `data` and `assumptions` at runtime and pulls financial data from providers such as [Financial Modeling Prep](https://financialmodelingprep.com/).

1. Create a free account at [discountingcashflows.com](https://discountingcashflows.com/) and open the model editor for a ticker.
2. Copy the contents of a `main.py` from one of the folders below.
3. Paste it into the editor and run it against any ticker.

### Automated option

If you'd rather not copy-paste by hand each time, [`automation/`](automation/) has a
Playwright script that drives the model editor for you — paste your own credentials
in once, then run one command per ticker. See the
[setup guide](https://ocoleman10.github.io/Discounting-Cash-Flows-Models/) or
[automation/README.md](automation/README.md).

## Models

- [`Data Tables/`](Data%20Tables/) — presents historical financials (revenue, margins, cash flow, returns) in a clear table.
- [`Forecasting Model/`](Forecasting%20Model/) — projects those financials forward from a small set of editable assumptions.
