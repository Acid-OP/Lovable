import { Worker, Job } from "bullmq";
import { Redis } from "ioredis";
import { QUEUE_NAMES } from "@repo/queue";
import { givePromptToLLM } from "./llm.js";

export function createPromptWorker(connection: Redis) {
  const worker = new Worker( QUEUE_NAMES.PROMPT_QUEUE, async (job: Job) => {
      const result = await givePromptToLLM(job.data.prompt);
      console.log("result \n", result);
      return result;
    },
    { connection }
  );

  worker.on("ready", () => {
    console.log("Worker is ready and listening");
  });

  worker.on("completed", (job: Job) => {
    console.log(`Job ${job.id} completed`);
  });

  worker.on("failed", (job: Job | undefined, err: Error) => {
    console.error(`Job ${job?.id} failed:`, err.message);
  });

  worker.on("error", (err: Error) => {
    console.error("Worker error:", err);
  });

  worker.on("closed", () => {
    console.log("Worker closed");
  });

  return worker;
}

