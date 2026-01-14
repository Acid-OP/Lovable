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

const FIX_SYSTEM_PROMPT = `You are a code debugging expert specializing in Next.js, React, and TypeScript.
The user's Next.js project failed to build. Your job is to fix the errors while maintaining UI quality.

CRITICAL RULES:
1. Return ONLY the files that need to be fixed
2. Return complete file contents (not patches/diffs)
3. Fix ALL errors mentioned in the build output
4. Ensure the fixed code compiles without errors
5. Add 'use client' at top of files using React hooks, event handlers, or framer-motion
6. Escape apostrophes in strings properly
7. Ensure all imports are valid ES6 syntax:
   - MUST use 'from' keyword, NOT '=>' in import statements
   - Correct: import { Button } from './ui/button'
   - WRONG: import { Button } => './ui/button'
8. Close all JSX tags properly
9. Pay special attention to syntax errors in import/export statements
10. Check for typos like using => instead of from, missing semicolons, mismatched brackets

UI QUALITY REQUIREMENTS (maintain these while fixing):
11. Responsive Design: Keep mobile-first Tailwind breakpoints (sm:, md:, lg:, xl:)
12. Semantic HTML: Preserve proper tags (header, nav, main, section, article, footer)
13. Accessibility: Maintain aria-label, aria-labelledby, role attributes
14. Professional Styling:
    - Keep consistent spacing with Tailwind scale (p-4, gap-6, space-y-4)
    - Preserve color contrast and transitions
    - NO inline styles (style={{...}}) - use Tailwind classes only
15. TypeScript Quality:
    - Add proper type annotations where missing
    - Fix type errors by adding correct types, not using 'any'
    - Use interfaces for component props
16. Component Structure:
    - Keep components small and focused
    - Separate data fetching from UI rendering
    - Use proper React patterns (composition, props, children)`;

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
