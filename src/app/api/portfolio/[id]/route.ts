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

// GET - Tekil portfolyo öğesini getir
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { db } = await connectToDatabase();
    
    // ObjectId kontrolü
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Geçersiz ID formatı' },
        { status: 400 }
      );
    }

    const portfolio = await db
      .collection('portfolios')
      .aggregate([
        {
          $match: { _id: new ObjectId(params.id) }
        },
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
        }
      ])
      .next();

    if (!portfolio) {
      return NextResponse.json(
        { error: 'Portfolyo öğesi bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(portfolio);
  } catch (error) {
    console.error('Portfolyo detay getirme hatası:', error);
    return NextResponse.json(
      { error: 'Portfolyo detayı getirilemedi' },
      { status: 500 }
    );
  }
}

// PUT - Portfolyo öğesini güncelle
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const result = await db.collection('portfolios').updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          title: data.title,
          description: data.description,
          categoryId: new ObjectId(data.categoryId),
          client: data.client,
          completionDate: new Date(data.completionDate),
          technologies: data.technologies,
          coverImage: data.coverImage || DEFAULT_IMAGE,
          images: data.images && data.images.length > 0 && data.images[0] ? data.images : DEFAULT_DETAIL_IMAGES,
          featured: data.featured,
          order: data.order,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Portfolyo öğesi bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Portfolyo öğesi başarıyla güncellendi' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Portfolyo öğesi güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'Portfolyo öğesi güncellenemedi' },
      { status: 500 }
    );
  }
}

// DELETE - Portfolyo öğesini sil
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }

    const { db } = await connectToDatabase();

    const result = await db.collection('portfolios').deleteOne({
      _id: new ObjectId(params.id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Portfolyo öğesi bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Portfolyo öğesi başarıyla silindi' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Portfolyo öğesi silme hatası:', error);
    return NextResponse.json(
      { error: 'Portfolyo öğesi silinemedi' },
      { status: 500 }
    );
  }
} 