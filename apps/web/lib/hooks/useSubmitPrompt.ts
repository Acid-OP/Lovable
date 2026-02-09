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
        const result = await mutation.mutateAsync({ prompt, previousJobId });
        return result;
      } catch {
        return null;
      }
    },
    isLoading: mutation.isPending,
    error: mutation.error?.message ?? null,
    clearError: mutation.reset,
  };
}
