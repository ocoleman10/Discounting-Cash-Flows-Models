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
# an arbitrary guess. Guard against a pre-revenue company (revenue <= 0), which
# would otherwise divide by zero here.
base_revenue = data.get("income:revenue")
if base_revenue > 0:
    last_ebitda_margin = data.get("income:ebitda") / base_revenue
    last_da_percent_revenue = data.get("income:depreciationAndAmortization") / base_revenue
    last_net_margin = data.get("income:netIncome") / base_revenue
    last_fcf_margin = data.get("flow:freeCashFlow") / base_revenue
else:
    last_ebitda_margin = last_da_percent_revenue = last_net_margin = last_fcf_margin = 0.0

# Derive the retention rate from what book value per share actually did last
# year, rather than assuming 100% (fully retained earnings, no dividends or
# buybacks). Many mature companies buy back more stock than they retain in
# earnings, which shrinks book value per share even while profits grow --
# defaulting to 100% would completely miss that and badly overstate it.
base_eps = data.get("income:eps")
last_bvps_change = data.get("ratio:bookValuePerShare") - data.get("ratio:bookValuePerShare:-1")
if base_eps > 0:
    last_retention_rate = last_bvps_change / base_eps
    # Clamp to +/-100% -- a single volatile year shouldn't imply the company
    # retains multiples of its own earnings, or buys back more than all of
    # them, forever.
    last_retention_rate = max(-1.0, min(1.0, last_retention_rate))
else:
    # A loss-making base year gives no sensible retention signal (dividing by
    # a zero or negative EPS could even flip the sign) -- assume book value
    # per share just holds flat instead of guessing.
    last_retention_rate = 0.0

# Initialize assumptions
assumptions.init({
    "projection_years": 5,  # Set the number of years to project
    "%revenue_growth_rate": "10%",  # Annual revenue growth rate
    "%ebitda_margin": f"{last_ebitda_margin * 100:.1f}%",  # EBITDA as % of revenue
    "%da_percent_revenue": f"{last_da_percent_revenue * 100:.1f}%",  # D&A as % of revenue
    "%net_margin": f"{last_net_margin * 100:.1f}%",  # Net income as % of revenue
    "%fcf_margin": f"{last_fcf_margin * 100:.1f}%",  # Free cash flow as % of revenue
    "%retention_rate": f"{last_retention_rate * 100:.1f}%",  # Share of EPS retained as equity, implied by last year's actual change in book value (can be negative if buybacks/dividends exceeded earnings)
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
# compression should flow through to EPS via net income, not bypass it. Skip
# this if the base year's net income was zero/negative -- dividing by it could
# flip EPS's sign or blow up to a nonsensical magnitude -- and just hold EPS
# flat instead.
base_net_income = data.get("income:netIncome")
eps_formula = (
    "income:eps:-1 * (income:netIncome / income:netIncome:-1)"
    if base_net_income > 0
    else "income:eps:-1"
)
data.compute({
    "income:eps": eps_formula,
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
