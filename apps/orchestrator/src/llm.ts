import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

export async function givePromptToLLM<T>(
  prompt: string,
  schema: z.ZodType<T>
): Promise<T> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not set");
  }

  const { object } = await generateObject({
    model: google("gemini-2.5-flash"),
    prompt: prompt,
    schema: schema,
  });

  return object;
}
