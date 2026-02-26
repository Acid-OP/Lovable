"use client";

import { useTheme } from "@/lib/providers/ThemeProvider";

export function Logo() {
  const { isDark } = useTheme();

  return (
    <div className="flex items-center gap-2.5">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`w-5 h-5 ${isDark ? "text-[#f0f0f0]" : "text-[#000000]"}`}
      >
        <line x1="6" x2="6" y1="3" y2="15" />
        <circle cx="18" cy="6" r="3" />
        <circle cx="6" cy="18" r="3" />
        <path d="M18 9a9 9 0 0 1-9 9" />
      </svg>
      <span
        className={`text-[17px] sm:text-[19px] font-medium tracking-tight ${isDark ? "text-[#f0f0f0]" : "text-[#000000]"}`}
      >
        Bolt
      </span>
    </div>
  );
}
