import { Worker, Job } from "bullmq";
import { redis } from "@repo/redis";
import { QUEUE_NAMES } from "@repo/queue";
import { SessionManager, SESSION_STATUS } from "@repo/session";
import { SandboxManager } from "@repo/sandbox";
import { logger } from "../utils/logger.js";
import * as cache from "@repo/cache";
import { sanitizePrompt } from "../sanitization/promptSanitizer.js";
import {
  enhancePrompt,
  generatePlan,
  generateIncrementalPlan,
} from "../planner/index.js";
import { planValidator, frontendValidator } from "../validation/index.js";
import type { Plan, PlanStep } from "../planner/types.js";
import { PROMPT_TYPE, type PromptType } from "../types/prompt.js";
import { classifyBuildErrors } from "../planner/errorClassifier.js";
import { routeAndHandleErrors, applyFixes } from "../planner/errorRouter.js";
import { parseErrorFiles } from "../planner/buildErrorParser.js";
import { extractRoutesFromPlan } from "../planner/routeExtractor.js";
import { config } from "../config.js";
import { getErrorBridgeScript } from "../planner/errorBridge.js";
import { classifyPrompt } from "../classification/promptClassifier.js";
import { getContextFromJob } from "../classification/conversationContext.js";
import axios from "axios";
import os from "os";

const WORKER_CONCURRENCY = 3;
const MAX_FIX_RETRIES = 3;
let workerHealthy = false;

export function isWorkerHealthy() {
  return workerHealthy;
}

// Helper to convert technical step descriptions to user-friendly phase names
function getUserFriendlyPhase(step: PlanStep): string {
  const desc = step.description.toLowerCase();
  const path = step.path?.toLowerCase() || "";

  // Project structure setup
  if (
    desc.includes("package.json") ||
    desc.includes("initialize") ||
    desc.includes("create project") ||
    desc.includes("setup project")
  ) {
    return "Setting up project structure";
  }

  // Dependencies
  if (
    desc.includes("install") ||
    desc.includes("dependencies") ||
    desc.includes("npm") ||
    desc.includes("pnpm") ||
    step.command?.includes("install")
  ) {
    return "Installing dependencies";
  }

  // Components
  if (
    path.endsWith(".tsx") ||
    path.endsWith(".jsx") ||
    desc.includes("component") ||
    desc.includes("react")
  ) {
    return "Generating components";
  }

  // Styles
  if (
    path.endsWith(".css") ||
    path.includes("tailwind") ||
    path.includes("style") ||
    desc.includes("styling")
  ) {
    return "Configuring styles";
  }

  // Config files
  if (
    path.includes("config") ||
    path.includes(".json") ||
    path.includes("tsconfig") ||
    desc.includes("configuration")
  ) {
    return "Configuring project";
  }

  // Default: use a cleaned version of the description
  return step.description;
}

