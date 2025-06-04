import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Cache for page settings (5 minutes cache)
let pageSettingsCache: { data: any[], timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Get page settings with caching
async function getPageSettings(): Promise<any[]> {
  const now = Date.now();
  
  // Return cached data if still valid
  if (pageSettingsCache && (now - pageSettingsCache.timestamp) < CACHE_DURATION) {
    return pageSettingsCache.data;
  }

  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/admin/page-settings`, {
      next: { revalidate: 300 }, // 5 minutes cache
    });
    
    if (!response.ok) {
      return [];
    }
    
    const pageSettings = await response.json();
    
    // Update cache
    pageSettingsCache = {
      data: pageSettings,
      timestamp: now
    };
    
    return pageSettings;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Page access check error:', error);
    }
    return [];
  }
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
  
  // Performance: Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') ||
    pathname.includes('.') || // Static files (images, css, js, etc.)
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/robots') ||
    pathname.startsWith('/sitemap')
  ) {
    return NextResponse.next();
  }

  // Check if the page is accessible only for dynamic pages
  const isAccessible = await checkPageAccess(pathname);
  
  if (!isAccessible) {
    // Return 404 response for inaccessible pages
    return new NextResponse(null, { status: 404 });
  }

  // Add security headers for all pages
  const response = NextResponse.next();
  
  // Add performance headers
  response.headers.set('X-Robots-Tag', 'index, follow');
  
  return response;
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