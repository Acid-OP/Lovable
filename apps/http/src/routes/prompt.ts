import { Router } from "express";
import { QueueManager } from "@repo/queue";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }
    const result = await QueueManager.getInstance().pushToQueue(prompt);
    return res.status(200).json({ message: "Prompt enqueued", ...result });
  } catch (e) {
    return res.status(500).json({ error: "Failed to enqueue prompt" });
  }
});

export default router;

