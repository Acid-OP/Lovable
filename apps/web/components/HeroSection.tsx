'use client';

import { useState } from 'react';
import { SITE_CONFIG } from '@/lib/constants';

export default function HeroSection() {
  const [prompt, setPrompt] = useState('');

  function handleGenerate() {
    if (prompt.trim()) {
      console.log('Generating:', prompt);
      // TODO: Navigate to editor with prompt
      // router.push(`/editor?prompt=${encodeURIComponent(prompt)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleGenerate();
    }
  };
  return (
    <div className="flex-1 flex flex-col items-center justify-start pt-16 px-4 text-center relative">
      
      {/* Badge */}
      <div className="mb-6">
        <span className="bg-black/30 backdrop-blur-2xl px-4 py-2 rounded-full text-sm font-semibold text-white shadow-lg border border-white/30 drop-shadow-lg inline-flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-500 rounded flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">Y</span>
          </div>
          {SITE_CONFIG.badge}
        </span>
      </div>

      {/* Main Heading */}
      <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
        {SITE_CONFIG.tagline}
      </h1>

      {/* Spacer between heading and subheading */}
      <div className="h-4"></div>

      {/* Subheading */}
      <p className="text-lg md:text-xl text-gray-800 max-w-2xl mb-24 leading-relaxed">
        {SITE_CONFIG.description.split('\n').map((line, i) => (
          <span key={i}>
            {line}
            {i < SITE_CONFIG.description.split('\n').length - 1 && <br />}
          </span>
        ))}
      </p>

      {/* Spacer to push input down */}
      <div className="h-32"></div>

      {/* Prompt Input Box */}
      <div className="w-full max-w-3xl text-left">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe what you want to build"
          rows={3}
          className="w-full px-6 pt-4 pb-6 bg-[#f7f4ed] backdrop-blur-xl rounded-3xl transition-all shadow-2xl focus:outline-none focus:ring-0 text-left resize-none"
          style={{ lineHeight: '1.5' }}
          suppressHydrationWarning
        />
        <p className="text-sm text-gray-800 mt-3 text-center font-medium">
          Press <kbd className="px-2 py-1 bg-white/50 backdrop-blur-md rounded text-xs font-mono shadow-sm">Enter</kbd> to generate
        </p>
      </div>

      {/* Scroll Indicator - Absolutely positioned at bottom */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <button 
          className="bg-white/10 hover:bg-white/20 backdrop-blur-xl px-4 py-2 rounded-full border border-white/30 hover:border-white/50 flex items-center justify-center transition-all duration-300 cursor-pointer group"
          suppressHydrationWarning
        >
          <span className="text-white text-xs font-light tracking-wide uppercase leading-none group-hover:tracking-wider transition-all">Scroll ↓</span>
        </button>
      </div>
    </div>
  );
}

