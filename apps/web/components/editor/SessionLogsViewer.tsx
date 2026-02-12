"use client";

import { useEffect, useRef, useState } from "react";
import type { SSEMessage } from "@/lib/hooks/useSSEStream";

interface SessionLogsViewerProps {
  messages: SSEMessage[];
  isDark?: boolean;
  onComplete?: () => void; // Called when all logs are displayed
}

interface DisplayLog {
  id: string;
  text: string;
  type: "info" | "success" | "error" | "step";
  timestamp: number;
}

export function SessionLogsViewer({
  messages,
  isDark = false,
  onComplete,
}: SessionLogsViewerProps) {
  const [currentLog, setCurrentLog] = useState<DisplayLog | null>(null);
  const [queuedLogs, setQueuedLogs] = useState<DisplayLog[]>([]);
  const lastProcessedIndexRef = useRef(0);
  const animationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const seenLogsRef = useRef<Set<string>>(new Set());
  const streamCompleteRef = useRef(false);

  // Process new messages and add to queue (with deduplication)
  useEffect(() => {
    if (messages.length === 0) return;
    if (messages.length <= lastProcessedIndexRef.current) return;

    const newMessages = messages.slice(lastProcessedIndexRef.current);

    // Check if stream is complete
    const hasCompleteMessage = newMessages.some(
      (msg) => msg.type === "complete" || msg.status === "completed",
    );
    if (hasCompleteMessage) {
      streamCompleteRef.current = true;
    }

    const newLogs: DisplayLog[] = newMessages
      .map((msg) => {
        const text = formatMessage(msg);
        if (!text) return null;

        const log: DisplayLog = {
          id: crypto.randomUUID(),
          text,
          type: getLogType(msg),
          timestamp: Date.now(),
        };

        return log;
      })
      .filter((log): log is DisplayLog => log !== null);

    if (newLogs.length > 0) {
      const uniqueNewLogs = newLogs.filter((log) => {
        if (seenLogsRef.current.has(log.text)) {
          return false;
        }
        seenLogsRef.current.add(log.text);
        return true;
      });

      if (uniqueNewLogs.length > 0) {
        setQueuedLogs((prev) => [...prev, ...uniqueNewLogs]);
      }
    }

    lastProcessedIndexRef.current = messages.length;
  }, [messages]);

  // Start displaying logs when queue has items (runs once)
  useEffect(() => {
    // Start interval that keeps checking the queue
    const intervalId = setInterval(() => {
      setQueuedLogs((queue) => {
        // If queue is empty, nothing to do
        if (queue.length === 0) {
          return queue;
        }

        // Take first log from queue and display it
        const [nextLog, ...remaining] = queue;
        if (nextLog) {
          setCurrentLog(nextLog);
        }

        // Only call onComplete when stream is complete AND queue is empty
        if (remaining.length === 0 && streamCompleteRef.current && onComplete) {
          setTimeout(() => onComplete(), 2500);
        }

        return remaining;
      });
    }, 2500); // Check every 2.5 seconds

    // Store interval ID
    animationIntervalRef.current = intervalId;

    // Cleanup only on unmount
    return () => {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
        animationIntervalRef.current = null;
      }
    };
    // Empty deps - only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatMessage = (msg: SSEMessage): string | null => {
    if (msg.status === "connected") {
      return null; // Skip the "Session started" message
    }
    if (msg.currentStep) return msg.currentStep;
    if (msg.step) return msg.step;
    if (msg.content) return msg.content;
    if (msg.message) return msg.message;
    if (msg.type === "complete") return "Build completed successfully";
    if (msg.type === "error") return `Error: ${msg.content || "Unknown"}`;
    return null;
  };

  const getLogType = (msg: SSEMessage): DisplayLog["type"] => {
    if (msg.type === "complete" || msg.status === "completed") return "success";
    if (msg.type === "error") return "error";
    if (msg.currentStep || msg.step) return "step";
    return "info";
  };

  // Falling stars positions
  const starOffsets = [-400, -300, -200, -100, 0, 100, 200, 300, 400];

  return (
    <div
      className={`h-full flex flex-col items-center justify-center ${
        isDark ? "bg-[#1e1e1e]" : "bg-white"
      } p-8 relative overflow-hidden`}
    >
      {/* Falling stars background */}
      {starOffsets.map((offset, i) => (
        <div
          key={`star-${i}`}
          className="absolute"
          style={{
            left: `calc(50% + ${offset}px)`,
            top: "-20px",
            width: "3px",
            height: "3px",
            borderRadius: "50%",
            backgroundColor: isDark ? "#666" : "#999",
            animation: "starFall 5s ease-in infinite",
            animationDelay: `${i * 0.8}s`,
            boxShadow: isDark
              ? "0 0 3px 1px rgba(102, 102, 102, 0.3)"
              : "0 0 3px 1px rgba(153, 153, 153, 0.3)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
      ))}

      {/* Main content */}
      <div className="relative z-10 w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-20">
          <h2
            className={`text-4xl font-medium mb-3 ${
              isDark ? "text-white" : "text-black"
            }`}
          >
            Building your application
          </h2>
          <p
            className={`text-base ${
              isDark ? "text-gray-500" : "text-gray-600"
            }`}
          >
            {currentLog ? "Processing..." : "Initializing..."}
          </p>
        </div>

        {/* Current log display - minimal fade */}
        <div className="relative min-h-[180px] flex items-center justify-center">
          {currentLog ? (
            <div
              key={currentLog.id}
              className="w-full"
              style={{
                animation: "fadeIn 0.6s ease-out",
              }}
            >
              {/* Clean card */}
              <div
                className={`relative px-12 py-10 rounded-2xl ${
                  isDark
                    ? "bg-[#252525] shadow-2xl"
                    : "bg-white shadow-lg border border-gray-200"
                }`}
              >
                <div className="flex items-center gap-6">
                  {/* Minimal icon */}
                  <div
                    className="flex-shrink-0"
                    style={{
                      animation: "fadeIn 0.6s ease-out 0.3s backwards",
                    }}
                  >
                    {currentLog.type === "success" ? (
                      <svg
                        className={`w-8 h-8 ${
                          isDark ? "text-gray-400" : "text-gray-700"
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : currentLog.type === "error" ? (
                      <svg
                        className={`w-8 h-8 ${
                          isDark ? "text-gray-400" : "text-gray-700"
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    ) : (
                      <svg
                        className={`w-8 h-8 ${
                          isDark ? "text-gray-400" : "text-gray-700"
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    )}
                  </div>

                  {/* Text - fades in after card */}
                  <p
                    className={`text-xl font-normal flex-1 ${
                      isDark ? "text-gray-300" : "text-gray-900"
                    }`}
                    style={{
                      animation: "fadeIn 0.6s ease-out 0.3s backwards",
                    }}
                  >
                    {currentLog.text}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            // Loading state - minimal
            <div className="w-full text-center">
              <div
                className={`inline-flex items-center gap-3 px-8 py-5 rounded-2xl ${
                  isDark
                    ? "bg-[#252525] shadow-xl"
                    : "bg-white shadow-md border border-gray-200"
                }`}
                style={{
                  animation: "fadeIn 0.6s ease-out",
                }}
              >
                <div className="flex gap-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={`dot-${i}`}
                      className={`w-2 h-2 rounded-full ${
                        isDark ? "bg-gray-600" : "bg-gray-400"
                      }`}
                      style={{
                        animation: "bounceDot 1.4s ease-in-out infinite",
                        animationDelay: `${i * 0.2}s`,
                      }}
                    />
                  ))}
                </div>
                <span
                  className={`text-base ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Connecting...
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Queue indicator - minimal */}
        {queuedLogs.length > 0 && (
          <div
            className="text-center mt-16"
            style={{
              animation: "fadeIn 0.6s ease-out",
            }}
          >
            <p
              className={`text-sm ${
                isDark ? "text-gray-600" : "text-gray-400"
              }`}
            >
              {queuedLogs.length} more step{queuedLogs.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes starFall {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) translateX(50px);
            opacity: 0;
          }
        }

        @keyframes bounceDot {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
      `}</style>
    </div>
  );
}
