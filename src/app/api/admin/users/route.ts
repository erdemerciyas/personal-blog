import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongoose';
import User from '../../../../models/User';
import bcrypt from 'bcryptjs';
import { withSecurity, SecurityConfigs } from '../../../../lib/security-middleware';

export const GET = withSecurity(SecurityConfigs.admin)(async () => {
  try {
    await connectDB();
    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 });
    return NextResponse.json(users);
  } catch (error) {
    console.error('Users fetch error:', error);
    return NextResponse.json(
      { message: 'Kullanıcılar yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
});

export const POST = withSecurity(SecurityConfigs.admin)(async (request: NextRequest) => {
  try {
    const { name, email, password, role, isActive } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Ad, e-posta ve şifre gereklidir' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'Bu e-posta adresi zaten kullanılıyor' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'user',
      isActive: isActive !== undefined ? isActive : true
    });

    await user.save();

    // Return user without password
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt
    };

    return NextResponse.json(userResponse, { status: 201 });
  } catch (error) {
    console.error('User creation error:', error);
    return NextResponse.json(
      { message: 'Kullanıcı oluşturulurken hata oluştu' },
      { status: 500 }
    );
  }
});