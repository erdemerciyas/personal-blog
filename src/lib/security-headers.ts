import { NextResponse } from 'next/server';

export interface SecurityHeadersConfig {
  contentSecurityPolicy?: string;
  strictTransportSecurity?: string;
  xFrameOptions?: string;
  xContentTypeOptions?: string;
  referrerPolicy?: string;
  permissionsPolicy?: string;
  crossOriginEmbedderPolicy?: string;
  crossOriginOpenerPolicy?: string;
  crossOriginResourcePolicy?: string;
}

export class SecurityHeaders {
  private static readonly DEVELOPMENT_CSP = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://va.vercel-scripts.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https: http:",
    "media-src 'self' https:",
    "connect-src 'self' https: wss: ws://localhost:* http://localhost:*",
    "frame-src 'self' https:",
    "worker-src 'self' blob:",
    "child-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'"
  ].join('; ');

  private static readonly PRODUCTION_CSP = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://vercel.live https://va.vercel-scripts.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "media-src 'self' https:",
    "connect-src 'self' https: wss:",
    "frame-src 'self' https:",
    "worker-src 'self' blob:",
    "child-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ');

  private static readonly DEFAULT_CSP = process.env.NODE_ENV === 'development' 
    ? this.DEVELOPMENT_CSP 
    : this.PRODUCTION_CSP;

  private static readonly DEFAULT_HEADERS: SecurityHeadersConfig = {
    contentSecurityPolicy: this.DEFAULT_CSP,
    strictTransportSecurity: 'max-age=31536000; includeSubDomains; preload',
    xFrameOptions: 'DENY',
    xContentTypeOptions: 'nosniff',
    referrerPolicy: 'strict-origin-when-cross-origin',
    permissionsPolicy: [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'interest-cohort=()',
      'payment=()',
      'usb=()',
      'bluetooth=()',
      'magnetometer=()',
      'gyroscope=()',
      'accelerometer=()'
    ].join(', '),
    crossOriginEmbedderPolicy: 'credentialless',
    crossOriginOpenerPolicy: 'same-origin',
    crossOriginResourcePolicy: 'same-origin'
  };

  /**
   * Apply security headers to response
   */
  static apply(response: NextResponse, customConfig?: SecurityHeadersConfig): NextResponse {
    const config = { ...this.DEFAULT_HEADERS, ...customConfig };

    // Content Security Policy - Skip in development to avoid conflicts with Next.js dev server
    if (config.contentSecurityPolicy && process.env.NODE_ENV === 'production') {
      response.headers.set('Content-Security-Policy', config.contentSecurityPolicy);
    }

    // HTTP Strict Transport Security
    if (config.strictTransportSecurity && process.env.NODE_ENV === 'production') {
      response.headers.set('Strict-Transport-Security', config.strictTransportSecurity);
    }

    // X-Frame-Options
    if (config.xFrameOptions) {
      response.headers.set('X-Frame-Options', config.xFrameOptions);
    }

    // X-Content-Type-Options
    if (config.xContentTypeOptions) {
      response.headers.set('X-Content-Type-Options', config.xContentTypeOptions);
    }

    // Referrer Policy
    if (config.referrerPolicy) {
      response.headers.set('Referrer-Policy', config.referrerPolicy);
    }

    // Permissions Policy
    if (config.permissionsPolicy) {
      response.headers.set('Permissions-Policy', config.permissionsPolicy);
    }

    // Cross-Origin Embedder Policy
    if (config.crossOriginEmbedderPolicy) {
      response.headers.set('Cross-Origin-Embedder-Policy', config.crossOriginEmbedderPolicy);
    }

    // Cross-Origin Opener Policy
    if (config.crossOriginOpenerPolicy) {
      response.headers.set('Cross-Origin-Opener-Policy', config.crossOriginOpenerPolicy);
    }

    // Cross-Origin Resource Policy
    if (config.crossOriginResourcePolicy) {
      response.headers.set('Cross-Origin-Resource-Policy', config.crossOriginResourcePolicy);
    }

    // Additional security headers
    response.headers.set('X-DNS-Prefetch-Control', 'off');
    response.headers.set('X-Download-Options', 'noopen');
    response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
    response.headers.set('X-XSS-Protection', '1; mode=block');

    // Remove server information
    response.headers.delete('Server');
    response.headers.delete('X-Powered-By');

    return response;
  }

  /**
   * Get CSP for specific page types
   */
  static getCSPForPage(pageType: 'admin' | 'public' | 'api'): string {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const baseCSP = [
      "default-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ];

    // Only add upgrade-insecure-requests in production
    if (!isDevelopment) {
      baseCSP.push("upgrade-insecure-requests");
    }

    switch (pageType) {
      case 'admin':
        const adminCSP = [
          ...baseCSP,
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Admin needs more flexibility
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "font-src 'self' https://fonts.gstatic.com",
          "img-src 'self' data: blob: https: http:",
          "media-src 'self' https:",
          "frame-src 'self'",
          "worker-src 'self' blob:",
          "child-src 'self' blob:",
          "frame-ancestors 'none'"
        ];

        if (isDevelopment) {
          adminCSP.push("connect-src 'self' https: wss: ws://localhost:* http://localhost:*");
        } else {
          adminCSP.push("connect-src 'self' https: wss:");
        }

        return adminCSP.join('; ');

      case 'public':
        const publicCSP = [
          ...baseCSP,
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "font-src 'self' https://fonts.gstatic.com",
          "img-src 'self' data: https:",
          "media-src 'self' https:",
          "frame-src 'none'",
          "frame-ancestors 'none'"
        ];

        if (isDevelopment) {
          publicCSP.push("script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://va.vercel-scripts.com");
          publicCSP.push("connect-src 'self' https: wss: ws://localhost:* http://localhost:*");
        } else {
          publicCSP.push("script-src 'self' 'unsafe-inline' https://vercel.live https://va.vercel-scripts.com");
          publicCSP.push("connect-src 'self' https: wss:");
        }

        return publicCSP.join('; ');

      case 'api':
        return [
          "default-src 'none'",
          "frame-ancestors 'none'"
        ].join('; ');

      default:
        return this.DEFAULT_CSP;
    }
  }

  /**
   * Create middleware for security headers
   */
  static middleware(pageType?: 'admin' | 'public' | 'api') {
    return (response: NextResponse) => {
      const csp = pageType ? this.getCSPForPage(pageType) : this.DEFAULT_CSP;
      return this.apply(response, { contentSecurityPolicy: csp });
    };
  }
}

// Utility function to detect page type from pathname
export function getPageType(pathname: string): 'admin' | 'public' | 'api' {
  if (pathname.startsWith('/api/')) {
    return 'api';
  }
  if (pathname.startsWith('/admin/')) {
    return 'admin';
  }
  return 'public';
}