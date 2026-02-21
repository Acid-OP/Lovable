import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createTestApp } from "../helpers/app.js";
import { redis } from "@repo/redis";

const app = createTestApp();

describe("POST /api/v1/runtime-report/:jobId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns success for valid error report", async () => {
    const res = await request(app)
      .post("/api/v1/runtime-report/test-job-123")
      .send({
        errors: [{ message: "TypeError: undefined is not a function" }],
        url: "/",
        timestamp: Date.now(),
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("pushes errors to Redis and sets TTL", async () => {
    await request(app)
      .post("/api/v1/runtime-report/test-job-456")
      .send({
        errors: [{ message: "Some error" }],
        url: "/dashboard",
        timestamp: Date.now(),
      });

    expect(redis.lpush).toHaveBeenCalledWith(
      "runtime-result:test-job-456",
      expect.any(String),
    );
    expect(redis.expire).toHaveBeenCalledWith(
      "runtime-result:test-job-456",
      120,
    );
  });

  it("returns 400 when errors is not an array", async () => {
    const res = await request(app)
      .post("/api/v1/runtime-report/test-job-789")
      .send({ errors: "not an array", url: "/" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("errors must be an array");
  });
});
