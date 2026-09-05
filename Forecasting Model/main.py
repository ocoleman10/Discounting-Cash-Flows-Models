# Author: Omar Coleman
# Description: Interactive forecasting model for fundamental financial analysis.
#              Projects revenue from a growth-rate assumption, then derives EBITDA,
#              net income, and free cash flow from margin assumptions -- instead of
#              growing every line item at the same rate as revenue, which ignores
#              that margins and revenue don't move in lockstep.
# Created: August 2025
# Run this at: https://discountingcashflows.com/ (paste into the model editor)

# Default each margin assumption to the company's own most recent actual margin,
# so the forecast starts from where the business actually is today rather than
# an arbitrary guess.
last_ebitda_margin = data.get("income:ebitda") / data.get("income:revenue")
last_da_percent_revenue = data.get("income:depreciationAndAmortization") / data.get("income:revenue")
last_net_margin = data.get("income:netIncome") / data.get("income:revenue")
last_fcf_margin = data.get("flow:freeCashFlow") / data.get("income:revenue")

# Initialize assumptions
assumptions.init({
    "projection_years": 5,  # Set the number of years to project
    "%revenue_growth_rate": "10%",  # Annual revenue growth rate
    "%ebitda_margin": f"{last_ebitda_margin * 100:.1f}%",  # EBITDA as % of revenue
    "%da_percent_revenue": f"{last_da_percent_revenue * 100:.1f}%",  # D&A as % of revenue
    "%net_margin": f"{last_net_margin * 100:.1f}%",  # Net income as % of revenue
    "%fcf_margin": f"{last_fcf_margin * 100:.1f}%",  # Free cash flow as % of revenue
    "%retention_rate": "100%",  # Share of EPS retained as equity (100% = no dividends paid out)
})

# Project revenue first -- everything else below is derived from it via a margin
# assumption, rather than compounding at revenue's own growth rate.
data.compute({
    "income:revenue": f"income:revenue:-1 * (1 + {assumptions.get('%revenue_growth_rate')})",
}, forecast=assumptions.get("projection_years"))

# Derive EBITDA, D&A, net income, and free cash flow from revenue using each
# margin assumption above.
data.compute({
    "income:ebitda": f"income:revenue * {assumptions.get('%ebitda_margin')}",
    "income:depreciationAndAmortization": f"income:revenue * {assumptions.get('%da_percent_revenue')}",
    "income:netIncome": f"income:revenue * {assumptions.get('%net_margin')}",
    "flow:freeCashFlow": f"income:revenue * {assumptions.get('%fcf_margin')}",
}, forecast=assumptions.get("projection_years"))

# EPS tracks net income's own growth rate (assuming a roughly constant share
# count), instead of growing at revenue's rate -- margin expansion or
# compression should flow through to EPS via net income, not bypass it.
data.compute({
    "income:eps": "income:eps:-1 * (income:netIncome / income:netIncome:-1)",
}, forecast=assumptions.get("projection_years"))

# Book value per share grows by retained earnings -- that's how equity actually
# accumulates, not by revenue growth. %retention_rate controls how much of EPS
# is kept (100% = no dividends paid out).
data.compute({
    "ratio:bookValuePerShare": f"ratio:bookValuePerShare:-1 + income:eps * {assumptions.get('%retention_rate')}",
}, forecast=assumptions.get("projection_years"))

# Return on Capital Employed is a returns-quality ratio, not a quantity that
# scales with revenue -- compounding it by the revenue growth rate every year
# (the old behavior) makes it balloon unrealistically. Hold it flat instead.
data.compute({
    "ratio:returnOnCapitalEmployed": "ratio:returnOnCapitalEmployed:-1",
}, forecast=assumptions.get("projection_years"))

# Render a table to display the projected values
model.render_table({
    "data": {
        "income:revenue": "Projected Revenue",
        "income:ebitda": "EBITDA",
        "income:depreciationAndAmortization": "Depreciation",
        "income:netIncome": "Net Income",
        "income:eps": "Current EPS",
        "flow:freeCashFlow": "Free Cash Flow",
        "ratio:bookValuePerShare": "Book Value Per Share",
        "ratio:returnOnCapitalEmployed": "Return on Capital",
    },
    "start": -1,  # Start from the next year
    "end": assumptions.get("projection_years"),  # End at the projected years
    "properties": {
        "title": f"Forecasted Values",
        "number_format": "K",  # Display figures in thousands
        "order": "ascending",  # Show projected years in order
        "include_ltm": True
    },
})
