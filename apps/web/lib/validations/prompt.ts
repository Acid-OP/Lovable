import { z } from "zod";

// Prompt validation schema
export const promptSchema = z.object({
  prompt: z
    .string()
    .min(1, "Prompt cannot be empty")
    .max(5000, "Prompt is too long (max 5000 characters)")
    .trim(),
  previousJobId: z.string().min(1).optional(),
});

export type PromptInput = z.infer<typeof promptSchema>;
