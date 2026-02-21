import { Navbar } from "@/components/home/Navbar";
import { HeroSection } from "@/components/home/HeroSection";
import { Quote } from "@/components/home/Quote";
import { Footer } from "@/components/home/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <Navbar />
      <HeroSection />
      <Quote />
      <Footer />
    </div>
  );
}
