/**
 * Centralized logging utility for the application
 * Provides structured logging with different levels
 */

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  data?: unknown;
  error?: Error;
}

class Logger {
  private isProduction = process.env.NODE_ENV === 'production';
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatMessage(entry: LogEntry): string {
    const { level, message, timestamp, context, data, error } = entry;
    
    if (this.isProduction) {
      // Structured JSON logging for production
      return JSON.stringify({
        level,
        message,
        timestamp,
        context,
        data: data ? JSON.stringify(data) : undefined,
        error: error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : undefined
      });
    } else {
      // Readable format for development
      let formatted = `[${timestamp}] ${level.toUpperCase()}`;
      if (context) formatted += ` [${context}]`;
      formatted += `: ${message}`;
      if (data) formatted += ` | Data: ${JSON.stringify(data)}`;
      if (error) formatted += ` | Error: ${error.message}`;
      return formatted;
    }
  }

  private log(level: LogLevel, message: string, context?: string, data?: unknown, error?: Error): void {
    // Skip debug logs in production
    if (this.isProduction && level === LogLevel.DEBUG) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      data,
      error
    };

    const formattedMessage = this.formatMessage(entry);

    switch (level) {
      case LogLevel.ERROR:
        console.error(formattedMessage);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage);
        break;
      case LogLevel.DEBUG:
        if (this.isDevelopment) {
          console.log(formattedMessage);
        }
        break;
    }
  }

  error(message: string, context?: string, data?: unknown, error?: Error): void {
    this.log(LogLevel.ERROR, message, context, data, error);
  }

  warn(message: string, context?: string, data?: unknown): void {
    this.log(LogLevel.WARN, message, context, data);
  }

  info(message: string, context?: string, data?: unknown): void {
    this.log(LogLevel.INFO, message, context, data);
  }

  debug(message: string, context?: string, data?: unknown): void {
    this.log(LogLevel.DEBUG, message, context, data);
  }

  // API specific logging helpers
  apiRequest(method: string, path: string, userId?: string): void {
    this.info(`API Request: ${method} ${path}`, 'API', { userId });
  }

  apiResponse(method: string, path: string, status: number, duration?: number): void {
    this.info(`API Response: ${method} ${path} - ${status}`, 'API', { status, duration });
  }

  apiError(method: string, path: string, error: Error, userId?: string): void {
    this.error(`API Error: ${method} ${path}`, 'API', { userId }, error);
  }

  // Database specific logging helpers
  dbQuery(operation: string, collection: string, duration?: number): void {
    this.debug(`DB Query: ${operation} on ${collection}`, 'DATABASE', { duration });
  }

  dbError(operation: string, collection: string, error: Error): void {
    this.error(`DB Error: ${operation} on ${collection}`, 'DATABASE', undefined, error);
  }

  // Auth specific logging helpers
  authAttempt(email: string, success: boolean): void {
    this.info(`Auth attempt: ${email} - ${success ? 'SUCCESS' : 'FAILED'}`, 'AUTH', { email, success });
  }

  authError(email: string, error: Error): void {
    this.error(`Auth error for: ${email}`, 'AUTH', { email }, error);
  }
}

// Export singleton instance
export const logger = new Logger();

// Legacy console.log replacement (for gradual migration)
export const devLog = (message: string, data?: any): void => {
  if (process.env.NODE_ENV === 'development') {
    logger.debug(message, 'DEV', data);
  }
}; 