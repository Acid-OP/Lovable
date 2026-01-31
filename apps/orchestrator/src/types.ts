export type RiskLevel = "low" | "medium" | "high";

export interface SanitizationResult {
  isValid: boolean;
  sanitizedPrompt: string;
  originalPrompt: string;
  warnings: string[];
  rejectionReason?: string;
  riskLevel: RiskLevel;
}

export interface PromptJobData {
  prompt: string;
  userId?: string;
  metadata?: Record<string, any>;
}
