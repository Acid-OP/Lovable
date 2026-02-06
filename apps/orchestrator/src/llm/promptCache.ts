import { GoogleAICacheManager } from "@google/generative-ai/server";
import { redis } from "@repo/redis";
import { hash } from "../utils/cache.js";
import {
  PROMPT_CACHE_PREFIX,
  CACHE_TTL_SECONDS,
  GEMINI_MODEL,
  CacheMetadata,
} from "./constants.js";
import { getApiKey } from "./config.js";
import { logger } from "../utils/logger.js";

export class PromptCacheManager {
  private static instance: PromptCacheManager;
  private cacheManager: GoogleAICacheManager;

  private constructor() {
    const apiKey = getApiKey();
    this.cacheManager = new GoogleAICacheManager(apiKey);
  }

  static getInstance(): PromptCacheManager {
    if (!this.instance) {
      this.instance = new PromptCacheManager();
    }
    return this.instance;
  }

  private buildCacheKey(cacheKey: string): string {
    return `${PROMPT_CACHE_PREFIX}${cacheKey}`;
  }

  private async getCacheMetadata(
    cacheKey: string,
  ): Promise<CacheMetadata | null> {
    const redisKey = this.buildCacheKey(cacheKey);
    const data = await redis.get(redisKey);

    if (!data) return null;

    return JSON.parse(data) as CacheMetadata;
  }

  private async setCacheMetadata(
    cacheKey: string,
    metadata: CacheMetadata,
  ): Promise<void> {
    const redisKey = this.buildCacheKey(cacheKey);
    await redis.set(
      redisKey,
      JSON.stringify(metadata),
      "EX",
      CACHE_TTL_SECONDS,
    );
  }

  private async createGeminiCache(systemPrompt: string): Promise<string> {
    try {
      const cache = await this.cacheManager.create({
        model: GEMINI_MODEL,
        displayName: "lovable-system-prompt",
        systemInstruction: systemPrompt,
        contents: [
          {
            role: "user",
            parts: [{ text: "Ready to process user requests." }],
          },
        ],
        ttlSeconds: CACHE_TTL_SECONDS,
      });

      if (!cache.name) {
        throw new Error("Cache creation failed: no cache name returned");
      }
      return cache.name;
    } catch (error) {
      logger.error("prompt_cache.creation_failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async getOrCreateCache(
    cacheKey: string,
    systemPrompt: string,
  ): Promise<string> {
    const promptHash = hash(systemPrompt);

    // Check Redis for existing cache metadata
    const existing = await this.getCacheMetadata(cacheKey);

    if (existing) {
      // Check if cache is still valid
      const now = Date.now();
      const isExpired = existing.expiresAt <= now;
      const promptChanged = existing.promptHash !== promptHash;

      if (!isExpired && !promptChanged) {
        logger.info("prompt_cache.reusing", { cacheKey });
        return existing.cacheId;
      }

      if (isExpired) {
        logger.info("prompt_cache.expired", { cacheKey });
      }
      if (promptChanged) {
        logger.info("prompt_cache.invalidated", {
          cacheKey,
          reason: "prompt_changed",
        });
      }
    }

    // Create new cache
    const cacheId = await this.createGeminiCache(systemPrompt);

    // Store metadata in Redis
    const metadata: CacheMetadata = {
      cacheId,
      createdAt: Date.now(),
      expiresAt: Date.now() + CACHE_TTL_SECONDS * 1000,
      promptHash,
    };

    await this.setCacheMetadata(cacheKey, metadata);

    logger.info("prompt_cache.created", {
      cacheKey,
      cacheId,
      ttl: CACHE_TTL_SECONDS,
    });

    return cacheId;
  }

  /**
   * Clear cache metadata from Redis
   */
  async clearCache(cacheKey: string): Promise<void> {
    const redisKey = this.buildCacheKey(cacheKey);
    await redis.del(redisKey);
    logger.info("prompt_cache.cleared", { cacheKey });
  }

  /**
   * Get cache statistics for monitoring
   */
  async getStats(): Promise<{
    caches: Array<{ key: string; expiresIn: number }>;
  }> {
    const pattern = `${PROMPT_CACHE_PREFIX}*`;
    const keys = await redis.keys(pattern);

    const caches = await Promise.all(
      keys.map(async (key: string) => {
        const cacheKey = key.replace(PROMPT_CACHE_PREFIX, "");
        const metadata = await this.getCacheMetadata(cacheKey);

        if (!metadata) {
          return { key: cacheKey, expiresIn: 0 };
        }

        return {
          key: cacheKey,
          expiresIn: Math.max(0, metadata.expiresAt - Date.now()),
        };
      }),
    );

    return { caches };
  }
}
