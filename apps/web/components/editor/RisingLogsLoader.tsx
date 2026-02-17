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
      {/* ── Title ── */}
      <div className="text-center pt-[10%]">
        <h2
          className={`text-[26px] font-semibold tracking-tight ${
            isDark ? "text-white" : "text-black"
          }`}
        >
          Building your application
        </h2>
        <div
          className={`flex items-center justify-center gap-[3px] mt-3 text-[13px] tracking-wider uppercase ${
            isDark ? "text-neutral-500" : "text-neutral-400"
          }`}
        >
          <span>{activeIndex >= 0 ? "Processing" : "Initializing"}</span>
          <span className="flex gap-[2px]">
            <span style={{ animation: "dotFade 1.4s ease-in-out infinite" }}>
              .
            </span>
            <span
              style={{ animation: "dotFade 1.4s ease-in-out 0.2s infinite" }}
            >
              .
            </span>
            <span
              style={{ animation: "dotFade 1.4s ease-in-out 0.4s infinite" }}
            >
              .
            </span>
          </span>
        </div>
      </div>

      {/* Thin separator */}
      <div
        className={`w-10 h-px mt-6 ${
          isDark ? "bg-neutral-700" : "bg-neutral-200"
        }`}
      />

      {/* ── Log feed ── */}
      <div className="flex-1 w-full max-w-xl px-6 flex flex-col relative">
        {/* Top gradient mask */}
        <div
          className="absolute top-0 left-0 right-0 h-20 z-10 pointer-events-none"
          style={{
            background: isDark
              ? "linear-gradient(to bottom, #1e1e1e 25%, transparent)"
              : "linear-gradient(to bottom, #ffffff 25%, transparent)",
          }}
        />

        {/* Messages — vertically centered */}
        <div className="flex-1 flex flex-col gap-7 items-center justify-center relative">
          {visible.map((log, idx) => {
            const dist = visible.length - 1 - idx;
            const isNewest = dist === 0;
            const opacity = 1 - dist * 0.2;
            const scale = 1 - dist * 0.018;
            const lift = dist * 2;

            return (
              <div
                key={log.id}
                className="flex items-center gap-3.5 justify-center"
                style={{
                  opacity: Math.max(0.06, opacity),
                  transform: isNewest
                    ? undefined
                    : `translateY(-${lift}px) scale(${scale})`,
                  animation: isNewest
                    ? "logEnter 1s cubic-bezier(0.33, 1, 0.68, 1) both"
                    : undefined,
                  transition:
                    "opacity 1.4s cubic-bezier(0.25, 0.1, 0.25, 1), transform 1.4s cubic-bezier(0.25, 0.1, 0.25, 1)",
                  willChange: "transform, opacity",
                }}
              >
                {/* Status dot */}
                <div className="flex-shrink-0">
                  <div
                    className={`w-[10px] h-[10px] rounded-full ${
                      log.type === "success"
                        ? "bg-emerald-500"
                        : log.type === "error"
                          ? "bg-red-500"
                          : isDark
                            ? "bg-white"
                            : "bg-neutral-800"
                    }`}
                    style={{
                      boxShadow: isNewest
                        ? log.type === "success"
                          ? "0 0 10px rgba(16,185,129,0.5)"
                          : log.type === "error"
                            ? "0 0 10px rgba(239,68,68,0.5)"
                            : isDark
                              ? "0 0 10px rgba(255,255,255,0.15)"
                              : "0 0 10px rgba(0,0,0,0.08)"
                        : "none",
                      animation: isNewest
                        ? "dotGlow 2.5s ease-in-out infinite"
                        : undefined,
                    }}
                  />
                </div>

                {/* Log text */}
                <span
                  className={`text-[17px] leading-relaxed font-medium ${
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

          {/* Shimmer indicator */}
          <div className="flex justify-center pt-3">
            <div className="relative h-[2px] w-28 overflow-hidden rounded-full">
              <div
                className={`absolute inset-0 rounded-full ${
                  isDark ? "bg-neutral-800" : "bg-neutral-200"
                }`}
              />
              <div
                className="absolute inset-y-0 w-12 rounded-full"
                style={{
                  background: isDark
                    ? "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)"
                    : "linear-gradient(90deg, transparent, rgba(0,0,0,0.2), transparent)",
                  animation:
                    "shimmer 2.2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                  willChange: "transform",
                }}
              />
            </div>
          </div>
        </div>

        {/* Bottom gradient mask */}
        <div
          className="absolute bottom-0 left-0 right-0 h-16 z-10 pointer-events-none"
          style={{
            background: isDark
              ? "linear-gradient(to top, #1e1e1e 25%, transparent)"
              : "linear-gradient(to top, #ffffff 25%, transparent)",
          }}
        />
      </div>

      <style>{`
        @keyframes logEnter {
          0% {
            opacity: 0;
            transform: translateY(22px) scale(0.96);
          }
          40% {
            opacity: 0.6;
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes dotFade {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
        @keyframes dotGlow {
          0%, 100% { box-shadow: 0 0 0 0 transparent; }
          50% { box-shadow: 0 0 12px 3px ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.06)"}; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(350%); }
        }
      `}</style>
    </div>
  );
}
