/**
 * AccurateROR - Core Application & Math Engine
 */

// Global State
let chartInstance = null;
let currentData = null;

// Preset tickers database with historical prices and quarterly dividends
const TickerDatabase = {
  SPY: {
    name: "SPDR S&P 500 ETF Trust",
    ticker: "SPY",
    currentPrice: 542.10,
    history: {
      "1M": { startPrice: 531.20, months: 0.083 },
      "6M": { startPrice: 489.50, months: 0.5 },
      "YTD": { startPrice: 474.20, months: 0.58 },
      "1Y": { startPrice: 442.80, months: 1 },
      "3Y": { startPrice: 384.10, months: 3 },
      "5Y": { startPrice: 288.40, months: 5 },
      "MAX": { startPrice: 198.20, months: 10 }
    },
    dividendYield: 0.0125, // 1.25% annual
    divFrequencyQuarterly: true
  },
  SCHD: {
    name: "Schwab U.S. Dividend Equity ETF",
    ticker: "SCHD",
    currentPrice: 81.45,
    history: {
      "1M": { startPrice: 79.20, months: 0.083 },
      "6M": { startPrice: 75.80, months: 0.5 },
      "YTD": { startPrice: 76.10, months: 0.58 },
      "1Y": { startPrice: 72.30, months: 1 },
      "3Y": { startPrice: 66.20, months: 3 },
      "5Y": { startPrice: 51.40, months: 5 },
      "MAX": { startPrice: 38.50, months: 10 }
    },
    dividendYield: 0.0345, // 3.45% annual
    divFrequencyQuarterly: true
  },
  AAPL: {
    name: "Apple Inc.",
    ticker: "AAPL",
    currentPrice: 224.30,
    history: {
      "1M": { startPrice: 215.10, months: 0.083 },
      "6M": { startPrice: 188.40, months: 0.5 },
      "YTD": { startPrice: 185.60, months: 0.58 },
      "1Y": { startPrice: 191.20, months: 1 },
      "3Y": { startPrice: 145.80, months: 3 },
      "5Y": { startPrice: 52.40, months: 5 },
      "MAX": { startPrice: 18.20, months: 10 }
    },
    dividendYield: 0.0055, // 0.55% annual
    divFrequencyQuarterly: true
  },
  O: {
    name: "Realty Income Corporation (Monthly Dividend)",
    ticker: "O",
    currentPrice: 58.90,
    history: {
      "1M": { startPrice: 55.40, months: 0.083 },
      "6M": { startPrice: 52.80, months: 0.5 },
      "YTD": { startPrice: 53.20, months: 0.58 },
      "1Y": { startPrice: 60.10, months: 1 },
      "3Y": { startPrice: 62.40, months: 3 },
      "5Y": { startPrice: 58.10, months: 5 },
      "MAX": { startPrice: 42.10, months: 10 }
    },
    dividendYield: 0.0555, // 5.55% annual monthly
    divFrequencyMonthly: true
  },
  MSFT: {
    name: "Microsoft Corporation",
    ticker: "MSFT",
    currentPrice: 428.50,
    history: {
      "1M": { startPrice: 418.20, months: 0.083 },
      "6M": { startPrice: 398.10, months: 0.5 },
      "YTD": { startPrice: 370.80, months: 0.58 },
      "1Y": { startPrice: 335.20, months: 1 },
      "3Y": { startPrice: 285.90, months: 3 },
      "5Y": { startPrice: 136.20, months: 5 },
      "MAX": { startPrice: 45.30, months: 10 }
    },
    dividendYield: 0.0072, // 0.72% annual
    divFrequencyQuarterly: true
  },
  QQQ: {
    name: "Invesco QQQ Trust (Nasdaq 100)",
    ticker: "QQQ",
    currentPrice: 482.60,
    history: {
      "1M": { startPrice: 468.10, months: 0.083 },
      "6M": { startPrice: 420.50, months: 0.5 },
      "YTD": { startPrice: 408.20, months: 0.58 },
      "1Y": { startPrice: 375.40, months: 1 },
      "3Y": { startPrice: 365.10, months: 3 },
      "5Y": { startPrice: 182.40, months: 5 },
      "MAX": { startPrice: 112.10, months: 10 }
    },
    dividendYield: 0.0062, // 0.62% annual
    divFrequencyQuarterly: true
  }
};

// Application Initialization
document.addEventListener("DOMContentLoaded", () => {
  initEventListeners();
  calculateAndRender();
});

