export const QUOTA_PREFIX = "quota:" as const;
export const USAGE_PREFIX = "usage:daily:" as const;
export const JOB_METRICS_PREFIX = "metrics:job:" as const;

// API key rotation settings
export const KEY_ROTATION = {
  MAX_REQUESTS_PER_DAY: 1500, // Default limit per key per day
  RETRY_AFTER_HOURS: 24, // Wait before retrying a blocked key
} as const;

// Gemini pricing (per 1M tokens)
export const GEMINI_PRICING = {
  "gemini-2.5-flash": {
    input: 0.075, // $0.075 per 1M input tokens
    output: 0.3, // $0.30 per 1M output tokens
  },
} as const;

export type ModelName = keyof typeof GEMINI_PRICING;

export interface UsageStats {
  apiCalls: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCost: number;
  lastUpdated: number;
}

export interface JobMetrics {
  jobId: string;
  apiCalls: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCost: number;
  duration: number;
  startTime: number;
  endTime?: number;
}

export interface ApiKeyConfig {
  key: string;
  name: string;
  dailyLimit: number;
}
