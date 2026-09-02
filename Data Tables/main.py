# Author: Omar Coleman
# Description: Simple data table for presenting financial values.
# Created: August 2025

# Derived ratios the data provider doesn't give us directly - shown alongside
# the raw figures so trend and margin are visible, not just the dollar level.
data.compute({
    "%revenueGrowthRate": "function:growth:income:revenue",
    "income:operatingIncome": "income:ebitda - income:depreciationAndAmortization",
    "%ebitdaMargin": "income:ebitda / income:revenue",
    "%netMargin": "income:netIncome / income:revenue",
    "%freeCashFlowMargin": "flow:freeCashFlow / income:revenue",
})

model.render_table({
    "data": {
        "income:revenue": "Sales/Revenue",
        "%revenueGrowthRate": "Revenue Growth Rate",
        "income:ebitda": "EBITDA",
        "%ebitdaMargin": "EBITDA Margin",
        "income:depreciationAndAmortization": "Depreciation",
        "income:operatingIncome": "Operating Income (EBIT)",
        "income:netIncome": "Net Income",
        "%netMargin": "Net Margin",
        "income:eps": "Current EPS",
        "flow:freeCashFlow": "Free Cash Flow",
        "%freeCashFlowMargin": "Free Cash Flow Margin",
        "ratio:bookValuePerShare": "Book Value Per Share",
        "ratio:returnOnCapitalEmployed": "Return on Capital",
    },
    "start": -10,  # Plot starting 10 years ago
    "properties": {
        "title": "Data Table",
        "number_format": "K"  # Display figures in thousands
    }
})