import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    await connectDB();
    
    // Admin kullanıcısı zaten var mı kontrol et
    const existingAdmin = await User.findOne({ email: 'erdem.erciyas@gmail.com' });
    
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
    
    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash('6026341', 12);
    
    // Admin kullanıcısı oluştur
    const adminUser = await User.create({
      email: 'erdem.erciyas@gmail.com',
      password: hashedPassword,
      name: 'Erdem Erciyas',
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