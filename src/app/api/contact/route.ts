import connectDB from '../../../lib/mongoose';
import Message from '../../../models/Message';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json();

    // Database'e bağlan
    await connectDB();

    // Mesajı database'e kaydet
    const newMessage = new Message({
      name,
      email,
      subject,
      message,
      createdAt: new Date()
    });

    await newMessage.save();

    return NextResponse.json(
      { message: 'Mesajınız başarıyla kaydedildi. En kısa sürede geri dönüş yapacağız.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Mesaj kaydetme sırasında hata:', error);
    return NextResponse.json(
      { message: 'Mesaj gönderimi başarısız oldu' },
      { status: 500 }
    );
  }
} 