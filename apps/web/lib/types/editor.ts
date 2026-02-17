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

// Log entry for the session logs viewer
export interface DisplayLog {
  id: string;
  text: string;
  type: "info" | "success" | "error" | "step";
  timestamp: number;
  starIndex: number;
}

// Component props
export interface SessionLogsViewerProps {
  messages: SSEMessage[];
  isDark?: boolean;
  onComplete?: () => void;
}

export interface DummyPreviewProps {
  isDark: boolean;
}

export interface AnimatedLogsProps {
  messages: SSEMessage[];
  isDark?: boolean;
}
