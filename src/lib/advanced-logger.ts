/**
 * Advanced logging system with structured logging, performance tracking, and analytics
 */

import { logger } from '@/core/lib/logger';

export interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  context: string;
  message: string;
  duration?: number;
  userId?: string;
  requestId?: string;
  data?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

export interface PerformanceLog {
  operation: string;
  duration: number;
  status: 'success' | 'failure';
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface AnalyticsLog {
  event: string;
  userId?: string;
  timestamp: string;
  properties?: Record<string, unknown>;
}

class AdvancedLogger {
  private logs: LogEntry[] = [];
  private performanceLogs: PerformanceLog[] = [];
  private analyticsLogs: AnalyticsLog[] = [];
  private maxLogs = 10000;
  private isProduction = process.env.NODE_ENV === 'production';

  /**
   * Log with full context
   */
  logWithContext(
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    context: string,
    data?: Record<string, unknown>,
    error?: Error,
    requestId?: string,
    userId?: string
  ): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      context,
      message,
      data,
      requestId,
      userId,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: this.isProduction ? undefined : error.stack,
      } : undefined,
    };

    this.logs.push(entry);
    this.maintainLogSize();

    // Also log to main logger
    switch (level) {
      case 'debug':
        logger.debug(message, context, data);
        break;
      case 'info':
        logger.info(message, context, data);
        break;
      case 'warn':
        logger.warn(message, context, data);
        break;
      case 'error':
        logger.error(message, context, data, error);
        break;
    }
  }

  /**
   * Log performance metrics
   */
  logPerformance(
    operation: string,
    duration: number,
    status: 'success' | 'failure' = 'success',
    metadata?: Record<string, unknown>
  ): void {
    const log: PerformanceLog = {
      operation,
      duration,
      status,
      timestamp: new Date().toISOString(),
      metadata,
    };

    this.performanceLogs.push(log);
    this.maintainPerformanceLogSize();

    // Log slow operations
    if (duration > 1000) {
      logger.warn(
        `Slow operation detected: ${operation} took ${duration}ms`,
        'PERFORMANCE',
        { operation, duration, status, ...metadata }
      );
    }
  }

  /**
   * Measure operation performance
   */
  measurePerformance<T>(
    operation: string,
    fn: () => T | Promise<T>,
    metadata?: Record<string, unknown>
  ): T | Promise<T> {
    const startTime = Date.now();

    try {
      const result = fn();

      if (result instanceof Promise) {
        return result
          .then((res) => {
            const duration = Date.now() - startTime;
            this.logPerformance(operation, duration, 'success', metadata);
            return res;
          })
          .catch((error) => {
            const duration = Date.now() - startTime;
            this.logPerformance(operation, duration, 'failure', metadata);
            throw error;
          }) as T;
      } else {
        const duration = Date.now() - startTime;
        this.logPerformance(operation, duration, 'success', metadata);
        return result;
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logPerformance(operation, duration, 'failure', metadata);
      throw error;
    }
  }

  /**
   * Log analytics events
   */
  logAnalytics(
    event: string,
    userId?: string,
    properties?: Record<string, unknown>
  ): void {
    const log: AnalyticsLog = {
      event,
      userId,
      timestamp: new Date().toISOString(),
      properties,
    };

    this.analyticsLogs.push(log);
    this.maintainAnalyticsLogSize();

    logger.info(
      `Analytics: ${event}`,
      'ANALYTICS',
      { userId, ...properties }
    );
  }

  /**
   * Get logs by level
   */
  getLogsByLevel(level: 'debug' | 'info' | 'warn' | 'error'): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  /**
   * Get logs by context
   */
  getLogsByContext(context: string): LogEntry[] {
    return this.logs.filter(log => log.context === context);
  }

  /**
   * Get logs by user
   */
  getLogsByUser(userId: string): LogEntry[] {
    return this.logs.filter(log => log.userId === userId);
  }

  /**
   * Get logs by request
   */
  getLogsByRequest(requestId: string): LogEntry[] {
    return this.logs.filter(log => log.requestId === requestId);
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats(): {
    totalOperations: number;
    successfulOperations: number;
    failedOperations: number;
    averageDuration: number;
    slowestOperation: PerformanceLog | undefined;
    fastestOperation: PerformanceLog | undefined;
  } {
    const successful = this.performanceLogs.filter(log => log.status === 'success');
    const failed = this.performanceLogs.filter(log => log.status === 'failure');
    const avgDuration = successful.length > 0
      ? successful.reduce((sum, log) => sum + log.duration, 0) / successful.length
      : 0;

    return {
      totalOperations: this.performanceLogs.length,
      successfulOperations: successful.length,
      failedOperations: failed.length,
      averageDuration: Math.round(avgDuration),
      slowestOperation: this.performanceLogs.reduce((prev, current) =>
        prev.duration > current.duration ? prev : current
      ),
      fastestOperation: this.performanceLogs.reduce((prev, current) =>
        prev.duration < current.duration ? prev : current
      ),
    };
  }

  /**
   * Get analytics summary
   */
  getAnalyticsSummary(): Record<string, number> {
    const summary: Record<string, number> = {};

    this.analyticsLogs.forEach(log => {
      summary[log.event] = (summary[log.event] || 0) + 1;
    });

    return summary;
  }

  /**
   * Export logs
   */
  exportLogs(): {
    logs: LogEntry[];
    performanceLogs: PerformanceLog[];
    analyticsLogs: AnalyticsLog[];
  } {
    return {
      logs: [...this.logs],
      performanceLogs: [...this.performanceLogs],
      analyticsLogs: [...this.analyticsLogs],
    };
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
    this.performanceLogs = [];
    this.analyticsLogs = [];
  }

  /**
   * Maintain log size
   */
  private maintainLogSize(): void {
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  /**
   * Maintain performance log size
   */
  private maintainPerformanceLogSize(): void {
    if (this.performanceLogs.length > this.maxLogs) {
      this.performanceLogs = this.performanceLogs.slice(-this.maxLogs);
    }
  }

  /**
   * Maintain analytics log size
   */
  private maintainAnalyticsLogSize(): void {
    if (this.analyticsLogs.length > this.maxLogs) {
      this.analyticsLogs = this.analyticsLogs.slice(-this.maxLogs);
    }
  }

  /**
   * Get recent logs
   */
  getRecentLogs(count: number = 100): LogEntry[] {
    return this.logs.slice(-count);
  }

  /**
   * Get error logs
   */
  getErrorLogs(): LogEntry[] {
    return this.logs.filter(log => log.level === 'error');
  }

  /**
   * Get warning logs
   */
  getWarningLogs(): LogEntry[] {
    return this.logs.filter(log => log.level === 'warn');
  }
}

export const advancedLogger = new AdvancedLogger();
