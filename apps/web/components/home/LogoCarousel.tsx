"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

const YCombinatorLogo = () => (
  <svg
    viewBox="0 0 256 256"
    style={{ height: 40, width: 40 }}
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid"
  >
    <rect fill="#FB651E" x="0" y="0" width="256" height="256" rx="12" />
    <path
      d="M119.373653,144.745813 L75.43296,62.4315733 L95.5144533,62.4315733 L121.36192,114.52416 C121.759575,115.452022 122.2235,116.413008 122.753707,117.407147 C123.283914,118.401285 123.747838,119.428546 124.145493,120.48896 C124.410597,120.886615 124.609422,121.251127 124.741973,121.582507 C124.874525,121.913886 125.007075,122.212123 125.139627,122.477227 C125.802386,123.802744 126.39886,125.095105 126.929067,126.354347 C127.459274,127.613589 127.923198,128.773399 128.320853,129.833813 C129.381268,127.580433 130.541078,125.1614 131.80032,122.57664 C133.059562,119.99188 134.351922,117.307747 135.67744,114.52416 L161.92256,62.4315733 L180.612267,62.4315733 L136.27392,145.739947 L136.27392,198.826667 L119.373653,198.826667 L119.373653,144.745813 Z"
      fill="#FFFFFF"
    />
  </svg>
);

const BarclaysLogo = () => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    style={{ height: 40, width: 40 }}
  >
    <path
      d="M21.043 3.629a3.235 3.235 0 0 0 -1.048 -0.54 3.076 3.076 0 0 0 -0.937 -0.144h-0.046c-0.413 0.006 -1.184 0.105 -1.701 0.71a1.138 1.138 0 0 0 -0.226 1.023 0.9 0.9 0 0 0 0.555 0.63s0.088 0.032 0.228 0.058c-0.04 0.078 -0.136 0.214 -0.136 0.214 -0.179 0.265 -0.576 0.612 -1.668 0.612h-0.063c-0.578 -0.038 -1.056 -0.189 -1.616 -0.915 -0.347 -0.45 -0.523 -1.207 -0.549 -2.452 -0.022 -0.624 -0.107 -1.165 -0.256 -1.6 -0.1 -0.29 -0.333 -0.596 -0.557 -0.742a2.55 2.55 0 0 0 -0.694 -0.336c-0.373 -0.12 -0.848 -0.14 -1.204 -0.146 -0.462 -0.01 -0.717 0.096 -0.878 0.292 -0.027 0.033 -0.032 0.05 -0.068 0.046 -0.084 -0.006 -0.272 -0.006 -0.328 -0.006 -0.264 0 -0.498 0.043 -0.721 0.09 -0.47 0.1 -0.761 0.295 -1.019 0.503 -0.12 0.095 -0.347 0.365 -0.399 0.653a0.76 0.76 0 0 0 0.097 0.578c0.14 -0.148 0.374 -0.264 0.816 -0.266 0.493 -0.002 1.169 0.224 1.406 0.608 0.336 0.547 0.27 0.99 0.199 1.517 -0.183 1.347 -0.68 2.048 -1.783 2.203 -0.191 0.026 -0.38 0.04 -0.56 0.04 -0.776 0 -1.34 -0.248 -1.63 -0.716a0.71 0.71 0 0 1 -0.088 -0.168s0.087 -0.021 0.163 -0.056c0.294 -0.14 0.514 -0.344 0.594 -0.661 0.09 -0.353 0.004 -0.728 -0.23 -1.007 -0.415 -0.47 -0.991 -0.708 -1.713 -0.708 -0.4 0 -0.755 0.076 -0.982 0.14 -0.908 0.256 -1.633 0.947 -2.214 2.112 -0.412 0.824 -0.7 1.912 -0.81 3.067 -0.11 1.13 -0.056 2.085 0.019 2.949 0.124 1.437 0.363 2.298 0.708 3.22a15.68 15.68 0 0 0 1.609 3.19c0.09 -0.094 0.15 -0.161 0.308 -0.318 0.188 -0.19 0.724 -0.893 0.876 -1.11 0.19 -0.27 0.51 -0.779 0.664 -1.147l0.15 0.119c0.16 0.127 0.252 0.348 0.249 0.592 -0.003 0.215 -0.053 0.464 -0.184 0.922a8.703 8.703 0 0 1 -0.784 1.818c-0.189 0.341 -0.27 0.508 -0.199 0.584 0.015 0.015 0.038 0.03 0.06 0.026 0.116 0 0.34 -0.117 0.585 -0.304 0.222 -0.17 0.813 -0.672 1.527 -1.675a15.449 15.449 0 0 0 1.452 -2.521c0.12 0.046 0.255 0.101 0.317 0.226a0.92 0.92 0 0 1 0.08 0.563c-0.065 0.539 -0.379 1.353 -0.63 1.94 -0.425 0.998 -1.208 2.115 -1.788 2.877 -0.022 0.03 -0.163 0.197 -0.186 0.227 0.9 0.792 1.944 1.555 3.007 2.136 0.725 0.408 2.203 1.162 3.183 1.424 0.98 -0.262 2.458 -1.016 3.184 -1.424a17.063 17.063 0 0 0 3.003 -2.134c-0.05 -0.076 -0.13 -0.158 -0.183 -0.23 -0.582 -0.763 -1.365 -1.881 -1.79 -2.875 -0.25 -0.59 -0.563 -1.405 -0.628 -1.94 -0.028 -0.221 -0.002 -0.417 0.08 -0.565 0.033 -0.098 0.274 -0.218 0.317 -0.226 0.405 0.884 0.887 1.73 1.452 2.522 0.715 1.003 1.306 1.506 1.527 1.674 0.248 0.191 0.467 0.304 0.586 0.304a0.07 0.07 0 0 0 0.044 -0.012c0.094 -0.069 0.017 -0.234 -0.183 -0.594a9.003 9.003 0 0 1 -0.786 -1.822c-0.13 -0.456 -0.18 -0.706 -0.182 -0.92 -0.004 -0.246 0.088 -0.466 0.248 -0.594l0.15 -0.118c0.155 0.373 0.5 0.919 0.665 1.147 0.15 0.216 0.685 0.919 0.876 1.11 0.156 0.158 0.22 0.222 0.308 0.32a15.672 15.672 0 0 0 1.609 -3.19c0.343 -0.923 0.583 -1.784 0.707 -3.222 0.075 -0.86 0.128 -1.81 0.02 -2.948 -0.101 -1.116 -0.404 -2.264 -0.81 -3.068 -0.249 -0.49 -0.605 -1.112 -1.171 -1.566z"
      fill="#000000"
      strokeWidth="1"
    />
  </svg>
);

