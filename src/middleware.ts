/**
 * Next.js Middleware with i18n support
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const locales = ['tr', 'es', 'en'];
const defaultLocale = 'tr';

function getLocale(request: NextRequest): string {
  // Check if there is any supported locale in the pathname
  const pathname = request.nextUrl.pathname;
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  if (!pathnameIsMissingLocale) {
    const segments = pathname.split('/');
    return segments[1]; // Return found locale
  }

  // Determine locale from accept-language header or user preference
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const preferredLocale = acceptLanguage.split(',')[0].split('-')[0];
    if (locales.includes(preferredLocale)) {
      return preferredLocale;
    }
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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files, Next.js internal files, api, admin, etc.
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
    return new NextResponse('Forbidden', { status: 403 });
  }

  // 2) API & Admin Bypass
  if (pathname.startsWith('/api') || pathname.startsWith('/admin')) {
    // Admin route authentication check
    if (pathname.startsWith('/admin') && pathname !== '/admin/login' && !pathname.startsWith('/admin/reset-password')) {
      const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
      if (!token) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
      if (token.role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }

    // Setup standard headers for API/Admin
    const response = NextResponse.next();
    if (!pathname.startsWith('/api/admin') || process.env.NODE_ENV === 'development') {
      response.headers.set('X-RateLimit-Limit', '1000');
      response.headers.set('X-RateLimit-Remaining', '1000');
      response.headers.set('X-RateLimit-Reset', (Date.now() + 60000).toString());
    }
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return response;
  }

  // 3) i18n Routing for Public Pages
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  if (pathnameIsMissingLocale) {
    const locale = getLocale(request);

    // We rewrite the URL to the default locale so the user doesn't see a redirect,
    // OR redirect if we want the language explicit in the URL.
    // Given the previous setup wasn't strict about language in URL, a redirect ensures 
    // consistent canonical URLs.
    const newUrl = new URL(`/${locale}${pathname === '/' ? '' : pathname}`, request.url);
    newUrl.search = request.nextUrl.search;
    return NextResponse.redirect(newUrl);
  }

  // Allow standard flow
  const response = NextResponse.next();
  response.headers.set('X-Robots-Tag', 'index, follow');
  if (process.env.VERCEL) {
    response.headers.set('x-deployment-platform', 'vercel');
    response.headers.set('x-vercel-region', process.env.VERCEL_REGION || 'fra1');
  }

  return response;
}

export const config = {
  matcher: [
    // Match all except static files
    '/((?!_next/static|_next/image|images|favicon.ico|manifest.json).*)',
  ],
};
