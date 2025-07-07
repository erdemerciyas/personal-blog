import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '../../../../lib/mongoose';
import { authOptions } from '../../../../lib/auth';
import { ObjectId } from 'mongodb';


// GET /api/services/[id] - Belirli bir servisi getir
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { db } = await connectToDatabase();
    
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Geçersiz servis ID' },
        { status: 400 }
      );
    }

    const service = await db
      .collection('services')
      .findOne({ _id: new ObjectId(params.id) });
    
    if (!service) {
      return NextResponse.json(
        { error: 'Servis bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error('Servis getirilirken hata:', error);
    return NextResponse.json(
      { error: 'Servis getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// PUT /api/services/[id] - Belirli bir servisi güncelle
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 401 }
      );
    }

    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Geçersiz servis ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { db } = await connectToDatabase();

    const imageUrl = body.image || '';

    const updateData = {
      ...body,
      image: imageUrl,
      updatedAt: new Date()
    };

    const result = await db
      .collection('services')
      .findOneAndUpdate(
        { _id: new ObjectId(params.id) },
        { $set: updateData },
        { returnDocument: 'after' }
      );

    if (!result) {
      return NextResponse.json(
        { error: 'Servis bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Servis güncellenirken hata:', error);
    return NextResponse.json(
      { error: 'Servis güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// DELETE /api/services/[id] - Belirli bir servisi sil
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 401 }
      );
    }

    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Geçersiz servis ID' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    
    const result = await db
      .collection('services')
      .findOneAndDelete({ _id: new ObjectId(params.id) });

    if (!result) {
      return NextResponse.json(
        { error: 'Servis bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Servis başarıyla silindi' });
  } catch (error) {
    console.error('Servis silinirken hata:', error);
    return NextResponse.json(
      { error: 'Servis silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 