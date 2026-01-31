export const PROMPT_TYPE = {
  NEW: "new",
  CONTINUATION: "continuation",
} as const;

export type PromptType = (typeof PROMPT_TYPE)[keyof typeof PROMPT_TYPE];
