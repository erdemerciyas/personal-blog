'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { getLoadingConfig } from '@/lib/config';
import { SkeletonLoader } from './SkeletonLoader';

export function withSkeleton<T extends Record<string, any>>(WrappedComponent: React.ComponentType<T>, pageKey?: string) {
  return function WithSkeletonWrapper(props: T) {
    const pathname = usePathname();
    const [loading, setLoading] = React.useState(false);
    const [config, setConfig] = React.useState<any>(null);
    const [configLoaded, setConfigLoaded] = React.useState(false);

    React.useEffect(() => {
      const loadConfig = async () => {
        try {
          const loadingConfig = await getLoadingConfig();
          setConfig(loadingConfig);
        } catch (error) {
          console.error('Failed to load loading config:', error);
          // Set default config on error
          setConfig({
            systemInstalled: false,
            globalEnabled: false,
            pages: {}
          });
        } finally {
          setConfigLoaded(true);
        }
      };
      loadConfig();
    }, []);

    React.useEffect(() => {
      if (!configLoaded || !config) return;
      
      // Check if system is installed and globally enabled
      if (!config.systemInstalled || !config.globalEnabled) {
        setLoading(false);
        return;
      }
      
      // Show skeleton immediately on route change
      setLoading(true);
      
      // Hide skeleton after a short delay
      const timeout = setTimeout(() => setLoading(false), 300); // Reduced delay
      return () => clearTimeout(timeout);
    }, [pathname, config, configLoaded]);

    // Show component immediately if config not loaded yet (prevents white screen)
    if (!configLoaded) {
      return <WrappedComponent {...props} />;
    }
    
    // Check if system is disabled
    if (!config || !config.systemInstalled || !config.globalEnabled) {
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