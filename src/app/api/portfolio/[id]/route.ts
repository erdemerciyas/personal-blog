import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '../../../../lib/mongoose';
import { authOptions } from '../../../../lib/auth';
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
          $lookup: {
            from: 'categories',
            localField: 'categoryIds',
            foreignField: '_id',
            as: 'categories'
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
    if (!data.title || !data.description || !data.client || !data.completionDate) {
      return NextResponse.json(
        { error: 'Tüm zorunlu alanları doldurun' },
        { status: 400 }
      );
    }

    // Çoklu kategori desteği için validation
    if (data.categoryIds && Array.isArray(data.categoryIds) && data.categoryIds.length > 0) {
      // Kategorilerin geçerli olduğunu kontrol et
      const categories = await db
        .collection('categories')
        .find({ _id: { $in: data.categoryIds.map((id: string) => new ObjectId(id)) } })
        .toArray();
      
      if (categories.length !== data.categoryIds.length) {
        return NextResponse.json(
          { error: 'Geçersiz kategori ID\'si bulundu' },
          { status: 400 }
        );
      }
    } else if (data.categoryId) {
      // Eski tekli kategori desteği (geriye uyumluluk)
      const category = await db
        .collection('categories')
        .findOne({ _id: new ObjectId(data.categoryId) });

      if (!category) {
        return NextResponse.json(
          { error: 'Geçersiz kategori ID\'si' },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'En az bir kategori seçmelisiniz' },
        { status: 400 }
      );
    }

    // Update object'ini hazırla
    const updateData: any = {
      title: data.title,
      description: data.description,
      client: data.client,
      completionDate: new Date(data.completionDate),
      technologies: data.technologies,
      coverImage: data.coverImage || DEFAULT_IMAGE,
      images: data.images && data.images.length > 0 && data.images[0] ? data.images : DEFAULT_DETAIL_IMAGES,
      featured: data.featured,
      order: data.order,
      updatedAt: new Date(),
    };

    // Çoklu kategori desteği
    if (data.categoryIds && Array.isArray(data.categoryIds) && data.categoryIds.length > 0) {
      updateData.categoryIds = data.categoryIds.map((id: string) => new ObjectId(id));
      // Geriye uyumluluk için ilk kategoriyi categoryId olarak da kaydet
      updateData.categoryId = new ObjectId(data.categoryIds[0]);
    } else if (data.categoryId) {
      // Eski tekli kategori desteği
      updateData.categoryId = new ObjectId(data.categoryId);
      updateData.categoryIds = [new ObjectId(data.categoryId)];
    }

    const result = await db.collection('portfolios').updateOne(
      { _id: new ObjectId(params.id) },
      { $set: updateData }
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