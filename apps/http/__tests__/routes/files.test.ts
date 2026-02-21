import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createTestApp } from "../helpers/app.js";
import { redis } from "@repo/redis";

const app = createTestApp();

describe("GET /api/v1/files/:jobId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns files when they exist in Redis", async () => {
    const mockFiles = {
      files: [{ path: "index.tsx", content: "hello", language: "typescript" }],
      metadata: { totalSize: 5 },
    };
    vi.mocked(redis.get).mockResolvedValueOnce(JSON.stringify(mockFiles));

    const res = await request(app).get("/api/v1/files/test-job-id");

    expect(res.status).toBe(200);
    expect(res.body.files).toHaveLength(1);
    expect(res.body.files[0].path).toBe("index.tsx");
  });

  it("returns 404 when no files found", async () => {
    vi.mocked(redis.get).mockResolvedValueOnce(null);

    const res = await request(app).get("/api/v1/files/nonexistent-job");

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Files not found");
  });

  it("returns 500 when Redis data is invalid JSON", async () => {
    vi.mocked(redis.get).mockResolvedValueOnce("not-valid-json{{{");

    const res = await request(app).get("/api/v1/files/bad-data-job");

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Internal server error");
  });

  it("returns 500 when Redis throws", async () => {
    vi.mocked(redis.get).mockRejectedValueOnce(
      new Error("Redis connection lost"),
    );

    const res = await request(app).get("/api/v1/files/error-job");

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Internal server error");
  });

  it("sets cache headers on successful response", async () => {
    const mockFiles = { files: [], metadata: { totalSize: 0 } };
    vi.mocked(redis.get).mockResolvedValueOnce(JSON.stringify(mockFiles));

    const res = await request(app).get("/api/v1/files/cache-test-job");

    expect(res.headers["cache-control"]).toContain("public");
    expect(res.headers["cache-control"]).toContain("immutable");
  });
});
