import Link from "next/link";
import { Claude, OpenAI, Gemini, Perplexity } from "@lobehub/icons";

const models = [
  {
    key: "openai",
    name: null,
    icon: <OpenAI size={14} />,
  },
  {
    key: "claude",
    name: "Claude",
    icon: <Claude.Color size={14} />,
  },
  {
    key: "perplexity",
    name: "Perplexity",
    icon: <Perplexity.Color size={14} />,
  },
  {
    key: "gemini",
    name: null,
    icon: <Gemini.Color size={14} />,
  },
];

export function HeroContent() {
  return (
    <div className="relative text-center max-w-[800px] mx-auto">
      <div className="flex justify-center mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-[#e8e8e4] text-[12px] sm:text-[13px] text-[#777] tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          now powering 10,000+ apps with the latest AI models
        </span>
      </div>

      <h1 className="font-[family-name:var(--font-heading)] text-[40px] sm:text-[56px] lg:text-[72px] font-normal text-[#1a1a1a] leading-[1.1] tracking-[-0.02em] mb-6">
        You describe it.
        <br />
        AI builds it.
      </h1>

      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mb-4">
        <span className="text-[13px] text-[#888]">Understand how</span>
        {models.map((model) => (
          <span
            key={model.key}
            className={`inline-flex items-center gap-1.5 ${model.name ? "px-2.5" : "px-2"} py-1 rounded-md border border-[#e5e5e3] bg-white text-[12px] font-semibold text-[#222] shadow-[0_1px_2px_rgba(0,0,0,0.04)]`}
          >
            {model.icon}
            {model.name}
          </span>
        ))}
        <span className="text-[13px] text-[#888]">build your vision</span>
      </div>

      <p className="text-[13px] sm:text-[14px] text-[#999] leading-relaxed font-normal mb-10">
        Real code, real design, real apps shipped from a single prompt
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/editor"
          className="w-full sm:w-auto px-7 py-2.5 bg-[#1a1a1a] text-white text-[14px] font-medium rounded-lg hover:bg-black transition-colors duration-200 cursor-pointer text-center"
        >
          Get Started
        </Link>
        <button className="w-full sm:w-auto px-7 py-2.5 bg-white text-[#1a1a1a] text-[14px] font-medium rounded-lg border border-[#e5e5e3] hover:border-[#ccc] transition-colors duration-200 cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          View Demo
        </button>
      </div>
    </div>
  );
}