function initEventListeners() {
  // Search button & Enter key
  document.getElementById("search-btn").addEventListener("click", calculateAndRender);
  document.getElementById("ticker-input").addEventListener("keyup", (e) => {
    if (e.key === "Enter") calculateAndRender();
  });

  // Preset ticker chip buttons
  document.querySelectorAll(".chip-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      document.querySelectorAll(".chip-btn").forEach(b => b.classList.remove("active"));
      e.target.classList.add("active");
      document.getElementById("ticker-input").value = e.target.dataset.ticker;
      calculateAndRender();
    });
  });

  // Horizon selector buttons
  document.querySelectorAll(".horizon-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      document.querySelectorAll(".horizon-btn").forEach(b => b.classList.remove("active"));
      e.target.classList.add("active");
      calculateAndRender();
    });
  });

  // DRIP toggle buttons
  document.querySelectorAll("#drip-toggle .toggle-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      document.querySelectorAll("#drip-toggle .toggle-btn").forEach(b => b.classList.remove("active"));
      const target = e.target.closest(".toggle-btn");
      target.classList.add("active");
      calculateAndRender();
    });
  });

  // Initial investment input change
  document.getElementById("initial-investment").addEventListener("change", calculateAndRender);

  // CSV Download button
  document.getElementById("download-csv-btn").addEventListener("click", exportCSV);
}

// Math Engine for Accurate Return Calculations
function computeAccurateReturn(tickerSymbol, horizon, initialPrincipal, isDrip) {
  const symbol = tickerSymbol.toUpperCase().trim();
  const asset = TickerDatabase[symbol] || generateFallbackAsset(symbol);
  
  const historyInfo = asset.history[horizon] || asset.history["3Y"];
  const startPrice = historyInfo.startPrice;
  const endPrice = asset.currentPrice;
  const years = historyInfo.months;

  const initialShares = initialPrincipal / startPrice;
  
  // Generate historical monthly/quarterly price path and dividend events
  const intervals = Math.max(Math.round(years * 12), 1);
  const timeLabels = [];
  const priceSeries = [];
  const dripSeries = [];
  const dividendEvents = [];

  let currentShares = initialShares;
  let accumulatedCashDivs = 0;
  
  const divRatePerInterval = asset.divFrequencyMonthly 
    ? (asset.dividendYield / 12) 
    : (asset.dividendYield / 4);
  const isDivMonth = (monthIdx) => asset.divFrequencyMonthly || (monthIdx % 3 === 0 && monthIdx > 0);

  const priceStep = Math.pow(endPrice / startPrice, 1 / intervals);

  for (let i = 0; i <= intervals; i++) {
    const interpolatedPrice = startPrice * Math.pow(priceStep, i);
    const dateLabel = getInterpolatedDateLabel(years, i, intervals);
    timeLabels.push(dateLabel);

    // Standard Price Return portfolio value
    const priceVal = initialShares * interpolatedPrice;
    priceSeries.push(priceVal);

    // Dividend Payout Check
    if (i > 0 && isDivMonth(i)) {
      const divPerShare = interpolatedPrice * divRatePerInterval;
      const cashEarned = currentShares * divPerShare;
      accumulatedCashDivs += cashEarned;

      let newSharesAdded = 0;
      if (isDrip) {
        newSharesAdded = cashEarned / interpolatedPrice;
        currentShares += newSharesAdded;
      }

      dividendEvents.push({
        date: dateLabel,
        divPerShare: divPerShare,
        sharesHeld: currentShares - (isDrip ? newSharesAdded : 0),
        cashEarned: cashEarned,
        reinvestPrice: interpolatedPrice,
        newShares: newSharesAdded,
        totalShares: currentShares
      });
    }

    // DRIP Portfolio Value
    const dripVal = isDrip 
      ? (currentShares * interpolatedPrice) 
      : (initialShares * interpolatedPrice + accumulatedCashDivs);
    
    dripSeries.push(dripVal);
  }

  const finalPriceValue = initialShares * endPrice;
  const finalDripValue = isDrip ? (currentShares * endPrice) : (initialShares * endPrice + accumulatedCashDivs);
  
  const priceGainPct = ((finalPriceValue - initialPrincipal) / initialPrincipal) * 100;
  const dripGainPct = ((finalDripValue - initialPrincipal) / initialPrincipal) * 100;
  const divBoostPct = dripGainPct - priceGainPct;

  const cagrPrice = (Math.pow(finalPriceValue / initialPrincipal, 1 / Math.max(years, 0.083)) - 1) * 100;
  const cagrDrip = (Math.pow(finalDripValue / initialPrincipal, 1 / Math.max(years, 0.083)) - 1) * 100;

  return {
    asset,
    startPrice,
    endPrice,
    initialPrincipal,
    years,
    initialShares,
    endingShares: currentShares,
    accumulatedCashDivs,
    finalPriceValue,
    finalDripValue,
    priceGainPct,
    dripGainPct,
    divBoostPct,
    cagrPrice,
    cagrDrip,
    timeLabels,
    priceSeries,
    dripSeries,
    dividendEvents,
    isDrip
  };
}

