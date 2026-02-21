import Link from "next/link";
import { Navbar } from "@/components/home/Navbar";
import { Footer } from "@/components/home/Footer";

const features = [
  {
    title: "AI-Powered Code Generation",
    description:
      "Describe what you want in plain English. Our AI understands your intent and writes clean, production-ready code — no pseudocode, no placeholders.",
    detail:
      "Supports React, Next.js, Tailwind, and more out of the box. The AI generates complete file structures with proper imports, types, and styling.",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
        />
      </svg>
    ),
  },
  {
    title: "Live Preview",
    description:
      "See your app render in real-time as the AI builds it. No waiting for builds or deploys — the preview updates instantly as code is generated.",
    detail:
      "The iframe sandbox renders your app exactly as it would in production, with hot-reload on every code change.",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
  {
    title: "Multi-File Editor",
    description:
      "Full Monaco-powered code editor with syntax highlighting, multi-file support, and tab navigation. Read, understand, and edit the generated code.",
    detail:
      "The same editor that powers VS Code — with IntelliSense, bracket matching, and keyboard shortcuts you already know.",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
        />
      </svg>
    ),
  },
  {
    title: "Conversational Iteration",
    description:
      "Not happy with the result? Just tell the AI what to change. Iterate through conversation — no need to start over or manually edit code.",
    detail:
      "The AI remembers your entire conversation context. Ask for tweaks, new features, or complete redesigns — all within the same session.",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
        />
      </svg>
    ),
  },
  {
    title: "Multiple AI Models",
    description:
      "Powered by the best models in the industry — Claude, GPT, Gemini, and Perplexity. Each prompt is handled by the model best suited for the task.",
    detail:
      "We route your prompts to the right model automatically, so you get the best output without worrying about which API to call.",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
        />
      </svg>
    ),
  },
  {
    title: "One-Click Deploy",
    description:
      "Ship your app to production with a single click. No CI/CD pipelines to configure, no hosting to set up — just build and deploy.",
    detail:
      "Get a live URL in seconds. Share it with your team, embed it in a portfolio, or hand it off to a client — zero DevOps required.",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
        />
      </svg>
    ),
  },
];

const stats = [
  { value: "4", label: "AI models powering every prompt" },
  { value: "<60s", label: "To generate a full-stack app" },
  { value: "∞", label: "Follow-up iterations, no limits" },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <Navbar />

      {/* Hero */}
      <section className="px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32 pb-16 sm:pb-20">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[11px] sm:text-[12px] font-medium text-[#aaa] tracking-widest uppercase mb-5">
            Features
          </p>
          <h1 className="font-[family-name:var(--font-heading)] text-[32px] sm:text-[42px] lg:text-[52px] font-normal text-[#1a1a1a] leading-[1.1] tracking-[-0.02em] mb-5">
            Everything you need to build, iterate, and ship
          </h1>
          <p className="text-[14px] sm:text-[16px] text-[#888] leading-[1.7] max-w-xl mx-auto mb-10">
            A complete AI-powered development environment. Go from a single
            sentence to a deployed, production-ready app with AI in minutes.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/editor"
              className="px-6 py-2.5 bg-[#2d2d2d] text-white text-[14px] font-medium rounded-md hover:bg-[#3d3d3d] transition-colors"
            >
              Try the Editor
            </Link>
            <a
              href="#all-features"
              className="px-6 py-2.5 bg-white text-[#1a1a1a] text-[14px] font-medium rounded-md border border-[#e5e5e3] hover:border-[#ccc] transition-colors"
            >
              See All Features
            </a>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
        <div className="max-w-2xl mx-auto flex items-center justify-center">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`flex-1 text-center py-6 ${i < stats.length - 1 ? "border-r border-[#e5e5e3]" : ""}`}
            >
              <p className="text-[28px] sm:text-[36px] font-semibold text-[#1a1a1a] leading-none mb-1.5">
                {stat.value}
              </p>
              <p className="text-[12px] text-[#aaa] tracking-wide">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works - visual flow */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-t border-[#e8e8e4]">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] sm:text-[12px] font-medium text-[#aaa] tracking-widest uppercase mb-4 text-center">
            How it works
          </p>
          <h2 className="font-[family-name:var(--font-heading)] text-[24px] sm:text-[32px] font-normal text-[#1a1a1a] leading-[1.2] tracking-[-0.02em] text-center mb-14">
            Three steps. One prompt.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px">
            {[
              {
                step: "01",
                title: "Describe",
                text: "Type a natural-language prompt describing the app you want. Be as specific or as vague as you like — the AI adapts.",
              },
              {
                step: "02",
                title: "Generate",
                text: "The AI writes full-stack code in real-time. Watch the editor populate with files while the live preview renders your app side-by-side.",
              },
              {
                step: "03",
                title: "Ship",
                text: "Review the code, iterate with follow-up prompts, then deploy to a live URL with a single click. Done.",
              },
            ].map((item, i) => (
              <div
                key={item.step}
                className={`p-8 ${i < 2 ? "md:border-r border-[#e5e5e3]" : ""}`}
              >
                <span className="text-[11px] font-mono text-[#bbb] tracking-widest">
                  {item.step}
                </span>
                <h3 className="text-[18px] font-semibold text-[#1a1a1a] mt-3 mb-3">
                  {item.title}
                </h3>
                <p className="text-[13px] text-[#888] leading-[1.7]">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section
        id="all-features"
        className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-[#e8e8e4] scroll-mt-20"
      >
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] sm:text-[12px] font-medium text-[#aaa] tracking-widest uppercase mb-4 text-center">
            Capabilities
          </p>
          <h2 className="font-[family-name:var(--font-heading)] text-[24px] sm:text-[32px] font-normal text-[#1a1a1a] leading-[1.2] tracking-[-0.02em] text-center mb-14">
            Built for speed, designed for clarity
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#e5e5e3] rounded-2xl overflow-hidden">
            {features.map((feature) => (
              <div key={feature.title} className="bg-[#f5f5f0] p-8 sm:p-10">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#e5e5e3] flex items-center justify-center text-[#555] mb-5">
                  {feature.icon}
                </div>
                <h3 className="text-[16px] sm:text-[17px] font-semibold text-[#1a1a1a] mb-2">
                  {feature.title}
                </h3>
                <p className="text-[13px] text-[#888] leading-[1.7] mb-3">
                  {feature.description}
                </p>
                <p className="text-[12px] text-[#aaa] leading-[1.6]">
                  {feature.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20 sm:pb-28">
        <div className="max-w-5xl mx-auto rounded-2xl bg-[#1a1a1a] px-8 sm:px-12 py-14 sm:py-18 text-center">
          <h2 className="font-[family-name:var(--font-heading)] text-[24px] sm:text-[32px] font-normal text-white leading-[1.2] tracking-[-0.02em] mb-3">
            Ready to try it?
          </h2>
          <p className="text-[13px] text-[#666] mb-8">
            Go from idea to deployed app in under a minute. Free to start, no
            credit card required.
          </p>
          <Link
            href="/editor"
            className="inline-block px-7 py-3 bg-white text-[#1a1a1a] text-[14px] font-medium rounded-md hover:bg-gray-100 transition-colors"
          >
            Start Building →
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
