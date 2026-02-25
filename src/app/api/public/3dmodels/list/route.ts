import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { list3DModels } from '@/lib/cloudinary';
import { createError, handleApiError } from '@/lib/errorHandler';

export async function GET(request: NextRequest) {
  try {
    // Admin kontrolü
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      throw createError.forbidden('Admin yetkisi gerekli');
    }

    // Cloudinary'den model listesini al
    const models = await list3DModels();

    const formattedModels = models.map(model => ({
      publicId: model.public_id,
      url: model.secure_url,
      name: model.display_name || model.public_id.split('/').pop(),
      format: model.format,
      size: model.bytes,
      uploadedAt: model.created_at,
    }));

    return NextResponse.json({
      success: true,
      data: formattedModels
    });

  } catch (error) {
    return handleApiError(error as Error, request);
  }
}