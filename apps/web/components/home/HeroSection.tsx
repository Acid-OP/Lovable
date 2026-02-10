import { FallingStars } from "./FallingStars";
import { HeroContent } from "./HeroContent";
import { LogoCarousel } from "./LogoCarousel";

export function HeroSection() {
  return (
    <main className="relative pt-16 sm:pt-24 lg:pt-32 pb-12 sm:pb-16 lg:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <FallingStars />
      <HeroContent />
      <LogoCarousel />
    </main>
  );
}
