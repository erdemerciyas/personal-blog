/**
 * Performance monitoring utility
 * Tracks API response times, memory usage, and system metrics
 */

import { logger } from './logger';

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: unknown;
}

interface SystemMetrics {
  memoryUsage: NodeJS.MemoryUsage;
  uptime: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 1000; // Keep last 1000 metrics
  private systemMetricsInterval?: NodeJS.Timeout;

  constructor() {
    // Start system metrics collection in production
    if (process.env.NODE_ENV === 'production') {
      this.startSystemMetricsCollection();
    }
  }

  // Start a performance measurement
  startMeasurement(name: string): (metadata?: Record<string, unknown>) => void {
    const startTime = Date.now();
    
    return (metadata?: Record<string, unknown>) => {
      const duration = Date.now() - startTime;
      this.recordMetric(name, duration, metadata);
    };
  }

  // Record a performance metric
  recordMetric(name: string, duration: number, metadata?: Record<string, unknown>): void {
    const metric: PerformanceMetric = {
      name,
      duration,
      timestamp: Date.now(),
      metadata
    };

    this.metrics.push(metric);

    // Keep only the last N metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log slow operations
    if (duration > 1000) { // > 1 second
      logger.warn(`Slow operation detected: ${name}`, 'PERFORMANCE', {
        duration,
        metadata
      });
    }

    // Log extremely slow operations as errors
    if (duration > 5000) { // > 5 seconds
      logger.error(`Very slow operation detected: ${name}`, 'PERFORMANCE', {
        duration,
        metadata
      });
    }
  }

  // Get performance statistics
  getStats(name?: string): {
    count: number;
    avgDuration: number;
    minDuration: number;
    maxDuration: number;
    p95Duration: number;
    p99Duration: number;
  } {
    const filteredMetrics = name 
      ? this.metrics.filter(m => m.name === name)
      : this.metrics;

    if (filteredMetrics.length === 0) {
      return {
        count: 0,
        avgDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        p95Duration: 0,
        p99Duration: 0
      };
    }

    const durations = filteredMetrics.map(m => m.duration).sort((a, b) => a - b);
    const count = durations.length;
    const sum = durations.reduce((a, b) => a + b, 0);

    return {
      count,
      avgDuration: Math.round(sum / count),
      minDuration: durations[0],
      maxDuration: durations[count - 1],
      p95Duration: durations[Math.floor(count * 0.95)],
      p99Duration: durations[Math.floor(count * 0.99)]
    };
  }

  // Get metrics for a specific time range
  getMetricsInRange(startTime: number, endTime: number): PerformanceMetric[] {
    return this.metrics.filter(
      m => m.timestamp >= startTime && m.timestamp <= endTime
    );
  }

  // Get slow operations (> threshold ms)
  getSlowOperations(threshold = 1000): PerformanceMetric[] {
    return this.metrics.filter(m => m.duration > threshold);
  }

  // Get system metrics
  getSystemMetrics(): SystemMetrics {
    return {
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
      timestamp: Date.now()
    };
  }

  // Start collecting system metrics periodically
  private startSystemMetricsCollection(): void {
    this.systemMetricsInterval = setInterval(() => {
      const systemMetrics = this.getSystemMetrics();
      
      // Log if memory usage is high
      const memoryMB = systemMetrics.memoryUsage.heapUsed / 1024 / 1024;
      if (memoryMB > 500) { // > 500MB
        logger.warn('High memory usage detected', 'PERFORMANCE', {
          memoryMB: Math.round(memoryMB),
          uptime: Math.round(systemMetrics.uptime / 60) // minutes
        });
      }
    }, 60000); // Every minute
  }

  // Stop system metrics collection
  stopSystemMetricsCollection(): void {
    if (this.systemMetricsInterval) {
      clearInterval(this.systemMetricsInterval);
    }
  }

  // Generate performance report
  generateReport(): {
    summary: Record<string, unknown>;
    slowOperations: PerformanceMetric[];
    systemMetrics: SystemMetrics;
    topOperations: Array<{ name: string; stats: Record<string, unknown> }>;
  } {
    const now = Date.now();
    const lastHour = now - (60 * 60 * 1000);
    const recentMetrics = this.getMetricsInRange(lastHour, now);

    // Group metrics by operation name
    const operationGroups: { [key: string]: PerformanceMetric[] } = {};
    recentMetrics.forEach(metric => {
      if (!operationGroups[metric.name]) {
        operationGroups[metric.name] = [];
      }
      operationGroups[metric.name].push(metric);
    });

    // Get top operations by frequency
    const topOperations = Object.entries(operationGroups)
      .map(([name, metrics]) => ({
        name,
        stats: this.getStats(name)
      }))
      .sort((a, b) => b.stats.count - a.stats.count)
      .slice(0, 10);

    return {
      summary: {
        totalMetrics: this.metrics.length,
        recentMetrics: recentMetrics.length,
        timeRange: '1 hour'
      },
      slowOperations: this.getSlowOperations(),
      systemMetrics: this.getSystemMetrics(),
      topOperations
    };
  }

  // Clear all metrics
  clear(): void {
    this.metrics = [];
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Helper function for measuring API routes
export function measureApiRoute(name: string) {
  return performanceMonitor.startMeasurement(`API: ${name}`);
}

// Helper function for measuring database operations
export function measureDbOperation(operation: string, collection: string) {
  return performanceMonitor.startMeasurement(`DB: ${operation} ${collection}`);
}

// Helper function for measuring external service calls
export function measureExternalService(service: string, operation: string) {
  return performanceMonitor.startMeasurement(`External: ${service} ${operation}`);
}

// Middleware helper for automatic API measurement
export function withPerformanceMonitoring<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  name: string
): T {
  return (async (...args: unknown[]) => {
    const endMeasurement = performanceMonitor.startMeasurement(name);
    try {
      const result = await fn(...args as never[]);
      endMeasurement({ success: true });
      return result;
    } catch (error) {
      endMeasurement({ success: false, error: (error as Error).message });
      throw error;
    }
  }) as T;
} 