"use client";

import Link from "next/link";
import MountainWithStars from "@/components/MountainWithStars";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f0] flex flex-col">
      {/* Top — Logo + Bolt centered */}
      <div className="pt-10 sm:pt-12 text-center">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-7 h-7 sm:w-8 sm:h-8 text-[#1a1a1a]"
          >
            <line x1="6" x2="6" y1="3" y2="15" />
            <circle cx="18" cy="6" r="3" />
            <circle cx="6" cy="18" r="3" />
            <path d="M18 9a9 9 0 0 1-9 9" />
          </svg>
          <span className="font-[family-name:var(--font-heading)] text-[30px] sm:text-[36px] font-normal text-[#1a1a1a] tracking-[-0.02em]">
            Bolt
          </span>
        </Link>
      </div>

      {/* Main — side by side */}
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-24 px-6 sm:px-12 py-10">
        {/* Left — Mountain + tagline */}
        <div className="flex flex-col items-center flex-shrink-0">
          <div className="relative w-[220px] h-[170px] sm:w-[280px] sm:h-[220px] lg:w-[320px] lg:h-[260px]">
            <MountainWithStars />
          </div>
          <p className="hidden lg:block text-[13px] text-[#999] text-center max-w-[260px] -mt-2 leading-[1.6]">
            Describe what you want. AI writes the code and deploys it.
          </p>
        </div>

        {/* Right — Form */}
        <div className="w-full max-w-[360px]">
          <h1 className="font-[family-name:var(--font-heading)] text-[26px] sm:text-[30px] font-normal text-[#1a1a1a] tracking-[-0.02em] leading-[1.1] mb-1.5 text-center lg:text-left">
            Create your account
          </h1>
          <p className="text-[13px] text-[#aaa] mb-7 text-center lg:text-left">
            Free forever. No credit card needed.
          </p>

          <button className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white border border-[#e5e5e3] rounded-lg text-[13px] font-medium text-[#1a1a1a] hover:border-[#ccc] transition-colors cursor-pointer">
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
            <div className="flex-1 h-px bg-[#e0e0dc]" />
            <span className="text-[10px] text-[#ccc] uppercase tracking-wider">
              or
            </span>
            <div className="flex-1 h-px bg-[#e0e0dc]" />
          </div>

          <form className="space-y-3.5">
            <input
              type="text"
              placeholder="Full name"
              className="w-full px-3.5 py-2.5 bg-white border border-[#e5e5e3] rounded-lg text-[13px] text-[#1a1a1a] placeholder:text-[#bbb] placeholder:font-light outline-none focus:border-[#999] transition-colors"
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full px-3.5 py-2.5 bg-white border border-[#e5e5e3] rounded-lg text-[13px] text-[#1a1a1a] placeholder:text-[#bbb] placeholder:font-light outline-none focus:border-[#999] transition-colors"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-3.5 py-2.5 bg-white border border-[#e5e5e3] rounded-lg text-[13px] text-[#1a1a1a] placeholder:text-[#bbb] placeholder:font-light outline-none focus:border-[#999] transition-colors"
            />
            <button
              type="submit"
              className="w-full py-2.5 bg-[#1a1a1a] text-white text-[13px] font-medium rounded-lg hover:bg-[#2d2d2d] transition-colors cursor-pointer"
            >
              Create account
            </button>
          </form>

          <p className="text-[10px] text-[#ccc] mt-5 text-center lg:text-left">
            By continuing, you agree to our{" "}
            <Link
              href="#"
              className="text-[#aaa] hover:text-[#666] underline underline-offset-2"
            >
              Terms
            </Link>{" "}
            and{" "}
            <Link
              href="#"
              className="text-[#aaa] hover:text-[#666] underline underline-offset-2"
            >
              Privacy Policy
            </Link>
          </p>

          <p className="text-[11px] text-[#bbb] mt-4 text-center lg:text-left">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[#1a1a1a] font-medium hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
