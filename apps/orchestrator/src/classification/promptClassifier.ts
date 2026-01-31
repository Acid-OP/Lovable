import { givePromptToLLM } from "../llm.js";
import { logger } from "../utils/logger.js";
import { z } from "zod";
import { PROMPT_TYPE } from "../types/prompt.js";

// Zod schema for classification result
const ClassificationSchema = z.object({
  type: z
    .enum([PROMPT_TYPE.NEW, PROMPT_TYPE.CONTINUATION])
    .describe("Whether this is a new project or continuation"),
  reasoning: z.string().describe("Brief explanation of the classification"),
  confidence: z.number().describe("Confidence level between 0.0 and 1.0"),
});

type ClassificationResult = z.infer<typeof ClassificationSchema>;

const CLASSIFICATION_SYSTEM_PROMPT = `You are a prompt classifier for a code generation system.

Your job is to determine if a user's request is:

**"continuation"**: User wants to modify/add to the SAME project
Examples:
- "add dark mode"
- "change the button color to blue"
- "also add a contact form"
- "make it responsive"
- "fix the layout"
- "remove the footer"

**"new"**: User wants to start a COMPLETELY DIFFERENT project
Examples:
- "create a blog website" (after building a portfolio)
- "build a todo app" (after building a calculator)
- "make an ecommerce store" (after building a landing page)

Key indicators for continuation:
- Action verbs: add, update, change, modify, remove, fix, improve, also
- References: "to it", "in it", "the app", "that", "this"
- Same topic/domain as previous request

Key indicators for new:
- Different domain/topic (portfolio → blog → ecommerce)
- Explicit "new", "instead", "different" keywords
- Starting fresh with "create", "build", "make"

Return a JSON object with:
- type: "continuation" or "new"
- reasoning: brief explanation
- confidence: 0.0-1.0`;

/**
 * Classify if a prompt is a new project or continuation of previous work
 */
export async function classifyPrompt(
  currentPrompt: string,
  previousPrompt?: string,
  previousProjectSummary?: string,
): Promise<ClassificationResult> {
  // No previous context? Must be new
  if (!previousPrompt) {
    return {
      type: PROMPT_TYPE.NEW,
      reasoning: "No previous prompt in session",
      confidence: 1.0,
    };
  }

  try {
    logger.info("prompt.classification.start", {
      currentPrompt: currentPrompt.slice(0, 100),
      previousPrompt: previousPrompt.slice(0, 100),
    });

    const fullPrompt = `${CLASSIFICATION_SYSTEM_PROMPT}

Previous user request: "${previousPrompt}"
${previousProjectSummary ? `Previous project summary: ${previousProjectSummary}` : ""}

Current user request: "${currentPrompt}"

Classify this prompt:`;

    const result = await givePromptToLLM(fullPrompt, ClassificationSchema);

    logger.info("prompt.classification.complete", {
      type: result.type,
      reasoning: result.reasoning,
      confidence: result.confidence,
    });

    return result;
  } catch (error) {
    logger.error("prompt.classification.failed", {
      error: error instanceof Error ? error.message : String(error),
    });

    // Safe fallback: treat as new project
    return {
      type: PROMPT_TYPE.NEW,
      reasoning: "Classification failed, defaulting to new project",
      confidence: 0.5,
    };
  }
}
