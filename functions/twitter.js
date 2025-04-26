import { TwitterApi } from "twitter-api-v2";
import { config } from "./config.js";
import { dbRef } from "./firebase.js";

export const twitterClient = new TwitterApi({
  clientId: config.twitterClientId,
  clientSecret: config.twitterClientSecret,
});

const port = "5001";
export const callbackURL = `http://127.0.0.1:${port}/whubot-9aeb3/us-central1/callback`;

export async function authFunction(request, response) {
  console.log(`Twitter Authentication started`);
  const { url, codeVerifier, state } = twitterClient.generateOAuth2AuthLink(
    callbackURL,
    { scope: ["tweet.read", "tweet.write", "users.read", "offline.access"] }
  );

  await dbRef.set({ codeVerifier, state });
  response.redirect(url);
}

export async function callbackFunction(request, response) {
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

  await dbRef.set({ accessToken, refreshToken });
  const { data } = await loggedClient.v2.me();
  response.send(data);
}

export async function tweet(tweetText) {
  if (!tweetText) {
    console.log(`Error: No text to tweet, returning`);
    return;
  }
  const { refreshToken } = (await dbRef.get()).data();
  const {
    client: refreshedClient,
    accessToken,
    refreshToken: newRefreshToken,
  } = await twitterClient.refreshOAuth2Token(refreshToken);
  console.log("Refreshed token access");

  await dbRef.set({ accessToken, refreshToken: newRefreshToken });

  console.log(`Sending tweet: ${tweetText}`);
  let data;
  try {
    data = await refreshedClient.v2.tweet(tweetText);
  } catch (err) {
    console.log(`Err: ${err.toString()}`);
    return err;
  }
  return data;
}
