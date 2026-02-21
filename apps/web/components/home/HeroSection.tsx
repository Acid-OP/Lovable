import { FallingStars } from "./FallingStars";
import { HeroContent } from "./HeroContent";
import { LogoCarousel } from "./LogoCarousel";

export function HeroSection() {
  return (
    <>
      <section className="relative min-h-[calc(100vh-68px)] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden pb-16">
        <FallingStars />
        <HeroContent />
      </section>

      <section className="px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 lg:pb-20">
        <LogoCarousel />
      </section>
    </>
  );
}
