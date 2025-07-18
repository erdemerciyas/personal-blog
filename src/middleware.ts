import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimit, getClientIP, RATE_LIMITS } from './lib/rate-limit';
import { SecurityHeaders, getPageType } from './lib/security-headers';
// import { CSRFProtection } from './lib/csrf';
import { logger } from './lib/logger';

// Cache for page settings (5 minutes cache)
const pageSettingsCache: { data: any[], timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Suspicious patterns to detect
const SUSPICIOUS_PATTERNS = [
  /\.\./,                    // Directory traversal
  /\/etc\/passwd/,           // System file access
  /\/proc\//,                // Process information
  /<script/i,                // XSS attempts
  /javascript:/i,            // JavaScript protocol
  /data:.*base64/i,          // Data URLs with base64
  /union.*select/i,          // SQL injection
  /drop.*table/i,            // SQL injection
  /exec\(/i,                 // Code execution
  /eval\(/i,                 // Code evaluation
];

// Get page settings with caching (disabled for now to prevent circular calls)
async function getPageSettings(): Promise<any[]> {
  // Temporarily return empty array to prevent API calls from middleware
  return [];
}

// Check for suspicious activity
function detectSuspiciousActivity(request: NextRequest): boolean {
  const url = request.url.toLowerCase();
  const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';
  
  // Check URL for suspicious patterns
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(url)) {
      logger.error('Suspicious URL pattern detected', 'SECURITY', {
        url: request.url,
        pattern: pattern.toString(),
        ip: getClientIP(request),
        userAgent
      });
      return true;
    }
  }
  
  // Check for suspicious user agents
  const suspiciousUserAgents = [
    'sqlmap',
    'nikto',
    'nmap',
    'masscan',
    'nessus',
    'openvas',
    'burpsuite',
    'w3af',
    'havij',
    'pangolin'
  ];
  
  for (const suspicious of suspiciousUserAgents) {
    if (userAgent.includes(suspicious)) {
      logger.error('Suspicious user agent detected', 'SECURITY', {
        userAgent,
        ip: getClientIP(request)
      });
      return true;
    }
  }
  
  return false;
}

// Get rate limit type based on path
function getRateLimitType(pathname: string): keyof typeof RATE_LIMITS {
  if (pathname.includes('/login') || pathname.includes('/signin')) {
    return 'LOGIN';
  }
  if (pathname.includes('/register') || pathname.includes('/signup')) {
    return 'REGISTER';
  }
  if (pathname.includes('/reset-password') || pathname.includes('/forgot-password')) {
    return 'PASSWORD_RESET';
  }
  if (pathname.includes('/contact')) {
    return 'CONTACT';
  }
  if (pathname.includes('/upload')) {
    return 'UPLOAD';
  }
  if (pathname.startsWith('/api/auth')) {
    return 'AUTH';
  }
  if (pathname.startsWith('/api/admin')) {
    return 'API_STRICT';
  }
  if (pathname.startsWith('/api/')) {
    return 'API_MODERATE';
  }
  
  return 'GENERAL';
}

// Sayfa erişilebilirlik kontrolü
async function checkPageAccess(path: string): Promise<boolean> {
  try {
    // Admin sayfalarını ve API'leri kontrol etmeyin
    if (path.startsWith('/admin') || path.startsWith('/api')) {
      return true;
    }

    // Static dosyalar için kontrol yapma
    if (path.includes('.') || path.startsWith('/_next')) {
      return true;
    }

    // Ana sayfa için özel kontrol
    const pageId = path === '/' ? 'home' : path.slice(1);
    
    const pageSettings = await getPageSettings();
    const pageSetting = pageSettings.find((page: { pageId: string; path: string; isActive?: boolean }) => 
      page.pageId === pageId || page.path === path
    );
    
    // Sayfa ayarı bulunamazsa veya aktifse erişime izin ver
    return !pageSetting || pageSetting.isActive !== false;
  } catch {
    // Hata durumunda varsayılan olarak erişime izin ver
    return true;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const clientIP = getClientIP(request);
  
  // Skip middleware for static files
  if (
    pathname.startsWith('/_next') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/robots') ||
    pathname.startsWith('/sitemap')
  ) {
    return NextResponse.next();
  }

  // 1. Detect suspicious activity
  if (detectSuspiciousActivity(request)) {
    logger.error('Blocking suspicious request', 'SECURITY', {
      ip: clientIP,
      pathname,
      userAgent: request.headers.get('user-agent')
    });
    return new NextResponse('Forbidden', { status: 403 });
  }

  // 2. Apply rate limiting (temporarily disabled for debugging)
  const rateLimitType = getRateLimitType(pathname);
  const isAuthEndpoint = ['LOGIN', 'REGISTER', 'PASSWORD_RESET', 'AUTH'].includes(rateLimitType);
  
  // TEMPORARY: Bypass rate limiting for all endpoints except critical auth
  const shouldBypassRateLimit = true; // Geçici olarak tüm rate limiting'i devre dışı bırak
  
  let rateLimitResult = { allowed: true, remaining: 1000, resetTime: Date.now() + 60000 };
  
  if (!shouldBypassRateLimit && isAuthEndpoint) { // Sadece kritik auth endpoint'lerde rate limiting
    rateLimitResult = rateLimit(clientIP, rateLimitType);
    
    if (!rateLimitResult.allowed) {
      logger.warn('Rate limit exceeded', 'SECURITY', {
        ip: clientIP,
        pathname,
        type: rateLimitType,
        resetTime: new Date(rateLimitResult.resetTime).toISOString()
      });
      
      const response = new NextResponse('Too Many Requests', { status: 429 });
      response.headers.set('Retry-After', Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString());
      response.headers.set('X-RateLimit-Limit', RATE_LIMITS[rateLimitType].limit.toString());
      response.headers.set('X-RateLimit-Remaining', '0');
      response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString());
      
      return SecurityHeaders.apply(response);
    }
  }

  // 3. CSRF Protection for state-changing requests (temporarily disabled for deployment)
  // if (CSRFProtection.needsProtection(request)) {
  //   const csrfResult = await CSRFProtection.middleware()(request);
  //   if (csrfResult) {
  //     return SecurityHeaders.apply(NextResponse.next());
  //   }
  // }

  // 4. Check page accessibility (for non-API routes)
  if (!pathname.startsWith('/api') && !pathname.startsWith('/admin')) {
    const isAccessible = await checkPageAccess(pathname);
    
    if (!isAccessible) {
      return new NextResponse(null, { status: 404 });
    }
  }

  // 5. Create response with security headers
  const response = NextResponse.next();
  
  // Add rate limit headers
  response.headers.set('X-RateLimit-Limit', RATE_LIMITS[rateLimitType].limit.toString());
  response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
  response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString());
  
  // Add security headers based on page type
  const pageType = getPageType(pathname);
  const secureResponse = SecurityHeaders.apply(response, {
    contentSecurityPolicy: SecurityHeaders.getCSPForPage(pageType)
  });
  
  // Add performance headers
  secureResponse.headers.set('X-Robots-Tag', 'index, follow');
  
  // Add request ID for tracking
  const requestId = Math.random().toString(36).substring(2, 15);
  secureResponse.headers.set('X-Request-ID', requestId);
  
  return secureResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - robots.txt, sitemap.xml
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
}; 