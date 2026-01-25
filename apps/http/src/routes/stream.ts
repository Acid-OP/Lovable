import { Router, Request, Response } from "express";
import { redis } from "@repo/redis";

export const streamRouter = Router();

streamRouter.get("/api/v1/stream/:jobId", async (req: Request, res: Response) => {
  const { jobId } = req.params;

  if (!jobId) {
    return res.status(400).json({ error: "jobId is required" });
  }

  // SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // Disable nginx buffering

  res.write(`data: ${JSON.stringify({ status: "connected", jobId })}\n\n`);

  const subscriber = redis.duplicate();
  const channel = `job:${jobId}`;
  try {
    await subscriber.subscribe(channel);
    console.log(`Client subscribed to channel: ${channel}`);

    subscriber.on("message", (ch: string, message: string) => {
      if (ch === channel) {
        res.write(`data: ${message}\n\n`);
      }
    });

    req.on("close", async () => {
      console.log(`Client disconnected from channel: ${channel}`);
      await subscriber.unsubscribe(channel);
      await subscriber.quit();
      res.end();
    });
  } catch (error) {
    console.error("SSE stream error:", error);
    await subscriber.unsubscribe(channel);
    await subscriber.quit();
    res.end();
  }
});
