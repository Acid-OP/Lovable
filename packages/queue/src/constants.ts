export const QUEUE_NAMES = {
  PROMPT_QUEUE: "prompt_queue",
} as const;

export const JOB_NAMES = {
  PROCESS_PROMPT: "process-prompt",
} as const;

// BullMQ job configuration: retry policy and cleanup rules
export const JOB_OPTIONS = {
  attempts: 2,
  backoff: {
    type: "exponential" as const,
    delay: 3000,
  },
  removeOnComplete: {
    age: 3600, // 1 hour
    count: 100,
  },
  removeOnFail: {
    age: 86400, // 24 hours
    count: 50,
  },
} as const;
