"use client";

import { useRouter } from "next/navigation";
import { useTheme } from "@/lib/providers/ThemeProvider";

const defaultPrompt = "Build a portfolio website with dark mode";

export function CtaBanner() {
  const { isDark } = useTheme();
  const router = useRouter();

  const handleSubmit = () => {
    router.push(`/editor?prompt=${encodeURIComponent(defaultPrompt)}`);
  };

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      <div
        className={`max-w-5xl mx-auto rounded-2xl bg-[#1a1a1a] px-8 sm:px-12 py-14 sm:py-18 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 ${isDark ? "border border-[#2a2a2a]" : ""}`}
      >
        <div>
          <h2 className="font-[family-name:var(--font-heading)] text-[24px] sm:text-[30px] lg:text-[36px] font-normal text-white leading-[1.2] tracking-[-0.02em] mb-2">
            Your next app is one prompt away
          </h2>
          <p className="text-[13px] text-[#777]">
            Free to start · No credit card required
          </p>
        </div>

        <div className="flex-shrink-0 w-full lg:w-auto lg:min-w-[380px]">
          <div className="relative flex items-center bg-[#252525] rounded-xl border border-[#333]">
            <div className="flex-1 px-5 py-4 text-[14px] text-[#999] select-none truncate">
              {defaultPrompt}
            </div>
            <button
              onClick={handleSubmit}
              className="mr-2 w-8 h-8 bg-white text-[#1a1a1a] rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer flex-shrink-0"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 12h14m-7-7l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
