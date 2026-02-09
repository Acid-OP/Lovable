import { z } from "zod";

// Prompt validation schema - matches frontend validation
export const promptSchema = z.object({
  prompt: z
    .string()
    .min(1, "Prompt cannot be empty")
    .max(5000, "Prompt is too long (max 5000 characters)")
    .trim(),
  previousJobId: z.string().uuid().optional(),
});

export type PromptInput = z.infer<typeof promptSchema>;
