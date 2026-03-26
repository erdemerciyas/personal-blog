import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { rateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit';
import { SecurityHeaders, getPageType } from '@/lib/security-headers';
import { logger } from '@/core/lib/logger';

const locales = ['tr', 'es'];
const defaultLocale = 'tr';

const LOCALIZED_ROUTE_MAP: Record<string, Record<string, string>> = {
  tr: { noticias: 'haberler' },
  es: { haberler: 'noticias' },
};

let pageSettingsCache: { data: PageSetting[]; timestamp: number } | null = null;
const PAGE_SETTINGS_CACHE_TTL = 60 * 1000;

interface PageSetting {
  pageId: string;
  path: string;
  isActive?: boolean;
}

export function clearPageSettingsCache() {
  pageSettingsCache = null;
}

async function getPageSettings(): Promise<PageSetting[]> {
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
  } catch {
    logger.warn('Middleware page settings fetch error', 'MIDDLEWARE');
    return pageSettingsCache?.data || [];
  }
}

function getLocale(request: NextRequest): string {
  const pathname = request.nextUrl.pathname;
  const segments = pathname.split('/');
  if (segments.length >= 2 && locales.includes(segments[1])) {
    return segments[1];
  }

  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const preferred = acceptLanguage.split(',')[0].split('-')[0];
    if (locales.includes(preferred)) return preferred;
  }

  return defaultLocale;
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
    'sqlmap', 'nikto', 'nmap', 'masscan', 'nessus', 'openvas', 'burpsuite', 'w3af', 'havij', 'pangolin'
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
    if (path.startsWith('/portfolio') || path.match(/^\/[a-z]{2}\/portfolio/)) return true;

    let pageId = path === '/' ? 'home' : path.slice(1);

    const pathParts = path.split('/');
    if (pathParts.length >= 3 && locales.includes(pathParts[1])) {
      const localizedPageId = pathParts.slice(2).join('/');
      const pageSettings = await getPageSettings();

      let pageSetting = pageSettings.find((page) => page.path === path);
      if (!pageSetting) {
        pageSetting = pageSettings.find((page) => page.pageId === localizedPageId);
      }
      if (!pageSetting) {
        pageSetting = pageSettings.find((page) => page.pageId === pageId);
      }

      if (!pageSetting) return true;
      return pageSetting.isActive === true;
    } else {
      const pageSettings = await getPageSettings();
      const pageSetting = pageSettings.find((page) => page.pageId === pageId || page.path === path);
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

  // Skip static and internal files
  if (
    pathname.startsWith('/_next') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/robots') ||
    pathname.startsWith('/sitemap')
  ) {
    return NextResponse.next();
  }

  // Block suspicious activity
  if (detectSuspiciousActivity(request)) {
    logger.error('Blocking suspicious request', 'SECURITY', { ip: clientIP, pathname });
    return new NextResponse('Forbidden', { status: 403 });
  }

  // --- Admin page routes: JWT auth ---
  if (pathname.startsWith('/admin') && pathname !== '/admin/login' && !pathname.startsWith('/admin/reset-password')) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    if (token.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // --- Admin API routes: JWT auth (page-settings GET is public for nav) ---
  if (pathname.startsWith('/api/admin')) {
    const isPublicAdminApi =
      (pathname === '/api/admin/page-settings' || pathname.startsWith('/api/admin/page-settings/')) &&
      request.method === 'GET';

    if (!isPublicAdminApi) {
      const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
      if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (token.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
  }

  // --- Rate limiting (strict for auth endpoints) ---
  const rateLimitType = getRateLimitType(pathname);
  const isAuthEndpoint = ['LOGIN', 'REGISTER', 'PASSWORD_RESET', 'AUTH'].includes(rateLimitType);
  let rateLimitResult = { allowed: true, remaining: 1000, resetTime: Date.now() + 60000 };

  if (isAuthEndpoint && process.env.NODE_ENV !== 'development') {
    rateLimitResult = rateLimit(clientIP, rateLimitType);
    if (!rateLimitResult.allowed) {
      const resp = new NextResponse('Too Many Requests', { status: 429 });
      resp.headers.set('Retry-After', Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString());
      return SecurityHeaders.apply(resp);
    }
  }

  // --- i18n: redirect locale-less public pages to default locale ---
  if (!pathname.startsWith('/api') && !pathname.startsWith('/admin')) {
    const pathnameIsMissingLocale = locales.every(
      (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
    );

    if (pathnameIsMissingLocale) {
      const locale = getLocale(request);
      const newUrl = new URL(`/${locale}${pathname === '/' ? '' : pathname}`, request.url);
      newUrl.search = request.nextUrl.search;
      return NextResponse.redirect(newUrl);
    }

    // Redirect mismatched locale-route combos (e.g. /es/haberler -> /es/noticias)
    const segments = pathname.split('/');
    if (segments.length >= 3 && locales.includes(segments[1])) {
      const lang = segments[1];
      const routeSegment = segments[2];
      const mapping = LOCALIZED_ROUTE_MAP[lang];
      if (mapping && mapping[routeSegment]) {
        segments[2] = mapping[routeSegment];
        const newUrl = new URL(segments.join('/'), request.url);
        newUrl.search = request.nextUrl.search;
        return NextResponse.redirect(newUrl, 301);
      }
    }

    // Page access control
    const isAccessible = await checkPageAccess(pathname);
    if (!isAccessible) {
      return new NextResponse(null, { status: 404 });
    }
  }

  // --- Build response with security headers ---
  const response = NextResponse.next();

  // Set locale header for root layout to use in <html lang>
  const segments = pathname.split('/');
  const detectedLocale = segments.length >= 2 && locales.includes(segments[1]) ? segments[1] : defaultLocale;
  response.headers.set('x-locale', detectedLocale);

  response.headers.set('X-RateLimit-Limit', RATE_LIMITS[rateLimitType].limit.toString());
  response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
  response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString());

  const pageType = getPageType(pathname);
  const secureResponse = SecurityHeaders.apply(response, {
    contentSecurityPolicy: SecurityHeaders.getCSPForPage(pageType),
  });

  if (pathname.startsWith('/admin')) {
    secureResponse.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    secureResponse.headers.set('Pragma', 'no-cache');
    secureResponse.headers.set('Expires', '0');
    secureResponse.headers.set('X-Robots-Tag', 'noindex, nofollow');
  } else if (pathname.startsWith('/api')) {
    secureResponse.headers.set('X-Robots-Tag', 'noindex, nofollow');
    secureResponse.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  } else {
    secureResponse.headers.set('X-Robots-Tag', 'index, follow');
  }

  if (process.env.VERCEL) {
    secureResponse.headers.set('x-deployment-platform', 'vercel');
    secureResponse.headers.set('x-vercel-region', process.env.VERCEL_REGION || 'fra1');
  }

  return secureResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|images|favicon.ico|manifest.json|icons|screenshots).*)',
  ],
};
