import { NextResponse } from 'next/server';
import { withSecurity, SecurityConfigs } from '../../../../lib/security-middleware';

export const POST = withSecurity(SecurityConfigs.admin)(async () => {
  try {
    // Clear middleware cache by importing and calling the clear function
    try {
      const { clearPageSettingsCache } = await import('../../../../../middleware');
      clearPageSettingsCache();
    } catch (error) {
      console.log('Middleware cache clear not available:', error);
    }
    
    const response = NextResponse.json({ 
      message: 'Cache başarıyla temizlendi',
      timestamp: Date.now()
    });
    
    // Add cache control headers
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error('Cache clear error:', error);
    return NextResponse.json(
      { message: 'Cache temizlenirken hata oluştu' },
      { status: 500 }
    );
  }
});