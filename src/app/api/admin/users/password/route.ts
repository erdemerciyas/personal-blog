import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth';
import connectDB from '../../../../../lib/mongoose';
import User from '../../../../../models/User';
import bcrypt from 'bcryptjs';
import { withSecurity, SecurityConfigs } from '../../../../../lib/security-middleware';

interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

// PUT /api/admin/users/password - Kullanıcı şifresi değiştir
export const PUT = withSecurity(SecurityConfigs.authenticated)(async (request: Request) => {
  try {
    const session = await getServerSession(authOptions);
    const { userId, currentPassword, newPassword, isAdmin } = await request.json();
    const sessionUser = session?.user as SessionUser;

    // Admin kullanıcısı başka kullanıcının şifresini değiştirebilir
    // Normal kullanıcı sadece kendi şifresini değiştirebilir
    if (!isAdmin && sessionUser.id !== userId) {
      return NextResponse.json(
        { error: 'Sadece kendi şifrenizi değiştirebilirsiniz' },
        { status: 403 }
      );
    }

    if (sessionUser.role !== 'admin' && !currentPassword) {
      return NextResponse.json(
        { error: 'Mevcut şifre gerekli' },
        { status: 400 }
      );
    }

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Yeni şifre en az 6 karakter olmalı' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Admin değilse mevcut şifreyi kontrol et
    if (sessionUser.role !== 'admin' || (sessionUser.role === 'admin' && currentPassword)) {
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { error: 'Mevcut şifre yanlış' },
          { status: 400 }
        );
      }
    }

    // Yeni şifreyi hashle ve kaydet
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    await User.findByIdAndUpdate(userId, { password: hashedPassword });

    return NextResponse.json({
      message: 'Şifre başarıyla değiştirildi'
    });
  } catch (error) {
    console.error('Şifre değiştirme hatası:', error);
    return NextResponse.json(
      { error: 'Şifre değiştirilirken hata oluştu' },
      { status: 500 }
    );
  }
}); 