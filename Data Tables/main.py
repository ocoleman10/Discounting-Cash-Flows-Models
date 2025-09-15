# Author: Omar Coleman
# Description: Simple data table for presenting financial values.
# Created: August 2025
model.render_table({
    "data": {
        "income:revenue": "Sales/Revenue",
        "income:ebitda": "EBITDA",
        "income:depreciationAndAmortization": "Depreciation",
        "income:netIncome": "Net Income",
        "income:eps": "Current EPS",
        "flow:freeCashFlow": "Free Cash Flow",
        "ratio:bookValuePerShare": "Book Value Per Share",
        "ratio:returnOnCapitalEmployed": "Return on Capital",
        
    },
    "start": -10,  # Plot starting 10 years ago
    "properties": {
        "title": "Data Table",
        "number_format": "K"  # Display figures in thousands
    }
})