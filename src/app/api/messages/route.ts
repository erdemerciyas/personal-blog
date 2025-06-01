import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import Message from '@/models/Message';

// GET /api/messages - Mesajları getir (Admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Bu işlem için admin yetkisi gerekli' },
        { status: 403 }
      );
    }

    await connectDB();
    
    // Mesajları en yeniden eskiye doğru sırala
    const messages = await Message.find({})
      .sort({ createdAt: -1 })
      .lean();
    
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Mesajlar getirilirken hata:', error);
    return NextResponse.json(
      { error: 'Mesajlar getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// POST /api/messages - Yeni mesaj oluştur
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, company, subject, message, projectType, budget, urgency } = body;

    // Validasyon
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Ad, email, konu ve mesaj alanları zorunludur' },
        { status: 400 }
      );
    }

    // Email format kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Geçerli bir email adresi giriniz' },
        { status: 400 }
      );
    }

    await connectDB();

    // Yeni mesaj oluştur
    const newMessage = await Message.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim() || '',
      company: company?.trim() || '',
      subject: subject.trim(),
      message: message.trim(),
      projectType: projectType || 'other',
      budget: budget || 'not-specified',
      urgency: urgency || 'medium',
      status: 'new',
      isRead: false,
    });

    return NextResponse.json({
      message: 'Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.',
      data: newMessage
    }, { status: 201 });
  } catch (error) {
    console.error('Mesaj gönderilirken hata:', error);
    return NextResponse.json(
      { error: 'Mesaj gönderilirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 