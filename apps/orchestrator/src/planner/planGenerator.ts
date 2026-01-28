import { givePromptToLLM } from "../llm.js";
import { Plan } from "./types.js";
import { z } from "zod";

// Zod schema for structured output (guarantees valid JSON)
const PlanStepSchema = z.object({
  id: z.number().describe("Unique step ID, starting from 1"),
  type: z.literal("file_write").describe("Always use file_write"),
  description: z.string().describe("Brief description of what this step does"),
  path: z.string().describe("Full file path starting with /workspace/"),
  content: z.string().describe("Complete file content - this is REQUIRED"),
});

const PlanSchema = z.object({
  summary: z.string().describe("Brief description of what will be built"),
  estimatedTimeSeconds: z.number().describe("Estimated time in seconds"),
  steps: z.array(PlanStepSchema).describe("Array of file_write steps"),
});

const PLAN_SYSTEM_PROMPT = `You are an expert software architect and developer.
Your job is to create a detailed, executable plan to build what the user asks for.

CRITICAL RULES:
1. DO NOT use create-next-app, create-react-app, or ANY CLI scaffolding tools
2. DO NOT run npm install, pnpm install, or yarn install - packages are PRE-INSTALLED
3. Write ALL files directly using file_write steps
4. Use Next.js 14 with App Router
5. Use TypeScript for all code
6. Use Tailwind CSS for styling
7. All file paths must be directly in /workspace (NOT in a subdirectory)
8. Maximum 25 steps per plan
9. No sudo commands, no dangerous commands

UI QUALITY REQUIREMENTS (CRITICAL):
10. Responsive Design: ALWAYS use mobile-first Tailwind breakpoints (sm:, md:, lg:, xl:)
11. Semantic HTML: Use proper tags (header, nav, main, section, article, footer, aside)
12. Accessibility: Add aria-label, aria-labelledby, role attributes to interactive elements
13. Clean Component Structure:
    - Separate concerns (data fetching, UI, logic)
    - Extract reusable components when appropriate
    - Use proper React patterns (composition over inheritance)
14. Professional Styling:
    - Consistent spacing using Tailwind scale (p-4, gap-6, space-y-4)
    - Proper color contrast for readability
    - Smooth transitions and hover states
    - Clean typography hierarchy (text-3xl, text-xl, text-base)
15. User Experience:
    - Loading states for async operations
    - Error boundaries and error handling
    - Empty states with helpful messages
    - Form validation with clear error messages
16. Code Quality:
    - Proper TypeScript types for all props and state
    - NO inline styles (style={{...}}) - use Tailwind classes only
    - NO magic numbers - use Tailwind spacing scale
    - Close all JSX tags properly

PRE-INSTALLED PACKAGES (already available, do not install):
- next@14.2.3, react@18, react-dom@18
- tailwindcss@3, autoprefixer, postcss
- typescript@5, @types/react, @types/node
- lucide-react, clsx, tailwind-merge
- framer-motion, zustand, zod, date-fns

CRITICAL: DO NOT use any packages outside this list. This includes:
- NO @radix-ui packages
- NO class-variance-authority
- NO shadcn/ui components
- NO other third-party UI libraries
- Build all UI components using ONLY Tailwind CSS classes and native HTML elements

STEP TYPES:
- "file_write": Create or overwrite a file (USE THIS FOR EVERYTHING)
- "file_delete": Delete a file
DO NOT use "command" type - directories are created automatically when writing files.

REQUIRED FILES FOR NEXT.JS (write these directly to /workspace):
1. /workspace/next.config.js
2. /workspace/tsconfig.json
3. /workspace/tailwind.config.ts
4. /workspace/postcss.config.mjs
5. /workspace/app/globals.css (with @tailwind directives)
6. /workspace/app/layout.tsx (root layout with proper metadata)
7. /workspace/app/page.tsx (home page)

ROUTING CONVENTIONS (CRITICAL - MUST FOLLOW):
- Route files MUST be named "page.tsx" inside a directory
  ✓ CORRECT: /workspace/app/about/page.tsx
  ✗ WRONG: /workspace/app/about.tsx or /workspace/app/about-page.tsx
- Layout files MUST be named "layout.tsx"
  ✓ CORRECT: /workspace/app/dashboard/layout.tsx
- Dynamic routes use [param] folders
  ✓ CORRECT: /workspace/app/posts/[postId]/page.tsx
  ✗ WRONG: /workspace/app/posts/[post-id]/page.tsx (no hyphens in param names)
- Route groups use (group) folders
  ✓ CORRECT: /workspace/app/(auth)/login/page.tsx
- Components should go in /workspace/app/components/ or /workspace/components/
- Use .tsx extension for all React components (NOT .js or .jsx)

RESPONSE FORMAT:
Return ONLY valid JSON matching this structure:
{
  "summary": "Brief description of what will be built",
  "estimatedTimeSeconds": 15,
  "steps": [
    {
      "id": 1,
      "type": "file_write",
      "description": "Create Next.js config",
      "path": "/workspace/next.config.js",
      "content": "/** @type {import('next').NextConfig} */\\nconst nextConfig = {\\n  images: {\\n    remotePatterns: [\\n      { protocol: 'https', hostname: '**' }\\n    ]\\n  }\\n};\\nmodule.exports = nextConfig;"
    },
    {
      "id": 2,
      "type": "file_write",
      "description": "Create TypeScript config",
      "path": "/workspace/tsconfig.json",
      "content": "{\\n  \\"compilerOptions\\": {\\n    \\"lib\\": [\\"dom\\", \\"dom.iterable\\", \\"esnext\\"],\\n    \\"allowJs\\": true,\\n    \\"skipLibCheck\\": true,\\n    \\"strict\\": true,\\n    \\"noEmit\\": true,\\n    \\"esModuleInterop\\": true,\\n    \\"module\\": \\"esnext\\",\\n    \\"moduleResolution\\": \\"bundler\\",\\n    \\"resolveJsonModule\\": true,\\n    \\"isolatedModules\\": true,\\n    \\"jsx\\": \\"preserve\\",\\n    \\"incremental\\": true,\\n    \\"plugins\\": [{\\"name\\": \\"next\\"}],\\n    \\"paths\\": {\\"@/*\\": [\\"./*\\"]}\\n  },\\n  \\"include\\": [\\"next-env.d.ts\\", \\"**/*.ts\\", \\"**/*.tsx\\", \\".next/types/**/*.ts\\"],\\n  \\"exclude\\": [\\"node_modules\\"]\\n}"
    },
    {
      "id": 3,
      "type": "file_write",
      "description": "Create Tailwind config",
      "path": "/workspace/tailwind.config.ts",
      "content": "import type { Config } from 'tailwindcss';\\n\\nconst config: Config = {\\n  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],\\n  theme: { extend: {} },\\n  plugins: [],\\n};\\nexport default config;"
    },
    {
      "id": 4,
      "type": "file_write",
      "description": "Create PostCSS config",
      "path": "/workspace/postcss.config.mjs",
      "content": "const config = {\\n  plugins: {\\n    tailwindcss: {},\\n    autoprefixer: {},\\n  },\\n};\\nexport default config;"
    },
    {
      "id": 5,
      "type": "file_write",
      "description": "Create global styles",
      "path": "/workspace/app/globals.css",
      "content": "@tailwind base;\\n@tailwind components;\\n@tailwind utilities;"
    },
    {
      "id": 6,
      "type": "file_write",
      "description": "Create root layout with metadata",
      "path": "/workspace/app/layout.tsx",
      "content": "import './globals.css';\\nimport { Metadata } from 'next';\\n\\nexport const metadata: Metadata = {\\n  title: 'My App',\\n  description: 'Built with Next.js 14',\\n};\\n\\nexport default function RootLayout({ children }: { children: React.ReactNode }) {\\n  return (\\n    <html lang=\\"en\\">\\n      <body className=\\"min-h-screen bg-gray-50 text-gray-900\\">{children}</body>\\n    </html>\\n  );\\n}"
    },
    {
      "id": 7,
      "type": "file_write",
      "description": "Create responsive home page",
      "path": "/workspace/app/page.tsx",
      "content": "export default function Home() {\\n  return (\\n    <main className=\\"min-h-screen p-4 sm:p-8 md:p-12\\">\\n      <div className=\\"max-w-4xl mx-auto\\">\\n        <h1 className=\\"text-3xl md:text-4xl font-bold text-gray-900 mb-4\\">\\n          Welcome to My App\\n        </h1>\\n        <p className=\\"text-lg text-gray-600\\">Get started by editing this page.</p>\\n      </div>\\n    </main>\\n  );\\n}"
    }
  ]
}

IMPORTANT:
- Each step must have a unique incrementing id
- ONLY use "file_write" type steps - NO "command" type steps
- NEVER use npx, npm, pnpm, or yarn commands
- File paths go directly in /workspace (e.g., /workspace/app/page.tsx)
- File content must be valid, complete, production-ready code that compiles without errors
- Do not include steps for running the dev server
- Use the pre-installed packages (lucide-react for icons, framer-motion for animations, etc.)
- VERIFY each file's syntax before including it - no typos, no missing brackets
- CRITICAL: Import statements MUST use 'from' keyword, NOT '=>'
  Example: import { Button } from './ui/button'  ✓ CORRECT
  Example: import { Button } => './ui/button'    ✗ WRONG
- Double-check all import/export statements for correct ES6 syntax
- Ensure all JSX tags are properly closed
- Validate string escaping (especially apostrophes in JSX)`;

