import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { v2 as cloudinary } from 'cloudinary';

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Pexels API - Ücretsiz, hızlı onay, kaliteli fotoğraflar
// https://www.pexels.com/api/ - 200 istek/saat limit
const PEXELS_API_KEY = process.env.PEXELS_API_KEY || 'demo';
const PEXELS_BASE_URL = 'https://api.pexels.com/v1';

export async function POST(request: NextRequest) {
  try {
    // Auth kontrolü
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { prompt, title } = body;

    if (!prompt && !title) {
      return NextResponse.json(
        { error: 'Prompt veya başlık gerekli' },
        { status: 400 }
      );
    }

    // Arama terimi oluştur
    let searchQuery;
    if (prompt) {
      searchQuery = prompt.slice(0, 100).trim();
    } else {
      // Başlıktan anahtar kelimeleri çıkar
      searchQuery = title.toLowerCase()
        .replace(/[^\w\s]/g, '') // Özel karakterleri kaldır
        .split(' ')
        .filter(word => word.length > 2) // 2 karakterden uzun kelimeleri al
        .slice(0, 3) // İlk 3 kelimeyi al
        .join(' ') || 'technology abstract modern';
    }

    console.log('🔍 Searching Pexels with query:', searchQuery);

    // Pexels API'den görsel ara
    const pexelsResponse = await fetch(
      `${PEXELS_BASE_URL}/search?query=${encodeURIComponent(searchQuery)}&per_page=1&orientation=landscape`,
      {
        headers: {
          'Authorization': PEXELS_API_KEY,
        },
      }
    );

    if (!pexelsResponse.ok) {
      throw new Error(`Pexels API error: ${pexelsResponse.status}`);
    }

    const pexelsData = await pexelsResponse.json();
    
    if (!pexelsData.photos || pexelsData.photos.length === 0) {
      return NextResponse.json(
        { error: 'Bu arama için uygun görsel bulunamadı. Farklı kelimeler deneyin.' },
        { status: 404 }
      );
    }

    const photo = pexelsData.photos[0];
    const imageUrl = photo.src.large; // 1280x853 boyutunda
    
    console.log('📸 Found image:', imageUrl);
    console.log('👨‍💻 Photographer:', photo.photographer);

    // Görseli Cloudinary'ye yükle
    console.log('⬆️ Uploading to Cloudinary...');
    
    const uploadResponse = await cloudinary.uploader.upload(imageUrl, {
      folder: 'personal-blog/generated',
      resource_type: 'image',
      quality: 'auto:good',
      format: 'webp', // Optimize for web
    });

    console.log('✅ Upload successful:', uploadResponse.secure_url);

    return NextResponse.json({
      success: true,
      imageUrl: uploadResponse.secure_url,
      photographer: photo.photographer,
      source: 'Pexels',
      searchQuery: searchQuery
    });

  } catch (error) {
    console.error('Generate image error:', error);
    
    // Pexels API hatalarını handle et
    if (error instanceof Error) {
      if (error.message.includes('403') || error.message.includes('429')) {
        return NextResponse.json(
          { error: 'Pexels API rate limit aşıldı. Lütfen birkaç dakika bekleyin.' },
          { status: 429 }
        );
      }
      if (error.message.includes('401')) {
        return NextResponse.json(
          { error: 'Pexels API key geçersiz.' },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Görsel bulunurken hata oluştu' },
      { status: 500 }
    );
  }
} 