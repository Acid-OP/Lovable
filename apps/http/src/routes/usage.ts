import { Router } from "express";
import { QuotaManager } from "@repo/quota";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const quotaManager = QuotaManager.getInstance();

    // Get today's usage stats
    const todayUsage = await quotaManager.getTodayUsage();

    // Get quota status
    const quotaStatus = await quotaManager.checkQuotaStatus();

    // Get recent job metrics (last 10 jobs)
    const recentJobIds = await quotaManager.getRecentJobIds(10);
    const recentJobs = await Promise.all(
      recentJobIds.map(async (jobId) => {
        const metrics = await quotaManager.getJobMetrics(jobId);
        return metrics;
      }),
    );

    return res.status(200).json({
      today: {
        date: new Date().toISOString().split("T")[0],
        apiCalls: todayUsage.apiCalls,
        inputTokens: todayUsage.inputTokens,
        outputTokens: todayUsage.outputTokens,
        totalTokens: todayUsage.totalTokens,
        estimatedCost: todayUsage.estimatedCost.toFixed(4),
        lastUpdated: new Date(todayUsage.lastUpdated).toISOString(),
      },
      quota: {
        used: quotaStatus.used,
        limit: quotaStatus.limit,
        remaining: quotaStatus.remaining,
        percentUsed: quotaStatus.percentUsed.toFixed(2),
      },
      recentJobs: recentJobs.filter((job) => job !== null),
    });
  } catch (e) {
    console.error("Error fetching usage stats:", e);
    return res.status(500).json({
      error: "Failed to fetch usage statistics",
      details: e instanceof Error ? e.message : String(e),
    });
  }
});

export default router;
