'use client';

import { useEffect } from 'react';
import { useImageCache } from '@/lib/image-cache';

interface PerformanceMonitorProps {
  enabled?: boolean;
  logInterval?: number;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  enabled = process.env.NODE_ENV === 'development',
  logInterval = 30000 // 30 seconds
}) => {
  const { getCacheStats } = useImageCache();

  useEffect(() => {
    if (!enabled) return;

    const logPerformanceStats = () => {
      // Image cache stats
      const cacheStats = getCacheStats();
      
      // Navigation timing
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      // Paint timing
      const paintEntries = performance.getEntriesByType('paint');
      const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      const lcp = paintEntries.find(entry => entry.name === 'largest-contentful-paint');

      // Memory usage (if available)
      const memory = (performance as any).memory;

      const stats = {
        timestamp: new Date().toISOString(),
        imageCache: cacheStats,
        navigation: {
          domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart),
          loadComplete: Math.round(navigation.loadEventEnd - navigation.fetchStart),
          firstByte: Math.round(navigation.responseStart - navigation.fetchStart),
        },
        paint: {
          firstContentfulPaint: fcp ? Math.round(fcp.startTime) : null,
          largestContentfulPaint: lcp ? Math.round(lcp.startTime) : null,
        },
        memory: memory ? {
          used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
          limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
        } : null,
      };

      console.group('🚀 Performance Stats');
      console.log('📊 Image Cache:', cacheStats);
      console.log('⏱️ Navigation Timing:', stats.navigation);
      console.log('🎨 Paint Timing:', stats.paint);
      if (stats.memory) {
        console.log('💾 Memory Usage (MB):', stats.memory);
      }
      console.groupEnd();

      // Store in sessionStorage for debugging
      try {
        const existingStats = JSON.parse(sessionStorage.getItem('performanceStats') || '[]');
        existingStats.push(stats);
        // Keep only last 10 entries
        const recentStats = existingStats.slice(-10);
        sessionStorage.setItem('performanceStats', JSON.stringify(recentStats));
      } catch (error) {
        console.warn('Failed to store performance stats:', error);
      }
    };

    // Log initial stats after a delay
    const initialTimer = setTimeout(logPerformanceStats, 2000);
    
    // Log periodic stats
    const intervalTimer = setInterval(logPerformanceStats, logInterval);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
    };
  }, [enabled, logInterval, getCacheStats]);

  // Web Vitals monitoring
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    // Monitor Cumulative Layout Shift (CLS)
    let clsValue = 0;
    const clsEntries: PerformanceEntry[] = [];

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
          clsEntries.push(entry);
        }
      }
    });

    try {
      observer.observe({ type: 'layout-shift', buffered: true });
    } catch (error) {
      console.warn('Layout shift observer not supported:', error);
    }

    // Log CLS after page load
    const clsTimer = setTimeout(() => {
      if (clsValue > 0) {
        console.log('📐 Cumulative Layout Shift:', clsValue.toFixed(4));
        if (clsValue > 0.1) {
          console.warn('⚠️ High CLS detected! Consider optimizing image dimensions and layout.');
        }
      }
    }, 5000);

    return () => {
      observer.disconnect();
      clearTimeout(clsTimer);
    };
  }, [enabled]);

  return null; // This component doesn't render anything
};

// Utility function to get performance stats from sessionStorage
export function getStoredPerformanceStats() {
  try {
    return JSON.parse(sessionStorage.getItem('performanceStats') || '[]');
  } catch {
    return [];
  }
}

// Utility function to clear stored performance stats
export function clearStoredPerformanceStats() {
  try {
    sessionStorage.removeItem('performanceStats');
  } catch (error) {
    console.warn('Failed to clear performance stats:', error);
  }
}