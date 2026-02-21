import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createTestApp } from "../helpers/app.js";
import { QueueManager } from "@repo/queue";
import { SessionManager } from "@repo/session";

const app = createTestApp();

const mockPushToQueue = vi.fn().mockResolvedValue({ jobId: "test-job-123" });
vi.mocked(QueueManager.getInstance).mockReturnValue({
  pushToQueue: mockPushToQueue,
} as any);

describe("POST /api/v1/prompt", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPushToQueue.mockResolvedValue({ jobId: "test-job-123" });
    vi.mocked(QueueManager.getInstance).mockReturnValue({
      pushToQueue: mockPushToQueue,
    } as any);
  });

  it("returns 200 for a valid prompt", async () => {
    const res = await request(app)
      .post("/api/v1/prompt")
      .send({ prompt: "Build a landing page" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Prompt enqueued");
    expect(res.body.jobId).toBeDefined();
  });

  it("creates a new session for first prompt", async () => {
    await request(app)
      .post("/api/v1/prompt")
      .send({ prompt: "Build a todo app" });

    expect(SessionManager.create).toHaveBeenCalled();
  });

  it("returns 400 when prompt is empty", async () => {
    const res = await request(app).post("/api/v1/prompt").send({ prompt: "" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid input");
  });

  it("returns 400 when prompt is missing", async () => {
    const res = await request(app).post("/api/v1/prompt").send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid input");
  });

  it("returns 400 when prompt exceeds 5000 characters", async () => {
    const res = await request(app)
      .post("/api/v1/prompt")
      .send({ prompt: "a".repeat(5001) });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid input");
  });

  it("returns 400 for invalid previousJobId format", async () => {
    const res = await request(app)
      .post("/api/v1/prompt")
      .send({ prompt: "Iterate on this", previousJobId: "not-a-uuid" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid input");
  });

  it("handles iteration with valid previousJobId", async () => {
    const uuid = "550e8400-e29b-41d4-a716-446655440000";
    mockPushToQueue.mockResolvedValue({ jobId: uuid });

    const res = await request(app)
      .post("/api/v1/prompt")
      .send({ prompt: "Add dark mode", previousJobId: uuid });

    expect(res.status).toBe(200);
    expect(res.body.isIteration).toBe(true);
  });

  it("returns 500 when queue push fails", async () => {
    mockPushToQueue.mockRejectedValueOnce(new Error("Queue unavailable"));

    const res = await request(app)
      .post("/api/v1/prompt")
      .send({ prompt: "Build something" });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Failed to enqueue prompt");
  });
});
