// Chat message in the editor sidebar
export interface Message {
  role: "user" | "assistant";
  content: string;
}

// SSE stream message from backend
export interface SSEMessage {
  type?: "log" | "status" | "code" | "error" | "complete" | "connected";
  content?: string;
  step?: string;
  status?: string;
  jobId?: string;
  message?: string;
  currentStep?: string;
  files?: Array<{
    path: string;
    content: string;
    language: string;
  }>;
}

// Component props
export interface DummyPreviewProps {
  isDark: boolean;
}

export interface RisingLogsLoaderProps {
  messages: SSEMessage[];
  isDark?: boolean;
  onComplete?: () => void;
}