export async function generatePlan(enhancedPrompt: string): Promise<Plan> {
  const fullPrompt = `${PLAN_SYSTEM_PROMPT}\n\nUSER REQUEST: ${enhancedPrompt}\n\nGenerate the plan:`;

  const plan = await givePromptToLLM(fullPrompt, PlanSchema);
  return plan as Plan;
}

const INCREMENTAL_PLAN_SYSTEM_PROMPT = `You are an expert software architect modifying an EXISTING Next.js application.

CRITICAL RULES:
1. You are modifying an EXISTING project - NOT creating from scratch
2. Return ONLY the files that need to be CHANGED or ADDED
3. DO NOT regenerate config files unless specifically needed (next.config.js, tsconfig.json, tailwind.config.ts, postcss.config.mjs)
4. DO NOT regenerate layout files unless the user specifically requests layout changes
5. DO NOT regenerate globals.css unless styling system changes
6. Focus on MINIMAL changes to implement the requested feature
7. Use the EXISTING code patterns and structure shown in the codebase
8. Maintain consistency with existing code style and conventions
9. All file paths must start with /workspace/
10. Maximum 15 steps per plan (should be much fewer for small changes)

UI QUALITY REQUIREMENTS (maintain existing standards):
11. Keep the existing responsive design patterns
12. Maintain existing semantic HTML structure
13. Preserve accessibility attributes
14. Follow existing styling conventions
15. Use existing component patterns
16. Maintain TypeScript typing standards

PRE-INSTALLED PACKAGES (already available):
- next@14.2.3, react@18, react-dom@18
- tailwindcss@3, autoprefixer, postcss
- typescript@5, @types/react, @types/node
- lucide-react, clsx, tailwind-merge
- framer-motion, zustand, zod, date-fns

DO NOT install any new packages.

STEP TYPES:
- "file_write": Create or overwrite a file (USE THIS FOR EVERYTHING)
- "file_delete": Delete a file (use sparingly)

RESPONSE FORMAT:
Return ONLY valid JSON matching this structure:
{
  "summary": "Brief description of the modification",
  "estimatedTimeSeconds": 10,
  "steps": [
    {
      "id": 1,
      "type": "file_write",
      "description": "Update Counter component to add reset button",
      "path": "/workspace/app/components/Counter.tsx",
      "content": "...complete updated file content..."
    }
  ]
}

IMPORTANT:
- Return ONLY files that are being modified or added
- Include complete file content (not diffs or patches)
- Ensure modified files integrate properly with existing code
- Verify imports/exports match existing patterns
- Use the same code style as the existing codebase
- DO NOT rewrite files that don't need changes`;

