export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { withSecurity, SecurityConfigs } from '../../../../lib/security-middleware';

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

    // Dosya adı oluştur
    const timestamp = Date.now();
    const extension = path.extname(file.name);
    const fileName = `logo-${timestamp}${extension}`;
    
    // Upload klasörü oluştur
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'logos');
    await mkdir(uploadDir, { recursive: true });
    
    // Dosyayı kaydet
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);
    
    // URL oluştur
    const logoUrl = `/uploads/logos/${fileName}`;
    
    return NextResponse.json({
      message: 'Logo başarıyla yüklendi',
      logoUrl,
      fileName,
      fileSize: file.size,
      fileType: file.type
    });
    
  } catch (error) {
    console.error('Logo upload error:', error);
    return NextResponse.json(
      { error: 'Logo yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}); 