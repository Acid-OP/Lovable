import { Queue } from "bullmq";
import { redis } from "@repo/redis";
import { QUEUE_NAMES, JOB_NAMES, JOB_OPTIONS } from "./constants.js";

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
    const promptData = typeof data === "string" ? { prompt: data } : data;

    // Use custom "job-{id}" format (BullMQ doesn't allow integer custom IDs)
    // For iterations: reuse jobId to keep same container
    const jobId = promptData.jobId || `job-${this.createId()}`;

    const jobOptions = {
      ...JOB_OPTIONS,
      jobId,
    };

    // Remove old completed job before reusing its ID
    if (promptData.jobId) {
      try {
        const oldJob = await this.queue.getJob(promptData.jobId);
        if (oldJob) {
          await oldJob.remove();
        }
      } catch (error) {
        // Job already removed or doesn't exist
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
