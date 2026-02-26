"use client";

import Image from "next/image";
import { useTheme } from "@/lib/providers/ThemeProvider";
import { FallingStars } from "./FallingStars";
import { HeroContent } from "./HeroContent";
import { LogoCarousel } from "./LogoCarousel";
import { ThreeSteps } from "./ThreeSteps";
import { UseCases } from "./UseCases";
import { CtaBanner } from "./CtaBanner";

export function HeroSection() {
  const { isDark } = useTheme();
  return (
    <>
      <section className="relative min-h-[calc(100vh-68px)] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden pb-24">
        <FallingStars />
        <HeroContent />
      </section>

      <section className="relative px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto mb-16 sm:mb-20">
        <div
          className={`absolute -inset-4 sm:-inset-8 rounded-3xl bg-gradient-to-br ${isDark ? "from-purple-900/20 via-blue-900/15 to-emerald-900/20" : "from-purple-200/30 via-blue-200/20 to-emerald-200/30"} blur-3xl pointer-events-none`}
        />

        <div
          className={`relative rounded-2xl overflow-hidden border ${isDark ? "border-[#2a2a2a]" : "border-[#d8d8d4]"} shadow-[0_20px_70px_-15px_rgba(0,0,0,0.2)] ring-1 ring-black/5`}
        >
          <Image
            src="/editor-preview-v2.png"
            alt="Haven editor workspace showing a personal finance dashboard built with AI"
            width={1920}
            height={1080}
            className="w-full h-auto"
            priority
          />
          <div
            className={`absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t ${isDark ? "from-[#0a0a0a]/40" : "from-[#f5f5f0]/40"} to-transparent pointer-events-none`}
          />
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
        <LogoCarousel />
      </section>

      <ThreeSteps />
      <UseCases />
      <CtaBanner />
    </>
  );
}
