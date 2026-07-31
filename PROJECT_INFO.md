# Accurate Rate of Return (AccurateROR)

**GitHub Repository:** [https://github.com/GeniusMonkey13/AccurateROR](https://github.com/GeniusMonkey13/AccurateROR)  
**Project Workspace Directory:** `/Users/rishaanvaghani/.gemini/antigravity/scratch/AccurateROR`

---

## Overview & Goals
`AccurateROR` is a web application designed to compute and display the true, accurate Rate of Return (ROR) for any stock, ETF, or mutual fund. Standard price charts often omit dividend payouts, dividend compounding (DRIP), and cash flows. `AccurateROR` provides investors with a complete picture by factoring in:
- Price Appreciation (Capital Gains)
- Dividend Income (Cash Received)
- Dividend Reinvestment Plan (DRIP compounding)
- Stock Splits and Share Count Growth over time

---

## Core Principles & Formulas

### 1. Price Return (Capital Gain %)
$$\text{Price Return (\%)} = \frac{\text{Price}_{\text{end}} - \text{Price}_{\text{start}}}{\text{Price}_{\text{start}}} \times 100$$

### 2. Total Cash Return (Without DRIP)
$$\text{Total Return (\%)} = \frac{(\text{Price}_{\text{end}} - \text{Price}_{\text{start}}) + \sum \text{Dividends Paid}}{\text{Price}_{\text{start}}} \times 100$$

### 3. DRIP Total Return (Reinvested Dividends)
When dividends are reinvested on the ex-dividend / payment date:
$$\Delta \text{Shares}_i = \frac{\text{Shares}_{i-1} \times \text{Dividend}_i}{\text{Price}_i}$$
$$\text{Shares}_{\text{final}} = \text{Initial Shares} + \sum \Delta \text{Shares}_i$$
$$\text{DRIP Total Return (\%)} = \frac{\text{Shares}_{\text{final}} \times \text{Price}_{\text{end}} - \text{Initial Investment}}{\text{Initial Investment}} \times 100$$

### 4. Compound Annual Growth Rate (CAGR)
$$\text{CAGR (\%)} = \left( \left( \frac{\text{Ending Value}}{\text{Starting Value}} \right)^{\frac{1}{\text{Years}}} - 1 \right) \times 100$$

---

## App Specifications & UI Features
1. **Ticker Search Input**: Live lookup for US Stocks, ETFs, and Funds (e.g. `AAPL`, `SPY`, `SCHD`, `O`, `MSFT`, `NVDA`, `VOO`).
2. **Custom Gain Timeframes**: 1M, 3M, 6M, YTD, 1Y, 3Y, 5Y, MAX, or Custom Date Picker.
3. **Interactive Comparison Chart**:
   - **Total Return Curve (DRIP/Dividends)** vs. **Standard Price Chart**.
4. **Accurate Gain Table**:
   - Starting Price & Ending Price
   - Starting Shares vs Ending Shares (DRIP)
   - Total Dividends Earned ($) & Dividend Yield (%)
   - Price Return % vs Total Accurate Return %
   - Annualized CAGR %

---

## GitHub Repository Setup Commands

To link this codebase to GitHub:

```bash
git init
git add .
git commit -m "Initial commit of AccurateROR application"
git branch -M main
git remote add origin https://github.com/GeniusMonkey13/AccurateROR.git
git push -u origin main
```
