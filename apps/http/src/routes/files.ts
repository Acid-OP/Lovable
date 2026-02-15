import { Router } from "express";
import { redis } from "@repo/redis";
import { logger } from "../utils/logger";

const router = Router();

/**
 * GET /api/v1/files/:jobId
 * Retrieves generated code files for a job
 */
router.get("/:jobId", async (req, res) => {
  const { jobId } = req.params;

  // Validate jobId
  if (!jobId || typeof jobId !== "string") {
    return res.status(400).json({
      error: "Invalid jobId",
      details: "jobId parameter is required and must be a string",
    });
  }

  logger.info("files.request", { jobId, ip: req.ip });

  try {
    // Get files from Redis
    const data = await redis.get(`files:${jobId}`);

    if (!data) {
      logger.warn("files.not_found", { jobId });
      return res.status(404).json({
        error: "Files not found",
        details:
          "No files found for this jobId. They may have expired or never been generated.",
      });
    }

    // Parse and validate JSON
    let filesData;
    try {
      filesData = JSON.parse(data);
    } catch (parseError) {
      logger.error("files.parse_error", {
        jobId,
        error:
          parseError instanceof Error ? parseError.message : String(parseError),
      });
      return res.status(500).json({
        error: "Internal server error",
        details: "Failed to parse files data",
      });
    }

    // Set cache headers (files are immutable once stored)
    res.set({
      "Cache-Control": "public, max-age=3600, immutable",
      "Content-Type": "application/json",
    });

    logger.info("files.served", {
      jobId,
      filesCount: filesData.files?.length || 0,
      totalSizeBytes: filesData.metadata?.totalSize || 0,
      hasMetadata: !!filesData.metadata,
    });

    return res.json(filesData);
  } catch (error) {
    logger.error("files.error", {
      jobId,
      error: error instanceof Error ? error.message : String(error),
    });

    return res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
