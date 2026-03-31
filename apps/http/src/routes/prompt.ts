import { Router } from "express";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { QueueManager } from "@repo/queue";
import { SessionManager } from "@repo/session";
import { QuotaManager } from "@repo/quota";
import { promptSchema } from "../validations/prompt";
import { logger } from "../utils/logger";

const router = Router();

const MAX_JOBS_PER_IP_PER_DAY = parseInt(
  process.env.MAX_JOBS_PER_IP_PER_DAY || "5",
);

const promptLimiter = rateLimit({
  windowMs: 60_000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
  keyGenerator: (req) => ipKeyGenerator(req.ip),
});

router.post("/", promptLimiter, async (req, res) => {
  try {
    // Validate request body
    const validation = promptSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: "Invalid input",
        details: validation.error.message,
      });
    }

    const { prompt, previousJobId } = validation.data;

    // Enforce per-IP daily quota before enqueuing
    const ip = req.ip || "unknown";
    const ipQuota = await QuotaManager.getInstance().checkIpQuota(
      ip,
      MAX_JOBS_PER_IP_PER_DAY,
    );
    if (!ipQuota.allowed) {
      logger.warn("quota.ip_exceeded", {
        ip,
        used: ipQuota.used,
        limit: ipQuota.limit,
      });
      return res.status(429).json({
        error: "Daily limit reached. Please try again tomorrow.",
        used: ipQuota.used,
        limit: ipQuota.limit,
      });
    }

    // Enforce global daily quota (protects Gemini API key)
    const globalQuota = await QuotaManager.getInstance().checkQuotaStatus();
    if (globalQuota.remaining <= 0) {
      logger.warn("quota.global_exceeded", {
        used: globalQuota.used,
        limit: globalQuota.limit,
      });
      return res.status(429).json({
        error: "Service is at capacity. Please try again later.",
      });
    }

    // For iterations, reuse jobId to keep same container
    const isIteration = !!previousJobId;
    const jobId = isIteration ? previousJobId : undefined;

    const result = await QueueManager.getInstance().pushToQueue({
      prompt,
      previousJobId,
      jobId,
    });

    // Update existing session for iterations, create new for first prompts
    if (isIteration) {
      const currentSession = await SessionManager.get(result.jobId as string);
      const iterationCount = (currentSession?.iterationCount || 0) + 1;

      await SessionManager.update(result.jobId as string, {
        prompt,
        status: "queued",
        currentStep: "Request received",
        lastActivity: Date.now().toString(),
        iterationCount,
      });
    } else {
      await SessionManager.create(result.jobId as string);
      await SessionManager.update(result.jobId as string, {
        prompt,
        currentStep: "Request received",
        iterationCount: 1,
      });
    }

    return res.status(200).json({
      message: "Prompt enqueued",
      ...result,
      isIteration,
    });
  } catch (e) {
    logger.error("Error enqueueing prompt", {
      error: e instanceof Error ? e.message : String(e),
      stack: e instanceof Error ? e.stack : undefined,
    });
    return res.status(500).json({
      error: "Failed to enqueue prompt",
    });
  }
});

export default router;
