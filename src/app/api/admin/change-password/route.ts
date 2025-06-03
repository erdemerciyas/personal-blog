import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/mongoose';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Oturum kontrolü
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Mevcut şifre ve yeni şifre gerekli' },
        { status: 400 }
      );
    }

    // Veritabanı bağlantısı
    const { db } = await connectToDatabase();

    // Admin kullanıcısını bul
    const admin = await db.collection('users').findOne({
      email: session.user.email,
    });

    if (!admin) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Yeni şifreyi hashle
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Şifreyi güncelle
    await db.collection('users').updateOne(
      { email: session.user.email },
      { $set: { password: hashedPassword } }
    );

    return NextResponse.json(
      { message: 'Şifre başarıyla güncellendi' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Şifre değiştirme hatası:', error);
    return NextResponse.json(
      { error: 'Şifre değiştirme işlemi başarısız' },
      { status: 500 }
    );
  }
} 