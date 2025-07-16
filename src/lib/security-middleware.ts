/**
 * Advanced security middleware for API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { SecurityUtils } from './security-utils';
import { logger } from './logger';

export interface SecurityConfig {
  requireAuth?: boolean;
  requireAdmin?: boolean;
  rateLimitType?: string;
  validateInput?: boolean;
  logRequests?: boolean;
}

export function withSecurity(config: SecurityConfig = {}) {
  return function securityMiddleware(handler: Function) {
    return async function securedHandler(request: NextRequest, ...args: any[]) {
      const startTime = Date.now();
      const clientIP = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
      
      try {
        // 1. Request logging
        if (config.logRequests !== false) {
          logger.info('API Request', 'API', {
            method: request.method,
            url: request.url,
            ip: clientIP,
            userAgent: request.headers.get('user-agent')
          });
        }

        // 2. Authentication check
        if (config.requireAuth) {
          const session = await getServerSession(authOptions);
          if (!session?.user?.email) {
            SecurityUtils.logSecurityEvent('Unauthorized API Access', {
              url: request.url,
              ip: clientIP,
              method: request.method
            }, 'medium');
            
            return NextResponse.json(
              { error: 'Bu işlem için giriş yapmanız gerekli' },
              { status: 401 }
            );
          }

          // Admin check
          if (config.requireAdmin && (session.user as any).role !== 'admin') {
            SecurityUtils.logSecurityEvent('Admin Access Attempt', {
              url: request.url,
              ip: clientIP,
              email: session.user.email,
              role: (session.user as any).role
            }, 'high');
            
            return NextResponse.json(
              { error: 'Bu işlem için admin yetkisi gerekli' },
              { status: 403 }
            );
          }
        }

        // 3. Input validation for POST/PUT requests
        if (config.validateInput && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
          try {
            const body = await request.clone().json();
            
            // Check for suspicious patterns in all string values
            const checkObject = (obj: any, path = ''): string[] => {
              const issues: string[] = [];
              
              for (const [key, value] of Object.entries(obj)) {
                const currentPath = path ? `${path}.${key}` : key;
                
                if (typeof value === 'string') {
                  // SQL injection check
                  if (SecurityUtils.containsSQLInjection(value)) {
                    issues.push(`SQL injection pattern detected in ${currentPath}`);
                  }
                  
                  // Directory traversal check
                  if (SecurityUtils.containsDirectoryTraversal(value)) {
                    issues.push(`Directory traversal pattern detected in ${currentPath}`);
                  }
                  
                  // XSS check (basic)
                  if (/<script|javascript:|on\w+=/i.test(value)) {
                    issues.push(`XSS pattern detected in ${currentPath}`);
                  }
                } else if (typeof value === 'object' && value !== null) {
                  issues.push(...checkObject(value, currentPath));
                }
              }
              
              return issues;
            };
            
            const securityIssues = checkObject(body);
            if (securityIssues.length > 0) {
              SecurityUtils.logSecurityEvent('Malicious Input Detected', {
                url: request.url,
                ip: clientIP,
                issues: securityIssues,
                body: JSON.stringify(body).substring(0, 500) // First 500 chars only
              }, 'high');
              
              return NextResponse.json(
                { error: 'Güvenlik riski tespit edildi' },
                { status: 400 }
              );
            }
          } catch (error) {
            // If JSON parsing fails, continue (might be form data or other format)
          }
        }

        // 4. Execute the actual handler
        const response = await handler(request, ...args);
        
        // 5. Add security headers to response
        if (response instanceof NextResponse) {
          response.headers.set('X-Content-Type-Options', 'nosniff');
          response.headers.set('X-Frame-Options', 'DENY');
          response.headers.set('X-XSS-Protection', '1; mode=block');
          response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
          
          // Add request timing for monitoring
          const duration = Date.now() - startTime;
          response.headers.set('X-Response-Time', `${duration}ms`);
          
          // Log slow requests
          if (duration > 5000) { // 5 seconds
            logger.warn('Slow API Request', 'PERFORMANCE', {
              url: request.url,
              duration,
              method: request.method
            });
          }
        }
        
        return response;
        
      } catch (error) {
        // Log the error but don't expose internal details
        logger.error('API Error', 'API', {
          url: request.url,
          method: request.method,
          ip: clientIP,
          error: error instanceof Error ? error.message : 'Unknown error',
          duration: Date.now() - startTime
        });
        
        return NextResponse.json(
          { error: 'Sunucu hatası oluştu' },
          { status: 500 }
        );
      }
    };
  };
}

// Predefined security configurations
export const SecurityConfigs = {
  // Public API endpoints
  public: {
    requireAuth: false,
    validateInput: true,
    logRequests: true
  },
  
  // User authenticated endpoints
  authenticated: {
    requireAuth: true,
    requireAdmin: false,
    validateInput: true,
    logRequests: true
  },
  
  // Admin only endpoints
  admin: {
    requireAuth: true,
    requireAdmin: true,
    validateInput: true,
    logRequests: true
  },
  
  // High security endpoints (password changes, etc.)
  highSecurity: {
    requireAuth: true,
    requireAdmin: false,
    validateInput: true,
    logRequests: true,
    rateLimitType: 'STRICT'
  }
};

// Usage example:
// export const POST = withSecurity(SecurityConfigs.admin)(async (request: NextRequest) => {
//   // Your handler code here
// });