import { OpenAI } from "openai";
import functions from "firebase-functions";
import { config } from "../config.js";

// Access the API key
const openaiApiKey = functions.config().openai.api_key;

const openai = new OpenAI({
  apiKey: openaiApiKey,
});

export async function getAIResponse(prompt) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 4000, // MAX 8192 tokens
    });
    console.log(
      `Prompt Token Usage: ${JSON.stringify(response.usage?.total_tokens)}`
    );
    const content = response.choices[0].message.content;
    return content;
  } catch (error) {
    console.error("Error in OpenAI request:", error);
  }
}
