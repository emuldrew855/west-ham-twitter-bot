import { initializeDbRef } from "./libs/firebase.js";
import { authFunction, callbackFunction, tweet } from "./libs/twitter.js";
import * as functions from "firebase-functions";
import { getDailyMarketTweet } from "./tweets/dailyMarket.js";
import { createSentimentTweet } from "./tweets/sentiment.js";
import { getPreMarketTweet } from "./tweets/preMarketGap.js";

// Initialize Firebase
(async () => {
  await initializeDbRef();
})();

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
  .schedule("0 9 * * 1-5") // 9:00 AM every day
  .timeZone("Europe/London") // UK time (handles DST automatically)
  .onRun(async (context) => {
    const text = await createSentimentTweet();
    await tweet(text);
  });

export const preMarketGap = functions.pubsub
  .schedule("0 9 * * 1-5") // 9:00 AM EST every day (30 minutes before 9:30 AM market open)
  .timeZone("America/New_York") // US Eastern Time (handles DST automatically)
  .onRun(async (context) => {
    const text = await getPreMarketTweet();
    await tweet(text);
  });

export const testCronJob = functions.pubsub
  .schedule("*/5 * * * *") // Run every 5 minutes
  .timeZone("America/New_York") // You can adjust the time zone as needed
  .onRun(async (context) => {
    const text = "Test Tweet 🚀";
    await tweet(text); // Assuming you have a tweet function set up
  });

// Manually tweet if you want
export const tweetFunction = functions.https.onRequest(async (req, res) => {
  // const text = await getDailyMarketTweet();
  // const text = await createSentimentTweet();
  const text = await getPreMarketTweet();
  const result = await tweet(text); // Optional input from HTTP request
  res.send(result);
});
