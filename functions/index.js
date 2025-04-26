import { initializeDbRef } from "./firebase.js";
import { authFunction, callbackFunction, tweet } from "./twitter.js";
import * as functions from "firebase-functions";
import { getDailyMarketTweet } from "./dailyMarket.js";

// Initialize Firebase
await initializeDbRef();

// Export functions for Firebase Functions
export const auth = functions.https.onRequest(authFunction);
export const callback = functions.https.onRequest(callbackFunction);

export const dailyTweetFunction = functions.pubsub
  .schedule("5 16 * * 1-5") // 4:05 PM Monday to Friday
  .timeZone("America/New_York") // US Eastern Time (handles DST automatically)
  .onRun(async (context) => {
    const text = await getDailyMarketTweet();
    await tweet(text);
  });

// Manually tweet if you want
export const tweetFunction = functions.https.onRequest(async (req, res) => {
  const text = await getDailyMarketTweet();
  const result = await tweet(text); // Optional input from HTTP request
  res.send(result);
});

// const text = await getDailyMarketTweet();
// tweet(text);
