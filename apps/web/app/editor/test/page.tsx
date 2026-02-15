"use client";

/**
 * /editor/test – UI testing route.
 *
 * Tests the new horizontal scrolling tabs UI with dummy data
 */

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Editor from "@monaco-editor/react";
import type { Monaco } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { SessionLogsViewer } from "@/components/editor/SessionLogsViewer";
import { useTheme } from "@/lib/providers/ThemeProvider";
import useMonacoModel from "@/lib/hooks/useMonacoModels";
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

// Fake SSE messages
const FAKE_SSE_MESSAGES: SSEMessage[] = [
  { type: "log", content: "Initializing project…", message: "planner" },
  { type: "log", content: "Creating App.tsx", message: "codegen" },
  { type: "log", content: "Creating Hero component", message: "codegen" },
  { type: "log", content: "Creating Features component", message: "codegen" },
  { type: "log", content: "Creating Footer component", message: "codegen" },
  { type: "log", content: "Writing global styles", message: "styler" },
  { type: "complete", content: "Done", status: "complete" },
];

// Dummy files to test horizontal scrolling
const DUMMY_FILES = [
  {
    path: "app/page.tsx",
    content: `export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <main className="container mx-auto px-4 py-16">
        <h1 className="text-5xl font-bold text-center mb-8">
          Welcome to My Portfolio
        </h1>
        <p className="text-xl text-center text-gray-600">
          Building amazing web experiences
        </p>
      </main>
    </div>
  );
}`,
    language: "typescript",
  },
  {
    path: "app/layout.tsx",
    content: `import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "My Portfolio",
  description: "A modern portfolio website",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}`,
    language: "typescript",
  },
  {
    path: "components/Hero.tsx",
    content: `export default function Hero() {
  return (
    <section className="py-20 text-center">
      <h2 className="text-6xl font-extrabold mb-4">
        Hi, I'm a Developer
      </h2>
      <p className="text-xl text-gray-600 max-w-2xl mx-auto">
        I create beautiful, responsive, and performant web applications
        using modern technologies.
      </p>
      <button className="mt-8 px-8 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700">
        Get in Touch
      </button>
    </section>
  );
}`,
    language: "typescript",
  },
  {
    path: "components/Features.tsx",
    content: `const features = [
  { title: "Fast", description: "Lightning-fast performance" },
  { title: "Responsive", description: "Works on all devices" },
  { title: "Modern", description: "Built with latest tech" },
];

export default function Features() {
  return (
    <section className="py-20">
      <h2 className="text-4xl font-bold text-center mb-12">Features</h2>
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {features.map((feature) => (
          <div key={feature.title} className="p-6 bg-white rounded-lg shadow-lg">
            <h3 className="text-2xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}`,
    language: "typescript",
  },
  {
    path: "components/Footer.tsx",
    content: `export default function Footer() {
  return (
    <footer className="py-8 bg-gray-900 text-white text-center">
      <p>© 2024 My Portfolio. All rights reserved.</p>
      <div className="flex justify-center gap-4 mt-4">
        <a href="#" className="hover:text-blue-400">Twitter</a>
        <a href="#" className="hover:text-blue-400">GitHub</a>
        <a href="#" className="hover:text-blue-400">LinkedIn</a>
      </div>
    </footer>
  );
}`,
    language: "typescript",
  },
  {
    path: "components/Navbar.tsx",
    content: `export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full bg-white shadow-sm z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Portfolio</h1>
        <div className="flex gap-6">
          <a href="#home" className="hover:text-blue-600">Home</a>
          <a href="#about" className="hover:text-blue-600">About</a>
          <a href="#contact" className="hover:text-blue-600">Contact</a>
        </div>
      </div>
    </nav>
  );
}`,
    language: "typescript",
  },
  {
    path: "app/globals.css",
    content: `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #ffffff;
  --foreground: #171717;
}

body {
  color: var(--foreground);
  background: var(--background);
  font-family: system-ui, -apple-system, sans-serif;
}`,
    language: "css",
  },
  {
    path: "tailwind.config.ts",
    content: `import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
};

export default config;`,
    language: "typescript",
  },
  {
    path: "package.json",
    content: `{
  "name": "portfolio",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "14.0.0",
    "react": "^18",
    "react-dom": "^18"
  },
  "devDependencies": {
    "typescript": "^5",
    "tailwindcss": "^3.4.0"
  }
}`,
    language: "json",
  },
  {
    path: "README.md",
    content: `# Portfolio Website

A modern, responsive portfolio website built with Next.js and Tailwind CSS.

## Features

- 🚀 Fast and optimized
- 📱 Fully responsive
- 🎨 Beautiful UI with Tailwind CSS
- ⚡ Built with Next.js 14

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.`,
    language: "markdown",
  },
];

