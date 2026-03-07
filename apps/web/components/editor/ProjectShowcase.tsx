"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const PROJECTS = [
  {
    name: "DrawDeck",
    description:
      "Draw together with built-in video calls and end-to-end encryption. Real-time collaborative canvas.",
    url: "https://drawdeck.xyz",
    image: "/showcase-drawdeck.png",
  },
  {
    name: "Vault",
    description:
      "Exchange platform built for speed and scale. Real-time order books, WebSocket feeds, and Redis-backed matching.",
    url: "https://github.com/Acid-OP/Vault",
    image: "/showcase-vault.png",
  },
  {
    name: "Second Brain",
    description:
      "Save, organize, and share all in one place. Store and access your links with intelligent embeddings.",
    url: "https://secondbrain-hazel.vercel.app/",
    image: "/showcase-secondbrain.png",
  },
  {
    name: "Promptly",
    description:
      "AI coding terminal that generates and runs code from natural language. Describe what you want, get working code.",
    url: "https://github.com/Acid-OP/Promptly",
    image: null,
  },
];

interface ProjectShowcaseProps {
  isDark: boolean;
}

export function ProjectShowcase({ isDark }: ProjectShowcaseProps) {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIdx((cur) => (cur + 1) % PROJECTS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const project = PROJECTS[activeIdx]!;

  return (
    <div
      className="flex flex-col items-center w-full px-5"
      style={{ maxWidth: 520 }}
    >
      <a
        key={project.name}
        href={project.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full rounded-xl overflow-hidden shadow-lg"
        style={{ animation: "cardFadeIn 0.5s ease-out both" }}
      >
        {/* Screenshot image area — no gradient, direct image */}
        <div className="relative w-full overflow-hidden rounded-t-xl">
          {project.image ? (
            <Image
              src={project.image}
              alt={project.name}
              width={520}
              height={280}
              className="w-full block object-cover object-top"
            />
          ) : (
            <div
              className={`w-full ${isDark ? "bg-[#2A2A2A]" : "bg-gray-100"} flex flex-col`}
              style={{ height: 220 }}
            >
              <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-gray-200/10">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
                <div className="ml-3 flex-1 h-4 rounded bg-white/10" />
              </div>
              <div className="flex-1 p-4 space-y-3">
                <div className="h-3.5 rounded bg-white/10 w-1/2" />
                <div className="h-2.5 rounded bg-white/5 w-full" />
                <div className="h-2.5 rounded bg-white/5 w-4/5" />
                <div className="flex gap-2 mt-4">
                  <div className="h-16 flex-1 rounded-lg bg-white/8" />
                  <div className="h-16 flex-1 rounded-lg bg-white/5" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Title + description — matches page bg */}
        <div
          className={`px-5 pt-4 pb-5 ${isDark ? "bg-[#1A1A1A]" : "bg-[#f5f5f0]"}`}
        >
          <h3
            className={`text-[17px] font-semibold tracking-tight mb-1.5 ${isDark ? "text-white" : "text-gray-900"}`}
          >
            {project.name}
          </h3>
          <p
            className={`text-[13px] leading-relaxed ${isDark ? "text-[#888]" : "text-gray-500"}`}
          >
            {project.description}
          </p>
        </div>
      </a>

      {/* Bottom carousel indicator */}
      <div className="flex items-center justify-center gap-1.5 mt-6 mb-2">
        {PROJECTS.map((p, i) => (
          <button
            key={p.name}
            onClick={() => setActiveIdx(i)}
            className={`h-[3px] rounded-full transition-all duration-500 cursor-pointer ${
              i === activeIdx
                ? isDark
                  ? "w-8 bg-white/50"
                  : "w-8 bg-black/30"
                : isDark
                  ? "w-4 bg-white/15"
                  : "w-4 bg-black/10"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
