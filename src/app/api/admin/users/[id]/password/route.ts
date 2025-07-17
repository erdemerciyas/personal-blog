import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../../../lib/auth';
import connectDB from '../../../../../../lib/mongoose';
import User from '../../../../../../models/User';
import bcrypt from 'bcryptjs';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { newPassword } = await request.json();
    const { id } = params;

    if (!newPassword) {
      return NextResponse.json(
        { message: 'Yeni şifre gereklidir' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { message: 'Şifre en az 6 karakter olmalıdır' },
        { status: 400 }
      );
    }

    await connectDB();

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    const user = await User.findByIdAndUpdate(
      id,
      { password: hashedPassword },
      { new: true }
    ).select('-password');

    if (!user) {
      return NextResponse.json(
        { message: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: 'Şifre başarıyla değiştirildi',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json(
      { message: 'Şifre değiştirilirken hata oluştu' },
      { status: 500 }
    );
  }
}