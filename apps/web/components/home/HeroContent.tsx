import Link from "next/link";
import { YCBadge } from "./YCBadge";

export function HeroContent() {
  return (
    <div className="relative text-center max-w-[900px] mx-auto">
      <YCBadge />

      {/* Headline */}
      <h1 className="text-[36px] sm:text-[48px] lg:text-[72px] font-medium text-[#000000] leading-[1.1] tracking-tight mb-4 sm:mb-6 px-4">
        AI That Builds Apps for You
      </h1>

      {/* Subheading */}
      <p className="text-[16px] sm:text-[18px] lg:text-[20px] text-[#666666] leading-relaxed font-normal mb-8 sm:mb-10 px-4 max-w-[700px] mx-auto">
        Describe your idea and watch it come to life—complete with code, design,
        and deployment
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
        <Link
          href="/editor"
          className="w-full sm:w-auto px-8 py-3.5 bg-black text-white text-[15px] font-medium rounded-full hover:bg-gray-900 hover:scale-105 transition-all duration-200 cursor-pointer text-center"
        >
          Start Building
        </Link>
        <button className="w-full sm:w-auto px-8 py-3.5 bg-white text-black text-[15px] font-medium rounded-full border border-gray-300 hover:border-black hover:scale-105 transition-all duration-200 cursor-pointer">
          See Live Demo
        </button>
      </div>
    </div>
  );
}
