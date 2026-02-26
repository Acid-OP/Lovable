"use client";

import Link from "next/link";
import { useTheme } from "@/lib/providers/ThemeProvider";

const steps = [
  {
    title: "Describe",
    description:
      "Tell the AI what you want to build in plain English — a dashboard, a landing page, a full-stack app. No technical jargon needed.",
  },
  {
    title: "Generate",
    description:
      "AI writes production-ready code, designs the interface, and assembles your entire application in seconds — not hours.",
  },
  {
    title: "Ship",
    description:
      "Preview your app live, make edits through conversation, and deploy to production with a single click when you're ready.",
  },
];

export function ThreeSteps() {
  const { isDark } = useTheme();

  return (
    <section
      id="how-it-works"
      className={`px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-t ${isDark ? "border-[#2a2a2a]" : "border-[#e8e8e4]"} scroll-mt-20`}
    >
      <div className="max-w-5xl mx-auto">
        <p
          className={`text-[11px] sm:text-[12px] font-medium ${isDark ? "text-[#666]" : "text-[#aaa]"} tracking-widest uppercase mb-5`}
        >
          Streamlined Process
        </p>

        <h2
          className={`font-[family-name:var(--font-heading)] text-[28px] sm:text-[36px] lg:text-[42px] font-normal ${isDark ? "text-[#f0f0f0]" : "text-[#1a1a1a]"} leading-[1.15] tracking-[-0.02em] mb-8`}
        >
          Three steps to your next app
        </h2>

        <div className="flex items-center gap-4 mb-16">
          <Link
            href="/editor"
            className={`px-5 py-2.5 ${isDark ? "bg-[#f0f0f0] text-[#1a1a1a] hover:bg-[#ffffff]" : "bg-[#2d2d2d] text-white hover:bg-[#222]"} text-[13px] font-medium rounded-md transition-colors`}
          >
            Get Started →
          </Link>
          <button
            className={`text-[13px] font-medium ${isDark ? "text-[#999] decoration-[#555] hover:text-[#ccc] hover:decoration-[#777]" : "text-[#666] decoration-[#ccc] hover:text-[#333] hover:decoration-[#999]"} underline underline-offset-4 transition-colors cursor-pointer`}
          >
            View Demo
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className={`pt-6 pb-8 pr-8 ${i > 0 ? "md:pl-8" : ""} ${i < steps.length - 1 ? `md:border-r ${isDark ? "border-[#2a2a2a]" : "border-[#e5e5e3]"}` : ""} border-t ${isDark ? "border-[#2a2a2a]" : "border-[#e5e5e3]"}`}
            >
              <div className="flex items-center gap-2 mb-4">
                <span
                  className={`w-[6px] h-[6px] rounded-[1px] ${isDark ? "bg-[#f0f0f0]" : "bg-[#1a1a1a]"}`}
                />
                <span
                  className={`text-[15px] sm:text-[16px] font-semibold ${isDark ? "text-[#f0f0f0]" : "text-[#1a1a1a]"}`}
                >
                  {step.title}
                </span>
              </div>
              <p
                className={`text-[13px] ${isDark ? "text-[#777]" : "text-[#888]"} leading-[1.7]`}
              >
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
