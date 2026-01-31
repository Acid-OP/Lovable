import { SessionManager } from "@repo/session";
import { logger } from "../utils/logger.js";

export interface ConversationContext {
  hasPreviousJob: boolean;
  previousPrompt?: string;
  previousProjectSummary?: string;
}

/**
 * Get context from a specific previous job for classification
 */
export async function getContextFromJob(
  previousJobId: string,
): Promise<ConversationContext> {
  try {
    const session = await SessionManager.get(previousJobId);

    if (!session || !session.prompt) {
      return { hasPreviousJob: false };
    }

    return {
      hasPreviousJob: true,
      previousPrompt: session.prompt,
      previousProjectSummary: session.projectSummary,
    };
  } catch (error) {
    logger.error("conversation.context.failed", {
      previousJobId,
      error: error instanceof Error ? error.message : String(error),
    });

    return { hasPreviousJob: false };
  }
}