export function createPromptWorker() {
  const worker = new Worker(
    QUEUE_NAMES.PROMPT_QUEUE,
    async (job: Job) => {
      const jobStartTime = Date.now();
      const promptText = job.data?.prompt;
      const previousJobId = job.data?.previousJobId;
      const jobId = job.id as string;

      logger.info("job.processing_started", {
        jobId,
        hasPrompt: !!promptText,
        isIteration: !!previousJobId,
        attempt: job.attemptsMade + 1,
      });

      // Step 1: Classify prompt type (NEW or CONTINUATION)
      let promptType: PromptType = PROMPT_TYPE.NEW;

      if (previousJobId) {
        const context = await getContextFromJob(previousJobId);

        if (context.hasPreviousJob) {
          const classification = await classifyPrompt(
            promptText,
            context.previousPrompt,
            context.previousProjectSummary,
            jobId,
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

      // Step 2: Sanitize and validate prompt
      await SessionManager.update(jobId, {
        status: SESSION_STATUS.PROCESSING,
        currentStep: "Understanding your request",
      });

      logger.info("prompt.sanitizing", { jobId });
      const validation = await sanitizePrompt(promptText);
      if (!validation.isValid) {
        logger.error("prompt.validation_failed", {
          jobId,
          reason: validation.rejectionReason,
          riskLevel: validation.riskLevel,
        });
        throw new Error(
          validation.rejectionReason || "Prompt failed validation",
        );
      }

      logger.info("prompt.validated", {
        jobId,
        riskLevel: validation.riskLevel,
        hasWarnings: validation.warnings.length > 0,
      });

      // Step 3: Setup container (reuse for iterations, create new for first prompts)
      const sandbox = SandboxManager.getInstance();
      let containerId: string | undefined;
      const previewUrl = `${config.api.baseUrl}/preview/${jobId}`;

      const currentSession = await SessionManager.get(jobId);

      if (
        promptType === PROMPT_TYPE.CONTINUATION &&
        currentSession?.containerId
      ) {
        logger.info("sandbox.continuation", { jobId, previousJobId });

        containerId = currentSession.containerId;

        // Verify container still exists
        try {
          await sandbox.exec(containerId, "echo 'container alive'");
          logger.info("sandbox.reusing", { jobId, containerId });
        } catch (error) {
          throw new Error(
            `Cannot continue: container ${containerId} no longer exists. Please start a new project.`,
          );
        }

        await SessionManager.update(jobId, {
          lastActivity: Date.now().toString(),
        });
      }

      // Step 4: Generate and validate plan (full for NEW, incremental for CONTINUATION)
      let validatedPlan: Plan;
      let enhancedPrompt: string;
      let fromCache = false;
      let planWarnings: string[] = [];

      // Skip cache for continuation prompts (each has unique context)
      // Also skip cache on retry - if plan failed before, regenerate it
      let cacheKey =
        promptType === PROMPT_TYPE.NEW
          ? cache.buildKey(cache.CACHE_PREFIX.PLAN, validation.sanitizedPrompt)
          : null;

      let cachedData = null;

      // If this is a retry (attemptsMade > 1), invalidate cache and regenerate plan
      if (job.attemptsMade > 1 && cacheKey) {
        logger.info("plan.cache.invalidate_on_retry", {
          jobId,
          attempt: job.attemptsMade,
          cacheKey,
        });
        await cache.del(cacheKey);
        cachedData = null;
      } else {
        cachedData = cacheKey
          ? await cache.get<{ plan: Plan; enhancedPrompt: string }>(cacheKey)
          : null;
      }

      if (cachedData) {
        // Cached (only for new prompts)
        logger.info("plan.cache.hit", { jobId, cacheKey });
        await SessionManager.update(jobId, {
          status: SESSION_STATUS.PROCESSING,
          currentStep: "Planning your application",
        });

        validatedPlan = cachedData.plan;
        enhancedPrompt = cachedData.enhancedPrompt;
        fromCache = true;

        logger.info("plan.loaded_from_cache", {
          jobId,
          stepsCount: validatedPlan.steps.length,
        });
      } else {
        logger.info("plan.cache.miss", {
          jobId,
          cacheKey: cacheKey || "N/A (continuation)",
        });

        let plan: Plan;

        if (promptType === PROMPT_TYPE.NEW) {
          // NEW PROJECT: Full plan generation
          await SessionManager.update(jobId, {
            status: SESSION_STATUS.PROCESSING,
            currentStep: "Planning your application",
          });

          const enhanceStartTime = Date.now();
          logger.info("plan.enhancing_prompt", { jobId });
          enhancedPrompt = await enhancePrompt(
            validation.sanitizedPrompt,
            jobId,
          );
          const enhanceDuration = Date.now() - enhanceStartTime;

          const planStartTime = Date.now();
          logger.info("plan.generating", {
            jobId,
            promptLength: enhancedPrompt.length,
            enhanceDurationMs: enhanceDuration,
          });
          plan = await generatePlan(enhancedPrompt, jobId);
          const planDuration = Date.now() - planStartTime;

          logger.info("plan.generated", {
            jobId,
            durationMs: planDuration,
            stepsCount: plan.steps.length,
          });
        } else {
          // CONTINUATION: Incremental plan generation
          await SessionManager.update(jobId, {
            status: SESSION_STATUS.PROCESSING,
            currentStep: "Loading your project",
          });

          logger.info("plan.loading_context", { jobId, previousJobId });
          const context = await getContextFromJob(previousJobId!);

          await SessionManager.update(jobId, {
            status: SESSION_STATUS.PROCESSING,
            currentStep: "Planning changes",
          });

          logger.info("plan.generating_incremental", {
            jobId,
            containerId: containerId!,
            hasPreviousContext: !!context.previousPrompt,
          });

          plan = await generateIncrementalPlan(
            promptText,
            context.previousPrompt || "",
            containerId!,
            context.previousProjectSummary,
            jobId,
          );

          enhancedPrompt = promptText; // No enhancement for continuation
        }

        // Validate plan (silent - no user-facing log)
        logger.info("plan.validating", {
          jobId,
          stepsCount: plan.steps.length,
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
            `Plan validation failed: ${planValidation.errors.join(", ")}`,
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
        planWarnings = [
          ...planValidation.warnings,
          ...uiValidation.warnings,
          ...uiValidation.suggestions,
        ];

        // Cache the validated plan immediately (even if job fails later, plan can be reused on retry)
        if (!fromCache && cacheKey) {
          await cache.set(
            cacheKey,
            { plan: validatedPlan, enhancedPrompt },
            cache.CACHE_TTL.PLAN,
          );
          logger.info("plan.cache.stored", { jobId, cacheKey });
        }
      }

      // Step 5: Create container for new prompts (continuation already has one)
      if (promptType === PROMPT_TYPE.NEW) {
        await SessionManager.update(jobId, {
          currentStep: "Creating workspace",
        });

        logger.info("sandbox.creating_container", { jobId });
        containerId = await sandbox.createContainer(jobId);
        logger.info("sandbox.container_created", {
          jobId,
          containerId: containerId.slice(0, 12),
        });

        logger.info("sandbox.starting_container", {
          jobId,
          containerId: containerId.slice(0, 12),
        });
        await sandbox.startContainer(containerId);
        logger.info("sandbox.container_started", {
          jobId,
          containerId: containerId.slice(0, 12),
        });
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

      // Step 6: Execute plan steps (write files, run commands)
      const appFiles = validatedPlan.steps
        .filter(
          (s: PlanStep) => s.type === "file_write" && s.path?.endsWith(".tsx"),
        )
        .map((s: PlanStep) => s.path as string);
      const routes = extractRoutesFromPlan(appFiles);

      const totalSteps = validatedPlan.steps.length;

      const executionStartTime = Date.now();
      logger.info("plan.execution_started", {
        jobId,
        totalSteps,
        containerId: containerId.slice(0, 12),
      });

      // Count files to generate (for user-facing log)
      const filesToGenerate = validatedPlan.steps.filter(
        (s) => s.type === "file_write",
      ).length;

      // Show single unified log for all file operations
      await SessionManager.update(jobId, {
        currentStep: `Generating your application${filesToGenerate > 0 ? ` (${filesToGenerate} files)` : ""}`,
      });

      let installingDependencies = false;

      for (const step of validatedPlan.steps) {
        logger.info("step.executing", {
          jobId,
          stepId: step.id,
          stepType: step.type,
          description: step.description,
          progress: `${step.id}/${totalSteps}`,
        });

        if (step.type === "command" && step.command) {
          // Show "Installing dependencies" log only once when npm/pnpm install runs
          if (
            !installingDependencies &&
            (step.command.includes("install") ||
              step.command.includes("npm") ||
              step.command.includes("pnpm"))
          ) {
            installingDependencies = true;
            await SessionManager.update(jobId, {
              currentStep: "Installing dependencies",
            });
          }

          const result = await sandbox.exec(
            containerId,
            step.command,
            step.workingDirectory,
          );
          logger.info("step.command.completed", {
            jobId,
            stepId: step.id,
            exitCode: result.exitCode,
            command: step.command.slice(0, 50),
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

      const executionDuration = Date.now() - executionStartTime;
      logger.info("plan.execution_completed", {
        jobId,
        totalSteps,
        durationMs: executionDuration,
        avgStepDurationMs: Math.round(executionDuration / totalSteps),
      });

      // Inject error bridge script for iframe-based runtime error detection
      try {
        logger.info("errorbridge.injecting", { jobId });
        await sandbox.writeFile(
          containerId,
          "/workspace/public/__error-bridge.js",
          getErrorBridgeScript(),
        );

        // Inject script tag into layout.tsx
        const layoutPath = "/workspace/app/layout.tsx";
        const layoutContent = await sandbox.readFile(containerId, layoutPath);

        if (layoutContent && !layoutContent.includes("__error-bridge.js")) {
          const patchedLayout = layoutContent.replace(
            /(<body[^>]*>)/,
            '$1\n        <script src="/__error-bridge.js" defer></script>',
          );
          await sandbox.writeFile(containerId, layoutPath, patchedLayout);
          logger.info("errorbridge.layout_injected", { jobId });
        }
      } catch (bridgeError) {
        logger.warn("errorbridge.injection_failed", {
          jobId,
          error:
            bridgeError instanceof Error
              ? bridgeError.message
              : String(bridgeError),
        });
        // Non-fatal: runtime check will fall back to old health check
      }

      // Step 7: Build project and auto-fix errors (retry up to MAX_FIX_RETRIES)
      let buildSuccess = false;
      let fixAttempts = 0;
      let lastBuildErrors = "";

      while (!buildSuccess && fixAttempts < MAX_FIX_RETRIES) {
        // Show "Building" on first attempt, "Optimizing" on retries
        if (fixAttempts === 0) {
          await SessionManager.update(jobId, {
            currentStep: "Building your application",
          });
        } else if (fixAttempts === 1) {
          await SessionManager.update(jobId, {
            currentStep: "Optimizing code",
            buildExtending: "true",
          });
        }

        const buildStartTime = Date.now();
        logger.info("build.attempting", {
          jobId,
          attempt: fixAttempts + 1,
          maxAttempts: MAX_FIX_RETRIES,
        });

        const buildResult = await sandbox.runBuild(containerId);
        const buildDuration = Date.now() - buildStartTime;

        if (buildResult.success) {
          buildSuccess = true;
          logger.info("build.success", {
            jobId,
            containerId: containerId.slice(0, 12),
            attempts: fixAttempts + 1,
            onFirstTry: fixAttempts === 0,
            durationMs: buildDuration,
          });

          // Post-build UI validation on actual generated files (silent)
          if (fixAttempts > 0) {
            logger.info("build.validating_ui_quality", { jobId });

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
                  }),
                ),
              };

              const postBuildValidation =
                frontendValidator.validate(generatedPlan);

              if (
                postBuildValidation.warnings.length > 0 ||
                postBuildValidation.suggestions.length > 0
              ) {
                logger.warn("build.ui_quality_issues", {
                  jobId,
                  warningsCount: postBuildValidation.warnings.length,
                  suggestionsCount: postBuildValidation.suggestions.length,
                });
              } else {
                logger.info("build.ui_quality_maintained", { jobId });
              }
            } catch (validationError) {
              logger.error("build.ui_validation_error", {
                jobId,
                error:
                  validationError instanceof Error
                    ? validationError.message
                    : String(validationError),
              });
            }
          }
        } else {
          lastBuildErrors = buildResult.errors;
          fixAttempts++;
          logger.warn("build.failed", {
            jobId,
            containerId: containerId.slice(0, 12),
            attempt: fixAttempts,
            durationMs: buildDuration,
            errorsPreview: buildResult.errors.slice(0, 200),
          });

          if (fixAttempts < MAX_FIX_RETRIES) {
            // Parse errors from build output
            const errorMap = parseErrorFiles(buildResult.errors);

            // Classify errors by type
            const classifiedErrors = classifyBuildErrors(errorMap);

            logger.info("build.errors_classified", {
              jobId,
              attempt: fixAttempts,
              totalErrors: classifiedErrors.length,
              byType: classifiedErrors.reduce(
                (acc, err) => {
                  acc[err.type] = (acc[err.type] || 0) + 1;
                  return acc;
                },
                {} as Record<string, number>,
              ),
            });

            // Route errors to appropriate handlers
            const handlingResult = await routeAndHandleErrors(
              containerId,
              classifiedErrors,
              jobId,
            );

            logger.info("build.errors_handled", {
              jobId,
              success: handlingResult.success,
              autoFixedCount: handlingResult.autoFixedErrors.length,
              llmFixedCount: handlingResult.llmFixedErrors.length,
              failedCount: handlingResult.failedErrors.length,
            });

            // Apply LLM-generated fixes if any
            if (handlingResult.fixes && handlingResult.fixes.length > 0) {
              await applyFixes(containerId, handlingResult.fixes, jobId);
            }

            // If we auto-fixed dependencies, the build will likely succeed on retry
            if (handlingResult.autoFixedErrors.length > 0) {
              logger.info("build.auto_fixes_applied", {
                jobId,
                fixesCount: handlingResult.autoFixedErrors.length,
                willRetry: true,
              });
            }

            // If config errors, abort immediately
            if (
              !handlingResult.success &&
              handlingResult.failedErrors.some((e) => e.type === "config")
            ) {
              logger.error("build.config_error_fatal", {
                jobId,
                message: handlingResult.message,
              });
              throw new Error(handlingResult.message);
            }
          }
        }
      }

      if (!buildSuccess) {
        logger.error("build.failed_max_retries", {
          jobId,
          containerId: containerId.slice(0, 12),
          totalAttempts: fixAttempts,
          errorsPreview: lastBuildErrors.slice(0, 500),
        });
      }

      // Step 8: Start dev server and run health checks
      await SessionManager.update(jobId, {
        currentStep: "Starting preview",
      });

      const devServerStartTime = Date.now();
      logger.info("devserver.starting", {
        jobId,
        containerId: containerId.slice(0, 12),
        port: config.container.port,
      });

      await sandbox.startDevServer(containerId);
      const devServerDuration = Date.now() - devServerStartTime;

      logger.info("devserver.started", {
        jobId,
        containerId: containerId.slice(0, 12),
        previewUrl: `http://localhost:${config.container.port}`,
        startupDurationMs: devServerDuration,
      });

      // Store generated files in Redis for API access
      try {
        // Get ALL files from container (not just .tsx from plan)
        const findResult = await sandbox.exec(
          containerId,
          "find /workspace -type f \\( -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' -o -name '*.css' -o -name '*.json' -o -name '*.html' -o -name '*.md' \\) ! -path '*/node_modules/*' ! -path '*/.next/*' ! -name '__error-bridge.js'",
        );

        const allContainerFiles = findResult.output
          .trim()
          .split("\n")
          .filter((path: string) => path.length > 0);

        logger.info("files.reading", {
          jobId,
          filesCount: allContainerFiles.length,
        });

        const generatedFiles = await Promise.all(
          allContainerFiles.map(async (path: string) => {
            const content = await sandbox.readFile(containerId, path);

            // Determine language from file extension
            const language =
              path.endsWith(".tsx") || path.endsWith(".ts")
                ? "typescript"
                : path.endsWith(".jsx") || path.endsWith(".js")
                  ? "javascript"
                  : path.endsWith(".css")
                    ? "css"
                    : path.endsWith(".json")
                      ? "json"
                      : path.endsWith(".html")
                        ? "html"
                        : "plaintext";

            return {
              path: path.replace("/workspace/", ""), // Remove /workspace prefix
              content,
              language,
            };
          }),
        );

        const filesData = {
          files: generatedFiles,
          metadata: {
            jobId,
            generatedAt: new Date().toISOString(),
            totalFiles: generatedFiles.length,
            totalSize: generatedFiles.reduce(
              (sum, f) => sum + f.content.length,
              0,
            ),
          },
        };

        // Store in Redis with 1 hour expiry
        await redis.set(
          `files:${jobId}`,
          JSON.stringify(filesData),
          "EX",
          3600, // 1 hour TTL
        );

        logger.info("files.stored", {
          jobId,
          filesCount: generatedFiles.length,
          totalSizeBytes: filesData.metadata.totalSize,
          expiresInSeconds: 3600,
        });
      } catch (fileError) {
        logger.error("files.storage_failed", {
          jobId,
          error:
            fileError instanceof Error ? fileError.message : String(fileError),
        });
        // Don't fail the job if file storage fails
      }

      // Wait for dev server to be ready (Next.js needs time to initialize)
      logger.info("devserver.initializing", {
        jobId,
        waitTimeMs: 5000,
      });
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // Health check: Verify dev server is responding and app renders without errors
      await SessionManager.update(jobId, {
        currentStep: "Running final checks",
      });

      // Call HTTP server's health check endpoint (HTTP has network access to containers)
      const healthCheckStartTime = Date.now();
      logger.info("health.checking", { jobId, routes: routes.length });
      const healthCheckResponse = await axios.post(
        `${config.api.httpServiceUrl}/internal/health-check`,
        {
          jobId,
          routes,
        },
        {
          timeout: 15000,
        },
      );
      const healthCheckDuration = Date.now() - healthCheckStartTime;

      logger.info("health.check_completed", {
        jobId,
        durationMs: healthCheckDuration,
        routesChecked: routes.length,
      });

      const { runtimeErrorDetected, runtimeErrorMessage } =
        healthCheckResponse.data;

      // If runtime errors detected, attempt one fix (extending the build fix loop by 1)
      if (runtimeErrorDetected) {
        logger.warn("health.runtime_errors_detected", {
          jobId,
          errorPreview: runtimeErrorMessage.slice(0, 200),
        });

        await SessionManager.update(jobId, {
          currentStep: "Optimizing code",
          buildExtending: "true",
        });

        // Create synthetic error for the LLM to fix
        const runtimeErrorMap = new Map<string, string>();
        runtimeErrorMap.set(
          "Runtime Error",
          `Application runtime error detected:\n${runtimeErrorMessage}\n\nCommon causes:\n- Missing 'use client' directive in components using hooks/events\n- Missing imports (especially for framer-motion, lucide-react)\n- Incorrect component structure (server/client mismatch)\n- Type errors not caught at build time`,
        );

        // Use existing error classification and handling pipeline
        const runtimeClassifiedErrors = classifyBuildErrors(runtimeErrorMap);
        const runtimeHandlingResult = await routeAndHandleErrors(
          containerId,
          runtimeClassifiedErrors,
          jobId,
        );

        logger.info("health.runtime_errors_handled", {
          jobId,
          success: runtimeHandlingResult.success,
          fixesGenerated: runtimeHandlingResult.llmFixedErrors.length,
        });

        // Apply LLM-generated fixes if any
        if (
          runtimeHandlingResult.fixes &&
          runtimeHandlingResult.fixes.length > 0
        ) {
          await applyFixes(containerId, runtimeHandlingResult.fixes, jobId);

          // Rebuild after runtime fixes (silent - already showing "Optimizing code")
          logger.info("health.rebuilding", { jobId });
          const rebuildResult = await sandbox.runBuild(containerId);

          if (!rebuildResult.success) {
            logger.error("health.rebuild_failed", {
              jobId,
              errorsPreview: rebuildResult.errors.slice(0, 500),
            });
            throw new Error(
              `Rebuild failed after runtime fix: ${rebuildResult.errors.slice(0, 200)}`,
            );
          }

          logger.info("health.rebuild_success", { jobId });

          // Restart dev server (rebuild stops the old one)
          await sandbox.startDevServer(containerId);
          await new Promise((resolve) => setTimeout(resolve, 5000));

          // Re-run health check to verify fix worked
          try {
            logger.info("health.rechecking", { jobId });
            const recheckResponse = await axios.post(
              `${config.api.httpServiceUrl}/internal/health-check`,
              {
                jobId,
                routes,
              },
              {
                timeout: 15000,
              },
            );

            const stillHasErrors = recheckResponse.data.runtimeErrorDetected;

            if (stillHasErrors) {
              logger.error("health.errors_persist", {
                jobId,
                errorPreview: recheckResponse.data.runtimeErrorMessage.slice(
                  0,
                  200,
                ),
              });
              throw new Error(
                `Runtime errors persist after fix: ${recheckResponse.data.runtimeErrorMessage}`,
              );
            } else {
              logger.info("health.fix_successful", { jobId });
            }
          } catch (recheckError) {
            logger.error("health.recheck_failed", {
              jobId,
              error:
                recheckError instanceof Error
                  ? recheckError.message
                  : String(recheckError),
            });
            throw new Error(
              `Health check failed after runtime fix: ${recheckError instanceof Error ? recheckError.message : String(recheckError)}`,
            );
          }
        } else {
          logger.error("health.no_fixes_generated", {
            jobId,
            errorPreview: runtimeErrorMessage.slice(0, 200),
          });
          throw new Error(
            `Runtime errors detected but could not generate fixes: ${runtimeErrorMessage}`,
          );
        }
      } else {
        logger.info("health.passed", { jobId, routesChecked: routes.length });
      }

      // Step 9: Iframe-based runtime error checking
      // The browser loads the app in a hidden iframe with the error bridge script.
      // The bridge catches real JS errors and reports them back via postMessage → HTTP → Redis.
      const RUNTIME_CHECK_TIMEOUT = 30; // seconds
      const MAX_RUNTIME_FIX_RETRIES = 2;
      let runtimeFixAttempts = 0;
      let runtimeClean = false;

      while (!runtimeClean && runtimeFixAttempts <= MAX_RUNTIME_FIX_RETRIES) {
        // Signal browser to load the hidden iframe
        await SessionManager.update(jobId, {
          currentStep:
            runtimeFixAttempts === 0
              ? "Running final checks"
              : "Optimizing code",
          runtimeCheck: "start",
        });

        // Clear any stale result from previous attempt
        const runtimeResultKey = `runtime-result:${jobId}`;
        await redis.del(runtimeResultKey);

        logger.info("runtime.waiting_for_browser", {
          jobId,
          timeoutSeconds: RUNTIME_CHECK_TIMEOUT,
          attempt: runtimeFixAttempts + 1,
        });

        // Use a duplicate Redis connection for the blocking BLPOP
        const blpopRedis = redis.duplicate();
        let report: {
          errors: Array<{ source: string; message: string; extra?: any }>;
          url: string;
        } | null = null;

        try {
          const result = await blpopRedis.blpop(
            runtimeResultKey,
            RUNTIME_CHECK_TIMEOUT,
          );

          if (result) {
            const [, reportJson] = result;
            report = JSON.parse(reportJson);
          }
        } finally {
          await blpopRedis.quit().catch(() => {});
        }

        // Clean up the Redis key
        await redis.del(runtimeResultKey);

        if (!report) {
          // Timeout — browser didn't report back. Skip runtime check.
          logger.warn("runtime.timeout", {
            jobId,
            message:
              "Browser did not report within timeout. Skipping runtime check.",
          });
          runtimeClean = true;
          break;
        }

        if (report.errors.length === 0) {
          // No runtime errors — app is clean
          logger.info("runtime.clean", { jobId });
          runtimeClean = true;
          break;
        }

        // Runtime errors detected
        logger.warn("runtime.errors_detected", {
          jobId,
          errorCount: report.errors.length,
          errors: report.errors.slice(0, 5).map((e) => e.message),
        });

        runtimeFixAttempts++;

        if (runtimeFixAttempts > MAX_RUNTIME_FIX_RETRIES) {
          logger.error("runtime.max_retries_exceeded", {
            jobId,
            attempts: runtimeFixAttempts,
          });
          // Don't fail the job — old health check already passed
          break;
        }

        // Build error description for the existing fix pipeline
        const runtimeErrorMessage = report.errors
          .map((e) => `[${e.source}] ${e.message}`)
          .join("\n");

        const runtimeErrorMap = new Map<string, string>();
        runtimeErrorMap.set(
          "Runtime Error",
          `Browser runtime errors detected:\n${runtimeErrorMessage}\n\n` +
            `Common causes:\n` +
            `- Missing 'use client' directive in components using hooks/events\n` +
            `- Missing imports (especially for framer-motion, lucide-react)\n` +
            `- Incorrect component structure (server/client mismatch)\n` +
            `- Type errors not caught at build time`,
        );

        await SessionManager.update(jobId, {
          currentStep: "Optimizing code",
          buildExtending: "true",
        });

        const runtimeClassified = classifyBuildErrors(runtimeErrorMap);
        const runtimeHandlingResult = await routeAndHandleErrors(
          containerId,
          runtimeClassified,
          jobId,
        );

        if (
          runtimeHandlingResult.fixes &&
          runtimeHandlingResult.fixes.length > 0
        ) {
          await applyFixes(containerId, runtimeHandlingResult.fixes, jobId);

          // Rebuild
          logger.info("runtime.rebuilding", { jobId });
          const rebuildResult = await sandbox.runBuild(containerId);

          if (!rebuildResult.success) {
            logger.error("runtime.rebuild_failed", {
              jobId,
              errorsPreview: rebuildResult.errors.slice(0, 500),
            });
            // Don't fail — old health check passed, this is best-effort
            break;
          }

          // Restart dev server
          await sandbox.startDevServer(containerId);
          await new Promise((resolve) => setTimeout(resolve, 5000));

          // Re-inject bridge script if layout was overwritten during fix
          try {
            const layoutPath = "/workspace/app/layout.tsx";
            const newLayout = await sandbox.readFile(containerId, layoutPath);
            if (newLayout && !newLayout.includes("__error-bridge.js")) {
              const patched = newLayout.replace(
                /(<body[^>]*>)/,
                '$1\n        <script src="/__error-bridge.js" defer></script>',
              );
              await sandbox.writeFile(containerId, layoutPath, patched);
            }
          } catch {
            // Non-fatal
          }

          logger.info("runtime.fix_applied_retrying", {
            jobId,
            attempt: runtimeFixAttempts,
          });
          // Loop continues — will send new runtimeCheck: "start"
        } else {
          logger.warn("runtime.no_fixes_generated", {
            jobId,
            errorPreview: runtimeErrorMessage.slice(0, 200),
          });
          // No fixes generated — move on, old health check already passed
          break;
        }
      }

      const jobDuration = Date.now() - jobStartTime;

      logger.info("job.processing_completed", {
        jobId,
        totalDurationMs: jobDuration,
        cached: fromCache,
        hadErrors: fixAttempts > 0,
        buildAttempts: fixAttempts + 1,
      });

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
    },
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
      job.finishedOn && job.processedOn
        ? job.finishedOn - job.processedOn
        : undefined;

    // Determine completion message based on prompt type
    const isIteration = job.data?.previousJobId;
    const completionMessage = isIteration
      ? "Changes applied successfully!"
      : "Your app is ready!";

    await SessionManager.update(jobId, {
      status: SESSION_STATUS.COMPLETED,
      currentStep: completionMessage,
      result: JSON.stringify(job.returnvalue),
    });

    logger.info("job.completed", {
      jobId: job.id,
      durationMs,
      attempts: job.attemptsMade,
      cached: job.returnvalue?.cached,
      containerId: job.returnvalue?.containerId?.slice(0, 12),
      isIteration,
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

    const failedJobData = job?.data;
    logger.error("job.failed", {
      jobId: job?.id,
      attempt: job?.attemptsMade,
      errorMessage: err.message,
      errorName: err.name,
      errorStack: err.stack?.split("\n").slice(0, 5).join("\n"), // First 5 lines only
      isIteration: !!failedJobData?.previousJobId,
      promptPreview: failedJobData?.prompt?.slice(0, 100),
      willRetry: (job?.attemptsMade || 0) < 3,
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
