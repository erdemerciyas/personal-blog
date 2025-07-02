'use client';

import React from 'react';
import packageJson from '../../package.json';

interface VersionProps {
  className?: string;
  showLabel?: boolean;
  variant?: 'badge' | 'text' | 'pill';
  size?: 'sm' | 'md' | 'lg';
}

const Version: React.FC<VersionProps> = ({ 
  className = '',
  showLabel = false,
  variant = 'badge',
  size = 'sm'
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  const variantClasses = {
    badge: 'bg-slate-700 text-slate-300 rounded-full font-mono',
    text: 'text-slate-400 font-mono',
    pill: 'bg-teal-500 text-white rounded-full font-semibold'
  };

  const content = showLabel ? `Version ${packageJson.version}` : `v${packageJson.version}`;

  if (variant === 'text') {
    return (
      <span className={`${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
        {content}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      {content}
    </span>
  );
};

export default Version; 