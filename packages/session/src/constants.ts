export const SESSION_PREFIX = "session:job:" as const;
export const CHANNEL_PREFIX = "job:" as const;

export const SESSION_STATUS = {
  QUEUED: "queued",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

export type SessionStatus =
  (typeof SESSION_STATUS)[keyof typeof SESSION_STATUS];

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
  containerId?: string;
  lastActivity?: string;
  previewUrl?: string;
  // Conversation tracking
  prompt?: string;
  previousJobId?: string;
  projectId?: string;
  promptType?: "new" | "continuation";
  projectSummary?: string;
  iterationCount?: number;
  // Runtime error checking
  runtimeCheck?: string;
  // Signals the frontend that errors caused the build to extend
  buildExtending?: string;
}
