"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MountainWithStars from "@/components/MountainWithStars";
import { useSubmitPrompt } from "@/lib/hooks/useSubmitPrompt";

export default function EditorPage() {
  const [prompt, setPrompt] = useState("");
  const router = useRouter();
  const { submitPrompt, isLoading, error, clearError } = useSubmitPrompt();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    // Clear any previous errors
    clearError();

    // Submit the prompt
    const result = await submitPrompt(prompt);

    if (result) {
      // Success! Navigate to workspace
      router.push(`/editor/${result.jobId}`);
    }
    // If result is null, error state will be set automatically by the hook
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-30" />

      {/* Navbar */}
      <nav className="relative bg-white">
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
                className="w-4 h-4 sm:w-5 sm:h-5 text-[#000000]"
              >
                <line x1="6" x2="6" y1="3" y2="15" />
                <circle cx="18" cy="6" r="3" />
                <circle cx="6" cy="18" r="3" />
                <path d="M18 9a9 9 0 0 1-9 9" />
              </svg>
              <span className="text-[15px] sm:text-[17px] font-medium text-[#000000] tracking-tight">
                Bolt
              </span>
            </Link>

            {/* Center - Build with Bolt */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2.5 sm:gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 sm:w-6 sm:h-6 text-black flex-shrink-0"
              >
                <line x1="6" x2="6" y1="3" y2="15" />
                <circle cx="18" cy="6" r="3" />
                <circle cx="6" cy="18" r="3" />
                <path d="M18 9a9 9 0 0 1-9 9" />
              </svg>
              <h1 className="text-[18px] sm:text-[22px] font-light text-black tracking-tight">
                Build with Bolt
              </h1>
            </div>

            {/* Right - Profile */}
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black flex items-center justify-center text-white font-semibold text-[13px] sm:text-[14px] cursor-pointer hover:bg-gray-800 transition-colors">
              U
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative max-w-[1000px] mx-auto px-4 sm:px-6 py-2 sm:py-4">
        {/* Mountain with Stars - Center */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <div className="w-full max-w-[400px] h-[300px]">
            <MountainWithStars />
          </div>
        </div>

        {/* Prompt Input */}
        <div className="mb-8 max-w-[750px] mx-auto">
          <div className="relative bg-white rounded-xl sm:rounded-2xl border-2 border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
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
              className="w-full p-4 pr-14 sm:p-6 sm:pr-16 text-[15px] sm:text-[16px] text-gray-900 placeholder:text-gray-400 resize-none focus:outline-none rounded-xl sm:rounded-2xl"
              rows={3}
            />
            <button
              onClick={handleGenerate}
              disabled={isLoading || !prompt.trim()}
              className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 w-9 h-9 sm:w-10 sm:h-10 bg-black text-white rounded-full flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:opacity-30"
            >
              {isLoading ? (
                <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
            <div className="mt-3 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" x2="12" y1="8" y2="12" />
                <line x1="12" x2="12.01" y1="16" y2="16" />
              </svg>
              <div className="flex-1">
                <p className="text-sm text-red-800">{error}</p>
              </div>
              <button
                onClick={clearError}
                className="text-red-600 hover:text-red-800 transition-colors"
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
          <p className="text-[12px] sm:text-[13px] text-gray-400">
            Powered by Bolt
          </p>
        </div>
      </main>
    </div>
  );
}
