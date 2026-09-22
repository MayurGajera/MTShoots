import React from 'react';

interface MTShootsLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
  lightMode?: boolean;
  darkMode?: boolean;
}

export const MTShootsLogo: React.FC<MTShootsLogoProps> = ({
  size = 'md',
  showTagline = true,
  className = '',
  lightMode = false,
  darkMode = false
}) => {
  const iconSize = size === 'sm' ? 30 : size === 'lg' ? 46 : 38;

  return (
    <div className={`flex items-center space-x-2.5 select-none ${className}`}>
      {/* Bespoke MTShoots Monogram & Aperture Emblem */}
      <div
        className="relative flex items-center justify-center shrink-0 rounded-xl bg-gradient-to-br from-[#181615] via-[#2D2421] to-[#C85A32] shadow-sm transition-transform hover:scale-105"
        style={{ width: iconSize, height: iconSize }}
      >
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-[82%] h-[82%]"
        >
          {/* Outer Camera Body Contour */}
          <rect
            x="4"
            y="9"
            width="32"
            height="24"
            rx="6"
            stroke="white"
            strokeWidth="2"
            strokeOpacity="0.85"
          />
          {/* Top Viewfinder / Flash Notch */}
          <path
            d="M 14 9 L 16 5 L 24 5 L 26 9"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Stylized 'M' Geometry inside Camera */}
          <path
            d="M 9 26 L 9 14 L 14.5 21 L 20 14 L 20 26"
            stroke="#C85A32"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Stylized 'T' Geometry interlocking with 'M' */}
          <path
            d="M 21 14 L 31 14 M 26 14 L 26 26"
            stroke="#FAF8F5"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Golden Shutter / Focus Dot */}
          <circle cx="30" cy="9" r="1.8" fill="#D9A05B" />
          {/* Lens Aperture Center Indicator */}
          <circle cx="20" cy="20" r="1.5" fill="#D9A05B" />
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col text-left">
        <div className="flex items-baseline space-x-0.5">
          <span className={`font-sans font-black tracking-tight text-xl sm:text-2xl ${darkMode ? 'text-white' : 'text-[#181615]'}`}>
            MT
          </span>
          <span className="font-serif font-bold text-xl sm:text-2xl text-[#C85A32]">
            Shoots
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#D9A05B] inline-block mb-1 ml-0.5" />
        </div>
        {showTagline && (
          <span className={`text-[9.5px] tracking-widest uppercase font-semibold -mt-1 hidden sm:block ${darkMode ? 'text-white/50' : 'text-[#8a726a]'}`}>
            Verified Photography Network
          </span>
        )}
      </div>
    </div>
  );
};
