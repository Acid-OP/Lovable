"use client";

import { useEffect, useRef, useState } from "react";
import type { SSEMessage } from "@/lib/hooks/useSSEStream";

interface AnimatedLogsProps {
  messages: SSEMessage[];
  isDark?: boolean;
}

export function AnimatedLogs({ messages, isDark = false }: AnimatedLogsProps) {
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastProcessedIndexRef = useRef(0);

  useEffect(() => {
    // Process new messages
    if (messages.length > lastProcessedIndexRef.current) {
      const newMessages = messages.slice(lastProcessedIndexRef.current);

      newMessages.forEach((msg, index) => {
        setTimeout(() => {
          const logLine = formatMessage(msg);
          if (logLine) {
            setDisplayedLines((prev) => [...prev, logLine]);

            // Auto-scroll to bottom
            setTimeout(() => {
              if (containerRef.current) {
                containerRef.current.scrollTop =
                  containerRef.current.scrollHeight;
              }
            }, 50);
          }
        }, index * 150); // Stagger animation
      });

      lastProcessedIndexRef.current = messages.length;
    }
  }, [messages]);

  const formatMessage = (msg: SSEMessage): string | null => {
    if (msg.status === "connected") {
      return `✓ Connected to session ${msg.jobId}`;
    }

    if (msg.type === "log" && msg.content) {
      return `  ${msg.content}`;
    }

    if (msg.type === "status" && msg.step) {
      return `→ ${msg.step}`;
    }

    if (msg.currentStep) {
      return `→ ${msg.currentStep}`;
    }

    if (msg.message) {
      return `  ${msg.message}`;
    }

    if (msg.type === "error") {
      return `✗ Error: ${msg.content || "Unknown error"}`;
    }

    if (msg.type === "complete") {
      return `✓ Generation complete!`;
    }

    return null;
  };

  return (
    <div
      ref={containerRef}
      className={`h-full overflow-y-auto p-6 font-mono text-sm ${
        isDark ? "bg-[#1e1e1e] text-gray-300" : "bg-white text-gray-800"
      }`}
    >
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <span
          className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}
        >
          Session Manager Logs
        </span>
      </div>

      {/* Logs */}
      <div className="space-y-2">
        {displayedLines.map((line, index) => (
          <div
            key={index}
            className="animate-fade-in"
            style={{
              animationDelay: `${index * 50}ms`,
            }}
          >
            <div className="flex items-start gap-2">
              {/* Line number */}
              <span
                className={`select-none ${isDark ? "text-gray-600" : "text-gray-400"} w-8 text-right flex-shrink-0`}
              >
                {index + 1}
              </span>

              {/* Log content */}
              <span
                className={`flex-1 ${
                  line.startsWith("✓")
                    ? "text-green-500 font-semibold"
                    : line.startsWith("✗")
                      ? "text-red-500 font-semibold"
                      : line.startsWith("→")
                        ? isDark
                          ? "text-blue-400"
                          : "text-blue-600"
                        : ""
                }`}
              >
                {line}
              </span>
            </div>
          </div>
        ))}

        {/* Cursor/Loading indicator */}
        {displayedLines.length > 0 && (
          <div className="flex items-center gap-2 mt-4">
            <div
              className={`w-2 h-4 ${isDark ? "bg-white" : "bg-black"} animate-pulse`}
            />
            <span
              className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}
            >
              Processing...
            </span>
          </div>
        )}
      </div>

      {/* Empty state */}
      {displayedLines.length === 0 && (
        <div
          className={`flex flex-col items-center justify-center h-64 ${isDark ? "text-gray-600" : "text-gray-400"}`}
        >
          <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin mb-4" />
          <p>Waiting for session to start...</p>
        </div>
      )}
    </div>
  );
}
