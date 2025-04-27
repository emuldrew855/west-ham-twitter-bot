// Highlight stocks gapping up/down most aggressively pre-market with volume filters.
// Example:
// "Pre-market Movers: $AMD +4.2% 🔥 $ROKU -3.1% 📉 Volume surging 150% above average."
// Day traders would check you every morning religiously.

// import axios from "axios";
// import * as cheerio from "cheerio";

// async function fetchPreMarketMovers() {
//   const url = "https://finance.yahoo.com/markets/stocks/gainers/";

//   try {
//     const response = await axios.get(url);
//     const $ = cheerio.load(response.data);

//     const movers = [];

//     // Loop through the table rows and get stock data
//     $("table tbody tr").each((index, element) => {
//       const symbol = $(element).find("td:nth-child(1) a").text();
//       const percentChange = $(element).find("td:nth-child(4)").text();
//       const price = $(element).find("td:nth-child(3)").text();

//       if (symbol && percentChange && price) {
//         movers.push({
//           symbol,
//           percentChange,
//           price,
//         });
//       }

//       if (movers.length >= 5) {
//         return false; // Stop once we have the top 5
//       }
//     });

//     // Format and log the top 5 pre-market movers
//     console.log("Top Pre-Market Gainers:");
//     movers.forEach((mover) => {
//       console.log(`$${mover.symbol} ${mover.percentChange} @ ${mover.price}`);
//     });

//     // Now you could send this to Twitter, format it nicely, etc.
//   } catch (error) {
//     console.error("Error fetching data:", error.message);
//   }
// }

// fetchPreMarketMovers();

import * as puppeteer from "puppeteer";

async function fetchPreMarketMovers() {
  const url = "https://www.benzinga.com/premarket";
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded" });

  const movers = await page.evaluate(() => {
    const rows = document.querySelectorAll("table tbody tr");
    const data = [];
    rows.forEach((row) => {
      const symbol = row.querySelector("td:nth-child(1) a")?.textContent.trim();
      const percentChange = row
        .querySelector("td:nth-child(4)")
        ?.textContent.trim();
      const price = row.querySelector("td:nth-child(3)")?.textContent.trim();
      if (symbol && percentChange && price) {
        data.push({ symbol, percentChange, price });
      }
    });
    return data;
  });

  await browser.close();
  return movers;
}

function parseStockData(input) {
  // Arrays to hold the parsed data
  let gainers = [];
  let losers = [];

  // Loop through each stock data object
  input.forEach((stock) => {
    // Skip entries that don't have a valid percent change
    if (
      stock.percentChange === "Sector Perform" ||
      stock.percentChange === "—" ||
      stock.percentChange === "Neutral" ||
      stock.percentChange.includes("Buy") ||
      stock.percentChange.includes("Scotiabank") ||
      stock.percentChange.includes("Citigroup")
    )
      return;

    const percentChange = parseFloat(stock.percentChange.replace("%", ""));

    // Categorize based on percentage change
    if (percentChange > 0) {
      gainers.push({ symbol: stock.symbol, percentChange, price: stock.price });
    } else if (percentChange < 0) {
      losers.push({ symbol: stock.symbol, percentChange, price: stock.price });
    }
  });

  // Sort the arrays by percentage change
  gainers.sort((a, b) => b.percentChange - a.percentChange);
  losers.sort((a, b) => a.percentChange - b.percentChange);

  // Return the top 5
  return {
    topGainers: gainers.slice(0, 5),
    topLosers: losers.slice(0, 5),
  };
}

function formatStockData({ topGainers, topLosers }) {
  let output = "🚀 Top Pre-Market Gainers 📈\n";
  topGainers.forEach((stock) => {
    output += `$${stock.symbol} ${stock.percentChange.toFixed(2)}% @ ${
      stock.price
    }\n`;
  });

  output += "\n📉 Top Pre-Market Losers ⬇️\n";
  topLosers.forEach((stock) => {
    output += `$${stock.symbol} ${stock.percentChange.toFixed(2)}% @ ${
      stock.price
    }\n`;
  });

  return output;
}

export async function getPreMarketTweet() {
  const data = await fetchPreMarketMovers();
  const result = parseStockData(data);
  return formatStockData(result);
}

getPreMarketTweet();
