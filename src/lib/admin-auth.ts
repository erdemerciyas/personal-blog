/**
 * Admin Authentication Middleware
 */

import { NextRequest } from 'next/server';
import { headers } from 'next/headers';

/**
 * Check if user is authenticated as admin
 */
export async function isAdminAuthenticated(_request: NextRequest): Promise<boolean> {
  // Bypass authentication in development mode for testing
  if (process.env.NODE_ENV === 'development') {
    console.log('[Admin Auth] Development mode - bypassing authentication');
    return true;
  }

  try {
    const headersList = headers();
    const authHeader = headersList.get('authorization');
    
    if (!authHeader) {
      return false;
    }

    // Check for session token or JWT
    const token = authHeader.replace('Bearer ', '');
    
    // Verify token with your auth system
    // This is a placeholder - implement your actual auth verification
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/session`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return false;
    }

    const session = await response.json();
    
    // Check if user has admin role
    return session.user?.role === 'admin';
  } catch (error) {
    console.error('Auth check error:', error);
    return false;
  }
}

/**
 * Validate theme slug
 */
export function isValidThemeSlug(slug: string): boolean {
  // Only allow alphanumeric, hyphens, and underscores
  const slugRegex = /^[a-z0-9_-]+$/i;
  return slugRegex.test(slug) && slug.length >= 2 && slug.length <= 50;
}

/**
 * Validate plugin slug
 */
export function isValidPluginSlug(slug: string): boolean {
  // Only allow alphanumeric, hyphens, and underscores
  const slugRegex = /^[a-z0-9_-]+$/i;
  return slugRegex.test(slug) && slug.length >= 2 && slug.length <= 50;
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .slice(0, 1000); // Limit length
}

/**
 * Get client IP for rate limiting
 */
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  return forwarded?.split(',')[0] || realIp || 'unknown';
}
