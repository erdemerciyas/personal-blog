'use client';

import React from 'react';
import SkeletonLoader from '../components/SkeletonLoader';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Header Skeleton */}
      <div className="bg-white shadow-sm">
        <div className="container-main py-4">
          <div className="flex items-center justify-between">
            <SkeletonLoader type="avatar" className="flex-shrink-0" />
            <div className="hidden md:flex space-x-8">
              <SkeletonLoader type="button" count={5} className="flex space-x-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="container-main py-20">
        {/* Hero Section Skeleton */}
        <div className="text-center mb-20">
          <SkeletonLoader type="text" width="60%" className="mx-auto mb-4" />
          <SkeletonLoader type="text" width="80%" className="mx-auto mb-6" />
          <SkeletonLoader type="text" width="40%" className="mx-auto mb-8" />
          <div className="flex justify-center space-x-4">
            <SkeletonLoader type="button" />
            <SkeletonLoader type="button" />
          </div>
        </div>

        {/* Cards Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <SkeletonLoader type="card" count={6} />
        </div>
      </div>

      {/* Loading Indicator */}
      <div className="fixed bottom-8 right-8 z-50">
        <div className="bg-white rounded-full p-4 shadow-lg">
          <div className="w-6 h-6 border-2 border-brand-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  );
}