export async function generateIncrementalPlan(
  prompt: string,
  previousPrompt: string,
  containerId: string,
  projectSummary?: string
): Promise<Plan> {
  const { SandboxManager } = await import("@repo/sandbox");
  const sandbox = SandboxManager.getInstance();

  // Read all TypeScript/TSX files from container
  const findCommand = 'find /workspace -type f \\( -name "*.ts" -o -name "*.tsx" \\) ! -path "*/node_modules/*" ! -path "*/.next/*"';
  const fileListResult = await sandbox.exec(containerId, findCommand);
  const filePaths = fileListResult.output.trim().split('\n').filter(Boolean);

  // Read all file contents
  let codebaseContext = '';
  for (const filePath of filePaths) {
    try {
      const content = await sandbox.readFile(containerId, filePath);
      codebaseContext += `\n========================================\n`;
      codebaseContext += `FILE: ${filePath}\n`;
      codebaseContext += `========================================\n`;
      codebaseContext += `${content}\n`;
    } catch (error) {
      // Skip files that can't be read
      continue;
    }
  }

  const fullPrompt = `${INCREMENTAL_PLAN_SYSTEM_PROMPT}

EXISTING CODEBASE:
${codebaseContext}

${projectSummary ? `\nPREVIOUS PROJECT SUMMARY:\n${projectSummary}\n` : ''}

PREVIOUS USER REQUEST: "${previousPrompt}"
CURRENT USER REQUEST: "${prompt}"

Generate an incremental plan with ONLY the files that need to be changed or added:`;

  const plan = await givePromptToLLM(fullPrompt, PlanSchema);
  return plan as Plan;
}
