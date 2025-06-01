import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import User from '@/models/User';

// PUT /api/settings/email - Admin email güncelle
export async function PUT(request: Request) {
  try {
    console.log('📧 Email değiştirme API endpoint çalışıyor...');
    
    const session = await getServerSession(authOptions);
    console.log('🔐 Session:', {
      user: session?.user ? {
        id: session.user.id,
        email: session.user.email,
        role: (session.user as any).role
      } : null
    });
    
    if (!session?.user) {
      console.log('❌ Session bulunamadı');
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 401 }
      );
    }

    if ((session.user as any).role !== 'admin') {
      console.log('❌ Admin yetkisi yok');
      return NextResponse.json(
        { error: 'Bu işlem için admin yetkisi gerekli' },
        { status: 403 }
      );
    }

    const body = await request.json();
    console.log('📝 Request body:', body);
    
    const { newEmail, currentPassword } = body;

    if (!newEmail || !currentPassword) {
      console.log('❌ Eksik veriler');
      return NextResponse.json(
        { error: 'Yeni email ve mevcut şifre gerekli' },
        { status: 400 }
      );
    }

    // Email format kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      console.log('❌ Geçersiz email formatı');
      return NextResponse.json(
        { error: 'Geçerli bir email adresi girin' },
        { status: 400 }
      );
    }

    console.log('🔗 MongoDB bağlantısı kuruluyor...');
    await connectDB();

    // Mevcut kullanıcıyı bul
    const userId = (session.user as any).id;
    console.log('👤 Kullanıcı ID:', userId);
    console.log('👤 Kullanıcı ID tipi:', typeof userId);
    console.log('👤 Kullanıcı ID uzunluğu:', userId?.length);
    
    // MongoDB ObjectId doğrulaması
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log('❌ Geçersiz ObjectId formatı:', userId);
      return NextResponse.json(
        { error: 'Geçersiz kullanıcı ID formatı' },
        { status: 400 }
      );
    }
    
    console.log('✅ ObjectId formatı geçerli');
    
    const user = await User.findById(userId);
    console.log('🔍 User.findById sonucu:', user ? 'Kullanıcı bulundu' : 'Kullanıcı bulunamadı');
    
    if (!user) {
      console.log('❌ Kullanıcı bulunamadı:', userId);
      
      // Debug: Veritabanındaki tüm kullanıcıları listele
      const allUsers = await User.find({}, { _id: 1, email: 1, name: 1 });
      console.log('📋 Veritabanındaki kullanıcılar:', allUsers);
      
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    console.log('✅ Kullanıcı bulundu:', user.email);

    // Mevcut şifreyi kontrol et
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      console.log('❌ Şifre yanlış');
      return NextResponse.json(
        { error: 'Mevcut şifre yanlış' },
        { status: 400 }
      );
    }

    console.log('✅ Şifre doğru');

    // Yeni email adresinin kullanımda olup olmadığını kontrol et
    const existingUser = await User.findOne({ 
      email: newEmail.toLowerCase(),
      _id: { $ne: user._id }
    });
    
    if (existingUser) {
      console.log('❌ Email zaten kullanımda');
      return NextResponse.json(
        { error: 'Bu email adresi zaten kullanımda' },
        { status: 400 }
      );
    }

    console.log('📧 Email güncelleniyor...', newEmail);

    // Email adresini güncelle
    user.email = newEmail.toLowerCase();
    await user.save();

    console.log('✅ Email başarıyla güncellendi');

    return NextResponse.json({
      message: 'Email adresi başarıyla güncellendi',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('💥 Email güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'Email güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 