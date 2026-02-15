"use client";

/**
 * DummyPreview – renders sample code files in Monaco for UI testing.
 * Import this in /editor/test to bypass the real backend / SSE pipeline.
 *
 * Usage:
 *   <DummyPreview isDark={isDark} />
 *
 * To remove later: just delete this file and the /editor/test route.
 */

import { useState } from "react";
import Editor from "@monaco-editor/react";
import useMonacoModel from "@/lib/hooks/useMonacoModels";
import type { Monaco } from "@monaco-editor/react";
import type { editor } from "monaco-editor";

/* ---------- sample files ---------- */

const DUMMY_FILES: { path: string; language: string; content: string }[] = [
  {
    path: "App.tsx",
    language: "typescript",
    content: `import React from "react";
import { Hero } from "./components/Hero";
import { Features } from "./components/Features";
import { Footer } from "./components/Footer";
import "./styles/globals.css";

export default function App() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white">
      <Hero />
      <Features />
      <Footer />
    </div>
  );
}
`,
  },
  {
    path: "components/Hero.tsx",
    language: "typescript",
    content: `import React from "react";

export function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-center px-6 pt-32 pb-20 text-center">
      <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight max-w-3xl">
        Build beautiful apps{" "}
        <span className="bg-gradient-to-r from-indigo-500 to-cyan-400 bg-clip-text text-transparent">
          in seconds
        </span>
      </h1>
      <p className="mt-6 text-lg text-gray-500 max-w-xl">
        Describe what you want. We generate production-ready code instantly.
      </p>
      <div className="mt-10 flex gap-4">
        <button className="px-6 py-3 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
          Get Started
        </button>
        <button className="px-6 py-3 border border-gray-300 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors">
          View Demo
        </button>
      </div>
    </section>
  );
}
`,
  },
  {
    path: "components/Features.tsx",
    language: "typescript",
    content: `import React from "react";

const features = [
  {
    title: "Lightning Fast",
    description: "Generate full-stack applications in under 30 seconds.",
    icon: "⚡",
  },
  {
    title: "Production Ready",
    description: "Clean, type-safe code with best practices baked in.",
    icon: "🚀",
  },
  {
    title: "One-Click Deploy",
    description: "Ship to Vercel, Netlify or AWS with a single click.",
    icon: "🌍",
  },
];

export function Features() {
  return (
    <section className="py-24 px-6 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-16">
        Everything you need
      </h2>
      <div className="grid md:grid-cols-3 gap-10">
        {features.map((f) => (
          <div key={f.title} className="text-center space-y-4">
            <span className="text-4xl">{f.icon}</span>
            <h3 className="text-xl font-semibold">{f.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              {f.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
`,
  },
  {
    path: "components/Footer.tsx",
    language: "typescript",
    content: `import React from "react";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 py-10 px-6 text-center text-sm text-gray-400">
      <p>&copy; {new Date().getFullYear()} Bolt. All rights reserved.</p>
    </footer>
  );
}
`,
  },
  {
    path: "styles/globals.css",
    language: "css",
    content: `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #ffffff;
  --foreground: #0a0a0a;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

body {
  font-family: "Inter", system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
`,
  },
];

/* ---------- component ---------- */

interface DummyPreviewProps {
  isDark: boolean;
}

export default function DummyPreview({ isDark }: DummyPreviewProps) {
  const [activeFile, setActiveFile] = useState(DUMMY_FILES[0]!.path);
  const modelsCreatedRef = useState(false);

  const { handleEditorDidMount, createModel, switchToFile } = useMonacoModel();

  function handleMount(ed: editor.IStandaloneCodeEditor, monaco: Monaco) {
    handleEditorDidMount(ed, monaco);

    // Create models for every dummy file (once)
    if (!modelsCreatedRef[0]) {
      DUMMY_FILES.forEach((f) => createModel(f.path, f.content, f.language));
      modelsCreatedRef[1](true);
    }

    // Show the first file
    switchToFile(DUMMY_FILES[0]!.path);
  }

  function handleTabClick(filename: string) {
    switchToFile(filename);
    setActiveFile(filename);
  }

  return (
    <div className="flex flex-col h-full">
      {/* File tabs */}
      <div
        className={`flex gap-1 p-2 ${isDark ? "bg-[#1e1e1e] border-[#333]" : "bg-gray-50 border-gray-200"} border-b overflow-x-auto scrollbar-thin`}
        style={{ minWidth: 0 }}
      >
        {DUMMY_FILES.map((f) => (
          <button
            key={f.path}
            onClick={() => handleTabClick(f.path)}
            className={`flex-shrink-0 px-4 py-2 text-[13px] rounded-t whitespace-nowrap cursor-pointer ${
              activeFile === f.path
                ? isDark
                  ? "bg-[#1e1e1e] text-white border-b-2 border-white"
                  : "bg-white text-gray-900 border-b-2 border-black"
                : isDark
                  ? "text-gray-400 hover:text-gray-200 hover:bg-[#252526]"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            {f.path}
          </button>
        ))}
      </div>

      {/* Monaco editor */}
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
            readOnly: true,
          }}
        />
      </div>
    </div>
  );
}
