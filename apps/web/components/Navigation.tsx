import { SITE_CONFIG } from "@/lib/constants";

export default function Navigation() {
  return (
    <nav className="flex justify-center pt-6 md:pt-6">
      <div className="bg-blue-50/35 backdrop-blur-2xl rounded-full px-8 py-1 shadow-xl flex items-center gap-8 border border-blue-200/25">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-linear-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center"></div>
          <span className="font-bold text-gray-900 text-lg">
            {SITE_CONFIG.name}
          </span>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-6">
          {SITE_CONFIG.navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-gray-700 hover:text-gray-900 text-sm font-medium transition"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Login Button */}
        <button className="bg-gray-900 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition">
          Login
        </button>
      </div>
    </nav>
  );
}
