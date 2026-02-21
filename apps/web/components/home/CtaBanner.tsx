"use client";

import { useRouter } from "next/navigation";

const defaultPrompt = "Build a portfolio website with dark mode";

export function CtaBanner() {
  const router = useRouter();

  const handleSubmit = () => {
    router.push(`/editor?prompt=${encodeURIComponent(defaultPrompt)}`);
  };

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      <div className="max-w-5xl mx-auto rounded-2xl bg-[#1a1a1a] px-8 sm:px-16 py-16 sm:py-20">
        <h2 className="font-[family-name:var(--font-heading)] text-[28px] sm:text-[36px] lg:text-[48px] font-normal text-white leading-[1.15] tracking-[-0.02em] mb-4">
          Your next app is
          <br />
          one prompt away
        </h2>

        <p className="text-[14px] sm:text-[15px] text-[#555] max-w-md leading-[1.7] mb-10">
          Skip the setup, skip the boilerplate. Describe what you want and watch
          it come to life.
        </p>

        <div className="max-w-lg">
          <div className="relative flex items-center bg-[#252525] rounded-xl border border-[#333]">
            <div className="flex-1 px-5 py-4 text-[14px] text-[#ccc] select-none truncate">
              {defaultPrompt}
            </div>
            <button
              onClick={handleSubmit}
              className="mr-2 w-9 h-9 bg-white text-[#1a1a1a] rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer flex-shrink-0"
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
                  d="M5 12h14m-7-7l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          <p className="text-[12px] text-[#666] mt-3 ml-1">
            Free to start · No credit card required
          </p>
        </div>
      </div>
    </section>
  );
}
