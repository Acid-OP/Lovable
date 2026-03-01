"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { logger } from "@/lib/utils/client-logger";
import type { SSEMessage } from "@/lib/types/editor";

export type { SSEMessage };

interface UseSSEStreamReturn {
  messages: SSEMessage[];
  isConnected: boolean;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
}

export function useSSEStream(
  jobId: string | null,
  autoConnect = false,
): UseSSEStreamReturn {
  const [messages, setMessages] = useState<SSEMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const jobIdRef = useRef(jobId);
  jobIdRef.current = jobId;

  const connect = useCallback(() => {
    const id = jobIdRef.current;
    if (!id) return;

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    const streamUrl = `/api/stream/${id}`;
    logger.info("Connecting to SSE stream", { url: streamUrl, jobId: id });

    try {
      const eventSource = new EventSource(streamUrl);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        logger.info("SSE connection opened", { jobId: id });
        setIsConnected(true);
        setError(null);
      };

      eventSource.onmessage = (event) => {
        try {
          if (event.data.startsWith(":")) {
            return;
          }

          const data = JSON.parse(event.data);
          logger.debug("SSE message received", { jobId: id, data });

          setMessages((prev) => [...prev, data]);

          if (
            data.type === "complete" ||
            data.status === "complete" ||
            data.status === "completed"
          ) {
            logger.info("Job completed, closing stream", { jobId: id });
            eventSource.close();
            setIsConnected(false);
          }
        } catch (err) {
          logger.error("Failed to parse SSE message", { jobId: id, err });
        }
      };

      eventSource.onerror = (err) => {
        logger.error("SSE connection error", { jobId: id, err });
        setError("Connection lost. Retrying...");
        setIsConnected(false);

        setTimeout(() => {
          if (eventSource.readyState === EventSource.CLOSED) {
            logger.info("SSE connection closed", { jobId: id });
            setError("Connection closed");
          }
        }, 3000);
      };
    } catch (err) {
      logger.error("Failed to create SSE connection", { jobId: id, err });
      setError(
        err instanceof Error ? err.message : "Failed to connect to stream",
      );
    }
  }, []);

  // Auto-connect only if flag is set
  useEffect(() => {
    if (!jobId || !autoConnect) return;
    connect();

    return () => {
      if (eventSourceRef.current) {
        logger.info("Closing SSE connection", { jobId });
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [jobId, autoConnect, connect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  const disconnect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
    }
  };

  const reconnect = useCallback(() => {
    setMessages([]);
    setError(null);
    connect();
  }, [connect]);

  return { messages, isConnected, error, connect, disconnect, reconnect };
}
