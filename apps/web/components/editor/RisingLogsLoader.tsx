"use client";

import { useEffect, useRef, useState } from "react";
import type { RisingLogsLoaderProps } from "@/lib/types/editor";
import { ProjectShowcase } from "./ProjectShowcase";

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
  "Refining code quality",
  "Resolving dependencies",
  "Optimizing component tree",
  "Running additional checks",
  "Validating build output",
  "Fine-tuning performance",
  "Polishing final output",
  "Almost there",
];

const ALL_STEPS = [...PRIMARY_STEPS, ...EXTENDED_STEPS];
const LAST_PRIMARY = PRIMARY_STEPS.length - 1;

// ~60s for a normal build: 16 steps × 3.5s = 56s
const NORMAL_PACE = 3500;
// Cache hits: don't reveal speed, enforce minimum ~50s display
const MIN_TIME_MS = 50000;
const MIN_STEPS = 14;

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

  const isExtending = messages.some((m) => m.buildExtending === "true");

  // Single adaptive timer
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const getPace = (): number => {
      if (!streamDone) return NORMAL_PACE;

      const elapsed = Date.now() - mountTime.current;

      // Stream done but we haven't shown enough yet — gentle pace
      if (elapsed < MIN_TIME_MS || activeIndex < MIN_STEPS - 1) {
        return NORMAL_PACE;
      }

      // Past minimums — rush to finish
      return 300;
    };

    const tick = () => {
      setActiveIndex((cur) => {
        const next = cur + 1;
        if (next >= ALL_STEPS.length) return cur;
        return next;
      });
    };

    const schedule = () => {
      timer = setTimeout(() => {
        tick();
        schedule();
      }, getPace());
    };

    schedule();
    return () => clearTimeout(timer);
  }, [streamDone, activeIndex]);

  // When build is extending (errors/retries), bump into extended steps faster
  useEffect(() => {
    if (!isExtending) return;
    if (activeIndex >= LAST_PRIMARY) return;

    // Jump ahead to ensure we have runway for the extended phase
    const target = Math.max(activeIndex, LAST_PRIMARY - 2);
    if (target > activeIndex) {
      setActiveIndex(target);
    }
  }, [isExtending, activeIndex]);

  // Fire onComplete when all conditions met
  useEffect(() => {
    if (completeFired.current || !streamDone) return;

    const elapsed = Date.now() - mountTime.current;
    if (activeIndex < MIN_STEPS - 1) return;
    if (elapsed < MIN_TIME_MS) return;
    if (activeIndex < LAST_PRIMARY) return;

    completeFired.current = true;
    setTimeout(() => onCompleteRef.current?.(), 600);
  }, [activeIndex, streamDone]);

  return (
    <div
      className={`h-full flex flex-col items-center relative overflow-hidden select-none ${
        isDark ? "bg-[#1A1A1A]" : "bg-[#f5f5f0]"
      }`}
    >
      {/* Getting ready spinner */}
      <div className="flex items-center gap-2 pt-6 pb-2">
        <svg
          className={`w-4 h-4 ${isDark ? "text-neutral-500" : "text-gray-400"}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          style={{ animation: "spin 2s linear infinite" }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span
          className={`text-[13px] ${isDark ? "text-neutral-500" : "text-gray-400"}`}
        >
          Getting ready...
        </span>
      </div>

      {/* Centered showcase card */}
      <div className="flex-1 flex items-center justify-center w-full">
        <ProjectShowcase isDark={isDark} />
      </div>

      <style>{`
        @keyframes cardFadeIn {
          0% { opacity: 0; transform: translateY(10px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes progressFill {
          0% { height: 0%; }
          100% { height: 100%; }
        }
      `}</style>
    </div>
  );
}
