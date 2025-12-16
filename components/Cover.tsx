
import React from 'react';

import { MANUAL_TITLE } from '../constants';

interface CoverProps {
  onStart: () => void;
}

const Cover: React.FC<CoverProps> = ({ onStart }) => {
  return (
    <div className="relative h-screen w-full overflow-hidden flex flex-col justify-between text-blue-900 font-sans bg-white border-[12px] border-double border-blue-900/10 m-0 box-border shadow-2xl">
      
      {/* 1. TOP HEADER: Logo & Company Name (Aligned Top Left as per PDF) */}
      <div className="relative z-30 pt-10 px-8 md:px-12 flex items-center space-x-4">
        {/* Replaced with Image Logo as requested */}
        <img 
            src="/spic_logo_banner.png" 
            alt="SPIC Logo" 
            className="h-16 md:h-20 w-auto object-contain"
            onError={(e) => {
                // Fallback to text if image fails
                e.currentTarget.style.display = 'none';
                const fallback = document.getElementById('logo-fallback');
                if (fallback) fallback.classList.remove('hidden');
                if (fallback) fallback.classList.add('flex');
            }}
        />
        
        {/* Fallback: Original Logo Representation (Hidden by default) */}
        <div id="logo-fallback" className="hidden items-center space-x-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-red-600 rounded-full shadow-sm flex items-center justify-center border-2 border-white ring-1 ring-gray-100 flex-shrink-0">
            <span className="font-bold text-white text-[10px] md:text-xs">SPIC</span>
            </div>
            {/* Company Name */}
            <div className="flex flex-col">
            <h2 className="text-blue-900 font-bold text-xs md:text-sm tracking-wide leading-tight">
                国家电投国际投资开发（几内亚）有限责任公司
            </h2>
            <span className="text-[10px] text-blue-800/60 font-medium uppercase tracking-wider">
                SPIC INTERNATIONAL INVESTMENT & DEVELOPMENT (GUINEA) CO., LTD
            </span>
            </div>
        </div>
      </div>

      {/* 2. MAIN TITLE SECTION: Centered in the white space */}
      <div className="relative z-20 flex flex-col items-center text-center mt-12 md:mt-16 px-4">
        <h1 className="text-4xl md:text-6xl font-black text-blue-950 tracking-tight font-serif mb-4 drop-shadow-sm">
          {MANUAL_TITLE}
        </h1>
        
        {/* Date & Dept */}
        <div className="flex flex-col items-center space-y-2 mt-8">
          <p className="text-xl md:text-2xl font-bold text-slate-800 tracking-wide font-serif">人力资源部编制</p>
          <p className="text-base md:text-lg text-slate-600 font-medium tracking-widest">2025 年 12 月</p>
        </div>
      </div>

      {/* 3. BOTTOM IMAGE: Anchored to Bottom with Gradient Fade */}
      <div 
        className="absolute bottom-0 left-0 w-full h-[75%] z-0 pointer-events-none"
        style={{
          // Precise mask: Top 30% is transparent (shows white bg), Bottom 70% shows image
          maskImage: 'linear-gradient(to bottom, transparent 0%, transparent 25%, black 60%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, transparent 25%, black 60%)'
        }}
      >
        {/* The Image: Aerial View - Green Land Left, Blue Sea Right */}
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-no-repeat transition-transform duration-[40s] hover:scale-105 origin-bottom"
          style={{ 
            // Using an image with land on left and sea on right to match the upload
            backgroundImage: `url('https://images.unsplash.com/photo-1616489370603-92f7e025f38e?q=80&w=2070&auto=format&fit=crop')`,
            backgroundPosition: 'center 20%', // Shift to show the coastline clearly
            filter: 'brightness(1.05) contrast(1.1) saturate(1.3)' 
          }}
        />
        {/* Subtle Overlay to unify colors */}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/10 to-transparent mix-blend-overlay"></div>
      </div>

      {/* 4. BUTTON: Floating comfortably above the bottom edge */}
      <div className="relative z-30 w-full pb-16 md:pb-24 flex justify-center">
        <button
          onClick={onStart}
          className="group relative px-10 py-4 bg-blue-900 text-white font-bold text-lg rounded-full shadow-[0_15px_40px_-10px_rgba(30,58,138,0.4)] hover:shadow-blue-900/50 transition-all duration-300 transform hover:-translate-y-1 focus:outline-none ring-4 ring-white/60 backdrop-blur-sm overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-800 to-indigo-900 transition-opacity group-hover:opacity-90"></div>
          <span className="flex items-center space-x-2 relative z-10">
            <span>开启旅程</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        </button>
      </div>

    </div>
  );
};

export default Cover;
