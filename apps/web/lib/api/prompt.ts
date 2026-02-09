import type { SubmitPromptRequest, ApiResponse } from "@/lib/types/api";

export async function submitPromptApi(
  prompt: string,
  previousJobId?: string,
): Promise<{ jobId: string; clientId: string }> {
  const response = await fetch("/api/submit-prompt", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      previousJobId,
    } satisfies SubmitPromptRequest),
  });

  const data: ApiResponse = await response.json();

  if (!data.success) {
    throw new Error(data.error);
  }

  return {
    jobId: data.data.jobId,
    clientId: data.data.clientId,
  };
}
