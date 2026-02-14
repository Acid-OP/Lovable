"use client";

/**
 * /editor/test – UI testing route.
 *
 * Mirrors the real /editor/[jobId] page but with:
 *   • No backend / SSE connection
 *   • Dummy chat messages
 *   • Cosmic loader auto-completes after a short delay
 *   • DummyPreview renders sample code in Monaco
 *
 * Visit http://localhost:3000/editor/test to iterate on UI.
 * Safe to delete when no longer needed.
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { SessionLogsViewer } from "@/components/editor/SessionLogsViewer";
import DummyPreview from "@/components/editor/DummyPreview";
import { useTheme } from "@/lib/providers/ThemeProvider";
import type { SSEMessage } from "@/lib/hooks/useSSEStream";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const DUMMY_MESSAGES: Message[] = [
  {
    role: "user",
    content:
      "Create a modern portfolio website with hero, features, and footer sections",
  },
  {
    role: "assistant",
    content: "Connected to session. Starting generation...",
  },
  { role: "assistant", content: "Analyzing requirements…" },
  { role: "assistant", content: "✓ Code generation complete!" },
];

// Fake SSE-style messages so SessionLogsViewer has something to display
const FAKE_SSE_MESSAGES: SSEMessage[] = [
  { type: "log", content: "Initializing project…", message: "planner" },
  { type: "log", content: "Creating App.tsx", message: "codegen" },
  { type: "log", content: "Creating Hero component", message: "codegen" },
  { type: "log", content: "Creating Features component", message: "codegen" },
  { type: "log", content: "Creating Footer component", message: "codegen" },
  { type: "log", content: "Writing global styles", message: "styler" },
  { type: "complete", content: "Done", status: "complete" },
];

export default function TestEditorPage() {
  const { isDark, toggleTheme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([DUMMY_MESSAGES[0]!]);
  const [input, setInput] = useState("");
  const [showLogs, setShowLogs] = useState(true);
  const [sseIdx, setSseIdx] = useState(0);

  // Drip-feed fake SSE messages so the cosmic viewer has content
  useEffect(() => {
    if (sseIdx >= FAKE_SSE_MESSAGES.length) return;
    const timer = setTimeout(() => {
      setSseIdx((i) => i + 1);
    }, 800);
    return () => clearTimeout(timer);
  }, [sseIdx]);

  // Drip-feed chat messages alongside SSE
  useEffect(() => {
    if (sseIdx === 1 && messages.length < 2) {
      setMessages((prev) => [...prev, DUMMY_MESSAGES[1]!]);
    }
    if (sseIdx === 3 && messages.length < 3) {
      setMessages((prev) => [...prev, DUMMY_MESSAGES[2]!]);
    }
    if (sseIdx >= FAKE_SSE_MESSAGES.length && messages.length < 4) {
      setMessages((prev) => [...prev, DUMMY_MESSAGES[3]!]);
    }
  }, [sseIdx, messages.length]);

  const handleLogsComplete = () => {
    setShowLogs(false);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { role: "user", content: input }]);
    setInput("");
    // Simulate a quick response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Got it — iterating on that change…" },
      ]);
    }, 600);
  };

  return (
    <div
      className={`h-screen flex flex-col ${isDark ? "bg-[#1e1e1e]" : "bg-white"}`}
    >
      {/* ---- TEST BANNER ---- */}
      <div className="bg-amber-500 text-black text-center text-xs font-semibold py-1 tracking-wide">
        UI TEST MODE — no backend connected
      </div>

      {/* Top Navbar */}
      <nav
        className={`${isDark ? "bg-[#1e1e1e] border-[#333]" : "bg-white border-gray-200"} border-b`}
      >
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link href="/editor" className="flex items-center gap-2.5">
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

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full cursor-pointer ${isDark ? "hover:bg-[#2d2d30]" : "hover:bg-gray-100"}`}
              title={isDark ? "Light mode" : "Dark mode"}
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

            {/* Skip Logs button — handy for jumping straight to preview */}
            {showLogs && (
              <button
                onClick={() => setShowLogs(false)}
                className={`px-3 sm:px-4 py-1.5 text-[12px] sm:text-[13px] border rounded-full cursor-pointer ${
                  isDark
                    ? "text-gray-400 border-[#555] hover:text-white hover:border-white"
                    : "text-gray-600 border-gray-300 hover:text-black hover:border-black"
                }`}
              >
                Skip Logs
              </button>
            )}

            <button
              className={`px-3 sm:px-4 py-1.5 text-[12px] sm:text-[13px] ${isDark ? "text-gray-400 hover:text-white" : "text-gray-700 hover:text-black"} cursor-pointer`}
            >
              Share
            </button>
            <button
              className={`px-3 sm:px-4 py-1.5 ${isDark ? "bg-white hover:bg-gray-200 text-black" : "bg-black hover:bg-gray-900 text-white"} text-[12px] sm:text-[13px] font-medium rounded-full cursor-pointer`}
            >
              Deploy
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content - Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Chat */}
        <div
          className={`w-full lg:w-[380px] ${isDark ? "bg-[#1e1e1e] border-[#333]" : "bg-white border-gray-200"} border-r flex flex-col`}
        >
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div
                key={`msg-${i}`}
                className={`${msg.role === "user" ? "text-right" : "text-left"}`}
              >
                <div
                  className={`inline-block px-4 py-2.5 rounded-lg text-[14px] ${
                    msg.role === "user"
                      ? isDark
                        ? "bg-white text-black"
                        : "bg-gray-900 text-white"
                      : isDark
                        ? "bg-[#2d2d30] text-gray-200"
                        : "bg-gray-100 text-gray-900"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          {/* Input Bar */}
          <div
            className={`p-4 ${isDark ? "border-[#333]" : "border-gray-200"} border-t`}
          >
            <div
              className={`relative ${isDark ? "bg-[#2d2d30] border-[#3d3d3d]" : "bg-white border-gray-200"} rounded-xl border-2 shadow-sm hover:shadow-md transition-shadow`}
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    (e.metaKey || e.ctrlKey) &&
                    input.trim()
                  ) {
                    handleSend();
                  }
                }}
                placeholder="What would you like to build?"
                className={`w-full p-4 pr-14 text-[15px] ${isDark ? "text-white placeholder:text-[#888] bg-transparent" : "text-gray-900 placeholder:text-gray-500"} resize-none focus:outline-none rounded-xl`}
                rows={2}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className={`absolute bottom-3 right-3 w-9 h-9 ${isDark ? "bg-white text-black" : "bg-black text-white"} rounded-full flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:opacity-30`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div
          className={`flex-1 flex flex-col ${isDark ? "bg-[#1e1e1e]" : "bg-white"}`}
        >
          <div className="flex-1 overflow-y-auto">
            {showLogs ? (
              <SessionLogsViewer
                messages={FAKE_SSE_MESSAGES.slice(0, sseIdx)}
                isDark={isDark}
                onComplete={handleLogsComplete}
              />
            ) : (
              <DummyPreview isDark={isDark} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
