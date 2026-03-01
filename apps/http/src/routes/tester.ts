import { Router } from "express";
import { promptSchema } from "../validations/prompt";
import { logger } from "../utils/logger";
import { randomUUID } from "crypto";

const router = Router();

router.post("/", async (req, res) => {
  try {
    // Validate request body
    const validation = promptSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: "Invalid input",
        details: validation.error.message,
      });
    }

    const { prompt, previousJobId } = validation.data;

    // For testing: just generate a mock jobId and clientId
    const isIteration = !!previousJobId;
    const jobId = isIteration ? previousJobId : randomUUID();
    const clientId = randomUUID();

    logger.info("Tester endpoint received prompt", {
      prompt: prompt.substring(0, 50) + "...",
      jobId,
      isIteration,
    });

    // Return mock response without doing any actual work
    return res.status(200).json({
      message: "Prompt received (test mode - no processing)",
      jobId,
      clientId,
      isIteration,
    });
  } catch (e) {
    logger.error("Error in tester endpoint", {
      error: e instanceof Error ? e.message : String(e),
      stack: e instanceof Error ? e.stack : undefined,
    });
    return res.status(500).json({
      error: "Failed to process test request",
    });
  }
});

export default router;
