import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/mongoose';
import { authOptions } from '@/lib/auth';
import { ObjectId } from 'mongodb';

const DEFAULT_IMAGE = 'https://picsum.photos/800/600?grayscale';
const DEFAULT_DETAIL_IMAGES = [
  'https://picsum.photos/800/600?random=1&grayscale',
  'https://picsum.photos/800/600?random=2&grayscale',
  'https://picsum.photos/800/600?random=3&grayscale'
];

// GET - Tüm portfolyo öğelerini getir
export async function GET(request: Request) {
  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category');
    
    // Baz sorgu pipeline'ı
    const pipeline: any[] = [];

    // Eğer kategori filtresi varsa, önce kategoriyi bul
    if (categorySlug) {
      const category = await db.collection('categories').findOne({ slug: categorySlug });
      if (category) {
        pipeline.push({
          $match: { categoryId: new ObjectId(category._id) }
        });
      }
    }

    // Kategori bilgilerini ekle ve sırala
    pipeline.push(
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $unwind: {
          path: '$category',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $sort: { order: 1, _id: -1 }
      }
    );

    const portfolios = await db
      .collection('portfolios')
      .aggregate(pipeline)
      .toArray();

    return NextResponse.json(portfolios, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Portfolyo listesi getirme hatası:', error);
    return NextResponse.json(
      { error: 'Portfolyo listesi getirilemedi' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}

// POST - Yeni portfolyo öğesi ekle
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }

    const { db } = await connectToDatabase();
    const data = await request.json();
    
    // Zorunlu alanları kontrol et
    if (!data.title || !data.description || !data.categoryId || !data.client || !data.completionDate) {
      return NextResponse.json(
        { error: 'Tüm zorunlu alanları doldurun' },
        { status: 400 }
      );
    }

    // Kategori ID'sinin geçerli olduğunu kontrol et
    const category = await db
      .collection('categories')
      .findOne({ _id: new ObjectId(data.categoryId) });

    if (!category) {
      return NextResponse.json(
        { error: 'Geçersiz kategori' },
        { status: 400 }
      );
    }

    const cleanedData = {
      ...data,
      coverImage: data.coverImage || DEFAULT_IMAGE,
      images: data.images && data.images.length > 0 && data.images[0] ? data.images : DEFAULT_DETAIL_IMAGES,
      categoryId: new ObjectId(data.categoryId),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('portfolios').insertOne(cleanedData);

    return NextResponse.json(
      { 
        message: 'Portfolyo öğesi başarıyla eklendi',
        id: result.insertedId 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Portfolyo öğesi ekleme hatası:', error);
    return NextResponse.json(
      { error: 'Portfolyo öğesi eklenemedi' },
      { status: 500 }
    );
  }
} 