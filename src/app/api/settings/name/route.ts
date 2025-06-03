import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

interface SessionUser {
  id: string;
  email: string;
  role: string;
}

// PUT /api/settings/name - Admin kullanıcı adı güncelle
export async function PUT(request: Request) {
  try {
    console.log('👤 Kullanıcı adı değiştirme API endpoint çalışıyor...');
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 401 }
      );
    }

    const sessionUser = session.user as SessionUser;
    if (sessionUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Bu işlem için admin yetkisi gerekli' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { newName, currentPassword } = body;

    if (!newName || !currentPassword) {
      return NextResponse.json(
        { error: 'Yeni isim ve mevcut şifre gerekli' },
        { status: 400 }
      );
    }

    // İsim format kontrolü
    if (newName.trim().length < 2) {
      return NextResponse.json(
        { error: 'İsim en az 2 karakter olmalı' },
        { status: 400 }
      );
    }

    await connectDB();

    // Mevcut kullanıcıyı bul
    const userId = sessionUser.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Mevcut şifreyi kontrol et
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Mevcut şifre yanlış' },
        { status: 400 }
      );
    }

    // İsmi güncelle
    user.name = newName.trim();
    await user.save();

    console.log('✅ Kullanıcı adı başarıyla güncellendi:', newName);

    return NextResponse.json({
      message: 'Kullanıcı adı başarıyla güncellendi',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('💥 Kullanıcı adı güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'Kullanıcı adı güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

interface NameSettingsRequest {
  name?: string;
  title?: string;
  description?: string;
  keywords?: string;
  author?: string;
  favicon?: string;
  logo?: string;
  ogImage?: string;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const body: NameSettingsRequest = await request.json();
    const { newName, currentPassword } = body;

    if (!newName || !currentPassword) {
      return NextResponse.json({ 
        error: 'Yeni isim ve mevcut şifre gereklidir' 
      }, { status: 400 });
    }

    // Mevcut kullanıcıyı bul
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ 
        error: 'Kullanıcı bulunamadı' 
      }, { status: 404 });
    }

    // Mevcut şifreyi doğrula
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ 
        error: 'Mevcut şifre hatalı' 
      }, { status: 400 });
    }

    try {
      // İsmi güncelle
      user.name = newName;
      await user.save();

      return NextResponse.json({ 
        success: true,
        message: 'İsim başarıyla güncellendi'
      });
    } catch {
      return NextResponse.json({ 
        error: 'İsim güncellenirken veritabanı hatası' 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Name update error:', error);
    return NextResponse.json({ 
      error: 'İsim güncellenirken hata oluştu' 
    }, { status: 500 });
  }
} 