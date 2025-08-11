import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Portfolio from '@/models/Portfolio';
import Category from '@/models/Category';

type LeanCategory = { _id: string; name: string; slug: string };
type PortfolioLean = {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  client?: string;
  completionDate?: string | Date;
  technologies?: string[];
  coverImage?: string;
  images?: string[];
  featured?: boolean;
  order?: number;
  createdAt?: Date;
  updatedAt?: Date;
  categoryId?: string | LeanCategory;
  categoryIds?: Array<string | LeanCategory>;
};

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    // Veritabanı bağlantısını timeout ile koru
    await Promise.race([
      connectDB(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database connection timeout')), 10000)
      )
    ]);

    const { slug } = params;

    if (!slug) {
      return NextResponse.json({ error: 'Slug gerekli' }, { status: 400 });
    }

    // Slug'ı decode et (URL encoding sorunları için)
    const decodedSlug = decodeURIComponent(slug);

    // Portfolio öğesini bul - populate işlemini try-catch ile koru
    let portfolioItem;
    try {
      portfolioItem = await Portfolio.findOne({ slug: decodedSlug })
        .populate('categoryIds')
        .populate('categoryId')
        .lean(); // Performance için lean() kullan
    } catch (populateError) {
      console.warn('Populate error, trying without populate:', populateError);
      // Populate başarısız olursa, populate olmadan dene
      portfolioItem = await Portfolio.findOne({ slug: decodedSlug }).lean();
    }

    if (!portfolioItem) {
      return NextResponse.json({ error: 'Portfolyo öğesi bulunamadı' }, { status: 404 });
    }

    // Kategori bilgisini güvenli şekilde normalize et
    // Lean sonuç için yerel tip ile güvenli erişim
    const p = portfolioItem as unknown as PortfolioLean;
    let category = null;
    try {
      if (p.categoryIds && p.categoryIds.length > 0) {
        // Eğer populate edilmişse
        if (typeof p.categoryIds[0] === 'object') {
          category = p.categoryIds[0];
        } else {
          // Populate edilmemişse, manuel olarak kategoriyi getir
          category = await Category.findById(p.categoryIds[0]).lean() as LeanCategory | null;
        }
      } else if (p.categoryId) {
        // Geriye uyumluluk için
        if (typeof p.categoryId === 'object') {
          category = p.categoryId;
        } else {
          category = await Category.findById(p.categoryId).lean() as LeanCategory | null;
        }
      }
    } catch (categoryError) {
      console.warn('Category fetch error:', categoryError);
      // Kategori hatası olursa null bırak
      category = null;
    }

    // Response'ı güvenli şekilde oluştur
    const response = {
      _id: p._id,
      title: p.title,
      slug: p.slug,
      description: p.description,
      client: p.client,
      completionDate: p.completionDate,
      technologies: p.technologies || [],
      coverImage: p.coverImage,
      images: p.images || [],
      featured: p.featured || false,
      order: p.order || 0,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      category: category,
      // Geriye uyumluluk için
      categoryId: p.categoryId,
      categoryIds: p.categoryIds
    };

    // Cache headers ekle
    const headers = new Headers();
    headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');

    return NextResponse.json(response, { headers });

  } catch (error) {
    console.error('Portfolio slug API error:', {
      slug: params.slug,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    // Hata türüne göre farklı status kodları
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        return NextResponse.json({
          error: 'Veritabanı bağlantı zaman aşımı'
        }, { status: 504 });
      }
      if (error.message.includes('connection')) {
        return NextResponse.json({
          error: 'Veritabanı bağlantı hatası'
        }, { status: 503 });
      }
    }

    return NextResponse.json({
      error: 'Dahili Sunucu Hatası',
      details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Unknown error' : undefined
    }, { status: 500 });
  }
}
