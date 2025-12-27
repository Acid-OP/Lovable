import { givePromptToLLM } from "../llm.js";
import { FileError } from "./buildErrorParser.js";
import { z } from "zod";

export interface FileFix {
  path: string;
  content: string;
}

const FileFixSchema = z.object({
  path: z.string(),
  content: z.string(),
});

const FixResponseSchema = z.object({
  fixes: z.array(FileFixSchema),
});

const FIX_SYSTEM_PROMPT = `You are a code debugging expert.
The user's Next.js project failed to build. Your job is to fix the errors.

RULES:
1. Return ONLY the files that need to be fixed
2. Return complete file contents (not patches/diffs)
3. Fix ALL errors mentioned in the build output
4. Ensure the fixed code compiles without errors
5. Add 'use client' at top of files using React hooks, event handlers, or framer-motion
6. Escape apostrophes in strings properly
7. Ensure all imports are valid ES6 syntax
8. Close all JSX tags properly`;

function buildFixPrompt(fileErrors: FileError[]): string {
  let prompt = `${FIX_SYSTEM_PROMPT}\n\nFILES WITH ERRORS:\n\n`;

  for (const file of fileErrors) {
    prompt += `========================================\n`;
    prompt += `FILE: ${file.path}\n`;
    prompt += `----------------------------------------\n`;
    prompt += `ERROR:\n${file.error}\n`;
    prompt += `----------------------------------------\n`;
    prompt += `CURRENT CODE:\n${file.content}\n`;
    prompt += `========================================\n\n`;
  }

  prompt += `\nReturn the fixed files:`;
  return prompt;
}

export async function generateFixes(fileErrors: FileError[]): Promise<FileFix[]> {
  if (fileErrors.length === 0) {
    return [];
  }

  const prompt = buildFixPrompt(fileErrors);
  const result = await givePromptToLLM(prompt, FixResponseSchema);
  
  return result.fixes || [];
}
