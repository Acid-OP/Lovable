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
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  async pushToQueue(
    data: string | { prompt: string; previousJobId?: string; jobId?: string },
  ) {
    const clientId = this.createId();

    // Support both string and object input for backwards compatibility
    const promptData = typeof data === "string" ? { prompt: data } : data;

    // Always use custom jobId format (never let BullMQ auto-generate integers)
    // For new prompts: generate "job-{randomId}"
    // For iterations: reuse the provided jobId
    const jobId = promptData.jobId || `job-${this.createId()}`;

    const jobOptions: any = {
      jobId, // Always set custom jobId to avoid integer IDs
      // Retry failed jobs
      attempts: 2,
      backoff: {
        type: "exponential",
        delay: 3000,
      },
      removeOnComplete: {
        age: 3600,
        count: 100,
      },
      removeOnFail: {
        age: 86400,
        count: 50,
      },
    };

    // If reusing jobId (iteration), remove old job first
    if (promptData.jobId) {
      try {
        const oldJob = await this.queue.getJob(promptData.jobId);
        if (oldJob) {
          await oldJob.remove();
        }
      } catch (error) {
        // Job doesn't exist or already removed, continue
      }
    }

    const job = await this.queue.add(
      JOB_NAMES.PROCESS_PROMPT,
      {
        clientId,
        prompt: promptData.prompt,
        previousJobId: promptData.previousJobId,
        timestamp: Date.now(),
      },
      jobOptions,
    );
    return { jobId: job.id, clientId };
  }
}
