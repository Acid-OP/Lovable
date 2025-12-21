import { Worker, Job } from "bullmq";
import { Redis } from "ioredis";
import { QUEUE_NAMES } from "@repo/queue";
import { givePromptToLLM } from "../llm.js";
import { logger } from "../utils/logger.js";
import { sanitizePrompt } from "../sanitization/promptSanitizer.js";
import os from "os";

const WORKER_CONCURRENCY = 3;
let workerHealthy = false;

export function isWorkerHealthy() {
  return workerHealthy;
}

export function createPromptWorker(connection: Redis) {
  const worker = new Worker(
    QUEUE_NAMES.PROMPT_QUEUE,
    async (job: Job) => {
      const promptText = job.data?.prompt;
      const validation = await sanitizePrompt(promptText);

      if (!validation.isValid) {
        throw new Error(validation.rejectionReason || "Prompt failed validation");
      }

      const result = await givePromptToLLM(validation.sanitizedPrompt);
      return {
        ...result,
        sanitizedPrompt: validation.sanitizedPrompt,
        warnings: validation.warnings,
        riskLevel: validation.riskLevel,
      };
    },
    {
      connection,
      concurrency: WORKER_CONCURRENCY,
    }
  );

  worker.on("ready", async () => {
    logger.info("worker.ready", {
      queue: QUEUE_NAMES.PROMPT_QUEUE,
      workerId: process.pid,
      hostname: os.hostname(),
      concurrency: WORKER_CONCURRENCY,
    });
    workerHealthy = true;
  });

  worker.on("completed", (job: Job) => {
    const durationMs =
      job.finishedOn && job.processedOn ? job.finishedOn - job.processedOn : undefined;
    logger.info("job.completed", {
      queue: QUEUE_NAMES.PROMPT_QUEUE,
      jobId: job.id,
      attempt: job.attemptsMade,
      durationMs,
      returnValuePresent: job.returnvalue !== undefined,
    });
    // place to trigger webhook / notifier with job.returnvalue
  });

  worker.on("failed", (job: Job | undefined, err: Error) => {
    logger.error("job.failed", {
      queue: QUEUE_NAMES.PROMPT_QUEUE,
      jobId: job?.id,
      attempt: job?.attemptsMade,
      reason: err.message,
      stack: err.stack,
    });
    workerHealthy = false;
  });

  worker.on("error", (err: Error) => {
    logger.error("worker.error", {
      queue: QUEUE_NAMES.PROMPT_QUEUE,
      workerId: process.pid,
      hostname: os.hostname(),
      reason: err.message,
      stack: err.stack,
    });
    workerHealthy = false;
  });

  worker.on("closed", () => {
    logger.warn("worker.closed", {
      queue: QUEUE_NAMES.PROMPT_QUEUE,
      workerId: process.pid,
      hostname: os.hostname(),
    });
    workerHealthy = false;
  });

  return worker;
}

