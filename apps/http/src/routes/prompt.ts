import { Router } from "express";
import { QueueManager } from "@repo/queue";
import { SessionManager } from "@repo/session";
import { promptSchema } from "../validations/prompt";

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

    // For iterations, reuse jobId to keep same container
    const isIteration = !!previousJobId;
    const jobId = isIteration ? previousJobId : undefined;

    const result = await QueueManager.getInstance().pushToQueue({
      prompt,
      previousJobId,
      jobId,
    });

    // Update existing session for iterations, create new for first prompts
    if (isIteration) {
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
    return res.status(500).json({
      error: "Failed to enqueue prompt",
      details: e instanceof Error ? e.message : String(e),
    });
  }
});

export default router;
