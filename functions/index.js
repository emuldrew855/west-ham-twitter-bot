import { initializeDbRef } from "./firebase.js";
import { authFunction, callbackFunction, tweet } from "./twitter.js";
import * as functions from "firebase-functions";
import { getDailyMarketTweet } from "./dailyMarket.js";
import { createSentimentTweet } from "./sentiment.js";

// Initialize Firebase
await initializeDbRef();

// Export functions for Firebase Functions
export const auth = functions.https.onRequest(authFunction);
export const callback = functions.https.onRequest(callbackFunction);

export const dailyMarketSummary = functions.pubsub
  .schedule("5 16 * * 1-5") // 4:05 PM Monday to Friday
  .timeZone("America/New_York") // US Eastern Time (handles DST automatically)
  .onRun(async (context) => {
    const text = await getDailyMarketTweet();
    await tweet(text);
  });

export const dailyMarketSentiment = functions.pubsub
  .schedule("0 9 * * *") // 9:00 AM every day
  .timeZone("Europe/London") // UK time (handles DST automatically)
  .onRun(async (context) => {
    const text = await getDailyMarketTweet();
    await tweet(text);
  });

// Manually tweet if you want
export const tweetFunction = functions.https.onRequest(async (req, res) => {
  // const text = await getDailyMarketTweet();
  const text = await createSentimentTweet();
  const result = await tweet(text); // Optional input from HTTP request
  res.send(result);
});
