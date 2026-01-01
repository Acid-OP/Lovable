import { SITE_CONFIG } from '@/lib/constants';

export default function HeroSection() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
      
      {/* Badge */}
      <div className="mb-6">
        <span className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium text-gray-800 shadow-md">
          {SITE_CONFIG.badge}
        </span>
      </div>

      {/* Main Heading */}
      <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
        {SITE_CONFIG.tagline}
      </h1>

      {/* Subheading */}
      <p className="text-lg md:text-xl text-gray-800 max-w-2xl mb-10 leading-relaxed">
        {SITE_CONFIG.description.split('\n').map((line, i) => (
          <span key={i}>
            {line}
            {i < SITE_CONFIG.description.split('\n').length - 1 && <br />}
          </span>
        ))}
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mb-12">
        <button className="bg-white text-gray-900 px-8 py-4 rounded-full font-semibold text-base hover:bg-gray-50 transition shadow-lg flex items-center justify-center gap-2">
          {SITE_CONFIG.ctaPrimary}
          <span>→</span>
        </button>
        <button className="bg-white/80 backdrop-blur-md text-gray-900 px-8 py-4 rounded-full font-medium text-base hover:bg-white transition">
          {SITE_CONFIG.ctaSecondary}
        </button>
      </div>

      {/* Scroll Indicator */}
      <div className="mt-auto mb-8">
        <div className="bg-white/20 backdrop-blur-md px-6 py-2 rounded-full">
          <span className="text-white text-sm font-medium tracking-wider">SCROLL ↓</span>
        </div>
      </div>
    </div>
  );
}

