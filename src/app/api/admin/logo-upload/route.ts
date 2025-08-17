export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { withSecurity, SecurityConfigs } from '../../../../lib/security-middleware';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const POST = withSecurity(SecurityConfigs.admin)(async (request: NextRequest) => {
  try {
    const formData = await request.formData();
    const file = formData.get('logo') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'Dosya bulunamadı' },
        { status: 400 }
      );
    }

    // Dosya türü kontrolü
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Geçersiz dosya türü' },
        { status: 400 }
      );
    }

    // Dosya boyutu kontrolü (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Dosya boyutu 5MB\'dan büyük olamaz' },
        { status: 400 }
      );
    }

    // Cloudinary'e yükle (base64 veya buffer stream)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'extremeecu/logo',
          resource_type: 'image',
          overwrite: true,
          // optimize
          transformation: [
            { quality: 'auto:good' },
            { fetch_format: 'auto' },
            { width: 800, height: 300, crop: 'limit' }
          ],
          tags: ['logo', 'extremeecu']
        },
        (error, result) => {
          if (error || !result) return reject(error || new Error('Upload failed'));
          resolve(result);
        }
      );
      stream.end(buffer);
    });

    const logoUrl = uploadResult.secure_url;
    const publicId = uploadResult.public_id;

    return NextResponse.json({
      message: 'Logo başarıyla yüklendi',
      logoUrl,
      publicId,
      width: uploadResult.width,
      height: uploadResult.height,
      fileType: uploadResult.format
    });
    
  } catch (error) {
    console.error('Logo upload error:', error);
    return NextResponse.json(
      { error: 'Logo yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}); 