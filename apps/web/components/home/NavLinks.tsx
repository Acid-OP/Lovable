"use client";

import { useTheme } from "@/lib/providers/ThemeProvider";

const navItems = [
  { href: "/features", label: "Features" },
  { href: "/about", label: "About" },
  { href: "/editor", label: "Editor" },
];

export function NavLinks() {
  const { isDark } = useTheme();

  return (
    <div className="hidden md:flex items-center gap-6 lg:gap-10">
      {navItems.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className={`text-[15px] hover:opacity-70 transition-opacity ${isDark ? "text-[#f0f0f0]" : "text-[#000000]"}`}
        >
          {item.label}
        </a>
      ))}
    </div>
  );
}

interface MobileNavLinksProps {
  onLinkClick: () => void;
}

export function MobileNavLinks({ onLinkClick }: MobileNavLinksProps) {
  const { isDark } = useTheme();

  return (
    <div className="flex flex-col gap-4">
      {navItems.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className={`text-[15px] hover:opacity-70 transition-opacity ${isDark ? "text-[#f0f0f0]" : "text-[#000000]"}`}
          onClick={onLinkClick}
        >
          {item.label}
        </a>
      ))}
      <a
        href="/signup"
        onClick={onLinkClick}
        className={`w-full block text-center px-6 py-2.5 text-[13px] font-medium rounded-md transition-colors ${isDark ? "bg-[#f0f0f0] text-[#1a1a1a] hover:bg-[#ffffff]" : "bg-[#2d2d2d] text-white hover:bg-[#222]"}`}
      >
        Get Started →
      </a>
    </div>
  );
}
