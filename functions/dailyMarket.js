import axios from "axios";
import { config } from "./config.js";

const gainersUrl = `https://financialmodelingprep.com/stable/biggest-gainers?apikey=${config.fmpAPIKey}`;
const losersUrl = `https://financialmodelingprep.com/stable/biggest-losers?apikey=${config.fmpAPIKey}`;

// Helper to fetch index data
async function getMarketSummary() {
  const symbols = {
    "^GSPC": "S&P 500",
    "^IXIC": "NASDAQ",
    "^DJI": "Dow Jones",
  };

  const indexes = await Promise.all(
    Object.keys(symbols).map(async (symbol) => {
      const res = await axios.get(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`
      );
      const data = res.data.chart.result[0];
      const change =
        ((data.meta.regularMarketPrice - data.meta.chartPreviousClose) /
          data.meta.chartPreviousClose) *
        100;
      return {
        name: symbols[symbol],
        change: change.toFixed(2),
      };
    })
  );
  const marketSummary = indexes
    .map((i) => `${i.name}: ${i.change > 0 ? "+" : ""}${i.change}%`)
    .join("\n");

  return marketSummary;
}

function top3(stockList) {
  const topThree = stockList
    .sort((a, b) => a.changesPercentage - b.changesPercentage) // Sort by percentage drop
    .slice(0, 3) // Take top 3
    .map((stock) => `• $${stock.symbol} ${stock.changesPercentage.toFixed(2)}%`)
    .join("\n");
  return topThree;
}

async function fetchTopStocks(url) {
  try {
    const res = await axios.get(url);
    return top3(res.data);
  } catch (error) {
    console.error(`Error fetching data from ${url}:`, error.message);
    return null;
  }
}

// Helper to generate tweet
export async function getDailyMarketTweet() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const dateStr = yesterday.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const marketSummary = await getMarketSummary();

  const topLosers = await fetchTopStocks(gainersUrl);
  const topGainers = await fetchTopStocks(losersUrl);
  const prompt = `

📉 Market Wrap – ${dateStr}

${marketSummary}

🔥 Top Gainers:
${topGainers}

🚨 Top Losers:
${topLosers}

#StockMarket #FinTwit #Investing #Trading #MarketUpdate #SP500 #NASDAQ #DowJones #Finance`;

  return prompt;
}
