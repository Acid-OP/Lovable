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

      UI QUALITY REQUIREMENTS (maintain AND enhance while fixing):
      11. Responsive Design: Keep mobile-first Tailwind breakpoints (sm:, md:, lg:, xl:)
      12. Semantic HTML: Preserve proper tags (header, nav, main, section, article, footer)
      13. Accessibility: Maintain aria-label, aria-labelledby, role attributes
      14. Professional Styling (follow design system):
          - Spacing: Use p-4, p-6, p-8, gap-4, gap-6, space-y-4, space-y-6
          - Colors: bg-blue-600, text-gray-900, text-gray-600, bg-white
          - Shadows: shadow-sm, shadow-md, shadow-lg
          - Rounded: rounded-lg, rounded-xl, rounded-full
          - Transitions: ALWAYS include transition-all duration-200
          - Hover states: Add hover:bg-*, hover:shadow-lg, hover:scale-105
          - NO inline styles (style={{...}}) - use Tailwind classes only
      15. Typography:
          - Titles: text-4xl md:text-5xl font-bold
          - Body: text-base md:text-lg
          - Proper hierarchy with text-3xl, text-2xl, text-xl, text-base
      16. TypeScript Quality:
          - Add proper type annotations where missing
          - Fix type errors by adding correct types, not using 'any'
          - Use interfaces for component props
      17. Component Structure:
          - Keep components small and focused
          - Separate data fetching from UI rendering
          - Use proper React patterns (composition, props, children)
      18. When Fixing, Also Improve:
          - If transitions are missing, add them
          - If hover states are missing, add them
          - If spacing is inconsistent, fix it
          - Maintain the design system throughout`;

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
