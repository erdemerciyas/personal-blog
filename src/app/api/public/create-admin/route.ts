import connectDB from '@/lib/mongoose';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD;
  const adminName = process.env.ADMIN_NAME;

  if (!adminEmail || !adminPassword || !adminName) {
    return NextResponse.json(
      { error: 'ADMIN_EMAIL, ADMIN_DEFAULT_PASSWORD and ADMIN_NAME env variables are required' },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      return NextResponse.json({
        message: 'Admin kullanıcısı zaten mevcut',
        admin: {
          email: existingAdmin.email,
          name: existingAdmin.name,
          role: existingAdmin.role,
        },
      });
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    const adminUser = await User.create({
      email: adminEmail,
      password: hashedPassword,
      name: adminName,
      role: 'admin',
    });

    return NextResponse.json({
      message: 'Admin kullanıcısı başarıyla oluşturuldu',
      admin: {
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Admin oluşturma hatası:', error);
    return NextResponse.json(
      { error: 'Admin kullanıcısı oluşturulurken hata oluştu' },
      { status: 500 }
    );
  }
} 