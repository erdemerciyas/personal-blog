import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

// GET /api/admin/users - Tüm kullanıcıları listele
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 401 }
      );
    }

    if ((session.user as any).role !== 'admin') {
      return NextResponse.json(
        { error: 'Bu işlem için admin yetkisi gerekli' },
        { status: 403 }
      );
    }

    await connectDB();

    const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Kullanıcı listesi hatası:', error);
    return NextResponse.json(
      { error: 'Kullanıcılar yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}

// POST /api/admin/users - Yeni kullanıcı oluştur
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 401 }
      );
    }

    if ((session.user as any).role !== 'admin') {
      return NextResponse.json(
        { error: 'Bu işlem için admin yetkisi gerekli' },
        { status: 403 }
      );
    }

    const { name, email, password, role } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'İsim, email ve şifre gerekli' },
        { status: 400 }
      );
    }

    await connectDB();

    // Email kontrolü
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu email adresi zaten kullanımda' },
        { status: 400 }
      );
    }

    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase(),
      password,
      role: role || 'user'
    });

    await newUser.save();

    // Şifreyi response'dan çıkar
    const userResponse = newUser.toObject();
    delete userResponse.password;

    return NextResponse.json({
      message: 'Kullanıcı başarıyla oluşturuldu',
      user: userResponse
    }, { status: 201 });
  } catch (error) {
    console.error('Kullanıcı oluşturma hatası:', error);
    return NextResponse.json(
      { error: 'Kullanıcı oluşturulurken hata oluştu' },
      { status: 500 }
    );
  }
} 