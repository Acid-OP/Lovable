"use client";

import { useEffect, useRef, useState } from "react";
import type { SSEMessage } from "@/lib/hooks/useSSEStream";

// Module-level counter for star rotation (0-7)
let nextStarIndex = 0;

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
  starIndex: number; // Pre-assigned star position
}

export function SessionLogsViewer({
  messages,
  isDark = false,
  onComplete,
}: SessionLogsViewerProps) {
  const [allLogs, setAllLogs] = useState<DisplayLog[]>([]);
  const [activeLogIndex, setActiveLogIndex] = useState(0);

  const lastProcessedIndexRef = useRef(0);
  const seenLogsRef = useRef<Set<string>>(new Set());
  const streamCompleteRef = useRef(false);
  const allLogsRef = useRef<DisplayLog[]>([]);

  // Process new messages and assign star positions immediately
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

        const starIndex = nextStarIndex;
        nextStarIndex = (nextStarIndex + 1) % 8;

        const log: DisplayLog = {
          id: crypto.randomUUID(),
          text,
          type: getLogType(msg),
          timestamp: Date.now(),
          starIndex,
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
        setAllLogs((prev) => {
          const updated = [...prev, ...uniqueNewLogs];
          allLogsRef.current = updated;
          return updated;
        });
      }
    }

    lastProcessedIndexRef.current = messages.length;
  }, [messages]);

  // Auto-advance through logs every 2.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveLogIndex((currentIndex) => {
        const nextIndex = currentIndex + 1;

        if (nextIndex < allLogsRef.current.length) {
          return nextIndex;
        }

        if (streamCompleteRef.current && onComplete) {
          setTimeout(() => onComplete(), 100);
        }

        return currentIndex;
      });
    }, 2500);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatMessage = (msg: SSEMessage): string | null => {
    if (msg.status === "connected") {
      return null;
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

  // Pulled nodes inward so log labels don't overflow off-screen
  const nodePositions = [
    { x: 25, y: 18, size: 0.85 },
    { x: 72, y: 18, size: 1.0 },
    { x: 18, y: 48, size: 0.8 },
    { x: 82, y: 48, size: 0.9 },
    { x: 30, y: 78, size: 0.95 },
    { x: 70, y: 80, size: 0.85 },
    { x: 50, y: 10, size: 1.05 },
    { x: 50, y: 88, size: 0.75 },
  ];

  const stars = [
    { offset: -400, size: 2, duration: 4, delay: 0 },
    { offset: -300, size: 3, duration: 5, delay: 0.8 },
    { offset: -200, size: 1.5, duration: 6, delay: 1.6 },
    { offset: -100, size: 2.5, duration: 4.5, delay: 2.4 },
    { offset: 0, size: 3, duration: 5.5, delay: 3.2 },
    { offset: 100, size: 2, duration: 5, delay: 4 },
    { offset: 200, size: 1.5, duration: 6, delay: 4.8 },
    { offset: 300, size: 2.5, duration: 4.5, delay: 5.6 },
    { offset: 400, size: 3, duration: 5, delay: 6.4 },
  ];

  return (
    <div
      className={`h-full flex flex-col ${
        isDark ? "bg-[#1e1e1e]" : "bg-white"
      } px-4 sm:px-6 md:px-8 relative overflow-hidden`}
    >
      {stars.map((star, i) => (
        <div
          key={`star-${i}`}
          className="absolute"
          style={{
            left: `calc(50% + ${star.offset}px)`,
            top: "-20px",
            width: `${star.size}px`,
            height: `${star.size}px`,
            borderRadius: "50%",
            backgroundColor: isDark ? "#666" : "#999",
            animation: `starFall ${star.duration}s ease-in infinite`,
            animationDelay: `${star.delay}s`,
            boxShadow: isDark
              ? `0 0 ${star.size * 2}px ${star.size / 2}px rgba(102, 102, 102, 0.3)`
              : `0 0 ${star.size * 2}px ${star.size / 2}px rgba(153, 153, 153, 0.3)`,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
      ))}

      {/* Title pinned at top, aligned with first chat message */}
      <div className="relative z-10 w-full max-w-2xl mx-auto pt-4">
        <div className="text-center mb-2 sm:mb-3 md:mb-4">
          <h2
            className={`text-2xl sm:text-3xl md:text-4xl font-medium mb-2 sm:mb-3 ${
              isDark ? "text-white" : "text-black"
            }`}
          >
            Building your application
          </h2>
          <p
            className={`text-sm sm:text-base ${
              isDark ? "text-gray-500" : "text-gray-600"
            }`}
          >
            {allLogs.length > 0 ? "Processing..." : "Initializing..."}
          </p>
        </div>
      </div>

      {/* Cosmic visualization pushed down to fill remaining space */}
      <div className="flex-1 flex items-center justify-center relative z-10">
        <div className="w-full max-w-2xl">
          <div className="relative w-full flex flex-col items-center px-4 overflow-visible">
            <div className="relative w-full max-w-[550px] h-[280px] sm:h-[320px] md:h-[360px] flex items-center justify-center mx-auto px-4">
              <svg
                className="absolute inset-0 w-full h-full"
                style={{ zIndex: 0 }}
              >
                {nodePositions.map((node, i) => {
                  const currentLog = allLogs[activeLogIndex];
                  const isActive = currentLog && i === currentLog.starIndex;

                  const dx = node.x - 50;
                  const dy = node.y - 50;
                  const angle = Math.atan2(dy, dx);

                  const startOffset = 3;
                  const x1 = 50 + startOffset * Math.cos(angle);
                  const y1 = 50 + startOffset * Math.sin(angle);

                  // Adjust end offset based on node size
                  const baseOffset = isActive ? 5.5 : 4;
                  const endOffset = baseOffset * (node.size || 1);
                  const x2 = node.x - endOffset * Math.cos(angle);
                  const y2 = node.y - endOffset * Math.sin(angle);

                  return (
                    <line
                      key={i}
                      x1={`${x1}%`}
                      y1={`${y1}%`}
                      x2={`${x2}%`}
                      y2={`${y2}%`}
                      stroke={
                        isActive
                          ? isDark
                            ? "rgba(205, 92, 92, 0.5)"
                            : "rgba(193, 68, 14, 0.4)"
                          : isDark
                            ? "rgba(255, 255, 255, 0.15)"
                            : "rgba(0, 0, 0, 0.15)"
                      }
                      strokeWidth={isActive ? "6" : "4"}
                      style={{
                        animation: `fadeIn 0.8s ease-out ${i * 0.1}s backwards`,
                        transition: "stroke 0.3s ease, stroke-width 0.3s ease",
                      }}
                    />
                  );
                })}
              </svg>

              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ zIndex: 10 }}
              >
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16">
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background:
                        "radial-gradient(circle, rgba(205, 92, 92, 0.8) 0%, rgba(193, 68, 14, 0.4) 50%, transparent 70%)",
                      filter: "blur(14px)",
                      animation: "pulse 2s ease-in-out infinite",
                    }}
                  />
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background:
                        "radial-gradient(circle, #E27B58 0%, #CD5C5C 50%, #C1440E 100%)",
                      boxShadow:
                        "0 0 35px rgba(205, 92, 92, 0.9), 0 0 70px rgba(193, 68, 14, 0.5), inset 0 0 18px rgba(255, 200, 180, 0.3)",
                    }}
                  />
                </div>
              </div>

              {nodePositions.map((node, i) => {
                const currentLog = allLogs[activeLogIndex];
                const isActive = currentLog && i === currentLog.starIndex;

                const truncatedText = currentLog?.text
                  ? currentLog.text.length > 35
                    ? currentLog.text.substring(0, 35) + "..."
                    : currentLog.text
                  : "";

                return (
                  <div
                    key={i}
                    className="absolute flex items-center gap-2"
                    style={{
                      left: `${node.x}%`,
                      top: `${node.y}%`,
                      transform: "translate(-50%, -50%)",
                      zIndex: isActive ? 20 : 5,
                    }}
                  >
                    <div
                      className={`relative rounded-full transition-all duration-500 ${
                        isActive
                          ? "w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14"
                          : "w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12"
                      }`}
                      style={{
                        transform: `scale(${node.size || 1})`,
                        background: isActive
                          ? isDark
                            ? "radial-gradient(circle, #ffffff 0%, #e5e5e5 70%, #d1d1d1 100%)"
                            : "radial-gradient(circle, #4a4a4a 0%, #2d2d2d 70%, #1a1a1a 100%)"
                          : isDark
                            ? "radial-gradient(circle, #e5e5e5 0%, #d1d1d1 70%, #b8b8b8 100%)"
                            : "radial-gradient(circle, #5a5a5a 0%, #3d3d3d 70%, #252525 100%)",
                        boxShadow: isActive
                          ? isDark
                            ? "0 0 25px rgba(255, 255, 255, 0.8), 0 0 40px rgba(255, 255, 255, 0.5), inset 0 0 10px rgba(0, 0, 0, 0.2)"
                            : "0 0 25px rgba(74, 74, 74, 0.8), 0 0 40px rgba(45, 45, 45, 0.5), inset 0 0 10px rgba(255, 255, 255, 0.2)"
                          : isDark
                            ? "0 0 15px rgba(229, 229, 229, 0.5), inset 0 0 5px rgba(0, 0, 0, 0.2)"
                            : "0 0 15px rgba(90, 90, 90, 0.4), inset 0 0 5px rgba(255, 255, 255, 0.2)",
                        animation: isActive
                          ? "pulse 2s ease-in-out infinite"
                          : `fadeIn 0.8s ease-out ${i * 0.1}s backwards`,
                      }}
                    />

                    {isActive && (
                      <div
                        className={`absolute text-sm sm:text-base font-medium px-3 py-2 rounded-lg ${
                          isDark
                            ? "bg-[#2d2d30]/95 text-white border border-[#3d3d3d]"
                            : "bg-white/90 text-black border border-gray-300"
                        }`}
                        style={{
                          ...(node.y < 30
                            ? {
                                bottom: "100%",
                                marginBottom: "10px",
                                left: "50%",
                                transform: "translateX(-50%)",
                                whiteSpace: "nowrap",
                                maxWidth: "min(300px, 80vw)",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }
                            : node.y > 70
                              ? {
                                  top: "100%",
                                  marginTop: "10px",
                                  left: "50%",
                                  transform: "translateX(-50%)",
                                  whiteSpace: "nowrap",
                                  maxWidth: "min(300px, 80vw)",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }
                              : node.x < 40
                                ? {
                                    right: "calc(100% + 10px)",
                                    whiteSpace: "nowrap",
                                    maxWidth: "min(250px, 40vw)",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }
                                : {
                                    left: "calc(100% + 10px)",
                                    whiteSpace: "nowrap",
                                    maxWidth: "min(250px, 40vw)",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }),
                          animation: "fadeIn 0.3s ease-out",
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                        }}
                      >
                        {truncatedText}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
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
            transform: translate(0, 0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translate(180px, 500px);
            opacity: 0;
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  );
}
