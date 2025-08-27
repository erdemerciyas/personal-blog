import { useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';

interface PerformanceMetrics {
  loadTime?: number;
  renderTime?: number;
  route: string;
  userAgent: string;
  url: string;
}

export function usePerformanceMonitoring() {
  const pathname = usePathname();

  const sendMetrics = useCallback(async (metrics: PerformanceMetrics) => {
    try {
      await fetch('/api/monitoring/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metrics),
      });
    } catch (error) {
      // Silently fail in production to avoid disrupting user experience
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to send performance metrics:', error);
      }
    }
  }, []);

  const measurePageLoad = useCallback(() => {
    if (typeof window === 'undefined') return;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (!navigation) return;

    const loadTime = navigation.loadEventEnd - navigation.fetchStart;
    const renderTime = navigation.domContentLoadedEventEnd - navigation.fetchStart;

    const metrics: PerformanceMetrics = {
      loadTime: Math.round(loadTime),
      renderTime: Math.round(renderTime),
      route: pathname,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Only send metrics if they seem reasonable
    if (loadTime > 0 && loadTime < 60000) {
      sendMetrics(metrics);
    }
  }, [pathname, sendMetrics]);

  const measureCustomMetric = useCallback((name: string, value: number) => {
    if (typeof window === 'undefined') return;

    const metrics: PerformanceMetrics = {
      [name]: value,
      route: pathname,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    sendMetrics(metrics);
  }, [pathname, sendMetrics]);

  useEffect(() => {
    // Measure page load performance after the page is fully loaded
    if (document.readyState === 'complete') {
      measurePageLoad();
    } else {
      window.addEventListener('load', measurePageLoad);
      return () => window.removeEventListener('load', measurePageLoad);
    }
  }, [measurePageLoad]);

  return {
    measureCustomMetric,
    sendMetrics,
  };
}

// Web Vitals monitoring hook
export function useWebVitals() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Dynamically import web-vitals to avoid SSR issues
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      const sendVital = (metric: any) => {
        fetch('/api/monitoring/performance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            [metric.name]: metric.value,
            route: pathname,
            userAgent: navigator.userAgent,
            url: window.location.href,
            vitalsMetric: true,
          }),
        }).catch(() => {
          // Silently fail
        });
      };

      // Measure all Web Vitals
      getCLS(sendVital);
      getFID(sendVital);
      getFCP(sendVital);
      getLCP(sendVital);
      getTTFB(sendVital);
    }).catch(() => {
      // web-vitals not available, skip
    });
  }, [pathname]);
}