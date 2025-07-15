import React, { useState, useEffect } from 'react';
import { Skeleton } from './SkeletonLoader';

interface ProgressiveLoaderProps<T> {
  data: T[] | null;
  loading: boolean;
  error?: Error | null;
  skeletonCount?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  renderSkeleton?: () => React.ReactNode;
  className?: string;
  emptyMessage?: string;
  errorMessage?: string;
}

export function ProgressiveLoader<T>({
  data,
  loading,
  error,
  skeletonCount = 3,
  renderItem,
  renderSkeleton,
  className = '',
  emptyMessage = 'Veri bulunamadı',
  errorMessage = 'Bir hata oluştu'
}: ProgressiveLoaderProps<T>) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (!loading && data) {
      // Small delay to prevent flash of loading content
      const timer = setTimeout(() => setShowContent(true), 100);
      return () => clearTimeout(timer);
    }
  }, [loading, data]);

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-red-500 mb-4">⚠️</div>
        <p className="text-gray-600">{errorMessage}</p>
      </div>
    );
  }

  if (loading || !showContent) {
    return (
      <div className={className}>
        {renderSkeleton ? (
          renderSkeleton()
        ) : (
          Array.from({ length: skeletonCount }).map((_, index) => (
            <Skeleton key={index} height="h-32" className="mb-4" />
          ))
        )}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-gray-400 mb-4">📭</div>
        <p className="text-gray-600">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {data.map((item, index) => renderItem(item, index))}
    </div>
  );
}