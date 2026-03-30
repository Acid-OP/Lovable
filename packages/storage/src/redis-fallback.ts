import type { IStorageProvider } from "./types.js";

type RedisLike = {
  set(
    key: string,
    value: string,
    ...args: (string | number)[]
  ): Promise<unknown>;
  get(key: string): Promise<string | null>;
  del(key: string): Promise<unknown>;
};

const DEFAULT_TTL_SECONDS = 3600;

/**
 * Fallback storage provider that uses Redis.
 * Intended for local development when R2 is not configured.
 */
export class RedisStorageProvider implements IStorageProvider {
  private redis: RedisLike;
  private ttl: number;

  constructor(redis: RedisLike, ttl: number = DEFAULT_TTL_SECONDS) {
    this.redis = redis;
    this.ttl = ttl;
  }

  async put(key: string, data: string): Promise<void> {
    await this.redis.set(key, data, "EX", this.ttl);
  }

  async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  async delete(key: string): Promise<void> {
    await this.redis.del(key);
  }
}
