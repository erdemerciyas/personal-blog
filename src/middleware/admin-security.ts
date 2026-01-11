/**
 * Admin Security Middleware
 * Provides comprehensive security for admin API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { isAdminAuthenticated, getClientIP } from '../lib/admin-auth';

// Rate limiting store (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Check rate limit
 */
function checkRateLimit(ip: string, endpoint: string): boolean {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 10;
  const key = `${ip}:${endpoint}`;

  const record = rateLimitStore.get(key);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * Generate CSRF token
 */
function generateCSRFToken(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

/**
 * Verify CSRF token
 */
function verifyCSRFToken(request: NextRequest): boolean {
  const headersList = headers();
  const csrfToken = headersList.get('x-csrf-token');
  const cookieToken = request.cookies.get('csrf_token')?.value;

  if (!csrfToken || !cookieToken) {
    return false;
  }

  return csrfToken === cookieToken;
}

/**
 * Security headers
 */
function getSecurityHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'self';",
  };
}

/**
 * Main security middleware
 */
export async function adminSecurityMiddleware(request: NextRequest) {
  const startTime = Date.now();
  const pathname = request.nextUrl.pathname;

  // Only apply to admin routes
  if (!pathname.startsWith('/api/admin/')) {
    return NextResponse.next();
  }

  try {
    // Check authentication
    const isAuthenticated = await isAdminAuthenticated(request);
    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        {
          status: 401,
          headers: {
            ...getSecurityHeaders(),
            'WWW-Authenticate': 'Bearer realm="Admin API"',
          },
        }
      );
    }

    // Check rate limit
    const clientIP = getClientIP(request);
    const endpoint = pathname.split('/').pop() || 'unknown';
    if (!checkRateLimit(clientIP, endpoint)) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: getSecurityHeaders(),
        }
      );
    }

    // For POST requests, verify CSRF
    if (request.method === 'POST') {
      const isValidCSRF = verifyCSRFToken(request);
      if (!isValidCSRF) {
        return NextResponse.json(
          { success: false, error: 'Invalid CSRF token' },
          {
            status: 403,
            headers: getSecurityHeaders(),
          }
        );
      }
    }

    // Calculate processing time
    const processingTime = Date.now() - startTime;

    // Add security headers to response
    const response = NextResponse.next();
    response.headers.set('X-Response-Time', processingTime.toString());
    
    return response;
  } catch (error) {
    console.error('Security middleware error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      {
        status: 500,
        headers: getSecurityHeaders(),
      }
    );
  }
}

/**
 * Generate CSRF token for client
 */
export function generateCSRFTokenForClient(): string {
  return generateCSRFToken();
}
