import { Router } from "express";
import axios from "axios";
import { logger } from "../utils/logger.js";

export const healthCheckRouter = Router();

healthCheckRouter.post("/health-check", async (req, res) => {
  const { jobId, routes } = req.body;

  if (!jobId) {
    return res.status(400).json({ error: "jobId is required" });
  }

  try {
    // Default to checking root route if no routes provided
    const routesToCheck = routes && routes.length > 0 ? routes : ["/"];

    // Check root route first
    logger.info("healthcheck.start", { jobId, route: "/" });

    const containerUrl = `http://sandbox-${jobId}:3000/`;

    const response = await axios.get(containerUrl, {
      timeout: 10000,
      validateStatus: () => true, // Don't throw on non-2xx status
    });

    const html = response.data;

    // Check for common error patterns in HTML
    const hasApplicationError =
      /Application error/i.test(html) || /Internal Server Error/i.test(html);
    const hasHydrationError =
      /Hydration failed/i.test(html) || /Hydration error/i.test(html);
    const hasUnhandledError = /Unhandled Runtime Error/i.test(html);

    const hasErrors =
      response.status !== 200 ||
      hasApplicationError ||
      hasHydrationError ||
      hasUnhandledError;

    if (hasErrors) {
      // Extract error message from HTML for more context
      const errorMatch =
        html.match(/Error: ([^\n<]+)/i) ||
        html.match(/Unhandled Runtime Error[^\n]*\n([^\n<]+)/i);
      const errorMessage =
        errorMatch?.[1] || "Runtime error detected in browser";

      logger.error("healthcheck.failed", {
        jobId,
        route: "/",
        status: response.status,
        error: errorMessage,
      });

      return res.json({
        success: false,
        runtimeErrorDetected: true,
        runtimeErrorMessage: `Root route (/) failed: ${errorMessage}`,
      });
    }

    logger.info("healthcheck.passed", { jobId, route: "/" });

    return res.json({
      success: true,
      runtimeErrorDetected: false,
      runtimeErrorMessage: "",
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    logger.error("healthcheck.error", {
      jobId,
      error: errorMessage,
    });

    return res.json({
      success: false,
      runtimeErrorDetected: true,
      runtimeErrorMessage: `Health check failed: ${errorMessage}`,
    });
  }
});
