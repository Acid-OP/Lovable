const navItems = [
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#about", label: "About" },
];

export function NavLinks() {
  return (
    <div className="hidden md:flex items-center gap-6 lg:gap-10">
      {navItems.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className="text-[15px] text-[#000000] hover:opacity-70 transition-opacity"
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
  return (
    <div className="flex flex-col gap-4">
      {navItems.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className="text-[15px] text-[#000000] hover:opacity-70 transition-opacity"
          onClick={onLinkClick}
        >
          {item.label}
        </a>
      ))}
      <button className="w-full px-6 py-2.5 bg-black text-white text-[14px] font-normal rounded-full hover:bg-gray-800 transition-colors">
        Get Started
      </button>
    </div>
  );
}
