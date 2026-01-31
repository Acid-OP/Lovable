import { Router, Request, Response } from "express";
import { SSEManager } from "../services/SSEManager.js";
import { logger } from "../utils/logger.js";

export const streamRouter = Router();

let activeConnections = 0;
const MAX_CONNECTIONS = 1000;

streamRouter.get(
  "/api/v1/stream/:jobId",
  async (req: Request, res: Response) => {
    const { jobId } = req.params;

    if (!jobId) {
      return res.status(400).json({ error: "jobId is required" });
    }

    if (activeConnections >= MAX_CONNECTIONS) {
      return res
        .status(503)
        .json({ error: "Too many connections, try again later" });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    res.write(`data: ${JSON.stringify({ status: "connected", jobId })}\n\n`);

    activeConnections++;
    logger.info(`Active connections: ${activeConnections}`);

    try {
      await SSEManager.addClient(jobId, res);

      const heartbeat = setInterval(() => {
        try {
          res.write(`:heartbeat\n\n`);
        } catch (err) {
          clearInterval(heartbeat);
        }
      }, 30000);

      req.on("close", async () => {
        clearInterval(heartbeat);
        await SSEManager.removeClient(jobId, res);
        activeConnections--;
        logger.info(
          `Client disconnected. Active connections: ${activeConnections}`,
        );
        res.end();
      });
    } catch (error) {
      logger.error("SSE stream error:", error);
      activeConnections--;
      res.end();
    }
  },
);
