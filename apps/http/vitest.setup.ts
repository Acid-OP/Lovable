import { vi } from "vitest";

vi.mock("@repo/redis", () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn(),
    lpush: vi.fn(),
    expire: vi.fn(),
    duplicate: vi.fn(() => ({
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
      quit: vi.fn(),
      on: vi.fn(),
    })),
  },
}));

vi.mock("@repo/queue", () => ({
  QueueManager: {
    getInstance: vi.fn(() => ({
      pushToQueue: vi.fn().mockResolvedValue({ jobId: "mock-job-id" }),
    })),
  },
}));

vi.mock("@repo/session", () => ({
  SessionManager: {
    get: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue(undefined),
    update: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("@repo/quota", () => ({
  QuotaManager: {
    getInstance: vi.fn(() => ({
      getTodayUsage: vi.fn().mockResolvedValue({
        apiCalls: 10,
        inputTokens: 5000,
        outputTokens: 3000,
        totalTokens: 8000,
        estimatedCost: 0.0123,
        lastUpdated: Date.now(),
      }),
      checkQuotaStatus: vi.fn().mockResolvedValue({
        used: 10,
        limit: 100,
        remaining: 90,
        percentUsed: 10,
      }),
      getRecentJobIds: vi.fn().mockResolvedValue(["job-1", "job-2"]),
      getJobMetrics: vi.fn().mockResolvedValue({
        jobId: "job-1",
        tokens: 500,
      }),
    })),
  },
}));

vi.mock("@repo/logger", () => ({
  createLogger: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  }),
}));
