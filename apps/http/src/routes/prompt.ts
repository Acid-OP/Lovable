import { Router } from "express";
import { QueueManager } from "@repo/queue";
import { SessionManager } from "@repo/session";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { prompt, previousJobId } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // For iterations, reuse the previous jobId to keep container name consistent
    const isIteration = !!previousJobId;
    const jobId = isIteration ? previousJobId : undefined;

    // Push to queue with metadata
    const result = await QueueManager.getInstance().pushToQueue({
      prompt,
      previousJobId, // Optional: for iterative prompting
      jobId, // Reuse jobId for iterations
    });

    // For iterations, update existing session; for new prompts, create new session
    if (isIteration) {
      // Get current session to preserve history
      const currentSession = await SessionManager.get(result.jobId as string);
      const iterationCount = (currentSession?.iterationCount || 0) + 1;

      await SessionManager.update(result.jobId as string, {
        prompt,
        status: "queued",
        currentStep: "Queued for processing",
        lastActivity: Date.now().toString(),
        iterationCount,
      });
    } else {
      await SessionManager.create(result.jobId as string);
      await SessionManager.update(result.jobId as string, {
        prompt,
        iterationCount: 1,
      });
    }

    return res.status(200).json({
      message: "Prompt enqueued",
      ...result,
      isIteration,
    });
  } catch (e) {
    console.error("Error enqueueing prompt:", e);
    return res
      .status(500)
      .json({
        error: "Failed to enqueue prompt",
        details: e instanceof Error ? e.message : String(e),
      });
  }
});

export default router;
