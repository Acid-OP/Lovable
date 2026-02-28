"use client";

import { use, useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Editor from "@monaco-editor/react";
import useMonacoModel from "@/lib/hooks/useMonacoModels";
import { useSSEStream } from "@/lib/hooks/useSSEStream";
import { useFetchFiles } from "@/lib/hooks/useFetchFiles";
import { useSubmitPrompt } from "@/lib/hooks/useSubmitPrompt";
import { RisingLogsLoader } from "@/components/editor/RisingLogsLoader";
import { useTheme } from "@/lib/providers/ThemeProvider";
import type { Monaco } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import type { FilesData, GeneratedFile } from "@/lib/types/api";
import type { Message } from "@/lib/types/editor";

interface WorkspacePageProps {
  params: Promise<{
    jobId: string;
  }>;
}

export default function WorkspacePage({ params }: WorkspacePageProps) {
  const { jobId } = use(params);
  const searchParams = useSearchParams();
  const userPrompt = searchParams.get("prompt") || "create a portfolio website";

  const { isDark, toggleTheme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "user",
      content: userPrompt,
    },
  ]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(true);
  const [activeFile, setActiveFile] = useState("index.tsx");
  const [files, setFiles] = useState<string[]>([]);
  const [showLogs, setShowLogs] = useState(true);
  const [filesData, setFilesData] = useState<FilesData | null>(null);
  const [activeTab, setActiveTab] = useState<"code" | "preview">("code");
  const [mobilePanel, setMobilePanel] = useState<"chat" | "editor">("editor");
  const [isRuntimeChecking, setIsRuntimeChecking] = useState(false);
  const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false);

  // Refs to prevent duplicate operations
  const modelsCreatedRef = useRef(false);
  const filesFetchedRef = useRef(false);
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const runtimeReportSentRef = useRef(false);

  // Callback when logs animation completes
  const handleLogsComplete = useCallback(() => {
    setShowLogs(false);
  }, []);

  const { handleEditorDidMount, createModel, switchToFile, isReady } =
    useMonacoModel();
  const { fetchFiles, error: fetchError } = useFetchFiles();
  const { submitPrompt } = useSubmitPrompt();

  // Connect to SSE stream
  const {
    messages: sseMessages,
    error: sseError,
    reconnect,
  } = useSSEStream(jobId);

  // Process SSE messages
  useEffect(() => {
    if (sseMessages.length === 0) return;

    const latestMessage = sseMessages[sseMessages.length - 1];
    if (!latestMessage) return;

    // Handle runtime check signal from orchestrator
    if (latestMessage.runtimeCheck === "start") {
      runtimeReportSentRef.current = false;
      setIsRuntimeChecking(true);
    }

    // Handle completion - fetch files from API (only once)
    if (
      (latestMessage.type === "complete" ||
        latestMessage.status === "complete" ||
        latestMessage.status === "completed") &&
      !filesFetchedRef.current
    ) {
      setIsGenerating(false);
      filesFetchedRef.current = true;

      // Fetch files from API endpoint
      fetchFiles(jobId).then((data) => {
        if (!data) {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: "Error: Failed to load generated files",
            },
          ]);
          return;
        }

        // Store files data - models will be created when Monaco is ready
        setFilesData(data);

        // Extract and set file names for tabs
        const fileNames = data.files.map((f) => f.path);
        setFiles(fileNames);
        if (fileNames[0]) {
          setActiveFile(fileNames[0]);
        }

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Done! Your application is ready.",
          },
        ]);
      });
    }

    // Handle errors
    if (latestMessage.type === "error") {
      setIsGenerating(false);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Error: ${latestMessage.content || "Something went wrong"}`,
        },
      ]);
    }
  }, [sseMessages, jobId, fetchFiles, createModel]);

  // Show SSE errors in chat
  useEffect(() => {
    if (sseError) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Connection error: ${sseError}`,
        },
      ]);
    }
  }, [sseError]);

  // Show file fetch errors in chat
  useEffect(() => {
    if (fetchError) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Error loading files: ${fetchError}`,
        },
      ]);
    }
  }, [fetchError]);

  // Listen for postMessage from the error bridge inside the iframe
  useEffect(() => {
    if (!isRuntimeChecking) return;

    function handleMessage(event: MessageEvent) {
      if (event.data?.type !== "__ERROR_BRIDGE_REPORT__") return;
      if (runtimeReportSentRef.current) return;
      runtimeReportSentRef.current = true;

      const { errors, url, timestamp } = event.data;

      fetch(`/api/runtime-report/${jobId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ errors, url, timestamp }),
      }).catch((err) => {
        console.error("Failed to send runtime report:", err);
      });

      setIsRuntimeChecking(false);
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [isRuntimeChecking, jobId]);

  // Create Monaco models when both files are fetched AND Monaco is ready
  useEffect(() => {
    if (!filesData || !isReady || modelsCreatedRef.current) return;

    filesData.files.forEach((file: GeneratedFile) => {
      createModel(file.path, file.content, file.language);
    });

    modelsCreatedRef.current = true;

    // Switch to the first file
    if (filesData.files[0]) {
      switchToFile(filesData.files[0].path);
    }
  }, [filesData, isReady, createModel, switchToFile]);

  const handleMount = useCallback(
    (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
      handleEditorDidMount(editor, monaco);
    },
    [handleEditorDidMount],
  );

  const handleSend = useCallback(async () => {
    if (!input.trim() || isGenerating) return;

    const prompt = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: prompt }]);
    setInput("");
    setIsGenerating(true);
    setShowLogs(true);

    // Reset refs so files get re-fetched and models re-created on completion
    filesFetchedRef.current = false;
    modelsCreatedRef.current = false;
    runtimeReportSentRef.current = false;

    // Reconnect SSE before submitting so we catch all messages
    reconnect();

    const result = await submitPrompt(prompt, jobId);

    if (!result) {
      setIsGenerating(false);
      setShowLogs(false);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Failed to submit prompt. Please try again.",
        },
      ]);
    }
  }, [input, isGenerating, jobId, submitPrompt, reconnect]);

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

  return (
    <div
      className={`h-screen flex flex-col ${isDark ? "bg-[#1e1e1e]" : "bg-[#f5f5f0]"}`}
    >
      {/* Top Navbar */}
      <nav
        className={`${isDark ? "bg-[#1e1e1e] border-[#333]" : "bg-[#f5f5f0] border-[#e5e5e3]"} border-b`}
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
            {/* Mobile Panel Toggle — visible only on small screens */}
            <div className="flex md:hidden items-center gap-1">
              <button
                onClick={() => setMobilePanel("chat")}
                className={`px-2.5 py-1 text-[12px] font-medium rounded-md cursor-pointer ${
                  mobilePanel === "chat"
                    ? isDark
                      ? "bg-[#2d2d30] text-white"
                      : "bg-white text-black border border-[#e5e5e3]"
                    : isDark
                      ? "text-gray-500"
                      : "text-gray-400"
                }`}
              >
                Chat
              </button>
              <button
                onClick={() => setMobilePanel("editor")}
                className={`px-2.5 py-1 text-[12px] font-medium rounded-md cursor-pointer ${
                  mobilePanel === "editor"
                    ? isDark
                      ? "bg-[#2d2d30] text-white"
                      : "bg-white text-black border border-[#e5e5e3]"
                    : isDark
                      ? "text-gray-500"
                      : "text-gray-400"
                }`}
              >
                Editor
              </button>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full cursor-pointer ${
                isDark ? "hover:bg-[#2d2d30]" : "hover:bg-gray-100"
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
              className={`hidden sm:inline-block px-3 sm:px-4 py-1.5 text-[12px] sm:text-[13px] ${isDark ? "text-gray-400 hover:text-white" : "text-gray-700 hover:text-black"} transition-colors cursor-pointer`}
            >
              Share
            </button>
            <button
              className={`hidden sm:inline-block px-3 sm:px-4 py-1.5 ${isDark ? "bg-white hover:bg-gray-200 text-black" : "bg-[#2d2d2d] hover:bg-[#222] text-white"} text-[12px] sm:text-[13px] font-medium rounded-md transition-colors cursor-pointer`}
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
          className={`${
            mobilePanel === "chat" ? "flex" : "hidden"
          } md:flex w-full md:w-[300px] lg:w-[380px] flex-shrink-0 ${isDark ? "bg-[#1e1e1e] border-[#333]" : "bg-[#f5f5f0] border-[#e5e5e3]"} md:border-r flex-col`}
        >
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div
                key={`msg-${i}`}
                className={`${msg.role === "user" ? "text-right" : "text-left"}`}
              >
                <div
                  className={`inline-block max-w-[85%] px-4 py-3 rounded-xl text-[13px] leading-[1.6] text-left ${
                    msg.role === "user"
                      ? isDark
                        ? "bg-white text-black rounded-br-sm"
                        : "bg-[#2d2d2d] text-white rounded-br-sm"
                      : isDark
                        ? "bg-[#2a2a2a] text-gray-200 rounded-bl-sm"
                        : "bg-white border border-[#e5e5e3] text-gray-800 rounded-bl-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Minimal loader while building */}
            {isGenerating && (
              <div className="text-left">
                <div
                  className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg ${
                    isDark ? "bg-[#2a2a2a]" : "bg-white border border-[#e5e5e3]"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${isDark ? "bg-neutral-400" : "bg-neutral-500"}`}
                    style={{ animation: "chatDot 1.4s ease-in-out infinite" }}
                  />
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${isDark ? "bg-neutral-400" : "bg-neutral-500"}`}
                    style={{
                      animation: "chatDot 1.4s ease-in-out 0.2s infinite",
                    }}
                  />
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${isDark ? "bg-neutral-400" : "bg-neutral-500"}`}
                    style={{
                      animation: "chatDot 1.4s ease-in-out 0.4s infinite",
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Input Bar - Same as Editor Page */}
          <div
            className={`p-4 ${isDark ? "border-[#333]" : "border-[#e5e5e3]"} border-t`}
          >
            <div
              className={`relative ${isDark ? "bg-[#2d2d30] border-[#3d3d3d] focus-within:border-[#555555]" : "bg-white border-[#e5e5e3] focus-within:border-[#ccc]"} rounded-xl border-2 shadow-sm hover:shadow-md transition-shadow`}
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
                disabled={isGenerating || !input.trim()}
                className={`absolute bottom-3 right-3 w-9 h-9 ${isDark ? "bg-white text-black" : "bg-[#2d2d2d] text-white"} rounded-full flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:opacity-30`}
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

        {/* Right Panel - Editor/Preview */}
        <div
          className={`${
            mobilePanel === "editor" ? "flex" : "hidden"
          } md:flex flex-1 min-w-0 flex-col ${isDark ? "bg-[#1e1e1e]" : "bg-[#f5f5f0]"}`}
        >
          {/* Top-Level Tabs: Code | Preview */}
          {!showLogs && (
            <div
              className={`flex items-center ${isDark ? "bg-[#252526] border-[#3d3d3d]" : "bg-[#eeeeea] border-[#e5e5e3]"} border-b`}
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
                    className={`absolute bottom-0 left-0 right-0 h-0.5 ${isDark ? "bg-white" : "bg-[#2d2d2d]"}`}
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
                    className={`absolute bottom-0 left-0 right-0 h-0.5 ${isDark ? "bg-white" : "bg-[#2d2d2d]"}`}
                  />
                )}
              </button>
            </div>
          )}

          {/* File Tabs Bar (only when Code tab is active and files exist) */}
          {!showLogs && activeTab === "code" && files.length > 0 && (
            <div
              className={`relative ${isDark ? "bg-[#1e1e1e] border-[#333]" : "bg-[#f5f5f0] border-[#e5e5e3]"} border-b`}
            >
              <div className="relative group">
                {/* Left Gradient */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-8 pointer-events-none z-10 ${
                    isDark
                      ? "bg-gradient-to-r from-[#1e1e1e] to-transparent"
                      : "bg-gradient-to-r from-[#f5f5f0] to-transparent"
                  }`}
                />

                {/* Scrollable File Tabs */}
                <div
                  ref={tabsContainerRef}
                  className={`flex flex-nowrap items-center gap-0.5 px-2 pt-1 pb-1.5 overflow-x-auto scroll-smooth ${isDark ? "file-tabs-scroll-dark" : "file-tabs-scroll-light"}`}
                >
                  {files.map((file) => (
                    <button
                      key={file}
                      onClick={() => handleTabClick(file)}
                      className={`group relative flex-shrink-0 px-3 py-1.5 text-[12px] rounded-md whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                        activeFile === file
                          ? isDark
                            ? "bg-[#2d2d30] text-white"
                            : "bg-white text-gray-900 border border-[#e5e5e3]"
                          : isDark
                            ? "text-gray-400 hover:text-gray-200 hover:bg-[#2d2d30]"
                            : "text-gray-500 hover:text-gray-900 hover:bg-white"
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
                      <span className="font-medium">{file}</span>
                    </button>
                  ))}
                </div>

                {/* Right Gradient */}
                <div
                  className={`absolute right-0 top-0 bottom-0 w-8 pointer-events-none z-10 ${
                    isDark
                      ? "bg-gradient-to-l from-[#1e1e1e] to-transparent"
                      : "bg-gradient-to-l from-[#f5f5f0] to-transparent"
                  }`}
                />
              </div>
            </div>
          )}

          {/* Content Area - Logs, Editor, or Preview */}
          <div className="flex-1 overflow-hidden relative">
            {showLogs && (
              <RisingLogsLoader
                messages={sseMessages}
                isDark={isDark}
                onComplete={handleLogsComplete}
              />
            )}

            {/* Code Editor - always mounted, hidden via CSS to preserve Monaco state */}
            <div
              className={`h-full ${isDark ? "bg-[#1e1e1e]" : "bg-[#f5f5f0]"} ${showLogs || activeTab !== "code" ? "hidden" : ""}`}
            >
              <Editor
                height="100%"
                theme={isDark ? "vs-dark" : "vs-light"}
                onMount={handleMount}
                options={{
                  readOnly: true,
                  fontSize: 14,
                  minimap: { enabled: false },
                  padding: { top: 16 },
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            </div>

            {/* Preview - always mounted after logs complete, hidden via CSS */}
            {!showLogs && (
              <div
                className={`h-full flex flex-col ${isDark ? "bg-[#1e1e1e]" : "bg-[#f5f5f0]"} ${activeTab !== "preview" ? "hidden" : ""}`}
              >
                {/* URL bar */}
                <div
                  className={`flex items-center gap-2 px-4 py-2 ${isDark ? "bg-[#252526] border-[#3d3d3d]" : "bg-[#eeeeea] border-[#e5e5e3]"} border-b`}
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
                        : "bg-white text-gray-500 border border-[#e5e5e3]"
                    }`}
                  >
                    localhost:3000
                  </div>
                  <button
                    className={`p-1 rounded ${isDark ? "hover:bg-[#3d3d3d] text-gray-400" : "hover:bg-[#e5e5e3] text-gray-500"}`}
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
                  <button
                    onClick={() => setIsPreviewFullscreen(true)}
                    className={`p-1 rounded cursor-pointer ${isDark ? "hover:bg-[#3d3d3d] text-gray-400" : "hover:bg-[#e5e5e3] text-gray-500"}`}
                    title="Fullscreen preview"
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
                        d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
                      />
                    </svg>
                  </button>
                </div>

                {/* Preview iframe */}
                <iframe
                  src={`http://sandbox-${jobId}.localhost:3003`}
                  className="flex-1 w-full border-0"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"
                  allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone; midi; payment; usb"
                  title="Live Preview"
                />
              </div>
            )}

            {/* Hidden iframe for runtime error checking (behind the loader) */}
            {isRuntimeChecking && showLogs && (
              <iframe
                src={`http://sandbox-${jobId}.localhost:3003`}
                className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"
                title="Runtime Check"
              />
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Preview Overlay */}
      {isPreviewFullscreen && (
        <div
          className="fixed inset-0 z-50 flex flex-col"
          style={{ background: isDark ? "#1e1e1e" : "#f5f5f0" }}
        >
          <div
            className={`flex items-center gap-2 px-4 py-2.5 ${isDark ? "bg-[#252526] border-[#3d3d3d]" : "bg-[#eeeeea] border-[#e5e5e3]"} border-b`}
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
              className={`flex-1 mx-3 px-3 py-1 rounded-md text-[12px] ${isDark ? "bg-[#1e1e1e] text-gray-400 border border-[#3d3d3d]" : "bg-white text-gray-500 border border-[#e5e5e3]"}`}
            >
              localhost:3000
            </div>
            <button
              onClick={() => setIsPreviewFullscreen(false)}
              className={`p-1.5 rounded cursor-pointer ${isDark ? "hover:bg-[#3d3d3d] text-gray-400" : "hover:bg-[#e5e5e3] text-gray-500"}`}
              title="Exit fullscreen"
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
                  d="M9 4H4m0 0v5m0-5l5 5m6-5h5m0 0v5m0-5l-5 5M9 20H4m0 0v-5m0 5l5-5m6 5h5m0 0v-5m0 5l-5-5"
                />
              </svg>
            </button>
          </div>
          <iframe
            src={`http://sandbox-${jobId}.localhost:3003`}
            className="flex-1 w-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"
            allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone; midi; payment; usb"
            title="Live Preview Fullscreen"
          />
        </div>
      )}

      <style>{`
        @keyframes chatDot {
          0%, 80%, 100% { opacity: 0.25; transform: scale(0.85); }
          40% { opacity: 1; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}
