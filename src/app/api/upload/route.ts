export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

/**
 * Upload API - Redirect to admin upload
 * This endpoint exists for backward compatibility
 */
export async function POST(request: NextRequest) {
  try {
    // Forward the request to admin upload endpoint
    const formData = await request.formData();
    
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/admin/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        // Forward important headers
        'cookie': request.headers.get('cookie') || '',
        'user-agent': request.headers.get('user-agent') || '',
        'x-forwarded-for': request.headers.get('x-forwarded-for') || '',
      },
    });

    const data = await response.json();
    
    return NextResponse.json(data, { 
      status: response.status,
      headers: response.headers
    });
  } catch (error) {
    console.error('Upload proxy error:', error);
    return NextResponse.json(
      { error: 'Upload işlemi başarısız oldu' },
      { status: 500 }
    );
  }
}