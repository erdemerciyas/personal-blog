/**
 * Advanced error handling utilities
 * Provides detailed error tracking, categorization, and recovery strategies
 */

import { logger } from './logger';

export interface ErrorContext {
  userId?: string;
  requestId?: string;
  endpoint?: string;
  method?: string;
  timestamp?: Date;
  userAgent?: string;
  ip?: string;
  additionalData?: Record<string, unknown>;
}

export interface ErrorMetrics {
  errorCount: number;
  lastOccurrence: Date;
  firstOccurrence: Date;
  contexts: ErrorContext[];
}

export class ErrorTracker {
  private static errors: Map<string, ErrorMetrics> = new Map();
  private static maxContextsPerError = 10;

  /**
   * Track an error occurrence
   */
  static track(errorKey: string, context?: ErrorContext): void {
    const now = new Date();
    const existing = this.errors.get(errorKey);

    if (existing) {
      existing.errorCount++;
      existing.lastOccurrence = now;
      
      // Keep only recent contexts
      if (existing.contexts.length < this.maxContextsPerError) {
        existing.contexts.push(context || {});
      } else {
        existing.contexts.shift();
        existing.contexts.push(context || {});
      }
    } else {
      this.errors.set(errorKey, {
        errorCount: 1,
        firstOccurrence: now,
        lastOccurrence: now,
        contexts: context ? [context] : [],
      });
    }
  }

  /**
   * Get error metrics
   */
  static getMetrics(errorKey: string): ErrorMetrics | undefined {
    return this.errors.get(errorKey);
  }

  /**
   * Get all tracked errors
   */
  static getAllMetrics(): Map<string, ErrorMetrics> {
    return new Map(this.errors);
  }

  /**
   * Clear error tracking
   */
  static clear(): void {
    this.errors.clear();
  }

  /**
   * Get frequently occurring errors
   */
  static getFrequentErrors(limit: number = 10): Array<[string, ErrorMetrics]> {
    return Array.from(this.errors.entries())
      .sort((a, b) => b[1].errorCount - a[1].errorCount)
      .slice(0, limit);
  }
}

/**
 * Error categorization
 */
export enum ErrorCategory {
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NOT_FOUND = 'not_found',
  CONFLICT = 'conflict',
  RATE_LIMIT = 'rate_limit',
  EXTERNAL_SERVICE = 'external_service',
  DATABASE = 'database',
  FILE_OPERATION = 'file_operation',
  NETWORK = 'network',
  UNKNOWN = 'unknown',
}

/**
 * Categorize errors based on type and message
 */
export function categorizeError(error: Error | unknown): ErrorCategory {
  if (!(error instanceof Error)) {
    return ErrorCategory.UNKNOWN;
  }

  const message = error.message.toLowerCase();
  const name = error.name.toLowerCase();

  // Validation errors
  if (message.includes('validation') || message.includes('invalid')) {
    return ErrorCategory.VALIDATION;
  }

  // Authentication errors
  if (message.includes('unauthorized') || message.includes('unauthenticated')) {
    return ErrorCategory.AUTHENTICATION;
  }

  // Authorization errors
  if (message.includes('forbidden') || message.includes('permission')) {
    return ErrorCategory.AUTHORIZATION;
  }

  // Not found errors
  if (message.includes('not found') || message.includes('404')) {
    return ErrorCategory.NOT_FOUND;
  }

  // Conflict errors
  if (message.includes('conflict') || message.includes('duplicate') || message.includes('409')) {
    return ErrorCategory.CONFLICT;
  }

  // Rate limit errors
  if (message.includes('rate limit') || message.includes('too many')) {
    return ErrorCategory.RATE_LIMIT;
  }

  // Database errors
  if (name.includes('mongoerror') || message.includes('database') || message.includes('mongodb')) {
    return ErrorCategory.DATABASE;
  }

  // File operation errors
  if (message.includes('file') || message.includes('upload') || message.includes('download')) {
    return ErrorCategory.FILE_OPERATION;
  }

  // Network errors
  if (message.includes('network') || message.includes('timeout') || message.includes('econnrefused')) {
    return ErrorCategory.NETWORK;
  }

  // External service errors
  if (message.includes('external') || message.includes('api') || message.includes('service')) {
    return ErrorCategory.EXTERNAL_SERVICE;
  }

  return ErrorCategory.UNKNOWN;
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: Error | unknown, category?: ErrorCategory): string {
  const cat = category || categorizeError(error);

  const messages: Record<ErrorCategory, string> = {
    [ErrorCategory.VALIDATION]: 'Lütfen girdiğiniz bilgileri kontrol edin.',
    [ErrorCategory.AUTHENTICATION]: 'Lütfen giriş yapınız.',
    [ErrorCategory.AUTHORIZATION]: 'Bu işlemi gerçekleştirme izniniz yok.',
    [ErrorCategory.NOT_FOUND]: 'Aradığınız kaynak bulunamadı.',
    [ErrorCategory.CONFLICT]: 'Bu kayıt zaten mevcut.',
    [ErrorCategory.RATE_LIMIT]: 'Çok fazla istek gönderdiniz. Lütfen biraz bekleyin.',
    [ErrorCategory.EXTERNAL_SERVICE]: 'Dış hizmet şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.',
    [ErrorCategory.DATABASE]: 'Veritabanı hatası oluştu. Lütfen daha sonra tekrar deneyin.',
    [ErrorCategory.FILE_OPERATION]: 'Dosya işlemi başarısız oldu.',
    [ErrorCategory.NETWORK]: 'Ağ bağlantısı sorunu. Lütfen bağlantınızı kontrol edin.',
    [ErrorCategory.UNKNOWN]: 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
  };

  return messages[cat];
}

