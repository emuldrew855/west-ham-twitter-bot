import axios from "axios";
import Parser from "rss-parser";
import { getAIResponse } from "./openapi.js";
const parser = new Parser();

// TODO: Ensure trending tickers are relevant
async function getTrendingTickers() {
  try {
    const response = await axios.get(
      "https://api.stocktwits.com/api/2/trending/symbols.json"
    );
    const tickers = response.data.symbols
      .filter((symbol) => !symbol.symbol.includes(".X")) // filter out crypto
      .map((symbol) => `$${symbol.symbol}`);
    return tickers.slice(0, 5); // Top 5 trending stocks
  } catch (error) {
    console.error("Error fetching trending tickers:", error.message);
    return [];
  }
}

// 2. Get finance news headlines from Yahoo Finance RSS
async function getFinanceHeadlines() {
  try {
    const feed = await parser.parseURL(
      "https://feeds.finance.yahoo.com/rss/2.0/headline?s=^GSPC&region=US&lang=en-US"
    );
    const headlines = feed.items.slice(0, 10).map((item) => item.title);
    return headlines;
  } catch (error) {
    console.error("Error fetching finance headlines:", error.message);
    return [];
  }
}

async function aiSummaryOfMarketSentiment() {
  const headlines = await getFinanceHeadlines();
  const prompt = `Please summarise really succinctly into 3 bullet points the general market sentiment based on these headlines. 
 Please use bullet points & use engaging emojis. Please keep each sentence max 11 words long.  Headlines "${headlines}"`;
  console.log(`Prompt: ${prompt}`);
  const response = await getAIResponse(prompt);
  return response;
}

// 3. Format the sentiment tweet
function formatSentimentTweet(summary) {
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  let tweet = `🔍 Market Sentiment Summary – ${dateStr}\n\n`;
  tweet += summary;
  tweet += `\n\n#Investing #Stocks #Economy`;

  return tweet;
}

// 4. Master function to create the tweet
export async function createSentimentTweet() {
  const summary = await aiSummaryOfMarketSentiment();
  const tweetText = formatSentimentTweet(summary);
  return tweetText;
}
