import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { SessionManager } from "@repo/session";
import { logger } from "../utils/logger";

export const previewRouter = Router();

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

  try {
    await SessionManager.update(jobId as string, {
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
