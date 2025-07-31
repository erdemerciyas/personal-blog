'use client';

import React from 'react';

interface SkeletonLoaderProps {
  type?: 'text' | 'card' | 'image' | 'button' | 'avatar' | 'list';
  count?: number;
  className?: string;
  width?: string;
  height?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type = 'text',
  count = 1,
  className = '',
  width,
  height
}) => {
  const getSkeletonClass = () => {
    const baseClass = 'animate-pulse bg-slate-200 rounded';
    
    switch (type) {
      case 'text':
        return `${baseClass} h-4 w-full mb-2`;
      case 'card':
        return `${baseClass} h-48 w-full mb-4`;
      case 'image':
        return `${baseClass} h-32 w-full`;
      case 'button':
        return `${baseClass} h-10 w-24`;
      case 'avatar':
        return `${baseClass} h-12 w-12 rounded-full`;
      case 'list':
        return `${baseClass} h-6 w-full mb-3`;
      default:
        return `${baseClass} h-4 w-full`;
    }
  };

  const skeletonClass = getSkeletonClass();
  const style = {
    width: width || undefined,
    height: height || undefined,
  };

  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={skeletonClass}
          style={style}
        />
      ))}
    </div>
  );
};

export default SkeletonLoader;