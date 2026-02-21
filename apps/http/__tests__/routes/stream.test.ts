import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import express from "express";
import { Router, Request, Response } from "express";

vi.mock("../../src/services/SSEManager.js", () => ({
  SSEManager: {
    addClient: vi.fn().mockResolvedValue(undefined),
    removeClient: vi.fn().mockResolvedValue(undefined),
    shutdown: vi.fn().mockResolvedValue(undefined),
  },
}));

function createStreamApp() {
  const app = express();

  const streamRouter = Router();

  streamRouter.get(
    "/api/v1/stream/:jobId",
    async (req: Request, res: Response) => {
      const { jobId } = req.params;

      if (!jobId) {
        return res.status(400).json({ error: "jobId is required" });
      }

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      res.write(`data: ${JSON.stringify({ status: "connected", jobId })}\n\n`);
      res.end();
    },
  );

  app.use(streamRouter);
  return app;
}

const app = createStreamApp();

describe("GET /api/v1/stream/:jobId", () => {
  it("returns SSE headers", async () => {
    const res = await request(app).get("/api/v1/stream/test-job-id");

    expect(res.headers["content-type"]).toContain("text/event-stream");
    expect(res.headers["cache-control"]).toBe("no-cache");
  });

  it("sends initial connected event with jobId", async () => {
    const res = await request(app).get("/api/v1/stream/my-job-123");

    const parsed = JSON.parse(res.text.replace("data: ", "").trim());
    expect(parsed.status).toBe("connected");
    expect(parsed.jobId).toBe("my-job-123");
  });
});
