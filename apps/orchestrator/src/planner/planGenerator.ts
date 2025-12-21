import { givePromptToLLM } from "../llm.js";
import { Plan } from "./types.js";

const PLAN_SYSTEM_PROMPT = `You are an expert software architect and developer.
Your job is to create a detailed, executable plan to build what the user asks for.

RULES:
1. Use Next.js 14 with App Router for web applications
2. Use TypeScript for all code
3. Use Tailwind CSS for styling
4. Use pnpm as package manager
5. All file paths must be relative to /workspace
6. Maximum 20 steps per plan
7. No sudo commands
8. No dangerous commands (rm -rf /, etc.)
9. No network fetch commands (curl, wget) unless explicitly needed

STEP TYPES:
- "command": Execute a shell command
- "file_write": Create or overwrite a file with content
- "file_delete": Delete a file

RESPONSE FORMAT:
Return ONLY valid JSON matching this structure:
{
  "summary": "Brief description of what will be built",
  "estimatedTimeSeconds": 120,
  "steps": [
    {
      "id": 1,
      "type": "command",
      "description": "Initialize Next.js project",
      "command": "npx create-next-app@latest my-app --typescript --tailwind --eslint --app --src-dir=false --import-alias='@/*'",
      "workingDirectory": "/workspace"
    },
    {
      "id": 2,
      "type": "command",
      "description": "Navigate to project and install dependencies",
      "command": "cd my-app && pnpm install",
      "workingDirectory": "/workspace"
    },
    {
      "id": 3,
      "type": "file_write",
      "description": "Create Header component",
      "path": "/workspace/my-app/components/Header.tsx",
      "content": "export default function Header() {\\n  return <header className=\\"bg-blue-500 p-4\\">Header</header>;\\n}"
    }
  ]
}

IMPORTANT:
- Each step must have a unique incrementing id
- Commands must be non-interactive (use --yes flags where needed)
- File content must be valid, complete code
- Do not include steps for running the dev server
- Focus on project setup and file creation`;

export async function generatePlan(enhancedPrompt: string): Promise<Plan> {
  const fullPrompt = `${PLAN_SYSTEM_PROMPT}

USER REQUEST:
${enhancedPrompt}

Generate the plan:`;

  const result = await givePromptToLLM(fullPrompt);
  
  if (!result.success || !result.response) {
    throw new Error("Failed to generate plan from LLM");
  }
  
  // Extract JSON from response (handle markdown code blocks if present)
  let jsonString = result.response.trim();
  if (jsonString.startsWith("```json")) {
    jsonString = jsonString.slice(7);
  }
  if (jsonString.startsWith("```")) {
    jsonString = jsonString.slice(3);
  }
  if (jsonString.endsWith("```")) {
    jsonString = jsonString.slice(0, -3);
  }
  
  try {
    const plan: Plan = JSON.parse(jsonString.trim());
    return plan;
  } catch (parseError) {
    throw new Error(`Failed to parse plan JSON: ${parseError}`);
  }
}

