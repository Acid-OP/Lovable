"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Claude, OpenAI, Gemini, Perplexity } from "@lobehub/icons";
import { TransitionLoader } from "@/components/editor/TransitionLoader";
import { useTheme } from "@/lib/providers/ThemeProvider";

const models = [
  {
    key: "openai",
    name: null,
    icon: <OpenAI size={16} />,
  },
  {
    key: "claude",
    name: "Claude",
    icon: <Claude.Color size={16} />,
  },
  {
    key: "perplexity",
    name: "Perplexity",
    icon: <Perplexity.Color size={16} />,
  },
  {
    key: "gemini",
    name: null,
    icon: <Gemini.Color size={16} />,
  },
];

export function HeroContent() {
  const { isDark } = useTheme();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const router = useRouter();

  const handleGetStarted = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      router.push("/editor");
    }, 2000);
  };

  return (
    <div className="relative text-center max-w-[800px] mx-auto">
      {isTransitioning && <TransitionLoader />}

      <div className="flex justify-center mb-6">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${isDark ? "bg-[#141414]/80 border-[#2a2a2a] text-[#888]" : "bg-white/80 border-[#e8e8e4] text-[#777]"} border text-[12px] sm:text-[13px] tracking-wide`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          build apps 10x faster with AI
        </span>
      </div>

      <h1
        className={`font-[family-name:var(--font-heading)] text-[40px] sm:text-[56px] lg:text-[72px] font-normal ${isDark ? "text-[#f0f0f0]" : "text-[#1a1a1a]"} leading-[1.1] tracking-[-0.02em] mb-6`}
      >
        You describe it.
        <br />
        AI builds it.
      </h1>

      <div className="flex flex-wrap items-center justify-center gap-0.5 sm:gap-1 mb-1">
        <span
          className={`text-[13px] ${isDark ? "text-[#777]" : "text-[#888]"}`}
        >
          Understand how
        </span>
        {models.map((model) => (
          <span
            key={model.key}
            className={`inline-flex items-center gap-1.5 ${model.name ? "px-2.5" : "px-2"} py-1 h-7 rounded-md border ${isDark ? "border-[#2a2a2a] bg-[#141414] text-[#e0e0e0] shadow-[0_1px_2px_rgba(255,255,255,0.04)]" : "border-[#e5e5e3] bg-white text-[#222] shadow-[0_1px_2px_rgba(0,0,0,0.04)]"} text-[12px] font-semibold`}
          >
            <span className="w-4 h-4 flex items-center justify-center shrink-0">
              {model.icon}
            </span>
            {model.name}
          </span>
        ))}
        <span
          className={`text-[13px] ${isDark ? "text-[#777]" : "text-[#888]"}`}
        >
          build your vision
        </span>
      </div>

      <p
        className={`text-[13px] sm:text-[14px] ${isDark ? "text-[#666]" : "text-[#999]"} leading-relaxed font-normal mb-10`}
      >
        Real code, real design, real apps shipped from a single prompt
      </p>

      <div className="flex items-center justify-center gap-3">
        <button
          onClick={handleGetStarted}
          className={`px-6 py-2.5 ${isDark ? "bg-[#f0f0f0] text-[#1a1a1a] hover:bg-[#ffffff]" : "bg-[#2d2d2d] text-white hover:bg-[#222]"} text-[13px] font-medium rounded-md transition-colors duration-200 cursor-pointer text-center`}
        >
          Get Started →
        </button>
        <button
          className={`px-6 py-2.5 ${isDark ? "bg-[#141414] text-[#e0e0e0] border-[#2a2a2a] hover:border-[#555]" : "bg-white text-[#2d2d2d] border-[#e5e5e3] hover:border-[#ccc]"} text-[13px] font-medium rounded-md border transition-colors duration-200 cursor-pointer`}
        >
          View Demo
        </button>
      </div>
    </div>
  );
}
