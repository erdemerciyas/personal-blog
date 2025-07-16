'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { getLoadingConfig } from '@/lib/config';
import { SkeletonLoader } from './SkeletonLoader';

export function withSkeleton<T>(WrappedComponent: React.ComponentType<T>, pageKey?: string) {
  return function WithSkeletonWrapper(props: T) {
    const pathname = usePathname();
    const [loading, setLoading] = React.useState(false);
    const [config, setConfig] = React.useState<any>(null);

    React.useEffect(() => {
      const loadConfig = async () => {
        try {
          const loadingConfig = await getLoadingConfig();
          setConfig(loadingConfig);
        } catch (error) {
          console.error('Failed to load loading config:', error);
        }
      };
      loadConfig();
    }, []);

    React.useEffect(() => {
      if (!config) return;
      
      // Check if system is installed and globally enabled
      if (!config.systemInstalled || !config.globalEnabled) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      const timeout = setTimeout(() => setLoading(false), 500); // örnek gecikme
      return () => clearTimeout(timeout);
    }, [pathname, config]);

    // If config not loaded yet, don't show skeleton
    if (!config) return <WrappedComponent {...props} />;
    
    // Check if system is disabled
    if (!config.systemInstalled || !config.globalEnabled) {
      return <WrappedComponent {...props} />;
    }
    
    if (loading) {
      return (
        <div className="min-h-screen">
          <SkeletonLoader 
            pageKey={pageKey}
            className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-500 to-cyan-600 text-white" 
          />
        </div>
      );
    }
    
    return <WrappedComponent {...props} />;
  };
}