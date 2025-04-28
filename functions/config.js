import dotenv from "dotenv";

dotenv.config(); // Load environment variables

export const config = {
  twitterClientId: process.env.TWITTER_CLIENT_ID,
  twitterClientSecret: process.env.TWITTER_CLIENT_SECRET,
  openaiApiKey: process.env.OPENAI_API_KEY,
  openaiOrgId: process.env.OPENAI_ORG_ID,
  fmpAPIKey: process.env.FMP_API_KEY,
};
