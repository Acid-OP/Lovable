import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { SessionManager } from "@repo/session";
import { logger } from "../utils/logger";

export const previewRouter = Router();

// job-<base36chars> — matches the format from QueueManager.createId()
const VALID_JOB_ID = /^job-[a-z0-9]{10,30}$/;

// First middleware: Check if we should skip proxying
previewRouter.use("/", async (req, res, next) => {
  const hostname = req.hostname;
  const jobId = hostname.split(".")[0];

  // Skip proxy for localhost, host.docker.internal, and internal API routes
  if (
    hostname === "localhost" ||
    hostname === "host.docker.internal" ||
    jobId === "localhost" ||
    req.path.startsWith("/internal") ||
    req.path.startsWith("/api")
  ) {
    return next("route");
  }

  // Validate jobId format to prevent SSRF
  if (!VALID_JOB_ID.test(jobId)) {
    logger.warn("preview.invalid_job_id", {
      jobId,
      hostname,
      ip: req.ip,
    });
    return res.status(404).send("Not found");
  }

  // Verify the job actually exists in Redis before proxying
  const session = await SessionManager.get(jobId).catch(() => null);
  if (!session?.containerId) {
    logger.warn("preview.no_session", { jobId, ip: req.ip });
    return res.status(404).send("Not found");
  }

  try {
    await SessionManager.update(jobId, {
      lastActivity: Date.now().toString(),
    });
  } catch (error) {
    logger.error("Failed to update activity", {
      jobId,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  // Store jobId in req for proxy to use
  req.jobId = jobId;
  next();
});

// Second middleware: Proxy to sandbox container
previewRouter.use(
  "/",
  createProxyMiddleware({
    target: "http://placeholder", // Will be overridden by router
    changeOrigin: true,
    router: (req: any) => {
      const jobId = req.jobId;
      // Use Docker DNS to resolve container by name
      const target = `http://sandbox-${jobId}:3000`;
      logger.info("Routing request", { hostname: req.hostname, target });
      return target;
    },
  }),
);