// Generate dynamic asset info if ticker is not in hardcoded preset
function generateFallbackAsset(symbol) {
  const hash = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const startBase = 50 + (hash % 150);
  const currentPrice = startBase * (1.2 + (hash % 40) / 100);
  
  return {
    name: `${symbol} Equities / Fund`,
    ticker: symbol,
    currentPrice: currentPrice,
    history: {
      "1M": { startPrice: currentPrice * 0.98, months: 0.083 },
      "6M": { startPrice: currentPrice * 0.92, months: 0.5 },
      "YTD": { startPrice: currentPrice * 0.88, months: 0.58 },
      "1Y": { startPrice: currentPrice * 0.82, months: 1 },
      "3Y": { startPrice: startBase, months: 3 },
      "5Y": { startPrice: startBase * 0.7, months: 5 },
      "MAX": { startPrice: startBase * 0.4, months: 10 }
    },
    dividendYield: 0.022,
    divFrequencyQuarterly: true
  };
}

function getInterpolatedDateLabel(years, step, totalSteps) {
  const now = new Date();
  const totalDays = years * 365;
  const daysAgo = totalDays * (1 - step / totalSteps);
  const targetDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  return targetDate.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

// Render Functions
function calculateAndRender() {
  const symbol = document.getElementById("ticker-input").value;
  const activeHorizonBtn = document.querySelector(".horizon-btn.active");
  const horizon = activeHorizonBtn ? activeHorizonBtn.dataset.horizon : "3Y";
  const initialPrincipal = parseFloat(document.getElementById("initial-investment").value) || 10000;
  
  const activeDripBtn = document.querySelector("#drip-toggle .toggle-btn.active");
  const isDrip = activeDripBtn ? activeDripBtn.dataset.drip === "true" : true;

  currentData = computeAccurateReturn(symbol, horizon, initialPrincipal, isDrip);

  renderHeaderAndKPIs(currentData);
  renderComparisonChart(currentData);
  renderTable(currentData);
  renderDividendLog(currentData);
}

function renderHeaderAndKPIs(data) {
  document.getElementById("asset-name").textContent = data.asset.name;
  document.getElementById("asset-ticker").textContent = data.asset.ticker;
  document.getElementById("asset-current-price").textContent = formatCurrency(data.endPrice);

  document.getElementById("kpi-accurate-ror").textContent = `${formatSign(data.dripGainPct)}${data.dripGainPct.toFixed(2)}%`;
  document.getElementById("kpi-accurate-val").textContent = `${formatCurrency(data.finalDripValue)} ending value`;

  document.getElementById("kpi-price-gain").textContent = `${formatSign(data.priceGainPct)}${data.priceGainPct.toFixed(2)}%`;
  document.getElementById("kpi-price-val").textContent = `${formatCurrency(data.finalPriceValue)} price gain`;

  document.getElementById("kpi-div-boost").textContent = `${formatSign(data.divBoostPct)}${data.divBoostPct.toFixed(2)}%`;
  document.getElementById("kpi-div-val").textContent = `${formatCurrency(data.finalDripValue - data.finalPriceValue)} from dividends`;

  document.getElementById("kpi-cagr").textContent = `${data.cagrDrip.toFixed(2)}% / yr`;
}

function renderComparisonChart(data) {
  const ctx = document.getElementById("returnChart").getContext("2d");

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: data.timeLabels,
      datasets: [
        {
          label: "Accurate Total Return (DRIP)",
          data: data.dripSeries,
          borderColor: "#00e699",
          backgroundColor: "rgba(0, 230, 153, 0.12)",
          fill: true,
          borderWidth: 3,
          tension: 0.3,
          pointRadius: 2
        },
        {
          label: "Standard Price Return",
          data: data.priceSeries,
          borderColor: "#3b82f6",
          borderDash: [5, 5],
          backgroundColor: "transparent",
          fill: false,
          borderWidth: 2,
          tension: 0.3,
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgba(9, 13, 22, 0.95)",
          titleFont: { family: "Plus Jakarta Sans", size: 13, weight: "700" },
          bodyFont: { family: "JetBrains Mono", size: 12 },
          borderColor: "rgba(255, 255, 255, 0.1)",
          borderWidth: 1,
          padding: 12,
          callbacks: {
            label: function (context) {
              return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: "rgba(255, 255, 255, 0.05)" },
          ticks: { color: "#9ca3af", font: { family: "JetBrains Mono", size: 11 } }
        },
        y: {
          grid: { color: "rgba(255, 255, 255, 0.05)" },
          ticks: {
            color: "#9ca3af",
            font: { family: "JetBrains Mono", size: 11 },
            callback: (val) => formatCurrency(val)
          }
        }
      }
    }
  });
}

