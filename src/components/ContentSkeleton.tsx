'use client';

import React, { memo } from 'react';

interface ContentSkeletonProps {
  type?: 'text' | 'card' | 'list' | 'hero';
  count?: number;
  className?: string;
}

const ContentSkeleton = memo(function ContentSkeleton({ 
  type = 'text',
  count = 3,
  className = ''
}: ContentSkeletonProps) {
  const renderTextSkeleton = () => (
    <div className={`animate-pulse space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`h-4 bg-slate-200 dark:bg-slate-700 rounded ${
            index === count - 1 ? 'w-3/4' : 'w-full'
          }`}
        />
      ))}
    </div>
  );

  const renderHeroSkeleton = () => (
    <div className={`animate-pulse ${className}`}>
      <div className="h-96 bg-slate-200 dark:bg-slate-700 rounded-lg mb-8" />
      <div className="space-y-4">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6" />
        </div>
      </div>
    </div>
  );

  const renderCardSkeleton = () => (
    <div className={`animate-pulse bg-white dark:bg-slate-800 rounded-lg shadow p-6 ${className}`}>
      <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
      <div className="space-y-3">
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6" />
      </div>
    </div>
  );

  const renderListSkeleton = () => (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse flex items-center space-x-4 p-4 bg-white dark:bg-slate-800 rounded-lg shadow">
          <div className="h-12 w-12 bg-slate-200 dark:bg-slate-700 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );

  switch (type) {
    case 'hero':
      return renderHeroSkeleton();
    case 'card':
      return renderCardSkeleton();
    case 'list':
      return renderListSkeleton();
    default:
      return renderTextSkeleton();
  }
});

export default ContentSkeleton;