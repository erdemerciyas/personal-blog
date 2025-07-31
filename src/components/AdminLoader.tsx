'use client';

import React, { memo } from 'react';

interface LoaderProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'pulse';
  className?: string;
}

const Loader = memo(function Loader({ 
  text = 'Yükleniyor...', 
  size = 'md',
  variant = 'spinner',
  className = ''
}: LoaderProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const renderSpinner = () => (
    <div className={`animate-spin rounded-full border-2 border-slate-200 dark:border-slate-700 border-t-teal-500 ${sizeClasses[size]}`} />
  );

  const renderDots = () => (
    <div className="flex space-x-1">
      <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce [animation-delay:0ms]" />
      <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce [animation-delay:150ms]" />
      <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce [animation-delay:300ms]" />
    </div>
  );

  const renderPulse = () => (
    <div className={`bg-teal-500 rounded-full animate-pulse ${sizeClasses[size]}`} />
  );

  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      default:
        return renderSpinner();
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-4 p-8 ${className}`}>
      {renderLoader()}
      {text && (
        <p className={`text-slate-600 dark:text-slate-300 font-medium ${textSizeClasses[size]}`}>
          {text}
        </p>
      )}
    </div>
  );
});

export default Loader;

// Optimized loading variants
export const PageLoader = memo(({ text = 'Sayfa yükleniyor...' }: { text?: string }) => (
  <Loader text={text} size="lg" variant="spinner" className="min-h-[400px]" />
));
PageLoader.displayName = 'PageLoader';

export const CardLoader = memo(({ text = 'Veriler yükleniyor...' }: { text?: string }) => (
  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
    <Loader text={text} size="md" variant="spinner" />
  </div>
));
CardLoader.displayName = 'CardLoader';

export const InlineLoader = memo(({ text = 'Yükleniyor...' }: { text?: string }) => (
  <div className="flex items-center justify-center space-x-3 py-4">
    <div className="animate-spin rounded-full border-2 border-slate-200 dark:border-slate-700 border-t-teal-500 w-5 h-5" />
    <span className="text-slate-600 dark:text-slate-300 text-sm">{text}</span>
  </div>
));
InlineLoader.displayName = 'InlineLoader';