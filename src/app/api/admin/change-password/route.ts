import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '../../../../lib/mongoose';
import { authOptions } from '../../../../lib/auth';
import bcrypt from 'bcryptjs';
import { withSecurity, SecurityConfigs } from '../../../../lib/security-middleware';

export const POST = withSecurity(SecurityConfigs.admin)(async (request: Request) => {
  try {
    const session = await getServerSession(authOptions);
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Mevcut şifre ve yeni şifre gerekli' },
        { status: 400 }
      );
    }

    // Session email (admin) must exist due to middleware; validate defensively
    const email = session?.user?.email as string | undefined;
    if (!email) {
      return NextResponse.json(
        { error: 'Oturum bilgisi eksik' },
        { status: 500 }
      );
    }

    // Veritabanı bağlantısı
    const { db } = await connectToDatabase();

    // Admin kullanıcısını bul
    const admin = await db.collection('users').findOne({ email });

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
      { email },
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
});