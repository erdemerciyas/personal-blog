import React, { useEffect, useCallback, useRef } from 'react';

interface PerformanceEventTiming extends PerformanceEntry {
  processingStart: number;
}

interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

interface PerformanceMetrics {
  loadTime?: number;
  renderTime?: number;
  route: string;
  userAgent: string;
  timestamp: string;
}

interface WebVitals {
  FCP?: number; // First Contentful Paint
  LCP?: number; // Largest Contentful Paint
  FID?: number; // First Input Delay
  CLS?: number; // Cumulative Layout Shift
  TTFB?: number; // Time to First Byte
}

interface UsePerformanceMonitoringOptions {
  enabled?: boolean;
  reportInterval?: number; // Report every N route changes
  reportThreshold?: number; // Only report if load time > N ms
  endpoint?: string;
}

export function usePerformanceMonitoring(options: UsePerformanceMonitoringOptions = {}) {
  const {
    enabled = process.env.NODE_ENV === 'production',
    reportInterval = 1,
    reportThreshold = 0,
    endpoint = '/api/monitoring/performance'
  } = options;

  const metricsRef = useRef<PerformanceMetrics[]>([]);
  const vitalsRef = useRef<WebVitals>({});
  const routeChangeCountRef = useRef(0);
  const startTimeRef = useRef<number>(Date.now());

  // Collect Web Vitals
  const collectWebVitals = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      // First Contentful Paint
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        vitalsRef.current.TTFB = navigation.responseStart - navigation.requestStart;
      }

      // Performance Observer for other vitals
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'paint') {
              if (entry.name === 'first-contentful-paint') {
                vitalsRef.current.FCP = entry.startTime;
              }
            } else if (entry.entryType === 'largest-contentful-paint') {
              vitalsRef.current.LCP = entry.startTime;
            } else if (entry.entryType === 'first-input') {
              vitalsRef.current.FID = (entry as PerformanceEventTiming).processingStart - entry.startTime;
            } else if (entry.entryType === 'layout-shift') {
              if (!(entry as LayoutShift).hadRecentInput) {
                vitalsRef.current.CLS = (vitalsRef.current.CLS || 0) + (entry as LayoutShift).value;
              }
            }
          }
        });

        observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] });

        // Clean up observer after 10 seconds
        setTimeout(() => observer.disconnect(), 10000);
      }
    } catch (error) {
      console.warn('Failed to collect Web Vitals:', error);
    }
  }, []);

  // Report metrics to server
  const reportMetrics = useCallback(async (metrics: PerformanceMetrics) => {
    if (!enabled) return;

    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          metrics: {
            ...metrics,
            webVitals: vitalsRef.current
          },
          url: window.location.href,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.warn('Failed to report performance metrics:', error);
    }
  }, [enabled, endpoint]);

  // Measure page load performance
  const measurePageLoad = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        const loadTime = navigation.loadEventEnd - navigation.fetchStart;
        const renderTime = navigation.domContentLoadedEventEnd - navigation.fetchStart;

        const metrics: PerformanceMetrics = {
          loadTime,
          renderTime,
          route: window.location.pathname,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        };

        // Only report if above threshold
        if (loadTime >= reportThreshold) {
          metricsRef.current.push(metrics);
          
          // Report immediately or batch
          if (routeChangeCountRef.current % reportInterval === 0) {
            reportMetrics(metrics);
          }
        }
      }
    } catch (error) {
      console.warn('Failed to measure page load:', error);
    }
  }, [reportThreshold, reportInterval, reportMetrics]);

  // Measure route change performance
  const measureRouteChange = useCallback(() => {
    const endTime = Date.now();
    const loadTime = endTime - startTimeRef.current;

    const metrics: PerformanceMetrics = {
      loadTime,
      route: window.location.pathname,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };

    if (loadTime >= reportThreshold) {
      metricsRef.current.push(metrics);
      routeChangeCountRef.current++;
      
      if (routeChangeCountRef.current % reportInterval === 0) {
        reportMetrics(metrics);
      }
    }

    startTimeRef.current = Date.now();
  }, [reportThreshold, reportInterval, reportMetrics]);

  // Manual performance measurement
  const measureCustom = useCallback((name: string, startTime: number) => {
    const endTime = Date.now();
    const duration = endTime - startTime;

    const metrics: PerformanceMetrics = {
      loadTime: duration,
      route: `custom:${name}`,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };

    if (duration >= reportThreshold) {
      metricsRef.current.push(metrics);
      reportMetrics(metrics);
    }

    return duration;
  }, [reportThreshold, reportMetrics]);

  // Start custom measurement
  const startMeasurement = useCallback(() => {
    return Date.now();
  }, []);

  // Get performance summary
  const getPerformanceSummary = useCallback(() => {
    const metrics = metricsRef.current;
    if (metrics.length === 0) return null;

    const loadTimes = metrics.map(m => m.loadTime || 0);
    const avgLoadTime = loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length;
    const maxLoadTime = Math.max(...loadTimes);
    const minLoadTime = Math.min(...loadTimes);

    return {
      totalMeasurements: metrics.length,
      averageLoadTime: Math.round(avgLoadTime),
      maxLoadTime: Math.round(maxLoadTime),
      minLoadTime: Math.round(minLoadTime),
      webVitals: vitalsRef.current
    };
  }, []);

  // Initialize monitoring
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    // Collect initial metrics
    collectWebVitals();
    
    // Measure initial page load
    if (document.readyState === 'complete') {
      measurePageLoad();
    } else {
      window.addEventListener('load', measurePageLoad);
    }

    // Track route changes
    const handleRouteChange = () => {
      measureRouteChange();
    };

    // Listen for navigation events (this is a basic implementation)
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('load', measurePageLoad);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [enabled, collectWebVitals, measurePageLoad, measureRouteChange]);

  return {
    measureCustom,
    startMeasurement,
    getPerformanceSummary,
    metrics: metricsRef.current,
    webVitals: vitalsRef.current
  };
}

// Higher-order component for automatic performance monitoring
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
): React.ComponentType<P> {
  const PerformanceMonitoredComponent = (props: P) => {
    const { startMeasurement, measureCustom } = usePerformanceMonitoring();

    useEffect(() => {
      const startTime = startMeasurement();
      const name = componentName || Component.displayName || Component.name || 'Unknown';

      return () => {
        measureCustom(`component:${name}`, startTime);
      };
    }, [startMeasurement, measureCustom]);

    return React.createElement(Component, props);
  };

  PerformanceMonitoredComponent.displayName = `withPerformanceMonitoring(${componentName || Component.displayName || Component.name || 'Component'})`;

  return PerformanceMonitoredComponent;
}

export default usePerformanceMonitoring;