// Each logo gets a tuned width so visual weight is balanced.
// Square icons get a smaller width, wordmarks get a larger width.
// Order: no two wordmarks adjacent at the loop boundary.
const companies: {
  name: string;
  logo?: string;
  component?: React.FC;
  width: number; // rendered width in px
  height: number; // rendered height in px
  crop?: boolean; // if true, crop to container showing left portion only
}[] = [
  { name: "Y Combinator", component: YCombinatorLogo, width: 40, height: 40 },
  { name: "Lovable", logo: "/lovable.svg", width: 160, height: 28 },
  { name: "Barclays", component: BarclaysLogo, width: 40, height: 40 },
  {
    name: "IgniteTech",
    logo: "/IgniteTech_id9Q3p4e6J_0.png",
    width: 30,
    height: 40,
    crop: true,
  },
  { name: "Apple", logo: "/apple-logo.png", width: 40, height: 40 },
  { name: "Turing", logo: "/Turing_idyH0bVZzp_0.svg", width: 150, height: 22 },
  { name: "Atlassian", logo: "/atlassian.png", width: 40, height: 40 },
];

function LogoItem({ company }: { company: (typeof companies)[number] }) {
  if (company.component) {
    const Comp = company.component;
    return <Comp />;
  }

  // For images with invisible content (e.g. white text on transparent bg),
  // crop to show only the visible portion on the left.
  if (company.crop) {
    return (
      <div
        className="overflow-hidden relative"
        style={{ width: company.width, height: company.height }}
      >
        <Image
          src={company.logo!}
          alt={`${company.name} logo`}
          width={company.width * 5}
          height={company.height}
          style={{
            height: company.height,
            width: "auto",
            position: "absolute",
            left: 0,
            top: 0,
          }}
          className="object-cover object-left"
        />
      </div>
    );
  }

  return (
    <Image
      src={company.logo!}
      alt={`${company.name} logo`}
      width={company.width}
      height={company.height}
      style={{ width: company.width, height: company.height }}
      className="object-contain"
    />
  );
}

export function LogoCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    // 3 identical sets rendered; one set = scrollWidth / 3
    const oneSetWidth = track.scrollWidth / 3;
    track.style.setProperty("--set-width", `${oneSetWidth}px`);
  }, []);

  return (
    <div className="mt-12 sm:mt-16 lg:mt-20 w-full">
      <p className="text-center text-sm text-gray-500 mb-10 font-semibold tracking-[0.2em] uppercase">
        Trusted by developers from
      </p>
      <div className="relative overflow-hidden w-full">
        {/* Fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#f5f5f0] to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#f5f5f0] to-transparent z-10" />

        <div
          ref={trackRef}
          className="flex items-center logo-track"
          style={{ gap: 64 }}
        >
          {[0, 1, 2].map((setIdx) =>
            companies.map((company) => (
              <div
                key={`${company.name}-${setIdx}`}
                className="flex-shrink-0 flex items-center justify-center"
                style={{ height: 40 }}
              >
                <LogoItem company={company} />
              </div>
            )),
          )}
        </div>
      </div>

      {/* eslint-disable-next-line react/no-unknown-property */}
      <style jsx>{`
        @keyframes marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(calc(var(--set-width, 0px) * -1));
          }
        }
        .logo-track {
          animation: marquee 40s linear infinite;
          will-change: transform;
        }
        .logo-track:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
