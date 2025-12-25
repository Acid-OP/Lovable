import { Worker, Job } from "bullmq";
import { redis } from "@repo/redis";
import { QUEUE_NAMES } from "@repo/queue";
import { SessionManager, SESSION_STATUS } from "@repo/session";
import { logger } from "../utils/logger.js";
import { sanitizePrompt } from "../sanitization/promptSanitizer.js";
import { enhancePrompt, generatePlan } from "../planner/index.js";
import { planValidator } from "../validation/index.js";
import os from "os";

const WORKER_CONCURRENCY = 3;
let workerHealthy = false;

export function isWorkerHealthy() {
  return workerHealthy;
}

export function createPromptWorker() {
  const worker = new Worker(
    QUEUE_NAMES.PROMPT_QUEUE,
    async (job: Job) => {
      const promptText = job.data?.prompt;
      const jobId = job.id as string;
      
      // Sanitize
      await SessionManager.update(jobId, {
        status: SESSION_STATUS.PROCESSING,
        currentStep: "Sanitizing prompt",
      });
      const validation = await sanitizePrompt(promptText);
      if (!validation.isValid) {
        throw new Error(validation.rejectionReason || "Prompt failed validation");
      }

      // Enhance
      await SessionManager.update(jobId, {
        status: SESSION_STATUS.PROCESSING,
        currentStep: "Enhancing prompt",
      });
      const enhancedPrompt = await enhancePrompt(validation.sanitizedPrompt);
      
      // Generate plan
      await SessionManager.update(jobId, {
        status: SESSION_STATUS.PROCESSING,
        currentStep: "Generating plan",
      });
      const plan = await generatePlan(enhancedPrompt);
      
      // Validate plan
      await SessionManager.update(jobId, {
        status: SESSION_STATUS.PROCESSING,
        currentStep: "Validating plan",
      });
      const planValidation = planValidator.validate(plan);
      
      logger.info("plan.validated", {
        jobId,
        valid: planValidation.valid,
        errors: planValidation.errors,
        warnings: planValidation.warnings,
        stepsCount: plan.steps.length,
        plan: plan,
      });
      
      if (!planValidation.valid) {
        throw new Error(
          `Plan validation failed: ${planValidation.errors.join(", ")}`
        );
      }
      
      return {
        plan: planValidation.plan,
        enhancedPrompt,
        warnings: [...validation.warnings, ...planValidation.warnings],
        riskLevel: validation.riskLevel,
      };
    },
    {
      connection: redis,
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

  worker.on("completed", async (job: Job) => {
    const jobId = job.id as string;
    const durationMs =
      job.finishedOn && job.processedOn ? job.finishedOn - job.processedOn : undefined;
    
    await SessionManager.update(jobId, {
      status: SESSION_STATUS.COMPLETED,
      currentStep: "Done",
      result: JSON.stringify(job.returnvalue),
    });
    
    logger.info("job.completed", {
      queue: QUEUE_NAMES.PROMPT_QUEUE,
      jobId: job.id,
      attempt: job.attemptsMade,
      durationMs,
      returnValuePresent: job.returnvalue !== undefined,
    });
  });

  worker.on("failed", async (job: Job | undefined, err: Error) => {
    if (job?.id) {
      await SessionManager.update(job.id, {
        status: SESSION_STATUS.FAILED,
        currentStep: `Error: ${err.message}`,
        errors: [err.message],
      });
    }
    
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

