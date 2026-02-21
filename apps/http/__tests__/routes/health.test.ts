import { describe, it, expect } from "vitest";
import request from "supertest";
import { createTestApp } from "../helpers/app.js";

const app = createTestApp();

describe("GET /health", () => {
  it("returns 200 with status ok", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  it("returns a valid ISO timestamp", async () => {
    const res = await request(app).get("/health");

    expect(res.body.timestamp).toBeDefined();
    expect(new Date(res.body.timestamp).toISOString()).toBe(res.body.timestamp);
  });
});
