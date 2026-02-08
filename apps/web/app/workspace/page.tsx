"use client";

import { useState } from "react";
import Link from "next/link";
import Editor from "@monaco-editor/react";
import useMonacoModel from "@/lib/hooks/useMonacoModels";
import type { Monaco } from "@monaco-editor/react";
import type { editor } from "monaco-editor";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function WorkspacePage() {
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
      '// Your React code here\n\nexport default function App() {\n  return (\n    <div className="min-h-screen bg-white">\n      <h1>Portfolio Website</h1>\n    </div>\n  );\n}',
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

    // Simulate AI response
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
    <div className="h-screen flex flex-col bg-white">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 sm:w-5 sm:h-5 text-black"
            >
              <line x1="6" x2="6" y1="3" y2="15" />
              <circle cx="18" cy="6" r="3" />
              <circle cx="6" cy="18" r="3" />
              <path d="M18 9a9 9 0 0 1-9 9" />
            </svg>
            <span className="text-[15px] sm:text-[17px] font-medium text-black tracking-tight">
              Bolt
            </span>
          </Link>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button className="px-3 sm:px-4 py-1.5 text-[12px] sm:text-[13px] text-gray-700 hover:text-black transition-colors">
              Share
            </button>
            <button className="px-3 sm:px-4 py-1.5 bg-black hover:bg-gray-900 text-white text-[12px] sm:text-[13px] font-medium rounded-full transition-colors">
              Deploy
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content - Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Chat */}
        <div className="w-full lg:w-[380px] bg-white border-r border-gray-200 flex flex-col">
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
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          {/* Input Bar - Same as Editor Page */}
          <div className="p-4 border-t border-gray-200">
            <div className="relative bg-white rounded-xl border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow">
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
                className="w-full p-4 pr-14 text-[15px] text-gray-900 placeholder:text-gray-400 resize-none focus:outline-none rounded-xl"
                rows={2}
              />
              <button
                onClick={handleSend}
                disabled={isGenerating || !input.trim()}
                className="absolute bottom-3 right-3 w-9 h-9 bg-black text-white rounded-full flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:opacity-30"
              >
                {isGenerating ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
        <div className="flex-1 flex flex-col bg-white">
          {/* File Tabs */}
          <div className="flex gap-1 p-2 bg-gray-50 border-b border-gray-200 overflow-x-auto">
            {files.map((file) => (
              <button
                key={file}
                onClick={() => handleTabClick(file)}
                className={`px-4 py-2 text-[13px] rounded-t transition whitespace-nowrap ${
                  activeFile === file
                    ? "bg-white text-gray-900 border-b-2 border-black"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {file}
              </button>
            ))}
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 bg-white">
            <Editor
              height="100%"
              theme="vs-light"
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
