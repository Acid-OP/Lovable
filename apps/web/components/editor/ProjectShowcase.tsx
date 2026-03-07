"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { ProjectShowcaseProps } from "@/lib/types/editor";
import {
  SHOWCASE_PROJECTS,
  SHOWCASE_INTERVAL_MS,
} from "@/lib/constants/editor";

export function ProjectShowcase({ isDark }: ProjectShowcaseProps) {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIdx((cur) => (cur + 1) % SHOWCASE_PROJECTS.length);
    }, SHOWCASE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  const project = SHOWCASE_PROJECTS[activeIdx]!;

  return (
    <div className="flex items-center w-full px-5" style={{ maxWidth: 640 }}>
      {/* Left — vertical progress loader line */}
      <div
        className={`w-[2px] rounded-full mr-3 overflow-hidden self-center ${
          isDark ? "bg-[#333]" : "bg-[#ddd]"
        }`}
        style={{ height: 56 }}
      >
        <div
          key={activeIdx}
          className={`w-full rounded-full ${isDark ? "bg-white/40" : "bg-black/25"}`}
          style={{
            animation: `progressFill ${SHOWCASE_INTERVAL_MS / 1000}s linear both`,
          }}
        />
      </div>

      {/* Card */}
      <a
        key={project.name}
        href={project.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block flex-1 rounded-xl overflow-hidden shadow-lg"
        style={{ animation: "cardFadeIn 0.5s ease-out both" }}
      >
        {/* Screenshot image area */}
        <div className="relative w-full overflow-hidden rounded-t-xl">
          {project.image ? (
            <Image
              src={project.image}
              alt={project.name}
              width={640}
              height={360}
              className="w-full block object-cover object-top"
            />
          ) : (
            <div
              className={`w-full ${isDark ? "bg-[#2A2A2A]" : "bg-gray-100"} flex flex-col`}
              style={{ height: 280 }}
            >
              <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-gray-200/10">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
                <div className="ml-3 flex-1 h-4 rounded bg-white/10" />
              </div>
              <div className="flex-1 p-4 space-y-3">
                <div className="h-3.5 rounded bg-white/10 w-1/2" />
                <div className="h-2.5 rounded bg-white/5 w-full" />
                <div className="h-2.5 rounded bg-white/5 w-4/5" />
                <div className="flex gap-2 mt-4">
                  <div className="h-16 flex-1 rounded-lg bg-white/8" />
                  <div className="h-16 flex-1 rounded-lg bg-white/5" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Title + description */}
        <div
          className={`px-5 pt-4 pb-5 ${isDark ? "bg-[#262626]" : "bg-white"}`}
        >
          <h3
            className={`text-[17px] font-semibold tracking-tight mb-1.5 ${isDark ? "text-white" : "text-gray-900"}`}
          >
            {project.name}
          </h3>
          <p
            className={`text-[13px] leading-relaxed ${isDark ? "text-[#888]" : "text-gray-500"}`}
          >
            {project.description}
          </p>
        </div>
      </a>

      {/* Right — card indicator dots */}
      <div className="flex flex-col items-center gap-2 ml-3 self-center">
        {SHOWCASE_PROJECTS.map((p, i) => (
          <button
            key={p.name}
            onClick={() => setActiveIdx(i)}
            className={`w-[6px] h-[6px] rounded-full transition-all duration-500 cursor-pointer ${
              i === activeIdx
                ? isDark
                  ? "bg-white/60"
                  : "bg-black/40"
                : isDark
                  ? "bg-white/15"
                  : "bg-black/10"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