/**
 * Error recovery strategies
 */
export interface RecoveryStrategy {
  retry: boolean;
  retryDelay: number;
  retryCount: number;
  fallback?: unknown;
  notify: boolean;
}

export function getRecoveryStrategy(category: ErrorCategory): RecoveryStrategy {
  const strategies: Record<ErrorCategory, RecoveryStrategy> = {
    [ErrorCategory.VALIDATION]: {
      retry: false,
      retryDelay: 0,
      retryCount: 0,
      notify: false,
    },
    [ErrorCategory.AUTHENTICATION]: {
      retry: false,
      retryDelay: 0,
      retryCount: 0,
      notify: true,
    },
    [ErrorCategory.AUTHORIZATION]: {
      retry: false,
      retryDelay: 0,
      retryCount: 0,
      notify: true,
    },
    [ErrorCategory.NOT_FOUND]: {
      retry: false,
      retryDelay: 0,
      retryCount: 0,
      notify: false,
    },
    [ErrorCategory.CONFLICT]: {
      retry: false,
      retryDelay: 0,
      retryCount: 0,
      notify: false,
    },
    [ErrorCategory.RATE_LIMIT]: {
      retry: true,
      retryDelay: 5000,
      retryCount: 3,
      notify: true,
    },
    [ErrorCategory.EXTERNAL_SERVICE]: {
      retry: true,
      retryDelay: 2000,
      retryCount: 3,
      notify: true,
    },
    [ErrorCategory.DATABASE]: {
      retry: true,
      retryDelay: 1000,
      retryCount: 2,
      notify: true,
    },
    [ErrorCategory.FILE_OPERATION]: {
      retry: true,
      retryDelay: 1000,
      retryCount: 2,
      notify: true,
    },
    [ErrorCategory.NETWORK]: {
      retry: true,
      retryDelay: 3000,
      retryCount: 3,
      notify: true,
    },
    [ErrorCategory.UNKNOWN]: {
      retry: true,
      retryDelay: 1000,
      retryCount: 1,
      notify: true,
    },
  };

  return strategies[category];
}

/**
 * Detailed error logger
 */
export function logDetailedError(
  error: Error | unknown,
  context: ErrorContext,
  additionalInfo?: Record<string, unknown>
): void {
  const category = categorizeError(error);
  const errorKey = `${category}:${(error as Error)?.message || 'unknown'}`;

  ErrorTracker.track(errorKey, context);

  logger.error(
    (error as Error)?.message || 'Unknown error',
    'ERROR_HANDLER',
    {
      category,
      context,
      ...additionalInfo,
    },
    error instanceof Error ? error : undefined
  );
}

/**
 * Retry with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
}
