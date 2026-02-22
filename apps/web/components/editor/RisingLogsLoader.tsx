"use client";

import { useEffect, useRef, useState } from "react";
import type { RisingLogsLoaderProps } from "@/lib/types/editor";

const PRIMARY_STEPS = [
  "Initializing workspace",
  "Analyzing your prompt",
  "Planning project structure",
  "Setting up dependencies",
  "Configuring TypeScript",
  "Creating component architecture",
  "Generating UI components",
  "Setting up routing",
  "Wiring up state management",
  "Writing styles and layouts",
  "Creating page templates",
  "Connecting API layer",
  "Optimizing bundle size",
  "Running type checks",
  "Building for production",
  "Preparing deployment",
];

const EXTENDED_STEPS = [
  "Running additional checks",
  "Verifying build output",
  "Optimizing asset delivery",
  "Validating component tree",
  "Checking for runtime errors",
  "Refining code quality",
  "Polishing final output",
  "Almost there",
];

const ALL_STEPS = [...PRIMARY_STEPS, ...EXTENDED_STEPS];
const LAST_PRIMARY = PRIMARY_STEPS.length - 1;
const MIN_STEPS = 6;
const MIN_TIME_MS = 8000;

export function RisingLogsLoader({
  messages,
  isDark = false,
  onComplete,
}: RisingLogsLoaderProps) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const mountTime = useRef(Date.now());
  const completeFired = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const streamDone = messages.some(
    (m) =>
      m.type === "complete" ||
      m.status === "complete" ||
      m.status === "completed",
  );

  useEffect(() => {
    const tick = () => {
      setActiveIndex((cur) => {
        const next = cur + 1;
        if (next >= ALL_STEPS.length) return cur;
        return next;
      });
    };

    const getPace = (): number => {
      if (!streamDone) return 1800;
      const elapsed = Date.now() - mountTime.current;
      if (elapsed < MIN_TIME_MS) return 600;
      return 280;
    };

    let timer: ReturnType<typeof setTimeout>;

    const schedule = () => {
      timer = setTimeout(() => {
        tick();
        schedule();
      }, getPace());
    };

    schedule();
    return () => clearTimeout(timer);
  }, [streamDone]);

  // Fire onComplete when conditions are met
  useEffect(() => {
    if (completeFired.current) return;
    if (!streamDone) return;

    const elapsed = Date.now() - mountTime.current;
    if (activeIndex < MIN_STEPS - 1) return;
    if (elapsed < MIN_TIME_MS) return;
    if (activeIndex < LAST_PRIMARY) return;

    completeFired.current = true;
    setTimeout(() => onCompleteRef.current?.(), 500);
  }, [activeIndex, streamDone]);

  const WINDOW = 5;
  const clamped = Math.max(0, activeIndex);
  const start = Math.max(0, clamped - WINDOW + 1);
  const visible = activeIndex >= 0 ? ALL_STEPS.slice(start, clamped + 1) : [];

  const displayTotal = streamDone ? PRIMARY_STEPS.length : ALL_STEPS.length;
  const progress = Math.min(
    streamDone && activeIndex >= LAST_PRIMARY ? 100 : 95,
    Math.round(((activeIndex + 1) / displayTotal) * 100),
  );

  return (
    <div
      className={`h-full flex flex-col items-center relative overflow-hidden select-none ${
        isDark ? "bg-[#1e1e1e]" : "bg-[#f5f5f0]"
      }`}
    >
      <div className="text-center pt-[6%]">
        <h2
          className={`text-[24px] sm:text-[28px] font-semibold tracking-tight ${
            isDark ? "text-white" : "text-[#1a1a1a]"
          }`}
        >
          Bringing your vision to life
        </h2>
        <div
          className={`flex items-center justify-center gap-2 mt-2.5 text-[13px] ${
            isDark ? "text-neutral-500" : "text-[#999]"
          }`}
        >
          <span className="tabular-nums">{Math.max(0, progress)}%</span>
          <span>·</span>
          <span>
            {activeIndex < 0
              ? "Initializing"
              : activeIndex >= PRIMARY_STEPS.length
                ? "Finishing up"
                : "Processing"}
            <span className="inline-flex gap-[1px] ml-0.5">
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
          </span>
        </div>
      </div>

      <div className="w-48 mt-6 mb-2">
        <div
          className={`h-[3px] rounded-full overflow-hidden ${
            isDark ? "bg-neutral-800" : "bg-[#e5e5e3]"
          }`}
        >
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out ${
              isDark ? "bg-white/40" : "bg-[#1a1a1a]/25"
            }`}
            style={{ width: `${Math.max(0, progress)}%` }}
          />
        </div>
      </div>

      <div className="flex-1 w-full max-w-md px-6 flex flex-col relative">
        <div
          className="absolute top-0 left-0 right-0 h-16 z-10 pointer-events-none"
          style={{
            background: isDark
              ? "linear-gradient(to bottom, #1e1e1e 30%, transparent)"
              : "linear-gradient(to bottom, #f5f5f0 30%, transparent)",
          }}
        />

        <div className="flex-1 flex flex-col gap-6 items-center justify-start pt-8 relative">
          {visible.map((step, idx) => {
            const dist = visible.length - 1 - idx;
            const isNewest = dist === 0;
            const opacity = 1 - dist * 0.22;
            const scale = 1 - dist * 0.015;

            return (
              <div
                key={`${start + idx}-${step}`}
                className="flex items-center gap-3 justify-center"
                style={{
                  opacity: Math.max(0.05, opacity),
                  transform: isNewest ? undefined : `scale(${scale})`,
                  animation: isNewest
                    ? "logEnter 0.8s cubic-bezier(0.33, 1, 0.68, 1) both"
                    : undefined,
                  transition: "opacity 1.2s ease, transform 1.2s ease",
                }}
              >
                <div className="flex-shrink-0">
                  {isNewest ? (
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isDark ? "bg-white" : "bg-[#1a1a1a]"
                      }`}
                      style={{ animation: "pulse 2s ease-in-out infinite" }}
                    />
                  ) : (
                    <svg
                      className={`w-3.5 h-3.5 ${
                        isDark ? "text-emerald-400/60" : "text-emerald-500/50"
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>

                <span
                  className={`text-[15px] font-medium ${
                    isNewest
                      ? isDark
                        ? "text-white"
                        : "text-[#1a1a1a]"
                      : isDark
                        ? "text-neutral-500"
                        : "text-[#aaa]"
                  }`}
                >
                  {step}
                </span>
              </div>
            );
          })}

          <div className="flex justify-center pt-2">
            <div className="relative h-[2px] w-24 overflow-hidden rounded-full">
              <div
                className={`absolute inset-0 rounded-full ${
                  isDark ? "bg-neutral-800" : "bg-[#e5e5e3]"
                }`}
              />
              <div
                className="absolute inset-y-0 w-10 rounded-full"
                style={{
                  background: isDark
                    ? "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)"
                    : "linear-gradient(90deg, transparent, rgba(0,0,0,0.15), transparent)",
                  animation: "shimmer 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                }}
              />
            </div>
          </div>
        </div>

        <div
          className="absolute bottom-0 left-0 right-0 h-16 z-10 pointer-events-none"
          style={{
            background: isDark
              ? "linear-gradient(to top, #1e1e1e 30%, transparent)"
              : "linear-gradient(to top, #f5f5f0 30%, transparent)",
          }}
        />
      </div>

      <style>{`
        @keyframes logEnter {
          0% { opacity: 0; transform: translateY(18px) scale(0.97); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes dotFade {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(350%); }
        }
      `}</style>
    </div>
  );
}
