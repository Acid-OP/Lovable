"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Claude, OpenAI, Gemini, Perplexity } from "@lobehub/icons";
import { TransitionLoader } from "@/components/editor/TransitionLoader";

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
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-[#e8e8e4] text-[12px] sm:text-[13px] text-[#777] tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          build apps 10x faster with AI
        </span>
      </div>

      <h1 className="font-[family-name:var(--font-heading)] text-[40px] sm:text-[56px] lg:text-[72px] font-normal text-[#1a1a1a] leading-[1.1] tracking-[-0.02em] mb-6">
        You describe it.
        <br />
        AI builds it.
      </h1>

      <div className="flex flex-wrap items-center justify-center gap-0.5 sm:gap-1 mb-1">
        <span className="text-[13px] text-[#888]">Understand how</span>
        {models.map((model) => (
          <span
            key={model.key}
            className={`inline-flex items-center gap-1.5 ${model.name ? "px-2.5" : "px-2"} py-1 h-7 rounded-md border border-[#e5e5e3] bg-white text-[12px] font-semibold text-[#222] shadow-[0_1px_2px_rgba(0,0,0,0.04)]`}
          >
            <span className="w-4 h-4 flex items-center justify-center shrink-0">
              {model.icon}
            </span>
            {model.name}
          </span>
        ))}
        <span className="text-[13px] text-[#888]">build your vision</span>
      </div>

      <p className="text-[13px] sm:text-[14px] text-[#999] leading-relaxed font-normal mb-10">
        Real code, real design, real apps shipped from a single prompt
      </p>

      <div className="flex items-center justify-center gap-3">
        <button
          onClick={handleGetStarted}
          className="px-6 py-2.5 bg-[#2d2d2d] text-white text-[13px] font-medium rounded-md hover:bg-[#222] transition-colors duration-200 cursor-pointer text-center"
        >
          Get Started →
        </button>
        <button className="px-6 py-2.5 bg-white text-[#2d2d2d] text-[13px] font-medium rounded-md border border-[#e5e5e3] hover:border-[#ccc] transition-colors duration-200 cursor-pointer">
          View Demo
        </button>
      </div>
    </div>
  );
}
