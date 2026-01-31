import { redis } from "@repo/redis";
import crypto from "crypto";

export const CACHE_TTL = {
  PLAN: 60 * 60 * 24,
  SESSION: 60 * 60 * 2,
  PROMPT: 60 * 60 * 1,
} as const;

export const CACHE_PREFIX = {
  PLAN: "plan:",
  SESSION: "session:",
  PROMPT: "prompt:",
} as const;

function normalize(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s]/g, "");
}

export function hash(text: string): string {
  const normalized = normalize(text);
  return crypto
    .createHash("sha256")
    .update(normalized)
    .digest("hex")
    .slice(0, 16);
}

export async function get<T>(key: string): Promise<T | null> {
  const cached = await redis.get(key);
  if (!cached) return null;
  return JSON.parse(cached) as T;
}

export async function set<T>(
  key: string,
  value: T,
  ttlSeconds: number,
): Promise<void> {
  await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
}

export async function del(key: string): Promise<void> {
  await redis.del(key);
}

export function buildKey(prefix: string, text: string): string {
  return `${prefix}${hash(text)}`;
}
