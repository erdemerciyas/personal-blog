/**
 * Centralized error handling utility
 * Provides consistent error responses and logging
 */

import { NextResponse } from 'next/server';
import { logger } from './logger';

export enum ErrorCode {
  // Client errors (4xx)
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMITED = 'RATE_LIMITED',
  
  // Server errors (5xx)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  
  // Custom application errors
  AUTH_ERROR = 'AUTH_ERROR',
  UPLOAD_ERROR = 'UPLOAD_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR'
}

export interface AppError extends Error {
  code: ErrorCode;
  statusCode: number;
  details?: any;
  isOperational?: boolean;
}

export class CustomError extends Error implements AppError {
  code: ErrorCode;
  statusCode: number;
  details?: any;
  isOperational = true;

  constructor(
    message: string,
    code: ErrorCode,
    statusCode: number,
    details?: any
  ) {
    super(message);
    this.name = 'CustomError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;

    // Maintains proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

// Predefined error creators
export const createError = {
  badRequest: (message: string, details?: any) => 
    new CustomError(message, ErrorCode.BAD_REQUEST, 400, details),
  
  unauthorized: (message: string = 'Unauthorized') => 
    new CustomError(message, ErrorCode.UNAUTHORIZED, 401),
  
  forbidden: (message: string = 'Forbidden') => 
    new CustomError(message, ErrorCode.FORBIDDEN, 403),
  
  notFound: (message: string = 'Not found') => 
    new CustomError(message, ErrorCode.NOT_FOUND, 404),
  
  validation: (message: string, details?: any) => 
    new CustomError(message, ErrorCode.VALIDATION_ERROR, 422, details),
  
  internal: (message: string = 'Internal server error', details?: any) => 
    new CustomError(message, ErrorCode.INTERNAL_ERROR, 500, details),
  
  database: (message: string, details?: any) => 
    new CustomError(message, ErrorCode.DATABASE_ERROR, 500, details),
  
  auth: (message: string, details?: any) => 
    new CustomError(message, ErrorCode.AUTH_ERROR, 401, details),
  
  upload: (message: string, details?: any) => 
    new CustomError(message, ErrorCode.UPLOAD_ERROR, 400, details),
  
  permission: (message: string, details?: any) => 
    new CustomError(message, ErrorCode.PERMISSION_ERROR, 403, details)
};

// Error response formatter
export function formatErrorResponse(error: Error | AppError, path?: string) {
  const isAppError = 'code' in error && 'statusCode' in error;
  const isProduction = process.env.NODE_ENV === 'production';

  if (isAppError) {
    const appError = error as AppError;
    
    // Log the error
    logger.error(appError.message, 'ERROR_HANDLER', {
      code: appError.code,
      statusCode: appError.statusCode,
      path,
      details: appError.details
    }, appError);

    return {
      error: {
        message: appError.message,
        code: appError.code,
        ...(appError.details && { details: appError.details }),
        ...(path && { path }),
        ...(isProduction ? {} : { stack: appError.stack })
      },
      statusCode: appError.statusCode
    };
  } else {
    // Handle unknown errors
    logger.error('Unhandled error', 'ERROR_HANDLER', { path }, error);

    return {
      error: {
        message: isProduction ? 'Internal server error' : error.message,
        code: ErrorCode.INTERNAL_ERROR,
        ...(path && { path }),
        ...(isProduction ? {} : { stack: error.stack })
      },
      statusCode: 500
    };
  }
}

// API error handler
export function handleApiError(error: Error, request?: Request): NextResponse {
  const path = request?.url;
  const { error: formattedError, statusCode } = formatErrorResponse(error, path);
  
  return NextResponse.json(formattedError, { 
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
    }
  });
}

// Async error wrapper for API routes
export function asyncHandler(fn: Function) {
  return async (req: Request, context?: any) => {
    try {
      return await fn(req, context);
    } catch (error) {
      return handleApiError(error as Error, req);
    }
  };
}

// Database error parser
export function parseDatabaseError(error: any): AppError {
  if (error.code === 11000) {
    // MongoDB duplicate key error
    const field = Object.keys(error.keyValue)[0];
    return createError.validation(`${field} already exists`, {
      field,
      value: error.keyValue[field]
    });
  }
  
  if (error.name === 'ValidationError') {
    // Mongoose validation error
    const errors = Object.values(error.errors).map((err: any) => ({
      field: err.path,
      message: err.message
    }));
    return createError.validation('Validation failed', { errors });
  }
  
  if (error.name === 'CastError') {
    // MongoDB cast error (invalid ObjectId, etc.)
    return createError.badRequest(`Invalid ${error.path}: ${error.value}`);
  }
  
  // Generic database error
  return createError.database('Database operation failed');
}

// Track if global handlers are already setup to prevent memory leaks
let globalHandlersSetup = false;

// Global error handlers
export function setupGlobalErrorHandlers() {
  // Prevent multiple setups
  if (globalHandlersSetup) {
    return;
  }

  try {
    // Increase max listeners to prevent warnings
    process.setMaxListeners(20);

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      logger.error('Unhandled Promise Rejection', 'GLOBAL', {
        reason: reason?.message || reason,
        promise: promise.toString()
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught Exception', 'GLOBAL', undefined, error);
      // Don't exit in development for better DX
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
    });

    globalHandlersSetup = true;
    logger.debug('Global error handlers setup complete', 'ERROR_HANDLER');
  } catch (error) {
    console.error('Failed to setup global error handlers:', error);
  }
} 