import React from 'react';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  isDark?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = '', width = 40, height = 40, isDark = false }) => {
  const textColor = isDark ? 'text-fixral-night-blue' : 'text-white';
  const iconColor = isDark ? '#003450' : '#38bdf8';
  const accentColor = isDark ? '#0369a1' : '#7dd3fc';

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
        {/* FIXRAL Logo - 3D Engineering Symbol */}
        <path
          d="M20 5L35 13V27L20 35L5 27V13L20 5Z"
          fill="none"
          stroke={iconColor}
          strokeWidth="2"
        />
        {/* Engineering Grid Lines */}
        <path
          d="M20 35L20 20L35 13M20 20L5 13"
          stroke={iconColor}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* Center Engineering Point */}
        <circle
          cx="20"
          cy="20"
          r="2"
          fill={accentColor}
        />
        {/* Technical Lines */}
        <path
          d="M12 16L28 16M12 24L28 24"
          stroke={accentColor}
          strokeWidth="1"
          strokeLinecap="round"
        />
      </svg>
      <div className="flex flex-col">
        <span className={`text-xl font-bold ${textColor} transition-colors duration-300`}>
          FIXRAL
        </span>
        <span className={`text-sm font-medium transition-colors duration-300 ${isDark ? 'text-fixral-gray-blue' : 'text-brand-primary-300'}`}>
          Engineering
        </span>
      </div>
    </div>
  );
};

export default Logo; 