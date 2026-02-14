import React from "react";
import Image from "next/image";
import FallingStars from "./FallingStars";

interface MountainWithStarsProps {
  isDark?: boolean;
}

export default function MountainWithStars({
  isDark = false,
}: MountainWithStarsProps) {
  return (
    <div className="relative flex items-center justify-center w-full h-full">
      {/* Falling Stars - behind mountain */}
      <div className="absolute inset-0 z-0 overflow-visible">
        <FallingStars />
      </div>

      {/* Mountain Icon - in front of stars */}
      <Image
        src="/icons/mountain-black.png"
        alt="Mountain"
        width={256}
        height={256}
        className="w-64 h-64 object-contain relative z-10"
        style={{
          filter: isDark ? "invert(1) brightness(1.2)" : "none",
        }}
      />
    </div>
  );
}
