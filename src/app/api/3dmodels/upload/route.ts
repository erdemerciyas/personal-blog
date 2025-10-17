import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { upload3DModel } from '@/lib/cloudinary';
import { createError, handleApiError } from '@/lib/errorHandler';

export async function POST(request: NextRequest) {
  try {
    // Admin kontrolü
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      throw createError.forbidden('Admin yetkisi gerekli');
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      throw createError.validation('Dosya bulunamadı');
    }

    // Dosya formatı kontrolü
    const allowedFormats = ['stl', 'obj', 'gltf', 'glb'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!fileExtension || !allowedFormats.includes(fileExtension)) {
      throw createError.validation('Desteklenmeyen dosya formatı. Sadece STL, OBJ, GLTF, GLB dosyaları kabul edilir.');
    }

    // Dosya boyutu kontrolü (50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      throw createError.validation('Dosya boyutu 50MB\'dan büyük olamaz');
    }

    // Dosyayı buffer'a çevir
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Base64'e çevir
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;
    
    // Cloudinary'ye yükle
    const result = await upload3DModel(base64, file.name);

    return NextResponse.json({
      success: true,
      data: {
        url: result.url,
        publicId: result.publicId,
        name: file.name,
        format: fileExtension,
        size: result.size,
      }
    });

  } catch (error) {
    return handleApiError(error as Error, request);
  }
}