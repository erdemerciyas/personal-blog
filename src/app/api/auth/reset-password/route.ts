import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongoose';
import User from '../../../../models/User';
import bcrypt from 'bcryptjs';
import { rateLimit, getClientIP } from '../../../../lib/rate-limit';
import { Validator, Sanitizer } from '../../../../lib/validation';
import { logger } from '../../../../lib/logger';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const clientIP = getClientIP(request);
  
  try {
    // Rate limiting for password reset
    const rateLimitResult = rateLimit(clientIP, 'PASSWORD_RESET');
    if (!rateLimitResult.allowed) {
      logger.warn('Password reset rate limit exceeded', 'SECURITY', {
        ip: clientIP,
        remaining: rateLimitResult.remaining
      });
      
      return NextResponse.json(
        { error: 'Çok fazla şifre sıfırlama denemesi. Lütfen 1 saat sonra tekrar deneyin.' },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
          }
        }
      );
    }

    const body = await request.json();
    const token = Sanitizer.sanitizeText(body.token || '');
    const password = body.password || '';

    // Input validation
    if (!token || !password) {
      logger.warn('Password reset missing required fields', 'VALIDATION', { ip: clientIP });
      return NextResponse.json(
        { error: 'Token ve yeni şifre gerekli' },
        { status: 400 }
      );
    }

    // Strong password validation
    if (!Validator.isStrongPassword(password)) {
      logger.warn('Password reset weak password attempt', 'VALIDATION', { ip: clientIP });
      return NextResponse.json(
        { error: 'Şifre en az 8 karakter olmalı ve büyük harf, küçük harf, rakam ve özel karakter içermelidir' },
        { status: 400 }
      );
    }

    // Token format validation
    if (token.length !== 64) { // Assuming 32-byte hex token
      logger.warn('Password reset invalid token format', 'VALIDATION', { ip: clientIP });
      return NextResponse.json(
        { error: 'Geçersiz token formatı' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Token'ı kontrol et - constant time comparison için
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() }
    });

    if (!user) {
      logger.warn('Password reset invalid or expired token', 'SECURITY', {
        ip: clientIP,
        tokenLength: token.length
      });
      
      // Timing attack'ları önlemek için sabit süre bekle
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return NextResponse.json(
        { error: 'Geçersiz veya süresi dolmuş token' },
        { status: 400 }
      );
    }

    // Check if password is same as current (prevent reuse)
    const isSamePassword = await bcrypt.compare(password, user.password);
    if (isSamePassword) {
      logger.warn('Password reset attempt with same password', 'SECURITY', {
        ip: clientIP,
        userId: user._id.toString()
      });
      
      return NextResponse.json(
        { error: 'Yeni şifre mevcut şifrenizle aynı olamaz' },
        { status: 400 }
      );
    }

    // Şifreyi güçlü hash ile hashle (cost factor 12)
    const hashedPassword = await bcrypt.hash(password, 12);

    // Şifreyi güncelle ve reset token'ı temizle
    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      resetToken: undefined,
      resetTokenExpiry: undefined
    });

    // Log successful password reset
    logger.info('Password reset successful', 'AUTH', {
      ip: clientIP,
      userId: user._id.toString(),
      email: user.email,
      responseTime: Date.now() - startTime
    });

    return NextResponse.json(
      { message: 'Şifreniz başarıyla güncellendi' },
      { status: 200 }
    );

  } catch (error) {
    logger.error('Password reset error', 'ERROR', {
      ip: clientIP,
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - startTime
    });
    
    return NextResponse.json(
      { error: 'Şifre sıfırlama sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
} 