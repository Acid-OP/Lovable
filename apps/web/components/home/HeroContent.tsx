import Link from "next/link";

function ClaudeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M16.604 8.516L12.862 19.5h-2.404l1.27-3.734L8.006 4.5h2.559l2.139 7.696h.065L14.93 4.5h2.56l-2.776 7.734L16.604 8.516Z"
        fill="#D97706"
      />
    </svg>
  );
}

function OpenAIIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073ZM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494ZM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646ZM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872v.024Zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667Zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66v.018ZM8.322 12.814l-2.02-1.164a.08.08 0 0 1-.038-.057V6.01a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.4a.795.795 0 0 0-.393.681l-.004 6.733h.016Zm1.096-2.365l2.602-1.5 2.607 1.5v3.005l-2.607 1.5-2.602-1.5V10.45Z"
        fill="#10A37F"
      />
    </svg>
  );
}

function GeminiIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 0C12 6.627 6.627 12 0 12c6.627 0 12 5.373 12 12 0-6.627 5.373-12 12-12-6.627 0-12-5.373-12-12Z"
        fill="#4285F4"
      />
    </svg>
  );
}

const models = [
  { name: "Claude", icon: ClaudeIcon },
  { name: "GPT-4o", icon: OpenAIIcon },
  { name: "Gemini", icon: GeminiIcon },
];

export function HeroContent() {
  return (
    <div className="relative text-center max-w-[800px] mx-auto">
      <p className="text-[12px] sm:text-[13px] text-[#999] tracking-[0.15em] uppercase mb-6 font-normal">
        now powering 10,000+ apps built with the latest AI models
      </p>

      <h1 className="text-[34px] sm:text-[46px] lg:text-[54px] font-normal text-[#1a1a1a] leading-[1.12] tracking-[-0.02em] mb-6 sm:mb-7">
        Turn your ideas into
        <br />
        full-stack apps
      </h1>

      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 mb-4">
        <span className="text-[14px] text-[#888]">Build with</span>
        {models.map((model) => {
          const Icon = model.icon;
          return (
            <span
              key={model.name}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#e5e5e3] bg-white text-[13px] font-medium text-[#333] shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
            >
              <Icon />
              {model.name}
            </span>
          );
        })}
        <span className="text-[14px] text-[#888]">
          + describe what you want
        </span>
      </div>

      <p className="text-[14px] sm:text-[15px] text-[#999] leading-relaxed font-normal mb-9 sm:mb-10 max-w-[480px] mx-auto">
        Code, design, and deploy complete applications from a single
        conversation
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/editor"
          className="w-full sm:w-auto px-7 py-2.5 bg-[#1a1a1a] text-white text-[14px] font-medium rounded-lg hover:bg-black transition-colors duration-200 cursor-pointer text-center"
        >
          Get Started
        </Link>
        <button className="w-full sm:w-auto px-7 py-2.5 bg-white text-[#1a1a1a] text-[14px] font-medium rounded-lg border border-[#e5e5e3] hover:border-[#ccc] transition-colors duration-200 cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          View Demo
        </button>
      </div>
    </div>
  );
}
