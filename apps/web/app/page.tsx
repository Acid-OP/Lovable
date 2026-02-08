export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-8 py-5">
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
              <span className="text-[19px] font-medium text-[#000000] tracking-tight">
                Bolt
              </span>
            </div>

            {/* Center Links */}
            <div className="flex items-center gap-10">
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

            {/* Right - Get Started Button */}
            <div>
              <button className="px-6 py-2.5 bg-black text-white text-[14px] font-normal rounded-full hover:bg-gray-800 transition-colors">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="pt-20">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Hero Section Coming Next
            </h1>
            <p className="text-gray-600">Clean navbar ready!</p>
          </div>
        </div>
      </main>
    </div>
  );
}
