export const STEP_TYPES = ["command", "file_write", "file_delete"] as const;
export type StepType = (typeof STEP_TYPES)[number];

export interface PlanStep {
  id: number;
  type: StepType;
  description: string;
  command?: string;
  workingDirectory?: string;
  path?: string;
  content?: string;
}

export interface Plan {
  summary: string;
  steps: PlanStep[];
  estimatedTimeSeconds: number;
}

