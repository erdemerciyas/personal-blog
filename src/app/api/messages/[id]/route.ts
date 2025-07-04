import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import connectDB from '../../../../lib/mongoose';
import Message from '../../../../models/Message';
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

interface MessageUpdateRequest {
  isRead?: boolean;
  status?: string;
}

// PUT /api/messages/[id] - Mesaj durumunu güncelle
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const body: MessageUpdateRequest = await request.json();
    
    const message = await Message.findByIdAndUpdate(
      params.id,
      body,
      { new: true }
    );
    
    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }
    
    return NextResponse.json(message);
    
  } catch (error) {
    console.error('Message update error:', error);
    return NextResponse.json({ 
      error: 'Failed to update message' 
    }, { status: 500 });
  }
}

// PATCH /api/messages/[id] - Mesaj durumunu güncelle
export async function PATCH(
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
    
    const body = await request.json();
    const { status } = body;
    
    const updateData: any = { status };
    
    // Status'a göre otomatik isRead ve timestamp güncellemeleri
    if (status === 'replied') {
      updateData.isRead = true;
      updateData.repliedAt = new Date();
    } else if (status === 'read') {
      updateData.isRead = true;
      updateData.readAt = new Date();
    }
    
    const message = await Message.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!message) {
      return NextResponse.json(
        { error: 'Mesaj bulunamadı' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(message);
  } catch (error) {
    console.error('Mesaj durumu güncellenirken hata:', error);
    return NextResponse.json(
      { error: 'Mesaj durumu güncellenirken bir hata oluştu' },
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