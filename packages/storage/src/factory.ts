import type { IStorageProvider, StorageProviderType } from "./types.js";
import { R2StorageProvider } from "./r2.js";
import { RedisStorageProvider } from "./redis-fallback.js";

type RedisLike = {
  set(
    key: string,
    value: string,
    ...args: (string | number)[]
  ): Promise<unknown>;
  get(key: string): Promise<string | null>;
  del(key: string): Promise<unknown>;
};

let instance: IStorageProvider | null = null;

/**
 * Creates the appropriate storage provider based on the STORAGE_PROVIDER env var.
 *
 * - "r2": Cloudflare R2 (requires R2_* env vars)
 * - "redis": Falls back to Redis with TTL (for local dev)
 *
 * Defaults to "redis" when STORAGE_PROVIDER is not set, so local dev
 * works without any R2 configuration.
 *
 * @param redisClient - Required when using "redis" provider. Pass your ioredis instance.
 */
export function createStorageProvider(
  redisClient?: RedisLike,
): IStorageProvider {
  if (instance) return instance;

  const providerType =
    (process.env.STORAGE_PROVIDER as StorageProviderType) || "redis";

  switch (providerType) {
    case "r2":
      instance = new R2StorageProvider();
      break;
    case "redis":
      if (!redisClient) {
        throw new Error(
          'Storage provider "redis" requires a Redis client. Pass it to createStorageProvider(redisClient).',
        );
      }
      instance = new RedisStorageProvider(redisClient);
      break;
    default:
      throw new Error(
        `Unknown storage provider: "${providerType}". Available: r2, redis`,
      );
  }

  return instance;
}
