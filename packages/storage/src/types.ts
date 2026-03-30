/**
 * Provider-agnostic interface for blob/file storage.
 *
 * Implementations can target Cloudflare R2, AWS S3, MinIO,
 * or fall back to Redis for local development.
 */
export interface IStorageProvider {
  put(key: string, data: string): Promise<void>;
  get(key: string): Promise<string | null>;
  delete(key: string): Promise<void>;
}

export type StorageProviderType = "r2" | "redis";
