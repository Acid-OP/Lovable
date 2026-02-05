import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { QuotaManager } from "@repo/quota";

export async function givePromptToLLM<T>(
  prompt: string,
  schema: z.ZodType<T>,
  jobId?: string,
): Promise<T> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not set");
  }

  // LLM parameters from env (with defaults)
  const temperature = parseFloat(process.env.LLM_TEMPERATURE || "0.7");
  const maxTokens = parseInt(process.env.LLM_MAX_TOKENS || "8000");
  const topP = parseFloat(process.env.LLM_TOP_P || "0.9");

  const { object, usage } = await generateObject({
    model: google("gemini-2.5-flash"),
    prompt: prompt,
    schema: schema,
    temperature, // 0.7 = balanced creativity
    maxTokens, // 8000 = allow long code files
    topP, // 0.9 = nucleus sampling (good variety)
  });

  // Track usage after successful API call
  if (usage) {
    await QuotaManager.getInstance().recordUsage({
      inputTokens: usage.inputTokens || 0,
      outputTokens: usage.outputTokens || 0,
      model: "gemini-2.5-flash",
      jobId,
    });
  }

  return object;
}
