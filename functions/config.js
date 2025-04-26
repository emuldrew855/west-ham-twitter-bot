import dotenv from "dotenv";

dotenv.config(); // Load environment variables

console.log(
  "GOOGLE_APPLICATION_CREDENTIALS:",
  process.env.GOOGLE_APPLICATION_CREDENTIALS
);

export const config = {
  twitterClientId: process.env.TWITTER_CLIENT_ID,
  twitterClientSecret: process.env.TWITTER_CLIENT_SECRET,
  openaiApiKey: process.env.OPENAI_API_KEY,
  openaiOrgId: process.env.OPENAI_ORG_ID,
  googleCredentialsPath: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  fmpAPIKey: process.env.FMP_API_KEY,
};
