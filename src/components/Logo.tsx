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
          fill="none"
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