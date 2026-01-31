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

    // Push to queue with metadata
    const result = await QueueManager.getInstance().pushToQueue({
      prompt,
      previousJobId, // Optional: for iterative prompting
    });

    // Create session with conversation tracking
    await SessionManager.create(result.jobId as string);
    if (previousJobId) {
      await SessionManager.update(result.jobId as string, {
        previousJobId,
      });
    }

    return res.status(200).json({ message: "Prompt enqueued", ...result });
  } catch (e) {
    return res.status(500).json({ error: "Failed to enqueue prompt" });
  }
});

export default router;
