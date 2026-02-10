import { Navbar } from "@/components/home/Navbar";
import { HeroSection } from "@/components/home/HeroSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
    </div>
  );
}
