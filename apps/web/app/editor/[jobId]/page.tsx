"use client";

import { use, useState } from "react";
import Link from "next/link";
import Editor from "@monaco-editor/react";
import useMonacoModel from "@/lib/hooks/useMonacoModels";
import type { Monaco } from "@monaco-editor/react";
import type { editor } from "monaco-editor";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface WorkspacePageProps {
  params: Promise<{
    jobId: string;
  }>;
}

export default function WorkspacePage({ params }: WorkspacePageProps) {
  const { jobId } = use(params);

  const [isDark, setIsDark] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "user",
      content: "create a portfolio website",
    },
    {
      role: "assistant",
      content: "Reviewing project scope and components",
    },
  ]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeFile, setActiveFile] = useState("index.tsx");
  const [files] = useState(["index.tsx", "App.tsx", "styles.css"]);

  const { handleEditorDidMount, createModel, switchToFile } = useMonacoModel();

  function handleMount(editor: editor.IStandaloneCodeEditor, monaco: Monaco) {
    handleEditorDidMount(editor, monaco);

    // Create initial models and set active
    const model = createModel(
      "index.tsx",
      '// Your React code here\n\nexport default function App() {\n  return (\n    <div className="min-h-screen bg-white">\n      <h1>Portfolio Website</h1>\n      <p>Job ID: ' +
        jobId +
        "</p>\n    </div>\n  );\n}",
      "typescript",
    );

    if (model) {
      editor.setModel(model);
    }
  }

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages([...messages, { role: "user", content: input }]);
    setInput("");
    setIsGenerating(true);

    // TODO: Submit iteration with previousJobId = jobId
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'll help you with that...",
        },
      ]);
      setIsGenerating(false);
    }, 1000);
  };

  const handleTabClick = (filename: string) => {
    switchToFile(filename);
    setActiveFile(filename);
  };

  return (
    <div
      className={`h-screen flex flex-col ${isDark ? "bg-[#1e1e1e]" : "bg-white"}`}
    >
      {/* Top Navbar */}
      <nav
        className={`${isDark ? "bg-[#1e1e1e] border-gray-800" : "bg-white border-gray-200"} border-b`}
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
              onClick={() => setIsDark(!isDark)}
              className={`p-2 rounded-full transition-colors cursor-pointer ${
                isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
              }`}
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

            <button
              className={`px-3 sm:px-4 py-1.5 text-[12px] sm:text-[13px] ${isDark ? "text-gray-400 hover:text-white" : "text-gray-700 hover:text-black"} transition-colors cursor-pointer`}
            >
              Share
            </button>
            <button
              className={`px-3 sm:px-4 py-1.5 ${isDark ? "bg-white hover:bg-gray-200 text-black" : "bg-black hover:bg-gray-900 text-white"} text-[12px] sm:text-[13px] font-medium rounded-full transition-colors cursor-pointer`}
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
          className={`w-full lg:w-[380px] ${isDark ? "bg-[#1e1e1e] border-gray-800" : "bg-white border-gray-200"} border-r flex flex-col`}
        >
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`${msg.role === "user" ? "text-right" : "text-left"}`}
              >
                <div
                  className={`inline-block px-4 py-2.5 rounded-lg text-[14px] ${
                    msg.role === "user"
                      ? isDark
                        ? "bg-white text-black"
                        : "bg-gray-900 text-white"
                      : isDark
                        ? "bg-gray-800 text-gray-200"
                        : "bg-gray-100 text-gray-900"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          {/* Input Bar - Same as Editor Page */}
          <div
            className={`p-4 ${isDark ? "border-gray-800" : "border-gray-200"} border-t`}
          >
            <div
              className={`relative ${isDark ? "bg-[#2d2d30] border-gray-700" : "bg-white border-gray-200"} rounded-xl border-2 shadow-sm hover:shadow-md transition-shadow`}
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
                className={`w-full p-4 pr-14 text-[15px] ${isDark ? "text-white placeholder:text-gray-500 bg-transparent" : "text-gray-900 placeholder:text-gray-400"} resize-none focus:outline-none rounded-xl`}
                rows={2}
              />
              <button
                onClick={handleSend}
                disabled={isGenerating || !input.trim()}
                className={`absolute bottom-3 right-3 w-9 h-9 ${isDark ? "bg-white text-black" : "bg-black text-white"} rounded-full flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:opacity-30`}
              >
                {isGenerating ? (
                  <div
                    className={`w-3.5 h-3.5 border-2 ${isDark ? "border-black border-t-transparent" : "border-white border-t-transparent"} rounded-full animate-spin`}
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
                    className="w-4 h-4"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - Editor */}
        <div
          className={`flex-1 flex flex-col ${isDark ? "bg-[#1e1e1e]" : "bg-white"}`}
        >
          {/* File Tabs */}
          <div
            className={`flex gap-1 p-2 ${isDark ? "bg-[#1e1e1e] border-gray-800" : "bg-gray-50 border-gray-200"} border-b overflow-x-auto`}
          >
            {files.map((file) => (
              <button
                key={file}
                onClick={() => handleTabClick(file)}
                className={`px-4 py-2 text-[13px] rounded-t whitespace-nowrap ${
                  activeFile === file
                    ? isDark
                      ? "bg-[#1e1e1e] text-white border-b-2 border-white"
                      : "bg-white text-gray-900 border-b-2 border-black"
                    : isDark
                      ? "text-gray-400 hover:text-gray-200 hover:bg-[#252526]"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {file}
              </button>
            ))}
          </div>

          {/* Monaco Editor */}
          <div className={`flex-1 ${isDark ? "bg-[#1e1e1e]" : "bg-white"}`}>
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
        </div>
      </div>
    </div>
  );
}
