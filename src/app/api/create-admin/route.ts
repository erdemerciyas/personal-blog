import connectDB from '../../../lib/mongoose';
import User from '../../../models/User';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    await connectDB();
    
    // Admin kullanıcısı zaten var mı kontrol et
    const adminEmail = process.env.ADMIN_EMAIL || 'erdem.erciyas@gmail.com';
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      return NextResponse.json({
        message: 'Admin kullanıcısı zaten mevcut',
        admin: {
          email: existingAdmin.email,
          name: existingAdmin.name,
          role: existingAdmin.role
        }
      });
    }
    
    // Şifreyi hashle - Environment variable'dan güvenli şifre al
    const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'SecureAdmin2024!@#';
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    
    // Admin kullanıcısı oluştur
    const adminUser = await User.create({
      email: adminEmail,
      password: hashedPassword,
      name: process.env.ADMIN_NAME || 'Erdem Erciyas',
      role: 'admin'
    });
    
    return NextResponse.json({
      message: 'Admin kullanıcısı başarıyla oluşturuldu',
      admin: {
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('Admin oluşturma hatası:', error);
    return NextResponse.json(
      { error: 'Admin kullanıcısı oluşturulurken hata oluştu' },
      { status: 500 }
    );
  }
} 