export default function TestEditorPage() {
  const { isDark, toggleTheme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([DUMMY_MESSAGES[0]!]);
  const [input, setInput] = useState("");
  const [showLogs, setShowLogs] = useState(true);
  const [sseIdx, setSseIdx] = useState(0);
  const [activeFile, setActiveFile] = useState(DUMMY_FILES[0]!.path);
  const [activeTab, setActiveTab] = useState<"code" | "preview">("code");

  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const modelsCreatedRef = useRef(false);

  const { handleEditorDidMount, createModel, switchToFile, isReady } =
    useMonacoModel();

  // Drip-feed fake SSE messages
  useEffect(() => {
    if (sseIdx >= FAKE_SSE_MESSAGES.length) return;
    const timer = setTimeout(() => {
      setSseIdx((i) => i + 1);
    }, 800);
    return () => clearTimeout(timer);
  }, [sseIdx]);

  // Drip-feed chat messages
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

  // Create Monaco models when ready
  useEffect(() => {
    if (!isReady || modelsCreatedRef.current) return;

    DUMMY_FILES.forEach((file) => {
      createModel(file.path, file.content, file.language);
    });

    modelsCreatedRef.current = true;

    // Switch to first file
    if (DUMMY_FILES[0]) {
      switchToFile(DUMMY_FILES[0].path);
    }
  }, [isReady, createModel, switchToFile]);

  const handleLogsComplete = useCallback(() => {
    setShowLogs(false);
  }, []);

  const handleSend = useCallback(() => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { role: "user", content: input }]);
    setInput("");
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Got it — iterating on that change…" },
      ]);
    }, 600);
  }, [input]);

  const handleTabClick = useCallback(
    (filename: string) => {
      setActiveTab("code");
      switchToFile(filename);
      setActiveFile(filename);
    },
    [switchToFile],
  );

  const handlePreviewClick = useCallback(() => {
    setActiveTab("preview");
  }, []);

  const handleMount = useCallback(
    (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
      handleEditorDidMount(editor, monaco);
    },
    [handleEditorDidMount],
  );

  return (
    <div
      className={`h-screen flex flex-col ${isDark ? "bg-[#1e1e1e]" : "bg-white"}`}
    >
      {/* TEST BANNER */}
      <div className="bg-amber-500 text-black text-center text-xs font-semibold py-1 tracking-wide">
        UI TEST MODE — Testing Horizontal Scrolling Tabs
      </div>

      {/* Top Navbar */}
      <nav
        className={`${isDark ? "bg-[#1e1e1e] border-[#333]" : "bg-white border-gray-200"} border-b`}
      >
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
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

          <div className="flex items-center gap-2 sm:gap-3">
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

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Chat (Fixed Width) */}
        <div
          className={`w-[380px] flex-shrink-0 ${isDark ? "bg-[#1e1e1e] border-[#333]" : "bg-white border-gray-200"} border-r flex flex-col`}
        >
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
                        ? "bg-[#2a2a2a] text-gray-200"
                        : "bg-gray-100 text-gray-900"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

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
                className={`absolute bottom-3 right-3 w-9 h-9 ${isDark ? "bg-white text-black" : "bg-black text-white"} rounded-full flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed`}
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

        {/* Right Panel - Editor/Preview */}
        <div
          className={`flex-1 min-w-0 flex flex-col ${isDark ? "bg-[#1e1e1e]" : "bg-white"}`}
        >
          {/* Top-Level Tabs: Code | Preview */}
          {!showLogs && (
            <div
              className={`flex items-center ${isDark ? "bg-[#252526] border-[#3d3d3d]" : "bg-gray-50 border-gray-200"} border-b`}
            >
              <button
                onClick={() => setActiveTab("code")}
                className={`relative px-5 py-2.5 text-[13px] font-medium cursor-pointer flex items-center gap-2 ${
                  activeTab === "code"
                    ? isDark
                      ? "text-white"
                      : "text-gray-900"
                    : isDark
                      ? "text-gray-500 hover:text-gray-300"
                      : "text-gray-400 hover:text-gray-700"
                }`}
              >
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
                Code
                {activeTab === "code" && (
                  <div
                    className={`absolute bottom-0 left-0 right-0 h-0.5 ${isDark ? "bg-blue-500" : "bg-blue-600"}`}
                  />
                )}
              </button>

              <button
                onClick={handlePreviewClick}
                className={`relative px-5 py-2.5 text-[13px] font-medium cursor-pointer flex items-center gap-2 ${
                  activeTab === "preview"
                    ? isDark
                      ? "text-white"
                      : "text-gray-900"
                    : isDark
                      ? "text-gray-500 hover:text-gray-300"
                      : "text-gray-400 hover:text-gray-700"
                }`}
              >
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                Preview
                {activeTab === "preview" && (
                  <div
                    className={`absolute bottom-0 left-0 right-0 h-0.5 ${isDark ? "bg-blue-500" : "bg-blue-600"}`}
                  />
                )}
              </button>
            </div>
          )}

          {/* File Tabs Bar (only when Code tab is active) */}
          {!showLogs && activeTab === "code" && (
            <div
              className={`relative ${isDark ? "bg-[#1e1e1e] border-[#333]" : "bg-white border-gray-200"} border-b`}
            >
              <div className="relative group">
                {/* Left Gradient */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-8 pointer-events-none z-10 ${
                    isDark
                      ? "bg-gradient-to-r from-[#1e1e1e] to-transparent"
                      : "bg-gradient-to-r from-white to-transparent"
                  }`}
                />

                {/* Scrollable File Tabs */}
                <div
                  ref={tabsContainerRef}
                  className={`flex flex-nowrap items-center gap-0.5 px-2 pt-1 pb-1.5 overflow-x-auto scroll-smooth ${isDark ? "file-tabs-scroll-dark" : "file-tabs-scroll-light"}`}
                >
                  {DUMMY_FILES.map((file) => (
                    <button
                      key={file.path}
                      onClick={() => handleTabClick(file.path)}
                      className={`group relative flex-shrink-0 px-3 py-1.5 text-[12px] rounded-md whitespace-nowrap transition-colors duration-150 flex items-center gap-2 cursor-pointer ${
                        activeFile === file.path
                          ? isDark
                            ? "bg-[#2d2d30] text-white"
                            : "bg-gray-100 text-gray-900"
                          : isDark
                            ? "text-gray-400 hover:text-gray-200 hover:bg-[#2d2d30]"
                            : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      <svg
                        className="w-3.5 h-3.5 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <span className="font-medium">{file.path}</span>
                    </button>
                  ))}
                </div>

                {/* Right Gradient */}
                <div
                  className={`absolute right-0 top-0 bottom-0 w-8 pointer-events-none z-10 ${
                    isDark
                      ? "bg-gradient-to-l from-[#1e1e1e] to-transparent"
                      : "bg-gradient-to-l from-white to-transparent"
                  }`}
                />
              </div>
            </div>
          )}

          {/* Content Area */}
          <div className="flex-1 overflow-hidden">
            {showLogs ? (
              <SessionLogsViewer
                messages={FAKE_SSE_MESSAGES.slice(0, sseIdx)}
                isDark={isDark}
                onComplete={handleLogsComplete}
              />
            ) : activeTab === "code" ? (
              <div className={`h-full ${isDark ? "bg-[#1e1e1e]" : "bg-white"}`}>
                <Editor
                  height="100%"
                  theme={isDark ? "vs-dark" : "vs-light"}
                  onMount={handleMount}
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    padding: { top: 16 },
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                  }}
                />
              </div>
            ) : (
              /* Preview Tab — full right panel */
              <div
                className={`h-full flex flex-col ${isDark ? "bg-[#1e1e1e]" : "bg-white"}`}
              >
                {/* URL bar */}
                <div
                  className={`flex items-center gap-2 px-4 py-2 ${isDark ? "bg-[#252526] border-[#3d3d3d]" : "bg-gray-50 border-gray-200"} border-b`}
                >
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`w-3 h-3 rounded-full ${isDark ? "bg-[#ff5f57]" : "bg-red-400"}`}
                    />
                    <div
                      className={`w-3 h-3 rounded-full ${isDark ? "bg-[#febc2e]" : "bg-yellow-400"}`}
                    />
                    <div
                      className={`w-3 h-3 rounded-full ${isDark ? "bg-[#28c840]" : "bg-green-400"}`}
                    />
                  </div>
                  <div
                    className={`flex-1 mx-3 px-3 py-1 rounded-md text-[12px] ${
                      isDark
                        ? "bg-[#1e1e1e] text-gray-400 border border-[#3d3d3d]"
                        : "bg-white text-gray-500 border border-gray-200"
                    }`}
                  >
                    https://localhost:3000
                  </div>
                  <button
                    className={`p-1 rounded ${isDark ? "hover:bg-[#3d3d3d] text-gray-400" : "hover:bg-gray-200 text-gray-500"}`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </button>
                </div>

                {/* Preview placeholder */}
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div
                      className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${
                        isDark ? "bg-[#2d2d30]" : "bg-gray-100"
                      }`}
                    >
                      <svg
                        className={`w-8 h-8 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3
                        className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}
                      >
                        Live Preview
                      </h3>
                      <p
                        className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-500"}`}
                      >
                        Site preview will render here
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
