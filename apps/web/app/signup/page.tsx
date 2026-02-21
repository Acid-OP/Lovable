"use client";

import Link from "next/link";
import MountainWithStars from "@/components/MountainWithStars";
import { useTheme } from "@/lib/providers/ThemeProvider";

export default function SignupPage() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div
      className={`min-h-screen ${isDark ? "bg-[#1e1e1e]" : "bg-[#f5f5f0]"} flex flex-col transition-colors`}
    >
      {/* Top bar — Logo + Theme toggle */}
      <div className="flex items-center justify-between px-6 sm:px-10 pt-8 sm:pt-10">
        <div />
        <Link href="/" className="inline-flex items-center gap-2.5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`w-7 h-7 sm:w-8 sm:h-8 ${isDark ? "text-white" : "text-[#1a1a1a]"}`}
          >
            <line x1="6" x2="6" y1="3" y2="15" />
            <circle cx="18" cy="6" r="3" />
            <circle cx="6" cy="18" r="3" />
            <path d="M18 9a9 9 0 0 1-9 9" />
          </svg>
          <span
            className={`font-[family-name:var(--font-heading)] text-[30px] sm:text-[36px] font-normal ${isDark ? "text-white" : "text-[#1a1a1a]"} tracking-[-0.02em]`}
          >
            Bolt
          </span>
        </Link>
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-full ${isDark ? "hover:bg-[#2d2d30]" : "hover:bg-[#e8e8e4]"} transition-colors cursor-pointer`}
        >
          {isDark ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 text-gray-400"
            >
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 text-gray-600"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
      </div>

      {/* Main — side by side */}
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-24 px-6 sm:px-12 py-10">
        {/* Left — Mountain + tagline */}
        <div className="flex flex-col items-center flex-shrink-0">
          <div className="relative w-[260px] h-[210px] sm:w-[320px] sm:h-[260px] lg:w-[440px] lg:h-[360px]">
            <MountainWithStars isDark={isDark} />
          </div>
          <p
            className={`hidden lg:block font-[family-name:var(--font-heading)] text-[14px] ${isDark ? "text-[#666]" : "text-[#999]"} text-center max-w-[260px] -mt-16 leading-[1.6] italic`}
          >
            What you can imagine, you can create.
          </p>
        </div>

        {/* Right — Form */}
        <div className="w-full max-w-[360px]">
          <h1
            className={`font-[family-name:var(--font-heading)] text-[26px] sm:text-[30px] font-normal ${isDark ? "text-white" : "text-[#1a1a1a]"} tracking-[-0.02em] leading-[1.1] mb-1.5 text-center`}
          >
            Create your account
          </h1>
          <p
            className={`text-[13px] ${isDark ? "text-[#666]" : "text-[#aaa]"} mb-7 text-center`}
          >
            Get started with Bolt
          </p>

          <button
            className={`w-full flex items-center justify-center gap-3 px-4 py-2.5 ${isDark ? "bg-[#2d2d30] border-[#3d3d3d] text-white hover:border-[#555]" : "bg-white border-[#e5e5e3] text-[#1a1a1a] hover:border-[#ccc]"} border rounded-lg text-[13px] font-medium transition-colors cursor-pointer`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-4 my-6">
            <div
              className={`flex-1 h-px ${isDark ? "bg-[#333]" : "bg-[#e0e0dc]"}`}
            />
            <span
              className={`text-[10px] ${isDark ? "text-[#555]" : "text-[#ccc]"} uppercase tracking-wider`}
            >
              or
            </span>
            <div
              className={`flex-1 h-px ${isDark ? "bg-[#333]" : "bg-[#e0e0dc]"}`}
            />
          </div>

          <form className="space-y-3.5">
            <input
              type="email"
              placeholder="Email"
              className={`w-full px-3.5 py-2.5 ${isDark ? "bg-[#2d2d30] border-[#3d3d3d] text-white placeholder:text-[#666]" : "bg-white border-[#e5e5e3] text-[#1a1a1a] placeholder:text-[#bbb]"} border rounded-lg text-[13px] placeholder:font-light outline-none ${isDark ? "focus:border-[#555]" : "focus:border-[#999]"} transition-colors`}
            />
            <button
              type="submit"
              className={`w-full py-2.5 ${isDark ? "bg-white text-[#1a1a1a] hover:bg-gray-200" : "bg-[#1a1a1a] text-white hover:bg-[#2d2d2d]"} text-[13px] font-medium rounded-lg transition-colors cursor-pointer`}
            >
              Continue
            </button>
          </form>

          <p
            className={`text-[11px] ${isDark ? "text-[#555]" : "text-[#888]"} mt-5 text-center`}
          >
            By continuing, you agree to our{" "}
            <Link
              href="#"
              className={`${isDark ? "text-[#777] hover:text-white" : "text-[#666] hover:text-[#1a1a1a]"} underline underline-offset-2`}
            >
              Terms
            </Link>{" "}
            and{" "}
            <Link
              href="#"
              className={`${isDark ? "text-[#777] hover:text-white" : "text-[#666] hover:text-[#1a1a1a]"} underline underline-offset-2`}
            >
              Privacy Policy
            </Link>
          </p>

          <p
            className={`text-[12px] ${isDark ? "text-[#666]" : "text-[#888]"} mt-4 text-center`}
          >
            Already have an account?{" "}
            <Link
              href="/login"
              className={`${isDark ? "text-white" : "text-[#1a1a1a]"} font-medium hover:underline`}
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
