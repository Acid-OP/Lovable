"use client";

import { useEffect, useRef, useState } from "react";
import { logger } from "@/lib/utils/client-logger";

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

interface UseSSEStreamReturn {
  messages: SSEMessage[];
  isConnected: boolean;
  error: string | null;
  disconnect: () => void;
}

export function useSSEStream(jobId: string | null): UseSSEStreamReturn {
  const [messages, setMessages] = useState<SSEMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!jobId) return;

    const streamUrl = `/api/stream/${jobId}`;
    logger.info("Connecting to SSE stream", { url: streamUrl, jobId });

    try {
      const eventSource = new EventSource(streamUrl);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        logger.info("SSE connection opened", { jobId });
        setIsConnected(true);
        setError(null);
      };

      eventSource.onmessage = (event) => {
        try {
          // Skip heartbeat messages
          if (event.data.startsWith(":")) {
            return;
          }

          const data = JSON.parse(event.data);
          logger.debug("SSE message received", { jobId, data });

          setMessages((prev) => [...prev, data]);

          // Handle completion
          if (
            data.type === "complete" ||
            data.status === "complete" ||
            data.status === "completed"
          ) {
            logger.info("Job completed, closing stream", { jobId });
            eventSource.close();
            setIsConnected(false);
          }
        } catch (err) {
          logger.error("Failed to parse SSE message", { jobId, err });
        }
      };

      eventSource.onerror = (err) => {
        logger.error("SSE connection error", { jobId, err });
        setError("Connection lost. Retrying...");
        setIsConnected(false);

        // EventSource will auto-reconnect, but we'll close after failures
        setTimeout(() => {
          if (eventSource.readyState === EventSource.CLOSED) {
            logger.info("SSE connection closed", { jobId });
            setError("Connection closed");
          }
        }, 3000);
      };
    } catch (err) {
      logger.error("Failed to create SSE connection", { jobId, err });
      setError(
        err instanceof Error ? err.message : "Failed to connect to stream",
      );
    }

    // Cleanup on unmount
    return () => {
      if (eventSourceRef.current) {
        logger.info("Closing SSE connection", { jobId });
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [jobId]);

  const disconnect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
    }
  };

  return { messages, isConnected, error, disconnect };
}
