import { givePromptToLLM } from "../llm.js";
import { z } from "zod";

const EnhancedPromptSchema = z.object({
  enhancedPrompt: z.string(),
});

const ENHANCER_SYSTEM_PROMPT = `You are a prompt enhancement specialist. 
Your job is to take vague user prompts and make them specific and actionable.

Rules:
- If no language specified, default to TypeScript
- If no styling specified, default to Tailwind CSS
- If no framework specified for web apps, default to Next.js 14
- Add reasonable defaults for anything missing
- Keep the user's original intent intact`;

export async function enhancePrompt(userPrompt: string): Promise<string> {
  const enhancerPrompt = `${ENHANCER_SYSTEM_PROMPT}

Original user prompt: "${userPrompt}"

Return the enhanced, more specific version of this prompt.`;

  try {
    const result = await givePromptToLLM(enhancerPrompt, EnhancedPromptSchema);
    return result.enhancedPrompt || userPrompt;
  } catch {
    return userPrompt;
  }
}
