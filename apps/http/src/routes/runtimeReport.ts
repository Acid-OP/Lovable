import { Router } from "express";
import { redis } from "@repo/redis";
import { logger } from "../utils/logger.js";

export const runtimeReportRouter = Router();

runtimeReportRouter.post("/api/v1/runtime-report/:jobId", async (req, res) => {
  const { jobId } = req.params;

  if (!jobId) {
    return res.status(400).json({ error: "jobId is required" });
  }

  const { errors, url, timestamp } = req.body;

  if (!Array.isArray(errors)) {
    return res.status(400).json({ error: "errors must be an array" });
  }

  logger.info("runtime_report.received", {
    jobId,
    errorCount: errors.length,
    url,
  });

  const runtimeResultKey = `runtime-result:${jobId}`;

  // LPUSH so the orchestrator's BLPOP unblocks
  await redis.lpush(
    runtimeResultKey,
    JSON.stringify({ errors, url, timestamp }),
  );

  // TTL so stale keys get cleaned up even if nobody reads them
  await redis.expire(runtimeResultKey, 120);

  return res.json({ success: true });
});
