// Redis key prefix for storing Gemini cache metadata
export const PROMPT_CACHE_PREFIX = "llm_cache:" as const;

// Cache TTL
export const CACHE_TTL_SECONDS = 3600;

// Cache keys for different system prompts
export const CACHE_KEYS = {
  PLAN_SYSTEM_PROMPT: "plan_system_prompt",
  INCREMENTAL_PLAN_SYSTEM_PROMPT: "incremental_plan_system_prompt",
} as const;

export const GEMINI_MODEL = "models/gemini-2.5-flash" as const;

// Cache metadata stored in Redis
export interface CacheMetadata {
  cacheId: string;
  createdAt: number;
  expiresAt: number;
  promptHash: string;
}
