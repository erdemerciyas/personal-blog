'use client';

import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { getLoadingConfig } from '@/lib/config';

interface SkeletonLoaderProps {
  isActive?: boolean;
  children?: React.ReactNode;
  className?: string;
  loadingText?: string;
  pageKey?: string; // For page-specific configuration
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  isActive = true,
  children,
  className,
  loadingText = 'İçerik yükleniyor...',
  pageKey,
}) => {
  const [config, setConfig] = useState<any>(null);
  const [shouldShow, setShouldShow] = useState(isActive);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const loadingConfig = await getLoadingConfig();
        setConfig(loadingConfig);
        
        // Check if system is installed and globally enabled
        if (!loadingConfig.systemInstalled || !loadingConfig.globalEnabled) {
          setShouldShow(false);
          return;
        }
        
        // Check page-specific configuration
        if (pageKey && loadingConfig.pages[pageKey]) {
          const pageConfig = loadingConfig.pages[pageKey];
          setShouldShow(pageConfig.installed && pageConfig.enabled && isActive);
        } else {
          setShouldShow(isActive);
        }
      } catch (error) {
        console.error('Failed to load loading config:', error);
        setShouldShow(isActive);
      }
    };

    loadConfig();
  }, [isActive, pageKey]);

  if (!shouldShow) return <>{children}</>;

  // Get page-specific configuration
  const pageConfig = pageKey && config?.pages[pageKey];
  const finalLoadingText = pageConfig?.loadingText || loadingText;
  const finalClassName = pageConfig?.customClass || className;

  return (
    <div className={clsx("animate-pulse space-y-4 text-gray-400 p-8", finalClassName)}>
      <div className="text-center">
        <p className="text-lg mb-6">{finalLoadingText}</p>
        <div className="space-y-4">
          <div className="h-8 bg-gray-300 rounded w-3/4 mx-auto" />
          <div className="h-6 bg-gray-300 rounded w-1/2 mx-auto" />
          <div className="h-4 bg-gray-300 rounded w-full" />
          <div className="h-4 bg-gray-300 rounded w-5/6 mx-auto" />
        </div>
      </div>
    </div>
  );
};

// Legacy Skeleton component for backward compatibility (admin pages)
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