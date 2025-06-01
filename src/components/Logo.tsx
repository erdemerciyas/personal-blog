import React from 'react';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  isDark?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = '', width = 40, height = 40, isDark = false }) => {
  const textColor = isDark ? 'text-slate-800' : 'text-white';
  const iconColor = isDark ? '#0F766E' : '#14B8A6';
  const accentColor = isDark ? '#0F766E' : '#06B6D4';

  return (
    <div className={`flex items-center ${className}`}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mr-3"
      >
        {/* 3D Cube Base */}
        <path
          d="M20 5L35 13V27L20 35L5 27V13L20 5Z"
          fill="url(#gradient-base)"
          stroke={iconColor}
          strokeWidth="1.5"
        />
        {/* Front Face Lines */}
        <path
          d="M20 35L20 20L35 13M20 20L5 13"
          stroke={iconColor}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* Scanning Line Animation */}
        <path
          d="M8 15L32 15"
          stroke={accentColor}
          strokeWidth="2"
          strokeLinecap="round"
          className="animate-scan"
        />
        {/* Gradient Definitions */}
        <defs>
          <linearGradient
            id="gradient-base"
            x1="5"
            y1="5"
            x2="35"
            y2="35"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor={isDark ? '#0F766E' : '#14B8A6'} />
            <stop offset="1" stopColor={isDark ? '#0D9488' : '#0891B2'} />
          </linearGradient>
        </defs>
      </svg>
      <div className="flex flex-col">
        <span className={`text-xl font-bold ${textColor} transition-colors duration-300`}>
          Site
        </span>
        <span className={`text-sm font-medium transition-colors duration-300 ${isDark ? 'text-teal-600' : 'text-teal-300'}`}>
          Logo
        </span>
      </div>
    </div>
  );
};

export default Logo; 