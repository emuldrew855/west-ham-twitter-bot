import { Configuration, OpenAIApi } from "openai";
import { config } from "./config.js";

const openaiConfiguration = new Configuration({
  organization: config.openaiOrgId,
  apiKey: config.openaiApiKey,
});

export const openai = new OpenAIApi(openaiConfiguration);

export async function getAIResponse(prompt) {
  return await openai.createCompletion("gpt-3.5-turbo-instruct", {
    prompt,
    max_tokens: 64,
  });
}
