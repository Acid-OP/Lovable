import { describe, it, expect, vi } from "vitest";

// Mock @repo/redis before importing the module
vi.mock("@repo/redis", () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
  },
}));

import { hash, buildKey, CACHE_TTL, CACHE_PREFIX } from "../src/index.js";

describe("hash", () => {
  it("returns a 16-character hex string", () => {
    const result = hash("hello world");
    expect(result).toMatch(/^[0-9a-f]{16}$/);
  });

  it("is deterministic (same input = same output)", () => {
    expect(hash("build a website")).toBe(hash("build a website"));
  });

  it("produces different hashes for different inputs", () => {
    expect(hash("build a website")).not.toBe(hash("build an app"));
  });

  it("normalizes leading/trailing whitespace", () => {
    expect(hash("  hello world  ")).toBe(hash("hello world"));
  });

  it("normalizes multiple spaces to single space", () => {
    expect(hash("hello    world")).toBe(hash("hello world"));
  });

  it("is case insensitive", () => {
    expect(hash("Hello World")).toBe(hash("hello world"));
  });

  it("strips special characters", () => {
    expect(hash("hello, world!")).toBe(hash("hello world"));
  });
});

describe("buildKey", () => {
  it("concatenates prefix and hash", () => {
    const key = buildKey("plan:", "some prompt");
    expect(key.startsWith("plan:")).toBe(true);
    expect(key.length).toBe("plan:".length + 16);
  });

  it("different prefixes produce different keys", () => {
    const planKey = buildKey("plan:", "hello");
    const sessionKey = buildKey("session:", "hello");
    expect(planKey).not.toBe(sessionKey);
  });

  it("same prefix + same text = same key", () => {
    expect(buildKey("plan:", "test")).toBe(buildKey("plan:", "test"));
  });
});

describe("CACHE_TTL", () => {
  it("PLAN TTL is 24 hours", () => {
    expect(CACHE_TTL.PLAN).toBe(86400);
  });

  it("SESSION TTL is 2 hours", () => {
    expect(CACHE_TTL.SESSION).toBe(7200);
  });

  it("PROMPT TTL is 1 hour", () => {
    expect(CACHE_TTL.PROMPT).toBe(3600);
  });
});

describe("CACHE_PREFIX", () => {
  it("has expected prefix values", () => {
    expect(CACHE_PREFIX.PLAN).toBe("plan:");
    expect(CACHE_PREFIX.SESSION).toBe("session:");
    expect(CACHE_PREFIX.PROMPT).toBe("prompt:");
  });
});
