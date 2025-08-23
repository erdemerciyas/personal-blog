import * as Sentry from '@sentry/nextjs';
import { NextRequest } from 'next/server';

// Performance monitoring utilities
export class PerformanceMonitor {
  private static transactions: Map<string, unknown> = new Map();

  /**
   * Start a performance transaction
   */
  static startTransaction(name: string, op: string = 'custom') {
    // Using newer Sentry API
    const transaction = Sentry.startSpan(
      { name, op },
      () => {
        // Return a basic transaction-like object
        return {
          setTags: (tags: Record<string, string>) => {
            Sentry.setTags(tags);
          },
          setTag: (key: string, value: string) => {
            Sentry.setTag(key, value);
          },
          finish: () => {
            // Span will finish automatically
          },
          startChild: (options: { op: string; description?: string }) => {
            return Sentry.startSpan({
              op: options.op,
              name: options.description || options.op
            }, () => ({}));
          }
        };
      }
    );
    
    this.transactions.set(name, transaction);
    return transaction;
  }

  /**
   * Finish a performance transaction
   */
  static finishTransaction(name: string) {
    // In the new Sentry API, transactions are managed differently
    // We just remove it from our map since spans auto-finish
    this.transactions.delete(name);
  }

  /**
   * Add span to current transaction
   */
  static addSpan(operation: string, description?: string) {
    // Use the newer span API
    return Sentry.startSpan({
      op: operation,
      name: description || operation
    }, () => ({
      setTag: (key: string, value: string) => Sentry.setTag(key, value),
      setData: (key: string, value: unknown) => Sentry.setContext(key, { value }),
      finish: () => {}
    }));
  }

  /**
   * Measure function execution time
   */
  static async measureFunction<T>(
    name: string, 
    fn: () => Promise<T> | T,
    tags?: Record<string, string>
  ): Promise<T> {
    const transaction = this.startTransaction(name, 'function');
    
    if (tags) {
      transaction.setTags(tags);
    }

    try {
      const result = await fn();
      transaction.setTag('status', 'success');
      return result;
    } catch (error) {
      transaction.setTag('status', 'error');
      ErrorTracker.captureError(error as Error, { 
        function: name,
        ...tags 
      });
      throw error;
    } finally {
      this.finishTransaction(name);
    }
  }

  /**
   * Measure API endpoint performance
   */
  static measureApiEndpoint(request: NextRequest, endpoint: string) {
    const transaction = this.startTransaction(`API ${endpoint}`, 'http.server');
    
    transaction.setTags({
      'http.method': request.method,
      'http.url': request.url,
      'http.route': endpoint
    });

    return {
      finish: (statusCode?: number) => {
        if (statusCode) {
          transaction.setTag('http.status_code', statusCode.toString());
        }
        this.finishTransaction(`API ${endpoint}`);
      }
    };
  }

  /**
   * Track database query performance
   */
  static async measureDatabaseQuery<T>(
    operation: string,
    query: () => Promise<T>,
    metadata?: Record<string, unknown>
  ): Promise<T> {
    const span = this.addSpan('db.query', operation);
    
    if (span && metadata) {
      span.setData('query.metadata', metadata);
    }

    try {
      const result = await query();
      if (span) {
        span.setTag('status', 'success');
      }
      return result;
    } catch (error) {
      if (span) {
        span.setTag('status', 'error');
        span.setData('error', error);
      }
      throw error;
    } finally {
      if (span) {
        span.finish();
      }
    }
  }
}

// Error tracking utilities
export class ErrorTracker {
  /**
   * Capture error with context
   */
  static captureError(error: Error, context?: Record<string, string | number | boolean>) {
    Sentry.withScope((scope) => {
      if (context) {
        scope.setTags(context);
        scope.setContext('error_context', context);
      }
      
      scope.setLevel('error');
      Sentry.captureException(error);
    });
  }

  /**
   * Capture API error with request context
   */
  static captureApiError(
    error: Error, 
    request: NextRequest, 
    endpoint: string,
    userId?: string
  ) {
    Sentry.withScope((scope) => {
      scope.setTags({
        endpoint,
        method: request.method,
        user_id: userId || 'anonymous'
      });
      
      scope.setContext('request', {
        url: request.url,
        method: request.method,
        headers: Object.fromEntries(request.headers.entries()),
        endpoint
      });
      
      scope.setLevel('error');
      Sentry.captureException(error);
    });
  }

  /**
   * Capture warning
   */
  static captureWarning(message: string, context?: Record<string, string | number | boolean>) {
    Sentry.withScope((scope) => {
      if (context) {
        scope.setTags(context);
        scope.setContext('warning_context', context);
      }
      
      scope.setLevel('warning');
      Sentry.captureMessage(message, 'warning');
    });
  }

  /**
   * Capture database error
   */
  static captureDatabaseError(
    error: Error, 
    operation: string, 
    model?: string,
    query?: unknown
  ) {
    Sentry.withScope((scope) => {
      scope.setTags({
        operation,
        model: model || 'unknown',
        error_type: 'database'
      });
      
      scope.setContext('database', {
        operation,
        model,
        query: query ? JSON.stringify(query) : undefined
      });
      
      scope.setLevel('error');
      Sentry.captureException(error);
    });
  }
}

// User tracking utilities
export class UserTracker {
  /**
   * Set user context
   */
  static setUser(user: {
    id: string;
    email?: string;
    role?: string;
    [key: string]: string | number | boolean | undefined;
  }) {
    Sentry.setUser({
      email: user.email,
      username: user.email,
      ...user
    });
  }

  /**
   * Clear user context
   */
  static clearUser() {
    Sentry.setUser(null);
  }

  /**
   * Add breadcrumb for user action
   */
  static addBreadcrumb(
    message: string, 
    category: string = 'user', 
    level: 'info' | 'warning' | 'error' = 'info',
    data?: Record<string, string | number | boolean>
  ) {
    Sentry.addBreadcrumb({
      message,
      category,
      level,
      data,
      timestamp: Date.now()
    });
  }
}

// Custom Sentry middleware for API routes
export function withSentryApi(
  handler: (req: NextRequest, context?: Record<string, unknown>) => Promise<Response>,
  endpoint: string
) {
  return async (req: NextRequest, context?: Record<string, unknown>): Promise<Response> => {
    const monitor = PerformanceMonitor.measureApiEndpoint(req, endpoint);
    
    try {
      const response = await handler(req, context);
      monitor.finish(response.status);
      return response;
    } catch (error) {
      monitor.finish(500);
      ErrorTracker.captureApiError(error as Error, req, endpoint);
      throw error;
    }
  };
}

// Export main utilities
export const Monitoring = {
  performance: PerformanceMonitor,
  errors: ErrorTracker,
  users: UserTracker,
  withSentryApi
};

export default Monitoring;