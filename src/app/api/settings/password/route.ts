import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import connectDB from '../../../../lib/mongoose';
import User from '../../../../models/User';
import bcrypt from 'bcryptjs';
import { SecurityUtils } from '../../../../lib/security-utils';
import { SecurityEvents } from '../../../../lib/security-audit';

// PUT /api/settings/password - Kullanıcı şifresini değiştir
export async function PUT(request: Request) {
  try {
    // Get client IP and user agent for security logging
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Bu işlem için giriş yapmanız gerekli' },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword, confirmPassword } = await request.json();

    // Validasyon
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: 'Tüm alanları doldurunuz' },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: 'Yeni şifreler eşleşmiyor' },
        { status: 400 }
      );
    }

    // Güvenlik kontrolleri
    SecurityUtils.sanitizeString(currentPassword); // Used for security validation
    SecurityUtils.sanitizeString(newPassword); // Used for security validation
    
    // SQL injection kontrolü
    if (SecurityUtils.containsSQLInjection(currentPassword) || SecurityUtils.containsSQLInjection(newPassword)) {
      SecurityUtils.logSecurityEvent('Password Change SQL Injection Attempt', {
        email: session.user.email,
        ip: 'unknown' // Request IP should be passed from middleware
      }, 'high');
      return NextResponse.json(
        { error: 'Güvenlik riski tespit edildi' },
        { status: 400 }
      );
    }

    // Güçlü şifre politikası kontrolü
    const passwordValidation = SecurityUtils.isStrongPassword(newPassword);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.errors[0] }, // İlk hatayı göster
        { status: 400 }
      );
    }

    await connectDB();

    // Kullanıcıyı bul
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Mevcut şifreyi kontrol et
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: 'Mevcut şifre yanlış' },
        { status: 400 }
      );
    }

    // Şifre tekrarı kontrolü (mevcut şifre ile aynı olmamalı)
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return NextResponse.json(
        { error: 'Yeni şifre mevcut şifre ile aynı olamaz' },
        { status: 400 }
      );
    }

    // Yeni şifreyi hashle
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Şifreyi güncelle
    await User.findByIdAndUpdate(user._id, {
      password: hashedNewPassword,
      updatedAt: new Date(),
    });

    // Log successful password change
    SecurityEvents.passwordChange(clientIP, session.user.email, userAgent);

    return NextResponse.json({
      message: 'Şifre başarıyla güncellendi'
    });
  } catch (error) {
    console.error('Şifre güncellenirken hata:', error);
    return NextResponse.json(
      { error: 'Şifre güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 