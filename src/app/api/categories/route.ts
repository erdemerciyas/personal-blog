import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '../../../lib/mongoose';
import { authOptions } from '../../../lib/auth';

// GET - Tüm kategorileri getir
export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    const categories = await db
      .collection('categories')
      .find({})
      .sort({ name: 1 })
      .toArray();

    return NextResponse.json(categories, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Kategori getirme hatası:', error);
    return NextResponse.json(
      { error: 'Kategoriler getirilemedi' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}

// POST - Yeni kategori ekle
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
    if (!data.name || !data.slug) {
      return NextResponse.json(
        { error: 'İsim ve slug alanları zorunludur' },
        { status: 400 }
      );
    }

    // Slug'ın benzersiz olduğunu kontrol et
    const existingCategory = await db
      .collection('categories')
      .findOne({ slug: data.slug });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Bu slug zaten kullanılıyor' },
        { status: 400 }
      );
    }

    const result = await db.collection('categories').insertOne({
      ...data,
      createdAt: new Date(),
    });

    return NextResponse.json(
      { message: 'Kategori başarıyla eklendi', id: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Kategori ekleme hatası:', error);
    return NextResponse.json(
      { error: 'Kategori eklenemedi' },
      { status: 500 }
    );
  }
}