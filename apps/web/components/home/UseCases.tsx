"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "@/lib/providers/ThemeProvider";

const showcases = [
  {
    title: "Dashboard",
    prompt:
      "Build a personal finance dashboard with charts, transactions, and spending breakdown",
    description: "Analytics, charts, and data-rich interfaces",
    mockup: (
      <div className="w-full h-full bg-[#0f0f0f] rounded-lg p-4 flex flex-col gap-3 text-white">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-[11px] text-gray-400 font-medium">FinDash</span>
        </div>
        <div className="flex gap-3 flex-1">
          <div className="flex-1 flex flex-col gap-2">
            <div className="bg-[#1a1a1a] rounded-lg p-3 flex-1">
              <div className="text-[10px] text-gray-500 mb-1">
                Total Balance
              </div>
              <div className="text-[16px] font-semibold">$24,563</div>
              <div className="text-[10px] text-emerald-400">+12.5%</div>
            </div>
            <div className="bg-[#1a1a1a] rounded-lg p-3 flex-1">
              <div className="text-[10px] text-gray-500 mb-2">Monthly</div>
              <div className="flex items-end gap-1 h-8">
                {[40, 65, 45, 80, 55, 70, 90].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-violet-500/60 rounded-sm"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="flex-1 bg-[#1a1a1a] rounded-lg p-3">
            <div className="text-[10px] text-gray-500 mb-2">Spending</div>
            <div className="w-16 h-16 mx-auto rounded-full border-4 border-violet-500 border-t-emerald-400 border-r-amber-400 my-2" />
            <div className="flex flex-wrap gap-1 mt-2">
              {["Food", "Rent", "Travel"].map((c) => (
                <span
                  key={c}
                  className="text-[8px] text-gray-500 bg-[#252525] px-1.5 py-0.5 rounded"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Landing Page",
    prompt:
      "Create a modern SaaS landing page with hero, features grid, and pricing section",
    description: "Marketing pages with hero sections and CTAs",
    mockup: (
      <div className="w-full h-full bg-white rounded-lg p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between mb-1">
          <div className="w-8 h-1.5 bg-gray-800 rounded" />
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-6 h-1 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 py-2">
          <div className="w-20 h-1.5 bg-gray-800 rounded" />
          <div className="w-32 h-1 bg-gray-300 rounded" />
          <div className="flex gap-2 mt-2">
            <div className="w-12 h-4 bg-gray-800 rounded text-[7px] text-white flex items-center justify-center">
              Start
            </div>
            <div className="w-12 h-4 border border-gray-300 rounded text-[7px] text-gray-500 flex items-center justify-center">
              Demo
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-gray-50 border border-gray-100 rounded-md p-2"
            >
              <div className="w-4 h-4 bg-gray-200 rounded mb-1" />
              <div className="w-full h-1 bg-gray-200 rounded mb-0.5" />
              <div className="w-3/4 h-1 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    title: "SaaS App",
    prompt:
      "Build a project management tool with kanban board, task cards, and team members",
    description: "Full-stack apps with auth and database",
    mockup: (
      <div className="w-full h-full bg-[#fafafa] rounded-lg flex overflow-hidden">
        <div className="w-12 bg-gray-900 flex flex-col items-center py-3 gap-2.5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`w-5 h-5 rounded ${i === 1 ? "bg-violet-500" : "bg-gray-700"}`}
            />
          ))}
        </div>
        <div className="flex-1 p-3">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] font-semibold text-gray-700">Board</div>
            <div className="w-10 h-3 bg-violet-500 rounded text-[7px] text-white flex items-center justify-center">
              + New
            </div>
          </div>
          <div className="flex gap-2 h-[calc(100%-24px)]">
            {["To Do", "In Progress", "Done"].map((col) => (
              <div key={col} className="flex-1 flex flex-col gap-1.5">
                <div className="text-[8px] font-medium text-gray-400 uppercase">
                  {col}
                </div>
                {[1, 2].map((j) => (
                  <div
                    key={j}
                    className="bg-white border border-gray-200 rounded-md p-1.5 shadow-sm"
                  >
                    <div className="w-full h-1 bg-gray-200 rounded mb-1" />
                    <div className="w-2/3 h-1 bg-gray-100 rounded" />
                    <div className="flex gap-0.5 mt-1.5">
                      <div className="w-3 h-3 rounded-full bg-violet-200" />
                      <div className="w-3 h-3 rounded-full bg-amber-200" />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "E-commerce",
    prompt:
      "Create an online store with product grid, shopping cart, and checkout page",
    description: "Product catalogs, carts, and checkout flows",
    mockup: (
      <div className="w-full h-full bg-white rounded-lg p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-semibold text-gray-700">Store</div>
          <div className="flex items-center gap-1">
            <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
              <svg
                className="w-2.5 h-2.5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <div className="w-5 h-5 rounded-full bg-gray-800 text-[7px] text-white flex items-center justify-center">
              3
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 flex-1">
          {[
            { color: "bg-rose-50", price: "$49" },
            { color: "bg-sky-50", price: "$89" },
            { color: "bg-amber-50", price: "$65" },
            { color: "bg-emerald-50", price: "$39" },
          ].map((item, i) => (
            <div
              key={i}
              className="flex flex-col rounded-lg border border-gray-100 overflow-hidden"
            >
              <div className={`${item.color} flex-1 min-h-[36px]`} />
              <div className="p-1.5">
                <div className="w-full h-1 bg-gray-200 rounded mb-1" />
                <div className="text-[9px] font-semibold text-gray-700">
                  {item.price}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

export function UseCases() {
  const { isDark } = useTheme();
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 5000;
    const interval = 50;
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += interval;
      setProgress((elapsed / duration) * 100);

      if (elapsed >= duration) {
        setActive((prev) => (prev + 1) % showcases.length);
        elapsed = 0;
        setProgress(0);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [active]);

  const handleSelect = (index: number) => {
    setActive(index);
    setProgress(0);
  };

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      <div className="max-w-5xl mx-auto">
        <p
          className={`text-[11px] sm:text-[12px] font-medium ${isDark ? "text-[#666]" : "text-[#aaa]"} tracking-widest uppercase mb-5`}
        >
          Use Cases
        </p>
        <h2
          className={`font-[family-name:var(--font-heading)] text-[28px] sm:text-[36px] lg:text-[42px] font-normal ${isDark ? "text-[#f0f0f0]" : "text-[#1a1a1a]"} leading-[1.15] tracking-[-0.02em] mb-14`}
        >
          What will you build?
        </h2>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Left — prompt list */}
          <div className="lg:w-[280px] flex-shrink-0 flex flex-col gap-1">
            {showcases.map((item, i) => (
              <button
                key={item.title}
                onClick={() => handleSelect(i)}
                className={`group relative text-left px-5 py-4 rounded-xl transition-all duration-200 cursor-pointer ${
                  active === i
                    ? `${isDark ? "bg-[#141414] border border-[#2a2a2a]" : "bg-white border border-[#e5e5e3]"} shadow-sm`
                    : `${isDark ? "hover:bg-white/5" : "hover:bg-white/60"}`
                }`}
              >
                {active === i && (
                  <div
                    className={`absolute left-0 top-0.5 bottom-0.5 w-[3px] rounded-full ${isDark ? "bg-[#f0f0f0]" : "bg-[#2d2d2d]"}`}
                    style={{
                      clipPath: `inset(0 0 ${100 - progress}% 0)`,
                      transition: "clip-path 50ms linear",
                    }}
                  />
                )}
                <div
                  className={`text-[14px] font-semibold mb-0.5 transition-colors ${active === i ? `${isDark ? "text-[#f0f0f0]" : "text-[#1a1a1a]"}` : `${isDark ? "text-[#666] group-hover:text-[#999]" : "text-[#999] group-hover:text-[#666]"}`}`}
                >
                  {item.title}
                </div>
                <div
                  className={`text-[12px] leading-[1.5] transition-colors ${active === i ? `${isDark ? "text-[#777]" : "text-[#888]"}` : `${isDark ? "text-[#555] group-hover:text-[#666]" : "text-[#bbb] group-hover:text-[#aaa]"}`}`}
                >
                  {item.description}
                </div>
              </button>
            ))}

            <Link
              href="/editor"
              className={`mt-4 ml-5 text-[13px] font-medium ${isDark ? "text-[#f0f0f0] hover:text-[#ffffff]" : "text-[#2d2d2d] hover:text-[#000]"} transition-colors inline-flex items-center gap-1.5`}
            >
              Try it yourself
              <span>→</span>
            </Link>
          </div>

          {/* Right — interactive preview */}
          <div className="flex-1 min-w-0">
            <div
              className={`relative rounded-2xl border ${isDark ? "border-[#2a2a2a] bg-[#141414]" : "border-[#e5e5e3] bg-white"} shadow-lg shadow-black/5 overflow-hidden`}
            >
              {/* Browser chrome */}
              <div
                className={`flex items-center gap-2 px-4 py-2.5 border-b ${isDark ? "border-[#2a2a2a] bg-[#1a1a1a]" : "border-[#f0f0ee] bg-[#fafaf8]"}`}
              >
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                </div>
                <div
                  className={`flex-1 mx-4 px-3 py-1 rounded-md ${isDark ? "bg-[#0a0a0a] border border-[#2a2a2a] text-[#666]" : "bg-white border border-[#e5e5e3] text-[#aaa]"} text-[10px] truncate`}
                >
                  {showcases[active]?.prompt}
                </div>
              </div>

              {/* Mockup area */}
              <div className="relative h-[320px] sm:h-[380px] p-4">
                {showcases.map((item, i) => (
                  <div
                    key={item.title}
                    className={`absolute inset-4 transition-all duration-500 ${
                      active === i
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-4 pointer-events-none"
                    }`}
                  >
                    {item.mockup}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
