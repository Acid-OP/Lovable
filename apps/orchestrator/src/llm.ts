import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { QuotaManager } from "@repo/quota";
import { PromptCacheManager } from "./llm/promptCache.js";
import { getLLMParams } from "./llm/config.js";

export async function givePromptToLLM<T>(
  prompt: string,
  schema: z.ZodType<T>,
  jobId?: string,
): Promise<T> {
  const { temperature, maxTokens, topP } = getLLMParams();

  const { object, usage } = await generateObject({
    model: google("gemini-2.5-flash"),
    prompt: prompt,
    schema: schema,
    temperature,
    maxTokens,
    topP,
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

export async function givePromptToLLMWithCache<T>(
  cacheKey: string,
  systemPrompt: string,
  userPrompt: string,
  schema: z.ZodType<T>,
  jobId?: string,
): Promise<T> {
  const { temperature, maxTokens, topP } = getLLMParams();
  // Get or create cached system prompt

  const cacheManager = PromptCacheManager.getInstance();
  const cacheId = await cacheManager.getOrCreateCache(cacheKey, systemPrompt);

  // If caching is disabled (empty cacheId), combine prompts and use regular call
  if (!cacheId) {
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
    return givePromptToLLM(fullPrompt, schema, jobId);
  }

  // Call LLM with cached content
  // The cached system prompt is referenced by ID, only user prompt is sent
  const modelWithCache = google("gemini-2.5-flash") as any;
  modelWithCache.cachedContent = cacheId;

  const { object, usage } = await generateObject({
    model: modelWithCache,
    prompt: userPrompt,
    schema: schema,
    temperature,
    maxTokens,
    topP,
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
