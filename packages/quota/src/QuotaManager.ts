import { redis } from "@repo/redis";
import {
  USAGE_PREFIX,
  JOB_METRICS_PREFIX,
  GEMINI_PRICING,
  UsageStats,
  JobMetrics,
  ModelName,
  KEY_ROTATION,
} from "./constants.js";

function scanKeys(pattern: string): Promise<string[]> {
  const keys: string[] = [];
  const stream = redis.scanStream({ match: pattern, count: 100 });
  return new Promise((resolve, reject) => {
    stream.on("data", (batch: string[]) => keys.push(...batch));
    stream.on("end", () => resolve(keys));
    stream.on("error", reject);
  });
}

export class QuotaManager {
  private static instance: QuotaManager;

  private constructor() {}

  static getInstance() {
    if (!this.instance) {
      this.instance = new QuotaManager();
    }
    return this.instance;
  }

  private getTodayKey(): string {
    const today = new Date().toISOString().split("T")[0];
    return `${USAGE_PREFIX}${today}`;
  }

  // Calculate cost based on model and tokens
  private calculateCost(
    model: ModelName,
    inputTokens: number,
    outputTokens: number,
  ): number {
    const pricing = GEMINI_PRICING[model];
    const inputCost = (inputTokens / 1_000_000) * pricing.input;
    const outputCost = (outputTokens / 1_000_000) * pricing.output;
    return inputCost + outputCost;
  }

  // Record API usage after each LLM call
  async recordUsage(data: {
    inputTokens: number;
    outputTokens: number;
    model: ModelName;
    jobId?: string;
  }): Promise<void> {
    const { inputTokens, outputTokens, model, jobId } = data;
    const totalTokens = inputTokens + outputTokens;
    const cost = this.calculateCost(model, inputTokens, outputTokens);

    // Update daily usage stats
    const todayKey = this.getTodayKey();
    const pipeline = redis.pipeline();

    pipeline.hincrby(todayKey, "apiCalls", 1);
    pipeline.hincrby(todayKey, "inputTokens", inputTokens);
    pipeline.hincrby(todayKey, "outputTokens", outputTokens);
    pipeline.hincrby(todayKey, "totalTokens", totalTokens);
    pipeline.hincrbyfloat(todayKey, "estimatedCost", cost);
    pipeline.hset(todayKey, "lastUpdated", Date.now());
    pipeline.expire(todayKey, 86400); // Expire after 24 hours

    await pipeline.exec();

    // Update per-job metrics if jobId provided
    if (jobId) {
      await this.updateJobMetrics(jobId, {
        inputTokens,
        outputTokens,
        cost,
      });
    }
  }

  // Get today's usage statistics
  async getTodayUsage(): Promise<UsageStats> {
    const todayKey = this.getTodayKey();
    const data = await redis.hgetall(todayKey);

    if (!data || Object.keys(data).length === 0) {
      return {
        apiCalls: 0,
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        estimatedCost: 0,
        lastUpdated: Date.now(),
      };
    }

    return {
      apiCalls: parseInt(data.apiCalls || "0"),
      inputTokens: parseInt(data.inputTokens || "0"),
      outputTokens: parseInt(data.outputTokens || "0"),
      totalTokens: parseInt(data.totalTokens || "0"),
      estimatedCost: parseFloat(data.estimatedCost || "0"),
      lastUpdated: parseInt(data.lastUpdated || "0"),
    };
  }

  // Check if we're approaching daily limit
  async checkQuotaStatus(): Promise<{
    used: number;
    limit: number;
    remaining: number;
    percentUsed: number;
  }> {
    const usage = await this.getTodayUsage();
    const limit = KEY_ROTATION.MAX_REQUESTS_PER_DAY;
    const remaining = Math.max(0, limit - usage.apiCalls);
    const percentUsed = (usage.apiCalls / limit) * 100;

    return {
      used: usage.apiCalls,
      limit,
      remaining,
      percentUsed,
    };
  }

  /**
   * Check if a specific IP has exceeded their daily job limit.
   * Returns { allowed, used, limit } so the caller can decide what to do.
   */
  async checkIpQuota(
    ip: string,
    maxPerDay: number = 5,
  ): Promise<{ allowed: boolean; used: number; limit: number }> {
    const today = new Date().toISOString().split("T")[0];
    const key = `quota:ip:${ip}:${today}`;

    const used = parseInt((await redis.get(key)) || "0");

    if (used >= maxPerDay) {
      return { allowed: false, used, limit: maxPerDay };
    }

    // Atomically increment and set TTL on first use
    const newCount = await redis.incr(key);
    if (newCount === 1) {
      await redis.expire(key, 86400);
    }

    return { allowed: true, used: newCount, limit: maxPerDay };
  }

  // Start tracking a job
  startJobTracking(jobId: string): number {
    return Date.now();
  }

  // Update job metrics
  private async updateJobMetrics(
    jobId: string,
    data: {
      inputTokens: number;
      outputTokens: number;
      cost: number;
    },
  ): Promise<void> {
    const key = `${JOB_METRICS_PREFIX}${jobId}`;
    const totalTokens = data.inputTokens + data.outputTokens;

    const pipeline = redis.pipeline();
    pipeline.hincrby(key, "apiCalls", 1);
    pipeline.hincrby(key, "inputTokens", data.inputTokens);
    pipeline.hincrby(key, "outputTokens", data.outputTokens);
    pipeline.hincrby(key, "totalTokens", totalTokens);
    pipeline.hincrbyfloat(key, "estimatedCost", data.cost);
    pipeline.expire(key, 86400); // Keep for 24 hours

    await pipeline.exec();
  }

  // Finalize job tracking with duration
  async finalizeJobMetrics(jobId: string, startTime: number): Promise<void> {
    const key = `${JOB_METRICS_PREFIX}${jobId}`;
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000); // seconds

    await redis.hset(key, {
      startTime,
      endTime,
      duration,
    });
  }

  // Get metrics for a specific job
  async getJobMetrics(jobId: string): Promise<JobMetrics | null> {
    const key = `${JOB_METRICS_PREFIX}${jobId}`;
    const data = await redis.hgetall(key);

    if (!data || Object.keys(data).length === 0) {
      return null;
    }

    return {
      jobId,
      apiCalls: parseInt(data.apiCalls || "0"),
      inputTokens: parseInt(data.inputTokens || "0"),
      outputTokens: parseInt(data.outputTokens || "0"),
      totalTokens: parseInt(data.totalTokens || "0"),
      estimatedCost: parseFloat(data.estimatedCost || "0"),
      duration: parseInt(data.duration || "0"),
      startTime: parseInt(data.startTime || "0"),
      endTime: data.endTime ? parseInt(data.endTime) : undefined,
    };
  }

  // Get recent job IDs from Redis (for monitoring endpoint)
  async getRecentJobIds(limit: number = 10): Promise<string[]> {
    const pattern = `${JOB_METRICS_PREFIX}*`;
    const keys = await scanKeys(pattern);

    // Extract jobIds and sort by most recent
    const jobIds = keys
      .map((key: string) => key.replace(JOB_METRICS_PREFIX, ""))
      .slice(0, limit);

    return jobIds;
  }
}
