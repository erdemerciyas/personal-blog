import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 401 });
    }

    // Clear middleware cache by importing and calling the clear function
    try {
      const { clearPageSettingsCache } = await import('../../../../middleware');
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
}