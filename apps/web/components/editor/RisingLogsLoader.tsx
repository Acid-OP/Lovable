"use client";

import { useEffect, useRef, useState } from "react";
import type { SSEMessage, RisingLogsLoaderProps } from "@/lib/types/editor";

interface LogEntry {
  id: string;
  text: string;
  type: "info" | "success" | "error" | "step";
}

export function RisingLogsLoader({
  messages,
  isDark = false,
  onComplete,
}: RisingLogsLoaderProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  const lastProcessedRef = useRef(0);
  const seenRef = useRef<Set<string>>(new Set());
  const streamDoneRef = useRef(false);
  const logsRef = useRef<LogEntry[]>([]);

  const formatMessage = (msg: SSEMessage): string | null => {
    if (msg.status === "connected") return null;
    if (msg.currentStep) return msg.currentStep;
    if (msg.step) return msg.step;
    if (msg.content) return msg.content;
    if (msg.message) return msg.message;
    if (msg.type === "complete") return "Build completed successfully";
    if (msg.type === "error") return `Error: ${msg.content || "Unknown"}`;
    return null;
  };

  const getType = (msg: SSEMessage): LogEntry["type"] => {
    if (msg.type === "complete" || msg.status === "completed") return "success";
    if (msg.type === "error") return "error";
    if (msg.currentStep || msg.step) return "step";
    return "info";
  };

  useEffect(() => {
    if (messages.length <= lastProcessedRef.current) return;
    const batch = messages.slice(lastProcessedRef.current);

    if (batch.some((m) => m.type === "complete" || m.status === "completed")) {
      streamDoneRef.current = true;
    }

    const fresh: LogEntry[] = batch
      .map((m) => {
        const text = formatMessage(m);
        if (!text || seenRef.current.has(text)) return null;
        seenRef.current.add(text);
        return { id: crypto.randomUUID(), text, type: getType(m) };
      })
      .filter((l): l is LogEntry => l !== null);

    if (fresh.length > 0) {
      setLogs((prev) => {
        const next = [...prev, ...fresh];
        logsRef.current = next;
        return next;
      });
    }

    lastProcessedRef.current = messages.length;
  }, [messages]);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((cur) => {
        const next = cur + 1;
        if (next < logsRef.current.length) return next;
        if (streamDoneRef.current && onComplete) {
          setTimeout(() => onComplete(), 500);
        }
        return cur;
      });
    }, 2200);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const WINDOW = 5;
  const start = Math.max(0, activeIndex - WINDOW + 1);
  const visible = activeIndex >= 0 ? logs.slice(start, activeIndex + 1) : [];

  return (
    <div
      className={`h-full flex flex-col items-center relative overflow-hidden select-none ${
        isDark ? "bg-[#1e1e1e]" : "bg-white"
      }`}
    >
      {/* ── Title — pinned upper area ── */}
      <div className="text-center pt-[12%]">
        <h2
          className={`text-2xl font-semibold tracking-tight ${
            isDark ? "text-white" : "text-black"
          }`}
        >
          Building your application
        </h2>
        <p
          className={`text-sm mt-2 tracking-wide uppercase ${
            isDark ? "text-neutral-500" : "text-neutral-400"
          }`}
        >
          {activeIndex >= 0 ? "Processing" : "Initializing"}
        </p>
      </div>

      {/* ── Log feed — fixed-height zone, messages anchored to bottom ── */}
      <div className="flex-1 w-full max-w-lg px-6 flex flex-col relative">
        {/* Fade-out gradient at top of feed */}
        <div
          className="absolute top-0 left-0 right-0 h-16 z-10 pointer-events-none"
          style={{
            background: isDark
              ? "linear-gradient(to bottom, #1e1e1e 30%, transparent)"
              : "linear-gradient(to bottom, #ffffff 30%, transparent)",
          }}
        />

        {/* Messages centered vertically in the feed area */}
        <div className="flex-1 flex flex-col gap-6 items-center justify-center relative">
          {visible.map((log, idx) => {
            const distFromNewest = visible.length - 1 - idx;
            const opacity = 1 - distFromNewest * 0.18;
            const isNewest = distFromNewest === 0;

            return (
              <div
                key={log.id}
                className="flex items-center gap-3.5 justify-center will-change-[transform,opacity]"
                style={{
                  opacity: Math.max(0.1, opacity),
                  animation: isNewest
                    ? "logEnter 0.75s cubic-bezier(0.22, 1, 0.36, 1) both"
                    : undefined,
                  transition:
                    "opacity 1s cubic-bezier(0.4, 0, 0.2, 1), transform 1s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                {/* Status indicator */}
                <div className="flex-shrink-0">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      log.type === "success"
                        ? "bg-emerald-500"
                        : log.type === "error"
                          ? "bg-red-500"
                          : isDark
                            ? "bg-white"
                            : "bg-neutral-800"
                    }`}
                    style={{
                      boxShadow:
                        isNewest && log.type === "success"
                          ? "0 0 8px rgba(16,185,129,0.5)"
                          : isNewest && log.type === "error"
                            ? "0 0 8px rgba(239,68,68,0.5)"
                            : "none",
                    }}
                  />
                </div>
                {/* Log text */}
                <span
                  className={`text-[17px] leading-snug ${
                    log.type === "success"
                      ? "text-emerald-500"
                      : log.type === "error"
                        ? "text-red-400"
                        : isDark
                          ? "text-white"
                          : "text-neutral-700"
                  }`}
                >
                  {log.text}
                </span>
              </div>
            );
          })}

          {/* ── Animated shimmer bar — centered below messages ── */}
          <div className="flex justify-center pt-2">
            <div className="relative h-[2px] w-24 overflow-hidden rounded-full">
              <div
                className={`absolute inset-0 ${
                  isDark ? "bg-neutral-800" : "bg-neutral-200"
                }`}
              />
              <div
                className="absolute inset-y-0 w-10 rounded-full will-change-[left]"
                style={{
                  background: isDark
                    ? "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)"
                    : "linear-gradient(90deg, transparent, rgba(0,0,0,0.25), transparent)",
                  animation: "shimmer 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes logEnter {
          0% {
            opacity: 0;
            transform: translateY(18px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shimmer {
          0% {
            left: -40px;
          }
          100% {
            left: calc(100%);
          }
        }
      `}</style>
    </div>
  );
}
