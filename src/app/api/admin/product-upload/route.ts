import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { getClientIP, rateLimit } from '@/lib/rate-limit';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED_IMAGES: Record<string, number[]> = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47],
  'image/webp': [0x52, 0x49, 0x46, 0x46],
};

const ALLOWED_DOCS: Record<string, number[]> = {
  'application/pdf': [0x25, 0x50, 0x44, 0x46],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [], // XLSX (zip)
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [], // DOCX
  'text/csv': [],
};

const MAX_SIZE = {
  image: 5 * 1024 * 1024,
  raw: 10 * 1024 * 1024,
};

function sanitize(name: string) {
  return name.replace(/[^a-zA-Z0-9.-]/g, '_').replace(/_{2,}/g, '_').toLowerCase().slice(0, 100);
}

function validateSignature(buf: Buffer, sig: number[]) {
  if (!sig.length) return true;
  for (let i = 0; i < sig.length; i++) if (buf[i] !== sig[i]) return false;
  return true;
}

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    return NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 403 });
  }

  const rl = rateLimit(ip, 'UPLOAD');
  if (!rl.allowed) return NextResponse.json({ error: 'Çok fazla yükleme denemesi' }, { status: 429 });

  const form = await request.formData();
  const file = form.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 });

  const arrayBuf = await file.arrayBuffer();
  const buf = Buffer.from(arrayBuf);
  const mime = file.type;

  const isImage = mime in ALLOWED_IMAGES;
  const isDoc = mime in ALLOWED_DOCS;
  if (!isImage && !isDoc) return NextResponse.json({ error: 'İzin verilmeyen dosya tipi' }, { status: 400 });

  if (isImage && buf.length > MAX_SIZE.image) return NextResponse.json({ error: 'Görsel dosya boyutu yüksek' }, { status: 400 });
  if (isDoc && buf.length > MAX_SIZE.raw) return NextResponse.json({ error: 'Döküman dosya boyutu yüksek' }, { status: 400 });

  const sig = (isImage ? ALLOWED_IMAGES[mime] : ALLOWED_DOCS[mime]) as number[];
  if (!validateSignature(buf, sig)) return NextResponse.json({ error: 'Dosya imza doğrulaması başarısız' }, { status: 400 });

  const publicId = `${sanitize(file.name)}-${Date.now()}`;
  // Force product media to dedicated folders
  const folder = isImage
    ? 'personal-blog/products/images'
    : 'personal-blog/products/docs';

  try {
    const upload = await new Promise<{ secure_url: string; public_id: string; bytes: number; format: string; resource_type: string }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: isImage ? 'image' : 'raw',
            folder,
            public_id: publicId,
            overwrite: false,
            unique_filename: false,
            transformation: isImage ? [{ quality: 'auto:good' }, { fetch_format: 'auto' }] : undefined,
            strip_metadata: isImage ? true : undefined,
          },
          (error, result: UploadApiResponse | undefined) => (error || !result ? reject(error || new Error('Upload failed')) : resolve(result))
        )
        .end(buf);
    });

    return NextResponse.json({
      success: true,
      url: upload.secure_url,
      publicId: upload.public_id,
      bytes: upload.bytes,
      format: upload.format,
      resourceType: upload.resource_type,
    });
  } catch (e) {
    logger.error('Product upload failed', 'UPLOAD', { ip, mime }, e as Error);
    return NextResponse.json({ error: 'Yükleme başarısız' }, { status: 500 });
  }
}


