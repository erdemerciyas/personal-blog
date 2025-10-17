import { NextRequest, NextResponse } from 'next/server';
import { createError, handleApiError } from '@/lib/errorHandler';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    const filename = searchParams.get('filename');
    
    if (!url || !filename) {
      throw createError.validation('URL ve dosya adı gerekli');
    }

    // Cloudinary URL'sinden dosyayı fetch et
    const response = await fetch(url);
    
    if (!response.ok) {
      throw createError.notFound('Dosya bulunamadı');
    }

    const buffer = await response.arrayBuffer();

    // Dosyayı indirilebilir olarak döndür
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.byteLength.toString(),
      },
    });

  } catch (error) {
    return handleApiError(error as Error, request);
  }
}