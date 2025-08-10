import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  interactionTime: number;
}

export function usePerformance(pageName: string) {
  const startTime = useRef(Date.now());
  const renderStartTime = useRef(Date.now());

  useEffect(() => {
    // Mark render complete
    const renderTime = Date.now() - renderStartTime.current;
    
    // Log performance metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 Performance [${pageName}]:`, {
        renderTime: `${renderTime}ms`,
        loadTime: `${Date.now() - startTime.current}ms`
      });
    }

    // Report to analytics in production
    if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
      // You can integrate with analytics services here
      // Example: Google Analytics, Vercel Analytics, etc.
      try {
        if ('performance' in window) {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          const perf: PerformanceMetrics = {
            loadTime: navigation.loadEventEnd - navigation.loadEventStart,
            renderTime: renderTime,
            interactionTime: navigation.domInteractive - navigation.fetchStart
          };
          // placeholder for analytics usage
          void perf;
        }
      } catch (e) {
        console.warn('Performance tracking error:', e);
      }
    }
  }, [pageName]);

  return {
    markInteraction: (action: string) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`⚡ Interaction [${pageName}]: ${action}`);
      }
    }
  };
}