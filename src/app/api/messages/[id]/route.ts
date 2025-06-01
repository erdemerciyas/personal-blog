import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import Message from '@/models/Message';
import { ObjectId } from 'mongodb';

// GET /api/messages/[id] - Tek mesaj getir
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Bu işlem için admin yetkisi gerekli' },
        { status: 403 }
      );
    }

    const { id } = params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Geçersiz mesaj ID' },
        { status: 400 }
      );
    }

    await connectDB();
    
    const message = await Message.findById(id);
    if (!message) {
      return NextResponse.json(
        { error: 'Mesaj bulunamadı' },
        { status: 404 }
      );
    }

    // Mesajı okundu olarak işaretle
    if (!message.isRead) {
      await Message.findByIdAndUpdate(id, {
        isRead: true,
        readAt: new Date(),
        status: message.status === 'new' ? 'read' : message.status
      });
    }
    
    return NextResponse.json(message);
  } catch (error) {
    console.error('Mesaj getirilirken hata:', error);
    return NextResponse.json(
      { error: 'Mesaj getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// PUT /api/messages/[id] - Mesaj durumunu güncelle
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Bu işlem için admin yetkisi gerekli' },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Geçersiz mesaj ID' },
        { status: 400 }
      );
    }

    await connectDB();
    
    const updateData: any = { ...body };
    
    // Durum değişikliklerine göre timestamp'leri güncelle
    if (body.status === 'replied' && body.status !== body.currentStatus) {
      updateData.repliedAt = new Date();
    }
    
    if (body.isRead && !body.wasRead) {
      updateData.readAt = new Date();
    }

    const message = await Message.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!message) {
      return NextResponse.json(
        { error: 'Mesaj bulunamadı' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: 'Mesaj başarıyla güncellendi',
      data: message
    });
  } catch (error) {
    console.error('Mesaj güncellenirken hata:', error);
    return NextResponse.json(
      { error: 'Mesaj güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// DELETE /api/messages/[id] - Mesajı sil
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Bu işlem için admin yetkisi gerekli' },
        { status: 403 }
      );
    }

    const { id } = params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Geçersiz mesaj ID' },
        { status: 400 }
      );
    }

    await connectDB();
    
    const message = await Message.findByIdAndDelete(id);
    if (!message) {
      return NextResponse.json(
        { error: 'Mesaj bulunamadı' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: 'Mesaj başarıyla silindi'
    });
  } catch (error) {
    console.error('Mesaj silinirken hata:', error);
    return NextResponse.json(
      { error: 'Mesaj silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 