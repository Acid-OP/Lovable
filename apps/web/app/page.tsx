import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import HeroBackground from '@/components/HeroBackground';
import { SITE_CONFIG } from '@/lib/constants';

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      
      <HeroBackground imageUrl={SITE_CONFIG.heroImage} />

      <div className="relative z-10 min-h-screen flex flex-col">
        <Navigation />
        <HeroSection />
      </div>
    </div>
  );
}