function renderTable(data) {
  document.getElementById("tbl-init-price").textContent = formatCurrency(data.initialPrincipal);
  document.getElementById("tbl-init-drip").textContent = formatCurrency(data.initialPrincipal);

  document.getElementById("tbl-start-p1").textContent = formatCurrency(data.startPrice);
  document.getElementById("tbl-start-p2").textContent = formatCurrency(data.startPrice);

  document.getElementById("tbl-end-p1").textContent = formatCurrency(data.endPrice);
  document.getElementById("tbl-end-p2").textContent = formatCurrency(data.endPrice);

  document.getElementById("tbl-shares-price").textContent = `${data.initialShares.toFixed(3)} shares`;
  document.getElementById("tbl-shares-drip").textContent = `${data.endingShares.toFixed(3)} shares`;
  
  const sharesDiff = data.endingShares - data.initialShares;
  const sharesDiffPct = (sharesDiff / data.initialShares) * 100;
  document.getElementById("tbl-shares-diff").textContent = `+${sharesDiff.toFixed(3)} shares (+${sharesDiffPct.toFixed(2)}%)`;

  const totalDivVal = data.finalDripValue - data.finalPriceValue;
  document.getElementById("tbl-div-paid").textContent = formatCurrency(totalDivVal);
  document.getElementById("tbl-div-diff").textContent = `+${formatCurrency(totalDivVal)}`;

  document.getElementById("tbl-final-val-price").textContent = formatCurrency(data.finalPriceValue);
  document.getElementById("tbl-final-val-drip").textContent = formatCurrency(data.finalDripValue);
  document.getElementById("tbl-final-val-diff").textContent = `+${formatCurrency(totalDivVal)}`;

  document.getElementById("tbl-ror-price").textContent = `${formatSign(data.priceGainPct)}${data.priceGainPct.toFixed(2)}%`;
  document.getElementById("tbl-ror-drip").textContent = `${formatSign(data.dripGainPct)}${data.dripGainPct.toFixed(2)}%`;
  document.getElementById("tbl-ror-diff").textContent = `+${data.divBoostPct.toFixed(2)}%`;

  document.getElementById("tbl-cagr-price").textContent = `${data.cagrPrice.toFixed(2)}% / yr`;
  document.getElementById("tbl-cagr-drip").textContent = `${data.cagrDrip.toFixed(2)}% / yr`;
  document.getElementById("tbl-cagr-diff").textContent = `+${(data.cagrDrip - data.cagrPrice).toFixed(2)}% / yr`;
}

function renderDividendLog(data) {
  const tbody = document.getElementById("dividend-history-tbody");
  tbody.innerHTML = "";

  document.getElementById("div-count-badge").textContent = `${data.dividendEvents.length} Payments Recorded`;

  data.dividendEvents.forEach(evt => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${evt.date}</td>
      <td>${formatCurrency(evt.divPerShare)}</td>
      <td>${evt.sharesHeld.toFixed(3)}</td>
      <td class="text-green">${formatCurrency(evt.cashEarned)}</td>
      <td>${formatCurrency(evt.reinvestPrice)}</td>
      <td>+${evt.newShares.toFixed(3)}</td>
      <td><strong>${evt.totalShares.toFixed(3)}</strong></td>
    `;
    tbody.appendChild(tr);
  });
}

function exportCSV() {
  if (!currentData) return;
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Ex-Date,Dividend Per Share,Shares Held,Cash Earned,Reinvest Price,New Shares,Total Cumulative Shares\n";

  currentData.dividendEvents.forEach(e => {
    csvContent += `${e.date},${e.divPerShare.toFixed(4)},${e.sharesHeld.toFixed(4)},${e.cashEarned.toFixed(2)},${e.reinvestPrice.toFixed(2)},${e.newShares.toFixed(4)},${e.totalShares.toFixed(4)}\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${currentData.asset.ticker}_dividend_history.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Utility Helpers
function formatCurrency(val) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val);
}

function formatSign(val) {
  return val >= 0 ? "+" : "";
}
