import { Worker, Job } from "bullmq";
import { redis } from "@repo/redis";
import { QUEUE_NAMES } from "@repo/queue";
import { SessionManager, SESSION_STATUS } from "@repo/session";
import { SandboxManager } from "@repo/sandbox";
import { logger } from "../utils/logger.js";
import * as cache from "../utils/cache.js";
import { sanitizePrompt } from "../sanitization/promptSanitizer.js";
import { enhancePrompt, generatePlan, generateIncrementalPlan } from "../planner/index.js";
import { planValidator, frontendValidator } from "../validation/index.js";
import { classifyBuildErrors } from "../planner/errorClassifier.js";
import { routeAndHandleErrors, applyFixes } from "../planner/errorRouter.js";
import { parseErrorFiles } from "../planner/buildErrorParser.js";
import { performHealthCheck } from "../planner/healthCheck.js";
import { extractRoutesFromPlan } from "../planner/routeExtractor.js";
import { config } from "../config.js";
import { classifyPrompt } from "../classification/promptClassifier.js";
import { getContextFromJob } from "../classification/conversationContext.js";
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
      const previousJobId = job.data?.previousJobId;
      const jobId = job.id as string;

      // Classify prompt if there's a previous job
      let promptType: "new" | "continuation" = "new";

      if (previousJobId) {
        const context = await getContextFromJob(previousJobId);

        if (context.hasPreviousJob) {
          const classification = await classifyPrompt(
            promptText,
            context.previousPrompt,
            context.previousProjectSummary
          );

          promptType = classification.type;

          logger.info("prompt.classified", {
            jobId,
            type: classification.type,
            reasoning: classification.reasoning,
            confidence: classification.confidence,
            previousJobId,
          });
        }
      }

      // Store prompt and classification
      await SessionManager.update(jobId, {
        prompt: promptText,
        previousJobId,
        promptType,
      });

      // Sanitize
      await SessionManager.update(jobId, {
        status: SESSION_STATUS.PROCESSING,
        currentStep: "Sanitizing prompt",
      });
      const validation = await sanitizePrompt(promptText);
      if (!validation.isValid) {
        throw new Error(validation.rejectionReason || "Prompt failed validation");
      }

      // Container setup - moved before plan generation for continuation prompts
      const sandbox = SandboxManager.getInstance();
      let containerId: string | undefined;
      const previewUrl = `${config.api.baseUrl}/preview/${jobId}`;

      // For continuation prompts, get container first (needed for incremental plan)
      if (promptType === "continuation") {
        logger.info("sandbox.continuation", { jobId, previousJobId });

        const previousSession = await SessionManager.get(previousJobId!);

        if (!previousSession?.containerId) {
          throw new Error(`Cannot continue: previous job ${previousJobId} has no container`);
        }

        containerId = previousSession.containerId;

        // Verify container is still alive
        try {
          await sandbox.exec(containerId, "echo 'container alive'");
          logger.info("sandbox.reusing", { jobId, containerId, previousJobId });
        } catch (error) {
          throw new Error(`Cannot continue: container ${containerId} no longer exists. Please start a new project.`);
        }

        // Update lastActivity to keep container alive
        await SessionManager.update(previousJobId!, {
          lastActivity: Date.now().toString(),
        });
      }

      // Plan generation - branching based on prompt type
      let validatedPlan: any;
      let enhancedPrompt: string;
      let fromCache = false;
      let planWarnings: string[] = [];

      // Skip cache for continuation prompts (each has unique context)
      const cacheKey = promptType === "new"
        ? cache.buildKey(cache.CACHE_PREFIX.PLAN, validation.sanitizedPrompt)
        : null;
      const cachedData = cacheKey ? await cache.get<{ plan: any; enhancedPrompt: string }>(cacheKey) : null;

      if (cachedData) {
        // Cached (only for new prompts)
        logger.info("plan.cache.hit", { jobId, cacheKey });
        await SessionManager.update(jobId, {
          status: SESSION_STATUS.PROCESSING,
          currentStep: "Using cached plan",
        });

        validatedPlan = cachedData.plan;
        enhancedPrompt = cachedData.enhancedPrompt;
        fromCache = true;
      } else {
        logger.info("plan.cache.miss", { jobId, cacheKey: cacheKey || "N/A (continuation)" });

        let plan: any;

        if (promptType === "new") {
          // NEW PROJECT: Full plan generation
          await SessionManager.update(jobId, {
            status: SESSION_STATUS.PROCESSING,
            currentStep: "Enhancing prompt",
          });
          enhancedPrompt = await enhancePrompt(validation.sanitizedPrompt);

          await SessionManager.update(jobId, {
            status: SESSION_STATUS.PROCESSING,
            currentStep: "Generating plan",
          });
          plan = await generatePlan(enhancedPrompt);

        } else {
          // CONTINUATION: Incremental plan generation
          await SessionManager.update(jobId, {
            status: SESSION_STATUS.PROCESSING,
            currentStep: "Analyzing existing code",
          });

          const context = await getContextFromJob(previousJobId!);

          await SessionManager.update(jobId, {
            status: SESSION_STATUS.PROCESSING,
            currentStep: "Generating incremental plan",
          });

          plan = await generateIncrementalPlan(
            promptText,
            context.previousPrompt || "",
            containerId!,
            context.previousProjectSummary
          );

          enhancedPrompt = promptText; // No enhancement for continuation
        }

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

        // Validate UI quality
        const uiValidation = frontendValidator.validate(plan);
        logger.info("plan.ui_validated", {
          jobId,
          warnings: uiValidation.warnings,
          suggestions: uiValidation.suggestions,
        });

        validatedPlan = planValidation.plan!;
        planWarnings = [...planValidation.warnings, ...uiValidation.warnings, ...uiValidation.suggestions];
      }

      // Container creation for new prompts only (continuation already has container)
      if (promptType === "new") {
        logger.info("sandbox.new_project", { jobId });

        await sandbox.cleanupOldContainers();

        logger.info("sandbox.creating", { jobId });
        containerId = await sandbox.createContainer(jobId);
        logger.info("sandbox.created", { jobId, containerId });

        await sandbox.startContainer(containerId);
        logger.info("sandbox.started", { jobId, containerId });
      }

      // Ensure containerId is assigned
      if (!containerId) {
        throw new Error("Container ID not assigned - this should never happen");
      }

      // Store container metadata in session
      await SessionManager.update(jobId, {
        containerId,
        lastActivity: Date.now().toString(),
        previewUrl,
      });

      // Extract routes from plan for health check
      const appFiles = validatedPlan.steps
        .filter((s: any) => s.type === "file_write" && s.path?.endsWith(".tsx"))
        .map((s: any) => s.path as string);
      const routes = extractRoutesFromPlan(appFiles);

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
      let lastBuildErrors = "";

      while (!buildSuccess && fixAttempts < MAX_FIX_RETRIES) {
        await SessionManager.update(jobId, {
          currentStep: fixAttempts === 0 ? "Building project..." : `Fixing errors (attempt ${fixAttempts})...`,
        });

        const buildResult = await sandbox.runBuild(containerId);

        if (buildResult.success) {
          buildSuccess = true;
          logger.info("sandbox.build_success", { jobId, containerId, attempts: fixAttempts });

          // Post-build UI validation on actual generated files
          if (fixAttempts > 0) {
            // Only validate after fixes to check if quality was maintained
            await SessionManager.update(jobId, {
              currentStep: "Validating UI quality of fixed code...",
            });

            try {
              // Read generated files from sandbox (using already extracted appFiles)
              const generatedPlan = {
                summary: validatedPlan.summary,
                estimatedTimeSeconds: validatedPlan.estimatedTimeSeconds,
                steps: await Promise.all(
                  appFiles.map(async (path: string, index: number) => {
                    const content = await sandbox.readFile(containerId, path);
                    return {
                      id: index + 1,
                      type: "file_write" as const,
                      description: `File ${path}`,
                      path,
                      content,
                    };
                  })
                ),
              };

              const postBuildValidation = frontendValidator.validate(generatedPlan);

              if (postBuildValidation.warnings.length > 0 || postBuildValidation.suggestions.length > 0) {
                logger.warn("sandbox.post_build_ui_issues", {
                  jobId,
                  warnings: postBuildValidation.warnings,
                  suggestions: postBuildValidation.suggestions,
                });
              } else {
                logger.info("sandbox.post_build_ui_quality_maintained", { jobId });
              }
            } catch (validationError) {
              logger.error("sandbox.post_build_validation_failed", {
                jobId,
                error: validationError instanceof Error ? validationError.message : String(validationError),
              });
            }
          }
        } else {
          lastBuildErrors = buildResult.errors;
          fixAttempts++;
          logger.warn("sandbox.build_failed", { jobId, containerId, attempt: fixAttempts });

          if (fixAttempts < MAX_FIX_RETRIES) {
            // Parse errors from build output
            const errorMap = parseErrorFiles(buildResult.errors);

            //Classify errors by type
            const classifiedErrors = classifyBuildErrors(errorMap);

            logger.info("sandbox.errors_classified", {
              jobId,
              attempt: fixAttempts,
              totalErrors: classifiedErrors.length,
              byType: classifiedErrors.reduce((acc, err) => {
                acc[err.type] = (acc[err.type] || 0) + 1;
                return acc;
              }, {} as Record<string, number>),
            });

            //Route errors to appropriate handlers
            const handlingResult = await routeAndHandleErrors(
              containerId,
              classifiedErrors,
              jobId
            );

            logger.info("sandbox.errors_handled", {
              jobId,
              success: handlingResult.success,
              autoFixed: handlingResult.autoFixedErrors.length,
              llmFixed: handlingResult.llmFixedErrors.length,
              failed: handlingResult.failedErrors.length,
              message: handlingResult.message,
            });

            // Apply LLM-generated fixes if any
            if (handlingResult.fixes && handlingResult.fixes.length > 0) {
              await applyFixes(containerId, handlingResult.fixes, jobId);
            }

            // If we auto-fixed dependencies, the build will likely succeed on retry
            if (handlingResult.autoFixedErrors.length > 0) {
              logger.info("sandbox.auto_fixes_applied", {
                jobId,
                count: handlingResult.autoFixedErrors.length,
                retryingBuild: true,
              });
            }

            // If config errors, abort immediately
            if (!handlingResult.success && handlingResult.failedErrors.some(e => e.type === 'config')) {
              logger.error("sandbox.config_error_abort", {
                jobId,
                message: handlingResult.message,
              });
              throw new Error(handlingResult.message);
            }
          }
        }
      }

      if (!buildSuccess) {
        logger.error("sandbox.build_failed_after_retries", { 
          jobId, 
          containerId, 
          attempts: fixAttempts,
          errors: lastBuildErrors.slice(0, 500), 
        });
      }

      // Start dev server for preview
      logger.info("sandbox.starting_dev_server", { jobId, containerId });
      await sandbox.startDevServer(containerId);
      logger.info("sandbox.dev_server_started", { jobId, containerId, previewUrl: `http://localhost:${config.container.port}` });

      // Health check: Verify dev server is responding and app renders without errors
      await SessionManager.update(jobId, {
        currentStep: "Verifying app health...",
      });

      const { runtimeErrorDetected, runtimeErrorMessage } = await performHealthCheck(jobId, routes);

      // If runtime errors detected, attempt one fix (extending the build fix loop by 1)
      if (runtimeErrorDetected) {
        logger.info("sandbox.runtime_error_fix_attempt", {
          jobId,
          runtimeError: runtimeErrorMessage,
          message: "Runtime errors detected, attempting fix",
        });

        await SessionManager.update(jobId, {
          currentStep: "Fixing runtime errors...",
        });

        // Create synthetic error for the LLM to fix
        const runtimeErrorMap = new Map<string, string>();
        runtimeErrorMap.set(
          "Runtime Error",
          `Application runtime error detected:\n${runtimeErrorMessage}\n\nCommon causes:\n- Missing 'use client' directive in components using hooks/events\n- Missing imports (especially for framer-motion, lucide-react)\n- Incorrect component structure (server/client mismatch)\n- Type errors not caught at build time`
        );

        // Use existing error classification and handling pipeline
        const runtimeClassifiedErrors = classifyBuildErrors(runtimeErrorMap);
        const runtimeHandlingResult = await routeAndHandleErrors(
          containerId,
          runtimeClassifiedErrors,
          jobId
        );

        logger.info("sandbox.runtime_errors_handled", {
          jobId,
          success: runtimeHandlingResult.success,
          llmFixed: runtimeHandlingResult.llmFixedErrors.length,
          message: runtimeHandlingResult.message,
        });

        // Apply LLM-generated fixes if any
        if (runtimeHandlingResult.fixes && runtimeHandlingResult.fixes.length > 0) {
          await applyFixes(containerId, runtimeHandlingResult.fixes, jobId);

          // Rebuild after runtime fixes
          await SessionManager.update(jobId, {
            currentStep: "Rebuilding after runtime fixes...",
          });

          const rebuildResult = await sandbox.runBuild(containerId);

          if (!rebuildResult.success) {
            logger.error("sandbox.rebuild_failed_after_runtime_fix", {
              jobId,
              errors: rebuildResult.errors.slice(0, 500),
            });
            throw new Error(`Rebuild failed after runtime fix: ${rebuildResult.errors.slice(0, 200)}`);
          }

          logger.info("sandbox.rebuild_success_after_runtime_fix", { jobId });

          // Restart dev server (rebuild stops the old one)
          await sandbox.startDevServer(containerId);
          await new Promise(resolve => setTimeout(resolve, 5000));

          // Re-run health check to verify fix worked
          try {
            const healthCheckUrl = `http://localhost:${config.container.port}`;
            const recheckResponse = await fetch(healthCheckUrl, {
              signal: AbortSignal.timeout(10000),
            });

            const recheckHtml = await recheckResponse.text();

            const stillHasErrors =
              recheckResponse.status !== 200 ||
              /Application error/i.test(recheckHtml) ||
              /Hydration failed/i.test(recheckHtml) ||
              /Unhandled Runtime Error/i.test(recheckHtml);

            if (stillHasErrors) {
              logger.error("sandbox.runtime_errors_persist_after_fix", {
                jobId,
                status: recheckResponse.status,
                message: "Runtime errors still present after fix attempt",
              });
              throw new Error(`Runtime errors persist after fix: ${runtimeErrorMessage}`);
            } else {
              logger.info("sandbox.runtime_fix_successful", {
                jobId,
                message: "Runtime errors resolved successfully",
              });
            }
          } catch (recheckError) {
            logger.error("sandbox.health_recheck_failed", {
              jobId,
              error: recheckError instanceof Error ? recheckError.message : String(recheckError),
            });
            throw new Error(`Health check failed after runtime fix: ${recheckError instanceof Error ? recheckError.message : String(recheckError)}`);
          }
        } else {
          logger.error("sandbox.no_runtime_fixes_generated", {
            jobId,
            message: "LLM did not generate fixes for runtime errors",
          });
          throw new Error(`Runtime errors detected but could not generate fixes: ${runtimeErrorMessage}`);
        }
      }

      if (!fromCache && cacheKey) {
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
        previewUrl: `${config.api.baseUrl}/preview/${jobId}`,
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

