import { SITE_CONFIG } from '@/lib/constants';

export default function HeroSection() {
  return (
    <div className="flex-1 flex flex-col items-center justify-start pt-32 px-4 text-center relative">
      
      {/* Badge */}
      {/* <div className="mb-6">
        <span className="bg-black/30 backdrop-blur-2xl px-4 py-2 rounded-full text-sm font-semibold text-white shadow-lg border border-white/30 drop-shadow-lg inline-flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-500 rounded flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">Y</span>
          </div>
          {SITE_CONFIG.badge}
        </span>
      </div> */}

      {/* Main Heading */}
      <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
        {SITE_CONFIG.tagline}
      </h1>

      {/* Subheading */}
      <p className="text-lg md:text-xl text-gray-800 max-w-2xl leading-relaxed">
        {SITE_CONFIG.description.split('\n').map((line, i) => (
          <span key={i}>
            {line}
            {i < SITE_CONFIG.description.split('\n').length - 1 && <br />}
          </span>
        ))}
      </p>

      {/* Scroll Indicator - Absolutely positioned at bottom */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <button className="bg-white/10 hover:bg-white/20 backdrop-blur-xl px-4 py-2 rounded-full border border-white/30 hover:border-white/50 flex items-center justify-center transition-all duration-300 cursor-pointer group">
          <span className="text-white text-xs font-light tracking-wide uppercase leading-none group-hover:tracking-wider transition-all">Scroll ↓</span>
        </button>
      </div>
    </div>
  );
}

