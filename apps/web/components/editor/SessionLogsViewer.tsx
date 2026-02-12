"use client";

import { useEffect, useRef, useState } from "react";
import type { SSEMessage } from "@/lib/hooks/useSSEStream";

interface SessionLogsViewerProps {
  messages: SSEMessage[];
  isDark?: boolean;
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
}: SessionLogsViewerProps) {
  const [currentLog, setCurrentLog] = useState<DisplayLog | null>(null);
  const [queuedLogs, setQueuedLogs] = useState<DisplayLog[]>([]);
  const lastProcessedIndexRef = useRef(0);
  const animationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const seenLogsRef = useRef<Set<string>>(new Set());

  // Process new messages and add to queue (with deduplication)
  useEffect(() => {
    if (messages.length === 0) return;
    if (messages.length <= lastProcessedIndexRef.current) return;

    const newMessages = messages.slice(lastProcessedIndexRef.current);

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

  // Display logs from queue (consolidated logic)
  useEffect(() => {
    // Show first log immediately if no current log and queue has items
    if (!currentLog && queuedLogs.length > 0) {
      const [nextLog, ...rest] = queuedLogs;
      if (nextLog) {
        setCurrentLog(nextLog);
        setQueuedLogs(rest);
      }
      return; // Exit early, don't start interval yet
    }

    // Manage interval for remaining logs
    if (queuedLogs.length > 0) {
      if (!animationIntervalRef.current) {
        animationIntervalRef.current = setInterval(() => {
          setQueuedLogs((queue) => {
            if (queue.length === 0) return queue;
            const [nextLog, ...rest] = queue;
            if (nextLog) setCurrentLog(nextLog);
            return rest;
          });
        }, 1200);
      }
    } else if (animationIntervalRef.current) {
      clearInterval(animationIntervalRef.current);
      animationIntervalRef.current = null;
    }

    // Cleanup on unmount
    return () => {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
        animationIntervalRef.current = null;
      }
    };
  }, [queuedLogs.length, currentLog]);

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

  return (
    <div
      className={`h-full flex flex-col items-center justify-center ${
        isDark ? "bg-[#1e1e1e]" : "bg-white"
      } p-8 relative overflow-hidden`}
    >
      {/* Animated background circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full ${
            isDark ? "bg-blue-500/5" : "bg-blue-500/10"
          } blur-3xl`}
          style={{
            animation: "float 8s ease-in-out infinite",
          }}
        />
        <div
          className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full ${
            isDark ? "bg-purple-500/5" : "bg-purple-500/10"
          } blur-3xl`}
          style={{
            animation: "float 10s ease-in-out infinite reverse",
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h2
            className={`text-3xl font-semibold mb-3 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Building your application
          </h2>
          <p
            className={`text-base ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {currentLog ? "Processing..." : "Initializing..."}
          </p>
        </div>

        {/* Current log display - center stage */}
        <div className="relative min-h-[200px] flex items-center justify-center">
          {currentLog ? (
            <div
              key={currentLog.id}
              className="w-full"
              style={{
                animation: "flash-fade-in 0.8s ease-out",
              }}
            >
              {/* Glow effect */}
              <div
                className={`absolute inset-0 rounded-2xl blur-xl ${
                  currentLog.type === "success"
                    ? "bg-green-500/30"
                    : currentLog.type === "error"
                      ? "bg-red-500/30"
                      : "bg-blue-500/30"
                }`}
                style={{
                  animation: "pulse-glow 2s ease-in-out infinite",
                }}
              />

              {/* Card */}
              <div
                className={`relative p-8 rounded-2xl border-2 backdrop-blur-sm ${
                  currentLog.type === "success"
                    ? isDark
                      ? "bg-green-500/10 border-green-500/30"
                      : "bg-green-50 border-green-300"
                    : currentLog.type === "error"
                      ? isDark
                        ? "bg-red-500/10 border-red-500/30"
                        : "bg-red-50 border-red-300"
                      : isDark
                        ? "bg-blue-500/10 border-blue-500/30"
                        : "bg-blue-50 border-blue-300"
                }`}
              >
                <div className="flex flex-col items-center text-center">
                  {/* Icon */}
                  <div className="mb-6">
                    {currentLog.type === "success" ? (
                      <div
                        className={`w-16 h-16 rounded-full flex items-center justify-center ${
                          isDark ? "bg-green-500/20" : "bg-green-200"
                        }`}
                        style={{
                          animation: "scale-bounce 0.5s ease-out",
                        }}
                      >
                        <svg
                          className={`w-8 h-8 ${
                            isDark ? "text-green-400" : "text-green-600"
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    ) : currentLog.type === "error" ? (
                      <div
                        className={`w-16 h-16 rounded-full flex items-center justify-center ${
                          isDark ? "bg-red-500/20" : "bg-red-200"
                        }`}
                        style={{
                          animation: "shake 0.5s ease-out",
                        }}
                      >
                        <svg
                          className={`w-8 h-8 ${
                            isDark ? "text-red-400" : "text-red-600"
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </div>
                    ) : (
                      <div
                        className={`w-16 h-16 rounded-full flex items-center justify-center ${
                          isDark ? "bg-blue-500/20" : "bg-blue-200"
                        }`}
                        style={{
                          animation: "spin-once 0.6s ease-out",
                        }}
                      >
                        <svg
                          className={`w-8 h-8 ${
                            isDark ? "text-blue-400" : "text-blue-600"
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Text */}
                  <p
                    className={`text-xl font-medium ${
                      currentLog.type === "success"
                        ? isDark
                          ? "text-green-300"
                          : "text-green-700"
                        : currentLog.type === "error"
                          ? isDark
                            ? "text-red-300"
                            : "text-red-700"
                          : isDark
                            ? "text-blue-200"
                            : "text-blue-700"
                    }`}
                  >
                    {currentLog.text}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            // Loading state
            <div className="w-full text-center">
              <div
                className={`inline-flex items-center gap-3 px-6 py-4 rounded-2xl ${
                  isDark
                    ? "bg-gray-800/50 border-gray-700/50"
                    : "bg-gray-100 border-gray-200"
                } border-2`}
              >
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={`loading-dot-${i}`}
                      className={`w-2 h-2 rounded-full ${
                        isDark ? "bg-gray-600" : "bg-gray-400"
                      }`}
                      style={{
                        animation: "bounce-dot 1.4s ease-in-out infinite",
                        animationDelay: `${i * 0.2}s`,
                      }}
                    />
                  ))}
                </div>
                <span
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Connecting...
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Queue indicator */}
        {queuedLogs.length > 0 && (
          <div className="text-center mt-12">
            <p
              className={`text-sm ${
                isDark ? "text-gray-500" : "text-gray-400"
              }`}
            >
              {queuedLogs.length} more step{queuedLogs.length !== 1 ? "s" : ""}{" "}
              in queue
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes flash-fade-in {
          0% {
            opacity: 0;
            transform: scale(0.9);
          }
          30% {
            opacity: 1;
            transform: scale(1.05);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes pulse-glow {
          0%, 100% {
            opacity: 0.3;
            transform: scale(0.95);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.05);
          }
        }

        @keyframes scale-bounce {
          0% {
            transform: scale(0);
          }
          60% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes spin-once {
          0% {
            transform: rotate(0deg) scale(0.8);
            opacity: 0;
          }
          100% {
            transform: rotate(360deg) scale(1);
            opacity: 1;
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-10px);
          }
          75% {
            transform: translateX(10px);
          }
        }

        @keyframes bounce-dot {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(20px, 20px);
          }
        }
      `}</style>
    </div>
  );
}
