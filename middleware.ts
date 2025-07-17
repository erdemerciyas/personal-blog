import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Vercel için özel headers
  const response = NextResponse.next();
  
  // Vercel deployment bilgisi
  if (process.env.VERCEL) {
    response.headers.set('x-deployment-platform', 'vercel');
    response.headers.set('x-vercel-region', process.env.VERCEL_REGION || 'fra1');
  }
  
  // Admin routes için özel güvenlik
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Admin sayfaları için cache kontrolü
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }
  
  // API routes için rate limiting headers
  if (request.nextUrl.pathname.startsWith('/api')) {
    response.headers.set('X-RateLimit-Limit', '100');
    response.headers.set('X-RateLimit-Remaining', '99');
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