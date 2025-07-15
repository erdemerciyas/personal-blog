import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import { v2 as cloudinary } from 'cloudinary';
import { rateLimit, getClientIP } from '../../../../lib/rate-limit';
import { Sanitizer } from '../../../../lib/validation';
import { logger } from '../../../../lib/logger';
import crypto from 'crypto';

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Allowed file types with their magic numbers for validation
const ALLOWED_FILE_TYPES = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/jpg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47],
  'image/gif': [0x47, 0x49, 0x46],
  'image/webp': [0x52, 0x49, 0x46, 0x46]
};

// Maximum file sizes by type (in bytes)
const MAX_FILE_SIZES = {
  'image/jpeg': 5 * 1024 * 1024, // 5MB
  'image/jpg': 5 * 1024 * 1024,  // 5MB
  'image/png': 5 * 1024 * 1024,  // 5MB
  'image/gif': 2 * 1024 * 1024,  // 2MB
  'image/webp': 3 * 1024 * 1024  // 3MB
};

function validateFileSignature(buffer: Buffer, mimeType: string): boolean {
  const signature = ALLOWED_FILE_TYPES[mimeType as keyof typeof ALLOWED_FILE_TYPES];
  if (!signature) return false;
  
  for (let i = 0; i < signature.length; i++) {
    if (buffer[i] !== signature[i]) {
      return false;
    }
  }
  return true;
}

function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase()
    .slice(0, 100); // Limit filename length
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const clientIP = getClientIP(request);
  
  try {
    // Rate limiting for file uploads
    const rateLimitResult = rateLimit(clientIP, 'UPLOAD');
    if (!rateLimitResult.allowed) {
      logger.warn('File upload rate limit exceeded', 'SECURITY', {
        ip: clientIP,
        remaining: rateLimitResult.remaining
      });
      
      return NextResponse.json(
        { error: 'Çok fazla dosya yükleme denemesi. Lütfen 1 saat sonra tekrar deneyin.' },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
          }
        }
      );
    }

    // Auth kontrolü
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      logger.warn('Unauthorized file upload attempt', 'SECURITY', { ip: clientIP });
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    // Admin role kontrolü
    if ((session.user as any).role !== 'admin') {
      logger.warn('Non-admin file upload attempt', 'SECURITY', {
        ip: clientIP,
        userId: (session.user as any).id,
        role: (session.user as any).role
      });
      return NextResponse.json(
        { error: 'Admin yetkisi gerekli' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const pageContext = Sanitizer.sanitizeText(formData.get('pageContext') as string || 'general');

    if (!file) {
      return NextResponse.json(
        { error: 'Dosya bulunamadı' },
        { status: 400 }
      );
    }

    // File type validation
    const validTypes = Object.keys(ALLOWED_FILE_TYPES);
    if (!validTypes.includes(file.type)) {
      logger.warn('Invalid file type upload attempt', 'SECURITY', {
        ip: clientIP,
        fileType: file.type,
        fileName: file.name
      });
      
      return NextResponse.json(
        { error: 'Geçersiz dosya türü. Sadece JPG, PNG, GIF ve WebP desteklenir.' },
        { status: 400 }
      );
    }

    // File size validation
    const maxSize = MAX_FILE_SIZES[file.type as keyof typeof MAX_FILE_SIZES];
    if (file.size > maxSize) {
      logger.warn('File size exceeded', 'SECURITY', {
        ip: clientIP,
        fileSize: file.size,
        maxSize: maxSize,
        fileName: file.name
      });
      
      return NextResponse.json(
        { error: `Dosya boyutu ${Math.round(maxSize / 1024 / 1024)}MB'dan küçük olmalıdır.` },
        { status: 400 }
      );
    }

    // Convert file to buffer for validation
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate file signature (magic numbers)
    if (!validateFileSignature(buffer, file.type)) {
      logger.error('File signature validation failed', 'SECURITY', {
        ip: clientIP,
        fileName: file.name,
        fileType: file.type,
        actualSignature: Array.from(buffer.slice(0, 8)).map(b => '0x' + b.toString(16).toUpperCase())
      });
      
      return NextResponse.json(
        { error: 'Dosya içeriği dosya türüyle eşleşmiyor. Güvenlik nedeniyle yükleme reddedildi.' },
        { status: 400 }
      );
    }

    // Sanitize filename
    const sanitizedFileName = sanitizeFileName(file.name);
    
    // Generate unique filename with hash
    const fileHash = crypto.createHash('md5').update(buffer).digest('hex').substring(0, 8);
    const uniqueFileName = `${Date.now()}_${fileHash}_${sanitizedFileName}`;

    // Validate page context
    const allowedContexts = ['general', 'portfolio', 'services', 'slider', 'about', 'logo'];
    if (!allowedContexts.includes(pageContext)) {
      return NextResponse.json(
        { error: 'Geçersiz sayfa bağlamı' },
        { status: 400 }
      );
    }

    // Cloudinary'e güvenli yükleme
    const folder = `personal-blog/${pageContext}`;
    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: folder,
          public_id: uniqueFileName,
          overwrite: false,
          unique_filename: false,
          tags: [pageContext, 'personal-blog', 'secure-upload'],
          // Security transformations
          transformation: [
            { quality: 'auto:good' },
            { fetch_format: 'auto' }
          ],
          // Remove EXIF data for privacy
          strip_metadata: true,
          // Limit dimensions for security
          width: 2048,
          height: 2048,
          crop: 'limit'
        },
        (error, result) => {
          if (error) {
            logger.error('Cloudinary upload failed', 'ERROR', {
              ip: clientIP,
              error: error.message,
              fileName: file.name
            });
            reject(error);
          } else {
            resolve(result);
          }
        }
      ).end(buffer);
    });

    // Log successful upload
    logger.info('File uploaded successfully', 'UPLOAD', {
      ip: clientIP,
      userId: (session.user as any).id,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      publicId: uploadResult.public_id,
      pageContext: pageContext,
      responseTime: Date.now() - startTime
    });

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      fileName: uploadResult.public_id,
      originalName: sanitizedFileName,
      size: file.size,
      type: file.type,
      publicId: uploadResult.public_id,
      pageContext: pageContext,
      uploadedAt: new Date().toISOString()
    });

  } catch (error) {
    logger.error('File upload error', 'ERROR', {
      ip: clientIP,
      error: error instanceof Error ? error.message : 'Unknown error',
      fileName: 'unknown',
      responseTime: Date.now() - startTime
    });
    
    return NextResponse.json(
      { error: 'Dosya yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
} 