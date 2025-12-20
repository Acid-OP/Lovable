import { Worker, Job } from "bullmq";
import { Redis } from "ioredis";
import { QUEUE_NAMES } from "@repo/queue";
import { givePromptToLLM } from "./llm.js";
import { logger } from "./utils/logger.js";
import os from "os";

const WORKER_CONCURRENCY = 3;
let workerHealthy = false;

export function isWorkerHealthy() {
  return workerHealthy;
}

export function createPromptWorker(connection: Redis) {
  const worker = new Worker( QUEUE_NAMES.PROMPT_QUEUE, async (job: Job) => {
      const result = await givePromptToLLM(job.data.prompt);
      return result;
    },
    {
      connection,
      concurrency: WORKER_CONCURRENCY,
    }
  );

  worker.on("ready", async () => {
    logger.info('worker.ready', {
      queue: QUEUE_NAMES.PROMPT_QUEUE,
      workerId: process.pid,
      hostname: os.hostname(),
      concurrency: WORKER_CONCURRENCY
    });
    workerHealthy = true;
  });

  worker.on("completed", (job: Job) => {
    console.log(`Job ${job.id} completed`);
  });

  worker.on("failed", (job: Job | undefined, err: Error) => {
    console.error(`Job ${job?.id} failed:`, err.message);
    workerHealthy = false;
  });

  worker.on("error", (err: Error) => {
    console.error("Worker error:", err);
    workerHealthy = false;
  });

  worker.on("closed", () => {
    console.log("Worker closed");
    workerHealthy = false;
  });

  return worker;
}

