import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../../lib/auth';
import connectDB from '../../../../../lib/mongoose';
import User from '../../../../../models/User';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { name, email, role, isActive } = await request.json();
    const { id } = params;

    if (!name || !email) {
      return NextResponse.json(
        { message: 'Ad ve e-posta gereklidir' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if email is already used by another user
    const existingUser = await User.findOne({ email, _id: { $ne: id } });
    if (existingUser) {
      return NextResponse.json(
        { message: 'Bu e-posta adresi başka bir kullanıcı tarafından kullanılıyor' },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndUpdate(
      id,
      {
        name,
        email,
        role: role || 'user',
        isActive: isActive !== undefined ? isActive : true
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return NextResponse.json(
        { message: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('User update error:', error);
    return NextResponse.json(
      { message: 'Kullanıcı güncellenirken hata oluştu' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { id } = params;

    // Prevent admin from deleting themselves
    if (session.user.id === id) {
      return NextResponse.json(
        { message: 'Kendi hesabınızı silemezsiniz' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return NextResponse.json(
        { message: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Kullanıcı başarıyla silindi' });
  } catch (error) {
    console.error('User deletion error:', error);
    return NextResponse.json(
      { message: 'Kullanıcı silinirken hata oluştu' },
      { status: 500 }
    );
  }
}