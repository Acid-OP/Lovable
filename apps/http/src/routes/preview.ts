import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { SessionManager } from "@repo/session";

export const previewRouter = Router();

previewRouter.use(
  "/",
  async (req, res, next) => {
    const hostname = req.hostname;
    const jobId = hostname.split(".")[0];
    if (hostname === "localhost" || jobId === "localhost") {
      return next("route");
    }

    try {
      await SessionManager.update(jobId as string, {
        lastActivity: Date.now().toString(),
      });
    } catch (error) {
      console.error(`Failed to update activity for ${jobId}:`, error);
    }

    // Store jobId in req for proxy to use
    req.jobId = jobId;
    next();
  },
  createProxyMiddleware({
    target: "http://placeholder", // Will be overridden by router
    changeOrigin: true,
    router: (req) => {
      const jobId = req.jobId;
      // Use Docker DNS to resolve container by name
      const target = `http://sandbox-${jobId}:3000`;
      console.log(`Routing ${req.hostname} to ${target}`);
      return target;
    },
  }),
);
