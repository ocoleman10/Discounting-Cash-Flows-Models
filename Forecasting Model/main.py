# Author: Omar Coleman
# Description: Simple, interactive forecasting model for fundamental financial analysis
# Created: August 2025

# Initialize assumptions
assumptions.init({
    "projection_years": 5,  # Set the number of years to project
    "%growth_rate": "10%" # Growth Rate 
})

# Compute projected revenues at a 10% growth rate
data.compute({
    "income:revenue": f"income:revenue:-1 * (1 + {assumptions.get('%growth_rate')})",
    "income:ebitda": f"income:ebitda:-1 * (1 + {assumptions.get('%growth_rate')})",
    "income:depreciationAndAmortization": f"income:depreciationAndAmortization:-1 * (1 + {assumptions.get('%growth_rate')})",
    "income:netIncome": f"income:netIncome:-1 * (1 + {assumptions.get('%growth_rate')})",
    "income:eps": f"income:eps:-1 * (1 + {assumptions.get('%growth_rate')})",
    "flow:freeCashFlow": f"flow:freeCashFlow:-1 * (1 + {assumptions.get('%growth_rate')})",
    "ratio:bookValuePerShare": f"ratio:bookValuePerShare:-1 * (1 + {assumptions.get('%growth_rate')})",
    "ratio:returnOnCapitalEmployed": f"ratio:returnOnCapitalEmployed:-1 * (1 + {assumptions.get('%growth_rate')})",

}, forecast=assumptions.get("projection_years"))

# Render a table to display the projected revenues
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