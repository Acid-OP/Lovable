// Submit Prompt Request
export interface SubmitPromptRequest {
  prompt: string;
  previousJobId?: string;
}

// Backend Response
interface BackendSuccessResponse {
  message: string;
  jobId: string;
  clientId: string;
  isIteration: boolean;
}

// Our API Response (Success)
export interface SubmitPromptResponse {
  success: true;
  data: BackendSuccessResponse;
}

// API Error Response
export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: string;
}

export type ApiResponse = SubmitPromptResponse | ApiErrorResponse;

// Hook Return Types
export interface UseSubmitPromptReturn {
  submitPrompt: (
    prompt: string,
    previousJobId?: string,
  ) => Promise<{ jobId: string; clientId: string } | null>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}
