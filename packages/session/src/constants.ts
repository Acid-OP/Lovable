export const SESSION_PREFIX = "session:job:" as const;

export const SESSION_STATUS = {
  QUEUED: "queued",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

export type SessionStatus = (typeof SESSION_STATUS)[keyof typeof SESSION_STATUS];

export interface SessionData {
  jobId?: string;
  status?: SessionStatus;
  progress?: string;
  currentStep?: string;
  result?: string;
  errors?: string[];
  createdAt?: string;
  completedAt?: string;
  failedAt?: string;
}
