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
  const [displayedLogs, setDisplayedLogs] = useState<DisplayLog[]>([]);
  const [queuedLogs, setQueuedLogs] = useState<DisplayLog[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
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
      // Deduplicate based on text content to avoid double-processing
      // Check against ALL logs we've ever seen (using ref to persist across renders)
      const uniqueNewLogs = newLogs.filter((log) => {
        if (seenLogsRef.current.has(log.text)) {
          return false; // Already seen this log text
        }
        // Mark as seen
        seenLogsRef.current.add(log.text);
        return true;
      });

      if (uniqueNewLogs.length > 0) {
        setQueuedLogs((prev) => [...prev, ...uniqueNewLogs]);
      }
    }

    lastProcessedIndexRef.current = messages.length;
  }, [messages]);

  // Animate logs from queue to displayed (staggered)
  useEffect(() => {
    if (queuedLogs.length > 0 && !animationIntervalRef.current) {
      animationIntervalRef.current = setInterval(() => {
        setQueuedLogs((queue) => {
          if (queue.length === 0) {
            if (animationIntervalRef.current) {
              clearInterval(animationIntervalRef.current);
              animationIntervalRef.current = null;
            }
            return queue;
          }

          const nextLog = queue[0];
          const rest = queue.slice(1);
          if (nextLog) {
            setDisplayedLogs((prev) => [...prev, nextLog]);
          }

          // Auto-scroll to bottom
          setTimeout(() => {
            if (containerRef.current) {
              containerRef.current.scrollTop =
                containerRef.current.scrollHeight;
            }
          }, 50);

          return rest;
        });
      }, 150); // 150ms delay between each log
    }

    return () => {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
        animationIntervalRef.current = null;
      }
    };
  }, [queuedLogs.length]);

  const formatMessage = (msg: SSEMessage): string | null => {
    if (msg.status === "connected") {
      return `Session started: ${msg.jobId}`;
    }
    if (msg.currentStep) return msg.currentStep;
    if (msg.step) return msg.step;
    if (msg.content) return msg.content;
    if (msg.message) return msg.message;
    if (msg.type === "complete") return "✓ Session completed successfully";
    if (msg.type === "error") return `✗ Error: ${msg.content || "Unknown"}`;
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
      className={`h-full flex flex-col ${
        isDark ? "bg-[#0a0a0a]" : "bg-[#fafafa]"
      } relative overflow-hidden`}
    >
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              ${isDark ? "#fff" : "#000"} 2px,
              ${isDark ? "#fff" : "#000"} 3px
            )`,
            animation: "scanline 8s linear infinite",
          }}
        />
      </div>

      {/* Header */}
      <div
        className={`flex items-center justify-between px-6 py-4 border-b ${
          isDark ? "border-gray-800" : "border-gray-200"
        } relative z-10`}
      >
        <div className="flex items-center gap-3">
          {/* Animated status indicator */}
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={`header-bar-${i}`}
                className={`w-1.5 h-6 rounded-full ${
                  isDark ? "bg-blue-500" : "bg-blue-600"
                }`}
                style={{
                  animation: "pulse-bar 1.4s ease-in-out infinite",
                  animationDelay: `${i * 0.15}s`,
                }}
              />
            ))}
          </div>
          <div>
            <h3
              className={`text-sm font-medium ${
                isDark ? "text-gray-200" : "text-gray-900"
              }`}
            >
              Building Your Application
            </h3>
            <p
              className={`text-xs ${
                isDark ? "text-gray-500" : "text-gray-500"
              }`}
            >
              {displayedLogs.length} steps completed
            </p>
          </div>
        </div>

        {/* Processing indicator */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={`header-dot-${i}`}
                className={`w-1.5 h-1.5 rounded-full ${
                  isDark ? "bg-blue-400" : "bg-blue-500"
                }`}
                style={{
                  animation: "pulse-dot 1.4s ease-in-out infinite",
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
          <span
            className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            Processing...
          </span>
        </div>
      </div>

      {/* Logs container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-6 py-4 space-y-2 relative z-10"
      >
        {displayedLogs.map((log, index) => (
          <div
            key={`${log.id}-${index}`}
            className="log-entry"
            style={{
              animation: "slideInFromRight 0.3s ease-out",
            }}
          >
            <div
              className={`flex items-start gap-3 p-3 rounded-lg ${
                log.type === "success"
                  ? isDark
                    ? "bg-green-500/10 border border-green-500/20"
                    : "bg-green-50 border border-green-200"
                  : log.type === "error"
                    ? isDark
                      ? "bg-red-500/10 border border-red-500/20"
                      : "bg-red-50 border border-red-200"
                    : log.type === "step"
                      ? isDark
                        ? "bg-blue-500/10 border border-blue-500/20"
                        : "bg-blue-50 border border-blue-200"
                      : isDark
                        ? "bg-gray-800/50 border border-gray-700/50"
                        : "bg-white border border-gray-200"
              }`}
            >
              {/* Icon */}
              <div className="flex-shrink-0 mt-0.5">
                {log.type === "success" ? (
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      isDark ? "bg-green-500/20" : "bg-green-100"
                    }`}
                  >
                    <svg
                      className={`w-3 h-3 ${
                        isDark ? "text-green-400" : "text-green-600"
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
                  </div>
                ) : log.type === "error" ? (
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      isDark ? "bg-red-500/20" : "bg-red-100"
                    }`}
                  >
                    <svg
                      className={`w-3 h-3 ${
                        isDark ? "text-red-400" : "text-red-600"
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
                  </div>
                ) : log.type === "step" ? (
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      isDark ? "bg-blue-500/20" : "bg-blue-100"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isDark ? "bg-blue-400" : "bg-blue-600"
                      }`}
                      style={{
                        animation:
                          index === displayedLogs.length - 1
                            ? "ping 1s cubic-bezier(0, 0, 0.2, 1) infinite"
                            : "none",
                      }}
                    />
                  </div>
                ) : (
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      isDark ? "bg-gray-700" : "bg-gray-100"
                    }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        isDark ? "bg-gray-400" : "bg-gray-600"
                      }`}
                    />
                  </div>
                )}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-mono ${
                    log.type === "success"
                      ? isDark
                        ? "text-green-300"
                        : "text-green-700"
                      : log.type === "error"
                        ? isDark
                          ? "text-red-300"
                          : "text-red-700"
                        : log.type === "step"
                          ? isDark
                            ? "text-blue-200"
                            : "text-blue-700"
                          : isDark
                            ? "text-gray-300"
                            : "text-gray-700"
                  }`}
                >
                  {log.text}
                </p>
              </div>

              {/* Line number */}
              <div
                className={`text-xs font-mono ${
                  isDark ? "text-gray-600" : "text-gray-400"
                }`}
              >
                {(index + 1).toString().padStart(2, "0")}
              </div>
            </div>
          </div>
        ))}

        {/* Loading indicator when queue has items */}
        {queuedLogs.length > 0 && (
          <div className="flex items-center gap-2 p-3">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={`queue-dot-${i}`}
                  className={`w-1.5 h-1.5 rounded-full ${
                    isDark ? "bg-gray-600" : "bg-gray-400"
                  }`}
                  style={{
                    animation: "pulse-dot 1.4s ease-in-out infinite",
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </div>
            <span
              className={`text-xs ${
                isDark ? "text-gray-500" : "text-gray-500"
              }`}
            >
              {queuedLogs.length} more step{queuedLogs.length !== 1 ? "s" : ""}{" "}
              incoming...
            </span>
          </div>
        )}

        {/* Empty state */}
        {displayedLogs.length === 0 && queuedLogs.length === 0 && (
          <div
            className={`flex flex-col items-center justify-center h-64 ${
              isDark ? "text-gray-600" : "text-gray-400"
            }`}
          >
            <div className="flex gap-1 mb-4">
              {[0, 1, 2].map((i) => (
                <div
                  key={`empty-bar-${i}`}
                  className={`w-2 h-8 rounded-full ${
                    isDark ? "bg-gray-700" : "bg-gray-300"
                  }`}
                  style={{
                    animation: "pulse-bar 1.4s ease-in-out infinite",
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}
            </div>
            <p className="text-sm">Initializing session...</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes pulse-bar {
          0%,
          100% {
            transform: scaleY(0.5);
            opacity: 0.5;
          }
          50% {
            transform: scaleY(1);
            opacity: 1;
          }
        }

        @keyframes pulse-dot {
          0%,
          100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.2);
            opacity: 1;
          }
        }

        @keyframes scanline {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(100%);
          }
        }

        @keyframes ping {
          75%,
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
