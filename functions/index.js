const functions = require("firebase-functions");
const admin = require("firebase-admin");
const TwitterApi = require("twitter-api-v2").default;
const { Configuration, OpenAIApi } = require("openai");
admin.initializeApp();

// Database reference
const dbRef = admin.firestore().doc("tokens/demo");

// Twitter API init
const twitterClient = new TwitterApi({
  clientId: "S0lWd0JtYURpR0tHV1dib0sxRXA6MTpjaQ",
  clientSecret: "62xoNTb1031TS7NB2hg76avakizYOlhtNZ04eDwxsoWAY6MdHy",
});

const port = "5001";
const callbackURL = `http://127.0.0.1:${port}/whubot-9aeb3/us-central1/callback`;

// OpenAI API init
const configuration = new Configuration({
  organization: "org-FVKQYhm9HcjSioxaCqk8GfWe",
  apiKey: "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",
});
const openai = new OpenAIApi(configuration);

// STEP 1 - Auth URL
exports.auth = functions.https.onRequest(async (request, response) => {
  console.log(`Authentication started`);
  const { url, codeVerifier, state } = twitterClient.generateOAuth2AuthLink(
    callbackURL,
    { scope: ["tweet.read", "tweet.write", "users.read", "offline.access"] }
  );

  // store verifier
  await dbRef.set({ codeVerifier, state });

  response.redirect(url);
});

// STEP 2 - Verify callback code, store access_token
exports.callback = functions.https.onRequest(async (request, response) => {
  const { state, code } = request.query;

  const dbSnapshot = await dbRef.get();
  const { codeVerifier, state: storedState } = dbSnapshot.data();

  if (state !== storedState) {
    return response.status(400).send("Stored tokens do not match!");
  }

  const {
    client: loggedClient,
    accessToken,
    refreshToken,
  } = await twitterClient.loginWithOAuth2({
    code,
    codeVerifier,
    redirectUri: callbackURL,
  });
  console.log(`Access Token: ${accessToken}, refreshToken: ${refreshToken}`);
  await dbRef.set({ accessToken, refreshToken });

  const { data } = await loggedClient.v2.me(); // start using the client if you want

  response.send(data);
});

// STEP 3 - Refresh tokens and post tweets
exports.tweet = functions.https.onRequest(async (request, response) => {
  const prompt = `tweet something about ${matchDayPrompts[0]}`;
  console.log(`Prompt: ${prompt}`);
  const { refreshToken } = (await dbRef.get()).data();
  const {
    client: refreshedClient,
    accessToken,
    refreshToken: newRefreshToken,
  } = await twitterClient.refreshOAuth2Token(refreshToken);

  await dbRef.set({ accessToken, refreshToken: newRefreshToken });

  const nextTweet = await openai.createCompletion("text-davinci-002", {
    prompt,
    max_tokens: 64,
  });

  const tweet = `${nextTweet.data.choices[0].text} #COYI #IRONS`;
  console.log(`Tweeting: ${tweet}`);
  const { data } = await refreshedClient.v2.tweet(tweet);

  response.send(data);
});

// Setting local timeout
exports.cronTweet = functions.https.onRequest(async (request, response) => {
  // tweets every 10 seconds
  await setInterval(this.tweet, 28800000, request, response);
  response.send("Sending out tweets every 10 seconds");
});

// Step 4 - Run on cron job
exports.tweetHourly = functions.pubsub
  .schedule("*/5 * * * *")
  .onRun(async (context) => {
    console.log("Tweeting every 5 minutes");
    this.tweet();
  });

const matchDayPrompts = ["West Ham vs Everton", "West Ham vs Wolves"];
const playerPrompts = [
  "Alphonse Aréola",
  "Łukasz Fabiański",
  "Darren Randolph",
  "Vladimir Coufal",
  "Jarod Bowen",
  "Gianluca Scamacca",
];
