import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { delete3DModel } from '@/lib/cloudinary';
import { createError, handleApiError } from '@/lib/errorHandler';

export async function DELETE(request: NextRequest) {
  try {
    // Admin kontrolü
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      throw createError.forbidden('Admin yetkisi gerekli');
    }

    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get('publicId');
    
    if (!publicId) {
      throw createError.validation('Public ID gerekli');
    }

    // Cloudinary'den sil
    await delete3DModel(publicId);

    return NextResponse.json({
      success: true,
      message: '3D model başarıyla silindi'
    });

  } catch (error) {
    return handleApiError(error as Error, request);
  }
}