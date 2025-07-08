import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongoose';
import User from '../../../../models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token ve yeni şifre gerekli' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Şifre en az 6 karakter olmalıdır' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Token'ı kontrol et
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Geçersiz veya süresi dolmuş token' },
        { status: 400 }
      );
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 12);

    // Şifreyi güncelle ve reset token'ı temizle
    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      resetToken: undefined,
      resetTokenExpiry: undefined
    });

    return NextResponse.json(
      { message: 'Şifreniz başarıyla güncellendi' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Şifre sıfırlama sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
} 