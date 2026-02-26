"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { useTheme } from "@/lib/providers/ThemeProvider";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const YCombinatorLogo = (_props: { isDark?: boolean }) => (
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

const BarclaysLogo = ({ isDark }: { isDark?: boolean }) => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    style={{ height: 40, width: 40 }}
  >
    <path
      d="M21.043 3.629a3.235 3.235 0 0 0 -1.048 -0.54 3.076 3.076 0 0 0 -0.937 -0.144h-0.046c-0.413 0.006 -1.184 0.105 -1.701 0.71a1.138 1.138 0 0 0 -0.226 1.023 0.9 0.9 0 0 0 0.555 0.63s0.088 0.032 0.228 0.058c-0.04 0.078 -0.136 0.214 -0.136 0.214 -0.179 0.265 -0.576 0.612 -1.668 0.612h-0.063c-0.578 -0.038 -1.056 -0.189 -1.616 -0.915 -0.347 -0.45 -0.523 -1.207 -0.549 -2.452 -0.022 -0.624 -0.107 -1.165 -0.256 -1.6 -0.1 -0.29 -0.333 -0.596 -0.557 -0.742a2.55 2.55 0 0 0 -0.694 -0.336c-0.373 -0.12 -0.848 -0.14 -1.204 -0.146 -0.462 -0.01 -0.717 0.096 -0.878 0.292 -0.027 0.033 -0.032 0.05 -0.068 0.046 -0.084 -0.006 -0.272 -0.006 -0.328 -0.006 -0.264 0 -0.498 0.043 -0.721 0.09 -0.47 0.1 -0.761 0.295 -1.019 0.503 -0.12 0.095 -0.347 0.365 -0.399 0.653a0.76 0.76 0 0 0 0.097 0.578c0.14 -0.148 0.374 -0.264 0.816 -0.266 0.493 -0.002 1.169 0.224 1.406 0.608 0.336 0.547 0.27 0.99 0.199 1.517 -0.183 1.347 -0.68 2.048 -1.783 2.203 -0.191 0.026 -0.38 0.04 -0.56 0.04 -0.776 0 -1.34 -0.248 -1.63 -0.716a0.71 0.71 0 0 1 -0.088 -0.168s0.087 -0.021 0.163 -0.056c0.294 -0.14 0.514 -0.344 0.594 -0.661 0.09 -0.353 0.004 -0.728 -0.23 -1.007 -0.415 -0.47 -0.991 -0.708 -1.713 -0.708 -0.4 0 -0.755 0.076 -0.982 0.14 -0.908 0.256 -1.633 0.947 -2.214 2.112 -0.412 0.824 -0.7 1.912 -0.81 3.067 -0.11 1.13 -0.056 2.085 0.019 2.949 0.124 1.437 0.363 2.298 0.708 3.22a15.68 15.68 0 0 0 1.609 3.19c0.09 -0.094 0.15 -0.161 0.308 -0.318 0.188 -0.19 0.724 -0.893 0.876 -1.11 0.19 -0.27 0.51 -0.779 0.664 -1.147l0.15 0.119c0.16 0.127 0.252 0.348 0.249 0.592 -0.003 0.215 -0.053 0.464 -0.184 0.922a8.703 8.703 0 0 1 -0.784 1.818c-0.189 0.341 -0.27 0.508 -0.199 0.584 0.015 0.015 0.038 0.03 0.06 0.026 0.116 0 0.34 -0.117 0.585 -0.304 0.222 -0.17 0.813 -0.672 1.527 -1.675a15.449 15.449 0 0 0 1.452 -2.521c0.12 0.046 0.255 0.101 0.317 0.226a0.92 0.92 0 0 1 0.08 0.563c-0.065 0.539 -0.379 1.353 -0.63 1.94 -0.425 0.998 -1.208 2.115 -1.788 2.877 -0.022 0.03 -0.163 0.197 -0.186 0.227 0.9 0.792 1.944 1.555 3.007 2.136 0.725 0.408 2.203 1.162 3.183 1.424 0.98 -0.262 2.458 -1.016 3.184 -1.424a17.063 17.063 0 0 0 3.003 -2.134c-0.05 -0.076 -0.13 -0.158 -0.183 -0.23 -0.582 -0.763 -1.365 -1.881 -1.79 -2.875 -0.25 -0.59 -0.563 -1.405 -0.628 -1.94 -0.028 -0.221 -0.002 -0.417 0.08 -0.565 0.033 -0.098 0.274 -0.218 0.317 -0.226 0.405 0.884 0.887 1.73 1.452 2.522 0.715 1.003 1.306 1.506 1.527 1.674 0.248 0.191 0.467 0.304 0.586 0.304a0.07 0.07 0 0 0 0.044 -0.012c0.094 -0.069 0.017 -0.234 -0.183 -0.594a9.003 9.003 0 0 1 -0.786 -1.822c-0.13 -0.456 -0.18 -0.706 -0.182 -0.92 -0.004 -0.246 0.088 -0.466 0.248 -0.594l0.15 -0.118c0.155 0.373 0.5 0.919 0.665 1.147 0.15 0.216 0.685 0.919 0.876 1.11 0.156 0.158 0.22 0.222 0.308 0.32a15.672 15.672 0 0 0 1.609 -3.19c0.343 -0.923 0.583 -1.784 0.707 -3.222 0.075 -0.86 0.128 -1.81 0.02 -2.948 -0.101 -1.116 -0.404 -2.264 -0.81 -3.068 -0.249 -0.49 -0.605 -1.112 -1.171 -1.566z"
      fill={isDark ? "#ffffff" : "#000000"}
      strokeWidth="1"
    />
  </svg>
);

