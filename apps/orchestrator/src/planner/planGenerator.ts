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

PRE-INSTALLED PACKAGES (already available, do not install):
- next@14.2.3, react@18, react-dom@18
- tailwindcss@3, autoprefixer, postcss
- typescript@5, @types/react, @types/node
- lucide-react, clsx, tailwind-merge
- framer-motion, zustand, zod, date-fns

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
6. /workspace/app/layout.tsx (root layout)
7. /workspace/app/page.tsx (home page)

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
      "description": "Create root layout",
      "path": "/workspace/app/layout.tsx",
      "content": "import './globals.css';\\nexport default function RootLayout({ children }: { children: React.ReactNode }) {\\n  return <html lang=\\"en\\"><body>{children}</body></html>;\\n}"
    },
    {
      "id": 7,
      "type": "file_write",
      "description": "Create home page",
      "path": "/workspace/app/page.tsx",
      "content": "export default function Home() {\\n  return <main className=\\"p-8\\"><h1>Hello World</h1></main>;\\n}"
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
- VERIFY each file's syntax before including it - no typos, no missing brackets`;

export async function generatePlan(enhancedPrompt: string): Promise<Plan> {
  const fullPrompt = `${PLAN_SYSTEM_PROMPT}\n\nUSER REQUEST: ${enhancedPrompt}\n\nGenerate the plan:`;

  const plan = await givePromptToLLM(fullPrompt, PlanSchema);
  return plan as Plan;
}
