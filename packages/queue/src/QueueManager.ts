import { Queue } from "bullmq";
import { redis } from "@repo/redis";
import { QUEUE_NAMES, JOB_NAMES } from "./constants.js";

export class QueueManager {
  private queue: Queue;
  private static instance: QueueManager;

  private constructor() {
    this.queue = new Queue(QUEUE_NAMES.PROMPT_QUEUE, {
      connection: redis,
    });
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new QueueManager();
    }
    return this.instance;
  }

  createId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  async pushToQueue(prompt: string) {
    const clientId = this.createId();
    const job = await this.queue.add(JOB_NAMES.PROCESS_PROMPT, {
      clientId,
      prompt,
      timestamp: Date.now(),
    });
    return { jobId: job.id, clientId };
  }
}
