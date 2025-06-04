import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import connectDB from '../../../../lib/mongoose';
import User from '../../../../models/User';
import bcrypt from 'bcryptjs';

interface EmailSettingsRequest {
  email?: string;
  emailPassword?: string;
  smtpHost?: string;
  smtpPort?: number;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    await connectDB();
    
    const body: EmailSettingsRequest = await request.json();
    const { email: newEmail, emailPassword } = body;

    if (!newEmail || !emailPassword) {
      return NextResponse.json({ 
        error: 'E-posta ve şifre gereklidir' 
      }, { status: 400 });
    }

    // Mevcut kullanıcıyı bul
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ 
        error: 'Kullanıcı bulunamadı' 
      }, { status: 404 });
    }

    try {
      // Yeni e-posta adresini güncelle
      user.email = newEmail;
      await user.save();

      return NextResponse.json({ 
        success: true,
        message: 'E-posta ayarları başarıyla güncellendi'
      });
    } catch {
      return NextResponse.json({ 
        error: 'E-posta ayarları güncellenirken veritabanı hatası' 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Email settings error:', error);
    return NextResponse.json({ 
      error: 'E-posta ayarları güncellenirken hata oluştu' 
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    await connectDB();
    
    const body = await request.json();
    const { newEmail, currentPassword } = body;

    if (!newEmail || !currentPassword) {
      return NextResponse.json({ 
        error: 'Yeni e-posta ve mevcut şifre gereklidir' 
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

    // Yeni e-posta adresinin zaten kullanımda olup olmadığını kontrol et
    const existingUser = await User.findOne({ 
      email: newEmail, 
      _id: { $ne: user._id } 
    });
    
    if (existingUser) {
      return NextResponse.json({ 
        error: 'Bu e-posta adresi zaten kullanılıyor' 
      }, { status: 400 });
    }

    try {
      // E-posta adresini güncelle
      user.email = newEmail;
      await user.save();

      return NextResponse.json({ 
        success: true,
        message: 'E-posta adresi başarıyla güncellendi'
      });
    } catch {
      return NextResponse.json({ 
        error: 'E-posta adresi güncellenirken veritabanı hatası' 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Email update error:', error);
    return NextResponse.json({ 
      error: 'E-posta güncellenirken hata oluştu' 
    }, { status: 500 });
  }
} 