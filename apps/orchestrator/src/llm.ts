import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export async function givePromptToLLM(prompt: string) {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not set");
  }

  const { text } = await generateText({
    model: google("gemini-2.5-flash"),
    prompt: prompt,
  });
  
  return {
    success: true,
    response: text,
  };
}

