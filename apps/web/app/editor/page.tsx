"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MountainWithStars from "@/components/MountainWithStars";
import { useSubmitPrompt } from "@/lib/hooks/useSubmitPrompt";
import { TransitionLoader } from "@/components/editor/TransitionLoader";
import { useTheme } from "@/lib/providers/ThemeProvider";

export default function EditorPage() {
  const [prompt, setPrompt] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const router = useRouter();
  const { submitPrompt, isLoading, error, clearError } = useSubmitPrompt();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    // Clear any previous errors
    clearError();

    // Submit the prompt
    const result = await submitPrompt(prompt);

    if (result) {
      // Show transition loader
      setIsTransitioning(true);

      // Small delay to ensure loader is visible before navigation
      setTimeout(() => {
        // Pass the prompt as a URL parameter
        const params = new URLSearchParams({ prompt });
        router.push(`/editor/${result.jobId}?${params.toString()}`);
      }, 500);
    }
    // If result is null, error state will be set automatically by the hook
  };

  return (
    <>
      {/* Transition Loader */}
      {isTransitioning && <TransitionLoader />}

      <div
        className={`min-h-screen ${isDark ? "bg-[#1e1e1e]" : "bg-[#f5f5f0]"} relative overflow-hidden`}
      >
        {/* Navbar */}
        <nav
          className={`relative ${isDark ? "bg-[#1e1e1e] border-b border-[#333]" : "bg-[#f5f5f0] border-b border-[#e8e8e3]"}`}
        >
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between relative">
              {/* Left - Logo */}
              <Link href="/" className="flex items-center gap-2.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`w-4 h-4 sm:w-5 sm:h-5 ${isDark ? "text-white" : "text-black"}`}
                >
                  <line x1="6" x2="6" y1="3" y2="15" />
                  <circle cx="18" cy="6" r="3" />
                  <circle cx="6" cy="18" r="3" />
                  <path d="M18 9a9 9 0 0 1-9 9" />
                </svg>
                <span
                  className={`text-[15px] sm:text-[17px] font-medium ${isDark ? "text-white" : "text-black"} tracking-tight`}
                >
                  Bolt
                </span>
              </Link>

              {/* Center - Build with Bolt (hidden on very small screens to avoid overlap) */}
              <div className="hidden sm:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-2.5 sm:gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`w-5 h-5 sm:w-6 sm:h-6 ${isDark ? "text-white" : "text-black"} flex-shrink-0`}
                >
                  <line x1="6" x2="6" y1="3" y2="15" />
                  <circle cx="18" cy="6" r="3" />
                  <circle cx="6" cy="18" r="3" />
                  <path d="M18 9a9 9 0 0 1-9 9" />
                </svg>
                <h1
                  className={`text-[18px] sm:text-[22px] font-light ${isDark ? "text-white" : "text-black"} tracking-tight`}
                >
                  Build with Bolt
                </h1>
              </div>

              {/* Right - Theme Toggle & Profile */}
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleTheme}
                  className={`p-2 rounded-full cursor-pointer ${isDark ? "hover:bg-[#2d2d30]" : "hover:bg-gray-100"}`}
                >
                  {isDark ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4 text-gray-400"
                    >
                      <circle cx="12" cy="12" r="5" />
                      <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4 text-gray-600"
                    >
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                  )}
                </button>
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full ${isDark ? "bg-white text-black" : "bg-[#2d2d2d] text-white"} flex items-center justify-center font-semibold text-[13px] sm:text-[14px] cursor-pointer hover:opacity-80 transition-opacity`}
                >
                  U
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="relative max-w-[1000px] mx-auto px-4 sm:px-6 py-2 sm:py-4">
          {/* Mountain with Stars - Center */}
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="w-full max-w-[300px] sm:max-w-[400px] h-[200px] sm:h-[300px]">
              <MountainWithStars isDark={isDark} />
            </div>
          </div>

          {/* Prompt Input */}
          <div className="mb-8 max-w-[750px] mx-auto">
            <div
              className={`relative ${isDark ? "bg-[#2d2d30] border-[#3d3d3d] focus-within:border-[#555555]" : "bg-white border-[#e5e5e3] focus-within:border-[#ccc]"} rounded-xl sm:rounded-2xl border-2 shadow-lg hover:shadow-xl transition-shadow`}
            >
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    (e.metaKey || e.ctrlKey) &&
                    prompt.trim()
                  ) {
                    handleGenerate();
                  }
                }}
                placeholder="What would you like to build?"
                className={`w-full p-4 pr-14 sm:p-6 sm:pr-16 text-[15px] sm:text-[16px] ${isDark ? "text-white placeholder:text-[#888] bg-transparent" : "text-gray-900 placeholder:text-gray-500"} resize-none focus:outline-none rounded-xl sm:rounded-2xl`}
                rows={3}
              />
              <button
                onClick={handleGenerate}
                disabled={isLoading || !prompt.trim()}
                className={`absolute bottom-3 right-3 sm:bottom-4 sm:right-4 w-9 h-9 sm:w-10 sm:h-10 ${isDark ? "bg-white text-black" : "bg-[#2d2d2d] text-white"} rounded-full flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:opacity-30`}
              >
                {isLoading ? (
                  <div
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 ${isDark ? "border-black border-t-transparent" : "border-white border-t-transparent"} rounded-full animate-spin`}
                  />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4 sm:w-5 sm:h-5"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                )}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div
                className={`mt-3 p-3 sm:p-4 ${isDark ? "bg-red-900/20 border-red-800" : "bg-red-50 border-red-200"} border rounded-lg flex items-start gap-3`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`w-5 h-5 ${isDark ? "text-red-400" : "text-red-600"} flex-shrink-0 mt-0.5`}
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" x2="12" y1="8" y2="12" />
                  <line x1="12" x2="12.01" y1="16" y2="16" />
                </svg>
                <div className="flex-1">
                  <p
                    className={`text-sm ${isDark ? "text-red-300" : "text-red-800"}`}
                  >
                    {error}
                  </p>
                </div>
                <button
                  onClick={clearError}
                  className={`${isDark ? "text-red-400 hover:text-red-300" : "text-red-600 hover:text-red-800"} transition-colors`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5"
                  >
                    <line x1="18" x2="6" y1="6" y2="18" />
                    <line x1="6" x2="18" y1="6" y2="18" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center mt-8 sm:mt-12 lg:mt-16">
            <p
              className={`text-[12px] sm:text-[13px] ${isDark ? "text-gray-600" : "text-gray-400"}`}
            >
              Powered by Bolt
            </p>
          </div>
        </main>
      </div>
    </>
  );
}
