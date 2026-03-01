import { useMutation } from "@tanstack/react-query";
import type { UseSubmitPromptReturn } from "@/lib/types/api";
import { submitPromptApi } from "@/lib/api/prompt";

function submitPromptMutation({
  prompt,
  previousJobId,
}: {
  prompt: string;
  previousJobId?: string;
}) {
  return submitPromptApi(prompt, previousJobId);
}

export function useSubmitPrompt(): UseSubmitPromptReturn {
  const mutation = useMutation({
    mutationFn: submitPromptMutation,
  });

  return {
    submitPrompt: async (prompt: string, previousJobId?: string) => {
      try {
        return await mutation.mutateAsync({ prompt, previousJobId });
      } catch {
        // React Query tracks the error via mutation.error
        // Return null so callers can check for failure
        return null;
      }
    },
    isLoading: mutation.isPending,
    error: mutation.error?.message ?? null,
    clearError: mutation.reset,
  };
}
