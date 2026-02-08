"use client";

import { useState } from "react";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-5">
          <div className="flex items-center justify-between">
            {/* Logo + Name */}
            <div className="flex items-center gap-2.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 text-[#000000]"
              >
                <line x1="6" x2="6" y1="3" y2="15" />
                <circle cx="18" cy="6" r="3" />
                <circle cx="6" cy="18" r="3" />
                <path d="M18 9a9 9 0 0 1-9 9" />
              </svg>
              <span className="text-[17px] sm:text-[19px] font-medium text-[#000000] tracking-tight">
                Bolt
              </span>
            </div>

            {/* Center Links - Desktop */}
            <div className="hidden md:flex items-center gap-6 lg:gap-10">
              <a
                href="#features"
                className="text-[15px] text-[#000000] hover:opacity-70 transition-opacity"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-[15px] text-[#000000] hover:opacity-70 transition-opacity"
              >
                Pricing
              </a>
              <a
                href="#about"
                className="text-[15px] text-[#000000] hover:opacity-70 transition-opacity"
              >
                About
              </a>
            </div>

            {/* Right - Get Started Button (Desktop) */}
            <div className="hidden md:block">
              <button className="px-5 lg:px-6 py-2.5 bg-black text-white text-[14px] font-normal rounded-full hover:bg-gray-800 transition-colors">
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#000000]"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pt-4 pb-3 border-t border-gray-100 mt-4">
              <div className="flex flex-col gap-4">
                <a
                  href="#features"
                  className="text-[15px] text-[#000000] hover:opacity-70 transition-opacity"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </a>
                <a
                  href="#pricing"
                  className="text-[15px] text-[#000000] hover:opacity-70 transition-opacity"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </a>
                <a
                  href="#about"
                  className="text-[15px] text-[#000000] hover:opacity-70 transition-opacity"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </a>
                <button className="w-full px-6 py-2.5 bg-black text-white text-[14px] font-normal rounded-full hover:bg-gray-800 transition-colors">
                  Get Started
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-16 sm:pt-24 lg:pt-32 pb-12 sm:pb-16 lg:pb-20 px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-[900px] mx-auto">
          {/* Badge */}
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-orange-50 border border-orange-200 rounded-full">
              <div className="w-4 h-4 sm:w-5 sm:h-5 bg-[#FF6600] flex items-center justify-center text-white font-bold text-[10px] sm:text-[11px] rounded-sm">
                Y
              </div>
              <span className="text-[12px] sm:text-[14px] font-medium text-gray-700">
                Not Backed by Y Combinator
              </span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-[36px] sm:text-[48px] lg:text-[72px] font-medium text-[#000000] leading-[1.1] tracking-tight mb-4 sm:mb-6 px-4">
            AI That Builds Apps for You
          </h1>

          {/* Subheading */}
          <p className="text-[16px] sm:text-[18px] lg:text-[20px] text-[#666666] leading-relaxed font-normal mb-8 sm:mb-10 px-4 max-w-[700px] mx-auto">
            Describe your idea and watch it come to life—complete with code,
            design, and deployment
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
            <button className="w-full sm:w-auto px-8 py-3.5 bg-black text-white text-[15px] font-medium rounded-full hover:bg-gray-800 transition-colors">
              Start Building Free
            </button>
            <button className="w-full sm:w-auto px-8 py-3.5 bg-white text-black text-[15px] font-medium rounded-full border border-gray-300 hover:border-gray-400 transition-colors">
              See Live Demo
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
