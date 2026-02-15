"use client";

import { use, useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Editor from "@monaco-editor/react";
import useMonacoModel from "@/lib/hooks/useMonacoModels";
import { useSSEStream } from "@/lib/hooks/useSSEStream";
import { useFetchFiles } from "@/lib/hooks/useFetchFiles";
import { SessionLogsViewer } from "@/components/editor/SessionLogsViewer";
import { useTheme } from "@/lib/providers/ThemeProvider";
import type { Monaco } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import type { FilesData, GeneratedFile } from "@/lib/types/api";

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

  // Refs to prevent duplicate operations
  const modelsCreatedRef = useRef(false);
  const filesFetchedRef = useRef(false);
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  // Callback when logs animation completes
  const handleLogsComplete = useCallback(() => {
    setShowLogs(false);
  }, []);

  const { handleEditorDidMount, createModel, switchToFile, isReady } =
    useMonacoModel();
  const { fetchFiles, error: fetchError } = useFetchFiles();

  // Connect to SSE stream
  const {
    messages: sseMessages,
    isConnected,
    error: sseError,
  } = useSSEStream(jobId);

  // Process SSE messages
  useEffect(() => {
    if (sseMessages.length === 0) return;

    const latestMessage = sseMessages[sseMessages.length - 1];
    if (!latestMessage) return;

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
            content: "✓ Code generation complete!",
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

  // Show SSE connection status in chat
  useEffect(() => {
    if (isConnected) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Connected to session. Starting generation...",
        },
      ]);
    }
  }, [isConnected]);

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

  const handleSend = useCallback(() => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { role: "user", content: input }]);
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

  return (
    <div
      className={`h-screen flex flex-col ${isDark ? "bg-[#1e1e1e]" : "bg-white"}`}
    >
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
        {/* Left Panel - Chat (Fixed Width) */}
        <div
          className={`w-[380px] flex-shrink-0 ${isDark ? "bg-[#1e1e1e] border-[#333]" : "bg-white border-gray-200"} border-r flex flex-col`}
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

          {/* Input Bar - Same as Editor Page */}
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

        {/* Right Panel - Editor/Preview */}
        <div
          className={`flex-1 flex flex-col ${isDark ? "bg-[#1e1e1e]" : "bg-white"}`}
        >
          {/* Tabs Bar - Only show when code is ready */}
          {!showLogs && files.length > 0 && (
            <div
              className={`relative ${isDark ? "bg-[#252526] border-[#3d3d3d]" : "bg-gray-50 border-gray-200"} border-b`}
            >
              {/* Horizontal Scrollable Tabs Container */}
              <div className="relative group">
                {/* Left Gradient Fade */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-8 pointer-events-none z-10 ${
                    isDark
                      ? "bg-gradient-to-r from-[#252526] to-transparent"
                      : "bg-gradient-to-r from-gray-50 to-transparent"
                  }`}
                />

                {/* Tabs Container with Horizontal Scroll */}
                <div
                  ref={tabsContainerRef}
                  className="flex flex-nowrap items-center gap-0.5 px-2 py-1.5 overflow-x-auto scrollbar-hide scroll-smooth"
                  style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                  }}
                >
                  {/* File Tabs */}
                  {files.map((file) => (
                    <button
                      key={file}
                      onClick={() => handleTabClick(file)}
                      className={`group relative flex-shrink-0 px-3 py-1.5 text-[12px] rounded-md whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${
                        activeTab === "code" && activeFile === file
                          ? isDark
                            ? "bg-[#1e1e1e] text-white shadow-sm"
                            : "bg-white text-gray-900 shadow-sm"
                          : isDark
                            ? "text-gray-400 hover:text-gray-200 hover:bg-[#2d2d30]"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      {/* File Icon */}
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

                      {/* Active Indicator */}
                      {activeTab === "code" && activeFile === file && (
                        <div
                          className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                            isDark ? "bg-blue-500" : "bg-blue-600"
                          }`}
                        />
                      )}
                    </button>
                  ))}

                  {/* Divider */}
                  <div
                    className={`flex-shrink-0 w-px h-6 mx-2 ${isDark ? "bg-[#3d3d3d]" : "bg-gray-300"}`}
                  />

                  {/* Preview Tab */}
                  <button
                    onClick={handlePreviewClick}
                    className={`group relative flex-shrink-0 px-3 py-1.5 text-[12px] rounded-md whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${
                      activeTab === "preview"
                        ? isDark
                          ? "bg-[#1e1e1e] text-white shadow-sm"
                          : "bg-white text-gray-900 shadow-sm"
                        : isDark
                          ? "text-gray-400 hover:text-gray-200 hover:bg-[#2d2d30]"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    {/* Preview Icon */}
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
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    <span className="font-medium">Preview</span>

                    {/* Active Indicator */}
                    {activeTab === "preview" && (
                      <div
                        className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                          isDark ? "bg-blue-500" : "bg-blue-600"
                        }`}
                      />
                    )}
                  </button>
                </div>

                {/* Right Gradient Fade */}
                <div
                  className={`absolute right-0 top-0 bottom-0 w-8 pointer-events-none z-10 ${
                    isDark
                      ? "bg-gradient-to-l from-[#252526] to-transparent"
                      : "bg-gradient-to-l from-gray-50 to-transparent"
                  }`}
                />
              </div>
            </div>
          )}

          {/* Content Area - Logs, Editor, or Preview */}
          <div className="flex-1 overflow-hidden">
            {showLogs ? (
              /* Show animated logs while generating */
              <SessionLogsViewer
                messages={sseMessages}
                isDark={isDark}
                onComplete={handleLogsComplete}
              />
            ) : activeTab === "code" ? (
              /* Show Monaco Editor when code tab is active */
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
              /* Show Preview when preview tab is active */
              <div
                className={`h-full flex items-center justify-center ${
                  isDark ? "bg-[#1e1e1e]" : "bg-white"
                }`}
              >
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
                      className={`text-sm font-medium ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Preview Coming Soon
                    </h3>
                    <p
                      className={`text-xs mt-1 ${
                        isDark ? "text-gray-500" : "text-gray-500"
                      }`}
                    >
                      Live preview will be synced here
                    </p>
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
