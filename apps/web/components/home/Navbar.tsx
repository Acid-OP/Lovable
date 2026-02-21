"use client";

import { useState } from "react";
import { Logo } from "./Logo";
import { NavLinks, MobileNavLinks } from "./NavLinks";
import { MobileMenuButton } from "./MobileMenuButton";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="border-b border-[#e8e8e3]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-5">
        <div className="flex items-center justify-between">
          <Logo />
          <NavLinks />

          {/* Right - Get Started Button (Desktop) */}
          <div className="hidden md:block">
            <button className="px-5 lg:px-6 py-2 bg-[#2d2d2d] text-white text-[13px] font-medium rounded-md hover:bg-[#222] transition-colors">
              Get Started →
            </button>
          </div>

          <MobileMenuButton
            isOpen={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          />
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-4 pb-3 border-t border-gray-100 mt-4">
            <MobileNavLinks onLinkClick={() => setMobileMenuOpen(false)} />
          </div>
        )}
      </div>
    </nav>
  );
}
