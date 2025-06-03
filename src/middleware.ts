import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Sayfa erişilebilirlik kontrolü
async function checkPageAccess(path: string): Promise<boolean> {
  try {
    // Admin sayfalarını kontrol etmeyin
    if (path.startsWith('/admin') || path.startsWith('/api')) {
      return true;
    }

    // Ana sayfa için özel kontrol
    const pageId = path === '/' ? 'home' : path.slice(1);
    
    // Page settings API'sini kontrol et
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/admin/page-settings`);
    
    if (!response.ok) {
      // API başarısızsa, varsayılan olarak erişime izin ver
      return true;
    }
    
    const pageSettings = await response.json();
    const pageSetting = pageSettings.find((page: any) => 
      page.pageId === pageId || page.path === path
    );
    
    // Sayfa ayarı bulunamazsa veya aktifse erişime izin ver
    return !pageSetting || pageSetting.isActive;
  } catch (error) {
    console.error('Page access check error:', error);
    // Hata durumunda varsayılan olarak erişime izin ver
    return true;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Static files, API routes, and admin pages are always accessible
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') ||
    pathname.includes('.') // Static files (images, css, js, etc.)
  ) {
    return NextResponse.next();
  }

  // Check if the page is accessible
  const isAccessible = await checkPageAccess(pathname);
  
  if (!isAccessible) {
    // Redirect to 404 page or return 404 response
    return new NextResponse(null, { status: 404 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 