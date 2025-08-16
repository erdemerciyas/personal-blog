export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { withSecurity, SecurityConfigs } from '../../../../lib/security-middleware';
import crypto from 'crypto';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

// Cloudinary yapılandırması
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase()
    .slice(0, 100);
}

export const POST = withSecurity(SecurityConfigs.admin)(async (request: NextRequest) => {
  try {
    const formData = await request.formData();
    const file = formData.get('logo') as File;

    if (!file) {
      return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 });
    }

    // Dosya türü ve boyutu doğrulama
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Geçersiz dosya türü' }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Dosya boyutu 5MB\'dan büyük olamaz' }, { status: 400 });
    }

    // Buffer'a çevir
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Güvenli dosya adı + hash
    const sanitized = sanitizeFileName(file.name || 'site-logo');
    const fileHash = crypto.createHash('md5').update(buffer).digest('hex').substring(0, 8);
    const publicId = `logo-${Date.now()}_${fileHash}_${sanitized}`;

    // Cloudinary'e yükle
    const folder = 'personal-blog/site/logo';
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: 'image',
            folder,
            public_id: publicId,
            overwrite: false,
            unique_filename: false,
            tags: ['logo', 'personal-blog'],
            transformation: [{ quality: 'auto:good' }, { fetch_format: 'auto' }],
            strip_metadata: true,
            width: 1024,
            height: 1024,
            crop: 'limit',
          },
          (error, uploadResult) => {
            if (error || !uploadResult) return reject(error || new Error('Upload failed'));
            resolve(uploadResult);
          }
        )
        .end(buffer);
    });

    return NextResponse.json({
      message: 'Logo başarıyla yüklendi',
      logoUrl: result.secure_url,
      fileName: result.public_id,
      fileSize: result.bytes,
      fileType: result.resource_type,
      publicId: result.public_id,
      uploadedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Logo upload error:', error);
    return NextResponse.json({ error: 'Logo yüklenirken hata oluştu' }, { status: 500 });
  }
});