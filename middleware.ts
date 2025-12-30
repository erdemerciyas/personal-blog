import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit';
import { SecurityHeaders, getPageType } from '@/lib/security-headers';
import { logger } from '@/lib/logger';

// Cache for page settings (short TTL)
let pageSettingsCache: { data: any[]; timestamp: number } | null = null;
const PAGE_SETTINGS_CACHE_TTL = 60 * 1000; // 60s - Increased for better performance

export function clearPageSettingsCache() {
  pageSettingsCache = null;
}

async function getPageSettings(): Promise<any[]> {
  const now = Date.now();
  if (pageSettingsCache && now - pageSettingsCache.timestamp < PAGE_SETTINGS_CACHE_TTL) {
    return pageSettingsCache.data;
  }

  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/admin/page-settings`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) throw new Error('Failed to fetch page settings');
    const pages = await response.json();
    pageSettingsCache = { data: pages || [], timestamp: now };
    return pages || [];
  } catch (error) {
    logger.warn('Middleware page settings fetch error', 'MIDDLEWARE');
    return pageSettingsCache?.data || [];
  }
}

function detectSuspiciousActivity(request: NextRequest): boolean {
  const url = request.url.toLowerCase();
  const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';

  const patterns = [
    /\.\./,
    /\/etc\/passwd/,
    /\/proc\//,
    /<script/i,
    /javascript:/i,
    /data:.*base64/i,
    /union.*select/i,
    /drop.*table/i,
    /exec\(/i,
    /eval\(/i,
  ];
  for (const p of patterns) if (p.test(url)) return true;

  const suspiciousAgents = [
    'sqlmap', 'nikto', 'nmap', 'masscan', 'nessus', 'openvas', 'burpsuite', 'w3af', 'havij', 'pangolin', 'crawler', 'bot'
  ];
  return suspiciousAgents.some(a => userAgent.includes(a));
}

function getRateLimitType(pathname: string): keyof typeof RATE_LIMITS {
  if (pathname.includes('/login') || pathname.includes('/signin')) return 'LOGIN';
  if (pathname.includes('/register') || pathname.includes('/signup')) return 'REGISTER';
  if (pathname.includes('/reset-password') || pathname.includes('/forgot-password')) return 'PASSWORD_RESET';
  if (pathname.includes('/contact')) return 'CONTACT';
  if (pathname.includes('/upload')) return 'UPLOAD';
  if (pathname.startsWith('/api/auth')) return 'AUTH';
  if (pathname.startsWith('/api/admin')) return 'API_STRICT';
  if (pathname.startsWith('/api/')) return 'API_MODERATE';
  return 'GENERAL';
}

async function checkPageAccess(path: string): Promise<boolean> {
  try {
    if (path.startsWith('/admin') || path.startsWith('/api')) return true;
    if (path.includes('.') || path.startsWith('/_next')) return true;
    
    // Allow all portfolio routes (list and detail pages)
    if (path.startsWith('/portfolio')) return true;
    
    // Allow dynamic routes (portfolio detail pages, etc.)
    if (path.includes('[') || path.includes(']')) return true;
    
    // Extract pageId by removing language prefix if present
    let pageId = path === '/' ? 'home' : path.slice(1);
    
    // Handle localized routes (e.g., /tr/haberler -> haberler)
    const pathParts = path.split('/');
    if (pathParts.length >= 3 && ['tr', 'es'].includes(pathParts[1])) {
      // For localized routes, try the path without language prefix
      const localizedPageId = pathParts.slice(2).join('/');
      
      // First check with full path
      const pageSettings = await getPageSettings();
      let pageSetting = pageSettings.find((page: { pageId: string; path: string; isActive?: boolean }) =>
        page.path === path
      );
      
      // If not found, check with localized pageId
      if (!pageSetting) {
        pageSetting = pageSettings.find((page: { pageId: string; path: string; isActive?: boolean }) =>
          page.pageId === localizedPageId
        );
      }
      
      // If still not found, check with original pageId
      if (!pageSetting) {
        pageSetting = pageSettings.find((page: { pageId: string; path: string; isActive?: boolean }) =>
          page.pageId === pageId
        );
      }
      
      if (!pageSetting) return true;
      return pageSetting.isActive === true;
    } else {
      // For non-localized routes
      const pageSettings = await getPageSettings();
      const pageSetting = pageSettings.find((page: { pageId: string; path: string; isActive?: boolean }) =>
        page.pageId === pageId || page.path === path
      );
      if (!pageSetting) return true;
      return pageSetting.isActive === true;
    }
  } catch {
    return true;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const clientIP = getClientIP(request);

  // Skip static and special files
  if (
    pathname.startsWith('/_next') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/robots') ||
    pathname.startsWith('/sitemap')
  ) {
    return NextResponse.next();
  }

  // 1) Block suspicious activity
  if (detectSuspiciousActivity(request)) {
    logger.error('Blocking suspicious request', 'SECURITY', { ip: clientIP, pathname, userAgent: request.headers.get('user-agent') });
    return new NextResponse('Forbidden', { status: 403 });
  }

  // 2) Rate limiting (strict only for auth endpoints; bypass for portfolio/contact and dev)
  const rateLimitType = getRateLimitType(pathname);
  const isAuthEndpoint = ['LOGIN', 'REGISTER', 'PASSWORD_RESET', 'AUTH'].includes(rateLimitType);
  const isPortfolioAPI = pathname.includes('/api/portfolio');
  const isContactAPI = pathname.includes('/api/contact');
  const shouldBypassRateLimit = isPortfolioAPI || isContactAPI || process.env.NODE_ENV === 'development';

  let rateLimitResult = { allowed: true, remaining: 1000, resetTime: Date.now() + 60000 };
  if (!shouldBypassRateLimit && isAuthEndpoint) {
    rateLimitResult = rateLimit(clientIP, rateLimitType);
    if (!rateLimitResult.allowed) {
      const resp = new NextResponse('Too Many Requests', { status: 429 });
      resp.headers.set('Retry-After', Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString());
      resp.headers.set('X-RateLimit-Limit', RATE_LIMITS[rateLimitType].limit.toString());
      resp.headers.set('X-RateLimit-Remaining', '0');
      resp.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString());
      return SecurityHeaders.apply(resp);
    }
  }

  // 3) CSRF protection is handled by NextAuth for auth routes and should be implemented in API handlers where needed.

  // 4) Page accessibility control for non-API/non-admin routes
  if (!pathname.startsWith('/api') && !pathname.startsWith('/admin')) {
    const isAccessible = await checkPageAccess(pathname);
    if (!isAccessible) {
      return new NextResponse(null, { status: 404 });
    }
  }

  // 5) Build secure response
  const response = NextResponse.next();

  // Rate-limit headers
  response.headers.set('X-RateLimit-Limit', RATE_LIMITS[rateLimitType].limit.toString());
  response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
  response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString());

  // Security headers with per-page CSP
  const pageType = getPageType(pathname);
  const secureResponse = SecurityHeaders.apply(response, { contentSecurityPolicy: SecurityHeaders.getCSPForPage(pageType) });

  // Robots and request id
  secureResponse.headers.set('X-Robots-Tag', 'index, follow');
  const requestId = Math.random().toString(36).substring(2, 15);
  secureResponse.headers.set('X-Request-ID', requestId);
  
  // Vercel deployment info
  if (process.env.VERCEL) {
    secureResponse.headers.set('x-deployment-platform', 'vercel');
    secureResponse.headers.set('x-vercel-region', process.env.VERCEL_REGION || 'fra1');
  }
  
  // Admin route cache and robots
  if (pathname.startsWith('/admin')) {
    secureResponse.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    secureResponse.headers.set('Pragma', 'no-cache');
    secureResponse.headers.set('Expires', '0');
    secureResponse.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }

  // API route headers
  if (pathname.startsWith('/api')) {
    secureResponse.headers.set('X-Robots-Tag', 'noindex, nofollow');
    secureResponse.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  }

  // Static caching for public assets
  if (pathname.startsWith('/_next/static/') || pathname.startsWith('/images/')) {
    secureResponse.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }

  return secureResponse;
}

export const config = {
  matcher: [
    // Match all except listed paths
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};