const LovableLogo = ({ isDark }: { isDark?: boolean }) => {
  const textFill = isDark ? "#ffffff" : "#000000";
  return (
    <svg
      width="160"
      height="28"
      viewBox="0 0 911 155"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M857.05 154.384C845.795 154.384 836.016 152.238 827.715 147.947C819.414 143.585 812.942 137.043 808.299 128.32C803.727 119.597 801.44 108.798 801.44 95.9247C801.44 83.6841 803.832 73.1319 808.616 64.2681C813.4 55.3339 820.012 48.5453 828.454 43.9024C836.896 39.2594 846.498 36.9379 857.262 36.9379C867.603 36.9379 876.783 39.1891 884.803 43.6913C892.822 48.1936 899.048 54.7359 903.48 63.3184C907.982 71.9008 910.233 82.1716 910.233 94.1308C910.233 98.422 910.198 101.834 910.128 104.366H826.027V82.2068H889.762L877.733 86.3222C877.733 80.5536 876.889 75.7348 875.2 71.8657C873.582 67.9262 871.19 64.9716 868.025 63.0018C864.859 61.0321 861.025 60.0472 856.523 60.0472C851.81 60.0472 847.659 61.208 844.071 63.5294C840.554 65.7806 837.81 69.1573 835.841 73.6595C833.941 78.1618 832.991 83.5786 832.991 89.9099V100.779C832.991 107.251 833.976 112.738 835.946 117.24C837.916 121.742 840.73 125.154 844.388 127.476C848.046 129.727 852.372 130.852 857.367 130.852C862.854 130.852 867.392 129.445 870.979 126.632C874.567 123.747 876.818 119.702 877.733 114.496H909.706C908.721 122.657 905.942 129.727 901.37 135.706C896.867 141.686 890.853 146.294 883.325 149.53C875.798 152.766 867.04 154.384 857.05 154.384Z"
        fill={textFill}
      />
      <path
        d="M759.904 0.00286865H791.877V151.321H759.904V0.00286865Z"
        fill={textFill}
      />
      <path
        d="M705.496 154.381C699.446 154.381 694.029 153.326 689.246 151.216C684.532 149.105 680.523 145.94 677.216 141.719C673.91 137.428 671.448 132.151 669.83 125.89L673.206 126.84V151.321H641.55V39.9957H673.523V64.8988L669.935 65.532C671.553 59.5524 674.015 54.4522 677.322 50.2313C680.698 45.9401 684.814 42.6689 689.668 40.4177C694.522 38.0963 699.974 36.9355 706.024 36.9355C715.099 36.9355 722.977 39.2922 729.661 44.0055C736.344 48.7188 741.479 55.5074 745.067 64.3712C748.654 73.1647 750.448 83.6114 750.448 95.7112C750.448 107.741 748.619 118.187 744.961 127.051C741.303 135.845 736.062 142.598 729.238 147.311C722.485 152.025 714.571 154.381 705.496 154.381ZM695.577 130.006C700.361 130.006 704.37 128.599 707.606 125.785C710.913 122.971 713.375 118.996 714.993 113.861C716.681 108.726 717.526 102.676 717.526 95.7112C717.526 88.7468 716.681 82.6968 714.993 77.5614C713.375 72.426 710.913 68.4514 707.606 65.6375C704.37 62.7532 700.361 61.3111 695.577 61.3111C690.864 61.3111 686.819 62.7532 683.442 65.6375C680.136 68.4514 677.638 72.4612 675.95 77.667C674.262 82.8024 673.417 88.8171 673.417 95.7112C673.417 102.676 674.262 108.726 675.95 113.861C677.638 118.996 680.136 122.971 683.442 125.785C686.819 128.599 690.864 130.006 695.577 130.006ZM641.55 0.00286865H673.523V39.9957H641.55V0.00286865Z"
        fill={textFill}
      />
      <path
        d="M561.296 154.384C554.331 154.384 548.07 153.012 542.513 150.268C537.026 147.525 532.699 143.621 529.534 138.555C526.438 133.42 524.891 127.441 524.891 120.617C524.891 110.205 527.951 102.256 534.071 96.7688C540.191 91.2113 549.02 87.5884 560.557 85.9001L579.868 83.1565C583.737 82.5937 586.797 81.8902 589.048 81.0461C591.299 80.2019 592.952 79.0763 594.007 77.6694C595.063 76.1921 595.59 74.3278 595.59 72.0767C595.59 69.7552 594.957 67.6448 593.691 65.7454C592.495 63.7757 590.666 62.228 588.204 61.1024C585.812 59.9065 582.892 59.3086 579.445 59.3086C573.958 59.3086 569.562 60.7507 566.255 63.635C562.949 66.4489 561.155 70.318 560.874 75.2424H527.845C528.127 67.7855 530.378 61.1728 534.599 55.4043C538.89 49.5654 544.834 45.0279 552.432 41.7919C560.029 38.5559 568.823 36.9379 578.812 36.9379C589.294 36.9379 598.158 38.6615 605.404 42.1085C612.65 45.4852 618.102 50.3392 621.76 56.6705C625.488 63.0018 627.352 70.5642 627.352 79.3577V125.787C627.352 130.782 627.704 135.425 628.408 139.716C629.181 143.937 630.272 146.61 631.679 147.736V151.324H598.439C597.666 148.299 597.068 144.887 596.646 141.088C596.223 137.289 595.977 133.279 595.907 129.059L601.077 126.843C599.741 131.837 597.279 136.445 593.691 140.666C590.173 144.816 585.636 148.158 580.079 150.69C574.591 153.153 568.33 154.384 561.296 154.384ZM573.114 130.958C577.616 130.958 581.591 129.973 585.038 128.003C588.485 125.963 591.123 123.149 592.952 119.562C594.852 115.974 595.801 111.894 595.801 107.321V92.759L598.439 94.2363C596.751 96.4874 594.641 98.211 592.108 99.4069C589.646 100.603 586.304 101.623 582.083 102.467L573.958 104.05C568.542 105.105 564.461 106.723 561.718 108.904C559.045 111.085 557.708 114.145 557.708 118.084C557.708 122.024 559.15 125.154 562.034 127.476C564.919 129.797 568.612 130.958 573.114 130.958Z"
        fill={textFill}
      />
      <path
        d="M416.143 39.9976H450.121L479.35 135.495H469.115L497.183 39.9976H530.212L491.696 151.323H456.135L416.143 39.9976Z"
        fill={textFill}
      />
      <path
        d="M366.162 154.384C355.117 154.384 345.409 151.992 337.038 147.208C328.736 142.425 322.3 135.601 317.727 126.737C313.225 117.873 310.974 107.497 310.974 95.6081C310.974 83.7193 313.225 73.3781 317.727 64.5847C322.3 55.7208 328.736 48.8971 337.038 44.1134C345.409 39.3298 355.117 36.9379 366.162 36.9379C377.206 36.9379 386.879 39.3298 395.18 44.1134C403.481 48.8971 409.883 55.7208 414.385 64.5847C418.958 73.3781 421.244 83.7193 421.244 95.6081C421.244 107.497 418.958 117.873 414.385 126.737C409.883 135.601 403.481 142.425 395.18 147.208C386.879 151.992 377.206 154.384 366.162 154.384ZM366.162 129.903C370.805 129.903 374.779 128.636 378.086 126.104C381.392 123.501 383.924 119.667 385.683 114.602C387.442 109.467 388.321 103.135 388.321 95.6081C388.321 84.4228 386.387 75.9458 382.517 70.1773C378.648 64.3384 373.196 61.419 366.162 61.419C361.519 61.419 357.509 62.7204 354.132 65.3233C350.826 67.8558 348.293 71.6898 346.535 76.8252C344.776 81.8902 343.896 88.1512 343.896 95.6081C343.896 103.065 344.776 109.361 346.535 114.496C348.293 119.632 350.826 123.501 354.132 126.104C357.509 128.636 361.519 129.903 366.162 129.903Z"
        fill={textFill}
      />
      <path
        d="M217.513 0.00192261H250.647V127.741L244.737 120.882C244.737 120.882 261.148 120.882 289.379 120.882C317.609 120.882 313.749 151.32 313.749 151.32H217.513V0.00192261Z"
        fill={textFill}
      />
      {/* Icon — colorful gradient, always visible */}
      <mask
        id="mask0_logo"
        style={{ maskType: "alpha" }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="149"
        height="152"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M44.6502 0C69.3099 0 89.3004 20.0433 89.3004 44.7679V61.7825H104.16C128.82 61.7825 148.81 81.8258 148.81 106.55C148.81 131.275 128.82 151.318 104.16 151.318H0V44.7679C0 20.0433 19.9906 0 44.6502 0Z"
          fill="url(#paint0_logo)"
        />
      </mask>
      <g mask="url(#mask0_logo)">
        <g filter="url(#f0_logo)">
          <circle cx="65.2812" cy="80.7667" r="100.733" fill="#4B73FF" />
        </g>
        <g filter="url(#f1_logo)">
          <ellipse
            cx="76.3487"
            cy="25.4884"
            rx="129.012"
            ry="100.733"
            fill="#FF66F4"
          />
        </g>
        <g filter="url(#f2_logo)">
          <ellipse
            cx="97.3926"
            cy="6.53951"
            rx="100.733"
            ry="88.4654"
            fill="#FF0105"
          />
        </g>
        <g filter="url(#f3_logo)">
          <circle cx="78.1432" cy="25.4679" r="60.5807" fill="#FE7B02" />
        </g>
      </g>
      <defs>
        <filter
          id="f0_logo"
          x="-80.5968"
          y="-65.1113"
          width="291.756"
          height="291.756"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="bg" />
          <feBlend in="SourceGraphic" in2="bg" result="shape" />
          <feGaussianBlur stdDeviation="22.5723" result="blur" />
        </filter>
        <filter
          id="f1_logo"
          x="-97.8078"
          y="-120.39"
          width="348.313"
          height="291.756"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="bg" />
          <feBlend in="SourceGraphic" in2="bg" result="shape" />
          <feGaussianBlur stdDeviation="22.5723" result="blur" />
        </filter>
        <filter
          id="f2_logo"
          x="-48.4855"
          y="-127.071"
          width="291.756"
          height="267.22"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="bg" />
          <feBlend in="SourceGraphic" in2="bg" result="shape" />
          <feGaussianBlur stdDeviation="22.5723" result="blur" />
        </filter>
        <filter
          id="f3_logo"
          x="-27.5822"
          y="-80.2574"
          width="211.451"
          height="211.451"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="bg" />
          <feBlend in="SourceGraphic" in2="bg" result="shape" />
          <feGaussianBlur stdDeviation="22.5723" result="blur" />
        </filter>
        <linearGradient
          id="paint0_logo"
          x1="50.0774"
          y1="26.5915"
          x2="95.4144"
          y2="151.261"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.025" stopColor="#FF8E63" />
          <stop offset="0.56" stopColor="#FF7EB0" />
          <stop offset="0.95" stopColor="#4B73FF" />
        </linearGradient>
      </defs>
    </svg>
  );
};

// Each logo gets a tuned width so visual weight is balanced.
// Square icons get a smaller width, wordmarks get a larger width.
// Order: no two wordmarks adjacent at the loop boundary.
const companies: {
  name: string;
  logo?: string;
  component?: React.FC<{ isDark?: boolean }>;
  width: number;
  height: number;
  crop?: boolean;
  wordmark?: boolean; // text-only logos that need full color inversion in dark mode
}[] = [
  { name: "Y Combinator", component: YCombinatorLogo, width: 40, height: 40 },
  { name: "Lovable", component: LovableLogo, width: 160, height: 28 },
  { name: "Barclays", component: BarclaysLogo, width: 40, height: 40 },
  {
    name: "IgniteTech",
    logo: "/IgniteTech_id9Q3p4e6J_0.png",
    width: 30,
    height: 40,
    crop: true,
  },
  {
    name: "Apple",
    logo: "/apple-logo.png",
    width: 40,
    height: 40,
    wordmark: true,
  },
  {
    name: "Turing",
    logo: "/Turing_idyH0bVZzp_0.svg",
    width: 150,
    height: 22,
    wordmark: true,
  },
  { name: "Atlassian", logo: "/atlassian.png", width: 40, height: 40 },
];

function LogoItem({
  company,
  isDark,
}: {
  company: (typeof companies)[number];
  isDark: boolean;
}) {
  if (company.component) {
    const Comp = company.component;
    return <Comp isDark={isDark} />;
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
  const { isDark } = useTheme();
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const measure = () => {
      const oneSetWidth = track.scrollWidth / 3;
      track.style.setProperty("--set-width", `${oneSetWidth}px`);
    };

    // Measure after fonts/SVGs have rendered
    measure();
    const raf = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(raf);
  }, [isDark]);

  return (
    <div className="mt-12 sm:mt-16 lg:mt-20 w-full">
      <p className="text-center text-sm text-gray-500 mb-10 font-semibold tracking-[0.2em] uppercase">
        Trusted by developers from
      </p>
      <div className="relative overflow-hidden w-full">
        {/* Fade edges */}
        <div
          className={`pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r ${isDark ? "from-[#0a0a0a]" : "from-[#f5f5f0]"} to-transparent z-10`}
        />
        <div
          className={`pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l ${isDark ? "from-[#0a0a0a]" : "from-[#f5f5f0]"} to-transparent z-10`}
        />

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
                style={{
                  height: 40,
                  width: company.width,
                  transform: "translateZ(0)",
                  filter:
                    company.wordmark && isDark
                      ? "brightness(0) invert(1)"
                      : "none",
                }}
              >
                <LogoItem company={company} isDark={isDark} />
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
