import { Worker, Job } from "bullmq";
import { redis } from "@repo/redis";
import { QUEUE_NAMES } from "@repo/queue";
import { SessionManager, SESSION_STATUS } from "@repo/session";
import { SandboxManager } from "@repo/sandbox";
import { logger } from "../utils/logger.js";
import * as cache from "../utils/cache.js";
import { sanitizePrompt } from "../sanitization/promptSanitizer.js";
import { enhancePrompt, generatePlan, getFileErrors, generateFixes } from "../planner/index.js";
import { planValidator } from "../validation/index.js";
import os from "os";

const WORKER_CONCURRENCY = 3;
const MAX_FIX_RETRIES = 3;
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
      // caching
      const cacheKey = cache.buildKey(cache.CACHE_PREFIX.PLAN, validation.sanitizedPrompt);
      const cachedData = await cache.get<{ plan: any; enhancedPrompt: string }>(cacheKey);

      let validatedPlan: any;
      let enhancedPrompt: string;
      let fromCache = false;
      let planWarnings: string[] = [];

      if (cachedData) {
        // Cached
        logger.info("plan.cache.hit", { jobId, cacheKey });
        await SessionManager.update(jobId, {
          status: SESSION_STATUS.PROCESSING,
          currentStep: "Using cached plan",
        });

        validatedPlan = cachedData.plan;
        enhancedPrompt = cachedData.enhancedPrompt;
        fromCache = true;
      } else {
        logger.info("plan.cache.miss", { jobId, cacheKey });

        // Enhance
        await SessionManager.update(jobId, {
          status: SESSION_STATUS.PROCESSING,
          currentStep: "Enhancing prompt",
        });
        enhancedPrompt = await enhancePrompt(validation.sanitizedPrompt);

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

        validatedPlan = planValidation.plan!;
        planWarnings = planValidation.warnings;
      }
      // sandbox
      const sandbox = SandboxManager.getInstance();
      
      logger.info("sandbox.creating", { jobId });
      const containerId = await sandbox.createContainer(jobId);
      logger.info("sandbox.created", { jobId, containerId });
      
      await sandbox.startContainer(containerId);
      logger.info("sandbox.started", { jobId, containerId });
      
      const totalSteps = validatedPlan.steps.length;
      
      for (const step of validatedPlan.steps) {
        logger.info("step.executing", {
          jobId,
          stepId: step.id,
          stepType: step.type,
          description: step.description,
          progress: `${step.id}/${totalSteps}`,
        });

        await SessionManager.update(jobId, {
          currentStep: `Step ${step.id}/${totalSteps}: ${step.description}`,
        });

        if (step.type === "command" && step.command) {
          const result = await sandbox.exec(containerId, step.command, step.workingDirectory);
          logger.info("step.command.completed", {
            jobId,
            stepId: step.id,
            exitCode: result.exitCode,
          });
        }

        if (step.type === "file_write" && step.path && step.content) {
          await sandbox.writeFile(containerId, step.path, step.content);
          logger.info("step.file_write.completed", {
            jobId,
            stepId: step.id,
            path: step.path,
          });
        }

        if (step.type === "file_delete" && step.path) {
          await sandbox.deleteFile(containerId, step.path);
          logger.info("step.file_delete.completed", {
            jobId,
            stepId: step.id,
            path: step.path,
          });
        }
      }
      // Build and fix errors loop
      let buildSuccess = false;
      let fixAttempts = 0;

      while (!buildSuccess && fixAttempts < MAX_FIX_RETRIES) {
        await SessionManager.update(jobId, {
          currentStep: fixAttempts === 0 ? "Building project..." : `Fixing errors (attempt ${fixAttempts})...`,
        });

        const buildResult = await sandbox.runBuild(containerId);

        if (buildResult.success) {
          buildSuccess = true;
          logger.info("sandbox.build_success", { jobId, containerId, attempts: fixAttempts });
        } else {
          fixAttempts++;
          logger.warn("sandbox.build_failed", { jobId, containerId, attempt: fixAttempts });

          if (fixAttempts < MAX_FIX_RETRIES) {
            const fileErrors = await getFileErrors(containerId, buildResult.errors);
            
            logger.info("sandbox.fixing_errors", {
              jobId,
              attempt: fixAttempts,
              errorCount: fileErrors.length,
              files: fileErrors.map(f => f.path),
            });

            const fixes = await generateFixes(fileErrors);
            
            logger.info("sandbox.applying_fixes", {
              jobId,
              fixCount: fixes.length,
              files: fixes.map(f => f.path),
            });

            // Apply fixes
            for (const fix of fixes) {
              await sandbox.writeFile(containerId, fix.path, fix.content);
              logger.info("sandbox.fix_applied", { jobId, path: fix.path });
            }
          }
        }
      }

      if (!buildSuccess) {
        logger.error("sandbox.build_failed_after_retries", { jobId, containerId, attempts: fixAttempts });
      }

      // Start dev server for preview
      logger.info("sandbox.starting_dev_server", { jobId, containerId });
      await sandbox.startDevServer(containerId);
      logger.info("sandbox.dev_server_started", { jobId, containerId, previewUrl: "http://localhost:3003" });

      // NOTE: Not destroying container so preview stays alive
      // TODO: Add cleanup mechanism (timeout, manual trigger, etc.)
      // logger.info("sandbox.destroying", { jobId, containerId });
      // await sandbox.destroy(containerId);
      // logger.info("sandbox.destroyed", { jobId, containerId });

      // Cache the plan if it wasn't from cache
      if (!fromCache) {
        await cache.set(
          cacheKey,
          { plan: validatedPlan, enhancedPrompt },
          cache.CACHE_TTL.PLAN
        );
        logger.info("plan.cache.stored", { jobId, cacheKey });
      }

      return {
        plan: validatedPlan,
        enhancedPrompt,
        warnings: [...validation.warnings, ...planWarnings],
        riskLevel: validation.riskLevel,
        cached: fromCache,
        previewUrl: "http://localhost:3003",
        containerId,
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

