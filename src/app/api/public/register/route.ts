import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Tüm alanlar zorunludur.' }, { status: 400 });
    }

    await connectDB();

    // Check existing
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ error: 'Bu e-posta adresi zaten kayıtlı.' }, { status: 409 });
    }

    // Create User (Model handles hashing)
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: password, // Model pre-save hook will hash this
      role: 'user',
    });

    return NextResponse.json({
      message: 'Kayıt başarılı.',
      user: { id: user._id, email: user.email, name: user.name }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Registration Error Details:', error);
    return NextResponse.json({
      error: error.message || 'Bir hata oluştu.',
      details: error.toString()
    }, { status: 500 });
  }
}