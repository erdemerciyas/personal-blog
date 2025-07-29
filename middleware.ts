import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SecurityHeaders, getPageType } from './src/lib/security-headers';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const pathname = request.nextUrl.pathname;
  
  // Apply security headers based on page type
  const pageType = getPageType(pathname);
  SecurityHeaders.apply(response, { 
    contentSecurityPolicy: SecurityHeaders.getCSPForPage(pageType) 
  });
  
  // Vercel deployment info
  if (process.env.VERCEL) {
    response.headers.set('x-deployment-platform', 'vercel');
    response.headers.set('x-vercel-region', process.env.VERCEL_REGION || 'fra1');
  }
  
  // Admin routes security
  if (pathname.startsWith('/admin')) {
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }
  
  // API routes security
  if (pathname.startsWith('/api')) {
    response.headers.set('X-RateLimit-Limit', '100');
    response.headers.set('X-RateLimit-Remaining', '99');
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  }
  
  // Static files caching
  if (pathname.startsWith('/_next/static/') || pathname.startsWith('/images/')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }
  
  // Security monitoring
  const userAgent = request.headers.get('user-agent') || '';
  const suspiciousPatterns = [
    'sqlmap', 'nikto', 'nmap', 'masscan', 'zap', 'burp',
    'wget', 'curl', 'python-requests', 'bot', 'crawler'
  ];
  
  const isSuspicious = suspiciousPatterns.some(pattern => 
    userAgent.toLowerCase().includes(pattern)
  );
  
  if (isSuspicious && !pathname.startsWith('/api/')) {
    console.warn(`Suspicious request detected: ${userAgent} -> ${pathname}`);
    response.headers.set('X-Security-Warning', 'Suspicious activity detected');
  }
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};