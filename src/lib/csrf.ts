import { NextRequest } from 'next/server';
import { randomBytes, createHash } from 'crypto';
import { logger } from '@/core/lib/logger';

// CSRF token storage (in production, use Redis or database)
const csrfTokens = new Map<string, { token: string; expires: number; used: boolean }>();

// Token expiration time (30 minutes)
const TOKEN_EXPIRY = 30 * 60 * 1000;

export class CSRFProtection {
  /**
   * Generate a new CSRF token for a session
   */
  static generateToken(sessionId: string): string {
    const token = randomBytes(32).toString('hex');
    const expires = Date.now() + TOKEN_EXPIRY;

    // Store token with session ID
    csrfTokens.set(sessionId, {
      token,
      expires,
      used: false
    });

    // Clean up expired tokens
    this.cleanupExpiredTokens();

    logger.info('CSRF token generated', 'SECURITY', { sessionId });

    return token;
  }

  /**
   * Validate CSRF token
   */
  static validateToken(sessionId: string, providedToken: string): boolean {
    const storedData = csrfTokens.get(sessionId);

    if (!storedData) {
      logger.warn('CSRF validation failed: No token found', 'SECURITY', { sessionId });
      return false;
    }

    // Check if token is expired
    if (Date.now() > storedData.expires) {
      csrfTokens.delete(sessionId);
      logger.warn('CSRF validation failed: Token expired', 'SECURITY', { sessionId });
      return false;
    }

    // Check if token was already used (prevent replay attacks)
    if (storedData.used) {
      logger.warn('CSRF validation failed: Token already used', 'SECURITY', { sessionId });
      return false;
    }

    // Validate token using constant-time comparison
    if (!this.constantTimeCompare(storedData.token, providedToken)) {
      logger.warn('CSRF validation failed: Invalid token', 'SECURITY', { sessionId });
      return false;
    }

    // Mark token as used
    storedData.used = true;

    logger.info('CSRF token validated successfully', 'SECURITY', { sessionId });
    return true;
  }

  /**
   * Constant-time string comparison to prevent timing attacks
   */
  private static constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }

  /**
   * Clean up expired tokens
   */
  private static cleanupExpiredTokens(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    csrfTokens.forEach((value, key) => {
      if (now > value.expires) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => csrfTokens.delete(key));
  }

  /**
   * Get CSRF token from request headers or body
   */
  static getTokenFromRequest(request: NextRequest): string | null {
    // Check X-CSRF-Token header first
    const headerToken = request.headers.get('x-csrf-token');
    if (headerToken) {
      return headerToken;
    }

    // Check X-Requested-With header (for AJAX requests)
    const requestedWith = request.headers.get('x-requested-with');
    if (requestedWith === 'XMLHttpRequest') {
      // For AJAX requests, we can be more lenient
      return request.headers.get('x-csrf-token') || null;
    }

    return null;
  }

  /**
   * Generate session ID from request
   */
  static generateSessionId(request: NextRequest): string {
    const ip = this.getClientIP(request);
    const userAgent = request.headers.get('user-agent') || '';
    const timestamp = Math.floor(Date.now() / (5 * 60 * 1000)); // 5-minute windows

    return createHash('sha256')
      .update(`${ip}:${userAgent}:${timestamp}`)
      .digest('hex');
  }

  /**
   * Get client IP address
   */
  private static getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const real = request.headers.get('x-real-ip');

    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }

    if (real) {
      return real;
    }

    return request.ip || 'unknown';
  }

  /**
   * Check if request needs CSRF protection
   */
  static needsProtection(request: NextRequest): boolean {
    const method = request.method.toLowerCase();
    const pathname = request.nextUrl.pathname;

    // Only protect state-changing methods
    if (!['post', 'put', 'patch', 'delete'].includes(method)) {
      return false;
    }

    // Skip CSRF for certain endpoints
    const skipPaths = [
      '/api/auth/', // NextAuth handles its own CSRF
      '/api/webhook/', // Webhooks have their own validation
    ];

    return !skipPaths.some(path => pathname.startsWith(path));
  }

  /**
   * Create CSRF middleware
   */
  static middleware() {
    return async (request: NextRequest) => {
      if (!this.needsProtection(request)) {
        return null; // No protection needed
      }

      const sessionId = this.generateSessionId(request);
      const providedToken = this.getTokenFromRequest(request);

      if (!providedToken) {
        logger.warn('CSRF protection: No token provided', 'SECURITY', {
          method: request.method,
          pathname: request.nextUrl.pathname,
          sessionId
        });
        return new Response('CSRF token required', { status: 403 });
      }

      if (!this.validateToken(sessionId, providedToken)) {
        logger.error('CSRF protection: Token validation failed', 'SECURITY', {
          method: request.method,
          pathname: request.nextUrl.pathname,
          sessionId
        });
        return new Response('Invalid CSRF token', { status: 403 });
      }

      return null; // Validation passed
    };
  }
}

// Helper function to add CSRF token to forms
export function addCSRFTokenToForm(sessionId: string): string {
  const token = CSRFProtection.generateToken(sessionId);
  return `<input type="hidden" name="_csrf" value="${token}" />`;
}

// Helper function for API responses
export function getCSRFToken(sessionId: string): string {
  return CSRFProtection.generateToken(sessionId);
}