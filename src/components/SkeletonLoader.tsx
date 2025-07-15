import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  width = 'w-full', 
  height = 'h-4' 
}) => (
  <div className={`animate-pulse bg-gray-200 rounded ${width} ${height} ${className}`} />
);

export const SkeletonCard: React.FC = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <Skeleton height="h-48" className="rounded-none" />
    <div className="p-6 space-y-4">
      <Skeleton height="h-6" width="w-3/4" />
      <div className="space-y-2">
        <Skeleton height="h-4" />
        <Skeleton height="h-4" width="w-5/6" />
        <Skeleton height="h-4" width="w-4/5" />
      </div>
      <div className="flex justify-between items-center pt-4">
        <Skeleton height="h-4" width="w-20" />
        <Skeleton height="h-8" width="w-24" className="rounded-full" />
      </div>
    </div>
  </div>
);

export const SkeletonGrid: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {Array.from({ length: count }).map((_, index) => (
      <SkeletonCard key={index} />
    ))}
  </div>
);

export const SkeletonHero: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-blue-900">
    <div className="text-center text-white space-y-8 max-w-4xl mx-auto px-4">
      <Skeleton height="h-12" width="w-32" className="mx-auto bg-white/20" />
      <Skeleton height="h-16" className="bg-white/20" />
      <Skeleton height="h-8" width="w-3/4" className="mx-auto bg-white/20" />
      <Skeleton height="h-6" className="bg-white/20" />
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Skeleton height="h-12" width="w-40" className="bg-white/20 rounded-full" />
        <Skeleton height="h-12" width="w-32" className="bg-white/20 rounded-full" />
      </div>
    </div>
  </div>
);

export const SkeletonService: React.FC = () => (
  <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
    <div className="text-center space-y-6">
      <Skeleton height="h-16" width="w-16" className="mx-auto rounded-2xl" />
      <Skeleton height="h-6" width="w-3/4" className="mx-auto" />
      <div className="space-y-2">
        <Skeleton height="h-4" />
        <Skeleton height="h-4" width="w-5/6" className="mx-auto" />
        <Skeleton height="h-4" width="w-4/5" className="mx-auto" />
      </div>
      <Skeleton height="h-6" width="w-24" className="mx-auto" />
    </div>
  </div>
);

export const SkeletonServiceGrid: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {Array.from({ length: count }).map((_, index) => (
      <SkeletonService key={index} />
    ))}
  </div>
);