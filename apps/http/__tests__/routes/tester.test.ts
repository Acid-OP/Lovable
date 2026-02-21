import { describe, it, expect } from "vitest";
import request from "supertest";
import { createTestApp } from "../helpers/app.js";

const app = createTestApp();

describe("POST /api/v1/prompt-test", () => {
  it("returns 200 with mock jobId for valid prompt", async () => {
    const res = await request(app)
      .post("/api/v1/prompt-test")
      .send({ prompt: "Test prompt" });

    expect(res.status).toBe(200);
    expect(res.body.message).toContain("test mode");
    expect(res.body.jobId).toBeDefined();
    expect(res.body.clientId).toBeDefined();
  });

  it("sets isIteration false when no previousJobId", async () => {
    const res = await request(app)
      .post("/api/v1/prompt-test")
      .send({ prompt: "Test prompt" });

    expect(res.body.isIteration).toBe(false);
  });

  it("sets isIteration true with valid previousJobId", async () => {
    const uuid = "550e8400-e29b-41d4-a716-446655440000";
    const res = await request(app)
      .post("/api/v1/prompt-test")
      .send({ prompt: "Iterate", previousJobId: uuid });

    expect(res.body.isIteration).toBe(true);
    expect(res.body.jobId).toBe(uuid);
  });

  it("returns 400 for empty prompt", async () => {
    const res = await request(app)
      .post("/api/v1/prompt-test")
      .send({ prompt: "" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid input");
  });

  it("returns 400 for missing prompt", async () => {
    const res = await request(app).post("/api/v1/prompt-test").send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid input");
  });
});
