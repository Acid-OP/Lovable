import { Router } from "express";
import { SessionManager } from "@repo/session";
import { logger } from "../utils/logger";

const router = Router();

/**
 * GET /api/v1/session/:jobId
 * Returns the current session status for a job
 */
router.get("/:jobId", async (req, res) => {
  const { jobId } = req.params;

  if (!jobId || typeof jobId !== "string") {
    return res.status(400).json({ error: "Invalid jobId" });
  }

  try {
    const session = await SessionManager.get(jobId);

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Only expose safe fields to the client
    return res.json({
      jobId: session.jobId,
      status: session.status,
      currentStep: session.currentStep,
      prompt: session.prompt,
      previousJobId: session.previousJobId,
      previewUrl: session.previewUrl,
      createdAt: session.createdAt,
    });
  } catch (error) {
    logger.error("session.fetch_error", {
      jobId,
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(500).json({ error: "Failed to fetch session" });
  }
});

export default router;
