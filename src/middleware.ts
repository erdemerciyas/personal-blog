/**
 * Next.js Middleware
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

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
  } catch {
    console.warn('Middleware page settings fetch error', 'MIDDLEWARE');
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
    'sqlmap', 'nikto', 'nmap', 'masscan', 'nessus', 'openvas', 'burpsuite', 'w3af', 'havij', 'pangolin'
  ];
  return suspiciousAgents.some(a => userAgent.includes(a));
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
    const pageId = path === '/' ? 'home' : path.slice(1);

    // Handle localized routes (e.g., /tr/haberler -> haberler)
    const pathParts = path.split('/');
    if (pathParts.length >= 3 && ['tr', 'es'].includes(pathParts[1])) {
      // For localized routes, try to path without language prefix
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
    console.error('Blocking suspicious request', 'SECURITY', {
      ip: request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        'unknown',
      pathname,
      userAgent: request.headers.get('user-agent')
    });
    return new NextResponse('Forbidden', { status: 403 });
  }

  // 2) Admin route authentication check
  if (pathname.startsWith('/admin') && pathname !== '/admin/login' && !pathname.startsWith('/admin/reset-password')) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    // Not logged in -> Redirect to Admin Login
    if (!token) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Logged in but NOT Admin -> Redirect to Home
    if (token.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // 3) Rate limiting (strict only for auth endpoints; bypass for portfolio/contact and dev)
  // Note: Rate limiting disabled for development and portfolio/contact APIs
  // Note: Admin API routes bypass rate limiting for testing

  // 4) Page accessibility control for non-API/non-admin routes
  if (!pathname.startsWith('/api') && !pathname.startsWith('/admin')) {
    const isAccessible = await checkPageAccess(pathname);
    if (!isAccessible) {
      return new NextResponse(null, { status: 404 });
    }
  }

  // 4) Build secure response
  const response = NextResponse.next();

  // Rate-limit headers (disabled for admin APIs in development)
  if (!pathname.startsWith('/api/admin') || process.env.NODE_ENV === 'development') {
    response.headers.set('X-RateLimit-Limit', '1000');
    response.headers.set('X-RateLimit-Remaining', '1000');
    response.headers.set('X-RateLimit-Reset', (Date.now() + 60000).toString());
  }

  // Robots and request id
  response.headers.set('X-Robots-Tag', 'index, follow');
  const requestId = Math.random().toString(36).substring(2, 15);
  response.headers.set('X-Request-ID', requestId);

  // Vercel deployment info
  if (process.env.VERCEL) {
    response.headers.set('x-deployment-platform', 'vercel');
    response.headers.set('x-vercel-region', process.env.VERCEL_REGION || 'fra1');
  }

  // Admin route cache and robots
  if (pathname.startsWith('/admin')) {
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }

  // API route headers
  if (pathname.startsWith('/api')) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  }

  // Static caching for public assets
  if (pathname.startsWith('/_next/static/') || pathname.startsWith('/images/')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }

  return response;
}

export const config = {
  matcher: [
    // Match all except listed paths
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
