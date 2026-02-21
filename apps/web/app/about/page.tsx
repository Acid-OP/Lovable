import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/home/Navbar";
import { Footer } from "@/components/home/Footer";

const timeline = [
  {
    period: "The Problem",
    text: "Building apps required weeks of setup, boilerplate, and DevOps. Non-technical founders couldn't ship ideas. Developers spent more time configuring than creating.",
  },
  {
    period: "The Idea",
    text: "What if you could describe an app in plain English and have AI write the entire codebase — frontend, logic, styling — in under a minute? Not snippets. Not templates. A real, working app.",
  },
  {
    period: "Bolt Was Born",
    text: "A full-stack AI editor that combines the best language models (Claude, GPT, Gemini, Perplexity) with a live preview, Monaco code editor, and one-click deploy. Built by one person, for everyone.",
  },
];

const values = [
  {
    title: "Speed over ceremony",
    description:
      "Ship first, polish later. Every feature in Bolt is designed to reduce the gap between idea and live app to seconds.",
  },
  {
    title: "Transparency",
    description:
      "You own the code. Every line is visible, editable, and exportable. No black boxes, no lock-in.",
  },
  {
    title: "Accessible to everyone",
    description:
      "You don't need to be a developer to build software. If you can describe what you want, you can ship it.",
  },
  {
    title: "Always improving",
    description:
      "New models, better prompts, faster builds. Bolt evolves constantly — because AI doesn't stand still, and neither do we.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <Navbar />

      {/* Hero */}
      <section className="px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32 pb-16 sm:pb-20">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[11px] sm:text-[12px] font-medium text-[#aaa] tracking-widest uppercase mb-5">
            About
          </p>
          <h1 className="font-[family-name:var(--font-heading)] text-[32px] sm:text-[42px] lg:text-[52px] font-normal text-[#1a1a1a] leading-[1.1] tracking-[-0.02em] mb-5">
            Built by one person, for everyone
          </h1>
          <p className="text-[14px] sm:text-[16px] text-[#888] leading-[1.7] max-w-xl mx-auto">
            Bolt is a solo project born out of frustration with how slow and
            painful it is to go from an idea to a working app. This is my
            attempt to fix that.
          </p>
        </div>
      </section>

      {/* Creator section */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 p-8 sm:p-10 rounded-2xl bg-white border border-[#e5e5e3]">
            <Image
              src="/gaurav-avatar.jpg"
              alt="Gaurav Kapur"
              width={80}
              height={80}
              className="w-20 h-20 rounded-full object-cover flex-shrink-0"
            />
            <div>
              <h2 className="text-[18px] sm:text-[20px] font-semibold text-[#1a1a1a] mb-1">
                Gaurav Kapur
              </h2>
              <p className="text-[13px] text-[#aaa] mb-4">
                Creator & Solo Developer
              </p>
              <p className="text-[14px] text-[#666] leading-[1.8]">
                I&apos;m a developer who believes the best tools should feel
                invisible. I built Bolt because I wanted a faster way to
                prototype, iterate, and ship — without drowning in
                configuration. Every line of this product was written by me,
                with a lot of help from the AI models that power it.
              </p>
              <div className="flex items-center gap-4 mt-5">
                <a
                  href="https://github.com/Acid-OP"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[12px] text-[#aaa] hover:text-[#555] transition-colors underline underline-offset-2"
                >
                  GitHub
                </a>
                <a
                  href="https://x.com/GauravKapurr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[12px] text-[#aaa] hover:text-[#555] transition-colors underline underline-offset-2"
                >
                  X / Twitter
                </a>
                <a
                  href="https://www.linkedin.com/in/gaurav-kapur-a3286b258/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[12px] text-[#aaa] hover:text-[#555] transition-colors underline underline-offset-2"
                >
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story / Timeline */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-t border-[#e8e8e4]">
        <div className="max-w-3xl mx-auto">
          <p className="text-[11px] sm:text-[12px] font-medium text-[#aaa] tracking-widest uppercase mb-4 text-center">
            The Story
          </p>
          <h2 className="font-[family-name:var(--font-heading)] text-[24px] sm:text-[32px] font-normal text-[#1a1a1a] leading-[1.2] tracking-[-0.02em] text-center mb-14">
            Why Bolt exists
          </h2>

          <div className="space-y-0">
            {timeline.map((item, i) => (
              <div
                key={item.period}
                className={`flex gap-6 sm:gap-8 ${i < timeline.length - 1 ? "pb-10" : ""}`}
              >
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#1a1a1a]" />
                  {i < timeline.length - 1 && (
                    <div className="w-px flex-1 bg-[#e5e5e3] mt-2" />
                  )}
                </div>
                <div className="pb-2">
                  <h3 className="text-[15px] font-semibold text-[#1a1a1a] mb-2">
                    {item.period}
                  </h3>
                  <p className="text-[13px] text-[#888] leading-[1.7]">
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-t border-[#e8e8e4]">
        <div className="max-w-4xl mx-auto">
          <p className="text-[11px] sm:text-[12px] font-medium text-[#aaa] tracking-widest uppercase mb-4 text-center">
            Principles
          </p>
          <h2 className="font-[family-name:var(--font-heading)] text-[24px] sm:text-[32px] font-normal text-[#1a1a1a] leading-[1.2] tracking-[-0.02em] text-center mb-14">
            What drives this project
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#e5e5e3] rounded-2xl overflow-hidden">
            {values.map((value) => (
              <div key={value.title} className="bg-[#f5f5f0] p-8 sm:p-10">
                <h3 className="text-[15px] font-semibold text-[#1a1a1a] mb-2.5">
                  {value.title}
                </h3>
                <p className="text-[13px] text-[#888] leading-[1.7]">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-t border-[#e8e8e4]">
        <div className="max-w-2xl mx-auto text-center">
          <p className="font-[family-name:var(--font-heading)] text-[18px] sm:text-[24px] text-[#555] leading-[1.6] tracking-[-0.01em] italic">
            &ldquo;Work until the people who doubted you become the ones
            bragging about knowing you.&rdquo;
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20 sm:pb-28">
        <div className="max-w-5xl mx-auto rounded-2xl bg-[#1a1a1a] px-8 sm:px-12 py-14 sm:py-18 text-center">
          <h2 className="font-[family-name:var(--font-heading)] text-[24px] sm:text-[32px] font-normal text-white leading-[1.2] tracking-[-0.02em] mb-3">
            See it in action
          </h2>
          <p className="text-[13px] text-[#666] mb-8">
            The best way to understand Bolt is to try it yourself.
          </p>
          <Link
            href="/editor"
            className="inline-block px-7 py-3 bg-white text-[#1a1a1a] text-[14px] font-medium rounded-md hover:bg-gray-100 transition-colors"
          >
            Open the Editor →
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
