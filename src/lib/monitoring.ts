// Sentry is optional - only import if available
let Sentry: any = null;
try {
  Sentry = require('@sentry/nextjs');
} catch (e) {
  console.warn('Sentry not installed, monitoring features disabled');
}

import { NextRequest } from 'next/server';

// Performance monitoring utilities
export class PerformanceMonitor {
  private static transactions: Map<string, any> = new Map();

  /**
   * Start a performance transaction
   */
  static startTransaction(name: string, op: string = 'custom') {
    if (!Sentry) return null;
    
    try {
      const transaction = Sentry.startTransaction({ name, op });
      this.transactions.set(name, transaction);
      return transaction;
    } catch (error) {
      console.warn('Failed to start transaction:', error);
      return null;
    }
  }

  /**
   * Finish a performance transaction
   */
  static finishTransaction(name: string) {
    const transaction = this.transactions.get(name);
    if (transaction) {
      try {
        transaction.finish();
        this.transactions.delete(name);
      } catch (error) {
        console.warn('Failed to finish transaction:', error);
      }
    }
  }

  /**
   * Add breadcrumb for debugging
   */
  static addBreadcrumb(message: string, category: string = 'custom', level: string = 'info') {
    if (Sentry) {
      try {
        Sentry.addBreadcrumb({
          message,
          category,
          level,
          timestamp: Date.now() / 1000,
        });
      } catch (error) {
        console.warn('Failed to add breadcrumb:', error);
      }
    }
  }

  /**
   * Set user context
   */
  static setUser(user: { id?: string; email?: string; username?: string }) {
    if (Sentry) {
      try {
        Sentry.setUser(user);
      } catch (error) {
        console.warn('Failed to set user:', error);
      }
    }
  }

  /**
   * Set custom tags
   */
  static setTags(tags: Record<string, string>) {
    if (Sentry) {
      try {
        Sentry.setTags(tags);
      } catch (error) {
        console.warn('Failed to set tags:', error);
      }
    }
  }

  /**
   * Capture exception
   */
  static captureException(error: Error, context?: Record<string, any>) {
    if (Sentry) {
      try {
        if (context) {
          Sentry.withScope((scope: any) => {
            Object.keys(context).forEach(key => {
              scope.setContext(key, context[key]);
            });
            Sentry.captureException(error);
          });
        } else {
          Sentry.captureException(error);
        }
      } catch (sentryError) {
        console.warn('Failed to capture exception:', sentryError);
      }
    }
    
    // Always log to console as fallback
    console.error('Exception captured:', error, context);
  }

  /**
   * Capture message
   */
  static captureMessage(message: string, level: string = 'info', context?: Record<string, any>) {
    if (Sentry) {
      try {
        if (context) {
          Sentry.withScope((scope: any) => {
            Object.keys(context).forEach(key => {
              scope.setContext(key, context[key]);
            });
            Sentry.captureMessage(message, level as any);
          });
        } else {
          Sentry.captureMessage(message, level as any);
        }
      } catch (error) {
        console.warn('Failed to capture message:', error);
      }
    }
    
    // Always log to console as fallback
    console.log(`[${level.toUpperCase()}] ${message}`, context);
  }
}

// API monitoring utilities
export class APIMonitor {
  /**
   * Monitor API endpoint performance
   */
  static async monitorEndpoint<T>(
    name: string,
    handler: () => Promise<T>,
    request?: NextRequest
  ): Promise<T> {
    const transaction = PerformanceMonitor.startTransaction(`api.${name}`, 'http.server');
    
    try {
      if (request && transaction) {
        transaction.setTag('http.method', request.method);
        transaction.setTag('http.url', request.url);
      }
      
      const result = await handler();
      
      if (transaction) {
        transaction.setTag('http.status_code', '200');
      }
      
      return result;
    } catch (error) {
      if (transaction) {
        transaction.setTag('http.status_code', '500');
      }
      
      PerformanceMonitor.captureException(error as Error, {
        endpoint: name,
        method: request?.method,
        url: request?.url,
      });
      
      throw error;
    } finally {
      PerformanceMonitor.finishTransaction(`api.${name}`);
    }
  }

  /**
   * Monitor database operations
   */
  static async monitorDatabase<T>(
    operation: string,
    handler: () => Promise<T>
  ): Promise<T> {
    const transaction = PerformanceMonitor.startTransaction(`db.${operation}`, 'db');
    
    try {
      const result = await handler();
      return result;
    } catch (error) {
      PerformanceMonitor.captureException(error as Error, {
        operation,
        type: 'database',
      });
      throw error;
    } finally {
      PerformanceMonitor.finishTransaction(`db.${operation}`);
    }
  }
}

// Error boundary utilities
export class ErrorBoundary {
  /**
   * Handle React component errors
   */
  static handleComponentError(error: Error, errorInfo: { componentStack: string }) {
    PerformanceMonitor.captureException(error, {
      type: 'react_component',
      componentStack: errorInfo.componentStack,
    });
  }

  /**
   * Handle unhandled promise rejections
   */
  static handleUnhandledRejection(reason: any, promise: Promise<any>) {
    PerformanceMonitor.captureException(
      new Error(`Unhandled Promise Rejection: ${reason}`),
      {
        type: 'unhandled_promise_rejection',
        promise: promise.toString(),
      }
    );
  }

  /**
   * Handle uncaught exceptions
   */
  static handleUncaughtException(error: Error) {
    PerformanceMonitor.captureException(error, {
      type: 'uncaught_exception',
    });
  }
}

// Initialize error handlers if in browser
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    ErrorBoundary.handleUnhandledRejection(event.reason, event.promise);
  });

  window.addEventListener('error', (event) => {
    ErrorBoundary.handleUncaughtException(event.error);
  });
}

// Initialize error handlers if in Node.js
if (typeof process !== 'undefined') {
  process.on('unhandledRejection', (reason, promise) => {
    ErrorBoundary.handleUnhandledRejection(reason, promise);
  });

  process.on('uncaughtException', (error) => {
    ErrorBoundary.handleUncaughtException(error);
    // Don't exit the process in production
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  });
}

// Export alias for backward compatibility
export const ErrorTracker = ErrorBoundary;

export { PerformanceMonitor as default };