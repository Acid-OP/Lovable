"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "@/lib/providers/ThemeProvider";
import { Logo } from "./Logo";
import { NavLinks, MobileNavLinks } from "./NavLinks";
import { MobileMenuButton } from "./MobileMenuButton";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  return (
    <nav
      className={`border-b ${isDark ? "border-[#2a2a2a]" : "border-[#e8e8e3]"}`}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-5">
        <div className="flex items-center justify-between">
          <Logo />
          <NavLinks />

          {/* Right - Theme Toggle + Get Started Button (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-md transition-colors ${isDark ? "hover:bg-white/10" : "hover:bg-black/5"}`}
              aria-label="Toggle theme"
            >
              {isDark ? (
                <svg
                  className="w-4 h-4 text-[#f0f0f0]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4 text-[#1a1a1a]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>
            <Link
              href="/signup"
              className={`px-5 lg:px-6 py-2 text-[13px] font-medium rounded-md transition-colors ${isDark ? "bg-[#f0f0f0] text-[#1a1a1a] hover:bg-[#ffffff]" : "bg-[#2d2d2d] text-white hover:bg-[#222]"}`}
            >
              Get Started →
            </Link>
          </div>

          <MobileMenuButton
            isOpen={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          />
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div
            className={`md:hidden pt-4 pb-3 border-t mt-4 ${isDark ? "border-gray-800" : "border-gray-100"}`}
          >
            <MobileNavLinks onLinkClick={() => setMobileMenuOpen(false)} />
          </div>
        )}
      </div>
    </nav>
  );
}
